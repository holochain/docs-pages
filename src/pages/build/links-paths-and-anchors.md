---
title: "Links, Paths, and Anchors"
---

::: intro
A **link** connects two addresses in an application's shared database, forming a graph database on top of the underlying hash table. Links can be used to connect pieces of [addressable content](/resources/glossary/#addressable-content) in the database or references to addressable content outside the database.

**Paths** and **anchors** build on the concept of links, allowing you to create collections, pagination, indexes, and hierarchical structures.
:::

## Turning a hash table into a graph database

A Holochain application's database is, at heart, just a big key-value store --- or more specifically, a hash table. You can store and retrieve content by hash. This is useful if you already know the hash of the content you want to retrieve, but it isn't helpful if you don't know the hash of the content you're looking for.

A piece of content itself can contain a hash as part of its data structure, and that's great for modelling a _many-to-one relationship_. And if the number of things the content points to is small and doesn't change often, you can model a _many-to-many relationship_ using a field that contains an array of hashes. But at a certain point this becomes hard to manage, especially if that list regularly changes or gets really large.

But Holochain also lets you attach **links** as metadata on an address in the database. You can then retrieve a full or filtered list of links from that address in order to discover more addressable content. In this way you can build up a traversable graph database.

### Define a link type

Every link has a type that you define in an integrity zome, just like [an entry](/build/entries/#define-an-entry-type). Links are simple enough that they have no entry content. Instead, their data is completely contained in the actions that write them. Here's what a link creation action contains, in addition to the [common action fields](/build/working-with-data/#entries-actions-and-records-primary-data):

* A **base**, which is the address the link is attached to and _points from_
* A **target**, which is the address the link _points to_
* A **type**
* An optional **tag** that can hold a small amount of arbitrary bytes, up to 4 kb

The tag could be considered link 'content' that can be used to further qualify the link, provide data about the target that saves on DHT queries, or be queried with a starts-with search. But unlike an entry's content, the HDK doesn't provide a macro that automatically deserializes the link tag's content into a Rust type.

[Just as with entries](/build/entries/#define-an-entry-type), Holochain needs to know about your link types in order to dispatch validation to the right integrity zome. You can do this by implementing a `link_types` callback function, and the easiest way to do this is to add the [`hdi::prelude::hdk_link_types`](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_link_types.html) macro to an enum that defines all your link types:

```rust
use hdi::prelude::*;

// Generate a `link_types` function that returns a list of definitions.
#[hdk_link_types]
enum LinkTypes {
  DirectorToMovie,
  GenreToMovie,
  IpfsMoviePoster,
  MovieReview,
  // Note: the following types will become useful when we talk about
  // paths and anchors later.
  MovieByFirstLetterAnchor,
  MovieByFirstLetter,
  // other types...
}
```

## Create a link

As with entries, you'll normally want to store your link CRUD code in a [**coordinator zome**](/resources/glossary/#coordinator-zome), not an integrity zome. You can read about why in the page on [entries](/build/entries/#create-an-entry).

Create a link by calling [`hdk::prelude::create_link`](https://docs.rs/hdk/latest/hdk/link/fn.create_link.html). If you used the `hdk_link_types` macro in your integrity zome (see [Define a link type](#define-a-link-type)), you can use the link types enum you defined, and the link will have the correct integrity zome and link type indexes added to it.

```rust
use hdk::prelude::*;
// Import the link types enum defined in the integrity zome.
use movie_integrity::*;

let director_entry_hash = EntryHash::from_raw_36(vec![ /* bytes of the hash of the Sergio Leone entry */ ]);
let movie_entry_hash = EntryHash::from_raw_36(vec![ /* bytes of the hash of the Good, Bad, and Ugly entry */ ]);

let create_link_action_hash = create_link(
  director_entry_hash,
  movie_entry_hash,
  LinkTypes::DirectorToMovie,
  // Create an optional search index value for fast lookup.
  vec!["year:1966".as_bytes()].into()
);
```

Links can't be updated; they can only be created or deleted. Multiple links with the same base, target, type, and tag can be created, and they'll be considered separate links for retrieval and deletion purposes.

## Delete a link

Delete a link by calling [`hdk::prelude::delete_link`](https://docs.rs/hdk/latest/hdk/link/fn.delete_link.html) with the create-link action's hash.

```rust
use hdk::prelude::*;

let delete_link_action_hash = delete_link(
  create_link_action_hash
);
```

A link is considered dead once its creation action has one or more delete-link actions associated with it.

## Getting hashes for use in linking

Because linking is all about connecting hashes to other hashes, here's how you get a hash for a piece of content.

!!! info A note on the existence of data
An address doesn't have to have content stored at it in order for you to link to or from it. (In the case of external references, it's certain that data won't exist at the address.) If you want to require data to exist at the base or target, and if the data needs to be of a certain type, you'll need to check for this in your link validation code.
<!-- TODO: add link to link validation when it's written -->
!!!

### Action

Any CRUD host function that records an action on an agent's source chain, such as `create`, `update`, `delete`, `create_link`, and `delete_link`, returns the hash of the action. You can use this in links, either for further writes in the same function call or elsewhere.

<!-- TODO: remove/simplify this with a pointer to the lifecycle document when I write it -->
!!! info Actions aren't written until function lifecycle completes
Like we mentioned in [Working with Data](/guide/working-with-data/#content-addresses), zome functions are atomic, so actions aren't actually there until the zome function that writes them completes successfully.

If you need to share an action hash via a signal (say, with a remote peer), it's safer to wait until the zome function has completed. You can do this by creating a callback called `post_commit()`. It'll be called after every successful function call within that zome.
!!!

!!! info Don't depend on relaxed action hashes
If you use 'relaxed' chain top ordering<!-- TODO: link to lifecycle doc -->, your zome function shouldn't depend on the action hash it gets back from the CRUD host function, because the final value might change by the time the actions are written.
!!!

If you have a variable that contains a [`hdk::prelude::Action`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html) or [`hdk::prelude::Record`](https://docs.rs/hdk/latest/hdk/prelude/struct.Record.html), you can also get its hash using the following methods:

```rust
let action_hash_from_record = record.action_address();
let action = record.signed_action;
let action_hash_from_action = action.as_hash();
assert_eq!(action_hash_from_record, action_hash_from_action);
```

(But it's worth pointing out that if you have this value, it's probably because you just retrieved the action by hash, which means you probably already know the hash.)

To get the hash of an entry creation action from an action that deletes or updates it, match on the [`Action::Update`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#variant.Update) or [`Action::Delete`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#variant.Delete) action variants and access the appropriate field:

```rust
if let Action::Update(action_data) = action {
  let replaced_action_hash = action_data.original_action_address;
  // Do some things with the original action.
} else if let Action::Delete(action_data) = action {
  let deleted_action_hash = action_data.deletes_address;
  // Do some things with the deleted action.
}
```

### Entry

To get the hash of an entry, first construct the entry struct or enum that you [defined in the integrity zome](/build/entries/#define-an-entry-type), then pass it through the [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html) function. (Reminder: don't actually have to write the entry to a source chain to get or use the entry hash for use in a link.)

```rust
use hdk::hash::*;
use movie_integrity::*;

let movie = Movie {
  title: "The Good, the Bad, and the Ugly",
  director_entry_hash: EntryHash::from_raw_36(vec![ /* hash of 'Sergio Leone' entry */ ]),
  imdb_id: Some("tt0060196"),
  release_date: Timestamp::from(Date::Utc("1966-12-23")),
  box_office_revenue: 389_000_000,
};
let movie_entry_hash = hash_entry(movie);
```

To get the hash of an entry from the action that created it, call the action's [`entry_hash`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#method.entry_hash) method. It returns an optional value, because not all actions have associated entries.

```rust
let entry_hash = action.entry_hash()?;
```

If you know that your action is an entry creation action, you can get the entry hash from its `entry_hash` field:

```rust
let entry_creation_action: EntryCreationAction = action.into()?;
let entry_hash = action.entry_hash;
```

To get the hash of an entry from a record, you can either get it from the record itself or the contained action:

```rust
let entry_hash_from_record = record.entry().as_option()?.hash();
let entry_hash_from_action = record.action().entry_hash()?
assert_equal!(entry_hash_from_record, entry_hash_from_action);
```

Finally, to get the hash of an entry from an action that updates or deletes it, match the action to the appropriate variant and access the corresponding field:

```rust
if let Action::Update(action_data) = action {
  let replaced_entry_hash = action_data.original_entry_address;
} else if let Action::Delete(action_data) = action {
  let deleted_entry_hash = action_data.deletes_entry_address;
}
```

### Agent

An agent's ID is just their public key, and an entry for their ID is stored on the DHT. The hashing function for an agent ID entry is just the literal value of the entry. This is a roundabout way of saying that you link to or from an agent using their public key as a hash.

An agent can get their own ID by calling [`hdk::prelude::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html). Note that agents may change their ID if their public key has been lost or stolen, so they may have more than one ID over the course of their participation in a network.

```rust
use hdk::prelude::*;

let my_first_id = agent_info()?.agent_initial_pubkey;
let my_current_id = agent_info()?.agent_latest_pubkey;
```

All actions have their author's ID as a field. You can get this field by calling the action's `author()` method:

```rust
let author_id = action.author();
```

### External reference

Because an external reference comes from outside of a DHT, it's up to you to decide how to get it into the application. Typically, an external client such as a UI or bridging service would pass this value into your app.

As mentioned up in the [Entry](#entry) section, an entry hash can also be considered 'external' if you don't actually write it to the DHT.

```rust
use hdk::prelude::*;
use movie_integrity::*;

#[hdk_extern]
fn add_movie_poster_from_ipfs(movie_entry_hash: EntryHash, ipfs_hash_bytes: Vec<u8>) {
  let ipfs_hash = ExternalHash::from_raw_32(ipfs_hash_bytes);
  create_link(
    movie_entry_hash,
    ipfs_hash,
    LinkTypes::IpfsMoviePoster,
    ()
  );
}
```

### DNA

There is one global hash that everyone knows, and that's the hash of the DNA itself. You can get it by calling [`hdk::prelude::dna_info`](https://docs.rs/hdk/latest/hdk/info/fn.dna_info.html).

```rust
use hdk::prelude::*;

let dna_hash = dna_info()?.hash;
```

!!! info Linking from a DNA hash is not recommended
Because every participant in an application's network takes responsibility for storing a portion of the DHT's address space, attaching many links to a well-known hash such as the DNA hash can create 'hot spots' and cause an undue CPU, storage, and network burden the peers in the neighborhood of that hash. Instead, we recommend you use [paths or anchors](#paths-and-anchors) to 'shard' responsibility throughout the DHT.
!!!

## Retrieve links

Get all the live links attached to a hash with the [`hdk::prelude::get_links`](https://docs.rs/hdk/latest/hdk/link/fn.get_links.html) function.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let director_entry_hash = EntryHash::from_raw_36(vec![/* Sergio Leone's hash */]);
let movies_by_director = get_links(
  director_entry_hash,
  LinkTypes::DirectorToMovie,
  None
)?;
let movie_entry_hashes = movies_by_director
  .iter()
  .map(|link| link.target.into_entry_hash()?);
```

If you want to filter the returned links by tag, pass some bytes as the third parameter. The peer holding the links for the requested base address will return a list of links whose tag starts with those bytes.

```rust
use hdk::prelude::*;
use movie_integrity::*;

let movies_in_1960s_by_director = get_links(
  director_entry_hash,
  LinkTypes::DirectorToMovie,
  Some(vec!["year:196".as_bytes()].into())
);
```

To get all live _and dead_ links, along with any deletion actions, use [`hdk::prelude::get_link_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_link_details.html). This function has the same options as `get_links`

```rust
use hdk::prelude::*;
use movie_integrity::*;

let movies_plus_deleted = get_link_details(
  director_entry_hash,
  LinkTypes::DirectorToMovie,
  None
);
```

### Count links

If all you need is a count of matching links, such as for an unread messages badge, use [`hdk::prelude::count_links`](https://docs.rs/hdk/latest/hdk/prelude/fn.count_links.html). It has a different input with more options for querying (we'll likely update the inputs of `get_links` and `count_links` to match `count_links` in the future).

```rust
use hdk::prelude::*;
use movie_integrity::*;

let my_current_id = agent_info()?.agent_latest_pubkey;
let today = sys_time()?;
let number_of_reviews_written_by_me_in_last_month = count_links(
  LinkQuery::new(movie_entry_hash, LinkTypes::MovieReview)
    .after(Some(today - 1000 * 1000 * 60 * 60 * 24 * 30))
    .before(Some(today))
    .author(my_current_id)
);
```

## Paths and anchors

Sometimes the easiest way to discover a link base is to build it into the application's code. You can create an **anchor**, an entry whose content is a well-known blob, and hash that blob any time you need to retrieve links. This can be used to simulate collections or tables in your graph database. As [mentioned](#getting-hashes-for-use-in-linking), the entry does not even need to be stored; you can simply create it, hash it, and use the hash in your link.

While you can build this yourself, this is such a common pattern that the HDK implements it for you in the [`hdk::hash_path`](https://docs.rs/hdk/latest/hdk/hash_path/index.html) module. The implementation supports both anchors and **paths**, which are hierarchies of anchors.

!!! info Avoiding DHT hot spots
Don't attach too many links to a single anchor, as that creates extra work for the peers responsible for that anchor's hash. Instead, use paths to split the links into appropriate 'buckets' and spread the work around. We'll give an example of that below.
!!!

### Scaffold a simple collection

If you've been using the scaffolding tool, you can scaffold a simple collection for an entry type with the command `hc scaffold collection`. Behind the scenes, it uses the anchor pattern.

Follow the prompts to choose the entry type, names for the link types and anchor, and the scope of the collection, which can be either:

* all entries of type, or
* entries of type by author

It'll scaffold all the code needed to create a path anchor, create links, and delete links in the already scaffolded entry CRUD functions.

### Paths

Create a path by constructing a [`hdk::hash_path::path::Path`](https://docs.rs/hdk/latest/hdk/hash_path/path/struct.Path.html) struct, hashing it, and using the hash in `create_link`. The string of the path is a simple [domain-specific language](https://docs.rs/hdk/latest/hdk/hash_path/path/struct.Path.html#impl-From%3C%26str%3E-for-Path), in which dots denote sections of the path.

```rust
use hdk::hash_path::path::*;
use movie_integrity::*;

let path_to_movies_starting_with_g = Path::from("movies_by_first_letter.g")
  // A path requires a link type from the integrity zome. Here, we're using the
  // `MovieByFirstLetterAnchor` type that we created.
  .typed(LinkTypes::MovieByFirstLetterAnchor);

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

Retrieve all the links on a path by constructing the path, then getting its hash:

```rust
use hdk::hash_path::path::*;
use movie_integrity::*;

// Note that a path doesn't need to be typed in order to compute its hash.
let path_to_movies_starting_with_g = Path::from("movies_by_first_letter.g");
let links_to_movies_starting_with_g = get_links(
  path_to_movies_starting_with_g.path_entry_hash()?,
  LinkTypes::MovieByFirstLetter,
  None
)?;
```

Retrieve all child paths of a path by constructing the parent path, typing it, and calling its `children_paths()` method:

```rust
use hdk::hash_path::path::*;
use movie_integrity::*;

let parent_path = Path::from("movies_by_first_letter")
  .typed(LinkTypes::MovieByFirstLetterAnchor);
let all_first_letter_paths = parent_path.children_paths()?;
// Do something with the paths. Note: this would be expensive to do in practice.
let links_to_all_movies = all_first_letter_paths
  .iter()
  .map(|path| get_links(path.path_entry_hash()?, LinkTypes::MovieByFirstLetter, None)?)
  .flatten()
  .collect();
```

### Anchors

In the HDK, an 'anchor' is just a path with two levels of hierarchy. The examples below show how to implement the path-based examples above, but as anchors. Generally the implementation is simpler.

Create an anchor by calling the [`hdk::prelude::anchor`](https://docs.rs/hdk/latest/hdk/prelude/fn.anchor.html) host function. An anchor can have two levels of hierarchy, which you give as the second and third arguments of the function.

```rust
use hdk::prelude::*;
use movie_integrity::*;

// This function requires a special link type to be created in the integrity
// zome. Here, we're using the `MovieByFirstLetterAnchor` type that we created.
let movies_starting_with_g_anchor_hash = anchor(LinkTypes::MovieByFirstLetterAnchor, "movies_by_first_letter", "g");
let create_link_hash = create_link(
  movies_starting_with_g_anchor_hash,
  movie_entry_hash,
  LinkTypes::MovieByFirstLetter,
  ()
);
```

The `anchor` function creates no entries, just links, and will only create links that don't currently exist.

Retrieve all the linked items from an anchor just as you would any link base:

```rust
use hdk::prelude::*;
use movie_integrity::*;

let anchor_hash_for_g = anchor(LinkTypes::MovieByFirstLetterAnchor, "movies_by_first_letter", "g");
let links_to_movies_starting_with_g = get_links(anchor_hash_for_g, LinkTypes::MovieByFirstLetter, None);
```

Retrieve the _names_ of all the second-level anchors for a top-level anchor by calling [`hdk::prelude::list_anchor_tags`](https://docs.rs/hdk/latest/hdk/hash_path/anchor/fn.list_anchor_tags.html):

```rust
use hdk::prelude::*;
use movie_integrity::*;

let all_first_letters = list_anchor_tags(LinkTypes::MovieByFirstLetterAnchor, "movies_by_first_letter");
```

Retrieve the _addresses_ of all the second-level anchors for a top-level anchor by calling [`hdk::prelude::list_anchor_addresses`](https://docs.rs/hdk/latest/hdk/hash_path/anchor/fn.list_anchor_addresses.html):

```rust
use hdk::prelude::*;
use movie_integrity::*;

let hashes_of_all_first_letters = list_anchor_addresses(LinkTypes::MovieByFirstLetterAnchor, "movies_by_first_letter");
```

Retrieve the _addresses_ of all the top-level anchors by calling [`hdk::prelude::list_anchor_addresses`](https://docs.rs/hdk/latest/hdk/hash_path/anchor/fn.list_anchor_addresses.html):

```rust
use hdk::prelude::*;
use movie_integrity::*;

let hashes_of_all_first_letters = list_anchor_addresses(LinkTypes::MovieByFirstLetterAnchor, "movies_by_first_letter");
```

## Reference

* [`hdi::prelude::hdk_link_types`](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_link_types.html)
* [`hdk::prelude::create_link`](https://docs.rs/hdk/latest/hdk/link/fn.create_link.html)
* [`hdk::prelude::delete_link`](https://docs.rs/hdk/latest/hdk/link/fn.delete_link.html)
* Getting hashes from data
    * [`hdk::prelude::Record#action_address`](https://docs.rs/hdk/latest/hdk/prelude/struct.Record.html#method.action_address)
    * [`hdk::prelude::HasHash<T>`](https://docs.rs/hdk/latest/hdk/prelude/trait.HasHash.html)
    * [`hdk::prelude::Action`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html) (contains fields with hashes of referenced data in them)
    * [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html)
    * [`hdk::prelude::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html)
    * [`hdk::prelude::dna_info`](https://docs.rs/hdk/latest/hdk/info/fn.dna_info.html)
* [`hdk::prelude::get_links`](https://docs.rs/hdk/latest/hdk/link/fn.get_links.html)
* [`hdk::prelude::get_link_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_link_details.html)
* [`hdk::prelude::count_links`](https://docs.rs/hdk/latest/hdk/prelude/fn.count_links.html)
* [`hdk::hash_path`](https://docs.rs/hdk/latest/hdk/hash_path/index.html)
* [`hdk::prelude::anchor`](https://docs.rs/hdk/latest/hdk/prelude/fn.anchor.html)

## Further reading

* [Core Concepts: Links and Anchors](https://developer.holochain.org/concepts/5_links_anchors/)