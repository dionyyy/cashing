import { View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { getCategory } from '@/constants/categories';
import { useMoney } from '@/hooks/use-money';
import type { CategorySpend } from '@/types';

interface CategoryBarListProps {
  data: CategorySpend[];
  max?: number;
}

/** Ranked list of categories with proportional bars. */
export function CategoryBarList({ data, max }: CategoryBarListProps) {
  const { format } = useMoney();
  const peak = max ?? Math.max(1, ...data.map((d) => d.total));

  return (
    <View className="gap-4">
      {data.map((item) => {
        const category = getCategory(item.categoryId);
        const color = category?.color ?? '#6E7270';
        const pct = Math.round((item.total / peak) * 100);
        return (
          <View key={item.categoryId} className="gap-1.5">
            <View className="flex-row justify-between">
              <AppText variant="label">{category?.label ?? 'Other'}</AppText>
              <AppText variant="label">{format(item.total)}</AppText>
            </View>
            <View className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <View
                className="h-full rounded-full"
                style={{ width: `${Math.max(4, pct)}%`, backgroundColor: color }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
