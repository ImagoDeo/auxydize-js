const { noArraysExcept } = require('../utils');
const { deleteSecretByAlias } = require('../db');
const printer = require('../printer');

module.exports = {
  command: ['remove <alias>', 'delete', 'rm'],
  describe: 'removes a secret from the database',
  builder: (yargs) => {
    return yargs
      .positional('alias', {
        describe: 'alias of the secret to remove',
        type: 'string',
        demandOption: true,
      })
      .check(noArraysExcept([]), false)
      .group(['alias'], 'REMOVE options:');
  },
  handler: (options) => {
    const { alias, verbose } = options;
    if (verbose)
      console.log(printer.verbose(`Deleting secret by alias: ${alias}`));
    const success = deleteSecretByAlias(alias);
    if (success) {
      console.log(printer.status(`Deleted secret with alias: ${alias}`));
    } else {
      console.log(printer.error(`No secret found with alias: ${alias}`));
    }
  },
};
