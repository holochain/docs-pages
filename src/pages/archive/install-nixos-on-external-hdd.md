---
title: Install NixOS on External HDD
---

::: h-author
<a href="https://github.com/newprometheus">

Contributed by newprometheus
![](https://avatars3.githubusercontent.com/u/54076776?s=100)

</a>
:::

First, use the 64-bit minimal installation CD. This is available on the [NixOS downloads page](https://nixos.org/nixos/download.html). Copy it to an external HDD, which I connected to my laptop over a Sabrent cable. I also used Rufus.exe to make a bootable HDD. **Note: This will erase anything that was on the external HDD.**

<br>

![](/assets/img/nixos-rufus.png)
<br>

Make sure that the size of the bootable partition is around 3 GB and that the rest of the HDD is free. (Sorry the picture of Rufus is in German!)

After installation, open the partition manager in Windows and check that the bootable NixOS partition is around 3 GB and the rest of the partition is free. 

## System configuration

Restart the computer and set up a BIOS boot process that boots first from an external USB drive, then from an internal HDD. Later, you will need to connect the external HDD and restart to start NixOS. If it’s not connected, the computer will start normally in Windows from your internal HDD, which for me, works fine. :)

There are some additional things in the UEFI system setup that will need to be configured for NixOS to install without issues.

Once in the boot menu:

- ensure safe boot is disabled
- ensure UEFI mode is enabled

For the next section of this guide, I am following a very helpful manual I found online.

## Installation

Now that your UEFI setup is configured, it’s time to boot the installation media. 

Note: From here on in, we’ll be in root prompts. The NixOS install environment helpfully drops you into a shell with root logged in.

### Networking

Having internet access during an OS install can be handy to pull in configs. In the case of NixOS, if you want to boot into anything more than a very bare-bones system, you’re going to want internet access to add system packages.

If you can’t just plug an Ethernet cable into your computer, you may want to use WiFi. To make that happen, enter the following commands:

```bash
-- Generates the actual key used to authenticate on your WPA secured network
# wpa_passphrase $SSID $PASSPHRASE > /etc/wpa_supplicant.conf
 
-- Restarts WPA Supplicant, which gives us WiFi for now
# systemctl restart wpa_supplicant.service
```

It is much easier if you can connect your computer with a LAN cable while installing NixOS, but you may have problems configuring WLAN access for the installation process.

### Partitioning

**This process will wipe anything on the disk**—consider yourself warned!

As I understand it, a UEFI boot device requires a GUID partition table (GPT). Therefore, we’ll be using `gdisk` instead of the venerable `fdisk`. If you’re installing on a system that doesn’t use UEFI, you can do a similar job with `fdisk`.

To start, we’ll delete any existing partitions and start with a clean slate:

```bash
-- Identify the disk to install NixOS on - something like /dev/nvme0n1 or /dev/sda.
-- We'll refer to it as $DISK.
# lsblk
 
-- Open gdisk on the disk we're installing on
# gdisk $DISK 
 
-----------------------
-- BEGIN GDISK COMMANDS
 
-- print the partitions on the disk
Command: p
 
-- Delete a partition. Select the partition number when prompted.
-- Repeat for all partitions.
Command: d
 
-- END GDISK COMMANDS
---------------------
```

**Obviously, you need to be very careful to choose the right disk and partition!!!**

In my case, I couldn't delete ALL the partitions because Partition 1 had my bootable NixOS installation file. You’ll want to keep that!

We can now create the partitions we need, an EFI boot partition and an LVM partition. LVM (logical volume management) allows us to change our partitions more easily if we need to (e.g., size and layout). For this example, the LVM partition will contain our root and swap partitions.

This code block assumes we’re still at a gdisk prompt.

```bash
-- Create the EFI boot partition
Command: n
Partition number: 1
First sector: <enter for default>
Last sector: +1G       --  make a 1 gigabyte partition
Hex code or GUID: ef00 -- this is the EFI system type
 
-- Create the LVM partition
Command: n
Partition number: 2
First sector: <enter for default>
Last sector: <enter for default - rest of disk>
Hex code or GUID: 8e00 -- Linux LVM type
 
-- Write changes and quit
Command: w
```

**Note: Because I kept Partition 1, the partition numbers for the rest of the manual will be different. Please add 1 to the partition numbers (e.g., Partition 2 in the manual is my Partition 3).**

### Encryption and LVM

Our partition table and primary partitions are in place. Now, we can encrypt the partition that will contain our LVM partitions. This is the second partition we created above, so it should be something like `/dev/nvme0n1p2` or `/dev/sda2`. We’ll refer to it as `$LVM_PARTITION` below. 

Note: Our boot partition won’t be encrypted. I can’t think of a reason why you would want this; if you did, you probably wouldn’t need partitioning advice from me. Also, note that our swap partition is encrypted. You don’t have control over what’s moved into your swap space, so it could end up containing all sorts of private stuff you wouldn’t want to be publicly available (for example, passwords copied from a password manager).

In our example below, we’re creating a swap space the same size as our RAM (16 GB) and filling the rest of the disk with our root file system. You might want to tweak these sizes for your machine.

```bash
-- You will be asked to enter your passphrase - DO NOT FORGET THIS
# cryptsetup luksFormat $LVM_PARTITION
 
-- Decrypt the encrypted partition and call it nixos-enc. The decrypted partition
-- will get mounted at /dev/mapper/nixos-enc
# cryptsetup luksOpen $LVM_PARTITION nixos-enc
    
-- Create the LVM physical volume using nixos-enc
# pvcreate /dev/mapper/nixos-enc 
 
-- Create a volume group that will contain our root and swap partitions
# vgcreate nixos-vg /dev/mapper/nixos-enc
 
-- Create a swap partition that is 16 G in size - the amount of RAM on this machine
-- Volume is labeled "swap"'
# lvcreate -L 16G -n swap nixos-vg
 
-- Create a logical volume for our root filesystem from all remaining free space.
-- Volume is labeled "root"
# lvcreate -l 100%FREE -n root nixos-vg
```

**Note: My machine’s RAM was 12 GB instead of the 16 GB in the manual, so I set up for 12 GB.**

### Create our filesystems

In the snippet below, `$BOOT_PARTITION` refers to the boot partition created above—something like `/dev/sda1`.

```bash
-- Create a FAT32 filesystem on our boot partition
# mkfs.vfat -n boot $BOOT_PARTITION
 
-- Create an ext4 filesystem for our root partition
# mkfs.ext4 -L nixos /dev/nixos-vg/root
 
-- Tell our swap partition to be a swap
# mkswap -L swap /dev/nixos-vg/swap
 
-- Turn the swap on before install
# swapon /dev/nixos-vg/swap
```

### Mount filesystems and prep for install

We’re almost there. It’s now time to mount the partitions we’ve created, put our system configuration in place, and, finally, pull the trigger.

The snippet below uses `$BOOT_PARTITION` as a placeholder for the UEFI boot partition we created earlier. This was the first partition on the disk and will probably be something like `/dev/sda1` or `/dev/nvme0n1p1`.

```bash
# mount /dev/nixos-vg/root /mnt
# mkdir /mnt/boot
# mount $BOOT_PARTITION /mnt/boot
```

Now that we have filesystems we can write to, let’s generate our initial config.

```bash
# nixos-generate-config --root /mnt
```

### Configuration

NixOS is primarily configured by `/etc/nixos/configuration.nix`. Given that our root filesystem is mounted at `/mnt`, that will be `/mnt/etc/nixos/configuration.nix` for now. Let’s open it up and tweak some important options.

If anything is broken in your config, installation will fail and you’ll see an error message to help diagnose your problem. Furthermore, because NixOS is the way it is, you can radically reconfigure your system later, knowing that you can fall back to a known working configuration. When you’re confident everything works, clean up packages you no longer need. In short, don’t stress too much about installing and configuring everything down to the smallest detail. It’s fine to start with a small, but working, system and build it up as you learn what you want.

```bash
-- Vim 4 life! Or, you know, use `nano` or whatever else you might prefer.
vim /mnt/etc/nixos/configuration.nix
```

It’s critical that we tell NixOS we have a LUKS encrypted partition that needs to be decrypted before we can access any LVM partitions. To do that:

```bash
boot.initrd.luks.devices = [
  { 
    name = "root";
    device = "/dev/nvme0n1p2";
    preLVM = true;
  }
];
```

NixOS also needs to know that we’re using EFI; however, in my case, this was correctly configured automatically.

```bash
boot.loader.systemd-boot.enable = true;
```

I also used Network Manager and its associated applet to manage my networking. If you’d like to do the same, add the following, as well as the applet package mentioned below:

```bash
networking.networkmanager.enable = true;
```

In addition to these core configuration items, you might want to install some packages to get you started. Your NixOS install will be very bare without them. Packages can be specified as additional configuration items, and there should be a commented-out section of configuration that you can uncomment and edit. For example, a fairly modest set of packages would look something like this:

```bash
environment.systemPackages = (with pkgs; [
  firefox
  git
  htop
  networkmanagerapplet
  nix-prefetch-scripts
  nix-repl
  vagrant
  vim
  wget
  which
  xscreensaver
]);
```

Note: `networkmanagerapplet` is included to give us a tray icon from which to configure networking.

As the comment in the configuration file tells you, you can search for packages to install with `nix-env -qaP | grep $PACKAGE`.

The last thing I’ll call out is ‘specifying your user.’ It’s not a good idea to use `root` all the time, so to create your user and add/uncomment something like the following:

```bash
users.extraUsers.holochain = {
  createHome = true;
  extraGroups = ["wheel" "video" "audio" "disk" "networkmanager"];
  group = "users";
  home = "/home/holochain";
  isNormalUser = true;
  uid = 1000;
};
```

In this example, we’ll create a user called ‘holochain’. We’ll give them a home directory and add them to a few groups. Most importantly, you will probably want your user to be a member of `wheel` so they can run privileged commands with `sudo`.

By default, [Plasma](https://www.kde.org/plasma-desktop) will be your desktop environment. If you want something else, you’ll have to do some research on what’s available and how to configure it.

There’s a bunch of other stuff commented out in the generated `configuration.nix`; I encourage you to read through it and uncomment and/or set anything that takes your fancy. As an example, setting your time zone is probably a good idea. 

Configuration files may vary between NixOS versions, so be sure to check that there are no version-specific subtleties before borrowing heavily from another configuration.nix file.

### Pull the trigger!

Once you’re happy with your configuration, we can pull the trigger on an install.

```bash
# nixos-install
-- IT'LL ASK YOU FOR YOUR ROOT PASSWORD NOW - DON'T FORGET IT
# reboot
```

Go get a coffee while everything installs, and hopefully you’ll reboot to your new system.

If something has gone wrong, don’t worry. You can always boot back into the installation media, mount your partitions, update the configuration, and install again. To mount existing partitions, you’ll need to decrypt the LVM partition and activate its volume group.

```bash
# cryptsetup luksOpen $LVM_PARTITION nixos-enc
# lvscan
# vgchange -ay
# mount /dev/nixos-vg/root /mnt
# ...
```

Assuming your system has booted to a login screen, you’re going to want to set your user’s password so you don’t log in to your graphical environment as `root`. To do this, press `Ctrl-Alt-F1` to open a terminal, log in as `root`, and run `passwd $USER` replacing `$USER` with the name of the user you configured. Once set, run `reboot` to reboot your machine and log in as the user you set up.

**This worked great for me! After I installed NixOS and its packages using a LAN-cable, I started NixOS' graphical environment with ‘systemctl start display-manager’ and configured:**

- **WLAN-access**
- **German keyboard**
- **Time zone**