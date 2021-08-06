# 2. Application Architecture

<div class="coreconcepts-intro" markdown=1>
Applications built with Holochain are highly **modular**. This makes it easy to share code and [compose](https://en.wikipedia.org/wiki/Composability) smaller pieces together into larger wholes. Each functional part of a Holochain application, called a **DNA**, has its own business rules, isolated peer-to-peer network, and shared database.
</div>

<div class="coreconcepts-orientation" markdown=1>
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Agent-centric integrity: inside, outside, and in between](#agent-centric-integrity-inside-outside-and-in-between)
2. [Layers of the application stack](#layers-of-the-application-stack)

### <i class="far fa-atom"></i> Why it matters

A good understanding of the components of the tech stack will equip you to architect a well-structured, maintainable application. Because Holochain is probably different from what you're used to, it's good to shift your thinking early.
</div>

## Agent-centric integrity: inside, outside, and in between

Before we talk about the tech stack, let's talk about donuts. That's a good way to start, isn't it?

![](../../img/concepts/2.1-holonut)

This is Holochain. Thanks to the magic of gluten, it has enough integrity to hold itself together. It separates the universe into two empty spaces---the hole and the space beyond.

![](../../img/concepts/2.2-holonut-icing.png)

On top of Holochain is your application. Each application has a different flavor.

![](../../img/concepts/2.3-holonut-inside.png)

Let’s put you inside the hole. You have agency—the power to receive information from your world and act on it. Together, your copy of the Holochain runtime and your application mediate between you and Holochain land. Your application defines a set of functions that define all the valid ways you can interact with it, and Holochain exposes those functions to you.

![](../../img/concepts/2.4-holonut-network.png)

On the outside of the donut is a shared space; in it are the other people using the same application. Holochain mediates interactions with them too, shuttling information across space with the help of a computer network. Again, your app defines what it considers valid, on this side, through a set of rules that define what data should look like.

Holochain creates a ‘double membrane’ for each participant, bridging between their world and the digital space they share with others. It ensures the integrity of information passing through both the inside and the outside. This lets people safely do the things that are important to them, without having to depend on a central authority.

## Layers of the application stack

Holochain handles a lot of things for you, keeping your workload minimal. That’s why it’s a “p2p framework”. You rely on Holochain for things like data persistence and a peer-to-peer networking and communication layer, and get on with building your application and business logic.

Now, let’s get into the details of how a Holochain app is put together. Holochain apps (hApps) are made from loosely coupled components. Here’s how they are built.

### At a glance

Let's introduce all the terms first, so you're familiar with how they fit together when you encounter them. The **client** talks with the **conductor**, which runs multiple **hApps**. Each hApp is made of one or more **cells**, which are active instances of **DNAs**, which in turn are made of one more executable **zome** modules.

All clear? Let's dig in.

### Client

A **client** on the user's device, such as a GUI or utility script, talks to the Holochain conductor and its running hApps via [remote procedure calls (RPCs)](https://en.wikipedia.org/wiki/Remote_procedure_call) over [WebSocket](https://en.wikipedia.org/wiki/WebSocket). A hApp can also send [signals](../9_signals/) back to the client; signals are useful for real-time events.

The client is like the front end of a traditional app and can be written with whatever language, toolkit, or framework you like. One hApp can have multiple clients, and one client can talk to multiple hApps. You can even make a headless client, like a shell script or scheduled task. This client and its related hApp make up a complete application. A lot more of the business logic of your application might end up being written in the client than you're used to, and we'll explain why later.

### Conductor

The hApp is hosted in the user's **conductor**. It's the runtime that sandboxes and executes hApp code, handles crytographic keys and signing, manages data flow and storage, and handles network connections both locally to clients and remotely to peers. When the conductor receives a function call from the client or another agent on the network, it routes it to the executable code in the proper hApp.

In some ways, you can think of the conductor as a web application server, but one that runs on every user's device. It is called the conductor because in one sense it ['leads the orchestra'](https://en.wikipedia.org/wiki/Conducting), and in another sense because it has good ['conductivity'](https://en.wikipedia.org/wiki/Electrical_conductor).

hApps communicate with each other privately and securely in peer-to-peer networks thanks to the conductor. The conductor can manage more than one set of private/public key pairs, representing either different people or different identities for the same person, and the same key pair can be used with more than one hApp.

### hApp

A Holochain application or **hApp** allows a person to easily install and manage a suite of functionality, such as chat, accounting, or project management. A hApp is often made of multiple components, each providing an aspect of functionality, and it has a **slot** for each.

### Cell

**Cells** occupy slots in a hApp. Each cell is a combination of a person's unique cryptographic key pair (their **agent ID**) and a DNA. Within one person's instance of a hApp, all cells share the same agent ID. Each cell acts as the person’s personal agent --- every piece of data that it creates or message it sends, it does so from the perspective of that agent.

Each cell stores its own agent history and is a member of an isolated network along with other cells that share the same DNA. This is useful for creating separate spaces inside a single hApp --- individual project workspaces or private chat channels, for example.

When a client calls a function in a hApp, it specifies the **cell ID**, which is the hash of the DNA plus the agent ID, along with the zome name, function name, and function input payload.

### DNA

A bundle of executable code that makes a unit of functionality in a hApp is called a **DNA**. It serves as the ‘rules of the game’ against which peers can do validation and enforcement. You can think of it like a [microservice](https://en.wikipedia.org/wiki/Microservices).

The DNA can also contain metadata: a name, description, unique ID, and **properties**. The unique ID and properties can be changed either in a text editor or at installation time. The executable code can use the properties to change its runtime behavior (similar to environment variables). The unique ID, on the other hand, can be changed to **clone** a DNA, creating a cell with identical functionality but an entirely separate history, network, and shared database. In fact, even the slightest alteration of any part of the DNA will do this. This means that you should consider changes wisely.

### Zome

![](../../img/concepts/2.5-zome.png)

A DNA is made of one or more executable code modules called **zomes** (short for chromosomes), each with its own name like `profile` or `chat`. A zome defines core business logic, exposing its functions to the conductor. Some of these functions are 'hooks' called automatically by Holochain, such as an initialization function or validation functions related to data types defined in the zome. Other functions are invented by the developer, have arbitrary names, and define the zome’s public API.

!!! info
    All functions in your DNA start with a fresh memory state which is cleared once the function is finished. The only place that persistent state is kept is in the user's personal data journal. If you've written applications with REST-friendly stacks like Django and PHP-FastCGI, or with [function-as-a-service](https://en.wikipedia.org/wiki/Function_as_a_service) platforms like AWS Lambda, you're probably familiar with this pattern.

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

## Learn more

* [Holochain: Reinventing Applications](https://medium.com/holochain/holochain-reinventing-applications-d2ac1e4f25ef)
* [The Holo vision: Serverless 2.0](https://medium.com/holochain/the-holo-vision-serverless-2-0-c0b294e753ba)he foundation of Holochain is simple, but the consequences of our design can lead to new challenges. H
