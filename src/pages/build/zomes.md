---
title: "Zomes"
---

::: intro
A **zome** (short for chromosome) is a module of executable code within a [**DNA**](/resources/glossary/#dna). It's the smallest unit of modularity in a Holochain application.
:::

## How a zome is structured

A zome is just a [WebAssembly module](https://webassembly.github.io/spec/core/syntax/modules.html) that exposes public functions. The **conductor** (the Holochain runtime) calls these functions at different points in the application's lifetime. Some functions have special names and serve as **callbacks** that are called by the Holochain system. Others are ones you define yourself, and they become your zome's API that external processes such as a UI can call.

## How a zome is written

We're focusing on Rust as a language for writing zomes, mainly because Holochain is written in Rust, so types can be shared between the host and zomes.

A Rust-based zome is a library crate that's compiled to the WebAssembly build target. We've created an SDK called the [Holochain Development Kit (HDK)](https://crates.io/crates/hdk/), which lets you define functions, exchange data with the **host** (the Holochain conductor), and access all of the host's functionality.

## The two types of zomes

### Integrity

An **integrity zome** defines a portion of your application's data model. This includes not just the structure of the data but also _validation rules for operations that manipulate this data_.

!!! info Keep your integrity zomes small

When you're writing an integrity zome, use the smaller [`hdi`](https://crates.io/crates/hdi) crate instead of `hdk`, because it's a subset of the HDK's functionality that contains everything an integrity zome needs. There's a lot of functionality in `hdk` that can't be used in an integrity zome's callbacks, and we recommend against putting anything in your integrity zome other than your data model. `hdi` is also more stable than `hdk`. Both of these things matter because every change to an integrity zome, including dependency updates, [changes the DNA hash](/build/application-structure/#dna), creating a new empty network and database.

!!!

<!-- TODO: placeholder to ask the question, should we mention the pattern of defining all your types in a separate crate so the coordinator can import the types without having to import the validation callback etc? is that possible? how does it work? -->

Your integrity zome tells Holochain about the types of [entries](/build/entries/) and [links](/build/links-paths-and-anchors/) it defines with macros called [`hdk_entry_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_types.html) and [`hdk_link_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_link_types.html) added to enums of all the entry and link types. These create callbacks that are run at DNA install time. Read more in [Define an entry type](/build/entries/#define-an-entry-type) and [Define a link type](/build/links-paths-and-anchors/#define-a-link-type).

Finally, your integrity zome defines validation callbacks <!-- TODO: uncomment once lifecycle events PR is merged [validation callbacks](/build/lifecycle-events-and-callbacks/#define-a-validate-callback)--> that check for correctness of data and actions. Holochain runs this on an agent's own device when they try to author data, and when they're asked to store and serve data authored by others.

#### Create an integrity zome

**The easy way to create an integrity zome** is to [scaffold a new hApp](/get-started/3-forum-app-tutorial/). The scaffolding tool will generate all the project files, including scripts to test and build distributable packages, and it can also scaffold boilerplate code for all your app's required callbacks and data types.

If you want to create a zome without the scaffolding tool, first make sure you have Rust, Cargo, and the `wasm32-unknown-unknown` Rust build target installed on your computer. Then create a library crate:

```bash
cargo new my_integrity_zome --lib
```

Then add some necessary dependencies to your new `Cargo.toml` file:

```diff:toml
 [dependencies]
+hdi = "=0.5.0-rc.1"
+serde = "1.0"
```

Now you can write a `validate` callback <!-- TODO: uncomment once lifecycle events PR is merged [`validate` callback](/build/lifecycle-events-and-callbacks/#define-a-validate-callback)--> and [define some entry types](/build/entries/#define-an-entry-type).

When you've written some code, compile your zome using `cargo`:

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Coordinator

Coordinator zomes hold your back-end logic --- the functions that read and write data or communicate with peers. In addition to some optional lifecycle callbacks <!-- TODO: uncomment once lifecycle events PR is merged [lifecycle callbacks](/build/lifecycle-events-and-callbacks/#coordinator-zomes)-->, you can also write your own **zome functions** that serve as your zome's API.

#### Create a coordinator zome

Again, **the easiest way to create a coordinator zome** is to let the scaffolding tool do it for you. But if you want to do it yourself, it's the same as an integrity zome, with one exception. Your `Cargo.toml`'s dependencies should be modified like this:

```diff:toml
 [dependencies]
-hdi = "=0.5.0-rc.1"
+hdk = "=0.4.0-rc.1"
 serde = "1.0"
```

## Define a function

You expose a callback or zome function to the host by making it a `pub fn` and adding a macro called [`hdk_extern`](https://docs.rs/hdk/latest/hdk/prelude/attr.hdk_extern.html). This handles the task of passing data back and forth between the host and the zome, which is complicated and involves pointers to shared memory.

A zome function must have a **single input parameter** of any type and return an [`ExternResult<T>`](https://docs.rs/hdk/latest/hdk/map_extern/type.ExternResult.html), where `T` is also any type. The input parameter's type must be deserializable by [serde](https://serde.rs/), and the wrapped return value's type must be serializable. All of the example functions in this guide follow those constraints.

Callbacks are the same, except that they must also use the proper input and output types for the callback's signature.

Here's a very simple zome function that takes a name and returns a greeting:

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn say_hello(name: String) -> ExternResult<String> {
    Ok(format!("Hello {}!", name))
}
```

### Handling errors

You can handle most errors in a function with the `?` short-circuit operator; the HDK does a good job of converting most of its own error types into `ExternResult<T>` and providing the zome name and the line number where the failure happened.

```rust
#[hdk_extern]
pub fn get_any_record(hash: AnyDhtHash) -> ExternResult<Option<Record>> {
    // Short-circuit any error that `get` might return.
    let maybe_record = get(hash, GetOptions::network())?;
    Ok(maybe_record)
}
```

You can also explicitly return an error with the [`wasm_error`](https://docs.rs/hdi/latest/hdi/prelude/macro.wasm_error.html) macro:

```rust
use hdk::prelude::*;

#[hdk_extern]
pub fn check_age_for_18a_movie(age: u32) -> ExternResult<()> {
    if age >= 18 {
        return Ok(());
    }
    Err(wasm_error!("You are too young to watch this movie."))
}
```

## Reference

* [`hdk` crate](https://docs.rs/hdk/latest/hdk/)
* [`hdi` crate](https://docs.rs/hdi/latest/hdi/)
* [`hdi::hdk_entry_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_types.html)
* [`hdi::hdk_link_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_link_types.html)
* [`hdk_derive::hdk_extern`](https://docs.rs/hdk_derive/latest/hdk_derive/attr.hdk_extern.html)
* [`hdi::map_extern::ExternResult<T>`](https://docs.rs/hdi/latest/hdi/map_extern/type.ExternResult.html)
* [`wasm_error`](https://docs.rs/hdi/latest/hdi/prelude/macro.wasm_error.html)

## Further reading

<!-- TODO: uncomment after lifecycle events PR is merged * [Build Guide: Lifecycle Events and Callbacks](/build/lifecycle-events-and-callbacks/)-->
<!-- TODO: uncomment after zome functions PR is merged * [Build Guide: Zome Functions](/build/zome-functions/)-->
* [WebAssembly](https://webassembly.org/)
* [serde](https://serde.rs/)
