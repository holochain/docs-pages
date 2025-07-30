---
title: Running Network Infrastructure
---

::: intro
This howto will walk you through downloading, configuring and running a containerized setup that provides a bootstrap and signal/relay server for a Holochain application. This server is necessary to help peers discover each other and establish a direct peer-to-peer WebRTC connection, and it also provides a message relay service as a fallback in case a direct connection can't be established.
:::

The [kitsune2 bootstrap server](https://github.com/holochain/kitsune2/tree/main/crates/bootstrap_srv) provides:

* Peer discovery
* WebSocket-based signalling for WebRTC connection setup between peers
* Optionally, the same WebSocket protocol can be used as a relay by peers who can't establish a direct connection to each other in the signalling step

Any user-friendly hApp will need these services in order to operate.

!!! info Public server
The Holochain Foundation provides a public bootstrap server at `https://dev-test-bootstrap2.holochain.org/` that you're welcome to use for testing. It's not appropriate for production hApps, though, because it's low-bandwidth and has no uptime guarantees.
!!!

## Requirements

* A server with a container management tool that can use [OCI containers](https://opencontainers.org/) and understands docker-compose v2 files (e.g., [Docker](https://www.docker.com/) or [Podman](https://podman.io/)). In this guide we'll use Linux-specific commands and paths and the `docker` command.
* TLS certificate and key files for your server's domain name stored in the server's filesystem in [PEM](https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail) format. In this guide we're using certificates issued by Let's Encrypt and managed by [certbot](https://certbot.eff.org/). You can choose any other method of issuing certificates, as long as the certificates will be trusted by your users.

## Create a Docker compose file

Create a `docker-compose.yaml` file in an appropriate place in your server's filesystem, then open it for editing. Here we'll be storing the file in `/opt/kitsune2-bootstrap` and editing it in Vim:

```bash
sudo mkdir -p /opt/kitsune2-bootstrap
```
```bash
cd /opt/kitsune2-bootstrap
```
```bash
sudo vim docker-compose.yaml
```

Copy this code into the file, edit the locations of your TLS certificate and key files, and save it.

<!-- TODO(upgrade): Update the docker image URL -->
```yaml
services:
  bootstrap:
    image: ghcr.io/holochain/kitsune2_bootstrap_srv:v0.2.11
    command:
      - kitsune2-bootstrap-srv
      - --production
      - --listen
      - "[::]:443"
      # Replace these with actual paths to your cert and key files,
      # relative to the local volume mount point you specify further down.
      - --tls-cert
      - /etc/letsencrypt/live/bootstrap.example.org/fullchain.pem
      - --tls-key
      - /etc/letsencrypt/live/bootstrap.example.org/privkey.pem
    environment:
      - RUST_LOG=info
    network_mode: host
    volumes:
        # Replace this with the path to the TLS certificate files on the host
        # and your desired mount point inside the container, in this format:
        # <host path>:<mount point>
      - /etc/letsencrypt/:/etc/letsencrypt/
    restart: unless-stopped
```

!!! info Tuning the bootstrap server's performance
You can pass various parameters to `kitsune2-bootstrap-srv` to tune the relay performance. The [`sbd_server` crate documentation](https://docs.rs/sbd-server/latest/sbd_server/struct.Config.html#structfield.limit_clients) shows the data structure; the tuning parameters are `limit_clients` onward. To pass them as arguments to the Docker container, prefix them with `sbd` and convert them to hyphen-case, like this:

```yaml
# ...
    command:
      - kitsune2-bootstrap-srv
      - --sbd-limit-clients
      - 50
# ...
```
!!!

## Run the container

Test the configuration:

```bash
docker compose up
```

You should see a lot of log messages, ending with this line:

::: output-block
```text
bootstrap-1  | #kitsune2_bootstrap_srv#listening#[::]:443#
```
:::

If you see this, you know your server is running and should be able to respond to requests from Holochain conductors. You can now run the container in detached/daemon mode:

```bash
docker compose up --detach
```

!!! info Running a production server
At this point your bootstrap server is ready for testing, but it probably isn't ready for production use. Operating a production server is outside of the scope of this documentation, and will require thinking about things like securing the server, denial-of-service protection, handling container or server failures, monitoring, logging, etc. Here are things to know about the bootstrap server:

* Even though the server keeps its own state, this state is ephemeral and can safely be disposed of (e.g., in case of a server crash and failover to another instance) with only temporary disruptions to service as peers re-announce themselves to the new server. This disruption will mostly be felt by newcomers and peers using the relay fallback.
* The state can't be shared among instances of the bootstrap server for load-sharing.
* One instance can be used as a bootstrap server while another can be used as a signal/relay server to spread the load; the only configuration necessary is to specify different URLs in your conductor configuration (see the next section).
* The Docker compose file above configures the server as an open relay without authentication; we're working on making it easier to [build authentication](https://github.com/holochain/sbd/blob/main/spec-auth.md) appropriate for your hApp.
* You'll need to size your server instance for your expected peak level of usage --- it may be helpful to simulate this using a multi-conductor [Tryorama](/build/testing-with-tryorama/) test or real humans. Depending on your server specs and bandwidth, the server binary can theoretically scale to support thousands of concurrent peers, with a couple hundred using relayed connections.
* The server hasn't been tested extensively with Holochain in high-load or failure scenarios.
!!!

## Configure your hApp to use your bootstrap server

<!-- TODO: eventually it should be possible to specify the server URLs in the DNA manifest. When that happens, add instructions here. See https://github.com/holochain/holochain/issues/4761 -->

To use your server in testing, and to test that the server is running and accessible, open your project's `package.json` file and edit the following line:

<!-- TODO(upgrade): update the package.json file with any changes, and bump dep version numbers -->

```diff:json
 ...
   "scripts": {
-    "start": "AGENTS=${AGENTS:-3} BOOTSTRAP_PORT=$(get-port) npm run network",
+    "start": "AGENTS=${AGENTS:-3} npm run network",
     "network": "hc sandbox clean && npm run build:happ && UI_PORT=$(get-port) concurrently \"npm run start --workspace ui\" \"npm run launch:happ\" \"hc playground\"",
     "test": "npm run build:zomes && hc app pack workdir --recursive && npm run test --workspace tests",
     // Replace the hApp bundle name and URLs with your actual values.
-    "launch:happ": "hc-spin -n $AGENTS --ui-port $UI_PORT workdir/my_app.happ",
+    "launch:happ": "hc-spin -n $AGENTS --ui-port $UI_PORT --bootstrap-url \"https://bootstrap.example.org\" --signaling-url \"wss://bootstrap.example.org\" workdir/my_app.happ",
     // If you use the Tauri-based launcher, you can also make the following
     // edits.
-    "start:tauri": "AGENTS=${AGENTS:-2} BOOTSTRAP_PORT=$(get-port) npm run network:tauri",
+    "start:tauri": "AGENTS=${AGENTS:-2} npm run network:tauri",
     "network:tauri": "hc sandbox clean && npm run build:happ && UI_PORT=$(get-port) concurrently \"npm run start --workspace ui\" \"npm run launch:tauri\" \"hc playground\"",
-    "launch:tauri": "concurrently \"kitsune2-bootstrap-srv --listen \"127.0.0.1:$BOOTSTRAP_PORT\"\" \"echo pass | RUST_LOG=warn hc launch --piped -n $AGENTS workdir/my_forum_app.happ --ui-port $UI_PORT network --bootstrap http://127.0.0.1:\"$BOOTSTRAP_PORT\" webrtc ws://127.0.0.1:\"$BOOTSTRAP_PORT\"\"",
+    "launch:tauri": "echo pass | RUST_LOG=warn hc launch --piped -n $AGENTS workdir/my_forum_app.happ --ui-port $UI_PORT network --bootstrap \"https://bootstrap.example.org\" webrtc \"wss://bootstrap.example.org\"",
     "package": "npm run build:happ && npm run package --workspace ui && hc web-app pack workdir --recursive",
     "build:happ": "npm run build:zomes && hc app pack workdir --recursive",
     "build:zomes": "cargo build --release --target wasm32-unknown-unknown"
   },
 ...
```

If you're using [Kangaroo](https://github.com/holochain/kangaroo-electron) to build an Electron-based app, open up your project's `kangaroo.config.ts` file, then edit the following lines:

<!-- TODO(upgrade): Update Holochain/lair versions and hashes as needed -->

```diff:typescript
 import { defineConfig } from './src/main/defineConfig';
 export default defineConfig({
   // ...
   // Use your actual domain name here.
-  bootstrapUrl: 'https://dev-test-bootstrap2.holochain.org/',
+  bootstrapUrl: 'https://bootstrap.example.org/',
-  signalUrl: 'wss://dev-test-bootstrap2.holochain.org/',
+  signalUrl: 'wss://bootstrap.example.org/',
   iceUrls: ['stun:stun.l.google.com:19302','stun:stun.cloudflare.com:3478'],
   // ...
 });
```

!!! info Hardening your server against unintended use
We've shown how to configure the server without authentication. In a production scenario, you'll likely want to authenticate incoming connections to the server because:

* Unauthorized requests to the bootstrap endpoint could leak details about what devices are running what hApps, and
* Unauthorized requests to the signal/relay endpoint allow users of other hApps to freeload on your server's bandwidth.

We plan to discuss [authentication options](https://github.com/holochain/sbd/blob/main/spec-auth.md) in the future.
!!!