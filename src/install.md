---
title: Install the Holochain Developer Tools
hide:
  - toc
---

# Install the Holochain Developer Tools

::: coreconcepts-intro
This guide will get you set up with the latest Holochain developer environment on macOS, Linux, and Windows. Right now Holochain is **alpha quality** and things are moving fast. Expect our APIs and SDKs to change and even break your app if you're keeping up with the latest changes. If you like tinkering, read our [advanced guide](../install-advanced/).
:::

## Hardware Requirements

* 4GB+ RAM (16GB+ recommended)
* 4+ CPU (6+ CPU recommended)
* 30GB+ available disk space
* Internet connection

<div class="h-tile-container h-tile-container-3 tile-tabs">
    <div class="h-tile">
        <a href="javascript:rudrSwitchContent('tab_linux', 'content_linux');" id="tab_linux" data-contentclass="content_linux" class="tabmenu active" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="../custom/icon-linux.svg" class="linux"> Linux</h3>
        </a>
    </div>
    <div class="h-tile">
        <a href="javascript:rudrSwitchContent('tab_macos', 'content_macos');" id="tab_macos" data-contentclass="content_macos" class="tabmenu" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="../custom/icon-apple.svg"> macOS</h3>
        </a>
    </div>
    <div class="h-tile">
        <a href="javascript:rudrSwitchContent('tab_windows', 'content_windows');" id="tab_windows" data-contentclass="content_windows" class="tabmenu" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="../custom/icon-windows.svg"> Windows</h3>
        </a>
    </div>
</div>

<div markdown="1" class="tabcontent content_linux" data-tabid="tab_linux" style="display:none;">

## Linux

### Install the Nix Package Manager

We use the Nix toolkit to manage the installation of our dev tools, so you can get to work without fighting compiler and package compatibility issues. Install the Nix package manager with this command:

```bash
sh <(curl -L https://nixos.org/nix/install)
```

</div>

<div markdown="1" class="tabcontent content_macos" data-tabid="tab_macos" style="display:none;>

## macOS

### Pre-Installed Software

