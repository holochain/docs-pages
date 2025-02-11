---
title: "Calling a zome function"
---

::: intro
You can call a zome function from [various local and remote processes](/build/connecting-everything-together/#what-processes-can-connect-to-a-happ) and secure them with capability tokens, letting you implement secure interop easily.
:::

## Call a zome function from a front end

To call a zome function, use [`AppWebsocket.prototype.callZome`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.callzome.md). It takes a [`CallZomeRequest`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.callzomerequest.md) and an optional timeout.

This example gets all the movies by a given director, then logs their titles to the console. You'll need the [`getHolochainClient` example](/build/connecting-a-front-end/#connect-to-a-happ-with-the-javascript-client) from the Connecting to a Front End page.

```typescript
import { decodeHashFromBase64, EntryHash } from '@holochain/client';

class Movie {
    title: string,
    director_hash: EntryHash,
    imdb_id: string | null,
    release_date: Date,
    box_office_revenue: Number,
}

async function logMoviesBySergioLeone() {
    // Use the `getHolochainClient` function from /build/connecting-a-front-end/
    const client = await getHolochainClient();
    const movies: Array<Movie> = await client.callZome({
        role_name: "movies",
        zome_name: "movies",
        fn_name: "get_movies_for_director",
        // This should match the input payload struct for the zome function.
        // The client serializes and deserializes hashes as 39-byte
        // `Uint8Array`s.
        // If your client ever needs to work with hashes as strings, the
        // helper functions `decodeHashFromBase64` and `encodeHashToBase64`
        // will do the conversions for you.
        payload: decodeHashFromBase64(" -- base64-encoded Sergio Leone hash -- ")
    });
    console.log("Got movies");
    for (let movie in movies) {
        console.log(movie.title);
    }
}
```

The client handles errors (both `ExternResult::Err(_)` errors from the zome function and other errors from Holochain itself) and deserializes the MessagePack return value for you. It also takes care of capability security<!--TODO: link when written --> for you.

## Call a zome function from another zome in the same hApp

Coordinator zomes can't call each other's functions directly; instead they do it via the [`hdk::prelude::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html) host function.

This example calls a function `get_movies_by_director` in another zome called `movies` _in the same cell_:

```rust
fn get_movies_by_sergio_leone() -> ExternResult<Vec<Movie>> {
    let response = call(
        // This indicates that `bar` is in the same cell.
        CallTargetCell::Local,
        "movies",
        "get_movies_for_director".into(),
        // This is a capability secret -- we'll explain why it's not needed.
        None,
        EntryHash::from_raw_36(vec![/* bytes of Sergio Leone director entry's hash */]),
    )?;
    match response {
        ZomeCallResponse::Ok(output) => output
            .decode()
            .map_err(|e| wasm_error!(e.to_string()))?,
        _ => Err(wasm_error!("Something bad happened")),
    }
}
```

This example calls that same function _if it's in a different cell_ whose role name is `movies`:

```rust
use hdk::prelude::*;
use movies_types::*;

fn get_movies_by_sergio_leone_from_movies_cell() -> ExternResult<Vec<Movie>> {
    let response = call(
        // Address the cell by its role name.
        // You can also address it by its cell ID.
        CallTargetCell::OtherRole("movies".into()),
        "movies",
        "get_movies_for_director".into(),
        None,
        EntryHash::from_raw_36(vec![/* bytes of Sergio Leone director entry's hash */]),
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
Holochain allows agents to add and remove coordinator zomes from a DNA. This permits upgrading and customization. But it also means that the zomes and functions that you _think_ are on the other end might not actually be there.
!!!

This example calls a function _in the same coordinator zome_ (or at least one with the same name) in a remote agent's cell. It assumes that the remote agent has granted access to their `get_movies_by_director` function with an [**unrestricted grant**](/concepts/8_calls_capabilities/#unrestricted), which doesn't require a capability secret.

```rust
use hdk::prelude::*;
use movies_types::*;

fn get_movies_by_sergio_leone_remote() -> ExternResult<Vec<Movie>> {
    let bob_public_key = AgentPubKey::from_raw_36(vec![/* bytes of remote agent's key */]);
    let response = call_remote(
        bob_public_key,
        // Get this zome's name from the host.
        zome_info()?.name,
        "foo".into(),
        // No capability secret needed for unrestricted functions.
        None,
        EntryHash::from_raw_36(vec![/* bytes of Sergio Leone director entry's hash */]),
    )?;
    match response {
        ZomeCallResponse::Ok(output) => output
            .decode()
            .map_err(|e| wasm_error!(e.to_string()))?,
        ZomeCallResponse::Unauthorized(_, _, _, _, _) => Err(wasm_error!("I wasn't allowed to call this function on Bob's device")),
        _ => Err(wasm_error!("Something bad happened")),
    }
}
```

## Reference

* [`AppWebsocket.prototype.callZome`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.callzome.md)
* [`CallZomeRequest`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.callzomerequest.md)
* [`hdk::p2p::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html)
* [`holochain_zome_types::call::CallTargetCell`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/call/enum.CallTargetCell.html)* [`holochain_zome_types::zome_io::ZomeCallResponse`](https://docs.rs/holochain_zome_types/latest/holochain_zome_types/zome_io/enum.ZomeCallResponse.html)
* [`hdk::info::zome_info`](https://docs.rs/hdk/latest/hdk/info/fn.zome_info.html)

## Further reading

* [Core Concepts: Calls and Capabilities](/concepts/8_calls_capabilities)