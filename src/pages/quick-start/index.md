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

In a new shell session, type:

```bash
nix run --refresh -j0 -vv github:holochain/holochain#hc-scaffold -- --version
```

If you see something similar to

```text
downloading 'https://api.github.com/repos/holochain/holochain/commits/HEAD'...
evaluating file '/nix/store/41rxf7zlw8nwd4xxi4ja210a9y6fa4ph-source/flake.nix'
this path will be fetched (4.75 MiB download, 15.10 MiB unpacked):
  /nix/store/siiy4qyihjndzhsaj97g54zcvzkv5l54-hc-scaffold-<VERSION_NUMBER>
copying path '/nix/store/siiy4qyihjndzhsaj97g54zcvzkv5l54-hc-scaffold-<VERSION_NUMBER>' from 'https://holochain-ci.cachix.org'...
downloading 'https://holochain-ci.cachix.org/nar/2494efcf4b57407d4544b2443122002004debe4e546b4e8921881e28128721c9.nar.zst'...
holochain_scaffolding_cli <VERSION_NUMBER>
```

at the end of the output, the Holochain Dev Environment anc Cachix binary cache are set up successfully.

### Scaffold An Example Holochain App

Type the following at the command line:

```bash
nix run github:holochain/holochain#hc-scaffold -- example forum
```

When prompted, select the UI framework you prefer.

_After completing the project setup, the scaffolding tool will output the commands to run the Holochain app._

### Next Step 

[Explore project structure —>](./project-structure){.btn-purple} 

!!! learn Learn More
1. Dive into the [Holochain Core Concepts](../concepts/1_the_basics/).
2. Take a look at the developer documentation.
    * [SDK and API references](../references/)
    * [Rust HDK overview](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)
    Learn more about Rust in the [Rust book](https://doc.rust-lang.org/book/).
3. Join the discussion in the [HC.dev discord](https://discord.gg/k55DS5dmPH).
!!!
