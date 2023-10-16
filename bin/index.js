#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { connectAndAccessDBMiddleware } = require('../src/db');
const { gracefulShutdown } = require('../src/utils');

process.on('SIGINT', gracefulShutdown);

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
