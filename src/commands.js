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
const { generateTOTP } = require('./generator');
const { parseImportString, decodeQR } = require('./import');
const { arrayify, expandHome } = require('./utils');
const {
  success,
  status,
  totpList,
  listNameAndAlias,
  details,
} = require('./printer');

const prompt = require('./promptForPassword');

function cmdGet(options) {
  const { name, alias, partial } = options;

  let names = arrayify(name);
  let aliases = arrayify(alias);

  if (partial) {
    convertPartials(names, aliases);
  }

  if (!names.length && !aliases.length) {
    const secrets = getAllSecrets();

    if (!secrets.length) {
      console.log('No secrets found.');
      return;
    }

    totpList(
      secrets.map((secret) => {
        const { totp, validFor } = generateTOTP(secret);
        return {
          name: secret.name,
          totp,
          validFor,
        };
      }),
    );
  } else {
    if ([...names, ...aliases].length === 1) {
      const secret = names.length
        ? getSecretByName(names[0])
        : getSecretByAlias(aliases[0]);
      const { totp, validFor } = generateTOTP(secret);
      totpList([{ name: secret.name, totp, validFor }]);
      return;
    } else {
      totpList(
        [...names.map(getSecretByName), ...aliases.map(getSecretByAlias)].map(
          (secret) => {
            const { totp, validFor } = generateTOTP(secret);
            return {
              name: secret.name,
              totp,
              validFor,
            };
          },
        ),
      );
    }
  }
}

function convertPartials(partialNames, partialAliases) {
  const getMatches = (all, param) => (prev, partial) => {
    const matches = all.filter((e) => e.includes(partial));
    if (!matches.length) {
      status(`No matches found for partial ${param}: ${partial}`);
    } else {
      prev.push(...matches);
    }
    return prev;
  };

  partialNames = partialNames.reduce(
    getMatches(getAllSecretNames(), 'name'),
    [],
  );
  partialAliases = partialAliases.reduce(
    getMatches(
      getAllSecretAliases().filter((alias) => alias !== null),
      'alias',
    ),
    [],
  );
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
    notes: arrayify(options.notes).join('\n'),
  };
  insertSecret(secret);
}

function cmdAlias(options) {
  const { name, alias } = options;
  insertAlias(name, alias);
  success(`Inserted alias '${alias}' for secret '${name}'`);
}

function cmdList() {
  const list = getAllSecretNamesAndAliases();
  listNameAndAlias(list);
}

// TODO: Aliases
function cmdRemove(options) {
  deleteSecretByName(options.name);
}

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
    for (const secret of parseGoogleMigrationString(string)) {
      insertSecret(secret);
    }
  }
}

function cmdDetails(options) {
  const { name, alias, mask } = options;
  if (name) {
    details(getSecretByName(name), mask);
  } else if (alias) {
    details(getSecretByAlias(alias), mask);
  }
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
