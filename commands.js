const {
  encryptDB,
  decryptDB,
  insertSecret,
  deleteSecretByName,
  getSecretByName,
  getAllSecrets
} = require('./db')
const { formatTOTP } = require('./formatter')
const { generateTOTP } = require('./generateTOTP')

function get(options) {
  if (options.name) {
    const secret = getSecretByName(options.name)
    if (!secret) throw new Error(`No secret found with name: ${options.name}`)
    const { totp, validFor } = generateTOTP(secret)
    console.log(formatTOTP(secret.name, totp, { validFor }))
  } else {
    for (secret in getAllSecrets()) {
      const { totp, validFor } = generateTOTP(secret)
      console.log(formatTOTP(secret.name, totp, { validFor }))
    }
  }
}

get.validOptions = ['name']
get.requiredOptions = []

function set(options) {
  // The actual bytes of the secret have to be entered as a space-separated set of hexadecimal pairs.
  const rawBytes = options.secret.split(' ').map((pair) => Number('0x' + pair))
  const secret = {
    name: options.name,
    algorithm: options.algorithm || 'sha1',
    digits: Number(options.digits) || 6,
    interval: Number(options.interval) || 30,
    tzero: Number(options.tzero) || 0,
    secret: Buffer.from(rawBytes),
    notes: options.notes
  }
  insertSecret(secret)
}

set.validOptions = [
  'name',
  'secret',
  'algorithm',
  'digits',
  'interval',
  'tzero',
  'notes'
]
set.requiredOptions = ['name', 'secret']

function remove(options) {
  deleteSecretByName(options.name)
}

remove.validOptions = ['name']
remove.requiredOptions = ['name']

function encrypt(options) {
  encryptDB(options.password)
}

encrypt.validOptions = ['password']
encrypt.requiredOptions = ['password']

function decrypt() {
  decryptDB()
}

decrypt.validOptions = []
decrypt.requiredOptions = []

module.exports = {
  get,
  set,
  remove,
  encrypt,
  decrypt
}
