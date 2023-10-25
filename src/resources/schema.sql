CREATE TABLE secrets (
  name TEXT NOT NULL,
  issuer TEXT DEFAULT 'NO_ISSUER',
  alias TEXT UNIQUE,
  algorithm TEXT DEFAULT 'sha1',
  digits INTEGER DEFAULT 6,
  interval INTEGER DEFAULT 30,
  tzero INTEGER DEFAULT 0,
  secret BLOB NOT NULL,
  notes TEXT,
  PRIMARY KEY (name, issuer)
);
