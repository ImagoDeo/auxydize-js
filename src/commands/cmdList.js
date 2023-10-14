const { getAllSecretNamesAndAliases } = require('../db');
const { listNameAndAlias } = require('../printer');

function cmdList() {
  const list = getAllSecretNamesAndAliases();
  listNameAndAlias(list);
}

module.exports = {
  command: ['list', 'ls'],
  describe: 'lists all secrets and their aliases',
  handler: cmdList,
};
