---
title: "Holochain 0.6 Compatibility Table"
---

<!-- TODO(upgrade): change this to legacy/maintenance (see blurb at the top of the 0.5 compatibility table) this when 0.7 is recommended -->

!!! info Recommended
Holochain 0.6.0 is currently the **recommended** version for general use. However, when you scaffold a hApp, you'll currently get the following unsupported pre-release versions based on Holochain 0.6.1.
!!!

For more information on versioning and compatibility, see our [general guidance](/resources/compatibility/#general-guidance).

<!-- TODO(upgrade): bump version numbers for every non-breaking release -->

| Component                                                                                         | Latest compatible version                                                                                          |
|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| [`holochain` core library and conductor binary](https://github.com/holochain/holochain)           | [0.6.1-rc.7](https://crates.io/crates/holochain/0.6.1-rc.7)                                                                  |
| [`hc` CLI](https://crates.io/crates/holochain_cli)                                                | [0.6.1-rc.7](https://crates.io/crates/holochain_cli/0.6.1-rc.7)                                                              |
| [`hc-scaffold` CLI](https://github.com/holochain/scaffolding)                                     | [0.600.3-rc.0](https://crates.io/crates/holochain_scaffolding_cli/0.600.3-rc.0)                                              |
| [`hc-spin` CLI](https://github.com/holochain/hc-spin)                                             | [0.600.2-rc.0](https://github.com/holochain/hc-spin/releases/tag/v0.600.2-rc.0)                                              |
| [`hcterm` CLI](https://github.com/holochain/holochain/tree/develop/crates/holochain_terminal)     | [0.6.1-rc.7](https://crates.io/crates/hcterm/0.6.1-rc.7)                                                                     |
| [Kitsune2 bootstrap server](https://github.com/holochain/kitsune2/tree/main/crates/bootstrap_srv) | [0.4.0-dev.10](https://github.com/holochain/kitsune2/pkgs/container/kitsune2_bootstrap_srv/579735204?tag=v0.4.0-dev.10)          |
| [Lair keystore](https://github.com/holochain/lair)                                                | [0.6.3](https://crates.io/crates/lair_keystore/0.6.3)                                                              |
| [`hdk` library](https://crates.io/crates/hdk)                                                     | [0.6.1-rc.5](https://crates.io/crates/hdk/0.6.1-rc.1)                                                                        |
| [`hdi` library](https://crates.io/crates/hdi)                                                     | [0.7.1-rc.5](https://crates.io/crates/hdi/0.7.1-rc.1)                                                                        |
| [JavaScript client library](https://github.com/holochain/holochain-client-js)                     | [0.20.3-rc.0](https://www.npmjs.com/package/@holochain/client/v/0.20.3-rc.0)                                                 |
| [Rust client library](https://github.com/holochain/holochain/tree/main/crates/client)             | [0.8.1-rc.7](https://crates.io/crates/holochain_client/0.8.1-rc.7)                                                           |
| [`kangaroo-electron` app template repo](https://github.com/holochain/kangaroo-electron)           | [commit `afe8f04a`](https://github.com/holochain/kangaroo-electron/commit/afe8f04ac7456095976b6b63ad16be3e79a32da2) |
