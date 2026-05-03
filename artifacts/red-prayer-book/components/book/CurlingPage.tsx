import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { View } from 'react-native';
import { StaticPage } from './StaticPage';
import { colors } from '@/theme/colors';

type Props = {
  progress: SharedValue<number>;
  frontIndex: number;
  backIndex: number;
  width: number;
  height: number;
};

export function CurlingPage({
  progress,
  frontIndex,
  backIndex,
  width,
  height,
}: Props) {
  const frontStyle = useAnimatedStyle(() => {
    const angle = interpolate(progress.value, [0, 1], [0, -180]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${angle}deg` }],
      opacity: progress.value < 0.5 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const angle = interpolate(progress.value, [0, 1], [180, 0]);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${angle}deg` }],
      opacity: progress.value >= 0.5 ? 1 : 0,
    };
  });

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.05 + progress.value * 0.35,
    width: interpolate(progress.value, [0, 1], [0, width * 0.6]),
  }));

  return (
    <View style={{ width, height }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            backgroundColor: colors.deepOnyx,
          },
          shadowStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backfaceVisibility: 'hidden',
          },
          frontStyle,
        ]}
      >
        <StaticPage index={frontIndex} side="right" />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backfaceVisibility: 'hidden',
          },
          backStyle,
        ]}
      >
        <StaticPage index={backIndex} side="left" />
      </Animated.View>
    </View>
  );
}
