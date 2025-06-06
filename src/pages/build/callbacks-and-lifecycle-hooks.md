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

The nature of validation is [a topic of its own](/build/validation/). Read the [`validate` callback page](/build/validate-callback/) to see examples.


### Define a `genesis_self_check` callback

As part of its initialization, a cell goes through **genesis**. This creates initial data to announce the new agent on the network and present a [**membrane proof**](/concepts/3_source_chain/#source-chain-your-own-data-store), an agent-specific joining credential.

Agents rely on self-validation to protect them from publishing invalid data that gets them marked as malicious. The membrane proof record can't be self-validated, though, because it's written before the agent joins the network, and the `validate` callback can only be run after they've joined.

If you write a `genesis_self_check` callback, it can guard against some basic user entry errors. Read the [Genesis Self-Check Callback](/build/genesis-self-check-callback/) page for more info.

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
    let AgentInfo { agent_initial_pubkey: my_pubkey, ..} = agent_info()?;
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

The `init` callback is often used to set up initial [**capabilities**](/build/capabilities/), or access privileges to zome functions. You can see an example on the [Signals page](/build/signals/#remote-signals)

### Define a `recv_remote_signal` callback

Agents in a network can send messages to each other via [remote signals](/concepts/9_signals/#remote-signals). In order to handle these signals, your coordinator zome needs to define a `recv_remote_signal` callback. Remote signals get routed from the emitting coordinator zome on the sender's machine to a coordinator with the same name on the receiver's machine.

`recv_remote_signal` takes a single argument of any type you like. It must return an empty `ExternResult<()>`, as this callback is not called as a result of direct interaction from the local agent and has nowhere to pass a return value.

See the [Signals](/build/signals/#remote-signals) page for an example implementation.

### Define a `post_commit` callback

After a zome function call completes, any actions that it created are validated, then written to the cell's source chain if all actions pass validation. While the function is running, nothing has been stored yet, even if [CRUD](/build/working-with-data/#adding-and-modifying-data) function calls return `Ok` with the [hash of the newly written action](/build/identifiers/#the-unpredictability-of-action-hashes). (Read more about the [atomic, transactional nature](/build/zome-functions/#atomic-transactional-commits) of writes in a zome function call.) That means that any follow-up you do within the same function, like pinging other peers, might point to data that doesn't exist if the function fails at a later step.

If you need to do any follow-up, it's safer to do this in a lifecycle hook called `post_commit`, which is called after Holochain's [call-zome workflow](/build/zome-functions/#zome-function-call-lifecycle) successfully writes its actions to the source chain. (Function calls that don't write data won't trigger this event.)

`post_commit` must take a single argument of type <code>Vec&lt;<a href="https://docs.rs/hdk/latest/hdk/prelude/type.SignedActionHashed.html">SignedActionHashed</a>&gt;</code>, which contains all the actions the function call wrote, and it must return an empty `ExternResult<()>`. This callback **must not write any data**, but it may call other zome functions in the same cell or any other local or remote cell, and it may send local or remote signals.

`post_commit` also can't return an error. There should be no return type, and it should handle all errors it receives from other functions. It also must be tagged with `#[hdk_extern(infallible)]`.

Here's an example that uses `post_commit` to tell someone a movie loan offer has been created for them. It uses the integrity zome examples from [Identifiers](/build/identifiers/#in-dht-data).

```rust
use movie_integrity::{EntryTypes, Movie, MovieLoanOffer, UnitEntryTypes};
use hdk::prelude::*;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "value", rename_all = "snake_case")]
pub enum Signal {
    MovieLoanOfferHasBeenCreatedForYou(ActionHash),
    MovieLoanOfferDetails(MovieLoanOffer),
}

#[hdk_extern(infallible)]
pub fn post_commit(committed_actions: Vec<SignedActionHashed>) {
    for action in committed_actions {
        // Only handle cases where an entry is being created.
        if let Action::Create(_) = action.action() {
            if let Ok(movie_loan_offer) = get_movie_loan_offer(action.action_address().clone()) {
                send_remote_signal(
                    Signal::MovieLoanOfferHasBeenCreatedForYou(action.action_address().clone()),
                    vec![movie_loan_offer.offer_to]
                ).ok(); // suppress warning about unhandled `Result`
            }
        }
    }
}

#[hdk_extern]
pub fn recv_remote_signal(payload: Signal) -> ExternResult<()> {
    if let Signal::MovieLoanOfferHasBeenCreatedForYou(action_hash) = payload {
        let movie_loan_offer = get_movie_loan_offer(action_hash)?;
        // Send the new movie loan offer data to the borrower's UI!
        emit_signal(Signal::MovieLoanOfferDetails(movie_loan_offer))?;
    }
    Ok(())
}

fn get_movie_loan_offer(action_hash: ActionHash) -> ExternResult<MovieLoanOffer> {
    if let Some(record) = get(
        action_hash,
        GetOptions::network()
    )? {
        let maybe_movie_loan_offer: Option<MovieLoanOffer> = record.entry()
            .to_app_option()
            .map_err(|e| wasm_error!("Couldn't deserialize entry into movie loan offer: {}", e))?;
        if let Some(movie_loan_offer) = maybe_movie_loan_offer {
            return Ok(movie_loan_offer);
        } else {
            return Err(wasm_error!("Couldn't retrieve movie loan offer entry"));
        }
    }
    Err(wasm_error!("Couldn't retrieve movie loan offer"))
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