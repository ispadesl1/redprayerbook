import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressRing } from './ProgressRing';
import { colors } from '@/theme/colors';
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
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        width: size + 16,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <ProgressRing
          progress={fraction}
          color={earned ? def.color : locked ? 'rgba(255,255,255,0.08)' : def.color}
          size={size}
          strokeWidth={4}
          bgStroke="rgba(255,255,255,0.1)"
        />
        <View
          style={{
            position: 'absolute',
            width: size - 14,
            height: size - 14,
            borderRadius: (size - 14) / 2,
            backgroundColor: earned
              ? 'rgba(14,14,16,0.85)'
              : locked
              ? 'rgba(14,14,16,0.7)'
              : 'rgba(14,14,16,0.85)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: earned ? def.color : 'rgba(255,255,255,0.08)',
          }}
        >
          <MaterialCommunityIcons
            name={def.mciIcon as any}
            size={22}
            color={locked ? 'rgba(255,255,255,0.25)' : def.color}
          />
          {locked && (
            <MaterialCommunityIcons
              name="lock"
              size={10}
              color="rgba(255,255,255,0.25)"
              style={{ position: 'absolute', bottom: 8, right: 8 }}
            />
          )}
        </View>
      </View>
      <Text
        style={{
          color: locked ? colors.textMuted : colors.sacredGold,
          fontWeight: '700',
          fontSize: 14,
          marginTop: 6,
        }}
      >
        {progress}
      </Text>
      <Text
        style={{
          color: locked ? 'rgba(255,255,255,0.25)' : colors.textSecondary,
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
          marginTop: 4,
          backgroundColor: 'rgba(255,255,255,0.08)',
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
    </Pressable>
  );
}
