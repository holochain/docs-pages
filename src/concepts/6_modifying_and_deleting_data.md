# 06. CRUD Operations: Modifying and Deleting Data

<div class="coreconcepts-intro" markdown="1">
Holochain allows agents to mutate immutable data by publishing special **remove** and **update** entries.
</div>

<div class="coreconcepts-orientation" markdown="1">
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why you can't delete or modify DHT data in the usual way](#public-immutable-databases)
2. [How to simulate mutability in an immutable database](#simulating-mutability)
3. [Addressing concerns about privacy and storage requirements](#handling-privacy-concerns-and-storage-constraints)

### <i class="far fa-atom"></i> Why it matters

Immutable public data is a surprising feature of Holochain and many other distributed systems. It's important to understand the consequences in order to make informed design decisions that respect your users' privacy and storage space.
</div>

![](https://i.imgur.com/fLamuNE.png)

## Public, immutable databases

Data in a Holochain app is immutable for a few reasons:

* The user's **source chain** is immutable because many apps will require a full audit history in order to validate new entries.
* The **DHT** is immutable for a similar reason; it needs to witness users' activity to detect attempts to modify their source chains.
* The DHT is also immutable because it makes data syncing faster, simpler, and more reliable. Mutable distributed databases often require complex coordination protocols that reduce performance.

However, developers expect to be able to do CRUD (create, read, update, delete) as a basic feature of a database; it's an important part of most apps. So how do we do it on Holochain?

## Simulating mutability

The answer is that we leave the old entries in place, write new entries, and add a piece of metadata onto the originals to indicate their status. Holochain features two special entry types to do this for you:

* ![](https://i.imgur.com/ji7oVPW.png) A **remove entry** instructs DHT validators to mark the original entry as deleted.

* ![](https://i.imgur.com/sjzzntQ.png)
An **update entry** carries updated data, and instructs DHT validators to mark the original entry as obsolete and point to the new entry.

When you try to retrieve a DHT entry or link that's been removed, Holochain will give you an empty result. When you try to retrieve a DHT entry that's been updated, Holochain will traverse the chain of update pointers to the newest version, though your app can still retrieve the old entries if it chooses.

## Handling privacy concerns and storage constraints

This can break users' expectations. When you asks a central service to delete information you'd rather people not know, you're trusting the service to wipe it out completely---or at least stop displaying it. When your data is shared publicly, however, you can't control what other people do with it.

In reality, this is true of anything you put on the internet. Even when a central database permanently deletes information, it can live on in caches, backups, screenshots, public archives, reading-list apps, and people's memories.

Holochain is a little different because it's explicit about data immutability. Here are some guidelines for wielding this tool wisely:

* Be choosy about what the DNA returns to the UI. Your zome functions serve as a membrane around DHT data and can avoid retrieving entries that are marked obsolete.
* Design your UI to communicate the permanence of the information users publish so they can make responsible decisions.

Because data takes up space even when it's no longer live, be judicious about what you commit to the source chain and the DHT:

* For large objects that have a short life, consider storing data outside of the DHT in separate, short-lived DHTs, [IPFS](https://ipfs.io), [Dat](https://dat.foundation), a data store on the user's machine, or even a centralized service.
* Commit large sets of small updates to entries in batches, or ignore the built-in update function and commit deltas instead.
* For large entries with frequent but small changes, break the content into 'chunks' that align with natural content boundaries such as paragraphs in text, regions in images, or scenes in videos.

## Key takeaways

* All data in the source chain and DHT is immutable once it's written. Nothing is ever deleted.
* It's useful to be able to modify data, so Holochain offers 'delete' and 'update' functions for public data that mark old entries obsolete.
* This requires extra care to meet users' expectations because it’s different from central databases.
