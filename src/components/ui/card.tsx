import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/utils/cn';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
  /** Adds a soft shadow for elevated surfaces. */
  elevated?: boolean;
}

export function Card({ children, className, elevated, ...props }: CardProps) {
  return (
    <View
      className={cn(
        'rounded-2xl border border-border bg-surface p-4',
        elevated && 'shadow-sm shadow-black/5',
        className,
      )}
      {...props}
    >
      {children}
    </View>
  );
}
