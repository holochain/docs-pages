# Debugging a Running Holochain Conductor

To debug a running Holochain conductor, you can [look at (and optionally tweak) the log output](#holochain-logs) it produces or [inspect the state of the conductor](#inspecting-conductor-state-with-the-hc-sandbox-cli) via the `hc sandbox` CLI.

## Holochain logs

Under normal development circumstances, such as running Holochain via the `hc spin` CLI, the Holochain process writes logs to stdout. If Holochain is being run in [launcher](https://github.com/holochain/launcher) or [kangaroo](https://github.com/holochain/kangaroo-electron), these logs are written to a file that you can find via **Help > Open Logs** in the application menu.

### Custom log levels

If you run Holochain via `hc spin` or directly via the `holochain` binary, you can set its log levels via the `RUST_LOG` environment variable. For instance, if you're running a hApp via the scaffolded `npm` commands:

```bash
RUST_LOG=debug npm run start
```

If you run Holochain indirectly via Launcher or kangaroo, you can set its log levels instead by running the binary via the terminal and passing the `--holochain-rust-log` argument. For example:

```bash
./name.of.app.built.with.kangaroo.AppImage --holochain-rust-log "debug"
```

You can check out the [docs of the tracing-subscriber crate](https://docs.rs/tracing-subscriber/latest/tracing_subscriber/filter/struct.EnvFilter.html#example-syntax) as a reference for the syntax that the `RUST_LOG` variable expects, including how to filter by target or crate.

### Getting log messages from zomes

You can also listen to [log messages emitted from your zomes](/build/miscellaneous-host-functions/#log-things-in-your-zomes) with the `WASM_LOG` environment variable. This value defaults to `debug`. For example:

```bash
RUST_LOG=trace WASM_LOG=trace npm run start
```

or in kangaroo:

```bash
./name.of.app.built.with.kangaroo.AppImage --holochain-rust-log "debug" --holochain-wasm-log "debug"
```

!!! info `WASM_LOG` is limited by `RUST_LOG`
You'll only get tracing messages from your zome if they have a log level more severe than _both_ `RUST_LOG` _and_ `WASM_LOG`.
!!!

### Understanding the logs

[TODO]

## Inspecting conductor state with the `hc sandbox` CLI

1. First you'll need to make sure to have the `hc` CLI installed at a version that is compatible with the Holochain version that you want to inspect. An easy way to do that is to head into a [holonix](https://github.com/holochain/holonix#holonix) shell if you have an existing hApp project using nix. Otherwise you can install it via cargo:

    ```bash
    cargo install holochain_cli --version <holochain version>
    ```

2. Next, in order to be able to connect to a running conductor, you will need to figure out the admin port of the conductor as well as the HTTP origins from which calls to the admin interface are allowed.

    * For **Launcher, Kangaroo, or `holochain`**:
        1. Locate the conductor config file (typically going by the filename `conductor-config.yaml`).

            ::: info For Launcher or kangaroo
            If you're running Holochain in Launcher or a binary packaged with kangaroo, you can navigate to the logs folder via **Help" > "Open Logs**, then navigate one level up and from there navigate to `./data/conductor/conductor-config.yaml` (Kangaroo) or `./holochain/[version number]/conductor-config.yaml`.
            :::

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

    * For **`hc spin` or the scaffolded `npm run start` command:

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
hc-sandbox: List apps: [AppInfo { installed_app_id: "my_forum_app", cell_info: {"my_forum_app": [Provisioned(ProvisionedCell { cell_id: CellId(DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa), AgentPubKey(uhCAkgpe-FEfP31bomRWqvpybHRgy2Ikx4uaTzi6CcgZLLs6dNz5P)), dna_modifiers: DnaModifiers { network_seed: "", properties: null }, name: "my_forum_app" })]}, status: Running, agent_pub_key: AgentPubKey(uhCAkgpe-FEfP31bomRWqvpybHRgy2Ikx4uaTzi6CcgZLLs6dNz5P), manifest: V1(AppManifestV1 { name: "my_forum_app", description: None, roles: [AppRoleManifest { name: "my_forum_app", provisioning: Some(Create { deferred: false }), dna: AppRoleDnaManifest { location: Some(Bundled("../dnas/my_forum_app/workdir/my_forum_app.dna")), modifiers: DnaModifiersOpt { network_seed: None, properties: None }, installed_hash: Some(HoloHashB64(DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa))), clone_limit: 0 } }], allow_deferred_memproofs: false }), installed_at: Timestamp(2025-06-04T21:52:36.493227Z) }]
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
hc-sandbox: This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
signed at 2025-06-04 22:01:22.812 UTC
expires at 2025-06-04 22:21:22.812 UTC in 18mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
agent: GDRikARwx5XvQlBY0YzWMhv6tI-OeLSYtI1WzZRodYM
URLs: Some(ws://127.0.0.1:43245/77imYOMho71CaohaB-C70ZmQaH9vX-OI4Uq8r7kwpOI)


hc-sandbox: This agent AgentPubKey(uhCAk1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyPu6HEV) is 1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyM
This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
signed at 2025-06-04 22:00:21.515 UTC
expires at 2025-06-04 22:20:21.515 UTC in 17mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
agent: 1WPDaSiP-UzPK1peWdq7Id9sR-QqVHUf2nyiRzyxfyM
URLs: Some(ws://127.0.0.1:43245/n4JgBCZ5LgpgcwP2Olx3JdYSZ5vXpDhsWeAXFpcGFRo)


hc-sandbox: This DNA DnaHash(uhC0kJ7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX_GEHsa) is J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
signed at 2025-06-04 22:01:22.815 UTC
expires at 2025-06-04 22:21:22.815 UTC in 18mins
space: J7wa-02liGff5zmmP9KcczVjan7CZOwOIV0mpXL-cX8
agent: AY8zn3CjEbghBUJq0iMkrZ9QstZV2Q3epKMw2VypDj8
URLs: Some(ws://127.0.0.1:43245/DIioYLUcexkOa3ee011q2ZdSBkZ3jl7dCLXL9ascwvQ)
```
:::

To get information about one local cell, use the `--dna` and `--agent-key` parameters:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> list-agents --dna <dna-hash> --agent-key <agent-key>
```

You can find these values by looking at the previous output or the output from the [`list-apps` call above](#list-apps).

### Dump network stats

To see information about open connections to peers, you can run:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> dump-network-stats | jq
```

The output is JSON, and might look something like this when formatted by [`jq`](https://jqlang.org/), a command-line JSON processor, for formatting:

::: output-block
{
  "backend": "BackendLibDataChannel",
  "peer_urls": [
    "ws://127.0.0.1:44019/KoP1khVW9W3JqdLJl3Y-rvBcVNCyNMvgWTpOwvSQms8"
  ],
  "connections": [
    {
      "pub_key": "P8SZdNJA4lbdnPRoTHS2S0mR5Ou-BKeECaGoIm0RTOI",
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
:::

Objects in the `connections` array contain information about open connections to other peers where the `pub_key` field refers to a public key by which peers are identified on the signal server (and which is different from the agent public keys from previous examples, which agents use to sign actions on their source chains). The tail of the url in the `peer_urls` array is your own signal server public key.

### Dump network metrics

To get some information about gossip, you can use the `dump-network-metrics` call for a given DNA:

```bash
hc sandbox --force-admin-ports <port> call --origin <origin> dump-network-metrics <base64-dna-hash> | jq
```

You can get the Base64 DNA hash by looking at the output of the `list-apps` call.

The output is JSON, and might look something like this:

::: output-block
```json
{
  "uhC0kf5TlHZBt6UF-DUFi3EUSJojnnEpA_MX57NyFpcCng4ZN5-sh": {
    "fetch_state_summary": {
      "pending_requests": {},
      "peers_on_backoff": {}
    },
    "gossip_state_summary": {
      "initiated_round": null,
      "accepted_rounds": [],
      "dht_summary": {},
      "peer_meta": {
        "wss://dev-test-bootstrap2.holochain.org:443/P8SZdNJA4lbdnPRoTHS2S0mR5Ou-BKeECaGoIm0RTOI": {
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