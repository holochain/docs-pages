# Holochain Glossary

As you go through our documentation you'll probably find some unfamiliar terms, or familiar ones used in surprising ways. Here are the definitions we use.

Address
:   The unique ID of an _entry_ on the _DHT_. Every entry has an address that is generated from its content, usually by a _hash_ function.

Address space
:   The entire range of possible _addresses_ on the _DHT_. This space is circular; that is, the max address is considered adjacent to address 0.

Agent
:   A _conductor_ running one or more _DNA instances_, either on behalf of a person or as a bot. A person may own more than one device, each of which is a separate agent in a given _network_.

Agent address
:   The address of an agent ID entry on the DHT, calculated from the agent's _public key_. It is used in _node-to-node messaging_ and in choosing _validators_ for _public entries_.

Agent ID
:   An _entry_ near the beginning of an agent's source chain that identifies them. It contains their public key and other identifying information. This entry becomes an agent's unique identifier on the _DHT_. The address of this entry is the _agent's address_ on the DHT.

Append-only
:   Describes any data structure that can only be written to. Once written, data is 'immutable', which means it can't be modified or deleted. An agent's _source chain_ and the _DHT_ are both append-only, which makes them _logically monotonic_.

Application (app)
:   A collection of _back end_ and _front end_ components that comprise something a person can actually use.

Aspect
:   A piece of metadata on an entry, such as a _link_, _provenance_, _validation signature_, _warrant_, or _CRUD_ status.

Author
:   The _agent_ who has _published_ a _DHT entry_, as shown by their _provenance_.

Back end
:   Synonymous with a collection of _DNA instances_ for a _hApp_ --- the code that contains the base-level persistence and validation logic.

Blockchain
:   A distributed system that promises _Byzantine fault tolerance_ by using a _coordination protocol_ to get all nodes to agree on a single, shared history of events. This history is stored as a _hash chain_ of 'blocks', or bundles of _state changes_. A blockchain can be public (anyone can join) or permissioned/private (membership is controlled). Public blockchains are usually _trustless_, ensuring tamper-resistance by making participation costly.

Bridge
:   A connection between _DNA instances_ in one conductor that allows one instance to call another instance's _zome functions_.

Bundle
:   A _DNA bundle_.
:   A group of _commits_ that succeed or fail 'atomically', like a transaction in an SQL database.

Byzantine fault tolerance (BFT)
:   Describes a _distributed system_ that can still come to consistency 'Byzantine failures', accidental or intentional failures in _nodes_ or the networking transport between them.

Capability-based security
:   A security model that allows the owner of a resource to maintain control over it. Instead of giving others direct access to the resource, it mediates access itself and manages privileges by issuing _capability tokens_. An agent's conductor uses capability-based security to protect their running _DNA instances_ and grant access to _clients_ on the same machine, as well as other DNA instances via _bridging_.

Capability grant
:   A special _private entry_ that an _agent_ writes to their _source chain_. It records the capability being granted, along with the recipient of the grant. The address of this grant becomes the _capability token_.

Capability claim
:   A special _source chain entry_ that an _agent_ writes to their _source chain_. It records the _capability token_ that they received, and allows them to exercise their claim later.

Capability token
:   The address of a _capability grant_. It serves as proof that some agent is allowed to make a claim on a capability.

Client
:   Any piece of software on a user's machine that accesses a _DNA instance_'s _zome functions_. It makes these function calls over the _conductor_'s _RPC interface_. This client can be a _GUI_, a shell script, a service, or a scheduled task. This client lives on the same machine as the conductor.

Commit
:   The act of adding an _entry_ to a _source chain_. If an entry is a _public entry_ it also gets _published_ to the DHT.

Commons
:   Any resource that is used by a group of agents and owned by no agent. In order to survive, a commons must have rules governing its use. A Holochain _DHT_ is a type of commons.

