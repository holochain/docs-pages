---
title: "Callbacks and Lifecycle Hooks"
---

::: intro
A [cell](/concepts/2_application_architecture/#cell) can respond to various events in the life of a hApp by defining specially named **callbacks**, including **lifecycle hooks**. These functions may define and validate data, perform initialization tasks, respond to [remote signals](/concepts/9_signals), or follow up after successful writes.
:::

All of the callbacks must follow the [pattern for public functions](/build/zomes/#define-a-function) we introduced on the Zomes page. They must also have the specific input argument and return value types we describe below.

## Integrity zomes

Your [integrity zome](/build/zomes/#integrity) may define three callbacks, `validate`, `entry_defs`, and `genesis_self_check`. All of these functions **cannot have side effects**; any attempt to write data will fail. They also cannot access data that changes over time or across agents, such as the current cell's [agent ID](/build/identifiers/#agent) or a collection of [links](/build/links-paths-and-anchors/) in the [DHT](/concepts/4_dht).


### Define a `validate` callback

In order to validate your data you'll need to define a `validate` callback. It must take a single argument of type [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

The `validate` callback is called at two times:

1. When an agent tries to author an [action](/build/working-with-data/#entries-actions-and-records-primary-data), and
2. When an agent receives a [DHT operation](/concepts/4_dht/#a-cloud-of-witnesses) to store and serve as part of the shared database.

The nature of validation is [a topic of its own](/build/validation/). Read the [`validate` callback page](/build/validate-callback/) to see examples.

### Define an `entry_defs` callback

You don't need to write this callback by hand; you can let the `hdk_entry_types` macro do it for you. Read the [Define an entry type section under Entries](/build/entries/#define-an-entry-type) to find out how.

### Define a `genesis_self_check` callback

There's a moment in a cell's life, after it's been instantiated but before it's connected to its network, where it's published data that it can't fully validate. This data is their [**genesis records**](/concepts/3_source_chain/#source-chain-your-own-data-store). However, a `genesis_self_check` callback can guard against basic errors that would get an agent banned from a network. Read the [Genesis Self-Check Callback](/build/genesis-self-check-callback/) page for more info.

## Coordinator zomes

A [coordinator zome](/build/zomes/#coordinator) may define some lifecycle hooks: `init`, `post_commit`, and `recv_remote_signal`.

### Define an `init` callback

If you want to run setup tasks when the cell is being initialized, define a callback function called `init` in your coordinator zome. Holochain will call it after a cell has been created for the DNA containing the zome, following the order of coordinator zomes in the DNA's manifest, calling each zome's `init` in serial rather than calling them all in parallel.

!!! info `init` isn't called immediately on cell instantiation

This callback is called 'lazily'; that is, it's not called immediately after the cell has been instantiated. Instead, Holochain waits until the first zome function call is made, then calls `init` before calling the zome function.

This gives a participant's Holochain runtime a little bit of time to connect to other peers, which makes various things you might want to do in `init` more likely to succeed if they depend on data in the DHT.

You can force `init` to run eagerly by calling it as if it were a normal zome function. Note that it might fail with `UnresolvedDependencies` if it needs dependencies from the DHT. _You can only do this in Holochain 0.5 and newer._

!!!

Once `init` runs successfully for all coordinator zomes in a DNA, Holochain writes an [`InitZomesComplete` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.InitZomesComplete.html). That ensures that this callback isn't called again.

`init` must take an empty `()` input argument and return an [`InitCallbackResult`](https://docs.rs/hdk/latest/hdk/prelude/enum.InitCallbackResult.html) wrapped in an `ExternResult`. All zomes' `init` callbacks in a DNA must return a success result in order for cell initialization to succeed; otherwise any data written in these callbacks, along with the `InitZomesComplete` action, will be rolled back. _If any zome's init callback returns an `InitCallbackResult::Fail`, initialization will fail._ Otherwise, if any init callback returns an `InitCallbackResult::UnresolvedDependencies`, initialization will be retried at the next zome call attempt.

Here's an `init` callback that [links](/build/links-paths-and-anchors/) the [agent's ID](/build/identifiers/#agent) to the [DNA hash](/build/identifiers/#dna) as a sort of "I'm here" note. (It depends on a couple things being defined in your integrity zome; we'll show the integrity zome after this sample for completeness.)

```rust
use foo_integrity::{get_participant_registration_anchor, LinkTypes};
use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
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

Here's the `foo_integrity` zome code needed to make this work:

```rust
use hdi::prelude::*

#[hdk_link_types]
pub enum LinkTypes {
    ParticipantRegistration,
}

// This is a very simple implementation of the Anchor pattern, which you can
// read about in https://developer.holochain.org/build/links-paths-and-anchors/
// You don't need to tell Holochain about it with the `hdk_entry_types` macro,
// because it never gets stored -- we only use it to calculate a hash.
#[hdk_entry_helper]
pub struct Anchor(pub Vec<u8>);

pub fn get_participant_registration_anchor_hash() -> ExternResult<EntryHash> {
    hash_entry(Anchor(
        "_participants_"
            .as_bytes()
            .to_owned()
    ))
}
```

!!! info Why link the agent key to a well-known hash?

Because there's no single source of truth in a Holochain network, it's impossible to get the full list of agents who have joined it. The above pattern is an easy way for newcomers to register themselves as active participants so others can find them.

But if there are a lot of agents in the network, this can create "hot spots" where one set of agents --- the ones responsible for storing the base address for all those links --- carry an outsized burden compared to other agents. Read the [anchors and paths section under Links, Paths, and Anchors](/build/links-paths-and-anchors/#anchors-and-paths) for more info.

!!!

This `init` callback also does something useful: it grants all peers in the network permission to send messages to an agent's [remote signal receiver callback](#define-a-recv-remote-signal-callback).

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let mut fns = BTreeSet::new();
    fns.insert((zome_info()?.name, "recv_remote_signal".into()));
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions: GrantedFunctions::Listed(fns),
    })?;

    Ok(InitCallbackResult::Pass)
}
```

### Define a `recv_remote_signal` callback

<!-- TODO: move this to the signals page after it's written -->

Agents in a network can send messages to each other via [remote signals](/concepts/9_signals/#remote-signals). In order to handle these signals, your coordinator zome needs to define a `recv_remote_signal` callback. Remote signals get routed from the emitting coordinator zome on the sender's machine to the same one on the receiver's machine, so there's no need for a coordinator to handle message types it doesn't know about.

`recv_remote_signal` takes a single argument of any type you like --- if your coordinator zome deals with multiple message types, consider creating an enum for all of them. It must return an empty `ExternResult<()>`, as this callback is not called as a result of direct interaction from the local agent and has nowhere to pass a return value.

This zome function and remote signal receiver callback implement a "heartbeat" to let everyone keep track of who's currently online. It assumes that you'll combine the two `init` callback examples in the previous section, which set up the necessary links and permissions to make this work.

```rust
use foo_integrity::LinkTypes;
use hdk::prelude::*;

// We're creating this type for both remote signals to other peers and local
// signals to the UI.
#[derive(Serialize, Deserialize, Debug)]
enum Signal {
    Heartbeat(AgentPubKey),
}

#[hdk_extern]
pub fn recv_remote_signal(payload: Signal) -> ExternResult<()> {
    if let Signal::Heartbeat(agent_id) = payload {
        // Pass the heartbeat along to my UI so it can update the other
        // peer's online status.
        return emit_signal(Signal::Heartbeat(agent_id));
    }
    Ok(())
}

// My UI calls this function at regular intervals to let other participants
// know I'm online.
#[hdk_extern]
pub fn heartbeat(_: ()) -> ExternResult<()> {
    // Get all the registered participants from the DNA hash.
    let participant_registration_anchor_hash = get_participant_registration_anchor_hash()?;
    let other_participants_keys = get_links(
        GetLinksInputBuilder::try_new(
            participant_registration_anchor_hash,
            LinkTypes::ParticipantRegistration
        )?
            .get_options(GetStrategy::Network)
            .build()
    )?
        .iter()
        .filter_map(|l| l.target.clone().into_agent_pub_key())
        .collect();

    // Now send a heartbeat message to each of them.
    // Holochain will send them in parallel and won't return an error for any
    // failure.
    let AgentInfo { agent_latest_pubkey: my_pubkey, .. } = agent_info()?;
    send_remote_signal(
        Signal::Heartbeat(my_pubkey),
        other_participants_keys
    )
}
```

### Define a `post_commit` callback

After a zome function call completes, any actions that it created are validated, then written to the cell's source chain if all actions pass validation. While the function is running, nothing has been stored yet, even if [CRUD](/build/working-with-data/#adding-and-modifying-data) function calls return `Ok` with the [hash of the newly written action](/build/identifiers/#the-unpredictability-of-action-hashes). (Read more about the [atomic, transactional nature](/build/zome-functions/#atomic-transactional-commits) of writes in a zome function call.) That means that any follow-up you do within the same function, like pinging other peers, might point to data that doesn't exist if the function fails at a later step.

If you need to do any follow-up, it's safer to do this in a lifecycle hook called `post_commit`, which is called after Holochain's [call-zome workflow](/build/zome-functions/#zome-function-call-lifecycle) successfully writes its actions to the source chain. (Function calls that don't write data won't trigger this event.)

`post_commit` must take a single argument of type <code>Vec&lt;<a href="https://docs.rs/hdk/latest/hdk/prelude/type.SignedActionHashed.html">SignedActionHashed</a>&gt;</code>, which contains all the actions the function call wrote, and it must return an empty `ExternResult<()>`. This callback **must not write any data**, but it may call other zome functions in the same cell or any other local or remote cell, and it may send local or remote signals.

Here's an example that uses `post_commit` to tell someone a movie loan has been created for them. It uses the integrity zome examples from [Identifiers](/build/identifiers/#in-dht-data).

```rust
use movie_integrity::{EntryTypes, Movie, MovieLoan, UnitEntryTypes};
use hdk::prelude::*;

#[derive(Clone, Serialize, Deserialize, Debug)]
pub enum RemoteSignal {
    MovieLoanHasBeenCreatedForYou(ActionHash),
}

#[hdk_extern]
pub fn post_commit(actions: Vec<SignedActionHashed>) -> ExternResult<()> {
    for action in actions.iter() {
        // Only handle cases where an entry is being created.
        if let Action::Create(_) = action.action() {
            let movie_loan = get_movie_loan(action.action_address().clone())?;
            return send_remote_signal(
                RemoteSignal::MovieLoanHasBeenCreatedForYou(action.action_address().clone()),
                vec![movie_loan.lent_to]
            );
        }
    }
    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
enum LocalSignal {
    NewMovieLoan(MovieLoan),
}

#[hdk_extern]
pub fn recv_remote_signal(payload: RemoteSignal) -> ExternResult<()> {
    if let RemoteSignal::MovieLoanHasBeenCreatedForYou(action_hash) = payload {
        let movie_loan = get_movie_loan(action_hash)?;
        // Send the new movie loan data to the borrower's UI!
        emit_signal(LocalSignal::NewMovieLoan(movie_loan))?;
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