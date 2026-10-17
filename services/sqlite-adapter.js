/**
 * Cross-Node Universal SQLite Adapter
 * Provides fallback to Node 22+ / Node 26+ built-in `node:sqlite` when native `sqlite3` binary bindings are unavailable.
 */

let sqlite3Lib = null;
try {
  sqlite3Lib = require('sqlite3').verbose();
} catch (e) {
  // Fall back to native node:sqlite
}

class CompatibleDatabase {
  constructor(filePath) {
    if (sqlite3Lib) {
      this._db = new sqlite3Lib.Database(filePath);
      this._isNative = true;
    } else {
      const { DatabaseSync } = require('node:sqlite');
      this._db = new DatabaseSync(filePath);
      this._isNative = false;
    }
  }

  serialize(callback) {
    if (this._isNative) {
      return this._db.serialize(callback);
    }
    if (callback) callback();
  }

  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    if (this._isNative) {
      return this._db.run(sql, params, callback);
    }

    try {
      const stmt = this._db.prepare(sql);
      const result = stmt.run(...params);
      const ctx = {
        lastID: Number(result.lastInsertRowid || 0),
        changes: Number(result.changes || 0),
      };
      if (callback) callback.call(ctx, null);
    } catch (err) {
      if (callback) callback(err);
      else console.error('SQL Error:', err);
    }
  }

  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    if (this._isNative) {
      return this._db.get(sql, params, callback);
    }

    try {
      const stmt = this._db.prepare(sql);
      const row = stmt.get(...params);
      if (callback) callback(null, row || null);
    } catch (err) {
      if (callback) callback(err, null);
      else console.error('SQL Error:', err);
    }
  }

  all(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    if (this._isNative) {
      return this._db.all(sql, params, callback);
    }

    try {
      const stmt = this._db.prepare(sql);
      const rows = stmt.all(...params);
      if (callback) callback(null, rows || []);
    } catch (err) {
      if (callback) callback(err, []);
      else console.error('SQL Error:', err);
    }
  }

  close(callback) {
    if (this._isNative) {
      return this._db.close(callback);
    }
    try {
      this._db.close();
      if (callback) callback(null);
    } catch (err) {
      if (callback) callback(err);
    }
  }
}

module.exports = {
  Database: CompatibleDatabase,
  verbose: () => ({ Database: CompatibleDatabase }),
};
