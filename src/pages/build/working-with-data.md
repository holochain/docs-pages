---
title: Working With Data
---

::: intro
Holochain is, at its most basic, a framework for building **graph databases** on top of **content-addressed storage** that are validated and stored by **networks of peers**. Each peer contributes to the state of this database by publishing **actions** to an event journal stored on their device called their **source chain**. The source chain can also be used to hold private state.
:::

## Entries, actions, and records: primary data

Data in Holochain takes the shape of a **record**. This record can store lots of different kinds of things, but the most important thing common to all records is the [**action**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/action/enum.Action.html): one participant's intent to manipulate their own state or the application's shared database state. All actions contain:

* The **agent ID** of the author
* A timestamp
* The type of action
* The hash of the previous action in the author's history of state changes, called their **source chain** (note: the first action in their chain doesn't contain this)
* The index of the action in the author's source chain
* The **weight** of the action, which is a calculation of the cost of storing the action and can be used for rate limiting

The other important part of a record is the **entry**. Not all action types have an entry to go along with them, but those that do are called **entry creation actions** and are the main source of data in an application.

You can think of your application's database in terms of records or entries, and both are useful for different use cases. But it's generally most useful to _think about a **record** (entry plus action) as the primary unit of data_. This is because the same entry written by two different participants (or even the same participant twice) is treated as one piece of data, but no two entry creation actions will ever be the same. So all records are guaranteed to be unique.

This makes conflict resolution easier in a distributed system where multiple participants are permitted to manipulate the same resource at the same time. It also gives you author and timestamp fields for free.

## Shared graph database

Shared data in a Holochain application is represented as a **graph database** of nodes connected by edges called **links**. Because the underlying storage mechanism is content-addressed storage in a **distributed hash table (DHT)**, a node is referred to by a 32-byte cryptographic identifier, its **address**.

An address has data and metadata associated with it. There are four types of addresses:

* An **entry** address stores an arbitrary blob of bytes, and is the hash of that blob. The blob is given meaning by the application using an **entry type**.
* An **agent ID** address is the public key of a participant in an application. Its data is the same as its address --- the public key itself.
* An **action** address stores action data for a record, and is the hash of the action data.
* An **external reference** is the ID of a resource that exists outside the database, such as the hash of an IPFS resource or the public key of an Ethereum address. There's no data stored at it and it has no inherent semantic meaning; it simply serves as an anchor to attach links to.

You can attach links to any of these addresses to create a one-to-many relationship, and you can use base identifiers as a field in any sort of entry to create a many-to-one relationship.

### Links

A link is a piece of metadata attached to an address, the **base address**, and points to another address, the **target**. It has a **link type** that gives it meaning in the application, as well as an optional **tag** that can store arbitrary application data and be filtered on in queries.

A link can still be created even if its base and target don't exist; the base and target are simply considered external references in this case.

### CRUD metadata

Holochain's graph DHT has a built-in concept of **create, read, update, and delete (CRUD)**. Since data can't be modified or deleted, these kinds of mutation are simulated using metadata on existing data that marks changes to its status.

The built-in CRUD model is simplistic:

* An **entry** can have multiple authors, and each individual act of authorship is recorded in separate entry creation actions. When an entry is retrieved, its default live action is the most recently authored one.
* An entry creation action and its entry data can be **updated** to point to replacements. You can think of these update pointers as graph edges similar to links. There's no built-in conflict resolution mechanism for multiple updates on the same resource; this creates a branching update model similar to Git and leaves room for app developers to create their own conflict resolution mechanisms if needed.
* An entry creation action can be **deleted**. By default, an entry is considered live until all its entry creation actions are deleted, at which point it's dead and isn't retrieved when asked for. A dead entry is live once again if new entry creation action authors it.
* A **links* can be created and deleted similar to an entry, but can't be updated.

This describes Holochain's default. You can always access the underlying data and metadata and implement your own CRUD model if you like.

### Public records of personal state

All actions from every participant become part of the application's shared graph database (although not all entries to; we'll get to that in a moment). Because every action has a reference to both its author and its previous action in the author's source chain, each participant's source chain can be considered a graph of their history.

## Individual participant state

All DHT data ultimately comes from the peers who participate in storing and serving it. Each piece of data comes a participant's source chain, which is an event journal that contains all the actions they've authored. These actions describe intentions to change either the DHT's state or their own state.

Every action becomes part of the shared DHT, but not every entry needs to. Most system-level actions are private. You can also mark an entry type as private, and its entry data will stay on the participant's device and not get published to the graph.

The actions that manipulate shared graph database state are:

* [**`Create`**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/prelude/struct.Create.html) adds an entry as a graph node, and adds the entry creation action to the entry as metadata.
* [**`Update`**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/prelude/struct.Update.html) does the same as `Create`, but also operates on an existing entry and its creation action, adding update pointers as metadata from the originals to their replacements.
* [**`Delete`**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/prelude/struct.Delete.html) adds a piece of metadata to an existing entry and its creation action, marking the entry creation action as dead. (The entry is live until all its entry creation actions are marked dead.)
* [**`CreateLink`**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/prelude/struct.CreateLink.html) adds a link from one graph node to another as metadata on the base node.
* [**`DeleteLink`**](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/prelude/struct.DeleteLink.html) marks an existing link and its link creation action as dead.

Every one of these action types, as well as other action types not mentioned, also adds the action itself to the database as a graph node.

Private entries are also stored via `Create`, `Update`, and `Delete` actions, but the entry data and action data are separate parts of the record; only the action gets published to the graph.

## Privacy

Each **DNA** within a Holochain application has its own network and DHT, isolated from all other networks and their DHTs. For each participant in a DNA, their source chain is separate from the source chains of all other DNAs they participate in. Within a DNA, all shared data can be accessed by any participant, but the only one who can access a participant's private entries is themselves.

A DNA can be **cloned**, creating a separate network, DHT, and set of source chains. This lets you use the same backend code to define private spaces within one application to restrict access to certain shared databases.

## Summary: multiple interrelated graphs

The shared DHT and the individual source chains are involved in multiple different but interrelated graphs --- the source chain contributes to the DHT's graph, and the DHT records source chain history. You can use as little or as much of these interrelated graphs as your application needs.

::: topic-list
### In this section {data-no-toc}

* [Entries](/build/entries/) --- creating, reading, updating, and deleting
:::