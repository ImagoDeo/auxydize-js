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
