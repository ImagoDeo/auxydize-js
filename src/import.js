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
const algorithmEnum = root.lookupEnum('Algorithm');
const digitCount = root.lookupEnum('DigitCount');
// const otpType = root.lookupEnum('OtpType');

const otpauthRegex = '^otpauth://totp/([^?]+)\\?(.*)$';
const migrataionRegex = '^otpauth-migration://offline\\?data=[A-Za-z0-9%]+$';

function parseGoogleMigrationString(migrationString) {
  const secrets = [];

  const result = Buffer.from(
    decodeURIComponent(
      migrationString.replace(/^otpauth-migration:\/\/offline\?data=/, ''),
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

    let { secret, issuer, name, algorithm, digits } = otpParameters;

    let labelIssuer, labelName;
    if (/:/.test(name)) [labelIssuer, labelName] = name.split(':');

    let notes;
    if (labelIssuer && issuer && labelIssuer !== issuer)
      notes =
        `AUTOMATED WARNING: This secret was imported with mismatched issuers in the label and issuer parameter.` +
        `\nLabel: ${labelIssuer}` +
        `\nParameter: ${issuer}` +
        `\nThe parameter issuer is preferred and has been selected to fill in this secret's metadata.`;

    const finalIssuer = (issuer || labelIssuer || 'NO_ISSUER').trim();
    const finalName = (labelName || name).trim();

    secrets.push({
      secret,
      issuer: finalIssuer,
      name: finalName,
      alias: `${finalIssuer}:${finalName}`,
      algorithm: algorithmEnum.valuesById[String(algorithm)].toLowerCase(),
      digits: digitMap[digitCount.valuesById[String(digits)]],
      tzero: 0,
      interval: 30,
      notes,
    });
  }

  return secrets;
}

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
        `Provided string was not parseable JSON or a filepath to a file containing parseable JSON: ${filePathOrRawJSON}`,
      );
    }
  }

  return parsed.tokens.map((token) => ({
    secret: Buffer.copyBytesFrom(new Int8Array(token.secret)),
    issuer: token.issuerExt.trim(),
    name: token.label.trim(),
    alias: `${token.issuerExt.trim()}:${token.label.trim()}`,
    algorithm: token.algo.toLowerCase(),
    digits: token.digits,
    tzero: 0,
    interval: token.period,
    notes: `Issuer: ${token.issuerExt}`,
  }));
}

function parseOtpAuthUri(otpAuthUriString) {
  const decodedString = decodeURIComponent(otpAuthUriString);
  const regex = new RegExp(otpauthRegex);
  const [label, params] = regex.exec(decodedString).slice(1, 3);

  const { secret, algorithm, digits, period, issuer } = qs.parse(params);

  let labelIssuer, labelName;
  if (/:/.test(label)) [labelIssuer, labelName] = label.split(':');

  let notes;
  if (labelIssuer && issuer && labelIssuer !== issuer)
    notes =
      `AUTOMATED WARNING: This secret was imported with mismatched issuers in the label and issuer parameter.` +
      `\nLabel: ${labelIssuer}` +
      `\nParameter: ${issuer}` +
      `\nThe parameter issuer is preferred and has been selected to fill in this secret's metadata.`;

  const finalIssuer = (issuer || labelIssuer).trim();
  const finalName = (labelName || label).trim();

  return {
    secret: Buffer.copyBytesFrom(base32.decode(secret)),
    issuer: finalIssuer,
    name: finalName,
    alias: `${finalIssuer}:${finalName}`,
    algorithm: algorithm,
    digits: digits,
    tzero: 0,
    interval: period,
    notes,
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

function parseImportString(string) {
  if (new RegExp(otpauthRegex).test(string)) return [parseOtpAuthUri(string)];
  if (new RegExp(migrataionRegex).test(string))
    return parseGoogleMigrationString(string);
  return [];
}

module.exports = {
  parseFreeOTPPlusBackupJSON,
  decodeQR,
  parseImportString,
};
