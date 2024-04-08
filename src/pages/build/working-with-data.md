---
title: Working With Data
tocData:
  - text: Graph data
    href: graph-data
---

## Graph data

Shared data in a Holochain application is stored as a graph database of nodes called **bases** connected by edges called **links**, along with special types of edges like **updates**. A base is identified by a 32-byte identifier, and may have data and metadata associated with it. There are four types of bases:

* An **entry** base has an arbitrary blob of bytes attached to it. The blob is given meaning by the application using an **entry type**, which is stored in the metadata of the **action** that wrote it to the graph database. Its identifier is the hash of the entry data.
* An **agent ID** base is a special type of entry that contains the public key of a participant in an application. Its identifier and its data are the same --- the public key itself.
* An **action** base has a data structure that stores metadata about the act of manipulating the graph, such as action type, authorship, and timestamp. Its identifier is the hash of the serialized action data.
* An **external reference** is the ID of a resource that exists outside the database, such as the hash of an IPFS resource or the public key of an Ethereum address. There's no data stored at it and it has no semantic meaning; it simply serves as an anchor to attach links to.

You can attach links to any of these base identifiers to create a one-to-many relationship, and you can use base identifiers as a field in any sort of entry to create a many-to-one relationship.

## Source chain