---
title: "DNAs"
---

::: intro
A **DNA** is a bundle of one or more [**zomes**](/build/zomes/), along with optional **DNA modifiers**. Together, the zomes and DNA modifiers define the executable code and settings for a single **peer-to-peer network**.
:::

## DNAs: the 'rules of the game' for a network {#dnas-the-rules-of-the-game-for-a-network}

Holochain supports multiple, separate peer-to-peer networks, each with its own membership and shared [graph database](/build/working-with-data/). Each network is backed by its own DNA, whose executable code and settings create the 'rules of the game' for the network.

The **DNA hash** is the unique identifier for a network. The **DNA integrity modifiers** contribute to this hash; the rest of the DNA does not. That means that any change to integrity modifiers will change the DNA hash and form a new network if agents install and run it.

The contents of a DNA are specified with a **manifest file**.

## Create a DNA

If you use the scaffolding tool, it'll scaffold a working directory for every DNA you scaffold. In the root folder of a [hApp project that you've scaffolded](/build/happs/#create-a-happ), type:

```bash
hc scaffold dna movies
```

This will create a folder called `dnas/movies`, with these contents:

* `workdir/`: The place for your manifest; it's also where your built and bundled DNA will appear.
    * `dna.yaml`: The manifest for your DNA (see the next section).
* `zomes/`: The place where all your zomes should go.
    * `integrity/`: The place where your [integrity zomes](/build/zomes/#integrity) should go.
    * `coordinator/`: The place where your [coordinator zomes](/build/zomes/#coordinator) should go.

It'll also add the new DNA to `workdir/happ.yaml`.

## Specify a DNA manifest

A DNA manifest is written in [YAML](https://yaml.org/). It contains metadata about the DNA, a section for **integrity** code and modifiers, and a list of [**coordinator zomes**](/build/zomes/#coordinator).

If you want to write your own manifest file, name it `dna.yaml` and give it the following structure. This example assumes that all of your zomes are in a folder called `zomes/`. Afterwards we'll explain what the fields mean.

```yaml
manifest_version: '1'
name: movies
integrity:
  network_seed: null
  properties:
    foo: bar
    baz: 123
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

* `name`: A string for humans to read. This might get used in the admin panel of Holochain [conductors](/concepts/2_application_architecture/#conductor) like [Holochain Launcher](https://github.com/holochain/launcher).
* `integrity`: Contains all the integrity code and modifiers for the DNA, the things that **change the DNA hash**. {#integrity-section}
    * `network_seed`: A string that serves only to change the DNA hash without affecting behavior. It's useful for creating partitioned networks that share the same back-end code. {#network-seed}
    * `properties`: Arbitrary, application-specific constants. The zome code can [read this at runtime](#use-dna-properties). Think of it as configuration for your DNA.
    * `zomes`: A list of all the integrity zomes in the DNA.
        * `name`: A unique name for the zome, to be used for dependencies.
        * `hash`: Optional. If the hash of the zome at the specified location doesn't match this value, installation will fail.
        * Location: The place to find the zome's WebAssembly bytecode. The three options are:
            * `bundled`: Expect the file to be part of this [bundle](#bundle-a-dna). The value is a path relative to the manifest file.
            * `path`: Get the file from the local filesystem. The value is a filesystem path.
            * `url`: Get the file from the web. The value is a URL, of course.
* `coordinator`: Contains all the coordinator bits for the DNA, which do not change the DNA hash and can be modified after the DNA is installed and being used in a [cell](/concepts/2_application_architecture/#cell).
    * `zomes`: Currently the only field in `coordinator`. A list of coordinator zomes. Each item in the list is the same as in `integrity.zomes` above, except that the following field is added:
        * `dependencies`: The integrity zomes that this coordinator zome depends on. Note that you can leave this field out if there's only one integrity zome (it'll be automatically treated as a dependency). For each dependency in the list, there's one field:
            * `name`: A string matching the `name` field of the integrity zome the coordinator zome depends on.

            Note that currently [a coordinator zome can only depend on one integrity zome](#multiple-deps-warning).

## Bundle a DNA

DNAs are distributed in a `.dna` file that contains the manifest and all the compiled zomes.

If you've used the scaffolding tool to create your DNA in a hApp, you can build all the DNAs at once with the npm script that was scaffolded for you. In your project's root folder, in the dev shell, type:

```bash
npm run build:happ
```

To roll a single DNA manifest and all its zomes into a DNA bundle, first compile all of the zomes:

```bash
npm run build:zomes
```

Then go to the `workdir` folder of the DNA you want to bundle, and use the `hc dna pack` command:

```bash
cd dnas/movies/workdir
```
```bash
hc dna pack
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

It's probably clear to you why you'd need to specify an integrity zome as a Cargo dependency --- so your coordinator code can work with the types that the integrity zome defines. But why would you need to duplicate that relationship in your DNA manifest?

When you construct an entry or link, Holochain needs to know the numeric ID of the integrity zome that should validate it. (It's a numeric ID so that it's nice and small.) But because your coordinator and integrity zome can be reused in another DNA with a different manifest structure, you can't know the integrity zome's ID at compile time.

So Holochain manages the dependency mapping for you, allowing you to write code without thinking about zome IDs at all. But at the DNA level, you need to tell Holochain what integrity zome the coordinator needs, so it knows how to satisfy the dependency.

**Note that there's currently a couple bugs in this dependency mapping.** If your DNA has more than one integrity zome, its coordinator zomes should have **one dependency at most** and should **always list that dependency explicitly** in the DNA manifest.<!--TODO: update this once https://github.com/holochain/holochain/issues/4660 is resolved --> {#multiple-deps-warning}
!!!

## Single vs multiple DNAs {#single-vs-multiple-dnas}

When do you decide whether a hApp should have more than one DNA? Whenever it makes sense to have multiple separate networks or databases within the hApp. These are the most common use cases:

* **Dividing responsibilities.** For instance, a video sharing hApp may have one group of peers who are willing to index video metadata and offer search services and another group of peers who are willing to host and serve videos, along with people who just want to watch them. This DNA could have `search` and `storage` DNAs, along with a main DNA that allows video watchers to look up peers that are offering services and query them.
* **Creating privileged spaces.** A chat hApp may have both public and private rooms, all [cloned](/resources/glossary/#cloning) from a single `chat_room` DNA. This is a special case, as they all use just one base DNA, but they change just one [integrity modifier](#dna-manifest-structure-at-a-glance) such as the network seed to create new DNAs.
* **Discarding or archiving data.** Because no data is ever deleted in a cell or the network it belongs to, a lot of old data can accumulate. Creating clones of a single storage-heavy DNA, bounded by topic or time period, allows agents to participate in only the networks that contain the information they need. As agents leave networks, unwanted data naturally disappears from their machines.

!!! info Using the network seed for private spaces
A network seed with high entropy could be used as a passcode for joining a network, allowing you to create a moderately private space. It shouldn't be considered a truly secret space though, as anyone with access to the network seed or the resulting modified DNA hash will be able to join the network and access its data and membership.

Privacy is a broad topic outside the scope of this guide. If you'd like to go deeper, read the paper [_Exploring Co-Design Considerations for Embedding Privacy in Holochain Apps_](https://dialnet.unirioja.es/servlet/articulo?codigo=8036267).
!!!

### Call from one cell to another

Agents can make **remote calls** within a single DNA's network with the [`call_remote`](https://docs.rs/hdk/latest/hdk/p2p/fn.call_remote.html) host function, and they can make **bridge calls** to other cells in the same hApp instance on their own device with the [`call`](https://docs.rs/hdk/latest/hdk/p2p/fn.call.html) host function.

Here's an example using both of these functions to implement the dividing-responsibilities pattern described above. It assumes a hApp with two DNAs -- a main one and another one called `search`, which people enable if they want to become a search provider. We won't show the `search` DNA's code here; just imagine it has a coordinator zome called `search` with a function called `do_search_query`.

```rust
use hdk::prelude::*;

#[derive(Deserialize, Serialize, Debug)]
pub struct SearchQuery {
    pub terms: String,
    pub keywords: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SearchInput {
    pub query: SearchQuery,
    // An agent must ask a specific peer for search results.
    // A full app would also contain code for finding out what agents are
    // offering search services.
    pub peer: AgentPubKey,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct SearchResult {
    pub title: String,
    pub description: String,
    pub video_hash: EntryHash,
}

// Video watcher agents use this function to query a search service provider
// agent.
#[hdk_extern]
pub fn search(input: SearchInput) -> ExternResult<Vec<SearchResult>> {
    let response = call_remote(
        input.peer,
        // The function is in the same zome.
        zome_info()?.name,
        "handle_search_query".into(),
        // No capability secret is required to call this function.
        // This assumes that, somewhere else in the code, there's a way for
        // agents who want to become search providers to assign an
        // unrestricted capability grant to the `handle_search_query`
        // function.
        None,
        input.query,
    )?;
    match response {
        ZomeCallResponse::Ok(data) => data
            .decode()
            .map_err(|e| wasm_error!("Couldn't deserialize response into search results: {}", e)),
        ZomeCallResponse::Unauthorized(_, _, _, _, agent) => Err(wasm_error!("The remote peer {} rejected your search query", agent)),
        ZomeCallResponse::NetworkError(message) => Err(wasm_error!(message)),
        _ => Err(wasm_error!("An unknown error just happened"))
    }
}

// Search provider agents use this function to access their `search` cell,
// which is responsible for indexing and querying video metadata.
#[hdk_extern]
pub fn handle_search_query(query: SearchQuery) -> ExternResult<Vec<SearchResult>> {
    let response = call(
        CallTargetCell::OtherRole("search".into()),
        "search",
        "do_search_query".into(),
        // Agents don't need a cap secret to call other cells in their own
        // hApp instance.
        None,
        query,
    )?;
    match response {
        ZomeCallResponse::Ok(data) => data
            .decode()
            .map_err(|e| wasm_error!("Couldn't deserialize response into search results: {}", e)),
        _ => Err(wasm_error!("An unknown error just happened"))
    }
}
```

Note that **bridging between different cells only happens within one agent's hApp instance**, and **remote calls only happen between two agents in one DNA's network**. For two agents, Alice and Bob, Alice can do this:

| ↓ wants to call → | Alice `main`  | Alice `search` | Bob `main`    | Bob `search`  |
| ----------------- | :-----------: | :------------: | :-----------: | :-----------: |
| Alice `main`      | `call`        | `call`         | `call_remote` | ⛔            |
| Alice `search`    | `call`        | `call`         | ⛔            | `call_remote` |

## Use DNA properties

The `properties` field in your DNA is just arbitrary bytes, but it's meant to be written and deserialized as YAML. Any of your zomes can access it. Because it's a DNA modifier, it [changes the DNA hash](#dnas-the-rules-of-the-game-for-a-network), which results in a new network. The reason for this is that you can use the properties in your [validation callbacks](/build/validation/), configuring how they work for different networks. You can only modify DNA properties before an app is installed or when a cell is cloned --- not while the cell is running.

You can deserialize your DNA modifiers automatically by using the [`dna_properties` macro](https://docs.rs/hdk_derive/latest/hdk_derive/attr.dna_properties.html) on a type definition, which will give your type a method called `try_from_dna_properties`.

This example shows a helper function that only permits one agent to write data. This function could be used in a validation callback to enforce this restriction.

```rust
use hdi::prelude::*;

#[dna_properties]
struct DnaProperties {
    // The only agent that's allowed to write data to this DHT.
    // Configurable per network.
    writer: AgentPubKey,
}

fn is_allowed_to_write_data(author: AgentPubKey) -> ExternResult<bool> {
    let dna_props = DnaProperties::try_from_dna_properties()?;
    Ok(author == dna_props.writer)
}
```

## Next steps

Now that you've created a bare DNA, it's time to [fill it with zomes](/build/zomes/), [define some data types](/build/working-with-data), and write some [callbacks](/build/callbacks-and-lifecycle-hooks/) and an [API](/build/zome-functions/).

## Reference

* [`holochain_types::dna::DnaManifestCurrent`](https://docs.rs/holochain_types/latest/holochain_types/dna/struct.DnaManifestCurrent.html), the underlying type that the DNA manifest gets parsed into. It has a lot of good documentation on the manifest format.

## Further reading

* [Get Started: Installing Holochain Development Environment](/get-started/#2-installing-holochain-development-environment)
* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)
* [Build Guide: Zomes](/build/zomes/)