---
title: "Zomes"
---

::: intro
A **zome** (short for chromosome) is a module of executable code within a [**DNA**](/resources/glossary/#dna). It's the smallest unit of modularity in a Holochain application.
:::

## How a zome is structured

A zome is just a [WebAssembly module](https://webassembly.github.io/spec/core/syntax/modules.html) that exposes public functions. The **conductor** (the Holochain runtime) knows about these functions and calls them at different points in the application's lifetime. Some functions have special names and are called **lifecycle callbacks**<!-- TODO uncomment when lifecycle callbacks PR is merged [lifecycle callbacks](/build/lifecycle-events-and-callbacks/)-->, and you can also define arbitrarily named functions of your own to serve as your zome's API.

For Rust developers, we've created an SDK called the [Holochain Development Kit (HDK)](https://crates.io/crates/hdk/). It lets you define functions, exchange data with the host (the Holochain VM), and access all of the host's functionality.

## The two types of zomes

### Integrity

An **integrity zome** defines a portion of your application's data model or schema. This includes not just the structure of the data but also _validation rules for operations that manipulate this data_.

!!! info Keep your integrity zomes small

While you can define arbitrary public zome functions in your integrity zome, in practice it makes fixing bugs and adding features difficult, because every code change to an integrity zome [modifies the hash of the DNA](/build/application-structure/#dna) and causes a fork of the database. So it's better for maintainability if the integrity zome _only_ contains your data model and the necessary callbacks that inform Holochain about that model.

Because these callbacks only need a small portion of Holochain's functionality, you don't need the entire `hdk` crate to write an integrity zome. Use the smaller [`hdi`](https://crates.io/crates/hdi) crate instead.

!!!

<!-- TODO: placeholder to ask the question, should we mention the pattern of defining all your types in a separate crate so the coordinator can import the types without having to import the validation callback etc? is that possible? how does it work? -->

Your integrity zome tells Holochain about the types of [entries](/build/entries/) and [links](/build/links-paths-and-anchors/) it defines with macros called [`hdk_entry_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_entry_types.html) and [`hdk_link_types`](https://docs.rs/hdi/latest/hdi/attr.hdk_link_types.html) added to enums of all the entry and link types. These create lifecycle callbacks that are run at DNA install time and give Holochain the info it needs. Read more in [Define an entry type](/build/entries/#define-an-entry-type) and [Define a link type](/build/links-paths-and-anchors/#define-a-link-type).

Finally, your integrity zome defines validation callbacks <!-- TODO: uncomment once lifecycle events PR is merged [validation callbacks](/build/lifecycle-events-and-callbacks/#define-a-validate-callback)--> that check for correctness of data and actions. Holochain runs this on an agent's own device when they attempt to author data, and on other peers' devices when they're asked to store and serve data authored by others.

#### Create an integrity zome

**The easy way to create an integrity zome** is to [scaffold a new hApp](/get-started/3-forum-app-tutorial/). The scaffolding tool will generate all the project files, including scripts to test and build distributable packages, and it can also scaffold boilerplate code for all your app's required callbacks and data types.

If you want to start from scratch, first make sure you have Rust, Cargo, and the `wasm32-unknown-unknown` Rust toolchain installed on your computer. Then create a library crate:

```bash
cargo new my_integrity_zome --lib
```

Then add some necessary dependencies to your new `Cargo.toml` file:

```diff:toml
 [dependencies]
+hdi = "=0.5.0-rc.1"
+serde = "1.0"
```

At the very minimum, make sure your code exposes a `validate` callback <!-- TODO: uncomment once lifecycle events PR is merged [`validate` callback](/build/lifecycle-events-and-callbacks/#define-a-validate-callback)--> and [defines some entry types](/build/entries/#define-an-entry-type).

Compile your zome using `cargo`:

```bash
cargo build --release --target wasm32-unknown-unknown
```

### Coordinator

Coordinator zomes hold your back-end logic --- the functions that read and write data or communicate with peers. In addition to some optional, specially named lifecycle callbacks <!-- TODO: uncomment once lifecycle events PR is merged [lifecycle callbacks](/build/lifecycle-events-and-callbacks/#coordinator-zomes)-->, you can also write your own **zome functions** that serve as your zome's API.

#### Create a coordinator zome

Again, **the easiest way to create a coordinator zome** is to let the scaffolding tool do it for you. But if you want to do it from scratch, it's the same as an integrity zome, with two exceptions. Your `Cargo.toml`'s dependencies should be modified like this:

```diff:toml
 [dependencies]
-hdi = "=0.5.0-rc.1"
+hdk = "=0.4.0-rc.1"
 serde = "1.0"
```

And there aren't any required callbacks to define in your code.

## Define a function

The conductor and the zome pass function input and output data to each other by first allocating the data in a piece of memory that they both share, then passing a pointer to the location and size of the data. This is rather complicated, so we've built a macro called [`hdk_extern`](https://docs.rs/hdk/latest/hdk/prelude/attr.hdk_extern.html) that makes it as easy as defining a `pub fn`.

Any function with this macro must have a single input parameter of any type and return an [`ExternResult<T>`](https://docs.rs/hdk/latest/hdk/map_extern/type.ExternResult.html), where `T` is also any type (although the special lifecycle callbacks must follow expected input and output types). The input parameter's type must be deserializable by [serde](https://serde.rs/), and the wrapped return value's type must be serializable. All of the example functions in this guide follow those constraints.

Here's a very simple zome function that takes a name and returns a greeting:

```rust
use hdk::prelude::{hdk_extern, ExternResult};

#[hdk_extern]
pub fn say_hello(name: String) -> ExternResult<String> {
    Ok(format!("Hello {}!", name))
}
```

### Handling errors

You can handle most errors in a function with the `?` short-circuit operator; the HDK does a good job of converting `Result:Err` into `ExternResult<T>` and providing the zome name and the line number where the failure happened.

```rust
use hdk::prelude::{hdk_extern, ExternResult};

struct Foo {
    bar: i32;
    baz: String;
}

#[hdk_extern]
pub fn try_to_deserialize_foo_and_get_baz(bytes: Vec<u8>) -> ExternResult<String> {
    // Short-circuit any deserialization error.
    let deserialized: Foo = bytes.try_into()?;
    Ok(deserialized.baz)
}
```

You can also explicitly return an error with the [`wasm_error`](https://docs.rs/hdi/latest/hdi/prelude/macro.wasm_error.html) macro:

```rust
use hdk::prelude::{hdk_extern, ExternResult, wasm_error};

#[hdk_extern]
pub fn check_age_for_18a_movie(age: u32) -> ExternResult<()> {
    if age >= 18 {
        Ok(())
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
