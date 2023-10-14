const fs = require('fs');
const path = require('path');
const protobuf = require('protobufjs');
const { default: jsQR } = require('jsqr');
const sharp = require('sharp');
const qs = require('qs');
const base32 = require('./base32');

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
    if (otpParameters.type !== 2) continue; // Skip anything that's not a TOTP. Maybe we do HOTP later.

    const digitMap = {
      DIGIT_COUNT_UNSPECIFIED: 6,
      SIX: 6,
      EIGHT: 8,
    };

    secrets.push({
      secret: otpParameters.secret,
      issuer: otpParameters.issuer,
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

// Currently unused.
function parseFreeOTPPlusBackupJSON(filePathOrRawJSON) {
  let parsed;

  try {
    parsed = JSON.parse(filePathOrRawJSON);
  } catch (_) {
    try {
      const fileContents = fs.readFileSync(filePathOrRawJSON, 'utf8');
      parsed = JSON.parse(fileContents);
    } catch (_) {
      throw new Error(
        'Provided string was not parseable JSON or a filepath to a file containing parseable JSON',
      );
    }
  }

  return parsed.tokens.map((token) => ({
    secret: Buffer.copyBytesFrom(new Int8Array(token.secret)),
    issuer: token.issuerExt,
    name: token.label,
    algorithm: token.algo.toLowerCase(),
    digits: token.digits,
    tzero: token.counter, // Not totally sure this is correct.
    interval: token.period,
    notes: `Issuer: ${token.issuerExt}`,
  }));
}

// Currently unused.
function parseOtpAuthUri(otpAuthUriString) {
  const decodedString = decodeURIComponent(otpAuthUriString);
  const regex = new RegExp('^otpauth://totp/([^?]+)\\?(.*)$');
  const matches = regex.exec(decodedString).slice(1, 3);
  const [issuer, label] = matches[0].split(':');
  const params = qs.parse(matches[1]);
  return {
    secret: Buffer.copyBytesFrom(base32.decode(params.secret)),
    issuer,
    name: label,
    algorithm: params.algorithm,
    digits: params.digits,
    tzero: params.counter, // TODO: generate a test case to be sure
    interval: params.period,
    notes: `Issuer: ${issuer}`,
  };
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

module.exports = {
  parseGoogleMigrationString,
  parseFreeOTPPlusBackupJSON,
  parseOtpAuthUri,
  decodeQR,
};
