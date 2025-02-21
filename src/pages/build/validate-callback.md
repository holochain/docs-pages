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

Here are some useful examples that show you how to use the stub functions, imagining you've scaffolded the `Director` and `Movie` entry types from the [Entries](/build/entries/#define-an-entry-type) and the `MovieLoan` entry type from the [Identifiers](/build/identifiers/) page, along with a [global collection](/build/links-paths-and-anchors/#scaffold-a-simple-collection-anchor) for all `Director` entries.

### Stub functions for entries

These functions can be found in the file `dnas/<dna>/zomes/integrity/<zome>/src/<entry>.rs`.

#### `validate_create_<entry>`

In this function you can write rules for the contents of your entries and their dependencies. You can also write rules for the actions that write them, which means you can create rules for write privileges. (Note that it's called for both kinds of [`EntryCreationAction`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.EntryCreationAction.html) --- `Create` and `Update`.)

This example checks that a movie is within [sensible bounds](https://en.wikipedia.org/wiki/Roundhay_Garden_Scene).

```rust
use hdi::prelude::*;

pub fn validate_create_movie(
    _action: EntryCreationAction,
    movie: Movie,
) -> ExternResult<ValidateCallbackResult> {
    // Note that converting a `&str` to a `Timestamp` requires you to list
    // `kitsune_p2p_timestamp` as a dependency in your `Cargo.toml`.
    if movie.release_date < "1888-10-14".try_into().unwrap() {
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
    let director_entry =  must_get_entry(movie.director_hash)?;
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

pub fn validate_update_movie_loan(
    action: Update,
    _movie_loan: MovieLoan,
    original_action: EntryCreationAction,
    _original_movie_loan: MovieLoan,
) -> ExternResult<ValidateCallbackResult> {
    if action.author != original_action.author().clone() {
        return Ok(ValidateCallbackResult::Invalid("Agents can only update their own MovieLoan records.".to_string()));
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

And this example once again only allows people to delete movie loans they created:

```rust
use hdi::prelude::*;

pub fn validate_delete_movie_loan(
    action: Delete,
    original_action: EntryCreationAction,
    _original_movie_loan: MovieLoan,
) -> ExternResult<ValidateCallbackResult> {
    if action.author != original_action.author().clone() {
        return Ok(ValidateCallbackResult::Invalid("Agents can only delete their own MovieLoan records.".to_string()));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

You can find other stub functions in that file for links that point to the most recent update (if you [chose that option](/get-started/3-forum-app-tutorial/#scaffold-most-recent-update-link) when you scaffolded the entry type), links that manage collections of entries, and backlinks from entries to entries that depend on them.

### `validate_agent_joining`

Use this function to validate the [**membrane proof**](/build/genesis-self-check-callback/#membrane-proof-a-joining-code-for-a-network). Note that this is different from `genesis_self_check`, in that it's called from the `validate` function so it can access DHT data.

This example implements a simple invite code for a network that people can invite their friends to join. All that's required is the presence of an 'invite' action on the DHT, whose hash becomes the invite code. (It's not a very secure pattern; please don't duplicate this in high-security hApps.) As a bonus, it shows a good pattern where the code for basic pre-validation is shared with `genesis_self_check`.

```rust
use hdi::prelude::*;
use base64::prelude::*;

pub fn validate_agent_joining(
    _agent_pub_key: AgentPubKey,
    membrane_proof: &Option<MembraneProof>
) -> ExternResult<ValidateCallbackResult> {
    let membrane_proof: Option<Vec<u8>> = membrane_proof
        .to_owned()
        .map(|b| b.bytes().clone());
    validate_invite_code_format(membrane_proof.clone())?;
    let Ok(invite_code_action_hash) = decode_invite_code(membrane_proof.unwrap()) else {
        return Ok(ValidateCallbackResult::Invalid("Couldn't decode membrane proof into invite code hash".into()));
    };

    must_get_valid_record(invite_code_action_hash)?;
    // There are more checks we ought to do here, like make sure it's an
    // entry creation action of a type called `invite`.
    Ok(ValidateCallbackResult::Valid)
}

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    let Some(membrane_proof) = data.membrane_proof else {
        return Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()));
    };

    // Accept a string, because this is something a user can paste into a form
    // field.
    let maybe_signature: Result<Signature, _> = std::str::from_utf8(membrane_proof.bytes())
            .map_err(|_| "Couldn't parse membrane proof into string")
        // Expect it to be Base64-encoded; convert it into raw bytes.
        .and_then(|s| BASE64_STANDARD.decode(s)
            .map_err(|_| "Couldn't Base64-decode membrane proof"))
        .and_then(|b| b.try_into()
            .map_err(|_| "Couldn't deserialize membrane proof into signature"));

    match maybe_signature {
        Err(e) => Ok(ValidateCallbackResult::Invalid(format!("Couldn't decode membrane proof into joining certificate because '{}'", e).into())),
        Ok(signature) => {
            // Check the certificate against the signing authority.
            let dna_props = DnaProperties::try_from_dna_properties()?;
            let cert_is_valid = verify_signature(
                dna_props.authorized_joining_certificate_issuer,
                signature,
                data.agent_key
            )?;
            if cert_is_valid {
                return Ok(ValidateCallbackResult::Valid);
            } else {
                return Ok(ValidateCallbackResult::Invalid("Joining certificate wasn't valid. Please try entering it again or asking the certificate issuer for a new one.".into()));
            }
        }
    }
}
```

<!-- TODO: Write about inductive validation when it's not broken https://github.com/holochain/holochain/issues/4669 -->

## Reference

* [`holochain_integrity_types::op::Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html)
* [`holochain_integrity_types::action::AgentValidationPkg`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/enum.Action.html#variant.AgentValidationPkg)
* [`holochain_integrity_types::genesis::GenesisSelfCheckData`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [`holochain_integrity_types::validate::ValidateCallbackResult`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [HDI docs: data validation](https://docs.rs/hdi/latest/hdi/#data-validation)
* [`must_get_action`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_action.html)
* [`must_get_agent_activity`](https://docs.rs/hdi/latest/hdi/chain/fn.must_get_agent_activity.html)
* [`must_get_entry`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_entry.html)
* [`must_get_valid_record`](https://docs.rs/hdi/latest/hdi/entry/fn.must_get_valid_record.html)

## Further reading

* [Build Guide: Validation](/build/validation/)
* [Build Guide: `genesis_self_check` Callback](/build/genesis-self-check-callback)
* [Core Concepts: Validation](/concepts/7_validation/)