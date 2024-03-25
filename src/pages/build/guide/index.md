---
title: Holochain Build Guide
---

!!! note In progress
This guide is 'under construction', as we used to say in the early days of the web. Expect more content to be rapidly published in the first half of 2024.
!!!

::: coreconcepts-intro
This Build Guide organizes everything you need to know about developing Holochain applications into individual topics. Each topic page stands alone as a comprehensive guide to using a given feature or implementing a given functionality. There are lots of code examples which make it clear how to do something yet are generic enough to be universally useful. These examples may not cover every single use case, though, so we'll point you to the reference documentation often.
:::

## Working with data

Shared data in a Holochain application is stored as a graph database of **entry** nodes connected by **links**, plus a couple special types of data that can also be treated as nodes in the graph:

* An **action** records the act of manipulating an entry or link and contains metadata about the act, such as authorship and timestamp.
* An **agent ID** is the public key of a participant in an application.

* [Entries](entries/)