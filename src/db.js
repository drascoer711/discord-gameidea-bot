import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dbDir = path.dirname(process.env.DB_PATH || './data/bot.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(process.env.DB_PATH || './data/bot.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    discriminator TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    signed_in INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export function upsertUser({ id, username, discriminator }) {
  const stmt = db.prepare(`
    INSERT INTO users (id, username, discriminator, last_seen, signed_in)
    VALUES (@id, @username, @discriminator, CURRENT_TIMESTAMP, 1)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      discriminator = excluded.discriminator,
      last_seen = CURRENT_TIMESTAMP,
      signed_in = 1
  `);

  stmt.run({ id, username, discriminator: discriminator || null });
}

export function getUser(userId) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
}

export function getMemory(userId, limit = 6) {
  return db.prepare(`
    SELECT content
    FROM memory
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(userId, limit).reverse();
}

export function saveMemory(userId, content) {
  const stmt = db.prepare(`INSERT INTO memory (user_id, content) VALUES (?, ?)`);
  stmt.run(userId, content);
}

export function resetMemory(userId) {
  db.prepare('DELETE FROM memory WHERE user_id = ?').run(userId);
}

export function closeDb() {
  db.close();
}
