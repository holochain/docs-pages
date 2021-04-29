# Holochain Programming References

!!! warning "Under construction"
    This part of the documentation is under construction. For now we've provided some provisional resources.

## Rust HDK

When you write a Holochain application, the part that lives in Holochain is called a [DNA](../concepts/2_application_architecture/#layers-of-the-application-stack). It runs in a WebAssembly sandbox and talks to the host, or conductor, through the host API. The Rust HDK (Holochain Development Kit) makes it easy for you to write your DNAs in the Rust programming language.

* **[HDK reference (v0.0.100)](https://docs.rs/hdk/0.0.100/hdk/)**
* **[HDK introductory guide](https://github.com/holochain/holochain/blob/develop/crates/hdk/README.md)**

## Conductor APIs

The conductor exposes two RPC APIs over WebSocket interfaces:

* The **admin API** lets application front-ends control the conductor to install DNAs, create agent IDs, combine a DNA and an agent ID into a running cell, and activate application RPC interfaces.
* The **app API** lets front-ends call a running [cell](../glossary/#cell)'s functions and get information on the [DNA bundle](../glossary/#dna-bundle) that the cell belongs to.

For both of these APIs, you make an RPC call sending a MessagePack-serialized request to the conductor over WebSocket and listening for a response. On the interface that exposes the app API, you can also listen for [**signals**](../glossary/#signal) broadcast by cells.

* **[Admin API reference](/rustdoc/holochain_conductor_api/enum.AdminRequest.html)**
* **[App API reference](/rustdoc/holochain_conductor_api/enum.AppRequest.html)**
* **[Conductor admin and app SDK for JavaScript clients](https://github.com/holochain/holochain-conductor-api)**

## Conductor configuration

The conductor has a few settings that can (and should) be configured via a YAML config file. We've provided documentation of the internal structures that hold this config; if you can picture how to serialize this to YAML in your mind, you can write a config file! (We promise we'll produce a more readable config file guide soon.)

* **[ConductorConfig structure](/rustdoc/holochain_conductor_api/config/conductor/struct.ConductorConfig.html)**

## Binaries

There are two main binaries. You can run any of these on the command-line with the `--help` flag to get detailed documentation.

* **`holochain`** is the Holochain runtime, or [conductor](../glossary/#conductor).
* **`hc`** is an all-purpose developer tool that:
    * packages a [DNA manifest](../glossary/#dna-manifest) file and one or more [zomes](../glossary/#zome) (in WASM bytecode) into a [DNA bundle](../glossary/#dna-bundle)
    * creates and executes conductor configurations for a hApp
    * (more to come)