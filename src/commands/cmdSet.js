const { arrayify, noArraysExcept } = require('../utils');
const { insertSecret } = require('../db');

function cmdSet(options) {
  // The actual bytes of the secret have to be entered as a space-separated set of hexadecimal pairs.
  const rawBytes = options.secret.split(' ').map((pair) => Number('0x' + pair));
  const secret = {
    name: options.name,
    issuer: options.issuer,
    alias: options.alias,
    algorithm: options.algorithm || 'sha1',
    digits: Number(options.digits) || 6,
    interval: Number(options.interval) || 30,
    tzero: Number(options.tzero) || 0,
    secret: Buffer.from(rawBytes),
    notes: arrayify(options.notes).join('\n'),
  };
  insertSecret(secret);
}

module.exports = {
  command: ['set', 'add'],
  describe: 'add a secret with metadata',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'the name of the secret to add',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('issuer', {
        alias: 'r',
        describe: 'the secret issuer',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'an alias to reference the secret more easily',
        type: 'string',
        requiresArg: true,
      })
      .option('secret', {
        alias: 's',
        describe: 'the secret as a space-separated string of hexadecimal pairs',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('algorithm', {
        alias: 'g',
        describe: 'the algorithm to use for generating a TOTP with this secret',
        type: 'string',
        requiresArg: true,
        default: 'sha1',
      })
      .option('digits', {
        alias: 'd',
        describe: 'the number of digits to generate as a TOTP for this secret',
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
      .check(noArraysExcept(['notes', 'm']), false)
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
      );
  },
  handler: cmdSet,
};
