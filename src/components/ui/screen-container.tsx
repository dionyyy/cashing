import type { ReactNode } from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { cn } from '@/utils/cn';

interface ScreenContainerProps extends ViewProps {
  children: ReactNode;
  /** Wrap content in a ScrollView. */
  scroll?: boolean;
  edges?: Edge[];
  contentClassName?: string;
}

/**
 * Standard safe-area screen wrapper used by every route. Applies the
 * themed background and consistent horizontal padding.
 */
export function ScreenContainer({
  children,
  scroll = false,
  edges = ['top'],
  className,
  contentClassName,
  ...props
}: ScreenContainerProps) {
  return (
    <SafeAreaView edges={edges} className={cn('flex-1 bg-background', className)} {...props}>
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('px-5 pb-28 pt-2', contentClassName)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1 px-5 pt-2', contentClassName)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
