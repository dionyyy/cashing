import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

import { TransactionRow } from "@/components/transactions/transaction-row";
import { AppText } from "@/components/ui/app-text";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ScreenContainer } from "@/components/ui/screen-container";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { TextField } from "@/components/ui/text-field";
import { useMoney } from "@/hooks/use-money";
import { usePalette } from "@/hooks/use-theme";
import { useTransactions } from "@/hooks/use-transactions";
import type { Transaction, TransactionType } from "@/types";
import { friendlyDate } from "@/utils/date";
import { summarize } from "@/utils/finance";

type FilterType = "all" | TransactionType;

export default function TransactionsScreen() {
  const palette = usePalette();
  const { format } = useMoney();
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const query = useTransactions({
    type: filter === "all" ? undefined : filter,
    search: search || undefined,
  });

  const transactions = useMemo(() => query.data ?? [], [query.data]);
  const summary = useMemo(() => summarize(transactions), [transactions]);

  // Group by date for a clean sectioned list.
  const sections = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of transactions) {
      const list = groups.get(t.date) ?? [];
      list.push(t);
      groups.set(t.date, list);
    }
    return [...groups.entries()].map(([date, items]) => ({ date, items }));
  }, [transactions]);

  return (
    <ScreenContainer>
      <View className="mb-4 mt-2 flex-row items-center justify-between">
        <AppText variant="title">Activity</AppText>
        <View className="flex-row gap-1">
          <IconButton
            accessibilityLabel="Search transactions"
            variant="surface"
            onPress={() => setShowSearch((s) => !s)}
          >
            <Icon name="Search" size={20} color={palette.foreground} />
          </IconButton>
          <IconButton
            accessibilityLabel="Add transaction"
            variant="surface"
            onPress={() => router.push("/transactions/new?type=expense")}
          >
            <Icon name="Plus" size={20} color={palette.foreground} />
          </IconButton>
        </View>
      </View>

      {showSearch ? (
        <TextField
          placeholder="Search descriptions and notes"
          value={search}
          onChangeText={setSearch}
          autoFocus
          leftAdornment="🔍"
          containerClassName="mb-3"
          returnKeyType="search"
        />
      ) : null}

      <SegmentedControl<FilterType>
        segments={[
          { value: "all", label: "All" },
          { value: "income", label: "Income" },
          { value: "expense", label: "Expenses" },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <Card className="mt-3 flex-row justify-between py-3">
        <SummaryBit
          label="Income"
          value={format(summary.income)}
          tone="positive"
        />
        <View className="w-px bg-border" />
        <SummaryBit
          label="Expenses"
          value={format(summary.expenses)}
          tone="negative"
        />
        <View className="w-px bg-border" />
        <SummaryBit
          label="Net"
          value={format(summary.balance)}
          tone="neutral"
        />
      </Card>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="Receipt"
          title={search ? "No matches" : "No transactions yet"}
          description={
            search
              ? "Try a different search term or filter."
              : "Add income or expenses to start tracking your money."
          }
        />
      ) : (
        <FlatList
          className="mt-3"
          data={sections}
          keyExtractor={(s) => s.date}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-28"
          renderItem={({ item: section }) => (
            <View className="mb-4">
              <AppText
                variant="caption"
                className="mb-1 font-semibold uppercase tracking-wide"
              >
                {friendlyDate(section.date)}
              </AppText>
              <Card className="py-1">
                {section.items.map((t, i) => (
                  <Pressable key={t.id}>
                    <TransactionRow
                      transaction={t}
                      showDate={false}
                      onPress={(tx) => router.push(`/transactions/${tx.id}`)}
                    />
                    {i < section.items.length - 1 ? (
                      <View className="h-px bg-border" />
                    ) : null}
                  </Pressable>
                ))}
              </Card>
            </View>
          )}
        />
      )}
    </ScreenContainer>
  );
}

function SummaryBit({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "negative" | "neutral";
}) {
  const color =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-foreground";
  return (
    <View className="flex-1 items-center">
      <AppText variant="caption">{label}</AppText>
      <AppText className={`mt-0.5 text-sm font-bold ${color}`}>{value}</AppText>
    </View>
  );
}
