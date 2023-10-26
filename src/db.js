const Database = require('better-sqlite3-multiple-ciphers');
const fs = require('fs');
const path = require('path');
const printer = require('./printer');
const { getDBPath } = require('./dbPath');
const { prompt } = require('./promptForPassword');

const dbpath = getDBPath();
const schemaPath = path.join(__dirname, 'resources/schema.sql');
const verboseLogger = (str) => console.log(printer.sqlLog(str));

let secretsdb;

async function connectAndAccessDBMiddleware(options) {
  const { help, version, _, verbose } = options;
  if (verbose)
    console.log(
      printer.verbose(
        'Determining whether database connection is necessary for this command.',
      ),
    );

  if (help || _.includes('help') || version || _.includes('version')) {
    if (verbose)
      console.log(
        printer.verbose(
          'Command is help or version; skipping database connection process.',
        ),
      );
    return options;
  }

  if (verbose)
    console.log(
      printer.verbose(
        'Command requires database connection. Attempting connection.',
      ),
    );
  const init = connectDB(verbose);
  if (!init) {
    if (verbose)
      console.log(
        printer.verbose(
          'Database not initialized. Initializing and connecting.',
        ),
      );
    createAndConnectDB(verbose);
  }
  if (verbose) console.log(printer.verbose('Database connected.'));

  if (isDBEncrypted(verbose)) {
    console.log(printer.error('Secrets database is encrypted.'));
    let success = false;
    do {
      const password = await prompt(
        printer.error('Please enter the database password: '),
      );
      if (verbose)
        console.log(
          printer.verbose('Password received. Attempting database access.'),
        );
      accessDB(password);
      success = !isDBEncrypted(verbose);
      if (!success) console.log(printer.error('Incorrect password.'));
    } while (!success);
  }

  if (verbose) console.log(printer.verbose('Database access verified.'));
  return options;
}

function connectDB(verbose) {
  if (verbose)
    console.log(printer.verbose('Checking to see if the database file exists'));
  const init = fs.existsSync(dbpath);
  if (init) {
    if (verbose)
      console.log(printer.verbose('Database file exists. Connecting.'));
    secretsdb = new Database(dbpath, {
      verbose: verbose ? verboseLogger : null,
    });
  } else if (verbose) {
    console.log(printer.verbose('Database file does not exist.'));
  }
  return init;
}

function createAndConnectDB(verbose) {
  if (verbose) console.log(printer.verbose('Creating new database file.'));
  secretsdb = new Database(dbpath, { verbose: verbose ? verboseLogger : null });

  if (verbose) console.log(printer.verbose('Preparing database schema.'));
  const create = secretsdb.prepare(fs.readFileSync(schemaPath, 'utf8'));

  if (verbose) console.log(printer.verbose('Executing database schema.'));
  create.run();
}

function cleanup(verbose) {
  if (verbose)
    console.log(
      printer.verbose(
        'Closing any open database connections and shutting down.',
      ),
    );
  if (!secretsdb) return;
  secretsdb.close();
}

function isDBEncrypted(verbose) {
  if (verbose)
    console.log(
      printer.verbose('Checking to see whether the database is encrypted.'),
    );
  let result = false;

  try {
    secretsdb.exec(`SELECT name FROM sqlite_master WHERE type='table';`);
  } catch (error) {
    if (verbose) console.log(printer.verbose('Error: ' + error.message));
    result = true;
  }

  return result;
}

function accessDB(password) {
  secretsdb.pragma(`key='${password}'`, { simple: true });
}

function encryptDB(password) {
  const result = secretsdb.pragma(`rekey='${password}'`, { simple: true });
  return result === 'ok';
}

function decryptDB() {
  const result = secretsdb.pragma(`rekey=''`, { simple: true });
  return result === 'ok';
}

function insertSecret(secret) {
  const insertSecret = secretsdb.prepare(
    'INSERT INTO secrets ( name, issuer, alias, algorithm, digits, interval, tzero, secret, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  );
  const { changes } = insertSecret.run(
    secret.name,
    secret.issuer,
    secret.alias,
    secret.algorithm,
    secret.digits,
    secret.interval,
    secret.tzero,
    secret.secret,
    secret.notes,
  );
  return changes > 0;
}

function updateSecret(alias, options) {
  const updateSecret = secretsdb.prepare(
    `UPDATE secrets SET (${Object.keys(options).join(', ')}) = (${Object.keys(
      options,
    )
      .map((_) => '?')
      .join(', ')}) WHERE alias = ?`,
  );
  const { changes } = updateSecret.run(...Object.values(options), alias);
  return changes > 0;
}

function getSecretByAlias(alias) {
  const getSecretByAlias = secretsdb.prepare(
    'SELECT * FROM secrets WHERE alias = ?',
  );
  return getSecretByAlias.get(alias);
}

function deleteSecretByAlias(alias) {
  const deleteSecretByAlias = secretsdb.prepare(
    'DELETE FROM secrets WHERE alias = ?',
  );
  const { changes } = deleteSecretByAlias.run(alias);
  return changes > 0;
}

function getAllSecretAliases() {
  const getAllSecretAliases = secretsdb.prepare('SELECT alias FROM secrets');
  return getAllSecretAliases.all().map((row) => row.alias);
}

function getAllSecretIssuersNamesAndAliases() {
  const getAllSecretIssuersNamesAndAliases = secretsdb.prepare(
    'SELECT issuer, name, alias FROM secrets',
  );
  return getAllSecretIssuersNamesAndAliases.all();
}

function getAllSecrets() {
  const getAllSecrets = secretsdb.prepare('SELECT * FROM secrets');
  return getAllSecrets.all();
}

module.exports = {
  connectAndAccessDBMiddleware,
  connectDB,
  createAndConnectDB,
  cleanup,
  isDBEncrypted,
  accessDB,
  encryptDB,
  decryptDB,
  insertSecret,
  updateSecret,
  getSecretByAlias,
  deleteSecretByAlias,
  getAllSecretAliases,
  getAllSecretIssuersNamesAndAliases,
  getAllSecrets,
};
