---
title: "Lifecycle Events and Callbacks"
---

::: intro
A [cell](/concepts/2_application_architecture/#cell) can respond to various events in the life of a hApp by defining specially named **lifecycle callbacks**. This lets back-end code define and validate data, perform initialization tasks, respond to [remote signals](/concepts/9_signals), and follow up after successful writes.
:::

All of the lifecycle callbacks must follow the [pattern for public functions](/build/zomes/#define-a-function) on the Zomes page. They must also have the specific input argument and return value types described below.

## Integrity zomes

Your [integrity zome](/build/zomes/#integrity) must define two callbacks, `validate` and `entry_defs`, and it may define an optional callback, `genesis_self_check`. All of these functions **cannot have side effects**; any attempt to write data will fail. They also cannot access data that changes over time or across participants, such as the cell's [agent ID](/build/identifiers/#agent) or a collection of [links](/build/links-paths-and-anchors/) in the [DHT](/concepts/4_dht).


### Define a `validate` callback

In order to validate your data you'll need to define a `validate` callback. It must take a single argument of type [`Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

The `validate` callback is called at two times:

1. On an agent's device, when they try to author an [action](/build/working-with-data/#entries-actions-and-records-primary-data), and
2. On a peer's device, when they receive a [DHT operation](/concepts/4_dht/#a-cloud-of-witnesses) to store and serve as part of the shared database.

The nature of validation is out of scope for this page (we'll write a page on it soon), but here's a very basic example of a validation callback that approves everything: <!-- TODO: remove this example when the validation page is written -->

```rust
#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(Valid)
}
```

And here's an example of one that rejects everything. You'll note that the outer result is `Ok`; you should generally reserve `Err` for unexpected failures such as inability to deserialize data. However, Holochain will treat both `Ok(Invalid)` and `Err` as invalid operations that should be rejected.

```rust
#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(Invalid("I reject everything"))
}
```

### Define an `entry_defs` callback

You don't need to define this callback by hand; you can let the `hdk_entry_types` macro do it for you. Read the [Define an entry type section](/build/entries/#define-an-entry-type) to find out how.

### Define a `genesis_self_check` callback

Holochain assumes that every participant in a network is able to self-validate all the data they create before storing it in their [source chain](/concepts/3_source_chain/) and publishing it to the [DHT](/concepts/4_dht/). But at **genesis** time, when their cell has just been instantiated but they haven't connected to other peers, they may not be able to fully validate their [**genesis records**](/concepts/3_source_chain/#source-chain-your-own-data-store) if their validity depends on shared data. So Holochain skips full self-validation for these records, only validating the basic structure of their [actions](/build/working-with-data/#entries-actions-and-records-primary-data).

This creates a risk to the new participant; they may mistakenly publish malformed data and be rejected from the network. You can define a `genesis_self_check` function that checks the _content_ of genesis records before they're published. This function is limited --- it naturally doesn't have access to DHT data. But it can be a useful guard against a [membrane proof](/glossary/#membrane-proof) that the participant typed or pasted incorrectly, for example.

`genesis_self_check` must take a single argument of type [`GenesisSelfCheckData`](https://docs.rs/hdi/latest/hdi/prelude/type.GenesisSelfCheckData.html) and return a value of type [`ValidateCallbackResult`](https://docs.rs/hdi/latest/hdi/prelude/enum.ValidateCallbackResult.html) wrapped in an `ExternResult`.

Here's an example that checks that the membrane proof exists and is the right length: <!-- TODO: move this to the validation page too -->

```rust
use hdi::prelude::{GenesisSelfCheckData, hdk_extern, ValidateCallbackResult};

#[hdk_extern]
pub fn genesis_self_check(data: GenesisSelfCheckData) -> ExternResult<ValidateCallbackResult> {
    if let Some(membrane_proof) = data.membrane_proof {
        if membrane_proof.bytes().len() == 32 {
            Ok(Valid)
        }
        Ok(Invalid("Membrane proof is not the right length. Please check it and enter it again."))
    }
    Ok(Invalid("This network needs a membrane proof to join."))
}
```

## Coordinator zomes

A [coordinator zome](/build/zomes/#coordinator) may define some optional lifecycle callbacks: `init`, `post_commit`, and `recv_remote_signal`.

### Define an `init` callback

If you want to run setup tasks when the cell is being initialized, define a callback function called `init` in your coordinator zome. Holochain will call it after a cell has been created for the DNA containing the zome, following the order of coordinator zomes in the DNA's manifest, calling each zome's `init` in serial rather than calling them all in parallel.

!!! info `init` isn't called immediately on cell instantiation

This callback is called 'lazily'; that is, it's not called _immediately_ after the cell has been instantiated. Instead, Holochain waits until the first zome function call is made, then calls `init` before calling the zome function.

This gives a participant's Holochain runtime a little bit of time to connect to other peers, which makes various things you might want to do in `init` more likely to succeed if they depend on data in the DHT.

You can force `init` to run eagerly by calling it as if it were a normal zome function. _Note that you can only do this in Holochain 0.5 and newer._

!!!

Once `init` runs successfully for all coordinator zomes in a DNA, Holochain writes an [`InitZomesComplete` action](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/action/struct.InitZomesComplete.html). That ensures that this callback isn't called again.

`init` must take an empty `()` input argument and return an [`InitCallbackResult`](https://docs.rs/hdk/latest/hdk/prelude/enum.InitCallbackResult.html) wrapped in an `ExternResult`. All zomes' `init` callbacks in a DNA must return a success result in order for cell initialization to succeed; otherwise any data written in these callbacks, along with the `InitZomesComplete` action, will be rolled back. _If any zome's init callback returns an `InitCallbackResult::Fail`, initialization will fail._ Otherwise, if any init callback returns an `InitCallbackResult::UnresolvedDependencies`, initialization will be retried at the next zome call attempt.

Here's an `init` callback that [links](/build/links-paths-and-anchors/) the [agent's ID](/build/identifiers/#agent) to the [DNA hash](/build/identifiers/#dna) as a sort of "I'm here" note. (It assumes that you've written an integrity zome called `foo_integrity` that defines one type of link called `ParticipantRegistration`.)

```rust
use foo_integrity::LinkTypes;
use hdk::prelude::*;

#[hdk_extern]
pub fn init(_: ()) -> ExternResult<InitCallbackResult> {
    let DnaInfoV2 { hash: dna_hash } = dna_info()?;
    let AgentInfo { agent_latest_pubkey: my_pubkey } = agent_info()?;
    create_link(
        dna_hash,
        my_pubkey,
        LinkTypes::ParticipantRegistration,
        ()
    )?;

    Ok(InitCallbackResult::Pass)
}
```

!!! info Why link the agent key to a well-known hash?

Because there's no single source of truth in a Holochain network, it's impossible to get the full list of peers who have joined it. The above pattern is an easy way for newcomers to register themselves as active participants so others can find them.

But the users are also the infrastructure, so this can create "hot spots" where a set of peers --- the ones responsible for storing the base address for all those links --- carry an outsized burden compared to other peers. Read the [anchors and paths section under Links, Paths, and Anchors](/build/links-paths-and-anchors/#anchors-and-paths) for more info.

!!!

This `init` callback also does something useful: it grants all other peers in the network permission to send messages to a participant's [remote signal receiver callback](#recv-remote-signal-callback).

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

### Define a `post_commit` callback

After a zome function call completes, any actions that it created are validated, then written to the cell's source chain if all actions pass validation. While the function is running, nothing has been stored even if [CRUD](/build/working-with-data/#adding-and-modifying-data) function calls return `Ok`. (Read more about the [atomic, transactional nature](/build/zome-functions/#atomic-transactional-commits) of writes in a zome function call.)

If you need to do any follow-up after a successful write beyond returning the function's return value to the caller, it's safer to do this in a lifecycle callback called `post_commit`, which is called after Holochain's [call-zome workflow](/build/zome-functions/#zome-function-call-lifecycle) successfully writes its actions to the source chain. (Function calls that don't write data won't trigger this event.)

`post_commit` must take a single argument of type <code>Vec&lt;<a href="https://docs.rs/hdk/latest/hdk/prelude/type.SignedActionHashed.html">SignedActionHashed</a>&gt;</code>, which contains all the actions the function call wrote, and it must return an empty `ExternResult<()>`. This callback must not write any data, but it may call other zome functions in the same cell or any other local or remote cell, and it may

Here's an example that uses `post_commit` to tell the original author of a `Movie` entry that someone has edited it. It uses the integrity zome examples from [Entries](/build/entries/).

```rust
use movie_integrity::{EntryTypes, Movie};
use hdk::*;

struct UpdateMovieInput {
    original_hash: ActionHash,
    data: Movie,
}

#[hdk_extern]
pub fn update_movie(input: UpdateMovieInput) -> ExternResult<ActionHash> {

}
```

### Define a `recv_remote_signal` callback

<!-- TODO: move this to the signals page after it's written -->

Peers in a network can send messages to each other via [remote signals](/concepts/9_signals/#remote-signals). In order to handle these signals, your coordinator zome needs to define a `recv_remote_signal` callback. Remote signals get routed from the emitting coordinator zome on Alice's machine to the same one on Bob's machine, so there's no need for a coordinator to handle message types it doesn't know about.

`recv_remote_signal` takes a single argument of any type you like --- if your coordinator zome deals with multiple message types, consider creating an enum for all of them. It must return an empty `ExternResult<()>`, as this callback is not called as a result of direct interaction from the local agent and has nowhere to pass a return value.

This zome function and remote signal receiver callback implement a "heartbeat" to let all network participants know who's currently online. It assumes that you'll combine the two `init` callback examples in the previous section, which set up the necessary links and permissions to make this work.

```rust
use foo_integrity::LinkTypes;
use hdk::prelude::*;

// We're using this type for both remote signals to other peers and local
// signals to the UI.
enum SignalType {
    Heartbeat(AgentPubKey),
}

// My UI calls this function at regular intervals to let other participants
// know I'm online.
#[hdk_extern]
pub fn heartbeat(_: ()) -> ExternResult<()> {
    // Get all the registered participants from the DNA hash.
    let DnaInfoV2 { hash: dna_hash } = dna_info()?;
    let other_participants_keys = get_links(
        GetLinksInputBuilder::try_new(
            dna_hash,
            LinkTypes::ParticipantRegistration
        )?
            .get_options(GetStrategy::Network)
            .build()
    )?
        .filter_map(|l| l.target.into_agent_pub_key());

    // Now send a heartbeat message to each of them.
    // Holochain will send them in parallel and won't return an error for any
    // failure.
    let AgentInfo { agent_latest_pubkey: my_pubkey } = agent_info()?;
    send_remote_signal(
        SignalType::Heartbeat(my_pubkey),
        other_participants_keys
    )
}

#[hdk_extern]
pub fn recv_remote_signal(payload: SignalType) -> ExternResult<()> {
    match payload {
        // Pass the heartbeat along to my UI so it can update the other
        // peer's online status.
        SignalType::Heartbeat(peer_pubkey) => emit_signal(payload)
    }
}
```