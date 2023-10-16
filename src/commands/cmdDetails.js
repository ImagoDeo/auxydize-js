const { noArraysExcept } = require('../utils');
const { getSecretByName, getSecretByAlias } = require('../db');
const { details } = require('../printer');

function cmdDetails(options) {
  const { name, alias, mask } = options;
  if (name) {
    details(getSecretByName(name), mask);
  } else if (alias) {
    details(getSecretByAlias(alias), mask);
  }
}

module.exports = {
  command: ['details', 'show'],
  describe: 'shows the details of a specific secret',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'name of the secret to display',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'alias of the secret to display',
        type: 'string',
        requiresArg: true,
      })
      .option('mask', {
        alias: 'm',
        describe: 'whether to mask the raw secret',
        type: 'boolean',
        default: true,
      })
      .conflicts('name', 'alias')
      .check(noArraysExcept([]), false)
      .check(
        (argv) => !!argv.name || !!argv.alias || 'No name or alias specified',
        false,
      )
      .group(['name', 'alias', 'mask'], 'DETAILS options:');
  },
  handler: cmdDetails,
};