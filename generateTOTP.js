const { createHmac } = require('node:crypto');

function generateTOTP(
  secret,
  {
    unixOffset = 0,
    digits = 6,
    algorithm = 'sha1',
    interval = 30,
    counterOffset = 0,
  },
) {
  const nowWithOffset = Date.now() / 1000 - unixOffset;
  const validFor = Math.floor(interval - (nowWithOffset % interval));
  const counter = Math.floor(nowWithOffset / interval) + counterOffset;
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = createHmac(algorithm, secret);
  hmac.update(counterBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const truncatedBytes = digest.readUInt32BE(offset) & 0x7fffffff;
  const password = String(truncatedBytes % Math.pow(10, digits)).padStart(
    digits,
    '0',
  );

  return { password, validFor };
}

module.exports = { generateTOTP };
