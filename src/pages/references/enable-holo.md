---
title: Enable Apps for Holo Hosting
---

## Intro

Holo is cloud hosting for Holochain. Holo helps you enable your users to experience your Holochain application with the simplicity of a web browser and without maintaining a node.

A core distinction versus running nodes on the traditional cloud is that Holo provides the key management and signing infrastructure for users' keys to be held client-side, so your users always have full agency.

## Get started

Holo hosting targets Holochain applications. It is assumed that you have familiarity with Holochain.

https://developer.holochain.org/get-started/

There are two pathways in this section --- from scaffold or by migrating an existing hApp. Both pathways contain largely the same information so choose the pathway that most applies to your situation.

In both cases there are no required DNA changes for Holo Hosting --- only UI changes. However, Holo operates under a different context and we highly recommend that you read the core concepts, in particular the sections on membrane proofs and anonymous access as these **will need DNA integrity zome changes to enable certain features**.

## Get started from scaffolding tool

In this section we'll create a simple To-Do app. Our commentary will focus on the UI differences compared to a pure Holochain context. If you need more information about the DNA itself, please refer to the [Holochain get started section](https://developer.holochain.org/get-started/#4-zero-to-built-creating-a-forum-app)

Holo provides a flag for scaffolding a web-app that is Holo compatible
`nix run github:/holochain/holochain#hc-scaffold -- web-app --holo`

Adding the flag generates a scaffold with a UI compatible with both Holo hosting as well as pure Holochain environments.

Run the holochain scaffolding tool **with `--holo` flag** by typing in your terminal:

```shellsession
nix run github:/holochain/holochain#hc-scaffold -- web-app --holo
```

You should then see:

::: output-block
```text
? App name (no whitespaces):
```
:::

Type our hApp's name using snake_casing: `super_todos`.
You should then see:

::: output-block
```text
? Choose UI framework: ›
❯ Vue
  Svelte
  Lit
```
:::

Use the arrow keys to select a UI framework for your front-end and then press <kbd>Enter</kbd>.

For this example choose `Vue` and press <kbd>Enter</kbd>.
You should then see:

::: output-block
```text
? Do you want to set up the holonix development environment for this project? ›
❯ Yes (recommended)
  No
```
:::

Choose `Yes` and press <kbd>Enter</kbd>.

You should then see `Setting up nix development environment...` with some details of what is being added, followed by instructions of next steps for setting up the development environment for your hApp and continuing to scaffold more of its elements. Let's follow those instructions. First, enter the hApp project directory:

```shellsession
cd super_todos
```

Now fire up the nix development shell (which makes all scaffolding tools as well as the Holochain binaries directly available from the command-line) with:

```shellsession
nix develop
```

You should see:

::: output-block
```text
Holochain development shell spawned. Type exit to leave.
```
:::

Finally we need to install the `npm` dependencies with:

```shellsession
npm install
```

### UI

The biggest difference between a Holo and pure Holochain application is in the UI. The scaffold should automatically have generated everything required here, so we'll simply point out the primary differences.

In a Holo setting we use @holo-host/web-sdk library instead of @holochain/client. WebSDK provides an instance of `AppAgentWebsocket`, which is almost the same as `AppWebsocket`.

```typescript
import WebSdk from '@holo-host/web-sdk';
import type { AgentState } from '@holo-host/web-sdk';
```

Holo hApps provide a authentication form for users to generate in-browser keys and install cells on the network. This form is customisable --- here we set the name of the App.

```typescript
    if (this.IS_HOLO) {
      const client: WebSdk = await WebSdk.connect({
        chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL,
        authFormCustomization: {
          appName: 'super_todos',
        }
      });

      client.on('agent-state', (agent_state: AgentState) => {
        this.loading = !agent_state.isAvailable || agent_state.isAnonymous
      });

      client.signUp({ cancellable: false });

      this.client = client
    } else {
      // We pass '' as url because it will dynamically be replaced in launcher environments
      this.client = await AppAgentWebsocket.connect('', 'vue-default');
      this.loading = false;
    }
  },
```

