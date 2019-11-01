const path = require('path')
const tape = require('tape')

const { Config, Orchestrator, tapeExecutor, singleConductor, combine, callSync } = require('@holochain/try-o-rama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const orchestrator = new Orchestrator({
  globalConfig: {logger: false,  
    network: {
      type: 'sim2h',
      sim2h_url: 'wss://0.0.0.0:9001',
    }
  },
  middleware: combine(singleConductor, tapeExecutor(tape))
})

const config = {
  instances: {
    cc_tuts: Config.dna('dist/cc_tuts.dna.json', 'cc_tuts')
  }
}
