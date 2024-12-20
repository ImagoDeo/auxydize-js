/*
RFC 4648                    Base-N Encodings                October 2006
Josefsson                   Standards Track                [Pages 11-12]

10.  Test Vectors

   ...

   BASE32("") = ""

   BASE32("f") = "MY======"

   BASE32("fo") = "MZXQ===="

   BASE32("foo") = "MZXW6==="

   BASE32("foob") = "MZXW6YQ="

   BASE32("fooba") = "MZXW6YTB"

   BASE32("foobar") = "MZXW6YTBOI======"

   ...

*/

const { encode, decode } = require('./base32');

const TEST_CASES = [
  ['', ''],
  ['f', 'MY======'],
  ['fo', 'MZXQ===='],
  ['foo', 'MZXW6==='],
  ['foob', 'MZXW6YQ='],
  ['fooba', 'MZXW6YTB'],
  ['foobar', 'MZXW6YTBOI======'],
];

const stripPadding = (str) => str.replace(/=/g, '');

describe('base32', () => {
  it.each(TEST_CASES)(
    'should encode "%s" to "%s" and decode it back again',
    (value, result) => {
      expect(encode(Buffer.from(value))).toEqual(result);
      expect(decode(result).toString('utf8')).toEqual(value);
    },
  );

  it.each(TEST_CASES.map(([value, result]) => [value, stripPadding(result)]))(
    'without padding, should encode "%s" to "%s" and decode it back again',
    (value, result) => {
      expect(encode(Buffer.from(value), false)).toEqual(result);
      expect(decode(result).toString('utf8')).toEqual(value);
    },
  );
});
