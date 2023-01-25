---
title: Holochain Glossary
---

!!! info WIP
    This article is currently a work in progress and subject to frequent change.
    See the [changelog](../changelog) for details.
!!!

As you go through our documentation, you'll probably find some unfamiliar terms, or familiar ones used in surprising ways. Here are the definitions we use.

#### Action

A piece of data that represents a [record](#record) on an [agent](#agent)'s [source chain](#source-chain). Everything an [agent](#agent) does in an [application](#application) is expressed as one or multiple actions, recorded on their [source chain](#source-chain) as one or multiple [records](#record). That is, when the source chain records a piece of data, it's more accurate to say that it's recording the agent's _act_ of creating it. Actions link to the hash of their previous action, which creates a tamper-evident [journal](#journal) or [ledger](#ledger) of all their actions in an application.

#### Address

1. [DHT address](#dht-address)
2. [Transport address](#transport-address)

#### Address space

The entire range of possible [DHT addresses](#dht-address). This space is circular, meaning the last address is adjacent to the first address.

#### Agency

The power of an [agent](#agent) to act in their environment.

#### Agent

1. Anyone or anything acting with [agency](#agency), such as a human or bot.
2. An agent (see definition 1) who participates in a Holochain [network](#network) through their [cell](#cell).

#### Agent activity

Records of all the [source chain](#source-chain) [actions](#action) that an agent has published, along with any [warrants](#warrant) against them for malicious activity. An agent's [neighbors](#neighbor), as [peers](#peer) whose [agent addresses](#agent-address) are [near](#nearness) to theirs, are the [validation authorities](#validation-authority) for their agent activity data.

#### Agent activity operation

A [DHT operation](#dht-operation) produced by the author of a [source chain](#source-chain) [record](#record), notifying the [validation authorities](#validation-authority) for the author's [agent ID entry](#agent-id-entry) that they've published something.

#### Agent-centric

Describes any [distributed system](#distributed-system) that puts [agents](#agent) at the center of the design, giving them [agency](#agency) over their online identity and the data they create. Agent-centric systems are usually [decentralized](#decentralization) and use [public-key cryptography](#public-key-cryptography) to identify agents. [Git](https://git-scm.com), Holochain, [Dat](https://www.datprotocol.com/), and [Secure Scuttlebutt](https://scuttlebutt.nz) are highly agent-centric, while client/server and blockchain systems are less so.

#### Agent address

The address of an [agent ID](#agent-id) entry on the [DHT](#distributed-hash-table-dht), calculated from the agent's [public key](#public-key-cryptography). It is used in locating an agent's [transport address](#transport-address) for [gossiping](#gossip) and making [remote calls](#remote-call), and in calculating the proper [validation authority](#validation-authority) to send a [DHT operation](#dht-operation) to or receive a piece of [DHT data](#dht-data) from.

#### Agent ID

The public key of an [agent](#agent). It serves as their unique ID in any [DHT](#dht) they join (although an agent can create multiple IDs to use in different spaces if they like).

#### Agent ID entry

The entry associated with the third of the four [genesis records](#genesis-records) at the the beginning of an [agent](#agent)'s [source chain](#source-chain), which contains their [agent ID](#agent-id). The address of this entry is also the [agent's address](#agent-address) on the DHT.

#### Append-only

Any data structure that can only be written to. Once written, that data becomes 'immutable' (it can't be modified or deleted). An agent's [source chain](#source-chain) and the [DHT](#distributed-hash-table-dht) are both append-only.

#### App entry

An entity that holds application data. On the DHT, an app entry is created for every [new entry operation](#new-entry-operation), and [validation authorities](#validation-authority) who hold the entry also hold the [actions](#action) of all [agents](#agent) who have published that exact same entry as [metadata](#metadata), along with other metadata such as [links](#link). App entries are [deduplicated](#deduplication) but individual agents' writes of those entries are distinguished by their actions.

#### Application (app)

When we're talking about Holochain, 'app' is synonymous with [hApp](#holochain-application-happ), a collection of [back end](#back-end) and [front end](#front-end) components that comprise something a Holochain user can interact with.

#### Assigned capability grant

A [capability grant](#capability-grant) that only allows specified [agents](#agent) to call a [zome function](#zome-function) in the grantor's [cell](#cell).

#### Atomic commit

The guarantee that all [source chain](#source-chain) [commits](#commit) performed in one [zome function](#call) will succeed or fail together, similar to a database transaction. Failure can be caused by [validation](#validation) failure for an individual [record](#record) or a hardware I/O failure. It can also be caused by a prior atomic commit finishing and advancing the source chain [state](#state-transition) while the current function call is running, that is, between the time that the conductor creaetd the current function's [workspace](#workspace) and the time that it attempted to persist its own changes to the source chain.

#### Author

The [agent](#agent) who has written and [signed](#public-key-signature) a [record](#record) to their source chain.

#### Author grant

A [capability grant](#capability-grant) that allows anyone possessing the [source chain](#source-chain) [author](#author)'s private key to call any [zome function](#zome-function) in a [cell](#cell). The only callers that should possess this key are the agent's own [clients](#client) and other [bridged](#bridge) cells associated with the same [agent ID](#agent-id) in the same [conductor](#conductor).

#### Back end

When we're talking about Holochain, synonymous with one or more [DNAs](#dna) for a [hApp](#holochain-application-happ)---this is code that contains the base-level persistence and validation logic.

#### Blockchain

A [distributed](#distributed-system), partially [decentralized](#decentralization) system that promises [Byzantine fault tolerance](#byzantine-fault-tolerance-bft) by using a [global consensus](#global-consensus) protocol to get all nodes to agree on a single, shared history of events. This history is stored as a [hash chain](#hash-chain) of 'blocks', or bundles of [state transitions](#state-transition). A blockchain can be public (anyone can join) or permissioned/private (membership is controlled). Public blockchains are usually [trustless](#trustless), ensuring tamper-resistance by making cheating more costly than honesty.

#### Bootstrapping

The act of joining an application's [DHT](#distributed-hash-table-dht). Bootstrapping involves finding an initial group of peers to [gossip](#gossip) with, either by talking to a [bootstrap service](#bootstrap-service), injecting a list of known good peers, or other means appropriate to a particular [transport implementation](#transport-implementation).

#### Bootstrap service

A service which keeps track of lists of [transport addresses](#transport-address) for peers, segregated by [DNA](#dna) [hash](#hash). When an agent wants to [bootstrap](#bootstrapping) into an application's [DHT](#distributed-hash-table-dht), they ask the bootstrapping service for a list of existing peers and make individual connections to them.

#### Bridge

A connection between [cells](#cell) in one user's [conductor](#conductor), which allows one cell to call the [zome functions](#zome-function) of another cell.

#### Byzantine fault tolerance (BFT)

The ability of a [distributed system](#distributed-system) to reach [consistency](#consistency) despite 'Byzantine failures', which are data corruptions caused by accidental or intentional faults in [nodes](#node) or the networking transport between them.

#### Capability

A privilege granted by a [capability grant](#capability-grant) to call certain zome functions. The grantor can revoke this capability by [deleting](#delete-entry-action) the original grant from their [source chain](#source-chain).

#### Capability-based security

A security model that allows the owner of a resource to grant others access while maintaining ultimate control. Instead of allowing direct access to the resource, it mediates access and manages privileges by issuing 'capabilities', or tokens representing the resource. In Holochain, an [agent](#agent)'s [conductor](#conductor) protects their running [cells](#cell) and authorizes callers' access to them by issuing and checking the [secrets](#capability-secret) and credentials they supply against existing [grants](#capability-grant).

#### Capability grant

A [private](#private-entry) [system entry](#system-entry) that an [agent](#agent) writes to their [source chain](#source-chain) to record the granting of a [capability](#capability) and its access level, including the secret (if the grant is [transferrable](#transferrable-capability-grant) or [assigned](#assigned-capability-grant)) and the assignees (if the grant is assigned). If the access being granted is [unrestricted](#unrestricted-capability-grant), no secret or assignees are needed.

#### Capability grantor

The [agent](#agent) who creates a [capability grant](#capability-grant).

#### Capability claim

A [private](#private-entry) [system entry](#system-entry) that a [subject](#capability-subject) writes to their [source chain](#source-chain) to record the [secret](#capability-secret) they received for a [transferrable](#transferrable-capability-grant) or [assigned](#assigned-capability-grant) [capability grant](#capability-grant). This allows them to later call the [zome functions](#zome-function) to which access has been granted.

#### Capability secret

A secret series of bytes for a [capability grant](#capability-grant), created by the [grantor](#capability-grantor), which proves that its bearer has been granted a [capability](#capability) and is allowed to exercise it.

#### Capability subject

The entity that is given permission to access a resource via [capability-based security](#capability-based-security). In Holochain, this can be a [client](#client) or [bridged](#bridge) [cell](#cell) on the user's machine, or it can be another [agent](#agent) making a [remote call](#remote-call).

#### Cell

A particular Holochain [DNA](#dna) when it's bound to an [agent ID](#agent-id) and running in the [conductor](#conductor). DNA + agent = cell.

#### Centralization

The degree to which computing power, [agency](#agency), decision-making power, or responsibility in a [distributed system](#distributed-system) is concentrated in certain nodes. [Client/server](#client-server) systems are highly centralized, both in computer power and agency, while [cloud](#cloud) systems have decentralized computing power and centralized agency and [peer-to-peer](#peer-to-peer) systems have both decentralized computing power and agency. The complement of centralization is, of course, [decentralization](#decentralization).

#### Client

In Holochain terms, any piece of external software that accesses a [DNA](#dna)'s [zome functions](#zome-function). The client makes function calls over the [conductor](#conductor)'s [RPC interface](#rpc-interface), and can be a [GUI](#graphical-user-interface-gui), shell script, service, or scheduled task. This client usually lives on the same machine as the [conductor](#conductor), because it represents the user's [agency](#agency) in the application.

#### Client/server

A highly [centralized](#centralization) [distributed system](#distributed-system) architecture in which certain nodes are responsible for most of the processing, storage, and decision-making. Client/server systems typically give low [agency](#agency) to end-users.

#### Clone (DNA)

The act of modifying the properties of [DNA](#dna) at installation time in order to change its hash and create an isolated [network](#network) and [DHT](#distributed-hash-table-dht). This allows users to enjoy a private space using existing rules without creating a DNA from scratch.

#### Cloud

A specific [client/server](configuratin) in which computing power is [decentralized](#decentralization) but agency is [centralized](#centralization).

#### Commit

The act of adding a [record](#record) to a [source chain](#source-chain).

#### Commons

Any resource that is used and managed by a group of agents, but is owned by none. In order to survive, a commons must have rules governing its use. A Holochain [DHT](#distributed-hash-table-dht) is a type of digital commons whose rules are enforced by its [DNA](#dna) and Holochain's [subconscious](#subconscious) rules.

#### Conductor

The service that lives on an [agent](#agent)'s device and hosts all of their [cells](#cell), stores their data, makes their [zome functions](#zome-function) available to local [clients](#client) via an [RPC interface](#rpc-interface), and handles [network](#network) communication between their cells and other agents' cells.

#### Conductor admin API

The [RPC interface](#rpc-interface) that a [conductor](#conductor) exposes, which allows local [clients](#client) to access and manipulate the configuration of [DNAs](#dna), [agents](#agent), [cells](#cell), and RPC interfaces for communicating with individual cells.

#### Conflict-free replicated data type (CRDT)

A function that allows two [nodes](#node) in a [distributed system](#distributed-system) to separately make changes to the same piece of data without creating conflicts. A CRDT is [logically monotonic](#logical-monotonicity), which means it satisfies the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem) and doesn't need a [coordination protocol](#coordination-protocol). Holochain doesn't use CRDTs directly (yet), but we recommend considering using CRDTs in app design to handle the merging of different agents' data.

#### Consensus

1. Synonymous with [consistency](#consistency) in a [distributed system](#distributed-system).

2. Synonymous with [global consensus](#global-consensus) in a [blockchain](#blockchain) or other [DLT](#distributed-ledger-technology-dlt).

#### Consistency

The point at which all [nodes](#node) in a [distributed system](#distributed-system) agree on the state of the data they hold. [Blockchains](#blockchain) enforce a form of consistency called [global consensus](#global-consensus), whereas Holochain uses 'strong' [eventual consistency](#ventual-consistency).

#### Consistency/availability/partition-tolerance (CAP) theorem

This principle states that all [distributed systems](#distributed-system) are prone to 'partitions' (groups of nodes becoming unavailable to each other), and that in the presence of a partition a design can only guarantee availability (data can always be accessed and written) or [consistency](#consistency) (data is always correct), but not both.

#### Consistency as logical monotonicity (CALM) theorem

This principle states that as long as a function is [logically monotonic](#logical-monotonicity), it can be run on multiple [nodes](#node) in a [distributed system](#distributed-system) and reach strong [eventual consistency](#eventual-consistency) without needing [coordination protocols](#coordination-protocol). Holochain's DHT is CALM, in that every [DHT operation](#dht-operation) is simply accumulated without attempts to reconcile it with other operations. State is then determined by processing the accumulated data.

#### Content-addressable storage (CAS)

Any storage system that gives a unique ID to each piece of data and allows it to be retrieved by its ID rather than its physical location. A [DHT](#distributed-hash-table-dht) is a type of CAS.

#### Coordination protocol

An algorithm that governs the synchronization of data in a [distributed system](#distributed-system) and aims to prevent or resolve data conflicts that happen when two [nodes](#node) are out of sync with each other. Any [state transition](#state-transition) that isn't [logically monotonic](#logical-monotonicity) needs a coordination protocol. In Holochain, [counterparty signing](#counterparty-signing) is a simple coordination protocol between two or more agents who want to reach agreement with each other.

#### Counterparty signing

A simple [coordination protocol](#coordination-protocol) between two [agents](#agent) in a Holochain [DHT](#distributed-hash-table-dht) in which they agree to lock their respective [source chain](#source-chain) [states](#state-transition), reach [consistency](#consistency) on the contents of each other's source chain, and sign one single shared entry which they then [commit](#commit) to their source chains. Counterparty signing is not yet directly supported by Holochain but will be in the future.

#### Create-entry action

A [new-entry action](#new-entry-action) that, when published to the [DHT](#distributed-hash-table-dht), causes an [entry](#entry) to be available to other DHT members (unless the entry is [private](#private-entry), in which case only a record of its creation is published). 

#### Create-link action

An [action](#action) that, when published to the [DHT](#distributed-hash-table-dht), causes a [link](#link) from one piece of [record data](#record-data) to another to be available to other DHT members.

#### Create, read, update, delete (CRUD)

The four main [actions](#action) an application needs to do with data. Even though all data structures in Holochain are [append-only](#append-only), data can still be marked as updated or deleted by publishing a new action that marks the old data as modified in a [CALM](#consistency-as-logical-monotonicity) way. [New-entry actions](#new-entry-action) create and/or update entries, while [delete-entry actions](#delete-entry-action) remove them. [Links](#link) can also be created and deleted.

#### CRUD action

A [record](#record) that expresses a [CRUD](#create-read-update-delete-crud) operation on a piece of data or metadata. [Create-entry](#create-entry-action), [update-entry](#update-entry), [delete-entry](#delete-entry-action), [create-link](#create-link-action), and [delete-link](#delete-link-action) actions are all CRUD actions.

#### Dead data

As no data in a Holochain [DHT](#distributed-hash-table-dht) or [agent's](#agent) [source chain](#source-chain) are ever deleted, existing data must be marked as no longer active. Dead data takes four forms:

1. A [new-entry action](#new-entry-action) action that has been marked as deleted by a [delete-entry action](#delete-entry-action).
2. A [create-link action](#create-link-action) action that has been marked as deleted by a [delete-link action](#delete-link-action).
3. An [entry](#entry) whose new-entry action actions have all been marked as deleted.
4. A [link](#link) whose create-link action actions have all been marked as deleted.

#### Decentralization

The act of removing central points of control. Many [distributed systems](#distributed-system) are decentralized to various degrees.

#### Deduplication

The removal of identical entries in a [CAS](#content-addressable-storage-cas). Most CASes, including Holochain's [DHT](#distributed-hash-table-dht), deduplicate content automatically. Holochain's DHT does, however, disambiguate between individual _writes_ of an [entry](#entry) by storing the [authors'](#author) [actions](#action) alongside it as [metadata](#metadata).

#### DeepKey

Holochain's default implementation of a [DPKI](#distributed-public-key-infrastructure-dpki).

#### Delete-entry action

An [action](#action) that, when published to the DHT, causes a [new-entry action](#new-entry-action)'s [action](#action) to be marked as [dead](#dead). If all such actions that caused an [entry](#entry) to be published are marked as dead, the entry itself will also be marked as dead.

#### Delete-link action

An [action](#action) that, when published to the DHT, causes a [create-link action](#create-link-action)'s [action](#action) to be marked as [dead](#dead). If all create-link records that caused a [link](#link) to be published are marked as dead, the link itself will also be marked as dead.

#### DHT address

The unique ID of a piece of [record data](#record-data) ([entry](#entry), [action](#action), or [agent](#agent)) on the [DHT](#distributed-hash-table-dht). Every piece of data has an address that is generated directly from its content, usually by a [hash](#hash) function. This makes the DHT a [content-addressable storage](#content-addressable-storage-cas) system.

#### DHT data

A piece of data that lives in the [DHT](#distributed-hash-table-dht). DHT data is assigned to a [neighborhood](#neighborhood) of [validation authorities](#validation-authority) based on the base [address](#address) of the [DHT operation](#dht-operation) that expresses its creation, and is [deduplicated](#deduplication). All DHT data is either [record data](#record-data) with an address of its own, or [metadata](#metadata) attached to a piece of record data.

#### DHT operation

A unit of [gossip](#gossip) that communicates a request to a [validation authority](#validation-authority) to transform the data they hold in some way. Each DHT operation has a base [address](#address) and gets sent to the DHT authorities for that address. For each type of [record](#record)/[action](#action), an [author](#author) produces one or more DHT operations. For example, a [create-entry action](#create-entry-action) for a [public entry](#public-entry) produces three DHT operations:

* One to publish the [action](#action), which is sent to the authorities for the action's address for validation and storage,
* One to publish the entry itself, which is sent to the authorities for the entry's address along with a copy of the action, and
* One to register [agent activity](#agent-activity-operation), which is sent to the authorities for the author's agent ID (that is, the author's [neighbors](#neighbor)).

#### Distributed hash table (DHT)

A collection of data stored collectively by many [nodes](#node) in a [peer-to-peer](#peer-to-peer) network. In a DHT, a node retrieves data by address, usually its cryptographic [hash](#hash), by searching for a [peer](#peer) who holds the data. Holochain uses a [validating DHT](#validating-dht) to store [DHT data](#dht-data) and chooses agents to hold data based on the [nearness](#nearness) of their [agent address](#agent-address) to the data's address. Each [DNA](#dna) has its own separate DHT.

#### Distributed ledger technology (DLT)

Any technology that involves many [nodes](#node) in a distributed system sharing an [append-only](#append-only) history of [state transitions](#state-transition). [Blockchain](#blockchain) DLTs use a [global ledger](#global-ledger), whereas others use some form of [sharded](#sharding) or partially connected ledgers. Holochain is a type of DLT in which each [agent](#agent) is responsible for their own ledger, called a [source chain](#source-chain).

#### Distributed public key infrastructure (DPKI)

A [public key infrastructure](#public-key-infrastructure-pki) that doesn't rely on a central authority. [DeepKey](#deepkey) is Holochain's default DPKI implementation.

#### Distributed system

Any system that involves multiple [nodes](#node) talking to one another over a network, whether [decentralized](#decentralization) or [centralized](#centralization). Because communication isn't instantaneous, different nodes can create conflicting data. Many distributed systems use a [coordination protocol](#coordination-protocol) to come to [consistency](#consistency), while others rely on the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem) to avoid conflicts altogether.

#### DNA

A package of executable code that defines the shared 'rules of the game' for a group of agents. A DNA is made up of [zomes](#zome), which define [validation rules](#validation-rule) for data, [zome functions](#zome-function) that allow agents to write to their [source chain](#source-chain), retrieve data from the [DHT](#distributed-hash-table-dht), send [signals](#signal) to a listening [client](#client), or make [remote calls](#remote-call) to another [cell](#cell). Each DNA has its own isolated DHT, and is instantiated by each user on their own device as a cell.

#### DNA bundle

The file that holds a complete [DNA](#dna), both executable [zomes](#zome) and metadata (see [DNA manifest](#dna-manifest) for details on this metadata).

#### DNA instance

See [cell](#cell).

#### DNA manifest

A file that specifies the components of a [DNA](#dna), including locations of compiled [zomes](#zome) and metadata such as a name, description, [hashspace UID](#hashspace-uid), and [properties](#dna-properties). This manifest can be used by a compilation tool to build a [DNA bundle](#dna-bundle).

#### DNA properties

Arbitrary data that affects the operation of the [DNA](#dna). A user can specify properties at DNA installation time, which causes the DNA to be [cloned](#clone-dna) if the user-specified properties are different from the default properties. The executable code can then access those properties to change its behavior, similar to configuration files or environment variables. This is a simple way of allowing separate [networks](#network) of users to enjoy isolated and slightly modified experiences using a set of base rules.

#### End-to-end encryption (E2EE)

A channel between two nodes in a public network that allows them to transfer secret messages that cannot be decrypted by eavesdroppers. Holochain's node-to-node [gossip](#gossip), [remote calls](#remote-call), and [proxy relay](#proxy-relay) use E2EE (currently [QUIC](https://en.wikipedia.org/wiki/QUIC) with TLS encryption).

#### Entry

A basic unit of user data in a Holochain app. Each entry has its own defined [entry type](#entry-type). When an agent commits an entry, it is combined with an [action](#action) into a [record](#record) that expresses a [new-entry action](#new-entry-action). Then it is written to their [source chain](#source-chain) as a record of the action having taken place. An entry can be [public](#public-entry) or [private](#private-entry); if it's public, it's also [published](#publish) to the [DHT](#distributed-hash-table-dht). There are [app entries](#app-entry) whose purpose and structure are defined by the [DNA](#dna) developer, and there are special [system entries](#system-entry) such as an [agent ID entry](#agent-id-entry).

#### Entry type

A specification for any sort of entry that a [DNA](#dna) should recognize and understand, similar to an <abbr title="object-oriented programming">OOP</abbr> class or database table schema. It can specify whether entries of its type should be [public](#public-entry) or [private](#private-entry), and how many [required validations](#required-validation) should exist. DNA developers create their own entry types for the data their app needs to store, and can write [validation functions](#validation-function) for [records](#record) that [create, update, or delete](#create-read-update-delete-crud) entries of those types.

#### Eventual consistency

A promise made by distributed systems that optimize for availability over consistency (see [CAP theorem](#consistency-availability-partition-tolerance-cap-theorem)), meaning that given enough time, every [node](#node) ought to eventually reach [consistency](#consistency) with each other. _Strong_ eventual consistency means that nodes will eventually reach consistency _without conflicts_, which is possible for any system whose [state transition](#state-transition) functions adhere to the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem).

#### Fork (DNA)

To change a [DNA](#dna) in a way that doesn't alter its behavior, resulting in a new hash for the DNA that gives it a separate [DHT](#distributed-hash-table-dht). Forking is most easily done by passing a [hashspace UID](#hashspace-uid) at DNA installation time.

#### Fork (source chain)

To create alternate versions of one's history in an app by basing two [source chain](#source-chain) [records](#record) on one parent record. Forking one's source chain is always an [invalid](#validation) action, detected at the [subconscious](#subconscious) level by the author's [agent activity](#agent-activity) [authorities](#validation-authority) and addressed by both the subconscious and the [DNA](#dna)'s executable code ([zomes](#zome)).

#### Front end

In Holochain terms, synonymous with [graphical user interface](#graphical-user-interface-gui) or, more generally, [client](#client).

#### Genesis records

The four records at the beginning of an [agent](#agent)'s [source chain](#source-chain), consisting of:

1. The [DNA](#dna) hash, which shows that the agent has seen the network's rules and agrees to abide by them,
2. The [membrane proof](#membrane-proof), which the agent presents as a claim that they should be allowed to join the DHT,
3. The [agent ID](#agent-id), which advertises the agent's [public key](#public-key-cryptography),
4. The [init complete record](#init-complete-record), which tells the conductor that all the DNA's [init callbacks](#init-callback) have completed successfully and the source chain is ready to write [app entries](#app-entry).

#### Global consensus

Agreement among all [nodes](#node) in a [blockchain](#blockchain) on a single, shared [global ledger](#global-ledger). Holochain prefers 'local' consensus, both between interacting parties using [counterparty signatures](#counterparty-signature) and among a small set of third-party [validation authorities](#validation-authority).

#### Global ledger

A [ledger](#ledger) whose contents are identical across all [nodes](#node) in a [blockchain](#blockchain).

#### Gossip

A protocol used by many [peer-to-peer](#peer-to-peer) networks to rapidly propagate data. Each [node](#node) knows a few other nodes, who know a few more, and so forth. Whenever any node receives a message, they broadcast it to some or all of their peers. Data propagates slowly at first, then spreads at an exponential rate. Nodes in a Holochain [network](#network) share [DHT operations](#dht-operation), [neighborhood](#neighborhood) health, and peer [transport addresses](#transport-address) via gossip.

#### Graphical user interface (GUI)

A [client](#client) that presents a visual, easy-to-understand way for a user to interact with a [cell](#cell) or collection of cells running in their [conductor](#conductor). As with any client of a Holochain application, the GUI usually runs on the same machine as the conductor.

#### hApp bundle

One or more [DNA](#dna)s, which together form the [back end](#back-end) for a complete [hApp](#holochain-application-happ). These components are specified in a [hApp manifest](#happ-manifest) file, and can be packaged in a zip archive along with the manifest or downloaded separately from the internet.

#### Hash

A unique 'fingerprint' for a piece of data, calculated by running the data through a special function. A hash can serve as a unique identifier for that data (such as with [addresses](#address) of [DHT entries](#dht-entry)) and makes it easy to retrieve data from a hash table and verify its integrity.

#### Hash chain

An [append-only](#append-only) data structure that can be used as a tamper-evident, sequential log of events, such as a [source chain](#source-chain) or [blockchain](#blockchain).

#### Hashspace UID

A unique ID, specified in a DNA bundle file or passed at DNA installation time, that [forks](#fork) the DNA without modifying any of its behavior. This can be used to create separate [DHTs](#distributed-hash-table-dht) that use the same set of rules.

#### History

The sequence of [actions](#action) taken by an [agent](#agent), recorded as [records](#records) in their [source chain](#source-chain).

#### Holo

The company funding the development of [Holochain](#holochain) and providing [hosting services](#holo-host) for Holochain apps.

#### Holochain Development Kit (HDK)

Holochain's standard software development kit (SDK) for [DNA](#dna) developers. It provides developer-friendly access to the [Holochain host API](#holochain-host-api), as well as macros for defining [entry](#entry) and [link](#link) types, [validation functions](#validation-function), and [init functions](#init-function).

#### Holochain application (hApp)

A collection of [DNAs](#dna) and a [client](#client) (or clients) that allow users to interact with those DNAs. The DNA components are typically distributed as a [DNA bundle](#dna-bundle).

#### Holochain Core

The basic components of Holochain---the [conductor](#conductor), the [nucleus](#nucleus)/[ribosome](#ribosome), and the persistence and networking layers.

#### Holochain host API

The set of core functions that Holochain's [nucleus](#nucleus) makes available to a [ribosome](#ribosome), so the ribosome can in turm make them available to a running [cell](#cell). These functions allow the DNA to access and manipulate an [agent](#agent)'s [source chain](#source-chain), run cryptographic functions, retrieve and publish [DHT data](#dht-data), [bridge](#bridge) to the agent's other cells, and make [remote calls](#remote-call) to their [peers](#peer).

#### Holo Host

A platform and marketplace where Holochain users offer their spare computing capacity to host [cells](#cell) for web users, functioning as a bridge between Holochain and the traditional web. Read more at [Holo's website](https://holo.host/host/).

#### Host API

See [Holochain host API](#holochain-host-api).

#### Immune system

A property of Holochain's [validating DHT](#validating-dht), whereby healthy [nodes](#node) detect invalid data, share proof of corruption among their peers, and take defensive action against the corrupt nodes that produced it by publishing [warrants](#warrant) against them. While each agent is individually free to interact with a peer with warrants attached to their [agent ID](#agent-id), most agents will refuse to interact or gossip with them. The cumulative effect is a collective rejection of the corrupt nodes (see [mutual sovereignty](#mutual-sovereignty)).

#### Init callback

A function in a [DNA](#dna) that the [nucleus](#nucleus) calls when an [agent](#agent) starts a [cell](#cell) for the first time. This can be used to set up initial [source chain](#source-chain) [#state](#state-transition), etc.

#### Init complete record

A [record](#record) that Holochain automatically writes to an [agent](#agent)'s [source chain](#source-chain) to indicate that all of a [DNA](#dna)'s [init callbacks](#init-callback) have successfully run and their [cell](#cell) is ready to use.

#### Intrinsic data integrity

Holochain's most basic strategy for guaranteeing data integrity. Data is considered valid or invalid based on the [DNA](#dna)'s [validation rules](#validation-rule), as well as Holochain's [subconscious](#subconscious) validation rules.

#### Journal

Synonymous with [ledger](#ledger).

#### Ledger

A history of events or [state transitions](#state-transition). In [distributed ledger technology](#distributed-ledger-technology-dlt), ledgers are usually stored as [hash chains](#hash-chain), such as a Holochain [agent](#agent)'s [source chain](#source-chain).

#### Link

A piece of [metadata](#metadata) connecting one [address](#address) on the [DHT](#distributed-hash-table-dht) to another. Each link has a [tag](#link-tag) for storing arbitrary content and is stored in the DHT at its [base](#link-base)'s [address](#address).

#### Link base

The [address](#address) of the [record data](#record-data) on the DHT that a [link](#link) links from.

#### Link tag

An arbitrary piece of data, stored with a [link](#link), that contains application-defined information. A link tag can define an ad-hoc type for the link, be used in a query filter, or store information about the [link target](#link-target) to avoid a second [DHT](#distributed-hash-table-dht) query to retrieve the target's content.

#### Link target

The [address](#address) of the [record data](#record-data) on the DHT that a [link](#link) links to. Link targets have no metadata pointing back to the [base](#link-base), and therefore have no knowledge that they're being linked to.

#### Live data

[DHT data](#dht-data) or [source chain](#source-chain) data that meets two criteria:

* It's been [validated](#validation) and found valid.
* Its [CRUD status](#crud-status) doesn't mark it as [dead](#dead-data).

#### Logical monotonicity

The property of a set of facts whereby the truth of prior facts are never negated by the addition of later facts. [CALM](#consistency-as-logical-monotonicity-calm) relies on functions that exhibit this property. For example, Holochain's [source chain](#source-chain), [DHT](#distributed-hash-table-dht), and [CRUD actions](#crud-action) only add new data without removing old data.

#### Membrane

One of two types of permeable boundaries that allow or disallow access:

1. The layer of protection around an [agent](#agent)'s [cell](#cell), secured by [capability-based security](#capability-based-security), that prevents unauthorized access to the cell's [zome functions](#zome-function), [source chain](#source-chain) data, or view of the [DHT](#distributed-hash-table-dht).

2. A special [validation function](#validation-function) in a [DNA](#dna) that checks an agent's [membrane proof](#membrane-proof) and determines their right to become part of the DNA's [network](#network). If a joining proof is invalid, existing members of the network will refuse to talk to the new agent.

#### Membrane proof

A [record](#record) written to an agent's [source chain](#source-chain) that proves they have permission to join a [DHT](#distributed-hash-table-dht), for example, an invite code or signed authorization from an existing member. The [DNA](#dna) for the DHT has a [validation function](#validation-function) that checks the validity of the joining proof; if agents validating the joining proof determine that it's invalid, they can refuse to communicate with the new agent. This is the [immune system](#immune-system)'s first line of defense against malicious actors.

#### Metadata

Supplementary data attached to a piece of [record data](#record-data) on a [DHT](#distributed-hash-table-dht). All record data ([entries](#entry) and [actions](#action)) can have [links](#link) and [CRUD status](#crud-status) as metadata, while entries can also have copies of the actions that express the [new-entry actions](#new-entry-action) that created them. An [agent ID entry](#agent-id-entry) can also have [agent activity](#agent-activity) records and [warrants](#warrant).

#### Microservice

An application architecture pattern that encourages small, single-purpose [back end](#back-end) services. Holochain [DNAs](#dna) can be seen as microservices that combine to form a fully featured [hApp](#holochain-application-happ).

#### Mutual sovereignty

The relationship between the autonomy of the individual and the collective intentions of the group. A successful [commons](#commons) finds a healthy tension between these opposites. Holochain's design is based on this principle, empowering [participants](#participant) to control their own identity and responses to their peers by equipping each of them with a full copy of the application. The application constitutes the group's rules and norms, formalized as executable code in its [DNA](#dna) modules, so by running the application a participant consents to become a member of the group.

#### Nearness

The mathematical distance between two [addresses](#address) to each other in the [DHT](#distributed-hash-table-dht)'s [address space](#address-space).

#### Neighbor

See [neighborhood](#neighborhood).

#### Neighborhood

A range of [DHT addresses](#dht-address) about which a [node](#node) knows everything they ought to know. Neighbors collectively support the [resilience](#resilience) of all [DHT data](#dht-data) whose [address](#dht-address) is within their respective [store arcs](#store-arc) by storing and [validating](#validation) it and [gossiping](#gossip) it to each other. They also have a wider neighbourhood of nodes they can talk to to receive authoritative data, defined by their [query arc](#query-arc).

#### Network

In Holochain terms, a collection of [nodes](#node) [gossiping](#gossip) with each other to form a [validating DHT](#validating-dht), aiding in data storage and retrieval, [validation](#validation), and peer discovery. Each [DNA](#dna) has a separate network.

#### New-entry action

Any [action](#action) that produces a new entry, either a [create-entry](#create-entry-action) or [update-entry](#update-entry-action) action. If the entry's [type](#entry-type) is [public](#public-entry), the entry will be published to the [DHT](#distributed-hash-table-dht) along with its [action](#action). If the entry's type is [private](#private-entry), only the action is published.

#### Node

An individual [agent](#agent) in a Holochain [network](#network) who has an [agent address](#agent-address) and can be talked to via [gossip](#gossip).

#### Nucleus

The core of Holochain. With the help of the [ribosome](#ribosome), it governs data flow between the [conductor](#conductor) and a [cell](#cell) and enforces the [subconscious](#subconscious) [validation rules](#validation-rule).

#### Participant

Synonymous with 'user'. We often prefer the term 'participant' because a Holochain [DHT](#distributed-hash-table-dht) is a [commons](#commons) of [mutually sovereign](#mutual-sovereignty) peers who all actively work to maintain its integrity, rather than people who merely 'use' an application.

#### Peer

Synonymous with [node](#node) or [agent](#agent); describes an agent who belongs to the same [network](#network) as another.

#### Peer discovery

The act of finding peers to communicate with. Initial discovery is done by [bootstrapping](#bootstrapping), and ongoing peer discovery is handled by [DHT](#distributed-hash-table-dht) lookups and [gossip](#gossip).

#### Peer-to-peer

Describes any highly [decentralized](#decentralization) [distributed system](#distributed-system) in which [nodes](#node) talk directly to one another without the intermediation of a [server](#client-server) or other type of [central](#centralization) node.

#### Private entry

An [entry](#entry) which is stored on an [agent](#agent)'s [source chain](#source-chain), but not [published](#publish) to the [DHT](#distributed-hash-table-dht).

#### Proxy relay

A special software service that helps two Holochain nodes behind restrictive firewalls or NATs communicate with each other. The proxy is blind to the [end-to-end-encrypted](#end-to-end-encryption-e2ee) communications it's relaying; it only knows how to receive and route messages on behalf of an [agent](#agent) it's proxying for.

#### Public entry

An [entry](#entry) whose [type](#entry-type) is marked 'public' and is [published](#publish) to the [DHT](#distributed-hash-table-dht).

#### Public-key cryptography

A cryptographic system that consists of two keys, a public component and a private component. These keys are mathematically related to each other in a way that's easy for the key pair's owner to prove, but nearly impossible for a third-party to reverse-engineer. In Holochain, an [agent](#agent)'s public key lives in the [DHT](#distributed-hash-table-dht) and serves as their [ID](#agent-id) while the private key stays on the agent's device. [Peers](#peer) can verify an agent's claim of authorship on [published](#publish) [DHT data](#dht-data) by checking their [signature](#public-key-signature), and can use an agent's public key to encrypt a private message that only the holder of the corresponding private key can decrypt.

#### Public-key infrastructure (PKI)

A way for agents to share their public keys, prove their authenticity, and revoke old keys if they've been compromised. Most PKIs, such as the global TLS certificate authority system, are centralized. Holochain will provide a [distributed PKI](#distributed-public-key-infrastructure-dpki) system.

#### Public-key signature

The hash of a piece of data, encrypted with a private key. It can be decrypted by anyone who has a copy of the public key, which allows them to verify authorship of the signed data. In Holochain, the [author](#author) of any [record data](#record-data) that gets published to the [DHT](#distributed-hash-table-dht) attaches their signature to each of the [DHT operations](#dht-operation) they produce, to prove authorship and allow third-party tampering to be detected by others.

#### Public/private key pair

See [public-key cryptography](#public-key-cryptography).

#### Publish

The act of converting a [record](#record) into one or more [DHT operations](#dht-operation) and sending them to the respective [validation authorities](#validation-authority) for [validation](#validation), transformation into [record data](#record-data) and storage. This happens after it has passed the author's own copy of the [validation rules](#validation-rule). The validation authorities who are responsible for that entry's [address](#address) receive it, validate it, and if it's valid, store a copy of it and pass a [validation receipt](#validation-receipt) back to the author.

#### Query arc

A range of [DHT addresses](#dht-address) for which an [agent](#agent) knows a sufficient number of [peers](#peer) who collectively have fault-tolerant coverage (see [saturation](#saturation)) of that range. An agent knows that they can request [DHT data](#dht-data) from anyone within this query arc and get a reasonably authoritative answer (making allowances for [eventual consistency](#eventual-consistency)). This query arc is a looser [neighborhood](#neighborhood) than a [store arc](#store-arc).

#### Record

The data structure that holds an [action](#action) in an [agent](#agent)'s [source chain](#source-chain). Some records are a combination of [action](#action) and [entry](#entry), such as [new-entry actions](#new-entry-action), while others contain all their data inside the action.

#### Record data

Any piece of [address](#address)able data that can (though doesn't need to) be published to the [DHT](#distributed-hash-table-dht). Record data consists of anything contained in a [record](#record) --- that is, an [action](#action) or an [entry](#entry), which are stored by separate [validation authorities](#validation-authority) on the DHT. This is in contrast to [metadata](#metadata), which is attached to a piece of record data.

#### Remote call

A [remote procedure call](#remote-procedure-call) that one agent's [cell](#cell) makes to [the zome functions](#zome-function) of another agent's cell within a [network](#network). The callee controls access to their zome functions via [capability-based security](#capability-based-security).

#### Remote procedure call (RPC)

1. A call that a [client](#client) makes to a [zome function](#zome-function) or [conductor admin API](#conductor-admin-api) function over a local socket interface.
2. A [remote call](#remote-call) between [agents](#agent) in a [network](#network).

#### RPC interface

A network port that the [conductor](#conductor) exposes, allowing [clients](#client) to call the [conductor admin API](#conductor-admin-api) or make [zome function](#zome-function) calls to running [cells](#cell). This interface only listens for local connections, so it can't be accessed over the internet.

#### Required validations

The number of [validation receipts](#validation-receipt) that a [record](#record) of a given [entry type](#entry-type) must have in order to be considered accepted by the [validation authorities](#validation-authority) and be 'live' on the [DHT](#distributed-hash-table-dht). On initial [publish](#publish), the author of a record collects these receipts; thereafter, validation authorities gossip these receipts to each other. If the author can't collect the required number of receipts, it'll try to republish to more authorities later.

#### Resilience

The level of a [network](#network)'s capacity to hold itself in integrity as [nodes](#node) leave, join, or attempt to attack it. In a Holochain [DHT](#distributed-hash-table-dht), [neighbors](#neighbor) attempt to collaboratively adjust their [store arcs](#store-arc) to ensure that every piece of data is covered by enough [validation authorities](#validation-authority) to make it always available.

#### Ribosome

The 'sandbox' or 'virtual machine' inside which a [cell](#cell) runs. In Holochain's current design, the ribosome is a [WebAssembly](#webassembly-wasm) runtime that exposes Holochain's [host API](#holochain-host-api) to the cell and allows the [nucleus](#nucleus) to call the instance's [validation functions](#validation-function), [init function](#init-function), [zome functions](#zome-function) and other exposed functions.

#### Rust

The programming language currently used to build Holochain Core and [DNAs](#dna)/[zomes](#zome). See [Rust website](https://www.rust-lang.org/).

#### Saturation

The state at which there are enough [peers](#peer) holding a piece of [DHT data](#dht-data) to make sure it's reliably available to anyone who asks for it (see [resilience](#resilience)).

#### Scenario test

An automated test that simulates real-life conditions involving multiple [agents](#agent) on a simulated or real [network](#network), used to test a [DNA](#dna)'s tolerance of various failure modes. [Tryorama](#tryorama) is used to write scenario tests in JavaScript.

#### Sharding

A process of reducing the processing and storage load of individual [nodes](#node) in a [distributed system](#distributed-system) by distributing data and/or work among them. While some sharded systems such as [Ethereum 2](https://ethereum.org/en/eth2/) separate nodes into discrete shards, Holochain's [DHT](#distributed-hash-table-dht) separates them into overlapping [neighborhoods](#neighborhood).

#### Signal

A message emitted by a [cell](#cell), meant for a [client](#client) to receive and act upon.

#### Source chain

A [hash chain](#hash-chain) of [records](#record) committed by an [agent](#agent). Every agent has a separate source chain for each of the [cells](#cell) they're running, which stores all of the [actions](#action) they've taken in that cell.

#### State transition

A modification of application state. In Holochain, all state transitions are recorded as [records](#record) in an [agent](#agent)'s [source chain](#source-chain) that represent the [actions](#action) of [creating, updating, and deleting](#create-read-update-delete-crud) data and metadata. If the data is meant to be [public](#public-entry), they are then [published](#publish) to the [DHT](#distributed-hash-table-dht) as a set of [DHT operations](#dht-operation) that are sent to the appropriate [validation authorities](#validation-authority) for [validation](#validation), processing, and storage.

#### Subconscious

The 'base' [validation rules](#validation-rule) defined by the Holochain [nucleus](#nucleus) that check validity of [DHT operations](#dht-operation) and the integrity of each [agent](#agent)'s [source chain](#source-chain).

#### Store arc

A range of [DHT addresses](#dht-address) for which an agent claims [authority](#validation-authority) --- that is, responsibility to [validate](#validation), store, and [gossip](#gossip) all [DHT data](#dht-data) whose addresses fall within the arc. This store arc is an agent's closest [neighborhood](#neighborhood) in which they know everything that's going on, as compared to a [query arc](#query-arc) in which they merely know who exists and what range of addresses they claim authority for.

#### System entry

A type of [entry](#entry) that Holochain itself understands. System entries can be [created](#create-entry-action), [updated](#update-entry-action), and [deleted](#delete-entry-action) just like [app entries](#app-entry). The system entry types currently defined are:

* [Agent ID entry](#agent-id-entry)
* [Capability grant entry](#capability-grant)
* [Capability claim entry](#capability-claim)

#### Transferrable capability grant

A [capability grant](#capability-grant) that allows any caller who can produce the right [secret](#capability-secret) to call a [zome function](#zome-function) in the grantor's [cell](#cell).

#### Transport address

The underlying network address of an [agent](#agent) in a [network](#network), such as its IP address on the internet or a <abbr title="local area network">LAN</abbr>. This is different from its [agent address](#agent-address), which is a [DHT address](#dht-address), although every agent ID maps to a transport address, published by the agent themselves and held by the [validation authorities](#validation-authority) for the agent address.

#### Transport implementation

A networking layer that allows [peers](#peer) in the same [network](#network) to [gossip](#gossip) with each other and make [remote calls](#remote-call). Currently Holochain only supports two transport implementations:

* a [QUIC](https://en.wikipedia.org/wiki/QUIC)-based transport implementation for IP networks such as the internet or a <abbr title="local area network">LAN</abbr>
* A local-only transport implementation that allows cells within one [conductor](#conductor) to communicate directly with each other without touching the network

#### Trustless

Describes a [peer-to-peer](#peer-to-peer) [distributed system](#distributed-system) that is [Byzantine fault tolerant](#byzantine-fault-tolerance) even when [nodes](#node) are anonymous and membership is unrestricted. Trust is placed in the algorithm, rather than the reputation of the actors.

#### Tryorama

A [scenario testing](#scenario-test) library for Holochain. See [Tryorama GitHub repo](https://github.com/holochain/tryorama).

#### Unrestricted capability grant

A [capability grant](#capability-grant) that allows anyone to call a [zome function](#zome-function) in the grantor's [cell](#cell).

#### Update-entry action

A [new-entry action](#new-entry-action) that replaces another new-entry action, essentially allowing the modification of already-written data in a way that allows for multiple branching revision chains. This can be used to modify [public](#public-entry) or [private](#private-entry), [system](#system-entry) or [app](#app-entry) entries.

#### Validating DHT

Holochain's [DHT](#distributed-hash-table-dht) design which creates an [immune system](#immune-system) for the network. [Validation authorities](#validation-authority) are chosen at random, based on their [nearness](#nearness) to the [address](#address) of the data being validated and the [store arcs](#store-arc) they claim authority for. If an entry fails validation, the validation authority publishes a [warrant](#warrant) against the entry's author.

#### Validation authority

An [agent](#agent) on an application's [validating DHT](#validating-dht), chosen at random to validate a [DHT operation](#dht-operation), based on their [agent address](#agent-address)' [nearness](#nearness) to the base [address](#address) of the operation and their published [store arc](#store-arc). After validating, they also store the entry and help maintain its [resilience](#resilience) by gossiping with their [neighbors](#neighbor) and cooperating to adjust their store arcs to ensure reliable availability.

#### Validation rule

Any executable code that checks data for validity. Validation rules can either be [subconscious](#subconscious) or written in a [zome](#zome) as [validation functions](#validation-function).

#### Validation function

A function in an application's [DNA](#dna) that contains the validation rules for a [record](#record). This function allows every [agent](#agent) to check the correctness of data they see. If a [validation authority](#validation-authority) is performing validation on a record and finds that it's invalid, they can publish a [warrant](#warrant) proving that the record's author has broken the 'rules of the game'.

#### Validation signature

A [public-key signature](#public-key-signature) created by the [validation-authority](#validation-authority) of a piece of [DHT data](#dht-data), attesting to its validity according to the [validation rules](#validation-rule) in the app.

#### Validator

See [validation authority](#validation-authority).

#### Warrant

A [validation signature](#validation-signature) that attests that a piece of [DHT data](#dht-data) is invalid and its author has broken the 'rules of the game' in the [DNA](#dna)'s executable code. This warrant is produced by the [validation authority](#validation-authority) for the data and gossiped to the validation authorities for the [agent ID](#agent-id), who store it as [metadata](#metadata) on the agent ID entry.

#### WebAssembly (WASM)

A low-level byte code format that can be run on almost any platform, including the web browser. Holochain expects [DNAs](#dna) to be compiled to WebAssembly so the [ribosome](#ribosome) can execute them. See [WebAssembly website](https://webassembly.org/).

#### Workspace

A snapshot of an agent's cell [state](#state-transition), that is, their [source chain](#source-chain), taken at the start of a [zome function](#zome-function) call. All [commits](#commit) are staged to this workspace and not written to the source chain until the function completes and validation succeeds for all commits (see [atomic commit](#atomic-commit)).

#### Zome

A basic unit of modularity inside a [DNA](#dna). A zome defines a package of [entry types](#entry-type), [validation functions](#validation-functions), [zome functions](#zome-function), and [init functions](#init-function).

#### Zome function

A function, created by the developer of a [zome](#zome), that allows external code to to access the zome's functionality, including writing to the agent's [source chain](#source-chain), reading from the [DHT](#distributed-hash-table-dht), making [remote calls](#remote-call) to other agents' zome functions or [bridged](#bridge) [cells](#cell), performing cryptographic functions, or sending [signals](#signal) to listening [clients](#client). The zome functions act as a public API for the [zome](#zome), and can be called by another zome within the same [DNA](#dna), a [bridged](#bridge) DNA instance within the same [conductor](#conductor), a [client](#client) via the conductor's [RPC interface](#rpc-interface), or a [peer](#peer) in the [network](#network) via a [remote call](#remote-call). An agent can control access to their functions via [capability grants](#capability-grant).