const { arrayify, expandHome, noArraysExcept } = require('../utils');
const {
  parseFreeOTPPlusBackupJSON,
  decodeQR,
  parseImportString,
} = require('../import');
const { insertSecret } = require('../db');
const { status } = require('../printer');

async function cmdImport(options) {
  const { string, file, json } = options;

  let strings = arrayify(string);
  let files = arrayify(file);
  let jsons = arrayify(json);

  files = expandHome(files);
  jsons = expandHome(jsons);

  for (const json of jsons) {
    try {
      const secret = parseFreeOTPPlusBackupJSON(json);
      insertSecret(secret);
    } catch (error) {
      status(error.message);
    }
  }

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

module.exports = {
  command: 'import',
  describe:
    'imports secrets from image files containing QR codes or from raw otpauth URIs',
  builder: (yargs) => {
    return yargs
      .option('string', {
        alias: 's',
        describe: 'a URI containing one or more secrets',
        type: 'string',
        requiresArg: true,
      })
      .option('file', {
        alias: 'f',
        describe: 'a filepath to an image containing one or more secrets',
        type: 'string',
        requiresArg: true,
      })
      .option('json', {
        alias: 'j',
        describe:
          'stringified JSON or a filepath to a JSON file containing FreeOTP+ exported secrets',
        type: 'string',
        requiresArg: true,
      })
      .group(['string', 'file'], 'IMPORT options:')
      .check(noArraysExcept(['string', 's', 'file', 'f', 'json', 'j']), false)
      .check(
        (argv) =>
          argv.string?.length ||
          argv.file?.length ||
          argv.json?.length ||
          'No strings or files specified',
      );
  },
  handler: cmdImport,
};
