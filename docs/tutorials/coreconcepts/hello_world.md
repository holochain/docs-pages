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
-  const { alice } = await s.players({alice: config}, true)
+  const { alice, bob } = await s.players({alice: config, bob: config}, true)
```

Before you get Bob to retrieve a person you need Bob to be able to see the person that Alice committed. 
This goes back to to an idea that will come up a lot in Holochain, eventual consistency. In a nutshell an Agent that is connected to the same network as another agent will eventually come to agreement on what data exists.

To make sure this has happened in our tests you can call:
```javascript
  await s.consistency();
```

> This one line says a lot about the nature of a Holocahin application. The word `await` shows that we are in an asynchronous world and want to wait for consistency to be achieved. What kind of situation would lead to this line never completing?

You get Bob to retrieve Alice's person using the same address she got when she created the entry: 

```javascript
  const bob_retrieve_result = await bob.call('cc_tuts', 'hello', 'retrieve_person', {'address': alice_person_address });
```

The result is checked and stored:

```javascript
  t.ok(bob_retrieve_result.Ok);
  const bobs_person = bob_retrieve_result.Ok;
```

Finally a deeper check makes sure the contents of the two persons match:

```javascript
  t.deepEqual(bobs_person, { "name": "Alice"});
```
Your test should look like this:

??? question "Check your code"
    ```javascript
    const path = require('path')
    const tape = require('tape')
    
    const { Config, Orchestrator, tapeExecutor, singleConductor, combine, callSync } = require('@holochain/try-o-rama')
    
    process.on('unhandledRejection', error => {
      // Will print "unhandledRejection err is not defined"
      console.error('got unhandledRejection:', error);
    });
    
    const orchestrator = new Orchestrator({
      globalConfig: {logger: false,  
        network: {
          type: 'sim2h',
          sim2h_url: 'wss://0.0.0.0:9001',
        }
      },
      middleware: combine(singleConductor, tapeExecutor(tape))
    })
    
    const config = {
      instances: {
        cc_tuts: Config.dna('dist/cc_tuts.dna.json', 'cc_tuts')
      }
    }
    
    orchestrator.registerScenario("Test hello holo", async (s, t) => {
      const { alice, bob } = await s.players({alice: config, bob: config}, true)
      // Make a call to the `hello_holo` Zome function
      // passing no arguments.
      const result = await alice.call('cc_tuts', "hello", "hello_holo", {});
      // Make sure the result is ok.
      t.ok(result.Ok);
    
      // Check that the result matches what you expected.
      t.deepEqual(result, { Ok: 'Hello Holo' })
      await s.consistency()
      const create_result = await alice.call('cc_tuts', "hello", "create_person", {"person": { "name" : "Alice" }});
      t.ok(create_result.Ok);
      const alice_person_address = create_result.Ok;
      await s.consistency()
      const retrieve_result = await alice.call('cc_tuts', "hello", "retrieve_person", {"address": alice_person_address });
      t.ok(retrieve_result.Ok);
      t.deepEqual(retrieve_result, { Ok: {"name": "Alice"} })
      await s.consistency();
      const bob_retrieve_result = await bob.call('cc_tuts', 'hello', 'retrieve_person', {'address': alice_person_address });
      t.ok(bob_retrieve_result.Ok);
      const bobs_person = bob_retrieve_result.Ok;
      t.deepEqual(bobs_person, { "name": "Alice"});
    })
    orchestrator.run()
    ```


### Run the test

Enter the nix-shell if you don't have it open already:

```bash
nix-shell https://holochain.love
```

Now run the test and make sure it passes:

!!! note "Run in `nix-shell`"
    ```bash
    nix-shell] hc test
    ```

!!! success "If everything went okay, then right at the end you will see:"
    ```
    # tests 7
    # pass  7
    
    # ok
    ```

## Switch to the Holochain conductor

Now it would be cool to see this happen for real outside of a test. Up till now you have only used `hc run` to run a single instance of a node. However, in order to have two separate instances communicate on one machine, we need to run our own conductor using the `holochain` cli tool.

!!! tip "hc run vs holochain"
    `hc` and `holochain` are both conductors that host your apps on your users' machines. `hc run` is for testing and development, and `holochain` is for end-users. It can host multiple instances of multiple DNAs for multiple users. Normally Alice and Bob would be running instances of your app in their own conductors on their own machines. But for the purposes of this tutorial, it'll be a lot more convenient to try this on one machine, so you don't have to worry about network setup.

Before you can create the config file, you will need to generate some keys for your agents.

Use `hc keygen` in your nix-shell to generate a key for each agent:

!!! note "Run in `nix-shell`"
    ```
    hc keygen -n -p agent1.key
    ```

!!! success "This will output something similar to the following:"
    ```
    Generating keystore (this will take a few moments)...

    Succesfully created new agent keystore.

    Public address: HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez
    Keystore written to: agent1.key 

    You can set this file in a conductor config as keystore_file for an agent.
    ```

Take note of the `Public address`; you will need it later.

Now run `hc keygen` again but copy the key store to agent2.key:

!!! note "Run in `nix-shell`"
    ```
    hc keygen -n -p agent2.key
    ```

### Config file

Create a new file in the root directory of your project called `conductor-config-agent1.toml`.

Add an agent with ID `alice` and name it `Alice`:

```toml
[[agents]]
id = 'alice'
name = 'Alice'
```
Now point the keystore_file at `agent1.key` and the public_address is set to the `Public address` you generated before:
```toml
keystore_file = 'agent1.key'
public_address = 'HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez'
```

> Your public address will be different to this one.

Next you need your DNA's hash:

!!! note "Run in `nix-shell`"
    ```
    hc hash 
    ```

!!! success "You will see something similar to this:"
    ```
    DNA hash: QmPMMqNsbNqf3Hbizwwi6gDKw2nnSvpJQyHLG2SMYCCU8R
    ```

Add the DNA to your config file with the hash you got above:

```toml
[[dnas]]
file = 'dist/cc_tuts.dna.json'
hash = 'QmPMMqNsbNqf3Hbizwwi6gDKw2nnSvpJQyHLG2SMYCCU8R'
id = 'hc-run-dna'
```

Create the test instance with the alice agent:

```toml
[[instances]]
agent = 'alice'
dna = 'hc-run-dna'
id = 'test-instance'

