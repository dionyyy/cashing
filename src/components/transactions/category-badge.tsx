import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { getCategory } from '@/constants/categories';
import { cn } from '@/utils/cn';

interface CategoryBadgeProps {
  categoryId: string;
  size?: number;
  className?: string;
}

/** Rounded square tinted with the category color, holding its icon. */
export function CategoryBadge({ categoryId, size = 44, className }: CategoryBadgeProps) {
  const category = getCategory(categoryId);
  const color = category?.color ?? '#6E7270';
  return (
    <View
      className={cn('items-center justify-center rounded-xl', className)}
      style={{ width: size, height: size, backgroundColor: `${color}1F` }}
    >
      <Icon name={category?.icon ?? 'Circle'} size={size * 0.45} color={color} />
    </View>
  );
}
