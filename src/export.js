/* eslint-disable */

const QRCode = require('qrcode');

function defaultFileName() {
  return 'aux_export_';
}

function toQRCode(string, options) {}

function toOtpauthURI(secret, options) {}

function toGoogleMigrationStrings(secrets, options) {}

/* eslint-enable */

/*
 * Brainstorming
 *
 * What sort of options should I offer for export?
 * - Any number of names and aliases, or none for all.
 * - Fetch all the secrets.
 * - Output them individually as an otpauth uri QR or all together
 * as one (or several) Google-format QRs.
 *   - This can be in the terminal or as files.
 *   - Can specify one file path for one QR, but how
 *     to do multiple QRs?
 * - Output them as JSON with the FreeOTP+ format?
 * - Output them as raw migration strings?
 *
 * The file paths is the hard part.
 * And there are a ton of other export and import formats
 * I could try to support. It's probably not worth doing much
 * more beyond the options I'm currently considering.
 *
 * Even FreeOTP+ JSON is probably going further than I should
 * really bother with.
 *
 * Flags: partial makes sense.
 * Maybe -q for qr, -g for google, -j for json, -s for raw strings?
 * if -q or -g, either specify a file path or be prepared to get a giant QR in your terminal.
 * actually just all of those. --filepath works for a single secret, but --dirpath for a full export directory.
 */