[instances.storage]
type = "memory"
```

Setup the WebSocket interface on socket `3041`:

```toml
[[interfaces]]
admin = true
id = 'websocket-interface'

[[interfaces.instances]]
id = 'test-instance'

[interfaces.driver]
port = 3401
type = 'websocket'
```

Finally add the sim2h network connection:
```toml
[network]
type = 'sim2h'
sim2h_url = 'wss://0.0.0.0:9001'
```

The easiest thing to do now is copy this config file and change a few lines:
```bash
cp conductor-config-agent1.toml conductor-config-agent2.toml
```

```diff
[[agents]]
-id = 'alice'
+ id = 'bob'
- name = 'Alice'
+ name = 'Bob'
- keystore_file = 'agent1.key'
+ keystore_file = 'agent2.key'
- public_address = 'HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez'
+ public_address = 'HcSCj4uMm999rT4B6kfgSYx6ONfg3misvoV76JI9J57KM89ejVf4uwhm7Mm6f7i'

[[dnas]]
- file = 'dist/cc_tuts.dna.json'
+ file = '/Users/tomgowan/holochain/testing_tuts/cc_tuts/dist/cc_tuts.dna.json'
- hash = 'QmPMMqNsbNqf3Hbizwwi6gDKw2nnSvpJQyHLG2SMYCCU8R'
+ hash = 'QmXNYdDHTajqf91q4igGgW88H6eBrpA6ha5bNE7iKvCKg8'
id = 'hc-run-dna'

[[instances]]
- agent = 'alice'
+ agent = 'bob'
dna = 'hc-run-dna'
id = 'test-instance'

[interfaces.driver]
- port = 3401
+ port = 3402
type = 'websocket'
```

## Allow the UI to choose the conductor 

Too use two agents from the gui, you need a way to specify which conductor the user wants to use. You can do this by setting the port for the websocket connection. 

Open up `gui/index.html`.

Add a text box and button in the UI to set the port:

```html
    <input type="text" id="port" placeholder="Set websocket port" />
    <button onclick="update_port()" type="button">update port</button>
```
Now open `gui/hello.js`.

Add a `update_port` function that resets the connection to the new port:
```javascript
function update_port() {
  const port = document.getElementById('port').value;
  holochain_connection = holochainclient.connect({
    url: 'ws://localhost:' + port,
  });
}
```

## Run the app and two UIs

Now the fun part, where you get to play with what you just wrote.  
You going to need a few terminals to do this.

#### Terminal one

Run the sim2h server
!!! note "Run in `nix-shell`"
    ```
    sim2h_server -p 9001
    ```

#### Terminal two 
Start by running the conductor. It's a bit different this time; instead of `hc run` you will use `holochain` directly:

!!! note "Run in `nix-shell`"
    ```
    holochain -c conductor-config-agent1.toml
    ```

#### Terminal three
Start the second conductor:

!!! note "Run in `nix-shell`"
    ```
    holochain -c conductor-config-agent2.toml
    ```

#### Terminal four 

Go to the root folder of your GUI:

Run the first UI on port `8001`:

!!! note "Run in `nix-shell`"
    ```
    python -m SimpleHTTPServer 8001
    ```
#### Terminal five

Still in the root folder of your GUI:

Run the second UI on port `8002`:

!!! note "Run in `nix-shell`"
    ```
    python -m SimpleHTTPServer 8002
    ```

### Open up the browser

Open two tabs.

#### Tab Alice

Go to `0.0.0.0:8001`.

#### Tab Bob 

Go to `0.0.0.0:8002`.  
Enter `3402` into the port text box and click update port.

#### Tab Alice

Create a person entry with your name:

![](https://i.imgur.com/6PEDn6y.png)

#### Tab Bob

Copy the address from the Alice tab and retrieve the person entry:

![](https://i.imgur.com/ps9RBr2.png)

Hooray! Alice and Bob are now able to find each other's information on the DHT
