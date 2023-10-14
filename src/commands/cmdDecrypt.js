const { decryptDB } = require('../db');

function cmdDecrypt() {
  decryptDB();
}

module.exports = {
  command: ['decrypt', 'unlock'],
  describe: 'decrypts the secrets database',
  handler: cmdDecrypt,
};
