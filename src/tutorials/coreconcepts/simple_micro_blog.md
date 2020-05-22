\#S:MODE=gui
\#S:EXTERNAL=javascript=simple_micro_blog_gui.js=gui
\#S:MODE=test
\#S:EXTERNAL=javascript=simple_micro_blog.js=test
\#S:EXTERNAL=rust=simple_micro_blog_p1.rs
\#S:EXTERNAL=html=simple_micro_blog_p1.html=gui

# Simple Microblog Tutorial

!!! info "WIP"
    This article is currently a work in progress and subject to frequent change.
    See the [changelog](/docs/changelog) for details.

!!! tip "Time & Level"
    Time: ~3 hours | Level: Beginner

Welcome to the Simple Microblog tutorial, part of our Core Concepts tutorial series. The aim of this tutorial is to show how entries can be linked to each other in a Holochain app.

A link is simply a relationship between two entries. It's a useful way to find some data from something you already know. For example, you could link from your user's agent ID entry to their blog posts.

You will be building on the previous [Hello World](../hello_world) tutorial and creating a simple microblog app. The app's users will be able to post to a blog post and retrieve other users' posts.

## What will you learn
In this tutorial, you will learn how to attach entries to an agent's address using links and retrieve a list of those entries back from another agent.

## Why it matters
Links are vital to locating entries. The only way to find an entry is to know its hash. However, most of the time, an agent will not know the hash of all the entries it needs.
To allow agents to find entries, you create links between something the agent does know and the unknown entries.

## Add a Post

Store your posts as a `Post` struct that holds a message of type `String`, a timestamp of type `u64`, and an author ID  of type `Address`.

> Note: The timestamp is important because without it two posts with the same author and message will be treated as the same data.

Go ahead and change the `Person` struct to a `Post` struct:

\#S:INCLUDE
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Post {
    message: String,
    timestamp: u64,
    author_id: Address,
}
```

<script id="asciicast-tpHdFyTkVnfK5fkVWkgYDjH4c" src="https://asciinema.org/a/tpHdFyTkVnfK5fkVWkgYDjH4c.js" async data-autoplay="true" data-loop="true"></script>

## Add the post entry

\#S:EXTERNAL=rust=simple_micro_blog_p2.rs

The post's entry definition starts off very similarly to the person's so that you can modify it.
Update the `person` entry type definition to `post`:

\#S:CHANGE
```diff
    #[entry_def]
