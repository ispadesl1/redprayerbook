import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/theme/colors';

type Props = {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  bgStroke?: string;
};

export function ProgressRing({
  progress,
  color,
  size = 72,
  strokeWidth = 4,
  bgStroke = colors.overlayWhite10,
}: Props) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth={strokeWidth}
          stroke={bgStroke}
          fill="none"
        />
        <Circle
          cx={cx}
          cy={cx}
          r={r}
          strokeWidth={strokeWidth}
          stroke={color}
          fill="none"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
