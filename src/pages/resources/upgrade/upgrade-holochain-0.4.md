---
title: Holochain Upgrade 0.3 → 0.4
---

::: intro
For existing hApps that were written for Holochain 0.3, here's the guide to get you upgraded to 0.4.

NOTE: [Holonix](/get-started/install-advanced/), our developer shell environment, has also been updated. We recommend you [upgrade to the new Holonix](/resources/upgrade-new-holonix/) at the same time!
:::

## Summary

Here are all the breaking changes you need to know about in order to update your app for Holochain 0.4:

* Some unstable features are now behind feature flags.
* Zome call payloads are built and signed differently.
* The `OpenChain` and `CloseChain` actions have been modified.
* The database encryption scheme has been change, and the directory structure has moved around.
* The `InstallApp` admin API endpoint has had its request payload changed slightly.
* `CloneCellId`, used as an input argument to clone manipulation functions, has changed.
* The `CountersigningSuccess` signal supplies the action hash, not the entry hash.
* The `AppInfo` admin endpoint's response contains new statuses related to deferred memproofs.
* The WebRTC signalling server architecture has changed, along with new server addresses and self-hosted server binaries.
* Deprecated `OpType` and `op::to_type` have been removed from the HDI.
* Enums are serialized differently.

## Unstable features removed by default

The biggest change for 0.4 is that some unstable features aren't compiled into official Holochain releases by default. We're doing this to focus on a stable core Holochain with the minimal feature set that most projects need. The removed features are still available as Rust feature flags, so you can compile a custom Holochain binary if you need them. Here's the full list, along with their feature flags:

