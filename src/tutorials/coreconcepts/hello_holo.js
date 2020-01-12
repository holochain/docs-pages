/// NB: The tryorama config patterns are still not quite stabilized.
/// See the tryorama README [https://github.com/holochain/tryorama]
/// for a potentially more accurate example

const path = require('path');

const {
  Orchestrator,
  Config,
  combine,
  localOnly,
  tapeExecutor,
} = require('@holochain/tryorama');

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, '../dist/cc_tuts.dna.json');

const orchestrator = new Orchestrator({
  middleware: combine(
    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require('tape')),

    // specify that all "players" in the test are on the local machine, rather than
    // on remote machines
    localOnly,
  ),
});

const dna = Config.dna(dnaPath, 'cc_tuts');
const config = Config.gen(
  {
    cc_tuts: dna,
  },
  {
    network: {
      type: 'sim2h',
      sim2h_url: 'ws://localhost:9000',
    },
  },
);
orchestrator.registerScenario('Test hello holo', async (s, t) => {
  const {alice, bob} = await s.players({alice: config, bob: config}, true);
  const result = await alice.call('cc_tuts', 'hello', 'hello_holo', {});
  t.ok(result.Ok);
  t.deepEqual(result, {Ok: 'Hello Holo'});
});
orchestrator.run();
