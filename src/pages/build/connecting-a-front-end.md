---
title: "Connecting a Front End"
---

::: intro
Front ends connect to a hApp via the **application API** over a local [WebSocket](https://en.wikipedia.org/wiki/WebSocket) interface. They can call [**zome functions**](/build/zome-functions/) and listen to [**signals**](/build/signals/), and can also do some app management tasks like [**cloning**](/build/cloning) a cell and getting info about the hApp.
:::

## Where a front end runs

The most important thing to remember about a hApp is that it runs in the Holochain conductor **on each of the devices of the agents themselves**, whether those agents are humans, bots, or headless services. Holochain itself is just an engine for a hApp's back end, so it exposes the hApp's API (its zome functions) and lets front ends connect to the hApp via a WebSocket interface.

This interface is **only exposed to processes on the local device**, not to external network adapters. This helps prevent unauthorized agents from accessing the hApp. It also means the front end must be distributed with the hApp and a Holochain runtime.

Some Holochain runtimes bundle the conductor and a front end host that serves your HTML/JavaScript-based runtimes. Take a look at the [Packaging and Distribution](/get-started/4-packaging-and-distribution/) page from the Get Started guide for the choices.

The Holonix dev environment comes with a runtime called `hc-launch`, which starts Holochain, installs your hApp, and displays a UI for you. The scaffolding tool generates an NPM script that compiles and bundles your back end into a [`.happ` file](/build/happs/#package-a-happ-for-distribution) and starts two instances of the hApp with `hc-launch`. In the root of your project folder, enter:

```bash
npm run start
```

(If you're using a different package manager, change this command to suit.)

## Front-end libraries

Holochain provides front-end client libraries for [JavaScript](https://github.com/holochain/holochain-client-js) and [Rust](https://github.com/holochain/holochain/tree/main/crates/client). The scaffolding tool generates JavaScript-based UIs that are meant to be served as a single-page app, so we'll focus on JavaScript for this documentation --- or more specifically TypeScript, because that's what the client library is written in.

## Connect to a hApp with the JavaScript client {#connect-to-a-happ-with-the-javascript-client}

You connect to the application API with the client's [`AppWebsocket.connect`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.connect.md) method, which returns a <code>Promise&lt;[AppWebsocket](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.md)&gt;</code>.

If you've been using the scaffolding tool with the UI option, all the code to establish a connection to a hApp is already written for you. You can get it to build reasonable bootstrap code for Lit, React, Svelte, and Vue that makes the client available to child components once it's connected to a hApp.

But for now, we're going to give you a simple TypeScript example, inspired by the `ui/index.html` file from a hApp scaffolded with the `vanilla` UI option. We'll call on the function in all the following examples, so that we don't have to create a connection every time.

```typescript
import { AppWebsocket, HolochainError } from '@holochain/client';

const getHolochainClient = (() => {
    let client: AppWebsocket | undefined;

    return async () => {
        if (client === undefined) {
            client = await AppWebsocket.connect();
            console.log("Connected to Holochain! hApp ID is ${client.installedAppId}");
        }
        return client;
    };
})();

getHolochainClient().catch((error: HolochainError) => console.error(`Connection failure, name ${error.name}, message ${error.message}`));
```

You'll notice that you don't have to pass a connection URI to the client. That's because, at time of writing, all Holochain runtimes that serve a web-based UI will inject a constant into the page that contains the URI, and the client will look for that value. So the scaffolding tool expects you'll be distributing your hApp with one of these runtimes. Check out the [`AppWebsocket.connect` documentation](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.connect.md) if you're building a front end that runs separately from a Holochain runtime.

## Reference

* [`AppWebsocket`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.md)
* [`AppWebsocket.connect`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.connect.md)

## Further reading

* [Core Concepts: Application Architecture](/concepts/2_application_architecture/)