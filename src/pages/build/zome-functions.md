---
title: "Zome Functions"
---

::: intro
Besides special [callbacks](/build/callbacks-and-lifecycle-hooks), a zome defines public functions that acts as its API. These functions can read and write data, manage permissions, send signals, and call functions in other cells in the same Holochain instance or to remote peers in the same network.
:::

As we touched on in the [Zomes page](/build/zomes/#how-a-zome-is-structured), a zome is just a WebAssembly module with some public functions. These functions have access to Holochain's host API. Some of them are [callbacks](/build/callbacks-and-lifecycle-hooks/) with special purposes, and others are functions you create yourself to serve as your zome's API. This second kind of function is what we'll talk about in this page.

Holochain sandboxes your zome, acting as an intermediary between it and the user's storage and UI at the local level, and between it and other peers at the network level.

## Define a zome function

A zome function is a public function that's tagged with the [`hdk_extern`](https://docs.rs/hdk/latest/hdk/prelude/attr.hdk_extern.html) procedural macro. It must follow the constraints described in the [Define a function section in the Zomes page](/build/zomes/#define-a-function).

Here's a simple example of a zome function that takes a name and returns a greeting:

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn say_hello(name: String) -> ExternResult<String> {
    Ok(format!("Hello {}!", name))
}
```

## Atomic, transactional commits

When a zome function wants to persist data, it stores it as [actions](/build/working-with-data/#entries-actions-and-records-primary-data) in the cell's [source chain](/build/working-with-data/#individual-state-histories-as-public-records). At the beginning of each call, Holochain prepares a **scratch space** containing the current source state, and all source chain read/write functions work on this scratch space rather than live source chain data.

A zome function call's writes are _atomic_ and _transactional_; that is, **all the writes succeed or fail together**. If any of the actions fail validation, the scratch space is discarded and the validation error is returned to the caller.

Zome function calls, and their transactions, can also run in parallel. A zome call transaction has one big difference from traditional database transactions: if one transaction begins, then another transaction begins and commits before the first transaction finishes, **the first transaction will roll back** and return a 'chain head moved' error to the caller.

The possibility of a rollback means that any follow-up tasks with written data should happen in a [`post_commit` callback](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback).

### Relaxed chain top ordering

As you saw in step 7 above, parallel transactions can cause each other to fail and roll back. In limited cases, you can write all your data in a single transaction with **relaxed chain top ordering** to prevent rollbacks. It tries to 'rebase' all the actions in the transaction onto the _new live state_ of the source chain if another function call changed the source chain state while the function was running.

You have to be careful, though, because the action hashes you get back from the host when you attempt to write data will be different after the rebase. If you want to try using relaxed chain top ordering, here are some guidelines:

* Actions within the transaction shouldn't depend on each other's hashes; for instance, the hash of action 1 shouldn't be used in the data of action 2.
* Actions shouldn't depend too exactly on the snapshotted source chain state; that is, action 1 shouldn't fail validation if the action immediately before it is different from what's expected.

You can find an example of writing data using relaxed chain top ordering on the [Entries page](/build/entries/#create-with-relaxed-chain-top-ordering).

## Zome function call lifecycle

A zome function call lifecycle begins when an external caller tries to call one of the functions in a zome of an active cell. The caller can be any one of:

* Another peer in the [same DNA network](/build/application-structure/#dna),
* A client such as a UI, running on the same machine as the participant's Holochain instance,
* Another cell in the same Holochain instance, or
* The same cell.

The caller must call the function by cell ID and zome name, and it must supply a valid [**capability claim**](/concepts/8_calls_capabilities/) in order to call the zome function.

Here's how the **call-zome workflow** handles a zome function call:

<!-- TODO: Make this into a sequence diagram -->

1. Check that the supplied capability claim matches a currently active capability grant. If it doesn't, return an unauthorized error to the caller.
3. Create a 'scratch space' containing a snapshot of the current state of the cell's source chain.
4. Dispatch the zome call payload to the correct cell/zome/function. At this point execution passes to the zome.
    1. The [HDK](https://crates.io/crates/hdk) attempts to deserialize the payload into the expected type.
    2. If deserialization fails, return an [`ExternResult::Err`](https://docs.rs/hdk/latest/hdk/map_extern/type.ExternResult.html#variant.Err) containing details of the error. Execution passes back to the call-zome workflow, which passes the error to the caller.
    3. The HDK passes the deserialized payload to the zome function. The function runs, calling the host API as needed. **Any functions that attempt to read from or write to the cell's source chain operate on the snapshot, not the source chain's current state.**
    4. The function returns a return value, and the HDK serializes it and passes it back to the call-zome workflow.
5. If there are no new writes in the scratch space, return the zome function's return value to the caller.
6. Generate [DHT operations](https://docs.rs/hdi/latest/hdi/prelude/enum.Op.html) from each action and dispatch them to the appropriate validation callbacks in the DNA's [integrity zome](/build/application-structure/#zome)(s).
    * If the action is a [CRUD action](/build/working-with-data/#crud-metadata-graph) for application data, only the validation callback for the integrity zome that defined the data type is called.
    * If the action is a system action, or a CRUD action for a system entry type, the validation callbacks in all integrity zomes in the DNA are called.

    If validation fails for _any_ of the operations, return the first <!-- FIXME: last? that seems to be what the `fold` does --> validation error.
7. Check whether the source chain's snapshot in the scratch space is older than the live source chain state, which happens if another call-zome workflow started and completed while this workflow was running.
    * If the snapshot is older, check if all the actions were written with relaxed chain top ordering.
        * If they were, create a fresh scratch space with a snapshot of the _new_ source chain state, rebase all of the new actions on top of it, and return to step 6.
        * If at least one wasn't, return a 'chain head moved' error to the caller.
8. Write the new actions to the source chain and store their corresponding DHT operations in the local DHT store.
9. Trigger the **publish** workflow in a separate thread, which will try to share the DHT operations with network peers.
10. Trigger the **post-commit** workflow in a separate thread, which will look for a [`post_commit` callback](/build/callbacks-and-lifecycle-hooks/#define-a-post-commit-callback) in the same zome as the called function, and pass the new actions to it.
11. Return the zome function's return value to the caller.

## References

* [`hdk_derive::hdk_extern`](https://docs.rs/hdk_derive/latest/hdk_derive/attr.hdk_extern.html)
* [`hdi::map_extern::ExternResult`](https://docs.rs/hdi/latest/hdi/map_extern/type.ExternResult.html)
* [`holochain_integrity_types::op::Op`](https://docs.rs/holochain_integrity_types/latest/holochain_integrity_types/op/enum.Op.html)

## Further reading

* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)
* [Build Guide: Zomes](/build/zomes/)
* [Build Guide: Lifecycle Events and Callbacks](/build/callbacks-and-lifecycle-hooks/)
* [Build Guide: Entries: Create with relaxed chain top ordering](/build/entries/#create-with-relaxed-chain-top-ordering)