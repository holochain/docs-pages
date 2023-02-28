---
title: Application Architecture
---

::: coreconcepts-intro
Applications built with Holochain are highly **modular**. This makes it easy to share code and [compose](https://en.wikipedia.org/wiki/Composability) smaller pieces together into larger wholes. Each functional part of a Holochain application, called a **DNA**, has its own business rules, isolated peer-to-peer network, and shared database.

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Agent-centricity](#agent-centricity)
2. [Layers of the application stack](#layers-of-the-application-stack)

### <i class="far fa-atom"></i> Why it matters

A good understanding of the components of the tech stack will equip you to architect a well-structured, maintainable application. Because Holochain is probably different from what you're used to, it's good to shift your thinking early.
:::

## Agent-centricity

Perhaps Holochain's most important difference is that applications are completely centered around the individual --- and networks of individuals. The purpose of a Holochain application is to create a network of individuals, interacting freely with each other, playing by a shared set of rules. This is possible because everyone, whether human or bot, is **running their own copy of the application** and connecting directly to their peers.

![Four participants, running the same hApp, communicating directly with each other using their copy of the hApp.](/assets/img/concepts/2.1-mutual-execution.png){.sz80p} {.center}

So the term 'user' doesn't feel quite right for Holochain, where the ones who use the application are also the ones who keep it alive. Let's call them 'agents' --- or better yet, 'participants'.

How do you know other participants are playing by the same rules as you? As we explored in [The Basics](../1_the_basics/#how-holochain-does-things-differently), all you have to do is look at the data they create and share. If their data doesn't pass your copy of the rules, they're playing a different game and you should ignore them.

These data integrity rules create a membrane between a participant and her peers. They define what data she can and can't create, and they help her recognize rule-breakers.

![Four participants using a hApp. A membrane surrounds one participant's hApp, allowing her to safely produce and accept good data, and reject bad data.](/assets/img/concepts/2.2-data-integrity-membrane.png){.sz80p} {.center}

There's another membrane, which sits between a participant and her copy of the application. The application's public functions define the processes that can be used to access, interpret, and create data, as well as communicate with other participants and applications. Her copy of the application makes those functions available to any client on her machine that wants to act for her. It also makes them available to her peers so she can delegate some of her agency to them. The application developer can give her tools to control access to these functions, using [capability-based security](../8_calls_capabilities/).

![One participant's copy of the hApp. A membrane surrounds her hApp. On her device, three clients are successfully calling the hApp's functions while a malware is rejected. From the network, two peers try to call her hApp's functions; one succeds while another fails.](/assets/img/concepts/2.3-process-membrane.png){.sz80p} {.center}

## Layers of the application stack

Holochain handles a lot of things for you, keeping your workload minimal. That’s why we call it a framework. You rely on Holochain for things like data persistence and a peer-to-peer networking and communication layer, and get on with building your application and business logic.

Now, let’s get into the details of all the components of a Holochain app, and how they fit together.

### At a glance

Now let's quickly introduce all the terms, so you're familiar with them when you encounter them. A **client** running on a participant's device talks with their **conductor**, which runs multiple **hApps**. Each hApp is made of one or more **cells**, which are the live instances of **DNAs** that run on behalf of the participant. These DNAs, in turn, are made of one more executable **zome** modules.

All clear? Don't worry; it'll make more sense as we dig in.

### Client

![Three clients --- a GUI, a bot running on a schedule, and a shell script --- call a hApp's functions and receive signals from it.](/assets/img/concepts/2.4-client.png){.sz80p} {.center}

A **client** on the participant's device, such as a GUI or utility script, talks to their Holochain conductor and its running hApps via [remote procedure calls (RPCs)](https://en.wikipedia.org/wiki/Remote_procedure_call) over [WebSocket](https://en.wikipedia.org/wiki/WebSocket). A hApp can also send [signals](../9_signals/) back to the client; signals are useful for real-time event notifications.

The client is like the front end of a traditional app and can be written with whatever language, toolkit, or framework you like. One hApp can have multiple clients, and one client can talk to multiple hApps. You can even make a headless client, like a shell script or scheduled task. This client and its related hApp make up a complete application. A lot more of the business logic of your application might end up being written in the client than you're used to, and we'll explain why later.

### Conductor

![A participant's conductor hosts multiple hApps for her, mediating the connections between the hApp and her clients, as well betwee then hApp and other participants' conductors running the same hApp.](/assets/img/concepts/2.5-conductor.png){.sz80p} {.center}

The hApp is hosted in the participant's **conductor**. It's the runtime that sandboxes and executes hApp code, handles cryptographic signing, manages data flow and storage, and handles connections both locally to clients and remotely to peers. When the conductor receives a function call, it routes it to the proper hApp.

In some ways, you can think of the conductor as a web application server, but one that runs on every participant's device. It is called the conductor because in one sense it ['leads the orchestra'](https://en.wikipedia.org/wiki/Conducting), and in another sense because it has good ['conductivity'](https://en.wikipedia.org/wiki/Electrical_conductor).

Participants in a hApp communicate with each other privately and securely in peer-to-peer networks thanks to the conductor. The conductor can manage more than one set of private/public key pairs, representing either different people or different identities for the same person, and the same key pair can be used with more than one hApp.

### hApp

![A hApp with slots ready to be populated by cells.](/assets/img/concepts/2.6-happ.png){.sz60p} {.center}

A Holochain application or **hApp** allows a person to easily install and manage a suite of functionality, such as chat, accounting, or project management. A hApp is often made of multiple components, each providing an aspect of functionality, and it has a **slot** for each.

### Cell

![A hApp with each of its slots populated by zero, one, or more matching cells.](/assets/img/concepts/2.7-cells-in-slots.png){.sz60p} {.center}

**Cells** occupy slots in a hApp. Each cell is a combination of a participant's unique cryptographic key pair (their **agent ID**) and a DNA. Within one participant's instance of a hApp, all cells share the same agent ID. Each cell acts as the participant's personal **agent** --- every piece of data that it creates or message it sends, it does so from the [perspective of that agent](../3_source_chain/).

Each cell stores its own agent history and is a member of an isolated network along with other cells that share the same DNA. This is useful for creating separate spaces inside a single hApp --- individual project workspaces or private chat channels, for example.

When a client calls a function in a hApp, it specifies the **cell ID**, which is the hash of the DNA plus the agent ID, along with the zome name, function name, and function input payload.

### DNA

![A cell containing a DNA.](/assets/img/concepts/2.8-dna-in-cell.png){.sz80p} {.center}

A bundle of executable code that makes a unit of functionality in a hApp is called a **DNA**. You can think of it like a [microservice](https://en.wikipedia.org/wiki/Microservices) that creates a data access and integrity layer around personal and shared data. It serves as the ‘rules of the game’ against which peers can do validation and enforcement.

The DNA can also contain metadata: a name, description, unique ID, and **properties**. The unique ID and properties can be changed either in a text editor or at installation time. The unique ID can be changed to **clone** a DNA, creating a new cell with identical functionality but an entirely separate history, network, and shared database. The properties, on the other hand, can also be changed to clone a DNA, but also direct the DNA's executable code to change the new cell's runtime behavior (similar to configuration parameters). 

In fact, even the slightest alteration of any part of the DNA will cause a cell to be cloned. Consider source code and configuration changes carefully, because each modification will create a new DNA with a new cell interacting in a separate network. This may require some sort of migration strategy to move or access data between old and new cells.

### Zome

![A close-up of a DNA, showing multiple executable zome modules exposing their public functions.](/assets/img/concepts/2.9-zomes-in-dna.png){.sz80p} {.center}

The executable code modules in a DNA are called **zomes** (short for chromosomes), each with its own name like `profile` or `chat`. The zomes define the core business logic in a DNA, exposing their functions to the conductor.

Some of these functions are 'hooks' that Holochain calls automatically, such as an initialization function or validation functions related to data types defined in the zome.

Other functions are invented by the developer, have arbitrary names, and define the zome’s public API. The conductor [makes this API available](../8_calls_capabilities/) to other zomes within the DNA, other DNAs within the hApp, and, as mentioned earlier, clients running on the participant's machine and other agents on the DNA's network. The developer can give a participant the ability to control access to their cell's API via [capabilities](../8_calls_capabilities/).

All of these functions are run from the perspective of the individual participant. When a client on Alice's computer calls a function that writes data, it calls that function in her own cell, writing data to her personal store. Unlike with cloud and blockchain, there is no objective, global-level actor. Things happen only when someone causes them to happen.

!!! info "DNA Memory State"
All functions in your DNA start with a fresh memory state which is cleared once the function is finished. The only place that persistent state is kept is in the user's personal data journal. If you've written applications with REST-friendly stacks like Django and PHP-FastCGI, or with [function-as-a-service](https://en.wikipedia.org/wiki/Function_as_a_service) platforms like AWS Lambda, you're probably familiar with this pattern.
!!!

## In summary

![The entire stack of one participant's hApp. See following text for full image description.](/assets/img/concepts/2.10-whole-stack.png){.sz80p} {.center}

That's the entire stack of a Holochain hApp. Let's review, this time from the inside out:

1. A **zome** is a module that contains executable code and exposes some of its functions as an API.
2. One or more zomes are bundled into a **DNA**, which is like a microservice that defines all the rules for a specific set of functionality.
3. A DNA comes alive as a **cell**, running on behalf of a participant.
4. One or more cells are slotted into a **hApp**, which makes up an application's back end.
5. A participant's **conductor** hosts the hApps she uses, mediating local and network access to them.
6. The participant's **clients** access the hApp via the conductor's local RPC interface, while the conductor allows the hApp to communicate with other participants' copies of the hApp running in their conductors.

## Key takeaways

You can see that Holochain is different from typical application stacks. Here's a summary:

* An application consists of a client and a hApp (a collection of separate microservices called DNAs which in turn are composed of code modules called zomes).
* The hApp runs in the conductor, Holochain's application server or runtime.
* The conductor sandboxes the DNA code, mediating all access to the device’s resources, including networking and storage.
* Each user has their own copy of the client, hApp, and conductor.
* All code is executed on behalf, and from the perspective, of the individual user.
* A DNA is instantiated into a cell for each user on their device. Each cell has a separate history and belongs to a separate private network.
* Users communicate and share data directly with one another rather than through a central server or blockchain validator network.
* Holochain is opinionated about data --- it handles all storage and retrieval. (We’ll learn about why and how in the next three articles.)
* Zomes don’t maintain any in-memory state between calls; state is maintained in the history of the cell that contains the zome.
* Persistence logic and core business logic are mixed together in your DNA, because at its heart, Holochain is a framework for data validation. However, you usually don’t need a lot of your business logic in your DNA—just enough to encode the ‘rules of the game’ for your application.
* As with microservices, Holochain lends itself to combining small, reusable components into large applications.

### Next Up 

[Explore the source chain —>](../3_source_chain/){.btn-purple} 