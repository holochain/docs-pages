---
title: "Calling Zome Functions"
---

::: intro
You can call a zome function from [various local and remote processes](/build/connecting-the-parts/#what-processes-can-connect-to-a-happ) and secure them with capability tokens, letting you implement secure interop easily.
:::

## Call a zome function from a front end

To call a zome function, use [`AppWebsocket.prototype.callZome`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.callzome.md). It takes a [`CallZomeRequest`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.callzomerequest.md) and an optional timeout.

This example gets all the movies by a given director, then logs their titles to the console. You'll need the [`getHolochainClient` example from the Connecting to a Front End page](/build/connecting-a-front-end/#connect-to-a-happ-with-the-javascript-client).

```typescript
import { decodeHashFromBase64, EntryHash } from '@holochain/client';

interface Movie {
    title: string;
    director_hash: EntryHash;
    imdb_id: string | null;
    release_date: Date;
    box_office_revenue: Number;
}

async function getMoviesForDirector(directorHash: EntryHash): Array<Movie> {
    // Use the `getHolochainClient` function from /build/connecting-a-front-end/
    const client = await getHolochainClient();
    let movies: Array<Movie> = await client.callZome({
        role_name: "movies",
        zome_name: "movies",
        fn_name: "get_movies_for_director",
        // This should match the input payload struct for the zome function.
        payload: directorHash,
    });
    return movies;
}
```

The client handles errors (both `ExternResult::Err(_)` errors from the zome function and other errors from Holochain itself) and deserializes the MessagePack return value for you. It also takes care of capability security<!--TODO: link when written --> for you.

## Call a zome function from another zome in the same hApp

Coordinator zomes call each other's functions via the [`hdk::prelude::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html) host function. It works for any coordinator zome in a hApp, whether in the same cell or another cell.

This example calls a function `get_movies_for_director` in another zome called `movies` _in the same cell_:

```rust
fn get_movies_for_director_from_movies_zome(director_hash: EntryHash) -> ExternResult<Vec<Movie>> {
    let response = call(
        // This indicates that `bar` is in the same cell.
        CallTargetCell::Local,
        // Call a coordinator zome by its name defined in the DNA manifest.
        "movies",
        "get_movies_for_director".into(),
        // This is a capability secret -- we'll explain later why it's not
        // needed.
        None,
        director_hash,
    )?;
    match response {
        ZomeCallResponse::Ok(output) => output
            .decode()
            .map_err(|e| wasm_error!(e.to_string()))?,
        _ => Err(wasm_error!("Something bad happened")),
    }
}
```

This example calls that same function in a zome called `movies` _in a different cell_ whose role name is also `movies`:

```rust
use hdk::prelude::*;
use movies_types::*;

fn get_movies_for_director_from_movies_cell(director_hash: EntryHash) -> ExternResult<Vec<Movie>> {
    let response = call(
        // Address the cell by its role name from the hApp manifest.
        // You can also address it by its cell ID using
        // `CallTargetCell::OtherCell(CellId)`.
        CallTargetCell::OtherRole("movies".into()),
        "movies",
        "get_movies_for_director".into(),
        None,
        director_hash,
    )?;
    match response {
        ZomeCallResponse::Ok(output) => output
            .decode()
            .map_err(|e| wasm_error!(e.to_string()))?,
        _ => Err(wasm_error!("Something bad happened")),
    }
}
```

These cases don't need to worry about capability security either, because they're covered by a special grant called the [**author grant**](/concepts/8_calls_capabilities/#author-grant). It permits calls made by any caller with the same public key as the callee cell's owner.

## Call a zome function from another agent in the network

If two agents have cells running the same DNA --- that is, they're part of the same network --- they can call each other's zome functions _in the same DNA_ using [`hdk::prelude::call_remote`](https://docs.rs/hdk/latest/hdk/p2p/fn.call_remote.html).

!!! info A remote cell might not be running the same coordinator zomes
Holochain allows agents to add and remove coordinator zomes from their cells. This permits upgrading and customization. But it also means that the zomes and functions that you _think_ are on the other end might not actually be there.
!!!

This example calls a function _in the same coordinator zome_ (or at least one with the same name) in a remote agent's cell. It assumes that the remote agent has granted access to their `get_movies_by_director_from_movies_cell` function with an [**unrestricted grant**](/concepts/8_calls_capabilities/#unrestricted), which doesn't require a capability secret.

```rust
use hdk::prelude::*;
use movies_types::*;

fn get_movies_for_director_remote(director_hash: EntryHash, remote_agent: AgentPubKey) -> ExternResult<Vec<Movie>> {
    let response = call_remote(
        remote_agent,
        // Get this zome's name from the host.
        zome_info()?.name,
        "get_movies_by_director_from_movies_cell".into(),
        // No capability secret needed for unrestricted functions.
        None,
        director_hash,
    )?;
    match response {
        ZomeCallResponse::Ok(output) => output
            .decode()
            .map_err(|e| wasm_error!(e.to_string()))?,
        ZomeCallResponse::Unauthorized(_, _, _, _, _) => Err(wasm_error!("I wasn't allowed to call this function on remote device")),
        _ => Err(wasm_error!("Something bad happened")),
    }
}
```

!!! info All agents have access to the same DHT data
Because every agent in a network has the same view of the network's shared DHT data (assuming all agents are synced with each other), `call_remote` isn't useful for calling functions that get data from the DHT. Instead, it should be used for requesting data that another agent can access but you can't, such as asking them for [private entries](/build/entries/#private-entry-type) from their source chain or for data from a DHT that they can access but you can't.
!!!

## Reference

* [`AppWebsocket.prototype.callZome`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.callzome.md)
* [`CallZomeRequest`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.callzomerequest.md)
* [`hdk::p2p::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html)
* [`holochain_zome_types::call::CallTargetCell`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/call/enum.CallTargetCell.html)* [`holochain_zome_types::zome_io::ZomeCallResponse`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/zome_io/enum.ZomeCallResponse.html)
* [`hdk::info::zome_info`](https://docs.rs/hdk/latest/hdk/info/fn.zome_info.html)

## Further reading

* [Core Concepts: Calls and Capabilities](/concepts/8_calls_capabilities)