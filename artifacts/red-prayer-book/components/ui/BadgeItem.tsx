import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressRing } from './ProgressRing';
import { PressableScale } from './PressableScale';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { spacing } from '@/theme/spacing';
import type { BadgeDef } from '@/lib/badges';
import { getProgressFraction, isEarned } from '@/lib/badges';

type Props = {
  def: BadgeDef;
  progress: number;
  size?: number;
  onPress?: () => void;
};

export function BadgeItem({ def, progress, size = 68, onPress }: Props) {
  const fraction = getProgressFraction(progress, def.max);
  const earned = isEarned(progress, def.max);
  const locked = progress === 0;

  return (
    <PressableScale
      onPress={onPress}
      haptic={!!onPress}
      accessibilityLabel={`${def.label}, ${progress} of ${def.max}`}
      style={{
        alignItems: 'center',
        width: size + 16,
        minHeight: 44,
      }}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <ProgressRing
          progress={fraction}
          color={earned ? def.color : locked ? colors.overlayWhite08 : def.color}
          size={size}
          strokeWidth={4}
          bgStroke={colors.overlayWhite10}
        />
        <View
          style={{
            position: 'absolute',
            width: size - 14,
            height: size - 14,
            borderRadius: (size - 14) / 2,
            backgroundColor: colors.overlayOnyx85,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: earned ? def.color : colors.overlayWhite08,
          }}
        >
          <MaterialCommunityIcons
            name={def.mciIcon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
            size={22}
            color={locked ? colors.overlayWhite25 : def.color}
          />
          {locked && (
            <MaterialCommunityIcons
              name="lock"
              size={10}
              color={colors.overlayWhite25}
              style={{ position: 'absolute', bottom: 8, right: 8 }}
            />
          )}
        </View>
      </View>
      <Text
        style={{
          color: locked ? colors.textMuted : colors.sacredGold,
          fontFamily: fonts.bodyBold,
          fontSize: 14,
          marginTop: 6,
        }}
      >
        {progress}
      </Text>
      <Text
        style={{
          color: locked ? colors.overlayWhite25 : colors.textSecondary,
          fontFamily: fonts.body,
          fontSize: 9,
          textAlign: 'center',
          marginTop: 2,
          lineHeight: 12,
        }}
        numberOfLines={2}
      >
        {def.label}
      </Text>
      <View
        style={{
          width: size,
          height: 2,
          borderRadius: 1,
          marginTop: spacing.xxs,
          backgroundColor: colors.overlayWhite08,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${Math.round(fraction * 100)}%`,
            height: 2,
            backgroundColor: locked ? 'transparent' : def.color,
          }}
        />
      </View>
    </PressableScale>
  );
}