* [XCode Developer Tools](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

### Install the Nix Package Manager

We use the Nix toolkit to manage the installation of our dev tools, so you can get to work without fighting compiler and package compatibility issues. Install the Nix package manager with this command:

```bash
sh <(curl -L https://nixos.org/nix/install)
```

#### Apple silicon ⚠️

*Currently we support Holonix on Apple silicon computers with M1/M2 chips (aarch64) ***only in Intel (x86_64) compatibility mode***. This mode requires [Rosetta 2](https://support.apple.com/en-us/HT211861) to be installed.*

*Enter an x86_64 shell before executing any command on this page:*

```bash
arch -x86_64 $SHELL
```

</div>

<div markdown="1" class="tabcontent content_windows" data-tabid="tab_windows" style="display:none;">

## Windows

Holochain development uses the same tools across Mac, Windows, and Linux. However, the Nix toolkit, which we use to install and manage those tools, only works natively on Mac and Linux. We recommend **installing Linux in a virtual machine** and using the <a href="javascript:rudrSwitchContent('tab_linux', 'content_linux');" onclick="window.open(this.href,'_self'); return false;">Linux instructions</a>. [Ubuntu Linux](https://www.ubuntu.com/) in [VirtualBox](https://virtualbox.org) is a popular and user-friendly choice; here is a [tutorial](https://itsfoss.com/install-linux-in-virtualbox/) to get you up and running.

If you have **Windows 10 with [WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-win10)**, Ubuntu Linux is available via the Microsoft Store. Right now we're **not supporting this method**, because we've seen some compilation issues, but if you wanted to try the following steps we'd be grateful if you shared your results on the [Holochain developers' forum](https://forum.holochain.org).

### Requirements

* Windows 10 with [May 2020 Update](https://support.microsoft.com/en-us/help/4028685/windows-10-get-the-update)

### Install Ubuntu Linux

1. Make sure you're [up to date](https://support.microsoft.com/en-us/help/4028685/windows-10-get-the-update) with Windows 10 version 2004 or newer.
2. [Install Windows Subsystem for Linux 2 (WSL2)](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
3. Open the Microsoft Store app and search for Ubuntu 20.04 LTS.
4. Install Ubuntu.
5. Open the Start menu and click on Ubuntu 20.04 LTS. You should see a Linux terminal.

### Install the Nix Package Manager

One you see a Linux terminal, install the Nix package manager with this command:

```bash
sh <(curl -L https://nixos.org/nix/install)
```

</div>

### Verify Nix installation

After installing Nix, close the terminal and open a new one.

Check that Nix is correctly installed:

```bash
nix-shell --version
```

You should see something like:

```
nix-shell (Nix) 2.6.0
```

If you’d like to know more about Nix and why we use it, you can [find more information here](../install-advanced/#more-info-on-nix).

## Configure Cachix to use pre-built binaries of Holochain

Now that you have installed Nix, you can install and run a development shell that contains all the prerequisites, including the correct Rust and Nodejs versions and the Holochain tools. This shell won’t interfere with your current system configuration.

To significantly speed up the load times for the next step you can make use of our Cachix instance.
If you don't use Cachix, nix-shells will take around 20-30 min for every version of Holochain, depending on your machine's specifications, because it needs to compile the Holochain binaries.

Run the following commands to set up the cache:

```bash
nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/nixos-21.11.tar.gz -p cachix --run "cachix use holochain-ci"
```

## Using the Holochain dev tools

You can use the Holochain dev tools in two ways, either by [creating a nix file](#using-holochain-with-a-pinned-holochain-version) which specifies the Holochain version or by using a URL that points to the most recent release. Usually Holochain projects define a specific Holochain version that they're running on and compatible with, just like Rust crates or NPM packages are included in a project with a particular version. If you  want play around with Holochain and the dev tools, you can use the URL with an ad-hoc nix-shell.

### Ad-hoc nix-shells with a current version of Holochain dev tools

Use this one-liner to load Holonix:

```bash
nix-shell https://holochain.love
```

Once this is finished, you'll be in the Holonix shell with all the developer tools at your disposal.
You will see a new bash prompt that looks like:

```bash
[nix-shell:~]$
```

Test that you have Holochain by running:

```bash
holochain --version
```

You should see something like this:

```
holochain 0.0.124
```

Once you `exit` the shell you'll be back to your usual system shell, with all Holochain-specific bits cleaned up.

You can re-enter the Holonix shell with the same command you used initially:

```bash
nix-shell https://holochain.love
```

It will always keep you up to date with the newest stable version of Holochain and the dev tools.

### Using Holochain with a pinned Holochain version

Holochain is currently in rapid development, which means newer versions introduce new features and breaking changes. This means that it's likely that the version that you get with `nix-shell https://holochain.love` won't always work with existing hApp repositories or even breaks a hApp you were working on.

To solve this, hApp projects can use Nix to pin a compatible Holochain version. The project needs to have a `default.nix` file in the root folder of the repository. Don't run this from inside the `nix-shell` provided by https://holochain.love. Instead, simply navigate to the project's root folder where the `default.nix` file needs to be and run:

```bash
nix-shell
```

This command looks for a `default.nix` file in the current folder and will create the specified environment.

#### Initialize a project for easy Holochain version upgrades

If you want to automatically upgrade your project to the most recent version of Holochain, you need to initalize a tool called `niv` for your project.

```bash
nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/nixos-21.11.tar.gz -p niv --run "niv init && niv drop nixpkgs && niv drop niv && niv add -b main holochain/holonix"
```

⚠️ [Run in x86_64 mode on Apple silicon machines](#apple-silicon) ⚠️

Executing this command creates a new folder named `nix` with 2 files that `niv` needs to retrieve the revision of the latest Holonix version.

Next you need to add a `default.nix` file as a Nix configuration of your development environment, including Holochain as a dependency.
This is a minimal `default.nix` file with a specific version of Holochain:

```nix
let
  holonixPath = (import ./nix/sources.nix).holonix; # points to the current state of the Holochain repository
  holonix = import (holonixPath) {
    holochainVersionId = "v0_0_124"; # specifies the Holochain version
  };
  nixpkgs = holonix.pkgs;
in nixpkgs.mkShell {
  inputsFrom = [ holonix.main ];
  packages = with nixpkgs; [
    niv
    # any additional packages needed for this project, e. g. Nodejs
  ];
}
```

Now you can enter the Nix shell with your development environment by running the command `nix-shell`. Once it's finished you have the Holochain commands at your disposal.

> niv initializes and updates to the latest revision of the Holonix repository. As every revision contains configurations for several previous versions of Holochain, you need to explicitly define the exact version of Holochain you want to use. In other words, niv does not set a Holochain version; it's defined in `default.nix`.

#### Upgrading the Holochain version

⚠️ [Run in x86_64 mode on Apple silicon machines](#apple-silicon) ⚠️

When the time has come to upgrade your hApp to a newer version of Holochain, there are 3 steps to follow:

1. Update the Holonix revision using `niv`:

    ```bash
    nix-shell --run "niv update"
    ```

2. Run `hn-versions` to see which versions of Holochain are available:

    ```bash
    nix-shell --run "hn-versions"
    ```

3. Set the `holochainVersionId` accordingly:

    ```nix
    ...
    holonix = import (holonixPath) {
        holochainVersionId = "v0_0_127";
    };
    ...
    ```

The next time you enter your hApp development environment using `nix-shell`, the updated version of Holochain will be downloaded and made available in the resulting Nix shell.

> Keep in mind that the Holonix repo includes Nix configurations for the last ~ 5 versions of Holochain. That means that if you keep updating its revision using `niv`, you will have to augment the Holochain version id in `default.nix` sooner or later too.

### Holochain inspection commands

Built into Holochain and holonix are a few commands that give insight about versions of Holochain components.

```bash
 hn-introspect
```

This command displays versioning information about Holochain's main components as well as Rust and Cargo. The output looks like this:

```bash
List of applications and their version information

v0_0_131
- hc-0.0.32-dev.0: https://github.com/holochain/holochain/tree/holochain-0.0.131
- holochain-0.0.131: https://github.com/holochain/holochain/tree/holochain-0.0.131
- kitsune-p2p-tx2-proxy-0.0.21: https://github.com/holochain/holochain/tree/holochain-0.0.131
- lair-keystore-0.0.9: https://github.com/holochain/lair/tree/v0.0.9

- rustc: rustc 1.58.1 (db9d1b20b 2022-01-20)
- cargo fmt: rustfmt 1.4.38-stable (db9d1b20 2022-01-20)
- cargo clippy: clippy 0.1.58 (db9d1b20 2022-01-20)
```

Another Holochain command that inspects the platform information and outputs the compatible HDK version is

```bash
holochain --build-info
```

A sample output of this command looks like this (JSON formmatted using `jq`):

```json
{
  "git_info": null,
  "cargo_pkg_version": "0.0.131",
  "hdk_version_req": "0.0.126",
  "timestamp": "2022-04-10T05:55:04.525835Z",
  "hostname": "Mac-1649560170558.local",
  "host": "x86_64-apple-darwin",
  "target": "x86_64-apple-darwin",
  "rustc_version": "rustc 1.58.1 (db9d1b20b 2022-01-20)",
  "rustflags": "",
  "profile": "release"
}
```

### Advanced installation guide

Read through our [advanced installation guide](../install-advanced/) for tips and tricks on making your development environment easier to work with, or what to do in case you need to work offline.

## Next Steps

1. Read through the [Holochain Core Concepts](../concepts/).
2. [Scaffold your own hApp](../happ-setup/#scaffolding-a-new-happ) using our RAD tool.
3. Learn Holochain development interactively with community-created [Learning Resources](../learning/).
4. Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
5. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
6. Join the discussion at the [developers' forum](https://forum.holochain.org).

<script>
function rudrSwitchContent(rudr_tab_id, rudr_tab_content) {
    // first of all we get all tab content blocks (I think the best way to get them by class names)
    var all_content = document.getElementsByClassName("tabcontent");
    var i;
    for (i = 0; i < all_content.length; i++) {
        all_content[i].style.display = 'none'; // hide all tab content
    }
    var active_content = document.getElementsByClassName(rudr_tab_content);
    for (i = 0; i < active_content.length; i ++) {
        active_content[i].style.display = 'block'; // display the content we need
    }

    // now we get all tab menu items by class names (use the next code only if you need to highlight current tab)
    var tabs = document.getElementsByClassName("tabmenu");
    var i;
    for (i = 0; i < tabs.length; i++) {
        tabs[i].className = 'tabmenu';
    }
    document.getElementById(rudr_tab_id).className = 'tabmenu active';
}

// If there's a fragment identifier on the URL, switch to the correct tab on startup.
function switchToTabForFragmentIfNecessary() {
    var fragment = window.location.hash.slice(1);
    if (!fragment) {
        // Nothing to do. Make sure the default tab's content is visible.
        var active_tab = document.querySelectorAll('.tabmenu.active')[0];
        rudrSwitchContent(active_tab.id, active_tab.getAttribute('data-contentclass'))
        return;
    }

    var target = document.getElementById(fragment);
    if (!target)
        // Invalid fragment identifier.
        return;

    var tabContainer = target.closest('.tabcontent');
    if (!tabContainer)
        // This content wasn't in a tab.
        return;

    var tabID = tabContainer.getAttribute('data-tabid');
    var contentID = tabContainer.id;

    // Make the tab active so you can see the linked content.
    rudrSwitchContent(tabID, contentID);
}

// Switch to the correct tab if DOM is ready.
if (document.readyState === 'interactive' || document.readyState === 'complete')
    switchToTabForFragmentIfNecessary();

// Otherwise, wait until document is loaded and try again.
document.addEventListener('DOMContentLoaded', switchToTabForFragmentIfNecessary, false);

</script>
