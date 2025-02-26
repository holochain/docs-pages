---
title: "Validation"
---

::: topic-list
### In this section {data-no-toc}

* Validation (this page)
    * [`genesis_self_check` Callback](/build/genesis-self-check-callback/) --- writing a function to control access to a network
    * [`validate` Callback](/build/validate-callback/) --- basic callback, examples using stub functions
    * [DHT operations](/build/dht-operations/) --- advanced details on the underlying data structure used in DHT replication and validation
:::

::: intro
Validation gives shape to your [DNA](/build/dnas/)'s data model. It defines the 'rules of the game' for a network --- who can create, modify, or delete data, and what that data should and shouldn't look like. It's also the basis for Holochain's peer-auditing security model.
:::

You implement your validation logic in your application's [integrity zomes](/build/zomes/#integrity). While [entry and link types](/build/working-with-data/) enumerate the kinds of data the integrity zome defines, the data is just bytes until your validation logic gives it some shape and purpose.

A DNA uses validation logic in two ways:

1. By an author of data, to protect them from publishing invalid data, and
2. By an agent that's received data to store and serve, to equip them to detect invalid data and take action against the author.

Because every peer has the DNA's validation logic on their own machine and is expected to check the data they author before they publish it, it can be assumed that invalid data is (almost) always an intentionally malicious act.

!!! info
Currently Holochain can inform agents about invalid data when asked. In the future it'll also take automatic defensive action by putting a malicious author into an agent's network block list when they see evidence of invalid data.
!!!

There are two callbacks that implement validation logic:

* [`validate`](/build/validate-callback/) is the core of the zome's validation logic. It receives a [**DHT operation**](/resources/glossary/#dht-operation), which is a request to transform the data at an address, and returns a success/failure/indeterminate result.
* [`genesis_self_check`](/build/genesis-self-check-callback/) 'pre-validates' an agent's [**membrane proof**](/concepts/3_source_chain/#source-chain-your-own-data-store) before trying to connect to peers in the network.

## Design considerations

Validation is a broad topic, so we won't go into detail here. There are a few basic things to keep in mind though:

* The structure of the [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) type that a `validate` callback receives is complex and deeply nested, and it's best to let the [scaffolding tool](/get-started/3-forum-app-tutorial/) generate the callback for you. It generates stub functions that let you think in terms of [actions](/build/working-with-data/#entries-actions-and-records-primary-data) rather than operations, which is more natural and good enough for most needs. [Read all about DHT operations](/build/dht-operations/) if you want deep detail.
* While an entry or link can be thought of as 'things', the actions that create, update, or delete them are verbs. Validating a whole action lets you not just check the content and structure of your things, but also enforce write privileges and even throttle an agent's frequency of writes by looking at the action's place in their source chain.
* Validation rules should **always yield the same true/false outcome** for a given operation regardless of who is validating them and when. Don't use any source of non-determinism, such as instantiating and comparing two `std::time::Instant`s. In fact Holochain prevents your validation callbacks from calling any non-deterministic host functions. Read more about the [available host functions](#available-host-functions).
* Data may have dependencies that affect validation outcomes, but those dependencies must be [addressable](/build/identifiers/), they must be retrievable from the same DHT, and their addresses must be constructable from data in the operation being validated. (Note that because an action references the action preceding it on an agent's source chain, this is a dependency you don't need to build into your data.) If dependencies can't be retrieved at validation time, the `validate` callback terminates early with an [indeterminate result](/build/validate-callback/#validation-outcomes), which will cause Holochain to try again later.
* When multiple actions are written in a same [atomic transaction](/build/zome-functions/#atomic-transactional-commits), actions' ops can only have dependencies on prior actions committed in the transaction, not later actions.
* You don't need to validate your data manually before committing --- Holochain [validates it after the zome function that writes it is finished](/build/zome-functions/#validate-dht-operations), and returns any validation failure to the caller.
* **Test, test, test.** Validation is the gate that accepts or rejects all DHT data, so make sure you write thorough test coverage for your validation functions. We recommend testing your validation code by writing single- and multiple-agent [Tryorama](https://github.com/holochain/tryorama/) test scenarios for zome functions that write data (we'll write about Tryorama soon; in the meantime, you can check the Tryorama GitHub readme and the scaffolded tests in a project's `tests/src/` folder for guidance).<!-- TODO: link to Tryorama page -->

### Things you don't need to worry about

* For dependency trees that might get complex and costly to retrieve, you can use **inductive validation** rather than having to retrieve and validate all the dependencies. <!-- TODO: link to section on validate callback page when this gets fixed: https://github.com/holochain/holochain/issues/4669 -->
* Action timestamps, sequence indices, and authorship are automatically checked for consistency against the previous action in the author's source chain.
* Data is checked against Holochain's maximum size (4 MB for entries, 1 KB for link tags).
* The entry type of `Update` actions is checked against the data they replace.
* The scaffolding tool generates a sensible default `validate` callback that does these things for you:
    * Tries to deserialize an entry into the correct Rust type, and returns a validation failure if it fails.
    * Checks that the original entry for an `Update` or `Delete` action exists and is a valid entry creation action.
    * Checks that the original entry for an `Update` contains the same entry type.
    * Checks that the original entry for a `Delete` comes from the same integrity zome.
    * Checks that the [action that registers the agent's public key](/concepts/3_source_chain/#agent-id-action) is directly preceded by an [`AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg) action.
    * Checks that [most-recent update links](/get-started/3-forum-app-tutorial/#scaffold-most-recent-update-link) and [collection links](/build/links-paths-and-anchors/#scaffold-a-simple-collection-anchor) point to valid entry creation records.
    * Tries to fetch data dependencies from the DHT and make sure they're the right type.

## Available host functions

As mentioned, any host functions that introduce non-determinism can't be called from `genesis_self_check` or `validate` --- Holochain will return an error. That includes functions that create data or check the current time or agent info, of course, but it also includes certain functions that retrieve DHT or source chain data. That's because this data can change over time.

These functions are available to both `validate` and `genesis_self_check`:

* [`dna_info`](https://docs.rs/hdi/latest/hdi/info/fn.dna_info.html)
* [`zome_info`](https://docs.rs/hdi/latest/hdi/info/fn.zome_info.html)
* [`ed25519` functions](https://docs.rs/hdi/latest/hdi/ed25519/index.html)
* [`x_salsa20_poly1305` functions](https://docs.rs/hdi/latest/hdi/x_salsa20_poly1305/index.html)

`validate` can also call these deterministic DHT retrieval functions:

* [`must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html) tries to get an action from the DHT. (It's not guaranteed that the action will be valid.)
* [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html) tries to get a contiguous section of a source chain, starting from a given record and walking backwards to another spot (either the beginning of the chain, a number of records, or one of a number of given hashes).
* [`must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html) tries to get an entry from the DHT. (As with `must_get_action`, it's not guaranteed that the entry will be valid.)
* [`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html) tries to get a record, and will fail if the record is marked invalid by any validators, even if it can be found.

All of these functions cause a `validate` callback to terminate early with <code>ValidateCallbackResult::UnresolvedDependencies([UnresolvedDependencies](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.UnresolvedDependencies.html))</code>.