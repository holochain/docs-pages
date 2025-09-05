---
title: "Testing with Tryorama"
---

::: intro
[**Tryorama**](https://github.com/holochain/tryorama) is a JavaScript-based library for testing your [hApps](/build/happs/). It lets you write scenarios that direct the conductor to install hApps, provision [cells](/concepts/2_application_architecture/#cell) for single or multiple agents, and call their [coordinator zome](/build/zomes/#coordinator) [functions](/build/zome-functions/).
:::

## Getting Tryorama

If you've used the scaffolding tool to create a hApp, a Tryorama test package has already been generated for you. You can find it in your project's `tests/` folder.

Alternatively, you can add Tryorama to a JavaScript package using:

```bash
npm install --save-dev @holochain/tryorama
```

## Running a test

A Tryorama test is meant to be run in [Node.js](https://nodejs.org/). If you're working on a scaffolded hApp, all you need to do is enter your project's Holonix dev environment, install the necessary dependencies, and run the test command:

```bash
cd Holochain/movies
```
```bash
nix develop
```
```bash
npm install
```
```bash
npm run test
```

First it'll compile and bundle your hApp, then execute the tests in the `tests/` folder.

## Writing tests

You write Tryorama tests as if your code were one or more [JavaScript clients](/build/connecting-a-front-end/) accessing a conductor. It's best to think about this as [scenario testing](https://en.wikipedia.org/wiki/Scenario_testing), in which you think of a situation in which the functionality of your hApp might be used and write a set of steps that execute that scenario. Tryorama is able to generate multiple agents, each with their own instances of a hApp, so you can create scenarios involving multiple peers in multiple DNA networks.

The interface is the same as if you were [writing a web-based UI](/build/connecting-a-front-end/), but in addition to the conductor's application API, your code can also access its **admin API**. We'll give examples of how to do this below.

As you scaffold [entry types](/build/entries/#scaffold-an-entry-type-and-crud-api), [link types](/build/links-paths-and-anchors/#define-a-link-type), and [collections](/build/links-paths-and-anchors/#scaffold-a-simple-collection-anchor), the scaffolding tool will also build scenarios that test the CRUD APIs scaffolded for them. Tryorama doesn't care which testing framework you use, but the scaffolded tests use [Vitest](https://vitest.dev/). The code in this guide will assume you're using Vitest too.

### Create a scenario

Your scenarios are written as async functions that you pass to Tryorama's [`runScenario`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.runscenario.md) function. These functions should take one argument, a [`Scenario`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.md) object that exposes Tryorama's functionality.

```typescript
import { assert, test } from "vitest";
import { runScenario } from "@holochain/tryorama";

test("run a scenario", async () => {
    await runScenario(async scenario => {
        assert.ok("Scenario ran!");
    });
});
```

### Create agents and instantiate hApps for them

To spin up a conductor and create a hApp instance for a single agent, call [`scenario.addPlayerWithApp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerwithapp.md), passing it an [`AppWithOptions`](https://github.com/holochain/tryorama/blob/main-0.5/docs/tryorama.appwithoptions.md) object which points to the app and configures install-time options. The function returns a promise containing a [`Player`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.player.md) object, which is a container for:

* a [`Conductor`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.md) object, which lets you manage the conductor hosting the agent, and
* an [`AppWebsocket`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.md) object, which gives you full access to the conductor's app interface (see [Connecting a Front End](/build/connecting-a-front-end/), [Calling a zome function from a front end](/build/calling-zome-functions/#call-a-zome-function-from-a-front-end), [Listen for a signal](/build/signals/#listen-for-a-signal), and [Clone a DNA from a client](/build/cloning/#clone-a-dna-from-a-client)).

```typescript
import { assert, expect, test } from "vitest";
import { runScenario, AppWithOptions } from "@holochain/tryorama";

test("create an agent", async () => {
    await runScenario(async scenario => {
        const playerConfig: AppWithOptions = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            },
            options: {
              // Specify a network seed for all cells in the hApp.
              // You can also specify per-role network seeds and other
              // DNA modifiers; see the next example.
              networkSeed: "my_special_network_seed",
            },
        };

        const alice = await scenario.addPlayerWithApp(playerConfig);
        assert.ok("hApp successfully installed and instantiated in conductor");
        expect(alice?.conductor).toBeDefined();
    });
});
```

To create conductors and hApp instances for multiple agents, call [`scenario.addPlayersWithApps`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerswithapps.md), passing it an array of `AppBundleSource`s. The return value is a promise containing an array of `Player`s, each corresponding to an app bundle source from the input.

```typescript
import { expect, test } from "vitest";
import { runScenario, AppWithOptions } from "@holochain/tryorama";

test("create two agents", async () => {
    await runScenario(async scenario => {
        const playerConfig: AppWithOptions = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            },
            options: {
                // Specify DNA properties for the `movies` cell.
                rolesSettings: {
                    movies: {
                        type: "provisioned",
                        value: {
                            modifiers: {
                                properties: {
                                    authorized_joining_certificate_issuer: "hCAkKUej3Mcu+40AjNGcaID2sQA6uAUcc9hmJV9XIdwUJUE", // cspell:disable-line
                                }
                            }
                        }
                    }
                }
            },
        };

        // Use the same setup for each of them, because we want them to be
        // part of the same DNA network(s).
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        expect(alice?.conductor).toBeDefined();
        expect(bob?.conductor).toBeDefined();
    });
});
```

## Access the app interface

To start accessing an app, use the player object's `appWs` property as if you were using the JavaScript client.

```typescript
import crypto from "crypto";
import { expect, test } from "vitest";
import { AppWithOptions, PlayerApp, Scenario, runScenario } from "@holochain/tryorama";

