---
title: Holochain Upgrade 0.3 → 0.4
---

::: intro
For existing hApps that were written for Holochain 0.3, here's the guide to get you upgraded to 0.4.

NOTE: [Holonix](/get-started/install-advanced/), our developer shell environment, has also been updated. We recommend you [upgrade to the new Holonix](/resources/upgrade/upgrade-new-holonix/) at the same time!
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.3, follow these steps:

1. Follow the [Holonix upgrade guide](/resources/upgrade/upgrade-new-holonix/) to update to the newest Holonix command-line developer environment (we're dropping support for the old Holonix in the 0.4 series).
2. Update your project's package dependencies ([see below](#update-your-package-dependencies)).
3. Enter the project's Holonix shell by navigating to the project's root folder and entering:

    ```shell
    nix develop
    ```

3. Try running your tests:

    ```shell
    npm test
    ```

    and starting the application:

    ```shell
    npm start
    ```

4. You'll likely see error messages due to breaking changes, either at compile time or test/run time. Follow the [breaking change update instructions](#update-your-application-code) below to get your code working again.
5. Be aware of some changes that won't break your app but may affect its runtime behavior. Read the [guide at the bottom](#subtle-changes).

## Update your package dependencies

### Rust

Update the `hdk` and `hdi` version strings in the project's root `Cargo.toml` file:

```diff:toml
 [workspace.dependencies]
-hdi = "=0.4.6"
-hdk = "=0.3.6"
+hdi = "=0.5.0-rc.1"
+hdk = "=0.4.0-rc.1"
 serde = "1.0"
```

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

### JavaScript tooling

If you've created your hApp using our scaffolding tool, you should be able to follow these instructions. If you've created your own project folder layout, adapt these instructions to fit.

Edit your project's root `package.json` file to update the developer tools:

```diff:json
   "devDependencies": {
     "@holochain-playground/cli": "^0.300.1",
-    "@holochain/hc-spin": "0.300.3",
+    "@holochain/hc-spin": "^0.400.0-dev.3",
     // more dependencies
   },
```

Then run your package manager's update command to update the lockfile and install new package versions. Use the command that matches your chosen package manager:

```shell
bun update
```
```shell
npm update
```
```shell
pnpm update
```
```shell
yarn upgrade
```

### Tryorama tests

Edit your project's `tests/package.json` file:

```diff:json
   "dependencies": {
     // some dependencies
-    "@holochain/client": "^0.17.1",
-    "@holochain/tryorama": "^0.16.0",
+    "@holochain/client": "^0.18.0-rc.1",
+    "@holochain/tryorama": "^0.17.0-rc.0",
     // more dependencies
   },
```

Then navigate to the `tests/` folder and run your package manager's update command like you did at the project's top level in the last step.

### UI

You'll update the UI package dependencies similarly to the test package. Edit `ui/package.json`:

```diff:json
   "dependencies": {
-    "@holochain/client": "^0.17.1",
+    "@holochain/client": "^0.18.0-rc.1",
     // more dependencies
   },
```

Then run navigate to the `ui/` folder and run your package manager's update command.

## Update your application code

Here are all the breaking changes you need to know about in order to update your app for Holochain 0.4.

### Unstable features removed by default

The biggest change for 0.4 is that some unstable features aren't compiled into official Holochain releases by default. We're doing this to focus on a stable core Holochain with the minimal feature set that most projects need. The removed features are still available as Rust feature flags, so you can compile a custom Holochain binary if you need them. Here's the full list, along with their feature flags:

* **[Countersigning](/concepts/10_countersigning/) `unstable-countersigning`**: Allows agents to temporarily lock their chains in order to agree to write the same entry to their respective chains.
* **DPKI / DeepKey `unstable-dpki`**: Implements a distributed public key infrastructure, allowing agents to manage their keys and confirm continuity of their identity across devices and source chains. Read the [DeepKey readme](https://github.com/holochain/deepkey) for more info.
* **[DHT sharding](/concepts/4_dht/) `unstable-sharding`**: Lessens the load of each peer in large network, allowing them to take responsibility for validating and storing only a subset of a DHT's entire data set.
* **[Warrants](/concepts/7_validation#remembering-validation-results) `unstable-warrants`**: Spreads news of validation failure around the network, allowing peers to recognize bad actors and take action against them, even if they haven't directly interacted with them.
* **Chain head coordination `chc`**: Developed for Holo, allows source chain changes to be copied from one device to another without causing chain forks. (This pre-existing feature flag is no longer enabled by default.)
* **HDI/HDK functions `unstable-functions`**:
    * Related to countersigning (enable `unstable-countersigning` if you want to use these):
        * [`accept_countersigning_preflight_request`](https://github.com/holochain/holochain/blob/holochain-0.4.0-rc.2/crates/hdk/src/countersigning.rs#L3-L22)
    * Related to DPKI (enable `unstable-dpki` if you want to use these, which are both new to 0.4):
        * [`get_agent_key_lineage`](https://github.com/holochain/holochain/blob/holochain-0.4.0-rc.2/crates/hdk/src/agent.rs#L10-L20)
    * Related to block lists (allowing peers in a hApp to selectively block others who haven't necessarily produced invalid data or forked their source chain):
        * `block_agent`
        * `unblock_agent`
    * Other:
        * [`schedule`](https://github.com/holochain/holochain/blob/holochain-0.4.0-rc.2/crates/hdk/src/time.rs#L67-L137)
        * An unimplemented `sleep` function has been removed completely

`unstable-functions` is a flag used by both the Holochain conductor _and_ the [`hdi`](https://docs.rs/hdi/latest/hdi) and [`hdk`](https://docs.rs/hdk/latest/hdk) crates, and some of the functions also need other Holochain features enabled (e.g., `is_same_agent` requires a conductor with `unstable-dpki` enabled; see the list above).

#### Enabling in Holochain runtime

Read the [Holonix readme](https://github.com/holochain/holonix?tab=readme-ov-file#customized-holochain-build) to find out how to enter a development shell with a custom-compiled Holochain build with these flags enabled.

If you're using Holochain as a library in your project, edit your `Cargo.toml` file's `holochain` dependency to enable the flags. Here's an example that enables countersigning:

```diff:toml
 [dependencies]
-holochain = { version = "0.3.6" }
 # "unstable-functions" is needed in order for coordinator zomes to call the
 # host functions related to countersigning.
+holochain = { version = "0.4.0-rc.2", features = ["unstable-countersigning", "unstable-functions"] }
```

#### Enabling in your zomes

If you want to use unstable features in your zomes, you'll need to edit your zome crates' `Cargo.toml` files. For coordinator zomes:

```diff:toml
 [dependencies]
-hdk = { workspace = true }
+hdk = { workspace = true, features = ["unstable-functions"] }
```

And for integrity zomes:

```diff:toml
 [dependencies]
-hdk = { workspace = true }
+hdk = { workspace = true, features = ["unstable-functions"] }
```

and make sure that users are running your custom conductor binary with the right features enabled ([see above](#enabling-in-holochain-runtime)). If you compile your zomes without `unstable-functions` enabled, users with the flag enabled in Holochain will still be able to use your hApp, but if you enable it, users with the flag(s) disabled won't be able to use your hApp. If you use any of the unstable functions, note that the conductor will also need to have the corresponding feature enabled (e.g., to use countersigning, the conductor must have `unstable-countersigning` enabled, along with  `unstable-functions`).

### `OpenChain` and `CloseChain` actions changed

If you're one of the rare folks who have been using these two actions, the structs have changed. Take a look at the Rustdoc and update your code accordingly:

* `CloseChain::new_dna_hash` has been replaced with [`new_target`](https://docs.rs/holochain_zome_types/0.4.0-rc.1/holochain_zome_types/action/struct.CloseChain.html), which has a type of `Option<MigrationTarget>`. [This new type](https://docs.rs/holochain_zome_types/0.4.0-rc.1/holochain_zome_types/prelude/enum.MigrationTarget.html) is an enum of `Dna(DnaHash)` or `Agent(AgentHash)`.

* [`OpenChain::prev_dna_hash`](https://docs.rs/holochain_zome_types/0.4.0-rc.1/holochain_zome_types/action/struct.OpenChain.html) has been changed to match; its type is a non-optional `MigrationTarget`. It also gets a new field, `close_hash`, which is the `ActionHash` of the corresponding `CloseChain` action.

### `InstallApp` agent key is optional

!!! info
This change is only relevant if you're building a runtime that can install hApp bundles.
!!!

The `agent_key` field in the [`InstallApp` payload](https://docs.rs/holochain_types/0.4.0-rc.2/holochain_types/app/struct.InstallAppPayload.html) is now optional, and a key will be generated if you don't supply one.

If you're using the JavaScript client to interact with the conductor, [update the JS client lib](#ui) and test it --- you shouldn't need to change any code.

If you're using the Rust client, first update the Rust client lib, then update your code. Edit your UI project's `Cargo.toml` file:

```diff:toml
 [dependencies]
-holochain_client = "0.5.3"
+holochain_client = "0.6.0-rc.0"
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

### `CloneCellId` changes

The `CloneCellId::CellId` enum variant has become [`DnaHash`](https://docs.rs/holochain_zome_types/0.4.0-rc.1/holochain_zome_types/clone/enum.CloneCellId.html) and contains, naturally, a `DnaHash` value. This type is used when enabling, disabling, or deleting clones from the app API or a coordinator zome.

#### In coordinator zomes

Edit any coordinator zome code that uses functions from `hdk::clone`:

```diff:rust
 use hdk::prelude::*;

 fn create_chat_room(name: string) -> ExternResult<CellId> {
   // ... set up cell_id
   let create_input = CreateCloneCellInput {
     cell_id,
     None,
     name,
   };
   let cloned_cell = create_clone_cell(create_input).await?;
   let enable_input = EnableCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   enable_clone_cell(enable_input).await?;
   cloned_cell.cell_id
 }

 fn remove_chat_room(cell_id: CellId) -> ExternResult<()> {
   let disable_input = DisableCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   disable_clone_cell(disable_input).await?;
   let delete_input = DeleteCloneCellInput {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   delete_clone_cell(delete_input).await?
 }
```

#### In JavaScript front-end

Edit any client code that manipulates cloned cells:

```diff:typescript
 import { AppWebsocket, CellId } from "@holochain/client";

 let client: AppClient = await AppWebsocket.connect();
 let role_name = "chat";

 function createChatRoom(name: String) {
   const clonedCell = await client.createCloneCell({
     modifiers: {},
     role_name
   });
   await client.enableCloneCell({
-    clone_cell_id: cloned_cell.cell_id,
+    clone_cell_id: cloned_cell.cell_id[0],
   });
   return clonedCell.cell_id;
 }

 function removeChatRoom(cell_id: CellId) {
   await client.disableCloneCell({
-    clone_cell_id: cell_id,
+    clone_cell_id: cell_id[0],
   });
   await client.deleteCloneCell({
-    clone_cell_id: cell_id,
+    clone_cell_id: cell_id[0],
   });
 }
```

#### In Rust front-end

Edit any client code that manipulates cloned cells:

```diff:rust
 use holochain_client::*;

 async fn connect_to_client() -> Result<AppWebsocket> {
   AppWebsocket::connect((Ipv4Addr::LOCALHOST, 30_000)).await?
 }

 async fn create_chat_room(name: String) -> Result<CellId> {
   let app = connect_to_client().await?;
   // ... set up arguments
   let create_payload = CreateCloneCellPayload {
     role_name,
     modifiers,
     none,
     Some(name),
   };
   let cloned_cell = app.create_clone_cell(input_payload).await?;
   let enable_payload = EnableCloneCellPayload {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   app.enable_clone_cell(enable_payload).await?
   Ok(cloned_cell.cell_id)
 }

 fn remove_chat_room(cell_id: CellId) -> Result<()> {
   let app = connect_to_client().await?;
   let disable_payload = DisableCloneCellPayload {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   app.disable_clone_cell(disable_payload).await?;
   let delete_payload = DeleteCloneCellPayload {
-    clone_cell_id: CloneCellId::CellId(cloned_cell.cell_id),
+    clone_cell_id: CloneCellId::DnaHash(cloned_cell.cell_id.dna_hash()),
   };
   app.delete_clone_cell(delete_payload).await?
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

### New data in [`AppInfo` response](https://docs.rs/holochain_conductor_api/0.4.0-rc.2/holochain_conductor_api/struct.AppInfo.html)

Holochain 0.4 introduces a new flow for app installation that lets an agent supply a membrane proof later with a new [`ProvideMemproofs` endpoint](https://docs.rs/holochain_conductor_api/0.4.0-rc.2/holochain_conductor_api/enum.AppRequest.html#variant.ProvideMemproofs). This allows them to get their freshly generated agent key, submit it to some sort of membrane proof service, and get a membrane proof.

Because of this, after the membrane proof has been provided, the [`DisabledAppReason`](https://docs.rs/holochain_types/0.4.0-rc.2/holochain_types/app/enum.DisabledAppReason.html) enum, used in the [`AppInfo`](https://docs.rs/holochain_conductor_api/0.4.0-rc.2/holochain_conductor_api/struct.AppInfo.html) response, will be a new `NotStartedAfterProvidingMemproofs` variant until the app is started.

The only change you should need to make to existing code is to make sure you're handling this new variant in your `match` blocks (Rust) or `switch` blocks (JavaScript).

### Change in enum serialization

The default serialization for bare (no-data) enum variants has changed. Previously, they would look like this (JSON representation):

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

### `CountersigningSuccess` information changed

The `CountersigningSuccess` signal sent to the client now gives the action hash of the successful countersigned commit rather than its entry hash. In your client code, whether JavaScript or Rust, update your signal handler to deal with a `HoloHash<Action>` rather than a `HoloHash<Entry>` when it receives this kind of signal.

* The database encryption scheme has changed, and the directory structure has moved around.
* The WebRTC signalling server architecture has changed, along with new server addresses and self-hosted server binaries.

### WebRTC signalling server change

The old signalling server has been replaced with a new one called [`sbd`](https://github.com/holochain/sbd/). If you're hosting your own server, switch to a [new `sbd` server binary](https://github.com/holochain/sbd/tags). If you're using Holo's public infrastructure, switch from `wss://signal.holo.host` to `wss://sbd-0.main.infra.holo.host` in your conductor config file. (The new URL will automatically be in any conductor config generated by the dev tools for 0.4.)

## Subtle changes

### [DHT sharding](/concepts/4_dht/) is disabled by default

This feature needs more performance and correctness testing before it's production-ready, but it can be turned on by [compiling Holochain with the `unstable-sharding` flag enabled](#enabling-in-holochain-runtime).

It's unknown exactly what might happen if nodes with DHT sharding disabled try to gossip in the same network as nodes without DHT sharding. Presumably this is still possible, but it might cause unexpected behaviors!

### Dynamic database encryption, folder structure changes

Previous conductor and keystore SQLite databases used a hardcoded encryption key; v0.4 now uses a dynamic key. Additionally, the database paths have changed. These two things mean you won't be able to import data from v0.3.