---
title: Upgrade to the new Holonix
---

::: intro
In the third quarter of 2024, we released a new [Holonix](/get-started/install-advanced/#holonix-the-holochain-app-development-environment), our development environment based on [Nix](https://nixos.org) that gives you all the dependencies to build hApps and contribute to Holochain core development.

The new Holonix is simpler and more modular, which means that it's easier to configure it for your needs and preferences.
:::

## Upgrade an existing project

The previous and the new Holonix distributions are both based on Nix's [flakes](https://wiki.nixos.org/wiki/Flakes) feature. Fortunately, this means it's easy to upgrade. First back up and remove your project's existing flake files:

```bash
mv flake.nix flake.nix.backup
mv flake.lock flake.lock.backup
```

Then create new flake files:

```bash
nix flake init -t github:holochain/holonix?ref=main-0.3
```

For most projects, that's all you need!

## Targeting a specific Holochain version

If your project is not on the latest recommended Holochain version (0.3 at the time of writing), you'll need to change the `ref` query string in the URL.

For Holochain 0.2:

```bash
nix flake init -t github:holochain/holonix?ref=main-0.2
```

For the latest, unstable Holochain 0.4:

```bash
nix flake init -t github:holochain/holonix?ref=main
```

If you've already created flake files for the newest Holonix, you can edit the `flake.nix` file like this:

```diff
...
inputs = {
-   holonix.url = "github:holochain/holonix?ref=main-0.3";
+   holonix.url = "github:holochain/holonix?ref=main-0.2";
    ...
};
...
```

Next time you type `nix develop` to enter the shell, it'll update your `nix.lock` and download the requested packages for you.

## Choosing a very specific Holochain release

If you need to be more precise about the Holochain package version, you can do this in your `flake.nix` file too:

```diff
...
inputs = {
    holonix.url = "github:holochain/holonix?ref=main";
+   holonix.inputs.holochain.url = "github:holochain/holochain?ref=branch-or-tag-name";
    ...
}
...
```

!!! info Old packages and long build times
We have a limited amount of cache space for our Nix packages, so if you target a Holochain version that's quite old, you may end up building it from source on your machine, which can take hours.
!!!

## Adding and removing packages

If you need extra Nix packages, or don't need some provided packages, you can edit `flake.nix` like this:

```diff
...
packages = (with inputs'.holonix.packages; [
    holochain
+   # Remove a few Holochain-provided packages
-   lair-keystore
-   hc-launch
-   hc-scaffold
-   hn-introspect
    rust # For Rust development, with the WASM target included for zome builds
]) ++ (with pkgs; [
    nodejs_20 # For UI development
    binaryen # For WASM optimisation
    # Add any other packages you need here
+   # Add my preferred Node package manager
+   yarn
]);
...
```

## Customizing Holochain

If you want your build environment to include a version of Holochain with custom build flags, use this command to generate your flake files:

```bash
nix flake init -t github:holochain/holonix#custom
```

(This can be used in combination with the `?ref=` query string to target a specific version.) Next, open up the generated `flake.nix` file and look for this section:

```
let
    # Disable default features and enable wasmer_wamr for a wasm interpreter,
    # as well as re-enabling tx5 and sqlite-encrypted.
    cargoExtraArgs = "--no-default-features --features wasmer_wamr,sqlite-encrypted,tx5";
    # Override arguments passed in to Holochain build with above feature arguments.
    customHolochain = inputs'.holonix.packages.holochain.override { inherit cargoExtraArgs; };
in
```

Change the value of `cargoExtraArgs ` to your liking, then enter the development shell. _This will take a while the first time around,_ because Nix will have to build your custom Holochain binary.