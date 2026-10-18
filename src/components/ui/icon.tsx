import * as Lucide from 'lucide-react-native';
import type { LucideProps } from 'lucide-react-native';

/**
 * Resolve a Lucide icon component by name. Falls back to a neutral dot
 * icon if a name is missing so the UI never crashes on bad data.
 */
type IconName = keyof typeof Lucide;

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const Component = (Lucide as Record<string, unknown>)[name] as
    | React.ComponentType<LucideProps>
    | undefined;
  const Fallback = Lucide.Circle;
  const Resolved = Component ?? Fallback;
  return <Resolved {...props} />;
}

export type { IconName };
