/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example

const path = require('path')

const { Orchestrator, Config } = require('@holochain/tryorama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/cc_tuts.dna.json")

const orchestrator = new Orchestrator({
  globalConfig: {
    logger: false,
    network: {
      type: 'sim2h',
      sim2h_url: 'wss://localhost:9000',
    },
  },
})

const dna = Config.dna(dnaPath, 'cc_tuts');
const config = Config.gen({cc_tuts: dna});
orchestrator.registerScenario('Test hello holo', async (s, t) => {
  const {alice, bob} = await s.players({alice: config, bob: config}, true);
  const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
  t.ok(result.Ok);
  t.deepEqual(result, { Ok: 'Hello Holo' })
})
orchestrator.run()
