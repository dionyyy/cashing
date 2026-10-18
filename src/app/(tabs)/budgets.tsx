import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { BudgetProgressCard } from '@/components/budgets/budget-progress-card';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { useBudgets } from '@/hooks/use-budgets';
import { usePalette } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';
import { monthLabel, periodKey } from '@/utils/date';
import { budgetProgress } from '@/utils/finance';

export default function BudgetsScreen() {
  const period = periodKey();
  const palette = usePalette();
  const budgets = useBudgets(period);
  const monthTx = useTransactions({ period });

  const { overall, categories } = useMemo(() => {
    const list = budgets.data ?? [];
    const tx = monthTx.data ?? [];
    const overallBudget = list.find((b) => b.categoryId === null);
    return {
      overall: overallBudget ? budgetProgress(overallBudget, tx) : null,
      categories: list
        .filter((b) => b.categoryId !== null)
        .map((b) => budgetProgress(b, tx)),
    };
  }, [budgets.data, monthTx.data]);

  const isLoading = budgets.isLoading || monthTx.isLoading;
  const hasBudgets = (budgets.data ?? []).length > 0;

  return (
    <ScreenContainer scroll>
      <View className="mb-4 mt-2 flex-row items-center justify-between">
        <View>
          <AppText variant="title">Budgets</AppText>
          <AppText variant="caption">{monthLabel(period)}</AppText>
        </View>
        <IconButton
          accessibilityLabel="Create budget"
          variant="surface"
          onPress={() => router.push('/budgets/edit')}
        >
          <Icon name="Plus" size={20} color={palette.foreground} />
        </IconButton>
      </View>

      {isLoading ? (
        <LoadingState />
      ) : budgets.isError ? (
        <ErrorState onRetry={() => budgets.refetch()} />
      ) : !hasBudgets ? (
        <EmptyState
          icon="Target"
          title="No budgets set"
          description="Create a monthly limit or category budgets to keep your spending on track."
          action={{ label: 'Create a budget', onPress: () => router.push('/budgets/edit') }}
        />
      ) : (
        <View className="gap-4">
          {overall ? (
            <View>
              <SectionHeader title="Overall" />
              <BudgetProgressCard
                progress={overall}
                onPress={() =>
                  router.push('/budgets/edit?categoryId=__overall__')
                }
              />
            </View>
          ) : null}

          {categories.length > 0 ? (
            <View>
              <SectionHeader title="By category" />
              <View className="gap-3">
                {categories.map((p) => (
                  <BudgetProgressCard
                    key={p.budget.id}
                    progress={p}
                    onPress={() =>
                      router.push(`/budgets/edit?categoryId=${p.budget.categoryId}`)
                    }
                  />
                ))}
              </View>
            </View>
          ) : null}

          <Button
            label="Add category budget"
            variant="secondary"
            onPress={() => router.push('/budgets/edit')}
            className="mt-2"
          />
        </View>
      )}
    </ScreenContainer>
  );
}
