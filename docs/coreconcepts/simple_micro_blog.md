
# Simple Micro Blog tutorial

Welcome to the Simple Micro blog tutorial in the Core Concepts tutorial series. The aim of this tutorial is to show how entries can be linked to each other in a Holochain app. A link is simply a relationship between two entries. It's a useful way to find some data from something you already know. For example, you could link from your user's agent ID entry to their blog posts.

You will be building on the previous [Hello World]() tutorial and making a super simple blog app. The app's users will be able to post a blog post and then retrieve other users' posts.

## DNA hash

The way you run your conductor has changed from `hc run` to calling `holochain` directly. As a consequence, the hash of your app's DNA now lives in the `conductor-config.toml` file. However, anytime you change your code and run `hc package` the hash will be different. So you will need to update the `conductor-config.toml` file.

Enter the nix-shell:

```bash
nix-shell https://holochain.love
```

Package your app:

```
hc package
```

Copy the DNA hash (example shown):

```
DNA hash: QmfKyAk2jXgESca2zju6QbkLqUM1xEjqDsmHRgRxoFp39q
```

Update the `conductor-config.toml` dna hash:

```toml
[[dnas]]
  id = "hello"
  file = "dist/hello_holo.dna.json"
  hash = "<new_dna_hash>"
```

## Post

We will store our posts as a `Post` struct that holds a message of type `String`, a timestamp of type `u64`, and an author ID  of type `Address`.

We're done with the Hello World tutorial, so remove the `Person` struct and add the `Post` struct:

