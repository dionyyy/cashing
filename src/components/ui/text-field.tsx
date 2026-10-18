import { forwardRef } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { usePalette } from '@/hooks/use-theme';
import { cn } from '@/utils/cn';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
  leftAdornment?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, containerClassName, leftAdornment, className, ...props },
  ref,
) {
  const palette = usePalette();
  return (
    <View className={cn('gap-1.5', containerClassName)}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View
        className={cn(
          'flex-row items-center rounded-xl border bg-surface px-3.5',
          error ? 'border-negative' : 'border-border',
        )}
      >
        {leftAdornment ? (
          <AppText className="mr-1 text-lg text-muted-foreground">{leftAdornment}</AppText>
        ) : null}
        <TextInput
          ref={ref}
          className={cn('flex-1 py-3.5 text-base text-foreground', className)}
          placeholderTextColor={palette.mutedForeground}
          accessibilityLabel={label}
          {...props}
        />
      </View>
      {error ? (
        <AppText className="text-xs text-negative">{error}</AppText>
      ) : hint ? (
        <AppText variant="caption">{hint}</AppText>
      ) : null}
    </View>
  );
});
