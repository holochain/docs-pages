# 05: Linking data together

<div class="coreconcepts-intro" markdown="1">
Entries on the DHT are connected to each other via one-way **links**. This allows you to create a graph database on the DHT to make information easy to discover.
</div>

<div class="coreconcepts-orientation" markdown="1">
## What you'll learn

1. [Why it's hard to find data in a DHT](#the-difficult-task-of-looking-for-data-when-you-dont-know-what-youre-looking-for)
2. [How to make it easy by turning it into a graph database](#links-creating-a-distributed-graph-database)
3. [What you can use as starting points for discovering data](#starting-points-for-traversing-graphs)
4. [What this looks like in real life](#case-study-a-music-sharing-app)

## Why it matters

DHTs and graph databases are different from familiar data stores like relational databases, key/value stores, and document or object stores. Once you understand how they work, you'll be able to design a robust data model for your app that takes advantages of their strengths and avoids their weaknesses.
</div>

## The difficult task of looking for data when you don't know what you're looking for

![](https://i.imgur.com/FDGsIDF.png)

The DHT has one big advantage---you can ignore the physical location of data and ask for it by its content address. This means no broken URLs, unavailable resources, or nasty surprises about what the entry contains.

It does, however, make it hard to find the data you're looking for. If it were all on one machine, you could just run a quick query on it. But on a distributed system, where everyone has a little bit of the whole data set, that would get pretty slow.

On the DHT all we have are addresses. This creates a chicken-and-egg problem. In order to find an entry, you need to know its address. But you can only know the address if you either:

* have the content and can calculate its hash, or
* receive the hash from somewhere else.

And a hash is a 'black box'---the DHT can only give you full entries, not search for entries that may contain a value.

So how do we find what we're looking for?

## Links: creating a distributed graph database

Holochain lets you **link** any two entries together. This lets you _connect known things to unknown things_, which then become known things that link to more unknown things, and so on. Your app's DHT becomes a [**graph database**](https://en.wikipedia.org/wiki/Graph_database).

A link is stored in the DHT as metadata along with its **base**, the entry it links from. The base's address is all you need in order to query the links.

A link has a **type**, just like an app entry. It can also have a **tag** that contains extra metadata about the relationship or the target. You can put whatever you like into this tag, then retrieve or filter on it in a link query.

## Starting points for traversing graphs

What sort of 'known things' in the DHT can we use as a starting point?

* Everyone knows the hash of the DNA, because it's the first entry in their source chain.
* Everyone knows their own agent ID entry's hash, because it's the second entry in their source chain.
* You can create an entry containing a string that's hard-coded into the app, so that all agents can find that entry. We call this an 'anchor'.
* Short strings such as usernames and shortcodes are easy to share via email, text, paper, or voice. They're also easy to type into a UI. This makes them useful as anchors that don't need to be hard-coded into the app.

!!! warn
    While you theoretically can link from universally well-known entries like the DNA hash or hard-coded strings, it isn't recommended. A certain neighborhood of nodes will be responsible for storing all the links on those entries, creating a DHT 'hot spot' that will disproportionately tax that neighborhood's resources as the DHT grows. There are other approaches, such as splitting one anchor into many based on the content of their links' targets. For a trivial example, rather than an `all_users` anchor, consider `usernames_a`, `usernames_b`, etc. Check out our [bucket set library](https://github.com/willemolding/holochain-collections#bucket-set) for an even better approach.

## Case study: a music sharing app

<div class="coreconcepts-storysequence" markdown="1">
1. ![](https://i.imgur.com/MSakvg1.png)
Alice is a singer-songwriter who excels at the ukulele. She wants to share her songs with the world. So she joins the app and wants to register the username `@alice_ukulele`. She checks whether it's already been taken by calculating its address and looking for an existing `username` DHT entry with that address.

2. ![](https://i.imgur.com/qns2GAI.png)
That username is available, so she creates a `username` entry containing `@alice_ukulele` and links it to her agent ID entry. Now users who know here username can find out her agent ID.

3. ![](https://i.imgur.com/uzZ7rZG.png)
Alice wants to show up in the public directory of artists, so she links her username entry to an `_all_users_` anchor. This anchor already exists in the DHT and its value is hard-coded into the app. Anyone can query this anchor for a full list of usernames.

4. ![](https://i.imgur.com/CTgTxWh.png)
Alice creates a listing for her debut EP album and links it to her agent ID entry. Now listeners who know her agent ID can discover the albums she's published.

5. ![](https://i.imgur.com/xpKXxO2.png)
Now she uploads all the tracks and links them to the album.

6. ![](https://i.imgur.com/lQng0it.png)
She wants people to be able to find her album by genre, so she selects three applicable genres and links her album to them.

7. ![](https://i.imgur.com/cvYPJR2.png)
Those genres are already linked to an `_all_genres_` anchor, whose value is hard-coded into the app. Listeners can query this anchor to get the full list of genres.

8. ![](https://i.imgur.com/G9ejz5V.png)
Alice's entries, linked to each other and to existing entries on the DHT, now form a graph that allows listeners to discover her and her music from a number of different starting points.
</div>

!!! note
    Take note of the arrowheads above. You'll note that most are bi-directional, which means they are actually two separate links going in opposite directions. Anchors are the exception because they're starting points and don't need to be discovered from the entries they point to.

## Key takeaways

* It's not possible to do arbitrary queries on a DHT, because entries are scattered across many nodes and can only be retrieved by their addresses.
* Links allow you to connect a known entry (the base) to an unknown entry (the target) to create a graph database on the DHT.
* Links are stored on the base and can be retrieved with their base's address.
* Links are one-way; you can create a two-way relationship with two links.
* Links are typed to distinguish the nature of the relation.
* Links can also have an arbitrary string tag that lets you filter results or preload information about their targets.
* An anchor is a well-known entry whose address is easy to calculate because everyone knows its content.

## Learn more

* [Wikipedia: Graph database](https://en.wikipedia.org/wiki/Graph_database)
* [Wikipedia: Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework), a standard for linking semantic data on the web
* [Wikipedia: Linked data](https://en.wikipedia.org/wiki/Linked_data), an application of linking to the web
