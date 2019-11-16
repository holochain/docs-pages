\#S:MODE=test
\#S:EXTERNAL=rust=hello_test.rs
\#S:EXTERNAL=javascript=hello_test.js=test
# Hello Test Tutorial

!!! tip "Time & Level"
    Time: ~1 hours | Level: Beginner

Welcome to the Hello Test tutorial. Today you will be learning how to test your Holochain apps. This tutorial will add to the previous [Hello Holo](../hello_holo) tutorial, so make sure you do that one first.

### What will you learn
You will learn how to use the try-o-rama testing library to test you app.

### Why it matters
Testing is a really important part of building higher quality apps but it's also a an excellent way to think through how your app will be used.


## Understand the tests

When you ran `hc init` in the previous tutorial Holochain already generated some tests for you.

The tests are written in JavaScript and use the Holochain testing framework [try-o-rama](https://github.com/holochain/try-o-rama), along with a popular test harness called [Tape](https://github.com/substack/tape). You can run them with [Node.JS](https://nodejs.org/en/), a runtime that lets you execute JavaScript in the terminal.

Open up the `cc_tuts/test/index.js` in your favourite text editor. Have a look through the code.

Imports required to do testing:
\#S:INCLUDE
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
```

This is a catch-all error logger that will let you know if a `Promise` fails and there's no error handler to hear it. [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)s are a way of simplifying complex asynchronous code, and try-o-rama uses a lot of them.

```javascript

process.on('unhandledRejection', error => {
  console.error('got unhandledRejection:', error);
});

```

The path to your compiled DNA.

```javascript
const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")
```

Setup a testing scenario.
This creates two agents: Alice and Bob.

\#S:SKIP

```javascript
const orchestrator = new Orchestrator({
  middleware: combine(singleConductor, tapeExecutor(tape)),
  globalConfig: {
```
Disable logging:
```diff
-    logger: true,
+    logger: false,
```
Change the network to sim2h:
```diff
-    network: 'memory',  
+    network: {
+      type: 'sim2h',
+      sim2h_url: 'wss://sim2h.holochain.org:9000',
+    },
```
```javascript
  },
});
```

\#S:INCLUDE,HIDE
```javascript
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
```
```diff
const config = {
  instances: {
-    myInstanceName: Config.dna(dnaPath, 'scaffold-test')
+    cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
  },
};
```
\#S:INCLUDE
```diff
- const conductorConfig = {
+ const config = {

    instances: {
-     myInstanceName: Config.dna(dnaPath, 'scaffold-test')
+     cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
   }
 }
```
```javascript
const config = {
  instances: {
    cc_tuts: Config.dna(dnaPath, 'cc_tuts'),
  },
};

```
This is the test that Holochain generated based on the `my_entry` struct and the zome functions that work with it. We removed them in our Hello Holo tutorial, so let's remove the test.

Remove the following section:

\#S:SKIP

!!! note "Remove this:
    ```javascript
    orchestrator.registerScenario("description of example test", async (s, t) => {

      const {alice, bob} = await s.players({alice: conductorConfig, bob: conductorConfig})

      // Make a call to a Zome function
      // indicating the function, and passing it an input
      const addr = await alice.call("myInstanceName", "my_zome", "create_my_entry", {"entry" : {"content":"sample content"}})

      // Wait for all network activity to
      await s.consistency()

      const result = await alice.call("myInstanceName", "my_zome", "get_my_entry", {"address": addr.Ok})

      // check for equality of the actual and expected results
      t.deepEqual(result, { Ok: { App: [ 'my_entry', '{"content":"sample content"}' ] } })
    })
    ```

This line will run the tests that you have set up.

```javascript
orchestrator.run()
```

## Create a test scenario

Tests are organized by creating scenarios. Think of them as a series of actions that the user or group of users take when interacting with your app.

For this test you simply want to get the Alice user to call the `hello_holo` zome function. Then check that you get the result `Hello Holo`.

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
Make a call to the `hello_holo` Zome function, passing no arguments:
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
\#S:INCLUDE,HIDE
```javascript
orchestrator.run();
```
## Run the test

\#S:CHECK=javascript

Now in the `hello_helo` directory, run the test like this:

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

Congratulations; you have tested your first Holochain app. Look at you go! :sparkles: 

## Key takeaways
- Testing is done through the tests folder and uses the try-o-rama testing javascript framework.
- Tests are arranged into scenarios and run by the conductor.

## Learn more
- [try-o-rama](https://github.com/holochain/try-o-rama)
- [tape](https://github.com/substack/tape)
