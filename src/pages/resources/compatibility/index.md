---
title: "Tooling Compatibility Tables"
---

These tables help you keep the dependencies of all your hApp's components up to date and --- most importantly --- in sync with each other.

<!-- TODO(upgrade): add a new table to this list and move the 'current recommended release' text up -->

* [Holochain 0.5 compatibility table](/resources/compatibility/holochain-0.5/) **(current recommended release)**

## General guidance

We use [SemVer](https://semver.org/) to indicate component version compatibility. As a general rule:

* **We recommend using the [scaffolding tool](/get/started/3-forum-app-tutorial/) to create an app**, because it'll ensure that all version numbers are in sync.
* When we talk about Holochain versions in general, we're referring to the [`holochain` core library](https://crates.io/crates/holochain). Its most significant number is the reference point for the rest of the components' compatibility, and the versions of the conductor binary and [CLI](https://crates.io/crates/holochain_cli) follow it.
* Compatible [`hdk`](https://crates.io/crates/hdk/), [`holochain_zome_types`](https://crates.io/crates/holochain_zome_types/), [`holochain_integrity_types`](https://crates.io/crates/holochain_integrity_types), and [`holo_hash`](https://crates.io/crates/holo_hash/) library versions share a most significant number with the core library. (These are the dependencies you'll need to update in your zomes, although some of them are transitive dependencies that don't need to be referenced explicitly.)
* The [`hdi`](https://crates.io/crates/hdi/) library's most significant number is one higher than the core library (e.g., for `holochain` 0.5, compatible `hdi` versions are 0.6.x).
* From Holochain 0.5 onwards, the most significant number of the [scaffolding](https://github.com/holochain/scaffolding/) tool is the same as that of the core library, but multiplied by 100. For instance, for Holochain 0.5, it will be 0.500.x. (In Holochain 0.4 and earlier, it was multiplied by 1000.)
* The [lair keystore](https://crates.io/crates/lair_keystore), [Rust](https://crates.io/crates/holochain_client) and [JavaScript](https://www.npmjs.com/package/@holochain/client) clients, [Tryorama library](https://www.npmjs.com/package/@holochain/tryorama), and [`kangaroo-electron` app template repo](https://github.com/holochain/kangaroo-electron) have their own version number sequences, but almost always advance by one for every new Holochain release series. For example, if JavaScript client 0.18.x is compatible with Holochain 0.4, then JavaScript client 0.19.x will be compatible with Holochain 0.5.

To check the versions you're currently using in a scaffolded project, use the [`hn-introspect`](/get-started/install-advanced/#holonix-inspection-commands) command from within your project's Nix dev shell.

!!! info Integrity zome updates always break DNA compatibility
When you update a dependency in an integrity zome, even if it's within a compatible SemVer range and doesn't change your integrity zome's behavior, the DNA hash will change. This means that the DNA that the integrity zome is bundled into will have a separate network and DHT from any previous versions of the DNA.
!!!
