import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { CategoryBarList } from '@/components/charts/category-bar-list';
import { BalanceCard } from '@/components/dashboard/balance-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { useBudgets } from '@/hooks/use-budgets';
import { useTransactions } from '@/hooks/use-transactions';
import { greeting, monthLabel, periodKey } from '@/utils/date';
import {
  budgetProgress,
  inPeriod,
  spendByCategory,
  summarize,
} from '@/utils/finance';
import { ProgressBar } from '@/components/ui/progress-bar';
import { useMoney } from '@/hooks/use-money';

export default function DashboardScreen() {
  const period = periodKey();
  const { format } = useMoney();

  const allTx = useTransactions();
  const monthTx = useTransactions({ period });
  const budgets = useBudgets(period);

  const summary = useMemo(() => summarize(monthTx.data ?? []), [monthTx.data]);
  const categorySpend = useMemo(
    () => spendByCategory(monthTx.data ?? []).slice(0, 4),
    [monthTx.data],
  );
  const recent = useMemo(() => (allTx.data ?? []).slice(0, 5), [allTx.data]);

  const overallBudget = (budgets.data ?? []).find((b) => b.categoryId === null);
  const overallProgress = overallBudget
    ? budgetProgress(overallBudget, inPeriod(monthTx.data ?? [], period))
    : null;

  if (allTx.isLoading || monthTx.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState label="Loading your dashboard…" />
      </ScreenContainer>
    );
  }

  if (allTx.isError) {
    return (
      <ScreenContainer>
        <ErrorState onRetry={() => allTx.refetch()} />
      </ScreenContainer>
    );
  }

  const hasData = (allTx.data ?? []).length > 0;

  return (
    <ScreenContainer scroll>
      <View className="mb-5 mt-2 flex-row items-center justify-between">
        <View>
          <AppText variant="caption">{greeting()}</AppText>
          <AppText variant="title">Cashing</AppText>
        </View>
      </View>

      <BalanceCard summary={summary} monthLabel={monthLabel(period)} />

      <View className="mt-4">
        <QuickActions
          actions={[
            {
              key: 'income',
              label: 'Add Income',
              icon: 'Plus',
              tone: 'positive',
              onPress: () => router.push('/transactions/new?type=income'),
            },
            {
              key: 'expense',
              label: 'Add Expense',
              icon: 'Minus',
              tone: 'negative',
              onPress: () => router.push('/transactions/new?type=expense'),
            },
            {
              key: 'budgets',
              label: 'Budgets',
              icon: 'Target',
              tone: 'neutral',
              onPress: () => router.push('/budgets'),
            },
          ]}
        />
      </View>

      {!hasData ? (
        <View className="mt-6">
          <EmptyState
            icon="Sparkles"
            title="Welcome to Cashing"
            description="Track your income and expenses to see your balance, budgets, and spending insights come to life."
            action={{
              label: 'Add your first transaction',
              onPress: () => router.push('/transactions/new?type=expense'),
            }}
          />
        </View>
      ) : (
        <>
          {overallProgress ? (
            <Card className="mt-6">
              <SectionHeader
                title="Monthly budget"
                actionLabel="Manage"
                onAction={() => router.push('/budgets')}
              />
              <View className="flex-row items-baseline justify-between">
                <AppText variant="title">{format(overallProgress.spent)}</AppText>
                <AppText variant="caption">of {format(overallProgress.budget.limit)}</AppText>
              </View>
              <ProgressBar
                ratio={overallProgress.ratio}
                fillClassName={overallProgress.overspent ? 'bg-negative' : 'bg-primary'}
                className="mt-3"
              />
              <AppText
                variant="caption"
                className={overallProgress.overspent ? 'mt-2 text-negative' : 'mt-2'}
              >
                {overallProgress.overspent
                  ? `${format(Math.abs(overallProgress.remaining))} over budget`
                  : `${format(overallProgress.remaining)} remaining this month`}
              </AppText>
            </Card>
          ) : null}

          {categorySpend.length > 0 ? (
            <Card className="mt-4">
              <SectionHeader
                title="Top spending"
                actionLabel="Insights"
                onAction={() => router.push('/analytics')}
              />
              <CategoryBarList data={categorySpend} />
            </Card>
          ) : null}

          <View className="mt-6">
            <SectionHeader
              title="Recent activity"
              actionLabel="See all"
              onAction={() => router.push('/transactions')}
            />
            <Card className="py-1">
              {recent.map((t, i) => (
                <View key={t.id}>
                  <TransactionRow
                    transaction={t}
                    onPress={(tx) => router.push(`/transactions/${tx.id}`)}
                  />
                  {i < recent.length - 1 ? <View className="h-px bg-border" /> : null}
                </View>
              ))}
            </Card>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}
