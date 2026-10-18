import { getCurrency } from '@/constants/currencies';
import type { Minor } from '@/types';

/**
 * Money helpers. All stored amounts are integer MINOR units.
 * `toMinor` parses user decimal input; `formatMoney` renders for display.
 */

/** Convert a major-unit decimal (e.g. "12.50") to integer minor units. */
export function toMinor(major: number | string, decimals = 2): Minor {
  const value = typeof major === 'string' ? Number(major.replace(/,/g, '')) : major;
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  // Round to avoid 12.5 * 100 = 1249.9999 artifacts.
  return Math.round(value * factor);
}

/** Convert integer minor units back to a major-unit number. */
export function toMajor(minor: Minor, decimals = 2): number {
  return minor / 10 ** decimals;
}

/** Parse free-form currency text input into minor units. */
export function parseAmountInput(input: string, currencyCode = 'PHP'): Minor {
  const { decimals } = getCurrency(currencyCode);
  const cleaned = input.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;
  return toMinor(cleaned, decimals);
}

/** Format minor units as a localized currency string, e.g. "₱1,250.00". */
export function formatMoney(
  minor: Minor,
  currencyCode = 'PHP',
  opts: { withSign?: boolean; signed?: 1 | -1 } = {},
): string {
  const currency = getCurrency(currencyCode);
  const absMinor = Math.abs(minor);
  const major = toMajor(absMinor, currency.decimals);
  const body = major.toLocaleString('en-US', {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });

  const sign = opts.signed === -1 || (opts.signed === undefined && minor < 0) ? '-' : '';
  const plus = opts.withSign && minor >= 0 ? '+' : '';
  return `${plus}${sign}${currency.symbol}${body}`;
}

/** Compact form for charts/axes, e.g. "₱1.2k". */
export function formatCompactMoney(minor: Minor, currencyCode = 'PHP'): string {
  const currency = getCurrency(currencyCode);
  const major = toMajor(Math.abs(minor), currency.decimals);
  const sign = minor < 0 ? '-' : '';
  if (major >= 1_000_000) return `${sign}${currency.symbol}${(major / 1_000_000).toFixed(1)}M`;
  if (major >= 1_000) return `${sign}${currency.symbol}${(major / 1_000).toFixed(1)}k`;
  return `${sign}${currency.symbol}${Math.round(major)}`;
}
