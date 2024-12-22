// RFC4648, as you can see from line 3 below. Padding optional for encoding.

/**
 * JKMK 2024-12-20
 *
 * High time I got rid of the old string-based version of these
 * functions. The actual implementation is largely copied
 * from agnoster's implementation in this library:
 *
 * https://www.npmjs.com/package/base32
 */

const lib = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const lookup = Array.prototype.reduce.call(
  lib,
  (acc, char, index) => {
    acc[char] = index;
    return acc;
  },
  {},
);

/**
 * Encodes arbitrary int-indexed data into an RFC4648 base32 string.
 * By default, padding is added.
 *
 * @param {any} bytes - The data to be encoded.
 * @param {boolean} [pad=true] - Whether to pad the data.
 * @returns String
 */
function encode(bytes, pad = true) {
  let skip = 0;
  let bits = 0;
  let output = '';

  for (let i = 0; i < bytes.length; ) {
    let byte = bytes[i];
    // coerce the byte to an int
    if (typeof byte == 'string') byte = byte.charCodeAt(0);

    if (skip < 0) {
      // we have a carry from the previous byte
      bits |= byte >> -skip;
    } else {
      // no carry
      bits = (byte << skip) & 248;
    }

    if (skip > 3) {
      // not enough data to produce a character, get us another one
      skip -= 8;
      i += 1;
      continue;
    }

    if (skip < 4) {
      // produce a character
      output += lib[bits >> 3];
      skip += 5;
    }
  }

  // Add anything leftover
  output += skip < 0 ? lib[bits >> 3] : '';

  // Add padding if required
  if (pad && output.length % 8) output += '='.repeat(8 - (output.length % 8));

  return output;
}

/**
 * Decodes an RFC 4648 base32 string into arbitrary data stored in a Buffer.
 *
 * @returns Buffer
 */
function decode(string) {
  // Strip out padding
  const str = string.replace(/=/g, '').toUpperCase();

  // Initialize variables
  let skip = 0;
  let byte = 0;
  const output = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    let val = lookup[char];
    if (val === undefined)
      throw new Error('string is not a valid RFC 4648 base32 encoded value');

    val <<= 3; // move to the high bits
    byte |= val >>> skip;
    skip += 5;

    if (skip >= 8) {
      // we have enough to produce output
      output.push(byte);
      skip -= 8;
      if (skip > 0) {
        byte = (val << (5 - skip)) & 255;
      } else {
        byte = 0;
      }
    }
  }

  // Any remaining byte fragment is discarded implicitly

  return Buffer.from(output);
}

module.exports = {
  encode,
  decode,
};
