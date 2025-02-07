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
import { EntryHash } from '@holochain/client';

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
        fn_name: "get_movies_by_director",
        // This should match the input payload struct for the zome function.
        payload: {
            director_hash: [ /* bytes of Sergio Leone director entry's hash */]
        }
    });
    for (let movie in movies) {
        console.log(movie.title);
    }
}
```

The client handles errors (both `ExternResult::Err(_)` errors from the zome function and other errors from Holochain itself) and deserializes the MessagePack return value for you. It also takes care of capability security<!--TODO: link when written --> for you.

## Call a zome function from another zome in the same hApp

Coordinator zomes can't call each other's functions directly; instead they do it via the [`hdk::prelude::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html) host function.

This example calls a function `foo` in another zome called `bar` _in the same cell_:

```rust
use hdk::prelude::*;
// It's useful to put zome function input and output types in a separate crate
// from the zome itself, so they can be imported by zomes that call them.
use bar_types::*;

let foo_input: FooInput {
    age: 57,
    height: 173,
}
let response = call(
    // This indicates that `bar` is in the same cell.
    CallTargetCell::Local,
    "bar",
    "foo",
    // This is a capability secret -- we'll explain why it's not needed.
    None,
    foo_input;
)?
match response {
    // Do something with the return value.
    Ok(output) => {
        let foo_output: FooOutput = output.try_into()?;
        debug!("Got a response; it said {}", foo_output.greeting);
    }
    _ => error!("Something bad happened"),
}
```

This example calls that same function _if it's in a different cell_ whose role name is `qux`:

```rust
use hdk::prelude::*;
use bar_types::*;

// Construct foo_input here.
let response = call(
    // This indicates that `bar` is in another cell.
    CallTargetCell::OtherRole("qux"),
    "bar",
    "foo",
    // This is a capability secret -- we'll explain why it's not needed.
    None,
    foo_input;
)?
// Do something with response.
```

These cases don't need to worry about capability security either, because they're covered by a special grant called the [**author grant**](/concepts/8_calls_capabilities/#author-grant). It permits calls made by any caller with the same public key as the callee cell's owner.

## Call a zome function from another agent in the network

If two agents have cells running the same DNA --- that is, they're part of the same network --- they can call each other's zome functions _in the same DNA_ using [`hdk::prelude::call_remote`](https://docs.rs/hdk/latest/hdk/p2p/fn.call_remote.html).

!!! info A remote cell might not be running the same coordinator zomes
Holochain allows agents to add and remove coordinator zomes from a DNA. This permits upgrading and customization. But it also means that the zomes and functions that you _think_ are on the other end might not actually be there.
!!!

This example calls a function _in the same coordinator zome_ (or at least one with the same name) in a remote agent's cell. It assumes that the remote agent has granted access to their `foo` function with an [**unrestricted grant**](/concepts/8_calls_capabilities/#unrestricted), which doesn't require a capability secret.

```rust
use hdk::prelude::*;

let foo_input: FooInput {
    age: 57,
    height: 173,
}
let bob_public_key: AgentPubKey = vec![/* bytes of remote agent's key */];
let response = call_remote(
    bob_public_key,
    // Get this zome's name from the host.
    zome_info()?.name,
    "foo",
    // No capability secret needed for unrestricted functions.
    None,
    foo_input,
);
match response {
    Ok(_) => debug!("it worked"),
    Unauthorized(_, _, _, _, _) => debug!("I wasn't allowed to call this function on Bob's device"),
    _ => "Something unexpected happened",
}
```