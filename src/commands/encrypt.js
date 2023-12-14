const prompts = require('prompts');
const { encryptDB, cleanup } = require('../db');
const printer = require('../printer');

const passwordPrompt = (name, message) => ({
  type: 'text',
  name,
  message,
  style: 'password',
  format: (val) => val.trim(),
  validate: (val) => {
    if (!val.trim().length)
      return 'Password must contain at least one non-whitespace character.';
    if (!/^([a-z0-9 ]+)$/i.test(val))
      return 'Password may only contain alphanumeric characters and spaces.';
    return true;
  },
});

const passwordPrompts = [
  passwordPrompt(
    'password1',
    'Enter password to use for encryption (whitespace will be trimmed):',
  ),
  passwordPrompt('password2', 'Re-enter password:'),
];

const onCancel = () => {
  cleanup(true);
  process.exit(0);
};

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
      const result = await prompts(passwordPrompts, { onCancel });
      if (result.password1 === result.password2) {
        password = result.password1;
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
