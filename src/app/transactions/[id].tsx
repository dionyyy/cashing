import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/transactions/category-badge';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { confirm } from '@/components/ui/confirm';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ErrorState, LoadingState } from '@/components/ui/states';
import { getCategory, PAYMENT_METHODS } from '@/constants/categories';
import { TransactionForm } from '@/features/transactions/transaction-form';
import { useMoney } from '@/hooks/use-money';
import { usePalette } from '@/hooks/use-theme';
import {
  useDeleteTransaction,
  useTransaction,
  useUpdateTransaction,
} from '@/hooks/use-transactions';
import { friendlyDate } from '@/utils/date';
import { toMajor } from '@/utils/money';

export default function TransactionDetailScreen() {
  const palette = usePalette();
  const { format } = useMoney();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [editing, setEditing] = useState(false);

  const query = useTransaction(id);
  const update = useUpdateTransaction();
  const remove = useDeleteTransaction();

  const transaction = query.data;

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete transaction?',
      message: 'This will remove it from your records and update your balance.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok || !id) return;
    remove.mutate(id, { onSuccess: () => router.back() });
  };

  if (query.isLoading) {
    return (
      <Shell title="Transaction">
        <LoadingState />
      </Shell>
    );
  }

  if (query.isError || !transaction) {
    return (
      <Shell title="Transaction">
        <ErrorState message="This transaction could not be found." />
      </Shell>
    );
  }

  if (editing) {
    return (
      <Shell title="Edit transaction" onClose={() => setEditing(false)} closeIcon="ChevronLeft">
        <TransactionForm
          submitLabel="Save changes"
          submitting={update.isPending}
          defaultValues={{
            type: transaction.type,
            amount: String(toMajor(transaction.amount)),
            description: transaction.description,
            categoryId: transaction.categoryId,
            date: transaction.date,
            paymentMethod: transaction.paymentMethod,
            notes: transaction.notes ?? '',
          }}
          onSubmit={(payload) =>
            update.mutate(
              { id: transaction.id, input: payload },
              { onSuccess: () => setEditing(false) },
            )
          }
        />
      </Shell>
    );
  }

  const category = getCategory(transaction.categoryId);
  const isIncome = transaction.type === 'income';
  const paymentLabel = PAYMENT_METHODS.find((p) => p.id === transaction.paymentMethod)?.label;

  return (
    <Shell
      title="Transaction"
      onClose={() => router.back()}
      closeIcon="ChevronLeft"
      action={
        <IconButton accessibilityLabel="Edit" onPress={() => setEditing(true)}>
          <Icon name="Pencil" size={20} color={palette.foreground} />
        </IconButton>
      }
    >
      <View className="px-5 pt-4">
        <View className="items-center gap-3 py-6">
          <CategoryBadge categoryId={transaction.categoryId} size={64} />
          <AppText
            className={`text-4xl font-extrabold ${isIncome ? 'text-positive' : 'text-foreground'}`}
          >
            {isIncome ? format(transaction.amount, { withSign: true }) : `-${format(transaction.amount)}`}
          </AppText>
          <AppText variant="heading">{transaction.description}</AppText>
        </View>

        <Card className="gap-0 py-0">
          <DetailRow label="Type" value={isIncome ? 'Income' : 'Expense'} />
          <Divider />
          <DetailRow label="Category" value={category?.label ?? 'Uncategorized'} />
          <Divider />
          <DetailRow label="Date" value={friendlyDate(transaction.date)} />
          {paymentLabel ? (
            <>
              <Divider />
              <DetailRow label="Payment" value={paymentLabel} />
            </>
          ) : null}
          {transaction.notes ? (
            <>
              <Divider />
              <DetailRow label="Notes" value={transaction.notes} />
            </>
          ) : null}
        </Card>

        <Button
          label="Delete transaction"
          variant="danger"
          loading={remove.isPending}
          onPress={handleDelete}
          className="mt-6"
          leftIcon={<Icon name="Trash2" size={18} color="#fff" />}
        />
      </View>
    </Shell>
  );
}

function Shell({
  title,
  children,
  onClose,
  closeIcon = 'X',
  action,
}: {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  closeIcon?: string;
  action?: React.ReactNode;
}) {
  const palette = usePalette();
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-3 py-2">
        {onClose ? (
          <IconButton accessibilityLabel="Back" onPress={onClose}>
            <Icon name={closeIcon} size={24} color={palette.foreground} />
          </IconButton>
        ) : (
          <View className="h-11 w-11" />
        )}
        <AppText variant="heading">{title}</AppText>
        {action ?? <View className="h-11 w-11" />}
      </View>
      {children}
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <AppText variant="label" muted>
        {label}
      </AppText>
      <AppText variant="label" className="max-w-[60%] text-right">
        {value}
      </AppText>
    </View>
  );
}

function Divider() {
  return <View className="h-px bg-border" />;
}
