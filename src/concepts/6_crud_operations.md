# 06: Modifying and deleting data

<div class="coreconcepts-intro" markdown="1">
Holochain allows agents to mutate immutable data by publishing special **remove** and **update** entries.
</div>

<div class="coreconcepts-orientation" markdown="1">
## What you'll learn

1. [Why you can't delete or modify DHT data in the usual way](#public-immutable-databases)
2. [How to do simulate mutability in an immutable database](#simulating-immutability)
3. [Addressing concerns about privacy and storage requirements](#handling-privacy-concerns-and-storage-constraints)

## Why it matters

Immutable public data is a surprising feature of Holochain and many other distributed systems. It's important to understand the consequences so you can make informed design decisions that respect your users' privacy and storage space.
</div>

![](https://i.imgur.com/fLamuNE.png)

## Public, immutable databases

Data in a Holochain app is immutable for a few reasons:

* The user's **source chain** is immutable because many apps will require a full audit history in order to validate new entries.
* The **DHT** is immutable for a similar reason; it needs to witness users' activity to detect attempts to modify their source chains.
* The DHT is also immutable because it makes data syncing faster, simpler, and more reliable. Mutable distributed databases often require complex coordination protocols that reduce performance.

But developers expect to be able to do CRUD (create, read, update, delete) as a basic feature of a database; this is an important part of most apps. So how do we do this on Holochain?

## Simulating immutability

We leave the old entries in place and write new entries, adding a piece of metadata onto the originals to indicate their status. Holochain features two special entry types that do this for you:

* ![](https://i.imgur.com/ji7oVPW.png) A **remove entry**, which instructs DHT validators to mark the original entry as deleted.

* ![](https://i.imgur.com/sjzzntQ.png)
An **update entry**, which carries updated data and instructs DHT validators to mark the original entry as updated, with a pointer to the new entry.

When you try to retrieve a DHT entry or link that's been removed, Holochain will give an empty result. When you try to retrieve a DHT entry that's been updated, Holochain will traverse the chain of update pointers to the newest version. But your app can still retrieve the old entries if it chooses.

## Handling privacy concerns and storage constraints

This can break users' expectations. When you asks a central service to delete information you'd rather people not know about, you trust the service to wipe it out completely---or at least stop displaying it. But when your data is shared publicly, you can't control what other people do with it.

In reality, this is true of anything you put on the internet. Even when a central database permanently deletes information, it can live on in caches, backups, screenshots, public archives, reading-list apps, and people's minds.

Holochain is a little different because it's explicit about data immutability. Here are some guidelines for wielding this tool wisely:

* Be choosy about what the DNA returns to the UI. Your zome functions serve as a membrane around DHT data and can avoid retrieving entries that are marked obsolete.
* Design your UI to communicate the permanence of information that users publish, so they can make responsible decisions.

Because data takes up space even when it's no longer live, be judicious about what you commit to the source chain and the DHT:

* For large objects that have a short life, consider storing data outside of the DHT: separate, short-lived DHTs, [IPFS](https://ipfs.io), [Dat](https://dat.foundation), or even a centralized service.
* Commit updates to entries in batches, or ignore the built-in update function and commit deltas instead.

## Key takeaways

* All data in the source chain and DHT is immutable once it's written. Nothing is ever deleted.
* Because it's useful to be able to modify data, Holochain offers delete and update functions for public data that mark old entries obsolete.
* This is different from central databases, so it requires extra care to meet users' expectations.