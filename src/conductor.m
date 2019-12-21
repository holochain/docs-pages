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
