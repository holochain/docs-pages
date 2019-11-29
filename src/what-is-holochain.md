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

Holochain is quite similar to frameworks like Django, ASP.NET, Laravel, Express, and Ruby on Rails---it gives you the basic tools to write a full-featured 'back end' for your application. The key differences are that Holochain is opinionated about data storage, data validation, and identity, and runs on the devices of its users rather than a server.

### SQL databases?

Holochain has two data stores:

* an individual journal on the device of each user
* a [content-addressable](https://en.wikipedia.org/wiki/Content-addressable_storage) graph database for public data

Public data is distributed across many devices and can only be retrieved by its hash, so querying isn't as easy or fast as with an SQL database.

### NoSQL databases?

Holochain's public graph database is similar to document stores such as MongoDB and Elastic, key/value stores such as Redis, and graph databases such as Neo4j (which makes it a good match for GraphQL). Advanced querying tools are still in development, but the basic tools are capable of storing, linking, and performing limited queries on individual documents.

### Secure Scuttlebutt, BitTorrent, IPFS, and other peer-to-peer (<abbr>P2P</abbr>) or distributed web (<abbr>DWeb</abbr>) technologies?

Holochain is part of a new breed of <abbr>P2P</abbr> <abbr>Dweb</abbr> technologies and shares similarities with other projects in this space. It shares the 'agent-centric' and offline-friendly qualities of Git, Secure Scuttlebutt, IPFS, and Dat,

### Blockchain and other distributed ledger technologies (<abbr>DLT</abbr>s)?

While Holochain could be considered a distributed ledger technology, it's not a blockchain platform or development kit. It shares some similarities, but it comes from a radically different set of assumptions. It does not strive for global consensus on a single ledger, but instead allows each agent to keep their own ledger and equips them to come to mutual agreement, reinforcing trust through the witness of randomly selected validators for critical data. These third-party validators are also responsible for pruning bad actors from the network by spreading news about invalid data. This makes Holochain much more respectful of resources than public and permissioned blockchains, and closer in performance to DAG chains and other DLTs that offer partial or sharded consensus.

### Serverless/lambda?

Trent Lapinski, VP of Solutions at Stratus5, in his Hackernoon article [WTF is Holochain](https://hackernoon.com/wtf-is-holochain-35f9dd8e5908) describes Holochain as follows:

> “Holochain is an energy efficient, post-blockchain ledger system and decentralized application platform that uses peer-to-peer networking for processing agent-centric agreement and consensus systems between users. The key advantage of Holochain is that every device on the network gets its own secure ledger, or Holochain, and can function independently while also interacting with all the other devices on the network for a truly decentralized edge computing solution.”

Holochain is NOT a public protocol platform where you have to choose between multiple, hard-to-scale networks with their own tradeoffs. It’s also NOT a private network where a solutions’ growth and evolution are stunted by adapting to ever-changing needs.

Holochain is an application framework for building distributed solutions. It allows you to build dApp products to fit user requirements without dealing with network constraints. This means every user controls their own data and avoids the risk of their data being sold or exposed to third parties.

We consider Holochain to be the Linux of distributed apps. It has powerful features and is uniquely organized. For example,

* Holochain is 100% free and has an open-source framework.
* Holochain is customizable, developer friendly, and offers opportunities for growth.
* Holochain promotes easy onboarding.
* Holochain supports a large commercial ecosystem.

With Holochain, you can build better public network dApps, private and permissioned networks or dApps, and distributed apps that bridge the public-private model with multiple layers of permissions and governance. All of this is natively achieved using a consistent framework.

__For more information, visit the [Holochain YouTube Channel](https://www.youtube.com/channel/UC9fNJMIQ9mQ4u9oyoVIqtDQ/playlists) and the [Holochain Blog](https://blog.holochain.org/).__
