---
<<<<<<< HEAD:src/pages/references/index.md
title: Holochain Programming References
tocData:
  - text: HDK and HDI
    href: hdk-and-hdi
  - text: Conductor API
    href: conductor-api
  - text: Conductor Client
    href: conductor-client
  - text: Conductor configuration
    href: conductor-configuration
  - text: Binaries
    href: binaries
  - text: Example applications
    href: example-applications-and-tutorials
=======
title: Holochain Programming Resources
>>>>>>> main:src/pages/resources/index.md
---

## HDK and HDI

When you write a Holochain application, the part that lives in Holochain is called a [DNA](../concepts/2_application_architecture/#layers-of-the-application-stack). It runs in a WebAssembly sandbox and talks to the host, or conductor, through the host API. The HDK makes it easy for you to write your DNA coordinator zomes. While the HDI lets you write your DNA integrity zomes.

* **[HDK reference](https://docs.rs/hdk){target=_blank}**
* **[HDI reference](https://docs.rs/hdi){target=_blank}**

## Conductor API

The conductor exposes two separate RPC APIs over WebSocket interfaces:

* The **admin API** lets application front-ends control the conductor to install DNAs, create agent IDs, combine a DNA and an agent ID into a running cell, and activate application RPC interfaces.
* The **app API** lets front-ends call a running [cell](./glossary/#cell)'s functions and get information on the [DNA bundle](./glossary/#dna-bundle) that the cell belongs to.

For both of these APIs, you make an RPC call sending a MessagePack-serialized request to the conductor over WebSocket and listening for a response. On the interface that exposes the app API, you can also listen for [**signals**](./glossary/#signal) broadcast by cells.

* **[Conductor Admin API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html){target=_blank}**
* **[Conductor App API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AppRequest.html){target=_blank}**

## Conductor Client

For ergonomic interaction with those two API's there are two officially supported client implementations: One in JavaScript and one in Rust. If you intend to develop Holochain Apps with a web-based UI, **it is likely that all you'll ever need is the [JavaScript client](https://www.npmjs.com/package/@holochain/client){target=_blank}**.

* **[Conductor Client reference (JavaScript)](https://github.com/holochain/holochain-client-js){target=_blank}**
* **[Conductor Client reference (Rust)](https://docs.rs/holochain_client/latest/holochain_client/){target=_blank}**
* **[Conductor Client reference (C#)](https://github.com/holochain-open-dev/holochain-client-csharp){target=_blank}** (Community-maintained)

## Conductor configuration

The conductor has a few settings that can (and should) be configured via a YAML config file. We've provided documentation of the internal structures that hold this config; if you can picture how to serialize this to YAML in your mind, you can write a config file! (We promise we'll produce a more readable config file guide soon.)

* **[ConductorConfig structure](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/config/conductor/struct.ConductorConfig.html){target=_blank}**

## Binaries

There are three main binaries. You can run any of these on the command-line with the `--help` flag to get detailed documentation.

* **`holochain`** is the Holochain runtime, or [conductor](./glossary/#conductor).
* **`hc`** is an all-purpose developer tool that:
    * packages a [DNA manifest](./glossary/#dna-manifest) file and one or more [zomes](./glossary/#zome) (in WASM bytecode) into a [DNA bundle](./glossary/#dna-bundle)
    * packages one or more DNAs into a hApp
    * manages sandboxed Holochain conductors
    * see [holochain_cli docs](https://docs.rs/holochain_cli/latest/holochain_cli){target=_blank} for more info
* **`lair-keystore`** is Holochain's [keystore](https://github.com/holochain/lair){target=_blank} for generating and signing with cryptographically secure keys. Use this command for initialization, configuration, and running of a Lair keystore.

## Example applications and tutorials

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Open Dev](https://github.com/holochain-open-dev)
* [Holochain Foundation sample apps](https://github.com/holochain-apps)
* [Holo developer training materials](https://github.com/holochain-immersive)
