---
title: Advanced installation guide, tips and tricks
hide:
  - toc
---

::: coreconcepts-intro
This guide assumes that you've already followed the [quick installation guide](../install/) and want something more. It describes how to use your default shell and preferred code editor with Nix, explains how to install more or less stable versions of Holochain, and discusses why we use nix-shell in the first place.
:::

### Using your default shell

Many developers have their shell set up just the way they like it, whether a custom-formatted prompt or a completely different shell such as `zsh` and `fish`. If you don't want Holonix to clobber your carefully-crafted environment, try adding `--run $SHELL` to the end of your `nix-shell` command:

```bash
nix-shell https://holochain.love --run $SHELL
```

### Using your favorite text editor or IDE

In most cases you can run your editor as normal. However, if you are using a text editor or integrated development environment (IDE) that needs to communicate with the Rust compiler for real-time syntax checks, then you should launch it from inside the nix-shell. This is because Holonix comes with its own version of Rust that might be different from what you may already have installed.

To do this, just open your editor from the command line while you are in the nix-shell (this example uses Vim):

```bash
nix-shell https://holochain.love
cd my_project
vim my_file.rs
```

## Using a specific version of the development tools

!!! note Coming soon!

Steps how to use Holochain with a pinned Holochain version and upgrade it
!!!


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

A sample output of this command looks like this (JSON formatted using `jq`):

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

## More info on Nix

We use the Nix/NixOS toolkit to build consistent development, testing, and deployment environments for Holochain Core and apps. It consists of two systems:

* NixOS, a tool for reliably building Linux-based systems from a set of configuration files (we use NixOS in our HoloPorts and automated testing VMs)
* Nix, a package manager that works on many OSes and uses the same configuration file format as NixOS

The main components of the tooling for Holochain development are:

* The [Rust](https://rust-lang.org) programming language
* [Node.JS](https://nodejs.org) and [npm](https://npmjs.com)
* Cryptographic libraries
* Common automations and scripts

It is important that these remain consistent, so you can get your work done without fighting package and compiler issues. And when it comes time to compile and distribute your application, it's **very important to have a deterministic build system** so the same DNA source code always results in the same hash.

The main Nix tool used in Holochain development workflows is `nix-shell`, a managed Bash shell that overlays a new environment and set of tools on top of your existing environment.

The full suite of Nix tooling is broad and deep. There’s even a dedicated programming language. Learn more with the [NixOS Wiki](https://nixos.wiki/wiki/Main_Page) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The community IRC chat at `#nixos` on freenode is active and helpful.

### nix-shell

While working on Holochain, you will usually have an active `nix-shell` to run commands. This shell overlays Holochain-specific configuration on top of your existing shell---environment variables, Rust toolchains, binaries, libraries, and development tools---giving you a consistent development environment to build Holochain apps. All this setup will be cleaned up automatically when you close the shell.

If you want to re-enter the shell to do more work, or create multiple terminals to work in, you'll need to re-enter the `nix-shell`. The packages are cached locally on your machine, so they will be ready the next time you enter the shell. You do need to get the package configuration files from somewhere, though. If you use the Holochain repo cloning method, they're cached on your machine too, but the ['quick install'](../install/) and ['using a specific version'](#using-a-specific-version-of-the-development-tools) methods require an internet connection every time you want to enter the shell.

## Uninstalling Nix

You usually don't need to uninstall anything, because `nix-shell` leaves your familiar user environment alone and makes all of its own changes disappear once you exit the shell. But it does keep binaries and other packages on your device. On macOS it adds users and a user group too. If you want to free up some space, run these commands:

```bash
nix-collect-garbage -d
```

If you want to uninstall Nix as well, run these commands (you might need root privileges for the first line):

```bash
rm -rf /nix
rm ~/.nix-profile
```
[Detailed uninstallation instructions for macOS](https://gist.github.com/chriselsner/3ebe962a4c4bd1f14d39897fc5619732#uninstalling-nix)

## Install Holochain without Holonix

In case you don't want to use Holonix to set up your development environment, here are the steps provided to install Holochain binaries directly
from the crate registry. At first the required Rust toolchain and features are installed, followed by the actual Holochain dependencies.

> Holonix is the recommended way to set up your development environment.  
**We don't provide support for installing Holochain without Holonix.**

### Ubuntu-based Linux distributions

#### Install Rust toolchain

* [Rust toolchain installation](https://www.rust-lang.org/tools/install)
* Install target to build WebAssembly binaries
    ```bash
    rustup target add wasm32-unknown-unknown
    ```
* Linux build tools
    ```bash
    sudo apt-get install build-essential
    ```
* OpenSSL
    ```bash
    sudo apt-get install libssl-dev
    ```
* Build dependency for Cargo libraries
    ```bash
    sudo apt-get install pkg-config
    ```

#### Install Holochain dependencies

```bash
cargo install holochain -f
cargo install holochain_cli -f
cargo install lair_keystore -f
```

