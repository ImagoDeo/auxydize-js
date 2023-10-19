const { getAllSecretNamesAndAliases } = require('../db');
const printer = require('../printer');

function cmdList(options) {
  const { verbose } = options;
  if (verbose)
    console.log(printer.verbose('Getting all secret names and aliases...'));
  const list = getAllSecretNamesAndAliases();
  if (verbose) console.log(printer.verbose(`Found ${list.length} secrets.`));
  console.log(printer.listNameAndAlias(list));
}

module.exports = {
  command: ['list', 'ls'],
  describe: 'lists all secrets and their aliases',
  handler: cmdList,
};
