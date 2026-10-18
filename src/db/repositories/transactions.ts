import { getDatabase } from '@/db/client';
import type { NewTransaction, PaymentMethod, Transaction, TransactionType } from '@/types';
import { createId } from '@/utils/id';

interface TransactionRow {
  id: string;
  type: string;
  amount: number;
  description: string;
  category_id: string;
  date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    amount: row.amount,
    description: row.description,
    categoryId: row.category_id,
    date: row.date,
    paymentMethod: (row.payment_method as PaymentMethod | null) ?? null,
    notes: row.notes ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TransactionFilter {
  type?: TransactionType;
  categoryId?: string;
  period?: string; // YYYY-MM
  search?: string;
}

export async function listTransactions(
  filter: TransactionFilter = {},
): Promise<Transaction[]> {
  const db = await getDatabase();
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (filter.type) {
    where.push('type = ?');
    params.push(filter.type);
  }
  if (filter.categoryId) {
    where.push('category_id = ?');
    params.push(filter.categoryId);
  }
  if (filter.period) {
    where.push('substr(date, 1, 7) = ?');
    params.push(filter.period);
  }
  if (filter.search && filter.search.trim()) {
    where.push('(description LIKE ? OR notes LIKE ?)');
    const like = `%${filter.search.trim()}%`;
    params.push(like, like);
  }

  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = await db.getAllAsync<TransactionRow>(
    `SELECT * FROM transactions ${clause} ORDER BY date DESC, created_at DESC;`,
    params,
  );
  return rows.map(mapRow);
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE id = ?;',
    [id],
  );
  return row ? mapRow(row) : null;
}

export async function createTransaction(input: NewTransaction): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = createId('txn');

  await db.runAsync(
    `INSERT INTO transactions
      (id, type, amount, description, category_id, date, payment_method, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      id,
      input.type,
      input.amount,
      input.description,
      input.categoryId,
      input.date,
      input.paymentMethod,
      input.notes,
      now,
      now,
    ],
  );

  const created = await getTransaction(id);
  if (!created) throw new Error('Failed to create transaction');
  return created;
}

export async function updateTransaction(
  id: string,
  input: NewTransaction,
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();

  const result = await db.runAsync(
    `UPDATE transactions SET
      type = ?, amount = ?, description = ?, category_id = ?,
      date = ?, payment_method = ?, notes = ?, updated_at = ?
     WHERE id = ?;`,
    [
      input.type,
      input.amount,
      input.description,
      input.categoryId,
      input.date,
      input.paymentMethod,
      input.notes,
      now,
      id,
    ],
  );

  if (result.changes === 0) throw new Error(`Transaction ${id} not found`);
  const updated = await getTransaction(id);
  if (!updated) throw new Error('Failed to load updated transaction');
  return updated;
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
}
