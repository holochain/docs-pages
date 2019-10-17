# Holochain Glossary

As you go through our documentation you'll probably find some unfamiliar terms, or familiar ones used in surprising ways. Here are the definitions we use.

Address
:   The unique ID of an **entry** on the **DHT**. Every entry has an address that is generated from its content, usually by a **hash** function.

Address space
:   The entire range of possible **addresses** on the **DHT**. This space is circular; that is, the max address is considered adjacent to address 0.

Agent
:   A **conductor** running one or more **DNA instances**, either on behalf of a person or as a bot. A person may own more than one device, each of which is a separate agent in a given **network**.

Agent address
:   The address of an agent ID entry on the DHT, calculated from the agent's **public key**. It is used in **node-to-node messaging** and in choosing **validators** for **public entries**.

Agent ID
:   An **entry** near the beginning of an agent's source chain that identifies them. It contains their public key and other identifying information. This entry becomes an agent's unique identifier on the **DHT**. The address of this entry is the **agent's address** on the DHT.

Append-only
:   Describes any data structure that can only be written to. Once written, data is 'immutable', which means it can't be modified or deleted. An agent's **source chain** and the **DHT** are both append-only, which makes them **logically monotonic**.

Application (app)
:   A collection of **back end** and **front end** components that comprise something a person can actually use.

Aspect
:   A piece of metadata on an entry, such as a **link**, **provenance**, **validation signature**, **warrant**, or **CRUD** status.

Author
:   The **agent** who has **published** a **DHT entry**, as shown by their **provenance**.

Back end
:   Synonymous with a collection of **DNA instances** for a **hApp** --- the code that contains the base-level persistence and validation logic.

Blockchain
:   A distributed system that promises **Byzantine fault tolerance** by using a **coordination protocol** to get all nodes to agree on a single, shared history of events. This history is stored as a **hash chain** of 'blocks', or bundles of **state changes**. A blockchain can be public (anyone can join) or permissioned/private (membership is controlled). Public blockchains are usually **trustless**, ensuring tamper-resistance by making participation costly.

Bridge
:   A connection between **DNA instances** in one conductor that allows one instance to call another instance's **zome functions**.

Bundle
:   A **DNA bundle**.
:   A group of **commits** that succeed or fail 'atomically', like a transaction in an SQL database.

Byzantine fault tolerance (BFT)
:   Describes a **distributed system** that can still come to consistency 'Byzantine failures', accidental or intentional failures in **nodes** or the networking transport between them.

Capability-based security
:   A security model that allows the owner of a resource to maintain control over it. Instead of giving others direct access to the resource, it mediates access itself and manages privileges by issuing **capability tokens**. An agent's conductor uses capability-based security to protect their running **DNA instances** and grant access to **clients** on the same machine, as well as other DNA instances via **bridging**.

Capability grant
:   A special **private entry** that an **agent** writes to their **source chain**. It records the capability being granted, along with the recipient of the grant. The address of this grant becomes the **capability token**.

Capability claim
:   A special **source chain entry** that an **agent** writes to their **source chain**. It records the **capability token** that they received, and allows them to exercise their claim later.

Capability token
:   The address of a **capability grant**. It serves as proof that some agent is allowed to make a claim on a capability.

Client
:   Any piece of software on a user's machine that accesses a **DNA instance**'s **zome functions**. It makes these function calls over the **conductor**'s **RPC interface**. This client can be a **GUI**, a shell script, a service, or a scheduled task. This client lives on the same machine as the conductor.

Commit
:   The act of adding an **entry** to a **source chain**. If an entry is a **public entry** it also gets **published** to the DHT.

Commons
:   Any resource that is used by a group of agents and owned by no agent. In order to survive, a commons must have rules governing its use. A Holochain **DHT** is a type of commons.

Conductor
:   The service that hosts all of a participant's **DNA instances**, storing data and connecting them to others in the network. Synonymous with a Holochain **node**.

Conductor API
:   The **RPC interface** that a **conductor** exposes, which allows locally running **clients** to access and manipulate configuration of **DNAs**, **agents**, **instances**, and **RPC interfaces**

Conflict-free replicated data type (CRDT)
:   A function that allows two **nodes** in a **distributed system** to separately make changes to the same piece of data without creating conflicts. A CRDT is **logically monotonic**, which means that it satisfies the **CALM theorem** and doesn't need a **coordination protocol**.

Consensus
:   Synonymous with **consistency**.
:   Synonymous with **global consensus**.

Consistency
:   Agreement among **nodes** in a **distributed system** about the state of data. **Blockchains** enforce 'global' consensus, which means that all nodes share the same data structure. Holochain prefers small-scale consensus, either between interacting parties or among a small set of third-party **validators**.

