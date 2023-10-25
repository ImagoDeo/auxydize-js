const { getAllSecretIssuersNamesAndAliases } = require('../db');
const printer = require('../printer');

function cmdList(options) {
  const { verbose } = options;
  if (verbose)
    console.log(
      printer.verbose('Getting all secret issuers, names, and aliases...'),
    );
  const list = getAllSecretIssuersNamesAndAliases();
  if (verbose) console.log(printer.verbose(`Found ${list.length} secrets.`));
  console.log(printer.listIssuerNameAndAlias(list));
}

module.exports = {
  command: ['list', 'ls'],
  describe: 'lists all secrets by issuer and name, with their aliases',
  handler: cmdList,
};
