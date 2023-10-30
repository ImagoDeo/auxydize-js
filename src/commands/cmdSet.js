const { arrayify, noArraysExcept } = require('../utils');
const { insertSecret } = require('../db');
const printer = require('../printer');

function cmdSet(options) {
  const {
    name,
    issuer,
    alias,
    algorithm,
    digits,
    interval,
    tzero,
    secret,
    notes,
    verbose,
  } = options;
  // The actual bytes of the secret have to be entered as a space-separated set of hexadecimal pairs.
  const rawBytes = secret.split(' ').map((pair) => Number('0x' + pair));
  const secretObj = {
    name: name,
    issuer: issuer,
    alias: alias || `${issuer}:${name}`,
    algorithm: algorithm || 'sha1',
    digits: Number(digits) || 6,
    interval: Number(interval) || 30,
    tzero: Number(tzero) || 0,
    secret: Buffer.from(rawBytes),
    notes: arrayify(notes).join('\n'),
  };
  if (verbose)
    console.log(
      printer.verbose(`Attempting to insert secret ${secretObj.name}`),
    );
  insertSecret(secretObj);
  console.log(printer.success(`${secretObj.alias} successfully inserted.`));
}

module.exports = {
  command: ['set', 'add'],
  describe: 'add a secret with metadata',
  builder: (yargs) => {
    return yargs
      .option('name', {
        describe: 'the name of the secret to add',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('issuer', {
        describe: 'the secret issuer',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('alias', {
        describe:
          'an alias to reference the secret more easily - defaults to ISSUER:NAME',
        type: 'string',
        requiresArg: true,
      })
      .option('secret', {
        describe: 'the secret as a space-separated string of hexadecimal pairs',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('algorithm', {
        describe: 'the algorithm to use for generating a TOTP with this secret',
        type: 'string',
        requiresArg: true,
        default: 'sha1',
      })
      .option('digits', {
        describe: 'the number of digits to generate as a TOTP for this secret',
        type: 'number',
        requiresArg: true,
        default: 6,
      })
      .option('interval', {
        describe:
          'the length of time for each TOTP generated with this secret to be valid',
        type: 'number',
        requiresArg: true,
        default: 30,
      })
      .option('tzero', {
        describe:
          'number to subtract from the current Unix time used in generating a TOTP with this secret',
        type: 'number',
        requiresArg: true,
        default: 0,
      })
      .option('notes', {
        describe: 'notes to add as secret metadata',
        type: 'string',
        requiresArg: true,
      })
      .check(noArraysExcept(['notes']), false)
      .group(
        [
          'name',
          'issuer',
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
      .middleware((argv) => {
        const { name, issuer, alias, verbose } = argv;
        if (verbose) console.log(printer.verbose('Checking for alias.'));
        if (!alias) {
          argv.alias = `${issuer}:${name}`;
          if (verbose)
            console.log(
              printer.verbose(
                `No alias found; inserting default alias '${argv.alias}'`,
              ),
            );
        }
      });
  },
  handler: cmdSet,
};
