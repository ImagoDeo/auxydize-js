CREATE TABLE secrets (
  name TEXT PRIMARY KEY UNIQUE NOT NULL,
  alias TEXT,
  algorithm TEXT NOT NULL DEFAULT 'sha1',
  digits INTEGER NOT NULL DEFAULT 6,
  interval INTEGER NOT NULL DEFAULT 30,
  tzero INTEGER NOT NULL DEFAULT 0,
  secret BLOB NOT NULL,
  notes TEXT
);
