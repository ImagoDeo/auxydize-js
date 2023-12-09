const { decryptDB } = require('../db');
const printer = require('../printer');

module.exports = {
  command: ['decrypt', 'unlock'],
  describe: 'decrypts the secrets database',
  handler: (options) => {
    const { verbose } = options;
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
