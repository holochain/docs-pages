---
title: Get Started Developing with Holochain
layout: default-page-layout.njk
pageStyleId: install
---

## Hardware Requirements

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High Speed Internet connection

## Install Holochain on Linux, macOS and Windows

!!! note Prerequisite for Windows: WSL2

Holochain development uses the same tools across Mac, Windows, and Linux. However, the Nix toolkit, which we use to install and manage those tools, only works natively on Mac and Linux. Linux can be run under Windows with [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install){target=_blank}.

_Holochain is supported for the Ubuntu distribution under WSL2._
!!!

### Install the Nix Package Manager

At a command line:

```bash
sh <(curl -L https://nixos.org/nix/install) --daemon
```

After installing Nix, close the terminal and open a new one.

Check that Nix is correctly installed:

```bash
nix-shell --version
```

You should see something like:

```bash
nix-shell (Nix) 2.13.2
```

Temporarily allow new nix features

```bash
export NIX_CONFIG="extra-experimental-features = nix-command flakes"
```

Run the following commands to set up the cache for precompiled Holochain executables:

```bash
sudo --preserve-env=PATH nix run nixpkgs/nixos-22.11#cachix -- use holochain-ci -m root-nixconf
```

Ensure the nix-daemon will load the new settings:

##### Linux (it will start back automatically after stopping)

```bash
sudo systemctl stop nix-daemon.service
```

##### Mac

```bash
sudo launchctl stop system/org.nixos.nix-daemon
sudo launchctl start system/org.nixos.nix-daemon
````


## Scaffold Your First Holochain App

Type the following at the command line:

```bash
nix run github:holochain/holochain#hc-scaffold -- example forum
```

When prompted, select the UI framework you prefer.

_After completing the project setup, the scaffolding tool will output the commands to run the Holochain app._

### Next Step 

[Explore project structure —>](./project-structure){.btn-purple} 

!!! learn
#### Learn More
1. Dive into the [Holochain Core Concepts](../concepts/).
2. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
    Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
3. Join the discussion in the [HC.dev discord](https://discord.gg/k55DS5dmPH).
!!!