// All these tests require an agent with an instance of the movies hApp.
// Create a helper function to do the setup.
const createPlayerWithMoviesApp = async (scenario: Scenario): Promise<PlayerApp> => {
    const playerConfig: AppWithOptions = {
        appBundleSource: {
            type: "path",
            value: `${process.cwd()}/../workdir/movies.happ`,
        },
    };

    return await scenario.addPlayerWithApp(playerConfig);
};

test("call a zome function", async () => {
    await runScenario(async scenario => {
        const alice = await createPlayerWithMoviesApp(scenario);

        let directorHash = await alice.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "create_director",
            payload: ["Sergio Leone"],
        });

        expect(directorHash).toBeDefined();
    });
});

test("clone a cell", async () => {
    await runScenario(async scenario => {
        const alice = await createPlayerWithMoviesApp(scenario);

        let chatCellInfo = alice.appWs.createCloneCell({
            modifiers: { network_seed: crypto.randomBytes(32).toString("hex") },
            role_name: "chat",
        });

        expect(chatCellInfo).toBeDefined();
    });
});
```

## Wait for DHT syncing

When you're testing scenarios that involve multiple agents publishing data to the DHT, it's often helpful to pause your test until all agents have seen the data. You can do this with the [`dhtSync`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.dhtsync.md) function, which returns a promise that waits until all players' local states are identical for a DNA.

```typescript
import { assert, expect, test } from "vitest";
import { AppWithOptions, dhtSync, runScenario } from "@holochain/tryorama";
import { CellType } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

test("Bob can retrieve a director entry", async () => {
    await runScenario(async scenario => {
        const playerConfig: AppWithOptions = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            },
        };
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        // Alice creates an entry and publishes it to the DHT.
        let directorHash = await alice.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "create_director",
            payload: ["Sergio Leone"],
        });

        // Before we test that Bob can successfully retrieve the new entry,
        // we wait for him and Alice to sync their copies of the movies DHT.
        const moviesDnaHash = alice.cells
            .find((c) => c.name == "movies")
            ?.cell_id[0];
        expect(moviesDnaHash).toBeDefined();
        await dhtSync(
            [alice, bob],
            moviesDnaHash,
            // You can also set a polling interval and timeout here.
        );

        // Now finish the test.
        let director: any = await bob.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "get_latest_director",
            payload: directorHash,
        });
        expect(director?.entry?.Present?.entry).toBeDefined();
        expect(decode(director.entry.Present.entry)).toBe(["Sergio Leone"]);
    });
});
```

## Listen for a signal

To subscribe to local signals emitted from a cell, you can bind a signal handler to one or more players via the player's `appWs` object.

Because signals are events that arrive outside of the normal control flow of a test scenario, you'll need to wrap the signal handler in a promise and await it.

This examples tests the [heartbeat example from the Signals page](/build/signals/#remote-signals) by getting Alice to send a remote signal to Bob, whose remote signal handler emits a local signal to the waiting promise.

```typescript
import { expect, test } from "vitest";
import { AppWithOptions, runScenario } from "@holochain/tryorama";
import { AppSignal, Signal, SignalCb, SignalType } from "@holochain/client";

