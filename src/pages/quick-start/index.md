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

### Prerequisite for Windows: WSL (Windows Subsystem for Linux)

Holochain development uses the same tools across Mac, Windows, and Linux. However, the Nix toolkit, which we use to install and manage those tools, only works natively on Mac and Linux. Linux can be run under **Windows with [WSL](https://learn.microsoft.com/en-us/windows/wsl/install){target=_blank}**.

Once WSL is set up, install Ubuntu by running the following commands:

1. 

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

Run the following command to set up the cache for precompiled Holochain executables:

```bash
nix-shell -I nixpkgs=https://github.com/NixOS/nixpkgs/archive/nixos-22.11.tar.gz -p cachix --run "cachix use holochain-ci"
```

## Scaffold Your First Holochain App

Type the following at the command line:

```bash
nix-shell https://holochain.love --run "hc scaffold example forum"
```

When prompted, select the UI framework you prefer.


When the project setup completes, type the following commands to run the Holochain app:

```bash
cd forum
```

```bash
nix-shell 
```

```bash
npm install && npm start
```

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
