# Create a New App
These are the commands you will need when creating a new application.

### Initialize a new app
Make sure you have completed the [Install Guide](../install).

Enter the `nix-shell`
```
nix-shell https://holochain.love
```

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc init my_new_app
    ```

## Run from project root 

!!! tip
    The following commands should all be run from the project root (e.g., `my_new_app/`).
    ```
    cd my_new_app
    ```

### Generate a new Zome 

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc generate zomes/my_zome rust-proc
    ```

### Package an app 

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc package
    ```

### Run a testing Holochain conductor

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc run
    ```

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc test
    ```

### Run a Holochain conductor
You will need to create a config file. See the [hello_world](tutorials/coreconcepts/hello_world) tutorial for an example.

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    holochain -c conductor-config.toml
    ```

### Learn more

!!! note "Run in `nix-shell https://holochain.love`"
    ```
    hc help 
    holochain --help 
    ```

<script id="asciicast-hSQDLOnyqEN8Jm9Oyb00EDZdX" src="https://asciinema.org/a/hSQDLOnyqEN8Jm9Oyb00EDZdX.js" async data-autoplay="true" data-loop="true"></script>
