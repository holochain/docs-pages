---
title: "Validation Receipts"
---

::: intro
An agent can get a rough sense of the DHT availability of their data by checking how many **validation receipts** it's collected. These receipts are created by the peers that the agent has **published** their [**DHT operations**](/build/dht-operations/) to as a confirmation that they have received, validated, and stored the data and have started to serve it.
:::

As described in the [DHT operations](/build/dht-operations/) page, each action that an agent authors is turned into a set of DHT operations that are published to other agents in the network for validation. If an operation is found to be valid, it'll transform the state of the DHT at the operation's [**basis address**](/resources/glossary/#basis-address). At this point, the validator will also send back a validation receipt to the author.

These validation receipts helps the author's conductor keep initial track of how many other agents have validated and stored their data. The purpose is to help the conductor decide whether it needs to try sending it to more validators --- it'll keep trying until it collects enough receipts.

By default, an action must collect five validation receipts for each of its DHT operations before the author considers publishing to be complete. For application entry creation actions, you can override this by setting the [`required_validations`](/build/entries/#required-validations) field on the entry type.

!!! info Validation receipts might not reflect current DHT conditions
An author only receives validation receipts from the validating agents that they _published_ their DHT operations to. Other agents may receive and validation an operation from these original validators via **gossip**, but they won't won't send a validation receipt to the original author in this case. <!-- TODO: this behavior will change in 0.5 -->This means the operation might currently be enjoying better saturation than the author is aware of. The original validators might also have stopped participating in the network. So it's best to treat validation receipts as a **very rough measure of the DHT availability of authored data in the first few minutes after publishing**.
!!!

## Get validation receipts

To get validation receipts for an action that an agent has authored, use the [`get_validation_receipts`](https://docs.rs/hdk/latest/hdk/validation_receipt/fn.get_validation_receipts.html) host function. It takes an input consisting of the action hash and returns a result containing a vector of [`ValidationReceiptSet`](https://docs.rs/hdk/latest/hdk/prelude/struct.ValidationReceiptSet.html) values. Each of these items corresponds to one of the operations produced from the action and gives the receipts collected so far for that operation.

This example gives a simple yes/no answer to whether an action's operations have been published to the DHT in a sufficient amount.

This function could be used by the front end to warn a user that their peers might not yet be able to see their most recent database contributions.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn has_action_been_fully_published(action_hash: ActionHash) -> ExternResult<bool> {
    let validation_receipt_sets = get_validation_receipts(GetValidationReceiptsInput { action_hash })?;
    let is_fully_published = validation_receipt_sets
        .iter()
        .all(|set_for_op| set_for_op.receipts_complete);
    Ok(is_fully_published)
}
```

But publishing isn't an all-or-nothing event; it happens over time. Here's an example that gives more nuanced feedback on publishing progress.

<!-- TODO/FIXME: currently this function will give inaccurate results. Fix this if https://github.com/holochain/holochain/issues/4861 gets resolved -->

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn calculate_publish_progress_score(action_hash: ActionHash) -> ExternResult<f32> {
    let validation_receipt_set = get_validation_receipts(GetValidationReceiptsInput { action_hash })?;

    // First figure out how many receipts we need to collect.

    // The default expectation is five receipts per op. Note that, if this is
    // an app entry creation action and you've set `required_validations` to
    // something other than 5 for the entry type, this will give an
    // inaccurate score.
    let expected_op_receipt_count = 5;

    // The number of ops varies by the action; the return value of
    // `get_validation_receipts` set will have one element per op type for
    // the action type, even if there are no receipts collected for the given
    // op type.
    let number_of_ops_for_this_action = validation_receipt_set.len();

    // The number of total receipts we expect is the number of expected
    // receipts per op multiplied by the number of ops.
    let number_of_expected_receipts = expected_op_receipt_count * number_of_ops_for_this_action;

    // Find out how many receipts we've collected across all ops.
    let total_receipts_collected = validation_receipt_set
        .iter()
        .fold(0, |acc, set_for_op| acc + set_for_op.receipts.len());

    // Calculate the score, which will be the number of receipts we've
    // collected divided by the number of receipts we expect to have.
    Ok(total_receipts_collected as f32 / number_of_expected_receipts as f32)
}
```

!!! Validation receipts are only available in the author's conductor
Only the conductor hosting the agent who authored an action will get the validation receipts. That means that only the authoring cell, _and other cells with the same DNA on the same conductor_, will be able to access them with `get_validation_receipts`.
!!!

## Reference

* [`hdk::validation_receipt::get_validation_receipts`](https://docs.rs/hdk/latest/hdk/validation_receipt/fn.get_validation_receipts.html)
* [`holochain_zome_types::validate::ValidationReceiptSet`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/validate/struct.ValidationReceiptSet.html)
* [`holochain_zome_types::validate::ValidationReceiptInfo`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/validate/struct.ValidationReceiptInfo.html)

## Further reading

* [Build Guide: Validation](/build/validation/)
* [Build Guide: DHT Operations](/build/dht-operations/)
* [Core Concepts: DHT](/concepts/4_dht/)
* [Core Concepts: Validation](/concepts/7_validation/)