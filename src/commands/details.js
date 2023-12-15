const { noArraysExcept } = require('../utils');
const { getSecretByAlias } = require('../db');
const printer = require('../printer');

module.exports = {
  command: ['details <alias>', 'show'],
  describe: 'shows the details of a specific secret',
  builder: (yargs) => {
    return yargs
      .positional('alias', {
        describe: 'alias of the secret to display',
        type: 'string',
      })
      .option('unmask', {
        alias: 'u',
        describe: 'whether to unmask the raw secret',
        type: 'boolean',
        default: false,
      })
      .check(noArraysExcept([]), false)
      .check((argv) => !!argv.alias || 'No alias specified', false)
      .group(['alias', 'unmask'], 'DETAILS options:');
  },
  handler: (options) => {
    const { alias, unmask, verbose } = options;
    if (verbose)
      console.log(printer.verbose(`Fetching secret by alias: ${alias}`));
    const secret = getSecretByAlias(alias);
    if (!secret) {
      console.log(printer.error(`No secret found with alias: ${alias}`));
      return;
    }

    console.log(printer.details(secret, unmask));
  },
};
