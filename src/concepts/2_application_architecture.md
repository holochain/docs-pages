# 2: Application architecture

> Applications built with Holochain are highly **modular** in both functionality and architecture. This makes it easy to share code and [compose](https://en.wikipedia.org/wiki/Composability) smaller pieces together into larger wholes. Each Holochain application (called **hApp**) has its own set of rules, private network, and distributed database.
> 
## Agent-centric integrity: inside, outside, and the in-between

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

## Architectural layers

Now let's get into the details of how a Holochain app is put together. Holochain apps (**hApps**) are made from loosely coupled components. Here's how they are built:


1. ![](https://i.imgur.com/GfsGnU0.png)
Code modules called **zomes** (short for chromosomes) contain their own data schemas, validation rules, persistence logic, and domain logic. A zome can define a public API, a set of functions that can be accessed by other components of the system.

2. ![](https://i.imgur.com/keq5iAQ.png)
One or more zomes are combined into a **DNA** that defines a package of basic functionality and 'rules of the game' that unite a network of users. Zomes in a DNA can talk to each other through their public APIs. 


3. ![](https://i.imgur.com/s7bNuoD.png)
One or more DNAs can be combined into a **DNA bundle** that specifies all the functionality needed for a complete hApp. Zomes from one DNA can talk to zomes from another through their public APIs.


4. ![](https://i.imgur.com/lK7EkQK.png)
One or more **clients** such as a GUI or utility script talks to the public APIs of the zomes in the DNA bundle via a lightweight [Remote Procedure Call (RPC)](https://en.wikipedia.org/wiki/Remote_procedure_call) Interface. This package of DNAs and clients makes up a Holochain app (**hApp**).

5. ![](https://i.imgur.com/y6Tqf0t.png)
All DNAs are hosted in the **Conductor**, a runtime that executes DNA code, manages data flow, and handles connections between components of the stack. Clients live outside the Conductor, but our standard end-user Conductor has a small HTTP server for serving a single-page web app to the user's browser.

6. ![](https://i.imgur.com/OJnabKc.png)
Each user runs their own copy of the entire stack. They become an **agent** or **node** in a peer-to-peer network of agents using the same app. Each DNA in the hApp has its own separate, private network and distributed data store. The Conductor handles communication between agents.

The clean separation between layers and components gives you and your users a lot of flexibility. You can mix and match components, creating rich experiences that rely on, augment, or replace existing components. Holochain has some similarities to [microservices](https://en.wikipedia.org/wiki/Microservices), with one difference---each user has their own copy of the microservices and GUI and is responsible for their own computing and storage. We call this **agent-centric computing**, and it's what makes Holochain special.

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
