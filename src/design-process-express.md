# Designing A Holochain Application (the express version)

<div class="coreconcepts-intro" markdown=1>
So you've decided to create a Holochain app. Now you're wondering, _Where do I start? How do I know I'm on the right track? What do I need to think about for my design?_ This guide is a very brief orientation to the process of designing a Holochain app.
</div>

<div class="coreconcepts-orientation" markdown=1>
## Who this guide is for

You'll find this useful if you're a developer or software architect who has decided to create a Holochain application but isn't sure where to start.

## What you'll learn

* What the design process looks like
* Where Holochain app creation fits into the design process
* The components you need to design
* The building blocks of modularity
* How Holochain influences your data model
* How to write a good validation rule
* Where to put your application logic
* The three types of interface that form your back end's API
* How to connect a user interface or other client
* The steps to scaffolding and writing your code
* Available development and testing tools

## Why it matters

A disciplined process of generating a design for your application will give you confidence that you've addressed all the components you need to address.
</div>

## The design process

**The most important design decisions happen before you write a single line of code.** Take a look at the scope of the problem you've defined---have you framed it correctly, or do you have a nagging feeling that there's more to the story? If you get the problem right, you're more likely to get the solution right.

Here's the thing though---you won't get the problem right, at least not at first. That's why it's important to build the simplest thing that could possibly work, allow your intended users to try it out, and collect feedback. Maybe this means that you start with a [stack of paper](https://www.uxpin.com/studio/blog/paper-prototyping-the-practical-beginners-guide/) rather than a computer. Your goal is to find the cheapest way to test whether you've correctly identified the problem and created a usable solution.

There are lots of different design methodologies, but most of them look something like this:

1. **Observe**: Collect information on the problem space, then identify your constraints and available resources. Observe without analysis or prejudice in order to collect as much information as possible.
2. **Analyze**: Explore the meaning of the facts you've collected; ask why this problem exists, what can be done about it, and why you've chosen to tackle it. Examine your starting questions, assumptions, and thinking process.
3. **Design**: Come up with a few possible solutions to the problem, guided by your analysis. Challenge the validity of your designs.
4. **Implement**: Build the thing. Create prototypes; write code.
5. **Test**: Get your product into the hands of users; allow them to challenge your convictions. Accept feedback and use it to improve your product.
6. **Maintain**: Devote energy to supporting and improving your offering.

This process looks straightforward, but in real life it doesn't work this way. You'll often find yourself jumping ahead or revising old decisions, or going through several cycles of change and refinement, and that's okay. Non-linear thinking is an important part of the design process.

There are already many good resources about the design process. We don't want to duplicate them here, so we encourage you to seek out good books, articles, and courses about the design process, especially **user-centered design**, **user experience (UX)**, and **appropriate technology**. In this document, we focus on steps 3 and 4, the **design** and **implementation** phases, as they apply to creating application code. We assume that you've already defined your problem, gathered and analyzed data, and come up with a design. We also assume that you've [decided that Holochain is right for your use case](../who-is-holochain-for/).

### 1. Define your app's membranes

* What sorts of information should be public, privileged, or private?
* Who is allowed to access or modify information? Are there different classes of privileges?
* What credentials are needed in order to authorize an agent to join a network or write data?

There are three basic tools for controlling privileges:

* Store **private user data** as [private entries](../glossary/#private-entry) on a user's [source chain](../glossary/#source-chain).
* For **membership** and **read access**, use a [DNA](../glossary/#dna). Each [DNA](../glossary/#dna) has its own [DHT](../glossary/#distributed-hash-table-dht) in which all public data is visible to all of its members but is inaccessible to others. The [agent ID](../glossary/#agent-id) [validation rule](../glossary/#validation-rule) allows you to restrict membership in a DHT.
* Within a DHT you can control **write privileges** through [validation rules](#4-create-validation-rules-for-your-entries-links-and-delete-update-actions) for entry and link types.

### 2. Plan your app's modules

There are a few building blocks of modularity you can use in your application, each with different use cases:

* A [**DNA**](../glossary/#dna) creates a private space for a group of agents. A user's DNAs can easily [bridge](../glossary/#bridge) to each other and access their APIs, as long as that user belongs to both networks. You can use DNA modularity for:
    * Fine-grained access control for separate groups
    * Separating core from optional functionality
* A DNA is made of one or more [**zomes**](../glossary/#zome) that define packages of functionality. Each zome has an API and a set of [entry](../glossary/#entry-type) and [link type](../glossary/#link-type) definitions. You can use zome modularity for:
    * Separation of concerns
    * Reusable third-party libraries
* A zome can use the **module system** of the programming language it's written in. Rust is currently the only zome development language we support, so in practice this means [crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html). You can use this for:
    * Exporting a zome's native types for use in other zomes or client code
    * Low-level utility libraries

### 3. Define your data schemas

[Entry type](../glossary/#entry-type) and [link type](../glossary/#link) definitions are the heart of your application's data model. They allow you to define the shape of your data and the relationships between them.

This process is similar to any data modelling exercise. Here's a good process:

1. Identify all the **nouns** in your data model; these become your entries.
2. Add **adjectives** that describe the nouns; these become fields in entries.
3. Map out the **verbs** that define the relationships between nouns; these become links between entries.
4. Add **adverbs** to your verbs to describe properties of the relationships; these become link tags.

Base your design on realistic example data. Include entries, links, multiple agents, and their source chains as needed. [Entity-relationship diagramming](https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model) is a good technique for mapping out relationships---use one diagram per zome, and make sure you capture relationships to other zomes or DNAs.

Model **one-to-many** relationships with:

    * a field in the dependent entry that contains the address of the primary entry, and
    * links on the primary entry that point to the dependent entry.

Model **many-to-many** relationships with links on both entries, pointing to each other.

You can create your entry types using Rust's type system, which has powerful features that you may not be used to. Learn about [structs](https://doc.rust-lang.org/book/ch05-00-structs.html), [enums](https://doc.rust-lang.org/book/ch06-00-enums.html), and [generic parameters](https://doc.rust-lang.org/book/ch10-01-syntax.html), which allow you to create highly precise and expressive data types that aren't possible in many other languages.

### 4. Create validation rules for your entries, links, and delete/update actions

Even though we're introducing it late in the process, validation is the essence of your app. It's how you define the 'rules of the game', the domain logic that allows agents to play fairly and discern whether their peers are doing the same.

You've already done half of the work---when you designed your entry and link types, you gave your data some structure that the Rust SDK will automatically check for you. If an entry passes this check, your validation function has a chance to perform checks on the content of the entry.

Here are things you can validate:

* Acceptable values for fields
* An entry's validity based on dependencies, such as prior entries already in the author's source chain
* An agent's permission to write (create/update/delete) an entry or link
* A link's applicability to its [base](../glossary/#link-base) and [target](../glossary/#link-target)
* The content of a [link tag](../glossary/#link-tag)

A good validation function is [pure](https://en.wikipedia.org/wiki/Pure_function) and [deterministic](https://en.wikipedia.org/wiki/Deterministic_algorithm), which means that its result doesn't vary based on who's executing it, and when, and what their view of the DHT looks like at validation time. When handling a failure, your validation function can return a helpful error message which can be passed on to the UI to help the user correct their error.

One special validation function is required in every zome: the **agent ID validator**. This is where you can choose to accept or reject an agent's participation in the DHT.

### 5. Define your app's API

Now that you've defined the data model, it's time to define the functions that act upon it. These fall into three categories:

* [**Zome functions**](../glossary/#zome-function), the 'public' API that the DNA exposes to the user's UI and bridged DNAs. One special zome function is required in every zome: the **init** function, which is executed by the conductor on first run.
* [**Node-to-node messages**](../glossary/#node-to-node-message), an interface between agents in the DNA's network
* [**Signals**](../glossary/#signal) that the DNA can broadcast to the user's UI in response to incoming messages

Here are things to consider in your API design:

* **What is your application's essential logic?** Pare your DNA down to the bare essentials required for data manipulation, integrity, and interaction between peers; save the rest for the middleware and UI layers.
* **Who needs to access your data?** Your API may be consumed by UIs, other zomes, and bridged DNAs.
* **What does each consumer need?** Most entry types should have functions to create, read, update, and delete entries, as well as retrieve collections and condensed stats on a collection.
* **How do the users need to interact with each other?** For synchronous, real-time private interaction, you'll need to use node-to-node messaging and implement a message receive handler. With this you can create a sort of agent-to-agent API.
* **When does your API consumer need to know about events in the DHT?** Your DNA can broadcast signals to the client, usually as a result of handling a node-to-node message.
* **What should happen at application startup?** What does the init function need to do when the [progenitor](../glossary/#progenitor) and subsequent users run the application for the first time?

## 6. Write your code

Now it's time to write your code! Here are the basic steps:

1. [Install Holochain and the developer tools.](https://developer.holochain.org/docs/install/)
2. Create a folder for your project.
3. Write a [hApp bundle](https://github.com/holochain/holoscape/tree/master/example-bundles) manifest file that defines all the necessary DNA instances and the bridges between them.
4. [Create a folder for each of your DNAs.](https://developer.holochain.org/docs/create-new-app/#initialize-a-new-app)
5. [Scaffold each of the DNA's zomes](https://developer.holochain.org/docs/create-new-app/#generate-a-new-zome) and write your code.

You'll probably end up going back to previous steps as you discover consequences of one component's design that affect another component.

## 7. Write tests

Your application's tests fall into two buckets:

* **Unit** tests exercise one component in isolation. They should be guided by your application design---the actions that each function is expected to perform. Rust has [built-in support for unit testing](https://doc.rust-lang.org/book/ch11-01-writing-tests.html).
* **Integration** tests ensure that the entire application works as expected. Holochain's integration testing tool is [Tryorama](https://github.com/holochain/tryorama/), which lets you create and run automated [scenario test](../glossary/#scenario-test) scripts involving multiple agents and various network conditions.

Your tests should ensure correct functionality, but they should also be tied to the real user needs you identified in the larger design---does the application actually implement the solution as expected?

### 8. Create your user interface and middleware

Because the DNA encodes only the essentials, a fair amount of your application logic may end up somewhere else. Holochain encourages a 'thin' back-end and a 'fat' front-end. If you intend to support multiple UIs, consider creating a 'middleware' layer for common application logic that all UIs can depend on.

You can implement your middleware and UI with any framework and platform that you like, as long as:

* Your users' operating systems supports it, as it will be installed on their devices.
* It can talk to the user's locally running Holochain service via **[JSON-RPC 2.0](https://www.jsonrpc.org/specification) over [WebSocket](https://en.wikipedia.org/wiki/WebSocket)**.

## Further reading

* [_Design for the Real World_](https://www.goodreads.com/book/show/190560.Design_for_the_Real_World), Victor Papanek. Explores the deep questions that lead to a better understanding of the context and appropriate, respectful solutions.
* [_Start With Why_](https://www.goodreads.com/book/show/7108725-start-with-why), Simon Sinek. Encourages readers to discover the fundamental purpose of their activities.
* [_Don't Make Me Think_](https://www.goodreads.com/book/show/18197267-don-t-make-me-think-revisited) and [Rocket Surgery Made Easy](https://www.goodreads.com/book/show/6658783-rocket-surgery-made-easy), Steve Krug. Practical guides to UI usability.
* [_The Design of Everyday Things_](https://www.goodreads.com/book/show/840.The_Design_of_Everyday_Things), Donald Norman. The classic textbook on creating usable and useful things for humans.