Consistency/availability/partition-tolerance (CAP) theorem
:   A principle that states that all **distributed systems** are prone to 'partitions' (some groups of nodes becoming unavailable to each other), and that in the presence of a partition you can only guarantee _availability_ (data can always be accessed and written) or _consistency_ (data is always correct), but not both.

Consistency as logical monotonicity (CALM) theorem
:   A principle that states that, as long as a function is **logically monotonic**, it can be run on multiple **nodes** in a **distrubted system** and reach **eventual consistency** without needing **coordination protocols**.

Coordination protocol
:   An algorithm that governs the movement of data in a **distributed system**. It aims to prevent or resolve data conflicts that happen when two **nodes** are out of sync with each other.

Core API
:   See **Holochain Core API**.

Create, read, update, delete (CRUD)
:   The four main things an application needs to do with data. Even though all data structures in Holochain are **append-only**, data can still be updated or deleted by adding a new entry that marks the old data as obsolete.

Decentralization
:   The act of removing central points of power. Many **distributed systems** are decentralized to various degrees.

DeepKey
:   Holochain's standard **distributed public key infrastructure** library.

DHT entry
:   A public **entry** that lives on the **DHT**. DHT entries are assigned to a **neighborhood** of **validators**, are **deduplicated**, can have many authors, and have **metadata** attached to them in **aspects**.

Distributed hash table (DHT)
:   A collection of data stored collectively by many **nodes** in a **distributed system**. A node retrieves data by address (usually its cryptographic **hash**), searching for a **peer** that is responsible for holding the data. Holochain uses a **validating DHT** to store **public entries**. Each **DNA** has its own separate DHT.

Distributed ledger technology (DLT)
:   Any technology that involves many **nodes** in a distributed system sharing an **append-only** history of **state changes**. In Holochain, each **agent** stores their own history in their **source chain** and shares copies of it with **peers**.

Distributed public key infrastructure (DPKI)
:   A **public key infrastructure** that doesn't rely on a central authority. **DeepKey** is Holochain's default DPKI implementation.

Distributed system
:   Any system that involves multiple **nodes** talking to each other over a network. Because communication isn't instantaneous, different agents can create conflicting data. Many distributed systems use a **coordination protocol** to come to **consistency**, while others rely on the **CALM theorem**.

DNA
:   A **package** of executable code that defines the shared 'rules of the game' for a group of agents. A DNA is made up of **zomes**, which define **validation rules** for data and **zome functions** for agents to take action.

DNA bundle
:   A package containing multiple DNA packages that are instantiated together to form the **back end** for a **hApp**.

DNA instance
:   A particular Holochain DNA when it's bound to a **public/private key pair**. DNA + key pair = instance.

Entry
:   A record of some sort. Each entry has its own defined type with a data schema and validation rules. When an agent **commits** an entry, it is written to their **source chain**. If it's marked as a **public entry**, it's also **published** to the DHT.

Eventual consistency
:   Describes a promise made by distributed systems that optimize for availability over consistency (see **CAP theorem**), meaning that given enough time, every **node** ought to eventually reach **consistency** with each other. _Strong_ eventual consistency means nodes are _guaranteed_ to reach consistency without conflicts, which is possible for any system whose **state change** functions adhere to the **CALM principle**.

Front end
:   Synonymous with **graphical user interface**.

Global ledger
:   A **ledger** shared by all **nodes** in a **blockchain**.

Gossip
:   A protocol used by many **peer-to-peer networks**. Each **node** knows a few other nodes, who know a few more, and so forth. Whenever any node receives a message, they broadcast it to some or all of their peers. Data propagates slowly at first, but spreads at an exponential rate.

Graphical user interface (GUI)
:   A **client** that presents a visual, easy-to-understand way for a user to interact with a **DNA instance** or collection of instances running in their **conductor**. As with any client, the GUI always runs on the same machine as the conductor.

Hash
:   A unique 'fingerprint' for a piece of data, calculated by running the data through a special function. A hash can serve as a unique identifier for that data (such as with **addresses** of **DHT entries**) and makes it easy to retrieve data from a hash table and verify its integrity.

Hash chain
:   An **append-only** data structure that can be used as a tamper-evident sequential log of events, such as a **source chain** or **blockchain**.

Holochain Development Kit (HDK)
:   Holochain's standard software development kit for **zome** and **DNA** developers. It proides developer-friendly access to the low-level **Holochain core API** as well as macros for defining **entry** and **link** types, **validation functions**, and **init functions**.

Holochain application (hApp)
:   A collection of **DNAs** and a **client** (or clients) that allow users to interact with those DNAs.

Holochain Core
:   The basic components of Holochain. The **conductor**, the **nucleus**, and the **ribosome**.

