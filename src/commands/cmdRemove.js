const { noArraysExcept } = require('../utils');
const { deleteSecretByName, deleteSecretByAlias } = require('../db');
const printer = require('../printer');

function cmdRemove(options) {
  const { name, alias, verbose } = options;
  if (name) {
    if (verbose)
      console.log(printer.verbose(`Deleting secret by name: ${name}`));
    const secret = deleteSecretByName(name);
    console.log(printer.status(`Deleted secret with name: ${name}`));
  } else if (alias) {
    if (verbose)
      console.log(printer.verbose(`Deleting secret by alias: ${alias}`));
    const secret = deleteSecretByAlias(alias);
    console.log(printer.status(`Deleted secret with alias: ${alias}`));
  }
}

module.exports = {
  command: ['remove', 'delete', 'rm'],
  describe: 'removes a secret from the database',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'name of the secret to remove',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'alias of the secret to remove',
        type: 'string',
        requiresArg: true,
      })
      .conflicts('name', 'alias')
      .check(noArraysExcept([]), false)
      .check(
        (argv) => !!argv.name || !!argv.alias || 'No name or alias specified',
        false,
      )
      .group(['name', 'alias', 'mask'], 'REMOVE options:');
  },
  handler: cmdRemove,
};
