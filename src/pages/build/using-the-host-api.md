---
title: "Using the Host API"
---

::: topic-list
### In this section {data-no-toc}

* Using the Host API (this page)
    * hApp introspection (coming soon) --- finding out info about the DNA, zome, and agent
    * Cryptography functions (coming soon) --- key generation, signatures, hashing, random numbers, and encryption
    * [Miscellaneous host functions](/build/miscellaneous-host-functions/) --- system time, logging, randomness
:::

::: intro
Holochain hosts back-end code (**zomes**) in a WebAssembly virtual machine and provides a **host API** to them, which the **HDK** library makes easy to use. It allows agents to read and write data, interact with other cells, and access various other host features.
:::

## Accessing the host

Holochain creates a **sandbox** for zomes to run in, so they can't access the host computer's functionality directly. It exposes a minimal interface for data access, introspection, peer-to-peer interactions, and interop between code modules. You use the HDK (or a minimal subset, the HDI library) to access the host API. The sandbox is implemented as a WebAssembly host, and your zome is a WebAssembly guest.

!!! info Holochain doesn't expose standard WASM host APIs
Holochain's host API is a small feature set written explicitly for interacting with Holochain's feature set. It doesn't include the WebAssembly JavaScript API or the WebAssembly System Interface (WASI).
!!!

A lot of this is covered elsewhere already --- [Working with Data](/build/working-with-data/) and [Validation](/build/validation/) talk about data access functions, and [Connecting the Parts](/build/connecting-the-parts/) talks about interop.

There are a few other functions that don't fall into those categories, so we'll cover them here in three categories: **introspection**, **cryptography**, and **miscellaneous functions**.<!-- TODO: link as they're written -->