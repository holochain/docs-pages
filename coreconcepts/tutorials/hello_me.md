\#S:EXTERNAL=rust=hello_me.rs
# Hello Me

Welcome back to another tutorial in the Core Concepts series. 

The app we have built so far returns a constant value however for more complex applications it would be useful to be able to store some data.  
Today you will learn how to do this by adding an entry type to your zome. Remember an entry is a piece of data in your source chain that has been validated.

We will add the following:

1. Add a `person` entry type that stores information about a person.
2. Expose the public function `create_person` for your UI to create and store a person entry.
3. Expose a public function `retrieve_person` for your UI to retrieve a person entry.
4. Add the UI components to interact with these functions.

This tutorial builds on the [previous](../hello_gui) tutorial so go back and complete that if you haven't already.

## Test first

Start by writing a test so it's easy to see when your app is working:

Open up `cc_tuts/test/index.js`.

This is how we left the testing scenario in the [Hello Test](../hello_test) tutorial:

\#S:MODE=test
\#S:EXTERNAL=javascript=hello_me.js=test
\#S:SKIP
```javascript
diorama.registerScenario("Test hello holo", async (s, t, { alice }) => {
  // Make a call to the `hello_holo` Zome function
  // passing no arguments.
  const result = await alice.call("hello", "hello_holo", {});
  // Make sure the result is ok.
  t.ok(result.Ok);

  // Check that the result matches what you expected.
  t.deepEqual(result, { Ok: 'Hello Holo' })
  
  // <---- Put your new tests here
})
```
\#S:INCLUDE,HIDE
```javascript
diorama.registerScenario("Test hello holo", async (s, t, { alice }) => {
  // Make a call to the `hello_holo` Zome function
  // passing no arguments.
  const result = await alice.call("hello", "hello_holo", {});
  // Make sure the result is ok.
  t.ok(result.Ok);

  // Check that the result matches what you expected.
  t.deepEqual(result, { Ok: 'Hello Holo' })
  
```
The new tests go below `t.deepEqual(result, { Ok: 'Hello Holo' })`.

The following test will create an entry with the name "Alice", retrieve the same entry and check that it has the name "Alice".

Add a call to the `create_person` function with a person whose name is Alice:

```javascript
  const create_result = await alice.call("hello", "create_person", {"person": { "name" : "Alice" }});
```

Check that the result of the call is Ok:

```javascript
  t.ok(create_result.Ok);
```

Add a call to the `retrieve_person` function with the address from the last call:

```javascript
  const retrieve_result = await alice.call("hello", "retrieve_person", {"address": create_result.Ok});
```

Check that this call is Ok as well:

```javascript
  t.ok(retrieve_result.Ok);
```
This is the actual result we want at the end of the test. Check that the entry at the address is indeed named `Alice`:

```javascript
  t.deepEqual(retrieve_result, { Ok: {"name": "Alice"} })
```
\#S:HIDE
```javascript

})

diorama.run()
```
### Running the test

Your test should now look like this:

\#S:CHECK=javascript=test

Obviously these tests will fail right now. Can you guess what the first failure will be? Let's have a look.

Enter the nix-shell if you don't have it open already:

```bash
nix-shell https://holochain.love
```

Run the test:

!!! note "Run in `nix-shell`"
    ```bash
    hc test
    ```

!!! failure "The test fails on the create_person function because it doesn't exist yet:"
    `"Holochain Instance Error: Zome function 'create_person' not found in Zome 'hello'"`

> Note that this test might actually get stuck because we haven't put in the required functions yet. Press `ctrl-c` to exit a stuck test.

## Add the entry

Open up your `zomes/hello/code/src/lib.rs` file.  
To add an entry into your source chain start by telling Holochain what kinds of entry exist.  
First we'll create a [`struct`](https://doc.rust-lang.org/1.9.0/book/structs.html) to define the shape of the data.

In a moment we will add a `Person` struct, but this is where to put it:

\#S:SKIP
```rust
// <---- Add the person struct here.

#[zome]
mod hello_zome {
```

Add the following lines.

Allow this struct to be easily converted to and from JSON:

\#S:INCLUDE
```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
```

Represent a person as a struct:

```rust
pub struct Person {
```

Represent their name as a String:

```rust
    name: String,
}
```

Look for the following lines inside the `hello_zome` mod.

```rust
#[zome]
mod hello_zome {
```
\#S:HIDE
```rust
    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }
```
```rust
  /* --- Lines omitted -- */
  #[zome_fn("hc_public")]
  fn hello_holo() -> ZomeApiResult<String> {
      Ok("Hello Holo".into())
  }

  // <---- Add the following lines here.
```

