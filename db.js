const Database = require('better-sqlite3-multiple-ciphers');
const fs = require('fs');
const path = require('path');
const { getDBPath } = require('./dbPath');

const dbpath = getDBPath();

const verboseLogger = (sqlString) => console.log('SQLITE:', sqlString);

let secretsdb;

function connectDB(verbose) {
  const init = fs.existsSync(dbpath);
  if (init)
    secretsdb = new Database(dbpath, {
      verbose: verbose ? verboseLogger : null,
    });
  return init;
}

function createAndConnectDB(verbose) {
  secretsdb = new Database(dbpath, { verbose: verbose ? verboseLogger : null });

  const create = secretsdb.prepare(
    fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'),
  );

  create.run();
}

function cleanup() {
  if (!secretsdb) return;
  secretsdb.close();
}

function isDBEncrypted() {
  let result = false;

  try {
    secretsdb.exec(`SELECT name FROM sqlite_master WHERE type='table';`);
  } catch (error) {
    result = true;
  }

  return result;
}

function accessDB(password) {
  secretsdb.pragma(`key='${password}'`);
}

function encryptDB(password) {
  secretsdb.pragma(`rekey='${password}'`);
}

function decryptDB() {
  secretsdb.pragma(`rekey=''`);
}

function insertSecret(secret) {
  const insertSecret = secretsdb.prepare(
    'INSERT INTO secrets ( name, alias, algorithm, digits, interval, tzero, secret, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  );
  insertSecret.run(
    secret.name,
    secret.alias,
    secret.algorithm,
    secret.digits,
    secret.interval,
    secret.tzero,
    secret.secret,
    secret.notes.join('\n'),
  );
}

function insertAlias(name, alias) {
  const insertAlias = secretsdb.prepare(
    'UPDATE secrets SET alias = ? WHERE name = ?',
  );
  insertAlias.run(alias, name);
}

function deleteSecretByName(name) {
  const deleteSecretByName = secretsdb.prepare(
    'DELETE FROM secrets WHERE name = ?',
  );
  deleteSecretByName.run(name);
}

function getSecretByName(name) {
  const getSecretByName = secretsdb.prepare(
    'SELECT * FROM secrets WHERE name = ?',
  );
  return getSecretByName.get(name);
}

function getSecretByAlias(alias) {
  const getSecretByAlias = secretsdb.prepare(
    'SELECT * FROM secrets WHERE alias = ?',
  );
  return getSecretByAlias.get(alias);
}

function getAllSecretNames() {
  const getAllSecretNames = secretsdb.prepare('SELECT name FROM secrets');
  return getAllSecretNames.all().map((row) => row.name);
}

function getAllSecretAliases() {
  const getAllSecretAliases = secretsdb.prepare('SELECT alias FROM secrets');
  return getAllSecretAliases.all().map((row) => row.alias);
}

function getAllSecretNamesAndAliases() {
  const getAllSecretNamesAndAliases = secretsdb.prepare(
    'SELECT name, alias FROM secrets',
  );
  return getAllSecretNamesAndAliases.all();
}

function getAllSecrets() {
  const getAllSecrets = secretsdb.prepare('SELECT * FROM secrets');
  return getAllSecrets.all();
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
  insertAlias,
  deleteSecretByName,
  getSecretByName,
  getSecretByAlias,
  getAllSecretNames,
  getAllSecretAliases,
  getAllSecretNamesAndAliases,
  getAllSecrets,
};
