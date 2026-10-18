import { Pressable, ScrollView } from "react-native";

import { CategoryBadge } from "@/components/transactions/category-badge";
import { AppText } from "@/components/ui/app-text";
import { categoriesForType } from "@/constants/categories";
import type { TransactionType } from "@/types";
import { cn } from "@/utils/cn";

interface CategorySelectorProps {
  type: TransactionType;
  value: string | null;
  onChange: (categoryId: string) => void;
}

/** Horizontal, scrollable grid of category chips filtered by type. */
export function CategorySelector({
  type,
  value,
  onChange,
}: CategorySelectorProps) {
  const categories = categoriesForType(type);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-3 py-1 pr-4"
    >
      {categories.map((category) => {
        const selected = category.id === value;
        return (
          <Pressable
            key={category.id}
            onPress={() => onChange(category.id)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={category.label}
            className={cn(
              "w-20 items-center gap-1.5 rounded-2xl border p-2 active:opacity-70",
              selected
                ? "border-primary bg-primary/10"
                : "border-border bg-surface",
            )}
          >
            <CategoryBadge categoryId={category.id} size={40} />
            <AppText
              variant="caption"
              numberOfLines={1}
              className="text-center"
            >
              {category.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
