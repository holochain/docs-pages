---
title: Develop without Nix (currently unsupported)
hide:
  - toc
---

::: coreconcepts-intro
If you ended up here because you ran into problems with the [Nix based quick installation guide](../install/), we would greatly appreciate if you let us know what went wrong by [creating a bug report](https://github.com/holochain/docs-pages/issues/new/choose) so that we can look into it.
:::

!!! note Unsupported
Holonix is the recommended way to set up your development environment.
**We don't provide support for installing Holochain without Holonix.**
!!!

## Install Holochain without Holonix

In case you don't want to use Holonix to set up your development environment, here are the steps provided to install Holochain binaries directly
from the crate registry. At first the required Rust toolchain and features are installed, followed by the actual Holochain dependencies.


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
