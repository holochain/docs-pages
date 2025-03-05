---
title: "Cloning"
---

::: intro
**Cloning** an existing [DNA](/build/dnas) creates a new DNA with its own independent network and instantiates a new cell from this DNA. You can optionally change the [DNA properties](/build/dnas/#use-dna-properties) when you clone.
:::

## Creating independent networks with the same rules

As we described in [DNAs](/build/dnas/), every DNA has an independent network, keyed by the hash of all the [integrity zomes](/build/zomes/#integrity) and [DNA modifiers. Cloning allows you to change an existing DNA slightly, so that it executes the same  but enjoys a separate membership of peers and [DHT database](/concepts/4_dht/).

An agent creates a clone by choosing an existing DNA in a hApp, then specifying at least one new [DNA modifier](/build/dnas/#integrity-section). Then they have to share the modifier(s) with all other peers who want to join the network, and those peers specify the exact same modifiers in order to create an identical clone with an identical DNA hash.

!!! info Creating vs joining a clone network
From the perspective of using the functions we talk about in the rest of this page, there's really no meaningful difference between _creating_ a network and _joining_ it. Agents 'become the network' together, simply by instantiating a cell from a DNA, discovering other agent cells with the same DNA hash, and beginning to communicate with each other.
!!!

Here are the three DNA modifiers and how to use them:

### Network seed

When all you want to do is create a new network space, simply specify a new **network seed**. It's an arbitrary vector of bytes that serves no purpose but to change the DNA hash. You can think of it like a passcode to the network.

### DNA properties

The DNA properties are constants that your integrity and coordinator zomes [can access](/build/dnas/#use-dna-properties) to change their behavior. Because they can be used in validation logic, they affect the 'meaning' of your integrity code, which is why they affect the DNA hash (a network is defined by its validation logic).

You can specify DNA properties without specifying a network seed, but be aware that this doesn't guarantee a unique network space. If you're cloning in order to both modify DNA behavior _and_ create a 'private' network space, specify a unique network seed along with the DNA properties.

### Origin time

While you can specify an **origin time** (the earliest valid timestamp for any DHT data), in practice this isn't necessary. Holochain will just use the origin time from the original DNA.

## Clone a DNA from a client

If you want to clone a DNA from the client side, use the [`AppWebsocket.prototype.createCloneCell`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.createclonecell.md).

This example shows two functions: one that creates or joins a private chat room from a DNA whose role in the hApp manifest is named `chat`. It uses the `getHolochainClient` helper we [created in the Front End page](/build/connecting-a-front-end/#connect-to-a-happ-with-the-javascript-client).

```typescript

async function createOrJoinPrivateChatRoom(
    // A human-readable name. We can use this in the UI.
    // When we create the clone, we pass it to Holochain.
    // It's local to the agent and doesn't affect anything functional, so
    // different agents can give the same chat room clone a different name
    // and still be able to access the room.
    name: String,
    network_seed?: NetworkSeed
): Promise<ClonedCell> {
    if (typeof network_seed == "undefined") {
        // The person who creates a chat room should come up with a unique
        // network seed. This won't prevent unauthorized access if existing
        // members share it with others, but it will prevent accidental
        // clashes.
        network_seed = crypto.randomUUID();
    }

    let client = await getHolochainClient();
    return await client.createCloneCell({
        modifiers: { network_seed, },
        name,
        role_name: "chat",
    });
}
```

## Clone a DNA from a coordinator zome

You can also clone a DNA from within your back end with the [`create_clone_cell`](https://docs.rs/hdk/latest/hdk/clone/fn.create_clone_cell.html) host function.

```rust
use hdk::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct CreateOrJoinPrivateChatRoomInput {
    pub name: String,
    pub network_seed: Option<NetworkSeed>,
    pub chat_dna_hash: DnaHash,
}

#[hdk_extern]
pub fn create_or_join_private_chat_room(input: CreateOrJoinPrivateChatRoomInput) -> ExternResult<ClonedCell> {
    let network_seed = input.network_seed
        .map(|s| s.as_bytes())
        .unwrap_or(random_bytes()?.into());

    let cell_id = CellId::new(input.chat_dna_hash, agent_info()?.agent_latest_pubkey);
    let create_clone_cell_input = CreateCloneCellInput {
        cell_id: cell_id,
        membrane_proof: None,
        name: input.name.into(),
    };
    create_clone_cell(create_clone_cell_input)
}
```

!!! info The `create_clone_cell` host function requires the DNA hash and agent ID
Unlike the JS client's `createCloneCell` API method, the HDK's `create_clone_cell` host function can't refer to an existing DNA by its role name. Instead, you have to specify the DNA hash and agent ID of an existing cell. <!-- TODO: change this if holochain/holochain#4762 gets addressed --> Because it's impossible to get the DNA hash of another role in the hApp using the HDK, you need to either hard-code it in the coordinator zome (which leads to [tight coupling](https://en.wikipedia.org/wiki/Coupling_%28computer_programming%29#Disadvantages_of_tight_coupling)) or pass it in from the client. Here's some sample code to get a DNA hash from a role name and pass it to the function we just defined:

```typescript
async function createOrJoinPrivateChatRoom(name: String, network_seed: NetworkSeed?): Promise<ClonedCell> {
    let client = await getHolochainClient();
    let appInfo = await client.appInfo();
    // The first cell filling a role will have the 'prototype' DNA.
    let chat_cell = appInfo.cell_info["chat"]?[0]?;
    if (typeof chat_cell == 'undefined') {
        throw new Error("Couldn't find a cell with the role name 'chat'.");
    }
    let chat_dna_hash = (chat_cell.type == CellType.Provisioned || chat_cell.type == CellType.Cloned)
        ? chat_cell.value.cell_id[0]
        : chat_cell.value.dna;
    // This is the zome function we defined in the last code block.
    // Let's assume it's in a DNA whose role name is `chat_lobby`.
    return await client.callZome(
        role_name: "chat_lobby",
        zome_name: "chat_lobby",
        fn_name: "create_or_join_private_chat_room",
        payload: {
            name,
            network_seed,
            chat_dna_hash,
        }
    );
}
```
!!!

## Get all the clones of a role

To get all the clones of a given DNA, use [`AppWebsocket.prototype.appInfo`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appclient.appinfo.md) and take a look at the return value's `cell_info` property, which is an object that maps roles to the cells belonging to those roles.

```typescript
async function getPrivateChatCells(): Promise<Array<ClonedCell>> {
    let client = await getHolochainClient();
    let appInfo = await client.appInfo();
    let chats = appInfo.cell_info["chat"]?;
    if (typeof chats == "undefined") {
        throw new Error("The chat role isn't defined in this hApp.");
    }

    return chats
        .filter((cell) => cell.type == CellType.Cloned)
        .map((cell) => cell.value);
}
```

## Address a clone cell when calling a zome function

To use a clone cell, you can address it either by its new DNA hash or its **clone ID**, which is a concatenation of its role name and a **clone index**. This value is _local to the agent's hApp instance_ and is returned by the conductor when the cell has been cloned.

### In the client {#call-clone-from-client}

This example posts a message to a given chat. It assumes that the DNA with the `chat` role has a `chat` zome with a function called `post_message` that accepts a string and returns the message hash.

```typescript
async function postMessage(chatId: CellId | RoleName, message: String) -> Promise<ActionHash> {
    let client = await getHolochainClient();
    // Check whether we've been passed a role name / clone ID (which is a
    // string) or a cell ID (which is an array). Use this to construct the
    // right payload for callZome.
    let chatIdProperty = typeof chatID === "string"
        ? { role_name: chatId, }
        : { cell_id: chatId, };
    let callZomePayload = {
        ...chatIdProperty,
        zome_name: "chat",
        fn_name: "post_message",
        payload: message,
    }
    return await client.callZome(callZomePayload);
}
```
<!-- TODO: update this if holochain/holochain#4772 is accepted and done -->

### In a coordinator zome {#call-clone-from-coordinator}

The HDK's [`call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html) host function takes roughly the same arguments. This example sends a regular status message to a given chat, perhaps triggered by a client that runs on a schedule.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn status_message(chatId: CallTargetCell) -> ExternResult<ActionHash> {
    let message = format!("The time is {} and I'm still running", sys_time()?);
    call(
        to_cell: chatId,
        zome_name: "chat".into(),
        fn_name: "post_message".into(),
        cap_secret: None,
        payload: message,
    )
}
```

## Disable a clone cell

When an agent no longer wants to be part of a network, you can disable the clone. The cell remains in the database but stops responding to zome calls and peer-to-peer network traffic. The hApp can't delete clone cells (to prevent malicious or malformed zomes or front ends from deleting data), but a Holochain runtime will clean up data when a hApp is uninstalled.

### In the client {#disable-clone-from-client}

Use the [`AppWebsocket.prototype.disableCloneCell`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.disableclonecell.md) method to disable a cell from a front end.

```typescript
async function pauseChat(chatId: CloneCellId): Promise<void> {
    let client = await getHolochainClient();
    return client.disableCloneCell({ clone_cell_id: chatId });
}
```

### In a coordinator zome {#disable-clone-from-coordinator}

Use the [`disable_clone_cell`](https://docs.rs/hdk/latest/hdk/clone/fn.disable_clone_cell.html) host function to disable a cell from a coordinator zome within the same hApp.

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn pause_chat(chat_id: CloneCellId) -> ExternResult<()> {
    let input = DisableCloneCellInput { clone_cell_id: chat_id };
    disable_clone_cell(input)
}
```

## Reference

* [`AppWebsocket.prototype.createCloneCell`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.createclonecell.md)
* [`hdk::clone::create_clone_cell`](https://docs.rs/hdk/latest/hdk/clone/fn.create_clone_cell.html)
* [`AppWebsocket.prototype.appInfo`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appclient.appinfo.md)
* [`AppWebsocket.prototype.callZome`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.callzome.md)
* [`hdk::p2p::call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html)
* [`AppWebsocket.prototype.disableCloneCell`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.disableclonecell.md)
* [`hdk::clone::disable_clone_cell`](https://docs.rs/hdk/latest/hdk/clone/fn.disable_clone_cell.html)

## Further reading

* [Build Guide: hApps: `clone_limit`](/build/happs/#clone-limit)
* [Build Guide: DNAs: Single vs multiple DNAs](/build/dnas/#single-vs-multiple-dnas)
