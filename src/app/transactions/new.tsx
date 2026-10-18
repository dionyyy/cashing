import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionForm } from '@/features/transactions/transaction-form';
import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { useCreateTransaction } from '@/hooks/use-transactions';
import { usePalette } from '@/hooks/use-theme';
import type { TransactionType } from '@/types';

export default function NewTransactionScreen() {
  const palette = usePalette();
  const params = useLocalSearchParams<{ type?: string }>();
  const create = useCreateTransaction();

  const initialType: TransactionType = params.type === 'income' ? 'income' : 'expense';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3">
        <AppText variant="heading">New transaction</AppText>
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <Icon name="X" size={22} color={palette.foreground} />
        </IconButton>
      </View>

      <TransactionForm
        submitLabel="Save transaction"
        submitting={create.isPending}
        defaultValues={{ type: initialType }}
        onSubmit={(payload) =>
          create.mutate(payload, {
            onSuccess: () => router.back(),
          })
        }
      />
    </SafeAreaView>
  );
}
