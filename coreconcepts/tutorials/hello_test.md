\#S:MODE=test
\#S:EXTERNAL=rust=hello_test.rs
\#S:EXTERNAL=javascript=hello_test.js=test
# Hello Test Tutorial

Welcome to the Hello Test tutorial. Today you will be learning how to test your Holochain apps. This tutorial will add to the previous [Hello Holo]() tutorial, so make sure you do that one first.

Testing is a really important part of building higher quality apps but it's also a an excellent way to think through how your app will be used.

## Understand the tests

When you ran `hc init` in the previous tutorial Holochain already generated some tests for you.

The tests are written in JavaScript and use the Holochain testing framework [Diorama](https://github.com/holochain/diorama), along with a popular test harness called [Tape](https://github.com/substack/tape). You can run them with [Node.JS](https://nodejs.org/en/), a runtime that lets you execute JavaScript in the terminal.

Open up the `cc_tuts/test/index.js` in your favourite text editor. Have a look through the code.

Imports required to do testing:
\#S:INCLUDE
```javascript
const path = require('path')
const tape = require('tape')

const { Diorama, tapeExecutor, backwardCompatibilityMiddleware } = require('@holochain/diorama')
```

This is a catch-all error logger that will let you know if a `Promise` fails and there's no error handler to hear it. [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)s are a way of simplifying complex asynchronous code, and Diorama uses a lot of them.

```javascript
process.on('unhandledRejection', error => {
  console.error('got unhandledRejection:', error);
});

```

The path to your compiled DNA.

```javascript
const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")
const dna = Diorama.dna(dnaPath, 'cc_tuts')
```

Setup a testing scenario.
This creates two agents: Alice and Bob.

```javascript
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
```

This is the test that Holochain generated based on the `my_entry` struct and the zome functions that work with it. We removed them in our Hello Holo tutorial, so let's remove the test.

Remove the following section:

\#S:SKIP
```javascript
diorama.registerScenario("description of example test", async (s, t, { alice }) => {
  // Make a call to a Zome function
  // indicating the function, and passing it an input
  const addr = await alice.call("my_zome", "create_my_entry", {"entry" : {"content":"sample content"}})
  const result = await alice.call("my_zome", "get_my_entry", {"address": addr.Ok})

  // check for equality of the actual and expected results
  t.deepEqual(result, { Ok: { App: [ 'my_entry', '{"content":"sample content"}' ] } })
})
```

This line will run the tests that you have set up.

```javascript
diorama.run()
```

## Create a test scenario

Tests are organized by creating scenarios. Think of them as a series of actions that the user or group of users take when interacting with your app.

For this test you simply want to get the Alice user to call the `hello_holo` zome function. Then check that you get the result `Hello Holo`.

Place the following just above `diorama.run()`.

Register a test scenario that checks `hello_holo()` returns the correct value:

\#S:INCLUDE
```javascript
diorama.registerScenario("Test hello holo", async (s, t, { alice }) => {
```

Make a call to the `hello_holo` Zome function, passing no arguments:

```javascript
  const result = await alice.call("hello", "hello_holo", {});
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
diorama.run()
```
## Run the test
\#S:CHECK=javascript
Now in the `hello_helo` directory, run the test like this:
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
