import { View, Text, type StyleProp, type ViewStyle } from "react-native";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";

export function CrossDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  const C = usePalette();
  return (
    <View style={[{ flexDirection: "row", alignItems: "center", marginVertical: 8 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: C.rule2 }} />
      <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 14, marginHorizontal: 8 }}>✠</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.rule2 }} />
    </View>
  );
}
