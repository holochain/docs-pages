# 1: The basics

> Holochain is a development framework and networking protocol that allows you to create **truly peer-to-peer applications** that guarantee high levels of **trust and security**.

What do we mean? In short, you can safely create and deploy applications that do not use a central server.  Every user runs the application on their own device, creates and stores their own data, and talks directly to other users.

![](https://i.imgur.com/lC0Ylue.png)


Why does this matter? Because it puts human beings at the center. Users are empowered to own their data and interactions with others. It also means that many of the typical headaches of application development are non-existent:

* No infrastructure to support
* No outages or cascading failures
* No password database to secure
* No liability for storing sensitive personal data

On the surface, this sounds risky. Without central oversight, what's to prevent hacking, fraud, and data theft? This is particularly problematic for applications that require strong data integrity such as financial platforms and voting services.

Other distributed computing efforts, like [blockchain](https://en.wikipedia.org/wiki/Blockchain), attempt to solve this problem by sharing a single, public ledger among all participants. The integrity of the data is safeguarded by making participation costly, which makes cheating costly as well. But, ultimately, these costs lead to centralization: participants are separated into 'full nodes,' who have the computer power or capital to participate, while the 'light clients' have to ask the full nodes to do things for them, often in exchange for fees. _To our way of thinking, it begins to sound like client/server all over again._

With Holochain, we are approaching the problem differently. We recognize that interacting parties can come to agreements directly without central oversight or global consensus, as long as they can establish trust. Holochain builds this trust on two pillars:

* **Intrinsic data integrity**: The data itself carries everything needed to ensure its authenticity. Data is immutable once committed, and cryptography provides tamper-resistance and proof of authorship. Application-specific rules specify what constitutes valid data.
* **Peer validation**: Each piece of data is witnessed, audited, and stored by a network of mutually sovereign peers who all agree to the same application rules. They function as an immune system, detecting modified or invalid data, spreading evidence of corrupt actors or validators, and taking steps to counteract threats.

This simple foundation creates a surprisingly robust, resilient system. It's a lot like what biological systems have been doing for billions of years.

Although the foundation of Holochain is simple, there are many complexities involved. But don't worry---Holochain manages most of this for you at the 'subconscious' level. All you need to do is focus on your app's functionality.

[Tutorial: **Download and run a demo app** >](#)
[Next: **Application architecture** >>](../2_application_architecture)

###### tags: `Holochain Core Concepts`
