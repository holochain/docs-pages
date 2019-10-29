# 01: The basics: what is Holochain?

<div class="coreconcepts-intro" markdown=1>
Holochain is a development framework and networking protocol that allows you to create **truly serverless applications** that guarantee high levels of **trust and security**. Every user runs the application on their own device, creates and stores their own data, and talks directly to other users.
</div>

<div class="coreconcepts-orientation" markdown=1>
## What you'll learn

* [The problem with centralized architectures](#the-problem-with-centralized-architectures)
* [Current solutions](#current-solutions)
* [How Holochain does things differently](#how-holochain-does-things-differently)

## Why it matters

You'll understand how Holochain is different from centralized architectures, and how this difference can make your applications more robust, secure, and affordable.
</div>

![](https://i.imgur.com/lC0Ylue.png)

## The problem with centralized architectures

We're all familiar with the client/server architecture. It's comfortable, allows for easy maintenance, and is well supported by a marketplace of service providers. It also makes it easy for you to control access rights and enforce business rules. But, as a focal point for processing and storage, it leaves your application vulnerable:

* It's an attractive target for hackers
* Device and network outages or misconfiguration can take the app down
* Hosting costs scale with traffic, making you a victim of your own success
* Storing private user data increases your legal liability

## Current solutions

Cloud hosting platforms offer [horizontal scaling](https://en.wikipedia.org/wiki/Scalability#Horizontal): as your application grows, you add more virtual machines to increase resilience and maintain decent performance. But this is tricky to maintain: you have to take responsibility for updating your OS, adding new machines, and maintaining security rules.

[Serverless computing](https://en.wikipedia.org/wiki/Serverless_computing) abstracts away all the details and lets you focus on the core of your application: just choose the ingredients, mix them together with code, and press play. This liberates you from having to maintain server instances. As an abstraction, however, it hides the fact that it still runs on rented hardware with recurring costs and central failure points.

Other distributed computing efforts, like [blockchain](https://en.wikipedia.org/wiki/Blockchain), attempt to reconcile these problems by enlisting all participants in the task of maintaining a shared global state of all events. Each user helps maintain the resilience and integrity of shared data. Centralized vulnerabilities are eliminated. But the cost of replicating, checking, and coming to consensus on that global data set leads to centralization: participants are separated into 'full nodes,' who have the computer power or capital to participate, and 'light clients', who have to ask the full nodes to do things for them, often in exchange for fees. _To our way of thinking, it begins to sound like client/server all over again._ And global consensus also carries a performance cost that makes blockchains unsuitable for a lot of applications.

## How Holochain does things differently

We are approaching the problem from a different set of assumptions. Reality offers a great lesson: agents in the physical world can interact with each other just fine without an absolute, ordered, total view of all data ever produced. We don't need a server or a global public ledger.

We start with users, not servers or data, as the primary system component. Empowered by the Holochain runtime, each user runs their own copy of the back end code, manages their own identity, and stores their own private and public data. An encrypted peer-to-peer network for each app means that users can find each other and communicate directly.

Then we ask what sort of data integrity guarantees users need in order to interact meaningfully and safely with each other. Half of the problem is already solved: because everyone has the 'rules of the game' in their copy of the code, they can verify that their peers are playing the game correctly just by looking at the data they create.

This is the first pillar of Holochain's integrity model: **intrinsic data integrity**. Cryptography gives further proofs of authorship and tamper-resistance.

But we're only halfway there. It's not particularly resilient; data can get lost when people go offline. It also forces everyone to do a lot of their own work, and it doesn't prevent people from tampering with their own data after they've created it.

So we add one more pillar of integrity: **peer validation**. Each piece of public data is witnessed, audited, and backed up by a random selection of devices. Together, all cooperating participants detect modified or invalid data, spread evidence of corrupt actors or validators, and take steps to counteract threats.

These simple building blocks create something surprisingly robust and resilient---a multicellular organism with a memory and an immune system. Systems scientists call this [emergence](https://en.wikipedia.org/wiki/Emergence). It's what biological systems have been doing for millions of years.

The foundation of Holochain is simple, but the consequences of our design can lead to questions that programmers aren't used to asking. Don't worry---most of the answers can be found in real life experiences. And some of the trickier problems of distributed computing are handled by Holochain itself at the 'subconscious' layer. All you need to do is think about your application logic, and Holochain makes it work, completely serverless.