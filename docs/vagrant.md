# More Info on Windows Setup

Holochain development uses the same tools across Mac, Windows and Linux. However, NixOS tools (see below) only work natively on Mac and Linux.

We expect this to change in the future. NixOS for Windows is under [active development](https://github.com/NixOS/nixpkgs/issues/30391)!

In the meantime you will need to work with a virtual machine. The process is similar to working with a local web server. There are holochain optimised options for both Docker and Vagrant. It is relatively simple to create custom setups with the official NixOS boxes.

This guide explains using NixOS with **Vagrant/VirtualBox**.

>Feel free to use Docker or another Vagrant provider if it suits you. This guide is designed to be as inclusive as possible. Docker on Windows requires Windows Pro (which costs money). VirtualBox is generally more accessible than alternative providers.

## About Vagrant

Vagrant is a tool for configuring virtual machines or “boxes”. The configuration is stored in a Vagrantfile in each project. This way everyone working on a project gets (roughly) the same box.

The Vagrantfile used by [core](https://github.com/holochain/holochain-rust/blob/develop/Vagrantfile) is a good starting point. This guide uses a “light” version of the core Vagrantfile to cut download times.

### The basic workflow is like this:

1. Create a new folder for the app
2. Copy a Vagrantfile into place
3. Boot the virtual machine from the Vagrantfile
4. SSH into the booted machine
5. Run Holochain/NixOS commands inside the machine

### Shared folders

By default Vagrant syncs a “shared folder” automatically. The shared folder always looks the same inside and outside the box. The default is to share the project folder into <code>/vagrant</code> inside the box.

### A typical workflow with shared folders:

* Write code outside the box
* Do version control and git outside the box
* Run tests inside the box
* Use holochain tools like hc inside the box

### Managing boxes

There are some key commands common to all Vagrant projects. These commands must be run from inside the project folder.

Boots the vagrant box for the project:

```
vagrant up
```

Shut down the vagrant box for the project:

```
vagrant halt
```

Undeleted boxes use disk space and maybe other resources.
Delete the vagrant box for the project:

```
vagrant destroy
```

Log into the vagrant box for the project in the current terminal:

```
vagrant ssh
```

### NixOS box

The Vagrantfile used in this guide uses NixOS. This means we don’t have to install any additional nix tooling. It also means that box configuration must be done with nix. This is why the vagrant nixos plugin must be installed.

You can easily install <code>vagrant-nixos-plugin</code> with this command:

```
vagrant plugin install vagrant-nixos-plugin
```