---
title: Advanced installation guide, tips and tricks
hide:
  - toc
---

::: coreconcepts-intro
This guide assumes that you've already followed the [quick installation guide](../install/) and want something more. It describes how to use your default shell and preferred code editor with Nix, explains how to install more or less stable versions of Holochain, and discusses why we use `nix develop` the first place.
:::

### Holonix's usage of [Nix's Flake](https://nixos.wiki/wiki/Flakes) features

As of [holochain#1863](https://github.com/holochain/holochain/pull/1863) Holonix is implemented as Holochain's [flake.nix](https://github.com/holochain/holochain/blob/develop/flake.nix) output named _#holonix_ a.k.a. _devShells.${system}.holonix_.

The flake-based one-liner to get you an ad-hoc Holonix shell looks like this:

```shell
nix develop github:holochain/holochain#holonix
```

#### A little history

This feature was requested and discussed as early as [2021-04-08 via holonix#215](https://github.com/holochain/holonix/issues/215), even before it was merged into [Nix Release 2.4 as a stable feature on 2021-11-01](https://nixos.org/manual/nix/unstable/release-notes/rl-2.4.html#release-24-2021-11-01).

#### Enabling Flake features on your system

At the time of writing, these features are still considered experimental and require being enabled. This happens either ad-hoc on the command itself or permanently via Nix's configuration.

If you've completed the [quick installation guide](../install/), including the scaffolding example, then you'll likely already had the scaffolding configure it for you via the file at _~/.config/nix/nix.conf_.

To manually configure it via this file you can run the following commands:

```shell
mkdir -p ~/.config/nix
echo "extra-experimental-features = nix-command flakes" >> ~/.config/nix/nix.conf
```

To learn more, please see the [Enable flakes section on the NixOS Wiki](https://nixos.wiki/wiki/Flakes#Enable_flakes).

### Using your default `$SHELL`

Many developers have their shell set up just the way they like it, whether a custom-formatted prompt or a completely different shell such as `zsh` and `fish`. If you don't want Holonix to clobber your carefully-crafted environment, try adding `--command $SHELL` to the end of your `nix develop` command:

```shell
nix develop github:holochain/holochain#holonix --command "$SHELL"
```

### Using your favorite text editor or IDE

In most cases you can run your editor as normal. However, if you are using a text editor or integrated development environment (IDE) that needs to communicate with the Rust compiler for real-time syntax checks, then you should launch it from inside the `nix develop`. This is because Holonix comes with its own version of Rust that might be different from what you may already have installed.

To do this, just open your editor from the command line while you are in the `nix develop` (this example uses Vim):

```shell
nix develop github:holochain/holochain#holonix
cd my_project
vim my_file.rs
```

## Using a specific version of the development tools

!!! note Coming soon!

Steps how to use Holochain with a pinned Holochain version and upgrade it
!!!


### Holochain inspection commands

Built into Holochain and holonix are a few commands that give insight about versions of Holochain components.

```shell
hn-introspect
```

This command displays versioning information about Holochain's main components. The output looks like this:

```shell
$ hn-introspect
holochain (holochain 0.1.3): ed5b7bb461c2a8bfd4d2633bad604a20b8f2da03
lair-keystore (lair_keystore 0.2.3): cbfbefefe43073904a914c8181a450209a74167b
hc-launch (holochain_cli_launch 0.0.11): 3bcd14e81cda07e015071b070c2ef032aa1d1193
hc-scaffold (holochain_scaffolding_cli 0.1.6): 0d84d09a9a3f41d3b7d7330a0797a789c42fd57f
```

Another Holochain command that inspects the platform information and outputs the compatible HDK version is

```bash
holochain --build-info
```

A sample output of this command looks like this (JSON formatted using `jq` i.e. `holochain --build-info | jq .`):

```json
{
  "git_info": null,
  "cargo_pkg_version": "0.1.3",
  "hdk_version_req": "0.1.1",
  "hdi_version_req": "0.2.1",
  "timestamp": "2023-02-09T13:16:50.812160339Z",
  "hostname": "localhost",
  "host": "x86_64-unknown-linux-gnu",
  "target": "x86_64-unknown-linux-gnu",
  "rustc_version": "rustc 1.66.1 (90743e729 2023-01-10)",
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

The main Nix tool used in Holochain development workflows is `nix develop`, a program that overlays a new Bash environment and set of tools on top of your existing shell environment.

The full suite of Nix tooling is broad and deep. There’s even a dedicated programming language, called [Nix expressions](https://nixos.org/manual/nix/stable/#functional-package-language). Learn more with the [NixOS Wiki](https://nixos.wiki) or the [Pills](https://nixos.org/nixos/nix-pills/) Tutorial. The [NixOS community chat on matrix.to](https://matrix.to/#/#community:nixos.org) is aactive and helpful.

### `nix develop`

While working on Holochain, you will usually have an active `nix develop` to run commands. This shell overlays Holochain-specific configuration on top of your existing shell - environment variables, Rust toolchains, binaries, libraries, and development tools - giving you a consistent development environment to build Holochain apps. The shell environment is only set up in the current shell session, and will be reset automatically when you `exit` the shell.

If you want to re-enter the shell to do more work, or create multiple terminals to work in, you'll need to re-enter the `nix develop` in each new instance. The packages are cached locally on your machine, so they will be ready the next time you enter the shell. You do need to get the package configuration files from somewhere, though. If you use the Holochain repo cloning method, they're cached on your machine too, but the ['quick install'](../install/) and ['using a specific version'](#using-a-specific-version-of-the-development-tools) methods require an internet connection every time you want to enter the shell.

## Uninstalling Nix

You usually don't need to uninstall anything, because `nix develop` leaves your familiar user environment alone and makes all of its own changes disappear once you exit the shell. But it does keep binaries and other packages on your device. On macOS it adds users and a user group too. If you want to free up some space, run these commands:

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

#### Install the Rust toolchain and build dependencies

1. Follow the official [Rust toolchain installation](https://www.rust-lang.org/tools/install)
1. Install the required target to build WebAssembly binaries
    ```bash
    rustup target add wasm32-unknown-unknown
    ```
1. Linux build tools
    ```bash
    sudo apt-get install build-essential
    ```
1. OpenSSL
    ```bash
    sudo apt-get install libssl-dev
    ```
1. Build dependency for Cargo libraries
    ```bash
    sudo apt-get install pkg-config
    ```

#### Install Holochain binaries

The following commands will compile and install the binaries into your user's profile.
It will overwrite any pre-existing binaries, also in the case where its already the latest version.

```bash
cargo install --force holochain
cargo install --force holochain_cli
cargo install --force lair_keystore
cargo install --force holochain_cli_launch
cargo install --force holochain_scaffolding_cli
```
