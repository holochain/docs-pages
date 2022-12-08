# What is Holochain?

!!! note
    Some of the features described on this page are currently in development or unimplemented.

::: coreconcepts-intro
Holochain is an **open-source framework** for developing microservices that run **peer-to-peer applications** entirely on end-user devices without central servers. It provides tools to:

* authenticate users and manage identity
* enforce data integrity and business rules
* manage permissions for public and private data
* store and retrieve data from a redundant, distributed database
* automatically respond to security threats
* deploy and update application code on users' devices
* distribute resource load among participants

The Holochain suite consists of:

* a runtime that manages running applications and provides persistence and networking
* a software development kit (SDK) written for Rust developers
* a set of tools for application development and testing
* a development environment

## How do I build an application?

Holochain's tools encourage the creation of application back ends as collections of [microservice](https://en.wikipedia.org/wiki/Microservices)-like code packages, each with its own domain of responsibility. These packages are responsible for enforcing your application's core business logic. They define the public API with which clients interact, as well as the validation rules for data.

To build an application, you write back-end code in any language that compiles to [WebAssembly](https://webassembly.org/) bytecode. Writing WASM by hand is challenging, so we've written a software development kit (SDK) for the [Rust programming language](https://rustlang.org). We do expect, however, to support more languages in the future!

You can write a UI for your application using any language, framework, and runtime you choose, as long as it can run on your users' devices and send [MessagePack](https://msgpack.org)-encoded <abbr title="remote procedure call">RPC</abbr> calls over [WebSocket](https://en.wikipedia.org/wiki/WebSocket) to the user's locally running Holochain service.

When you're architecting your application and writing code, the most important thing to know is that all code is [modelled from the perspective of the end-user](../concepts/2_application_architecture/), because both the back end and front end run on the user's device.

## How do I deploy an application?

Instead of provisioning and deploying your application on cloud instances, you provide an installer for your users' devices. (In the future, we'll also have an easy-to-use app store.) Holochain's infrastructure scales with its user base, as each user brings enough resources for themselves and contributes a little extra to support network resilience.

## How is it built?

