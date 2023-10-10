const protobuf = require('protobufjs');
const path = require('path');

// TODO: Save stuff in the right directories
const root = protobuf
  .loadSync(path.join(__dirname, 'OtpMigration.proto'))
  .resolveAll();

const migrationPayload = root.lookupType('MigrationPayload');
const algorithm = root.lookupEnum('Algorithm');
const digitCount = root.lookupEnum('DigitCount');
const otpType = root.lookupEnum('OtpType');

function parseImportString(importString) {
  const secrets = [];

  const result = Buffer.from(
    decodeURIComponent(
      importString.replace(/otpauth-migration:\/\/offline\?data=/, ''),
    ),
    'base64',
  );

  const message = migrationPayload.decode(result);
  const obj = migrationPayload.toObject(message);

  for (const otpParameters of obj.otpParameters) {
    if (otpParameters.type !== 2) continue; // Skip anything that's not a TOTP.

    const digitMap = {
      DIGIT_COUNT_UNSPECIFIED: 6,
      SIX: 6,
      EIGHT: 8,
    };

    secrets.push({
      secret: otpParameters.secret,
      name: otpParameters.name,
      algorithm:
        algorithm.valuesById[String(otpParameters.algorithm)].toLowerCase(),
      digits: digitMap[digitCount.valuesById[String(otpParameters.digits)]],
      tzero: 0,
      interval: 30,
      notes: otpParameters.issuer
        ? `Issuer: ${otpParameters.issuer}`
        : 'No issuer specified',
    });
  }

  return secrets;
}

module.exports = { parseImportString };
