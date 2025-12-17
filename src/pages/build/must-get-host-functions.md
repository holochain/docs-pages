---
title: "must_get_* Host Functions"
---

::: intro
Successful [validation](/build/validation) depends on yielding the same deterministic true/false result for a given DHT operation, no matter who validates it and when. To safely get DHT dependencies in validation, you must use the **`must_get_*`** host functions. Any other DHT retrieval functions, such as `get_links` or `get_details`, can give varying values depending on the current state of the metadata at an address and aren't available to validation callbacks.
:::

The `must_get_*` host functions can only retrieve addressable content, not data whose state can change over time such as a vector of links. They return only the requested data and ignore any metadata that may change its state, such as links, updates, and deletes.

If a `must_get_*` function can't retrieve the data, it isn't considered a validation failure. Instead, it causes validation to terminate early with [`ValidateCallbackResult::UnresolvedDependencies`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.ValidateCallbackResult.html#variant.UnresolvedDependencies), which signals to the conductor that validation should be retried in the hope that the data will be available later.

## `must_get_action` and `must_get_entry`

To get a single entry, use [`must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html). To get a single action, use [`must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html).

!!! info Results aren't guaranteed to be valid
Neither of these functions verify that the retrieved data is valid. If you need this assurance, use an action hash as as a dependency's identifier and retrieve it with [`must_get_valid_record`](#must-get-valid-record).
!!!

This example validates a [movie loan acceptance](/build/identifiers/#in-dht-data), making sure that it's valid against the original loan offer.

```rust
use hdi::prelude::*;
use core::time::Duration;

pub fn validate_create_movie_loan_acceptance(
    action: EntryCreationAction,
    movie_loan_acceptance: MovieLoanAcceptance,
) -> ExternResult<ValidateCallbackResult> {
    // Get the referenced offer action. We'll need some of the data in there.
    let offer_action = must_get_action(movie_loan_acceptance.offer_hash.clone())?.hashed.content;
    let correct_offer_action: EntryCreationAction = offer_action
        .clone()
        .try_into()
        .map_err(|_| wasm_error!("Referenced loan offer must be an entry creation action"))?;
    // Get the entry data; we'll need some of it too.
    let maybe_offer_entry = must_get_entry(correct_offer_action.entry_hash().clone())?.content;
    let offer_entry = crate::MovieLoanOffer::try_from(maybe_offer_entry)
        .map_err(|_| wasm_error!("Referenced data was not a loan offer"))?;

    // Now that we've got the entry, we can check that it's a valid offer for
    // this acceptance action.
    // First check that it was issued to the agent who's accepting it.
    if offer_entry.offer_to != action.author().clone() {
        return Ok(ValidateCallbackResult::Invalid("Referenced loan offer wasn't issued to accepting agent".into()));
    }

    // Next, check that it didn't expire before the agent accepted it.
    if offer_action.timestamp().saturating_add(&Duration::new(offer_entry.offer_expires_seconds.into(), 0)) < action.timestamp().clone() {
        return Ok(ValidateCallbackResult::Invalid("Loan offer has expired".into()));
    }

    Ok(ValidateCallbackResult::Valid)
}
```

## `must_get_agent_activity`

You can query an agent's existing source chain records with [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html). This function's [filter struct](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/chain/struct.ChainFilter.html) and return value remove non-determinism --- it only lets you select a contiguous, bounded slice of a source chain, and doesn't return any information about the validity of the actions in that slice or the chain as a whole. It retrieves the entire slice from a single authority, so it's best to use it only when validating a [`RegisterAgentActivity` operation](/build/dht-operations/#register-agent-activity), because the validating authority will already have that data locally.

This host function lets you enforce rules based on an agent's history, such as limiting their rate of posts based on timestamp or ensuring they have sufficient account balance to make a transaction. You can specify a range of actions, starting at a given chain point and working backwards, and it'll give you a vector of [`RegisterAgentActivity` operations](/build/dht-operations/#register-agent-activity), inclusive of the start and end points.

This example creates a custom helper function to run when a `RegisterAgentActivity` operation is being validated. It makes sure an agent may only create or edit ten movie entries per minute, to prevent spamming. <!-- TODO: rewrite this if https://github.com/holochain/holochain/pull/5015 (chain filters until timestamp) is accepted -->

```rust
use hdi::prelude::*;
use core::time::Duration;

// This is a simplification of the scaffolded `validate` callback.
#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    match op.flattened::<EntryTypes, LinkTypes>()? {
        // Skipping the boilerplate until we reach...
        FlatOp::RegisterAgentActivity(agent_activity) => match agent_activity {
            OpActivity::CreateAgent { agent, action } => {
                // Skipping more boilerplate...
            }
            // This is where we call our custom helper function:
            OpActivity::CreateEntry{ app_entry_type: _, action: _ }
            | OpActivity::UpdateEntry{ original_action_hash: _, original_entry_hash: _, app_entry_type: _, action: _ } => {
                let Op::RegisterAgentActivity(raa) = op.clone() else {
                    unreachable!("The op must be a RegisterAgentActivity op");
                };
                validate_not_spamming_movies(raa.action.hashed.content)
            }
            // Back to the boilerplate...
            _ => Ok(ValidateCallbackResult::Valid),
        },
    }
}

pub fn validate_not_spamming_movies(action: Action) -> ExternResult<ValidateCallbackResult> {
    // Query the source chain, skipping the action we're currently validating.
    let Some(prev_action_hash) = action.prev_action() else {
        unreachable!("This is a Create or Update action, which always has a prev_action_hash");
    };

    // Select all chain operations backwards to 60 seconds before the current
    // record was written.
    let take_until_timestamp = action.timestamp().saturating_sub(&Duration::new(60, 0));
    let result = must_get_agent_activity(
        action.author().clone(),
        ChainFilter::new(prev_action_hash.clone())
            .until_timestamp(take_until_timestamp)
    )?;

    // The result is a vector of `RegisterAgentActivity` DHT ops.
    // Let's convert it into a count of the movie creation actions written in
    // the last minute.
    let movie_entry_def = &EntryType::App(UnitEntryTypes::Movie.try_into()?);
    let movies_written_within_window = result
        .iter()
        // Select only the actions that write a movie entry (this naturally
        // filters out anything that isn't an entry creation action, because
        // only they have entry types).
        .filter(|o| o.action.hashed.content.entry_type() == Some(movie_entry_def))
        // Finally, count the matching actions.
        .count();

    if movies_written_within_window >= 10 {
        Ok(ValidateCallbackResult::Invalid("Went over 10 movie creates/edits in a minute".into()))
    } else {
        Ok(ValidateCallbackResult::Valid)
    }
}
```

!!! info Timestamps are self-reported
An agent running a compromised conductor can self-report any timestamp they like in an action, even future times, making it possible to cheat this basic spam protection.
!!!

!!! info Querying the source chain can be expensive!
Try to design your validation so that validators don't have to retrieve the corresponding entries for a `must_get_agent_activity` result set. Even if the source chain is local, the entries are likely to not be, and every `must_get_entry` call may mean another network request. If you must retrieve entries, design your data structures to enable as much pre-filtering and as few entry retrievals as possible.
!!!

## `must_get_valid_record`

[`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html) tries to get a record, and will fail with `ValidateCallbackResult::UnresolvedDependencies` if the record is marked invalid by any validators, even if it can be found. This makes [inductive validation](/build/validate-callback/#inductive-validation) possible.

Anywhere you use `must_get_action`, you can also use `must_get_valid_record`, with the added benefit that you get the action and entry data at the same time if the action is an [entry creation action](/build/entries/#entries-and-actions):

```rust
use hdi::prelude::*;

// You can easily change logic that uses `must_get_action`...
fn check_that_action_exists(action_hash: ActionHash) -> ExternResult<ValidateCallbackResult> {
    let _action_of_unknown_validity = must_get_action(action_hash)?;
    Ok(ValidateCallbackResult::Valid)
}

// ... into logic that uses `must_get_valid_record`, and get extra
// functionality for free.
fn check_that_action_exists_and_is_valid_and_has_valid_public_app_entry(action_hash: ActionHash) -> ExternResult<ValidateCallbackResult> {
    let valid_record = must_get_valid_record(action_hash)?;
    let _valid_action = valid_record.action();
    match valid_record.entry() {
        // If you expect your action to be an entry creation action,
        // the `.entry()` method is a great way to check that the entry
        // exists and get its data all in one go.
        RecordEntry::Present(_) => Ok(ValidateCallbackResult::Valid),
        _ => Ok(ValidateCallbackResult::Invalid("action was supposed to create a public entry, but no entry was published".into()))
    }
}
```

!!! info This may not catch all validation failures
`must_get_valid_record` checks for validation success or failure on the [`StoreRecord` DHT operation](/build/dht-operations/#store-record). Validation code for other DHT operations produced from the same action (such as [`RegisterUpdate`](/build/dht-operations/#register-update) or [`RegisterDeleteLink`](/build/dht-operations/#register-delete-link)) may have failed, but will not reflect on the record's validity. <!-- TODO(upgrade): change this when the data model is changed in 0.7 -->

This is because of the distributed nature of validation. We know this can be surprising behavior, and we're looking at improving the usability of our state model. In the meantime, if you want strong guarantees from `must_get_valid_record`, put all of your validation code into the path for the `StoreRecord` operation. Depending on your data model, this may force costly network gets, but it'll ensure that `must_get_valid_record` truly represents the validity of the record from all perspectives.

Also keep in mind that every failed validation produces a [**warrant**](/resources/glossary/#warrant), which is delivered to the [**agent activity**](/resources/glossary/#agent-activity) validators, or the peers responsible for validating the author's source chain. So when an agent uses `get_agent_activity` or `must_get_agent_activity`, they'll receive (and remember) any warrants from all operations for the matching records, then automatically block the author. <!-- TODO(upgrade): This may change in a 'soft' way with 0.7 as well --> This means you can shift bad-actor discovery to the moment when an honest agent retrieves invalid data, rather than when they try to build their own data on top of it.
!!!

## Reference

* [HDI docs: data validation](https://docs.rs/hdi/latest/hdi/#data-validation)
* [`hdi::entry::must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html)
* [`hdi::chain::must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html)
* [`hdi::entry::must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html)
* [`hdi::entry::must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html)

## Further reading

* [Core Concepts: Validation](/concepts/7_validation/)* [Build Guide: Validation](/build/validation/)
* [Build Guide: `validate` Callback](/build/validate-callback/)