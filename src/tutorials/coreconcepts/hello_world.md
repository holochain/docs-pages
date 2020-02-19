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

\#S:CHANGE
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

> This one line says a lot about the nature of a Holochain application. The word `await` shows that we are in an asynchronous world and want to wait for consistency to be achieved. What kind of situation might lead to this line never returning? _Hint: Think about networks that might not be perfect._

Get Bob to retrieve Alice's person using the same address she did when she created the entry: 

```javascript
  const bob_retrieve_result = await bob.call(
    'cc_tuts',
    'hello',
    'retrieve_person',
    {address: alice_person_address},
  );
```

The result is checked and stored:

```javascript
  t.ok(bob_retrieve_result.Ok);
  const bobs_person = bob_retrieve_result.Ok;
```

Finally, a deeper check makes sure the contents of the two persons match:

```javascript
  t.deepEqual(bobs_person, {name: 'Alice'});
```
\#S:HIDE
```javascript
});
orchestrator.run();
```
Your test should look like this:

\#S:CHECK=javascript=test

### Run sim2h
Again, you will need to run the sim2h server in a seperate terminal window:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    sim2h_server
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

## Run the app and two UIs

Now, the fun part---you get to play with what you just wrote.  
You're going to need a few terminals to do this.

You will tell `hc` to use sim2h networking because you are actually 
using two separate conductors in this tutorial.
You will also need to give each conductor a different agent name.

#### Terminal one
Run the sim2h server.

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    sim2h_server
    ```

#### Terminal two 
Start by running the conductor. Set the agent name to `Alice`.

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc package
    hc run --networked sim2h --agent-name Alice
    ```
!!! check "Copy the DNA's hash with `hc hash`:"
    ```
    DNA hash: QmadwZXwcUccmjZGK5pkTzeSLB88NPBKajg3ZZkyE2hKkG
    ```
> Your hash will be different but you need to update your `bundle.toml` file.

If you're feeling lazy, I have provided a script in the [hello gui](../hello_gui) tutorial.

#### Terminal three
Start the second conductor with agent name set to `Bob`:

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc package
    hc run --networked sim2h --agent-name Bob --port 8889
    ```


### Open up the browser

Open two tabs.

#### Tab Alice

Go to `127.0.0.1:8888`.

#### Tab Bob 

Go to `127.0.0.1:8889`.

#### Tab Alice

Create a person entry with your name:

![Enter your name into create person](../../../img/hw_create_person.png)

#### Tab Bob

Copy the address from the Alice tab and retrieve the person entry:

![Retrieve Alice's person from Bob's conductor](../../../img/hw_retrieve_person.png)

Hooray! Alice and Bob are now able to share data on the DHT.

!!! success "Solution"
    You can check the full solution to this tutorial on [here](https://github.com/freesig/cc_tuts/tree/hello_world).

## Key takeaways
- Entries need to be explicitly marked public or they will only be committed to an agent's local chain.
- A public entry will be passed to other agents via gossip, validated and held.
- Another agent can retrieve your public entries.

## Learn more
- [DHT](https://www.educative.io/edpresso/what-is-a-distributed-hash-table)
- [Hash Chain](https://www.techopedia.com/definition/32920/hash-chain)
- [Consensus](https://holo.host/faq/how-does-holochain-manage-consensus-data-integrity/)