Holochain Core API
:   The set of core functions that the **nucleus** makes available to the **ribosome**, so the **ribosome** can make them available to a running **DNA instance**. These functions allow the DNA to access and manipulate an **agent**'s **source chain**, run cryptographic functions, retrieve and write **DHT entries** and **links**, and send **node-to-node messages** to **peers**.

Immune system
:   A property of Holochain's **validating DHT**, whereby healthy **nodes** collect detect bad data and take defensive action against corrupt nodes.

Init callback
:   A function in a **DNA** that the **nucleus** calls when an **agent** runs the **DNA instance** for the first time. This can be used to set up initial variables, etc.

Intrinsic data integrity
:   Holochain's fundamental strategy for guaranteeing data integrity. Data is considered valid or invalid based on the **DNA's** **validation rules** as well as Holochain's **subconscious** validation rules.

Journal
:   Synonymous with **ledger**.

Ledger
:   A history of events or **state changes**. In **distributed ledger technology**, ledgers are stored as **hash chains**, such as a Holochain agent's **source chain**.

Link
:   A piece of **metadata** connecting one **DHT entry** to another. Each link has a defined type as well as a 'tag' for storing arbitrary content.

Logical monotonicity
:   

Membrane
:   Any permeable boundary that allows appropriate access and disallows inappropriate access.
:   The layer of protection around an **agent**'s **DNA instance** (provided by **capability-based security**) that prevents unauthorized access to the instance or its source chain data.
:   A special **validation rule** for the **agent ID** entry that governs the **agent**'s ability to become part of the **DHT**.

Metadata
:   Supplementary data attached to a piece of data. In a Holochain **DHT**, metadata such as **links** are stored on **entries** as **aspects**.

Microservice
:   An application architecture pattern that encourages small, single-purpose **back end** services. Holochain **DNAs** can be designed as microservices that combine to form a fully featured **hApp**.

Mutual sovereignty
:   The tension between the autonomy of the individual and the collective intentions of the group. A successful **commons** finds a healthy balance between these opposites. Holochain's design is based on this principle, empowering **participants** to control their own identity and their response to their peers, while also equipping the entire **network** to govern affairs to suit their intentions.

Nearness
:   The proximity of two **addresses** to each other in the **DHT**'s **address space**.

Neighborhood
:   A collection of **nodes** in a Holochain **DHT** who are **near** to each other (in terms of **address space**, not geography). Neighbors collectively support the **resilience** of all **DHT entries** whose **address** is near to them by storing and **validating** those entries and **gossiping** to each other about the entries they have.

Network
:   A community of **nodes** **gossiping** with each other to form a **validating DHT**, aiding in data storage and retrieval, validation, and peer discovery. Each **DNA** has a separate network.

Node
:   An individual **agent** in a Holochain **network**. It has an **agent address** and can be talked to via **gossip**.

Node-to-node message
:   A direct, end-to-end-encrypted exchange between two **nodes** on a **network**.

Nucleus
:   The core of Holochain. It governs data flow between the **conductor** and a **DNA instance**, with the help of the **ribosome**, and enforces the **subconscious** **validation rules**.

Package
:   Synonymous with **DNA**.
:   The act of compiling source code and metadata into a **DNA** package.

Participant
:   Synonymous with 'user'. We often prefer the term 'participant' because a Holochain **DHT** is a **commons** of **mutually sovereign** peers who all actively participate to maintain its integrity.

Peer
:   Synonymous with **node**.

Peer-to-peer
:   Describes a **distributed system** in which **nodes** talk directly to each other without the intermediation of a central server.

Private entry
:   An **entry** which is stored on the **source chain** but not **published** to the **DHT**.

Provenance
:   A **public key** and a **public-key signature**, stored as a piece of metadata on a **DHT entry**. It proves that an **agent** actually authored the entry, and allows anyone to verify that it hasn't been tampered with by a third party.

Public entry
:   Synonymous with **DHT entry**. Any entry marked public will be **published** to the **DHT**.

Public-key cryptography
:   A cryptographic system that consists of two keys: a public component and a private or secret component. These keys are mathematically related to each other in a way that's easy for the key pair's owner to prove but nearly impossible for a third-party to reverse-engineer. In Holochain, the public key lives in the **DHT** as an **agent**'s identity and the private key stays on the agent's device as a proof that they control their public key. **Peers** can verify an agent's claim of authorship on an entry by checking their **provenance**, or can use an agent's public key to encrypt a private message that only they can decrypt.

Public-key infrastructure (PKI)
:   A way for agents to share their public keys, prove their authenticity, and revoke old keys if they've been compromised. Most PKIs, such as the global SSL certficate authority system, are centralized. Holochain provides a **distributed PKI** system.

