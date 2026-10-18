import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

import { cn } from '@/utils/cn';

interface IconButtonProps extends PressableProps {
  children: ReactNode;
  accessibilityLabel: string;
  className?: string;
  variant?: 'ghost' | 'surface';
}

export function IconButton({
  children,
  accessibilityLabel,
  className,
  variant = 'ghost',
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full active:opacity-60',
        variant === 'surface' && 'border border-border bg-surface',
        className,
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}
