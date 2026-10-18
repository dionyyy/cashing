import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { useMoney } from '@/hooks/use-money';
import type { BalanceSummary } from '@/types';

interface BalanceCardProps {
  summary: BalanceSummary;
  monthLabel: string;
}

/**
 * Hero balance card. Uses the primary green surface with high-contrast
 * number hierarchy and inline income/expense chips.
 */
export function BalanceCard({ summary, monthLabel }: BalanceCardProps) {
  const { format } = useMoney();
  return (
    <View className="overflow-hidden rounded-3xl bg-primary p-5">
      <AppText className="text-sm font-medium text-primary-foreground/80">
        Available balance · {monthLabel}
      </AppText>
      <AppText className="mt-1 text-4xl font-extrabold tracking-tight text-primary-foreground">
        {format(summary.balance)}
      </AppText>

      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-2xl bg-white/15 px-3 py-2.5">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <Icon name="ArrowDownLeft" size={16} color="#fff" />
          </View>
          <View>
            <AppText className="text-xs text-primary-foreground/80">Income</AppText>
            <AppText className="text-sm font-semibold text-primary-foreground">
              {format(summary.income)}
            </AppText>
          </View>
        </View>

        <View className="flex-1 flex-row items-center gap-2 rounded-2xl bg-black/15 px-3 py-2.5">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <Icon name="ArrowUpRight" size={16} color="#fff" />
          </View>
          <View>
            <AppText className="text-xs text-primary-foreground/80">Expenses</AppText>
            <AppText className="text-sm font-semibold text-primary-foreground">
              {format(summary.expenses)}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
}
