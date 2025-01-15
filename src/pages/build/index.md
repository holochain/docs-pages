---
title: Holochain Build Guide
---

!!! note In progress
This guide is under construction. Expect more content to be rapidly published in the second half of 2024.
!!!

::: intro
This Build Guide organizes everything you need to know about developing Holochain applications into individual topics. Each topic page stands alone as a comprehensive guide to using a given feature or implementing a given functionality. There are lots of code examples which make it clear how to do something yet are generic enough to be universally useful. These examples may not cover every single use case, though, so we'll point you to the reference documentation often.
:::

## Application structure

::: topic-list
* [Overview](/build/application-structure/) --- an overview of Holochain's modularity and composability units
    * [Zomes](/build/zomes/) --- integrity vs coordinator, how to structure and compile
        * [Lifecycle Events and Callbacks](/build/lifecycle-events-and-callbacks/) --- writing functions that respond to events in a hApp's lifecycle
        * [Zome Functions](/build/zome-functions/) --- writing your hApp's back-end API
:::

## Working with data

::: topic-list
* [Overview](/build/working-with-data/) --- general concepts related to working with data in Holochain
* [Identifiers](/build/identifiers) --- working with hashes and other unique IDs
* [Entries](/build/entries/) --- defining, creating, reading, updating, and deleting data
* [Links, Paths, and Anchors](/build/links-paths-and-anchors/) --- creating relationships between data
:::