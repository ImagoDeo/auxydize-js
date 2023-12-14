const { decryptDB, cleanup } = require('../db');
const printer = require('../printer');
const prompts = require('prompts');

const confirmationPrompt = {
  type: 'confirm',
  name: 'confirmed',
  message: 'Are you sure you want to decrypt the database?',
};

const onCancel = () => {
  cleanup(true);
  process.exit(0);
};

module.exports = {
  command: ['decrypt', 'unlock'],
  describe: 'decrypts the secrets database',
  handler: async (options) => {
    const { verbose } = options;
    const { confirmed } = await prompts(confirmationPrompt, { onCancel });
    if (!confirmed) {
      if (verbose) console.log(printer.verbose('User did not confirm action.'));
      return;
    }
    if (verbose)
      console.log(printer.verbose('Attempting to decrypt the database'));
    const success = decryptDB();
    if (success) {
      console.log(printer.success('DB decrypted.'));
    } else {
      console.log(printer.error('DB decryption failed.'));
    }
  },
};
