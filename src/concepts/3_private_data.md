# 03: Private data on your local source chain

> Each user in a Holochain network creates and stores their own data in a journal called a **source chain**. Each journal entry is cryptographically signed by its author, and is immutable once it's written.

Let's take another look at one single node and see what's happening from the user's perspective.

## Agent identity

Back in [the basics](/concept/1_the_basics), we said that in Holochain, one pillar of trust is 'intrinsic data integrity.' To extend the metaphor a bit, the first stone in this pillar is [**public key cryptography**](https://en.wikipedia.org/wiki/Public-key_cryptography), which allows each user to create their own account without a central login service.

![](https://i.imgur.com/VHTb6yi.png)

When you join a hApp's network, you create an identity for yourself by generating a **public/private key pair**. With this key pair, you can:

* identify yourself,
* prove authorship of your data, and
* view data meant for your eyes only.

The conductor generates and stores all your keypairs in an encrypted, password-protected file. This table shows how the public and private keys are used, and how they are different from each other.

|                                                                       Private Key                                                                       |                                        Public Key                                       |
|---------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
| • Stays **secret** on your device                                                                                                                       | • **Shared** with all your peers on the network                                         |
| • Acts like a **password**---only you have it, and it's necessary for proving ownership of your public key                                              | • Acts like a **user ID**---uniquely identifies you to other users                      |
| • Acts like a **royal seal**---creates unforgeable, tamper-evident ['digital signatures'](https://en.wikipedia.org/wiki/Digital_signature) on your data | • Acts like a **picture of a royal seal**---allows others to verify your signatures     |
| • Acts like a **mailbox key**---decrypts data encrypted with your public key                                                                            | • Acts like a **mail slot**---allows others to encrypt and send data meant only for you |

Don't worry if some of this doesn't make sense. Public key cryptography is complicated, so analogies tend to end up pretty muddy.

## Source chain: your own data store

![](https://i.imgur.com/3wXR4G7.png)

The next stone in the pillar is a journal or log of every piece of data you've created. Only you have the authority to write to it, because it lives on your device and each entry must be signed by your private key.

Your journal is stored in a [**hash chain**](https://en.wikipedia.org/wiki/Hash_chain) data structure. We call it a **source chain**, because every piece of data in a Holochain app (**hApp**) has its source in someone's journal.

This journal starts with two special system entries called 'genesis' entries:

![](https://i.imgur.com/wDAn5zr.png)

1. **The hash of the DNA**. Because the DNA constitutes the 'rules of play' for all agents in your app's network, this entry shows that you have seen and agree to abide by those rules.
2. **Your agent ID**. This contains your public key. The signatures on all subsequent entries must match this public key in order to be valid.

After this comes the **app entries** or user data. As a developer, you define the format and custom **validation rules** for each type of app entry that your app needs. They can contain anything that fits into a string, but we give you tools to automatically convert from Rust structs to JSON and back again.

Other special system entry types may show up, but we'll get to those later.

_An entry on your source chain must not be modified once it's been committed._ This is important, because your source chain is a record of actions you've taken in the app.

How do we prevent, or at least detect, attempts to tamper with your source chain? Let's take a look at the commit process.

![](https://i.imgur.com/MxAX5SG.png)

1. When the DNA wants to create an entry, it first validates the entry according to its rules.
2. It then asks the conductor to sign the entry with your private key.
3. The conductor adds a **header** to the entry, which includes the signature and a few other items.
4. The conductor saves the entry as the next item in your source chain.

The signature guarantees that the entry itself hasn't been tampered with by a corrupt actor. Like a physical signature written in ink, it guarantees that you created the entry. Unlike a physical signature, it's only valid for that specific entry, which means that if a third party tries to tamper with it, the signature breaks.

This lets us detect [man-in-the-middle attacks](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) on _entry data_. But it still doesn't tell us whether the _source chain itself_ has been tampered with.

Let's take a closer look at the header. Along with the signature, it includes the hash of the previous header, a timestamp, and the entry's type.

![](https://i.imgur.com/3AOXfVf.png)

Let's look even closer at that first line in the header.

![](https://i.imgur.com/UgMgYq3.png)

This is what ensures the integrity of the entire source chain. It points back to the previous entry's header, which points back to _its_ previous entry's header, and so forth. With a paper journal, you can tell if someone's ripped out a page, glued a new page in, or taped a sheet of paper over an existing page. If you share your journal with someone else, they can verify its integrity in the same way. This chain of header hashes is the digital equivalent.

But---_what if I want to tamper with my own source chain_? I have everything I need to recreate the necessary signatures and previous header hashes. This would be like buying a new journal, meticulously copying every entry up to the point that I wanted to make the change, then creating a new entry that didn't exist in my old journal. For a diary, this wouldn't matter so much. But if my source chain holds financial records, I could commit some serious mischief.

Holochain's answer is simple---_somebody will notice_. More on that in the next concept!

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
