---
title: Holochain Build Guide
---

!!! note In progress
This guide is under construction. Expect more content to be rapidly published in the first half of 2025.
!!!

::: intro
This Build Guide organizes everything you need to know about developing Holochain applications into individual topics. Each topic page stands alone as a comprehensive guide to using a given feature or implementing a given functionality. There are lots of code examples which make it clear how to do something yet are generic enough to be universally useful. These examples may not cover every single use case, though, so we'll point you to the reference documentation often.
:::

## Holochain: a very brief overview

Holochain is a framework for building **peer-to-peer applications**, in which every participant runs the application code on their own device and connects directly to other participants (called their **peers**) to exchange data.

Holochain's first basic concept is the **agent**, which represents a human or automated participant in a peer-to-peer network. An agent identifies themselves with a self-generated public/private key pair, called their **agent ID**.

Holochain's second basic concept is the **DNA**, which is a chunk of application back-end code. When you write a Holochain application (which we call a **hApp**), you're writing code that runs sandboxed in a Holochain runtime (called a **conductor**) and responds to function calls from Holochain itself or from external processes such as a UI, system service, or other DNA on the same device, or another peer on the same network.

When an agent ID is bound to a **DNA**, the live DNA instance is called a **cell** and forms a network with other cells running the same DNA. This network is separate from all other networks formed by other DNAs.

Now that you've got some basic concepts and the terms we use for them, it's time to dive into application development.

## Application structure

::: topic-list
* [Overview](/build/application-structure/) --- an overview of Holochain's modularity and composability units
    * [Zomes](/build/zomes/) --- integrity vs coordinator, how to structure and compile
        * [Lifecycle Events and Callbacks](/build/callbacks-and-lifecycle-hooks/) --- writing functions that respond to events in a hApp's lifecycle
        * [Zome Functions](/build/zome-functions/) --- writing your hApp's back-end API
    * [DNAs](/build/dnas/) --- what they're used for, how to specify and bundle
    * [hApps](/build/happs/) --- headless vs UI-based, how to bundle and distribute
    * [Cloning](/build/cloning/) --- working with clones of a DNA
:::

## Working with data

::: topic-list
* [Overview](/build/working-with-data/) --- general concepts related to working with data in Holochain
* [Identifiers](/build/identifiers) --- working with hashes and other unique IDs
* [Entries](/build/entries/) --- defining, creating, reading, updating, and deleting data
* [Links, Paths, and Anchors](/build/links-paths-and-anchors/) --- creating relationships between data
* [Querying Source Chains](/build/querying-source-chains/) --- getting data from an agent's history
:::

## Using the host API

::: topic-list
* [Overview](/build/using-the-host-api/) --- accessing host features from a zome
* [Cell Introspection](/build/cell-introspection/) --- finding out info about the DNA, zome, agent, and calling context
* [Cryptography functions](/build/cryptography-functions/) --- key generation, signatures, hashing, and encryption
* [Miscellaneous host functions](/build/miscellaneous-host-functions/) --- system time, logging, randomness
:::

## Connecting the parts

::: topic-list
* [Overview](/build/connecting-the-parts/) --- zome calls, capabilities, and signals
* [Front end](/build/connecting-a-front-end/) --- establishing a WebSocket connection from JavaScript
* [Calling zome functions](/build/calling-zome-functions/) --- examples for front ends, cell-to-cell, and agent-to-agent
* [Capabilities](/build/capabilities/) --- how to manage access to a cell's zome functions
* [Signals](/build/signals) --- receiving notifications from cells
:::

## Validation

::: topic-list
* [Overview](/build/validation/) --- The purpose of validation in a hApp, abilities, requirements and constraints, determinism
* [Genesis Self-Check Callback](/build/genesis-self-check-callback/) --- Purpose and use cases
* [Validate Callback](/build/validate-callback/) --- Writing validation routines for various needs
* [`must_get_*` Host Functions](/build/must-get-host-functions/) --- Deterministically retrieving DHT data for use in validation
* [DHT operations](/build/dht-operations/) --- advanced details on the underlying data structure used in DHT replication and validation
