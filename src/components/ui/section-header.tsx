import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({ title, actionLabel, onAction, className }: SectionHeaderProps) {
  return (
    <View className={`mb-3 flex-row items-center justify-between ${className ?? ''}`}>
      <AppText variant="heading">{title}</AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <AppText className="text-sm font-semibold text-primary">{actionLabel}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}
