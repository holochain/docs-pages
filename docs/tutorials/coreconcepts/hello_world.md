# Hello World

Hello and welcome to the hello world tutorial. It's a little weird that we are doing a hello world tutorial as the 5th tutorial in this series but that's because we really want you to grasp the agent perspective of a Holochain app.  
So far all the previous tutorials have had a local perspective of a single agent. However, the real power of Holochain comes from interacting with other agents.

With that in mind let's try to share some data between two agents. To achieve this you will run two instances, Alice and Bob.  
Then add an entry to Alice's local chain. Finally, retrieve that same entry from Bob's instance.

## Make your entry public 

So far the only entry you have had has been private. But this isn't that useful if you want your users to be able to share entries on the same network.

Open up your `zomes/hello/code/src/lib.rs` file.

Change the entry sharing to `Sharing::Public`:

```diff
    fn person_entry_def() -> ValidatingEntryType {
        entry!(
            name: "person",
            description: "Person to say hello to",
-            sharing: Sharing::Private,
+            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<Person>| {
                Ok(())
            }
        )
    }
```
<script id="asciicast-K0Vj50CIVNSYWr5RIbbrc6V3s" src="https://asciinema.org/a/K0Vj50CIVNSYWr5RIbbrc6V3s.js" async data-autoplay="true" data-loop="true"></script>

## Add Bob to the test

Previously you made a test where Alice made a few zome calls and verified the results. Now, to test that the entries can be shared between agents on the same DNA, you can use Bob in your tests to interact with Alice.

Open up your `test/index.js` file and add/update the following lines:

Add `bob` to the scenario:

```diff
- diorama.registerScenario("Test Hello Holo", async (s, t, { alice }) => {
+ diorama.registerScenario("Test Hello Holo", async (s, t, { alice, bob }) => {
```

Make the `retrieve_person` call with the result from `create_person`:

```javascript
const bob_retrieve_result = await bob.call("hello", "retrieve_person", {"address": create_result.Ok});
```

Check that the result was Ok:

```javascript
t.ok(bob_retrieve_result.Ok);
```

Check that the result does indeed match the person entry that Alice created:

```javascript
t.deepEqual(retrieve_result, { Ok: {"name": "Alice"} })
```
Your test should look like this:

??? question "Check your code"
    ```javascript
    const path = require('path')
    const tape = require('tape')
    
    const { Diorama, tapeExecutor, backwardCompatibilityMiddleware } = require('@holochain/diorama')
    process.on('unhandledRejection', error => {
      console.error('got unhandledRejection:', error);
    });
    
    const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")
    const dna = Diorama.dna(dnaPath, 'cc_tuts')
    const diorama = new Diorama({
      instances: {
        alice: dna,
        bob: dna,
      },
      bridges: [],
      debugLog: false,
      executor: tapeExecutor(require('tape')),
      middleware: backwardCompatibilityMiddleware,
    })
    diorama.registerScenario("Test Hello Holo", async (s, t, { alice, bob }) => {
      const result = await alice.call("hello", "hello_holo", {});
      t.ok(result.Ok);
    
      t.deepEqual(result, { Ok: 'Hello Holo' })
      
      const create_result = await alice.call("hello", "create_person", {"person": { "name" : "Alice" }});
      t.ok(create_result.Ok);
      const retrieve_result = await alice.call("hello", "retrieve_person", {"address": create_result.Ok});
      t.ok(retrieve_result.Ok);
      t.deepEqual(retrieve_result, { Ok: { App: [ 'person', '{"name":"Alice"}' ] }})
    
    })
    diorama.run()
    ```


### Run the test

Enter the nix-shell if you don't have it open already:

```bash
nix-shell https://holochain.love
```

Now run the test and make sure it passes:

```bash
nix-shell] hc test
```
```
1..7
# tests 7
# pass  7

# ok
```

## Switch to the Holochain conductor

Now it would be cool to see this happen for real outside of a test. Up till now you have only used `hc run` to run a single instance of a node. However, in order to have two separate instances communicate on one machine, we need to run `holochain` directly and pass it a config file.

!!! tip "hc run vs holochain"
    `hc` and `holochain` are both conductors that host your apps on your users' machines. `hc run` is for testing and development, and `holochain` is for end-users. It can host multiple instances of multiple DNAs for multiple users. Normally Alice and Bob would be running instances of your app in their own conductors on their own machines. But for the purposes of this tutorial, it'll be a lot more convenient to try this on one machine, so you don't have to worry about network setup.

Before you can create the config file, you will need to generate some keys for your agents.

Use `hc keygen` in your nix-shell to generate a key for each agent:

!!! note "Run in `nix-shell`"
    ```
    hc keygen -n
    ```

