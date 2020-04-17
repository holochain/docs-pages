\#S:MODE=test
\#S:INCLUDE
\#S:EXTERNAL=javascript=hello_holo.js=test
\#S:EXTERNAL=rust=hello_holo.rs
# Hello Holo Tutorial

!!! tip "Time & Level"
    Time: ~2 hours | Level: Beginner

Let's begin with the classic Hello ~~World~~ Holo tutorial!
You will see it's super easy to create a distributed application with Holochain.

### What will you learn
You'll learn how to create a Holochain zome with a callable function, compile it into a DNA, and run it in the Holochain conductor.
Once it's running, you will learn how to call a zome function using curl.

### Why it matters
This tutorial helps you get orientated to the basics of a hApp. These are the fundamental parts on which you will be building later, so it's important to have a clear and solid understanding.

## Setup

1. Complete the [installation guide](https://developer.holochain.org/start.html). It will give you an app development, environment including the Holochain developer tool `hc`.
2. Open up a terminal (command prompt in Windows).
3. Enter the development environment.
macOS/Linux, you'll remember this command from the installation tutorial:
```bash
nix-shell https://holochain.love
```
Windows (do this in the place where you installed Holochain):
```cmd
vagrant up
vagrant ssh
nix-shell https://holochain.love
```

!!! tip "Nix Shell"
    You will see commands marked `Run in nix-shell https://holochain.love` throughout these tutorials.
    You should keep the nix-shell open and run these commands in it---don't reopen nix-shell for every command.

## Initializing your new app

Pick a new home in which all your future Holochain applications will live. Something like  `home_directory/holochain/`.

Then, create a `coreconcepts` folder for this tutorial series:

```bash
cd ~
mkdir holochain
cd holochain
mkdir coreconcepts
cd coreconcepts
```

It's time to put the Holochain command line tool (`hc`) to work and make your app.

Initialize a new app and enter the app directory:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc init cc_tuts
    cd cc_tuts
    ```

#### Compile

!!! tip "Run `hc` and `holochain` from root directory."
    All `hc` and `holochain` commands should be run from the project root (e.g., `cc_tuts/`), except of course `hc init`, because the root doesn't exist at this point.

It's always good to frequently compile your app to catch any mistakes early on.

Give it a go by asking `hc` to package your app:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc package
    ```

'Packaging your app' means you are compiling the code into a DNA file and getting it ready to be run.


!!! success "You should see a successful compilation like this:"
    ```json
    Created DNA package file at "/Users/username/holochain/testing_tuts/hello_holo/dist/hello_holo.dna.json"
    DNA hash: QmY7rhg4sf6xqQMRL1u1CnXVgmamTfxC59c9RaoFqM2eRs
    ```

## Generate a zome

Your app doesn't really do much right now because it needs a [zome](https://developer.holochain.org/guide/latest/zome/welcome.html). A zome is Holochain's way of organizing code into nice units that perform a certain task (like saying, "Hello").

Generate a zome called `hello` inside the zome's folder:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc generate zomes/hello rust-proc
    ```

#### Compile

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc package
    ```

> Zomes can take a little while to compile the first time. Compiling will be much faster the next time you do it. Feel free to move on with the tutorial while your app compiles.


!!! success "If all went well you should see:"
    ```bash
    > cargo build --release --target=wasm32-unknown-unknown --target-dir=target
       Compiling hello v0.1.0 (/Users/username/holochain/coreconcepts/hello_hollo/zomes/hello/code)
        Finished release [optimized] target(s) in 11.95s
    > cargo build --release --target=wasm32-unknown-unknown --target-dir=target
        Finished release [optimized] target(s) in 0.50s
    Created DNA package file at "/Users/username/holochain/coreconcepts/hello_hollo/dist/hello_hollo.dna.json"
    DNA hash: QmdNyxke1Z9Kunws4WUXHnt4cdKQnPogC7YPpfQx67fo1z
    ```

## Folder layout

#### Look at the folder layout

![Folder Layout](../../img/folder_layout.png)

#### Open the `lib.rs` file

The zome is a [Rust](https://rust-lang.com) project and makes use of [macros](https://doc.rust-lang.org/book/ch19-06-macros.html#the-difference-between-macros-and-functions) to keep you from having to write a lot of boilerplate code. The main file you will be editing is: `hello_hollo/zomes/code/src/lib.rs`.

Let's have a look at the generated code—--open up the `lib.rs` file in an editor.

The following lines import the Holochain HDK. You are telling Rust, "Hey, I need things from all these [crates](https://doc.rust-lang.org/book/ch07-01-packages-and-crates.html) in order to do my job."

\#S:SKIP
```rust
#![feature(proc_macro_hygiene)]

use hdk::prelude::*;
use hdk_proc_macros::zome;
```

There are a few sections of generated code that are not useful for this tutorial.

Remove the following piece of code:

\#S:CHANGE
```diff
-#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
-pub struct MyEntry {
-    content: String,
-}
```

The `my_zome` module is where all your zome code lives. `#[zome]` is a [procedural macro](https://doc.rust-lang.org/reference/procedural-macros.html) that says that the following module defines all the things that Holochain should know about this zome. It saves you writing lots of code.

Change it to `hello_zome` for this tutorial series:

\#S:CHANGE
```diff
#[zome]
-mod my_zome {
+mod hello_zome {
```

The `init` function is run when a user starts the app for the first time. Every zome defines this function so it can do some initial setup tasks, but in this zome it doesn't do anything.
\#S:SKIP
```rust
    #[init]
    fn init() {
```

Return success with the empty value `()`. In Rust, `()` is called the [unit type](https://doc.rust-lang.org/std/primitive.unit.html) and is similar, though not identical, to a [void type](https://en.wikipedia.org/wiki/Void_type) in other languages.

```rust
        Ok(())
    }
```

This required function is run at application start too, once by the new user and once by the existing peers. It checks that the user is allowed to join the network. In this case, it gives everyone a free pass.

```rust
    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }
```

Remove the following template code:
\#S:INCLUDE

\#S:CHANGE
```diff
-      #[entry_def]
-      fn my_entry_def() -> ValidatingEntryType {
-         entry!(
-             name: "my_entry",
-             description: "this is a same entry defintion",
-             sharing: Sharing::Public,
-             validation_package: || {
-                 hdk::ValidationPackageDefinition::Entry
-             },
-             validation: | _validation_data: hdk::EntryValidationData<MyEntry>| {
-                 Ok(())
-             }
-         )
-     }
-
-     #[zome_fn("hc_public")]
-     fn create_my_entry(entry: MyEntry) -> ZomeApiResult<Address> {
-         let entry = Entry::App("my_entry".into(), entry.into());
-         let address = hdk::commit_entry(&entry)?;
-         Ok(address)
-     }
-
-     #[zome_fn("hc_public")]
-     fn get_my_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
-         hdk::get_entry(&address)
-     }
```

!!! info "A note about return values"
    You'll often see Rust functions returning some sort of [`Result`](https://doc.rust-lang.org/std/result/) value. This is a special Rust type that can either be `Ok(some_value)` to show that the function succeeded or `Err(some_error)` to report an error. Required Holochain functions, like init and validators, are expected to return a special result type called [`ZomeApiResult`](https://docs.rs/hdk/latest/hdk/error/type.ZomeApiResult.html), which shuttles data back and forth between your app and the conductor. It's a useful structure, so it makes sense to use it in the API functions you write as well.

## Add a function to say "Hello" :)

Now, tell the zome to return `Hello Holo` from a public function.

Locate the `validate_agent` function:

\#S:SKIP
```rust
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
      Ok(())
    }
```

You're going to put your public zome function after it.

The `hc_public` procedural macro will turn the function directly below it into a public function that GUIs, other zomes, and DNAs can call. It takes note of the function's name, the parameters it accepts, and the type of value it returns, so Holochain can call it properly.

Add the `hc_public` macro:

\#S:INCLUDE
```rust
    #[zome_fn("hc_public")]
```

The function `hello_holo` takes no arguments and returns a Holochain result type. We're also telling Holochain that if the result is `Ok`, it will contain a string.

Start the function:

```rust
    pub fn hello_holo() -> ZomeApiResult<String> {
```

Return an `Ok` result that contains our greeting. `into()` is a bit of Rust oddness that just means "turn this [slice](https://doc.rust-lang.org/std/slice/) into a `String`:"

```rust
        Ok("Hello Holo".into())
    }
```

\#S:HIDE
```rust
}
```

#### Compile

\#S:CHECK=rust

> If you find errors, remember to fix them before moving on. You can always get help on the Holochain[forum](https://forum.holochain.org/t/about-the-getting-started-category/167).

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc package
    ```

## Talk to your app through HTTP

To interact with your application, you can run it in HTTP mode.

Run your app in HTTP mode:
!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc run -i http
    ```

You can send a [POST](https://en.wikipedia.org/wiki/POST_(HTTP)) message to your app using [curl](https://curl.haxx.se/), a little command for making HTTP requests, which is included in the Holochain dev environment.

You will need to open a new terminal window and enter the nix-shell again:

```bash
nix-shell https://holochain.love
```

Enter the following request, which calls the `hello_holo` function and returns the result:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    curl -X POST -H "Content-Type: application/json" -d '{"id": "0", "jsonrpc": "2.0", "method": "call", "params": {"instance_id": "test-instance", "zome": "hello", "function": "hello_holo", "args": {} }}' http://127.0.0.1:8888
    ```

!!! success "And you should get back your string from the `hello_holo` function:"
    ```json
    {"jsonrpc":"2.0","result":"{\"Ok\":\"Hello Holo\"}","id":"0"}
    ```

Congratulations---you have created your first distributed Holochain application! :rocket:

!!! success "Solution"
    You can check the full solution to this tutorial on [here](https://github.com/freesig/cc_tuts/tree/hello_holo).


### Key takeaways
- A zome is compiled down to WebAssembly and run by the Holochain conductor.
- You can call public zome functions through the conductor using HTTP.

### Learn more
- [Curl](https://curl.haxx.se/docs/manpage.html)
- [WebAssembly](https://webassembly.org/)