Conductor
:   The service that hosts all of a participant's _DNA instances_, storing data and connecting them to others in the network. Synonymous with a Holochain _node_.

Conductor API
:   The _RPC interface_ that a _conductor_ exposes, which allows locally running _clients_ to access and manipulate configuration of _DNAs_, _agents_, _instances_, and _RPC interfaces_

Conflict-free replicated data type (CRDT)
:   A function that allows two _nodes_ in a _distributed system_ to separately make changes to the same piece of data without creating conflicts. A CRDT is _logically monotonic_, which means that it satisfies the _CALM theorem_ and doesn't need a _coordination protocol_.

Consensus
:   Synonymous with _consistency_.
:   Synonymous with _global consensus_.

Consistency
:   Agreement among _nodes_ in a _distributed system_ about the state of data. _Blockchains_ enforce 'global' consensus, which means that all nodes share the same data structure. Holochain prefers small-scale consensus, either between interacting parties or among a small set of third-party _validators_.

Consistency/availability/partition-tolerance (CAP) theorem
:   A principle that states that all _distributed systems_ are prone to 'partitions' (some groups of nodes becoming unavailable to each other), and that in the presence of a partition you can only guarantee _availability_ (data can always be accessed and written) or _consistency_ (data is always correct), but not both.

Consistency as logical monotonicity (CALM) theorem
:   A principle that states that, as long as a function is _logically monotonic_, it can be run on multiple _nodes_ in a _distrubted system_ and reach _eventual consistency_ without needing _coordination protocols_.

Coordination protocol
:   An algorithm that governs the movement of data in a _distributed system_. It aims to prevent or resolve data conflicts that happen when two _nodes_ are out of sync with each other.

Core API
:   See _Holochain Core API_.

Create, read, update, delete (CRUD)
:   The four main things an application needs to do with data. Even though all data structures in Holochain are _append-only_, data can still be updated or deleted by adding a new entry that marks the old data as obsolete.

Decentralization
:   The act of removing central points of power. Many _distributed systems_ are decentralized to various degrees.

DeepKey
:   Holochain's standard _distributed public key infrastructure_ library.

DHT entry
:   A public _entry_ that lives on the _DHT_. DHT entries are assigned to a _neighborhood_ of _validators_, are _deduplicated_, can have many authors, and have _metadata_ attached to them in _aspects_.

Distributed hash table (DHT)
:   A collection of data stored collectively by many _nodes_ in a _distributed system_. A node retrieves data by address (usually its cryptographic _hash_), searching for a _peer_ that is responsible for holding the data. Holochain uses a _validating DHT_ to store _public entries_. Each _DNA_ has its own separate DHT.

Distributed ledger technology (DLT)
:   Any technology that involves many _nodes_ in a distributed system sharing an _append-only_ history of _state changes_. In Holochain, each _agent_ stores their own history in their _source chain_ and shares copies of it with _peers_.

Distributed public key infrastructure (DPKI)
:   A _public key infrastructure_ that doesn't rely on a central authority. _DeepKey_ is Holochain's default DPKI implementation.

Distributed system
:   Any system that involves multiple _nodes_ talking to each other over a network. Because communication isn't instantaneous, different agents can create conflicting data. Many distributed systems use a _coordination protocol_ to come to _consistency_, while others rely on the _CALM theorem_.

DNA
:   A _package_ of executable code that defines the shared 'rules of the game' for a group of agents. A DNA is made up of _zomes_, which define _validation rules_ for data and _zome functions_ for agents to take action.

DNA bundle
:   A package containing multiple DNA packages that are instantiated together to form the _back end_ for a _hApp_.

DNA instance
:   A particular Holochain DNA when it's bound to a _public/private key pair_. DNA + key pair = instance.

Entry
:   A record of some sort. Each entry has its own defined type with a data schema and validation rules. When an agent _commits_ an entry, it is written to their _source chain_. If it's marked as a _public entry_, it's also _published_ to the DHT.

