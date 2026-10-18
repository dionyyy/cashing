import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';

export interface DonutSegment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

/** Simple multi-segment donut using stroke-dasharray math. */
export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 22,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  let offset = 0;
  const rendered =
    total > 0
      ? segments
          .filter((s) => s.value > 0)
          .map((s, i) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const circle = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                fill="transparent"
              />
            );
            offset += dash;
            return circle;
          })
      : null;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00000010"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {rendered}
        </G>
      </Svg>
      <View className="absolute items-center">
        {centerValue ? <AppText variant="heading">{centerValue}</AppText> : null}
        {centerLabel ? <AppText variant="caption">{centerLabel}</AppText> : null}
      </View>
    </View>
  );
}
