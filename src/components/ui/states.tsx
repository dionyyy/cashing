import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { usePalette } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onPress: () => void };
  children?: ReactNode;
}

export function EmptyState({ icon = 'Inbox', title, description, action }: EmptyStateProps) {
  const palette = usePalette();
  return (
    <View className="items-center justify-center gap-3 px-6 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon name={icon} size={28} color={palette.mutedForeground} />
      </View>
      <AppText variant="heading" className="text-center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" className="max-w-xs text-center">
          {description}
        </AppText>
      ) : null}
      {action ? (
        <Button label={action.label} onPress={action.onPress} className="mt-2 px-6" />
      ) : null}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  const palette = usePalette();
  return (
    <View className="items-center justify-center gap-3 py-12">
      <ActivityIndicator color={palette.primary} />
      {label ? <AppText variant="caption">{label}</AppText> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const palette = usePalette();
  return (
    <View className="items-center justify-center gap-3 px-6 py-12">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-negative/10">
        <Icon name="TriangleAlert" size={28} color={palette.negative} />
      </View>
      <AppText variant="heading" className="text-center">
        Something went wrong
      </AppText>
      <AppText variant="caption" className="max-w-xs text-center">
        {message ?? 'We could not load your data. Please try again.'}
      </AppText>
      {onRetry ? <Button label="Retry" variant="secondary" onPress={onRetry} className="mt-2 px-6" /> : null}
    </View>
  );
}
