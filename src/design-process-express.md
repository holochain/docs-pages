# Designing A Holochain Application (the express version)

<div class="coreconcepts-intro" markdown=1>
So you've decided to create a Holochain app. Now you're wondering, _Where do I start? How do I know I'm on the right track? What do I need to remember in my design? This guide is a very brief orientation to the process of designing a Holochain app.
</div>

<div class="coreconcepts-orientation" markdown=1>
## Who this guide is for

You'll find this useful if you're a developer or software architect who has decided to create a Holochain application but isn't sure where to start.

## What you'll learn

* The components you need to design
* The agent-centric paradigm and how it affects your architectural choices
* The building blocks of modularity you can use to separate and reuse functionality
* How to design your authentication, authorization, and access control
* How Holochain influences your data model
* How to write a good validation rule
* Where to put your application logic
* The three types of interface that form your back end's API
* How to connect a user interface or other client
* The steps to scaffolding and writing your code
* Available development and testing tools
* How the application architecture design process fits into the larger design process

## Why it matters

A disciplined process of generating a design for your application will give you confidence that you've addressed all the components you need to address.
</div>

## The design process

There are already many good resources about the design process. We don't want to duplicate their work here, so we encourage you to seek out good books, articles, and courses about the design process, especially **user-centered design** and **user experience (UX)**. There are lots of different methods, but most people describe a process that involves:

1. **Observe**: Collect information on the problem space, then identify your constraints and available resources. Observe without analysis or prejudice in order to collect as much information as possible.
2. **Analyze**: Explore the meaning of the facts you've collected; ask why this problem exists, what can be done about it, and why you've chosen to tackle it. Examine your starting questions, assumptions, and thinking process. Have you framed the problem correctly and gathered the right observations, or do you need to expand your context and gather more observations?
3. **Design**: Come up with a few possible solutions to the problem, guided by your analysis. Challenge the validity of your designs This is where UX can offer guidance; it asks, "why does the user care about this solution, how does it help solve their problem, and what is it like to use it?"
4. **Implement**: Build the thing. Create prototypes; write code.
5. **Test**: Get your product into the hands of users; allow them to challenge your assumptions and solutions. Accept feedback and use it to improve your product.
6. **Maintain**: Devote energy to supporting and improving your offering.

This process seems clear and linear, but in the daily reality of creating your product it becomes blurry, circular, and sometimes even recursive. It's hard to avoid analysis in the observation phase; the implementation phase uncovers new constraints and provokes a new analysis/design phase; and the testing phase leads to new observations. You may go through several cycles of design, implementation, and testing at increasing levels of fidelity, from paper prototypes to clickable GUIs to throwaway code to production-ready code to release version 2 and beyond.

Most importantly for you, during the implementation phase there is a miniature design process of its own. That inner design process is what we cover here. We assume that you've already asked the big questions and are ready to start creating software. We also assume that you have basic knowledge of how Holochain works, or know where to find that information.

## 1. Observe

This is the time for gathering data about the technological constraints and resources of your userbase and development team.

What are the constraints of your userbase? How comfortable are they with new technology? What operating systems do they run? How powerful is their hardware? How reliable is their internet connection?

How comfortable is your development team with distributed systems? Do they have experience with the Rust programming language?

## 2. Analyze

Now you can make judgments about the data you've collected. [Is Holochain appropriate for your use case?](../who-is-holochain-for/) If so, what modes of deployment and what UI technologies can your users' hardware and software support? Does your team have the technical knowledge to build this application?

## 3. Design

Now it's time to create the architecture of your application.

### 3.1. Define your app's membranes

Start by asking what sorts of information should be public, privileged, or private, and what determines a user's privilege to read or write this information.

