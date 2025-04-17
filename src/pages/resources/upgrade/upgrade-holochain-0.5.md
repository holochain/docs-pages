---
title: Holochain Upgrade 0.4 → 0.5
---

::: intro
For existing hApps that are currently using Holochain 0.4, here's the guide to get you upgraded to 0.5.

The biggest change in Holochain 0.5 is kitsune2, a new wire protocol implementation promises better gossip performance. Kitsune2 is incompatible with the wire protocols used in Holochain 0.4 and prior, so conductors running 0.5 won't be able to communicate with conductors running earlier releases.
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.5, follow these steps:

1. Update your `flake.nix` to use the 0.5 version of Holochain. This involves changing some version numbers and adding a new package that contains the updated local bootstrap and signal server: {#update-nix-flake}

    ```diff
     {
       description = "Flake for Holochain app development";

       inputs = {
    -    holonix.url = "github:holochain/holonix?ref=main-0.4";
    +    holonix.url = "github:holochain/holonix?ref=main-0.5";

         nixpkgs.follows = "holonix/nixpkgs";
         flake-parts.follows = "holonix/flake-parts";

    -    playground.url = "github:darksoil-studio/holochain-playground?ref=main-0.4";
    +    playground.url = "github:darksoil-studio/holochain-playground?ref=main-0.5";

       };

       outputs = inputs@{ flake-parts, ... }: flake-parts.lib.mkFlake { inherit inputs; } {
         systems = builtins.attrNames inputs.holonix.devShells;
         perSystem = { inputs', pkgs, ... }: {
           formatter = pkgs.nixpkgs-fmt;

           devShells.default = pkgs.mkShell {
             inputsFrom = [ inputs'.holonix.devShells.default ];

             packages = (with pkgs; [
               nodejs_20
               binaryen
               inputs'.playground.packages.hc-playground
    +          bootstrap-srv


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
    nix flake update && git add flake.nix && nix develop
    ```
2. stub -- fill this in with package.json upgrade notes<!-- TODO(0.5): add instructions to change package.json to use new local services; waiting on upstream changes in `hc-launch` and `hc-spin` --> {#update-package-json-to-use-k2}
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
-hdi = "=0.5.2"
-hdk = "=0.4.2"
+hdi = "=0.6.0" # Pick a later version of these libraries if you prefer.
+hdk = "=0.5.0"
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
-    "@holochain/hc-spin": "0.400.1",
+    "@holochain/hc-spin": "^0.500.0",
     // more dependencies
   },
```

#### Tryorama tests

Edit your project's `tests/package.json` file:

```diff:json
   "dependencies": {
     // some dependencies
-    "@holochain/client": "^0.18.1",
-    "@holochain/tryorama": "^0.17.1",
+    "@holochain/client": "^0.19.0",
+    "@holochain/tryorama": "^0.18.0",
     // more dependencies
   },
```

#### UI

You'll update the UI package dependencies similarly to the test package. Edit `ui/package.json`:

```diff:json
   "dependencies": {
-    "@holochain/client": "^0.18.1",
+    "@holochain/client": "^0.19.0",
     // more dependencies
   },
```

Then in your project's root folder, run your package manager's update command to update the lockfile and install new package versions for your command-line tools, tests, and UI. Use the command that matches your chosen package manager. For example, if you're using `npm`:

```shell
npm install
```

## Update your application code

### Enums in the conductor APIs are serialized differently

The admin and app APIs have changed their serialization of enum variants with values: the value is now in its own field, and enum variant names have been normalized to snake_case. For instance, if you subscribe to signals in a JavaScript-based front end, a [signal payload](https://github.com/holochain/holochain-client-js/blob/main/docs/client.signal.md) may have previously looked like this:

```json
{
    "App": {
        "cell_id": ["hC0kKUej3Mcu+40AjNGcaID2sQA6uAUcc9hmJV9XIdwUJUE", "hCAkhy0q54imKYjEpFdLTncbqAaCEGK3LCE+7HIA0kGIvTw"], // cspell:disable-line
        "zome_name": "movies",
        "payload": "hey it's a signal"
    }
}
```

but would now look like this:

```json
{
    "type": "app",
    "value": {
        "cell_id": ["hC0kKUej3Mcu+40AjNGcaID2sQA6uAUcc9hmJV9XIdwUJUE", "hCAkhy0q54imKYjEpFdLTncbqAaCEGK3LCE+7HIA0kGIvTw"], // cspell:disable-line
        "zome_name": "movies",
        "payload": "hey it's a signal"
    }
}
```

This change happens in many places; we recommend that you run the TypeScript compiler against your UI and tests and look for errors. In the Holonix dev shell, run:

```bash
node_modules/typescript/bin/tsc -p ui/tsconfig.json
```
```bash
node_modules/typescript/bin/tsc -p tests/tsconfig.json
```

and look for messages that look similar to `error TS2322: Type X is not assignable to type Y`.

### `origin_time` and `quantum_time` are removed

With the new kitsune2 wire protocol, `origin_time` and `quantum_time` are no longer used. You may find these optional fields anywhere [integrity modifiers](/build/dnas/) are used:

* In `dna.yaml` manifests, the scaffolding tool will automatically add an `origin_time` field. Remove it, and check for any use of the `quantum_time` field too:

    ```diff:yaml
     manifest_version: '1'
     name: movies
     integrity:
       network_seed: null
       properties:
         foo: bar
         baz: 123
    -  origin_time: 1735841273312901
    -  quantum_time: 1000000
     # ...
    ```
* You can no longer pass these fields as DNA modifiers when you a install a hApp via the admin API or clone a cell via the app API. For example:

    ```diff:typescript
     let clonedCell = await client.createCloneCell({
         modifiers: {
             network_seed: "my_network_seed",
    -        origin_time: 1735841273312901,
    -        quantum_time: 1000000
         },
         name,
         role_name: "chat",
     });
    ```

### `AgentInfo::agent_latest_pubkey` behind feature flag

When you call [`agent_info`](https://docs.rs/hdk/latest/hdk/info/fn.agent_info.html) from a coordinator zome, the `agent_latest_pubkey` field in the [return value](https://docs.rs/hdk/latest/hdk/prelude/struct.AgentInfo.html) is now gone (unless you [build a custom Holochain binary](https://github.com/holochain/holonix?tab=readme-ov-file#customized-holochain-build) with the `unstable-dpki` feature flag enabled). Anywhere you use this field, use `agent_initial_pubkey` instead:

```diff:rust
 use hdk::prelude::*;

 fn get_my_agent_id() -> ExternResult<AgentPubKey> {
-    Ok(agent_info()?.agent_latest_pubkey)
+    Ok(agent_info()?.agent_initial_pubkey)
 }
```

### DNA lineage behind feature flag

Features related to DNA lineage are now hidden behind an `unstable-migration` feature flag. If you don't plan to use this, remove the `lineage` line from your `dna.yaml` file:

```diff:yaml
 # ...
-lineage:
-  - "hC0kKUej3Mcu+40AjNGcaID2sQA6uAUcc9hmJV9XIdwUJUE" # cspell:disable-line
-  - "hCAkhy0q54imKYjEpFdLTncbqAaCEGK3LCE+7HIA0kGIvTw" # cspell:disable-line
 # ...
```

The `GetCompatibleCells` endpoint in the admin API is also hidden behind this flag.

If you want to use these features, [build a custom Holochain binary](https://github.com/holochain/holonix?tab=readme-ov-file#customized-holochain-build) with `unstable-migration` enabled.

### `AppBundleSource::Bundle` removed

**Note: This only applies if you're building a runtime or using Tryorama's [`Conductor.prototype.installApp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.installapp.md) method.** The `Bundle` option (deprecated in 0.4.2) is now removed from [`AppBundleSource`](https://docs.rs/holochain_types/0.5.0-rc.1/holochain_types/app/enum.AppBundleSource.html). If you need to pass bundle bytes to the admin API's `InstallApp` endpoint, use [`AppBundleSource::Bytes`](https://docs.rs/holochain_types/0.5.0-rc.1/holochain_types/app/enum.AppBundleSource.html#variant.Bytes) (introduced in 0.4.2) and pass the bytes of an entire hApp bundle file instead.<!-- FIXME: replace version numbers in URLs -->

### `hc run-local-services` replaced with `kitsune2-bootstrap-srv`

<!-- FIXME: fill in details -->

The old bootstrap and signalling server have been combined into one binary called `kitsune2-bootstrap-srv`, which is provided in the Holonix dev environment for any new scaffolded hApps. To update an existing hApp, [edit its `flake.nix` file to include the binary](#update-nix-flake) and optionally [update its `package.json` file to use it](#update-package-json-to-use-k2) if you use the Tauri-based launcher. Locally running hApp instances using `hc-spin` and `hc-launch` will now use the new binary.

### `disableCloneCell`, `enableCloneCell`, and `deleteCloneCell` signatures changed

The object that you pass to the JS client's [`AppWebsocket.prototype.disableCloneCell`](https://github.com/holochain/holochain-client-js/blob/main-0.4/docs/client.appwebsocket.disableclonecell.md), [`AppWebsocket.prototype.enableCloneCell`](https://github.com/holochain/holochain-client-js/blob/main-0.4/docs/client.appwebsocket.enableclonecell.md), and [`AdminWebsocket.prototype.deleteCloneCell`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.adminwebsocket.deleteclonecell.md) methods has changed; now you need to explicitly specify whether the identifier is a clone ID or DNA hash using the [new enum serialization format](#enums-in-the-conductor-ap-is-are-serialized-differently).

```diff:typescript
 let cellClonedByRoleName = client.createCloneCell({
-    clone_cell_id: "chat.1"
+    clone_cell_id: {
+        type: "clone_id",
+        value: "chat.1"
+   }
 });
 let dnaHash = decodeHashFromBase64("hC0kKUej3Mcu+40AjNGcaID2sQA6uAUcc9hmJV9XIdwUJUE"); // cspell:disable-line
 let cellClonedByDnaHash = client.createCloneCell({
-    clone_cell_id: dnaHash
+    clone_cell_id: {
+        type: "dna_hash",
+        value: dnaHash
+    }
 });
```

### Timestamps moved to `holochain_timestamp`

The `Timestamp` type used all over the HDK and in scaffolded entry types has been moved to a new crate called [`holochain_timestamp`](https://docs.rs/holochain_timestamp/latest/holochain_timestamp/index.html). This type has historically been made available transitively through `hdi::prelude` and `hdk::prelude`, so you shouldn't need to make any code changes unless you reference the `kitsune_p2p_timestamp` crate explicitly in any of your `Cargo.toml` files or code:

```diff:toml
 # ...
 [dependencies]
-kitsune_p2p_timestamp = "0.4.2"
+holochain_timestamp = "0.5.0"
```

```diff:rust
-use kitsune_p2p_timestamp::Timestamp;
+use holochain_timestamp::Timestamp;

 fn get_time() -> ExternResult<Timestamp> {
     sys_time()
 }
```

### App API's `NetworkInfo` removed

The `NetworkInfo` endpoint of the app API has been removed, which means the `AppWebsocket.prototype.networkInfo` method has also been removed. You can get some network info from the `DumpNetworkMetrics` and `DumpNetworkStats` endpoints, which are [now exposed on the app API](#dump-network-on-app-api).

### Networking section of conductor config changed

**Note: This only applies if you're using persistent conductor configs.** The `network` section of `conductor-config.yaml` files has changed. We recommend that you generate a new conductor config using `hc sandbox`, then compare it against your existing conductor config to see what changes need to be made. You can find available config keys in the [`NetworkConfig` documentation](https://docs.rs/holochain_conductor_api/0.5.0-rc.1/holochain_conductor_api/config/conductor/struct.NetworkConfig.html).<!-- FIXME: get actual final release version into the URI - -->

### Admin API's `AgentInfo` return value changed

**Note: This is an advanced feature that you'll rarely encounter if you're trying to get diagnostic data.** The return value of the [`AgentInfo`](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html#variant.AgentInfo) endpoint in the admin API has changed. Currently it outputs a vector of JSON-serialized [`kitsune2_api::AgentInfoSigned`](https://docs.rs/kitsune2_api/latest/kitsune2_api/struct.AgentInfoSigned.html) values.

## Subtle changes

The following changes don't break Holochain's APIs or require updates to your code, but they may require you to reassess whether your hApp will work as expected:

* Your front end can now call the `init` callback in any cell as if it were a regular zome function. This will in turn trigger the init process, which runs all coordinator zomes' `init` functions in the order the zomes appear in the DNA manifest. If it succeeds, the `init` callback in the zome you targeted _won't_ be run again in this call or any subsequent calls.
* The admin API's [`DumpNetworkMetrics`](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html#variant.DumpNetworkMetrics) and [`DumpNetworkStats`](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html#variant.DumpNetworkStats) are now available on the app API as well, which means that a UI written for any web-based launcher can now access them via the JavaScript client's [`AppWebsocket.prototype.dumpNetworkMetrics`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.dumpnetworkmetrics.md) and [`AppWebsocket.prototype.dumpNetworkStats`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.dumpnetworkStats.md) methods. Additionally, `DumpNetworkMetrics` now has an option to include a DHT summary. The output of these endpoints has changed as a result of the new network layer. {#dump-network-on-app-api}