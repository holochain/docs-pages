---
title: Holochain Upgrade 0.3 → 0.4
---

::: intro
For existing hApps that are currently using Holochain 0.3, here's the guide to get you upgraded to 0.4.

NOTE: [Holonix](/get-started/install-advanced/), our developer shell environment, has also been updated. We're not supporting the old Holonix for Holochain 0.4 and beyond, so you'll need to [upgrade to the new Holonix](/resources/upgrade/upgrade-new-holonix/) at the same time if you haven't already!
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.3, follow these steps:

1. Check whether your `flake.nix` contains `github:holochain/holonix`. If it does, then you can continue to the next step. Otherwise it will contain `github:holochain/holochain`. If so, then follow the [Holonix upgrade guide](/resources/upgrade/upgrade-new-holonix/) to update to the newest Holonix command-line developer environment (we're not providing a 0.4 version of Holochain through the old Holonix).
2. Update your `flake.nix` to use the 0.4 version of Holochain by changing the version number in the line `holonix.url = "github:holochain/holonix?ref=main-0.3"` from 0.3 to 0.4. This will take effect later when you enter a new Nix shell. It's important to update your Nix flake lockfile  at this point, to ensure you benefit from the cache we provide:

    ```shell
    nix flake update && nix develop
    ```
3. Update your project's package dependencies ([see below](#update-your-package-dependencies)).
4. Follow the [breaking change update instructions](#update-your-application-code) below to get your code working again.
5. Try running your tests:

    ```shell
    npm test
    ```

    and starting the application:

    ```shell
    npm start
    ```
6. Be aware of some changes that won't break your app but may affect its runtime behavior. Read the [guide at the bottom](#subtle-changes).

## Update your package dependencies

### Rust

Update the `hdk` and `hdi` version strings in the project's root `Cargo.toml` file:

```diff:toml
 [workspace.dependencies]
-hdi = "=0.4.6"
-hdk = "=0.3.6"
+hdi = "=0.5.0" # Pick a later version of these libraries if you prefer.
+hdk = "=0.4.0"
 serde = "1.0"
```

The latest version numbers of these libraries can be found on crates.io: [`hdi`](https://crates.io/crates/hdi), [`hdk`](https://crates.io/crates/hdk).

Once you've updated your `Cargo.toml` you need to update your `Cargo.lock` and check whether your project can still build. To do this in one step you can run:

```shell
cargo build
```

### (Optional) Update other Rust dependencies

Running a Cargo build, like suggested above, will update as few dependencies as it can. This is good for stability because it's just making the changes you asked for. However, sometimes you do need to update other dependencies to resolve build issues.

This section is marked as optional because it's possible that new dependencies could introduce new issues as well as fixing existing conflicts or problems. To make it possible to roll back this change, it might be a good idea to commit the changes you've made so far to source control. Then you can run:

```shell
cargo update
```

This will update your `Cargo.lock` with the latest versions of all libraries that the constraints in your `Cargo.toml` files will allow. Now you should try building your project again to see if that has resolved your issue.

### JavaScript

#### Command-line tools

If you've created your hApp using our scaffolding tool, you should be able to follow these instructions. If you've created your own project folder layout, adapt these instructions to fit.

Edit your project's root `package.json` file to update the developer tools:

```diff:json
   "devDependencies": {
     "@holochain-playground/cli": "^0.300.1",
-    "@holochain/hc-spin": "0.300.3",
+    "@holochain/hc-spin": "^0.400.0",
     // more dependencies
   },
```

#### Tryorama tests

Edit your project's `tests/package.json` file:

```diff:json
   "dependencies": {
     // some dependencies
-    "@holochain/client": "^0.17.1",
-    "@holochain/tryorama": "^0.16.0",
+    "@holochain/client": "^0.18.0",
+    "@holochain/tryorama": "^0.17.0",
     // more dependencies
   },
```

#### UI

You'll update the UI package dependencies similarly to the test package. Edit `ui/package.json`:

```diff:json
   "dependencies": {
-    "@holochain/client": "^0.17.1",
+    "@holochain/client": "^0.18.0",
     // more dependencies
   },
```

Then in your project's root folder, run your package manager's update command to update the lockfile and install new package versions for your command-line tools, tests, and UI. Use the command that matches your chosen package manager. For example, if you're using `npm`:

```shell
npm install
```

## Update your application code

Here are all the breaking changes you need to know about in order to update your app for Holochain 0.4.

### Unstable features removed by default

The biggest change for 0.4 is that some features are marked `unstable` and aren't compiled into Holochain by default. We're doing this to focus on a stable core Holochain with the minimal feature set that most projects need. The removed features are still available as Rust feature flags, so you can compile a custom Holochain binary if you need them. Here's the full list, along with their feature flags:

* **[Countersigning](/concepts/10_countersigning/) `unstable-countersigning`**: Allows agents to temporarily lock their chains in order to agree to write the same entry to their respective chains.
* **DPKI / DeepKey `unstable-dpki`**: Implements a distributed public key infrastructure, allowing agents to manage their keys and confirm continuity of their identity across devices and source chains. Read the [DeepKey readme](https://github.com/holochain/deepkey) for more info.
* **[DHT sharding](/concepts/4_dht/) `unstable-sharding`**: Lessens the load of each peer in large network, allowing them to take responsibility for validating and storing only a subset of a DHT's entire data set. Omitting this flag doesn't disable code, but it does force you to choose either `"empty"` or `"full"` for DHT arc size clamping.
* **[Warrants](/concepts/7_validation#remembering-validation-results) `unstable-warrants`**: Spreads news of validation failure around the network, allowing peers to recognize bad actors and take action against them, even if they haven't directly interacted with them.
* **Chain head coordination `chc`**: Developed for Holo, allows source chain changes to be copied to a remote server for restoring onto the same device or syncing across devices. (This pre-existing feature flag is no longer enabled by default.)
* **HDI/HDK functions `unstable-functions`**:
    * Related to countersigning (enable `unstable-countersigning` if you want to use these):
        * [`accept_countersigning_preflight_request`](https://github.com/holochain/holochain/blob/holochain-0.4.0/crates/hdk/src/countersigning.rs#L3-L22)
    * Related to DPKI (enable `unstable-dpki` if you want to use this, which is new to 0.4):
        * [`get_agent_key_lineage`](https://github.com/holochain/holochain/blob/holochain-0.4.0/crates/hdk/src/agent.rs#L10-L20)
    * Related to block lists (allowing peers in a hApp to selectively block others who haven't necessarily produced invalid data or forked their source chain):
        * `block_agent`
        * `unblock_agent`
    * Other:
        * [`schedule`](https://github.com/holochain/holochain/blob/holochain-0.4.0/crates/hdk/src/time.rs#L67-L137)
        * An unimplemented `sleep` function has been removed completely

**If your DNA needs to call a host function that depends on an unstable feature**, you'll need to do two things:

1. Build a custom Holochain binary with both the specific feature you need (see the list above) and `unstable-functions` enabled.
2. Enable the `unstable-functions` flag for the `hdi` and `hdk` dependencies in your zomes' `Cargo.toml` (see the section after the next).

Note that you'll need to make sure your users are running your custom conductor binary. If you compile your zomes without `unstable-functions` enabled for `hdi` or `hdk`, users with the flag enabled in Holochain will still be able to use your hApp, but if you compile your zomes _with_ `unstable-functions`, users with the flag(s) disabled won't be able to use your hApp.

### `CloneCellId` changes

The `CloneCellId::CellId` enum variant has become [`DnaHash`](https://docs.rs/holochain_zome_types/0.4.0/holochain_zome_types/clone/enum.CloneCellId.html) and contains, naturally, a `DnaHash` value. This type is used when enabling, disabling, or deleting clones from the app API or a coordinator zome.

#### In coordinator zomes

Edit any coordinator zome code that uses functions from `hdk::clone`:

```diff:rust
 use hdk::prelude::*;

 fn create_chat_room(name: String) -> ExternResult<CellId> {
   // ... instantiate cell_id
   let create_input = CreateCloneCellInput {
     cell_id: cell_id,
     membrane_proof: None,
     name: Some(name),
   };
   let cloned_cell = create_clone_cell(create_input)?;
   let enable_input = EnableCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id.clone()),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash().clone()),
   };
   enable_clone_cell(enable_input)?;
   Ok(cloned_cell.cell_id)
 }

 fn remove_chat_room(cell_id: CellId) -> ExternResult<()> {
   let disable_input = DisableCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cell_id.clone()),
+    clone_cell_id: CloneCellId::DnaHash(cell_id.dna_hash().clone()),
   };
   disable_clone_cell(disable_input)?;
   let delete_input = DeleteCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cell_id.clone()),
+    clone_cell_id: CloneCellId::DnaHash(cell_id.dna_hash().clone()),
   };
   delete_clone_cell(delete_input)
 }
```

#### In JavaScript front-end

Edit any client code that manipulates cloned cells by cell ID to use DNA hash instead:

```diff:typescript
 import { AppWebsocket, CellId } from "@holochain/client";

 let client: AppClient = await AppWebsocket.connect();

 async function archiveChatRoom(cell_id: CellId) {
   await client.disableCloneCell({
-    clone_cell_id: cell_id,
+    clone_cell_id: cell_id[0],
   });
 }

 async function reopenChatRoom(cell_id: CellId) {
   await client.enableCloneCell({
-    clone_cell_id: cell_id,
+    clone_cell_id: cell_id[0],
   });
 }
```

If you're writing an application that uses the admin API, `AdminClient#deleteCloneCell` changes in the same way as `enableCloneCell` and `disableCloneCell`.

### JavaScript client now receives system signals

For JavaScript front ends and Tryorama tests, the signal handler callback for `AppWebsocket.prototype.on("signal", cb)` should now take a [`Signal`](https://github.com/holochain/holochain-client-js/blob/main-0.4/docs/client.signal.md). Update your code to look like this:

```diff:typescript
-import { AppClient, AppSignal, AppWebsocket } from "@holochain/client";
+import { AppClient, AppWebsocket, Signal, SignalType } from "@holochain/client";

 let client: AppClient = AppWebsocket.connect();
-client.on("signal", (appSignal: AppSignal) => {
+client.on("signal", (signal: Signal) => {
+  if (!(SignalType.App in signal)) return;
+  const appSignal = signal[SignalType.App];
   console.log(`Received app signal from cell [${appSignal.cell_id}] and zome ${appSignal.zome_name} with payload ${appSignal.payload}`);
 });
```

(Note that currently you'll only ever see a system signal if you're using countersigning, which is [disabled by default](#unstable-features-removed-by-default).)

### Change in enum serialization

The default serialization for unit-like enum variants has changed. Previously, they would look like this (JSON representation):

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

This will affect any entries or entry fields that start as instances of a Rust enum and are sent to the front end. If your front end is written in JavaScript, you'll need to be aware of this and update your front-end models to match. If your front end is written in Rust, you're likely defining your entry types in a separate module that you're importing directly into the client, which will handle proper deserialization for you.

### `OpenChain` and `CloseChain` actions changed

If you're one of the rare folks who have been using these two actions, the structs have changed. Take a look at the Rustdoc and update your code accordingly:

* `CloseChain::new_dna_hash` has been replaced with [`new_target`](https://docs.rs/holochain_zome_types/0.4.0/holochain_zome_types/action/struct.CloseChain.html), which has a type of `Option<MigrationTarget>`. [This new type](https://docs.rs/holochain_zome_types/0.4.0/holochain_zome_types/prelude/enum.MigrationTarget.html) is an enum of `Dna(DnaHash)` or `Agent(AgentHash)`.

* [`OpenChain::prev_dna_hash`](https://docs.rs/holochain_zome_types/0.4.0/holochain_zome_types/action/struct.OpenChain.html) has been changed to match; its type is a non-optional `MigrationTarget`. It also gets a new field, `close_hash`, which is the `ActionHash` of the corresponding `CloseChain` action.

### `InstallApp` agent key is optional

!!! info
This change is only relevant if you're using the Rust client to access the admin API, for instance if you're building a custom runtime.
!!!

The `agent_key` field in the [`InstallApp` payload](https://docs.rs/holochain_types/0.4.0/holochain_types/app/struct.InstallAppPayload.html) is now optional, and a key will be generated if you don't supply one.

If you're using the JavaScript client to interact with the conductor, [update the JS client lib](#ui) and test it --- you shouldn't need to change any code.

If you're using the Rust client, first update the Rust client lib, then update your code. Edit your UI project's `Cargo.toml` file:

```diff:toml
 [dependencies]
-holochain_client = "0.5.3"
+holochain_client = "0.6.0"
```

Then edit anywhere in your Rust code that uses the `install_app` function:

```diff:rust
 use holochain_client::*;

 fn install_app() -> Result<()> {
   let admin_ws = AdminWebsocket::connect((Ipv4Addr::LOCALHOST, 30_000)).await?
   // ... set up arguments
   let input_payload = InstallAppPayload {
     app_bundle_source,
-    agent_key,
+    Some(agent_key),
     Some(installed_app_id),
     membrane_proofs,
     Some(network_seed),
   };
   let response = admin_ws.install_app(input_payload).await?;
   // ... do things
   Ok()
 }
```

### Deprecated validation op functionality removed

In your integrity zome's validation functions, you deal with DHT operations, or ops. They are somewhat complex, so [`FlatOp`](https://docs.rs/hdi/latest/hdi/flat_op/enum.FlatOp.html) was introduced to make things simpler. It was originally called `OpType`, and until now that old name was a deprecated alias of `FlatOp`. The old type has finally been removed, along with the `Op::to_type` method (use [`OpHelper::flattened`](https://docs.rs/hdi/latest/hdi/op/trait.OpHelper.html#tymethod.flattened) instead).

In your integrity zome, any time you use `Op::to_type`, change it like this:

```diff:rust
 #[hdk_extern]
 pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
-  match op.to_type::<(), ()>()? {
+  match op.flattened::<(), ()>()? {
-    OpType::StoreEntry(store_entry) => {
+    FlatOp::StoreEntry(store_entry) => {
       // do things
     }
-    OpType::RegisterUpdate(update_entry) => {
+    FlatOp::RegisterUpdate(update_entry) => {
       // do things
     }
     // etc
     _ => Ok(ValidateCallbackResult::Valid),
   }
 }
```

### New data in [`AppInfo` response](https://docs.rs/holochain_conductor_api/0.4.0/holochain_conductor_api/struct.AppInfo.html)

Holochain 0.4 introduces a new flow for app installation that lets an agent supply a membrane proof later with a new [`ProvideMemproofs` endpoint](https://docs.rs/holochain_conductor_api/0.4.0/holochain_conductor_api/enum.AppRequest.html#variant.ProvideMemproofs). This allows them to get their freshly generated agent key, submit it to some sort of membrane proof service, and get a membrane proof.

Because of this, after the membrane proof has been provided, the [`DisabledAppReason`](https://docs.rs/holochain_types/0.4.0/holochain_types/app/enum.DisabledAppReason.html) enum, used in the [`AppInfo`](https://docs.rs/holochain_conductor_api/0.4.0/holochain_conductor_api/struct.AppInfo.html) response, will be a new `NotStartedAfterProvidingMemproofs` variant until the app is started.

The only change you should need to make to existing code is to make sure you're handling this new variant in your `match` blocks (Rust) or `switch` blocks (JavaScript).

### `CountersigningSuccess` information changed

The `CountersigningSuccess` signal sent to the client now gives the action hash of the successful countersigned commit rather than its entry hash. In your client code, whether JavaScript or Rust, update your signal handler to deal with a `HoloHash<Action>` rather than a `HoloHash<Entry>` when it receives this kind of signal.

## Subtle changes

### [DHT sharding](/concepts/4_dht/) is disabled by default

This feature needs more performance and correctness testing before it's production-ready, but it can be turned on by [compiling Holochain with the `unstable-sharding` flag enabled](#unstable-features-removed-by-default).

If you leave this feature disabled, you'll need to set gossip arc clamping to either `"empty"` or `"full"`, and we recommend doing this for _all_ participants in a network. We've observed bugs in networks that have a mixture of unsharded (arc-clamped) and sharded peers.

### Dynamic database encryption, folder structure changes

Previous conductor and keystore SQLite databases used a hardcoded encryption key; 0.4 now uses a dynamic key. This means you won't be able to import data from 0.3, so we recommend providing a data import/export feature in your hApp with instructions to help people move their data over on upgrade to 0.4.

The locations of the database folders and files have also changed (although if 0.4 finds an unencrypted database in the old locations, it'll move and encrypt the data).

### WebRTC signalling server change

!!! info
This is only relevant if you're maintaining your own infrastructure or building your own runtime.
!!!

The old signalling server has been replaced with a new one called [`sbd`](https://github.com/holochain/sbd/). If you're hosting your own server, switch to a [new `sbd` server binary](https://github.com/holochain/sbd/tags). If you're using Holo's public infrastructure, switch from `wss://signal.holo.host` to `wss://sbd-0.main.infra.holo.host` in your conductor config file. (The new URL will automatically be in any conductor config generated by the dev tools for 0.4.)