-    fn person_entry_def() -> ValidatingEntryType {
+    fn post_entry_def() -> ValidatingEntryType {
        entry!(
-            name: "person",
+            name: "post",
-            description: "Person to say hello to",
+            description: "A blog post",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
-            validation: | _validation_data: hdk::EntryValidationData<Person>| {
+            validation: | validation_data: hdk::EntryValidationData<Post>| {
```
Up to this point, validation has only checked that the data is in the correct shape. However, a real application will usually need to validate its data more thoroughly.

One thing you might like to do is set a maximum length for blog posts.


Use a match statement to check the entry when it's created:
```rust
                match validation_data {
                    hdk::EntryValidationData::Create{ entry, .. } => {
```
Set a `MAX_LENGTH` for a posts characters:
```rust
                        const MAX_LENGTH: usize = 140;
```
Simply check that the message is less than or equal to the maximum, or return an error:
```rust
                        if entry.message.len() <= MAX_LENGTH {
                           Ok(())
                        } else {
                           Err("Post too long".into())
                        }
                    },
                    _ => Ok(()),
                }
            },
```

> Can you think of a way a user could have an entry longer than the maximum length?
> _Hint: What if they `Modify`?_

The user needs some way of finding out which posts belong to an agent.
In Holochain we use links to associate data with something known.
The following creates a link from the agent's address to a post.
Every agent has a unique address and you will see how to find it later.

Add the link _from_ the `%agent_id`:
```rust
            links: [
                from!(
                   "%agent_id",
```
Later, you will use the link's _type_ to find all the links on this anchor.

Set it to `author_post`:
```rust
                   link_type: "author_post",
```
The `validation_package` and `validation` are similar to the entry, except there is no type checking.

Allow this link to be committed without checks:
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

The entry definition tells Holochain what the data looks like and how to validate it. The next piece is a public function that the UI can use to create a new post.
Take a moment to think about the ingredients that go into the `Post` structure: a message, a timestamp, and the author's ID.

The message will come from the UI, so that's easy.
For simplicity, the timestamp will come from the UI as well.

!!! question "Question?"
    If the user set their machine's system clock back two days, would this app be able to tell that the post was made with a fake time?

??? check "Answer"
    Actually it cannot. In fact different machines will have different times anyway. User submitted timestamps are not a very reliable source of truth in a decentralized app. Start thinking about if you need reliable time in your future hApp designs. There are other solutions but for now it's valuable just to be aware of that time needs careful planning.


The author's ID comes from a special constant `hdk::AGENT_ADDRESS`, which you can access from your zome functions.

> #### Why do I have to specify a timestamp and author? Aren't they already in the entry's header?
> If two agents publish entries with identical type and content, they'll have the same address on the DHT. This means that for all intents and purposes, _there's only one entry_ with two authors--which is fine in some cases, but causes problems in a microblog. When one author wants to delete an existing message, does the other author's copy get deleted too? Adding a timestamp and author ID makes the two posts distinct and gives them their own addresses.

!!! tip
    You can __remove__ the `create_person` function; it's no longer needed.

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

Get this agent's address:
```rust
        let agent_address = hdk::AGENT_ADDRESS.clone().into();
```

Commit the post entry:
```rust
        let entry = Entry::App("post".into(), post.into());
        let address = hdk::commit_entry(&entry)?;
```
Before, you defined the link from the agent's address to the post.

This is where you actually make the link:
```rust
        hdk::link_entries(&agent_address, &address, "author_post", "")?;

        Ok(address)
    }
```

## Retrieve all of a user's posts
How do your users find all those posts?
The user will submit an agents address through the UI and a list of posts will be displayed.
Later, you will see how they get an agent's address.


Add a public function that takes an author's agent address and returns a [vector](https://doc.rust-lang.org/std/vec/struct.Vec.html) of posts:

```rust
    #[zome_fn("hc_public")]
    pub fn retrieve_posts(agent_address: Address) -> ZomeApiResult<Vec<Post>> {
```

Retrieve all the `author_post` links attached to the agent's address.
This function should return a vector of Post structs. Luckily, you can use the convenient `get_links_and_load_type` function to do all this.

Return a list of links with _exactly_ the type of `author_post` (instead of a fuzzy _regex_ search) and any tag.
```rust
        hdk::utils::get_links_and_load_type(
            &agent_address,
            LinkMatch::Exactly("author_post"),
            LinkMatch::Any,
        )
    }
```

> Note: Because you've told Rust that this function is going to return a vector of posts, the compiler will tell `get_links_and_load_type` what type to use in the conversion.


We're using a new directive: `link::LinkMatch`. You'll need to add it to your `use` statements at the top of the file:

\#S:CHANGE
```diff
use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
+    link::LinkMatch,
};
```

## Get the agent's ID

Users need a way to share their agent ID with others.
For the sake of simplicity this app will rely on user sending their address to others outside of Holochain (we will cover messaging in a future tutorial).

The user still needs a way to get their own address so they can give it to friends.

Add a public function that returns their `AGENT_ADDRESS`:

\#S:INCLUDE
```rust
    #[zome_fn("hc_public")]
    pub fn get_agent_id() -> ZomeApiResult<Address> {
        Ok(hdk::AGENT_ADDRESS.clone())
    }
```

\#S:INCLUDE,HIDE
```rust
}
```

\#S:CHECK=rust


## Show the agent's ID in the UI

Now, use that function to display their address at the top of the UI.

Go to your `GUI` folder and open up the `index.html` file.

The agent ID should update when the page loads and the WebSocket port that links to the conductor is changed.

Add an `onload` event to the body that will call the `get_agent_id` javascript function when the page loads:

\#S:MODE=gui,INCLUDE
\#S:CHANGE
```diff
-  <body>
+  <body onload="get_agent_id()">
```

Open up the `hello.js` file and add the `get_agent_id` function.
Call the `get_agent_id` zome function that updates the `agent_id` element with the agent's address:
```javascript
function get_agent_id() {
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'get_agent_id')({}).then(result =>
      show_output(result, 'agent_id'),
    );
  });
}
```

## Update the create and retrieve elements for posts

Update the html for posts instead of persons:

\#S:CHANGE
```diff
-    <h3>Create a person</h3>
+    <h3>Create Post</h3>
-    <input type="text" id="name" placeholder="Enter your name :)">
+    <textarea id="post" placeholder="Enter a message :)"></textarea>
-    <button onclick="create_person()" type="button">Submit Name</button>
+    <button onclick="create_post()" type="button">Submit Post</button>
    <div>Address: <span id="address_output"></span></div>
