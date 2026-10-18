import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { cn } from '@/utils/cn';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Tailwind class for the active pill (defaults to primary). */
  activeClassName?: string;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  activeClassName = 'bg-primary',
}: SegmentedControlProps<T>) {
  return (
    <View className="flex-row rounded-xl bg-muted p-1">
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            className={cn(
              'flex-1 items-center rounded-lg py-2.5 active:opacity-80',
              active && activeClassName,
            )}
          >
            <AppText
              variant="label"
              className={active ? 'text-primary-foreground' : 'text-muted-foreground'}
            >
              {segment.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
