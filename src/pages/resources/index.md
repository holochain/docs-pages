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

## Compatibility tables

To see what versions of each component are compatible with each other, see the [compatibility tables](/resources/compatibility/).

## Upgrade guides

If you're upgrading your hApp to a newer version of Holochain, we have some [upgrade guides](/resources/upgrade/) to make your work easier.

## Howtos

* [**Debugging a Running Holochain Conductor**](/resources/howtos/debugging/) --- tips on enabling and disabling log messages and interpreting what you see
* [**Running Network Infrastructure**](/resources/howtos/running-network-infrastructure/) --- instructions on using Docker to run a bootstrap and relay server for testing or production

## Programming references

### HDK and HDI

When you write a Holochain application, the part that lives in Holochain is called a [DNA](/concepts/2_application_architecture/#layers-of-the-application-stack). It runs as a guest in a WebAssembly sandbox and talks to the host, or Holochain conductor, through the host API. It's also expected to implement callbacks that the conductor needs to call at certain times. The HDK and HDI Rust crates make it easy for you write guest code that interfaces with the conductor --- the HDK for your DNA's [coordinator zomes](/resources/glossary/#coordinator-zome) and the HDI for [integrity zomes](/resources/glossary/#integrity-zome).

* **[HDK reference](https://docs.rs/hdk)**
* **[HDI reference](https://docs.rs/hdi)**

### Conductor APIs {#conductor-apis}

The conductor exposes two separate RPC APIs over WebSocket interfaces:

* The **admin API** lets application managers control the conductor to install bundles of DNAs (called [hApps](/resources/glossary/#holochain-application-happ)), create agent IDs, combine a DNA and an agent ID into a running [cell](/resources/glossary/#cell), and activate application RPC interfaces.
* The **application API** lets front-ends call a running cell's functions and get information on the [DNA bundle](/resources/glossary/#dna-bundle) that the cell belongs to.

For both of these APIs, you make an RPC call sending a MessagePack-serialized request in a special envelope format to the conductor over WebSocket and listen for a response. The request's envelope must contain a request ID, and the matching response will have the same ID. On the interface that exposes the app API, you can also listen for [**signals**](/resources/glossary/#signal) broadcast by cells. There are [client libraries](#conductor-clients) for JavaScript and Rust that make it easy to handle requests/responses and set up signal listeners.

* **[Conductor Admin API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html)**
* **[Conductor App API reference](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AppRequest.html)**

### Conductor clients

For ergonomic interaction with the two conductor APIs, there are two officially supported client implementations: one in JavaScript and one in Rust. If you intend to develop Holochain apps with a web-based UI, **it is likely that all you'll ever need is the [JavaScript client](https://www.npmjs.com/package/@holochain/client)**.

* **[Conductor Client reference (JavaScript)](https://github.com/holochain/holochain-client-js/tree/main/docs/client.md)**
* **[Conductor Client reference (Rust)](https://docs.rs/holochain_client/latest/holochain_client/)**
* **[Conductor Client reference (C#)](https://github.com/holochain-open-dev/holochain-client-csharp)** (community-maintained)

### Conductor configuration

The conductor has a few settings that can (and should) be configured via a YAML config file. We've provided documentation of the internal structures that hold this config; if you can picture how to serialize this to YAML in your mind, you can write a config file! (We promise we'll produce a more readable config file guide soon.)

* **[ConductorConfig structure](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/config/conductor/struct.ConductorConfig.html)**

## Binaries

There are three main developer binaries, and one user-oriented binary. You can run any of these on the command-line with the `--help` flag to get detailed documentation.

* **`holochain`** is the Holochain runtime, or [conductor](/resources/glossary/#conductor).
* **`hc`** is an all-purpose developer tool that:
    * scaffolds a project directory structure, build config, and boilerplate CRUD code for a new hApp
    * packages a [DNA manifest](/resources/glossary/#dna-manifest) file and one or more [zomes](/resources/glossary/#zome) (in WASM bytecode) into a [DNA bundle](/resources/glossary/#dna-bundle)
    * packages one or more DNAs into a hApp
    * manages Holochain conductor 'sandboxes' --- configuration files and working folders that can be used to repeatably spin up conductors for testing
    * spawns hApps and UIs for testing
    * runs JavaScript-based integration test scripts
    * runs a local copy of peer discovery and WebRTC signalling services
    * see [`holochain_cli` docs](https://docs.rs/holochain_cli/latest/holochain_cli) for more info
* **`lair-keystore`** is Holochain's [keystore](https://github.com/holochain/lair) for generating and signing with cryptographically secure keys. Use this command for initialization, configuration, and running of a Lair keystore. During normal operation, `holochain` will automatically spawn a `lair` process if it doesn't find one running.
* **Holochain Launcher** is an end-user runtime, meant for finding, installing, and running hApps. It runs in an Electron webview container which also hosts the UIs of installed hApps. Developers can also turn on 'developer mode' and publish their hApps to a built-in hApp store.
    * [Download the latest Launcher release from GitHub](https://github.com/holochain/launcher/releases)

## Libraries

The developer community has created some useful utilities, libraries, and reusable modules for you to use in your own apps.

* [Syn](https://github.com/holochain/syn) provides back-end and front-end libraries for creating real-time collaboration apps.
* [Holochain Open Dev](https://github.com/holochain-open-dev/) is a collection of reusable zomes and template repos from the developer community.
    * [`profiles`](https://github.com/holochain-open-dev/profiles) lets you store user profile information.
    * [`peer-status`](https://github.com/holochain-open-dev/peer-status) lets peers communicate their status (e.g., 'online', 'busy', 'on holiday') with each other.
    * [`notifications`](https://github.com/holochain-open-dev/notifications) lets a network designate a trusted agent to send out notifications over text, WhatsApp, and email.
    * [`file-storage`](https://github.com/holochain-open-dev/file-storage) chunks, stores, and retrieves arbitrary binary data.
* [Matthew Brisebois](https://github.com/mjbrisebois) has created many [useful back-end and front-end libraries](https://github.com/spartan-holochain-counsel) for building hApps.
    * [`rust-hc-crud-caps`](https://github.com/spartan-holochain-counsel/rust-hc-crud-caps) implements a pattern for tracking updates to a piece of data.
    * [`hc-cooperative-content`](https://github.com/holochain/hc-cooperative-content) implements patterns for collaborative content management --- permission and authority management, update/delete processes, etc.
    * [`holo-hash-js`](https://github.com/spartan-holochain-counsel/holo-hash-js) is a small JavaScript library for making Holochain data IDs easier to work with on the front end.
    * [`identicons-js`](https://github.com/mjbrisebois/identicons-js) is a JavaScript library that implements our recommended UX pattern of displaying hashes and public keys visually rather than textually.
* [hREA](https://github.com/h-rea) is a toolkit for building economic applications, such as bookkeeping, resource management, supply chain, ERM, cooperative marketplaces.

## Example applications

Studying existing Holochain applications and tutorials can provide valuable insights and inspiration for your projects. Here are some resources to explore:

* [Holochain Foundation sample apps](https://github.com/holochain-apps) contains application written by Holochain team members.
* [Moss](https://github.com/lightningrodlabs/moss) (formerly We) is a groupware container for composing multiple applets into one cohesive experience.
* [Snapmail](https://github.com/glassbeadsoftware/snapmail) is a privacy-first intranet mail app that doesn't need an intranet server.
* [Acorn](https://github.com/lightningrodlabs/acorn) is a unique, visually intuitive project management app based around defining goals first, then figuring out what needs to be done in order to achieve those goals.
* [Flux](https://github.com/coasys/flux) is a communities app similar to Discord but allows add-ons for new content types such as long-form content and knowledge bases.

## Tutorials and training

While you'll learn a lot looking at the source code from the above GitHub projects, we've also produced some training material as a result of running courses in collaboration with our education partner Mythosthesia.

* [Developer training materials](https://github.com/holochain-immersive) from past courses
* [Self-paced training course](/get-started/self-paced-developer-training/) in video format

## Concepts useful for understanding and building distributed systems

Holochain builds on a wealth of research and knowledge about distributed systems. Here are some carefully picked resources to help you on your journey:

* [Keeping CALM: When Distributed Consistency is Easy](https://arxiv.org/abs/1901.01930), a paper by Joseph M Hellerstein and Peter Alvaro that lays down the mathematical foundation for distributed systems that don't need coordination protocols, such as Holochain.
* [CRDT.tech](https://crdt.tech), a resource for learning about conflict-free replicated data types (CRDTs), data structures that let multiple users make concurrent updates to a resource with little to no manual conflict resolution.
* [Yjs](https://yjs.dev/) and [Automerge](https://automerge.org/), two CRDTs that can operate on arbitrary JSON. Syn (mentioned above under [Libraries](#libraries)) uses Automerge.
* [Local-first software: You own your data, in spite of the cloud](https://github.com/holochain/syn), a paper by Martin Kleppmann et al of Ink & Switch that explores the user experience of local-first software built on CRDTs.