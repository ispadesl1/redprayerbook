import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { radii } from '@/theme/spacing';

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
          padding: 16,
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
      style={{
        position: 'absolute',
        top: top ? 4 : undefined,
        bottom: bottom ? 4 : undefined,
        left: left ? 6 : undefined,
        right: right ? 6 : undefined,
        color: colors.sacredGold,
        fontSize: 12,
      }}
    >
      ❦
    </Text>
  );
}
