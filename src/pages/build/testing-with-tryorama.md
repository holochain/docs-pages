---
title: "Testing with Tryorama"
---

::: intro
[**Tryorama**](https://github.com/holochain/tryorama) is a JavaScript-based library for testing your [hApps](/build/happs/). It lets you write scenarios that direct the conductor to install hApps, provision [cells](/concepts/2_application_architecture/#cell) for single or multiple agents, and call their [coordinator zome](/build/zomes/#coordinator) [functions](/build/zome-functions/).
:::

## Getting Tryorama

If you've used the scaffolding tool to create a hApp, a Tryorama test package has already been generated for you. You can find it in your project's `tests/` folder.

Alternatively, you can add Tryorama to a JavaScript package by running this command in the package's root:

```bash
npm install --save-dev @holochain/tryorama
```

## Running a test

A Tryorama test is meant to be run in [Node.js](https://nodejs.org/). If you're working on a scaffolded hApp, all you need to do is enter your project's Holonix dev environment, install the necessary dependencies, and run the test command:

```bash
cd Holochain/movies
```
```bash
npm install
```
```bash
npm run test
```

First it'll compile and bundle your hApp, then execute the tests in the `tests/` folder.

## Writing tests

You write Tryorama tests as if your code were one or more JavaScript clients accessing a conductor. It's best to think about this as [scenario testing](https://en.wikipedia.org/wiki/Scenario_testing), in which you think of a situation in which the functionality of your hApp might be used and write a set of steps that executes that scenario. Tryorama is able to generate multiple agents, each with their own instances of a hApp, so you can create scenarios involving multiple peers in multiple DNA networks.

The interface is the same as if you were [writing a web-based UI](/build/connecting-a-front-end/), but in addition to the conductor's application API, your code can also access its **admin API**. We'll give examples of how to do this below.

As you scaffold [entry types](/build/entries/#scaffold-an-entry-type-and-crud-api), [link types](/build/links-paths-and-anchors/#define-a-link-type), and [collections](/build/links-paths-and-anchors/#scaffold-a-simple-collection-anchor), the scaffolding tool will also build scenarios that test the CRUD APIs scaffolded for them. Tryorama doesn't care which testing framework you use, but the scaffolding tool writes tests using [Vitest](https://vitest.dev/). The code in this guide will assume you're using Vitest too.

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

To spin up a conductor and create a hApp instance for a single agent, call [`Scenario.prototype.addPlayerWithApp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerwithapp.md), passing it an [`AppBundleSource`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appbundlesource.md) which tells the conductor where to find the hApp, and an optional [`AppOptions`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.appoptions.md) object which lets you configure how the hApp is instantiated. The function returns a promise containing a [`Player`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.player.md) object, which is a container for:

* a [`Conductor`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.md) object, which lets you manage the conductor hosting the agent, and
* an [`AppWebsocket`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appwebsocket.md) object, which gives you full access to the conductor's app interface (see [Connecting a Front End](/build/connecting-a-front-end/), [Calling a zome function from a front end](/build/calling-zome-functions/#call-a-zome-function-from-a-front-end), [Listen for a signal](/build/signals/#listen-for-a-signal), and [Clone a DNA from a client](/build/cloning/#clone-a-dna-from-a-client)).

```typescript
import { expect, test } from "vitest";
import { runScenario, AppOptions } from "@holochain/tryorama";
import { AppBundleSource } from "@holochain/client";

test("create two agents", async () => {
    await runScenario(async scenario => {
        const playerConfig = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            } as AppBundleSource,
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
            } as AppOptions,
        };

        // Use the same setup for each of them, because we want them to be
        // part of the same DNA network(s).
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        expect(alice?.conductor).toBeDefined();
        expect(bob?.conductor).toBeDefined();
    });
});
```

To create conductors and hApp instances for multiple agents, call [`Scenario.prototype.addPlayersWithApps`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerswithapps.md), passing it an array of `AppBundleSource`s. The return value is a promise containing an array of `Player`s, each corresponding to an app bundle source from the input.

```typescript
import { expect, test } from "vitest";
import { runScenario } from "@holochain/tryorama";
import { AppBundleSource, AppOptions } from "@holochain/client";

test("create two agents", async () => {
    await runScenario(async scenario => {
        const playerConfig = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            } as AppBundleSource,
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
            } as AppOptions,
        };

        // Use the same setup for each of them, because we want them to be
        // part of the same DNA network(s).
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        expect(alice?.conductor).toBeDefined();
        expect(bob?.conductor).toBeDefined();
    });
});
```

## Connect agents to each other

To get Alice and Bob's conductors talking to each other, call [`Scenario.prototype.shareAllAgents`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.shareallagents.md).

```typescript
import { assert, test } from "vitest";
import { runScenario } from "@holochain/tryorama";
import { AppBundleSource } from "@holochain/client";

