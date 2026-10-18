import { View } from 'react-native';

import { cn } from '@/utils/cn';
import { clampRatio } from '@/utils/finance';

interface ProgressBarProps {
  /** 0..1 (values above 1 are clamped). */
  ratio: number;
  /** Tailwind bg class for the fill. */
  fillClassName?: string;
  trackClassName?: string;
  className?: string;
}

export function ProgressBar({
  ratio,
  fillClassName = 'bg-primary',
  trackClassName = 'bg-muted',
  className,
}: ProgressBarProps) {
  const pct = Math.round(clampRatio(ratio) * 100);
  return (
    <View
      className={cn('h-2.5 w-full overflow-hidden rounded-full', trackClassName, className)}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: pct, min: 0, max: 100 }}
    >
      <View className={cn('h-full rounded-full', fillClassName)} style={{ width: `${pct}%` }} />
    </View>
  );
}
