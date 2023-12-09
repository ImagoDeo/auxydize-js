const { prompt } = require('../promptForPassword');
const { encryptDB } = require('../db');
const printer = require('../printer');

module.exports = {
  command: ['encrypt', 'lock'],
  describe: 'encrypts the secrets database',
  handler: async (options) => {
    const { verbose } = options;

    console.log(printer.status('THIS COMMAND ENCRYPTS YOUR SECRETS DATABASE.'));
    console.log(
      printer.status(
        'IF YOU LOSE THE PASSWORD, THIS CANNOT BE UNDONE AND YOU WILL LOSE ALL SECRETS.',
      ),
    );

    let password;

    do {
      let password1, password2;
      do {
        password1 = await prompt(
          printer.status(
            'Enter password to use for encryption (whitespace will be trimmed): ',
          ),
        );
      } while (!password1);
      do {
        password2 = await prompt(printer.status('Re-enter password: '));
      } while (!password2);

      if (verbose) console.log(printer.verbose('Comparing passwords...'));
      if (password1 === password2) {
        if (verbose) console.log(printer.verbose('Passwords matched.'));
        password = password1;
      } else {
        console.log(printer.error('Passwords did not match.'));
      }
    } while (!password);

    if (verbose)
      console.log(printer.verbose('Attempting database encryption.'));
    const success = encryptDB(password);
    if (success) {
      console.log(printer.success('DB encrypted.'));
    } else {
      console.log(printer.error('DB encryption failed.'));
    }
  },
};
