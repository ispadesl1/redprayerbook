import { useEffect } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function FadeIn({
  delay = 0,
  children,
  style,
}: {
  delay?: number;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 1 : 0);
  const translateY = useSharedValue(reduced ? 0 : 8);

  useEffect(() => {
    if (reduced) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    opacity.value = withDelay(delay, withTiming(1, { duration: motion.enterMs }));
    translateY.value = withDelay(delay, withTiming(0, { duration: motion.enterMs }));
  }, [delay, opacity, reduced, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