Because there is the concept of "logging in", we also need a log out option to clear user keys from the client.
```html

  <mwc-button
    v-if="IS_HOLO"
    style="margin-top: 16px"
    raised
    label="Logout"
    @click="logout"
  />
```

```typescript
  async logout () {
      await (this.client as WebSdk).signOut();
      await (this.client as WebSdk).signIn({ cancellable: false });
    }
```

Now let's continue scaffolding our happ by creating a new DNA using the scaffolding tool which is now directly available in the shell. Type:

```shellsession
hc scaffold dna
```

You should then see:

::: output-block
```text
? DNA name (snake_case):
```
:::

Many hApps have just one DNA, so in this case you can just type: `todos`
You should then see:

::: output-block
```text
DNA "todos" scaffolded!
```
:::

DNAs are [comprised of code modules](/concepts/2_application_architecture/), which we call zomes. A DNA should have at least two zomes, an *integrity zome* which declares your DNAs data structures and validation code, and a *coordinator zome* which contains, among other things, the API functions your UI will call to access your DNA.

Create your DNA's first zomes with:

```shellsession
hc scaffold zome
```

You should then see:

::: output-block
```text
? What do you want to scaffold? ›
❯ Integrity/coordinator zome-pair (recommended)
  Only an integrity zome
  Only a coordinator zome
```
:::

Press <kbd>Enter</kbd> to select `Integrity/coordinator zome-pair`.
You should then see:

::: output-block
```text
? Enter coordinator zome name (snake_case):
 (The integrity zome will automatically be named '{name of coordinator zome}_integrity')
```
:::

Type in a name for the zome. In this case we can just use the same name as the DNA `todos`.
You should then see:

```shellsession
? Scaffold integrity zome in folder "dnas/todos/zomes/integrity/"? (y/n) ›
```

Press <kbd>Y</kbd> (this option is for advanced users who may have set up a different folder structure).
You should then see:

::: output-block
```text
Integrity zome "todo_integrity" scaffolded!
? Scaffold coordinator zome in "dnas/todos/zomes/coordinator/"? (y/n) ›
```
:::

Press <kbd>Y</kbd> again.

You will then see `Coordinator zome "todos" scaffolded!` along with output from the intial downloading and setting up of the Holochain Rust HDK, followed by instructions for adding your first entry type.

Now we get to the really exciting part! In the next steps you will specify your data model, and the scaffolding tool will automatically add both zome and UI code to your hApp.

In our to-do hApp every to-do item is stored as an entry. So let's add new entry definitions with:

```shellsession
  hc scaffold entry-type
```

You should see:

```shellsession
✔ Entry type name (snake_case): ·
```

Enter the name `todo_item`.
You should then see:

::: output-block
```text
Which fields should the entry contain?

? Choose field type: ›
❯ String
  bool
  u32
  i32
  f32
  Timestamp
  ActionHash
  EntryHash
  AgentPubKey
  Option of...
  Vector of...
```
:::

The scaffolding tool is smart about adding different data type fields to your entry. For our example we will just have a text field describing the to-do item. So press <kbd>Enter</kbd> to select `String`.

You should see:

::: output-block
```text
? Field name: ›
```
:::

Enter the name `description`.
You should then see:

::: output-block
```text
? Should this field be visible in the UI? (y/n) ›
```
:::
Press <kbd>Y</kbd>.
You should then see:

::: output-block
```text
? Choose widget to render this field: ›
❯ TextArea
  TextField
```
:::

Press <kbd>Enter</kbd> to choose a `TextArea` because we want the description to be able to be multi-lines.
You should then see:

::: output-block
```text
? Add another field to the entry? (y/n) ›
```
:::

Press <kbd>N</kbd>.
You should then see:

::: output-block
```text
? Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)? ›
✔ Update
✔ Delete
```
:::

The scaffolding tool can add zome and UI functions for updating and deleting entries. In the case of our to-do app we want to be able to do both, which is the default, so just press <kbd>Enter</kbd>.
You should then see:

::: output-block
```text
? Should a link from the original entry be created when this entry is updated? ›
❯ Yes (more storage cost but better read performance, recommended)
  No (less storage cost but worse read performance)
```
:::