test("connect two agents together", async () => {
    await runScenario(async scenario => {
        const playerConfig = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            } as AppBundleSource,
        };

        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);

        await scenario.shareAllAgents();
        assert.ok("Alice and Bob are now talking to each other");
    });
});
```

## Access the app interface

To start accessing an app, use the player object's `appWs` property as if you were using the JavaScript client.

```typescript
import crypto from "crypto";
import { expect, test } from "vitest";
import { Player, Scenario, runScenario } from "@holochain/tryorama";
import { AppBundleSource } from "@holochain/client";

// All these tests require an agent with an instance of the movies hApp.
// Create a helper function to do the setup.
const createPlayerWithMoviesApp = async (scenario: Scenario): Promise<Player> => {
    const appBundleSource: AppBundleSource = {
        type: "path",
        value: `${process.cwd()}/../workdir/movies.happ`,
    };

    return await scenario.addPlayerWithApp(appBundleSource);
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

When you're testing scenarios that involve multiple agents publishing data to the DHT, it's sometimes helpful to pause your test until all agents have seen the data. You can do this with the [`dhtSync`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.dhtsync.md) function, which returns a promise that waits until all players' local states are identical for a DNA.

```typescript
import { assert, expect, test } from "vitest";
import { dhtSync, runScenario } from "@holochain/tryorama";
import { AppBundleSource, CellType } from "@holochain/client";
import { decode } from "@msgpack/msgpack";

test("Bob can retrieve a director entry", async () => {
    await runScenario(async scenario => {
        const playerConfig = {
            appBundleSource: {
                type: "path",
                value: `${process.cwd()}/../workdir/movies.happ`,
            } as AppBundleSource,
        };
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);
        await scenario.shareAllAgents();

        // Alice creates an entry and publishes it to the DHT.
        let directorHash = await alice.appWs.callZome({
            role_name: "movies",
            zome_name: "movies",
            fn_name: "create_director",
            payload: ["Sergio Leone"],
        });

        // Before we test that Bob can successfully retrieve the new entry,
        // we wait for him and Alice to sync their copies of the movies DHT.
        const moviesCellInfo = await alice.appWs.cachedAppInfo?.cell_info["movies"][0];
        if (moviesCellInfo.type != CellType.Provisioned && moviesCellInfo.type != CellType.Cloned) {
            assert.fail("Can't await DHT sync on an inactive cell.");
        }
        const moviesDnaHash = moviesCellInfo.value.cell_id[0];
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

## Simulate disruptions

To simulate an unexpected event such as a hardware or network failure, use a player's [`conductor.shutDown`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.shutdown.md) method. You can start the conductor up again with [`conductor.startUp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.startUp.md) method.

```typescript

test("Bob can receive a Director entry after coming back online", async () => {
    await runScenario(async scenario => {
        const playerConfig = {
            appBundleSource: {
                path: `${process.cwd()}/../workdir/movies.happ`,
            }
        }
        const [ alice, bob ] = await scenario.addPlayersWithApps([playerConfig, playerConfig]);
        await scenario.shareAllAgents();

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
        const moviesDnaHash = await alice.appWs.cachedAppInfo?.cell_info["movies"][0].value.cell_id[0];
        await dhtSync([alice, bob], moviesDnaHash);
        // Bob should now be able to get Alice's data.
        let director = await bob.appWs.callZome({
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
* [`@holochain/tryorama` > `Scenario.prototype.shareAllAgents`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.shareallagents.md)
* [`@holochain/tryorama` > `dhtSync`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.dhtsync.md)
* [`@holochain/tryorama` > `Conductor.prototype.shutDown`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.shutdown.md)
* [`@holochain/tryorama` > `Conductor.prototype.startUp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.conductor.startUp.md)

## Further reading

* [Tryorama readme](https://github.com/holochain/tryorama/blob/main/README.md)