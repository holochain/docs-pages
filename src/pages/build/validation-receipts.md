---
title: "Validation Receipts"
---

::: intro
An agent can get a rough sense of the DHT availability of their data by checking how many **validation receipts** it's collected. These receipts are created by the peers that the agent has **published** their [**DHT operations**](/build/dht-operations/) to as a confirmation that they have validated the data and are now serving it.
:::

As described in the [DHT operations](/build/dht-operations/) page, each action that an agent authors is turned into a set of DHT operations that are published to other agents in the network for validation. If an operation is found to be valid, it'll transform the state of the DHT at the operation's [**basis address**](/resources/glossary/#basis-address). At this point, the validator will also send back a validation receipt to the author.

These validation receipts helps the author's conductor keep track of how fully their data has been published to the DHT --- that is, how many other agents they have published to and can serve it up to anyone who asks for it. The purpose is to help the conductor decide whether it needs to try publishing it to more peers --- it'll keep trying until it collects the number of receipts specified in the [`required_validations` argument](/build/entries/#required-validations) passed to the `entry_type` macro (default is 5).

!!! info Validation receipts are only delivered for publish attempts
An author only receives validation receipts from the agents that they _published_ their DHT operations to. Agents may receive an operation from another agent via **gossip**, but they won't won't send a validation receipt to the original author in this case. This means the operation might currently be enjoying better saturation than the author is aware of.
!!!

## Get validation receipts

To get validation receipts for an action that an agent has authored, use the [`get_validation_receipts`](https://docs.rs/hdk/latest/hdk/validation_receipt/fn.get_validation_receipts.html) host function. It takes an input consisting of the action hash and returns a result containing a vector of [`ValidationReceiptSet`](https://docs.rs/hdk/latest/hdk/prelude/struct.ValidationReceiptSet.html) values. Each of these items corresponds to one of the operations produced from the action and gives details on that operation's DHT status from the perspective of the author.

This example checks to see if any validator has abandoned or rejected an operation for an action:

```rust
use hdk::prelude::*;

fn check_validation_status(action_hash: ActionHash) -> ExternResult<ValidationStatus> {
    let validation_receipt_set = get_validation_receipts(GetValidationReceiptsInput { action_hash })?;

    let worst_status = validation_receipt_set
        .iter()
        .flat_map(
            |set| set.receipts.iter()
                .map(|receipt| receipt.validation_status)
        )
        .fold(
            ValidationStatus::Valid,
            |acc, status| match status {
                ValidationStatus::Valid => acc,
                // Validation can be abandoned if dependencies can't be fetched.
                ValidationStatus::Abandoned =>
                    // Rejected is worse than abandoned.
                    // But it also should never happen if the agent is self-
                    // validating their DHT ops before publishing them (except
                    // in the case of an invalid membrane proof -- see
                    // https://developer.holochain.org/build/genesis-self-check-callback/#the-need-for-basic-pre-validation )
                    if acc == ValidationStatus::Rejected { acc }
                    else { status },
                ValidationStatus::Rejected => status,
            }
        );

    Ok(worst_status)
}
```

This example imagines a 'publish progress score' for authored data; this could be used by the front end to warn a user that their peers might not yet be able to see their most recent database contributions. This can be used to help users who are accustomed to centralized databases understand the  [**eventually consistent**](https://en.wikipedia.org/wiki/Eventual_consistency) nature of the DHT more easily. {#publish-progress-score}

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn calculate_publish_progress_score(action_hash: ActionHash) -> ExternResult<f32> {
    let validation_receipt_set = get_validation_receipts(GetValidationReceiptsInput { action_hash })?;

    // Now calculate the score, which will be the number of receipts we have
    // divided by the number of receipts we expected to have.
    // First we need to know how many we expect to have.
    // This is the default number of required receipts for a given action.
    // For app entries, the default can be changed and can be gotten with
    // the `dna_info` host function; see
    // https://developer.holochain.org/build/entries/#required_validations
    let expected_op_receipt_count = 5;
    // The number of ops varies by the action; the receipt set will have one
    // element per op type for the action type, even if there are no receipts
    // collected for a given op type.
    let number_of_ops_for_this_action = validation_receipt_set.len();
    let number_of_expected_receipts = expected_op_receipt_count * number_of_ops_for_this_action;

    let total_receipts_collected = validation_receipt_set
        .iter()
        .fold(0, |acc, set_for_op| acc + set_for_op.receipts.len());

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