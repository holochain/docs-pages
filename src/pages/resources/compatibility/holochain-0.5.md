---
title: "Holochain 0.5 Compatibility Table"
---

!!! info Legacy
Holochain 0.5 is currently in **maintenance** mode. Please [update to Holochain 0.6](/resources/upgrade/upgrade-holochain-0.6/) and use the [0.6 compatibility table](/resources/compatibility/holochain-0.6/).
!!!

For more information on versioning and compatibility, see our [general guidance](/resources/compatibility/#general-guidance).

<!-- TODO(upgrade): bump version numbers for every non-breaking release -->

| Component                                                                                         | Latest compatible version                                                                                          |
|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| [`holochain` core library and conductor binary](https://github.com/holochain/holochain)           | [0.5.6](https://crates.io/crates/holochain/0.5.6)                                                                  |
| [`hc` CLI](https://crates.io/crates/holochain_cli)                                                | [0.5.6](https://crates.io/crates/holochain_cli/0.5.6)                                                              |
| [`hc-scaffold` CLI](https://github.com/holochain/scaffolding)                                     | [0.500.2](https://crates.io/crates/holochain_scaffolding_cli/0.500.2)                                              |
| [`hc-spin` CLI](https://github.com/holochain/hc-spin)                                             | [0.500.3](https://github.com/holochain/hc-spin/releases/tag/v0.500.3)                                              |
| [`hc-launch` CLI](https://github.com/holochain/hc-launch)                                         | 0.500.0, available via [Holonix](/get-started/install-advanced/)                                                   |
| [`hcterm` CLI](https://github.com/holochain/holochain/tree/develop/crates/holochain_terminal)     | [0.5.6](https://crates.io/crates/hcterm/0.5.6)                                                                     |
| [Holochain playground](https://github.com/darksoil-studio/holochain-playground)                   | 0.500.0, available via [Holonix](/get-started/install-advanced/)                                                   |
| [Kitsune2 bootstrap server](https://github.com/holochain/kitsune2/tree/main/crates/bootstrap_srv) | [0.1.16](https://github.com/holochain/kitsune2/pkgs/container/kitsune2_bootstrap_srv/501568542?tag=v0.1.16)        |
| [Lair keystore](https://github.com/holochain/lair)                                                | [0.6.3](https://crates.io/crates/lair_keystore/0.6.3)                                                              |
| [`hdk` library](https://crates.io/crates/hdk)                                                     | [0.5.6](https://crates.io/crates/hdk/0.5.6)                                                                        |
| [`hdi` library](https://crates.io/crates/hdi)                                                     | [0.6.6](https://crates.io/crates/hdi/0.6.6)                                                                        |
| [JavaScript client library](https://github.com/holochain/holochain-client-js)                     | [0.19.3](https://www.npmjs.com/package/@holochain/client/v/0.19.3)                                                 |
| [Rust client library](https://github.com/holochain/holochain-client-rust)                         | [0.7.1](https://crates.io/crates/holochain_client/0.7.1)                                                           |
| [Tryorama testing library](https://github.com/holochain/tryorama)                                 | [0.18.3](https://www.npmjs.com/package/@holochain/tryorama/v/0.18.3)                                               |
| [`kangaroo-electron` app template repo](https://github.com/holochain/kangaroo-electron)           | [commit `7d3208a`](https://github.com/holochain/kangaroo-electron/commit/7d3208a3161bebb51f6114233dd7386b0815b79d) |
