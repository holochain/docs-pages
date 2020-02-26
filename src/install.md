# Install Holochain

<div class="h-tile-container tile-tabs">
	<div class="h-tile">
		<a href="javascript:rudrSwitchTab('tab_1', 'content_1');" id="tab_1" class="tabmenu active" onclick="window.open(this.href,'_self'); return false;">
			<h3><img src="/docs/custom/icon-apple.svg"> Mac + <img src="/docs/custom/icon-linux.svg" class="linux"> Linux</h3>
		</a>
	</div>
	<div class="h-tile">
		<a href="javascript:rudrSwitchTab('tab_2', 'content_2');" id="tab_2" class="tabmenu" onclick="window.open(this.href,'_self'); return false;">
			<h3><img src="/docs/custom/icon-windows.svg"> Windows <span>or Vagrant/Docker</span></h3>
		</a>
	</div>
</div>

<div class="tabcontent" id="content_1">

### System Requirements

#### Hardware:

* 4GB+ RAM (16GB+ recommended)
* 4+ CPU (6+ CPU recommended)
* 30GB+ available disk space
* Internet connection

#### Pre-Installed Software:

* [xCode developer tools](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (Mac only)

### Mac / Linux Environment Setup

We use Nix toolkit to manage the installation of our dev tools. Install the Nix package manager with this command:

#### Catalina

If you are using MacOS Catalina you will need to do look into a work around. There is an active issue [here](https://github.com/NixOS/nix/issues/2925) that may help.

\#S:INCLUDE,MODE=linux
```bash
curl https://nixos.org/nix/install | sh
```

You might need to run this command to get the environment setup:

```bash
. ~/.nix-profile/etc/profile.d/nix.sh
```

Check that it installed correctly:

```bash
nix-shell --version
```

You should see something like:

```bash
nix-shell (Nix) 2.3.1
```

If you’d like to know more about NixOS and why we use it, you can [find information on Nix here](../nix/).

</div>

<div class="tabcontent" id="content_2" style="display:none;">

### System Requirements

#### Hardware:

* 4GB+ RAM (16GB+ recommended)
* 4+ CPU (6+ CPU recommended)
* 30GB+ available disk space
* Internet connection

#### Operating System & Software:

* Windows 8+
* Powershell 2.0+
* [Vagrant](https://releases.hashicorp.com/vagrant/2.2.4/vagrant_2.2.4_x86_64.msi)
* [VirtualBox](https://download.virtualbox.org/virtualbox/6.0.8/VirtualBox-6.0.8-130520-Win.exe)
* [Vagrant nixos plugin](https://github.com/nix-community/vagrant-nixos-plugin)

### Windows Environment Setup

Holochain development uses the same tools across Mac, Windows, and Linux. However the Nix toolkit, which we use to install and manage those tools, only works natively on Mac and Linux.

We expect this to change in the future. [NixOS for Windows is in active development!](https://github.com/NixOS/nixpkgs/issues/30391)

In the meantime, you will need to work with a virtual machine.

The process is similar to working with a local web server.
There are Holochain optimized options for both [Docker](https://github.com/NixOS/nixpkgs/issues/30391) and [Vagrant](https://github.com/NixOS/nixpkgs/issues/30391).<br>
It is relatively simple to create custom setups with the official NixOS boxes.</p>

#### This guide explains using NixOS with Vagrant/VirtualBox.

!!! note
    All these commands assume Windows powershell 2.0+.
    The basic process is the same for all systems.

Create a new folder:

```powershell
mkdir holochain-vagrant
```

Move into the new folder:

```powershell
cd holochain-vagrant
```

Copy the basic, Holochain-optimised Vagrant file:

```powershell
wget https://gist.githubusercontent.com/thedavidmeister/8e92696538fe04cf6b44552e14d29195/raw/4dcb83b983e8dcd2f5db213b0cde5a533af556a6/Vagrantfile -outfile Vagrantfile
```

Add the vagrant nixos plugin if you don't already have it:

```powershell
vagrant plugin install vagrant-nixos-plugin
```

Download and boot the box:

```powershell
vagrant up
```

SSH into the box:

```powershell
vagrant ssh
```

Move into the shared folder

```powershell
cd /vagrant
```

Check that it installed correctly:

```powershell
nix-shell --version
```

!!! success "You should see something like:"
    ```
    nix-shell (Nix) 2.2.2
    ```

If you’d like to know more about Nix and why we use it, you can [find information on Nix here](../nix/).
If you’d like to know more the Windows / Vagrant setup you can [find information here](../vagrant/).

</div>

---

## Install Holochain Tools

Now that you have installed Nix, you can run a development shell that contains all the prerequisites, including the correct Rust version and the Holochain tools. This shell won’t interfere with your current Rust installation. Run this command:

\#S:MODE=enter
```bash
nix-shell https://holochain.love
```

The first time you run this command it will take some time to download and build, but it will be much faster the next time.

!!! info "When it’s complete, you will see a new prompt starting with:"
    ```
    [nix-shell:
    ```

Test that Holochain is working by running:

\#S:MODE=nix
!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc --version
    ```

!!! success "You should see some thing like:"
    ```
    hc 0.0.41-alpha4
    ```

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    holochain --version
    ```

!!! success "You should see:"
    ```
    holochain 0.0.41-alpha4
    ```

### Update/Uninstall

With nix-shell, you don’t need to worry about updating or uninstalling; when you enter the nix-shell, everything is the latest release and is then cleaned up when you exit.

### Editor

In most cases you can run your editor as normal. However, if you are using an integrated developer environment or IDE that needs to communicate with the Holochain dependencies then you should launch it from inside the nix-shell.

To do this just open your editor while you are in the nix-shell like:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    vim my_file.rs
    ```

## Next Steps

1. __Read through the [Holochain Core Concepts](../concepts/).__
2. __Start the [Hello Holo Tutorial](../tutorials/coreconcepts/hello_holo)__
3. __Create a [New App](../create-new-app)__
4. Learn more about Holochain development in the [Guidebook](../guide/welcome/).
5. Learn more about Rust in Holochain [API Reference Documentation](../api/), [Crates.io](https://crates.io/search?q=Holochain), and the [Rust book](https://doc.rust-lang.org/book/).
6. Learn more about Nix as a dev dependency and why we’re using it in the [Holonix documentation](https://github.com/holochain/holonix).

<script>
function rudrSwitchTab(rudr_tab_id, rudr_tab_content) {
	// first of all we get all tab content blocks (I think the best way to get them by class names)
	var x = document.getElementsByClassName("tabcontent");
	var i;
	for (i = 0; i < x.length; i++) {
		x[i].style.display = 'none'; // hide all tab content
	}
	document.getElementById(rudr_tab_content).style.display = 'block'; // display the content of the tab we need

	// now we get all tab menu items by class names (use the next code only if you need to highlight current tab)
	var x = document.getElementsByClassName("tabmenu");
	var i;
	for (i = 0; i < x.length; i++) {
		x[i].className = 'tabmenu';
	}
	document.getElementById(rudr_tab_id).className = 'tabmenu active';
}
</script>
