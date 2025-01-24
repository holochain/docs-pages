---
title: Application Structure
---

::: topic-list
### In this section {data-no-toc}

* Application Structure (this page)
    * [Zomes](/build/zomes/) --- integrity vs coordinator, how to structure and compile
        * [Lifecycle Events and Callbacks](/build/callbacks-and-lifecycle-hooks/) --- writing functions that respond to events in a hApp's lifecycle
        * [Zome Functions](/build/zome-functions/) --- writing your hApp's back-end API
    * [DNAs](/build/dnas/) --- what they're used for, how to specify and bundle
    * [hApps](/build/happs/) --- headless vs UI-based, how to bundle and distribute
:::

::: intro
There are a few basic units of composability and packaging you'll need to know about when you're structuring your hApp. Each has different purposes, and the way you break up your code makes a difference to how it works in terms of access, privacy, participant responsibilities, and code reuse.
:::

## Zomes, DNAs, and hApps

### Zome

The smallest unit in a hApp is called a **zome** (a play on DNA chromosomes). It's the actual binary code that runs in Holochain's [WebAssembly](https://webassembly.org/) sandbox.

!!! info Why WebAssembly?

We chose WebAssembly because:

* A [number of languages](https://github.com/appcypher/awesome-wasm-langs) can already be compiled to WebAssembly, which we hope will mean Holochain can support many languages on the back end in the future (currently we only supply a back-end SDK for Rust.)
* It's small and fast --- it can get compiled to machine code for near-native speed.
* Holochain is written in Rust, and Rust has an excellent WebAssembly engine called [Wasmer](https://wasmer.io/) that works on all the major operating systems.
* It provides a secure sandbox to run untrusted code within.

!!!

A zome has access to Holochain via the **host API** and also exposes functions of its own. Some of these functions are **callbacks** and some of them you invent yourself to create your back end's API.

There are two kinds of zome:

* An **integrity zome** defines a set of data types --- your application's schema --- and validation rules for operations that create, update, or delete data of those types; in other words, your data model.
* A **coordinator zome** defines a set of functions for interacting with data, peers, and other coordinator zomes.

Zomes are usually created as pairs --- an integrity zome that defines a data model and a coordinator zome that defines functions for operating on this model. You don't have to do it this way though; coordinator zomes don't need an integrity zome if they don't manipulate data, or they can depend on multiple integrity zomes, or multiple coordinators can depend on the same integrity zome.

If you mean for your zomes to be reused by other projects, you can share them via a public Git repository or [crates.io](https://crates.io) (tag your crates with `#holochain` so others can find them).

[Read more on the Zomes page](/build/zomes/).

### DNA

One or more zomes are bundled into a **DNA**, including at least one integrity zome. When two or more agents install and run a DNA, a new peer-to-peer network is created among them to interact and store shared data.

**A DNA, and the network created for it, is uniquely defined by its integrity zomes, plus any modifiers.** The hash of the integrity zomes plus modifiers is called the **DNA hash**, and is the unique identifier for the network.

!!! info Why are coordinator zomes not included in the DNA hash?

Coordinator zomes are bundled with a DNA, but they don't contribute to its hash's uniqueness. That's because they don't constitute the 'rules of the game' for a network like integrity zomes do.

This means you can hot-swap coordinators as you fix bugs and add features, without changing the DNA hash and creating a new network, which we sometimes call **forking**. The only things that should cause a fork are changes to integrity code.

!!!

Because each DNA has its own separate peer network and data store, you can use the DNA concept to come up with creative approaches to [privacy](https://dialnet.unirioja.es/servlet/articulo?codigo=8036267) and access, separation of responsibilities, or data retention.

[Read more on the DNAs page](/build/dnas/).

### hApp {#happ}

One or more DNAs come together in a **hApp** (Holochain app). Each DNA fills a named **role** in the hApp, and you can think of it like a [microservice](https://en.wikipedia.org/wiki/Microservices).

Each agent generates their own public/private key pair when they install a hApp. Their public key acts as their **agent ID** which identifies them as a participant in all the networks created for all the DNAs in the hApp. When a DNA is activated, it's bound to this key pair and becomes a **cell**.

The hApp can specify two provisioning strategies for its DNAs:

* A cell can be instantiated at app installation time.
* A new cell can be **cloned** from an existing DNA at any time _after the hApp is installed_, with an optional limit on the number of clones.

A hApp can optionally include a web-based UI that supporting Holochain runtimes <!-- TODO: link --> can serve to the user.

!!! info A hApp always runs locally

The big difference with peer-to-peer stacks like Holochain is that **all the code** --- both the back end and the front end --- **runs on the devices of the participants themselves**.

That means that a DNA doesn't exist as some piece of code that runs 'out there somewhere' --- instead it runs from the perspective of an individual. DNA + agent = cell.

There can still be bots or system-level services that do automated tasks. Those functions just have to be handled by one of the agents, and that agent doesn't have to be a human.

!!!

[Read more on the hApps page](/build/happs/).

## Further reading

* Core Concepts: [Application Architecture](/concepts/2_application_architecture)