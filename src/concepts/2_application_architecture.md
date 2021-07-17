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

What’s important to understand about Holochain development is that Holochain is handling a LOT of things for you, and keeping your workload to provide a secure p2p app minimal. That’s why it’s a “p2p framework”. You write your hApp logic, relying on Holochain for things like data persistence and a peer-to-peer networking and communication layer, and get on with building your application and business logic.

Now, let’s get into the details of how a Holochain app is put together. Holochain apps (hApps) are made from loosely coupled components. Here’s how they are built:

<div class="coreconcepts-storysequence" markdown=1>

1. ![](../../img/concepts/2.8-happ-bundle.png)
A **client** on the user's device, such as a GUI or utility script, talks to a Holochain Conductor via a lightweight [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call) interface. If using Websockets, the client can also receive "signals", transmitted from the Conductor, which are like live events and have many uses. The client is like the front end of a traditional app and can be written with whatever language, toolkit, or framework you like. This client and its DNAs make up an application. For reasons that will be explained, a lot more of the business logic of your application might end up being written in the client than you're used to.

2. ![](../../img/concepts/2.9-conductor.png)
All "hApp"s, to which the client can make requests, are hosted in the user's **conductor**. It is the critical runtime that handles crytographic keys and cryptographic signing, sandboxes and executes hApp code, manages data flow and storage, and handles network connections both locally to clients, as well as remotely to peers. When the conductor receives a request from the client, it will check if it the arguments provided match with a hApp that's currently running in the conductor and route the request to the right hApp accordingly if so. In some ways, you can think of the conductor as a web application server, but one that runs on the local device. It is called the "conductor" because in one sense it ["leads the orchestra"](https://en.wikipedia.org/wiki/Conducting), and in another sense because it has good ["conductivity"](https://en.wikipedia.org/wiki/Electrical_conductor). hApps communicate with each other privately and securely in peer-to-peer networks thanks to the conductor. The conductor can manage more than one set of private/public key pairs, and the same private/public key pair can be used with various hApps.
![](../../img/concepts/2.10-network.png)

3. image here


A **hApp or app** (depending on the context) allows a single end user or "agent" to easily install and manage a suite of functionality, such as "social chat", "accounting", and "project management", as if it were a single thing. A hApp will have a "slot" for each aspect of the overall intended functionality. When a client makes a request to a hApp through a conductor, it will have to specify which "slot" in the hApp it is calling into. The slot will be specified by either a slot "id" property, or a "Cell ID" (which will be explained). The hApp will have to be actively attached to an "app interface" within the conductor in order for it to be callable over an HTTP or Websocket networking port/interface.

4. image here

Each slot in a hApp does or can contain a **Cell**. Since a hApp has to be uniformly connected to a specific agent (via its keys), that means that each slice of functionality of the hApp, like "project management", is running as the same agent (via its keys). When we want to identify a Cell we use a pairing of the *hash that identifies the code that implements the "project management"* (the DNA), and the *public key which represents the agent*. 

2. ![](../../img/concepts/2.6-dna.png)
One or more zomes are combined into a **DNA** that defines the basic functionality and ‘rules of the game’ for a portion of an application’s functionality. You can think of it like a [microservice](https://en.wikipedia.org/wiki/Microservices). The running DNA instance, or **cell**, is the user’s personal agent—every piece of data that it creates or message it sends, it does so from the perspective of the user.

1. ![](../../img/concepts/2.5-zome.png)
A code module called a **zome** (short for chromosome) defines the core logic of your app. It exposes its public functions to the Holochain runtime. Some of these functions are required, such as validation functions for each type of data the zome defines. Other functions are invented by the developer and define the zome’s public API.



3. ![](../../img/concepts/2.7-bridging.png)
A user’s cells can talk to each other’s APIs via **bridging**. This lets you compose them into a bundle of functionality that’s needed for a full-featured app, which we call an **"app" or "happ"** depending on the context.







</div>

Functional components and architectural layers both enjoy clean separation. You can combine, augment, or replace existing pieces. This gives you a lot of flexibility and can even empower your users to take ownership of their experience.

!!! info
    All functions in your DNA start with a fresh memory state which is cleared once the function is finished. The only place that persistent state is kept is in the user's personal data journal. If you've written applications with REST-friendly stacks like Django and PHP-FastCGI, or with [function-as-a-service](https://en.wikipedia.org/wiki/Function_as_a_service) platforms like AWS Lambda, you're probably familiar with this pattern.

## Key takeaways

You can see that Holochain is different from typical application stacks. Here's a summary:

* An application consists of a client and a DNA bundle (a collection of isolated services called DNAs which in turn are composed of code modules called zomes).
* Each user has their own copy of the client, DNA bundle, and Holochain runtime (conductor).
* The conductor sandboxes the DNA code, mediating all access to the device’s resources, including networking and storage.
* All code is executed on behalf, and from the perspective, of the individual user.
* Users communicate and share data directly with one another rather than through a central server or blockchain validator network.
* Holochain is opinionated about data—it handles all storage and retrieval. (We’ll learn about why and how in the next three articles.)
* DNA functions don’t maintain any in-memory state between calls.
* Persistence logic and core business logic are mixed together in your DNA, because at its heart, Holochain is a framework for data validation. However, you usually don’t need a lot of your business logic in your DNA—just enough to encode the ‘rules of the game’ for your application.
* As with microservices, Holochain lends itself to combining small, reusable components into large applications.

## Learn more

* [Holochain: Reinventing Applications](https://medium.com/holochain/holochain-reinventing-applications-d2ac1e4f25ef)
* [The Holo vision: Serverless 2.0](https://medium.com/holochain/the-holo-vision-serverless-2-0-c0b294e753ba)he foundation of Holochain is simple, but the consequences of our design can lead to new challenges. H