Add the `person_entry_def` function, which tells Holochain about the person entry type:

```rust
    #[entry_def]
    fn person_entry_def() -> ValidatingEntryType {
```

Add the `entry!` macro that lets you easily create a `ValidatingEntryType`:

```rust
        entry!(
```

Give it the same name as the `Person` struct, just to be consistent. Entry types are usually in lowercase.

Add the name and description of the entry:

```rust
            name: "person",
            description: "Person to say hello to",
```

Entries of this type are just for this agent's eyes only, so set the entry sharing to private:

```rust
            sharing: Sharing::Private,
```

Add the `validation_package` function that says what is needed to validate this entry:

```rust
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
```

Add the `validation` function that validates this entry.

It returns that this entry is always Ok as long as it fits the shape of the `Person` struct:

```rust
            validation: | _validation_data: hdk::EntryValidationData<Person>| {
                Ok(())
            }
        )
    }
```

Now you can create actual `person` entries and store them on your source chain.

> __A note on validation:__
> Validation is very important. It is the "rules of the game" for your Holochain app. It is meaningful to emphasize that although we are returning `Ok(())` that we are still validating that the data type checks as a `Person` with a `name` property containing a `String`. Essentially this rule says the person entry must be in this format.

### Add some `use` statements

In the above code we have used a few types and macros that are not mentioned anywhere else. So the Rust compiler doesn't know where to find them yet.

Add the following `use` statements:

<script id="asciicast-Smv3xxADtSj8AExf3X9d3UApI" src="https://asciinema.org/a/Smv3xxADtSj8AExf3X9d3UApI.js" async data-autoplay="true"></script>

``` diff
#![feature(proc_macro_hygiene)]
+#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
+#[macro_use]
extern crate holochain_json_derive;

use hdk::{
+    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
};

+use hdk::holochain_core_types::{
+    entry::Entry,
+    dna::entry_types::Sharing,
+};
+
+use hdk::holochain_json_api::{
+    json::JsonString,
+    error::JsonError,
+};
+
+use hdk::holochain_persistence_api::{
+    cas::content::Address
+};

use hdk_proc_macros::zome;
```

### Compile

\#S:EXTRA
```
    }
```

\#S:CHECK=rust

Package the app and check that there's no compile errors:

!!! note "Run in `nix-shell`"
    ```bash
    nix-shell] hc package
    ```

## Create a person

Now you need a way for you UI to actually create a person entry. Holochain has a concept called `hc_public` which is a way of telling the runtime make this function available to call from outside this zome.

Add the following lines below the previous `person_entry_def` function.

Add a public function that takes a `Person` and returns a result with an `Address`:

\#S:INCLUDE
```rust
#[zome_fn("hc_public")]
pub fn create_person(person: Person) -> ZomeApiResult<Address> {
```

Create an entry from the passed argument:

```rust
    let entry = Entry::App("person".into(), person.into());
```

Commit the entry to your local source chain:

```rust
    let address = hdk::commit_entry(&entry)?;
```

Return the `Ok` result with the new person entry's address:

```rust
    Ok(address)
}
```

### Compile

\#S:CHECK=rust

Check for compile errors again:

```bash
nix-shell] hc package
```

## Retrieve person

Lastly you need a way for your UI to get a person entry back from the source chain.

Add the following lines below the `create_person` function.

Add a public `retrieve_person` function that takes an `Address` and returns a `Person`:

```rust
#[zome_fn("hc_public")]
fn retrieve_person(address: Address) -> ZomeApiResult<Person> {
```

Get the entry from your local storage, asking for it by address:

```rust
    hdk::utils::get_as_type(address)
}
```

> In Rust the last line is always returned. You do not need to explicitly say `return`.

### Test

\#S:CHECK=rust

Instead of directly compiling, you can run the test you wrote at the start (the test always compiles before it runs):

```bash
nix-shell] hc test
```

If everything went smoothly you will see:

```bash
1..5
# tests 5
# pass  5

# ok
```

## UI

Now you can move onto the modifying the UI to interact with zome functions you just created. First let's do some housekeeping and move the JavaScript from the previous tutorial into its own file.

Go to the GUI project folder that you created in the [Hello GUI]() tutorial:

```bash
cd holochain/coreconcepts/gui
```

Create a new `hello.js` file, open it in your favorite editor, and open the `index.html` alongside it.

Move the everything inside the `<script>` tag into the `hello.js`:

\#S:SKIP,MODE=gui
```javascript
<script type="text/javascript">
<!-- Everything from HERE to -->
// Connection state
    var holochain_connection = holochainclient.connect({ url: "ws://localhost:3401"});
    
    function hello() {
      holochain_connection.then(({callZome, close}) => {
        callZome('test-instance', 'hello', 'hello_holo')({"args": {} }).then((result) => update_span(result))
      })
    }
    function update_span(result) {
      var span = document.getElementById('output');
      var output = JSON.parse(result);
      span.textContent = " " + output.Ok;
    }
<!-- HERE -->
</script>
```

