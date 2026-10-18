import { useCallback } from 'react';

import { useSettingsStore } from '@/stores/settings-store';
import type { Minor } from '@/types';
import { formatCompactMoney, formatMoney, parseAmountInput } from '@/utils/money';

/** Currency-aware money helpers bound to the user's selected currency. */
export function useMoney() {
  const currency = useSettingsStore((s) => s.currency);

  const format = useCallback(
    (minor: Minor, opts?: { withSign?: boolean; signed?: 1 | -1 }) =>
      formatMoney(minor, currency, opts),
    [currency],
  );

  const formatCompact = useCallback(
    (minor: Minor) => formatCompactMoney(minor, currency),
    [currency],
  );

  const parse = useCallback((input: string) => parseAmountInput(input, currency), [currency]);

  return { currency, format, formatCompact, parse };
}