Public-key signature
:   The hash of a piece of data, encrypted with a private key. It can be decrypted by anyone who has a copy of the public key. In Holochain, this is used in a **provenance** on each **DHT entry** to prove authorship and detect third-party tampering.

Public/private key pair
:   See **public-key cryptography**.

Publish
:   To send a **public entry** to the **DHT** after it has passed the author's own copy of the **validation rules** for the entry. The **neighborhood** of **validators** who are responsible for that entry's **address** receive it, validate it, and store a copy of it if it's valid.

Remote procedure call (RPC)
:   In Holochain, a call that a **client** makes to a **zome function** or **conductor API** function over an RPC interace.

RPC interface
:   A network port that the **conductor** exposes, allowing **clients** to call the **conductor API** or make **zome function calls** to running **DNA instances**. This interface only listens for local connections (so it can't be accessed over the internet). That means that clients must be on the same machine as the conductor.

Resilience
:   The level of a **network**'s capacity to hold itself in integrity as **nodes** leave and join the network and dishonest nodes try to corrupt it.
:   The level of redundancy of a **DHT entry**, expected to correspond to the **resilience factor** of the DNA.

Resilience factor
:   The desired number of copies of a **DHT entry** that should exist in a **DHT**. This value is set in the **DNA** by its creator. **Nodes** in a **neighborhood** who are responsible for an entry collectively work to make sure this factor is met at all times.

Ribosome
:   The 'sandbox' or 'virtual machine' inside which a **DNA instance** runs. In Holochain's current design, the ribosome is a **WebAssembly** interpreter that exposes Holochain's **core API** to the instance and allows the **nucleus** to call the instance's **validation functions**, **init function**, and other callbacks.

Rust
:   The programming language used to build both Holochain and **DNAs**.

Scenario test
:   An automated test involving multiple **agents** on a simulated **network**. **DNA** creators can write these tests to ensure that their code works properly in real-life scenarios.

Source chain
:   A **hash chain** of actions taken by an **agent**. For each **DHT**, every agent stores their own source chain as a record of **state changes** they've made --- that is, **entries** they've committed.

Source chain entry
:   An individual record stored on a **source chain**. It may be a **private entry**, in which case it lives only on the source chain, or it may be a **public entry**, in which case it's also **published** to the **DHT**.

Source chain header
:   A meta-entry that links a **source chain entry** to the previous entry in an **agent**'s **source chain**.

State change
:   A modification of application state. In Holochain, state changes begin life in an **agent**'s **source chain** as **entries** and are optionally **published** to the **DHT** as a permanent public record.

Subconscious
:   The 'base' **validation rules** defined by the Holochain **nucleus**. These rules check validity of **hashes** and **provenances**, as well as the integrity of each **agent**'s source chain.

Trustless
:   Describes a **peer-to-peer** **distributed system** which is **Byzantine fault tolerant** even when it is 'permissionless' (that is, any number of anonymous agents can become peers). Trust is placed in the quality of the algorithm and the game theory that underpins it, rather than in any human entity.

Validating DHT
:   Holochain's **DHT** design that creates an **immune system**. **Validators** are chosen at random, based on their **nearness** to the **address** of the **entry** to be validated. If an entry fails validation, the validator publishes a **warrant** against the entry's author, along with proof of invalidity.

Validation rule
:   A function that checks the correctness of an **entry**. If validation fails, a **validator** can publish a **warrant** proving that the entry's author has broken the 'rules of the game' in the **DNA**'s executable code.

Validation signature
:   A **provenance** created by the **validator** of a **DHT entry**, attesting to the validity of that entry according to its **validation rule**.

Validator
:   A **node** in the **validating DHT** who is chosen at random to validate a **DHT entry**, based on their **agent address**' **nearness** to the address of the entry. After validating, they also store the entry and help maintain its **resilience**.

Warrant
:   An entry created by the **validator** of a **DHT entry**, attesting that the entry is invalid according to its **validation rule** and proving that its author has broken the 'rules of the game' in the **DNA**'s executable code.

WebAssembly (WASM)
:   A low-level byte code that can be run on almost any platform, including the web browser. Holochain expects **DNAs** to be compiled to WebAssembly so the **ribosome** can execute them.

Zome
:   A basic unit of modularity inside a **DNA**. Zome can be mixed and matched from other DNAs into one DNA in the service of the needs of a **network**. This zome defines **entry** types, **link** types, validation functions, public **zome functions**, and **init functions**.

Zome function
:   A function, created by the author of a **zome**, that allows a **client** to take a particular action in a **DNA instance**. This includes data retrieval and storage, as well as node-to-node messaging. The zome functions act as a public API for the **zome**, and can be called by another zome within the same **DNA**, a **bridged** **DNA instance** within the same **conductor**, or a **client** via the conductor's **RPC interface**.

Zome function call
:   The act of calling a **zome function**.