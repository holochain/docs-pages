\#S:MODE=test
\#S:EXTERNAL=rust=hello_test.rs
\#S:EXTERNAL=javascript=hello_test.js=test
# Hello Test Tutorial

!!! tip "Time & Level"
    Time: ~1 hours | Level: Beginner

Welcome to the Hello Test tutorial. Today, you will be learning how to test your Holochain apps. This tutorial will add to the previous [Hello Holo](../hello_holo) tutorial, so make sure you do it first.

### What will you learn
You will learn how to use the Tryorama testing library to test you app.

### Why it matters
Testing is a really important part of building higher-quality apps. It's also an excellent way to think through how your app will be used.


## Understand the tests

When you ran `hc init` in the previous tutorial, Holochain generated some tests for you.

The tests are written in JavaScript and use the Holochain testing framework [Tryorama](https://github.com/holochain/try-o-rama), along with a popular test harness called [Tape](https://github.com/substack/tape). You can run them with [Node.JS](https://nodejs.org/en/), a runtime that lets you execute JavaScript in the terminal.

Open up the `cc_tuts/test/index.js` in your favorite text editor. Have a look through the code.

Imports required to do testing:

\#S:INCLUDE
```javascript
/// NB: The try-o-rama config patterns are still not quite stabilized.
/// See the try-o-rama README [https://github.com/holochain/try-o-rama]
/// for a potentially more accurate example

const path = require('path')
const tape = require('tape')

const { Orchestrator, Config, tapeExecutor, singleConductor, combine  } = require('@holochain/tryorama')

```

This is a catch-all error logger that will let you know if a `Promise` fails and there's no error handler to hear it. [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)s are a way of simplifying complex asynchronous code, and Tryorama uses a lot of them.

```javascript
process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

```

The path to your compiled DNA:

```javascript
const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")

```

Set up a testing scenario.
This creates two agents: Alice and Bob.


```javascript
const orchestrator = new Orchestrator({
  middleware: combine(
    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
    singleConductor,

    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require('tape'))
  ),

  globalConfig: {
    logger: true,
    network: 'memory',  // must use singleConductor middleware if using in-memory network
  },

  // the following are optional:

  waiter: {
    softTimeout: 5000,
    hardTimeout: 10000,
  },
})

const conductorConfig = {
  instances: {
    myInstanceName: Config.dna(dnaPath, 'scaffold-test')
  }
}
```


```
\#S:CHANGE
Disable logging:
```diff
-    logger: true,
+    logger: false,
```
Change the network to sim2h:
\#S:CHANGE
```diff
-    network: 'memory',  // must use singleConductor middleware if using in-memory network
+    network: {
+      type: 'sim2h',
+      sim2h_url: 'wss://localhost:9000',
+    },
```

\#S:CHANGE
```diff
-const conductorConfig = {
+const config = {
  instances: {
-    myInstanceName: Config.dna(dnaPath, 'scaffold-test')
+    cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
  }
}
```
This is the test that Holochain generated based on the `my_entry` struct and the zome functions that work with it. We removed them in our Hello Holo tutorial, so let's remove the test.

Remove the following section:

\#S:CHANGE
```diff
-orchestrator.registerScenario("description of example test", async (s, t) => {
-
-  const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig})
-
-  // Make a call to a Zome function
-  // indicating the function, and passing it an input
-  const addr = await alice.call("myInstanceName", "my_zome", "create_my_entry", {"entry" : {"content":"sample content"}})
-
-  // Wait for all network activity to
-  await s.consistency()
-
-  const result = await alice.call("myInstanceName", "my_zome", "get_my_entry", {"address": addr.Ok})
-
-  // check for equality of the actual and expected results
-  t.deepEqual(result, { Ok: { App: [ 'my_entry', '{"content":"sample content"}' ] } })
})
```


## Create a test scenario

Tests are organized by creating scenarios. Think of them as a series of actions that the user, or group of users, take when interacting with your app.

For this test you simply want to get the Alice user to call the `hello_holo` zome function and check that you get the result `Hello Holo`.

!!! tip 
    The following lines go right before `orchestrator.run()`


Register a test scenario that checks `hello_holo()` returns the correct value:

\#S:INCLUDE
```javascript
orchestrator.registerScenario('Test hello holo', async (s, t) => {
```
Create the Alice and Bob agents (you will use Bob later):
```javascript
  const {alice, bob} = await s.players({alice: config, bob: config}, true);
```
Make a call to the `hello_holo` zome function, passing no arguments:
```javascript
  const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
```

Make sure the result is okay:

```javascript
  t.ok(result.Ok);
```

Check that the result matches what you expected:

```javascript
  t.deepEqual(result, { Ok: 'Hello Holo' })
})
```

This line will run the tests you've set up.

```javascript
orchestrator.run()
```
## Run sim2h
You will need to run the sim2h server locally before you can run the tests.
This is the switchboard that does the routing, and will eventually be unneccassary, but is currently useful for development.
To run the server, open up a new nix-shell in a different terminal and run this command:


!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    sim2h_server -p 9000
    ```

## Run the test

\#S:CHECK=javascript

Now, in the `cc_tuts` directory, run the test like this:

!!! note "Run in `nix-shell https://holochain.love`"
    ```bash
    $ hc test
    ```

This will compile and run the test scenario you just wrote. You will see a lot of output. 

!!! success "If everything went okay, then right at the end you will see:"
    ```
    # tests 2
    # pass  2

    # ok
    ```

Congratulations! You have tested your first Holochain app. Look at you go! :sparkles: 

## Key takeaways
- Testing is done through the tests folder and uses the Tryorama testing JavaScript framework.
- Tests are arranged into scenarios and are run by the conductor.

## Learn more
- [Tryorama](https://github.com/holochain/try-o-rama)
- [Tape](https://github.com/substack/tape)
