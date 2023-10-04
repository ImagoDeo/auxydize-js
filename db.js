const Database = require('better-sqlite3-multiple-ciphers')
const fs = require('fs')
const path = require('path')

let secretsdb

function getDB() {
  const init = fs.existsSync(path.join(__dirname, 'secrets.db'))
  if (!init) {
    secretsdb = null
  } else {
    secretsdb = new Database(path.join(__dirname, 'secrets.db'))
  }
  return {
    init,
    db: secretsdb
  }
}

function createAndReturnDB() {
  secretsdb = new Database('secrets.db')

  const create = secretsdb.prepare(
    fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  )

  create.run()

  return secretsdb
}

function cleanup() {
  const { init, db } = getDB()
  if (!init) return
  db.close()
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
  insert.run(...secret)
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

module.exports = {
  getDB,
  createAndReturnDB,
  cleanup,
  accessDB,
  encryptDB,
  decryptDB,
  insertSecret,
  deleteSecretByName,
  getSecretByName
}
