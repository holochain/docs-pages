# Changelog

This page shows any breaking changes to our Holochain documentation and how to update your code to match.
Holochain Core is very fast moving software; we release often.

The documentation aims to stay up to date with the latest release, so there are occasional breaking changes that will cause you to need to update your code.

We want this to be as easy as possible, so we’ve committed to documenting not just the breaking changes, but the fixes as well.

## 0.5.9 → 0.5.10

Point all links to HDK and Conductor API to docs.rs resources.

## 0.5.8 → 0.5.9

Add instructions for Apple aarch64 computers.

## 0.5.7 → 0.5.8

Add new page for setting up a development environment without Holonix.

## 0.5.6 → 0.5.7

Add new page for using the simulated and connected Holochain Playground.

## 0.5.5 → 0.5.6

Add new page on how to scaffold new hApps and how to run hApp binaries.

## 0.5.4 → 0.5.5

Simplify Nix & Holochain installation instructions.

## 0.5.3 → 0.5.4

Refresh of the install guides.

## 0.5.2 → 0.5.3

Lots of edits to the Core Concepts, mostly #2 (Application Architecture).

## 0.5.1 → 0.5.2

Added Google Analytics v4.

## 0.5.0 → 0.5.1

Added a link to the Holochain Gym.

## 0.4.6 → 0.5.0

Added howto/readme links for developing/building for more places. Took the opportunity to bump a minor version, cuz that should've happened last time with the font changes.

## 0.4.5 → 0.4.6

Changed the fonts to match the new Holochain website

## 0.4.4 → 0.4.5

Removed the landing page and some markety content; moved all `/docs` URLs to the root fo the site; set up better redirects to the Holochain Redux developer documentation

## 0.4.3 → 0.4.4

Changed install URL to nightly.holochain.love; added some pro tips for developers who want to keep their preferred shell; removed RSM notice banner

## 0.4.2 → 0.4.3

Added HDK dependency pinning guide, reverted install method to slow but constantly-updated; removed HDK docs and pointed to docs on docs.rs

## 0.4.1 → 0.4.2

Removed emoji feedback, updated what/why/who introductory material for RSM

## 0.4.0 → 0.4.1

Added Rustdoc reference guides for the HDK, conductor APIs, and conductor config. Various other small changes.

## 0.3.7 → 0.4.0

Added content for Holochain RSM and removed all Holochain Redux-related content. New install guide, core concepts, and glossary.

## 0.3.6 → 0.3.7

Bumped to Holochain v0.0.52-alpha2. More textual changes in the tutorials re: consistency checks.

## 0.3.5 → 0.3.6

Bumped to Holochain v0.0.52. Changes in tutorial to fix `s.consistency()` no longer working.

## 0.3.4 → 0.3.5

Preparing for releasing Holochain RSM -- added warning banners and a provisional resource guide.

## 0.3.3 → 0.3.4

Updated for Holochain v0.0.51. No breaking changes.

## 0.3.2 → 0.3.3

Updated for Holochain v0.0.50 and Nix v2.3.7. No breaking changes.

## 0.3.1 → 0.3.2

Simplified Holonix installation instructions for macOS and Windows.

## 0.3.0 → 0.3.1

New header and footer nav. That is all!

## 0.2.3 → 0.3.0
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

## 0.1.* → 0.2.*
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
