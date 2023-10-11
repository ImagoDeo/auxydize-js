#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  cmdGet,
  cmdSet,
  cmdRemove,
  cmdEncrypt,
  cmdDecrypt,
  cmdImport,
  cmdAlias,
  cmdList,
} = require('../commands');
const readline = require('node:readline/promises');
const { stdin: input, stdout: output } = require('node:process');
const {
  connectDB,
  createAndConnectDB,
  cleanup,
  isDBEncrypted,
  accessDB,
} = require('../db');

function gracefulShutdown() {
  console.log(
    '\nClosing any open DB connections and I/O streams and shutting down.',
  );
  cleanup();
  rl.close();
}

const rl = readline.createInterface({ input, output });
rl.on('SIGINT', gracefulShutdown);

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
      const password = await rl.question(
        'Secrets database is encrypted. Please enter the password: ',
      );
      accessDB(password);
    } while (isDBEncrypted());
  }

  return argv;
}

function noArraysExcept(exclusions = []) {
  return (argv) => {
    const defaultExclusions = ['_', '$0'];
    exclusions.push(...defaultExclusions);

    for (const key of Object.keys(argv).filter(
      (e) => !exclusions.includes(e),
    )) {
      if (Array.isArray(argv[key]))
        throw new Error(`Option '${key}' cannot be specified more than once.`);
    }

    return true;
  };
}

async function main() {
  try {
    await yargs(hideBin(process.argv))
      .command(
        'get',
        'generate TOTPs',
        (yargs) => {
          return yargs
            .option('name', {
              alias: 'n',
              describe: 'the name of a secret from which to generate a TOTP',
              type: 'string',
              requiresArg: true,
            })
            .option('alias', {
              alias: 'a',
              describe: 'the alias of a secret from which to generate a TOTP',
              type: 'string',
              requiresArg: true,
            })
            .option('partial', {
              alias: 'p',
              describe:
                'return TOTPs for partial matches on secret names and aliases',
              type: 'boolean',
            })
            .group(['name', 'alias', 'partial'], 'GET options:')
            .check(noArraysExcept(['name', 'n']), false);
        },
        cmdGet,
      )
      .command(
        'set',
        'add a secret with metadata',
        (yargs) => {
          return yargs
            .option('name', {
              alias: 'n',
              describe: 'the name of the secret to add',
              type: 'string',
              requiresArg: true,
              demandOption: true,
            })
            .option('alias', {
              alias: 'a',
              describe: 'an alias to reference the secret more easily',
              type: 'string',
              requiresArg: true,
            })
            .option('secret', {
              alias: 's',
              describe:
                'the secret as a space-separated string of hexadecimal pairs',
              type: 'string',
              requiresArg: true,
              demandOption: true,
            })
            .option('algorithm', {
              alias: 'g',
              describe:
                'the algorithm to use for generating a TOTP with this secret',
              type: 'string',
              requiresArg: true,
              default: 'sha1',
            })
            .option('digits', {
              alias: 'd',
              describe:
                'the number of digits to generate as a TOTP for this secret',
              type: 'number',
              requiresArg: true,
              default: 6,
            })
            .option('interval', {
              alias: 'i',
              describe:
                'the length of time for each TOTP generated with this secret to be valid',
              type: 'number',
              requiresArg: true,
              default: 30,
            })
            .option('tzero', {
              alias: 'z',
              describe:
                'number to subtract from the current Unix time used in generating a TOTP with this secret',
              type: 'number',
              requiresArg: true,
              default: 0,
            })
            .option('notes', {
              alias: 'm',
              describe: 'notes to add as secret metadata',
              type: 'string',
              requiresArg: true,
            })
            .group(
              [
                'name',
                'alias',
                'secret',
                'algorithm',
                'digits',
                'interval',
                'tzero',
                'notes',
              ],
              'SET options:',
            )
            .check(noArraysExcept(['notes', 'm']), false);
        },
        cmdSet,
      )
      .command(
        'alias',
        'adds an alias to a secret',
        (yargs) => {
          return yargs
            .option('name', {
              alias: 'n',
              describe: 'name of the secret to alias',
              type: 'string',
              requiresArg: true,
              demandOption: true,
            })
            .option('alias', {
              alias: 'a',
              describe: 'the alias to give to the named secret',
              type: 'string',
              requiresArg: true,
              demandOption: true,
            })
            .group(['name', 'alias'], 'ALIAS options:');
        },
        cmdAlias,
      )
      .command('list', 'lists all secrets and their aliases', {}, cmdList)
      .command(
        'remove',
        'removes a secret from the database',
        (yargs) => {
          return yargs
            .option('name', {
              alias: 'n',
              describe: 'name of a secret to remove',
              type: 'string',
              requiresArg: true,
              demandOption: true,
            })
            .group('name', 'REMOVE options:')
            .check(noArraysExcept(['name', 'n']), false);
        },
        cmdRemove,
      )
      .command('encrypt', 'encrypts the secrets database', {}, cmdEncrypt)
      .command('decrypt', 'decrypts the secrets database', {}, cmdDecrypt)
      .command(
        'import',
        'imports secrets from image files containing QR codes or from Google Authenticator migration strings',
        (yargs) => {
          return yargs
            .option('string', {
              alias: 's',
              describe:
                'a URI-encoded base64 string generated from a Google Protocol Buffer containing exported Google Authenticator secrets',
              type: 'string',
              requiresArg: true,
            })
            .option('file', {
              alias: 'f',
              describe:
                'an image file containing a QR code which contains a URI-encoded base64 string generated from a Google Protocol Buffer containing exported Google Authenticator secrets',
              type: 'string',
              requiresArg: true,
            })
            .group(['string', 'file'], 'IMPORT options:')
            .check(noArraysExcept(['string', 's', 'file', 'f']), false)
            .check(
              (argv) =>
                argv.string?.length ||
                argv.file?.length ||
                'No strings or files specified',
            );
        },
        cmdImport,
      )
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
      .middleware(database).argv;
  } catch (error) {
    cleanup();
    rl.close();
    console.error(error);
    process.exit(1);
  } finally {
    cleanup();
    rl.close();
  }
}

main();
