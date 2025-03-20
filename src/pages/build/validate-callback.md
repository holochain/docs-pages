---
title: "Validate callback"
---

::: intro
The `validate` callback implements the core of your data model's logic. It receives **DHT operations**, which contain an [action](/build/working-with-data/#entries-actions-and-records-primary-data) and sometimes an [entry](/build/entries), and checks them for correctness. It can not only validate the correctness of the data itself, but can also check the correctness of the record in the context of the [source chain](/concepts/3_source_chain/) and pull in dependencies from elsewhere in the [DHT](/concepts/4_dht/).
:::

## Define a `validate` callback

A `validate` callback takes an input argument of [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) and returns a [`ValidateCallbackResult`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

Validating an op can have one of three outcomes: {#validation-outcomes}

1. `ValidateCallbackResult::Valid` means that validation succeeded.
2. `ValidateCallbackResult::Invalid(String)` carries information about the validation failure for debugging.
3. <code>ValidateCallbackResult::UnresolvedDependencies([UnresolvedDependencies](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.UnresolvedDependencies.html))</code> means that validation couldn't finish because the required dependencies couldn't be fetched from the DHT.

Outcomes 1 and 2 are definitive and the op won't be validated again. Outcome 3, which happens automatically when a call to any of the [`must_get_*` functions](https://docs.rs/hdi/latest/hdi/entry/index.html#functions) yields no data, instructs Holochain to try running the op through validation later in the hope that it can retrieve the required dependencies. (It'll give up retrying after some time, and will resume next time Holochain restarts.)

The simplest `validate` callback approves everything:

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
```

We show it here, not because it's useful, but so you can see the function's signature. Even less useful is one that does the opposite:

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid("I reject everything".into()))
}
```

Useless as it is, there is something worth noting here. We return an `Ok` even though validation failed. That's because **`Err` should be reserved for true failures** such as the ones returned by host functions.

## Create boilerplate code with the scaffolding tool

DHT operations are an advanced concept so we won't cover them here. (You can read about them on the [DHT operations](/build/dht-operations/) page if you need a deeper understanding for designing highly secure or performant validation.) Instead, it's more useful to think of validating an [**action**](/build/working-with-data/#entries-actions-and-records-primary-data).

Fortunately, the scaffolding tool generates `validate` and [`genesis_self_check`](/build/genesis-self-check-callback/) callbacks that call out to stub functions that you can fill in with your own validation logic.

Here are some useful examples that show you how to use the stub functions, imagining you've scaffolded the `Director` and `Movie` entry types from the [Entries](/build/entries/#define-an-entry-type) and the `MovieLoanOffer` entry type from the [Identifiers](/build/identifiers/) page, along with a [global collection](/build/links-paths-and-anchors/#scaffold-a-simple-collection-anchor) for all `Director` entries.

### Stub functions for entries

These functions can be found in the file `dnas/<dna>/zomes/integrity/<zome>/src/<entry>.rs`.

#### `validate_create_<entry>`

In this function you can write rules for the contents of your entries and their dependencies. You can also write rules for the actions that write them, which means you can create rules for write privileges. (Note that it's called for both kinds of [`EntryCreationAction`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.EntryCreationAction.html) --- `Create` and `Update`.)

This example checks that a movie's release date is within sensible bounds.

```rust
use hdi::prelude::*;

// 14 October 1888
const EARLIEST_MOVIE_TIMESTAMP: Timestamp = Timestamp(-2562883200_000_000);

pub fn validate_create_movie(
    _action: EntryCreationAction,
    movie: Movie,
) -> ExternResult<ValidateCallbackResult> {
    if movie.release_date < EARLIEST_MOVIE_TIMESTAMP {
        return Ok(ValidateCallbackResult::Invalid("The movie's release date is earlier than the oldest known film.".into()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

This example checks that a director entry referenced by a movie exists.

```rust
use hdi::prelude::*;

pub fn validate_create_movie(
    _action: EntryCreationAction,
    movie: Movie,
) -> ExternResult<ValidateCallbackResult> {
    // Just call the function, and Holochain will handle the
    // `UnresolvedDependencies` outcome for you.
    let director_entry = must_get_entry(movie.director_hash)?;
    // Try to turn it into an entry of the right type.
    match crate::Director::try_from(director_entry) {
        Ok(_) => Ok(ValidateCallbackResult::Valid),
        Err(_) => Ok(ValidateCallbackResult::Invalid("Referenced entry was not actually a Director entry".into())),
    }
}
```

#### `validate_update_<entry>`

This function receives the original entry and its creation action along with the update. You can use it to compare differences between the two entries, or you can use it to enforce write permissions, such as only allowing the original author to update a record:

```rust
use hdi::prelude::*;

pub fn validate_update_movie_loan_offer(
    action: Update,
    _movie_loan_offer: MovieLoanOffer,
    original_action: EntryCreationAction,
    _original_movie_loan_offer: MovieLoanOffer,
) -> ExternResult<ValidateCallbackResult> {
    if action.author != original_action.author().clone() {
        return Ok(ValidateCallbackResult::Invalid("Agents can only update their own MovieLoanOffer records.".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

#### `validate_delete_<entry>`

Like the previous function, this function receives the original entry and its creation action. This example prevents `Director` entries from being deleted:

```rust
use hdi::prelude::*;

pub fn validate_delete_director(
    _action: Delete,
    _original_action: EntryCreationAction,
    _original_director: Director,
) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Invalid(
        "Directors cannot be deleted".to_string(),
    ))
}
```

And this example once again only allows people to delete movie loan offers they created:

```rust
use hdi::prelude::*;

pub fn validate_delete_movie_loan_offer(
    action: Delete,
    original_action: EntryCreationAction,
    _original_movie_loan_offer: MovieLoanOffer,
) -> ExternResult<ValidateCallbackResult> {
    if action.author != original_action.author().clone() {
        return Ok(ValidateCallbackResult::Invalid("Agents can only delete their own MovieLoanOffer records.".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

You can find other stub functions in that file for links that point to the most recent update (if you [chose that option](/get-started/3-forum-app-tutorial/#scaffold-most-recent-update-link) when you scaffolded the entry type), links that manage collections of entries, and backlinks from entries to entries that depend on them.

### `validate_agent_joining`

Use this function to validate the [**membrane proof**](/build/genesis-self-check-callback/#membrane-proof-a-joining-code-for-a-network). Note that this is different from `genesis_self_check`, in that it's called from the `validate` function so it can access DHT data.

This example implements a simple invite code for a network that people can invite their friends to join. All that's required is the presence of an 'invite' action on the DHT, whose hash becomes the invite code. Some of the logic is shared with `genesis_self_check`.

!!! info Inductive validation {#inductive-validation}
This example uses a host function called [`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html) to do what we call **inductive validation**. This technique speeds up validation of data with large dependency trees by recognizing that dependencies will already have been validated, and any dependencies of those dependencies will also have been subjected to the same logic by their validators, and so on.

In small networks, this is perfectly secure, as the dependencies will have been validated by the same agent. As networks grow, it depends on the percentage of honest validators, although it'd take a [large number of dishonest peers](https://blog.holochain.org/satoshi-nakamoto-and-the-fate-of-our-planet-2/#consensus-an-irrelevant-starting-point) to threaten the safety of this technique.
!!!

```rust
use hdi::prelude::*;

#[hdk_entry_helper]
pub struct Invitation(AgentPubKey);

#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
#[hdk_entry_types]
#[unit_enum(UnitEntryTypes)]
pub enum EntryTypes {
    Invitation(Invitation),
}

pub fn validate_agent_joining(
    agent_pub_key: AgentPubKey,
    membrane_proof: &Option<MembraneProof>
) -> ExternResult<ValidateCallbackResult> {
    let membrane_proof: Option<Vec<u8>> = membrane_proof
        .to_owned()
        .map(|b| b.bytes().clone());

    // Check that the invite code is an action hash _and_ get the action hash
    // so that we can retrieve the invitation.
    validate_invite_code_format(membrane_proof.clone())?;
    let Ok(invite_code_action_hash) = decode_invite_code(membrane_proof.unwrap()) else {
        return Ok(ValidateCallbackResult::Invalid("Couldn't decode membrane proof into invite code hash".into()));
    };

    // Try to get the invitation.
    let record = must_get_valid_record(invite_code_action_hash)?;
    match Invitation::try_from(record) {
        Ok(invite_code) => {
            if invite_code.0 == agent_pub_key {
                return Ok(ValidateCallbackResult::Valid);
            } else {
                return Ok(ValidateCallbackResult::Invalid("Invitation doesn't match your agent key".into()));
            }
        }
        _ => Ok(ValidateCallbackResult::Invalid("The referenced hash wasn't an invitation".into())),
    }
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    // Only check that the invite code is an action hash.
    validate_invite_code_format(data.membrane_proof.map(|b| b.bytes().clone()))
}

fn decode_invite_code(invite_code: Vec<u8>) -> ExternResult<ActionHash> {
    // Try to convert the invite code from bytes to an action hash.
    let invite_code_action_hash = BASE64_STANDARD.decode(invite_code)
        .map_err(|e| wasm_error!(e.to_string()))
        .and_then(|c| String::from_utf8(c)
            .map_err(|e| wasm_error!(e.to_string())))
        .and_then(|c| ActionHashB64::from_b64_str(&c)
            .map_err(|e| wasm_error!(e.to_string())))
        .map_err(|e| wasm_error!(e.to_string()))?;
    Ok(invite_code_action_hash.into())
}

fn validate_invite_code_format(invite_code: Option<Vec<u8>>) -> ExternResult<ValidateCallbackResult> {
    match invite_code {
        Some(invite_code) => {
            match decode_invite_code(invite_code) {
                Ok(_) => Ok(ValidateCallbackResult::Valid),
                _ => Ok(ValidateCallbackResult::Invalid("Couldn't decode membrane proof into invite code hash".into())),
            }
        }
        None => Ok(ValidateCallbackResult::Invalid("Please supply an invite code.".into()))
    }
}
```

<!-- TODO: when deferred memproofs info is written, mention that the above pattern needs it. See commit 5ca238acce48a98419adaa205d4f930a86123c60 for sample text. -->

## Reference

* [`holochain_integrity_types::op::Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html)
* [`holochain_integrity_types::action::AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg)
* [`holochain_integrity_types::genesis::GenesisSelfCheckData`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [`holochain_integrity_types::validate::ValidateCallbackResult`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.ValidateCallbackResult.html)
* [HDI docs: data validation](https://docs.rs/hdi/latest/hdi/#data-validation)
* [`must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html)
* [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html)
* [`must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html)
* [`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html)

## Further reading

* [Build Guide: Validation](/build/validation/)
* [Build Guide: `genesis_self_check` Callback](/build/genesis-self-check-callback)
* [Core Concepts: Validation](/concepts/7_validation/)