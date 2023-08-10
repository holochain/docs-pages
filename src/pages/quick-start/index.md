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

## Install the Holochain Dev Environment

!!! note Prerequisite for Windows: WSL2

The Nix package manager, which we use to install and manage Holochain development tools, only supports Mac and Linux. Please install Linux under Windows with [WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install){target=_blank}.

_Holochain is supported for the Ubuntu distribution under WSL2._
!!!

### Install the Nix Package Manager and set up Holochain binary cache

At a command line:

```bash
bash <(curl https://holochain.github.io/holochain/setup.sh)
```

### Verify installation

In a new shell session type:

```bash
nix run --refresh -j0 -v github:holochain/holochain#hc-scaffold -- --version
```

Look out for binaries being copied from `holochain-ci.cachix`. It proves that the Cachix binary
cache is configured correctly. If it works, there will be lines like this:

```text
downloading 'https://holochain-ci.cachix.org/nar/<some-hash>.nar.zst'...
```

The Holochain Dev Environment is configured successfully on your system if you see a scaffolding version like

```text
holochain_scaffolding_cli x.y.z
```

at the end of the output.

!!! note Workaround for caching issues

Sometimes the binaries you need will not be in cachix and you will get an error that looks something like:
> "unable to start any build; either increase '--max-jobs' or enable remote builds"

This is an open issue that we are working on resolving. As a workaround you build the binaries yourself by 
using the following command instead of the one provided above:

```bash
nix run --refresh -j4 -v github:holochain/holochain#hc-scaffold -- --version
```

This will allow Nix to build on your machine as required, rather than assuming pre-built binaries can be downloaded. Please be aware that building from source will take some time!

!!!

### Scaffold An Example Holochain App

Type the following at the command line:

```bash
nix run github:holochain/holochain#hc-scaffold -- example forum
```

When prompted, select the UI framework you prefer.

_After completing the project setup, the scaffolding tool will output the commands to run the Holochain app._

### Next Step

[Explore project structure →](./project-structure){.btn-purple}

!!! learn Learn More
1. Dive into the [Holochain Core Concepts](../concepts/1_the_basics/).
2. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
    Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
3. Join the discussion in the [HC.dev discord](https://discord.gg/k55DS5dmPH).
!!!
