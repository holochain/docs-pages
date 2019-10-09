# Starter App
Welcome to the first in a series of tutorials on building apps on holochain.
This series is designed to take you on a journey through building an application on Holochain.
Each episode will focus on a specific topic.

Throughout this series you will be developing a democratic collabrotive art game designed to be fun and explore the space of holochain topics.

Todays simple tutorial is designed to get you orientated with the parts you will need to develop a Holochain app.
The features will be kept simple so that you can focus on the core parts of Holochain. You will be building a minimal backend and interacting with it through tests and http requests.
You will learn to setup a simple Holochain app and start to become farmiliar with it's structure.

In the following episodes you will be progressively building on this foundation and developing your skills.
Let's get started.

## Design the app 
Before you get into implimentation it's important to do some design so that you have a clear path ahead.
The game works by allowing players to share edits and apply theme to their local piece of art.
An edit is a change to the artistic medium for example:

- Set the left half of an image to red.
- Set the first 4 letters of the text to "jump".
- Add white noise to from 4 to 6 seconds of the audio clip.

The edits do not have or need any knowledge of the agents current art. They are simply applied to whatever state currently exists.
Players can then use edits from someone else's art to apply to their own art leading to an interesting form of collaboration.
In future episodes we will explore how agents can work together to create shared art.
For now though we will keep things simple by constraining the medium to text and keeping each players art a result of their own local history.

Building games and creative coding are excellent ways to learn new software. This series combines them as a tool to explore all the concepts that you might need in your future holochain developing journey.

## What you will build today 
You will create a simplified version of our art game with the following features:
- Submit a new text based game.
- Check which games exist.
- Submit edits to the game.
- See which edits are pending.
- Accept edits to their own text.

### Checkpoint
Before continuing check that you have the holochain command line installed and up to date.
Check out this [install]() tutorial for help with that.

## Create your new project 
Your first steps into the distributed world begin with your terminal and the `hc` command line tool.

Create a good directory for this series. Something like `~/holochain/tutorial_series/` and do the following.
Initialize a new holochain app called `art_game` and move into the `art_game` directory:
```
$ hc init art_game
$ cd art_game
```
#### Try it
> It's a good idea to compile your app early so that you can catch any bugs and squish them. I will frequently prompt you do this throughout this tutorial.
Fortunately Holochain makes this super easy to do by packaging.

Compile the game:
```
$ hc package
```
If everything is working you will see something similar to:
```bash
Created DNA package file at "/Users/username/holochain/tutorials/dummy/art_game/dist/art_game.dna.json"
DNA hash: QmY7rhg4sf6xqQMRL1u1CnXVgmamTfxC59c9RaoFqM2eRs
```

> _A note on compile errors:_
In the future you may get some errors as your code gets more complex. The compilers feedback is usually helpful but if you get stuck head over to the [forum]().

## Create a zome 
Before you can start writing all your amazing ideas into code you need a home for them to live.
In the Holochain world we call this a zome.

Use the `hc` tool to generate a new zome:
```
$ hc generate zomes/game rust-proc  
```
#### Try it
> The first time you compile a zome might take a little while. You can continue on with the tutorial instead of waiting.
```
$ hc package
```