Because Holochain stores data in append-only [source chains](/concepts/3_source_chain/), updating requires choosing a strategy of how to find updated data. The scaffolding tool allows you to choose between two strategies, one where updates are only linked to the previous version, and one where there is also a link added to the original entry for each update. For this use case either strategy would work fine, so press <kbd>Enter</kbd> to choose the default.
You should then see:

::: output-block
```text
Entry type "todo_item" scaffolded!
```
:::

The final step is create a collection that can be used to render all of to-do items that users create.
To create a collection, type:

```shellsession
  hc scaffold collection
```

You should then see:

::: output-block
```text
Collection name (snake_case, eg. "all_posts"): ›
```
:::

Enter `my_todos` and press <kbd>Enter</kbd>.
You should then see:

::: output-block
```text
? Which type of collection should be scaffolded? ›
❯ Global (get all entries of the selected entry types)
  By author (get entries of the selected entry types that a given author has created)
```
:::

Use the arrow key to select `By author` and press <kbd>Enter</kbd>.
You should then see:

::: output-block
```text
? Which entry type should be collected? ›
❯ TodoItem
```
:::
Press <kbd>Enter</kbd>.
You should then see:

::: output-block
```text
Collection "my_todos" scaffolded!
```
:::

Holo strongly recommends membership proof implementations for production or long-running applications. However, membership proofs that restrict read-only access prevent Holo from providing always-on nodes and [read-only access to applications](https://link.tbd).

If you want to benefit from always-on nodes and read-only access while having membership proofs, you will need to implement special "Holo-safe" logic. You can [read more here](https://link.to.core.concepts).


### Testing

Holo provides the `holo-dev-server` binary, which simulates the Holo Network locally for development. `holo-dev-server` serves a copy of Chaperone and runs a Holochain conductor. Like the real Holo Network, `holo-dev-server` uses `.happs` rather than `.webapps`. The scaffold automatically makes holo-dev-server available via the nix flake file.

1. Ensure you are in the nix development environment. Run `nix develop` if you aren't.
2. Run `npm start:holo`, which should automatically also open an instance of the Holochain Playground on your browser
3. Access your two agents on your browser at http://localhost:8888 and http://localhost:8889

The windows should not be very exciting yet, because we haven't edited the hApp to use the generated UI elements, but what you see on the screen should be some hints on how to proceed.

So let's follow those hints. Switch to a code editor for these steps:

1. In the code editor, open the Vue hApp file `ui/src/App.vue` and add two imports near the top, just below `<script lang="ts">`:

    ```typescript
    import MyTodos from './todos/todos/MyTodos.vue';
    import CreateTodoItem from './todos/todos/CreateTodoItem.vue';
    ```

2. Replace the "EDIT ME" text there with:

    ```html
    <CreateTodoItem></CreateTodoItem>
    <MyTodos author={client.myPubKey}></MyTodos>
    ```

Save the file, and you should see that the windows have been updated to show something that should look like this:

<img src="/assets/img/scaffolded_todos.png">

You now have a fully functional Holo app up and running!


## Migrate from a pure Holochain app

Only minor UI changes are technically required for Holo Hosting. However, Holo operates under a different set of assumptions and we highly recommend that you read the core concepts. It is likely that you will want to reconsider certain UX flows.

This example will use the scaffolded forum-happ Vue example, but feel free to follow along with your own hApp instead.

`nix run github:holochain/holochain#hc-scaffold -- example forum`


In a Holo setting we use @holo-host/web-sdk which provides an instance of `WebSDK`, instead of `AppAgentWebsocket` from `@holochain/client`. Both `WebSDK` and `AppAgentWebsocket` implement `AppAgentClient`.

You'll first need to ensure that you use `WebSDK` or `AppAgentWebsocket` depending on the context

```typescript
import { AppAgentClient, AppAgentWebsocket } from '@holochain/client';
import WebSdk from '@holo-host/web-sdk'; // Import WebSDK library

export default defineComponent({
  components: {
    //...
  },
  data(): {
    client: AppAgentClient | undefined; // Ensure that client is not AppAgentWebsocket
    //...
  } {

```

You can then initialise a context-dependent client, assuming you want your UI to be compatible with both Holo and Holochain.

```typescript
  data(): {
    client: AppAgentClient | undefined;
    loading: boolean;
    IS_HOLO: boolean;
  } {
    return {
      client: undefined,
      loading: true,
      IS_HOLO: ['true', '1', 't'].includes(import.meta.env.VITE_APP_IS_HOLO?.toLowerCase()), // You should set this as an env variable
    };
  },

  async mounted() {
    if (this.IS_HOLO) {
      const client: WebSdk = await WebSdk.connect({
        chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL, // We'll explain this in the testing section
        authFormCustomization: {
          appName: 'forum-app', // Display name on the credentials form. You can also set it in Cloud Console when deploying
        }
      });

      this.client = client
    } else {
      this.client = await AppAgentWebsocket.connect('', 'vue-default');
      this.loading = false;
    }
```

The WebSDK client loads and connects to an iFrame called Chaperone. Chaperone is a key and connection manager to the Holo Network and is invisible outside a few specific cases.


Because the Holo Network acts like a remote conductor, we need to handle connectivity issues. Changes to the connection are emitted and you can register an event handler if the client is an instance of WebSDK. You can see the full list of emitted events here: https://github.com/Holo-Host/web-sdk

```typescript
 import type { AgentState } from '@holo-host/web-sdk';

 async mounted() {
    if (this.IS_HOLO) {
    // ...

        // register event handler for agent-state.
        client.on('agent-state', (agent_state: AgentState) => {
            this.loading = !agent_state.isAvailable
        });

        // ...
```


Now your UI can connect to the Holo Network and read forum posts. However, users can't post or comment yet because they don't yet have a source chain. They are considered "anonymous" and can only request public data from the Network.

!!! note
Unlike in pure Holochain, you cannot assume that a user has provided their desired keys when the connection is established. This may require changes to your application logic. You can read more at https://link.to/keys/documentation
!!!

Holo uses "signUp" and "signIn" terminology but there is no external authentication process. In both processes a user (re)derives their keys from email and password, with signUp also triggering the installation of new hApp cells.

So let's add signUp and signIn functionality to the app.

```html
<main>
    <h1>Forum</h1>
    <!--Add these buttons-->
    <div v-if="IS_HOLO && !isLoggedIn">
      <mwc-button
        style="margin-top: 16px"
        raised
        label="Sign Up"
        @click="signUp"
      />

      <mwc-button
        style="margin-top: 16px"
        raised
        label="Sign In"
        @click="signIn"
      />
    </div>

    <div id="content">
      <h2>All Posts</h2>
      <AllPosts></AllPosts>
      <span style="margin-bottom: 16px"></span>
      <CreatePost></CreatePost>
    </div>
  </main>
```

```typescript
  methods: {
      // ...
      async signUp () {
        await (this.client as WebSdk).signUp({ cancellable: true });
      },

      async signIn () {
        await (this.client as WebSdk).signIn({ cancellable: true });
      },

      // ...
  }
```

These trigger the display of a full screen credentials modal from the Chaperone iFrame, defaulting to either a signUp or signIn page. The user can also toggle between them directly.
![](https://hackmd.io/_uploads/r1WJbrkC3.png)

During signUp a registration code field can be shown to enable membership proof workflows. Holo strongly recommends the use of membership proofs but there are certain caveats to understand. You can read more here: https://link.to/memproofs_and_holo

Finally, we will also need signOut functionality to clear user keys from local storage.

```html
<main>
    <h1>Forum</h1>
    <!--Add these buttons-->
    <div v-if="IS_HOLO && !isLoggedIn">
      <!-- ... -->
    </div>
    <div v-else>
      <mwc-button
        style="margin-top: 16px"
        raised
        label="Sign Out"
        @click="signOut"
      />
    </div>
    <!-- ... -->
  </main>
```

```typescript
  methods: {
      // ...
      async signOut () {
        await (this.client as WebSdk).signOut());
      },

      // ...
  }
```

Now we're ready to build and test!


### Building and testing

Holo provides the `holo-dev-server` binary, which simulates the Holo Network locally for development. `holo-dev-server` serves a copy of Chaperone and runs a Holochain conductor. Like the real Holo Network, `holo-dev-server` uses `.happs` rather than `.webapps`.

To include `holo-dev-server` in your development environment, update your flake.nix file to the below, and re-enter the shell:

```
{
  description = "Template for Holochain app development";

  inputs = {
    nixpkgs.follows = "holochain/nixpkgs";
    holochain = {
      url = "github:holochain/holochain";
      inputs.versions.url = "github:holochain/holochain/?dir=versions/0_2";
    };
  };

  outputs = inputs @ { ... }: let
    holoDevServerChannel = "1774"; // TODO: Change to alpha once merged in
  in
    inputs.holochain.inputs.flake-parts.lib.mkFlake {
      inherit inputs;
    } {
      systems = builtins.attrNames inputs.holochain.devShells;
      perSystem = { config, pkgs, system, ... }: {
        devShells.default = pkgs.mkShell {
          inputsFrom = [ inputs.holochain.devShells.${system}.holonix ];
          packages = with pkgs; [ nodejs-18_x curl ];

          extraSubstitutors = [ "https://cache.holo.host" ];
          trustedPublicKeys = [
            "cache.holo.host-2:ZJCkX3AUYZ8soxTLfTb60g+F3MkWD7hkH9y8CgqwhDQ="
          ];

          shellHook = ''
            nix-env -f "https://hydra.holo.host/channel/custom/holo-nixpkgs/${holoDevServerChannel}/holo-nixpkgs/nixexprs.tar.xz" -iA holo-dev-server
          '';
        };
      };
    };
}
```

To connect your application to `holo-dev-server` you point the client's chaperoneUrl to https://localhost:24274.

```typescript
const client: WebSdk = await WebSdk.connect({
        chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL, // We'll explain this in the testing section
        authFormCustomization: {
          appName: 'forum-app', // Display name on the credentials form. You can also set it in Cloud Console when deploying
        }
```


Let's add some build and test scripts. You should already have scripts to build a `.hApp` file, like below.

```json
"scripts": {
    // ...
    "build:happ": "npm run build:zomes && hc app pack workdir --recursive",
    "build:zomes": "RUSTFLAGS='' CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown"
  },

```

Let's add the following scripts. This will:
1. Build your `.happ` file
2. Run `holo-dev-server` with your `.happ` file
3. Run the `holochain-playground` at localhost:4444
4. Start the your UI at localhost:8888


```json
    "start:holo": "AGENTS=2 npm run network:holo",
    "network:holo": "npm run build:happ && UI_PORT=8888 concurrently \"npm run launch:holo-dev-server\" \"holochain-playground ws://localhost:4444\" \"concurrently-repeat 'VITE_APP_CHAPERONE_URL=http://localhost:24274 VITE_APP_IS_HOLO=true npm start -w ui' $AGENTS\"",
    "launch:holo-dev-server": "sudo ./holo-dev-server workdir/test-app.happ",

```

These scripts assume that you have a `start` script setup in a `ui` workspace, which you should have if you've used a Holochain scaffold.

You now have a fully functional Holo app up and running!

!!! info
For production deployment, make sure that chaperoneUrl is configured to `https://chaperone.holo.hosting`
!!!

## Deploy

This process assumes you already have a Cloud Console account. If you do not, you can sign up at https://register.holo.host

### Deploy UI

Holo does not currently offer UI hosting. hApp managers will need to deploy their UI separately for now.

!!! info
Holo supports "headless hosting" where there is no Holo-enabled UI. In this case Holo will maintain copies of the DHT, but will not hold any source chains. Holo hosting requires <membrane proof recommendation?>

Holo does not support direct programmatic/API access to deployed hApps.
!!!

### Deploy hApp to Holo network
1. Log into Cloud Console
2. Click on "Add a hApp"
3. Fill out hApp details
    --- "Link to hApp file" must point to a publically accessible .hApp file
    --- (Optional) "URL of hosted UI" is the URL which your users will access your UI from
    --- (Optional) Configuration of memproof/registration code
    --- Click deploy
4. Wait for deployment to take effect. It may take up to 30 minutes


## Core concepts and further documentation

Holochain assumes that agents are in control of their own conductor, meaning:
- Agent keypairs are co-located
- Agents can choose which hApps / DNAs are co-located on the same conductor
- All hApps running on a conductor belong to a single user who may have multiple keys
- The client and conductor are co-located
- Agents have access to Admin WebSocket actions

These assumptions are not true for Holo and this has architectural implications for hApp development.

### Holo architecture

![](https://hackmd.io/_uploads/ByfBfN9sh.png)

The diagram above shows the interconnections between different parts of the Holo Network. In particular, note that:
- Keys are on the client and conductor is on the host
- A user has no guarantee that two hApps will share the same conductor
- Multiple users may share the same conductor

### Client-conductor separation

In Holo hosting, the client and conductor are assumed to be both physically distinct and under the control of different agents. To enable and support this Holo provides an alternative to the `holochain/client` in the form of `@holo-host/web-sdk`.

Both the Holo WebSDK and the holochain/client provide implementations of `AppAgentClient` and therefore have a mostly unified interface. However, WebSDK instantiates a secure iFrame within the UI called Chaperone, which serves as a key signer and connection manager. Chaperone derives keys for users and handles all Holochain signing requests in the Holo context.

To use the WebSDK, instantiate it wherever you would normally instantiate holochain/client:

```typescript
import WebSdk from '@holo-host/web-sdk';

 const client: WebSdk = await WebSdk.connect({
    chaperoneUrl: 'https://chaperone.holo.hosting',
    authFormCustomization: {
      appName: 'example-happ',
    }
 })
```

WebSDK documentation can be found [here](https://github.com/Holo-Host/web-sdk#holo-hosting-web-sdk)

#### Sign-up, sign-in, sign-out

Users derive application-specific keys directly in Chaperone using their email and password. This is done directly in the iFrame provided by the Chaperone connection manager that the application developer can customise and must invoke somewhere in their user flow:

```typescript
client.signUp()
client.signIn()
```
Since AdminWebsocket functionality is handled via Envoy, Holo distinguishes between "Sign-up" and "Log-in" based on whether a cell needs to be installed for the user.

This also means that developers cannot assume that calls such as `.agent_info()` are immediately available at first.

Users should also have a means of clearing their keys from local storage using:
```typescript
client.signOut()
```

#### Handling connection state

Since the host conductor is remote, UIs need to handle different connection states appropriately. Chaperone makes connection state information available to the client via events that the UI can listen for and handle. Example:

```typescript
client.on('agent-state', (agent_state: AgentState) => {
    // Handle changes to agent state
});
```

This generally results in a UI with a much more async programming pattern, whereas native Holochain UIs tend to be use a more sync programming pattern.


### hApp paradigm

hApps are the fundamental unit within Holo. this means:

* A user will have unique agent keys for each hApp, even if multiple hApps share the same DNA
* For each user, all DNAs/cells within the same hApp will share the same keys
    * All cells for a hApp are guaranteed to be colocated on the same HoloPort
    * Cloned cells are treated as part of their parent hApp bundle and co-located
* hApps are deployed onto the Holo network by an agent of the Cloud Console app, who is the designated manager for the hApp
* hApp managers are responsible for deploying application updates and paying host invoices


### Multi-tenant conductor

Holo makes use of multi-tenant conductors to provide functionality typically expected of traditional web applications. Each conductor runs applications belonging to multiple users.

By default, Holo will run cells of deployed applications under each host's agent _in addition to any user cells_. These cells serve two purposes:

#### Providing high-uptime nodes

These nodes will send and receive gossip to sustain the network as long as hosts are online. They also ensure that when users connect to their host they already have the latest data available, since Holochain maintains a single local copy of a DHT for all cells of that DNA.

#### Serve data to anonymous users

For some use cases it is not desirable to require users to generate and sign with their keys. For example --- reading an article. Where developers make these use cases available to their users the data is retrieved and signed for by the read-only instance.

This behaviour is available by default. Once a WebSDK client has been instantiated and before a user derives their agentKeys, any zome calls will follow this pattern and have read access by default.

If you want to securely disable this functionality, you will need to implement a membership proof with read-only restrictions. As a less secure alternative, you can:
1. Setup your UI lifecycle to call the signUp/signIn form and ensure credentials are setup before requesting any data from the DHT
2. Ensure that `.signUp({cancellable: false})` or `.signIn({cancellable: false})` are configured.


#### Admin WebSocket acess

Due to the security implications of multi-tenant conductors, AdminWebsocket (and some AppWebsocket) functionality is not directly exposed to Holo clients. Instead, this functionality is exposed via Holo WebSDK methods where appropriate.


### Membership proofs

Holo strongly recommends membership proof implementations for production or long-running applications. However, as noted earlier Holo installs and runs cells of deployed applications under each host’s agent to provide high uptime DHT nodes and to serve data to anonymous users and Web2 participates who do not have keys.

Membership proofs that restrict this read-only access prevent Holo from providing such affordances for your hApp. This may be an acceptable trade-off or desired behaviour. However, If you want to benefit from always-on nodes and read-only access while having a membership proof, we you will need to configure your membership proof logic to allow "unpermissioned" read-only access like below:

```rust
pub fn is_read_only_proof(mem_proof: &MembraneProof) -> bool {
    let b = mem_proof.bytes();
    b == &[0]
}

pub fn validate_joining_code(
    progenitor_agent: AgentPubKey,
    author: AgentPubKey,
    membrane_proof: Option<MembraneProof>,
) -> ExternResult<ValidateCallbackResult> {
    match membrane_proof {
        Some(mem_proof) => {
            if is_read_only_proof(&mem_proof) {
                return Ok(ValidateCallbackResult::Valid);
            };
           // Other logic that checks you're non read_only memproof is valid
```


### Anonymous access
For an anonymous app to be able to make a zome call, you need to also create a cap token for that zome function (because the anonymous agent making the call will NOT be the read only agent)

```rust
pub fn set_cap_tokens() -> ExternResult<()> {
    let mut fn = BTreeSet::new();
    fns.insert((zome_info()?.name, "get_article".into()));
    fns.insert((zome_info()?.name, "get_all_articles".into()));

    let functions = GrantedFunctions::Listed(fns);
    create_cap_grant(CapGrantEntry {
        tag: "".into(),
        access: CapAccess::Unrestricted,
        functions,
    })?;
    Ok(())
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    set_cap_tokens()?;

    Ok(InitCallbackResult::Pass)
}
```

In general you should not list functions in the above code that *write* to the source chain, only that read from the source chain.

Finally, if you want to make sure that anonymous agents can't write to their own source chain, you should add the following protection to any function that writes to the source chain:

```rust
pub fn is_read_only_instance() -> bool {
    if let Ok(entries) = &query(ChainQueryFilter::new().action_type(ActionType::AgentValidationPkg))
    {
        if let Action::AgentValidationPkg(h) = entries[0].action() {
            if let Some(mem_proof) = &h.membrane_proof {
                if is_read_only_proof(&mem_proof) {
                    return true;
                }
            }
        }
    };
    false
}

// example zome functions

#[hdk_extern]
fn create_article(article: Article) -> ExternResult<()> {
    if is_read_only_instance() {
        return Err(MyError::ReadOnly.into());
    }
    Ok(_create_article(article)?)
}

#[hdk_extern]
fn update_article(article: Article) -> ExternResult<()> {
    if is_read_only_instance() {
        return Err(MyError::ReadOnly.into());
    }
    Ok(_update_article(article)?)
}
```

For an example implementation see [this zome library](https://github.com/holochain/hc-zome-lib/blob/6eb45e60ce371ea51e163e19a80c520b261e9cd4/zomes/hc_iz_membrane_manager/src/validation.rs#L26)


