\#S:EXTERNAL=rust=hello_world.rs
\#S:MODE=gui,INCLUDE
\#S:EXTERNAL=javascript=hello_world_gui.js=gui
\#S:MODE=test,INCLUDE
\#S:EXTERNAL=javascript=hello_world.js=test
\#S:EXTERNAL=html=hello_world.html=gui
# Hello World

!!! info "WIP"
    This article is currently a work in progress and subject to frequent change.  
    See the [changelog](/docs/changelog) for details.

!!! tip "Time & Level"
    Time: ~2 hours | Level: Beginner

Welcome to the hello world tutorial. It's a little strange to do a hello world tutorial as number five, but we really wanted to show a Holochain app from an agent perspective. This is the first time the agent will be interacting with the _world_.

The previous tutorials have come from the local perspective of a single agent. However, the real power of Holochain comes from interacting with other agents.

## What will you learn
You will learn how to share data between two agents. To achieve, this you will run two conductors---Alice and Bob.  
Then, add an entry to Alice's local chain. Finally, retrieve that entry from Bob's instance.

## Why it matters
Holochain applications are about creating cooperation between multiple agents; by sharing data among the agents, you can validate one another's entries.

## Make your entry public 

So far, the only entries you have had have been private. If you want your users to be able to share data, then you can set the entry to 'public' in the definition.

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

Previously, you wrote a test where Alice made a few zome calls and verified the results. You can now use Bob in your tests to interact with Alice to verify that the entries can be shared between agents running the same DNA.

The aim here is for Alice to create a person, which Bob can then retrieve.

Open up your `test/index.js` file.

Before Bob can retrieve Alice's person, Bob will need to be able to see the person that Alice committed. This goes back to an idea that will come up a lot in Holochain---eventual consistency. In a nutshell, an Agent that is connected to the same network as another agent will eventually come into agreement on what data exists.

To make sure this has happened, add this line to the end of the scenario:
```javascript
  await s.consistency();
```

> This one line says a lot about the nature of a Holochain application. The word `await` shows that we are in an asynchronous world and want to wait for consistency to be achieved. What kind of situation might lead to this line remaining incomplete? _Hint: Think about networks that might not be perfect._

Get Bob to retrieve Alice's person using the same address she did when she created the entry: 

```javascript
  const bob_retrieve_result = await bob.call('cc_tuts', 'hello', 'retrieve_person', {'address': alice_person_address });
```

The result is checked and stored:

```javascript
  t.ok(bob_retrieve_result.Ok);
  const bobs_person = bob_retrieve_result.Ok;
```

Finally, a deeper check makes sure the contents of the two persons match:

```javascript
  t.deepEqual(bobs_person, { "name": "Alice"});
```
\#S:HIDE
```javascript
})
orchestrator.run()
```
Your test should look like this:

\#S:CHECK=javascript=test

### Run sim2h
Again, you will need to run the sim2h server in a seperate terminal window:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    sim2h_server -p 9000
    ```

### Run the test

Enter the nix-shell if you don't have it open already:

```bash
nix-shell https://holochain.love
```

Now, run the test and make sure it passes:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    hc test
    ```

!!! success "If everything went okay, at the end you will see:"
    ```
    # tests 7
    # pass  7
    
    # ok
    ```

## Switch to the Holochain conductor

Now, it would be cool to see this happen for real, outside of a test. Up until now, you have only used `hc run` to run a single conductor. However, in order to have two separate conductors communicate on one machine, we need to use the `holochain` cli tool.  
This takes a bit of setting up.

!!! tip "hc run vs holochain"
    `hc` and `holochain` are both conductors that host your apps on your users' machines. `hc run` is for testing and development, while `holochain` is for end users. It can host multiple instances of multiple DNAs for multiple users. Normally, Alice and Bob would be running instances of your app in their own conductors on their own machines. But for the purposes of this tutorial, it'll be a lot more convenient to try this on one machine so you don't have to worry about network setup---although, you can use multiple machines if you'd like.

Before you can create the config file, you will need to generate keys for your agents.

Use `hc keygen` in your nix-shell to generate a key for each agent:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc keygen -n -p alice.key
    ```

!!! success "This will output something similar to the following:"
    ```
    Generating keystore (this will take a few moments)...

    Successfully created new agent keystore...

    Public address: HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez
    Keystore written to: alice.key 

    You can set this file in a conductor config as keystore_file for an agent.
    ```

Take note of the `Public address`---you will need it later.

Now, run `hc keygen` again, but copy the key store to bob.key:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc keygen -n -p bob.key
    ```

### Create the conductor config file

Create a new file in the root directory of your project called `conductor-config-alice.toml`.

Add an agent with ID `alice` and name it `Alice`:

