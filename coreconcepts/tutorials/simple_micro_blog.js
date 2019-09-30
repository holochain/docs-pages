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

diorama.registerScenario("Test Hello Holo", async (s, t, { alice, bob }) => {
  const result = await alice.call("hello", "hello_holo", {});
  t.ok(result.Ok);

  t.deepEqual(result, { Ok: 'Hello Holo' })

  const timestamp = Date.now();
  const create_result = await alice.call("hello", "create_post", {"message": "Hello blog", "timestamp" : timestamp });
  t.ok(create_result.Ok);

  const retrieve_result = await alice.call("hello", "retrieve_posts", {"author_address": alice.agentAddress});
  t.ok(retrieve_result.Ok);
  var post = {message: "Hello blog", timestamp: timestamp, author_id: alice.agentAddress };
  t.deepEqual(retrieve_result, { Ok: [ post ] })

  const bob_retrieve_result = await bob.call("hello", "retrieve_posts", {"author_address": alice.agentAddress});
  t.ok(bob_retrieve_result.Ok);
  t.deepEqual(bob_retrieve_result, { Ok: [ post ] })
})

diorama.run()