We build Holochain with the [Rust programming language](https://rustlang.org). This allows it to be fast and lean while encouraging a disciplined, thoughtful design that catches most bugs before they hit production.

## How does it compare to...

### Server-side frameworks?

Holochain is similar to frameworks like Django, ASP.NET, Laravel, Express, and Ruby on Rails---it gives you the tools to write a full-featured back end for your application.

Key differences:

* It's opinionated about data storage, providing its own persistence layer.
* Data validation is a required application component; it's implemented in callback functions that execute when data is about to be written.
* Identity is managed via [public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), similarly to SSH. Users create keys on their own machines as part of the setup process, which means that login forms and password databases are unnecessary.
* The back end and the front end both run on the devices of its users, not a server.

### Relational / <abbr title="structured query language">SQL</abbr> databases?

Each Holochain application has its own separate data store, a <abbr title="distributed hash table">DHT</abbr>. Records in the DHT have a defined and enforced schema, similar to a table schema.

Data in the DHT is stored differently from a SQL database, however. Key differences:

* Each user writes data to a journal on their own device before publishing it to the DHT.
* Data is held by the users of the app on their own devices. Users store their own journals, as well as a small ammount of others' public data for redundancy.
* Data propagation is [eventually consistent](https://en.wikipedia.org/wiki/Eventual_consistency). Not all users will see the exact same data at the same time.
* All of an application's public data is visible to all users of that application, although users can also store private data on their own devices and grant access to others using [capability-based security](../concepts/8_calls_capabilities/).
* Data is not stored in tables, but in individual entries that are retrieved by their unique ID.
* Relations between entries are created with links, making the DHT more like a graph database than a relational database.
* Currently, you can't perform column-based or relational queries like you can with SQL, although querying functionality can be built with entries and links. We intend to build more indexing and querying features in the future.

### NoSQL databases?

Holochain's DHT is similar to document stores such as MongoDB and Elastic, and key/value stores such as Redis. It most closely resembles graph databases such as Neo4j, which makes it a good match for [<abbr title="Resource Description Framework">RDF</abbr>](https://www.w3.org/RDF/) data and [GraphQL](https://graphql.org/)- or [SPARQL](https://en.wikipedia.org/wiki/SPARQL)-based data access layers.

Key differences:

* Data is held by the users of the app on their own devices.
* All of an application's public data is visible to all users of that application, although users can also store private data on their own devices and grant access to others using [capability-based security](../concepts/8_calls_capabilities/)
* Field-based filtering is not currently available, though it can be built using existing data primitives.

### Blockchain and other distributed ledger technologies (<abbr>DLT</abbr>s)?

Holochain could be considered a DLT, since it has some technological and conceptual similarities with blockchain, <abbr title="directed acyclic graph">DAG</abbr> chains, and other DLTs. However, it is founded on radically different assumptions.

Key differences:

* Holochain is not a platform or network, but an application development framework meant for building platforms and networks.
* Each node stores its own ledger on its own device. This means that private data can be stored in the same application as public data.
* Individuals take action in the system by running executable code on their own devices, which makes changes to their local ledger, rather than submitting requests to a global validator network.
* Unlike public blockchain platforms, each application has a private network and distributed database.
* Applications can each define their own governance policies, permissioning systems, and rules for data validity.
* Only the parties in a transaction must come to consensus, rather than the whole network, and the transaction is then witnessed by a random selection of peer validators.
* A node running multiple applications can connect them together through a 'bridging' API.
* Rather than coordinating global agreement through mining, staking, or <abbr title="Byzantine fault-tolerant">BFT</abbr> algorithms, Holochain reinforces trustworthiness of critical data via [peer validation](../concepts/1_the_basics/#how-holochain-does-things-differently). This makes attacks on data integrity statistically difficult.
* Public data lives in the application's <abbr title="distributed hash table">DHT</abbr>, a semi-structured graph database, rather than a global ledger.
* Holochain has built-in tools to anticipate and support hard forks.
* Responsibility for data storage and validation is distributed among nodes via a selection algorithm that creates overlapping 'neighborhoods'. This reduces storage and compute requirements for individual nodes, making Holochain much lighter than blockchain.
* Keys are unique to a node and can't be used on another node. Managing keys, including linking device keys to one identity, is supported by a built-in distributed <abbr title="public key infrastructure">PKI</abbr> application.
* Holochain doesn't natively support anonymity, but is instead optimized for accountability and long-lasting identities.
* In addition to being a passive record of events like blockchain, Holochain also allows interaction among nodes, between one node and its UI, and among separate apps on one node, via 'push' methods such as [RPC and signals](../concepts/8_calls_capabilities/).

### Serverless, lambda, or function-as-a-service?

Similarly to serverless offerings, you can use Holochain to deploy an application without provisioning or maintaining server infrastructure. Back-end code consists of stateless functions that can read from and write to a database, and call other functions and receive data from connected applications.

Key differences:

* Holochain does not create a serverless abstraction on top of cloud servers---there are no servers at all. Instead, each user hosts both back-end and front-end code on their own device.
* Public data is stored in a graph database provided by the Holochain runtime.
* When a function changes state, only local state is affected. This state change may then be optionally published to the public graph database so it can be accessed by others.
* Back-end code is typically deployed to interested users as a package of functions, called a [DNA](../concepts/2_application_architecture/), rather than individual functions. However, a function can call a function in another package if both packages are installed on the same user's device.

### Other peer-to-peer (<abbr>P2P</abbr>) or distributed web (<abbr title="distributed web">DWeb</abbr>) technologies?

Holochain is one of an 'agent-centric' category of <abbr title="peer-to-peer">P2P</abbr> <abbr title="distributed web">DWeb</abbr> technologies. It builds an offline-friendly peer-to-peer network on top of cryptographic primitives, similarly to Hypercore, Git, <abbr title="Interplanetary Filesystem">IPFS</abbr>, GUNdb, and Secure Scuttlebutt.

Key differences:

* Holochain, like Secure Scuttlebutt, is meant for application development, whereas BitTorrent, Dat, Git, and IPFS are simply data persistence and propagation layers on which applications can be built.
* Holochain is both a protocol and an implementation, and is opinionated about back-end languages and frameworks. Most other stacks have simpler protocols which allow developers to build on implementations written in their favorite languages.
* Holochain, like Secure Scuttlebutt and Hypercore, is optimized for long-lasting identity, whereas BitTorrent and IPFS allow for more anonymity via 'throwaway' keys.

### What's next?

As our ecosystem matures:

* We'll release new core features and improve our SDK to support application developers.
* We’ll build drop-in libraries for user and role management, authorization, fast querying, efficient data management, and more.
* We'll create applications for private data backup, user profile management, source code management, and application package distribution.
* We’ll launch an app store that allows users with the Holochain runtime to install, run, and update apps with just a few clicks.
* We are building a distributed application hosting marketplace called [Holo hosting](https://holo.host) to connect traditional web users with Holochain applications.
