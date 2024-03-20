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
    href: example-applications
  - text: Tutorials and training
    href: tutorials-and-training
---

## HDK and HDI

When you write a Holochain application, the part that lives in Holochain is called a [DNA](/concepts/2_application_architecture/#layers-of-the-application-stack). It runs as a guest in a WebAssembly sandbox and talks to the host, or Holochain conductor, through the host API. It's also expected to implement callbacks that the conductor needs to call at certain times. The HDK and HDI Rust crates make it easy for you write guest code that interfaces with the conductor --- the HDK for your DNA's [coordinator zomes](/resources/glossary/#coordinator-zome) and the HDI for [integrity zomes](/resources/glossary/#integrity-zome).

* **[HDK reference](https://docs.rs/hdk){target=_blank}**
* **[HDI reference](https://docs.rs/hdi){target=_blank}**

## Conductor APIs {#conductor-apis}

The conductor exposes two separate RPC APIs over WebSocket interfaces:

* The **admin API** lets application managers control the conductor to install bundles of DNAs (called [hApps](/resources/glossary/#holochain-application-h-app)), create agent IDs, combine a DNA and an agent ID into a running [cell](/resources/glossary/#cell), and activate application RPC interfaces.
* The **application API** lets front-ends call a running cell's functions and get information on the [DNA bundle](/resources/glossary/#dna-bundle) that the cell belongs to.

For both of these APIs, you make an RPC call sending a MessagePack-serialized request in a special envelope format to the conductor over WebSocket and listen for a response. The request's envelope must contain a request ID, and the matching response will have the same ID. On the interface that exposes the app API, you can also listen for [**signals**](/resources/glossary/#signal) broadcast by cells. There are [client libraries](#conductor-clients) for JavaScript and Rust that make it easy to handle requests/responses and set up signal listeners.

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

* **`holochain`** is the Holochain runtime, or [conductor](/resources/glossary/#conductor).
* **`hc`** is an all-purpose developer tool that:
    * packages a [DNA manifest](/resources/glossary/#dna-manifest) file and one or more [zomes](/resources/glossary/#zome) (in WASM bytecode) into a [DNA bundle](/resources/glossary/#dna-bundle)
    * packages one or more DNAs into a hApp
    * manages Holochain conductor 'sandboxes' --- configuration files and working folders that can be used to repeatably spin up conductors for testing
    * spawns hApps and UIs for testing
    * see [`holochain_cli` docs](https://docs.rs/holochain_cli/latest/holochain_cli){target=_blank} for more info
* **`lair-keystore`** is Holochain's [keystore](https://github.com/holochain/lair){target=_blank} for generating and signing with cryptographically secure keys. Use this command for initialization, configuration, and running of a Lair keystore. During normal operation, `holochain` will automatically spawn a `lair` process if it doesn't find one running.
* **Holochain Launcher** is meant for users to find, install, and run hApps. It runs in a WebView container (currently Tauri, but we're migrating to Electron) which also hosts the UIs of installed hApps. Developers can also turn on 'developer mode' and publish their hApps to a built-in hApp store.
    * [Download the latest Launcher release from GitHub](https://github.com/holochain/launcher/releases)

## Libraries

The developer community has created some useful utilities, libraries, and reusable modules for you to use in your own apps.

* [Holochain Open Dev](https://github.com/holochain-open-dev/) is a collection of reusable zomes and template repos from the developer community.
    * [`profiles`](https://github.com/holochain-open-dev/profiles) lets you store user profile information.
    * [`peer-status`](https://github.com/holochain-open-dev/peer-status) lets peers communicate their status (e.g., 'online', 'busy', 'on holiday') with each other.
    * [`notifications`](https://github.com/holochain-open-dev/notifications) lets a network designate a trusted agent to send out notifications over text, WhatsApp, and email.
    * [`file-storage`](https://github.com/holochain-open-dev/file-storage) chunks, stores, and retrieves arbitrary binary data.
* [Matthew Brisebois](https://github.com/mjbrisebois) has created many [useful back-end and front-end libraries](https://github.com/spartan-holochain-counsel) for building hApps.
    * [`rust-hc-crud-caps`](https://github.com/spartan-holochain-counsel/rust-hc-crud-caps) implements a pattern for tracking updates to a piece of data.
    * [`hc-cooperative-content`](https://github.com/mjbrisebois/hc-cooperative-content) implements patterns for collaborative conetnt management --- permission and authority management, update/delete processes, etc.
    * [`holo-hash-js`](https://github.com/spartan-holochain-counsel/holo-hash-js) is a small JavaScript library for making Holochain data IDs easier to work with on the front end.
    * [`identicons-js`](https://github.com/mjbrisebois/identicons-js) is a recommended library for displaying Holochain data IDs (entry/action hashes and agent IDs) visually.
* [hREA](https://github.com/h-rea) ([website](https://hrea.io/)) is a toolkit for building economic applications, from bookkeeping and resource management to supply chain to cooperative markets.

## Example applications

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Open Dev](https://github.com/holochain-open-dev) has a lot of applications from the community.
* [Holochain Foundation sample apps](https://github.com/holochain-apps) contains application written by Holochain team members.
* [Lightningrod Labs](https://github.com/lightningrodlabs/), a group formed by Holochain co-creator [Eric Harris-Braun](https://github.com/zippy), creates foundational hApps for the Holochain ecosystem to build their tools on. [Moss](https://github.com/lightningrodlabs/we) (formerly We) is a groupware container for composing multiple applets into one cohesive experience.
* [Glass Bead Software](https://github.com/glassbeadsoftware/) produces Snapmail, a privacy-first intranet mail app.
* [Darksoil Studio](https://github.com/darksoil-studio/) creates apps to help groups organize and do their work together.
* [Harris-Braun Enterprises](https://github.com/h-be) has created [Acorn](https://acorn.software/), a unique project management app based around defining goals first, then figuring out what needs to be done in order to achieve those goals.

## Tutorials and training

While you'll learn a lot looking at the source code of example applications from the above GitHub organzations, we've also produced some training material as a result of running courses in collaboration with our education partner Mythosthesia.

* [Developer training materials](https://github.com/holochain-immersive) from past courses
* [Self-paced training course](https://resources.holochain.org/self-paced-training-signup/) in video format