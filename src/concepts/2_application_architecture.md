# 02: Application architecture

<div class="coreconcepts-intro" markdown=1>
Applications built with Holochain are highly **modular** in both functionality and architecture. This makes it easy to share code and [compose](https://en.wikipedia.org/wiki/Composability) smaller pieces together into larger wholes. Each Holochain application (called **hApp**) has its own set of rules, private network, and distributed database.
</div>

<div class="coreconcepts-orientation" markdown=1>
## What you'll learn

1. [Agent-centric integrity: inside, outside, and in between](#agent-centric-integrity-inside-outside-and-in-between)
2. [Layers of the application stack](#layers-of-the-application-stack)

## Why it matters

A good understanding of the components of the tech stack will equip you to architect a well-structured, maintainable application. Because Holochain is probably different from what you're used to, it's good to shift your thinking early on.
</div>

## Agent-centric integrity: inside, outside, and in between

Before we talk about the tech stack, let's talk about donuts. That's a good way to start, isn't it?

![](https://i.imgur.com/7pj8fBx.png)

This is Holochain. Thanks to the magic of gluten, it has enough integrity to hold itself together. It separates the universe into two empty spaces: the hole and the space beyond.

![](https://i.imgur.com/nNuA1CZ.png)

On top of Holochain is your application. Each application has a different flavor.

![](https://i.imgur.com/ImkR73e.png)

Let's put you inside the hole. You have agency---the power to receive information from your world and act on it. Together, your copy of the Holochain runtime and your application mediate between you and Holochain land. Your application defines a set of functions that define all the valid ways you can interact with it, and Holochain exposes those functions to you.

![](https://i.imgur.com/Nvn4HIa.png)

On the outside of the ring is a shared space. In it are other people, also using the same application. Holochain mediates interactions with them too, shuttling information across space with the help of a computer network. Again, your app defines what it considers valid, but on this side it does it through a set of rules that define what data should look like.

Holochain creates a 'double membrane' for each participant, bridging between their world and the digital space they share with others. It ensures the integrity of information passing through it on both the inside and the outside. This lets people safely do the things that are important to them, without having to depend on a central authority.

## Layers of the application stack

Now let's get into the details of how a Holochain app is put together. Holochain apps (**hApps**) are made from loosely coupled components. Here's how they are built:

<div class="coreconcepts-storysequence" markdown=1>
1. ![](https://i.imgur.com/VVAX0Jc.png)
Code modules called **zomes** (short for chromosomes) define the core logic of your app. They contain:

    * **validation logic**: data types, data schemas, and validation functions
    * **workflow and persistence logic**: app initialization functions and 'zome functions', which become part of your app's API
    * **message handling logic**: event handlers for node-to-node communication

2. ![](https://i.imgur.com/RMnObHc.png)
One or more zomes are combined into a **DNA** that defines the basic functionality and 'rules of the game' for a portion of an application's functionality. You can think of it like a [microservice](https://en.wikipedia.org/wiki/Microservices)-style back end, except that it lives on every user's device and only accepts function calls from local clients. This means that the running DNA is the user's personal agent---every piece of data that it creates or message it sends, it does so from the perspective of the user.

3. ![](https://i.imgur.com/ogtDACY.png)
DNAs can talk to each other's APIs via **bridging**. This lets you compose DNAs together into a bundle of functionality needed for a full-featured app.

4. ![](https://i.imgur.com/d2aADQt.png)
A **client** such as a GUI or utility script talks to one or more DNAs' APIs via a lightweight [remote procedure call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call) interface. The client is like the front end of a traditional app. Just like the DNA, the client live on the user's device. This client and its DNAs are bundled into a **hApp bundle**.

5. ![](https://i.imgur.com/2TEFXbQ.png)
All DNAs are hosted in the **conductor**, a runtime that sandboxes and executes DNA code, manages data flow and storage, and handles connections between components of the stack. You can think of the conductor as a web application server, but just as with the DNA and clients it runs on every user's device. Clients live outside the conductor.

6. ![](https://i.imgur.com/FSKeHnJ.png)
Each conductor is a **node** in a peer-to-peer network of agents using the same app. Each DNA in the hApp has its own separate, private network and distributed data store. The conductor handles communication and data sharing between nodes.
</div>

The clean separation between layers and components gives you and your users a lot of flexibility. You can mix and match components, creating rich experiences that rely on, augment, or replace existing components. This empowers people to use their applications in ways that work best for them.

## Key takeaways

You can see that Holochain is different from typical application stacks. Here's a summary:

* Each user has their own copy of the application's front end, back end, and server.
* The conductor sandboxes the DNA code, mediating all access to the device's resources.
* All code is executed on behalf of, and from the perspective of, the individual user.
* No data is a global truth; it is simply a statement made by a user and acknowledged by their peers.
* Users communicate and share data directly with each other rather than through a central server or blockchain validator network.
* Holochain is opinionated about persistence; it handles all data storage and retrieval. (We'll learn about data structures in the next three articles.)
* Persistence logic and core business logic are mixed together in your DNA. This is because Holochain is, at its heart, a framework for data validation. But you usually don't need much code in your DNA---only enough to encode the 'rules of the game'.
* Just as with microservices, Holochain lends itself well to combining small, reusable components into large applications.

## Learn more

* [Building Holochain apps: DNA](../../guide/building_apps)
* [Building Holochain apps: zome code](../../guide/zome/welcome)
* [Building Holochain apps: user interfaces](../../guide/apps_user_interfaces)
* [Building Holochain apps: bridging](../../guide/bridging)
* [Running Holochain apps: conductors](../../guide/conductors)
* [Holochain: Reinventing Applications](https://medium.com/holochain/holochain-reinventing-applications-d2ac1e4f25ef)
* [The Holo vision: Serverless 2.0](https://medium.com/holochain/the-holo-vision-serverless-2-0-c0b294e753ba)

## Tutorials

<div class="h-tile-container">
    <div class="h-tile tile-alt tile-tutorials">
        <a href="../../tutorials/coreconcepts/hello_holo">
            <h4>01: Hello Holo Tutorial</h4>
        </a>
    </div>
    <div class="h-tile tile-alt tile-tutorials">
        <a href="../../tutorials/coreconcepts/hello_test">
            <h4>02: Hello Test Tutorial</h4>
        </a>
    </div>
</div>
