# 03: Private data on your local source chain

<div class="coreconcepts-intro" markdown=1>
Each user in a Holochain network creates and stores their own data in a journal called a **source chain**. Each journal entry is cryptographically signed by its author, and is immutable once it's written.
</div>

<div class="coreconcepts-orientation" markdown=1>
## What you'll learn

1. [How agent identities are created](#agent-identity)
2. [The source chain, where user data comes from](#source-chain-your-own-data-store)
3. [Detecting third-party tampering](#detecting-third-party-tampering)

## Why it matters

Once you understand how agents and their data are represented, you'll have foundational knowledge for creating an appropriate user experience that takes advantage of Holochain's agent-centric design.
</div>

## Agent identity

Let's take a look at one single node and see what's happening from the user's perspective.

Back in [the basics](/concepts/1_the_basics), we said that in Holochain, one pillar of trust is 'intrinsic data integrity.' And the first stone in this pillar is [**public key cryptography**](https://en.wikipedia.org/wiki/Public-key_cryptography), which allows each user to create their own account without a central password database. If you've ever used [SSH](https://en.wikipedia.org/wiki/Secure_Shell), you've already used this sort of cryptographic self-sovereign identity.

![](https://i.imgur.com/VHTb6yi.png)

When you join a hApp's network, you create an identity for yourself by generating a **public/private key pair**. With this key pair, you can:

* identify yourself,
* prove authorship of your data,
* allow others to detect third-party tampering of your data, and
* view data meant for your eyes only.

Your conductor generates and stores all your keypairs in an encrypted, password-protected file. This table shows how the public and private keys are used, and how they are different from each other.

|                                                                      Private Key                                                                      |                                        Public Key                                       |
|-------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| • Stays **secret** on your device                                                                                                                     | • **Shared** with all your peers on the network                                         |
| • Acts like a **password**---only you have it, and it's necessary for proving ownership of your public key                                            | • Acts like a **user ID**---uniquely identifies you to other users                      |
| • Acts like a **royal seal**---creates unforgeable, tamper-evident [digital signatures](https://en.wikipedia.org/wiki/Digital_signature) on your data | • Allows others to verify the integrity of your royal seal                              |
| • Acts like a **mailbox key**---decrypts data encrypted with your public key                                                                          | • Acts like a **mail slot**---allows others to encrypt and send data meant only for you |

## Source chain: your own data store

![](https://i.imgur.com/3wXR4G7.png)

The next stone in the pillar is a chronological journal or log of every piece of data the user has created. Only the user has the authority to write to it, because it lives on their device and each entry must be signed by their private key. This journal is called a **source chain**, because every piece of data in a Holochain app (**hApp**) begins its existence here.

Data is stored in the source chain as **entries**, individual pieces of string data. Most of the time, you'll want your entries to be JSON so they can have meaningful structure.

This journal starts with two special system entries called 'genesis' entries:

![](https://i.imgur.com/wDAn5zr.png)

1. **The hash of the DNA**. Because the DNA constitutes the 'rules of play' for everyone in the app, this entry shows that you have seen and agree to abide by those rules.
2. **Your agent ID**. This contains your public key as a record of your digital identity. The signatures on all subsequent entries must match this public key in order to be valid. This entry can also contain extra information necessary for gaining entry to the network, such as an invite code or proof of paid dues.

After this comes the **app entries** or user data. As a developer, you define the format and custom **validation rules** for each type of app entry that your DNA deals with. They can contain anything that fits into a string, but we give you tools to automatically convert from Rust structs to JSON and back again.

Other special system entry types may show up, but we'll get to those later.

_An entry on your source chain must not be modified once it's been committed._ This is important, because your source chain is a record of all the things you've done in the app, and your peers may need to check this record in order to validate an entry.

## Detecting third-party tampering

If the integrity of your data is so important, what might happen if a third party tried to mess with it en route to your true love or business partner? The answer is, _not much_. Let's take a look at why.

![](https://i.imgur.com/MxAX5SG.png)

1. When the DNA wants to create an entry for you, first it validates the entry according to its rules. This protects you from making mistakes that flag you as a bad actor.
2. It then asks your conductor to sign the entry with your private key.
3. Your conductor adds the signature to a **header** and attaches it to the entry.
4. Your conductor saves the entry as the next item in your source chain.

Like a signature written in ink, the signature guarantees that you created the entry. But it's based on complex mathematics, so it's verifiable and unforgeable. It's also only valid for that entry's content---if a third party modifies even a single character, the signature breaks.

This lets us detect [man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) on _entry data_. But it still doesn't tell us whether anyone has tampered with the _source chain itself_.

Let's take a closer look at the header. Along with the signature, it includes the hash of the previous header, a timestamp, and the entry's type.

![](https://i.imgur.com/3AOXfVf.png)

Let's look even closer at that first line in the header.

![](https://i.imgur.com/UgMgYq3.png)

This is what ensures the integrity of the entire source chain. It points back to the previous entry's header, which points back to _its_ previous entry's header, and so forth. With a paper journal, it's obvious when someone's ripped out a page, glued a new page in, or taped a sheet of paper over an existing page. This chain of header hashes is the digital equivalent.

But _what if I want to tamper with my own source chain_? I have my private key, so I can throw away entries I don't like and forge new ones. This would be like buying a new journal, meticulously copying every entry up to the point that I wanted to make the change, then creating a new entry that didn't exist in my old journal. For a diary, this doesn't matter so much. But it gets serious when the journal holds things like financial transactions or ballots.

Holochain's answer is simple&mdash;_somebody will notice_. More on that in the next concept!

## Key takeaways

* Holochain apps do not use logins or password databases.
* Users create their own digital identifiers as public/private key pairs. The private key secures their identity; the public key proves their possession of the private key and acts as a user ID.
* Users share their public keys with other participants in the same app.
* Users prove authorship of their data via unforgeable digital signatures, created with their private key. Third-party tampering with data is detected by verifying the signature using the user's public key.
* The user's source chain is a chronological record of all the data they've produced in an app. It lives on their device.
* Data is stored in the source chain as individual strings called entries.
* The first two entries are called genesis entries, and contain the DNA hash and the agent's public key.
* JSON is a good way to give structure to your entries.
* The source chain is tamper-evident; validators can detect third-party attempts to modify it.

## Learn more

* [Guidebook: The local source chain](../../guide/zome/read_and_write#the-local-source-chain-headers-and-entries)
* [dApp Planning: Crypto Basics](https://medium.com/holochain/dapp-planning-crypto-basics-8bd1073cbe19)
* [Learn Cryptography: what are hash functions?](https://learncryptography.com/hash-functions/what-are-hash-functions)
* [Wikipedia: Hash chain](https://en.wikipedia.org/wiki/Hash_chain)
* [Wikipedia: Public key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)
* [Wikipedia: Man-in-the-middle attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)

## Tutorials

<div class="h-tile-container">
    <div class="h-tile tile-alt tile-tutorials">
        <a href="../../tutorials/coreconcepts/hello_me">
            <h4>04: Hello Me Tutorial</h4>
        </a>
    </div>
</div>
