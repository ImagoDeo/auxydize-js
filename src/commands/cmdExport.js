const { noArraysExcept, expandHome } = require('../utils');
const printer = require('../printer');
const { fetchSecrets } = require('../fetcher');
const {
  toQRCode,
  toOtpauthURI,
  toGoogleMigrationStrings,
} = require('../export');
const fs = require('fs');

function cmdExport(options) {
  const { name, alias, partial, verbose } = options;

  if (verbose) console.log(printer.verbose('Calling fetcher.'));
  const secrets = fetchSecrets(name, alias, partial, verbose);

  const { google, uri, qrcode, filepath: rawFilepath } = options;
  const filepath = expandHome(rawFilepath);

  let strings = [];

  if (google) {
    if (verbose)
      console.log(
        printer.verbose(
          'Google mode set, converting to otpauth-migration URI(s)',
        ),
      );
    strings = toGoogleMigrationStrings(secrets, verbose);
  } else if (uri) {
    if (verbose)
      console.log(
        printer.verbose('URI mode set, converting to default otpauth URI(s)'),
      );
    strings = secrets.map(toOtpauthURI(verbose));
  }

  if (qrcode) {
    if (strings.length === 1) {
      if (verbose)
        console.log(
          printer.verbose('Printing a single QR code to terminal or filepath'),
        );
      toQRCode(strings[0], filepath, verbose);
    } else {
      if (verbose)
        console.log(
          printer.verbose(
            'Printing more than one QR code to terminal or filepath',
          ),
        );
      strings.forEach((string, index, strings) =>
        toQRCode(
          string,
          getPrefixedFilepath(filepath, index, strings.length, verbose),
          verbose,
        ),
      );
    }
    return;
  }

  if (!filepath) {
    if (verbose)
      console.log(
        printer.verbose(
          'No filepath specified, qr mode not set - printing raw URIs',
        ),
      );
    strings.forEach((string) => console.log(printer.success(string)));
    return;
  }

  if (strings.length === 1) {
    if (verbose) console.log(printer.verbose('Writing single URI to file'));
    fs.writeFileSync(filepath, strings[0]);
  } else {
    if (verbose) console.log(printer.verbose('Writing URIs to multiple files'));
    strings.forEach((string, index, strings) =>
      fs.writeFileSync(
        getPrefixedFilepath(filepath, index, strings.length, verbose),
        string,
      ),
    );
  }
}

function getPrefixedFilepath(filepath, index, length, verbose) {
  if (!filepath) {
    if (verbose)
      console.log(
        printer.verbose('No filepath specified, returning undefined'),
      );
    return;
  }
  const [prefix, extension] = filepath.split('.');
  if (verbose)
    console.log(
      printer.verbose(
        `Using '${prefix}' as a prefix and '${extension}' as an extension`,
      ),
    );
  return `${prefix}_aux_export_${index + 1}_of_${length}.${extension}`;
}

module.exports = {
  command: ['export'],
  describe: 'export secrets in a variety of formats',
  builder: (yargs) => {
    return yargs
      .option('name', {
        describe: 'the name of a secret to export',
        type: 'string',
        requiresArg: true,
      })
      .option('alias', {
        describe: 'the alias of a secret to export',
        type: 'string',
        requiresArg: true,
      })
      .option('partial', {
        alias: 'p',
        describe:
          'perform partial matching on the specified secret names and aliases',
        type: 'boolean',
      })
      .option('google', {
        alias: 'g',
        describe:
          'format as Google Authenticator multi-secret URI - printed to terminal as a string unless QR or filepath is specified',
        type: 'boolean',
      })
      .option('uri', {
        alias: 'u',
        describe:
          'format as a standard otpauth URI - printed to terminal as a string unless QR or filepath is specified',
        type: 'boolean',
      })
      .option('qrcode', {
        alias: 'q',
        describe:
          'export as a qr code - printed to terminal if no filepath is specified',
        type: 'boolean',
      })
      .option('filepath', {
        describe:
          'file path to use for saving an exported object - if more than one object is exported, the file name will be used as a prefix and multiple files will be written to the directory instead',
        type: 'string',
        requiresArg: true,
      })
      .check(noArraysExcept(['name', 'alias']), false)
      .check(
        (argv) => !!argv.name || !!argv.alias || 'No name or alias specified',
        false,
      )
      .check(
        (argv) => !!argv.google || !!argv.uri || 'No format specified',
        false,
      )
      .group(['google', 'uri'], 'Formats:')
      .group(
        ['name', 'alias', 'partial', 'qrcode', 'filepath'],
        'EXPORT options:',
      )
      .conflicts({
        google: ['uri'],
        uri: ['google'],
      });
  },
  handler: cmdExport,
};
