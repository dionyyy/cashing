import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { CategorySelector } from '@/components/transactions/category-selector';
import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { PAYMENT_METHODS } from '@/constants/categories';
import { getCurrency } from '@/constants/currencies';
import { useMoney } from '@/hooks/use-money';
import { usePalette } from '@/hooks/use-theme';
import { transactionFormSchema, type TransactionFormValues } from '@/schemas/transaction';
import { useSettingsStore } from '@/stores/settings-store';
import type { NewTransaction, PaymentMethod, TransactionType } from '@/types';
import { friendlyDate, todayISO } from '@/utils/date';
import { parseAmountInput } from '@/utils/money';

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormValues>;
  submitLabel: string;
  onSubmit: (value: NewTransaction) => void;
  submitting?: boolean;
}

export function TransactionForm({
  defaultValues,
  submitLabel,
  onSubmit,
  submitting,
}: TransactionFormProps) {
  const palette = usePalette();
  const currency = useSettingsStore((s) => s.currency);
  const { currency: currencyCode } = useMoney();
  const symbol = getCurrency(currency).symbol;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      description: '',
      categoryId: '',
      date: todayISO(),
      paymentMethod: null,
      notes: '',
      ...defaultValues,
    },
  });

  const type = watch('type');
  const selectedPayment = watch('paymentMethod');
  const selectedDate = watch('date');

  const submit = (values: TransactionFormValues) => {
    const payload: NewTransaction = {
      type: values.type,
      amount: parseAmountInput(values.amount, currencyCode),
      description: values.description.trim(),
      categoryId: values.categoryId,
      date: values.date,
      paymentMethod: values.paymentMethod ?? null,
      notes: values.notes?.trim() ? values.notes.trim() : null,
    };
    onSubmit(payload);
  };

  return (
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
        <Controller
          control={control}
          name="type"
          render={({ field: { value, onChange } }) => (
            <SegmentedControl<TransactionType>
              segments={[
                { value: 'expense', label: 'Expense' },
                { value: 'income', label: 'Income' },
              ]}
              value={value}
              onChange={(next) => {
                onChange(next);
                // Reset category when switching type so it stays valid.
                setValue('categoryId', '');
              }}
              activeClassName={value === 'income' ? 'bg-positive' : 'bg-negative'}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Amount"
              placeholder="0.00"
              keyboardType="decimal-pad"
              leftAdornment={symbol}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.amount?.message}
              className="text-2xl font-bold"
            />
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextField
              label="Description"
              placeholder="e.g. Lunch at the office"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.description?.message}
            />
          )}
        />

        <View className="gap-1.5">
          <AppText variant="label">Category</AppText>
          <Controller
            control={control}
            name="categoryId"
            render={({ field: { value, onChange } }) => (
              <CategorySelector type={type} value={value || null} onChange={onChange} />
            )}
          />
          {errors.categoryId ? (
            <AppText className="text-xs text-negative">{errors.categoryId.message}</AppText>
          ) : null}
        </View>

        <View className="gap-1.5">
          <AppText variant="label">Date</AppText>
          <View className="flex-row flex-wrap gap-2">
            <DateChip
              label="Today"
              active={selectedDate === todayISO()}
              onPress={() => setValue('date', todayISO())}
            />
            <DateChip
              label="Yesterday"
              active={selectedDate === yesterdayISO()}
              onPress={() => setValue('date', yesterdayISO())}
            />
            <View className="flex-1 justify-center rounded-xl border border-border bg-surface px-3.5 py-3">
              <AppText variant="label" className="text-muted-foreground">
                {friendlyDate(selectedDate)}
              </AppText>
            </View>
          </View>
          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <TextField
                placeholder="YYYY-MM-DD"
                value={value}
                onChangeText={onChange}
                error={errors.date?.message}
                autoCapitalize="none"
                containerClassName="mt-1"
              />
            )}
          />
        </View>

        <View className="gap-1.5">
          <AppText variant="label">Payment method</AppText>
          <View className="flex-row flex-wrap gap-2">
            {PAYMENT_METHODS.map((pm) => {
              const active = selectedPayment === pm.id;
              return (
                <Pressable
                  key={pm.id}
                  onPress={() => setValue('paymentMethod', active ? null : (pm.id as PaymentMethod))}
                  className={`flex-row items-center gap-1.5 rounded-full border px-3 py-2 active:opacity-70 ${
                    active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                  }`}
                >
                  <Icon
                    name={pm.icon}
                    size={14}
                    color={active ? palette.primary : palette.mutedForeground}
                  />
                  <AppText variant="caption" className={active ? 'text-primary' : undefined}>
                    {pm.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Controller
          control={control}
          name="notes"
          render={({ field: { value, onChange } }) => (
            <TextField
              label="Notes (optional)"
              placeholder="Add any extra detail"
              value={value ?? ''}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
              className="min-h-[72px]"
              error={errors.notes?.message}
            />
          )}
        />

        <Button
          label={submitLabel}
          size="lg"
          loading={submitting}
          onPress={handleSubmit(submit)}
          className="mt-2"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DateChip({
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
      className={`rounded-xl border px-3.5 py-3 active:opacity-70 ${
        active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
      }`}
    >
      <AppText variant="label" className={active ? 'text-primary' : undefined}>
        {label}
      </AppText>
    </Pressable>
  );
}

function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