-    <h3>Retrieve Person</h3>
+    <h3>Retrieve Posts</h3>
-    <input type="text" id="address_in" placeholder="Enter the entry address">
+    <input type="text" id="address_in" placeholder="Enter the agent id">
-    <button onclick="retrieve_person()" type="button">Get Person</button>
+    <button onclick="retrieve_posts()" type="button">Show Posts</button>
-    <div>Person: <span id="person_output"></span></div>
```
Add an empty list to display the posts:
```html
    <ul id="posts_output"></ul>
```
Add an element to render the agent's ID:
```html
    <h3>Agent ID:</h3>
    <div id="agent_id"></div>
```
\#S:EXTERNAL=html=simple_micro_blog_p2.html=gui


\#S:CHECK=html=gui

## Call `create_post` from JavaScript

Update `create_person` to create posts instead:
  });
}
\#S:CHANGE
```diff
-function create_person() {
+function create_post() {
-  const name = document.getElementById('name').value;
+  const message = document.getElementById('post').value;
```
Use the `Date` object to give the current timestamp:
\#S:CHANGE
```diff
+  const timestamp = Date.now();
  holochain_connection.then(({callZome, close}) => {
-    callZome('test-instance', 'hello', 'create_person')({
+    callZome('test-instance', 'hello', 'create_post')({
-      person: {name: name},
+      message: message,
+      timestamp: timestamp,
    }).then(result => show_output(result, 'address_output'));
  });
}
```
## Update the posts list dynamically

Because the number of posts changes at runtime, you can update the empty list element from earlier to display them.

Empty the list element:
```javascript
function display_posts(result) {
  var list = document.getElementById('posts_output');
  list.innerHTML = "";
```

Parse the posts JSON data and order them by time:
```javascript
  var output = JSON.parse(result);
  if (output.Ok) {
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
  } else {
    alert(output.Err.Internal);
  }
}
```

## Retrieve an agent's posts

To retrieve the posts, update the `retrieve_person` function, and call `display_posts`:
\#S:CHANGE
```diff
-function retrieve_person() {
+function retrieve_posts() {
  var address = document.getElementById('address_in').value.trim();
  holochain_connection.then(({callZome, close}) => {
-    callZome('test-instance', 'hello', 'retrieve_person')({
+    callZome('test-instance', 'hello', 'retrieve_posts')({
-      address: address,
+      agent_address: address,
-    }).then(result => show_person(result, 'person_output'));
+    }).then(result => display_posts(result));
  });
}
```

\#S:CHECK=javascript=gui

## Submit a few posts and list them

### Run the app and two UIs

This is the same setup as in the previous tutorial.

#### Terminal one
Run the sim2h server

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    sim2h_server
    ```

#### Terminal two
Package the DNA and then update the hash:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc package
    ```

!!! check "Copy the DNA's hash with `hc hash`:"
    ```
    DNA hash: QmadwZXwcUccmjZGK5pkTzeSLB88NPBKajg3ZZkyE2hKkG
    ```
> Your hash will be different but you need to update your `bundle.toml` file.

If you're feeling lazy, don't forget the script in the [hello gui](../hello_gui/#run-the-bundle) tutorial.

Run Alice's conductor:
!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc run --networked sim2h --agent-name Alice --port 8888
    ```

#### Terminal three
There's no need to recompile or update the DNA hash in the bundle file for Bob.

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc run --networked sim2h --agent-name Bob --port 8889
    ```

### Open up the browser

Open two tabs.

#### Tab Alice

Go to `127.0.0.1:8888`.

#### Tab Bob

Go to `127.0.0.1:8889`.

#### Tab Alice

Create a few posts:

![Create posts](../../../img/smb_submit_post.png)

Try retrieving them using Alice's agent ID:

![Retrieve Posts](../../../img/smb_retrieve_posts.png)

> Be careful of spaces before or after the address.

#### Tab Bob

Copy Alice's agent ID and try retrieving her posts from Bob's conductor:

![Retrieve Posts](../../../img/smb_retrieve_posts.png)

Congratulations! You have created a simple blog hApp running on a decentralized network. :smiley:

!!! success "Solution"
    You can check the full solution to this tutorial on [here](https://github.com/freesig/cc_tuts/tree/simple_micro_blog).

## Key takeaways
- Entries are only located via their hash.
- Two identical entries will have the same hash and be treated as the same entry.
- Links create a connection between something you know and something you don't.
