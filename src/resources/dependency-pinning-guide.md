---
title: Dependency Pinning Guide
---

This guide tells you how to 'pin' versions of the Holochain HDK during hApp development so you're guaranteed to have a consistent build environment for compiling DNAs. This is helpful because, if you use our 'official' releases of Holonix (see the [quick install guide](../../install/)) you'll be updated automatically, and projects compiled with older versions of Holochain might break. Additionally, slight changes in the Rust compiler might mean that your compiled DNA ends up with a totally different hash on recompilation, even when the source code hasn't changed. This would cause a 'fork' in your network, which isn't good.

## Pinning your project to a specific Holonix release

1. Find the current Git commit hash for the version of Holonix that you want to use. Usually that's whatever's in the `love` branch, which is available from https://holochain.love and contains the most recent 'blessed' version of Holochain.

    ```bash
    git ls-remote https://github.com/holochain/holonix.git love
    4c866d57760c0681c69385b5d4a93cd8516081e3	refs/heads/love
    ```

    (Note: this is just an example hash.)

2. Take the above hash, then download and enter that specific version of holonix.

    ```bash
    nix-shell https://github.com/holochain/holonix/archive/4c866d57760c0681c69385b5d4a93cd8516081e3.tar.gz
    ```

3. Run `hn-introspect` in holonix to learn the Git commit hash of the version of Holochain that's being used there.

    ```bash
    hn-introspect | grep -oE '^- holochain.*$'
    - holochain: https://github.com/holochain/holochain/archive/a4461535c77f653f36cb3a7bb0dfda84e92ed1be.tar.gz
    ```

4. Using the above hash, pin the HDK revision in your DNA's `Cargo.toml` files.

    ```toml
    hdk = { git = "https://github.com/holochain/holochain.git", rev = "a4461535c77f653f36cb3a7bb0dfda84e92ed1be" }
    ```