!!! success "This will output something similar to the following:"
    ```
    Generating keystore (this will take a few moments)...

    Succesfully created new agent keystore.

    Public address: HcSCJhRioEqzvx9sooOfw6ANditrqdcxwfV7p7KP6extmnmzJIs83uKmfO9b8kz
    Keystore written to: /Users/user/Library/Preferences/org.holochain.holochain/keys/HcSCJhRioEqzvx9sooOfw6ANditrqdcxwfV7p7KP6extmnmzJIs83uKmfO9b8kz

    You can set this file in a conductor config as keystore_file for an agent.
    ```

Take note of the `Public address`; you will need it later.

Copy the newly generated keystore to your working folder (replace the path with the one in the `Keystore written to: ` line from the output of the previous command):

```bash
cp <path_of_generated_keystore> agent1.key
```

Now run `hc keygen` again but copy the key store to agent2.key:

```bash
cp <path_of_generated_keystore> agent2.key
```

### Config file

Create a new file in the root directory of your project called `conductor-config.toml`.

Add an agent with ID `test_agent1` and name it `Agent 1`:

```toml
# -----------  Agents  -----------
[[agents]]
  id = "test_agent1"
  name = "Agent 1"
```

Use the public address and keystore from `hc keygen` that you made for agent 1 before here:

```toml
  public_address = "<public_address_of_agent_1>"
  keystore_file = "./agent1.key"
```

Add an agent with ID `test_agent2` and name it `Agent 2`:

```toml
[[agents]]
  id = "test_agent2"
  name = "Agent 2"
```

Use the public address and keystore from `hc keygen` that you made for agent 2 before here:

```toml
  public_address = "<public_address_of_agent_2>" 
  keystore_file = "./agent2.key"
```

Package your DNA and take note of its hash:

```
nix-shell] hc package
```

You will see something similar to this:

```
DNA hash: QmS7wUJj6XZR1SBVk1idGh6bK8gN6RNSFXP2GoC8yCJUzn
```

Add the DNA to your config file with ID `hello` and the hash you just saw above:

```toml
# -----------  DNAs  -----------
[[dnas]]
  id = "hello"
  file = "dist/hello_holo.dna.json"
  hash = "<dna_hash>"
```

Connect agent 1 to the `hello` DNA to create an instance for Alice:

```toml
[[instances]]
  id = "Alice"
  dna = "hello"
  agent = "test_agent1"
[instances.storage]
  type = "memory"
```

Add the Bob instance with the same `hello` dna:

```toml
[[instances]]
  id = "Bob"
  dna = "hello"
  agent = "test_agent2"
[instances.storage]
  type = "memory"
```

Setup the WebSocket interface on socket `3041`:

```toml
[[interfaces]]
  id = "websocket_interface"
[interfaces.driver]
  type = "websocket"
  port = 3401
```

Add your instances to this interface so you can call their zome functions:

```toml
[[interfaces.instances]]
  id = "Alice"
[[interfaces.instances]]
  id = "Bob"
```

> #### Note
> Again, in real life Alice and Bob would each have their own conductor, so they wouldn't be listening on the same WebSocket interface.

## Allow the users to choose their instance

Before you can use two agents, you need a way for the UI to specify which instance the user wants to use. You can do this by setting the instance ID in the zome call. You can think of an instance as a running version of a DNA, in the same way that a variable is an instance of a struct.

Open the `gui/index.html` file.

Add a text box for your users to set the agent ID:

```html
<input type="text" id="instance" placeholder="Enter your instance ID"><br>
```

Open the `gui/index.js` and do the following for every `callZome` call:

[![asciicast](https://asciinema.org/a/Tp2xSDERlohFXy90LP7Yu4HQR.svg)](https://asciinema.org/a/Tp2xSDERlohFXy90LP7Yu4HQR)

## Run the app and two UIs

Now the fun part, where you get to play with what you just wrote.

Open up three terminal windows and enter the nix-shell in each one:

```bash
nix-shell https://holochain.love
```

#### Terminal one

Go to the root folder of your app:

```
nix-shell] cd /path/to/my/app
```

Start by running the conductor. It's a bit different this time; instead of `hc run` you will use `holochain` directly:

```
nix-shell] holochain -c conductor-config.toml
```

#### Terminal two

Go to the root folder of your GUI:

```
nix-shell] cd /path/to/my/gui
```

Run a GUI on port `8000`:

```
nix-shell] python -m SimpleHTTPServer 8000
```

#### Terminal three

Go to the root folder of your GUI:

```
nix-shell] cd /path/to/my/gui
```

Run a GUI on port `8001`:

```
nix-shell] python -m SimpleHTTPServer 8001
```

### Open up the browser

Open two tabs.

#### Tab one

Go to `0.0.0.0:8000`. Enter `Alice` into the `Enter your instance ID` text box.

#### Tab two

Go to `0.0.0.0:8001`. Enter `Bob` into the `Enter your instance ID` text box.

#### Tab one---Alice

Create a person entry with your name:

![](https://i.imgur.com/6PEDn6y.png)

#### Tab two---Bob

Copy the address from the Alice tab and retrieve the person entry:

![](https://i.imgur.com/ps9RBr2.png)

Hooray! Alice and Bob are now able to find each other's information on the DHT
