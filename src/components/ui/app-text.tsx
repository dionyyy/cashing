import { Text, type TextProps } from 'react-native';

import { cn } from '@/utils/cn';

type Variant = 'display' | 'title' | 'heading' | 'subtitle' | 'body' | 'label' | 'caption';

const VARIANT_CLASSES: Record<Variant, string> = {
  display: 'text-4xl font-extrabold tracking-tight text-foreground',
  title: 'text-2xl font-bold tracking-tight text-foreground',
  heading: 'text-lg font-semibold text-foreground',
  subtitle: 'text-base font-semibold text-foreground',
  body: 'text-base text-foreground',
  label: 'text-sm font-medium text-foreground',
  caption: 'text-xs text-muted-foreground',
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
  className?: string;
}

export function AppText({
  variant = 'body',
  muted,
  className,
  ...props
}: AppTextProps) {
  return (
    <Text
      className={cn(VARIANT_CLASSES[variant], muted && 'text-muted-foreground', className)}
      {...props}
    />
  );
}
