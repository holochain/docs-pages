# 05. Links: Connecting DHT Data Together

<div class="coreconcepts-intro" markdown="1">
Entries on the DHT are connected to one another via one-way **links**. This allows you to create a graph database on the DHT, making information easy to discover.
</div>

<div class="coreconcepts-orientation" markdown="1">
### <i class="fas fa-thunderstorm"></i> What you'll learn

1. [Why it's hard to find data in a DHT](#the-difficult-task-of-looking-for-data-especially-when-you-dont-know-what-youre-looking-for)
2. [How turning it into a graph database makes it easy](#links-creating-a-distributed-graph-database)
3. [Starting points you can use to discovere data](#starting-points-for-traversing-graphs)
4. [How it looks like in real life](#case-study-a-music-sharing-app)

### <i class="far fa-atom"></i> Why it matters

DHTs and graph databases are different from familiar data stores, like relational databases, key/value stores, and document/object stores. Once you understand how they work, you'll be able to design a robust data model for your app that takes advantage of their strengths and avoids their weaknesses.
</div>

## The difficult task of looking for data (especially when you don't know what you're looking for)

![](https://i.imgur.com/FDGsIDF.png)

The DHT has one big advantage---you can ignore the physical location of data and ask for it by its content address. This means no broken URLs, unavailable resources, or nasty surprises about what the entry contains.

It does, however, make it hard to find the data you're looking for. If it were all on one machine, you could just run a quick query. But that would get pretty slow on a distributed system where everyone has a little bit of the whole data set.

On the DHT, we only have addresses. This creates a chicken-and-egg problem. In order to find an entry, you need to know its address. You can only know the address if:

* You have the content and can calculate its hash.
* You receive the hash from somewhere else.

A hash is a 'black box'---the DHT can only give you full entries. It does not search for entries that may contain a value.

So how do we find what we're looking for?

## Links: creating a distributed graph database

Holochain lets you **link** any two entries together. This lets you _connect known things to unknown things_, which then become known things that link to more unknown things, and so on. Your app's DHT becomes a [**graph database**](https://en.wikipedia.org/wiki/Graph_database).

A link is stored in the DHT as metadata along with its **base**, the entry from which it was linked. The base's address is all you need in order to query the links.

A link has a **type**, just like an app entry. It can also have a **tag** containing extra metadata about the relationship or target. You can put whatever you like into this tag, then retrieve or filter it in a link query.

## Starting points for traversing graphs

What sort of 'known things' in the DHT can be used as starting points?

* Everyone knows the hash of the DNA because it's the first entry in their source chain.
* Everyone knows their own agent ID entry's hash because it's the second entry in their source chain.
* You can create an entry containing a string that's hard-coded into the app, called an ‘anchor,’ so that all agents can find that entry. 
* Short strings, such as usernames and shortcodes, are easy to share via email, text, paper, or voice. They're also easy to type into a UI, which makes them useful as anchors that don't need to be hard-coded into the app.

!!! warning
    While you can theoretically link from universally well known entries like the DNA hash or hard-coded strings, it isn't recommended. A certain neighborhood of nodes will be responsible for storing all the links on those entries, creating a DHT 'hot spot' that will disproportionately tax that neighborhood's resources as the DHT grows. There are other approaches, such as splitting one anchor into many, based on the content of their links' targets. For a trivial example, rather than an `all_users` anchor, consider `usernames_a`, `usernames_b`, etc. Check out our [bucket set library](https://github.com/willemolding/holochain-collections#bucket-set) for an even better approach.

## Case study: a music sharing app

<div class="coreconcepts-storysequence" markdown="1">
1. ![](https://i.imgur.com/MSakvg1.png)
Alice is a singer/songwriter who excels at the ukulele and wants to share her music with the world. She joins the app and chooses to register the username `@alice_ukulele`. She checks if it's already been taken by calculating its address and looking for an existing `username` DHT entry with that address.

2. ![](https://i.imgur.com/qns2GAI.png)
That username is available, so she creates a `username` entry containing `@alice_ukulele` and links it to her agent ID entry. Now, users who know her username can find her agent ID.

3. ![](https://i.imgur.com/uzZ7rZG.png)
Alice wants to show up in the public directory of artists, so she links her username entry to an `_all_users_` anchor. This anchor already exists in the DHT and its value is hard-coded into the app. Anyone can query this anchor for a full list of usernames.

4. ![](https://i.imgur.com/CTgTxWh.png)
Alice creates a listing for her debut EP album and links it to her agent ID entry. Now, listeners who know her agent ID can find the albums she's published.

5. ![](https://i.imgur.com/xpKXxO2.png)
She uploads all the tracks and links them to the album.

6. ![](https://i.imgur.com/lQng0it.png)
She wants people to be able to find her album by genre, so she selects three applicable genres and links her album to them.

7. ![](https://i.imgur.com/cvYPJR2.png)
Those genres are already linked to an `_all_genres_` anchor, whose value is hard-coded into the app. Listeners can query this anchor to get the full list of genres.

8. ![](https://i.imgur.com/G9ejz5V.png)
Alice's entries, now linked to one another and other existing entries on the DHT, form a graph that allows listeners to discover her and her music from a number of different starting points.
</div>

!!! note
    Take note of the arrowheads above; you'll see that most are bi-directional, which means they are actually two separate links going in opposite directions. As starting points, anchors are the exception because don't need to be discovered from the entries to which they point to.

## Key takeaways

* It's not possible to do arbitrary queries on a DHT, because entries are scattered across many nodes and can only be retrieved by their addresses.
* Links allow you to connect a known entry (the base) to an unknown entry (the target) to create a graph database on the DHT.
* Links are stored on the base and can be retrieved with their base's address.
* Links are one-way; you create a two-way relationship with two links.
* Links are typed to distinguish the nature of the relationship.
* Links can have an arbitrary string tag that lets you filter results or preload information about their targets.
* An anchor is a well-known entry whose address is easy to calculate because everyone knows its content.

## Learn more

* [Wikipedia: Graph database](https://en.wikipedia.org/wiki/Graph_database)
* [Wikipedia: Resource Description Framework](https://en.wikipedia.org/wiki/Resource_Description_Framework), a standard for linking semantic data on the web
* [Wikipedia: Linked data](https://en.wikipedia.org/wiki/Linked_data), an application of linking to the web
