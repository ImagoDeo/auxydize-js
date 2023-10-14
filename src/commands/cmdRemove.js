const { noArraysExcept } = require('../utils');
const { deleteSecretByName } = require('../db');

// TODO: aliases
function cmdRemove(options) {
  deleteSecretByName(options.name);
}

module.exports = {
  command: ['remove', 'delete', 'rm'],
  describe: 'removes a secret from the database',
  builder: (yargs) => {
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
  handler: cmdRemove,
};