[![asciicast](https://asciinema.org/a/tpHdFyTkVnfK5fkVWkgYDjH4c.svg)](https://asciinema.org/a/tpHdFyTkVnfK5fkVWkgYDjH4c)

## Entry

Update the `person` entry type definition to `post`:

[![asciicast](https://asciinema.org/a/aYwqCZ2w2b4D3vAZw4F4unOfz.svg)](https://asciinema.org/a/aYwqCZ2w2b4D3vAZw4F4unOfz)

## Agent ID

```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Agent {
    id: String,
}
```


Now you have a post entry but you also need some way to find the posts an agent makes. To do this you can create an agent 'anchor' entry which you will use to link to the posts that the user makes. An anchor is a simple string whose only purpose is to be an easy-to-find entry to attach links to.

Define an agent anchor entry type by adding the following lines below the `post_entry_def`.

Add an `agent_entry_def` function which creates an entry type for the agent:

```rust
#[entry_def]
fn agent_entry_def() -> ValidatingEntryType {
```

Start the `entry!` macro for the agent entry:

```rust
    entry!(
        name: "agent",
        description: "Hash of agent",
```

Set sharing to public so other agents can find this agent's anchor (and hence their posts):

```rust
        sharing: Sharing::Public,
```

Add basic validation to make sure this is the `Agent` type that is passed in:

```rust
        validation_package: || {
            hdk::ValidationPackageDefinition::Entry
        },
        validation: | _validation_data: hdk::EntryValidationData<Agent>| {
            Ok(())
        },
```

Now you want to be able to link this agent entry to the post entry.

Start out with the `to!` link macro, which lets you create link definitions that link from this entry type to another entry type:

```rust
        links: [
            to!(
```

Define a link type from this entry to the `post` entry called `author_post`:

```rust
               "post",
               link_type: "author_post",
```

Add empty validation for this link:

```rust
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

## Create a post

Remove the `create_person` function.

You need a function for creating a new post. Think about the ingredients that might go into the `Post` structure: a message, a timestamp, and and the author's ID.

The message will come from the UI. For simplicity the timestamp will come from the UI as well. Time is a pretty tricky concept in the distributed world and requires careful planning. The author's ID will come from the special constant `hdk::AGENT_ADDRESS`, which you can access from your zome functions.

> #### Why do I have to specify a timestamp and author? Aren't they already in the entry's header?
> If two agents publish entries with identical type and content, they'll have the same address on the DHT. That means that, for all purposes, _there's only one entry_ with two authors. This is fine for some cases. But it causes problems in a microblog. When one author wants to delete an existing message, does the other author's copy get deleted too? Adding a timestamp and author ID makes the two posts distinct and gives them their own addresses.

Add a public `create_post` function that takes a message as a `String` and a timestamp as a `u64`:

```rust
#[zome_fn("hc_public")]
pub fn create_post(message: String, timestamp: u64) -> ZomeApiResult<Address> {
```

Create the `Post` using the message, timestamp, and author's address:

```rust
    let post = Post {
        message,
        timestamp,
        author_id: hdk::AGENT_ADDRESS.clone(),
    };
```

Create the `Agent` struct from the `AGENT_ADDRESS`, turn it into an `Entry` and commit it:

```rust
    let agent_id = Agent { id: hdk::AGENT_ADDRESS.clone().into() };
    let entry = Entry::App("agent".into(), agent_id.into());
    let agent_address = hdk::commit_entry(&entry)?;
```

Commit the post entry:

```rust
    let entry = Entry::App("post".into(), post.into());
    let address = hdk::commit_entry(&entry)?;
```

Create an `author_post` link from the agent to the post:

```rust
    hdk::link_entries(&agent_address, &address, "author_post", "")?;
```

Return everything is Ok with the new post's address:

```rust
    Ok(address)
}
```

## Retrieve all of a user's posts 

Add the `retrieve_posts` public function that takes an author address and returns a [vector](https://doc.rust-lang.org/std/vec/struct.Vec.html) of posts:

```rust
#[zome_fn("hc_public")]
fn retrieve_posts(author_address: Address) -> ZomeApiResult<Vec<Post>> {
```

Create an `Agent` struct from the passed address, turn it into an `Entry`, and calculate its address:

```rust
    let agent_id = Agent { id: author_address.into() };
    let entry = Entry::App("agent".into(), agent_id.into());
    let agent_address = hdk::entry_address(&entry)?;
```

Get all the `author_post` links from the agent's address and load them as the `Post` type:

```rust
    hdk::utils::get_links_and_load_type(
        &agent_address,
        LinkMatch::Exactly("author_post"),
        LinkMatch::Any,
    )
}
```

(Note that because you've already told Rust that this function is going to return a vector of posts, the compiler will tell `get_links_and_load_type` what type to use in the conversion.)

We're using a new directive, `link::LinkMatch`. You'll need to add it to your `use` statements at the top of the file:

```rust
use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
    link::LinkMatch,
};
```

## Get the agent's ID

As a user, you will need some way of getting your own agent's ID in the UI later so that you can pass it to others. Then they can try getting your posts.

Add a public `get_agent_id` function that returns an `Address`:

```rust
#[zome_fn("hc_public")]
fn get_agent_id() -> ZomeApiResult<Address> {
```

For this app you can use the agent's address as their ID, because that's what we're storing in the agent anchor entries:

```rust
    Ok(hdk::AGENT_ADDRESS.clone())
}
```

## Show the agent's ID in the UI

Let's start on the UI. Go to your GUI folder and open up the `index.html` file.

To make it easy to pass around agent ID, you can display the ID for the instance that each GUI is currently targeting. This should happen when the page loads and when the instance ID changes.

Add an `onload` event to the body that will call the `get_agent_id` function when the page loads:

```html
<body onload="get_agent_id()">
```

Add an `onfocusout` event to the instance text box that will call the same function when unfocused:

```html
<input type="text" id="instance" onfocusout="get_agent_id()" placeholder="Enter your instance ID">
```

Now open up the `hello.js` file and add the `get_agent_id` function:

```javascript
function get_agent_id() {
```

Get the instance value and set up a zome call connection:

```javascript
  var instance = document.getElementById('instance').value;
  holochainclient.connect({ url: "ws://localhost:3401"}).then(({callZome, close}) => {
```

Call the `get_agent_id` zome function and then update the `agent_id` element with the result:

```javascript
    callZome(instance, 'hello', 'get_agent_id')({}).then((result) => update_element(result, 'agent_id'))
  })
}
```

## Update the UI to allow posts to be created

Back in `index.html` turn the "create person" HTML into a post entry widget. Use a `textarea`, call the `create_post` function, and update all the labels and IDs:

<script id="asciicast-mAPERkw51QbQQp2KZkTxZnwDB" src="https://asciinema.org/a/mAPERkw51QbQQp2KZkTxZnwDB.js" async></script>

## Update the UI to retrieve an agent's posts

Update the "retrieve person" HTML to retrieve posts:

[![asciicast](https://asciinema.org/a/0eQ1giTdu4BEOnQghXax1ALBE.svg)](https://asciinema.org/a/0eQ1giTdu4BEOnQghXax1ALBE)

## Call `create_post` from JavaScript

In the `hello.js` file add the `create_post` function that your HTML calls:

```javascript
function create_post() {
```

Get the post message and instance ID:

```javascript
  var message = document.getElementById('post').value;
  var instance = document.getElementById('instance').value;
```

Get the current timestamp:

```javascript
  var timestamp = Date.now();
```

Make a zome call to `create_post` with the message and timestamp:

```javascript
  holochainclient.connect({ url: "ws://localhost:3401"}).then(({callZome, close}) => {
    callZome(instance, 'hello', 'create_post')({message: message, timestamp: timestamp }).then((result) => update_element(result, 'post_address'))
  })
}
```

## Update the posts list dynamically

Add an empty list below the `post_agent_id` text box:

```html
<ul id="posts_output"></ul>
```

In the `hello.js` file add the following lines to update the `posts_output` dynamically.

Add the `display_posts` function:

```javascript
function display_posts(result) {
```

Get the `posts_output` HTML element:

```javascript
  var list = document.getElementById('posts_output');
```
Wipe the current contents of the list, if any:

```javascript
  list.innerHTML = "";
```

Parse the zome function's result as JSON:

```javascript
  var output = JSON.parse(result);
```

Sort the posts by their timestamps:

```javascript
  var posts = output.Ok.sort((a, b) => a.timestamp - b.timestamp);
```

For each post add a `<li>` element that contains the post's message:

```javascript
  for (post of posts) {
    var node = document.createElement("LI");
    var textnode = document.createTextNode(post.message);
    node.appendChild(textnode);
    list.appendChild(node);
  }
}
```

## Get this agent's ID

Add the `get_agent_id` function:

```javascript
function get_agent_id() {
  var instance = document.getElementById('instance').value;
```

Call the `get_agent_id` zome function and update the `agent_id` element:

```javascript
  holochainclient.connect({ url: "ws://localhost:3401"}).then(({callZome, close}) => {
    callZome(instance, 'hello', 'get_agent_id')({}).then((result) => update_element(result, 'agent_id'))
  })
}
```

## Retrieve an agent's posts

This is very similar to `retrieve_person`, so just update that function:

[![asciicast](https://asciinema.org/a/oiFGzlKexjVVMrNxf7Gc00Oiw.svg)](https://asciinema.org/a/oiFGzlKexjVVMrNxf7Gc00Oiw)

