const { arrayify, expandHome, noArraysExcept } = require('../utils');
const {
  parseFreeOTPPlusBackupJSON,
  decodeQR,
  parseImportString,
} = require('../import');
const { insertSecret } = require('../db');
const printer = require('../printer');

module.exports = {
  command: 'import',
  describe:
    'imports secrets from image files containing QR codes or from raw otpauth URIs',
  builder: (yargs) => {
    return yargs
      .option('string', {
        describe: 'a URI containing one or more secrets',
        type: 'string',
        requiresArg: true,
      })
      .option('file', {
        describe: 'a filepath to an image containing one or more secrets',
        type: 'string',
        requiresArg: true,
      })
      .option('json', {
        describe:
          'stringified JSON or a filepath to a JSON file containing FreeOTP+ exported secrets',
        type: 'string',
        requiresArg: true,
      })
      .group(['string', 'file', 'json'], 'IMPORT options:')
      .check(noArraysExcept(['string', 'file', 'json']), false)
      .check(
        (argv) =>
          argv.string?.length ||
          argv.file?.length ||
          argv.json?.length ||
          'No strings or files specified',
      );
  },
  handler: async (options) => {
    const { string, file, json, verbose } = options;

    if (verbose)
      console.log(printer.verbose('Arrayifying string, file, and json'));
    let strings = arrayify(string);
    let files = arrayify(file);
    let jsons = arrayify(json);

    if (verbose)
      console.log(
        printer.verbose('Expanding home variables for possible filepaths'),
      );
    files = expandHome(files);
    jsons = expandHome(jsons);

    if (verbose)
      console.log(printer.verbose('Processing json files/raw strings'));
    for (const json of jsons) {
      if (verbose)
        console.log(
          printer.verbose(`Attempting to parse file or raw: ${json}`),
        );
      try {
        const secret = parseFreeOTPPlusBackupJSON(json);
        if (verbose)
          console.log(printer.verbose(`Parsing successful, inserting...`));
        insertSecret(secret);
        console.log(printer.success(`${secret.alias} successfully imported.`));
      } catch (error) {
        console.log(
          printer.error(
            'Encountered an error while parsing json: ' + error.message,
          ),
        );
      }
    }

    if (verbose) console.log(printer.verbose('Processing QR code filepaths'));
    for (const file of files) {
      if (verbose)
        console.log(
          printer.verbose(`Attempting to read and decode filepath: ${file}`),
        );
      try {
        const migrationString = await decodeQR(file);
        if (verbose)
          console.log(
            printer.verbose(
              `Successfully decoded and added to queue: ${migrationString}`,
            ),
          );
        strings.push(migrationString);
      } catch (error) {
        console.log(
          printer.error(
            'Encountered an error while decoding filepath: ' + error.message,
          ),
        );
      }
    }

    if (verbose) console.log(printer.verbose('Processing otp URIs'));
    for (const string of strings) {
      if (verbose) console.log(printer.verbose(`Processing: ${string}`));
      try {
        for (const secret of parseImportString(string)) {
          if (verbose)
            console.log(
              printer.verbose(`Attempting to insert secret ${secret.name}`),
            );
          try {
            insertSecret(secret);
            console.log(
              printer.success(`${secret.alias} successfully imported.`),
            );
          } catch (error) {
            console.log(
              printer.error(
                'Encountered an error while inserting secret: ' + error.message,
              ),
            );
          }
        }
      } catch (error) {
        console.log(
          printer.error(
            'Encountered an error while processing string: ' + error.message,
          ),
        );
      }
    }
  },
};
