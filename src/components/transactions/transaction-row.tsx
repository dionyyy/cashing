import { Pressable, View } from 'react-native';

import { CategoryBadge } from '@/components/transactions/category-badge';
import { AppText } from '@/components/ui/app-text';
import { getCategory } from '@/constants/categories';
import { useMoney } from '@/hooks/use-money';
import type { Transaction } from '@/types';
import { friendlyDate } from '@/utils/date';

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: (t: Transaction) => void;
  showDate?: boolean;
}

export function TransactionRow({ transaction, onPress, showDate = true }: TransactionRowProps) {
  const { format } = useMoney();
  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';

  return (
    <Pressable
      onPress={() => onPress?.(transaction)}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${format(transaction.amount)}`}
      className="flex-row items-center gap-3 py-3 active:opacity-70"
    >
      <CategoryBadge categoryId={transaction.categoryId} />
      <View className="flex-1">
        <AppText variant="subtitle" numberOfLines={1}>
          {transaction.description}
        </AppText>
        <AppText variant="caption" numberOfLines={1}>
          {category?.label ?? 'Uncategorized'}
          {showDate ? ` · ${friendlyDate(transaction.date)}` : ''}
        </AppText>
      </View>
      <AppText
        variant="subtitle"
        className={isIncome ? 'text-positive' : 'text-foreground'}
      >
        {isIncome ? format(transaction.amount, { withSign: true }) : `-${format(transaction.amount)}`}
      </AppText>
    </Pressable>
  );
}
