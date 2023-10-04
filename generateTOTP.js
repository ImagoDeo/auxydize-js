const { createHmac } = require('node:crypto')

function generateTOTP({
  secret,
  algorithm = 'sha1',
  digits = 6,
  interval = 30,
  tzero = 0,
  counterOffset = 0
}) {
  const nowWithOffset = Date.now() / 1000 - tzero
  const validFor = Math.floor(interval - (nowWithOffset % interval))
  const counter = Math.floor(nowWithOffset / interval) + counterOffset // Can see next (1) or previous (-1)
  const counterBuffer = Buffer.alloc(8) // 8 bytes required by RFC - futureproofing
  counterBuffer.writeBigInt64BE(BigInt(counter), 0)

  const hmac = createHmac(algorithm, secret)
  hmac.update(counterBuffer)
  const digest = hmac.digest()

  const offset = digest[digest.length - 1] & 0x0f
  const truncatedBytes = digest.readUInt32BE(offset) & 0x7fffffff
  const totp = String(truncatedBytes % Math.pow(10, digits)).padStart(
    digits,
    '0'
  )

  return { totp, validFor }
}

module.exports = { generateTOTP }
