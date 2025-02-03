---
title: "The Source Chain: A Personal Data Journal"
---

::: intro
Each participant in a Holochain network creates and stores their own data in a journal called a **source chain**. Each journal entry is cryptographically signed by its author and is immutable once written.
:::

::: orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [How agent identities are created](#agent-identity)
2. [Where user data is stored](#source-chain-your-own-data-store)
3. [How writes are handled](#concurrency-atomic-commits-and-source-chain-lifecycle-events)
4. [Detecting third-party tampering](#detecting-third-party-tampering)

### <i class="far fa-atom"></i> Why it matters

When you understand how agents and their data are represented, you'll have the foundational knowledge for creating an appropriate user experience that takes advantage of Holochain's agent-centric design.
:::

## Agent identity

Let's take a look at one single node and see what's happening from the participant's perspective.

Back in [the basics](..//1_the_basics/), we said that one of Holochain's pillars is 'intrinsic data integrity.' The first stone in this pillar is [**public key cryptography**](https://en.wikipedia.org/wiki/Public-key_cryptography), which allows each participant to create and authenticate her own identifier without a central password database. If you've ever used [SSH](https://en.wikipedia.org/wiki/Secure_Shell), you're already familiar with this.

![](/assets/img/concepts/3.1-key-generation.png){.sz60p} {.center}

When you join a hApp's network, you create an identifier for yourself by generating a **public/private key pair**. This key pair does a few things for you:

* It gives you a unique ID in the app's network, which shows that you belong and serves as your address.
* It allows you to prove that you authored the things you said you authored.
* It allows others to detect third-party attempts to tamper with your data.
* It allows others to encrypt and send you data that only you can decrypt.

All your key pairs are stored in an encrypted, password-protected key manager on your device. This table shows how the public and private keys are used.

|                                                                      Private Key                                                                      |                                        Public Key                                       |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| • Stays **secret** on your device                                                                                                                     | • **Shared** with all your peers on the network                                         |
| • Acts like a **password** --- only you have it, and it's necessary for proving ownership of your public key                                            | • Acts like a **user ID** --- uniquely identifies you to other users                      |
| • Acts like a **royal seal** --- creates unforgeable, tamper-evident [digital signatures](https://en.wikipedia.org/wiki/Digital_signature) on your data | • Allows others to **verify the integrity** of your signatures                          |
| • Acts like a **mailbox key** --- opens messages sealed with your public key                                                                            | • Acts like a **mail slot** --- allows others to encrypt and send you data that only you can unlock |
|                                                                                                                                                       |                                                                                         |

## Source chain: your own data store

![](/assets/img/concepts/3.2-source-chain-as-journal.png){.sz60p} {.center}

The next stone in the pillar is a chronological journal of every action that the participant has performed in her copy of the app --- creating, updating, or deleting public or private data, linking data together, and more. Only she has the authority to write to it; it lives on her device and each entry must be signed by her private key. This journal is called a **source chain** because every piece of data in an app has its origin in someone's journal.

The user's actions are stored in the source chain as **records**, which consist of an **action** (we'll get to that later) and usually some sort of binary data (an **entry**). Each entry has a **type** that distinguishes its purpose, similar to an object-oriented class or database table schema definition.

It's most helpful to think of an action as just that --- the _act of changing application state_. So instead of thinking of a source chain record as "a chat message", for instance, you could think of it as recording "the act of adding a chat message to your feed". So while it's useful for noun-like things like messages and images, it is also well-suited to things like real-time document edits, game moves, and transactions. You'll learn about all the different action types in the section on [CRUD](../6_crud_actions/) --- actions like 'create link' and 'delete entry'.

This journal starts with three special system records, followed optionally by some app data, and one final system record:

![](/assets/img/concepts/3.3-genesis-records-1-and-2.png){.sz60p} {.center}

![](/assets/img/concepts/3.4-genesis-records-3-and-4.png){.sz60p} {.center}

1. The **DNA hash**. Because the DNA's executable code constitutes the 'rules of the game' for a network of participants, this record claims that your Holochain runtime has seen and is abiding by those rules.
2. The agent's **membrane proof**. When a cell tries to join a network, it shares this entry with the existing peers, who check it and determine whether the cell should be allowed to join them. Examples: an invite code, an employee ID signed by the HR department, or a proof of paid subscription fees.
3. The **agent ID**. This contains your public key as your digital identity. The signatures on all subsequent records must match this public key in order to be valid. {#agent-id-action}
4. Zero or more records containing application data that was written during the init process --- that is, by the `init` [lifecycle hook](../11_lifecycle_events) of any coordinator zomes that define one.
4. The **init complete** action. This is a record meant for internal use, simply helping the conductor remind itself that it's completely activated the cell by running all the coordinator zomes' `init` callbacks.

After this come the records that record the user's actions. These include:

* The creation, modification, and deletion of **app entries** (user data)
* The creation or deletion of **links** between data

(Other special system actions show up too, but we'll get to those later.) As a developer, you define the format and **validation rules** for each type of app entry or link that your DNA deals with. An entry can contain any sort of binary data, but most of the time you'll want to give it structure using some sort of serialization format. Our SDK gives you the tools to automatically convert from Rust data types to [MessagePack](https://msgpack.org) and back again.

_A record on a source chain cannot be modified once it's been committed._ This is called [append-only](https://en.wikipedia.org/wiki/Append-only), and it's important for system integrity. The source chain is the history of all the things the participant has done in the app, and her peers may need to check this history in order to assure themselves that it's safe to interact with her.

## Concurrency, atomic commits, and source chain lifecycle events

Multiple zome function calls can be made at one time, and each of them can read or write data as needed. The source chain state that the function sees is a snapshot from the beginning of function execution, however, so it won't see writes made by any other calls in progress. And if two calls try to write to the agent's source chain at once, the first one to finish will succeed and the second will fail, telling the caller that the source chain top has moved. The caller can then give up or try again until the call succeeds.

If the ordering of records doesn't matter, the function can instead be written to use **relaxed chain ordering** -- that is, if it fails to write, the conductor will try the write again, adding the new records onto the end of the updated chain.

When a zome function writes more than one record to a source chain, it all happens **atomically** --- that is, all the commits succeed or fail together. If one atomic commit fails because of a moved source chain top or a validation failure, it won't leave the source chain in an inconsistent state.

Finally, when an atomic commit succeeds, the conductor calls an optional **post-commit callback** defined in the same coordinator zome as the function that wrote the commit, allowing follow-up actions such as [notifications](../9_signals/) to the UI or other agents in the network. The post-commit callback can do most things a function can do, except write new data.

## Detecting third-party tampering

If the integrity of your data is so important, what might happen if a third party tried to mess with it en route to your true love or business partner? The answer is, _not much_. Let's take a look at why.

![](/assets/img/concepts/3.5-commit.png){.sz60p} {.center}

1. When a function in the DNA wants to store a user action, it creates a record containing the details of that action and a reference to the previous record.
2. Then the conductor calls the DNA's validation function for that record. If it fails validation, it returns an error to the client.
3. If validation is successful, the conductor cryptographically signs the record with the agent's private key and writes it onto the end of their source chain.

Like a real-life signature, this cryptographic signature proves that it was you who created the record. It's based on cryptographic math, so it's verifiable and impossible to forge. It's also only valid for the contents of that record --- if a third party modifies even a single character of the signed data, the signature no longer matches. It's like a fingerprint for the data, combined with the author's own royal seal.

This lets us detect [man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) on _record_ data, but it still doesn't tell us whether anyone has tampered with the _order of records_ in the source chain.

Let's take a closer look at the action. It includes the hash of the previous action, a timestamp, and the entry's type.

![](/assets/img/concepts/3.6-action.png){.sz80p} {.center}

Let's look even more closely at that first line in the action.

![](/assets/img/concepts/3.7-prev-action.png){.sz60p} {.center}

This hash is the unique cryptographic 'fingerprint' for the previous record's data. This is what ensures the integrity of the entire source chain. Each record points back to its previous entry. With a paper journal, it's obvious when someone's ripped out a page, glued a new page in, or taped a sheet of paper over an existing page. This chain of hashes is the digital equivalent: if anyone modifies so much as a single character in a record, it and all subsequent records will be invalidated unless they recreate all the hashes and signatures.

This is great for helping people detect third-party tampering. But unfortunately anyone can modify their own source chain, recreate the hashes and signatures, and create a perfectly valid, but wrong, alternate history for themselves. For some applications, this wouldn't matter so much, but it gets quite serious when the source chain holds things like financial transactions or ballots. So how do we tackle this problem?

Holochain's answer is simple --- _somebody will notice_. More on that in the next concept!

## Key takeaways

* Holochain apps do not use logins or password databases. Instead, participants create their own digital identifiers as cryptographic public/private key pairs. These two keys together prove their online identity.
* Participants share their public keys with other participants in the same app.
* Participants prove authorship of their data via impossible-to-forge digital signatures created with their private key. Third-party data tampering is detected by using the author's public key to verify the signature.
* A source chain is a chronological record of all the state transitions a participant has made in her cell. It lives on her device.
* Data is stored in the source chain as records, which consist of actions and sometimes entries.
* Data can be linked together.
* Every entry and link has a type, validated by a function that checks its integrity in the context of its place in the source chain.
* The first four records on a source chain are called genesis records, and are special system types that contain the DNA hash, the agent's membrane proof, their public key, and an init-complete marker.
* Entries are just binary data, and MessagePack is a good way to give them structure.
* The source chain and all of its data is tamper-evident; validators can detect third-party attempts to modify it.

!!! learn Learn more
* [dApp Planning: Crypto Basics](https://medium.com/holochain/dapp-planning-crypto-basics-8bd1073cbe19)
* [Learn Cryptography: what are hash functions?](https://learncryptography.com/hash-functions/what-are-hash-functions)
* [Wikipedia: Hash chain](https://en.wikipedia.org/wiki/Hash_chain)
* [Wikipedia: Public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)
* [Wikipedia: Man-in-the-middle attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)
!!!

### Next Up

[Explore the DHT →](../4_dht/){.btn-purple}