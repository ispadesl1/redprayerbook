import { useCallback } from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '@/theme/colors';
import { motion } from '@/theme/spacing';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  scaleTo?: number;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  onPress,
  onPressIn,
  onPressOut,
  scaleTo = motion.scalePress,
  haptic = false,
  style,
  contentStyle,
  accessibilityRole = 'button',
  ...rest
}: Props) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback<NonNullable<PressableProps['onPressIn']>>(
    (e) => {
      scale.value = withTiming(reduced ? 1 : scaleTo, { duration: motion.pressInMs });
      onPressIn?.(e);
    },
    [onPressIn, reduced, scale, scaleTo],
  );

  const handlePressOut = useCallback<NonNullable<PressableProps['onPressOut']>>(
    (e) => {
      scale.value = withTiming(1, { duration: motion.pressOutMs });
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (haptic && Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      onPress?.(e);
    },
    [haptic, onPress],
  );

  return (
    <AnimatedPressable
      accessibilityRole={accessibilityRole}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        style,
        animatedStyle,
        contentStyle,
        Platform.OS === 'web' ? ({ outlineColor: colors.focusRing } as ViewStyle) : null,
      ]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
