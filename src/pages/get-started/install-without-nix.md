---
title: Setup without Nix (currently unsupported)
hide:
  - toc
---

::: intro
If you ended up here because you ran into problems with the [Nix based quick installation guide](/get-started/), we would greatly appreciate if you let us know what went wrong by [creating a bug report](https://github.com/holochain/docs-pages/issues/new/choose) so that we can look into it.
:::

!!! info Unsupported
Holonix is the recommended way to set up your development environment.
**We don't provide support for installing Holochain without Holonix.**
!!!

## Install Holochain without Holonix

In case you don't want to use Holonix to set up your development environment, here are the steps provided to install Holochain binaries directly
from the crate registry. At first the required Rust toolchain and features are installed, followed by the actual Holochain dependencies.


### Ubuntu-based Linux distributions

#### Install the Rust toolchain and build dependencies

1. Follow the official [Rust toolchain installation](https://www.rust-lang.org/tools/install)
2. Install the required target to build WebAssembly binaries
    ```shell
    rustup target add wasm32-unknown-unknown
    ```
3. Linux build tools
    ```shell
    sudo apt-get install build-essential
    ```
4. OpenSSL
    ```shell
    sudo apt-get install libssl-dev
    ```
5. Build dependency for Cargo libraries
    ```shell
    sudo apt-get install pkg-config
    ```

#### Install Holochain binaries

The following commands will compile and install the binaries into your user's profile.
It will overwrite any pre-existing binaries, also in the case where its already the latest version.

```shell
cargo install --force holochain
```
```shell
cargo install --force holochain_cli
```
```shell
cargo install --force lair_keystore
```
```shell
cargo install --force holochain_scaffolding_cli
```