Eventual consistency
:   Describes a promise made by distributed systems that optimize for availability over consistency (see _CAP theorem_), meaning that given enough time, every _node_ ought to eventually reach _consistency_ with each other. _Strong_ eventual consistency means nodes are _guaranteed_ to reach consistency without conflicts, which is possible for any system whose _state change_ functions adhere to the _CALM principle_.

Front end
:   Synonymous with _graphical user interface_.

Global ledger
:   A _ledger_ shared by all _nodes_ in a _blockchain_.

Gossip
:   A protocol used by many _peer-to-peer networks_. Each _node_ knows a few other nodes, who know a few more, and so forth. Whenever any node receives a message, they broadcast it to some or all of their peers. Data propagates slowly at first, but spreads at an exponential rate.

Graphical user interface (GUI)
:   A _client_ that presents a visual, easy-to-understand way for a user to interact with a _DNA instance_ or collection of instances running in their _conductor_. As with any client, the GUI always runs on the same machine as the conductor.

Hash
:   A unique 'fingerprint' for a piece of data, calculated by running the data through a special function. A hash can serve as a unique identifier for that data (such as with _addresses_ of _DHT entries_) and makes it easy to retrieve data from a hash table and verify its integrity.

Hash chain
:   An _append-only_ data structure that can be used as a tamper-evident sequential log of events, such as a _source chain_ or _blockchain_.

Holochain Development Kit (HDK)
:   Holochain's standard software development kit for _zome_ and _DNA_ developers. It proides developer-friendly access to the low-level _Holochain core API_ as well as macros for defining _entry_ and _link_ types, _validation functions_, and _init functions_.

Holochain application (hApp)
:   A collection of _DNAs_ and a _client_ (or clients) that allow users to interact with those DNAs.

Holochain Core
:   The basic components of Holochain. The _conductor_, the _nucleus_, and the _ribosome_.

Holochain Core API
:   The set of core functions that the _nucleus_ makes available to the _ribosome_, so the _ribosome_ can make them available to a running _DNA instance_. These functions allow the DNA to access and manipulate an _agent_'s _source chain_, run cryptographic functions, retrieve and write _DHT entries_ and _links_, and send _node-to-node messages_ to _peers_.

Immune system
:   A property of Holochain's _validating DHT_, whereby healthy _nodes_ collect detect bad data and take defensive action against corrupt nodes.

Init callback
:   A function in a _DNA_ that the _nucleus_ calls when an _agent_ runs the _DNA instance_ for the first time. This can be used to set up initial variables, etc.

Intrinsic data integrity
:   Holochain's fundamental strategy for guaranteeing data integrity. Data is considered valid or invalid based on the _DNA's_ _validation rules_ as well as Holochain's _subconscious_ validation rules.

Journal
:   Synonymous with _ledger_.

Ledger
:   A history of events or _state changes_. In _distributed ledger technology_, ledgers are stored as _hash chains_, such as a Holochain agent's _source chain_.

Link
:   A piece of _metadata_ connecting one _DHT entry_ to another. Each link has a defined type as well as a 'tag' for storing arbitrary content.

Logical monotonicity
:   

Membrane
:   Any permeable boundary that allows appropriate access and disallows inappropriate access.
:   The layer of protection around an _agent_'s _DNA instance_ (provided by _capability-based security_) that prevents unauthorized access to the instance or its source chain data.
:   A special _validation rule_ for the _agent ID_ entry that governs the _agent_'s ability to become part of the _DHT_.

Metadata
:   Supplementary data attached to a piece of data. In a Holochain _DHT_, metadata such as _links_ are stored on _entries_ as _aspects_.

Microservice
:   An application architecture pattern that encourages small, single-purpose _back end_ services. Holochain _DNAs_ can be designed as microservices that combine to form a fully featured _hApp_.