test("Bob's UI can receive a heartbeat signal", async () => {
    await runScenario(async scenario => {
        const playerConfig: AppWithOptions = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/my_forum_app.happ`,
            },
        };
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        let bobSignalHandler: SignalCb | undefined;
        // Wrap the signal handler in a promise that resolves when the signal
        // is received and is the right type. We'll await it later so that the
        // test can complete.
        const bobReceivedHeartbeat = new Promise<AppSignal>((resolve, reject) => {
            bobSignalHandler = (signal: Signal) => {
              if (signal.type === SignalType.App) {
                // Check that the signal is a heartbeat signal.
                const payload: any = signal.value.payload;
                if (payload.type === "heartbeat") {
                    resolve(payload.value);
                }
              }
            };
        });
        // Now register the signal handler on the app websocket.
        bob.appWs.on("signal", bobSignalHandler);

        await alice.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "send_heartbeat",
            // An agent's public key is available in their player object.
            payload: [bob.agentPubKey],
        });

        const heartbeat = await bobReceivedHeartbeat;
        expect(heartbeat).toBe(alice.agentPubKey);
    });
});
```

To bind one signal handler to multiple players at a time, add it to the player config's `options` object as a property called `signalHandler`:

```typescript
let signalHandler: SignalCb | undefined;
const receivedHeartbeat = new Promise<Signal>((resolve, reject) => {
    signalHandler = (signal: Signal) => { resolve(signal); }
});
const playerConfig: AppWithOptions = {
    appBundleSource: {
        type: "path",
        value: `${process.cwd()}/../workdir/my_forum_app.happ`,
    },
    options: { signalHandler },
};
const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);
```

## Simulate disruptions

To simulate an unexpected event such as a hardware or network failure, use a player's [`conductor.shutDown`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.shutdown.md) method. You can start the conductor up again with the [`conductor.startUp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.startup.md) method.

```typescript
import { assert, expect, test } from "vitest";
import { decode } from "@msgpack/msgpack";
import { AppWithOptions, dhtSync, runScenario } from "@holochain/tryorama";
import { CellType } from "@holochain/client";

test("Bob can receive a Director entry after coming back online", async () => {
    await runScenario(async scenario => {
        const playerConfig: AppWithOptions = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            },
        };
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        // Pretend that Bob's computer crashed.
        await bob.conductor.shutDown();

        // Alice writes data while Bob is offline.
        let directorHash = await alice.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "create_director",
            payload: ["Sergio Leone"],
        });

        // Bob comes back online again.
        await bob.conductor.startUp();
        assert.ok("Bob is online again");

        // Now wait for Alice and Bob to sync up.
        const moviesDnaHash = alice.cells
            .find((c) => c.name == "movies")
            ?.cell_id[0];
        expect(moviesDnaHash).toBeDefined();
        await dhtSync([alice, bob], moviesDnaHash);
        // Bob should now be able to get Alice's data.
        let director: any = await bob.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "get_latest_director",
            payload: directorHash,
        });
        expect(director?.entry?.Present?.entry).toBeDefined();
        expect(decode(director.entry.Present.entry)).toBe(["Sergio Leone"]);
    });
});
```

## Reference

* [`@holochain/tryorama` > `runScenario`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.runscenario.md)
* [`@holochain/tryorama` > `Scenario`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.md)
* [`@holochain/tryorama` > `Scenario.prototype.addPlayerWithApp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerwithapp.md)
* [`@holochain/client` > `AppBundleSource`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appbundlesource.md)
* [`@holochain/tryorama` > `AppOptions`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.appoptions.md)
* [`@holochain/tryorama` > `Player`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.player.md)
* [`@holochain/tryorama` > `Conductor`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.md)
* [`@holochain/client` > `AppWebsocket`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.md)
* [`@holochain/tryorama` > `Scenario.prototype.addPlayersWithApps`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerswithapps.md)
* [`@holochain/tryorama` > `dhtSync`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.dhtsync.md)
* [`@holochain/tryorama` > `Conductor.prototype.shutDown`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.shutdown.md)
* [`@holochain/tryorama` > `Conductor.prototype.startUp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.startup.md)

## Further reading

* [Tryorama readme](https://github.com/holochain/tryorama/blob/main/README.md)
