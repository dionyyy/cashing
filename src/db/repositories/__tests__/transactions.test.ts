/**
 * Repository behavior tests using an in-memory fake of the expo-sqlite
 * surface. This verifies query construction, parameter binding, row
 * mapping, and CRUD semantics without needing native SQLite.
 */
import type { Transaction } from "@/types";

interface Row {
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

// A tiny fake DB that stores rows and emulates the subset of SQL the
// transactions repository issues (INSERT / UPDATE / DELETE / SELECT).
class FakeDb {
  rows: Row[] = [];

  async runAsync(sql: string, params: unknown[] = []) {
    if (sql.startsWith("INSERT INTO transactions")) {
      const [
        id,
        type,
        amount,
        description,
        category_id,
        date,
        payment_method,
        notes,
        created_at,
        updated_at,
      ] = params as never[];
      this.rows.push({
        id,
        type,
        amount,
        description,
        category_id,
        date,
        payment_method,
        notes,
        created_at,
        updated_at,
      });
      return { changes: 1, lastInsertRowId: 0 };
    }
    if (sql.startsWith("UPDATE transactions")) {
      const id = params[params.length - 1] as string;
      const row = this.rows.find((r) => r.id === id);
      if (!row) return { changes: 0, lastInsertRowId: 0 };
      const [
        type,
        amount,
        description,
        category_id,
        date,
        payment_method,
        notes,
        updated_at,
      ] = params as never[];
      Object.assign(row, {
        type,
        amount,
        description,
        category_id,
        date,
        payment_method,
        notes,
        updated_at,
      });
      return { changes: 1, lastInsertRowId: 0 };
    }
    if (sql.startsWith("DELETE FROM transactions")) {
      const id = params[0] as string;
      const before = this.rows.length;
      this.rows = this.rows.filter((r) => r.id !== id);
      return { changes: before - this.rows.length, lastInsertRowId: 0 };
    }
    return { changes: 0, lastInsertRowId: 0 };
  }

  async getFirstAsync<T>(
    _sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    const id = params[0] as string;
    return (this.rows.find((r) => r.id === id) as T) ?? null;
  }

  async getAllAsync<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    let result = [...this.rows];
    // Emulate the WHERE filters the repository constructs.
    const paramQueue = [...params];
    if (sql.includes("type = ?")) {
      const type = paramQueue.shift();
      result = result.filter((r) => r.type === type);
    }
    if (sql.includes("category_id = ?")) {
      const cat = paramQueue.shift();
      result = result.filter((r) => r.category_id === cat);
    }
    if (sql.includes("substr(date, 1, 7) = ?")) {
      const period = paramQueue.shift() as string;
      result = result.filter((r) => r.date.slice(0, 7) === period);
    }
    if (sql.includes("LIKE ?")) {
      const like = (paramQueue.shift() as string).replace(/%/g, "");
      result = result.filter(
        (r) => r.description.includes(like) || (r.notes ?? "").includes(like),
      );
    }
    result.sort((a, b) => (a.date < b.date ? 1 : -1));
    return result as T[];
  }
}

// Prefix with `mock` so Jest's hoisting rules allow referencing it in the factory.
const mockDb = new FakeDb();

jest.mock("@/db/client", () => ({
  getDatabase: async () => mockDb,
}));

// Import AFTER the mock is registered.
import {
    createTransaction,
    deleteTransaction,
    getTransaction,
    listTransactions,
    updateTransaction,
} from "@/db/repositories/transactions";

const base = {
  type: "expense" as const,
  amount: 12500,
  description: "Groceries",
  categoryId: "groceries",
  date: "2026-10-10",
  paymentMethod: "card" as const,
  notes: null,
};

beforeEach(() => {
  mockDb.rows = [];
});

describe("transactions repository", () => {
  it("creates and reads a transaction with correct mapping", async () => {
    const created = await createTransaction(base);
    expect(created.id).toBeTruthy();
    expect(created.amount).toBe(12500);
    expect(created.categoryId).toBe("groceries");
    expect(created.paymentMethod).toBe("card");

    const fetched = await getTransaction(created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.description).toBe("Groceries");
  });

  it("updates an existing transaction", async () => {
    const created = await createTransaction(base);
    const updated = await updateTransaction(created.id, {
      ...base,
      amount: 20000,
      description: "Groceries (updated)",
    });
    expect(updated.amount).toBe(20000);
    expect(updated.description).toBe("Groceries (updated)");
  });

  it("throws when updating a missing transaction", async () => {
    await expect(updateTransaction("does-not-exist", base)).rejects.toThrow();
  });

  it("deletes a transaction", async () => {
    const created = await createTransaction(base);
    await deleteTransaction(created.id);
    expect(await getTransaction(created.id)).toBeNull();
  });

  it("filters by type", async () => {
    await createTransaction(base);
    await createTransaction({
      ...base,
      type: "income",
      categoryId: "salary",
      amount: 500000,
    });
    const expenses = await listTransactions({ type: "expense" });
    const income = await listTransactions({ type: "income" });
    expect(expenses).toHaveLength(1);
    expect(income).toHaveLength(1);
    expect(income[0].type).toBe("income");
  });

  it("filters by period and search", async () => {
    await createTransaction({
      ...base,
      date: "2026-10-05",
      description: "Coffee",
    });
    await createTransaction({
      ...base,
      date: "2026-09-05",
      description: "Tea",
    });
    const october = await listTransactions({ period: "2026-10" });
    expect(october).toHaveLength(1);

    const search = await listTransactions({ search: "Coffee" });
    expect(search).toHaveLength(1);
    expect((search[0] as Transaction).description).toBe("Coffee");
  });
});
