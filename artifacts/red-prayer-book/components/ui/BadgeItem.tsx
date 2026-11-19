import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";
import type { BadgeDef } from "@/lib/badges";
import { getProgressFraction, isEarned } from "@/lib/badges";

type Props = {
  def: BadgeDef;
  progress: number;
  size?: number;
  onPress?: () => void;
};

export function BadgeItem({ def, progress, size = 68, onPress }: Props) {
  const C = usePalette();
  const fraction = getProgressFraction(progress, def.max);
  const earned = isEarned(progress, def.max);
  const locked = progress === 0;
  const mark = earned ? C.rubric : C.ink2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: "center",
        width: size + 18,
        backgroundColor: pressed ? C.highlight : "transparent",
        paddingVertical: 6,
      })}
    >
      <View
        style={{
          width: size - 16,
          height: size - 16,
          borderWidth: 1,
          borderColor: mark,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name={def.mciIcon as never} size={22} color={mark} />
      </View>
      <Text
        style={{
          color: C.ink,
          fontFamily: fonts.regular,
          fontSize: 15,
          marginTop: 6,
          fontVariant: ["oldstyle-nums"],
        }}
      >
        {progress}/{def.max}
      </Text>
      <Text
        style={{
          color: locked ? C.ink2 : C.ink,
          fontFamily: fonts.regular,
          fontSize: 13,
          lineHeight: 16,
          textAlign: "center",
          marginTop: 2,
        }}
        numberOfLines={2}
      >
        {def.label}
      </Text>
      <View style={{ width: size - 8, height: 2, marginTop: 6, backgroundColor: C.rule }}>
        <View style={{ width: `${Math.round(fraction * 100)}%`, height: 2, backgroundColor: earned ? C.rubric : C.ink2 }} />
      </View>
    </Pressable>
  );
}
