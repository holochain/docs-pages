# Changelog

This page shows any breaking changes to our Holochain documentation and how to update your code to match.
Holochain Core is very fast moving software; we release often.

The documentation aims to stay up to date with the latest release, so there are occasional breaking changes that will cause you to need to update your code.

We want this to be as easy as possible, so we’ve committed to documenting not just the breaking changes, but the fixes as well.

## 0.3.1 --> 0.3.2

Simplified Holonix installation instructions for macOS and Windows.

## 0.3.0 --> 0.3.1

New header and footer nav. That is all!

## 0.2.3 --> 0.3.0
#### Introduction of hApp Bundle

!!! info "This affects:"
    All Core Concepts tutorials past Hello Gui.

We can now use bundle.toml files to allow `hc run` to serve our UI and work with sim2h.


??? warning "Out of date:"
    All code relating to conductor-cofig.toml.
    You no longer need to run a python web server.
    You no longer need to run the Holochain conductor directly.

??? success "New:"
    Run hc directly with sim2h and set the agent name:
    ```bash
    hc run --networked sim2h --agent-name Alice
    ```
    You need to have a bundle.toml file in the root directory that points to your UI (if you have a UI).

## 0.1.* --> 0.2.*
#### Introduction of Tryorama.

!!! info "This affects:"
    All Core Concepts tutorials.

The testing framework has changed from diorama to [tryorama](https://github.com/holochain/try-o-rama).

??? warning "Out of date code:"
    ```javascript
    const path = require('path')
    const tape = require('tape')

    const { Diorama, tapeExecutor, backwardCompatibilityMiddleware } = require('@holochain/diorama')

    process.on('unhandledRejection', error => {
      console.error('got unhandledRejection:', error);
    });

    const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")
    const dna = Diorama.dna(dnaPath, 'cc_tuts')

    const diorama = new Diorama({
      instances: {
        alice: dna,
        bob: dna,
      },
      bridges: [],
      debugLog: false,
      executor: tapeExecutor(require('tape')),
      middleware: backwardCompatibilityMiddleware,
    })

    diorama.registerScenario("Test hello holo", async (s, t, { alice }) => {
      const result = await alice.call("hello", "hello_holo", {});
      t.ok(result.Ok);
      t.deepEqual(result, { Ok: 'Hello Holo' })
    })

    diorama.run()
    ```

??? success "New code:"
    ```javascript
    const path = require('path');
    const tape = require('tape');

    const {
      Config,
      Orchestrator,
      tapeExecutor,
      singleConductor,
      combine,
    } = require('@holochain/try-o-rama');

    process.on('unhandledRejection', error => {
      console.error('got unhandledRejection:', error);
    });

    const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")
    const orchestrator = new Orchestrator({
      middleware: combine(singleConductor, tapeExecutor(tape)),
      globalConfig: {
        logger: false,
        network: {
          type: 'sim2h',
          sim2h_url: 'wss://sim2h.holochain.org:9000',
        },
      },
    });
    const config = {
      instances: {
        cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
      },
    };

    orchestrator.registerScenario('Test hello holo', async (s, t) => {
      const {alice, bob} = await s.players({alice: config, bob: config}, true);
      const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
      t.ok(result.Ok);
      t.deepEqual(result, { Ok: 'Hello Holo' })
    })
    orchestrator.run();
    ```

??? note "Notes:"
    There are a lot of differences here; but one thing to watch out for is that you now need the instance name in the zome call.
    ```diff
    - const result = await alice.call("hello", "hello_holo", {});
    + const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
    ```
