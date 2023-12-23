---
title: "Entries"
tocData:
  - text: Define an Entry Type
    href: define-an-entry-type
  - text: Create an Entry
    href: create-an-entry
    children:
      - text: Create Under-the-hood
        href: create-under-the-hood
  - text: Update an Entry
    href: update-an-entry
    children:
      - text: Update Under-the-hood
        href: update-under-the-hood
      - text: Efficiently querying updates
        href: efficiently-querying-updates
      - text: Cooperative Updates
        href: cooperative-updates
  - text: Delete an Entry
    href: delete-an-entry
    children:
      - text: Delete Under-the-hood
        href: delete-under-the-hood
  - text: Entry IDs
    href: entry-ids
  - text: CRUD Libraries
    href: community-crud-libraries
  - text: Reference
    href: reference
---

## Define an Entry Type

An EntryType can be any Rust struct that `serde` can serialize and deserialize.

To define an EntryType use the [`hdk_entry_helper`](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_helper.html){target=_blank} macro:

```rust
use hdi::prelude::*;

#[hdk_entry_helper]
pub struct Movie {
  title: String,
  director: String,
  imdb_id: Option<String>,
  release_date: Timestamp,
  box_office_revenue: u128,
}
```

To include an Entry Type in your Integrity Zome use the [hdi::prelude::hdk_entry_defs](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_defs.html){target=_blank} macro:

```rust
use hdi::prelude::*;

#[hdk_entry_types]
enum EntryTypes {
  Movie(Movie)
}
```

An Entry Type can be configured as "private", in which case it is never published to the DHT, but exists only on the author's Source Chain.

