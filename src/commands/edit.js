const { noArraysExcept, arrayify } = require('../utils');
const { updateSecret } = require('../db');
const printer = require('../printer');

module.exports = {
  command: ['edit <alias>', 'update'],
  describe: 'edits a secret',
  builder: (yargs) => {
    return yargs
      .positional('alias', {
        describe: 'the alias of the secret to edit',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('newalias', {
        describe: 'a new alias for the secret',
        type: 'string',
        requiresArg: true,
      })
      .option('name', {
        describe: 'a new name for the secret',
        type: 'string',
        requiresArg: true,
      })
      .option('issuer', {
        describe: 'a new issuer for the secret',
        type: 'string',
        requiresArg: true,
      })
      .option('algorithm', {
        describe: 'a new algorithm for the secret',
        choices: ['sha1', 'sha256', 'sha512'],
        requiresArg: true,
      })
      .option('digits', {
        describe: 'a new number of digits for the secret',
        type: 'number',
        requiresArg: true,
      })
      .option('interval', {
        describe: 'a new interval for the secret',
        type: 'number',
        requiresArg: true,
      })
      .option('tzero', {
        describe: 'a new tzero value for the secret',
        type: 'number',
        requiresArg: true,
      })
      .option('secret', {
        describe:
          'a new secret value for the secret, formatted as a space-separated string of hexadecimal pairs',
        type: 'string',
        requiresArg: true,
      })
      .option('notes', {
        describe:
          'new notes for the secret - can be specified multiple times; all values will be entered as new lines',
        type: 'string',
        requiresArg: true,
      })
      .check(noArraysExcept(['notes']), false);
    // TODO: Add another check to make sure at least one update is being made
  },
  handler: (options) => {
    const alias = options.alias;
    const verbose = options.verbose;

    delete options._;
    delete options.$0;
    delete options.alias;
    delete options.verbose;

    if (options.newalias) {
      options.alias = options.newalias;
      delete options.newalias;
    }

    if (options.notes) options.notes = arrayify(options.notes).join('\n');
    if (options.secret)
      options.secret = Buffer.from(
        options.secret.split(' ').map((pair) => Number('0x' + pair)),
      );

    if (verbose)
      console.log(printer.verbose(`Attempting to update secret '${alias}'`));
    const success = updateSecret(alias, options);
    if (success) {
      console.log(printer.success(`Updated secret '${alias}'`));
    } else {
      console.log(printer.error(`No secret found with alias ${alias}`));
    }
  },
};
