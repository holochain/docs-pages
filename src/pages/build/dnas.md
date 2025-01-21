---
title: "DNA"
---

::: intro
A **DNA** is a bundle of one or more [**zomes**](/build/zomes/), along with optional **DNA modifiers**. Together, the zomes and DNA modifiers define the executable code and settings for a single **peer-to-peer network**.
:::

## DNAs: the 'rules of the game' for a network

Holochain supports multiple, separate peer-to-peer networks, each with its own membership and shared [graph database](/build/working-with-data/). Each network is backed by its own DNA, whose executable code and settings create the 'rules of the game' for the network.

The **DNA hash** is the unique identifier for a network. The **DNA integrity modifiers** contribute to this hash; the rest of the DNA does not. That means that any change to integrity modifiers will change the DNA hash and form a new network if agents install and run it.

The contents of a DNA are specified with a **manifest file**.

## Create a DNA

If you use the [scaffolding tool](/get-started/3-forum-app-tutorial/), it'll scaffold a working directory for every DNA you scaffold.

You can also use the `hc` command in the [Holonix dev shell](/get-started/#2-installing-holochain-development-environment) to create a bare working directory:

```bash
hc dna init movies
```

You'll be prompted to enter a name and [**network seed**](#network-seed). After that it'll create a folder called `movies` that contains a basic `dna.yaml` file with your responses to the prompts.

## Specify a DNA manifest

A DNA manifest is written in [YAML](https://yaml.org/). It contains details about the DNA, the above integrity modifiers, and a list of coordinator zomes for interacting with the DNA.

If you want to write your own manifest file, name it `dna.yaml` and give it the following structure. This example assumes that all of your zomes are in a folder called `zomes/`. Afterwards we'll explain what the fields mean.

```yaml
manifest_version: '1'
name: movies
integrity:
  network_seed: null
  properties:
    foo: bar
    baz: 123
  origin_time: 1735841273312901
  zomes:
  - name: movies_integrity
    hash: null
    bundled: 'zomes/movies_integrity/target/wasm32-unknown-unknown/release/movies_integrity.wasm'
coordinator:
  zomes:
  - name: movies
    hash: null
    bundled: 'zomes/movies/target/wasm32-unknown-unknown/release/movies.wasm'
    dependencies:
    - name: movies_integrity
```

### DNA manifest structure at a glance

* `name`: A string for humans to read. This might get used in the admin panel of Holochain [conductors](/concepts/2_application_architecture/#conductor) like [Holochain Launcher](https://github.com/holochain/launcher) or [Moss](https://theweave.social/moss/).
* `integrity`: Contains all the integrity modifiers for the DNA, the things that **change the DNA hash**.
    * `network_seed`: A string that serves only to change the DNA hash without affecting behavior. It acts like a network-wide passcode. {#network-seed}
    * `properties`: Arbitrary, application-specific constants. The integrity code can access this, deserialize it, and change its runtime behavior. Think of it as configuration for the DNA.
    * `origin_time`: The earliest possible timestamp for any data; serves as a basis for coordinating network communication. Pick a date that's guaranteed to be slightly earlier than you expect that the app will start to get used. The scaffolding tool and `hc dna init` will both pick the date you created the DNA.
    * `zomes`: A list of all the integrity zomes in the DNA.
        * `name`: A unique name for the zome, to be used for dependencies.
        * `hash`: Optional. If the hash of the zome at the specified location doesn't match this value, installation will fail.
        * Location: The place to find the zome's WebAssembly bytecode. The three options are:
            * `bundled`: Expect the file to be part of this [bundle](#bundle-a-dna). The value is a path relative to the manifest file.
            * `path`: Get the file from the local filesystem. The value is a filesystem path.
            * `url`: Get the file from the web. The value is a URL, of course.
* `coordinator`: Contains all the coordinator bits for the DNA, which do not change the DNA hash and can be modified after the DNA is installed and being used in a [cell](/concepts/2_app_architecture/#cell).
    * `zomes`: Currently the only field in `coordinator`. A list of coordinator zomes. Each item in the list is the same as in `integrity.zomes` above, except that the following field is added:
        * `dependencies`: The integrity zomes that this coordinator zome depends on. Note that you can leave this field out if there's only one integrity zome (it'll be automatically treated as a dependency). For each dependency in the list, there's one field:
            * `name`: A string matching the `name` field of the integrity zome the coordinator zome depends on.

## Bundle a DNA

To roll a DNA manifest and all its zomes into a **DNA bundle**, use the `hc` command on a folder that contains a `dna.yaml` file:

```bash
hc dna pack my_dna/
```

This will create a file in the same folder as the `dna.yaml`, called `<name>.dna`, where `<name>` comes from the `name` field at the top of the manifest.

## Make a coordinator zome depend on an integrity zome

<!-- TODO: write about depending on multiple integrity zomes with `hdk_to_coordinates` -->

In order for a coordinator zome to read and write the entry and link types defined by an integrity zome, you'll need to specify the dependency in a few places.

1. In your coordinator zome's `Cargo.toml` file, specify a dependency on the integrity zome's crate just like you would any Cargo dependency. You can see how to do this in the [Create a coordinator zome section](/build/zomes/#create-a-coordinator-zome) on the Zomes page.
2. In your DNA manifest file, specify the dependency in the `coordinator` section by referencing the integrity zome's `name` field. You can see an example [above](#specify-a-dna-manifest), where the `movies` zome depends on the `movies_integrity` zome. (Remember that you don't need to do this if there's only one integrity zome.)

Then, in your coordinator zome's code, import the integrity zome's entry and link types enums and entry structs/enums as needed:

```rust
use movies_integrity::{EntryTypes, LinkTypes, Movie, Director};
```

!!! info Why do I need to specify the dependency twice?

It's probably clear to you why you'd need to specify an integrity zome as a Cargo dependency. But why would you need to duplicate that relationship in your DNA manifest?

When you write an entry, its type is stored in the [entry creation action](/build/entries/#entries-and-actions) as a tuple of `(integrity_zome_index, entry_type_index)`, which are just numbers rather than human-readable identifiers. The integrity zomes are indexed by the order they appear in the manifest file, and an integrity zome's entry types are indexed by the order they appear in [an enum with the `#[hdk_entry_types]` macro](/build/entries/#define-an-entry-type).

When your coordinator zome depends on an integrity zome, it doesn't know what that zome's index in the DNA is, so it addresses the zome by its own internal zero-based indexing. Holochain needs to map this to the proper zome index, so it expects your DNA manifest file to tell it about the integrity zome it depends on.

<!-- TODO: ditto re: writing about that nested enum thing -->

!!!

## Next steps

Now that you've created a bare DNA, it's time to [fill it with zomes](/build/zomes/), [define some data types](/build/working-with-data), and write some [callbacks](/build/callbacks-and-lifecycle-hooks/) and an [API](/build/zome-functions/).

## Reference

* [`holochain_types::dna::DnaManifestCurrent`](https://docs.rs/holochain_types/latest/holochain_types/dna/struct.DnaManifestCurrent.html), the underlying type that the DNA manifest gets parsed into. It has a lot of good documentation on the manifest format.

## Further reading

* [Get Started: Installing Holochain Development Environment](/get/started/#2-installing-holochain-development-environment)
* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)
* [Build Guide: Zomes](/build/zomes/)