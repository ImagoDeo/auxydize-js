#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  connectDB,
  createAndConnectDB,
  cleanup,
  isDBEncrypted,
  accessDB,
} = require('../src/db');
const { gracefulShutdown } = require('../src/utils');
const { prompt } = require('../src/promptForPassword');
const chalk = require('chalk');

process.on('SIGINT', gracefulShutdown);

async function database(argv) {
  if (
    argv.help ||
    argv._.includes('help') ||
    argv.version ||
    argv._.includes('version')
  ) {
    return argv;
  }

  const init = connectDB(argv.verbose);
  if (!init) {
    createAndConnectDB(argv.verbose);
  }

  if (isDBEncrypted()) {
    do {
      const password = await prompt(
        chalk.yellow('STATUS: ') +
          'Secrets database is encrypted. Please enter the password: ',
      );
      accessDB(password);
    } while (isDBEncrypted());
  }

  return argv;
}

async function main() {
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
    .middleware(database).argv;
}

main();
