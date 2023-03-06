---
title: "Links and Anchors: Connecting DHT Data Together"
---

::: coreconcepts-intro
Entries on the DHT are connected to one another via one-way **links**. They allow you to create a graph database on the DHT, making information easy to discover. **Anchors** serve as starting points for link discovery.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why it's hard to find data in a DHT](#the-difficulty-of-looking-for-data-especially-when-you-don-t-know-what-you-re-looking-for)
2. [How linked data makes discovery easy](#links-creating-a-distributed-graph-database)
3. [Starting points you can use to discover data](#starting-points-for-traversing-graphs)
4. [How it looks in real life](#case-study-a-music-sharing-app)

### <i class="far fa-atom"></i> Why it matters

DHTs and graph databases are different from familiar data stores, like relational databases, key/value stores, and document/object stores. Once you understand how they work, you'll be able to design a robust data model for your app that takes advantage of their strengths and avoids their weaknesses.
:::

## The difficulty of looking for data (especially when you don't know what you're looking for)

![](/assets/img/concepts/5.1-links.png){.sz80p} {.center}

Deriving addresses directly from the content of your data has some advantages --- you can ignore the physical location of data and ask for it by its content address. This means no more broken URLs. It also means that a malicious third party can't sneak something nasty into the data they're serving you --- if it doesn't match the hash or author's signature, it's been tampered with.

It does, however, make it hard to find the data you're looking for. Addresses are just random numbers, and they don't give you much of a clue about the content they represent, let alone any metadata attached to the content. If everything were all on one machine, you could quickly scan through the data itself and find what you're looking for. But that would get pretty slow on a distributed system, where everyone has a little bit of the whole data set.

This creates a chicken-and-egg problem. In order to retrieve a piece of data that matters to you, you need to know its address. But you can only know the address if you can calculate it from the data (in which case you don't need to retrieve it), or if you discover the address somehow.

So how do you discover the address of the data you're looking for?

## Links: creating a distributed graph database

Holochain lets you **link** any two entries together. This lets you _connect known things to unknown things_, which then become known things that link to more unknown things, and so on. Your app's DHT becomes a [**graph database**](https://en.wikipedia.org/wiki/Graph_database).

A link is a piece of metadata that has four components:

* The **base address**, or the address from which it is linked. This is the 'known' thing.
* The **target address**, or the address it's linking to. This is the 'unknown' thing.
* A **type**; as with entries, you can define link types according to your app's needs.
* An optional **tag** containing extra information about the nature of the relationship or target. You can put whatever you like into this tag, then retrieve it or filter on it when you're querying a base address for links.

If you're familiar with [RDF](https://www.w3.org/RDF/) or [JSON-LD](https://en.wikipedia.org/wiki/JSON-LD), you'll probably find this familiar too --- the base is the same as a subject, the target is the same as an object, and the type and tag are the same as a predicate.

If you come from the relational database world instead, you can think of it like a foreign key relationship --- the target is a primary key to which foreign keys, or bases, point. You can also use links to form something like a query index, but we'll get to that later.

A link is stored at the base address, which means it's stored by the authorities that are responsible for the base address. This is something worth thinking about when you go to design your application's links structure.

## Starting points for traversing graphs

What sorts of 'known' things can you use as starting points?

First of all, Alice and Bob can just share addresses with each other. This could happen via email, business card, or pigeon post, but this is a networked technology we're talking about so it'd be nice to use Holochain itself for address sharing. The problem is that Alice and Bob don't know each other's addresses yet, so we're still at square one.

We recommend **anchors** as a useful pattern for creating starting points on the DHT's graph database. An anchor is just a small chunk of data on the DHT, usually a string, that serves as bases to attach a lot of links to. An anchor's value can be easy for humans to share and type, such as a username or hashtag, or it can be baked into the application as a string constant. The important thing is that anchors should be easy to locate.

Anchors are just built from entries and links, like anything else in Holochain, but they're part of the SDK so you don't have to roll your own implementation. Our implementation also lets you create 'paths', hierarchies of linked anchors, which are great for product categories, filesystems, search indexes, and more.

!!! note Links to (and from) nowhere
Neither the base nor the target of a link need to have any data stored at their address. This means that you can point to data that lives on another content-addressed database, such as IPFS, Secure Scuttlebutt, or a blockchain, and you can use the hash of such external resources as your link base, a sort of 'placeholder' for an external reference. It also means that anchors take up very little space, as nobody actually needs to write an anchor entry to their source chains or publish it to the DHT. Instead, you can just calculate the anchor string's hash and store links at that address.
!!!

## Case study: a music sharing app

!!! note Links aren't bidirectional
Take note of the arrowheads below; you'll see that many are bidirectional, but links are unidirectional. This means two links must be created, in opposite directions to each other.
!!!

::: coreconcepts-storysequence 

![](/assets/img/concepts/5.2-alice.png){.sz80p} {.center}

Alice is a singer/songwriter who excels at the ukulele and wants to share her music with the world. She joins the app and chooses to register the username "@alice_ukulele". She checks if it's already been taken by calculating its address and looking for an existing username DHT entry with that address.

![](/assets/img/concepts/5.3-alice-username.png){.sz80p} {.center}

That entry doesn't exist, so she creates it and links it to her agent address. Now, users who know her username can find her agent address.

![](/assets/img/concepts/5.4-usernames-anchor.png){.sz80p} {.center}

Alice wants to show up in the public directory of artists, so she links her username entry to the "_all_users_" anchor, a string constant that's hard-coded into the app. Now people can discover her username by retrieving all the links on "_all_users_".

![](/assets/img/concepts/5.5-alice-album.png){.sz80p} {.center}

Alice creates an entry for her debut EP album and links it to her agent address. Now listeners who know her agent address can find the albums she's published.

![](/assets/img/concepts/5.6-album-tracks.png){.sz80p} {.center}

She uploads all the tracks and links them to the album entry.

![](/assets/img/concepts/5.7-album-genres.png){.sz80p} {.center}

Now she wants people to be able to find her album by genre, so she selects or creates three applicable genre tags (they're anchors too) and links her album to them.

![](/assets/img/concepts/5.8-genres-anchor.png){.sz80p} {.center}

Those genres are already linked to an "_all_genres_" anchor, another hard-coded constant. Listeners can query this anchor to get the full list of genres.

![](/assets/img/concepts/5.9-graph-database.png){.sz80p} {.center}

Alice's entries, now linked to one another and other existing entries on the DHT, form a graph that allows listeners to discover her and her music from a number of different starting points.
:::

## Key takeaways

* It's not possible to do arbitrary queries on a DHT, because entries are scattered across many nodes and can only be retrieved by their addresses.
* Links allow you to connect a known address (the base) to an unknown address (the target) to create a graph database on the DHT.
* Links are stored by the authority responsible for their base's address.
* Links are one-way; you create a two-way relationship with a pair of links.
* Links have a type, as well as an arbitrary tag that lets you filter results or preload information about their targets.
* An anchor is an entry whose address is easy to calculate because its value is easy to discover, such as a username or hard-coded app constant.
* Holochain's built in anchors implementation lets you create hierarchies of linked path components.
* Links do not need to have any DHT data stored at their base or target address.


!!! learn Learn more
* [Wikipedia: Graph database](https://en.wikipedia.org/wiki/Graph_database)
* [Wikipedia: Linked data](https://en.wikipedia.org/wiki/Linked_data), an application of linking to the web
* [Wikipedia: Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework), a standard for linking semantic data on the web
!!!

### Next Up 

[Explore CRUD actions  →](../6_crud_actions/){.btn-purple} 