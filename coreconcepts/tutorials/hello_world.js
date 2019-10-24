const path = require('path')
const tape = require('tape')

const { Config, Orchestrator, tapeExecutor, singleConductor, combine, callSync } = require('@holochain/try-o-rama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const orchestrator = new Orchestrator({
  globalConfig: {logger: false,  
    //network: 'n3h'
    network: {
      type: 'sim1h',
      dynamo_url: "http://localhost:8000",
    }
  },
  middleware: combine(singleConductor, tapeExecutor(tape))
})

const config = {
  instances: {
    cc_tuts: Config.dna('dist/cc_tuts.dna.json', 'cc_tuts')
  }
}

orchestrator.registerScenario("Test hello holo", async (s, t) => {
  const { alice, bob } = await s.players({alice: config, bob: config}, true)
  // Make a call to the `hello_holo` Zome function
  // passing no arguments.
  const result = await alice.call('cc_tuts', "hello", "hello_holo", {});
  // Make sure the result is ok.
  t.ok(result.Ok);

  // Check that the result matches what you expected.
  t.deepEqual(result, { Ok: 'Hello Holo' })
  await s.consistency()
  const create_result = await alice.call('cc_tuts', "hello", "create_person", {"person": { "name" : "Alice" }});
  t.ok(create_result.Ok);
  const alice_person_address = create_result.Ok;
  await s.consistency()
  const retrieve_result = await alice.call('cc_tuts', "hello", "retrieve_person", {"address": alice_person_address });
  t.ok(retrieve_result.Ok);
  t.deepEqual(retrieve_result, { Ok: {"name": "Alice"} })
