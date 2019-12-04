# What is Holochain?

<div class="coreconcepts-intro" markdown=1>
Holochain is an **open-source framework** for developing microservices that run **peer-to-peer applications** entirely on the devices of the end-users, without central servers. It provides tools to:

* authenticate users and manage identity
* enforce data integrity and business rules
* manage access privileges
* store and retrieve data
* respond automatically to security threats
* deploy and update application code on users' devices
* distribute resource load among participants

The Holochain suite consists of:

* a service that manages running applications and provides persistence and networking
* an SDK for Rust
* a set of tools for application development and testing
* a development environment
* a collection of core apps and libraries
* an application manager GUI for end-users
</div>

## How do I build an application?

You write microservices for your application in any language that compiles to [WebAssembly](https://webassembly.org/) bytecode. Writing WASM by hand is hard, so we've written a software development kit for the [Rust programming language](https://rustlang.org). We expect to support more languages in the future!

These microservices are responsible for enforcing your application's core business rules. They define the public API that clients interact with, as well as validation rules for data.

You can write clients for your application using any language, framework, and runtime you like, as long as it can run on your users' devices and can speak [JSON-RPC](https://en.wikipedia.org/wiki/JSON-RPC) over [WebSocket](https://en.wikipedia.org/wiki/WebSocket).

## How do I deploy an application?

Instead of provisioning and deploying your application on cloud instances, you provide an installer for the users' devices. In the future we'll have an easy-to-use app store as well. Holochain's infrastructure scales with its userbase, as each user brings their own resources and contributes a little extra to the network for resilience.

## What's next?

As our ecosystem matures, we will:

* Release new core features and improve our SDK for more efficient development.
* Build drop-in libraries for user and role management, authorization, fast querying, efficient data management, and more.
* Create applications for private data backup, user profile management, and package distribution.
* Launch an app store that allow users with the Holochain runtime to install, run, and update apps with a few clicks.
* Launch a distributed application hosting marketplace called [Holo Host](https://holo.host) to connect traditional web users with Holochain applications.

## What is it built with?

We build Holochain with the [Rust programming language](https://rustlang.org). This allows it to be fast and lean while encouraging a disciplined, thoughtful design that catches most bugs before they hit production.

## How does it compare to...

### Server-side frameworks?

Holochain is similar to frameworks like Django, ASP.NET, Laravel, Express, and Ruby on Rails---it gives you the basic tools to write a full-featured 'back end' for your application.

Key differences:

* It's opinionated about data storage, providing its own persistence layer.
* Data validation is a required application component; you implement it in callback functions that execute when data is about to be written.
* Identity is managed via [public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography), similar to SSH, and users create keys on their own machines.
* Both the back end and the front end run on the devices of its users rather than a server.

### Relational / <abbr title="structured query language">SQL</abbr> databases?

Each Holochain application has its own separate data store, the <abbr title="distributed hash table">DHT</abbr>. Records in the DHT have a defined and enforced schema, similar to a table schema. But data in the DHT is stored very differently from an SQL database.

Key differences:

* Data is held by the users of the app, on their own devices.
* Data propagation is 'eventually consistent', which means that not all users will see the exact same data at the same time.
* so all public data is visible to anyone with access to the application. (However, users can store private data on their own devices, and the data can't be read by users of other applications.)
* Data is not stored in tables but in individual 'entries' that are retrieved by their unique ID.
* Relations between entries are created with 'links', making the DHT more like a graph database than a relational database.
* Right now you can't perform column-based or relational queries like you can with SQL, although limited querying functionality can be built with entries and links. In the future we intend to build more indexing and querying features.

Each user authors their own data and stores it in a journal on their own device before publishing it to the DHT. This journal can also hold private entries that are not published.

### NoSQL databases?

Holochain's public graph database is similar to document stores such as MongoDB and Elastic, and key/value stores such as Redis. It's closest to graph databases such as Neo4j, which makes it a good match for [<abbr title="Resource Description Framework">RDF</abbr>](https://www.w3.org/RDF/) data and [GraphQL](https://graphql.org/)- or [SPARQL](https://en.wikipedia.org/wiki/SPARQL)-based data access layers.

Key differences:

* Data is held by the users of the app, on their own devices.
* All of an application's public data is visible to all users of that application, although users can store private data on their own devices.
* Field-based queries are not available yet, although they can potentially be built using existing data primitives.

### Blockchain and other distributed ledger technologies (<abbr>DLT</abbr>s)?

Holochain could be considered a DLT because it shares some technological and theoretical heritage with blockchain, <abbr title="directed acyclic graph">DAG</abbr> chains, and other DLTs. However, it comes from radically different assumptions.

Key differences:

* Holochain is not a platform or network but a development framework, similar to Tendermint.
* All code execution, data creation, and data storage happens via the agency of an individual user running their own node, rather than a 'global computer'.
* Unlike public blockchain platforms, applications each have private networks and data stores.
* Applications can also define their own governance policies, permissioning systems, and consensus/consistency algorithms.
* Applications living in separate networks are easy to connect together through a 'bridging' API.
* Rather than coordinating global agreement through mining, staking, or <abbr title="Byzantine fault-tolerant">BFT</abbr> algorithms, Holochain reinforces trustworthiness of critical data via 'validators', randomly selected for each data entry. This makes attacks on data integrity statistically difficult.
* Each node stores their own ledger on their device. This means that private data can be stored in the same application as public data.
* Public data lives in the application's <abbr title="distributed hash table">DHT</abbr>, a semi-structured graph database, rather than a global ledger.
* Holochain has built-in tools to anticipate and support 'hard fork' migrations.
* Data storage and validation responsibility are distributed among nodes via a selection algorithm that creates overlapping 'neighborhoods'. This reduces storage and compute requirements, making Holochain comparable in performance to sharded blockchains or DAG chains.
* Nodes can contact each other directly without writing data to a public ledger or sending it through a gossip network.
* Keys are unique to a node and can't be used on another node. Key management is supported by a built-in distributed <abbr title="public key infrastructure">PKI</abbr> dApp.
* Holochain doesn't natively support anonymity, but is instead optimized for continuity of identity.

### Serverless/lambda?

Similar to serverless offerings, you can use Holochain to deploy an application without provisioning or maintaining server infrastructure. Back-end code consists of stateless functions that can call other functions and receive data from external services.

Key differences:

* Holochain does not provide a serverless abstraction over invisible cloud infrastructure---there are, in fact, no servers at all. Instead, each user hosts both back-end and front-end code on their own device.
* Public data is stored in a graph database engine provided by the Holochain runtime.
* A function is executed on behalf of, and only manipulates the local state of, an individual user. This state is then optionally published to the public graph database so it can be accessed by others.
* Back-end code is typically deployed to interested users as a 'package' of functions. However, given function can call a function in another package if both packages are installed on one user's device.

### BitTorrent, Dat, GUN, IPFS, Secure Scuttlebutt, and other peer-to-peer (<abbr>P2P</abbr>) or distributed web (<abbr title="distributed web">DWeb</abbr>) technologies?

Holochain is part of a new breed of <abbr>P2P</abbr> <abbr>DWeb</abbr> technologies. It shares the 'agent-centric', offline-friendly, and cryptographically secure qualities of Dat, Git, IPFS, and Secure Scuttlebutt. As a full application development stack with built-in assumptions about user identity, data propagation, and data retrieval, it's most similar to Secure Scuttlebutt.

Key differences:

* Holochain is meant for application development, whereas BitTorrent, Dat, Git, and IPFS are simply data persistence and propagation layers on which applications can be built.
* Holochain is opinionated about tools for authoring core validation logic, whereas Secure Scuttlebutt allows developers to use their favorite languages and frameworks.
* Holochain is optimized for persistent identity, whereas BitTorrent and IPFS allow for some anonymity.