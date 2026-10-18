import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { usePalette } from '@/hooks/use-theme';
import { shortMonth } from '@/utils/date';
import type { Minor } from '@/types';

export interface TrendDatum {
  period: string;
  income: Minor;
  expense: Minor;
}

/** Grouped income/expense bars across recent months, CSS-only (no SVG). */
export function TrendBars({ data }: { data: TrendDatum[] }) {
  const palette = usePalette();
  const peak = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const maxBarHeight = 120;

  return (
    <View>
      <View className="flex-row items-end justify-between" style={{ height: maxBarHeight }}>
        {data.map((d) => {
          const incomeH = Math.round((d.income / peak) * maxBarHeight);
          const expenseH = Math.round((d.expense / peak) * maxBarHeight);
          return (
            <View key={d.period} className="flex-1 flex-row items-end justify-center gap-1">
              <View
                className="w-2.5 rounded-t-md"
                style={{ height: Math.max(2, incomeH), backgroundColor: palette.positive }}
              />
              <View
                className="w-2.5 rounded-t-md"
                style={{ height: Math.max(2, expenseH), backgroundColor: palette.negative }}
              />
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row justify-between">
        {data.map((d) => (
          <View key={d.period} className="flex-1 items-center">
            <AppText variant="caption">{shortMonth(d.period)}</AppText>
          </View>
        ))}
      </View>
      <View className="mt-3 flex-row justify-center gap-4">
        <Legend color={palette.positive} label="Income" />
        <Legend color={palette.negative} label="Expenses" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5">
      <View className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}
