const QRCode = require('qrcode');
const printer = require('./printer');
const base32 = require('./base32');
const qs = require('qs');
const path = require('path');
const protobuf = require('protobufjs');

const protoPath = path.join(__dirname, 'resources/OtpMigration.proto');

const root = protobuf.loadSync(protoPath).resolveAll();

const migrationPayload = root.lookupType('MigrationPayload');
// const algorithm = root.lookupEnum('Algorithm');
// const digitCount = root.lookupEnum('DigitCount');
// const otpType = root.lookupEnum('OtpType');

function toQRCode(uri, filepath, verbose) {
  if (filepath) {
    QRCode.toFile(
      filepath,
      uri,
      {
        errorCorrectionLevel: 'L',
      },
      (error) => {
        if (error) {
          console.log(
            printer.error(
              'Encountered error while writing QR code to file: ' +
                error.message,
            ),
          );
        } else {
          if (verbose)
            console.log(
              printer.verbose(`Successfully wrote QR code to ${filepath}`),
            );
        }
      },
    );
  } else {
    console.log(
      QRCode.toString(
        uri,
        {
          type: 'terminal',
          errorCorrectionLevel: 'L',
        },
        (error) => {
          if (error) {
            console.log(
              printer.error(
                'Encountered error while writing QR code to terminal: ' +
                  error.message,
              ),
            );
          } else {
            if (verbose)
              console.log(
                printer.verbose(`Successfully wrote QR code to terminal`),
              );
          }
        },
      ),
    );
  }
}

function toOtpauthURI(verbose) {
  return function (secret) {
    const { name, issuer, secret: raw, algorithm, digits, interval } = secret;

    if (verbose)
      console.log(
        printer.verbose(`Converting secret '${name}' to otpauth URI`),
      );

    const queryParams = {
      secret: base32.encode(raw, false),
      issuer,
      algorithm,
      digits,
      period: interval,
    };

    return `otpauth://totp/${issuer}:${name}?${qs.stringify(queryParams)}`;
  };
}

const CHUNK_SIZE = 10;

const digitMap = {
  6: 'SIX',
  8: 'EIGHT',
};

// First draft. Needs testing.
function toGoogleMigrationStrings(secrets, verbose) {
  let strings = [];

  for (let i = 0; i < secrets.length; i += CHUNK_SIZE) {
    if (verbose)
      console.log(
        printer.verbose(
          `Processing chunk ${(i + CHUNK_SIZE) / CHUNK_SIZE} of ${Math.ceil(
            secrets.length / CHUNK_SIZE,
          )}`,
        ),
      );
    strings.push(
      `otpauth-migration://offline?data=${encodeURIComponent(
        migrationPayload
          .encode({
            version: 1,
            batch_size: Math.ceil(secrets.length / CHUNK_SIZE),
            batch_index: strings.length,
            // No idea how Google generates a batch_id.
            // I think I might just use my TOTP generator function for it.
            batch_id: Math.max(
              100000000,
              Math.floor(Math.random() * 999999999),
            ),
            otpParameters: secrets.slice(i, i + CHUNK_SIZE).map((secret) => {
              if (verbose)
                console.log(
                  printer.verbose(
                    `Mapping secret '${secret.name}' to otpParameter`,
                  ),
                );
              return {
                secret: secret.secret,
                name: `${secret.issuer}:${secret.name}`,
                issuer: secret.issuer,
                algorithm: secret.algorithm.toUpperCase(),
                digits: digitMap[secret.digits],
                type: 'TOTP',
              };
            }),
          })
          .finish()
          .toString('base64'),
      )}`,
    );
  }

  return strings;
}

module.exports = {
  toQRCode,
  toOtpauthURI,
  toGoogleMigrationStrings,
};