Mutual sovereignty
:   The tension between the autonomy of the individual and the collective intentions of the group. A successful _commons_ finds a healthy balance between these opposites. Holochain's design is based on this principle, empowering _participants_ to control their own identity and their response to their peers, while also equipping the entire _network_ to govern affairs to suit their intentions.

Nearness
:   The proximity of two _addresses_ to each other in the _DHT_'s _address space_.

Neighborhood
:   A collection of _nodes_ in a Holochain _DHT_ who are _near_ to each other (in terms of _address space_, not geography). Neighbors collectively support the _resilience_ of all _DHT entries_ whose _address_ is near to them by storing and _validating_ those entries and _gossiping_ to each other about the entries they have.

Network
:   A community of _nodes_ _gossiping_ with each other to form a _validating DHT_, aiding in data storage and retrieval, validation, and peer discovery. Each _DNA_ has a separate network.

Node
:   An individual _agent_ in a Holochain _network_. It has an _agent address_ and can be talked to via _gossip_.

Node-to-node message
:   A direct, end-to-end-encrypted exchange between two _nodes_ on a _network_.

Nucleus
:   The core of Holochain. It governs data flow between the _conductor_ and a _DNA instance_, with the help of the _ribosome_, and enforces the _subconscious_ _validation rules_.

Package
:   Synonymous with _DNA_.
:   The act of compiling source code and metadata into a _DNA_ package.

Participant
:   Synonymous with 'user'. We often prefer the term 'participant' because a Holochain _DHT_ is a _commons_ of _mutually sovereign_ peers who all actively participate to maintain its integrity.

Peer
:   Synonymous with _node_.

Peer-to-peer
:   Describes a _distributed system_ in which _nodes_ talk directly to each other without the intermediation of a central server.

Private entry
:   An _entry_ which is stored on the _source chain_ but not _published_ to the _DHT_.

Provenance
:   A _public key_ and a _public-key signature_, stored as a piece of metadata on a _DHT entry_. It proves that an _agent_ actually authored the entry, and allows anyone to verify that it hasn't been tampered with by a third party.

Public entry
:   Synonymous with _DHT entry_. Any entry marked public will be _published_ to the _DHT_.

Public-key cryptography
:   A cryptographic system that consists of two keys: a public component and a private or secret component. These keys are mathematically related to each other in a way that's easy for the key pair's owner to prove but nearly impossible for a third-party to reverse-engineer. In Holochain, the public key lives in the _DHT_ as an _agent_'s identity and the private key stays on the agent's device as a proof that they control their public key. _Peers_ can verify an agent's claim of authorship on an entry by checking their _provenance_, or can use an agent's public key to encrypt a private message that only they can decrypt.

Public-key infrastructure (PKI)
:   A way for agents to share their public keys, prove their authenticity, and revoke old keys if they've been compromised. Most PKIs, such as the global SSL certficate authority system, are centralized. Holochain provides a _distributed PKI_ system.

Public-key signature
:   The hash of a piece of data, encrypted with a private key. It can be decrypted by anyone who has a copy of the public key. In Holochain, this is used in a _provenance_ on each _DHT entry_ to prove authorship and detect third-party tampering.

Public/private key pair
:   See _public-key cryptography_.

Publish
:   To send a _public entry_ to the _DHT_ after it has passed the author's own copy of the _validation rules_ for the entry. The _neighborhood_ of _validators_ who are responsible for that entry's _address_ receive it, validate it, and store a copy of it if it's valid.

Remote procedure call (RPC)
:   In Holochain, a call that a _client_ makes to a _zome function_ or _conductor API_ function over an RPC interace.

