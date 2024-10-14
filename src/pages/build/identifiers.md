---
title: "Identifiers"
---

::: intro
Data in Holochain is **addressable content**, which means that it's retrieved using an address that's derived from the data itself.
:::

## Address types

The address of most data is the [Blake2b-256](https://www.blake2.net/) hash of its bytes. This goes for both [**actions** and **entries**](/build/working-with-data/#entries-actions-and-records-primary-data) (with just one exception), and there are two extra address types that have content associated with them.

All addresses are 39 bytes long and are [multihash-friendly](https://www.multiformats.io/multihash/). Generally, you don't need to know how to construct an address. Functions and data structures that store data will give you the data's address. But when you see a hash in the wild, this is what it's made out of:

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

You can see that, in the Rust SDK, each address is typed to what it represents. There are also a couple of composite types, [`AnyDhtHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyDhtHash.html) and [`AnyLinkableHash`](https://docs.rs/holo_hash/latest/holo_hash/type.AnyLinkableHash.html), that certain functions (like link creation functions) accept. You can also use the above hash types as fields in your entry types.

Here's an overview of all seven address types:

* `DnaHash` is the hash of the DNA bundle, and is the [unique identifier for the network](/build/working-with-data/#storage-locations-and-privacy).
* `AgentPubKey` is the public key of a participant in a network. Its address is the same as the entry content --- the agent's public key, not the hash of the public key.
* `ActionHash` is the hash of a structure called an [action](/build/working-with-data/#entries-actions-and-records-primary-data) that records a participant's act of storing or changing private or shared data.
* `EntryHash` is the hash of an arbitrary blob of bytes called an [entry](/build/entries/), which contains application or system data.
* `ExternalHash` is the ID of a resource that exists outside the database, such as the hash of an IPFS resource or the public key of an Ethereum wallet. Holochain doesn't care about its content, as long as it's 32 bytes long. There's no content stored at the address; it simply serves as an anchor to attach [links](/build/links-paths-and-anchors/) to.
* `AnyDhtHash` is the hash of any kind of addressable content (that is, actions and entries, including `AgentPubKey` entries).
* `AnyLinkableHash` is the hash of anything that can be linked to or from (that is, all of the above).

### The unpredictability of action hashes

There are a few things to know about action hashes:

* You can't know an action's hash until you've written the action, because it's influenced by both the previous action's hash and participant's current system time.
* When you write an action, you can specify "relaxed chain top ordering". We won't go into the details here, <!-- TODO: fill this in when I write about zome call lifecycles -->but it means an action hash may change after the action is written, so you shouldn't depend on the value of the hash within the function that writes it.
* Any function that writes to an agent's source chain is **atomic**, which means that all actions are written, but only after the function succeeds _and_ all actions are successfully validated. That means that you shouldn't depend on content being available at an address until _after_ the function returns a success result.

## Getting hashes

Because Holochain's graph DHT is all about connecting hashes to other hashes, here's how you get hashes.

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

To get the hash of an entry, first construct the entry struct or enum that you [defined in the integrity zome](/build/entries/#define-an-entry-type), then pass it through the [`hdk::hash::hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html) function. (You don't actually have to write the entry to a source chain to get the entry hash.)

```rust
use hdk::hash::*;
use movie_integrity::*;

let director_entry_hash = EntryHash::from_raw_36(vec![/* Sergio Leone's hash */]);
let movie = Movie {
  title: "The Good, the Bad, and the Ugly",
  director_entry_hash: director_entry_hash,
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

An external reference is just any 32-byte identifier. Holochain doesn't care if it's an IPFS hash, an Ethereum wallet, the hash of a constant in your code, a very short URL, or the name of your pet cat. But because it comes from outside of a DHT, it's up to your application to decide how to construct or handle it. Typically, an external client such as a UI would do all that.

Construct an external hash from the raw bytes or a Base64 string:

```rust
use holo_hash::*;

```

You can then use the value wherever linkable hashes can be used.
My hovercraft is full of eels!!!
### DNA

There is one global hash that everyone knows, and that's the hash of the DNA itself. You can get it by calling [`hdk::prelude::dna_info`](https://docs.rs/hdk/latest/hdk/info/fn.dna_info.html).

```rust
use hdk::prelude::*;

let dna_hash = dna_info()?.hash;
```