const { prompt } = require('../promptForPassword');
const { encryptDB } = require('../db');

async function cmdEncrypt() {
  console.log('THIS COMMAND ENCRYPTS YOUR SECRETS DATABASE.');
  console.log(
    'IF YOU LOSE THE PASSWORD, THIS CANNOT BE UNDONE AND YOU WILL LOSE ALL SECRETS.',
  );

  let password;

  do {
    let password1, password2;
    do {
      password1 = await prompt(
        'Enter password to use for encryption (whitespace will be trimmed): ',
      );
    } while (!password1);
    do {
      password2 = await prompt('Re-enter password: ');
    } while (!password2);

    if (password1 === password2) {
      password = password1;
    } else {
      console.log('Passwords did not match.');
    }
  } while (!password);

  encryptDB(password);
}

module.exports = {
  command: ['encrypt', 'lock'],
  describe: 'encrypts the secrets database',
  handler: cmdEncrypt,
};
