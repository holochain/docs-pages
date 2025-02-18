---
title: "Callbacks and Lifecycle Hooks"
---

::: intro
A [cell](/concepts/2_application_architecture/#cell) can respond to various events in the life of a hApp by defining specially named **callbacks**, including **lifecycle hooks**. These functions may define and validate data, perform initialization tasks, respond to [remote signals](/concepts/9_signals), or follow up after successful writes.
:::

All of the callbacks must follow the [pattern for public functions](/build/zomes/#define-a-function) we introduced on the Zomes page. They must also have the specific input argument and return value types we describe below.

## Integrity zomes

Your [integrity zome](/build/zomes/#integrity) may define two callbacks, `validate` and `genesis_self_check`. These functions **cannot have side effects**; any attempt to write data will fail. They also cannot access data that changes over time or across agents, such as the current cell's [agent ID](/build/identifiers/#agent) or a collection of [links](/build/links-paths-and-anchors/) in the [DHT](/concepts/4_dht).

### Define a `validate` callback

In order to validate DHT data, you'll need to define a `validate` callback. It must take a single argument of type [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

The `validate` callback is called at two times:

1. When an agent tries to author an [action](/build/working-with-data/#entries-actions-and-records-primary-data), and
2. When an agent receives a [DHT operation](/concepts/4_dht/#a-cloud-of-witnesses) to store and serve as part of the shared database.

The nature of validation is out of scope for this page (we'll write a page on it soon), but here's a very basic example of a validation callback that approves everything: <!-- TODO: remove this example when the validation page is written -->

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}
```


### Define a `genesis_self_check` callback

If your network needs to control who can and can't join it, you can write your DNA to require a [**membrane proof**](/resources/glossary/#membrane-proof), a small chunk of bytes that the app receives from the user at installation time and stores on the source chain. You can then write validation rules for this record just like any other record.

There's one challenge with this: validation requires access to the network (a membrane proof may reference DHT data that contains a list of public keys authorized to grant access to newcomers, for instance), but the membrane proof is written at [**genesis**](/resources/glossary/#genesis-records) time when the cell doesn't have network access yet. So Holochain can't do the usual self-validation before publishing it.

This means someone could accidentally type or paste a malformed membrane proof and be rejected from the network. To guard against this, you can define a `genesis_self_check` function that runs at genesis time and checks the content of the membrane proof before it's written.

`genesis_self_check` must take a single argument of type [`GenesisSelfCheckData`](https://docs.rs/hdi/latest/hdi/prelude/type.GenesisSelfCheckData.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

Here's an example that checks that the membrane proof exists and is the right length: <!-- TODO: move this to the validation page too -->

```rust
use hdi::prelude::*;

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
        if membrane_proof.bytes().len() == 32 {
            return Ok(ValidateCallbackResult::Valid);
        }
        return Ok(ValidateCallbackResult::Invalid("Membrane proof is not the right length. Please check it and enter it again.".into()));
    }
    Ok(ValidateCallbackResult::Invalid("This network needs a membrane proof to join.".into()))
}
```

## Coordinator zomes

A [coordinator zome](/build/zomes/#coordinator) may define some callbacks: `init`, `post_commit`, and `recv_remote_signal`.

### Define an `init` callback

If you want to run setup tasks when the cell is being initialized, define a callback function called `init` in your coordinator zome. Holochain will call it after a cell has been created for the DNA containing the zome, following the order of coordinator zomes in the DNA's manifest, calling each zome's `init` in serial rather than calling them all in parallel.

!!! info `init` isn't called immediately on cell instantiation

This callback is called 'lazily'; that is, it's not called immediately after the cell has been instantiated. Instead, Holochain waits until the first zome function call is made, then calls `init` before calling the zome function.

This gives a participant's Holochain runtime a little bit of time to connect to other peers, which makes various things you might want to do in `init` more likely to succeed if they depend on data in the DHT.

You can force `init` to run eagerly by calling it as if it were a normal zome function. Note that it might fail with `UnresolvedDependencies` if it needs dependencies from the DHT. _You can only do this in Holochain 0.5 and newer._

!!!

Once `init` runs successfully for all coordinator zomes in a DNA, Holochain writes an [`InitZomesComplete` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.InitZomesComplete.html). That ensures that this callback isn't called again.

`init` takes no arguments and must return an [`InitCallbackResult`](https://docs.rs/hdk/latest/hdk/prelude/enum.InitCallbackResult.html) wrapped in an `ExternResult`. All zomes' `init` callbacks in a DNA must return a success result in order for cell initialization to succeed; otherwise any data written in these callbacks, along with the `InitZomesComplete` action, will be rolled back. _If any zome's init callback returns an `InitCallbackResult::Fail`, initialization will fail._ Otherwise, if any init callback returns an `InitCallbackResult::UnresolvedDependencies`, initialization will be retried at the next zome call attempt.

Here's an `init` callback that [links](/build/links-paths-and-anchors/) the [agent's ID](/build/identifiers/#agent) to the [DNA hash](/build/identifiers/#dna) as a sort of "I'm here" note. (It depends on a couple things being defined in your integrity zome; we'll show the integrity zome after this sample for completeness.)

```rust
use foo_integrity::{get_participant_registration_anchor_hash, LinkTypes};
use hdk::prelude::*;

#[hdk_extern]
pub fn init() -> ExternResult<InitCallbackResult> {
    let participant_registration_anchor_hash = get_participant_registration_anchor_hash()?;
    let AgentInfo { agent_latest_pubkey: my_pubkey, ..} = agent_info()?;
    create_link(
        participant_registration_anchor_hash,
        my_pubkey,
        LinkTypes::ParticipantRegistration,
        ()
    )?;

    Ok(InitCallbackResult::Pass)
}
```

Here's the `foo_integrity` zome code needed to make this work. It uses something called 'paths', which we [talk about elsewhere](/build/links-paths-and-anchors/#anchors-and-paths).

```rust
use hdi::prelude::*;

#[hdk_link_types]
pub enum LinkTypes {
    ParticipantRegistration,
}

pub fn get_participant_registration_anchor_hash() -> ExternResult<EntryHash> {
    Path(vec!["_participants_".into()]).path_entry_hash()
}
```

!!! info Why link the agent key to a well-known hash?

There's no such thing as a 'users table' in a Holochain DHT. The above pattern is an easy way for newcomers to register themselves as active participants so others can find them.

Note that this can create "hot spots" where some agents have a heavier data storage and network traffic burden than others. Read the [anchors and paths section under Links, Paths, and Anchors](/build/links-paths-and-anchors/#anchors-and-paths) for more info.

!!!

The `init` callback is often used to set up initial **capabilities**<!-- TODO: link-->, or access privileges to zome functions. You can see an example on the [Signals page](/build/signals/#remote-signals)

### Define a `recv_remote_signal` callback

<!-- TODO: move this to the signals page after it's written -->

Agents in a network can send messages to each other via [remote signals](/concepts/9_signals/#remote-signals). In order to handle these signals, your coordinator zome needs to define a `recv_remote_signal` callback. Remote signals get routed from the emitting coordinator zome on the sender's machine to a coordinator with the same name on the receiver's machine.

`recv_remote_signal` takes a single argument of any type you like. It must return an empty `ExternResult<()>`, as this callback is not called as a result of direct interaction from the local agent and has nowhere to pass a return value.

See the [Signals](/build/signals/#remote-signals) page for an example implementation.

### Define a `post_commit` callback

After a zome function call completes, any actions that it created are validated, then written to the cell's source chain if all actions pass validation. While the function is running, nothing has been stored yet, even if [CRUD](/build/working-with-data/#adding-and-modifying-data) function calls return `Ok` with the [hash of the newly written action](/build/identifiers/#the-unpredictability-of-action-hashes). (Read more about the [atomic, transactional nature](/build/zome-functions/#atomic-transactional-commits) of writes in a zome function call.) That means that any follow-up you do within the same function, like pinging other peers, might point to data that doesn't exist if the function fails at a later step.

If you need to do any follow-up, it's safer to do this in a lifecycle hook called `post_commit`, which is called after Holochain's [call-zome workflow](/build/zome-functions/#zome-function-call-lifecycle) successfully writes its actions to the source chain. (Function calls that don't write data won't trigger this event.)

`post_commit` must take a single argument of type <code>Vec&lt;<a href="https://docs.rs/hdk/latest/hdk/prelude/type.SignedActionHashed.html">SignedActionHashed</a>&gt;</code>, which contains all the actions the function call wrote, and it must return an empty `ExternResult<()>`. This callback **must not write any data**, but it may call other zome functions in the same cell or any other local or remote cell, and it may send local or remote signals.

`post_commit` also can't return an error. There should be no return type, and it should handle all errors it receives from other functions. It also must be tagged with `#[hdk_extern(infallible)]`.

Here's an example that uses `post_commit` to tell someone a movie loan has been created for them. It uses the integrity zome examples from [Identifiers](/build/identifiers/#in-dht-data).

```rust
use movie_integrity::{EntryTypes, Movie, MovieLoan, UnitEntryTypes};
use hdk::prelude::*;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum Signal {
    MovieLoanHasBeenCreatedForYou(ActionHash),
}

#[hdk_extern(infallible)]
pub fn post_commit(actions: Vec<SignedActionHashed>) {
    for action in actions.iter() {
        // Only handle cases where an entry is being created.
        if let Action::Create(_) = action.action() {
            if let Ok(movie_loan) = get_movie_loan(action.action_address().clone()) {
                send_remote_signal(
                    Signal::MovieLoanHasBeenCreatedForYou(action.action_address().clone()),
                    vec![movie_loan.lent_to]
                ).ok(); // suppress warning about unhandled `Result`
            }
        }
    }
}

#[hdk_extern]
pub fn recv_remote_signal(payload: Signal) -> ExternResult<()> {
    if let Signal::MovieLoanHasBeenCreatedForYou(action_hash) = payload {
        let movie_loan = get_movie_loan(action_hash)?;
        // Send the new movie loan data to the borrower's UI!
        emit_signal(Signal::MovieLoanHasBeenCreatedForYou(movie_loan))?;
    }
    Ok(())
}

fn get_movie_loan(action_hash: ActionHash) -> ExternResult<MovieLoan> {
    if let Some(record) = get(
        action_hash,
        GetOptions::network()
    )? {
        let maybe_movie_loan: Option<MovieLoan> = record.entry()
            .to_app_option()
            .map_err(|e| wasm_error!("Couldn't deserialize entry into movie loan: {}", e))?;
        if let Some(movie_loan) = maybe_movie_loan {
            return Ok(movie_loan);
        } else {
            return Err(wasm_error!("Couldn't retrieve movie loan entry"));
        }
    }
    Err(wasm_error!("Couldn't retrieve movie loan"))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UpdateMovieInput {
    pub original_hash: ActionHash,
    pub data: Movie,
}

#[hdk_extern]
pub fn update_movie(input: UpdateMovieInput) -> ExternResult<ActionHash> {
    let maybe_original_record = get(
        input.original_hash.clone(),
        GetOptions::network()
    )?;
    match maybe_original_record {
        // We don't need to know the contents of the original; we just need to
        // know it exists before trying to update it.
        // A more robust app would at least check that the original was of the
        // correct type.
        Some(_) => {
            return update_entry(
                input.original_hash.clone(),
                &EntryTypes::Movie(input.data)
            );
        }
        None => Err(wasm_error!("Original movie record not found")),
    }
}
```

## Reference

* [`holochain_integrity_types::Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html)
* [`holochain_integrity_types::validate::ValidateCallbackResult`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/validate/enum.ValidateCallbackResult.html)
* [`holochain_integrity_types::genesis::GenesisSelfCheckData`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/genesis/type.GenesisSelfCheckData.html)
* [`holochain_integrity_types::action::InitZomesComplete`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.InitZomesComplete.html)
* [`holochain_zome_types::init::InitCallbackResult`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/init/enum.InitCallbackResult.html)
* [`hdk::p2p::send_remote_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.send_remote_signal.html)
* [`hdk::p2p::emit_signal`](https://docs.rs/hdk/latest/hdk/p2p/fn.emit_signal.html)

## Further reading

* [Core Concepts: Lifecycle Events](/concepts/11_lifecycle_events/)
* [Core Concepts: Signals](/concepts/9_signals/)
* [Build Guide: Identifiers](/build/identifiers/)
* [Build Guide: Signals](/build/signals/)