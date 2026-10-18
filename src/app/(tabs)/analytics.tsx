import { useMemo } from "react";
import { View } from "react-native";

import { CategoryBarList } from "@/components/charts/category-bar-list";
import { DonutChart } from "@/components/charts/donut-chart";
import { TrendBars, type TrendDatum } from "@/components/charts/trend-bars";
import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { ScreenContainer } from "@/components/ui/screen-container";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState, LoadingState } from "@/components/ui/states";
import { useBudgets } from "@/hooks/use-budgets";
import { useMoney } from "@/hooks/use-money";
import { usePalette } from "@/hooks/use-theme";
import { useTransactions } from "@/hooks/use-transactions";
import { monthLabel, periodKey, periodOf, recentPeriods } from "@/utils/date";
import {
  budgetProgress,
  inPeriod,
  spendByCategory,
  summarize,
} from "@/utils/finance";

export default function AnalyticsScreen() {
  const period = periodKey();
  const palette = usePalette();
  const { format, formatCompact } = useMoney();

  const allTx = useTransactions();
  const budgets = useBudgets(period);

  const data = useMemo(() => allTx.data ?? [], [allTx.data]);
  const monthData = useMemo(() => inPeriod(data, period), [data, period]);
  const summary = useMemo(() => summarize(monthData), [monthData]);
  const categorySpend = useMemo(() => spendByCategory(monthData), [monthData]);

  const trend: TrendDatum[] = useMemo(() => {
    const periods = recentPeriods(6);
    return periods.map((p) => {
      const s = summarize(data.filter((t) => periodOf(t.date) === p));
      return { period: p, income: s.income, expense: s.expenses };
    });
  }, [data]);

  const overallBudget = (budgets.data ?? []).find((b) => b.categoryId === null);
  const overallProgress = overallBudget
    ? budgetProgress(overallBudget, monthData)
    : null;

  if (allTx.isLoading) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ScreenContainer scroll>
        <AppText variant="title" className="mb-4 mt-2">
          Insights
        </AppText>
        <EmptyState
          icon="ChartPie"
          title="No insights yet"
          description="Once you record transactions, your spending breakdown and trends will appear here."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <AppText variant="title" className="mb-1 mt-2">
        Insights
      </AppText>
      <AppText variant="caption" className="mb-4">
        {monthLabel(period)}
      </AppText>

      <Card>
        <SectionHeader title="Income vs expenses" />
        <View className="flex-row items-center justify-between">
          <DonutChart
            size={150}
            segments={[
              { value: summary.income, color: palette.positive },
              { value: summary.expenses, color: palette.negative },
            ]}
            centerLabel="Net"
            centerValue={formatCompact(summary.balance)}
          />
          <View className="gap-3">
            <LegendRow
              color={palette.positive}
              label="Income"
              value={format(summary.income)}
            />
            <LegendRow
              color={palette.negative}
              label="Expenses"
              value={format(summary.expenses)}
            />
            <LegendRow
              color={palette.primary}
              label="Net"
              value={format(summary.balance)}
            />
          </View>
        </View>
      </Card>

      <Card className="mt-4">
        <SectionHeader title="6-month trend" />
        <TrendBars data={trend} />
      </Card>

      {categorySpend.length > 0 ? (
        <Card className="mt-4">
          <SectionHeader title="Spending by category" />
          <CategoryBarList data={categorySpend} />
        </Card>
      ) : null}

      {overallProgress ? (
        <Card className="mt-4">
          <SectionHeader title="Budget utilization" />
          <View className="flex-row items-baseline justify-between">
            <AppText variant="title">
              {Math.round(
                (Number.isFinite(overallProgress.ratio)
                  ? overallProgress.ratio
                  : 1) * 100,
              )}
              %
            </AppText>
            <AppText variant="caption">
              {format(overallProgress.spent)} of{" "}
              {format(overallProgress.budget.limit)}
            </AppText>
          </View>
          <AppText variant="caption" className="mt-1">
            {overallProgress.overspent
              ? "You are over your monthly budget."
              : `${format(overallProgress.remaining)} remaining.`}
          </AppText>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-3 w-3 rounded-sm" style={{ backgroundColor: color }} />
      <View>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="label">{value}</AppText>
      </View>
    </View>
  );
}
