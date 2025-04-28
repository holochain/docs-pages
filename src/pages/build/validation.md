---
title: "Validation"
---

::: topic-list
### In this section {data-no-toc}

* Validation (this page)
    * [`genesis_self_check` Callback](/build/genesis-self-check-callback/) --- writing a function to control access to a network
    * [`validate` Callback](/build/validate-callback/) --- basic callback, examples using stub functions
    * [`must_get_*` Host Functions](/build/must-get-host-functions/) --- Deterministically retrieving DHT data for use in validation
    * [DHT operations](/build/dht-operations/) --- advanced details on the underlying data structure used in DHT replication and validation
:::

::: intro
Validation gives shape to your [DNA](/build/dnas/)'s data model. It defines the 'rules of the game' for a network --- who can create, modify, or delete data, and what that data should and shouldn't look like. It's also the basis for Holochain's peer-auditing security model.
:::

You implement your validation logic in your application's [integrity zomes](/build/zomes/#integrity). A DNA uses validation logic in two ways:

1. By an author of data, to protect them from publishing invalid data, and
2. By an agent that's received data to store and serve, to equip them to detect invalid data and take action against the author.

Because every peer has the DNA's validation logic on their own machine and is expected to check the data they author before they publish it, invalid data is treated as an intentionally malicious act.

!!! info
Currently Holochain can inform agents about invalid data when asked. In the future it'll also take automatic defensive action by putting a malicious author into an agent's network block list when they see evidence of invalid data.
!!!

There are two callbacks that implement validation logic:

* [`validate`](/build/validate-callback/) is the core of the zome's validation logic. It receives a [**DHT operation**](/resources/glossary/#dht-operation), which is a request to transform the data at an address, and returns a success/failure/indeterminate result.
* [`genesis_self_check`](/build/genesis-self-check-callback/) 'pre-validates' an agent's own [**membrane proof**](/concepts/3_source_chain/#source-chain-your-own-data-store) before trying to connect to peers in the network.

## Design considerations

Validation is a broad topic, so we won't go into detail here. There are a few basic things to keep in mind though:

* The structure of the [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) type that a `validate` callback receives is complex and deeply nested, and it's best to let the [scaffolding tool](/get-started/3-forum-app-tutorial/) generate the callback for you. It generates stub functions that let you think in terms of [actions](/build/working-with-data/#entries-actions-and-records-primary-data) rather than operations, which is more natural and good enough for most needs. [Read all about DHT operations](/build/dht-operations/) if you want deep detail.
* [Entry](/build/entries/) data, [link tags](/build/links-paths-and-anchors/#link-tag), and membrane proofs are just blobs; they need to be parsed in order to check that they have the correct structure. (The HDK makes it easy to [deserialize an entry blob into a Rust type](#deserialize-entry) though.)
* While an entry or link can be thought of as 'things', the actions that create, update, or delete them are verbs. Validating a whole action lets you not just check the content and structure of your things, but also enforce write privileges and even throttle an agent's frequency of writes by looking at the action's place in their source chain.
* Validation rules must **always yield the same true/false outcome** for a given operation regardless of who is validating them and when. Don't use any source of non-determinism, such as instantiating and comparing two `std::time::Instant`s. In fact Holochain prevents your validation callbacks from calling any non-deterministic host functions. Read more about the [available host functions](#available-host-functions).
* Data may have dependencies that affect validation outcomes, but those dependencies must be [addressable](/build/identifiers/), they must be retrievable from the same DHT, and their addresses must be known. If a dependency can't be retrieved at validation time, the `validate` callback terminates early with an [indeterminate result](/build/validate-callback/#validation-outcomes), which will cause Holochain to try again later. (Note that an action already has a dependency on the action preceding it on an agent's source chain.)
* Even though multiple actions can be written within an [atomic transaction](/build/zome-functions/#atomic-transactional-commits), they are _not_ validated together as an atomic transaction. An action can only have dependencies on prior actions in a source chain, not subsequent actions.
* You don't need to validate your data manually before committing --- Holochain [validates it after the zome function that writes it is finished](/build/zome-functions/#validate-dht-operations), and returns any validation failure to the caller.

* **Test, test, test.** Validation is the gate that accepts or rejects all DHT data, so make sure you write thorough test coverage for your validation functions. If the data being validated has no dependencies on DHT data or DNA/zome info, we recommend writing Rust unit tests for the [validation function stubs](/build/validate-callback/#create-boilerplate-code-with-the-scaffolding-tool) that the scaffolding tool generates. We also recommend testing your validation code by writing single- and multiple-agent [Tryorama](https://github.com/holochain/tryorama/) test scenarios for zome functions that write data. This lets you check that your validation rules pass both when authoring data and checking data authored by other agents. (We'll write about Tryorama soon; in the meantime, you can check the Tryorama GitHub readme and the scaffolded tests in a project's `tests/src/` folder for guidance).<!-- TODO: link to Tryorama page -->

### Things you don't need to worry about

* For dependency trees that might get complex and costly to retrieve, you can use [**inductive validation**](/build/validate-callback/#inductive-validation) rather than having to retrieve and validate all the dependencies.
* Action timestamps, sequence indices, and authorship are automatically checked for consistency against the previous action in the author's source chain.
* Data is checked against Holochain's maximum size (4 MB for entries, 1 KB for link tags).
* The entry type of `Update` actions is checked against the data they replace.
* The scaffolding tool generates a sensible default `validate` callback that does these things for you:
    * Tries to deserialize an entry into the correct Rust type, and returns a validation failure if it fails. {#deserialize-entry}
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

* [`must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html)
* [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html).
* [`must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html)
* [`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html)

You can read about them on the [`must_get_*` Host Functions](/build/must-get-host-functions/) page.