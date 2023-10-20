const { noArraysExcept } = require('../utils');
const { insertAlias } = require('../db');
const printer = require('../printer');

function cmdAlias(options) {
  const { name, alias, verbose } = options;
  if (verbose)
    console.log(
      printer.verbose(
        `Attempting to insert alias '${alias}' for secret '${name}'`,
      ),
    );
  const success = insertAlias(name, alias);
  if (success) {
    console.log(
      printer.success(`Inserted alias '${alias}' for secret '${name}'`),
    );
  } else {
    console.log(printer.error(`No secret found with name ${name}`));
  }
}

module.exports = {
  command: ['alias <name> <alias>', 'nickname'],
  describe: 'adds an alias to a secret',
  builder: (yargs) => {
    return yargs
      .positional('name', {
        describe: 'name of the secret to alias',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .positional('alias', {
        describe: 'the alias to give to the named secret',
        type: 'string',
        requiresArg: true,
        demandOption: true,
      })
      .check(noArraysExcept([]), false);
  },
  handler: cmdAlias,
};
