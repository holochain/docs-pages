---
title: Holochain Upgrade 0.4 → 0.5
---

::: intro
For existing hApps that are currently using Holochain 0.4, here's the guide to get you upgraded to 0.5.

The biggest change in Holochain 0.5 is kitsune2, a new wire protocol implementation promises better gossip performance. Kitsune2 is incompatible with the wire protocols used in Holochain 0.4 and prior, so conductors running 0.5 won't be able to communicate with conductors running earlier releases.
:::

## Quick instructions

To upgrade your hApp written for Holochain 0.4, follow these steps:

1. Update your `flake.nix` to use the 0.4 version of Holochain by changing the version number in the line `holonix.url = "github:holochain/holonix?ref=main-0.4"` from 0.4 to 0.5. This will take effect later when you enter a new Nix shell. It's important to update your Nix flake lockfile at this point, to ensure you benefit from the cache we provide:

    ```shell
    nix flake update && nix develop
    ```
2. Update your project's package dependencies ([see below](#update-your-package-dependencies)).
3. Follow the [breaking change update instructions](#update-your-application-code) below to get your code working again.
4. Try running your tests:

    ```shell
    npm test
    ```

    and starting the application:

    ```shell
    npm start
    ```
5. Be aware of some changes that won't break your app but may affect its runtime behavior. Read the [guide at the bottom](#subtle-changes).

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

### Change 1

### Change 2

## Subtle changes

The following changes don't break Holochain's APIs or require updates to your code, but they may require you to reassess whether your hApp will work as expected:

* Thing 1
* Thing 2