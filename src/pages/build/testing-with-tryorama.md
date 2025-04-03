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
    })
})
```

### Create agents and instantiate hApps for them

To spin up a conductor and create a hApp instance for a single agent, call [`scenario.addPlayerWithApp`](https://github.com/holochain/tryorama/blob/main/docs/tryorama.scenario.addplayerwithapp.md), passing it an [`AppBundleSource`](https://github.com/holochain/holochain-client-js/blob/main/docs/client.appbundlesource.md) which tells the conductor where to find the hApp.

```typescript

```