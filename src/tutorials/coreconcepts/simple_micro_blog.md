\#S:MODE=test
\#S:EXTERNAL=javascript=simple_micro_blog.js=test
\#S:EXTERNAL=rust=simple_micro_blog_p1.rs
\#S:EXTERNAL=html=simple_micro_blog_p1.html=gui
\#S:EXTERNAL=javascript=simple_micro_blog_gui.js=gui

# Simple Micro Blog tutorial

Welcome to the Simple Micro blog tutorial in the Core Concepts tutorial series. The aim of this tutorial is to show how entries can be linked to each other in a Holochain app. A link is simply a relationship between two entries. It's a useful way to find some data from something you already know. For example, you could link from your user's agent ID entry to their blog posts.

You will be building on the previous [Hello World](hello_world) tutorial and making a super simple blog app. The app's users will be able to post a blog post and then retrieve other users' posts.


## Add a Post

You store your posts as a `Post` struct that holds a message of type `String`, a timestamp of type `u64`, and an author ID  of type `Address`.

> Note the timestamp is important because otherwise two posts with the same author and message will be treated as the same data.

Go ahead and change the `Person` struct into a `Post` struct:


<script id="asciicast-tpHdFyTkVnfK5fkVWkgYDjH4c" src="https://asciinema.org/a/tpHdFyTkVnfK5fkVWkgYDjH4c.js" async data-autoplay="true" data-loop="true"></script>

\#S:INCLUDE
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Post {
    message: String,
    timestamp: u64,
    author_id: Address,
}
```

## Add the post entry

Update the `person` entry type definition to `post`:


<script id="asciicast-aYwqCZ2w2b4D3vAZw4F4unOfz" src="https://asciinema.org/a/aYwqCZ2w2b4D3vAZw4F4unOfz.js" async data-autoplay="true" data-loop="true"></script>


\#S:EXTERNAL=rust=simple_micro_blog_p2.rs

```rust
    #[entry_def]
    fn post_entry_def() -> ValidatingEntryType {
        entry!(
            name: "post",
            description: "A blog post",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | validation_data: hdk::EntryValidationData<Post>| {
                match validation_data {
                    hdk::EntryValidationData::Create{ entry, .. } => {
                        const MAX_LENGTH: usize = 140;
                        if entry.message.len() > MAX_LENGTH {
                           Err("Post too long".into())
                        } else {
                           Ok(())
                        }
                    },
                    _ => Ok(()),
                }
            },
            links: [
                from!(
                   "%agent_id",
                   link_type: "author_post",
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

```rust
    let agent_address = hdk::AGENT_ADDRESS.clone().into();
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
fn retrieve_posts(agent_address: Address) -> ZomeApiResult<Vec<Post>> {
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

\#S:SKIP
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

\#S:INCLUDE
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

To make it easy to pass around agent ID, you can display the ID for the instance that each GUI is currently targeting. This should happen when the page loads and when the websocket port changes.

Add an `onload` event to the body that will call the `get_agent_id` function when the page loads:

\#S:MODE=gui,INCLUDE
```html
  <body onload="get_agent_id()">
```
Add an element to render the agents id:
```html
    <div id="agent_id"></div>
```


Now open up the `hello.js` file and add the `get_agent_id` function.  
Call the `get_agent_id` zome function and then update the `agent_id` element with the result:

```javascript
function get_agent_id() {
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'get_agent_id')({}).then(result =>
      show_output(result, 'agent_id'),
    );
  });
}
```
\#S:HIDE

```html
    <button onclick="hello()" type="button">Say Hello</button>
    <div>Response: <span id="output"></span></div>
```

```html
    <h3>Create Post</h3>
    <textarea id="post" placeholder="Enter a message :)"></textarea>
    <button onclick="create_post()" type="button">Submit Post</button>
    <div>Address: <span id="address_output"></span></div>
    <h3>Retrieve Post</h3>
    <input type="text" id="address_in" placeholder="Enter the entry address" />
    <button onclick="retrieve_posts()" type="button">Show Posts</button>
    <ul id="posts_output"></ul>
```
\#S:EXTERNAL=html=simple_micro_blog_p2.html=gui

<script id="asciicast-VRgOq6rfYvXP5MpRFoIvOOvhv" src="https://asciinema.org/a/VRgOq6rfYvXP5MpRFoIvOOvhv.js" async></script>

\#S:CHECK=html=gui

## Call `create_post` from JavaScript

```diff
- function create_person() {
+ function create_post() {
-   const name = document.getElementById('name').value;
+   const message = document.getElementById('post').value;
+   const timestamp = Date.now();
   holochain_connection.then(({callZome, close}) => {
-     callZome('test-instance', 'hello', 'create_person')({
+     callZome('test-instance', 'hello', 'create_post')({
-       person: {name: name},
+       message: message,
+       timestamp: timestamp,
-     }).then(result => show_output(result, id));
+     }).then(result => show_output(result, 'address_output'));
   });
 }
```
<script id="asciicast-7TB7eDBA0sUS79hDzDSDaZgcP" src="https://asciinema.org/a/7TB7eDBA0sUS79hDzDSDaZgcP.js" async></script>

\#S:HIDE

```javascript
function create_post() {
  const message = document.getElementById('post').value;
  const timestamp = Date.now();
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'create_post')({
      message: message,
      timestamp: timestamp,
    }).then(result => show_output(result, 'address_output'));
  });
}
```

## Update the posts list dynamically

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

Update the agent id when the port is changed:
```diff
function update_port() {
  const port = document.getElementById('port').value;
  holochain_connection = holochainclient.connect({
    url: 'ws://localhost:' + port,
  });
+  get_agent_id();
}
```
\#S:HIDE
```javascript
function update_port() {
  const port = document.getElementById('port').value;
  holochain_connection = holochainclient.connect({
    url: 'ws://localhost:' + port,
  });
  get_agent_id();
}
```

## Retrieve an agent's posts

This is very similar to `retrieve_person`, so just update that function:

```javascript
function retrieve_posts() {
  var address = document.getElementById('address_in').value;
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'retrieve_posts')({
      agent_address: address,
    }).then(result => display_posts(result));
  });
}
```

[![asciicast](https://asciinema.org/a/oiFGzlKexjVVMrNxf7Gc00Oiw.svg)](https://asciinema.org/a/oiFGzlKexjVVMrNxf7Gc00Oiw)

\#S:INCLUDE,HIDE
```rust
}
```
## Submit some posts

\#S:CHECK=html=gui
\#S:CHECK=javascript=gui
