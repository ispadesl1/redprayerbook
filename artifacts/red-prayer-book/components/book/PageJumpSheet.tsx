import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { EaseModal } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";

type Props = {
  totalPages: number;
  currentIndex: number;
  onJump: (index: number) => void;
  visible: boolean;
  onClose: () => void;
};

export function PageJumpSheet({ totalPages, currentIndex, onJump, visible, onClose }: Props) {
  const C = usePalette();
  const [value, setValue] = useState(String(currentIndex + 1));

  const submit = () => {
    const n = Math.max(1, Math.min(totalPages, Number(value) || 1));
    onJump(n - 1);
    onClose();
  };

  return (
    <EaseModal visible={visible} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={{ backgroundColor: C.paper, borderTopWidth: 1, borderColor: C.rule, padding: 24, paddingBottom: 36 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 22, color: C.ink, textAlign: "center", marginBottom: 18 }}>
            Jump to page
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Pressable
              onPress={() => setValue(String(Math.max(1, (Number(value) || 1) - 1)))}
              style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: C.rubric, fontSize: 24 }}>‹</Text>
            </Pressable>
            <TextInput
              value={value}
              onChangeText={setValue}
              onSubmitEditing={submit}
              keyboardType="number-pad"
              style={{
                fontFamily: fonts.medium,
                fontSize: 32,
                color: C.ink,
                borderBottomWidth: 1,
                borderColor: C.rule2,
                minWidth: 72,
                textAlign: "center",
                marginHorizontal: 12,
              }}
            />
            <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 16 }}>of {totalPages}</Text>
            <Pressable
              onPress={() => setValue(String(Math.min(totalPages, (Number(value) || 1) + 1)))}
              style={{ width: 48, height: 48, alignItems: "center", justifyContent: "center" }}
            >
              <Text style={{ color: C.rubric, fontSize: 24 }}>›</Text>
            </Pressable>
          </View>
          <Pressable onPress={submit} style={{ backgroundColor: C.rubric, paddingVertical: 14, alignItems: "center" }}>
            <Text style={{ color: C.onRubric, fontFamily: fonts.medium, fontSize: 18 }}>Go</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </EaseModal>
  );
}
