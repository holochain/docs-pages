---
title: Holochain Programming Resources
tocData:
  - text: HDK and HDI
    href: hdk-and-hdi
  - text: Conductor APIs
    href: conductor-apis
  - text: Conductor clients
    href: conductor-clients
  - text: Conductor configuration
    href: conductor-configuration
  - text: Binaries
    href: binaries
  - text: Example applications
    href: example-applications-and-tutorials
---

## HDK and HDI

When you write a Holochain application, the part that lives in Holochain is called a [DNA](../concepts/2_application_architecture/#layers-of-the-application-stack). It runs as a guest in a WebAssembly sandbox and talks to the host, or Holochain conductor, through the host API. It's also expected to implement callbacks that the conductor needs to call at certain times. The HDK and HDI Rust crates make it easy for you write guest code that interfaces with the conductor --- the HDK for your DNA's [coordinator zomes](/glossary/#coordinator-zome) and the HDI for [integrity zomes](/glossary/#integrity-zome).

* **[HDK reference](https://docs.rs/hdk){target=_blank}**
* **[HDI reference](https://docs.rs/hdi){target=_blank}**

## Conductor APIs

The conductor exposes two separate RPC APIs over WebSocket interfaces:

* The **admin API** lets application managers control the conductor to install bundles of DNAs (called [hApps](/glossary/#holochain-application-h-app)), create agent IDs, combine a DNA and an agent ID into a running [cell](/glossary/#cell), and activate application RPC interfaces.
* The **application API** lets front-ends call a running cell's functions and get information on the [DNA bundle](./glossary/#dna-bundle) that the cell belongs to.

For both of these APIs, you make an RPC call sending a MessagePack-serialized request in a special envelope format to the conductor over WebSocket and listen for a response. The request's envelope must contain a request ID, and the matching response will have the same ID. On the interface that exposes the app API, you can also listen for [**signals**](./glossary/#signal) broadcast by cells. There are [client libraries](#conductor-client) for JavaScript and Rust that make it easy to handle requests/responses and set up signal listeners.

* **[Conductor Admin API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html){target=_blank}**
* **[Conductor App API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AppRequest.html){target=_blank}**

## Conductor clients

For ergonomic interaction with the two conductor APIs, there are two officially supported client implementations: one in JavaScript and one in Rust. If you intend to develop Holochain apps with a web-based UI, **it is likely that all you'll ever need is the [JavaScript client](https://www.npmjs.com/package/@holochain/client){target=_blank}**.

* **[Conductor Client reference (JavaScript)](https://github.com/holochain/holochain-client-js){target=_blank}**
* **[Conductor Client reference (Rust)](https://docs.rs/holochain_client/latest/holochain_client/){target=_blank}**
* **[Conductor Client reference (C#)](https://github.com/holochain-open-dev/holochain-client-csharp){target=_blank}** (community-maintained)

## Conductor configuration

The conductor has a few settings that can (and should) be configured via a YAML config file. We've provided documentation of the internal structures that hold this config; if you can picture how to serialize this to YAML in your mind, you can write a config file! (We promise we'll produce a more readable config file guide soon.)

* **[ConductorConfig structure](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/config/conductor/struct.ConductorConfig.html){target=_blank}**

## Binaries

There are three main developer binaries, and one user-oriented binary. You can run any of these on the command-line with the `--help` flag to get detailed documentation.

* **`holochain`** is the Holochain runtime, or [conductor](./glossary/#conductor).
* **`hc`** is an all-purpose developer tool that:
    * packages a [DNA manifest](./glossary/#dna-manifest) file and one or more [zomes](./glossary/#zome) (in WASM bytecode) into a [DNA bundle](./glossary/#dna-bundle)
    * packages one or more DNAs into a hApp
    * manages Holochain conductor 'sandboxes' --- configuration files and working folders that can be used to repeatably spin up conductors for testing
    * spawns hApps and UIs for testing
    * see [`holochain_cli` docs](https://docs.rs/holochain_cli/latest/holochain_cli){target=_blank} for more info
* **`lair-keystore`** is Holochain's [keystore](https://github.com/holochain/lair){target=_blank} for generating and signing with cryptographically secure keys. Use this command for initialization, configuration, and running of a Lair keystore. During normal operation, `holochain` will automatically spawn a `lair` process if it doesn't find one running.
* **Holochain Launcher** is meant for users to find, install, and run hApps. It runs in a WebView container (currently Tauri, but we're migrating to Electron) which also hosts the UIs of installed hApps. Developers can also turn on 'developer mode' and publish their hApps to a built-in hApp store.
    * [Download the latest Launcher release from GitHub](https://github.com/holochain/launcher/releases)

## Example applications and tutorials

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Open Dev](https://github.com/holochain-open-dev)
* [Holochain Foundation sample apps](https://github.com/holochain-apps)
* [Holo developer training materials](https://github.com/holochain-immersive)