## Have a look at the files
While that compiles take a look at your directory structure.
![Folder Layout](https://i.imgur.com/qFQW7jk.png)

## Into the lib
Have a look at the `lib.rs` file.
- Open the `zomes/code/src/lib.rs` in your favourite editor

The following are all the imports.
You are telling Rust, "hey, I need things from all these crates in order to do my job."
```rust
#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;
```

Next are the use statements. 
They are saying, "I want to use these specific things from the above crates."
```rust
use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
};
use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
};

use hdk::holochain_json_api::{
    json::JsonString,
    error::JsonError
};

use hdk::holochain_persistence_api::{
    cas::content::Address
};

use hdk_proc_macros::zome;
```

There are a few sections of generated code that are not useful for this tutorial. 
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct MyEntry {
    content: String,
}
```

The my_zome mod is where all your zome code live.
`#[zome]` is a procedural macro that says that the following module defines all the things that Holochain should know about this zome.
It saves you writing lots of code.
Change it to `art_game_zome` for this tutorial series:
```rust
#[zome]
mod art_game_zome {
```
The init function is run when a user starts the app for the first time. Every zome defines this function so it can do some initial setup tasks. In this zome it doesn't do anything.
```rust
    #[init]
    fn init() {
```
Return success with the empty value `()`.
In Rust `()` is called the unit type.
```rust
        Ok(())
    }
```
An entry definition is the way you tell Holochain about the data in your app.
```rust
     #[entry_def]
     fn my_entry_def() -> ValidatingEntryType {
        entry!(
            name: "my_entry",
            description: "this is a same entry defintion",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<MyEntry>| {
                Ok(())
            }
        )
    }
```
This is a function you can call from outside the application.
For example from a UI.
```rust
    #[zome_fn("hc_public")]
    fn create_my_entry(entry: MyEntry) -> ZomeApiResult<Address> {
        let entry = Entry::App("my_entry".into(), entry.into());
        let address = hdk::commit_entry(&entry)?;
        Ok(address)
    }
```
This function turns an entrie's address back into an entry.
```rust
    #[zome_fn("hc_public")]
    fn get_my_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
        hdk::get_entry(&address)
    }
```
This required function is run at application start too, once by the new user and once by the existing peers. It checks that the user is allowed to join the network. In this case it gives everyone a free pass.
```rust
    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

}
```

## Store some art (text)
Time to start building your game. One of the key functionalities of this game is the ability to store a piece of art. In todays tutorial you will be storing a string of text. To store a piece of art you simply represent it as a rust struct.

Add the following code to the `lib.rs` above the `#[zome]`:

```rust
// Derives some traits that help with JSON, debugging, and cloning.
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Art {
    content: String,
}
```
> You want to put the struct here
>  ![](https://i.imgur.com/8d7TMVf.png)
>  
You have just defined an `Art` structure that holds a `String` of text.

You also need to represent the an actual game. The `Game` struct contains the address of the art it was created from. Note that this will never change as we will just be applying edits on top of this art. 

Add the following `Game` struct below the `Art` struct:
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Game {
    art: Address,
}

```

To represent a change to text you will need this handy enum.
It can store either an `add a character at this index` or `delete the character at this index`.
Add the follwoing below the `Game` struct:
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub enum Change {
    Add(u64, char),
    Delete(u64),
}

```
Here is the actual edit structure, it contains a list of changes to apply in this edit.
Add the follwoing below the `Change` enum:
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Edit {
    change: Vec<Change>,
}
```
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct AcceptedEdit {
    edit: Address,
    order: u64,
}
```

#### Try it
> Has your previous package finished successfully? It's important to fix any mistakes before moving too far ahead. If you get stuck, you can ask a question on the [forum]() or [chat]().
```
$ hc package
```
Congratulations you have got all the struture you need to get started with Holochain.

## Make a grand entry
Now Holochain needs to know some information about your structures. 
You can give Holochain a clear definition of how to use your data by creating an entry.
An entry is Holochains way of saying what type data an app can use and how it can use it.

Put all the following `entry_def` functions inside the `zome`.
```rust
#[zome]
mod my_zome {
//    <--- Put them in here

}
```

Add the following to your zome to define the entry for your `Art` struct:
```rust
// Add the entry_def macro that
// turns this function into an
// entry definition.
#[entry_def]
// Add this function.
// ValidatingEntryType is what the entry!
// macro produces.
fn art_enrty_def() -> ValidatingEntryType {
    // Add this entry macro.
    entry!(
        // This is the name of your entry.
        // It should match the lowercase name
        // of your struct
        name: "art",
        // A description of your what this
        // entry represents.
        description: "This is some Art",
        // Visible to anyone using this app.
        sharing: Sharing::Public,
        // This is a closure (a type of function)
        // that tells holochain what is needed to
        // validate this entry.
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        // This is a closure that will
        // run to validate an entry when
        // it is added, updated or removed.
        validation: | _validation_data: hdk::EntryValidationData<Art>| {
            // Simply don't do any validation
            // and return everything is ok.
            Ok(())
        }
    )
}
```
You have told Holochain how to what the `Art` struct is, how to validate it, and how to share it.
#### Try it
```
$ hc package
```

## Link a Game to it's edits
So now you will want to define you `Game` entry however there's an extra step. 

You need a way to show which edits have been accepted to your source chain so that your app can then generate the art by applying these edits. This is a type of mutable relationship. It will change while the game is played.

Holochain uses links to show relationships between entries that will change.
The `Game` entry will be very similar accept this time you will add a `current_art` link that points to an `Art` Entry.

Add the following below the `art_entry_def`:
```rust
// Game entry definition function.
// Add this the same way you did for the
// art entry def except that there
// is the new links field.
#[entry_def]
fn game_entry_def() -> ValidatingEntryType {
    entry!(
        name: "game",
        description: "This an Art game",
        sharing: Sharing::Public,
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<Game>| {
            Ok(())
        },
        // Link a game entry to an art entry.
        links: [
        to!(
            // The name of the link.
            "art",
            // The term you use to seach
            // for all entries under thhis link.
            link_type: "current_art",
            // Closure that says what is required
            // to validate this link.
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            // This closure is called to actually
            // validate this link.
            validation: |_validation_data: hdk::LinkValidationData| {
                // Return that everything is ok
                // and this link is valid.
                Ok(())
            }
        ),
        // Link to accepted edits.
        // These will be applied when the
        // current art is generated.
        to!(
            "accepted_edit",
            link_type: "accepted_edit",
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: |_validation_data: hdk::LinkValidationData| {
                Ok(())
            }
        )
        ]
    )
}
```
Games have art now, you are well on your way!
#### Try it
```
$ hc package
```

## Anchor your links
So far you have a link from games to their art but there's no way for your players to find the which games are out there.
For this you can use a universal anchor to link to all games.
This works by asking Holochain for all the `has_game` links to the entry `anchor`.

Put the following function below the `game_entry_def`:
```rust
    #[entry_def]
    fn anchor_entry_def() -> ValidatingEntryType {
        entry!(
            name: "anchor",
            description: "Anchor to all the links",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: |_validation_data: hdk::EntryValidationData<String>| {
                Ok(())
            },
            // Anchor will link to all games.
            // It is a good way for players to
            // find which games are available.
            links: [
            to!(
                // Link to the game entry
                "game",
                // This link is a has_game link
                link_type: "has_game",
               validation_package: || {
                   hdk::ValidationPackageDefinition::Entry
               },
               validation: |_validation_data: hdk::LinkValidationData| {
                   Ok(())
               }
            )
            ]
        )
    }
```
Well done, your players can now find all the games which they can then use to find the current art. Aren't links great :)
#### Try it
> Congratulations on building up a frequent compilation rhythm.
```
$ hc package
```

## Create a new game
Woohoo it's time for you to create a new game.
Well actually you need to make possible for some external thing like a UI or http request to create a new game.
Later you will use `curl` to do exactly that.
You can do this by making a public `create_game` function like this:
```rust
// Add the create_game function and 
// set it to public using the `hc_public` macro.
// It takes a piece of art and return the Address
// of the newly created Game.
#[zome_fn("hc_public")]
fn create_game(art: Art) -> ZomeApiResult<Address> {
    // Create the art entry and commit it to the chain.
    let art_entry = Entry::App("art".into(), art.into());
    // Notice the ?. This means the function will return early
    // here if there is an error.
    let art_address = hdk::commit_entry(&art_entry)?;
    // Create the game struct, entry, and commit it to the chain.
    let game = Game {};
    let game_entry = Entry::App("game".into(), game.into());
    let game_address = hdk::commit_entry(&game_entry)?;
    // Create the anchor entry and commit it to the chain.
    let anchor_entry = Entry::App("anchor".into(), "games".into());
    let anchor_address = hdk::commit_entry(&anchor_entry)?;
    // Link the anchor to the game.
    hdk::link_entries(&anchor_address, &game_address, "has_game", "")?;
    // Link the game to the art .
    hdk::link_entries(&game_address, &art_address, "current_art", "")?;
    // Return the address and that everything is ok.
    Ok(game_address)
}
```

Let's clarify a few things in that function:
- `#[zome_fn(hc_public)]` makes the function callable from outside your app.
- The `ZomeApiResult` is holochains result type that is returned to the caller.
- [?]() just means if this call didn't work return early with an error otherwise give the value.
- Commiting an entry means adding it to your nodes hash chain. 
- Finally we make the actual links.

#### Try it
> You knew I was going to ask :smile:.
```
$ hc package
```
## Submit an edit
In this simplified version of the game a player only has one move, submitting an `Edit`. This basically just means sending in the next piece of edited art to replace the current piece of art.
You can do this by changing the link to the current art.  

Add the public function `submit_edit` like this:
```rust
// Make it callable externally.
// Takes the address of the game
// that you want to add the edit to.
// The edited Art itself.
#[zome_fn("hc_public")]
fn submit_edit(game_address: Address, edit: Art) -> ZomeApiResult<Address> {
    // Commit the edited art entry.
    let edit_entry = Entry::App("art".into(), edit.into());
    let edit_address = hdk::commit_entry(&edit_entry)?;

    // Get the currently linked art
    let current_art_address = hdk::get_links(
        &game_address,
        LinkMatch::Exactly("current_art"),
        LinkMatch::Any)?
        .addresses()
        .into_iter()
        .next();
    // If the current are exists then remove it
    if let Some(current_art_address) = current_art_address {
        hdk::remove_link(
            &game_address,
            &current_art_address,
            "current_art",
            "")?;
    }
    // Link the edited art to this game
    hdk::link_entries(&game_address, &edit_address, "current_art", "")?;
    // Return a successful result with the edited arts address
    Ok(edit_address)
}
```
#### Try it
```
$ hc package
```

## Follow the address 
You are so close to a working game. There's just a few more public functions to help with getting data that will be useful for playing the game.

Firstly you will need a way for your players to get either the game or art entries from an address.
Remember an address is the location of a piece of data. Sort of like a key in a hash map. Infact the `Address` type in Holochain is a hash.


To turn get the entry from an address just add a function that looks up the address and returns an entry. Keep in mind an the entry might not exist so we say it's optional.

Add the following to your zome mod:
```rust
// Add this public function that
// takes an Address and returns an Entry
// if one exists.
#[zome_fn("hc_public")]
fn address_to_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
    // This call get's the entry.
    // Notice that it call fail or
    // it can succeed with no Entry or
    // it can succeed with an Entry.
    hdk::get_entry(&address)
}
```
> __A note on Option:__
> An `Option<Value>` is similar to a `null` value in javascript. It can either Some(the_value) or None.

You have created a funcition that works for any `Address` to `Entry`.
#### Try it
```
$ hc package
```

## Find some games 
Remember earlier you set a link from anchor to all the games so that your players could find them?
Well now you can add the function that does exactly that for them.

To get all the available games just get all the `has_game` links from the anchor entry.
Add the following function to your zome: 
```rust
// Public function that returns a
// list of all games.
// Notice it doesn't take any arguments
// because it's just getting all games.
#[zome_fn("hc_public")]
fn get_games() -> ZomeApiResult<Vec<Game>> {
    // Create the `anchor` `games` and commit it.
    let anchor_entry = Entry::App("anchor".into(), "games".into());
    let anchor_address = hdk::commit_entry(&anchor_entry)?;
    // Now search for all links from the anchors address
    // that are called `has_game`.
    // This call also loads the `Entry` into the `Game` type.
    hdk::utils::get_links_and_load_type(
        &anchor_address,
        // Match the link_type exactly has_game.
        LinkMatch::Exactly("has_game"),
        // Match any tag.
        LinkMatch::Any,
    )
}
```
Your players can now get all the available games, well done.
#### Try it
```
$ hc package
```
## Show us what you got
Yay the last function! The final step is to show the art that is currently linked to a game.
To do this just return the `Art` entry that is currently linked to the address of the game you want to see.
```rust
    // A public function that takes
    // a game's address and returns
    // the art entry it is currently
    // linked to
    #[zome_fn("hc_public")]
    fn get_current_art(game: Address) -> ZomeApiResult<Option<Entry>> {
        // Load all the `current_art` links but
        // because there should only be one just
        // use the next one.
        hdk::get_links_and_load(&game, LinkMatch::Exactly("current_art"), LinkMatch::Any)
            // If there were links found then
            // take them and grab the next one.
            // Note the should be only one in this case.
            .and_then(|current_art| current_art.into_iter().next().transpose())
    }
```
> Transpose is just doing some Rust gymnastics to turn an `Option<Result<Value>>` into an `Result<Option<Value>>` which is the return type we want.

That's it, you've done it :fireworks:. Now have a play!
## Let's play
To keep things super simple for this tutorial you can use curl to interact with your game node.
In the future we will use a UI to make these calls but this should give you a good idea of what is actually going on.
> You should have curl installed:
`$ curl --version` should return something like:
`$ curl 7.54.0` but if it doesn't you can install it from [here](https://curl.haxx.se/download.html).

To start playing your game package and run your app like this:
```
$ hc package
$ hc run -i http
```
You should see something like:
```
Starting instance "test-instance"...
Holochain development conductor started. Running http server on port 8888
Type 'exit' to stop the conductor and exit the program
hc> 
```
Leave this running and open a __new__ terminal window. Try your first command.

#### Create a game
Call `create_game` with a piece of `Art` that contains the string `hello world`.
Run this curl command in the new terminal window:
```json
curl -X POST -H "Content-Type: application/json" -d '{"id": "0", "jsonrpc": "2.0", "method": "call", "params": {"instance_id": "test-instance", "zome": "game", "function": "create_game", "args": { "art": {"content": "hello world" }} }}' http://127.0.0.1:8888
```
You will get back this json object which says you created the game `Ok` and here's the `Address` hash of the new game. 
>Note your address hash might be different from this so make sure you use the one you got.
```json
{"jsonrpc":"2.0","result":"{\"Ok\":\"QmZg6rzjYKZEyqPd4wkrKpDVV6BNBuniEZx1iGa7goJnJ2\"}","id":"0"}
```
#### Check the current art
Check that the last call did indeed store `hello world` as the current art.

> Make sure you use the actual address hash you got from the previous call in the next call.

Enter this curl command which calls `get_current_art`  with the game address from the previous call:
```json
curl -X POST -H "Content-Type: application/json" -d '{"id": "0", "jsonrpc": "2.0", "method": "call", "params": {"instance_id": "test-instance", "zome": "game", "function": "get_current_art", "args": {"game" : "QmZg6rzjYKZEyqPd4wkrKpDVV6BNBuniEZx1iGa7goJnJ2"} }}' http://127.0.0.1:8888
```
Indeed you do get back an `Ok` result that contains the `Art` `hello world`. It works!
```json
{"jsonrpc":"2.0","result":"{\"Ok\":{\"App\":[\"art\",\"{\\\"content\\\":\\\"hello world\\\"}\"]}}","id":"0"}
```
#### Edit the current art
Let's play! Submit an edited version of the `hello world` as `hello holo`.

Enter the following command that calls `submit_edit` with the address hash of the game from earlier and a new piece of art `hello holo`:
```json
curl -X POST -H "Content-Type: application/json" -d '{"id": "0", "jsonrpc": "2.0", "method": "call", "params": {"instance_id": "test-instance", "zome": "game", "function": "submit_edit", "args": { "game_address": "QmZg6rzjYKZEyqPd4wkrKpDVV6BNBuniEZx1iGa7goJnJ2", "edit": {"content": "hello hollo" }} }}' http://127.0.0.1:8888
```
You will get back an `Ok` result that contains the address has of the new art edit.
```json
{"jsonrpc":"2.0","result":"{\"Ok\":\"QmRrrkA76S7t5dfLhA2XCAN4Zj3BZ9PawpUdM8995vrV9H\"}","id":"0"}
```
#### Check the current art again
Let's check that it worked and did update the current art.

Enter the following command to call `get_current_art` with the same game address hash:
```json
curl -X POST -H "Content-Type: application/json" -d '{"id": "0", "jsonrpc": "2.0", "method": "call", "params": {"instance_id": "test-instance", "zome": "game", "function": "get_current_art", "args": {"game" : "QmZg6rzjYKZEyqPd4wkrKpDVV6BNBuniEZx1iGa7goJnJ2"} }}' http://127.0.0.1:8888
```
There you go! The current art now points to the `hello holo` edit.
```json
{"jsonrpc":"2.0","result":"{\"Ok\":{\"App\":[\"art\",\"{\\\"content\\\":\\\"hello hollo\\\"}\"]}}","id":"0"}
```

## Conclusion
Well done! You have created a distributed application. This app is very simple and maybe a little contrived but there's a lot concepts to cover. I encourage you to continue to the next episode in this series and we can start to explore some more complex features together.
Hopefully this has sparked some curiosity and questions. I'd love to hear them and any feedback on the [forum]().
See you next time :rocket: 
