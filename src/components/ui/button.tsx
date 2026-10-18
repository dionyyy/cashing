import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  className?: string;
}

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-primary active:opacity-90',
  secondary: 'bg-muted border border-border active:opacity-80',
  ghost: 'bg-transparent active:opacity-60',
  danger: 'bg-negative active:opacity-90',
};

const TEXT: Record<Variant, string> = {
  primary: 'text-primary-foreground',
  secondary: 'text-foreground',
  ghost: 'text-primary',
  danger: 'text-negative-foreground',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-xl',
        size === 'lg' ? 'h-14' : 'h-12',
        'px-5',
        CONTAINER[variant],
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#888' : '#fff'} />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <AppText className={cn('text-base font-semibold', TEXT[variant])}>{label}</AppText>
        </>
      )}
    </Pressable>
  );
}