Add the `src` attribute to the `<script>` tag:

```html
<script type="text/javascript" src="hello.js"></script>
```

## Create person UI widget

Let's start with the HTML elements to create a person.

Look for the previous 'say hello' elements.

```html
<button onclick="hello()" type="button">Say Hello</button>
<span>Response:</span><span id="output"></span>
<!-- Put the following lines here -->
```

Below them, add a text box so the user can enter their name:

```html
<input type="text" id="name" placeholder="Enter your name :)"><br>
```

Add a button that calls a (yet to be written) JavaScript function called `create_person`:

```html
<button onclick="create_person()" type="button">Submit Name</button>
```

Add a span with the id `address_output` so you can render the result of this call:

```html
<div>Address: <span id="address_output"></span></div>
```

_TODO: Add collapsable html code panel._

### Switch to your `hello.js` file

Let's write the `create_person` function that will call your zome.

Add the `create_person` function:

```javascript
function create_person() {
```

Get the text box by its ID `name` and save the current text value into the name variable:

```javascript
  var name = document.getElementById('name').value;
```

Wait for the connection and then make a zome call:

```javascript
  holochain_connection.then(({callZome, close}) => {
```

Call `create_person` in your `hello` zome and pass in the name variable as part of a person structure, then write the result to the console:

```javascript
    callZome('test-instance', 'hello', 'create_person')({person: {name: name} }).then((result) => console.log(result, 'address_output'))
  })
}
```

### Run the server and open a browser

_TODO: Add collapsable hello.js code panel._
Go ahead and test your first call.

Open a new terminal window and enter the nix-shell:

```bash
nix-shell https://holochain.love
```

Run the server:

```bash
nix-shell] python -m SimpleHTTPServer
```

In your other terminal window package and run your zome:

```bash
nix-shell] hc package
nix-shell] hc run -p 8080
```

Now that both your UI server and your Holochain conductor server are running, open up a browser and go to `0.0.0.0:8000`. You should see the HTML elements you created:

![](https://i.imgur.com/EsiVbNE.png)

Open the developer console, enter your name, and press the "Submit Name" button. You should something similar to this:

![](https://i.imgur.com/s20Oh6A.png)
> The address you see will probably be different, because you probably typed in your own name.

### Show the new entry's address

Now we're going to show the address on the page rather than the developer console.

But first, a bit of refactoring. If you make the `update_span` function more generic, then you can reuse it for each element that shows the output for a zome function.

Pass in the element's ID so that the function can be reused:

[![asciicast](https://asciinema.org/a/ZIP7v6Qy4Y5f4aVR34CPWolW7.svg)](https://asciinema.org/a/ZIP7v6Qy4Y5f4aVR34CPWolW7)

### Enter the browser

Go back to your browser and refresh the page. This time when you enter your name and press __Submit Name__, you will see the address show up:

![](https://i.imgur.com/rMfAa7t.png)

## Retrieve a person entry and show it in the UI

Back in the `index.html` file now. Add a text box so the user can enter the address that is returned from the `create_person` function:

```html
<input type="text" id="address_in" placeholder="Enter the entry address"><br>
```

Add a button that calls the (yet to be written) `retrieve_person` JavaScript function:

```html
<button onclick="retrieve_person()" type="button">Get Entry</button>
```

Add a span with the ID `entry_output` to display the person that is returned from the `retrieve_person` function:

```html
<div>Person: <span id="entry_output"></span></div>
```

### Go to your `hello.js` file

Add the `retrieve_person` function to call the zome function of the same name and show its response:

```javascript
function retrieve_person() {
```

Get the value from the `address_in` text box:

```javascript
  var address = document.getElementById('address_in').value;
```

Wait for the connection and then make a zome call:

```javascript
  holochain_connection.then(({callZome, close}) => {
```

Call the `retrieve_person` public zome function, passing in the address. Then pass the result to `update_person`:

```javascript
    callZome('test-instance', 'hello', 'retrieve_person')({address: address}).then((result) => update_person(result))
  })
}
```

Add the `update_person` function. It is very similar to `update_element` except that you need to parse the result and then parse the inner array.

```javascript
function update_person(result) {
  var person = document.getElementById('entry_output');
  var output = JSON.parse(result);
  var output = JSON.parse(output.Ok.App[1]);
  person.textContent = " " + output.name;
}
```
\#S:HIDE,INCLUDE
```rust
}
```
