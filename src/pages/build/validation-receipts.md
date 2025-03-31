---
title: "Validation Receipts"
---

::: intro
An agent can get a sense of the DHT availability of their data by asking their conductor for the **validation receipts** it's collected. These receipts are created by the peers that the agent has sent their [**DHT operations**](/build/dht-operations/) to as an acknowledgement of valid data.
:::

As described in the [DHT operations](/build/dht-operations/) page, each action that an agent authors is turned into a set of DHT operations that are sent to other agents around the network for validation. If an operation is found to be valid, it'll transform the state of the DHT at the operation's [**basis address**](/resources/glossary/#basis-address). At this point, the validator will also send back a validation receipt to the author.

!!! info Only the author gets validation receipts
Only the agent who authored an action and published the DHT operations produced from it will get the validation receipts.
!!!

These validation receipts helps the author's conductor keep track of how fully their data has 'saturated' into the DHT --- that is, how many other agents know about it and can serve it up to anyone who asks for it. The purpose is to help the conductor decide whether it needs to try publishing it to more peers --- it'll keep trying until it collects the number of receipts specified in the [`required_validations` argument](/build/entries/#required-validations) passed to the `entry_type` macro (default is 5).

## Things to keep in mind with validation receipts

A DHT is an [**eventually consistent**](https://en.wikipedia.org/wiki/Eventual_consistency) database, which means that not every agent has the exact same up-to-date view of the shared data. This has some important consequences:

* Writing data isn't a "did or didn't happen" event. A state change lives on a gradient from "it didn't happen" to "everybody has seen and integrated it".
* This state changes over time; agents will keep on trying to publish their authored operations until they receive the number of receipts they expected.
* An author may not receive validation receipts in a timely manner if network conditions are poor.
* An operation may currently be enjoying better DHT saturation than its author is aware of, due to it being gossiped in its [neighborhood](/concepts/4_dht/#finding-peers-and-data-in-a-distributed-database).
* People are accustomed to centralized data stores in which everyone sees the same state at roughly the same time; it's helpful to translate the concept of eventual consistency into a user experience that people can easily understand.

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
                // Rejected is worse than abandoned.
                ValidationStatus::Abandoned =>
                    if acc == ValidationStatus::Rejected { acc }
                    else { status },
                // This should never happen, because actions are self-
                // validated before they're published.
                ValidationStatus::Rejected => status,
            }
        );

    Ok(worst_status)
}
```

This example calculates a saturation score for a given action; this could be used by the front end to indicate how likely it is that a user's changes will be seen by their peers if they turn off their computer.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn calculate_saturation_score(action_hash: ActionHash) -> ExternResult<f32> {
    let validation_receipt_set = get_validation_receipts(GetValidationReceiptsInput { action_hash })?;

    // Now calculate the score, which will be the number of receipts we have
    // divided by the number of receipts we expected to have.
    // First we need to know how many we expect to have.
    // This is the default number of required receipts for a given action.
    // You may want to change this to reflect the entry type you're checking on.
    let full_saturation_receipt_count = 5;
    // The number of ops varies by the action; the receipt set will have one
    // element per op type for the action type, even if there are no receipts
    // collected for a given op type.
    let number_of_ops_for_this_action = validation_receipt_set.len();
    let number_of_expected_receipts = full_saturation_receipt_count * number_of_ops_for_this_action;

    let total_receipts_collected = validation_receipt_set
        .iter()
        .fold(0, |acc, set_for_op| acc + set_for_op.receipts.len());

    Ok(total_receipts_collected as f32 / number_of_expected_receipts as f32)
}
```

## Reference

* [`hdk::validation_receipt::get_validation_receipts`](https://docs.rs/hdk/latest/hdk/validation_receipt/fn.get_validation_receipts.html)
* [`holochain_zome_types::validate::ValidationReceiptSet`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/validate/struct.ValidationReceiptSet.html)
* [`holochain_zome_types::validate::ValidationReceiptInfo`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/validate/struct.ValidationReceiptInfo.html)

## Further reading

* [Build Guide: Validation](/build/validation/)
* [Build Guide: DHT Operations](/build/dht-operations/)
* [Core Concepts: DHT](/concepts/4_dht/)
* [Core Concepts: Validation](/concepts/7_validation/)
* [Wikipedia: Eventual Consistency](https://en.wikipedia.org/wiki/Eventual_consistency)
* [Local-first software: You own your data, in spite of the cloud](https://www.inkandswitch.com/local-first/), a case study by Ink & Switch that looks at the user experience of distributed software