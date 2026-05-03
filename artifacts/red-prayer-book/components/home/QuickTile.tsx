import { Pressable, Text } from 'react-native';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/spacing';

export function QuickTile({
  glyph,
  label,
  onPress,
}: {
  glyph: string;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? colors.surface : colors.byzantineCrimson,
        borderColor: colors.sacredGold,
        borderWidth: 1,
        borderRadius: radii.m,
        paddingVertical: 18,
        alignItems: 'center',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: colors.sacredGold, fontSize: 26, marginBottom: 6 }}>
        {glyph}
      </Text>
      <Text
        style={{
          color: colors.sacredGold,
          fontSize: 10,
          letterSpacing: 1.4,
          textAlign: 'center',
          fontWeight: '600',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
