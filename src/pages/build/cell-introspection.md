---
title: "Cell Introspection"
---

::: intro
Holochain lets you get details about parts of the cell and its current state --- the current zome and DNA, the context of the current function call, and the agent bound to the hApp's cells.
:::

## Get DNA info

To get details about the DNA that a function is executing in, use the [`dna_info`](https://docs.rs/hdk/latest/hdk/prelude/fn.dna_info.html) host function, which is available to both coordinator and integrity zomes. It takes no inputs and gives back a result containing a [`DnaInfoV2`](https://docs.rs/hdk/latest/hdk/prelude/struct.DnaInfoV2.html) struct. See the [DNAs page](/build/dnas/) for more info on the values in this struct.

<!--TODO: remove origin_time and quantum_time with 0.5 -->

```rust
use hdi::prelude::*;

fn look_at_dna_info() -> ExternResult<()> {
    let DnaInfoV2 {
        // The human-readable name of the DNA, taken from the DNA manifest.
        name: _,
        // The hash of the DNA and its modifiers as defined *in this cell*.
        // This may include modifiers applied in the app manifest or at
        // instantiation time (either overridden when installing the app or
        // when creating a clone).
        hash: _,
        // The modifiers as defined in this cell.
        modifiers,
        // All the zomes in this cell's DNA.
        zome_names: _,
    } = dna_info()?;

    let DnaModifiers {
        // A value used to create a new DNA while keeping its other modifiers
        // and its code intact; see
        // https://developer.holochain.org/guide/cloning/
        network_seed: _,
        // Constants which can affect runtime behavior of this cell.
        // They're usually specified as YAML and deserialized into a struct
        // in your zome.
        properties: _,
        // The earliest valid timestamp for data in the network.
        origin_time: _,
        // A value used for tuning gossip, not useful for app development.
        quantum_time: _,
    } = modifiers;

    Ok(())
}
```

### Get and deserialize DNA properties

If all you want are the DNA properties, deserialized into a Rust type, you can use the [`#[dna_properties]`](https://docs.rs/hdk/latest/hdk/prelude/attr.dna_properties.html) macro on the type definition. Behind the scenes, it calls `dna_info` and tries to deserialize the `properties` field from YAML.

This example implements a validation helper that checks that a given age value is within the bounds set in the DNA properties.

```rust
use hdi::prelude::*;

#[dna_properties]
pub struct DnaProperties {
    pub minimum_age: u32,
}

pub fn validate_age(age: u32) -> ExternResult<ValidateCallbackResult> {
    let DnaProperties { minimum_age } = DnaProperties::try_from_dna_properties()?;
    if age < minimum_age {
        return Ok(ValidateCallbackResult::Invalid(format!("Age {} is below the minimum of {}", age, minimum_age)));
    }
    Ok(ValidateCallbackResult::Valid)
}
```

## Get zome info

To get information about the zome that a function is executing in, use the [`zome_info`](https://docs.rs/hdk/latest/hdk/info/fn.zome_info.html) host function, which is available to both coordinator and integrity zomes. It takes no arguments and returns a result containing a [`ZomeInfo`](https://docs.rs/hdk/latest/hdk/info/fn.zome_info.html) struct.

```rust
use hdi::prelude::*;

fn look_at_zome_info() -> ExternResult<()> {
    let ZomeInfo {
        // A human-readable name from the DNA manifest.
        name: _,
        // The index of the zome as it appears in the DNA manifest.
        id: _,
        // The DNA properties -- this value is the same across all zomes in
        // the DNA.
        properties: _,
        // A tuple struct containing a vector of all the entry types defined
        // by this zome; it'll only be populated for integrity zomes.
        entry_defs: _,
        // A list of all the functions exposed by this zome, including both
        // zome functions and callbacks/hooks.
        extern_fns: _,
        // All of the entry and link types that are in scope for this zome.
        // This only applies to coordinator zomes, and is determined by the
        // zome's `dependencies` field in the DNA manifest.
        zome_types: _,
    } = zome_info()?;
    Ok(())
}
```

## Get agent info

To get information about the agent bound to the current cell, use the [`agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html) host function. It takes no arguments and returns a result containing an [`AgentInfo`](https://docs.rs/hdk/latest/hdk/prelude/struct.AgentInfo.html) struct. _**Note**: This function is only available to coordinator zomes._

<!-- TODO: fix this if the interface changes -->

```rust
use hdk::prelude::*;

fn look_at_agent_info() -> ExternResult<()> {
    let AgentInfo {
        // The public key of this agent.
        agent_initial_pubkey: _,
        // Also the public key of this agent (a redundant field that we plan
        // to remove).
        agent_latest_pubkey: _,
        chain_head,
    } = agent_info()?;


    // You can get info about the agent's current chain state at any time in
    // the function call. Note that this will advance to the most recently
    // written action if you call `agent_info` after writing something to your
    // source chain.
    let (
        _latest_action_hash,
        _latest_action_sequence_index,
        _latest_action_timestamp,
    ) = chain_head;

    Ok(())
}
```

!!! info New actions aren't persisted until after a function call completes
At the start of every function call that can write data to the source chain, Holochain [creates a new 'scratch space'](/build/zome-functions/#atomic-transactional-commits) to store new writes, then flushes those writes to the source chain _after the function call completes and all writes pass validation_. That means that the `chain_head` property reflects the current state of the source chain _in the scratch space_, not the state of the source chain persisted to storage. Validation failure or hardware failure can cause the scratch space to be rolled back or lost.
!!!

## Get info about the call context

To get information about the context of the currently executing call, use the [`call_info`](https://docs.rs/hdk/latest/hdk/info/fn.call_info.html) host function. It takes no arguments and returns a result containing a [`CallInfo`](https://docs.rs/hdk/latest/hdk/prelude/struct.CallInfo.html) struct. _**Note**: This function is only available to coordinator zomes._

```rust
use hdk::prelude::*;
use movies_integrity::*;

#[hdk_extern]
pub fn foo() -> ExternResult<()> {
    let CallInfo {
        // The public key that signed this zome function call.
        provenance,
        // The public name of the called zome function. In this case, it's
        // `foo`.
        function_name,
        // The state of the source chain at the time that the scratch space
        // was created -- in other words, the persisted state of the source
        // chain. Unlike AgentInfo.chain_head, this doesn't change as you
        // try to write data in this function.
        as_at,
        // The capability grant that matches the claim used to call this
        // function. See https://developer.holochain.org/build/capabilities/
        // for more info.
        cap_grant: _,
    } = call_info()?;

    // If this function is being called from another function in any cell in
    // the same hApp, or if it's being called from the UI in a runtime that
    // serves bundled back ends and front ends such as Launcher, Moss, or a
    // Kangaroo-bundled executable, the provenance will be the same as the
    // agent bound to this cell.
    if provenance == agent_info()?.agent_latest_pubkey {
        debug!("Call is being made by the owner of this cell");
    }

    assert_eq!(function_name, "foo".into(), "function_name should match the internal Rust name of the function");

    // If we haven't written anything to the source chain, the chain head
    // from `agent_info` should match the one from `call_info`.
    assert_eq!(as_at, agent_info()?.chain_head, "we haven't written anything yet");
    create_link(
        EntryHash::from_raw_36(vec![0; 36]),
        EntryHash::from_raw_36(vec![1; 36]),
        LinkTypes::DirectorToMovies,
        ()
    )?;
    // Now, after writing to the chain, if we call `call_info` and
    // `agent_info` again, the chain head in scratch space shouldn't match
    // the persisted chain head.
    assert_ne!(call_info()?.as_at, agent_info()?.chain_head, "we've written something now and the scratch space and persisted source chain should be out of sync");

    Ok(())
}
```

## Reference

* [`hdi::info::dna_info`](https://docs.rs/hdi/latest/hdi/info/fn.dna_info.html)
* [`holochain_integrity_types::info::DnaInfo`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/info/type.DnaInfo.html)
* [`hdi::info::zome_info`](https://docs.rs/hdi/latest/hdi/info/fn.zome_info.html)
* [`holochain_integrity_types::info::ZomeInfo`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/info/type.ZomeInfo.html)
* [`hdk::info::agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html)
* [`holochain_zome_types::info::AgentInfo`](https://docs.rs/holochain_zome_types/latest/holochain_integrity_types/info/type.AgentInfo.html)
* [`hdk::info::call_info`](https://docs.rs/hdk/latest/hdk/info/fn.call_info.html)
* [`holochain_zome_types::info::CallInfo`](https://docs.rs/holochain_zome_types/latest/holochain_integrity_types/info/type.CallInfo.html)