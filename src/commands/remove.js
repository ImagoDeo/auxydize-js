const { noArraysExcept } = require('../utils');
const { deleteSecretByAlias, cleanup } = require('../db');
const printer = require('../printer');
const prompts = require('prompts');

const confirmationPrompt = {
  type: 'confirm',
  name: 'confirmed',
  message:
    'REMOVING A SECRET CANNOT BE UNDONE. Are you sure you want to remove the specified secret?',
};

const onCancel = () => {
  cleanup(true);
  process.exit(0);
};

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
  handler: async (options) => {
    const { alias, verbose } = options;
    const { confirmed } = await prompts(confirmationPrompt, { onCancel });
    if (!confirmed) {
      if (verbose) console.log(printer.verbose('User did not confirm action.'));
      return;
    }
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
