---
title: "Querying Source Chains"
---

::: intro
An agent can **query their source chain** for a history of the [records](/build/working-with-data/#entries-actions-and-records-primary-data) they've written, including [**link**](/build/links-paths-and-anchors/) and public and private [**entry**](/build/entries/) data, which includes **capability grants and claims**<!--TODO: link to capabilities -->. They can also query the public portion of another agent's source chain in a [**zome function**](/build/zome-functions/) or [**`validate` callback**](/build/callbacks-and-lifecycle-hooks/#define-a-validate-callback).
:::

An agent's source chain is their record of local state changes. It's a multi-purpose data structure, and can be interpreted in different ways, including as:

* a chronological record of contributions to the shared [**DHT**](/concepts/4_dht/),
* a ledger of changes to a single state,
* a store for private entry data, or
* a store for capability grants and claims.

## Filtering a query

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

#[hdk_extern]
pub fn get_all_movies_i_authored() -> Vec<Record> {
    query(ChainQueryFilter::new()
        .entry_type(EntryType::App(UnitEntryTypes::Movie.into()))
        .include_entries(true)
    )
}
```

## Query another agent's source chain for validation

When validating an agent's activity, you can query their existing source chain records with [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html). Validation logic must be deterministic, so this function's [filter struct](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/chain/struct.ChainFilter.html) and return value remove non-determinism.

`must_get_agent_activity` only allows you to select a contiguous, bounded slice of a source chain, and doesn't return any information about the validity of the actions in that slice or the chain as a whole. It needs to get the entire slice from an authority, so it's best to use it only when validating a `RegisterAgentActivity` operation<!-- TODO: link to DHT ops page -->, where the validating authority already has that data.

<!-- TODO: move this to validation page or must_get_* page -->

This example fills out a `validate_update_movie` stub function, generated by the scaffolding tool, to enforce that an agent may only edit a movie listing three times.

```rust
use hdi::prelude::*;

pub fn validate_update_movie(
    action: Update,
    _movie: Movie,
    original_action: EntryCreationAction,
    _original_movie: Movie,
) -> ExternResult<ValidateCallbackResult> {
    let result = must_get_agent_activity(
        // Get the agent hash from the action itself.
        action.author,
        // You can only validate an action based on the source chain records
        // that precede it, so use the previous action hash as the `chain_top`
        // argument in this query.
        // We don't specify a range here, so it defaults to
        // `ChainFilters::ToGenesis`. We also don't specify whether to include
        // entries, so it defaults to false.
        ChainFilter::new(action.prev_action)
    )?;

    // The result is a vector of
    // holochain_integrity_types::op::RegisterAgentActivity DHT ops, from
    // which we can get the actions.
    let result_as_actions = result
        .iter()
        .map(|o| o.action.hashed.content)
        .collect();

    // Now we build and use a filter to only get updates for `Movie` entries.
    let filter_movie_update_actions = ChainQueryFilter::new()
        .action_type(ActionType::Update)
        .entry_type(EntryType::App(EntryTypes::Movie.into()));
    let movie_update_actions: Vec<Update> = filter_movie_update_actions
        .filter_actions(result_as_actions)
        .iter()
        .map(|a| a.try_into().unwrap())
        .collect();

    // Now find out how many times we've tried to update the same `Movie` as
    // we're trying to update now.
    let times_I_updated_this_movie = movie_update_actions
        .fold(1, |c, a| c + if a.original_action_address == action.original_action_address { 1 } else { 0 });

    if times_I_updated_this_movie > 3 {
        Ok(ValidateCallbackResult::Invalid("Already tried to update the same movie action 3 times"))
    } else {
        Ok(ValidateCallbackResult::Valid)
    }
}
```

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
<!-- TODO: add validation build guide -->