# Install The Holochain Developer Tools

<div markdown="1" class="coreconcepts-intro">
This guide will get you set up with the latest 'blessed' Holochain developer environment on macOS, Linux, and Windows. Blessed releases are reasonably stable for daily hApp development, while in-between releases may have bugs or are meant for internal use. If you'd like to install an in-between release, read our [advanced guide](../nix/#unblessed-releases).
</div>

## Hardware Requirements

* 4GB+ RAM (16GB+ recommended)
* 4+ CPU (6+ CPU recommended)
* 30GB+ available disk space
* Internet connection

<div class="h-tile-container h-tile-container-3 tile-tabs">
    <div class="h-tile">
        <a href="javascript:rudrSwitchTab('tab_1', 'content_1');" id="tab_1" class="tabmenu active" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="/docs/custom/icon-apple.svg"> macOS</h3>
        </a>
    </div>
    <div class="h-tile">
        <a href="javascript:rudrSwitchTab('tab_2', 'content_2');" id="tab_2" class="tabmenu" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="/docs/custom/icon-linux.svg" class="linux"> Linux</h3>
        </a>
    </div>
    <div class="h-tile">
        <a href="javascript:rudrSwitchTab('tab_3', 'content_3');" id="tab_3" class="tabmenu" onclick="window.open(this.href,'_self'); return false;">
            <h3><img src="/docs/custom/icon-windows.svg"> Windows</h3>
        </a>
    </div>
</div>

<div markdown="1" class="tabcontent" data-tabid="tab_1" id="content_1">

## macOS

### Pre-Installed Software

* [XCode Developer Tools](https://apps.apple.com/us/app/xcode/id497799835?mt=12)

### Install the Nix Package Manager

We use Nix toolkit to manage the installation of our dev tools. Install the Nix package manager with this command:

#### macOS 10.15 Catalina

\#S:SKIP
```bash
sh <(curl https://nixos.org/nix/install) --darwin-use-unencrypted-nix-store-volume
```

#### macOS 10.14 Mojave and earlier

\#S:SKIP
```bash
curl https://nixos.org/nix/install | sh
```

</div>

<div markdown="1" class="tabcontent" data-tabid="tab_2" id="content_2" style="display:none;">

## Linux

### Install the Nix Package Manager

We use Nix toolkit to manage the installation of our dev tools. Install the Nix package manager with this command:

\#S:INCLUDE,MODE=linux
```bash
curl https://nixos.org/nix/install | sh
```

</div>

<div markdown="1" class="tabcontent" id="content_3" data-tabid="tab_3" style="display:none;">

## Windows

Holochain development uses the same tools across Mac, Windows, and Linux. However, the Nix toolkit, which we use to install and manage those tools, only works natively on Mac and Linux. If you have Windows 10, Linux is available via the Microsoft Store.

### Requirements

* Windows 10 with [May 2020 Update](https://support.microsoft.com/en-us/help/4028685/windows-10-get-the-update)

### Older versions of Windows

Windows 8 and earlier are not officially supported. We recommend that you install Linux in a virtual machine ([Ubuntu Linux](https://www.ubuntu.com/) in [VirtualBox](https://virtualbox.org) is a popular and user-friendly choice). Here is a [tutorial](https://itsfoss.com/install-linux-in-virtualbox/) to get you up and running.

### Install Ubuntu Linux

1. Make sure you're [up to date](https://support.microsoft.com/en-us/help/4028685/windows-10-get-the-update) with Windows 10 version 2004 or newer.
2. [Install Windows Subsystem for Linux 2 (WSL2)](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
3. Open the Microsoft Store app and search for Ubuntu 20.04 LTS.
4. Install Ubuntu.
5. Open the Start menu and click on Ubuntu 20.04 LTS. You should see a Linux terminal.

### Install the Nix Package Manager

Install the Nix package manager with this command:

\#S:SKIP
```bash
curl https://nixos.org/nix/install | sh
```

</div>

After installing Nix, you might need to run this command to get your terminal to recognize the newly installed commands:

\#S:INCLUDE,mode=linux
```bash
. ~/.nix-profile/etc/profile.d/nix.sh
```

Check that it installed correctly:

```bash
nix-shell --version
```

You should see something like:

```
nix-shell (Nix) 2.3.6
```

If you’d like to know more about Nix and why we use it, you can [find more information here](../nix/).

---

## Install Holochain Tools

Now that you have installed Nix, you can run a development shell that contains all the prerequisites, including the correct Rust and Node.js versions and the Holochain tools. This shell won’t interfere with your current system configuration. Run this command:

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
    holochain --version
    ```

!!! success "You should see something like:"
    ```
    hc 0.0.49-alpha1
    holochain 0.0.49-alpha1
    ```

### Update/Uninstall

You don’t need to worry about updating or uninstalling. When you enter the nix-shell, it checks for the latest blessed release, downloads any updates, and then cleans up the configuration when you exit.

### Using your text editor or IDE

In most cases you can run your editor as normal. However, if you are using a text editor or integrated development environment (IDE) that needs to communicate with the Rust compiler for real-time syntax checks, then you should launch it from inside the nix-shell. This is because Holonix comes with its own version of Rust that might be different from what you may already have installed.

To do this, just open your editor from the command line while you are in the nix-shell (this example uses Vim):

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    vim my_file.rs
    ```

## Next Steps

1. __Read through the [Holochain Core Concepts](../concepts/).__
2. __Start the [Hello Holo Tutorial](../tutorials/coreconcepts/hello_holo)__
3. __Create a [new app](../create-new-app)__
4. Learn more about Holochain development in the [Guidebook](../guide/welcome/).
5. Learn more about Rust and Holochain in the [API Reference Documentation](../api/), [Crates.io](https://crates.io/search?q=Holochain), and the [Rust book](https://doc.rust-lang.org/book/).
6. Learn more about Nix as a dev requirement and why we’re using it in the [Holonix documentation](https://docs.holochain.love).

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

// If there's a fragment identifier on the URL, switch to the correct tab.
function switchToTabForFragmentIfNecessary() {
    var fragment = window.location.hash.slice(1);
    if (!fragment)
        // Nothing to do.
        return;

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
    rudrSwitchTab(tabID, contentID);
}

// Switch to the correct tab if DOM is ready.
if (document.readyState === 'interactive' || document.readyState === 'complete')
    switchToTabForFragmentIfNecessary();

// Otherwise, wait until document is loaded and try again.
document.addEventListener('DOMContentLoaded', switchToTabForFragmentIfNecessary, false);

</script>
