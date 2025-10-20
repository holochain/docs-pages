---
title: "Links, Paths, and Anchors"
---

::: intro
A **link** connects two addresses in an application's shared database, forming a graph database on top of the underlying hash table. Links can be used to connect pieces of [addressable content](/resources/glossary/#addressable-content) in the database or references to addressable content outside the database.

An **anchor** is a pattern of linking from a well-known base address. Our SDK includes a library for creating hierarchies of anchors called **paths**, allowing you to create things like collections, pagination, indexes, and taxonomies.
:::

## Turning a hash table into a graph database

A Holochain application's database is, at heart, just a big key-value store --- or more specifically, a hash table. You store and retrieve content by hash. This is useful if you already know the hash of the content you want to retrieve, but it isn't helpful if you don't.

A piece of content itself can contain a hash as part of its data structure, and that's great for modelling a _many-to-one relationship_. And if the number of things the content points to is small and doesn't change often, you can model a _many-to-many relationship_ using a field that contains an array of hashes. But at a certain point this becomes hard to manage, especially if that list regularly changes or gets really large.

To help with this, Holochain also lets you attach **links** as metadata to an address in the database. You can then retrieve a full or filtered list of links from that address in order to discover more addressable content. In this way you can build up a traversable graph database.

### Define a link type

Every link has a type that you define in an integrity zome, just like [an entry](/build/entries/#define-an-entry-type). Links are simple enough that they're committed as an action with no associated entry. Here's what a link creation action contains, in addition to the [common action fields](/build/working-with-data/#entries-actions-and-records-primary-data):

* A **base**, which is the address the link is attached to and _points from_
* A **target**, which is the address the link _points to_
* A **type**
* An optional **tag** that can hold a small amount of arbitrary bytes, up to 1 kb

You can use the tag as link 'content' to further qualify the link, provide a summary of data about the target to save on DHT queries, or build a starts-with search index. But unlike an entry's content, the HDK doesn't provide a macro that automatically deserializes the link tag's content into a Rust type. {#link-tag}

[Just as with entries](/build/entries/#define-an-entry-type), Holochain needs to know about your link types in order to dispatch validation to the right integrity zome. You can do this by implementing a `link_types` callback function, and the easiest way to do this is to add the [`hdi::hdk_link_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_link_types.html) macro to an enum that defines all your link types:

```rust
use hdi::prelude::*;

// Generate a `link_types` function that returns a list of definitions.
#[hdk_link_types]
enum LinkTypes {
    DirectorToMovie,
    GenreToMovie,
    IpfsMoviePoster,
    MovieReview,
    MovieToMovieLoanOffer,
    // Note: the following link types will become useful when we talk about
    // paths and anchors later.
    MovieByFirstLetterAnchor,
    MovieByFirstLetter,
    // other types...
}
```

## Create a link

As with entries, you'll normally want to store your link CRUD code in a [**coordinator zome**](/resources/glossary/#coordinator-zome), not an integrity zome. You can read about why in the page on [entries](/build/entries/#create-an-entry).

Create a link by calling [`hdk::link::create_link`](https://docs.rs/hdk/latest/hdk/link/fn.create_link.html). If you used the `hdk_link_types` macro in your integrity zome (see [Define a link type](#define-a-link-type)), you can use the link types enum you defined:

```rust
use hdk::prelude::*;
// Import the link types enum defined in the integrity zome.
use movie_integrity::*;

let director_entry_hash = EntryHash::from_raw_36(vec![ /* bytes of the hash of the Sergio Leone entry */ ]);
let movie_entry_hash = EntryHash::from_raw_36(vec![ /* bytes of the hash of The Good, The Bad, and The Ugly entry */ ]);

let create_link_action_hash = create_link(
    director_entry_hash,
    movie_entry_hash,
    LinkTypes::DirectorToMovie,
    // Cache a bit of the target entry in this link's tag, as a search index.
    vec!["year:1966".as_bytes()].into()
)?;
```

Links can't be updated; they can only be created or deleted. Multiple links with the same base, target, type, and tag can be created, and they'll be considered separate links for retrieval and deletion purposes.

### Creating a link, under the hood

When a zome function calls `create_link`, Holochain does the following:

1. Build an action called [`CreateLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.CreateLink.html) that includes:
    * the author's public key,
    * a timestamp,
    * the action's sequence in the source chain and the previous action's hash, and
    * the link type, base, target, and tag.
    <!-- * a calculated weight value for rate limiting -->
2. Write the action to the scratch space.
3. Return the `ActionHash` of the pending action to the calling zome function.

At this point, the action hasn't been persisted to the source chain. Read the [zome function call lifecycle](/build/zome-functions/#zome-function-call-lifecycle) section to find out more about persistence.

## Delete a link

Delete a link by calling [`hdk::link::delete_link`](https://docs.rs/hdk/latest/hdk/link/fn.delete_link.html) with the create-link action's hash.

```rust
use hdk::prelude::*;

let delete_link_action_hash = delete_link(
    create_link_action_hash,
    GetOptions::network()
);
```

!!! info Specifying a get strategy
In order to validate a link deletion action, the original link creation action has to be available locally --- otherwise validation will fail with [`UnresolvedDependencies`](/build/validate-callback/#validation-outcomes). If you know that the original link will be available --- for instance, in cases where the agent is deleting a link they created --- you can use `GetOptions::local()`; otherwise, always use `GetOptions::network()`.
!!!

A link is considered ["dead"](/build/working-with-data/#deleted-dead-data) (deleted but retrievable if asked for explicitly) once its creation action has at least one delete-link action associated with it. As with entries, dead links can still be retrieved with [`hdk::link::get_links_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_links_details.html) (see next section).

### Deleting a link, under the hood

When a zome function calls `delete_link`, Holochain does the following:

1. Build an action called [`DeleteLink`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.DeleteLink.html) that includes:
    * the author's public key,
    * a timestamp,
    * the action's sequence in the source chain and the previous action's hash, and
    * the link type, base, target, and tag.
    <!-- * a calculated weight value for rate limiting -->
2. Write the action to the scratch space.
3. Return the `ActionHash` of the pending action to the calling zome function.

At this point, the action hasn't been persisted to the source chain. Read the [zome function call lifecycle](/build/zome-functions/#zome-function-call-lifecycle) section to find out more about persistence.

## Retrieve links

Get all the _live_ (undeleted) links attached to a hash with the [`hdk::link::get_links`](https://docs.rs/hdk/latest/hdk/link/fn.get_links.html) function. The [`LinkQuery`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.LinkQuery.html) input struct has a builder-style interface to make it easier to construct.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let director_entry_hash = EntryHash::from_raw_36(vec![/* hash of Sergio Leone's entry */]);
let movies_by_director = get_links(
    LinkQuery::try_new(director_entry_hash, LinkTypes::DirectorToMovie)?,
    GetStrategy::default()
)?;
let movie_entry_hashes = movies_by_director
    .iter()
    .filter_map(|link| link.target.into_entry_hash())
    .collect::<Vec<_>>();
```

If you want to filter the returned links by tag, pass some bytes to the input builder's `tag_prefix` method. You'll get back a vector of links whose tag starts with those bytes.

```rust
let movies_in_1960s_by_director = get_links(
    LinkQuery::try_new(director_entry_hash, LinkTypes::DirectorToMovie)?
        .tag_prefix("year:196".as_bytes().to_owned().into()),
    GetStrategy::default()
)?;
```

To get all live _and deleted_ links, along with any deletion actions, use [`hdk::link::get_links_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_links_details.html).

```rust
use hdk::prelude::*;
use movie_integrity::*;

let movies_plus_deleted = get_links_details(
    LinkQuery::try_new(director_entry_hash, LinkTypes::DirectorToMovie)?,
    GetStrategy::default()
)?;
```

### Count links

If all you need is a _count_ of matching links, use [`hdk::link::count_links`](https://docs.rs/hdk/latest/hdk/link/fn.count_links.html). Currently it lacks the ability to specify a get strategy and will always go to the network; we may allow you to configure this in the future.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let my_id = agent_info()?.agent_initial_pubkey;
let today = sys_time()?;
let number_of_reviews_written_by_me_in_last_month = count_links(
    LinkQuery::try_new(
        // Assume `movie_entry_hash` as defined in previous snippets.
        movie_entry_hash,
        LinkTypes::MovieReview
    )
    .after(Timestamp(today.as_micros() - 1000 * 1000 * 60 * 60 * 24 * 30))
    .before(today)
    .author(my_id)
)?;
```

!!! info Links are counted locally
Currently `count_links` retrieves all link hashes from the remote peer, then counts them locally. So it is less network traffic than a `get_links` request, but more network traffic than just sending an integer.
!!!

## Anchors and paths

Sometimes the best way to discover a link base is to build it into the application's code. You can create an **anchor**, a well-known address (like the hash of a string constant) to attach links to. This can be used to simulate collections or tables in your graph database.

While you can build this yourself, this is such a common pattern that the HDK implements it for you in the [`hdk::hash_path`](https://docs.rs/hdk/latest/hdk/hash_path/index.html) module. With it, you can create **paths**, which are hierarchies of anchors.

!!! info Avoiding DHT hot spots
Too many links on a single base address creates extra work for the peers responsible for it. Use a hierarchy of paths to split the links into appropriate 'buckets' and spread the work around. We'll give an example of that [below](#paths-in-depth).
!!!

### Scaffold a simple collection anchor

The scaffolding tool can create a 'collection', which is a one-level path that serves as an anchor for entries of a given type, along with all the functionality that creates and deletes links from that anchor to its entries:

```bash
hc scaffold collection
```

Follow the prompts to choose the entry type, name the link types and anchor, and define the scope of the collection, which can be either:

* all entries of type, or
* entries of type by author

### Paths in depth

When you want to create more complex collections, you'll want to use the paths library directly.

Create a path by constructing a [`hdi::hash_path::path::Path`](https://docs.rs/hdi/latest/hdi/hash_path/path/struct.Path.html) struct, hashing it, and using the hash as a link base. The string of the path is a simple [domain-specific language](https://docs.rs/hdi/latest/hdi/hash_path/path/struct.Path.html#impl-From%3C%26str%3E-for-Path), in which dots denote sections of the path.

```rust
use hdi::hash_path::path::*;
use movie_integrity::*;

// This will create a two-level path that looks like:
//    "movies_by_first_letter" → "g"
let path_to_movies_starting_with_g = Path::from("movies_by_first_letter.g")
    // A path requires a link type that you've defined in the integrity zome.
    // Here, we're using the `MovieByFirstLetterAnchor` type that we created.
    .typed(LinkTypes::MovieByFirstLetterAnchor)?;

// Make sure it exists before attaching links to it -- if it already exists,
// ensure() will have no effect.
path_to_movies_starting_with_g.ensure()?;

let create_link_hash = create_link(
    path_to_movies_starting_with_g.path_entry_hash()?,
    movie_entry_hash,
    LinkTypes::MovieByFirstLetter,
    ()
)?;
```

Retrieve all the links on a path by constructing the path, then calling `get_links` with its hash and link type:

```rust
use hdk::hash_path::path::*;
use movie_integrity::*;

let path_to_movies_starting_with_g = Path::from("movies_by_first_letter.g");
let links_to_movies_starting_with_g = get_links(
    // A path doesn't need to have a type in order to compute its hash.
    LinkQuery::try_new(
        path_to_movies_starting_with_g.path_entry_hash()?,
        LinkTypes::MovieByFirstLetter
    )?,
    GetStrategy::default()
)?;
```

Retrieve all child paths of a path by constructing the parent path and calling its `children_paths()` method:

```rust
use hdk::hash_path::path::*;
use movie_integrity::*;

let parent_path = Path::from("movies_by_first_letter")
    .typed(LinkTypes::MovieByFirstLetterAnchor)?;
let all_first_letter_paths = parent_path.children_paths()?;
// Do something with the children. Note: this would be expensive to do in
// practice, because each child needs a separate DHT query.
let links_to_all_movies = all_first_letter_paths
    .iter()
    .map(|path| get_links(
        LinkQuery::try_new(
            path.path_entry_hash()?,
            LinkTypes::MovieByFirstLetter
        )?,
        GetStrategy::default()
    ))
    // Fail on the first failure.
    .collect::<Result<Vec<_>, _>>()?
    .into_iter()
    .flatten()
    .collect();
```

## Community path libraries

* [holochain-prefix-index](https://github.com/holochain-open-dev/holochain-prefix-index) --- An index for starts-with text searching, useful for type-ahead username or hashtag lookup.
* [holochain-time-index](https://github.com/holochain-open-dev/holochain-time-index) --- A 'bucketed' time-based index, where you can choose the resolution of the time slices.

## Reference

* [`hdi::hdk_link_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_link_types.html)
* [`hdk::link::create_link`](https://docs.rs/hdk/latest/hdk/link/fn.create_link.html)
* [`hdk::link::delete_link`](https://docs.rs/hdk/latest/hdk/link/fn.delete_link.html)
* Getting hashes from data
    * [`holochain_integrity_types::record::Record#action_address`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/record/struct.Record.html#method.action_address)
    * [`holo_hash::HasHash<T>`](https://docs.rs/holo_hash/latest/holo_hash/trait.HasHash.html)
    * [`holochain_integrity_types::action::Action`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html) (contains fields with hashes of referenced data in them)
    * [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html)
    * [`hdk::info::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html)
    * [`hdk::info::dna_info`](https://docs.rs/hdk/latest/hdk/info/fn.dna_info.html)
* [`hdk::link::get_links`](https://docs.rs/hdk/latest/hdk/link/fn.get_links.html)
* [`hdk::link::get_links_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_links_details.html)
* [`hdk::link::count_links`](https://docs.rs/hdk/latest/hdk/link/fn.count_links.html)
* [`hdi::hash_path`](https://docs.rs/hdi/latest/hdi/hash_path/index.html)
* [`hdi::hash_path::anchor`](https://docs.rs/hdi/latest/hdi/hash_path/anchor/struct.Anchor.html)

## Further reading

* [Core Concepts: Links and Anchors](https://developer.holochain.org/concepts/5_links_anchors/)
* [Build Guide: Identifiers](/build/identifiers)