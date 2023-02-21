---
title: "Links and Anchors: Connecting DHT Data Together"
---

::: coreconcepts-intro
Entries on the DHT are connected to one another via one-way **links**. They allow you to create a graph database on the DHT, making information easy to discover. **Anchors** serve as starting points for link discovery.
:::

::: coreconcepts-orientation
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why it's hard to find data in a DHT](#the-difficulty-of-looking-for-data-especially-when-you-dont-know-what-youre-looking-for)
2. [How linked data makes discovery easy](#links-creating-a-distributed-graph-database)
3. [Starting points you can use to discover data](#starting-points-for-traversing-graphs)
4. [How it looks in real life](#case-study-a-music-sharing-app)

### <i class="far fa-atom"></i> Why it matters

DHTs and graph databases are different from familiar data stores, like relational databases, key/value stores, and document/object stores. Once you understand how they work, you'll be able to design a robust data model for your app that takes advantage of their strengths and avoids their weaknesses.
:::

## The difficulty of looking for data (especially when you don't know what you're looking for)

![](/assets/img/concepts/5.1-links.png){.sz80p} {.center}

Deriving addresses directly from the content of your data has some advantages—you can ignore the physical location of data and ask for it by its address. This means no more broken URLs. It also means that a malicious actor can't sneak something nasty into the data they're serving you---if it doesn't match the hash, it's been tampered with.

It does, however, make it hard to find the data you’re looking for. Addresses are just random numbers, which doesn’t give you much of a clue about the content that lives there. If everything were all on one machine, you could quickly scan through the data itself and find what you're looking for. But that would get pretty slow on a distributed system, where everyone has a little bit of the whole data set.

This creates a chicken-and-egg problem. In order to retrieve a piece of data that matters to you, you need to know its address. But you can only know the address if you can calculate it from the data (in which case you don't need to retrieve it), or if you discover the address somehow.

So how do you discover the address of the data you're looking for?

## Links: creating a distributed graph database

Holochain lets you **link** any two entries together. This lets you _connect known things to unknown things_, which then become known things that link to more unknown things, and so on. Your app's DHT becomes a [**graph database**](https://en.wikipedia.org/wiki/Graph_database).

A link is a piece of data with three components:

* The **base address**, or the address from which it is linked. This is the ‘known’ thing.
* The **target address**, or the address it’s linking to. This is the ‘unknown’ thing.
* An optional **tag** containing extra metadata about the nature of the relationship or target. You can put whatever you like into this tag, then retrieve it or filter on it when you’re performing a link query.

A link is stored by the authority that's responsible for the link's base address.

## Starting points for traversing graphs

What sorts of ‘known’ things can you use as starting points?

First of all, Alice and Bob can just share addresses with each other. This could happen via email, business card, or pigeon post, but this is a networked technology we're talking about so it'd be nice to use it for address sharing. The problem is that Alice and Bob don't know each other's addresses yet, so we're still at square one.

We recommend **anchors** as a useful pattern for creating starting points on the DHT’s graph database. Anchors are just small chunks of data, usually strings, that serve as things to attach links to. They can be easy for humans to share and type, such as usernames and hashtags, or they can be baked into the application as constants. The important thing is that they're simple enough that anyone can generate their address and retrieve links attached to them without knowing the address beforehand.

Anchors are just built from entries and links, like anything else in Holochain, but they’re part of the SDK so you don’t have to roll your own implementation. Our implementation also lets you create 'paths', hierarchies of linked anchors, which are great for product categories, filesystems, search indexes, and more.

## Case study: a music sharing app

!!! note Take Note
    Take note of the arrowheads below; you'll see that most are bi-directional, which means there are actually two separate links going in opposite directions. Hard-coded anchors are the exception because they don't need to be discovered.
!!!

::: coreconcepts-storysequence 

![](/assets/img/concepts/5.2-alice.png){.sz80p} {.center}

Alice is a singer/songwriter who excels at the ukulele and wants to share her music with the world. She joins the app and chooses to register the username “@alice_ukulele”. She checks if it’s already been taken by calculating its address and looking for an existing username DHT entry with that address.

![](/assets/img/concepts/5.3-alice-username.png){.sz80p} {.center}

That entry doesn’t exist, so she publishes it and links it to her agent address. Now, users who know her username can find her agent address.

![](/assets/img/concepts/5.4-usernames-anchor.png){.sz80p} {.center}

Alice wants to show up in the public directory of artists, so she links her username entry to the “_all_users_” anchor, a string constant that's hard-coded into the app. Now people can discover her username by retrieving all the links on "_all_users".

![](/assets/img/concepts/5.5-alice-album.png){.sz80p} {.center}

Alice creates an entry for her debut EP album and links it to her agent address. Now listeners who know her agent address can find the albums she’s published.

![](/assets/img/concepts/5.6-album-tracks.png){.sz80p} {.center}

She uploads all the tracks and links them to the album entry.

![](/assets/img/concepts/5.7-album-genres.png){.sz80p} {.center}

 She wants people to be able to find her album by genre, so she selects or creates three applicable genre tags (they’re anchors too) and links her album to them.

![](/assets/img/concepts/5.8-genres-anchor.png){.sz80p} {.center}

Those genres are already linked to an “_all_genres_” anchor, another hard-coded constant. Listeners can query this anchor to get the full list of genres.

![](/assets/img/concepts/5.9-graph-database.png)

Alice’s entries, now linked to one another and other existing entries on the DHT, form a graph that allows listeners to discover her and her music from a number of different starting points.
:::

## Key takeaways

* It’s not possible to do arbitrary queries on a DHT, because entries are scattered across many nodes and can only be retrieved by their addresses.
* Links allow you to connect a known address (the base) to an unknown address (the target) to create a graph database on the DHT.
* Links are stored by the authority responsible for their base’s address.
* Links are one-way; you create a two-way relationship with a pair of links.
* Links can have an arbitrary tag that lets you filter results or preload information about their targets.
* An anchor is an entry whose address is easy to calculate because its value is easy to discover, such as a username or hard-coded app constant.
* Holochain's built in anchors implementation lets you create hierarchies of linked path components.


!!! learn Learn more
* [Wikipedia: Graph database](https://en.wikipedia.org/wiki/Graph_database)
* [Wikipedia: Linked data](https://en.wikipedia.org/wiki/Linked_data), an application of linking to the web
* [Wikipedia: Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework), a standard for linking semantic data on the web
!!!

### Next Up 

[Explore CRUD actions —>](../6_crud_actions/){.btn-purple} 