To configure an EntryType as private use the [hdi::prelude::entry_def](https://docs.rs/hdi/latest/hdi/prelude/entry_def/index.html){target=_blank} macro:

```rust
use hdi::prelude::*;

#[hdk_entry_defs]
enum EntryTypes {
  Movie(Movie),
  
  #[entry_def(visibility = "private", )]
  HomeMovie(Movie)
}
```

An Entry Type can be configured with a specified number of required validations. This is the number of Valid validations on the CreateEntry action Record by authority agents in order for other agents to view treat it as "valid" during validation of other data.

To configure an EntryType with a specified number of required validations use the [hdi::prelude::entry_def](https://docs.rs/hdi/latest/hdi/prelude/entry_def/index.html){target=_blank} macro:

```rust
use hdi::prelude::*;

#[hdk_entry_types]
enum EntryTypes {
  Movie(Movie),
  
  #[entry_def(required_validations = 7, )]
  HomeMovie(Movie)
}
```


## Create an Entry

Create an entry by calling [`hdk::prelude::create_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.create_entry.html){target=_blank}:

```rust
use hdk::prelude::*;
use chrono::Date;

let movie = Movie {
  title: "The Good, the Bad, and the Ugly",
  director: "Sergio Leone"
  imdb_id: Some("tt0060196"),
  release_date: Timestamp::from(Date::Utc("1966-12-23")),
  box_office_revenue: 389_000_000,
};

let create_action_hash: ActionHash = create_entry(
    &EntryTypes::Movie(movie.clone()),
)?;
```

### Create Under-the-hood 
Calling `create_entry` does the following:
1. Prepares a "draft commit" for making an atomic set of changes to the source chain for this Cell.
2. Writes a `Create` action in the draft commit
3. Runs the validation callback for all Ops in the draft commit. If successful, continues.
4. Publishes the "draft commit" to the source chain for this Cell
5. Publishes all DhtOps included in the source chain commit to their authority agents
6. Returns the `ActionHash` of the Create action

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->


## Update an Entry

Update an entry by calling [`hdk::entry::update_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.update_entry.html){target=_blank}:

```rust
use hdk::prelude::*;

let movie2 = Movie {
  title: "The Good, the Bad, and the Ugly",
  director: "Sergio Leone"
  imdb_id: Some("tt0060196"),
  release_date: Timestamp::from(Date::Utc("1966-12-23")),
  box_office_revenue: 400_000_000,
};

let update_action_hash: ActionHash = update_entry(
    create_action_hash,
    &EntryTypes::Movie(movie2.clone()),
)?;
```

### Update Under-the-hood 
Calling `update_Entry` does the following:
1. Prepares a "draft commit" for making an atomic set of changes to the source chain for this Cell.
2. Writes a `Update` action in the draft commit
3. Runs the validation callback for all Ops in the draft commit. If successful, continues.
4. Publishes the "draft commit" to the source chain for this Cell
5. Publishes all DhtOps included in the source chain commit to their authority agents
6. Returns the `ActionHash` of the Update action

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->


### Update Patterns

Holochain gives you this `update_entry` function, but is somewhat unopinionated about how it is used. 

You can structure your updates as "list" -- where all updates refer to the ActionHash of the original Create action.

```mermaid
graph TB
  B[Update 1] --> A[Create]
  C[Update 2] --> A[Create]
  D[Update 3] --> A[Create]
  E[Update 4] --> A[Create]
```

Or you can structure your updates as  "chain" -- where each update refers to the ActionHash of the previous update.

```mermaid
graph TB
  B[Update 1] --> A[Create]
  C[Update 2] --> B[Update 1]
  D[Update 3] --> C[Update 2]
  E[Update 4] --> D[Update 3]
```

If you structure your updates as a "chain" you may want to also create links from the original ActionHash to each update in the chain, for easier querying. This effectively trades additional storage space for reduced lookup time.


### Choose the Latest Update

If only the original author is permitted to update the entry, choosing the latest update is simple. Just choose the Update action with the most recent timestamp.

But if multiple agents are permitted to update an entry it gets more complicated. Two agents could make an update at exactly the same time (or their action timestamps might be wrong or falsified). So, how do you decide which is the "latest" update?

These are two common patterns:
- Use an opinionated deterministic definition of "latest"
- Expose *all* conflicting updates to the user, and let them decide which are meaningful

## Delete an Entry

Delete an entry by calling [`hdk::entry::delete_entry`](https://docs.rs/hdk/latest/hdk/entry/fn.delete_entry.html){target=_blank}.

```rust
use hdk::prelude::*;

let delete_action_hash: ActionHash = delete_entry(
    create_action_hash,
)?;
```

This does *not* actually erase data from the source chain or the DHT. Instead a Delete action is committed to the Cell's Source Chain.

In the future we plan to include a "purge" functionality. This will give Agents permission to actually erase an Entry from the Source Chain and DHT, but not its associated Action. 

Remember it is physically impossible to force another person to delete data once they have seen it. Be deliberate about how data is shared in your app.

### Delete Under-the-hood 
Calling `delete_entry` does the following:
1. Prepares a "draft commit" for making an atomic set of changes to the source chain for this Cell.
2. Writes a `Delete` action in the draft commit
3. Runs the validation callback for all Ops in the draft commit. If successful, continues.
4. Publishes the "draft commit" to the source chain for this Cell
5. Publishes all DhtOps included in the source chain commit to their authority agents
6. Returns the `ActionHash` of the Delete action

<!-- TODO review and outline steps that are taken under the hood *exactly*, including which DHT ops are published -->

## Entry IDs

Coming from the centralized database world, you might be expecting an Entry to have a unique ID that can be used to reference it elsewhere.

Instead, holochain uses hashes to reference content. In practice, different kinds of hashes have different meaning and suitability to use as an identifier.

To identify the *contents* of an Entry, use the entry's `EntryHash`. Remember that entry contents will collide in the DHT if the exact same entry is published multiple times.

A common pattern to identify an *instance* of an Entry (i.e. an Entry authored by a specific agent at a specific time) is to use the `ActionHash` of the Create action which created the original entry. This can be a persistant way to identify the entry, even when it is updated, as other agents can query for updates themselves to discover the latest version.

## Community CRUD Libraries

If the scaffolder doesn't support your desired functionality, or is too low-level, there are some community-maintained libraries that offer an opinionated and high-level ways to work with entries.

- [rust-hc-crud-caps](https://github.com/spartan-holochain-counsel/rust-hc-crud-caps){target=_blank}
- [hdk_crud](https://github.com/lightningrodlabs/hdk_crud){target=_blank}
- [hc-cooperative-content](https://github.com/mjbrisebois/hc-cooperative-content){target=_blank}


## Reference
- [hdi::prelude::hdk_entry_helper](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_helper.html){target=_blank}
- [hdi::prelude::hdk_entry_defs](https://docs.rs/hdi/latest/hdi/prelude/attr.hdk_entry_defs.html){target=_blank}
- [hdi::prelude::entry_def](https://docs.rs/hdi/latest/hdi/prelude/entry_def/index.html){target=_blank}
- [hdk::prelude::create_entry](https://docs.rs/hdk/latest/hdk/entry/fn.create_entry.html){target=_blank}
- [hdk::prelude::update_entry](https://docs.rs/hdk/latest/hdk/entry/fn.update_entry.html){target=_blank}
- [hdi::prelude::delete_entry](https://docs.rs/hdk/latest/hdk/entry/fn.delete_entry.html){target=_blank}
