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
  
  const create_result = await alice.call("hello", "create_person", {"person": { "name" : "Alice" }});
  t.ok(create_result.Ok);
  const retrieve_result = await alice.call("hello", "retrieve_person", {"address": create_result.Ok});
  t.ok(retrieve_result.Ok);
  t.deepEqual(retrieve_result, { Ok: { App: [ 'person', '{"name":"Alice"}' ] }})

})
diorama.run()