RPC interface
:   A network port that the _conductor_ exposes, allowing _clients_ to call the _conductor API_ or make _zome function calls_ to running _DNA instances_. This interface only listens for local connections (so it can't be accessed over the internet). That means that clients must be on the same machine as the conductor.

Resilience
:   The level of a _network_'s capacity to hold itself in integrity as _nodes_ leave and join the network and dishonest nodes try to corrupt it.
:   The level of redundancy of a _DHT entry_, expected to correspond to the _resilience factor_ of the DNA.

Resilience factor
:   The desired number of copies of a _DHT entry_ that should exist in a _DHT_. This value is set in the _DNA_ by its creator. _Nodes_ in a _neighborhood_ who are responsible for an entry collectively work to make sure this factor is met at all times.

Ribosome
:   The 'sandbox' or 'virtual machine' inside which a _DNA instance_ runs. In Holochain's current design, the ribosome is a _WebAssembly_ interpreter that exposes Holochain's _core API_ to the instance and allows the _nucleus_ to call the instance's _validation functions_, _init function_, and other callbacks.

Rust
:   The programming language used to build both Holochain and _DNAs_.

Scenario test
:   An automated test involving multiple _agents_ on a simulated _network_. _DNA_ creators can write these tests to ensure that their code works properly in real-life scenarios.

Source chain
:   A _hash chain_ of actions taken by an _agent_. For each _DHT_, every agent stores their own source chain as a record of _state changes_ they've made --- that is, _entries_ they've committed.

Source chain entry
:   An individual record stored on a _source chain_. It may be a _private entry_, in which case it lives only on the source chain, or it may be a _public entry_, in which case it's also _published_ to the _DHT_.

Source chain header
:   A meta-entry that links a _source chain entry_ to the previous entry in an _agent_'s _source chain_.

State change
:   A modification of application state. In Holochain, state changes begin life in an _agent_'s _source chain_ as _entries_ and are optionally _published_ to the _DHT_ as a permanent public record.

Subconscious
:   The 'base' _validation rules_ defined by the Holochain _nucleus_. These rules check validity of _hashes_ and _provenances_, as well as the integrity of each _agent_'s source chain.

Trustless
:   Describes a _peer-to-peer_ _distributed system_ which is _Byzantine fault tolerant_ even when it is 'permissionless' (that is, any number of anonymous agents can become peers). Trust is placed in the quality of the algorithm and the game theory that underpins it, rather than in any human entity.

Validating DHT
:   Holochain's _DHT_ design that creates an _immune system_. _Validators_ are chosen at random, based on their _nearness_ to the _address_ of the _entry_ to be validated. If an entry fails validation, the validator publishes a _warrant_ against the entry's author, along with proof of invalidity.

Validation rule
:   A function that checks the correctness of an _entry_. If validation fails, a _validator_ can publish a _warrant_ proving that the entry's author has broken the 'rules of the game' in the _DNA_'s executable code.

Validation signature
:   A _provenance_ created by the _validator_ of a _DHT entry_, attesting to the validity of that entry according to its _validation rule_.

Validator
:   A _node_ in the _validating DHT_ who is chosen at random to validate a _DHT entry_, based on their _agent address_' _nearness_ to the address of the entry. After validating, they also store the entry and help maintain its _resilience_.

Warrant
:   An entry created by the _validator_ of a _DHT entry_, attesting that the entry is invalid according to its _validation rule_ and proving that its author has broken the 'rules of the game' in the _DNA_'s executable code.

WebAssembly (WASM)
:   A low-level byte code that can be run on almost any platform, including the web browser. Holochain expects _DNAs_ to be compiled to WebAssembly so the _ribosome_ can execute them.

Zome
:   A basic unit of modularity inside a _DNA_. Zome can be mixed and matched from other DNAs into one DNA in the service of the needs of a _network_. This zome defines _entry_ types, _link_ types, validation functions, public _zome functions_, and _init functions_.

Zome function
:   A function, created by the author of a _zome_, that allows a _client_ to take a particular action in a _DNA instance_. This includes data retrieval and storage, as well as node-to-node messaging. The zome functions act as a public API for the _zome_, and can be called by another zome within the same _DNA_, a _bridged_ _DNA instance_ within the same _conductor_, or a _client_ via the conductor's _RPC interface_.

Zome function call
:   The act of calling a _zome function_.