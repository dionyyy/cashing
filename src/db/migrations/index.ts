import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Versioned migrations driven by PRAGMA user_version.
 * Add new entries to the array; each runs exactly once, in order.
 */
type Migration = {
  version: number;
  up: (db: SQLiteDatabase) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
          amount INTEGER NOT NULL CHECK (amount >= 0),
          description TEXT NOT NULL,
          category_id TEXT NOT NULL,
          date TEXT NOT NULL,
          payment_method TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (date);
        CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
        CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions (category_id);

        CREATE TABLE IF NOT EXISTS budgets (
          id TEXT PRIMARY KEY NOT NULL,
          category_id TEXT,
          limit_amount INTEGER NOT NULL CHECK (limit_amount >= 0),
          period TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets (period);
        -- One budget row per (period, category). NULL category = overall budget.
        CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_unique
          ON budgets (period, IFNULL(category_id, '__overall__'));
      `);
    },
  },
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version;');
  let current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      await db.withTransactionAsync(async () => {
        await migration.up(db);
      });
      // user_version can't be parameterized; version is a trusted integer literal.
      await db.execAsync(`PRAGMA user_version = ${migration.version};`);
      current = migration.version;
    }
  }
}

export const LATEST_SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
