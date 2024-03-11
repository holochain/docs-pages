---
title: Enable Apps for Holo Hosting
---

!!! info Requires Holochain 0.2
The Holo hosting network runs the unstable Holochain 0.2 on all its nodes, so you'll need to make sure that your hApp is compatible with 0.2. The scaffolding tool commands in this guide will set up the proper dependencies for you. If you're starting with an existing hApp or have used the scaffolding tool commands in the [Get Started guide](/get-started/), you'll need to upgrade your hApp manually.
!!!

## Intro

Holo is cloud hosting for Holochain. Holo helps you enable your users to experience your Holochain application with the simplicity of a web browser and without maintaining a node.

A core distinction versus running nodes on the traditional cloud is that Holo provides the key management and signing infrastructure for users' keys to be held client-side, so your users always have full agency.

## Get started

Holo hosting is for Holochain applications. It is assumed that you have familiarity with Holochain and have installed the pre-requisites from step 2 of the [Get Started guide](/get-started/).

There are two pathways in this section --- scaffolding a new hApp or migrating an existing hApp. Both pathways contain largely the same information, so choose the pathway that best applies to your situation.

In both cases there are no required DNA changes for Holo Hosting --- only UI changes. However, Holo operates under a different context and we highly recommend that you read the [Holo Core Concepts](#holo-core-concepts-and-further-documentation), in particular the section on anonymous access, as this **will need DNA changes to enable certain features**.

## Get started from scaffolding tool

In this section we'll create a simple to-do app. Our commentary will focus on the UI differences compared to a pure Holochain context. If you need more information about creating a DNA, please refer to the [Holochain getting started guide](/get-started/#4-zero-to-built-creating-a-forum-app)

The Holochain scaffolding tool provides a `--holo` flag for scaffolding a hApp whose UI is compatible with both Holo hosting and pure Holochain environments. Additionally, because the Holo hosting infrastructure currently runs the unstable Holochain 0.2, you'll need to override the Holochain version that the scaffolding tool targets. Run the tool **with these flags** by typing in your terminal:

```shellsession
nix run --override-input versions 'github:holochain/holochain?dir=versions/0_2'  github:holochain/holochain#hc-scaffold -- web-app --holo
```

You should then see:

::: output-block
```text
? App name (no whitespaces):
```
:::

Type your hApp's name using snake_case:

```text
super_todos
```

You should then see:

::: output-block
```text
? Choose UI framework: ›
❯ Vue
  Svelte
  Lit
```
:::

Use the arrow keys to select a UI framework for your front-end and then press <kbd>Enter</kbd>. For this example choose `Vue`. You should then see:

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

Now enter the nix development shell (which makes all scaffolding tools as well as the Holochain binaries directly available from the command line) with:

```shellsession
nix develop
```

After it's finished downloading some packages, you should see:

::: output-block
```text
Holochain development shell spawned. Type exit to leave.
```
:::

Finally, install the `npm` dependencies with:

```shellsession
npm install
```

### UI

The biggest difference between a Holo application and a pure Holochain application is in the UI. The scaffolding tool should automatically have generated everything required here, so we'll simply point out the primary differences, which will all be in `App.vue`.

In a Holo setting we use the [`@holo-host/web-sdk`](https://www.npmjs.com/package/@holo-host/web-sdk) library instead of `@holochain/client`. WebSDK provides an instance of `AppAgentWebsocket`, which is almost the same as `AppWebsocket`.

```typescript
import WebSdk from '@holo-host/web-sdk';
import type { AgentState } from '@holo-host/web-sdk';
```

Holo hApps provide an authentication form for users to generate in-browser keys and install [cells](/references/glossary/#cell) on the network. This form is customizable --- here we set the name of the app.

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

Now let's continue scaffolding our happ by creating a new DNA using the scaffolding tool, which is now directly available in the shell. Type:

```shellsession
hc scaffold dna
```

You should then see:

::: output-block
```text
? DNA name (snake_case):
```
:::

Many hApps have just one DNA, so in this case you can just type:

```text
todos
```

You should then see:

::: output-block
```text
DNA "todos" scaffolded!
```
:::

DNAs are [comprised of code modules](/concepts/2_application_architecture/), which we call zomes. A DNA should have at least two zomes, an *integrity zome* which declares the data structures and validation code, and a *coordinator zome* which contains, among other things, the API functions your UI will call to access your DNA.

Create your DNA's first pair of zomes with:

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

Press <kbd>Enter</kbd> to select `Integrity/coordinator zome-pair`. You should then see:

::: output-block
```text
? Enter coordinator zome name (snake_case):
 (The integrity zome will automatically be named '{name of coordinator zome}_integrity')
```
:::

Type in a name for the zome. In this case you can just use the same name as the DNA, `todos`. You should then see:

```shellsession
? Scaffold integrity zome in folder "dnas/todos/zomes/integrity/"? (y/n) ›
```

Press <kbd>Y</kbd> (this option is for advanced users who may have set up a different folder structure). You should then see:

::: output-block
```text
Integrity zome "todo_integrity" scaffolded!
? Scaffold coordinator zome in "dnas/todos/zomes/coordinator/"? (y/n) ›
```
:::

Press <kbd>Y</kbd> again.

You will then see `Coordinator zome "todos" scaffolded!` along with output from the initial downloading and setting up of the Holochain Rust HDK, followed by instructions for adding your first entry type.

Now we get to the really exciting part! In the next steps you will specify your data model, and the scaffolding tool will automatically add both zome and UI code to your hApp.

In this to-do hApp, every to-do item is stored as an [entry](/references/glossary/#entry). Add a new entry definition with:

```shellsession
  hc scaffold entry-type
```

You should see:

```shellsession
✔ Entry type name (snake_case): ·
```

Enter the name:

```text
todo_item
```

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

The scaffolding tool is smart about adding different data type fields to your entry. For this example, you will just have a text field describing the to-do item. Press <kbd>Enter</kbd> to select `String`.

You should see:

::: output-block
```text
? Field name: ›
```
:::

Enter the name `description`. You should then see:

::: output-block
```text
? Should this field be visible in the UI? (y/n) ›
```
:::

Press <kbd>Y</kbd>. You should then see:

::: output-block
```text
? Choose widget to render this field: ›
❯ TextArea
  TextField
```
:::

Press <kbd>Enter</kbd> to choose a `TextArea` because you want multi-line to-dos. You should then see:

::: output-block
```text
? Add another field to the entry? (y/n) ›
```
:::

Press <kbd>N</kbd>. You should then see:

::: output-block
```text
? Which CRUD functions should be scaffolded (SPACE to select/unselect, ENTER to continue)? ›
✔ Update
✔ Delete
```
:::

The scaffolding tool can add coordinator zome functions and front-end code for updating and deleting entries. In the case of our to-do app we want to be able to do both, which is the default, so just press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
? Should a link from the original entry be created when this entry is updated? ›
❯ Yes (more storage cost but better read performance, recommended)
  No (less storage cost but worse read performance)
```
:::

Because Holochain stores data in append-only [source chains](/concepts/3_source_chain/), updating requires choosing a strategy of how to find updated data. The scaffolding tool allows you to choose between two strategies, one where updates are only linked to the _previous_ version, and one where an extra link is also added to the _original_ entry for each update. For this use case either strategy would work fine, so press <kbd>Enter</kbd> to choose the default. You should then see:

::: output-block
```text
Entry type "todo_item" scaffolded!
```
:::

The final step is create a collection that can be used to retrieve all of the to-do items that users create. To create a collection, type:

```shellsession
hc scaffold collection
```

You should then see:

::: output-block
```text
Collection name (snake_case, eg. "all_posts"): ›
```
:::

Enter `my_todos` and press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
? Which type of collection should be scaffolded? ›
❯ Global (get all entries of the selected entry types)
  By author (get entries of the selected entry types that a given author has created)
```
:::

Use the arrow key to select `By author` and press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
? Which entry type should be collected? ›
❯ TodoItem
```
:::

Press <kbd>Enter</kbd>. You should then see:

::: output-block
```text
Collection "my_todos" scaffolded!
```
:::

### Testing

Holo provides the `holo-dev-server` binary, which simulates the Holo network locally for development. `holo-dev-server` spins up a Holochain conductor, along with a local instance of the Chaperone service, which delivers a JavaScript file that connects the browser to the Holo network. Like the real Holo network, `holo-dev-server` uses `.happ` bundles, which do not include a UI. (The `hc` developer tool creates both a `.happ` bundle and a `.webhapp` bundle in the `workdir/` folder for you.) When you scaffold an app with the `--holo` flag, its dev environment will provide `holo-dev-server` on the command line for you.

1. Ensure you are in the nix development environment by checking the shell prompt. Run `nix develop` in the root of your project's folder if you aren't.
2. Run `npm start:holo`, which:
    1. Starts `holo-dev-server' and provisions instances (cells) of your DNA for two agents,
    2. Automatically opens an instance of a cell and network inspector called [Holochain Playground](https://github.com/darksoil-studio/holochain-playground) in your browser, and
    3. Runs a local dev web server for the UI called [Vite](https://vitejs.dev).
3. Access your two agents on your browser at `http://localhost:8888` and `http://localhost:8889`.

The windows should not be very exciting yet, because you haven't edited the hApp to use the generated UI elements, but what you see on the screen should be some hints on how to proceed.

So let's follow those hints. Switch to a code editor for these steps:

1. Open the Vue file `ui/src/App.vue` and add two imports near the top, just below `<script lang="ts">`:

    ```typescript
    import MyTodos from './todos/todos/MyTodos.vue';
    import CreateTodoItem from './todos/todos/CreateTodoItem.vue';
    ```

2. Replace the "EDIT ME" text further down with:

    ```html
    <CreateTodoItem></CreateTodoItem>
    <MyTodos author={client.myPubKey}></MyTodos>
    ```

Save the file, and you should see that the windows have auto-updated to show something that should look like this:

![Two web browser windows showing basic widgets to manipulate the shared to-do list](/assets/img/enable-holo/scaffolded-todos.png)

You now have a fully functional Holo app up and running!

## Migrate from a pure Holochain app

Only minor UI changes are technically required for Holo hosting. However, Holo operates under a different set of assumptions and we highly recommend that you read the [Holo Core Concepts](#holo-core-concepts-and-further-documentation) section of this guide. It is likely that you will want to reconsider certain UX flows.

This example will use an example forum hApp with a Vue-based UI, but feel free to follow along with your own hApp instead. Remember that your hApp needs to target Holochain 0.2 in order to run on the Holo network, so you might need to follow the [0.1 → 0.2 migration guide](/get-started/upgrade-holochain/) first.

```shellsession
nix run --override-input versions 'github:holochain/holochain?dir=versions/0_2'  github:holochain/holochain#hc-scaffold -- example forum
```

In the forum hApp, the relevant UI code is in `App.vue`. Generally they will likely be where you initialize your `AppWebsocket` client.

In a Holo setting we use [`@holo-host/web-sdk`](https://www.npmjs.com/package/@holo-host/web-sdk) which provides an instance of `WebSDK`, instead of `AppAgentWebsocket` from `@holochain/client`. Both `WebSDK` and `AppAgentWebsocket` implement `AppAgentClient`, which connects the user to their running cells in a conductor.

You'll first need to ensure that you use `WebSDK` or `AppAgentWebsocket` depending on the context:

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
    // ...
  }
```

You can then initialize a context-dependent client, assuming you want your UI to be compatible with both Holo and Holochain. Let's edit the body of the `data()` function above to check for an environment variable that you'll pass at build time:

```typescript
  data(): {
    client: AppAgentClient | undefined;
    loading: boolean;
    IS_HOLO: boolean;
  } {
    return {
      client: undefined,
      loading: true,
      IS_HOLO: ['true', '1', 't'].includes(import.meta.env.VITE_APP_IS_HOLO?.toLowerCase()), // This will be passed later as an env variable
    };
  },
```

The WebSDK client loads and connects to an iframe called Chaperone. Chaperone is a key and connection manager to the Holo network and is invisible outside a few specific cases. Let's initialize this client in the Vue `mounted()` lifecycle hook.

Because the Holo network acts like a remote conductor, you'll need to handle connectivity issues. Changes to the connection are emitted and you can register a event handlers if the client is an instance of WebSDK. You can see the full list of emitted events here: https://github.com/Holo-Host/web-sdk

```typescript
  async mounted() {
    if (this.IS_HOLO) {
      const client: WebSdk = await WebSdk.connect({
        chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL, // This will also be passed as an env variable; we'll explain this in the testing section
        authFormCustomization: {
          appName: 'forum-app', // Display name on the credentials form. You can also set it in Cloud Console when deploying, which overrides this value
        }
      });

      // register event handler for agent-state.
      client.on('agent-state', (agent_state: AgentState) => {
        this.loading = !agent_state.isAvailable
      });

      this.client = client
    } else {
      this.client = await AppAgentWebsocket.connect('', 'vue-default');
      this.loading = false;
    }
}
```

Now your UI can connect to the Holo network and read forum posts. However, users can't post or comment yet because they don't yet have a source chain. They are considered "anonymous" and can only request public data from the network.

!!! note
Unlike in pure Holochain, you **cannot assume that a user has provided their keys** when the connection is established, because Holo hosting allows anonymous access to hApp data that's meant to be seen publicly, such as forum posts. This may require changes to your application logic. Read more about how to implement this feature in the [Holo core concepts](#holo-core-concepts-and-further-documentation) section of this guide.
!!!

Holo uses "sign-up" and "sign-in" terminology but there is no external authentication process. In both processes a user (re)derives their keys from email and password, with sign-up also triggering the instantiation of new hApp cells on a hosting device in the Holo network.

So let's add sign-up and sign-in functionality to the app. Again, in the forum example the relevant code is in `App.vue`.

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

These trigger the display of a full-screen credentials modal from the Chaperone iframe, defaulting to either a sign-up or sign-in form. The user can also toggle between them directly.

![An example of the Chaperone sign-up/sign-in modal form](/assets/img/enable-holo/signup-signin-modal.png)

During sign-up a registration code field can be shown to enable [**membrane proof**](/references/glossary/#membrane-proof) workflows. This field allows the user to submit some sort of joining code on signup. Read more about membrane proofs in the [Holo Core Concepts](#implementing-read-only-cells) section of this guide.

Finally, we will also need sign-out functionality to clear user keys from local storage.

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

Now you're ready to build and test!

### Building and testing

Holo provides the `holo-dev-server` binary, which simulates the Holo network locally for development. `holo-dev-server` serves a copy of Chaperone, the JavaScript library that connects the browser to the Holo network and manages user keys, and runs a Holochain conductor. Like the real Holo network, `holo-dev-server` uses `.happ` bundles, which do not include a UI. (The `hc` developer tool creates both a `.happ` bundle and a `.webhapp` bundle for you.)

To include `holo-dev-server` in your development environment, update your project's `flake.nix` file to the below, and re-enter the shell:

```nix
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

To connect your application to `holo-dev-server`, point the client's `chaperoneUrl` to `https://localhost:24274`.

```typescript
const client: WebSdk = await WebSdk.connect({
  chaperoneUrl: import.meta.env.VITE_APP_CHAPERONE_URL, // We'll explain this in the testing section
  authFormCustomization: {
    appName: 'forum-app', // Display name on the credentials form. You can also set it in Cloud Console when deploying
  }
});
```

Let's add some build and test scripts to your project's `package.json` file. You should already have scripts to build a `.hApp` file, like below.

```json
  "scripts": {
    // ...
    "build:happ": "npm run build:zomes && hc app pack workdir --recursive",
    "build:zomes": "RUSTFLAGS='' CARGO_TARGET_DIR=target cargo build --release --target wasm32-unknown-unknown"
  },
```

Let's add the following scripts to the top of the `"scripts"` object. These will:

1. Build your `.happ` file,
2. Run `holo-dev-server` with your `.happ` file,
3. Run the `holochain-playground` at `localhost:4444`, and
4. Start the UI at `localhost:8888`.

Take note of the `"network:holo"` script; it's what passes the `VITE_APP_CHAPERONE_URL` and `VITE_APP_IS_HOLO` environment variables to your UI so that it knows to connect to Holo, and specifically to a local `holo_dev_server`.

```json
    "start:holo": "AGENTS=2 npm run network:holo",
    "network:holo": "npm run build:happ && UI_PORT=8888 concurrently \"npm run launch:holo-dev-server\" \"holochain-playground ws://localhost:4444\" \"concurrently-repeat 'VITE_APP_CHAPERONE_URL=http://localhost:24274 VITE_APP_IS_HOLO=true npm start -w ui' $AGENTS\"",
    "launch:holo-dev-server": "sudo ./holo-dev-server workdir/test-app.happ",
```

These scripts assume that you have a `start` script setup in a `ui` workspace, which you should have if you created the hApp using our scaffolding tool.

You now have a fully functional Holo app up and running!

!!! info
For production deployment, make sure that `chaperoneUrl` is configured to `https://chaperone.holo.hosting` instead.
!!!

## Deploy

This process assumes you already have a Cloud Console account. If you do not, you can sign up at https://register.holo.host

### Deploy UI

Holo does not currently offer UI hosting. hApp managers will need to deploy their UI separately for now.

!!! info
Holo supports "headless hosting" where there is no Holo-enabled UI. In this case Holo will maintain copies of the [DHT](/references/glossary/#distributed-hash-table-dht), but will not hold any source chains. Holo hosting requires a special [membrane proof](#implementing-read-only-cells) for read-only host agents in order to make this work.

Holo does not support direct programmatic/API access to deployed hApps.
!!!

### Deploy hApp to Holo network

1. Log into Cloud Console.
2. Click on "Add a hApp".
3. Fill out hApp details:
    * "Link to hApp file" must point to a publicly accessible `.happ` file.
    * (Optional) "URL of hosted UI" is the URL which your users will access your UI from.
    * (Optional) Configuration of memproof/registration code.
4. Click "Deploy".
5. Wait for deployment to take effect. It may take up to 30 minutes.

## Holo core concepts and further documentation

Holochain assumes that agents are in control of their own conductor, meaning:

* Agent key pairs are located on the same machine as their data and hApp instance, which is typically a computer they own.
* Agents can choose which hApps / DNAs are co-located on the same conductor.
* All hApps running on a conductor belong to a single user who may have multiple keys.
* The client and conductor are located on the same machine.
* Agents have access to the conductor's [admin API WebSocket](https://docs.rs/holochain_conductor_api/latest/holochain_conductor_api/enum.AdminRequest.html).

These assumptions are not true for Holo, and this has architectural implications for hApp development.

### Holo architecture

![The Holo hosting network. A typical HoloPort hosting device sits at the middle, bridging a peer-to-peer network of Holochain app participants (including other Holo hosting devices) to a user's web browser via an intermediary infrastructure consisting of a matchmaking service, a user-to-host resolver service, a traffic proxy, and a privileged iframe containing Chaperone in the user's browser.](/assets/img/enable-holo/holo-hosting-infrastructure.png)

The diagram above shows the interconnections between different parts of the Holo network. In particular, note that:

* Keys are on the client, and conductor is on the host.
* A user has no guarantee that any two hApps hosted for them will share the same conductor.
* Multiple users may share the same conductor.

### Client-conductor separation

In Holo hosting, the client and conductor are assumed to be both physically distinct and under the control of different agents. To enable and support this, Holo provides an alternative to the [`@holochain/client`](https://www.npmjs.com/package/@holochain/client) library in the form of [`@holo-host/web-sdk`](https://www.npmjs.com/package/@holo-host/web-sdk).

Both the Holo WebSDK and `@holochain/client` provide implementations of `AppAgentClient`, which allows a user to connect to their cells in a conductor (whether those cells live on their own device or a Holo hosting device), and therefore have a mostly unified interface. However, WebSDK instantiates a secure iframe within the UI called Chaperone, which serves as a key signer and connection manager. Chaperone derives keys for users and handles all Holochain signing requests in the Holo context, without sending any key material back to the Holo network.

To use the WebSDK, import and instantiate it wherever you would normally import and instantiate `@holochain/client`:

```typescript
import WebSdk from '@holo-host/web-sdk';

const client: WebSdk = await WebSdk.connect({
  // You will want a way to override the default Chaperone URL for local testing.
  // Many front-end dev tools allow you to pass environment variables
  // which are then made available to the built script.
  // The Vite dev server, for instance, makes them available in a global object
  // called `import.meta.env`.
  chaperoneUrl: import.meta.env.LOCAL_DEV_SERVER_URL || 'https://chaperone.holo.hosting',
  authFormCustomization: {
    appName: 'example-happ',
  }
});
```

WebSDK documentation can be found [here](https://github.com/Holo-Host/web-sdk#holo-hosting-web-sdk)

#### Sign-up, sign-in, sign-out

Users derive application-specific keys directly in Chaperone using their email and password. This is done directly in the iframe provided by the Chaperone connection manager, which the application developer can customize and must invoke somewhere in their user flow:

```typescript
client.signUp();
client.signIn();
```

Since `AdminWebsocket` functionality is handled via Envoy, a service running on Holo hosts that handles the provisioning of hApps, Holo decides whether to show a "sign-up" or "log-in" form based on whether a cell needs to be provisioned for the user.

This also means that developers cannot assume that calls such as `.agent_info()` are immediately available at first.

Users should also have a means of clearing their keys from local storage using:

```typescript
client.signOut();
```

#### Handling connection state

Since the host conductor is remote, UIs need to handle different connection states appropriately. Chaperone makes connection state information available to the client via events that the UI can listen for and handle. Example:

```typescript
client.on('agent-state', (agent_state: AgentState) => {
  // Handle changes to agent state
});
```

This generally results in a UI with a much more asynchronous programming pattern, whereas native Holochain UIs tend to be use a more synchronous programming pattern.

### hApp paradigm

hApps are the fundamental unit within Holo. This means:

* A user will have unique agent keys for each hApp, even if multiple hApps share the same DNA.
* For each user, all DNAs/cells within the same hApp will share the same keys.
    * All cells for a hApp are guaranteed to be co-located on the same Holo host.
    * Cloned cells are treated as part of their parent hApp bundle and are thusly also co-located with the other cells in the hApp.
* hApps are deployed onto the Holo network by an agent of the Cloud Console app, who is the designated manager for the hApp.
* hApp managers are responsible for deploying application updates and paying host invoices.

### Multi-tenant conductor

Holo makes use of multi-tenant conductors to provide functionality typically expected of traditional web applications. Each conductor runs applications belonging to multiple users.

If the application allows it, Holo will run **read-only cells** of deployed applications **under each host's agent** in addition to any user cells. These cells serve two purposes:

#### Providing high-uptime nodes

These nodes will send and receive gossip to sustain the network as long as hosts are online. They also ensure that when users connect to their host they already have the latest data available, since Holochain maintains a single local copy of a DHT for all cells of that DNA.

#### Serving data to anonymous users

For some use cases, it's not desirable to require users to create an account, for example, reading an article. Where developers make these use cases available to their users, the data is retrieved by a read-only cell.

This behavior isn't available by default; you'll have to implement functionality to both give anonymous users access to read-only functions and prevent them from making writes. This is described in the [next section](#implementing-read-only-cells).

### A note on admin API WebSocket access

Due to the security implications of multi-tenant conductors, `AdminWebsocket` (and some `AppWebsocket`) functionality is not directly exposed to Holo clients. Instead, this functionality is exposed indirectly via Holo WebSDK methods where appropriate.

### Implementing read-only cells

In order to provide high-uptime nodes and anonymous hosted user access via read-only cells while keeping your hApp safe from defacement, you'll need to restrict what a read-only cell can do. A read-only cell is **read-only merely by convention**; that is, because you're checking for read-only cells and handling writes differently.

The most secure way to restrict access to a hApp's data is with [**membrane proofs**](/references/glossary/#membrane-proof). A membrane proof is supplied at installation time and acts like an ID card, allowing the hApp to admit valid members only. However, this prevents Holo hosting devices from provisioning read-only cells unless explicit affordances are made.

The Holo Network expects and uses a zero-byte membrane proof for read-only cells. A publicly known membrane proof without restriction is essentially the same as no membrane proof. To implement logic to allow read-only cells to join a DNA's network but not write data, your integrity zome's validation function should check the author's membrane proof, then allow them to join the network but reject CRUD operations if the proof is zero bytes.

(Note that, in the future, the production Holo hosting network may permit you to implement logic that provisions membrane proofs to read-only nodes, allowing you to use Holo for high-uptime while preventing anonymous read access.)

The following code shows an example of how to do both of these things. This isn't necessarily the most performant solution, as it requires a validator to retrieve the author's entire source chain (excluding entry data). A better-performing solution might rely on [inductive validation](/references/glossary/#inductive-validation) of the author's source chain.

```rust
/// A helper function to check whether a membrane proof is from a special Holo-
/// hosted read-only agent.
fn is_read_only_membrane_proof(membrane_proof: &Option<MembraneProof>) -> bool {
    match membrane_proof {
        // A membrane proof can either be:
        //
        // 1. some app-specific bytes,
        // 2. zero bytes (Holo read-only instance), or
        // 3. `None` (no membrane proof supplied)
        //
        // In this example, we're treating 2 and 3 the same.
        // In your app, you may want to treat 3 differently.
        Some(p) => p.bytes() == &[0],
        None => true
    }
}

/// A helper function to validate a membrane proof. You can use this in both
/// your `genesis_self_check` and `validate` functions.
fn validate_membrane_proof(membrane_proof: &Option<MembraneProof>) -> ExternResult<ValidateCallbackResult> {
    // Read-only membrane proofs are always permitted.
    if is_read_only_membrane_proof(membrane_proof) {
        return Ok(ValidateCallbackResult::Valid);
    }

    // Your custom membrane proof validation should go here.
}

/// A helper function to check whether an op should be allowed. In the sample
/// `validate` function, it's used for both entry and link CRUD actions.
fn has_permission_to_write(op: &Op) -> Result<bool, WasmError> {
    let action_type = op.action_type();

    // All non-CRUD actions should be allowed.
    if let ActionType::Dna | ActionType::AgentValidationPkg | ActionType::InitZomesComplete | ActionType::OpenChain | ActionType::CloseChain = action_type {
        return Ok(true);
    }

    // In general, all CRUD actions for a read-only node should be invalid.
    // The only ones that _must_ be valid are actions that create (but don't
    // update) special system entries:
    //
    // * `AgentPubKey`
    // * `CapGrant`
    // * `CapClaim` (optional)
    //
    // When allowing cap grants, we're unable to check whether the grant should
    // be allowed -- that has to happen in the coordinator zome.
    if let ActionType::Create = action_type {
        match op.entry_data().map(|d| d.1) {
            Some(EntryType::AgentPubKey | EntryType::CapClaim | EntryType::CapGrant) => {
                return Ok(true);
            },
            Some(_) => { },
            None => {
                // This should be an impossible condition, as an op produced
                // from a `Create` action should always know its entry type.
                return Err(wasm_error!("Undefined behavior; entry type missing from Create action"));
            }
        }
    }
    // Your app may also want to allow certain CRUD actions for public or
    // private app data, such as anonymous page view counters for blog posts, or
    // updates/deletes on system actions. Keep in mind the risk of anonymous
    // spamming though!

    // We don't always look at the membrane proof, because that would cause too
    // much network traffic and processing as source chains grew larger.
    // Instead, we use 'inductive' validation, in which we assume that, if
    // there's a prior CRUD action on the chain and another validator has marked
    // it as valid, it's because that validator has also applied these same
    // rules. A sequence of such checks eventually leads back to a check on the
    // membrane proof.

    // Walk back through the source chain until we find something interesting --
    // either a CRUD action or a membrane proof.
    let mut prior_action_hash = op.prev_action().map(|h| h.clone());

    // Most read-only apps will want to do a few writes to set up state at app
    // initialization time. These writes happen in each zome's `init` function,
    // if defined, and if all inits succeed, an `InitZomesComplete` action is
    // written to the chain. So we need to keep track of whether the op
    // currently being validated comes before or after that point.
    let mut init_zomes_complete_found = false;

    while let Some(ref hash) = prior_action_hash {
        let record = must_get_valid_record(hash.clone())?;
        let action = record.action();
        let entry_type = action.entry_type();
        match (action, entry_type) {
            (Action::CreateLink(_), _)
            | (Action::DeleteLink(_), _)
            | (Action::Create(_), Some(EntryType::App(_)))
            | (Action::Update(_), Some(EntryType::App(_)))
            | (Action::Delete(_), _) => {
                if !init_zomes_complete_found {
                    // If we've found a prior app CRUD action without seeing the
                    // `InitZomesComplete` action, it's either because it
                    // happened after that point or because both it and the op
                    // being validated happened within `init`. Either way, the
                    // prior CRUD action was valid so this must be too.
                    return Ok(true);
                }

                // If, however, we have seen the `InitZomesComplete` action,
                // the op being validated happened after `init` but the prior
                // action we're currently inspecting happened within `init`.
                // Skip this and all prior CRUD actions, and keep looking until
                // we find the membrane proof.
            }
            (Action::AgentValidationPkg(action_data), _) => {
                // No prior CRUD actions were found, excepting possible ones
                // done within `init` which we skipped if we're validating an
                // op produced after `init`. Allow all ops produced before
                // `init`, and subject all ops produced after `init` to the
                // read-only membrane proof check.
                return Ok(!init_zomes_complete_found || !is_read_only_membrane_proof(&action_data.membrane_proof));
            }
            (Action::InitZomesComplete(_), _) => {
                // Keep track of the fact that we've seen this action, which
                // means the currently validated op should be subject to a
                // read-only membrane proof check, but keep going backwards
                // until we hit the
                init_zomes_complete_found = true;
            }
            (a, _) => {
                // Prior action was neither CRUD nor membrane proof; walk
                // further along the source chain.
                prior_action_hash = a.prev_action().map(|h| h.clone());
            }
        }
    }

    Err(wasm_error!("Undefined behavior; could not find agent validation package"))
}

#[hdk_extern]
pub fn genesis_self_check(
    data: GenesisSelfCheckData,
) -> ExternResult<ValidateCallbackResult> {
    validate_membrane_proof(&data.membrane_proof)
}

#[hdk_extern]
pub fn validate(op: Op) -> ExternResult<ValidateCallbackResult> {
    // Here the membrane proof itself is being validated.
    // The AgentValidationPkg action produces two different ops that
    // contain a membrane proof; let's check both of them.
    if let Some(Action::AgentValidationPkg(action)) = match &op {
        Op::StoreRecord(store_record) => Some(store_record.record.signed_action.hashed.content.clone()),
        Op::RegisterAgentActivity(register_agent_activity) => Some(register_agent_activity.action.hashed.content.clone()),
        _ => None
    } {
        return validate_membrane_proof(&action.membrane_proof);
    }

    // Now we validate write permissions on the op.
    if let false = has_permission_to_write(&op)? {
        return Ok(ValidateCallbackResult::Invalid("Read-only instance can't write CRUD data".to_string()));
    }

    // ... Put the rest of your validation code here.
}
```

#### Anonymous zome function access

Every function call to a coordinator zome must be signed, and a call will only be successful if there's a [capability grant](/references/glossary/#capability-grant) for it. Capability grants can be unrestricted, or they can be restricted to a particular capability token or public key.

Normally, when a Holo agent is logged in, or the user is running the hApp on their own machine, the key pair used to sign function calls is the same as the key pair used to author data in the cell. This is called the [author grant](/concepts/8_calls_capabilities/#author-grant), and it's automatically privileged to call every function. For an anonymous agent accessing a read-only instance, however, this is not true. For them to be able to make a function call, you need to also create an unrestricted capability grant for that function.

```rust
fn set_read_only_cap_tokens() -> ExternResult<()> {
    let mut fn = BTreeSet::new();
    fns.insert((zome_info()?.name, "get_article".into()));
    fns.insert((zome_info()?.name, "get_all_articles".into()));

    let functions = GrantedFunctions::Listed(fns);
    create_cap_grant(CapGrantEntry {
        tag: "read-only access".into(),
        access: CapAccess::Unrestricted,
        functions,
    })?;
    Ok(())
}

#[hdk_extern]
fn init(_: ()) -> ExternResult<InitCallbackResult> {
    set_read_only_cap_tokens()?;

    Ok(InitCallbackResult::Pass)
}
```

In general, you should not list functions in the above grant that write new capability grants to the read-only instance's chain, to prevent an attacker from expanding their privileges. And depending on your app, it's probably also good practice to limit access to functions that don't write to the source chain but can still be disruptive, such as [calling other cells](/concepts/8_calls_capabilities/) or [sending signals](/concepts/9_signals/).

Note that these protections implemented in a coordinator zome also do not prevent reads by people who run the hApp on their own devices and supply a zero-byte membrane proof. When you implement the read-only pattern, you're making a conscious choice to make the DHT public for reading while restricting who can write to it.

## Next steps

Now that you've prepared your hApp for Holo, it's time to deploy it. Learn how to [publish your hApp on the Holo hosting network](/references/publish-app-on-holo/).