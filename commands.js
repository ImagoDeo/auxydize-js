const {
  encryptDB,
  decryptDB,
  insertSecret,
  deleteSecretByName,
  getSecretByName,
  getAllSecrets,
} = require('./db');
const { formatTOTP } = require('./formatter');
const { generateTOTP } = require('./generateTOTP');
const { parseImportString } = require('./import');

// TODO: Work with aliases too, and regex match for secret names.
function cmdGet(options) {
  let names = Array.isArray(options.name) ? options.name : [options.name];
  if (names.length > 0) {
    for (const name of names) {
      const secret = getSecretByName(options.name);
      if (!secret) console.log(`No secret found with name: ${options.name}`);
      const { totp, validFor } = generateTOTP(secret);
      console.log(formatTOTP(secret.name, totp, { validFor }));
    }
  } else {
    for (const secret of getAllSecrets()) {
      const { totp, validFor } = generateTOTP(secret);
      console.log(formatTOTP(secret.name, totp, { validFor }));
    }
  }
}

function cmdSet(options) {
  // The actual bytes of the secret have to be entered as a space-separated set of hexadecimal pairs.
  const rawBytes = options.secret.split(' ').map((pair) => Number('0x' + pair));
  const secret = {
    name: options.name,
    algorithm: options.algorithm || 'sha1',
    digits: Number(options.digits) || 6,
    interval: Number(options.interval) || 30,
    tzero: Number(options.tzero) || 0,
    secret: Buffer.from(rawBytes),
    notes: options.notes,
  };
  insertSecret(secret);
}

// TODO: Aliases and regex matching
function cmdRemove(options) {
  deleteSecretByName(options.name);
}

function cmdEncrypt(rl) {
  return async () => {
    console.log('THIS COMMAND ENCRYPTS YOUR SECRETS DATABASE.');
    console.log(
      'IF YOU LOSE THE PASSWORD, THIS CANNOT BE UNDONE AND YOU WILL LOSE ALL SECRETS.',
    );
    const password = await rl.question(
      'Enter password to use for encryption (whitespace will be removed): ',
    );
    if (!password.trim().length)
      throw new Error('Specified password was empty');
    encryptDB(password.trim());
  };
}

function cmdDecrypt() {
  decryptDB();
}

// TODO: Refactor - string and file might be arrays
function cmdImport(options) {
  if (options.string) {
    for (const secret of parseImportString(options.string)) {
      insertSecret(secret);
    }
  } else if (options.file) {
    console.log('Not yet implemented.');
  }
}
// TODO: Additional commands:
// - import (extend) - Option to read an image file (jsqr?)
// - alias - give a secret an alias for easier getting. (db change)
// - list - list the names (and aliases) of all secrets.
// - edit - edit a secret by name or alias
// - export - export as qr, option to provide filepath

module.exports = {
  cmdGet,
  cmdSet,
  cmdRemove,
  cmdEncrypt,
  cmdDecrypt,
  cmdImport,
};
