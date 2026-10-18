import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Icon } from '@/components/ui/icon';
import { usePalette } from '@/hooks/use-theme';

interface Action {
  key: string;
  label: string;
  icon: string;
  onPress: () => void;
  tone?: 'positive' | 'negative' | 'neutral';
}

export function QuickActions({ actions }: { actions: Action[] }) {
  const palette = usePalette();

  const colorFor = (tone?: Action['tone']) => {
    if (tone === 'positive') return palette.positive;
    if (tone === 'negative') return palette.negative;
    return palette.primary;
  };

  return (
    <View className="flex-row gap-3">
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          className="flex-1 items-center gap-2 rounded-2xl border border-border bg-surface py-4 active:opacity-70"
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colorFor(action.tone)}1F` }}
          >
            <Icon name={action.icon} size={20} color={colorFor(action.tone)} />
          </View>
          <AppText variant="caption" className="font-medium text-foreground">
            {action.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
