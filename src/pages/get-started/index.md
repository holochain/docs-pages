---
title: Get Started
---

Welcome to the Getting Started with Holochain guide! This is a four-page guide which will walk you through the process of installing the Holochain development tools and creating a simple forum application. By the end of this guide, you'll be familiar with the core concepts of Holochain and have a basic understanding of how to develop peer-to-peer applications using the Holochain framework.

## How to use this guide

Follow this guide step by step. All steps are essential to create the example applications. No additional code or steps are needed.

There's a lot of additional explanation that isn't necessary for building the application, but it'll help you understand what you're doing in more depth. Look for the book icon and the 'Learn more' heading.

* The examples below use `$` to represent your terminal prompt in a UNIX-like OS, though it may have been customized in your OS to appear differently.
* We assume that you are reading this guide because you're a developer who's new to Holochain but is interested in actually building peer-to-peer distributed applications using a framework that is agent-centric, that provides intrinsic data integrity, is scalable, and runs just on the devices of the participants without relying on centralized servers, blockchain tokens, or other points of centralized control.
* We assume that you've at least skimmed [Holochain's Core Concepts](/concepts/1_the_basics/) or are ready to pop over there when needed.
* Because Holochain's DNAs are written in Rust, we assume you have at least a basic familiarity with the language. Note, however, that this guide will take you through everything you need to do, step-by-step, so you can follow the steps and learn Rust later. Additionally, Holochain DNAs rarely need to take advantage of the more complicated aspects of the language, so don't let Rust's learning curve scare you.
    * If you're new to Rust, you can start your learning journey by reading chapters 1 to 11 in the [Rust Book](https://doc.rust-lang.org/book/) and doing the accompanying [Rustlings exercises](https://github.com/rust-lang/rustlings/).
* We also assume that you have basic familiarity with the Unix command line.

## 1. Introduction to Holochain

Holochain is a framework for building peer-to-peer distributed applications, also known as hApps. It emphasizes agent-centric architecture, intrinsic data integrity, and scalability. Holochain enables developers to build applications that run on just the devices of the participants without relying on centralized servers or blockchain tokens.

## 2. Installing Holochain development environment

In this section, we'll walk you through the step-by-step process of installing Holochain, its dependencies, and developer tools on your system so that you can develop hApps.

### 2.1. Hardware requirements

Before you install the Holochain development environment, make sure your system meets the following hardware requirements:

* 8GB+ RAM (16GB+ recommended)
* 4+ cores CPU (6+ cores recommended)
* 30GB+ available disk space
* High-speed internet connection

This may seem like a lot; it's mainly due to Rust's compiler, which requires a lot of system resources.

### 2.2. Windows prerequisite: WSL2 {#2-2-windows-prerequisite-wsl2}

For Windows users, please note that the Nix package manager, which is used to install and manage the Holochain development environment, only supports macOS and Linux. You'll need to [install Linux under Windows with WSL2 (Windows Subsystem for Linux)](https://learn.microsoft.com/en-us/windows/wsl/install) (recommended) or dual-boot a Linux OS alongside your [Windows 10](https://www.freecodecamp.org/news/how-to-dual-boot-windows-10-and-ubuntu-linux-dual-booting-tutorial/) or [Windows 11](https://www.xda-developers.com/dual-boot-windows-11-linux/) OS to proceed.

Holochain is supported in WSL2 via the Ubuntu distribution.

You'll also need to install a few packages if you want to run two dev tools, `hc spin` and `hc launch`, which start your app's back end and open its GUI in Electron or Tauri webviews:

```shell
sudo apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgtk-3-dev libasound2t64 adwaita-icon-theme
```

Read more about these fixes in the [Dev Tools Setup guide](/get-started/install-advanced/#opening-your-happs-gui-in-ubuntu-on-wsl2).

### 2.3. Set up development environment

Once you've ensured that your system meets the hardware requirements and set up WSL2 on Windows or a dual-boot Linux OS (if applicable), you can proceed with the installation of the Nix package manager and the binary package cache for Holochain.

Open a command-line terminal ([on Linux](https://ubuntu.com/tutorials/command-line-for-beginners#3-opening-a-terminal), [on macOS](https://support.apple.com/en-gb/guide/terminal/pht23b129fed/mac)) and run the following command:

```shell
bash <(curl https://holochain.github.io/holochain/setup.sh)
```

This command downloads the setup script and runs it, installing the Nix package manager and setting up a package cache for Holochain.

### 2.4. Verify installation

In a new terminal session type:

<!-- TODO(upgrade): change following version number -->

```shell
nix run --refresh -j0 -v "github:holochain/holonix?ref=main-0.5#hc-scaffold" -- --version
```

Look out for binaries being copied from `holochain-ci.cachix.org`:

::: output-block
```text
downloading 'https://holochain-ci.cachix.org/nar/<some-hash>.nar.zst'...
```
:::

It proves that the package cache is configured correctly.

At the end of the output, Holochain's scaffolding tool should print its version string, which will be something like this:

<!-- TODO(upgrade): update this version number -->
::: output-block
```text
holochain_scaffolding_cli 0.500.0
```
:::

Congratulations! The Holochain development environment is now set up successfully on your system.

### Next up

Now it's time to download, compile, and try an example Holochain application.

[Try 'Hello World' →](/get-started/2-hello-world/){.btn-purple}