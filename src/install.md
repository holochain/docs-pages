---
hide:
  - toc
---

# Get Started Developing with Holochain

## Hardware Requirements

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High Speed Internet connection

<!-- This style block is temp fix while non-linux docs are disabled-->
<style>
    .h-tile .not-link {
        padding: 1.2rem;
        display: block;
        border: 1px solid #e7e7e7;
        box-shadow: 1px 2px 5px 0 rgba(0,0,0,.05);
        position: relative;
        top: 0;
        color: rgba(0,0,0,.87) !important;
        transition: .3s;
    }
</style>

<!-- Inline styling is temp fix while non-linux docs are disabled-->
<div class="h-tile-container h-tile-container-3 tile-tabs" style="display: flex;">
    <div class="h-tile">
        <!-- <a href="javascript:rudrSwitchContent('tab_linux', 'content_linux');" id="tab_linux" data-contentclass="content_linux" class="tabmenu active" onclick="window.open(this.href,'_self'); return false;"> -->
        <a id="tab_linux" data-contentclass="content_linux" class="tabmenu active" style="display: block; height: 100%;">
            <h3><img src="../custom/icon-linux.svg" class="linux"> Linux</h3>
        </a>
    </div>
    <div class="h-tile">
        <!-- <a href="javascript:rudrSwitchContent('tab_macos', 'content_macos');" id="tab_macos" data-contentclass="content_macos" class="tabmenu" onclick="window.open(this.href,'_self'); return false;"> -->
        <div id="tab_macos" data-contentclass="content_macos" class="tabmenu not-link" >
            <h3><img src="../custom/icon-apple.svg"> macOS</h3>
            <h4>Not Yet Supported</h4>
        </div>
    </div>
    <div class="h-tile">
        <!-- <a href="javascript:rudrSwitchContent('tab_windows', 'content_windows');" id="tab_windows" data-contentclass="content_windows" class="tabmenu" onclick="window.open(this.href,'_self'); return false;"> -->
        <div id="tab_windows" data-contentclass="content_windows" class="tabmenu not-link">
            <h3><img src="../custom/icon-windows.svg"> Windows</h3>
            <h4>Not Yet Supported</h4>
        </div>
    </div>
</div>

<!-- <div markdown="1" class="tabcontent content_linux" data-tabid="tab_linux" style="display:none;">
</div> -->
## Install Holochain on Linux

### Install the Nix Package Manager

At a command line:

```bash
sh <(curl -L https://nixos.org/nix/install)
```

<!-- <div markdown="1" class="tabcontent content_macos" data-tabid="tab_macos" style="display:none;> -->

<!-- ## macOS

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

</div> -->

After installing Nix, close the terminal and open a new one.

Check that Nix is correctly installed:

```bash
nix-shell --version
```

You should see something like:

```
nix-shell (Nix) 2.6.0
```

Run the following commands to set up the cache:

```bash
nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/nixos-21.11.tar.gz -p cachix --run "cachix use holochain-ci"
```

## Scaffold Your First Holochain App

Type the following at the command line:

```
nix-shell https://holochain.love --run "hc scaffold example forum"
```

When prompted, select the UI framework you prefer.


When the project setup completes, type the following commands to run the Holochain app:

```
cd forum
```
```
nix-shell --run "npm install && npm start"
```

### Next Step: 
Explore the [project structure](../hApp-setup/) of your Holochain Forum example hApp


## Learn More

1. Dive into the [Holochain Core Concepts](../concepts/).
2. Read through our [advanced installation guide](../install-advanced/)  
3. Explore Holochain development interactively with community-created [Learning Resources](../learning/).
4. Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
5. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
6. Join the discussion in the [HC.dev discord](https://forum.holochain.org).


<script>
// function rudrSwitchContent(rudr_tab_id, rudr_tab_content) {
//     // first of all we get all tab content blocks (I think the best way to get them by class names)
//     var all_content = document.getElementsByClassName("tabcontent");
//     var i;
//     for (i = 0; i < all_content.length; i++) {
//         all_content[i].style.display = 'none'; // hide all tab content
//     }
//     var active_content = document.getElementsByClassName(rudr_tab_content);
//     for (i = 0; i < active_content.length; i ++) {
//         active_content[i].style.display = 'block'; // display the content we need
//     }

//     // now we get all tab menu items by class names (use the next code only if you need to highlight current tab)
//     var tabs = document.getElementsByClassName("tabmenu");
//     var i;
//     for (i = 0; i < tabs.length; i++) {
//         tabs[i].className = 'tabmenu';
//     }
//     document.getElementById(rudr_tab_id).className = 'tabmenu active';
// }

// // If there's a fragment identifier on the URL, switch to the correct tab on startup.
// function switchToTabForFragmentIfNecessary() {
//     var fragment = window.location.hash.slice(1);
//     if (!fragment) {
//         // Nothing to do. Make sure the default tab's content is visible.
//         var active_tab = document.querySelectorAll('.tabmenu.active')[0];
//         rudrSwitchContent(active_tab.id, active_tab.getAttribute('data-contentclass'))
//         return;
//     }

//     var target = document.getElementById(fragment);
//     if (!target)
//         // Invalid fragment identifier.
//         return;

//     var tabContainer = target.closest('.tabcontent');
//     if (!tabContainer)
//         // This content wasn't in a tab.
//         return;

//     var tabID = tabContainer.getAttribute('data-tabid');
//     var contentID = tabContainer.id;

//     // Make the tab active so you can see the linked content.
//     rudrSwitchContent(tabID, contentID);
// }

// // Switch to the correct tab if DOM is ready.
// if (document.readyState === 'interactive' || document.readyState === 'complete')
//     switchToTabForFragmentIfNecessary();

// // Otherwise, wait until document is loaded and try again.
// document.addEventListener('DOMContentLoaded', switchToTabForFragmentIfNecessary, false);

</script>
