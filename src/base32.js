// I'm not proud of this implementation of base32 encoding and
// I don't know what problems I have created by doing it
// this way, but it works.
//
// RFC4648, as you can see from line 8 below. Padding optional for encoding.

function encode(bytes, pad = true) {
  const lib = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  let bits = '';

  for (const uint8 of bytes) {
    let val = uint8;
    bits += [128, 64, 32, 16, 8, 4, 2, 1].reduce((prev, current) => {
      if (val >= current) {
        val -= current;
        prev += '1';
      } else {
        prev += '0';
      }
      return prev;
    }, '');
  }

  if (bits.length % 5) bits += '0'.repeat(5 - (bits.length % 5));
  let str = '';

  for (let c = 5; c <= bits.length; c += 5) {
    str += lib[Number('0b' + bits.slice(c - 5, c))];
  }

  if (pad && str.length % 8) str += '='.repeat(8 - (str.length % 8));

  return str;
}

function decode(string) {
  const lib = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  const str = string.replace(/=/g, '');
  let bits = '';

  for (const char of str) {
    let val = lib.indexOf(char);
    bits += [16, 8, 4, 2, 1].reduce((prev, current) => {
      if (val >= current) {
        val -= current;
        prev += '1';
      } else {
        prev += '0';
      }
      return prev;
    }, '');
  }

  // Trim extra zeroes added for padding.
  if (bits.length % 8) bits = bits.slice(0, -(bits.length % 8));

  let buffer = Buffer.alloc(bits.length / 8);

  for (let c = 8; c <= bits.length; c += 8) {
    buffer.writeUint8(Number('0b' + bits.slice(c - 8, c)), (c - 8) / 8);
  }

  return buffer;
}

module.exports = {
  encode,
  decode,
};
