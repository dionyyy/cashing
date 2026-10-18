import * as SQLite from 'expo-sqlite';

import { runMigrations } from '@/db/migrations';

const DB_NAME = 'cashing.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Open (once) and migrate the SQLite database. Safe to call repeatedly;
 * concurrent callers share the same init promise.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    // WAL improves concurrent read/write; foreign keys enforce integrity.
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    await runMigrations(db);
    dbInstance = db;
    return db;
  })();

  try {
    return await initPromise;
  } catch (err) {
    // Reset so a later call can retry a failed initialization.
    initPromise = null;
    throw err;
  }
}

/** Test/data-reset helper: drop all rows but keep the schema. */
export async function clearAllData(): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync('DELETE FROM transactions;');
    await db.execAsync('DELETE FROM budgets;');
  });
}
