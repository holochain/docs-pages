---
title: Holochain Build Guide
---

!!! note In progress
This guide is under construction. Expect more content to be rapidly published in the first half of 2024.
!!!

::: coreconcepts-intro
This Build Guide organizes everything you need to know about developing Holochain applications into individual topics. Each topic page stands alone as a comprehensive guide to using a given feature or implementing a given functionality. There are lots of code examples which make it clear how to do something yet are generic enough to be universally useful. These examples may not cover every single use case, though, so we'll point you to the reference documentation often.
:::

## Working with data

Shared data in a Holochain application is stored as a graph database of **bases** connected by **links**. A base is identified by a 32-byte identifier such as a hash or public key, and may have data and metadata associated with it. There are four types of bases:

* An **entry** is an arbitrary blob of bytes that is given meaning by your application.
    * An **agent ID** is a special type of entry that contains the public key of a participant in an application.
* An **action** records the act of manipulating the graph and contains metadata about the act, such as authorship and timestamp.
* An **external reference** is the ID of a resource that exists outside the database, such as the hash of an IPFS resource or the public key of an Ethereum address.

::: topic-list
### Topics

* [Entries](entries/) --- creating, reading, updating, and deleting
:::