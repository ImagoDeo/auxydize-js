const fs = require('fs');
const path = require('path');

const APP_DATA_DIR_NAME = 'auxydize';
const APP_DB_NAME = 'secrets.db';
const DEFAULT_SUBDIR_PATH = '.local/share';

function getDBPath() {
  const XDG_DATA_HOME = process.env.XDG_DATA_HOME;

  let dbpath;

  if (XDG_DATA_HOME) {
    dbpath = path.join(XDG_DATA_HOME, APP_DATA_DIR_NAME, APP_DB_NAME);
  } else {
    dbpath = path.join(
      process.env.HOME,
      DEFAULT_SUBDIR_PATH,
      APP_DATA_DIR_NAME,
      APP_DB_NAME,
    );
  }

  if (!fs.existsSync(path.dirname(dbpath)))
    fs.mkdirSync(path.dirname(dbpath), { recursive: true });

  return dbpath;
}

module.exports = { getDBPath };
