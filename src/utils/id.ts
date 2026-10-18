/**
 * Lightweight unique id generator. Avoids pulling in a uuid dependency
 * and is sufficient for local primary keys.
 */
export function createId(prefix = 'txn'): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${time}${rand}`;
}
