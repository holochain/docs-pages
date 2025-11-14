---
title: "Holochain 0.5 Compatibility Table"
---

<!-- TODO(upgrade): remove this when 0.6 is recommended -->

!!! info Recommended
Holochain 0.5 is currently the **recommended** version for general use.
!!!

<!-- TODO(upgrade): bump version numbers for every non-breaking release -->

| Component                                                                               | Version range | Latest version                                                        | Notes                                                                                                                        |
|-----------------------------------------------------------------------------------------|---------------|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [`holochain`](https://crates.io/crates/holochain)                                       | 0.5.x         | [0.5.6](https://crates.io/crates/holochain/0.5.6)                     | Incompatible with database format and wire protocol of 0.4.                                                                  |
| [`hc` CLI](https://crates.io/crates/holochain_cli)                                      | 0.5.x         | [0.5.6](https://crates.io/crates/holochain_cli/0.5.6)                 |                                                                                                                              |
| [`hdk`](https://crates.io/crates/hdk)                                                   | 0.5.x         | [0.5.6](https://crates.io/crates/hdk/0.5.6)                           |                                                                                                                              |
| [`hdi`](https://crates.io/crates/hdi)                                                   | 0.6.x         | [0.6.6](https://crates.io/crates/hdi/0.6.6)                           |                                                                                                                              |
| [`holochain_zome_types`](https://crates.io/crates/holochain_zome_types)                 | 0.5.x         | [0.5.6](https://crates.io/crates/holochain_zome_types/0.5.6)          | Transitive; imported via `hdk`.                                                                                              |
| [`holochain_integrity_types`](https://crates.io/crates/holochain_integrity_types)       | 0.5.x         | [0.5.6](https://crates.io/crates/holochain_integrity_types/0.5.6)     | Transitive; imported via `hdk` and `hdi`.                                                                                    |
| [`holo_hash`](https://crates.io/crates/holo_hash)                                       | 0.5.x         | [0.5.6](https://crates.io/crates/holo_hash/0.5.6)                     |                                                                                                                              |
| [`holochain_serialized_bytes`](https://crates.io/crates/holochain_serialized_bytes)     | 0.0.56        | [0.0.56](https://crates.io/crates/holochain_serialized_bytes/0.0.56)  | Needs to be an explicit dependency in your zomes' `Cargo.toml` files, but can be `"*"` rather than a specific version number |
| [`hc-scaffold`](https://crates.io/crates/holochain_scaffolding_cli)                     | 0.500.x       | [0.500.2](https://crates.io/crates/holochain_scaffolding_cli/0.500.2) | Scaffold projects with the command `nix run "github:/holochain/holonix?ref=main-0.5#hc-scaffold" -- web-app`.                |
| [JavaScript client](https://www.npmjs.com/package/@holochain/client)                    | 0.19.x        | [0.19.3](https://www.npmjs.com/package/@holochain/client/v/0.19.3)    |                                                                                                                              |
| [Tryorama testing library](https://www.npmjs.com/package/@holochain/tryorama)           | 0.18.x        | [0.18.3](https://www.npmjs.com/package/@holochain/tryorama/v/0.18.3)  |                                                                                                                              |
| [Rust client](https://crates.io/crates/holochain_client)                                | 0.7.x         | [0.7.1](https://crates.io/crates/holochain_client/0.7.1)              |                                                                                                                              |
| [Lair keystore](https://crates.io/crates/lair_keystore)                                 | 0.6.x         | [0.6.3](https://crates.io/crates/lair_keystore/0.6.3)                 | Bundled with Holochain conductor.                                                                                            |
| [`kangaroo-electron` app template repo](https://github.com/holochain/kangaroo-electron) | 0.2.x         | [0.2.5](https://github.com/holochain/kangaroo-electron/tree/v0.2.5)   |                                                                                                                              |
