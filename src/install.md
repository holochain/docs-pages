---
hide:
  - toc
---

# Install The Holochain Developer Tools

<div markdown="1" class="coreconcepts-intro">
This guide will get you set up with the latest Holochain RSM developer environment on macOS, Linux, and Windows. Right now Holochain RSM is **alpha quality** and things are moving fast. Expect our APIs and SDKs to change and even break your app if you're keeping up with the latest changes. If you like tinkering, read our [advanced guide](../install-advanced/).
</div>

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

#### macOS 10.15 Catalina and later

```bash
sh <(curl -L https://nixos.org/nix/install) --darwin-use-unencrypted-nix-store-volume
```

#### macOS 10.14 Mojave and earlier

```bash
sh <(curl -L https://nixos.org/nix/install)
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

After installing Nix, log out of your user account and log in again. Or, to save effort, run this command to get your terminal to recognize the newly installed commands:

```bash
. ~/.nix-profile/etc/profile.d/nix.sh
```

Check that it installed correctly:

```bash
nix-shell --version
```

You should see something like:

```
nix-shell (Nix) 2.3.9
```

If you’d like to know more about Nix and why we use it, you can [find more information here](../install-advanced/#more-info-on-nix).

---

## Installing the Holochain dev tools

Now that you have installed Nix, you can install and run a development shell that contains all the prerequisites, including the correct Rust and Node.js versions and the Holochain tools. This shell won’t interfere with your current system configuration.

Use this one-liner to install Holonix:

```bash
nix-shell https://nightly.holochain.love
```

It'll take a long time, because it needs to compile the Holochain binaries. (Don't worry; we're working on making it faster.) Once this is finished, you'll be in the Holonix shell with all the developer tools at your disposal. You will see a new bash prompt that looks like:

```
[nix-shell:~]$
```

Test that you have Holochain by running:

```bash
holochain --version
```

You should see something like this:

```
holochain 0.0.100
```

Once you `exit` the shell you'll be back to your usual system shell, with all Holochain-specific bits cleaned up.

## Using the Holochain dev tools

You can re-enter the Holonix shell with the same command you used to install it:

```bash
nix-shell https://nightly.holochain.love
```

It will always keep you up to date with the newest stable version of Holochain and the dev tools. If you need to work offline, read the [advanced installation guide](#keeping-everything-local-working-offline).

### Going further

Read through our [advanced installation guide](../install-advanced/) for tips and tricks on making your development environment easier to work with.

## Setting up a repository with a pinned Holochain version

Holochain is currently in rapid development, which means newer versions introduce new features and breaking changes. This means that it's likely that the version that you get with `nix-shell https://nightly.holochain.love` won't always work with existing hApp repositories.

To solve this, repositories of hApp projects can use Nix to pin the appropriate Holochain version to work well for that hApp. To do this, the project needs to have a `default.nix` file in the root folder of the repository. [Here](https://github.com/holochain/happ-build-tutorial/blob/develop/default.nix) you can see an example of that file.

If you are trying to set up a repository that comes with a `default.nix` file, you must not be inside the `nix-shell` provided by https://nightly.holochain.love. Instead, simply navigate to the folder with the `default.nix` file and run:

```bash
nix-shell .
```

This will do the same exact process that `nix-shell https://nightly.holochain.love` does, but will download the specific Holochain versions that that project is set up for. 

> Note that this can take a long time to download and compile the binaries. In the future we should be able to make this quicker by adding a build cache so that you only need to download the already compiled binaries.

## Next Steps

1. Read through the [Holochain Core Concepts](../concepts/).
2. Build your development skills in the [Holochain Gym](https://holochain-gym.github.io/) (community-created).
3. Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
4. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
5. Start [building your own DNAs](https://github.com/holochain/holochain-dna-build-tutorial).
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
