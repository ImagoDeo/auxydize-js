const { noArraysExcept } = require('../utils');
const { generateTOTP } = require('../generator');
const printer = require('../printer');
const { fetchSecrets } = require('../fetcher');

function cmdGet(options) {
  const { alias, partial, verbose } = options;

  if (verbose) console.log(printer.verbose('Calling fetcher.'));
  const secrets = fetchSecrets(alias, partial, verbose);

  if (secrets.length) {
    if (verbose) console.log(printer.verbose('Generating TOTPs.'));
    console.log(
      printer.totpList(
        secrets.map((secret) => {
          const { totp, validFor } = generateTOTP(secret);
          return {
            name: secret.name,
            issuer: secret.issuer,
            totp,
            validFor,
          };
        }),
      ),
    );
  }
}

module.exports = {
  command: ['get'],
  describe: 'generate TOTPs',
  builder: (yargs) => {
    return yargs
      .option('alias', {
        describe: 'the alias of a secret from which to generate a TOTP',
        type: 'string',
        requiresArg: true,
      })
      .option('partial', {
        alias: 'p',
        describe: 'perform partial matching on the specified secret aliases',
        type: 'boolean',
      })
      .check(noArraysExcept(['alias']), false)
      .group(['alias', 'partial'], 'GET options:');
  },
  handler: cmdGet,
};
