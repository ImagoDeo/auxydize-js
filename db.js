const Database = require('better-sqlite3-multiple-ciphers')
const fs = require('fs')
const path = require('path')

const dbpath = path.join(__dirname, 'secrets.db')

let secretsdb

function connectDB() {
  const init = fs.existsSync(dbpath)
  if (init) secretsdb = new Database(dbpath)
  return init
}

function createAndConnectDB() {
  secretsdb = new Database(dbpath)

  const create = secretsdb.prepare(
    fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  )

  create.run()
}

function cleanup() {
  if (!secretsdb) return
  secretsdb.close()
}

function isDBEncrypted() {
  let result = false

  try {
    secretsdb.exec(`SELECT name FROM sqlite_master WHERE type='table';`)
  } catch (error) {
    result = true
  }

  return result
}

function accessDB(password) {
  secretsdb.pragma(`key='${password}'`)
}

function encryptDB(password) {
  secretsdb.pragma(`rekey='${password}'`)
}

function decryptDB() {
  secretsdb.pragma(`rekey=''`)
}

function insertSecret(secret) {
  const insert = secretsdb.prepare(
    'INSERT INTO secrets ( name, algorithm, digits, interval, tzero, secret, notes) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  insert.run(
    secret.name,
    secret.algorithm,
    secret.digits,
    secret.interval,
    secret.tzero,
    secret.secret,
    secret.notes
  )
}

function deleteSecretByName(name) {
  const deleteSecretByName = secretsdb.prepare(
    'DELETE FROM secrets WHERE name = ?'
  )
  deleteSecretByName.run(name)
}

function getSecretByName(name) {
  const getSecretByName = secretsdb.prepare(
    'SELECT * FROM secrets WHERE name = ?'
  )
  return getSecretByName.get(name)
}

function getAllSecrets() {
  const getAllSecrets = secretsdb.prepare('SELECT * FROM secrets')
  return getAllSecrets.all()
}

module.exports = {
  connectDB,
  createAndConnectDB,
  cleanup,
  isDBEncrypted,
  accessDB,
  encryptDB,
  decryptDB,
  insertSecret,
  deleteSecretByName,
  getSecretByName,
  getAllSecrets
}