```toml
[[agents]]
id = 'alice'
name = 'Alice'
```
Now, point the keystore_file at `alice.key` with the public_address set to the `Public address` you generated before:
```toml
keystore_file = 'alice.key'
public_address = 'HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez'
```

> Your public address will be different to this one.

Set your agent to 'test agent' to make it load faster:
```toml
test_agent = true
```
Next, you need your DNA's hash:

!!! note "Run in `nix-shell https://holochain.love`"
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

Create the test instance with the 'Alice' agent:

```toml
[[instances]]
agent = 'alice'
dna = 'hc-run-dna'
id = 'test-instance'

[instances.storage]
type = "memory"
```

Set up the WebSocket interface on socket `3401`:

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

Finally, add the sim2h network connection:
```toml
[network]
type = 'sim2h'
sim2h_url = 'wss://localhost:9000'
```

The easiest thing to do now is to copy this config file and change a few lines:
```bash
cp conductor-config-alice.toml conductor-config-bob.toml
```

Change the names to Bob.
```diff
[[agents]]
-id = 'alice'
+ id = 'bob'
- name = 'Alice'
+ name = 'Bob'
```
Point to Bob's key file and use his public address from before:
```diff
- keystore_file = 'alice.key'
+ keystore_file = 'bob.key'
- public_address = 'HcScjdwyq86W3w5y3935jKTcs4x9H9Pev898Ui5J36Sr7TUzoRjMhoNb9fikqez'
+ public_address = 'HcSCj4uMm999rT4B6kfgSYx6ONfg3misvoV76JI9J57KM89ejVf4uwhm7Mm6f7i'

[[instances]]
- agent = 'alice'
+ agent = 'bob'
dna = 'hc-run-dna'
id = 'test-instance'
```
Change the UI WebSocket port to 3402:
```diff
[interfaces.driver]
- port = 3401
+ port = 3402
type = 'websocket'
```

## Allow the UI to choose the conductor 

To use two agents from the GUI, you need a way to specify which conductor the user wants to use. You can do this by setting the port for the WebSocket connection. 

Open up `gui/index.html`.

Add a text box and button in the UI to set the port:

\#S:INCLUDE,MODE=gui

```html
    <input type="text" id="port" placeholder="Set websocket port" />
    <button onclick="update_port()" type="button">update port</button>
```
\#S:HIDE

```html
    <script
      type="text/javascript"
      src="hc-web-client/hc-web-client-0.5.1.browser.min.js"
    ></script>
    <script type="text/javascript" src="hello.js"></script>
  </body>
</html>
```
\#S:CHECK=html=gui


Now, open `gui/hello.js`.

Add an `update_port` function that resets the connection to the new port:
```javascript
function update_port() {
  const port = document.getElementById('port').value;
  holochain_connection = holochainclient.connect({
    url: 'ws://localhost:' + port,
  });
}
```

\#S:CHECK=javascript=gui

## Run the app and two UIs

Now, the fun part---you get to play with what you just wrote.  
You're going to need a few terminals to do this.

#### Terminal one
Run the sim2h server.

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    sim2h_server -p 9000
    ```

#### Terminal two 
Start by running the conductor. It's a bit different this time---instead of `hc run`, you'll use `holochain` directly:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    holochain -c conductor-config-alice.toml
    ```

#### Terminal three
Start the second conductor:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    holochain -c conductor-config-bob.toml
    ```

#### Terminal four 

Go to the root folder of your GUI:

Run the first UI on port `8001`:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    python -m SimpleHTTPServer 8001
    ```
#### Terminal five

Also in the root folder of your GUI:

Run the second UI on port `8002`:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    python -m SimpleHTTPServer 8002
    ```

### Open up the browser

Open two tabs.

#### Tab Alice

Go to `0.0.0.0:8001`.

#### Tab Bob 

Go to `0.0.0.0:8002`.  
Enter `3402` into the port text box and click 'update port.'

![Update the port to 3401](../../../img/bobs_port.png)

#### Tab Alice

Create a person entry with your name:

![Enter your name into create person](../../../img/hw_create_person.png)

#### Tab Bob

Copy the address from the Alice tab and retrieve the person entry:

![Retrieve Alice's person from Bob's conductor](../../../img/hw_retrieve_person.png)

Hooray! Alice and Bob are now able to share data on the DHT.

## Key takeaways
- Entries need to be explicitly marked public or they will only be committed to an agent's local chain.
- A public entry will be passed to other agents via gossip, validated and held.
- Another agent can retrieve your public entries.

## Learn more
- [DHT](https://www.educative.io/edpresso/what-is-a-distributed-hash-table)
- [Hash Chain](https://www.techopedia.com/definition/32920/hash-chain)
- [Consensus](https://holo.host/faq/how-does-holochain-manage-consensus-data-integrity/)
