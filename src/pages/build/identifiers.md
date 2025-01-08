---
title: "Identifiers"
---

::: intro
Data in Holochain is **addressable content**, which means that it's retrieved using an address that's derived from the data itself --- usually the **hash** of the content.
:::

## Address types

The address of most data is the [Blake2b-256](https://www.blake2.net/) hash of its bytes. This goes for [**actions** and most **entries**](/build/working-with-data/#entries-actions-and-records-primary-data), along with a few other types which we'll talk about in a moment.

All addresses are 39 bytes long and are [multihash-friendly](https://www.multiformats.io/multihash/). Generally, you don't need to know how to construct an address. You usually get it via functions that store data and types that hold data. But when you do see a hash in the wild, this is what it's made out of:

| Multihash prefix | Hash     | DHT location |
|------------------|----------|--------------|
| 3 bytes          | 32 bytes | 4 bytes      |

The four-byte DHT location is calculated from the 32 bytes of the hash and is used in routing to the right peer. The three-byte multihash prefix will be one of the following:

| Hash type | [`holo_hash`](https://docs.rs/holo_hash/latest/holo_hash/#types) type               | Prefix in Base64 |
|-----------|-------------------------------------------------------------------------------------|------------------|
| DNA       | [`DnaHash`](https://docs.rs/holo_hash/latest/holo_hash/type.DnaHash.html)           | `hC0k`           |
| agent ID  | [`AgentPubKey`](https://docs.rs/holo_hash/latest/holo_hash/type.AgentPubKey.html)   | `hCAk`           |
| action    | [`ActionHash`](https://docs.rs/holo_hash/latest/holo_hash/type.ActionHash.html)     | `hCkk`           |
| entry     | [`EntryHash`](https://docs.rs/holo_hash/latest/holo_hash/type.EntryHash.html)       | `hCEk`           |
| external  | [`ExternalHash`](https://docs.rs/holo_hash/latest/holo_hash/type.ExternalHash.html) | `hC8k`           |

There are also a couple of composite types, [`AnyDhtHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyDhtHash.html) and [`AnyLinkableHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyLinkableHash.html).

Here's an overview of the five types above, plus two composite types:

* `DnaHash` is the hash of the DNA bundle (including any DNA modifiers passed in at installation or cloning time), and is the [unique identifier for the network](/build/working-with-data/#storage-locations-and-privacy).
* `AgentPubKey` is the public key of a participant in a network.
* `ActionHash` is the hash of a structure called an [action](/build/working-with-data/#entries-actions-and-records-primary-data) that records a participant's act of storing or changing private or shared data.
* `EntryHash` is the hash of an arbitrary blob of bytes called an [entry](/build/entries/), which contains application or system data. (Note: there's a special system entry called [`Agent`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/enum.Entry.html#variant.Agent), which holds the agent's public key; the hash function returns the public key itself, _not_ its hash.)
* `ExternalHash` is the ID of a resource that exists outside the database, such as the hash of an IPFS resource or the public key of an Ethereum wallet. Holochain doesn't care about its value, as long as it's 32 bytes long. There's no content stored at the address; it simply serves as an anchor to attach [links](/build/links-paths-and-anchors/) to.
* Composite types --- if one of the types above is eligible, it can be converted into one of these two types via the `.into()` method. Functions that take the below types will implicitly convert from the above types.
    * `AnyDhtHash` is the hash of any kind of addressable content (actions, entries, and agent public keys). Any
    * `AnyLinkableHash` is the hash of anything that can be linked to or from (that is, all of the above).

## Getting hashes

Because Holochain's graph DHT is all about connecting hashes to other hashes, here's how you get hashes.

!!! info Hashing functions aren't built in
To keep compiled zomes small, there are no hashing functions built into the HDI or HDK. Most of the time, you'll get the hash you need from a property in a data structure or the return value of a host function. In the rare cases when you need to compute a hash, use the [host functions in the `hdi::hash` module](https://docs.rs/hdi/latest/hdi/hash/index.html#functions). There are functions for hashing actions, entries, and arbitrary vectors of bytes.
!!!

### Action

Any CRUD host function that records an action on an agent's source chain, such as `create`, `update`, `delete`, `create_link`, and `delete_link`, returns the hash of the action. You can use this in the fields of other entries or in links, in either the same function call or another function call.

If you have a variable that contains a [`hdk::prelude::Record`](https://docs.rs/hdk/latest/hdk/prelude/struct.Record.html), you can get its hash using the [`action_address`](https://docs.rs/hdk/latest/hdk/prelude/struct.Record.html#method.action_address) method or the [`as_hash` method on its `signed_action` property](https://docs.rs/hdk/latest/hdk/prelude/struct.SignedHashed.html#method.as_hash):

```rust
let action_hash_from_record = record.action_address().to_owned();
let action_hash_from_signed_action = record.signed_action.as_hash().to_owned();
assert_eq!(action_hash_from_record, action_hash_from_signed_action);
```

If you have a variable that contains a [`hdk::prelude::Action`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html), you need to calculate its hash using the [`hdi::hash::hash_action`](https://docs.rs/hdi/latest/hdi/hash/fn.hash_action.html) host function:

```rust
use hdi::hash::*;

let action_hash_from_action = hash_action(action)?;
assert_eq!(action_hash_from_signed_action, action_hash_from_action);
```

(But it's worth pointing out that if you have an action in a variable, it's probably because you just retrieved it by hash, which means you already know the hash.)

To get the hash of an entry creation action from an action that deletes or updates it, match on the [`Action::Update`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#variant.Update) or [`Action::Delete`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#variant.Delete) action variants and access the appropriate field:

```rust
use holochain_integrity_types::action::*;

if let Action::Update(action_data) = action {
    let replaced_action_hash = action_data.original_action_address;
    // Do some things with the original action.
} else if let Action::Delete(action_data) = action {
    let deleted_action_hash = action_data.deletes_address;
    // Do some things with the deleted action.
}
```

### Entry

To get the hash of an entry, first construct an instance of the entry type that you [defined in the integrity zome](/build/entries/#define-an-entry-type), then pass it through the [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html) function. (You don't actually have to write the entry to a source chain to get the entry hash.)

```rust
use hdk::hash::*;
use movie_integrity::*;
use chrono::DateTime;

let movie = Movie {
    title: "The Good, the Bad, and the Ugly",
    director_entry_hash: EntryHash::from_raw_36(vec![/* hash of Sergio Leone entry */]),
    imdb_id: Some("tt0060196"),
    release_date: Timestamp::from(
        DateTime::parse_from_rfc3339("1966-12-23")?
            .to_utc()
    ),
    box_office_revenue: 389_000_000,
};
let movie_entry_hash = hash_entry(movie)?;
```

To get the hash of an entry from the action that created it, call the action's [`entry_hash`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html#method.entry_hash) method. It returns an optional value, because not all actions have associated entries.

```rust
let maybe_entry_hash = action.entry_hash();
```

If you know that your action is an entry creation action, you can get the entry hash from its `entry_hash` field:

```rust
let entry_creation_action: EntryCreationAction = action.into()?;
let entry_hash = entry_creation_action.entry_hash;
```

To get the hash of an entry from a record, you can get it from the contained action:

```rust
let entry_hash_from_action = record.action().entry_hash()?;
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

An agent's ID is just their public key, and an entry for their ID is stored on the DHT. The hashing function for an `Agent` system entry just returns the literal value of the public key. This is an awkward way of saying that you reference an agent using their public key!

An agent can get their own ID by calling [`hdk::prelude::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html).

```rust
use hdk::prelude::*;

let my_id = agent_info()?.agent_initial_pubkey;
```

All actions have their author's ID as a field. You can get this field by calling the action's [`author`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#method.author) method:

```rust
let author_id = action.author();
```

### External reference

An external reference is just any 32-byte identifier. Holochain doesn't care if it's an IPFS hash, an Ethereum wallet, a very short URL, or the name of your pet cat. But because it comes from outside of a DHT, it's up to your application to decide how to handle it. Typically, an external client such as a UI would supply external references from a source it has access to, such as an HTTP API or a form field.

To construct an external hash from 32 raw bytes, first you need to enable the `hashing` feature in the `holo_hash` crate. In your zome's `Cargo.toml` add this line:

```diff
...
[dependencies]
hdk = { workspace = true }
serde = { workspace = true }
+ # Replace the following version number with whatever your project is
+ # currently using -- search your root `Cargo.lock` for "holo_hash" to find it.
+ holo_hash = { version = "=0.4.0", features = ["hashing"] }
...
```

Then you can construct an `ExternalHash`:

```rust
use holo_hash::*;
let ipfs_movie_poster_hash = ExternalHash::from_raw_32(vec![/* bytes of external hash */]);
```

### DNA

There is one global hash that everyone knows, and that's the hash of the DNA itself. You can get it by calling [`hdk::prelude::dna_info`](https://docs.rs/hdk/latest/hdk/info/fn.dna_info.html).

```rust
use hdk::prelude::*;

let dna_hash = dna_info()?.hash;
```

## Using addresses

### In DHT data

To reference an address in your entry data, define a field in your entry that can hold the right kind of address. The HDK will take care of serialization and deserialization for you. The following entry type has two fields that take different kinds of address.

```rust
use hdi::prelude::*;

#[hdk_entry_helper]
pub struct MovieLoan {
    movie_hash: EntryHash,
    lent_to: AgentPubKey,
    loan_duration_seconds: i64,
}

// Remember to create a variant in your `EntryTypes` enum for this new type!
```

To reference an address in your links, pass it directly to the `create_link` function:

```rust
use hdk::prelude::*;

let movie_to_loan_action_hash = create_link(
    movie_hash,
    movie_loan_hash,
    LinkTypes::MovieToLoan,
    ()
)?;
```

Read more about [entries](/build/entries/) and [links](/build/links-paths-and-anchors/).

## The unpredictability of action hashes

There are a few important things to know about action hashes:

* You can't know an action's hash until you've written the action, because the action contains the current system time at the moment of writing.
* When you write an action, you can specify "relaxed chain top ordering". We won't go into the details here, <!-- TODO: fill this in when I write about zome call lifecycles -->but when you use it, the action hash may change after the function completes.
* A function that writes actions is _atomic_, which means that all writes fail or succeed together.

Because of these three things, it's unsafe to depend on the value or even existence of an action hash within the same function that writes it. Here are some 'safe usage' notes:

* You may safely use the hash of an action you've just written as data in another action in the same function (e.g., in a link or an entry that contains the hash in a field), as long as you're not using relaxed chain top ordering.
* The same is also true of action hashes in your function's return value.
* Don't communicate the action hash with the front end, another cell, or another peer on the network via a remote function call or [signal](/concepts/9_signals/) _from within the same function that writes it_, in case the write fails. Instead, do your communicating in a follow-up step. The easiest way to do this is by implementing [a callback called `post_commit`](https://docs.rs/hdk/latest/hdk/#internal-callbacks) which receives a vector of all the actions that the function wrote.

<!-- TODO: write about the front end -->

## Reference

* [`holo_hash` types](https://docs.rs/holo_hash/latest/holo_hash/#types)
* [`holo_hash::DnaHash`](https://docs.rs/holo_hash/latest/holo_hash/type.DnaHash.html)
* [`holo_hash::AgentPubKey`](https://docs.rs/holo_hash/latest/holo_hash/type.AgentPubKey.html)
* [`holo_hash::ActionHash`](https://docs.rs/holo_hash/latest/holo_hash/type.ActionHash.html)
* [`holo_hash::EntryHash`](https://docs.rs/holo_hash/latest/holo_hash/type.EntryHash.html)
* [`holo_hash::ExternalHash`](https://docs.rs/holo_hash/latest/holo_hash/type.ExternalHash.html)
* [`holo_hash::AnyDhtHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyDhtHash.html)
* [`holo_hash::AnyLinkableHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyLinkableHash.html)
* [`holochain_integrity_types::record::Record`](https://docs.rs/hdk/latest/hdk/prelude/struct.Record.html)
* [`holochain_integrity_types::record::SignedHashed<T>`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/record/struct.SignedHashed.html) (e.g., an action in a record)
* [`holochain_integrity_types::action::Action`](https://docs.rs/hdk/latest/hdk/prelude/enum.Action.html)
* [`holochain_integrity_types::action::Update`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Update.html) data struct
* [`holochain_integrity_types::action::Delete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.Delete.html) data struct
* [`hdk::prelude::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html)
* [`holochain_integrity_types::action::Action#author`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#method.author)
* [`holo_hash::HoloHash<P>#from_raw_32`](https://docs.rs/holo_hash/latest/src/holo_hash/hash.rs.html#217-219) (must be enabled by `hashing` feature flag)
* [`hdi::info::dna_info`](https://docs.rs/hdi/latest/hdi/info/fn.dna_info.html)

## Further reading

* [Explanation of Holochain hash format](https://docs.rs/hdi/latest/hdi/hash/index.html)
* [Build Guide: Working With Data](/build/working-with-data/)
* [Build Guide: Entries](/build/entries/)
* [Build Guide: Links, Paths, and Anchors](/build/links-paths-and-anchors/)