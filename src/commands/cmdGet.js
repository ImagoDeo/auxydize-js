const { arrayify, noArraysExcept } = require('../utils');
const { generateTOTP } = require('../generator');
const {
  getAllSecrets,
  getAllSecretNames,
  getAllSecretAliases,
  getSecretByName,
  getSecretByAlias,
} = require('../db');
const { totpList, status } = require('../printer');

function cmdGet(options) {
  const { name, alias, partial } = options;

  let names = arrayify(name);
  let aliases = arrayify(alias);

  if (partial) {
    const { matchedNames, matchedAliases } = convertPartials(names, aliases);
    names = matchedNames;
    aliases = matchedAliases;
  }

  if (!names.length && !aliases.length) {
    const secrets = getAllSecrets();

    if (!secrets.length) {
      status('No secrets found.');
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

  const matchedNames = partialNames.reduce(
    getMatches(getAllSecretNames(), 'name'),
    [],
  );

  const matchedAliases = partialAliases.reduce(
    getMatches(
      getAllSecretAliases().filter((alias) => alias !== null),
      'alias',
    ),
    [],
  );

  return {
    matchedNames,
    matchedAliases,
  };
}

module.exports = {
  command: ['get'],
  describe: 'generate TOTPs',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'the name of a secret from which to generate a TOTP',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'the alias of a secret from which to generate a TOTP',
        type: 'string',
        requiresArg: true,
      })
      .option('partial', {
        alias: 'p',
        describe:
          'return TOTPs for partial matches on secret names and aliases',
        type: 'boolean',
      })
      .check(noArraysExcept(['name', 'n', 'alias', 'a']), false)
      .group(['name', 'alias', 'partial'], 'GET options:');
  },
  handler: cmdGet,
};
