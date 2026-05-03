import { View, Text, ViewStyle, StyleProp } from 'react-native';
import { colors } from '@/theme/colors';

export function CrossDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
        style,
      ]}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
      <Text style={{ color: colors.sacredGold, fontSize: 14, marginHorizontal: 8 }}>
        ✧ ✟ ✧
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
    </View>
  );
}
