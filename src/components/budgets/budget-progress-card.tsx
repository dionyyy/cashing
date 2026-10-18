import { Pressable, View } from 'react-native';

import { CategoryBadge } from '@/components/transactions/category-badge';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getCategory } from '@/constants/categories';
import { useMoney } from '@/hooks/use-money';
import { usePalette } from '@/hooks/use-theme';
import type { BudgetProgress } from '@/types';

interface BudgetProgressCardProps {
  progress: BudgetProgress;
  onPress?: (p: BudgetProgress) => void;
}

export function BudgetProgressCard({ progress, onPress }: BudgetProgressCardProps) {
  const { format } = useMoney();
  const palette = usePalette();
  const { budget, spent, remaining, ratio, overspent } = progress;

  const isOverall = budget.categoryId === null;
  const category = getCategory(budget.categoryId);
  const title = isOverall ? 'Overall budget' : category?.label ?? 'Category';

  const nearLimit = !overspent && ratio >= 0.8;
  const fillClass = overspent ? 'bg-negative' : nearLimit ? 'bg-warning' : 'bg-primary';

  return (
    <Pressable onPress={() => onPress?.(progress)} className="active:opacity-80">
      <Card>
        <View className="flex-row items-center gap-3">
          {isOverall ? (
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
              <Icon name="Target" size={20} color={palette.primary} />
            </View>
          ) : (
            <CategoryBadge categoryId={budget.categoryId as string} />
          )}
          <View className="flex-1">
            <AppText variant="subtitle">{title}</AppText>
            <AppText variant="caption">
              {format(spent)} of {format(budget.limit)}
            </AppText>
          </View>
          {overspent ? (
            <View className="flex-row items-center gap-1 rounded-full bg-negative/10 px-2 py-1">
              <Icon name="TriangleAlert" size={12} color={palette.negative} />
              <AppText className="text-xs font-semibold text-negative">Over</AppText>
            </View>
          ) : null}
        </View>

        <ProgressBar ratio={ratio} fillClassName={fillClass} className="mt-3" />

        <View className="mt-2 flex-row justify-between">
          <AppText variant="caption">
            {Math.round((Number.isFinite(ratio) ? ratio : 1) * 100)}% used
          </AppText>
          <AppText
            variant="caption"
            className={overspent ? 'font-semibold text-negative' : 'font-medium text-foreground'}
          >
            {overspent ? `${format(Math.abs(remaining))} over` : `${format(remaining)} left`}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}
