# Holochain Glossary

!!! info "WIP"
    This article is currently a work in progress and subject to frequent change.
    See the [changelog](../changelog) for details.

As you go through our documentation, you'll probably find some unfamiliar terms, or familiar ones used in surprising ways. Here are the definitions we use.

#### Address

The unique ID of an [entry](#entry) or [agent](#agent) on the [DHT](#distributed-hash-table-dht). Every entry has an address that is generated from its content, usually by a [hash](#hash) function.

#### Address space

The entire range of possible [addresses](#address) on the [DHT](#distributed-hash-table-dht). This space is circular, meaning the last address is considered adjacent to the first address.

#### Agency

The power of an [agent](#agent) to act in their environment.

#### Agent

1. Anyone or anything acting with [agency](#agency), such as a human or bot.

2. An agent (see definition 1) who participates in a Holochain [#network](#network) through their [#DNA instance](#dna-instance).

3. The DNA instance that mediates the participation of an agent (see definition 2) in a Holochain network.

#### Agent-centric

A [distributed system](#distributed-system) that puts [agents](#agent) at the center of the design, giving them [agency](#agency) over their online identity and the data they create. Agent-centric systems are usually [distributed](#distributed-system) and use [public-key cryptography](#public-key-cryptography) to identify agents. [Git](https://git-scm.com), Holochain, and [Secure Scuttlebutt](https://scuttlebutt.nz) are highly agent-centric, while client/server systems are less so.

#### Agent address

The address of an [agent ID](#agent-id) entry on the [DHT](#distributed-hash-table-dht), calculated from the agent's [public key](#public-key-cryptography). It is used in [node-to-node messaging](#node-to-node-message) and in choosing [validators](#validator) for [public entries](#public-entry).

#### Agent ID

The second of the two [genesis entries](#genesis-entries) at the the beginning of an [agent](#agent)'s [source chain](#source-chain), which identifies them and contains their [public key](#public-key-cryptography) and other information, such as human-readable identifiers or credentials necessary for joining the DNA's network. This entry becomes an agent's unique identifier in the app. The address of this entry is also the [agent's address](#agent-address) on the DHT.

#### Anchor

A data modelling pattern that allows application designers to simulate collections or tables on the [DHT](#distributed-hash-table-dht). A [base](#link-base) [entry type](#entry-type) is defined as containing a value, such as `"user_handles"`, `"city_names"`, or `"blog_posts_2019"`, and all relevant entries are [linked](#link) to it.

#### Append-only

Any data structure that can only be written to. Once written, that data becomes 'immutable' (it can't be modified or deleted). An agent's [source chain](#source-chain) and the [DHT](#distributed-hash-table-dht) are both append-only.

#### Application (app)

Synonymous with [hApp](#holochain-application-happ), an app is a collection of [back end](#back-end) and [front end](#front-end) components that comprise something a Holochain user can interact with.

#### Aspect

A piece of metadata on an entry, such as a [link](#link), [provenance](#provenance), [validation signature](#validation-signature), [warrant](#warrant), or [CRUD](#create-read-update-delete-crud) status.

#### Author

The [agent](#agent) who has [published](#publish) a [DHT entry](#dht-entry), as shown by their [provenance](#provenance).

#### Back end

Synonymous with a collection of [DNA instances](#dna-instance) for a [hApp](#holochain-application-happ)---this is code that contains the base-level persistence and validation logic.

#### Blockchain

A distributed system that promises [Byzantine fault tolerance](#byzantine-fault-tolerance-bft) by using a [coordination protocol](#coordination-protocol) to get all nodes to agree on a single, shared history of events. This history is stored as a [hash chain](#hash-chain) of 'blocks', or bundles of [state transitions](#state-transition). A blockchain can be public (anyone can join) or permissioned/private (membership is controlled). Public blockchains are usually [trustless](#trustless), ensuring tamper-resistance by making cheating more costly than honesty.

#### Bridge

A connection between [DNA instances](#dna-instance) in one user's conductor, which allows one instance to call the [zome functions](#zome-function) of another instance.

#### Bundle

1. A [hApp bundle](#happ-bundle).

2. A group of [commits](#commit) that succeed or fail 'atomically', like a transaction in an SQL database (not yet supported).

#### Byzantine fault tolerance (BFT)

The ability of a [distributed system](#distributed-system) to reach [consistency](#consistency) despite 'Byzantine failures', which are accidental or intentional corruption in [nodes](#node) or the networking transport between them.

#### Capability-based security

A security model that allows the owner of a resource to grant others access while maintaining ultimate control. Instead of allowing direct access to the resource, it mediates access and manages privileges by issuing 'capabilities'. In Holochain, an [agent](#agent)'s [conductor](#conductor) protects their running [DNA instances](#dna-instance) and authorizes [subjects](#capability-subject)' access to them by issuing and checking [tokens](#capability-token).

#### Capability grant

A special, [private entry](#private-entry) that an [agent](#agent) writes to their [source chain](#source-chain) to record the issuing of a capability and its terms, including the intended [subject](#capability-subject). The address of this grant becomes a [capability token](#capability-token).

#### Capability claim

A special, [private entry](#private-entry) that a [subject](#capability-subject) writes to their [source chain](#source-chain) to record the [token](#capability-token) they received. This allows them to exercise their capability later.

#### Capability subject

The entity that is given permission to access a resource via [capability-based security](#capability-based-security). In Holochain, this can be a client or bridged DNA instance on the user's machine, or it can be another agent.

#### Capability token

An identifier for a capability grant, which proves that its bearer has been granted a capability and is allowed to exercise it. In a Holochain app, this token is the hash of the [grant](#capability-grant).

#### Centralization

The degree to which [agency](#agency), decision-making power, or responsibility in a [distributed system](#distributed-system) is concentrated in certain nodes. [Client/server](#client-server) systems are highly centralized. The complement of centralization is, of course, [decentralization](#decentralization).

#### Client

Any piece of software that accesses a [DNA instance](#dna-instance)'s [zome functions](#zome-function). The client makes function calls over the [conductor](#conductor)'s [RPC interface](#rpc-interface), and can be a [GUI](#graphical-user-interface-gui), shell script, service, or scheduled task. This client lives on the same machine as the [conductor](#conductor).

#### Client/server

A highly [centralized](#centralization) [distributed system](#distributed-system) architecture in which certain nodes are responsible for most of the processing, storage, and decision-making. Client/server systems typically give low [agency](#agency) to end-users.

#### Commit

The act of adding an [entry](#entry) to a [source chain](#source-chain). If an entry is a [public entry](#public-entry) it also gets [published](#publish) to the DHT.

#### Commons

Any resource that is used by a group of agents, but is owned by none. In order to survive, a commons must have rules governing its use. A Holochain [DHT](#distributed-hash-table-dht) is a type of digital commons whose rules are enforced by its [DNA](#dna) and Holochain's [subconscious](#subconscious) rules.

#### Conductor

The service that lives on a user's device and hosts all of their [DNA instances](#dna-instance), stores their data, and handles [network](#network) communication between their instances and other users' instances.

#### Conductor API

The [RPC interface](#rpc-interface) that a [conductor](#conductor) exposes, which allows locally running [clients](#client) to access and manipulate the configuration of [DNAs](#dna), [agents](#agent), [instances](#dna-instance), and [RPC interfaces](#rpc-interface).

#### Conflict-free replicated data type (CRDT)

A function that allows two [nodes](#node) in a [distributed system](#distributed-system) to separately make changes to the same piece of data without creating conflicts. A CRDT is [logically monotonic](#logical-monotonicity), which means it satisfies the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem) and doesn't need a [coordination protocol](#coordination-protocol).

#### Consensus

1. Synonymous with [consistency](#consistency) in a [distributed system](#distributed-system).

2. Synonymous with [global consensus](#global-consensus) in a [blockchain](#blockchain) or other [DLT](#distributed-ledger-technology-dlt).

#### Consistency

The point at which all [nodes](#node) in a [distributed system](#distributed-system) agree on the state of the data they hold. [Blockchains](#blockchain) enforce a form of consistency called [global consensus](#global-consensus), whereas Holochain uses 'strong' [eventual consistency](#ventual-consistency).

#### Consistency/availability/partition-tolerance (CAP) theorem

This principle states that all [distributed systems](#distributed-system) are prone to 'partitions' (groups of nodes becoming unavailable to each other), and that in the presence of a partition a design can only guarantee availability (data can always be accessed and written) or [consistency](#consistency) (data is always correct), but not both.

#### Consistency as logical monotonicity (CALM) theorem

This principle states that as long as a function is [logically monotonic](#logical-monotonicity), it can be run on multiple [nodes](#node) in a [distributed system](#distributed-system) and reach strong [eventual consistency](#eventual-consistency) without needing [coordination protocols](#coordination-protocol).

#### Content-addressable store (CAS)

Any storage system that gives a unique ID to each piece of data and allows it to be retrieved by its ID rather than its physical location. A [DHT](#distributed-hash-table-dht) is a type of CAS.

#### Coordination protocol

An algorithm that governs the synchronization of data in a [distributed system](#distributed-system) and aims to prevent or resolve data conflicts that happen when two [nodes](#node) are out of sync with each other. Any [state transition](#state-transition) that isn't [logically monotonic](#logical-monotonicity) needs a coordination protocol.

#### Core API

See [Holochain Core API](#holochain-core-api).

#### Create, read, update, delete (CRUD)

The four main operations an application needs to do with data. Even though all data structures in Holochain are [append-only](#append-only), data can still be updated or deleted by adding a new entry that marks the old data as obsolete.

#### Decentralization

The act of removing central points of control. Many [distributed systems](#distributed-system) are decentralized to various degrees.

#### Deduplication

The removal of identical entries in a [CAS](#content-addressable-store-cas). Most CASes, including Holochain's [DHT](#distributed-hash-table-dht), deduplicate content automatically.

#### DeepKey

Holochain's standard [DPKI](#distributed-public-key-infrastructure-dpki) library.

#### Development conductor

A Holochain [conductor](#conductor) used for running and testing a [hApp](#holochain-application-happ) during development.

#### DHT entry

A public [entry](#entry) that lives in the [DHT](#distributed-hash-table-dht). DHT entries are assigned to a [neighborhood](#neighborhood) of [validators](#validator), are [deduplicated](#deduplication), can have many authors, and have [metadata](#metadata) attached to them in [aspects](#aspect).

#### Distributed hash table (DHT)

A collection of data stored collectively by many [nodes](#node) in a [distributed system](#distributed-system). A node retrieves data by address, usually its cryptographic [hash](#hash), searching for a [peer](#peer) responsible for holding the data. Holochain uses a [validating DHT](#validating-dht) to store [public entries](#public-entry). Each [DNA](#dna) has its own separate DHT.

#### Distributed ledger technology (DLT)

Any technology that involves many [nodes](#node) in a distributed system sharing an [append-only](#append-only) history of [state transitions](#state-transition). [Blockchain](#blockchain) DLTs use a [global ledger](#global-ledger), whereas others use some form of [sharded](#sharding) or partially connected ledgers. Holochain is a sort of DLT in which each [agent](#agent) is responsible for their own ledger, called a [source chain](#source-chain).

#### Distributed public key infrastructure (DPKI)

A [public key infrastructure](#public-key-infrastructure-pki) that doesn't rely on a central authority. [DeepKey](#deepkey) is Holochain's default DPKI implementation.

#### Distributed system

Any system that involves multiple [nodes](#node) talking to one another over a network, whether [decentralized](#decentralization) or [centralized](#centralization). Because communication isn't instantaneous, different nodes can create conflicting data. Many distributed systems use a [coordination protocol](#coordination-protocol) to come to [consistency](#consistency), while others rely on the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem).

#### DNA

A [package](#package) of executable code that defines the shared 'rules of the game' for a group of agents. A DNA is made up of [zomes](#zome), which define [validation rules](#validation-rule) for data, and [zome functions](#zome-function) for agents to take action.

#### DNA instance

A particular Holochain [DNA](#dna) when it's bound to an [agent](#agent). DNA + agent = instance.

#### End-to-end encryption (E2EE)

A channel between two nodes in a public network that allows them to transfer secret messages that cannot be decrypted by eavesdroppers. Holochain's [node-to-node messaging](#node-to-node-message) uses E2EE, as does [gossip](#gossip) between nodes.

#### Entry

A basic unit of data in a Holochain app. Each entry has its own defined [entry type](#entry-type). When an agent [commits](#commit) an entry, it is written to their [source chain](#source-chain). If it's marked as a [public entry](#public-entry), it's also [published](#publish) to the DHT.

#### Entry type

A specification for any sort of entry that a [DNA](#dna) should recognize and understand, similar to an <abbr title="object-oriented programming">OOP</abbr> class or database table schema. It can specify a data schema and [validation rule](#validation-rule) for its [entries](#entry), as well as a [public](#public-entry) or [private](#private-entry) sharing directive.

#### Eventual consistency

A promise made by distributed systems that optimize for availability over consistency (see [CAP theorem](#consistency-availability-partition-tolerance-cap-theorem)), meaning that given enough time, every [node](#node) ought to eventually reach [consistency](#consistency) with each other. _Strong_ eventual consistency means that nodes are _guaranteed_ to reach consistency without conflicts, which is possible for any system whose [state transition](#state-transition) functions adhere to the [CALM theorem](#consistency-as-logical-monotonicity-calm-theorem).

#### Front end

Synonymous with [graphical user interface](#graphical-user-interface-gui).

#### Genesis entries

The two entries at the beginning of an [agent](#agent)'s [source chain](#source-chain) for a [DNA instance](#dna-instance), consisting of:

1. The [DNA](#dna) hash, which shows that the agent has seen the network's rules and agrees to abide by them.
2. The [agent ID](#agent-id) entry, which advertises the agent's [public key](#public-key-cryptography) and may also provide other identifications or credentials.

#### Global consensus

Agreement among all [nodes](#node) in a [blockchain](#blockchain) on a single, shared [global ledger](#global-ledger). Holochain prefers 'local' consensus, both between interacting parties and among a small set of third-party [validators](#validator).

#### Global ledger

A [ledger](#ledger) whose contents are identical across all [nodes](#node) in a [blockchain](#blockchain).

#### Gossip

A protocol used by many [peer-to-peer networks](#peer-to-peer-network) to rapidly propagate data. Each [node](#node) knows a few other nodes, who know a few more, and so forth. Whenever any node receives a message, they broadcast it to some or all of their peers. Data propagates slowly at first, then spreads at an exponential rate. Nodes in a Holochain [network](#network) share entries, metadata, [neighborhood](#neighborhood) health, and peer addresses via gossip.

#### Graphical user interface (GUI)

A [client](#client) that presents a visual, easy-to-understand way for a user to interact with a [DNA instance](#dna-instance) or collection of instances running in their [conductor](#conductor). As with any client, the GUI always runs on the same machine as the conductor.

#### hApp bundle

One or more [DNA](#dna) packages, [bridge](#bridge) definitions between them, and an optional HTML-based UI package. Together they form a complete [hApp](#holochain-application-happ), both [back end](#back-end) and [front end](#front-end). These components are specified in a [hApp manifest](#happ-manifest) file, and can be packaged in a zip archive along with the manifest or downloaded separately from the internet.

#### hApp manifest

The file that specifies the components of a [hApp bundle](#happ-bundle). Supporting conductors, such as [Holoscape](#holoscape) and the Holochain [development conductor](#development-conductor), can install and run fully functional [applications](#application) from this file.

#### Hash

A unique 'fingerprint' for a piece of data, calculated by running the data through a special function. A hash can serve as a unique identifier for that data (such as with [addresses](#address) of [DHT entries](#dht-entry)) and makes it easy to retrieve data from a hash table and verify its integrity.

#### Hash chain

An [append-only](#append-only) data structure that can be used as a tamper-evident, sequential log of events, such as a [source chain](#source-chain) or [blockchain](#blockchain).

#### History

The entries created by an [agent](#agent) and recorded in their [source chain](#source-chain).

#### Holo

The company funding the development of [Holochain Core](#holochain-core) and providing [hosting services](#holo-host) for Holochain apps.

#### Holochain Development Kit (HDK)

Holochain's standard software development kit (SDK) for [zome](#zome) and [DNA](#dna) developers. It provides developer-friendly access to the low-level [Holochain core API](#holochain-core-api), as well as macros for defining [entry](#entry) and [link](#link) types, [validation functions](#validation-function), and [init functions](#init-function).

#### Holochain application (hApp)

A collection of [DNAs](#dna) and a [client](#client) (or clients) that allow users to interact with those DNAs, typically distributd as a [hApp bundle](#happ-bundle).

#### Holochain Core

The basic components of Holochain---the [conductor](#conductor), the [nucleus](#nucleus)/[ribosome](#ribosome), and the persistence and networking providers.

#### Holochain Core API

The set of core functions that the [nucleus](#nucleus) makes available to the [ribosome](#ribosome), so the [ribosome](#ribosome) can in turm make them available to a running [DNA instance](#dna-instance). These functions allow the DNA to access and manipulate an [agent](#agent)'s [source chain](#source-chain), run cryptographic functions, retrieve and write [DHT entries](#dht-entry) and [links](#link), and send [node-to-node messages](#node-to-node-message) to [peers](#peer).

#### Holo Host

A platform and marketplace where Holochain users offer their spare computing capacity to host [DNA instances](#dna-instances) for web users, functioning as a bridge between Holochain and the traditional web. Read more at [Holo's website](https://holo.host/host/).

#### Immune system

A property of Holochain's [validating DHT](#validating-dht), whereby healthy [nodes](#node) detect invalid data, share proof of corruption among their peers, and take defensive action against the corrupt nodes that produced it. While each node is individually responsible for taking action, the cumulative effect is a collective rejection of the corrupt nodes.

#### Init callback

A function in a [DNA](#dna) that the [nucleus](#nucleus) calls when an [agent](#agent) runs the [DNA instance](#dna-instance) for the first time. This can be used to set up initial variables, etc.

#### Intrinsic data integrity

Holochain's fundamental strategy for guaranteeing data integrity. Data is considered valid or invalid based on the [DNA](#dna)'s [validation rules](#validation-rule), as well as Holochain's [subconscious](#subconscious) validation rules.

#### Journal

Synonymous with [ledger](#ledger).

#### Ledger

A history of events or [state transitions](#state-transition). In [distributed ledger technology](#distributed-ledger-technology-dlt), ledgers are usually stored as [hash chains](#hash-chain), such as the [source chain](#source-chain) of a Holochain agent.

#### Link

A piece of [metadata](#metadata) connecting one [DHT entry](#dht-entry) to another. Each link has a defined [type](#link-type), as well as a [tag](#link-tag).

#### Link base

The [DHT entry](#dht-entry) that a [link](#link) links from. The link is stored in the DHT as an [aspect](#aspect) attached to its base entry.

#### Link tag

An arbitrary piece of string content attached to a [link](#link). It can be used for things like describing the nature of the relation, containing a small portion of the target's data to avoid asking the [DHT](#distributed-hash-table-dht) to retrieve the full target entry, or serving as an index for filtering links.

#### Link target

The [DHT entry](#dht-entry) that a [link](#link) points to.

#### Link tag

A piece of content embedded in a [link](#link) that further describes the link beyond its [type](#link-type) or includes information about its [target](#link-target).

#### Link type

A specification for any sort of [link](#link) that a [DNA](#dna) should recognize and understand, similar to an [entry type](#entry-type). It defines the [base](#link-base) and [target](#link-target) [types](#entry-type) that the link is valid for, as well as a [validation rule](#validation-rule). Because links only exist on the [DHT](#distributed-hash-table-dht), all link types are public.

#### Logical monotonicity

The property of a set of facts whereby the truth of prior facts are never negated by the addition of later facts. [CALM](#consistency-as-logical-monotonicity-calm) relies on functions that exhibit this property. For example, Holochain's source chain, DHT, and update/delete operations only add new entries without removing old ones.

#### Membrane

One of two types of permeable boundary that allow appropriate access and disallow inappropriate access:

1. The layer of protection around an [agent](#agent)'s [DNA instance](#dna-instance), secured by [capability-based security](#capability-based-security), that prevents unauthorized access to the instance or its source chain data.

2. A special [validation rule](#validation-rule) in a [DNA](#dna) that checks the [agent ID](#agent-id) entry and determines the [agent](#agent)'s right to become part of the DNA's [network](#network).

#### Metadata

Supplementary data attached to a piece of data. In a Holochain [DHT](#distributed-hash-table-dht), metadata like [links](#link) are stored on [entries](#entry) as [aspects](#aspect).

#### Microservice

An application architecture pattern that encourages small, single-purpose [back end](#back-end) services. Holochain [DNAs](#dna) can be designed as microservices that combine to form a fully featured [hApp](#holochain-application-happ).

#### Mutual sovereignty

The relationship between the autonomy of the individual and the collective intentions of the group. A successful [commons](#commons) finds a healthy balance between these opposites. Holochain's design is based on this principle, empowering [participants](#participant) to control their own identity and responses to their peers by equipping each of them with a full copy of the application. The application constitutes the group's intentions, so by running the application a participant consents to the group's rules and norms.

#### Nearness

The proximity of two [addresses](#address) to each other in the [DHT](#distributed-hash-table-dht)'s [address space](#address-space), expressed as the XOR distance between them.

#### Neighborhood

A group of [nodes](#node) in a Holochain [DHT](#distributed-hash-table-dht) who are [near](#nearness) to one another (in terms of [address space](#address-space), not geography). Neighbors collectively support the [resilience](#resilience) of all [DHT entries](#dht-entry) whose [address](#address) is near to them by storing and [validating](#validator) those entries and [gossiping](#gossip) to each other about the entries they have.

#### Network

A community of [nodes](#node) [gossiping](#gossip) with each other to form a [validating DHT](#validating-dht), aiding in data storage and retrieval, validation, and peer discovery. Each [DNA](#dna) has a separate network.

#### Node

An individual [agent](#agent) in a Holochain [network](#network) who has an [agent address](#agent-address) and can be talked to via [gossip](#gossip).

#### Node-to-node message

A direct, [end-to-end encrypted](#end-to-end-encryption) exchange between two [nodes](#node) on a [network](#network).

#### Nucleus

The core of Holochain. With the help of the [ribosome](#ribosome), it governs data flow between the [conductor](#conductor) and a [DNA instance](#dna-instance) and enforces the [subconscious](#subconscious) [validation rules](#validation-rule).

#### Package

1. Synonymous with [DNA](#dna).

2. The act of compiling [zome](#zome) source code and configuration data into a [DNA](#dna) package.

#### Participant

Synonymous with 'user'. We often prefer the term 'participant' because a Holochain [DHT](#distributed-hash-table-dht) is a [commons](#commons) of [mutually sovereign](#mutual-sovereignty) peers who all actively work to maintain its integrity.

#### Peer

Synonymous with [node](#node).

#### Peer-to-peer

A highly [decentralized](#decentralization) [distributed system](#distributed-system) in which [nodes](#node) talk directly to one another without the intermediation of a [server](#client-server) or other [central](#centralization) nodes.

#### Private entry

An [entry](#entry) which is stored on the [source chain](#source-chain), but not [published](#publish) to the [DHT](#distributed-hash-table-dht).

#### Progenitor

The first user to run a [DNA](#dna) and bootstrap its [DHT](#distributed-hash-table-dht). The progenitor usually has special responsibilities and privileges to set up necessary global DHT entries.

#### Provenance

A [public key](#public-key-cryptography) and a [public-key signature](#public-key-signature), stored as a piece of metadata on a [DHT entry](#dht-entry). It proves that an [agent](#agent) (represented by the public key) actually authored the entry (as proven by the signature) and allows anyone to verify that a third party hasn't tampered with it.

#### Public entry

Synonymous with a [DHT entry](#dht-entry), any entry marked 'public' will be [published](#publish) to the [DHT](#distributed-hash-table-dht).

#### Public-key cryptography

A cryptographic system that consists of two keys, a public component and a private, or secret, component. These keys are mathematically related to each other in a way that's easy for the key pair's owner to prove, but nearly impossible for a third-party to reverse-engineer. In Holochain, the public key lives in the [DHT](#distributed-hash-table-dht) as an [agent](#agent)'s identity while the private key stays on the agent's device as a proof that they control their public key. [Peers](#peer) can verify an agent's claim of authorship on an entry by checking their [provenance](#provenance), or use an agent's public key to encrypt a private message that only they can decrypt.

#### Public-key infrastructure (PKI)

A way for agents to share their public keys, prove their authenticity, and revoke old keys if they've been compromised. Most PKIs, such as the global SSL certificate authority system, are centralized. Holochain provides a [distributed PKI](#distributed-public-key-infrastructure-dpki) system.

#### Public-key signature

The hash of a piece of data, encrypted with a private key. It can be decrypted by anyone who has a copy of the public key. In Holochain, this is used in a [provenance](#provenance) on each [DHT entry](#dht-entry) to prove authorship and detect third-party tampering.

#### Public/private key pair

See [public-key cryptography](#public-key-cryptography).

#### Publish

The act of sending a [public entry](#public-entry) to the [DHT](#distributed-hash-table-dht) after it has passed the author's own copy of the [validation rules](#validation-rule) for the entry. The [neighborhood](#neighborhood) of [validators](#validator) who are responsible for that entry's [address](#address) receive it, validate it, and if it's valid, store a copy of it.

#### Remote procedure call (RPC)

A call that a [client](#client) makes to a [zome function](#zome-function) or [conductor API](#conductor-api) function over a local socket interface.

#### RPC interface

A network port that the [conductor](#conductor) exposes, allowing [clients](#client) to call the [conductor API](#conductor-api) or make [zome function](#zome-function) calls to running [DNA instances](#dna-instance). This interface only listens for local connections, so it can't be accessed over the internet.

#### Resilience

The level of a [network](#network)'s capacity to hold itself in integrity as [nodes](#node) leave, join, or attempt to attack it.

#### Resilience factor

A value set in the [DNA](#dna) that specifies the desired number of copies of an [entry](#dht-entry) that should exist in a [DHT](#distributed-hash-table-dht). The [nodes](#node) in a [neighborhood](#neighborhood) responsible for an entry collectively work to make sure this factor is met at all times. As an example, for a resilience factor of 5, each entry is expected to exist on five nodes with 100% uptime, or ten nodes with 50% uptime. If an entry has reached [saturation](#saturation), it's met the resilience factor.

#### Ribosome

The 'sandbox' or 'virtual machine' inside which a [DNA instance](#dna-instance) runs. In Holochain's current design, the ribosome is a [WebAssembly](#webassembly-wasm) interpreter that exposes Holochain's [core API](#holochain-core-api) to the instance and allows the [nucleus](#nucleus) to call the instance's [validation functions](#validation-function), [init function](#init-function), as well as other callbacks.

#### Rust

The programming language used to build Holochain Core and [DNAs](#dna)/[zomes](#zome).

#### Saturation

The state at which the peers holding a [DHT entry](#dht-entry) have satisfied the [DNA](#dna)'s expected [resilience factor](#resilience-factor).

#### Scenario test

An automated test that simulates real-life conditions involving multiple [agents](#agent) on a simulated or real [network](#network), used to test a [DNA](#dna)'s tolerance of various failure modes.

#### Sharding

A process of reducing the processing and storage load of individual [nodes](#node) in a [distributed system](#distributed-system) by distributing data and/or work among them. While some sharded systems separate nodes into discrete shards, Holochain's [DHT](#distributed-hash-table-dht) separates them into overlapping [neighborhoods](#neighborhood).

#### Signal

A message emitted by a [DNA instance](#dna-instance), meant for a [client](#client) to receive and act upon.

#### Source chain

A [hash chain](#hash-chain) of data committed by an [agent](#agent). For each [DHT](#distributed-hash-table-dht), every agent stores their own source chain as a record of the [state transitions](#state-transition) they've made---that is, the [entries](#entry) they've committed.

#### Source chain entry

An individual record stored on a [source chain](#source-chain), which may be [private](#private-entry) or [public](#public-entry).

#### Source chain header

A meta-entry that links a [source chain entry](#source-chain-entry) to the previous entry in an [agent](#agent)'s [source chain](#source-chain).

#### State transition

A modification of application state. In Holochain, state transitions begin life as [entries](#entry) in an [agent](#agent)'s [source chain](#source-chain) and are optionally [published](#publish) to the [DHT](#distributed-hash-table-dht) as a permanent public record.

#### Subconscious

The 'base' [validation rules](#validation-rule) defined by the Holochain [nucleus](#nucleus) that check validity of [hashes](#hash) and [provenances](#provenance), as well as the integrity of each [agent](#agent)'s source chain.

#### Trait

A contract or interface that a [zome](#zome) is expected fulfill, consisting of a specification for a collection of [zome functions](#zome-function) and their input and return types. All zomes that promise to implement a trait are expected to supply functions that conform to the trait's specification. A [DNA](#dna) can require that a [bridged](#bridge) DNA supply certain traits, and the [conductor](#conductor) will make sure that this requirement is satisfied.

#### Trustless

A [peer-to-peer](#peer-to-peer) [distributed system](#distributed-system) that is [Byzantine fault tolerant](#byzantine-fault-tolerance) even when [nodes](#node) are anonymous and membership is unrestricted. Trust is placed in the algorithm, rather than the reputation of the actors.

#### Validating DHT

Holochain's [DHT](#distributed-hash-table-dht) design which creates an [immune system](#immune-system) for the network. [Validators](#validator) are chosen at random, based on their [nearness](#nearness) to the [address](#address) of the [entry](#entry) to be validated. If an entry fails validation, the validator publishes a [warrant](#warrant) against the entry's author, along with proof of invalidity.

#### Validation rule

A function that checks the correctness of an [entry](#entry) or [link](#link). If validation fails, a [validator](#validator) can publish a [warrant](#warrant) proving that the entry's author has broken the 'rules of the game'.

#### Validation signature

A [provenance](#provenance) created by the [validator](#validator) of a [DHT entry](#dht-entry), attesting to the validity of that entry according to its [validation rule](#validation-rule).

#### Validator

A [node](#node) in the [validating DHT](#validating-dht), chosen at random to validate a [DHT entry](#dht-entry), based on their [agent address](#agent-address)' [nearness](#nearness) to the address of the entry. After validating, they also store the entry and help maintain its [resilience](#resilience).

#### Warrant

An entry created by the [validator](#validator) of a [DHT entry](#dht-entry), attesting that the entry is invalid according to its [validation rule](#validation-rule) and proving that its author has broken the 'rules of the game' in the [DNA](#dna)'s executable code.

#### WebAssembly (WASM)

A low-level byte code that can be run on almost any platform, including the web browser. Holochain expects [DNAs](#dna) to be compiled to WebAssembly so the [ribosome](#ribosome) can execute them.

#### Zome

A basic unit of modularity inside a [DNA](#dna). A zome defines [entry](#entry-type) and [link](#link) types, [validation rules](#validation-rule), public [zome functions](#zome-function), [node-to-node message](#node-to-node-message) handlers, and [init functions](#init-function).

#### Zome function

A function, created by the author of a [zome](#zome), that allows a [client](#client) to access the zome's functionality. This includes data retrieval and storage, as well as node-to-node messaging. The zome functions act as a public API for the [zome](#zome), and can be called by another zome within the same [DNA](#dna), a [bridged](#bridge) DNA instance within the same [conductor](#conductor), or a [client](#client) via the conductor's [RPC interface](#rpc-interface).