---
title: Holochain Upgrade 0.6 → 0.7
---

::: intro
For existing hApps that are currently using Holochain 0.6, here's the guide to get you upgraded to 0.7.

There are three big changes in Holochain 0.7:

* **The action model has been rewritten.** An `Action` is now a `header` (the fields every action shares) plus a `data` payload. The per-variant action structs are gone, and `EntryCreationAction` is replaced by `TypedAction<EntryCreationData>`. This touches every integrity zome's `validate` callback and every coordinator zome's `signal_action` function, and it's the bulk of the upgrade work.
* **tx5 and WebRTC have been removed.** Iroh, over QUIC, is now the only network transport. The `signal_url` and `webrtc_config` conductor config fields are gone.
* **There is no data migration path.** DNA hashes change for otherwise-identical DNAs, and Holochain's databases have been renamed. Existing installs must have their data cleared.

If your hApp is written for Holochain 0.5, follow the [0.6 upgrade guide](/resources/upgrade/upgrade-holochain-0.6/) first.
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.6, follow these steps:

1. Update your `flake.nix` to use the 0.7 version of Holochain: {#update-nix-flake}

    ```diff
     {
       description = "Flake for Holochain app development";
       inputs = {
    -    holonix.url = "github:holochain/holonix?ref=main-0.6";
    +    holonix.url = "github:holochain/holonix?ref=main-0.7";
         nixpkgs.follows = "holonix/nixpkgs";
         flake-parts.follows = "holonix/flake-parts";
       };
       outputs = inputs@{ flake-parts, ... }: flake-parts.lib.mkFlake { inherit inputs; } {
         systems = builtins.attrNames inputs.holonix.devShells;
         perSystem = { inputs', pkgs, ... }: {
           formatter = pkgs.nixpkgs-fmt;
           devShells.default = pkgs.mkShell {
             inputsFrom = [ inputs'.holonix.devShells.default ];
             packages = (with pkgs; [
    -          nodejs_22
    +          nodejs_24
               binaryen
             ]);
             shellHook = ''
               export PS1='\[\033[1;34m\][holonix:\w]\$\[\033[0m\] '
             '';
           };
         };
       };
     }
    ```

    This will take effect later when you enter a new Nix shell. It's important to update your Nix flake lockfile at this point, to ensure you benefit from the cache we provide:

    ```shell
    nix flake update && git add flake.* && nix develop
    ```

    If your zome tests use Sweettest, one of the `holochain` crate's build dependencies needs `perl` on your `PATH`. If your test build fails looking for it, add it to the `packages` list above.
2. Update your root `package.json` with the new `hc-spin` version: {#update-package-json}

    <!-- TODO(upgrade): Update this version number for new 0.7.x releases -->

    ```diff:json
     {
         "devDependencies": {
    -        "@holochain/hc-spin": "^0.601.3",
    +        "@holochain/hc-spin": "^0.700.0",
             "concurrently": "^6.5.1",
             "get-port-cli": "^3.0.0"
         }
     }
    ```
3. Update your project's package dependencies ([see below](#update-your-package-dependencies)).
4. Follow the [breaking change update instructions](#update-your-application-code) below to get your code working again.
5. Update your [conductor config file](#conductor-config-file-changes), if you maintain one.
6. Clear any existing conductor data. Holochain 0.7 can't read databases written by 0.6, and DNA hashes have changed, so you'll be joining a new network:

    ```shell
    hc sandbox clean
    ```
7. Try running your tests:

    ```shell
    npm test
    ```

    and starting the application:

    ```shell
    npm start
    ```
8. Be aware of some changes that won't break your build but may affect your hApp's runtime behavior. Read the [guide at the bottom](#subtle-changes).

## Update your package dependencies

### Rust

Update the `hdk` and `hdi` version strings in the project's root `Cargo.toml` file:

<!-- TODO(upgrade): Update these version numbers for new 0.7.x releases -->

```diff:toml
 [workspace.dependencies]
-hdi = "=0.7.1"
-hdk = "=0.6.1"
+hdi = "=0.8.0"
+hdk = "=0.7.0"
```

The latest version numbers of these libraries can be found on `crates.io`: [`hdi`](https://crates.io/crates/hdi), [`hdk`](https://crates.io/crates/hdk).

If your coordinator zomes have a `holochain` dev-dependency for Sweettest tests, its feature list needs three changes: the `sqlite-encrypted` feature has been replaced by `encryption`, `wasmer_sys` has been renamed to `wasmer-sys-cranelift`, and `transport-iroh` no longer exists because iroh is now compiled in unconditionally.

<!-- TODO(upgrade): Update this version number for new 0.7.x releases -->

```diff:toml
 [workspace.dependencies]
-holochain = { version = "0.6.1", default-features = false, features = ["sqlite-encrypted", "wasmer_sys", "transport-iroh"] }
+holochain = { version = "0.7.0", default-features = false, features = ["encryption", "wasmer-sys-cranelift"] }
```

```diff:toml
 [dev-dependencies]
-holochain = { workspace = true, features = ["wasmer-sys-cranelift", "transport-iroh", "test_utils"] }
+holochain = { workspace = true, features = ["wasmer-sys-cranelift", "test_utils"] }
 tokio = { workspace = true }
```

A number of crates have also removed the implicit Cargo features that came from enabling an optional dependency. If any of your crates enable features on Holochain crates directly, these are the renames most likely to affect you:

| Crate | Removed feature | Use instead |
|---|---|---|
| `holo_hash` | `serde`, `serde_bytes` | `serialization` |
| `hdi` | `tracing`, `tracing-core` | `trace` |
| `holochain_integrity_types` | `subtle-encoding` | `full` |
| `holochain_zome_types` | `serde_yaml` | `properties` |
| `holochain_trace` | `tokio`, `shrinkwraprs` | `channels` |
| `holochain_util` | `tokio` | `tokio_helper` |
| `holochain_nonce` | `subtle-encoding` | `full` |

Separately, `holo_hash` and `holochain_zome_types` no longer depend on `rusqlite` at all, so their `sqlite` and `sqlite-encrypted` features have been removed rather than renamed. `holo_hash`'s `full` feature no longer implies `sqlite` either.

Once you've updated your `Cargo.toml` you need to update your `Cargo.lock`:

```shell
cargo update
```

### JavaScript

Update the client library in `ui/package.json`:

<!-- TODO(upgrade): Update this version number for new 0.7.x releases -->

```diff:json
   "dependencies": {
-    "@holochain/client": "^0.20.5",
+    "@holochain/client": "^0.21.0",
     // more dependencies
   },
```

If you still use Tryorama for your tests rather than Sweettest, it's community-managed at [`holochain-open-dev/tryorama`](https://github.com/holochain-open-dev/tryorama). All the [client library changes](#javascript-client-changes) below apply to Tryorama tests too.

Then in your project's root folder, run your package manager's install command to update the lockfile and install the new package versions:

```shell
npm install
```

## Update your application code

### Some crate-root re-exports have been removed

If your zomes only import from `hdi::prelude` and `hdk::prelude`, you're unaffected and can skip this.

If you import shared types by a more specific path, you may hit unresolved imports. `holochain_integrity_types` no longer re-exports its prelude (or `Entry`) at the crate root, and `holochain_zome_types` no longer re-exports `Action`/`Entry` at its crate root. Several `holochain_zome_types` modules that existed only to re-export their `holochain_integrity_types` counterparts --- `chain`, `countersigning`, `crdt`, `genesis`, `record` and `trace` --- have been removed outright, and others such as `action`, `capability`, `entry`, `link`, `op` and `warrant` no longer re-export wholesale.

Import from a prelude instead:

```diff:rust
-use holochain_zome_types::action::Action;
-use holochain_integrity_types::Entry;
+use holochain_zome_types::prelude::Action;
+use holochain_integrity_types::prelude::Entry;
```

### The action model has changed

This is the change that will require the most work. In Holochain 0.6, an `Action` was an enum whose variants each carried their own struct, and each of those structs repeated the fields common to all actions:

```rust
// Holochain 0.6
match action {
    Action::Create(create) => {
        // `create.author`, `create.timestamp`, but also `create.entry_type`
    }
    // ...
}
```

In 0.7, an [`Action`](https://docs.rs/hdi/0.8.0/hdi/prelude/struct.Action.html) is a struct with two fields: a `header` holding the fields every action shares, and a `data` enum holding only the fields specific to that action type.

```rust
// Holochain 0.7
match &action.data {
    ActionData::Create(create) => {
        // `action.header.author`, `action.header.timestamp`, and `create.entry_type`
    }
    // ...
}
```

`ActionHeader` holds `author`, `timestamp`, `action_seq` and `prev_action`. Everything else lives in the `ActionData` variant.

The `...Data` structs carry the same fields their 0.6 counterparts did, minus the four header fields that were lifted out of them. So when you're looking for a field, it either moved to `header` or kept its name on the data struct. Only a handful were renamed, and those are listed [below](#flat-op-sub-types-carry-a-typed-action).

Use this table to rename types in your zome code. Every `Action` variant follows the same pattern --- the enum is now `ActionData`, matched on `action.data`, and each variant's payload struct gains a `Data` suffix:

| Holochain 0.6 | Holochain 0.7 |
|---|---|
| `Action::Create(c)` | `ActionData::Create(c)`, matched on `action.data` |
| `Create`, `Update`, `Delete` | `CreateData`, `UpdateData`, `DeleteData` |
| `CreateLink`, `DeleteLink` | `CreateLinkData`, `DeleteLinkData` |
| `Dna`, `AgentValidationPkg`, `InitZomesComplete` | `DnaData`, `AgentValidationPkgData`, `InitZomesCompleteData` |
| `OpenChain`, `CloseChain` | `OpenChainData`, `CloseChainData` |
| `EntryCreationAction` | `TypedAction<EntryCreationData>` |
| `action.author`, `action.timestamp` | `action.author()`, `action.timestamp()` |

The `ActionBuilder` and `ActionBuilderCommon` builders, the `NewEntryAction`/`NewEntryActionRef` enums, and the `rate_limit` module have all been removed.

### `FlatOp` variants have been renamed

The [`FlatOp`](https://docs.rs/hdi/0.8.0/hdi/flat_op/enum.FlatOp.html) enum you match on in your `validate` callback has been renamed to describe what happened rather than what the DHT does about it. The two link variants have also been folded into a single `Link` variant wrapping an `OpLink`.

| Holochain 0.6 | Holochain 0.7 |
|---|---|
| `FlatOp::StoreEntry(..)` | `FlatOp::CreateEntry(..)` |
| `FlatOp::StoreRecord(..)` | `FlatOp::CreateRecord(..)` |
| `FlatOp::RegisterUpdate(..)` | `FlatOp::Update(..)` |
| `FlatOp::RegisterDelete(..)` | `FlatOp::Delete(OpDelete { action })` |
| `FlatOp::RegisterCreateLink { .. }` | `FlatOp::Link(OpLink::CreateLink { link_type, action })` |
| `FlatOp::RegisterDeleteLink { .. }` | `FlatOp::Link(OpLink::DeleteLink { link_type, action, original_action })` |
| `FlatOp::RegisterAgentActivity(..)` | `FlatOp::AgentActivity(..)` |

### `FlatOp` sub-types carry a `TypedAction`

`OpEntry`, `OpUpdate`, `OpDelete`, `OpRecord`, `OpActivity` and `OpLink` now carry a [`TypedAction<D>`](https://docs.rs/hdi/0.8.0/hdi/flat_op/struct.TypedAction.html) — the action's `ActionHeader` paired with exactly the `ActionData` payload that the variant you matched guarantees — instead of a fully generic `Action`. You no longer have to match again to get at the data you already know is there.

`TypedAction<D>` dereferences to its `data`, so you can read the payload fields straight off the action without writing `.data` --- `action.entry_hash` rather than `action.data.entry_hash`. You still need `.data` when you want to consume a field by value rather than borrow it, because you can't move out of a deref. `action.data.target_address.into_action_hash()` compiles; `action.target_address.into_action_hash()` doesn't.

Because that data is now directly available, the fields that used to be copied out alongside the action are gone. Read them from the action instead:

| Removed field | Read instead |
|---|---|
| `original_action_hash` on `OpRecord::UpdateEntry` | `action.original_action_address` |
| `original_action_hash` on `OpRecord::DeleteEntry` | `action.deletes_address` |
| `original_action_hash` on `OpRecord::DeleteLink` | `action.link_add_address` |
| `base_address`, `target_address`, `tag` on `OpRecord::CreateLink` | `action.base_address`, `.target_address`, `.tag` |
| `base_address` on `OpRecord::DeleteLink` | `action.base_address` |

A `DeleteLink` action only records the link's base address and the hash of the `CreateLink` it deletes, so its target address and tag aren't on it. Under `FlatOp::Link` you don't need to chase that yourself: `OpLink` has `base_address()`, `target_address()` and `tag()` getters that read from the `original_action` when the variant is a `DeleteLink`.

`OpUpdate::original_action_hash()` and `original_entry_hash()` remain as accessor methods. The `CreateAgent` and `UpdateAgent` variants of `OpEntry`, `OpRecord` and `OpActivity` still carry `agent`, `new_key` and `original_key` as plain fields, so you can bind them in the match arm as before.

### Update your validation function signatures

Your entry validation functions take `TypedAction` values in place of the old action structs:

```diff:rust
 pub fn validate_create_post(
-    _action: EntryCreationAction,
+    _action: TypedAction<EntryCreationData>,
     _post: Post,
 ) -> ExternResult<ValidateCallbackResult> {
     Ok(ValidateCallbackResult::Valid)
 }

 pub fn validate_update_post(
-    _action: Update,
+    _action: TypedAction<UpdateData>,
     _post: Post,
-    _original_action: EntryCreationAction,
+    _original_action: TypedAction<EntryCreationData>,
     _original_post: Post,
 ) -> ExternResult<ValidateCallbackResult> {
     Ok(ValidateCallbackResult::Valid)
 }

 pub fn validate_delete_post(
-    _action: Delete,
-    _original_action: EntryCreationAction,
+    _action: TypedAction<DeleteData>,
+    _original_action: TypedAction<EntryCreationData>,
     _original_post: Post,
 ) -> ExternResult<ValidateCallbackResult> {
     Ok(ValidateCallbackResult::Valid)
 }
```

Link validation functions collapse down to just their action arguments, because the base address, target address and tag are all reachable through the action:

```diff:rust
 pub fn validate_create_link_all_posts(
-    _action: CreateLink,
-    _base_address: AnyLinkableHash,
-    target_address: AnyLinkableHash,
-    _tag: LinkTag,
+    action: TypedAction<CreateLinkData>,
 ) -> ExternResult<ValidateCallbackResult> {
-    let action_hash = target_address
-        .into_action_hash()
-        .ok_or(wasm_error!(WasmErrorInner::Guest(
-            "No action hash associated with link".to_string()
-        )))?;
+    let action_hash = action
+        .data
+        .target_address
+        .into_action_hash()
+        .ok_or(wasm_error!(WasmErrorInner::Guest(
+            "No action hash associated with link".to_string()
+        )))?;
     let record = must_get_valid_record(action_hash)?;
     // ...
 }

 pub fn validate_delete_link_all_posts(
-    _action: DeleteLink,
-    _original_action: CreateLink,
-    _base: AnyLinkableHash,
-    _target: AnyLinkableHash,
-    _tag: LinkTag,
+    _action: TypedAction<DeleteLinkData>,
+    _original_action: TypedAction<CreateLinkData>,
 ) -> ExternResult<ValidateCallbackResult> {
     Ok(ValidateCallbackResult::Valid)
 }
```

Anywhere your validation logic reads a common action field, use the accessor for it. `Action` and `TypedAction<D>` both have `author()`, `timestamp()`, `action_seq()` and `prev_action()`, so you rarely need to reach into `header` yourself:

```diff:rust
-if &action.author != record.action().author() {
+if action.author() != record.action().author() {
     return Err(wasm_error!(WasmErrorInner::Guest(
         "Only the author can link their own post".to_string()
     )));
 }
```

### Update the `validate` callback body

The body of `validate` is scaffolded code that dispatches to the functions above, so most of this work is mechanical. The quickest way through it is to scaffold a throwaway app with the same entry and link types and copy its dispatcher across.

Two patterns in the dispatcher are worth knowing, because you'll hit them wherever you hand-edit it.

The first is **widening**. In a `CreateEntry` arm you hold a `TypedAction<CreateData>`, but the validation function takes a `TypedAction<EntryCreationData>` so it can be shared with the update path. That conversion can't fail, so it's a plain `.into()`, where 0.6 wrapped the action in an `EntryCreationAction::Create` at the call site:

```rust
let action: TypedAction<EntryCreationData> = action.into();
```

The second is **narrowing** an `Action` you've fetched yourself, where you know what it must be but the type doesn't. Each single-variant data type has a `try_from_action` for this, which replaces hand-matching on `ActionData` and rebuilding the `TypedAction`:

```diff:rust
-let record = must_get_valid_record(original_action_hash)?;
-let create_link = match record.action() {
-    Action::CreateLink(create_link) => create_link.clone(),
-    _ => {
-        return Ok(ValidateCallbackResult::Invalid(
-            "The action that a DeleteLink deletes must be a CreateLink".to_string(),
-        ));
-    }
-};
+let record = must_get_valid_record(action.link_add_address.clone())?;
+let create_link = TypedAction::<CreateLinkData>::try_from_action(record.action().clone())?;
```

Note that the failure case disappears rather than moving. Sys validation has already guaranteed that a `DeleteLink` points at a `CreateLink`, so a narrowing failure here means that guarantee was violated --- which is a fault, not bad data from the author. Propagate it with `?` instead of returning `ValidateCallbackResult::Invalid`, which would wrongly blame the author. `TypedAction::<D>::try_from` is also available if you want the `WrongActionError` rather than an `ExternResult`.

The agent activity arm keeps its `agent` binding, but `prev_action` is now an `Option` on the header, because the genesis `Dna` action has no predecessor:

```diff:rust
-FlatOp::RegisterAgentActivity(agent_activity) => match agent_activity {
-    OpActivity::CreateAgent { agent, action } => {
-        let previous_action = must_get_action(action.prev_action)?;
-        match previous_action.action() {
-            Action::AgentValidationPkg(AgentValidationPkg { membrane_proof, .. }) => {
-                validate_agent_joining(agent, membrane_proof)
-            }
+FlatOp::AgentActivity(agent_activity) => match agent_activity {
+    OpActivity::CreateAgent { agent, action } => {
+        let prev = action
+            .prev_action()
+            .ok_or_else(|| wasm_error!(WasmErrorInner::Guest("expected a prior action".into())))?
+            .clone();
+        let previous_action = must_get_action(prev)?;
+        match &previous_action.action().data {
+            ActionData::AgentValidationPkg(AgentValidationPkgData { membrane_proof, .. }) => {
+                validate_agent_joining(agent, membrane_proof)
+            }
             _ => Ok(ValidateCallbackResult::Invalid(
                 "The previous action for a `CreateAgent` action must be an `AgentValidationPkg`"
                     .to_string(),
             )),
         }
     }
     // ...
 }
```

### Update `signal_action` in your coordinator zomes

The scaffolded `signal_action` function matches on the action type, so it needs the same treatment:

```diff:rust
 fn signal_action(action: SignedActionHashed) -> ExternResult<()> {
-    match action.hashed.content.clone() {
-        Action::CreateLink(create_link) => {
+    match &action.hashed.content.clone().data {
+        ActionData::CreateLink(create_link) => {
             // ...
         }
-        Action::DeleteLink(delete_link) => {
+        ActionData::DeleteLink(delete_link) => {
             let record = get(delete_link.link_add_address.clone(), GetOptions::default())?.ok_or(
                 wasm_error!(WasmErrorInner::Guest(
                     "Failed to fetch CreateLink action".to_string()
                 )),
             )?;
-            match record.action() {
-                Action::CreateLink(create_link) => {
+            match &record.action().data {
+                ActionData::CreateLink(create_link) => {
                     // ...
                 }
                 // ...
             }
         }
-        Action::Create(_create) => { /* ... */ }
+        ActionData::Create(_create) => { /* ... */ }
-        Action::Update(update) => { /* ... */ }
+        ActionData::Update(update) => { /* ... */ }
-        Action::Delete(delete) => { /* ... */ }
+        ActionData::Delete(delete) => { /* ... */ }
         _ => Ok(()),
     }
 }
```

### `Record::new` takes a `RecordEntry`

[`Record::new`](https://docs.rs/hdi/0.8.0/hdi/prelude/struct.Record.html#method.new) now takes a `RecordEntry` rather than an `Option<Entry>`, so that "there is no entry" and "the entry is hidden from you" are distinguishable.

```diff:rust
 match details {
-    Details::Entry(details) => Ok(Some(Record::new(
-        details.actions[0].clone(),
-        Some(details.entry),
-    ))),
+    Details::Entry(details) => Ok(Some(Record::new(
+        details.actions[0].clone(),
+        RecordEntry::Present(details.entry),
+    ))),
     _ => Err(wasm_error!(WasmErrorInner::Guest(
         "Malformed get details response".to_string()
     ))),
 }
```

### `get_agent_activity` takes a `GetOptions`

[`get_agent_activity`](https://docs.rs/hdk/0.7.0/hdk/chain/fn.get_agent_activity.html) now takes a fourth argument specifying how to fetch the activity, and its return type has been renamed from `AgentActivity` to `AgentActivityStatus` to resolve a name collision with the unrelated `AgentActivity` op variant.

```diff:rust
-let activity: AgentActivity = get_agent_activity(
+let activity: AgentActivityStatus = get_agent_activity(
     agent,
     ChainQueryFilter::new(),
     ActivityRequest::Full,
+    GetOptions::default(),
 )?;
```

### `ChainFilter` uses constructors instead of a builder

[`ChainFilter`](https://docs.rs/hdi/0.8.0/hdi/prelude/struct.ChainFilter.html) no longer composes its limit conditions through chained builder methods. Each condition now has its own constructor that takes the chain top, so a filter carries exactly one limit condition.

```diff:rust
-let filter = ChainFilter::new(chain_top).until_hash(oldest_hash);
+let filter = ChainFilter::until_hash(chain_top, oldest_hash);
```

```diff:rust
-let filter = ChainFilter::new(chain_top).take(10);
+let filter = ChainFilter::take(chain_top, 10);
```

`ChainFilter::new`, `ChainFilter::until_timestamp` and the `include_cached_entries` builder method are all still available.

### `must_get_agent_activity` has more response variants

[`must_get_agent_activity`](https://docs.rs/hdk/0.7.0/hdk/chain/fn.must_get_agent_activity.html) now walks down the chain from the `chain_top` you give it and excludes any forked actions, and it reports more precisely when it can't give you a deterministic answer. If you match on `MustGetAgentActivityResponse`, handle the new variants:

* `UntilHashMissing` — the `UntilHash` you asked for wasn't found, including when it's on a dropped fork.
* `UntilHashAfterChainHead` — the `UntilHash` you asked for is later in the chain than `chain_top`.
* `UntilTimestampIndeterminate` — the chain can't be bounded deterministically by the timestamp given.
* `IncompleteChain` — the chain between the bounds isn't fully available.

A `ChainFilter` with `LimitConditions::Take(0)` is now rejected as invalid input rather than returning an empty result.

### `block_agent` and `unblock_agent` have been removed

These HDK functions are gone. Blocking is a system-level behavior driven by warrants, not something an application decides. Remove any calls to them.

### Try building your zomes

Now run:

```bash
npm run build:zomes
```

to see if all your updated dependencies and zome code compile.

## Rust client and test changes

These only apply if you use the Rust `holochain_client` crate, or write Sweettest tests that sign data directly.

### `dump_network_stats` returns `HolochainTransportStats`

The admin and app websockets used to return different types --- `kitsune2_api::ApiTransportStats` and `kitsune2_api::TransportStats` respectively, with the app response missing blocked message counts. Both now return `HolochainTransportStats`, which also converts Kitsune2 `Space` values into `DnaHash` values so you can use them directly.

```diff:rust
-let stats: kitsune2_api::TransportStats = app_ws.dump_network_stats().await?;
+let stats: HolochainTransportStats = app_ws.dump_network_stats().await?;
```

### Signing traits have moved to `holochain_keystore`

`holochain_types` no longer depends on `holochain_keystore`, so the signing and verification extension methods that used to hang off `holochain_types` types now live in `holochain_keystore`. If you call `SignedActionHashed::sign`, `ValidationReceipt::sign` or `WarrantOp::sign`, import the trait from its new home:

```diff:rust
-use holochain_types::prelude::SignedActionHashedExt;
+use holochain_keystore::SignedActionHashedExt;
```

The corresponding traits for the other types are `ValidationReceiptExt`, `WarrantOpExt` and `ReportEntryFetchedOpsExt`. `holochain_types::prelude` also no longer re-exports `holochain_keystore::AgentPubKeyExt`.

## JavaScript client changes {#javascript-client-changes}

### `SignedActionHashed` is no longer generic

Because there are no longer per-variant action types, `SignedActionHashed` doesn't take a type parameter, and the `Create`, `Update`, `Delete`, `CreateLink` and `DeleteLink` types are no longer exported. If your app has scaffolded signal types, they'll look like this:

```diff:typescript
 import type {
   ActionHash,
   AgentPubKey,
-  Create,
-  CreateLink,
-  Delete,
-  DeleteLink,
   SignedActionHashed,
   Timestamp,
-  Update,
 } from "@holochain/client";

 export type MyAppSignal =
   | {
       type: "EntryCreated";
-      action: SignedActionHashed<Create>;
+      action: SignedActionHashed;
       app_entry: EntryTypes;
     }
   | {
       type: "LinkCreated";
-      action: SignedActionHashed<CreateLink>;
+      action: SignedActionHashed;
       link_type: string;
     };
```

### Common action fields have moved under `header`

The same `header`/`data` split applies on the JavaScript side:

```diff:typescript
-const author = encodeHashToBase64(action.hashed.content.author);
-const createdAt = action.hashed.content.timestamp;
+const author = encodeHashToBase64(action.hashed.content.header.author);
+const createdAt = action.hashed.content.header.timestamp;
```

### `dumpNetworkStats` returns `ApiTransportStats`

Both the app and admin websockets now return the same `ApiTransportStats` type, which nests the transport statistics under `transport_stats` and adds `blocked_message_counts`. The `is_webrtc` property on a connection has been renamed to `is_direct`.

```diff:typescript
-import { type TransportStats } from "@holochain/client";
+import { type ApiTransportStats } from "@holochain/client";

-const stats: TransportStats = await client.dumpNetworkStats();
-const connected = stats.connections.length;
-const direct = stats.connections.filter((c) => c.is_webrtc).length;
+const stats: ApiTransportStats = await client.dumpNetworkStats();
+const connected = stats.transport_stats.connections.length;
+const direct = stats.transport_stats.connections.filter((c) => c.is_direct).length;
```

### `signalingServerUrl` renamed

The `signalingServerUrl` field in `ConnectionServices` is now `relayServerUrl`, reflecting the move to iroh relays.

## Conductor config file changes

This step is only relevant if you're working with hard-coded `conductor-config.yaml` files, such as when you're building executables with the [kangaroo-electron](https://github.com/holochain/kangaroo-electron) template.

Note that `NetworkConfig` rejects unknown fields, so a config that still sets `signal_url` or `webrtc_config` won't just be ignored — the conductor will fail to start.

```diff:yaml
 tracing_override: ~
+wasm_backend: ~
 data_root_path: "###DEFINED_AT_RUNTIME###"
 keystore:
   type: lair_server
   connection_url: "###DEFINED_AT_RUNTIME###"
 admin_interfaces:
   - driver:
       type: websocket
       port: "###DEFINED_AT_RUNTIME###"
       danger_bind_addr: ~
       allowed_origins: "###DEFINED_AT_RUNTIME###"
 network:
   base64_auth_material_bootstrap: ~
   base64_auth_material_relay: ~
   bootstrap_url: "###DEFINED_AT_RUNTIME###"
-  signal_url: "###DEFINED_AT_RUNTIME###"
   relay_url: "###DEFINED_AT_RUNTIME###"
-  webrtc_config: ~
+  request_timeout_s: 60
   target_arc_factor: 1
   report: none
   advanced: ~
-request_timeout_s: 60
-chc_url: ~
-db_sync_strategy: Resilient
+db_sync_level: Normal
 tuning_params: ~
 tracing_scope: ~
```

The individual changes are:

* `signal_url` and `webrtc_config` are removed, along with the tx5/WebRTC transport they configured.
* `request_timeout_s` has moved from the top level into `network`.
* `db_sync_strategy` has been renamed to `db_sync_level`, and its values have changed from `Fast`/`Resilient` to `Full`/`Normal`/`Off`. The old default `Resilient` maps to the new default `Normal`; `Fast` maps to `Off`.
* `chc_url` has been removed.
* `wasm_backend` is new and optional. Holochain can now be built with more than one WASM backend enabled, and this picks which one to use at runtime: `"cranelift"`, `"LLVM"` or `"wasmi"`. Leave it unset to use whichever backend is available.

If you are using a local iroh relay as your `relay_url`, you still need to allow unencrypted relay connections:

```diff:yaml
 network:
-  advanced: ~
+  advanced:
+    irohTransport:
+      relayAllowPlainText: true
```

## Subtle changes

The following changes may not break your build, but they may require you to reassess whether your hApp will work as expected:

* **Existing installs won't work.** The way zome definitions are serialized has changed, so the `DnaHash` of an otherwise-identical DNA is different in 0.7. Holochain's databases have also been renamed, with no migration path. Existing installs need their data cleared, and agents on 0.7 form a new network separate from the 0.6 one.
* **Compiled WASM is cached in the database.** Modules are compiled on demand and stored in a table in the WASM database instead of in a `wasm-cache` directory under the data root. The directory is no longer used, and WASM is now loaded when an app is installed or enabled rather than for every installed cell at startup.
* **App and web-app manifests reject unknown fields.** Stray or misspelled fields left over from earlier manifest schemas are now an error rather than being ignored.
* **`hc sandbox` no longer offers the `webrtc` network type.** Only `mem` and `quic` remain. If you have scripts that pass `webrtc`, update them.
* **`get_agent_activity` can return `ChainStatus::Closed`.** This is reported when an agent's source chain head is a `CloseChain` action. It ranks above `Valid` but below `Forked` and `Invalid`.
* **`StorageInfo` reports different numbers.** `DnaStorageInfo` no longer has `authored_data_size` or `cache_data_size` fields. Source-chain data now lives in the per-DNA DHT database and is counted in `dht_data_size`.
* **`CapAccess` has been renamed to `CapAccessType`** where it's used as the `CapGrant.cap_access` column discriminant. The data-carrying grant access type used by `ZomeCallCapGrant` keeps the `CapAccess` name.
* **DNA migration support has been added.** A new `InitProperties` type can be set on `RoleSettings::Provisioned` at install time to seed a freshly migrated chain. The bytes are opaque to the conductor, are never written to the DHT, and can only be read from the `init` callback via the `get_init_properties` host function.
* **`ListApps` can filter for apps awaiting membrane proofs**, via the new `AppStatusFilter::AwaitingMemproofs` variant.
