---
title: "Holochain Core Concepts: What is Holochain?"
---

::: coreconcepts-intro
Holochain is an open-source application development framework and peer-to-peer networking protocol. It allows you to create **truly serverless applications** with high levels of **security, reliability, and performance**. Every user runs the application on their own device, creates and stores their own data, and talks directly to other users. The security of the application is supported by both cryptography and peer accountability.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [The problem with centralized architectures](#the-problem-with-centralized-architectures)
2. [Current solutions](#current-solutions)
3. [How Holochain does things differently](#how-holochain-does-things-differently)

### <i class="far fa-atom"></i> Why it matters

You'll understand how Holochain is different from centralized architectures, and how this difference can make your applications more robust, secure, and affordable.
:::

![](/assets/img/concepts/1.1-architecture-comparison.png)

## The problem with centralized architectures

We’re all familiar with the client/server architecture. It’s comfortable, allows for easy maintenance, and is well supported by a marketplace of service providers. It also makes it easy for you to control access rights and enforce business rules. As a focal point for processing and storage, however, it leaves your application vulnerable:

* It’s an attractive target for hackers.
* Device and network outages or misconfiguration can take the app down.
* Hosting costs scale with traffic, making you a victim of your own success.
* Storing private user data increases your legal liability.

## Current solutions

Cloud hosting platforms offer [horizontal scaling](https://en.wikipedia.org/wiki/Scalability#Horizontal). As your application grows, you add more virtual machines to increase availability. This is tricky to maintain, as you are responsible for updating your OS, provisioning new machines, and maintaining security.

[Serverless computing](https://en.wikipedia.org/wiki/Serverless_computing) liberates you from those details and lets you focus on the core of your application --- just choose the ingredients, link them together with functions, and press play. However, it is just an abstraction; it still runs on rented hardware with recurring costs and central failure points.

Distributed computing efforts, like [blockchain](https://en.wikipedia.org/wiki/Blockchain), attempt to solve these problems by creating a network of participants who all hold identical copies of a public, global data set. Each participant helps maintain the availability and integrity of the data. Centralized vulnerabilities are eliminated. However, it’s costly to replicate, check, and come to consensus on the contents of the data set, sometimes by design. This hurts performance and creates waste. It also leads to centralization—participants are separated into ‘full nodes’ who have the computer power, reputation, or capital to participate, and ‘light clients’ who have to ask the full nodes to do things for them, often in exchange for fees. _To our thinking, this begins to sound like client/server all over again._

## How Holochain does things differently

Holochain approaches the problem from a different starting point. Reality offers a great model—agents in the physical world interact with each other just fine without an absolute, ordered, total view of all events. We don’t need a server or global public ledger.

We start with users, not servers or data, as the primary system component. The application is modeled from the user perspective, which we call **agent-centric computing**. Empowered by the Holochain runtime, each user runs their own copy of the back end code, controls their identity, and stores their own private and public data. An encrypted peer-to-peer network for each app means that users can find each other and communicate.

Then we ask what sort of data integrity guarantees people need in order to interact meaningfully and safely with one another. Half of the problem is already solved—because everyone has the ‘rules of the game’ in their copy of the code, they can verify that their peers are playing the game correctly just by looking at the data they create. On top of this, we add cryptography to prove authorship and detect tampering.

This is Holochain’s first pillar: **intrinsic data validity**.

However, we’re only halfway there. It’s not particularly resilient; data can get lost when people go offline. It also doesn't prevent people from falsifying the data they create and present to others.

So we add another pillar: **peer witnessing**. Each piece of public data is witnessed, validated, and stored by a random selection of devices. Together, all cooperating participants detect modified or invalid data, spread evidence of corrupt actors or validators, and take steps to counteract threats.

These simple building blocks create something surprisingly robust—a multicellular social organism with a memory and an immune system. It mimics the way that biological systems have managed to thrive in the face of novel threats for millions of years.

While the foundation of Holochain is simple, the consequences of our design can lead to new challenges. But most of the solutions can be found in the experiences of real life, which is already agent-centric. Additionally, some of the trickier problems of distributed computing are handled by Holochain itself at the ‘subconscious’ layer. All you need to do is think about your application logic and the validation rules for your data.

## Key takeaways

* Traditional centralized architectures are easy to understand, maintain, and secure, but they create central points of failure.
* Holochain turns the architecture of applications inside-out—users are at the center of their online presence, in charge of their own identity, data, and processing.
* In a Holochain app, processing, storage, and security surface area are distributed across the entire network. This reduces central points of failure, bottlenecks, and attractive attack targets.
* The two pillars of application integrity are intrinsic data integrity and peer replication/validation.
* There is no single global database; data comes from many individual sources.
* Each user of an app also participates in building the app’s infrastructure, supplying their own compute and storage resources and taking responsibility for validating and storing a small portion of other users’ data.
* The whole is greater than the sum of its parts—many agents, playing by simple rules, combine to form a social organism that maintains its own health.