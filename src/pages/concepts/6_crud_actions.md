---
title: "CRUD Actions: Modifying and Deleting Data"
---

::: intro
Holochain allows agents to 'mutate' immutable data by publishing special **delete** and **update** actions to the DHT.
:::

::: orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why you can't delete or modify DHT data](#public-immutable-databases)
2. [How to simulate mutability in an immutable database](#simulating-mutability)
3. [Addressing concerns about privacy and storage requirements](#handling-privacy-concerns-and-storage-constraints)

### <i class="far fa-atom"></i> Why it matters

Immutable public data is a surprising feature of Holochain and many other distributed systems. It's important to understand the consequences in order to make informed design decisions that respect your users' privacy and storage space.
:::

![](/assets/img/concepts/6.1-crud.png){.sz80p} {.center}

## Public, immutable databases

Data in a Holochain app is immutable for a couple reasons:

* Immutability of the source chain and DHT data means we can safely assume that data wasn't changed after being published, which means we can build new state on top of it.
* Immutability makes data syncing faster, simpler, and more reliable. Mutable distributed databases often require complex coordination protocols that reduce performance.

However, developers expect CRUD (create, read, update, delete) to be a basic feature of a database; it's an important part of most apps. So how do we do it on Holochain?

## Simulating mutability

You might remember from [a few pages back](../3_source_chain/) that we described each record as an 'action', not a thing. When you create, update, or delete a piece of data, you're actually recording the _act of doing it_. (This is called [event sourcing](https://martinfowler.com/eaaDev/EventSourcing.html), if you're interested.)

Here are all the mutation actions an agent can perform:

* An **entry creation action** calls an app or system entry into existence.
    * **Create entry** creates a new entry.
    * **Update entry** also creates a new entry, but marks an existing new-entry action as having an update.
* **Delete entry** marks an existing entry creation action as "dead" --- not actually removed from the data store, but not considered 'living' data anymore. (This is because no data ever really disappears from the DHT.)
* **Create link** creates a new link.
* **Delete link** marks an existing create-link action as dead.

In almost every case where an action 'modifies' old data, it's simply sending a piece of metadata to be attached to the old data. The old data still exists; it just has a different status.

All the DHT does is accumulate all these actions and present them to the application. This gives you some versatility in deciding how to manage conflicting contributions from many agents, such as diverging updates on one text document.

It's also important to note that an update or delete action doesn't operate on entries or links --- it operates on _the actions that called them into existence_. That means you have to specify an action hash, not just an entry hash. In the case of deletes, an entry or link isn't dead until all the actions that created it are also dead.

This prevents clashes between attempts to delete identical entries written by different authors at different times, such as Alice and Bob both writing the message "hello". That entry exists in one place in the DHT, but it will have two new-entry actions attached to it, each of which can be updated or deleted independently.

### Resolving conflicts in a conflict-free database

You may be thinking, if an entry can accumulate multiple update and delete actions, which is the _right_ entry? The answer is that it's up to your application to decide. You may want to preserve all revisions and show them as a tree, allowing people to follow whichever path they prefer. You may want to write a simple conflict-resolution mechanism into your getter functions, such as "the earliest one wins" or "deletes always override updates". Or you may want to incorporate automatic merge functions that apply all updates to the thing being updated, such as a [conflict-free replicated data type (CRDT)](https://crdt.tech/).

You'll also want to decide whether the primary units of data in your DHT are _entries_ or _actions_ (that is, entry plus author plus timestamp). There are appropriate places to use each, but that's beyond the reach of this introduction.

In the future, Holochain may allow you to define CRDT-like automatic conflict-resolution strategies that collapse multiple CRUD actions into a consistent, canonical view of a piece of DHT data.

## Handling privacy concerns and storage constraints

You've seen how deletes and updates don't actually remove data; they just add a piece of metadata that changes its status. This can go against users' expectations. When you ask a central service to delete information you'd rather people not know, you're trusting the service to wipe it out completely --- or at least stop displaying it. When your data is shared publicly, however, you can't control what other people do with it.

In a sense, this is true of anything you put on the internet. Even when a central database permanently deletes information, it can live on in caches, backups, screenshots, public archives, reading-list apps, and people's memories. Privacy is all about applying friction to data sharing, so your responsibility as a designer is to create appropriate levels of friction. Here are some guidelines:

* Be careful about what the DNA returns to the UI. Your coordinator zome functions serve as the API to the DHT's data and can filter out old data. This doesn't completely prevent people from accessing it, because they can create their own coordinator zomes, but it does force them to put in some effort to get what they want.
* Design your UI to communicate the permanence of the information that participants publish so they can make responsible decisions about what they choose to share.

Additionally, because data takes up space even when it's no longer live, be judicious about what you commit to a source chain and/or DHT.

* For large objects that have a short life, consider storing data outside of the DHT in separate, short-lived DHTs, [IPFS](https://ipfs.io), [Dat](https://dat.foundation), a data store on the user's machine outside of Holochain, or even a centralized service.
* If an entry might have many small updates to it in a short time, queue them up and write them in one action. Or ignore the built-in update feature and commit updates as diffs instead.
* For large blobs with frequent but small changes, break the content into 'chunks' that align with natural content boundaries such as paragraphs in text, regions in images, or scenes in videos, then commit these chunks in separate actions. This can help with deduplicating storage for portions of a blob that changes infrequently or appears in many blobs.

Finally, data that's invalid (we'll learn about that in the [next section](../7_validation/)) can be removed by a DHT node that's elected to validate and store it. And in the future Holochain will permit nodes to 'purge' the data they're storing, for reasons other than invalidity, such as in response to right-to-be-forgotten requests, or flagging of immoral content, or simply because the data takes up too much space.

## Key takeaways

* All data in the source chain and DHT is immutable once it's written. Nothing is ever deleted.
* It's useful to be able to modify data, so Holochain offers delete and update actions that simulate mutability by adding status-changing metadata to existing data.
* Because this may surprise users, developers have a responsibility to inform them of the permanence of data and protect them from negative consequences.
* In the future we intend to introduce actions that request the actual deletion of data, as well as automated conflict-resolution features.


!!! learn Learn more
* [CRDT.tech](https://crdt.tech/), an informational site about conflict-free replicated data types.
* [Holochain and Privacy](https://www.youtube.com/watch?v=5watvYlDH4A&feature=youtu.be), a brief YouTube video introducing what privacy looks like from a Holochain perspective.
* [Exploring Co-Design Considerations for Embedding Privacy in Holochain Apps, A Value Sensitive Design Perspective](https://dialnet.unirioja.es/servlet/articulo?codigo=8036267), Paul d'Aoust, Oliver Burmeister, Alisha Fernando, Anwaar Ulhaq, Kirsten Wahlstrom. A paper that explores the system primitives of Holochain and how they affect user privacy, with recommendations from the disciplines of Privacy by Design and Participatory Design.
!!!

### Next Up

[Explore validation →](../7_validation/){.btn-purple}
