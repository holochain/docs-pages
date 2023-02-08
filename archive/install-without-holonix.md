---
title: Install Holochain without Holonix
hide:
  - toc
---

In case you don't want to use Holonix to set up your development environment, here are steps provided to install Holochain binaries directly
from the crate registry. At first the required Rust toolchain and features are installed, followed by the actual Holochain dependencies.

> Holonix is the recommended way to set up your development environment.  
**We don't provide support for installing Holochain without Holonix.**

## Ubuntu-based Linux distributions

### Install Rust toolchain

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

### Install Holochain dependencies

```bash
cargo install holochain -f
cargo install holochain_cli -f
cargo install lair_keystore -f
```
