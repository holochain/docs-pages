---
title: Application Structure
---

!!! topic-list
### In this section {data-no-toc}

* Application Structure (this page)
<!--
    * [Zomes] --- integrity vs coordinator, how to structure and compile
    * [DNAs] --- what they're used for, how to specify and bundle
    * [hApps] --- headless vs UI-based, how to bundle and distribute
-->
!!!

!!! intro
There are a few basic units of composability and packaging you'll need to know about when you're structuring your hApp. Each has different purposes, so it matters how you break up your code.
!!!

## Zomes, DNAs, and hApps

### Zomes

The smallest unit in a hApp is called a chromosome or **zome**. It's the actual binary code that runs in Holochain's [WebAssembly](https://webassembly.org/) VM.

!!! info Why WebAssembly?

We chose WebAssembly because:

* A [number of languages](https://github.com/appcypher/awesome-wasm-langs) can already be compiled to WebAssembly, which we hope will mean Holochain can support many languages on the back end in the future (currently we only supply a back-end SDK for Rust.)
* It's small and fast --- it can get compiled to machine code for near-native speed.
* Holochain is written in Rust, and Rust has an excellent WebAssembly engine called [Wasmer](https://wasmer.io/) that works on all the major operating systems.

!!!

A zome has access to Holochain's host API and also exposes functions of its own. Some of these functions are **required callbacks** and some of them you invent yourself to create your back end's API.

There are two kinds of zome:

* An **integrity zome** defines a set of data types --- your application's schema --- and validation rules for operations that create, update, or delete data of those types. If you're used to thinking of apps in terms of [model-view-controller (MVC)](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller), it's like your application's model.
* A **coordinator zome** defines a set of functions for interacting with data and peers. You can think of it as your application's controller.

Zomes are usually created as pairs --- an integrity zome that defines a portion of your schema and a coordinator zome that defines <abbr title="create, read, update, delete">CRUD</abbr> functions for that schema. You don't have to do it this way though --- coordinator zomes don't need an integrity zome if they don't manipulate data, or they can depend on multiple integrity zomes, or multiple coordinators can depend on the same integrity zome.

If you mean for your zomes to be reused by other projects, you can share them via your Git repository or [crates.io](https://crates.io) (tag your crates with `#holochain` so others can find them).

### DNAs

Multiple zomes are bundled into a **DNA**. When two or more participants install and run a DNA, an isolated peer-to-peer network is created among them to interact and store shared data.

**A DNA, and the network created for it, is uniquely defined by its integrity zomes, plus any modifiers.** The hash of the integrity zomes plus modifiers is called the **DNA hash**, and is the unique identifier for the network.

Because each DNA has its own peer network and data store, you can use the DNA concept to come up with creative approaches to privacy, separation of responsibilities, or data retention.

!!! info Why not coordinator zomes?

Coordinator zomes are bundled with a DNA, but they don't contribute to its uniqueness. This lets you hot-swap coordinators as you fix bugs and add features, without causing the DNA to **fork** a new network. The only things that should cause a fork are changes to integrity code --- the 'rules of the game' for the participants.

!!!

### hApp

Multiple DNAs come together in a **hApp** (Holochain + app). Each DNA fills a named **role** in the hApp, like a [microservice](https://en.wikipedia.org/wiki/Microservices) architecture.

Each peer generates its own public/private key pair when they install a hApp, and this becomes their **agent ID** which identifies and authenticates them as a participant in all the networks created for all the DNAs in the hApp. When a DNA is activated, it's bound to this key pair and becomes a DNA instance or **cell**.

The hApp can specify a few provisioning strategies for its DNAs:

* A cell can be instantiated at app installation time.
* A cell can be prepared but not instantiated until it's needed later.
* If an existing cell with a matching DNA hash exists, it can be reused.
* A new cell can be **cloned** from an existing DNA at any time after the hApp is installed, with an optional limit on the number of clones.
* A DNA can be installed but never instantiated into a cell --- instead it serves only as a **stem cell**, a template for cloning.

A hApp can optionally include a web-based UI that [supporting Holochain runtimes](TODO: link) can serve to the user.

!!! info A hApp always runs locally

The big difference with peer-to-peer stacks like Holochain is that **all the code** --- both the back end and the front end --- **runs on the devices of the participants themselves**.

That means that a DNA doesn't exist as some piece of code that runs 'out there somewhere' --- instead it runs from the perspective of an individual. Cell = DNA + agent.

That doesn't mean there can't be bots or system-level services that do automated tasks. It just means that those functions have to be handled by one of the peers, which doesn't have to be a human-driven machine.

!!!

## Further reading

* Core Concepts: [Application Architecture](/concepts/2_application_architecture)