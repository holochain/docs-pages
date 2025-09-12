---
title: "Querying Source Chains"
---

::: intro
An agent can **query their source chain** for a history of the [records](/build/working-with-data/#entries-actions-and-records-primary-data) they've written, including [**link**](/build/links-paths-and-anchors/) and public and private [**entry**](/build/entries/) data, which includes [**capability grants and claims**](/build/capabilities/). They can also query the public portion of another agent's source chain in a [**zome function**](/build/zome-functions/) or [**`validate` callback**](/build/callbacks-and-lifecycle-hooks/#define-a-validate-callback).
:::

An agent's source chain is their record of local state changes. It's a multi-purpose data structure, and can be interpreted in different ways, including as:

* a chronological record of contributions to the shared [**DHT**](/concepts/4_dht/),
* a ledger of changes to a single state,
* a store for private entry data, or
* a store for capability grants and claims.

## Filtering a query

Before we talk about getting data, let's talk about query filters, which apply to a few different sources of data.

Whether an agent is querying their own source chain or another agent's, you build a query with the [`ChainQueryFilter`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.ChainQueryFilter.html) struct, which has a few filter types:

* <code>sequence_range: <a href="https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ChainQueryFilterRange.html">ChainQueryFilterRange</a></code>: A start and end point on the source chain, either:
    * `Unbounded`: the beginning and current tip of the chain
    * `ActionSeqRange(u32, u32)`: start and end sequence indices, inclusive, zero-based.
    * `ActionHashRange(ActionHash, ActionHash)`: start and end action hashes, inclusive.
    * `ActionHashTerminated(ActionHash, u32)`: an action hash plus the _n_th actions preceding it.
* <code>entry_type: Option&lt;Vec&lt;<a href="https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.EntryType.html">EntryType</a>&gt;&gt;</code>: Only select the given entry types, which can include both system and app entry types.
* `entry_hashes: Option<HashSet<EntryHash>>`: Only select entry creation actions with the given entry hashes.
* <code>action_type: Option&lt;Vec&lt;<a href="https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.ActionType.html">ActionType</a>&gt;&gt;</code>: Only select actions of the given type.
* `include_entries: bool`: Try to retrieve and include entry data for entry creation actions. Private entries will only be included for `query`, not `get_agent_activity`.
* `order_descending: bool`: Return the results in reverse chronological order, newest first and oldest last.

After retrieving the filtered records, you can then further filter them in memory using Rust's standard `Iterator` trait.

### Use the builder interface

Rather than building a struct and having to specify fields you don't need, you can use the builder interface on `ChainQueryFilter`:

```rust
use hdk::prelude::*;
use movies::prelude::*;

let filter_only_movie_updates = ChainQueryFilter::new()
    .entry_type(EntryType::App(UnitEntryTypes::Movie.into()))
    .action_type(ActionType::Update)
    .include_entries(true);

let filter_only_cap_grants_and_claims_newest_first = ChainQueryFilter::new()
    .entry_type(EntryType::CapGrant)
    .entry_type(EntryType::CapClaim)
    .include_entries(true)
    .descending();

let filter_first_ten_records = ChainQueryFilter::new()
    .sequence_range(ChainQueryFilterRange::ActionSeqRange(0, 9));
```

### Use `ChainQueryFilter` to query a vector of actions or records

If you already have a vector of `Action`s or `Records` in memory, you can apply a `ChainQueryFilter` to them as if you were querying a source chain.

```rust
include hdk::prelude::*;

let actions: Vec<Action> = /* get some actions somehow */;
let movie_update_actions = filter_only_movie_updates.filter_actions(actions);
```

## Query an agent's own source chain

An agent can query their own source chain with the [`query`](https://docs.rs/hdk/latest/hdk/chain/fn.query.html) host function, which takes a `ChainQueryFilter` and returns a `Vec<Record>` wrapped in an `ExternResult`.

```rust
use hdk::prelude::*;
use movies::prelude::*;

#[hdk_extern]
pub fn get_all_movies_i_authored() -> Vec<Record> {
    query(ChainQueryFilter::new()
        .entry_type(EntryType::App(UnitEntryTypes::Movie.into()))
        .include_entries(true)
    )
}
```

## Query another agent's source chain

### In coordinator logic

In your coordinator zome functions, you can use the [`get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html) host function, which works a lot like `query` if you pass [`ActivityRequest::Full`](https://docs.rs/hdk/latest/hdk/prelude/enum.ActivityRequest.html#variant.Full) to it. The main differences are:

* It also returns the status of the chain (empty, valid, invalid, or forked) along with any collected warrants, and
* It returns action hashes but no action or entry data. <!-- TODO: hopefully this behavior will be fixed one day -->

If you want to get the action data, you'll need to perform a DHT query for every action hash you get back. The query filters are applied at the source before the hashes are sent back to you, so you don't have to re-filter the actions once you retrieve them.

Ths example gets the action hashes of all the movie entries authored by an arbitrary agent.

!!! info All DHT requests can fail
Because a DHT request often goes out to a remote node, it can fail to connect to that node, or they may not have the data you're looking for. It's up to you to build the retry logic that works best for your app. If you have program flow that requires multiple queries, it's often a good practice to define zome functions as single-query functions that return DHT hashes so that the client can retrieve the rest of the data in follow-up zome calls. This way, work isn't wasted if one query fails.
!!!

<!-- TODO: if get_agent_activity is ever changed to return actions rather than hashes, update the following code to use get_entry. And if get_agent_activity ever honours `include_entries` change that too. -->

```rust
use hdk::prelude::*;
use movies::prelude::*;

#[hdk_extern]
pub fn get_hashes_of_all_movies_someone_else_authored(agent_id: AgentPubKey) -> ExternResult<Vec<ActionHash>> {
    let activity = get_agent_activity(
        agent_id,
        ChainQueryFilter::new()
            .entry_type(EntryType::App(UnitEntryTypes::Movie.into())),
            // get_agent_activity ignores the include_entries filter, because
            // the agent ID authorities don't store the entry data along with
            // the actions.
        ActivityRequest::Full
    )?;
    // The action hash is the second element in each tuple.
    Ok(activity.valid_activity.into_iter().map(|a| a.1).collect())
}
```

<!-- TODO: when https://github.com/holochain/docs-pages/pull/597 is merged, write an admonition that says that get_agent_activity is also used for getting warrants and invalid data etc -->

### During validation

There's another source chain querying function called `must_get_agent_activity`, which is used in validation to check whether a contiguous region of a source chain is valid. But you can also use it in a coordinator zome function to retrieve action data (not just the hashes), as long as you don't need to filter on action or entry type. See the [Validation](/build/must-get-host-functions/#must-get-agent-activity) page for an example.

## Reference

* [`holochain_zome_types::query::ChainQueryFilter`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.ChainQueryFilter.html)
* [`holochain_zome_types::query::ChainQueryFilterRange`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ChainQueryFilterRange.html)
* [`holochain_integrity_types::action::EntryType`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.EntryType.html)
* [`holochain_integrity_types::action::ActionType`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.ActionType.html)
* [`hdk::chain::query`](https://docs.rs/hdk/latest/hdk/chain/fn.query.html)
* [`holochain_integrity_types::record::Record`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/record/struct.Record.html)
* [`hdk::chain::get_agent_activity`](https://docs.rs/hdk/latest/hdk/chain/fn.get_agent_activity.html)
* [`holochain_zome_types::query::ChainStatus`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ChainStatus.html)
* [`holochain_zome_types::query::AgentActivity`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/struct.AgentActivity.html)
* [`holochain_zome_types::query::ActivityRequest`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/query/enum.ActivityRequest.html)
* [`hdi::chain::must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html)
* [`holochain_integrity_types::chain::ChainFilter`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/chain/struct.ChainFilter.html)

## Further reading

* [Core Concepts: Source Chain](/concepts/3_source_chain/)
* [Core Concepts: Validation](/concepts/7_validation/)
* [Build Guide: Working With Data: Entries, actions, and records](/build/working-with-data/#entries-actions-and-records-primary-data)
* [Build Guide: Validation](/build/validation/)