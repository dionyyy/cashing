import { useQueryClient } from '@tanstack/react-query';
import * as Application from 'expo-application';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Card } from '@/components/ui/card';
import { confirm } from '@/components/ui/confirm';
import { Icon } from '@/components/ui/icon';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CURRENCIES } from '@/constants/currencies';
import { clearAllData } from '@/db/client';
import { usePalette } from '@/hooks/use-theme';
import { useSettingsStore } from '@/stores/settings-store';
import type { ThemePreference } from '@/types';

export default function SettingsScreen() {
  const palette = usePalette();
  const qc = useQueryClient();

  const themePreference = useSettingsStore((s) => s.themePreference);
  const setThemePreference = useSettingsStore((s) => s.setThemePreference);
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);

  const handleReset = async () => {
    const ok = await confirm({
      title: 'Erase all data?',
      message: 'This permanently deletes every transaction and budget. This cannot be undone.',
      confirmLabel: 'Erase',
      destructive: true,
    });
    if (!ok) return;
    await clearAllData();
    qc.invalidateQueries();
  };

  return (
    <ScreenContainer scroll>
      <AppText variant="title" className="mb-4 mt-2">
        Settings
      </AppText>

      <SectionHeader title="Appearance" />
      <Card className="mb-5">
        <AppText variant="label" className="mb-2">
          Theme
        </AppText>
        <SegmentedControl<ThemePreference>
          segments={[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ]}
          value={themePreference}
          onChange={setThemePreference}
        />
      </Card>

      <SectionHeader title="Currency" />
      <Card className="mb-5 p-0">
        {CURRENCIES.map((c, i) => {
          const selected = c.code === currency;
          return (
            <Pressable
              key={c.code}
              onPress={() => setCurrency(c.code)}
              className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
            >
              <View className="h-9 w-9 items-center justify-center rounded-full bg-muted">
                <AppText className="text-base font-semibold text-foreground">{c.symbol}</AppText>
              </View>
              <View className="flex-1">
                <AppText variant="subtitle">{c.code}</AppText>
                <AppText variant="caption">{c.label}</AppText>
              </View>
              {selected ? <Icon name="Check" size={20} color={palette.primary} /> : null}
              {i < CURRENCIES.length - 1 ? null : null}
            </Pressable>
          );
        })}
      </Card>

      <SectionHeader title="Data" />
      <Card className="mb-5 p-0">
        <Pressable
          onPress={handleReset}
          className="flex-row items-center gap-3 px-4 py-3.5 active:opacity-70"
        >
          <View className="h-9 w-9 items-center justify-center rounded-full bg-negative/10">
            <Icon name="Trash2" size={18} color={palette.negative} />
          </View>
          <View className="flex-1">
            <AppText variant="subtitle" className="text-negative">
              Erase all data
            </AppText>
            <AppText variant="caption">Delete all transactions and budgets</AppText>
          </View>
        </Pressable>
      </Card>

      <SectionHeader title="About" />
      <Card>
        <Row label="App" value="Cashing" />
        <View className="h-px bg-border" />
        <Row
          label="Version"
          value={Application.nativeApplicationVersion ?? '1.0.0'}
        />
        <View className="h-px bg-border" />
        <Row label="Data storage" value="On-device (SQLite)" />
        <View className="h-px bg-border" />
        <View className="py-3">
          <AppText variant="caption">
            Cashing stores all your financial records locally on your device. Nothing is sent to
            a server. Erasing data or uninstalling the app removes it permanently.
          </AppText>
        </View>
      </Card>
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <AppText variant="label">{label}</AppText>
      <AppText variant="caption" className="font-medium text-foreground">
        {value}
      </AppText>
    </View>
  );
}
