export interface CurrencyDef {
  code: string;
  symbol: string;
  label: string;
  /** Number of minor-unit decimal places (2 for most, 0 for JPY). */
  decimals: number;
}

export const CURRENCIES: CurrencyDef[] = [
  { code: 'PHP', symbol: '₱', label: 'Philippine Peso', decimals: 2 },
  { code: 'USD', symbol: '$', label: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', label: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'British Pound', decimals: 2 },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', decimals: 0 },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar', decimals: 2 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', decimals: 2 },
];

export const DEFAULT_CURRENCY = 'PHP';

const CURRENCY_MAP: Record<string, CurrencyDef> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
);

export function getCurrency(code: string): CurrencyDef {
  return CURRENCY_MAP[code] ?? CURRENCY_MAP[DEFAULT_CURRENCY];
}
