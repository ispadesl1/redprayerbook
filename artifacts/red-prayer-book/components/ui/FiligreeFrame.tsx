import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { radii, spacing } from '@/theme/spacing';

export function FiligreeFrame({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          borderColor: colors.sacredGold,
          borderWidth: 1,
          borderRadius: radii.l,
          padding: spacing.m,
          backgroundColor: colors.byzantineCrimson,
          position: 'relative',
        },
        style,
      ]}
    >
      <Corner top left />
      <Corner top right />
      <Corner bottom left />
      <Corner bottom right />
      {children}
    </View>
  );
}

function Corner({
  top,
  bottom,
  left,
  right,
}: {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        position: 'absolute',
        top: top ? spacing.xxs : undefined,
        bottom: bottom ? spacing.xxs : undefined,
        left: left ? spacing.xs : undefined,
        right: right ? spacing.xs : undefined,
        color: colors.sacredGold,
        fontSize: 12,
      }}
    >
      ❦
    </Text>
  );
}
