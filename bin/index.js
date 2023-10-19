#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { connectAndAccessDBMiddleware, cleanup } = require('../src/db');

process.on('SIGINT', () => {
  cleanup(true);
});

(async () => {
  const argv = await yargs(hideBin(process.argv))
    .commandDir('../src/commands')
    .demandCommand(
      1,
      1,
      'No command specified',
      'More than one command specified',
    )
    .option('verbose', {
      alias: 'v',
      describe: 'makes auxydize tell you what it is doing in extreme detail',
      type: 'boolean',
    })
    .help()
    .updateStrings({ 'Options:': 'Global options:' })
    .middleware(connectAndAccessDBMiddleware).argv;

  cleanup(argv.verbose);
})();
