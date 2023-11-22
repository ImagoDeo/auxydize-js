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

describe('base32', () => {
  it('should encode and decode RFC 4648 test vectors successfully', () => {
    for (const TEST_CASE of TEST_CASES) {
      expect(encode(Buffer.from(TEST_CASE[0]))).toEqual(TEST_CASE[1]);
      expect(decode(TEST_CASE[1]).toString('utf8')).toEqual(TEST_CASE[0]);
    }
  });
});
