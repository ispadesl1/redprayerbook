import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function CrossDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xs },
        style,
      ]}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
      <Text style={{ color: colors.sacredGold, fontSize: 14, marginHorizontal: spacing.xs }}>
        ✧ ✟ ✧
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
    </View>
  );
}