* **Countersigning `unstable-countersigning`**: Allows agents to temporarily lock their chains in order to agree to write the same entry to their respective chains.
* **DPKI / DeepKey `unstable-dpki`**: Implements a distributed public key infrastructure, allowing agents to manage their keys and confirm continuity of their identity across devices and source chains.
* **DHT sharding `unstable-sharding`**: Lessens the load of each peer in large network, allowing them to take responsibility for validating and storing only a subset of a DHT's entire data set.
* **Warrants `unstable-warrants`**: Spreads news of validation failure around the network, allowing peers to recognize bad actors and take action against them, even if they haven't directly interacted with them.
* **Chain head coordination `chc`**: Developed for Holo, allows source chain changes to be copied from one device to another without causing chain forks. (This pre-existing feature flag is no longer enabled by default.)
* **HDI/HDK functions `unstable-functions`**:
    * Related to countersigning (enable `unstable-countersigning` if you want to use these):
        * `accept_countersigning_preflight_request`
    * Related to DPKI (enable `unstable-dpki` if you want to use these):
        * `get_agent_key_lineage`
        * `is_same_agent`
    * Related to block lists (allowing peers in a hApp to selectively block others who haven't necessarily produced invalid data or forked their source chain):
        * `block_agent`
        * `unblock_agent`
    * Other:
        * `schedule`
        * An unimplemented `sleep` function has been removed completely
* TODO any more?

Read the [Holonix readme](https://github.com/holochain/holonix?tab=readme-ov-file#customized-holochain-build) to find out how to compile a custom Holochain build with these flags enabled.

`unstable-functions` is a flag used by both the Holochain conductor _and_ the `hdi` and `hdk` crates, and some of the functions also need other Holochain features enabled (e.g., `is_same_agent` requires a conductor with `unstable-dpki` enabled; see the list above). If you want to use them, you'll need to edit your zome crates' `Cargo.toml` files and make sure that users are running your custom conductor binary with the right features enabled. If you compile your zomes without `unstable-functions` enabled, users with the flag(s) enabled in Holochain will still be able to use your hApp, but if you enable it, users with the flag(s) disabled won't be able to use your hApp. If you use any of the unstable functions, note that the conductor will also need to have the corresponding feature enabled .

## Zome call signing

Signing a zome call payload was previously hard to get right, because the conductor would deserialize and reserialize the signed payload before checking the signature. Sometimes the client would order the payload's fields differently from the conductor, which would cause the signature to look invalid.

Now the payload must be serialized and signed in the client, then sent to the conductor along with the signature. The conductor will now check the signature against the _serialized_ payload before deserializing.

This is a BREAKING change for the `CallZome` app API endpoint. If you're using the JavaScript or Rust client lib, you don't need to make any code changes [TODO is this right?]; just update the client lib to v?? (JavaScript) TODO or v?? (Rust) TODO.

If you're a client library author, take a look at the new app API endpoint documentation TODO.

## DHT sharding is disabled by default

This feature needs more performance and correctness testing before it's production-ready. With the `unstable-sharding` feature flag disabled by default, your conductor config's `gossip_arc_clamping` must now be set to either `"full"` or `"empty"`, and the previous default `"none"` will cause a conductor startup error. `"gossip_dynamic_arcs"` is also ignored.

It's unknown exactly what might happen if nodes with DHT sharding disabled try to gossip in the same network as nodes without DHT sharding. Presumably this is still possible, but it might cause unexpected behaviors!

## Raw hash constructor function rename

`holo_hash::HoloHash<T>::from_raw_39_panicky` has been renamed to `from_raw_39`. Its behavior is otherwise the same. There are two new functions in the same impl, `try_from_raw_39` and `try_from_raw_36_and_type`, which return errors instead of panicking.

## `OpenChain` and `CloseChain` actions changed

If you're one of the rare folks who have been using these two actions, the structs have changed. `CloseChain::new_dna_hash` has been replaced with [`new_target`](TODO), which has a type of `Option<MigrationTarget>`. This new type TODO is an enum of `Dna(DnaHash)` or `Agent(AgentHash)`.

`OpenChain::prev_dna_hash` has been changed to match; its type is a non-optional `MigrationTarget`. It also gets a new field, `close_hash`, which is the `ActionHash` of the corresponding `CloseChain` action.

## Dynamic database encryption, folder structure changes

Previous conductor and keystore SQLite databases used a hardcoded encryption key; v0.4 now uses a dynamic key. This means you won't be able to import data from v0.3.

The database names have also changed; any file prefix that matches the folder it's in (e.g., `<root>/authorized/authorized-<dnahash>-<agentkey>.sqlite`) is dropped, along with the `.sqlite` file extension.

## `InstallApp` agent key is optional

The `agent_key` field in the `InstallApp` payload is now optional, and a key will be generated if you don't supply one. If your app is used to generating agent keys and supplying them on install, you shouldn't need to change your code; just update the client library and it'll work.

## `CloneCellId` changes

[TODO link] The `CloneCellId::CellId` enum variant has become `DnaHash` and contains, naturally, a `DnaHash` value. This type is used when enabling, disabling, or deleting clones from the app API or a coordinator zome.

## `CountersigningSuccess` information changed

The `CountersigningSuccess` signal sent to the client now gives the action hash of the successful countersigned commit rather than its entry hash.

## New data in `AppInfo` response

Holochain 0.4 introduces a new flow for app installation that lets an agent supply a membrane proof later with a new `ProvideMemProof` endpoint (TODO link). This allows them to get their freshly generated agent key, submit it to some sort of membrane proof service, and get a membrane proof.

Because of this, the [`DisabledReason` enum](TODO), after the membrane proof has been provided, will be a new `NotStartedAfterProvidingMemproofs` variant until the app is started.

## WebRTC signalling server change

The old signalling server has been replaced with a new one called [`sbd`](https://github.com/holochain/sbd/). If you're hosting your own server, switch to a [new `sbd` server binary](https://github.com/holochain/sbd/tags). If you're using Holo's public infrastructure, switch from `wss://signal.holo.host` to `wss://sbd-0.main.infra.holo.host` in your conductor config file. (The new URL will automatically be in any conductor config generated by the dev tools for 0.4.)

## Deprecated validation op functionality removed

In your integrity zome's validation functions, you deal with DHT operations, or ops. They are somewhat convoluted, so `FlatOp` was introduced to make things simpler. It was originally called `OpType`, and until now that old name was an alias of `FlatOp`. The old type has finally been removed, along with the `Op::to_type` method (use `Op::flattened` instead).

## Change in enum serialization

The default serialization for bare enum variants has changed. Previously, they would look like this (JSON representation):

```json
{
    "variant1": null
}
```

Now they look like this:

```json
"variant1"
```

(Enum variants with data still follow the `{ "variant": <data> }` pattern.)