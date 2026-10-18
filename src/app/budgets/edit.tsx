import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryBadge } from '@/components/transactions/category-badge';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { confirm } from '@/components/ui/confirm';
import { Icon } from '@/components/ui/icon';
import { IconButton } from '@/components/ui/icon-button';
import { TextField } from '@/components/ui/text-field';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { getCurrency } from '@/constants/currencies';
import { useBudgets, useDeleteBudget, useUpsertBudget } from '@/hooks/use-budgets';
import { usePalette } from '@/hooks/use-theme';
import { budgetFormSchema, type BudgetFormValues } from '@/schemas/budget';
import { useSettingsStore } from '@/stores/settings-store';
import { monthLabel, periodKey } from '@/utils/date';
import { parseAmountInput, toMajor } from '@/utils/money';

const OVERALL = '__overall__';

export default function BudgetEditScreen() {
  const palette = usePalette();
  const period = periodKey();
  const currency = useSettingsStore((s) => s.currency);
  const symbol = getCurrency(currency).symbol;

  const params = useLocalSearchParams<{ categoryId?: string }>();
  const budgets = useBudgets(period);
  const upsert = useUpsertBudget();
  const remove = useDeleteBudget();

  // Resolve which budget we are editing (if any).
  const targetCategoryId =
    params.categoryId === OVERALL ? null : (params.categoryId ?? null);

  const existing = useMemo(
    () =>
      (budgets.data ?? []).find((b) =>
        params.categoryId ? b.categoryId === targetCategoryId : false,
      ),
    [budgets.data, params.categoryId, targetCategoryId],
  );

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: existing ? existing.categoryId : params.categoryId ? targetCategoryId : null,
      limit: existing ? String(toMajor(existing.limit)) : '',
      period,
    },
  });

  const selectedCategory = watch('categoryId');

  const submit = (values: BudgetFormValues) => {
    upsert.mutate(
      {
        categoryId: values.categoryId,
        limit: parseAmountInput(values.limit, currency),
        period: values.period,
      },
      { onSuccess: () => router.back() },
    );
  };

  const handleDelete = async () => {
    if (!existing) return;
    const ok = await confirm({
      title: 'Delete budget?',
      message: 'This removes the spending limit for this period.',
      confirmLabel: 'Delete',
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(existing.id, { onSuccess: () => router.back() });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="flex-row items-center justify-between px-5 py-3">
        <AppText variant="heading">{existing ? 'Edit budget' : 'New budget'}</AppText>
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <Icon name="X" size={22} color={palette.foreground} />
        </IconButton>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-5 pb-10 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="caption">For {monthLabel(period)}</AppText>

          <View className="gap-2">
            <AppText variant="label">Scope</AppText>
            <View className="flex-row flex-wrap gap-2">
              <ScopeChip
                label="Overall monthly"
                active={selectedCategory === null}
                onPress={() => setValue('categoryId', null)}
              />
            </View>
            <View className="mt-1 flex-row flex-wrap gap-2">
              {EXPENSE_CATEGORIES.map((c) => {
                const active = selectedCategory === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setValue('categoryId', c.id)}
                    className={`flex-row items-center gap-2 rounded-full border px-2.5 py-1.5 active:opacity-70 ${
                      active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                    }`}
                  >
                    <CategoryBadge categoryId={c.id} size={24} />
                    <AppText variant="caption" className={active ? 'text-primary' : undefined}>
                      {c.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Controller
            control={control}
            name="limit"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Monthly limit"
                placeholder="0.00"
                keyboardType="decimal-pad"
                leftAdornment={symbol}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.limit?.message}
                className="text-2xl font-bold"
              />
            )}
          />

          <Button
            label={existing ? 'Save budget' : 'Create budget'}
            size="lg"
            loading={upsert.isPending}
            onPress={handleSubmit(submit)}
            className="mt-2"
          />

          {existing ? (
            <Button
              label="Delete budget"
              variant="ghost"
              onPress={handleDelete}
              loading={remove.isPending}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ScopeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-3.5 py-2 active:opacity-70 ${
        active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      }`}
    >
      <AppText variant="label" className={active ? 'text-primary' : undefined}>
        {label}
      </AppText>
    </Pressable>
  );
}
