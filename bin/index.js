#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { connectAndAccessDBMiddleware, cleanup } = require('../src/db');

process.on('SIGINT', () => {
  console.log('\nClosing any open DB connections and shutting down.');
  cleanup();
});

(async () => {
  await yargs(hideBin(process.argv))
    .commandDir('../src/commands')
    .demandCommand(
      1,
      1,
      'No command specified',
      'More than one command specified',
    )
    .option('verbose', {
      alias: 'v',
      describe: 'verbose logging - mainly affects DB queries',
      type: 'boolean',
    })
    .help()
    .updateStrings({ 'Options:': 'Global options:' })
    .middleware(connectAndAccessDBMiddleware).argv;
})();
