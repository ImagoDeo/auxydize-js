const { default: jsQR } = require('jsqr');
const {
  encryptDB,
  decryptDB,
  insertSecret,
  deleteSecretByName,
  getSecretByName,
  getSecretByAlias,
  getAllSecretNames,
  getAllSecretAliases,
  getAllSecrets,
  insertAlias,
  getAllSecretNamesAndAliases,
} = require('./db');
const { formatTOTP } = require('./formatter');
const { generateTOTP } = require('./generateTOTP');
const { parseImportString } = require('./import');
const sharp = require('sharp');

// TODO: Add regex matching
function cmdGet(options) {
  const { name, alias, partial } = options;

  let names = arrayify(name);
  let aliases = arrayify(alias);

  if (partial) {
    getPartials(names, aliases);
  } else {
    if (!names.length && !aliases.length) {
      const secrets = getAllSecrets();

      if (!secrets.length) {
        console.log('No secrets found.');
        return;
      }

      for (const secret of secrets) {
        const { totp, validFor } = generateTOTP(secret);
        console.log(formatTOTP(secret.name, totp, { validFor }));
      }
    } else {
      for (const name of names) {
        const secret = getSecretByName(name);
        if (!secret) {
          console.log(`No secret found with name: ${name}`);
          continue;
        }
        const { totp, validFor } = generateTOTP(secret);
        console.log(formatTOTP(secret.name, totp, { validFor }));
      }

      for (const alias of aliases) {
        const secret = getSecretByAlias(alias);
        if (!secret) {
          console.log(`No secret found with alias: ${alias}`);
          continue;
        }
        const { totp, validFor } = generateTOTP(secret);
        console.log(formatTOTP(secret.name, totp, { validFor }));
      }
    }
  }
}

function arrayify(optionValue) {
  if (optionValue === undefined) return [];
  return Array.isArray(optionValue) ? optionValue : [optionValue];
}

function getPartials(partialNames, partialAliases) {
  allNames = getAllSecretNames();
  allAliases = getAllSecretAliases().filter((alias) => alias !== null); // alias can be null

  const getMatches = (all, partials) => {
    let matches = {};
    for (const partial of partials) {
      matches[partial] = all.filter((elem) => elem.includes(partial));
    }
    return matches;
  };

  const getTOTPs = (matches, fetcher) => {
    for (const key of Object.keys(matches)) {
      if (!matches[key].length) {
        console.log(`No matches found for partial name/alias: ${key}`);
        continue;
      }
      for (const match of matches[key]) {
        const secret = fetcher(match);
        const { totp, validFor } = generateTOTP(secret);
        console.log(formatTOTP(secret.name, totp, { validFor }));
      }
    }
  };

  getTOTPs(getMatches(allNames, partialNames), getSecretByName);
  getTOTPs(getMatches(allAliases, partialAliases), getSecretByAlias);
}

function cmdSet(options) {
  // The actual bytes of the secret have to be entered as a space-separated set of hexadecimal pairs.
  const rawBytes = options.secret.split(' ').map((pair) => Number('0x' + pair));
  const secret = {
    name: options.name,
    alias: options.alias,
    algorithm: options.algorithm || 'sha1',
    digits: Number(options.digits) || 6,
    interval: Number(options.interval) || 30,
    tzero: Number(options.tzero) || 0,
    secret: Buffer.from(rawBytes),
    notes: options.notes,
  };
  insertSecret(secret);
}

function cmdAlias(options) {
  const { name, alias } = options;
  insertAlias(name, alias);
}

function cmdList() {
  const list = getAllSecretNamesAndAliases();
  console.dir(list); // TODO: Do better
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

async function cmdImport(options) {
  const { string, file } = options;

  let strings = arrayify(string);
  let files = arrayify(file);

  files = expandHome(files);

  for (const file of files) {
    const migrationString = await decodeQR(file);
    strings.push(migrationString);
  }

  for (const string of strings) {
    for (const secret of parseImportString(string)) {
      insertSecret(secret);
    }
  }
}

// TODO: Should this show the raw secret?
function cmdDetails(options) {
  const { name, alias } = options;
  if (name) {
    console.dir(getSecretByName(name)); // TODO: Do better
  } else if (alias) {
    console.dir(getSecretByAlias(alias)); // TODO: Do better
  }
}

async function decodeQR(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const imageData = new Uint8ClampedArray(data);
  const { data: migrationString } = jsQR(imageData, info.width, info.height);

  return migrationString;
}

function expandHome(filePaths) {
  return filePaths.map((str) => {
    const replacement = str.replace(/^~/, process.env.HOME);
    return replacement;
  });
}

// TODO: Additional commands:
// - edit - edit a secret by name or alias
// - export - export as qr, option to provide filepath

module.exports = {
  cmdGet,
  cmdSet,
  cmdAlias,
  cmdList,
  cmdRemove,
  cmdEncrypt,
  cmdDecrypt,
  cmdImport,
  cmdDetails,
};
