import { getDatabase } from '@/db/client';
import type { Budget, NewBudget } from '@/types';
import { createId } from '@/utils/id';

interface BudgetRow {
  id: string;
  category_id: string | null;
  limit_amount: number;
  period: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: BudgetRow): Budget {
  return {
    id: row.id,
    categoryId: row.category_id ?? null,
    limit: row.limit_amount,
    period: row.period,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBudgets(period?: string): Promise<Budget[]> {
  const db = await getDatabase();
  if (period) {
    const rows = await db.getAllAsync<BudgetRow>(
      'SELECT * FROM budgets WHERE period = ? ORDER BY category_id IS NOT NULL, category_id;',
      [period],
    );
    return rows.map(mapRow);
  }
  const rows = await db.getAllAsync<BudgetRow>(
    'SELECT * FROM budgets ORDER BY period DESC;',
  );
  return rows.map(mapRow);
}

export async function getBudget(id: string): Promise<Budget | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BudgetRow>('SELECT * FROM budgets WHERE id = ?;', [id]);
  return row ? mapRow(row) : null;
}

/**
 * Upsert a budget for a (period, category) pair. Uses a DB-level unique
 * index so the overall budget and each category budget stay singular.
 */
export async function upsertBudget(input: NewBudget): Promise<Budget> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const existing = await db.getFirstAsync<BudgetRow>(
    `SELECT * FROM budgets
     WHERE period = ? AND IFNULL(category_id, '__overall__') = IFNULL(?, '__overall__');`,
    [input.period, input.categoryId],
  );

  if (existing) {
    await db.runAsync(
      'UPDATE budgets SET limit_amount = ?, updated_at = ? WHERE id = ?;',
      [input.limit, now, existing.id],
    );
    const updated = await getBudget(existing.id);
    if (!updated) throw new Error('Failed to load updated budget');
    return updated;
  }

  const id = createId('bgt');
  await db.runAsync(
    `INSERT INTO budgets (id, category_id, limit_amount, period, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [id, input.categoryId, input.limit, input.period, now, now],
  );
  const created = await getBudget(id);
  if (!created) throw new Error('Failed to create budget');
  return created;
}

export async function deleteBudget(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE id = ?;', [id]);
}
