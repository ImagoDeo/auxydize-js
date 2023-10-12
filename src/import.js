const path = require('path');
const protobuf = require('protobufjs');
const { default: jsQR } = require('jsqr');
const sharp = require('sharp');

const protoPath = path.join(__dirname, 'resources/OtpMigration.proto');

const root = protobuf.loadSync(protoPath).resolveAll();

const migrationPayload = root.lookupType('MigrationPayload');
const algorithm = root.lookupEnum('Algorithm');
const digitCount = root.lookupEnum('DigitCount');
// const otpType = root.lookupEnum('OtpType');

function parseGoogleMigrationString(migrationString) {
  const secrets = [];

  const result = Buffer.from(
    decodeURIComponent(
      migrationString.replace(/otpauth-migration:\/\/offline\?data=/, ''),
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

async function decodeQR(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const imageData = new Uint8ClampedArray(data);
  const { data: migrationString } = jsQR(imageData, info.width, info.height);

  return migrationString;
}

module.exports = { parseGoogleMigrationString, decodeQR };
