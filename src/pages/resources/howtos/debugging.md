# Debugging a Running Holochain Conductor

To debug a running Holochain conductor, you can [look at (and optionally tweak) the log output](#holochain-logs) it produces or [inspect the state of the conductor](#inspecting-conductor-state-with-the-hc-sandbox-cli) via the `hc sandbox` CLI.

## Holochain logs

Under normal development circumstances, such as running Holochain via the `hc spin` CLI, the Holochain process writes logs to stdout. If Holochain is being run in [launcher](https://github.com/holochain/launcher) or [kangaroo](https://github.com/holochain/kangaroo-electron), these logs are written to a file that you can find via **Help > Open Logs** in the application menu.

### Custom log levels

If you run Holochain via `hc spin` or directly via the `holochain` binary, you can set its log levels via the `RUST_LOG` environment variable. For instance, if you're running a hApp via the scaffolded `npm` commands:

```bash
RUST_LOG=info npm run start
```

If you run Holochain indirectly via Launcher or kangaroo, you can set its log levels instead by running the binary via the terminal and passing the `--holochain-rust-log` argument. For example:

```bash
./name.of.app.built.with.kangaroo.AppImage --holochain-rust-log "info"
```

You can check out the [docs of the tracing-subscriber crate](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/filter/struct.EnvFilter.html#example-syntax) as a reference for the syntax that the `RUST_LOG` variable expects, including how to filter by target or crate.

There is one useful target: [`NETAUDIT`](https://docs.rs/holochain/latest/holochain/docs/tracing/index.html#netaudit-target) reports network-related messages across various crates from the transport implementation (tx5) to Holochain itself.

```bash
RUST_LOG=NETAUDIT=debug,info npm run start
```

### Getting log messages from zomes

You can also listen to [log messages emitted from your zomes](/build/miscellaneous-host-functions/#log-things-in-your-zomes) with the `WASM_LOG` environment variable. For example:

```bash
WASM_LOG=trace npm run start
```

or in kangaroo:

```bash
./name.of.app.built.with.kangaroo.AppImage --holochain-wasm-log "debug"
```

Launcher and Kangaroo default both `RUST_LOG` and `WASM_LOG` to `warn` but add some sensible defaults to reduce noise; you can see the defaults [here in the kangaroo-electron codebase](https://github.com/holochain/kangaroo-electron/blob/89ff7ba9721785c0e4f196707016418aaccadad1/src/main/holochainManager.ts#L102-L111).

The standalone `holochain` conductor binary and the `hc` dev tool don't set a default WASM log level.

!!! info Setting different log levels
`WASM_LOG` and `RUST_LOG` don't have to match; for example, you may want to output everything from your zomes but only output warnings and higher from the runtime:

```bash
WASM_LOG=trace RUST_LOG=warn npm run start
```
```bash
./name.of.app.built.with.kangaroo.AppImage --holochain-wasm-log "trace" --holochain-rust-log "warn"
```
!!!

### Understanding the logs

Interpreting Holochain's logs requires some time and practice, and it's easier the more knowledge you have of how Holochain works internally. However, they are a primary method for gathering information about the state of a running conductor, so spending time looking at them will generally pay off.

There are many "issues" that the Holochain logs chooses to surface because they are useful debugging information, but they don't necessarily mean that Holochain is broken. Some examples follow:

* `DhtOp has failed app validation outcome=AwaitingDeps`: This log output is common and means that a piece of data is being held in the validation queue because its dependencies either haven't been found or haven't been validated yet.
* `Error initiating gossip: Other { ctx: \"tx5 send error\", src: Some(Kind(TimedOut)) }"}`: This is letting you know that Holochain was unable to initiate data sync with another peer because the network request made to that peer timed out.
* `could not send publish ops: tx5 send error (src: timed out)`:  This one is letting you know that data you created could not be published to one of the peers who are expected to store data that you've created.

On their own, these messages aren't very useful. Context is required, and that can be established by asking questions:

* **Did somebody recently go offline?** If so, it'll take some time for Holochain to realize and stop contacting them. Currently, this can take up to 20 minutes, but work is ongoing to reduce that time window.
* **Is your application generally functioning and these error messages are showing up as communication issues with a small number of peers on the network?** This may be expected behavior, because this is a P2P platform and errors on real networks are normal. If logs are showing that you have connectivity issues with a given peer over a longer period of time, then that could be a sign of a connectivity issue between you.
* **Is the same [DHT operation](/build/dht-operations/) reporting that it failed to pass validation over an extended period of time?** If so, it's possible that it depends on other ops that aren't yet properly distributed on the network, and those won't appear until later when the author comes back online and resumes sharing their content. Or it could point to an issue in Holochain or the app's validation logic.

The key here is understanding that errors happen, and that they are a normal part of the P2P experience. The logs can help you understand what is happening in your conductor, but they become a more useful signal with context, such as the same error being reported repeatedly without a good explanation.

Another useful approach is to watch the logs while performing actions in your app. This can help you link a problem that Holochain is reporting to a specific program flow --- for example, clicking a button that you expect to try to retrieve links from the network or send a remote signal. Checking the logs between the timestamp when you make your action and around 60s later can help you understand what Holochain is doing that doesn't match your expectations. The reason to watch for around 60s is that it might take some time for timeouts related to the action to be reported.

## Inspecting conductor state with the `hc sandbox` CLI

1. First you'll need to make sure to have the `hc` CLI installed at a version that is compatible with the Holochain version that you want to inspect. An easy way to do that is to head into a [holonix](https://github.com/holochain/holonix#holonix) shell if you have an existing hApp project using Nix. Otherwise you can install it via cargo:

    ```bash
    cargo install holochain_cli --version <holochain version>
    ```

2. Next, in order to be able to connect to a running conductor, you will need to figure out the admin port of the conductor as well as the HTTP origins from which calls to the admin interface are allowed.

    * For **Launcher, Kangaroo, or `holochain`**:
        1. Locate the conductor config file (typically going by the filename `conductor-config.yaml`).

            !!! info For Launcher or kangaroo
            If you're running Holochain in Launcher or a binary packaged with kangaroo, you can navigate to the logs folder via **Help > Open Logs**, then navigate one level up and from there navigate to `./data/conductor/conductor-config.yaml` (Kangaroo) or `./holochain/[version number]/conductor-config.yaml` (Launcher).
            !!!

        2. If you open the conductor config file, you should see a section that looks something like this:

            ::: output-block
            ```yaml
            admin_interfaces:
              - driver:
              type: websocket
              port: 33907
              allowed_origins: kangaroo
            ```
            :::

            You can see the admin port and allowed origins, in this case `33907` and `kangaroo` respectively. If `allowed_origins` is set to `"*"` it means that any origins are allowed and you won't have to specify an origin in the CLI admin call below. **If the port is `0` it means that a free port will have been selected by the OS automatically and you need to figure out the actual port by checking the Holochain logs** for lines like this:

            ::: output-block
            ```
            ###HOLOCHAIN_SETUP###
            ###ADMIN_PORT:35477###
            ###HOLOCHAIN_SETUP_END###
            Conductor ready.
            ```
            :::

    * For **`hc spin` or the scaffolded `npm run start` command**:

        1. For the port number, look in your conductor logs for output that looks like this:

            ::: output-block
            ```
            [hc-spin] | [hc sandbox]: hc-sandbox: Conductor launched #!0 {"admin_port":39867,"app_ports":[45529]}
            ```
            :::

            (Note that `npm run start` will spawn two conductors, so you'll see two lines like this.)

        2. Any origins are allowed, so you don't have to specify one.

3. Now that you know the admin port and allowed origins, you can make calls to the admin interface with the `hc` CLI.

To see all available commands you can run `hc sandbox call --help`. In the following, some of the commands useful for debugging are further explained.

### List apps

To list all apps installed in the conductor, you call the [ListApps](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html#variant.ListApps) admin endpoint like so:

```bash
hc sandbox --force-admin-ports <admin port> call --origin <origin> list-apps
```

Or with the example values from above:

```bash
# kangaroo, origin required
hc sandbox --force-admin-ports 33907 call --origin kangaroo list-apps
```

```bash
# hc spin or npm run start, origin optional
hc sandbox --force-admin-ports 45529 call list-apps
```

This should print out an array of info on all the apps installed in the conductor in Rust [debug-formatting](https://doc.rust-lang.org/std/fmt/trait.Debug.html), similar to this:

::: output-block
```
hc-sandbox: List apps: [AppInfo { installed_app_id: "my_forum_app", cell_info: {"my_forum_app": [Provisioned(ProvisionedCell { cell_id: CellId(DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa), AgentPubKey(uhCAkgpe-FEfP31bomRWqvpybHRgy2Ikx4uaTzi6CcgZLLs6dNz5P)), dna_modifiers: DnaModifiers { network_seed: "", properties: null }, name: "my_forum_app" })]}, status: Running, agent_pub_key: AgentPubKey(uhCAkgpe-FEfP31bomRWqvpybHRgy2Ikx4uaTzi6CcgZLLs6dNz5P), manifest: V1(AppManifestV1 { name: "my_forum_app", description: None, roles: [AppRoleManifest { name: "my_forum_app", provisioning: Some(Create { deferred: false }), dna: AppRoleDnaManifest { location: Some(Bundled("../dnas/my_forum_app/workdir/my_forum_app.dna")), modifiers: DnaModifiersOpt { network_seed: None, properties: None }, installed_hash: Some(HoloHashB64(DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa))), clone_limit: 0 } }], allow_deferred_memproofs: false }), installed_at: Timestamp(2025-06-04T21:52:36.493227Z) }] //cspell:disable-line
```
:::

### List agents

To see all peers that Holochain has discovered for a given DNA hash you can use the `list-agents` call:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> list-agents
```

You'll see display-formatted output similar to this. For each local DNA, you'll see a listing for each local and remote peer (local peers start with `This agent AgentPubKey`).

::: output-block
```
hc-sandbox: This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
signed at 2025-06-04 22:01:22.812 UTC
expires at 2025-06-04 22:21:22.812 UTC in 18mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
agent: GDRikARwx5XvQlBY0YzWMhv6tI-OeLSYtI1WzZRodYM
URLs: Some(ws://127.0.0.1:43245/77imYOMho71CaohaB-C70ZmQaH9vX-OI4Uq8r7kwpOI) //cspell:disable-line


hc-sandbox: This agent AgentPubKey(uhCAk1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyPu6HEV) is 1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyM //cspell:disable-line
This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
signed at 2025-06-04 22:00:21.515 UTC
expires at 2025-06-04 22:20:21.515 UTC in 17mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
agent: 1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyM //cspell:disable-line
URLs: Some(ws://127.0.0.1:43245/n4JgBCZ5LgpgcwP2Olx3JdYSZ5vXpDhsWeAXFpcGFRo) //cspell:disable-line


hc-sandbox: This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
signed at 2025-06-04 22:01:22.815 UTC
expires at 2025-06-04 22:21:22.815 UTC in 18mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8 //cspell:disable-line
agent: AY8zn3CjEbghBUJq0iMkrZ9QstZV2Q3epKMw2VypDj8 //cspell:disable-line
URLs: Some(ws://127.0.0.1:43245/DIioYLUcexkOa3ee011q2ZdSBkZ3jl7dCLXL9ascwvQ) //cspell:disable-line
```
:::

To get information about one local cell, use the `--dna` and `--agent-key` parameters:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> list-agents --dna <dna-hash> --agent-key <agent-key>
```

You can find these values by looking at the previous output or the output from the [`list-apps` call above](#list-apps).

### Dump network stats

!!! info Use `jq` for easy JSON reading
The following API endpoints output JSON, so the examples use a tool called [`jq`](https://jqlang.org/) to pretty-print the output. You can install it via your OS' package manager or add it as a package to your `flake.nix` file:

```diff
 ...
         packages = (with pkgs; [
           nodejs_22
           binaryen
+          jq

         ]);
 ...
!!!

To see information about open connections to peers, you can run:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> dump-network-stats | jq
```

The output is JSON, and might look something like this:

::: output-block
```json
{
  "backend": "BackendLibDataChannel",
  "peer_urls": [
    "ws://127.0.0.1:44019/KoP1khVW9W3JqdLJl3Y-rvBcVNCyNMvgWTpOwvSQms8" //cspell:disable-line
  ],
  "connections": [
    {
      "pub_key": "P8SZdNJA4lbdnPRoTHS2S0mR5Ou-BKeECaGoIm0RTOI", //cspell:disable-line
      "send_message_count": 6112,
      "send_bytes": 952143,
      "recv_message_count": 18488,
      "recv_bytes": 2863987,
      "opened_at_s": 1747329607,
      "is_webrtc": true
    },
    // ...
  ]
}
```
:::

Objects in the `connections` array contain information about open connections to other peers where the `pub_key` field refers to a public key by which peers are identified on the signal server (and which is different from the agent public keys from previous examples that agents use to sign actions on their source chains). The path of the url in the `peer_urls` array is your own signal server public key.

### Dump network metrics

To get some information about network state, such as gossip, peer table, and fetch queue, you can use the `dump-network-metrics` call for a given DNA:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> dump-network-metrics <base64-dna-hash> | jq
```

You can get the Base64 DNA hash by looking at the output of the `list-apps` call.

The output is JSON, and might look something like this:

::: output-block
```json
{
  "uhC0kf5TlHZBt6UF-DUFi3EUSJojnnEpA_MX57NyFpcCng4ZN5-sh": { //cspell:disable-line
    "fetch_state_summary": {
      "pending_requests": {},
      "peers_on_backoff": {}
    },
    "gossip_state_summary": {
      "initiated_round": null,
      "accepted_rounds": [],
      "dht_summary": {},
      "peer_meta": {
        "wss://dev-test-bootstrap2.holochain.org:443/P8SZdNJA4lbdnPRoTHS2S0mR5Ou-BKeECaGoIm0RTOI": { //cspell:disable-line
          "last_gossip_timestamp": 1747330934099198,
          "new_ops_bookmark": 1747328798974814,
          "peer_behavior_errors": 2,
          "local_errors": null,
          "peer_busy": null,
          "peer_terminated": 1,
          "completed_rounds": 2,
          "peer_timeouts": 2
        }
      }
    },
    "local_agents": [
      {
        "agent": [132,32,36,114,147,47,69,61,242,8,239,134,173,243,79,253,208,206,129,57,237,158,231,186,71,148,143,29,76,140,167,66,99,232,92,225,121,253,85],
        "storage_arc": [
          0,
          4294967295
        ],
        "target_arc": [
          0,
          4294967295
        ]
      }
    ]
  }
}
```
:::

### Dump cell state

To get information about the state of a cell, you can use the `dump-state` call:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> dump-state <base64-dna-hash> <base64-agent-key> | tail -n +2 | jq
```

Same as the DNA hash, you can get the Base64 agent key from looking at the output of the `list-apps` or `list-agents` calls.

The output of the `dump-state` call is _almost_ JSON; there's an extra line at the beginning. In the command above, the first line is stripped so it can be formatted with `jq`.

::: output-block
```json
[
  {
    "peer_dump": [ /* ... info about peers ... */ ],
    "source_chain_dump": [ /* ... the whole content of the source chain ... */ ],
    "integration_dump": {
      "validation_limbo": 0,
      "integration_limbo": 0,
      "integrated": 234
    }
  },
  "--- Cell State Dump Summary ---\nNumber of other peers in p2p store: 3,\nRecords authored: 32, Ops published: 92\n"
]
```
:::

It generates a lot of output, amongst others the full content of the source chain. The most interesting item for debugging in most cases is the `integration_dump`, which should get logged towards the end. It contains information about how many (if any) DHT ops are still in "validation limbo" and thus waiting to be validated before being accessible by zome calls.