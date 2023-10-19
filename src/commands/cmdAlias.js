const { noArraysExcept } = require('../utils');
const { insertAlias } = require('../db');
const printer = require('../printer');

function cmdAlias(options) {
  const { name, alias, v } = options;
  if (v)
    console.log(
      printer.verbose(
        `Attempting to insert alias '${alias}' for secret '${name}'`,
      ),
    );
  insertAlias(name, alias);
  console.log(
    printer.success(`Inserted alias '${alias}' for secret '${name}'`),
  );
}

module.exports = {
  command: ['alias', 'nickname'],
  describe: 'adds an alias to a secret',
  builder: (yargs) => {
    return yargs
      .option('name', {
        alias: 'n',
        describe: 'name of the secret to alias',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .option('alias', {
        alias: 'a',
        describe: 'the alias to give to the named secret',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .check(noArraysExcept([]), false)
      .group(['name', 'alias'], 'ALIAS options:');
  },
  handler: cmdAlias,
};
