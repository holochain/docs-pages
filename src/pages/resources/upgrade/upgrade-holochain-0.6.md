---
title: Holochain Upgrade 0.5 → 0.6
---

::: intro
For existing hApps that are currently using Holochain 0.5, here's the guide to get you upgraded to 0.6.

The biggest change in Holochain 0.6 is that **warrants** are now stable. This doesn't result in any breaking changes, but the response from `get_agent_activity` will now return a list of warrants.

If your hApp is written for Holochain 0.4, follow the [0.5 upgrade guide](/resources/upgrade/upgrade-holochain-0.5/) first.
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.5, follow these steps:

1. Update your `flake.nix` to use the 0.6 version of Holochain. This involves changing the version numbers of two packages. <!-- TODO: get the right tag name for the release --> {#update-nix-flake}

    ```diff
     {
       description = "Flake for Holochain app development";
       inputs = {
    -    holonix.url = "github:holochain/holonix?ref=main-0.5";
    +    holonix.url = "github:holochain/holonix?ref=main-0.6";
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
    -          nodejs_20
    +          nodejs_22
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
2. Update your root `package.json` file with the new package versions, and update the `build:zomes` script to accommodate a change in the way one of the HDK's dependencies needs to be built: <!-- TODO: get the right version numbers --> {#update-package-json}

    ```diff:json
     {
         "name": "movies-dev",
         "private": true,
         "workspaces": [
             "ui",
             "tests"
         ],
         "scripts": {
             "start": "AGENTS=${AGENTS:-2} BOOTSTRAP_PORT=$(get-port) SIGNAL_PORT=$(get-port) npm run network",
             "network": "hc sandbox clean && npm run build:happ && UI_PORT=$(get-port) concurrently \"npm run start --workspace ui\" \"npm run launch:happ\" \"hc playground\"",
             "test": "npm run build:zomes && hc app pack workdir --recursive && npm run test --workspace tests",
             "launch:happ": "hc-spin -n $AGENTS --ui-port $UI_PORT workdir/movies5.happ",
             "start:tauri": "AGENTS=${AGENTS:-2} BOOTSTRAP_PORT=$(get-port) npm run network:tauri",
             "network:tauri": "hc sandbox clean && npm run build:happ && UI_PORT=$(get-port) concurrently \"npm run start --workspace ui\" \"npm run launch:tauri\" \"hc playground\"",
             "launch:tauri": "concurrently \"kitsune2-bootstrap-srv --listen \"127.0.0.1:$BOOTSTRAP_PORT\"\" \"echo pass | RUST_LOG=warn hc launch --piped -n $AGENTS workdir/movies5.happ --ui-port $UI_PORT network --bootstrap http://127.0.0.1:\"$BOOTSTRAP_PORT\" webrtc ws://127.0.0.1:\"$BOOTSTRAP_PORT\"\"",
             "package": "npm run build:happ && npm run package --workspace ui && hc web-app pack workdir --recursive",
             "build:happ": "npm run build:zomes && hc app pack workdir --recursive",
    -        "build:zomes": "cargo build --release --target wasm32-unknown-unknown"
    +        "build:zomes": "RUSTFLAGS='--cfg getrandom_backend=\"custom\"' cargo build --release --target wasm32-unknown-unknown"
         },
         "devDependencies": {
    -        "@holochain/hc-spin": "^0.500.1",
    +        "@holochain/hc-spin": "^0.600.0",
             "concurrently": "^6.5.1",
             "get-port-cli": "^3.0.0"
         },
         "engines": {
             "node": ">=16.0.0"
         },
         "hcScaffold": {
             "template": "svelte" // This might be different for your app
         }
     }
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

<!-- TODO: Get the right version numbers -->

```diff:toml
 [workspace.dependencies]
-hdi = "=0.6.6"
-hdk = "=0.5.6"
+hdi = "=0.7.0" # Pick a later patch version of these libraries if you prefer.
+hdk = "=0.6.0"
```

The latest version numbers of these libraries can be found on `crates.io`: [`hdi`](https://crates.io/crates/hdi), [`hdk`](https://crates.io/crates/hdk).

Once you've updated your `Cargo.toml` you need to update your `Cargo.lock`. This will also update indirect dependencies to the most recent versions that are compatible with the HDK and any dependencies you might have added.

```shell
cargo update
```

### JavaScript

If you've created your hApp using our scaffolding tool, you should be able to follow these instructions. If you've created your own project folder layout, adapt these instructions to fit.

#### Tryorama tests

Edit your project's `tests/package.json` file:

<!-- TODO(upgrade): bump version numbers here, at least as long as 0.5 is the most recent recommended or maintenance-mode release -->

<!-- TODO: get the right version numbers -->

```diff:json
   "dependencies": {
     // some dependencies
-    "@holochain/client": "^0.19.2",
-    "@holochain/tryorama": "^0.18.3",
+    "@holochain/client": "^0.20.0",
+    "@holochain/tryorama": "^0.19.0",
     // more dependencies
   },
```

#### UI

You'll update the UI package dependencies similarly to the test package. Edit `ui/package.json`:

<!-- TODO: get the right version numbers -->

```diff:json
   "dependencies": {
-    "@holochain/client": "^0.19.2",
+    "@holochain/client": "^0.20.1",
     // more dependencies
   },
```

Then in your project's root folder, run your package manager's update command to update the lockfile and install new package versions for your command-line tools, tests, and UI. Use the command that matches your chosen package manager. For example, if you're using `npm`:

```shell
npm install
```

## Update your application code

### `get_link_details` renamed

`get_link_details` has been renamed to [`get_links_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_links_details.html) to reflect the fact that it operates on a collection of links, not just one link.

### Links querying consolidated

[`get_links`](https://docs.rs/hdk/latest/hdk/link/fn.get_links.html) and [`get_links_details`](https://docs.rs/hdk/latest/hdk/link/fn.get_links_details.html) now share a similar API with `count_links`, so you can apply the exact same query predicates with ease.

```diff:rust
 let links_query = LinkQuery::try_new(base_address, LinkTypes::FooToBar)?
     .tag_prefix("abc".into())
     .after(Timestamp(1000000))
     .before(Timestamp(2000000))
     .author(author_id);

 let links_count = count_links(links_query.clone())?;

-let links = get_links(GetLinksInput {
-    base_address,
-    link_type: LinkTypes::FooToBar,
-    get_options: GetOptions::default(),
-    tag_prefix: Some(tag_prefix),
-    after: Some(start_timestamp)
-    before: Some(end_timestamp),
-    author: Some(author_id),
-})?;
+let links = get_links(links_query.clone(), GetStrategy::default())?;

 assert_eq!(links_count, links.len());

-let links_details: Vec<_> = get_link_details(
-    base_address,
-    LinkTypes::AllPosts,
-    Some("help".into()),
-    GetOptions::default()
-)?
-    .into_inner()
-    .into_iter()
-    .filter(|(l, _)|
-        l.action().timestamp() > Timestamp(1000000)
-        && l.action().timestamp() < Timestamp(2000000)
-        && l.action().author().clone() == author_id
-    )
-    .collect();
+let links_details = get_links_details(
+    links_query.clone(),
+    GetStrategy::default()
+)?.into_inner();
```

### `delete_link` requires a `GetOptions` argument

In order to self-validate a `DeleteLink` action, the original link creation action needs to be available locally, or validation will fail. As a safeguard, [`delete_link`](https://docs.rs/hdk/latest/hdk/link/fn.delete_link.html) now requires a `GetOptions` argument that defaults to fetching the link creation action from the network.

<!-- TODO: make `delete_link` take a GetStrategy rather than GetOptions https://github.com/holochain/holochain/issues/5362 -->

```diff:rust
-let action_hash = delete_link(original_link_hash)?;
+let action_hash = delete_link(original_link_hash, GetOptions::default())?;
```

If you're certain a link creation action is available locally --- for example, when the user is deleting a link they authored --- you can use `GetOptions::local()` instead.

### Most hashing functions have been removed

All hashing functions have been removed from the `hdi` and `hdk` crates except [`hash_action`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_action.html) and [`hash_entry`](https://docs.rs/hdk/latest/hdk/hash/fn.hash_entry.html). If you've previously used `hash_blake2b`, `hash_keccak256`, `hash_sha3`, `hash_sha256`, or `hash_sha512` on arbitrary data, include a third-party hashing crate in your zome.

### Manifest format changed

The format of the manifest files has changed:

* The manifest version is now `'0'` for both hApp and DNA manifests to indicate that it's not yet stabilized:

    ```diff:yaml
    -manifest_version: '1'
    +manifest_version: '0'
     name: my_forum_app
     # ...
    ```
* The `bundled` field for DNAs has been renamed to `path`. This affects all manifest types -- DNA, hApp, and web hApp. For example, in a hApp manifest:

    ```diff:yaml
     manifest_version: '0'
     name: forum
     integrity:
       network_seed: null
       properties: null
       zomes:
       - name: posts_integrity
         hash: null
    -    bundled: ../../../target/wasm32-unknown-unknown/release/posts_integrity.wasm
    +    path: ../../../target/wasm32-unknown-unknown/release/posts_integrity.wasm
         dependencies: null
     coordinator:
       zomes:
       - name: posts
         hash: null
    -    bundled: ../../../target/wasm32-unknown-unknown/release/posts.wasm
    +    path: ../../../target/wasm32-unknown-unknown/release/posts.wasm
         dependencies:
         - name: posts_integrity
    ```
* The `dylib` field in DNA manifests has been removed:

    ```diff:yaml
     manifest_version: '0'
     name: forum
     integrity:
       network_seed: null
       properties: null
       zomes:
       - name: posts_integrity
         hash: null
         path: ../../../target/wasm32-unknown-unknown/release/posts_integrity.wasm
         dependencies: null
    -    dylib: null
     coordinator:
       zomes:
       - name: posts
         hash: null
         path: ../../../target/wasm32-unknown-unknown/release/posts.wasm
         dependencies:
         - name: posts_integrity
    -    dylib: null
    ```

* In the web hApp manifest, the `happ_manifest` field has been renamed to `happ` because it points to a hApp bundle, not a manifest:

    ```diff:yaml
     manifest_version: '0'
     name: my_forum_app
     ui:
       path: ../ui/dist.zip
    -happ_manifest:
    +happ:
       path: ./my_forum_app_0.6.happ
    ```

### Try building your zomes

Now run:

```bash
npm run build_zomes
```

to see if all your updated dependencies and zome code compile.

Sometimes dependency updates break builds! Cargo updates dependencies to the most recent versions that are _claimed_ to be compatible. However, sometimes package maintainers accidentally introduce a breaking change without labelling it as such. If you encounter build errors, this may be the cause. If this happens, try locking the incompatible dependency to a prior version in your `Cargo.toml` file, running `cargo update` again, and see if that fixes it.

### `AppInfo` response struct has changed

The type of the `status` field in the [`AppInfo` response struct](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appinfo.md) has changed from `AppInfoStatus` to a new [`AppStatus` union](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appstatus.md).

```typescript
 const appInfo = await client.appInfo();
 const status = appInfo.status;
 switch (status.type) {
-    case "paused":
-        console.log(`App is paused: ${status.value.reason}`);
-        break;
     case "disabled":
-        console.log(`App is disabled: ${status.value.reason}`);
+        switch (status.value.type) {
+            case "never_started":
+                console.log("App hasn't been started yet");
+                break;
+            case "user":
+                console.log("User disabled the app");
+                break;
+            case "not_started_after_providing_memproofs":
+                console.log("App not started after providing memproofs");
+                break;
+            case "error":
+                console.log(`App disabled because of error: ${status.value.value}`);
+                break;
+        }
         break;
     case "awaiting_memproofs":
         console.log("Need to supply memproofs to enable this app");
         break;
-    case "running":
+    case "enabled":
         console.log("App is running");
         break;
 }
```

### Try running your Tryorama tests and web app

Now that your zome and client code have both been updated, run:

```bash
npm run test
```

and fix any test failures you see. Finally, try your hApp out by running:

```bash
npm run start
```

## Subtle changes

The following changes don't break Holochain's APIs or require updates to your code, but they may require you to reassess whether your hApp will work as expected:

* The Holo WebSDK has been removed from the scaffolding tool, so you won't see any option to add it to your project anymore.