* **Who is allowed to join your application's network?** Existing members of a DHT accept and reject new members by [validating](../glossary/#validation-rule) their [agent ID](../glossary/#agent-id) entry.
* **What credentials do they need to provide in order to gain access?** The agent ID entry contains the user's public key and any extra information needed to grant entry.
* **Who is responsible for distributing and vouching for those credentials?** Validators need to know how to determine whether a credential is valid. How does the app define a valid credential---a signature from a single authority or an existing member of the network, a third-party verifier, or a hard-coded list of pre-approved public keys?
* **Do you need to break your back-end into separate DHTs for fine-grained read access?** When a user becomes a member of a network, they're allowed to read all of its public data, so you may need to create a DNA for each class of access privileges.
* **What kinds of data is a user [allowed to create, update, or delete](#3-6-create-validation-rules-for-your-entries-links-and-delete-update-actions)?** While reads are unrestricted within a network, writes are controlled through validation rules that can be applied differently for different types of data or classes of user.
* **What kinds of data should be [private](../glossary/#private-entry)?** A user can store private data on their source chain and share it with other users via encrypted [node-to-node messaging](../glossary/#node-to-node-message).

### 3.2. Plan your app's modules

Every app should be broken up into composable modules. We won't elaborate on the reasons why, but here's a short list to help you explore how and why you should do this for your app:

* **Code reuse**, both within an app and by third parties
* **Encapsulation / implementation hiding**
* **Access control**
* **Core vs optional functionality**
* **Separation of concerns** by functionality
* **Abstraction of functionality** into generic interfaces with swappable implementations

Instead we're going to focus on how Holochain's architecture affects your decisions. There are a few building blocks of modularity you can use in your application, each with different use cases:

* A [**DNA**](../glossary/#dna) defines the collection of rules that govern a group, or network, of agents. A user's DNAs can easily [bridge](../glossary/#bridge) to other DNAs and access their APIs, as long as that user belongs to both networks. A DNA can also serve as a template for many groups with identical rules but distinct members and data. You can use DNA modularity for:
    * **Fine-grained access control**; e.g., a chat with public and private channels.
    * **Separating core from optional functionality**; e.g., a blog with add-ons for commenting and analytics.
    * **Organizing people or data into separate groups**; e.g., a business network spanning many regions.
* A DNA is made of one or more [**zomes**](../glossary/#zome) that define packages of functionality. Each zome has an API and a set of [entry](../glossary/#entry-type) and [link type](../glossary/#link-type) definitions. You can use zome modularity for:
    * **Separation of concerns** and organization of functionality into logical chunks in your DNA.
    * **Generic utility libraries** for reuse across your DNAs or by other DNA developers; e.g., a timestamping zome.
    * **Implementation hiding** and providing a clean interface for a unit of functionality; e.g., swappable timestamping zomes that expose the same API but provide differing guarantees of timestamp fidelity.
* As a code module, a zome can use a programming language's built-in **module system**. Rust is currently the only zome development language we support, so in practice this means [crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html). You can use this for:
    * **Exporting a zome's native types** for use in other zomes or external code to make input serialization and output deserialization easy.
    * **Generic utility libraries** that reimplement entry types and functions in a zome; e.g., [collection primitives](https://github.org/holochain/holochain-collections/).

### 3.4. Define your entry schemas

[Entry type](../glossary/#entry-type) definitions are the heart of your application's data model. They're similar to table schemas or <abbr title="object-oriented programming">OOP</abbr> classes, allowing you to define what makes an entry of a given type meaningful. Entry content is just [UTF-8](https://en.wikipedia.org/wiki/UTF-8) string data, and we recommend storing your data as JSON to give it structure. You can use Holochain's Rust SDK lets you use Rust's [disciplined yet expressive type system](https://tonyarcieri.com/a-quick-tour-of-rusts-type-system-part-1-sum-types-a-k-a-tagged-unions) to define data structures that are automatically converted to JSON and back.

This process is similar to any data modelling exercise. You start by naming all the 'nouns' in your applications---user profiles, documents, collections, messages, comments, game moves, transaction steps, etc. Then you add 'adjectives'---required or optional fields and their data types. The key Holochain-related things to think about are:

* **[Headers](../glossary/#source-chain-header) already contain some useful data**, including the author's address and a timestamp.
* **The DHT [deduplicates](../glossary/#deduplication/) identical entries**. Sometimes this is what you want; sometimes it isn't. For instance, the word "hello" is not the same as Alice saying "hello" at 17:30 UTC yesterday, nor is Alice's message the same as me saying the same thing at 04:26 PST last Tuesday. For a chat application, you want them to be separate entries so that when Alice deletes her "hello" she doesn't delete everyone else's "hello".

### 3.5. Define the links between DHT entries

If entry type definitions are the heart of your application's data model, [link type](../glossary/#link-type) definitions are its connective tissue. They're similar to [foreign keys](https://en.wikipedia.org/wiki/Foreign_key) and [junction tables](https://en.wikipedia.org/wiki/Associative_entity). You've probably already mapped out the relationships between your data types in the previous step, so now you need to know how to build those relationships on the DHT. Here are the guidelines:

* **You can't query the DHT**, so links are your only way of discovering data. You can only find linked data if you have the address of the [base](../glossary/#link-base) entry.
* **Links can contain metadata** in an arbitrary string [tag](../glossary/#link-tag). You can use this in different ways:
    * You can do [regex](https://en.wikipedia.org/wiki/Regular_expression) filtering on this tag, which gives you the power to do some basic string-based indexing and queries.
    * You can add more information about the nature of the relationship between the base and [target](../glossary/#link-target) entries.
    * You can populate it with selected fields from the target, to avoid having to do a second DHT lookup.
* **You can't perform `JOIN` queries on the DHT**. This means that most relationships will need to have two-way links, and you're responsible for maintaining [referential integrity](https://en.wikipedia.org/wiki/Referential_integrity) on all relationships.
* Model **one-to-many** relationships with:
    * a field in the dependent entry type that contains the address of the primary entry, and
    * links on the primary entry type that point to the dependent entry type.
* Model **many-to-many** relationships with links on both entries, pointing to each other.

### 3.6. Create validation rules for your entries, links, and delete/update actions

Even though we're introducing it late in the process, validation is the essence of your app. It's how you define the 'rules of the game', the domain logic that allows agents to play fairly and discern whether their peers are doing the same.

You're already halfway done with your validation rules---when you designed your entry and link types, you gave your data some structure that the Rust SDK will automatically check for you. If an entry passes this check, your validation function has a chance to perform further checks.

Here are things you can validate:

* Acceptable ranges and values for fields
* Prior state, e.g., transactions that affect a user's account balance
* An entry's validity based on the content of entries on which it depends
* An agent's permission to write (create/update/delete) this type of entry, based on defined roles, recognized authority, whether they authored the original, etc.
* Acceptable time windows for an event to take place
* A link's applicability to its base and target
* The content of a link tag

Considerations for a validation function:

* It should be pure: it should only consider the information explicitly passed to it.
* It should be deterministic: it shouldn't give different results based on who is validating it, when they're validating it, or their current view of the DHT at validation time. If the function is pure, it's already deterministic.
* It returns a binary result: either the entry or link is valid, and the agent is playing by the rules, or it isn't, and they've hacked their software.
* It's performed twice: once when its author commits an entry or link, to catch mistakes; and again when a validator is asked to hold it, to detect corruption.
* A validation error can contain a message; you can use this at commit time to give feedback to the user's UI about what went wrong.
* Because the DHT has already validated the data that it holds, you can assume that an entry's existing dependencies are valid. This lets you speed up validation, which is especially helpful when an entry's validity depends on a large graph of other entries.

### 3.7. Define your app's API

Now that you've defined the nouns, it's time to define the verbs. These fall into three categories:

* [**Zome functions**](../glossary/#zome-function), the 'public' API that the DNA exposes to the user's UI and bridged DNAs
* [**Node-to-node messages**](../glossary/#node-to-node-message), an interface between agents in the DNA's network
* [**Signals**](../glossary/#signal) that the DNA can broadcast to the user's UI in response to incoming messages

Here are things to consider in your API design:

* **What is your application's essential logic?** Pare your DNA down to the bare essentials required for data retrieval, integrity, and interaction between peers; save the rest for the middleware and UI layers.
* **How should a user create and retrieve entries of each type, and what information do they need to provide?**
    * Do they need functions to create, update, or delete an entry?
    * Should they be able to retrieve deleted entries, or should the system hide them?
    * Do they need to retrieve a single entry?
    * Do they need to retrieve an entire collection?
* **How will other DNAs interact with your DNA?** Its zome functions are exposed to bridged DNAs on your user's device; what else do they need?
* **How do the users need to interact with each other?** Messages can be shared asynchronously via DHT, but users can also communicate directly through [node-to-node messaging](../glossary/#node-to-node-message). This creates a sort of agent-to-agent API, which can facilitate things like:
    * **Coordination of time-sensitive interactions**, such as financial transactions.
    * **Sharing of private information**, such as direct messages or health records.
    * **Real-time events**, such as new message notifications or updates to a collaboratively edited document.
* **Does the client need to receive notifications for events?** The DNA can emit [signals](../glossary/#signal) for the UI to act upon. This can be used in combination with node-to-node messaging; a received message can trigger the emission of a signal.
* **What should happen at application startup?** There is one required zome function, the [init callback](../glossary/#init-callback), that allows an agent to add entries to their source chain and the DHT the first time they run the DNA.

### 3.8. Create your user interface and middleware

Because the DNA encodes only the essentials, a fair amount of your application logic may end up somewhere else. Holochain encourages a 'thin' back-end and a 'fat' front-end. If you intend to support multiple UIs, consider creating a 'middleware' layer for common application logic that all UIs can depend on.

You can implement your middleware and UI with any framework and platform that you like, as long as:

* Your users' operating systems supports it, as it will be installed on their devices.
* It can talk to the user's locally running Holochain service via **[JSON-RPC 2.0](https://www.jsonrpc.org/specification) over [WebSocket](https://en.wikipedia.org/wiki/WebSocket)**.

## 4. Implement

Now it's time to write your code! Here are the basic steps:

1. [Install Holochain and the developer tools.](../install/)
2. Create a folder for your project.
3. Write a [hApp bundle](https://github.com/holochain/holoscape/tree/master/example-bundles) manifest file that defines all the necessary DNA instances and the bridges between them.
4. [Create a folder for each of your DNAs.](../create-new-app/#initialize-a-new-app)
5. [Scaffold each of the DNA's zomes](../create-new-app/#generate-a-new-zome) and write your code.
6. Create a UI.

You'll probably end up going back to the design stage occasionally as you discover consequences of one component's design that affect another component.

## 5. Test

Your application's tests fall into two buckets:

* **Unit** tests exercise one component in isolation. They should be guided by your application design---the actions that each function is expected to perform. Rust has [built-in support for unit testing](https://doc.rust-lang.org/book/ch11-01-writing-tests.html).
* **Integration** tests ensure that the entire application works as expected. Holochain's integration testing tool is [Tryorama](https://github.com/holochain/tryorama/), which lets you create and run automated [scenario test](../glossary/#scenario-test) scripts involving multiple agents and various network conditions.

Your tests should ensure correct functionality, but they should also be tied to the real user needs you identified in the larger design---does the application actually implement the solution as expected?

## 6. Maintain

We won't talk much about maintenance, except to say that a well-designed application architecture and a comprehensive set of automated tests are likely to make maintenance a pleasure.

## Further reading

* [_Design for the Real World_](https://www.goodreads.com/book/show/190560.Design_for_the_Real_World), Victor Papanek. Explores the deep questions that lead to a better understanding of the context and appropriate, respectful solutions.
* [_Start With Why_](https://www.goodreads.com/book/show/7108725-start-with-why), Simon Sinek. Encourages readers to discover the fundamental purpose of their activities.
* [_Don't Make Me Think_](https://www.goodreads.com/book/show/18197267-don-t-make-me-think-revisited) and [Rocket Surgery Made Easy](https://www.goodreads.com/book/show/6658783-rocket-surgery-made-easy), Steve Krug. Practical guides to UI usability.
* [_The Design of Everyday Things_](https://www.goodreads.com/book/show/840.The_Design_of_Everyday_Things), Donald Norman. The classic textbook on creating usable and useful things for humans.
