import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";
import { spacing, radii } from "@/theme/spacing";
import { savePrayerIntention } from "@/lib/db";

const API_BASE = `${process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : ""}/api`;

const EXAMPLE_INTENTIONS = [
  "for my sick mother's healing",
  "for peace in my marriage",
  "for strength during a difficult trial",
  "for the repose of my grandmother's soul",
  "for guidance in finding a new path",
  "for gratitude and thanksgiving",
];

type Stage = "input" | "composing" | "result";

export default function IntentionScreen() {
  const C = usePalette();
  const [stage, setStage] = useState<Stage>("input");
  const [intention, setIntention] = useState("");
  const [prayerText, setPrayerText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const composePrayer = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setStage("composing");
    setPrayerText("");
    setStreaming(true);
    setSaved(false);

    try {
      const res = await fetch(`${API_BASE}/anthropic/compose-prayer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intention: text.trim() }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let full = "";

      setStage("result");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "delta" && typeof payload.text === "string") {
              full += payload.text;
              setPrayerText(full);
              setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 40);
            }
          } catch {}
        }
      }
    } catch {
      Alert.alert("Error", "Could not compose the prayer. Please try again.");
      setStage("input");
    } finally {
      setStreaming(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!prayerText || saved) return;
    await savePrayerIntention(intention.trim(), prayerText);
    setSaved(true);
    Alert.alert("Saved", "The prayer has been saved to your bookmarks.");
  }, [intention, prayerText, saved]);

  const handleShare = useCallback(async () => {
    if (!prayerText) return;
    await Share.share({ message: prayerText });
  }, [prayerText]);

  const handleReset = useCallback(() => {
    setStage("input");
    setPrayerText("");
    setSaved(false);
  }, []);

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          borderBottomWidth: 1,
          borderColor: C.hairline,
          backgroundColor: C.surfaceElevated,
        }}
      >
        <Pressable
          accessibilityLabel="Back"
          onPress={() => router.back()}
          style={({ pressed }) => ({ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, paddingLeft: 8 }}>
          <Text style={{ color: C.ink, fontFamily: fonts.medium, fontSize: 22, lineHeight: 28 }}>
            Compose a prayer
          </Text>
          <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 16, lineHeight: 22 }}>Needs the companion service</Text>
        </View>
        {stage === "result" && (
          <Pressable
            onPress={handleReset}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}
          >
            <MaterialCommunityIcons name="refresh" size={22} color={C.textMuted} />
          </Pressable>
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {stage === "input" && (
          <ScrollView
            contentContainerStyle={{ padding: spacing.l, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Instruction */}
            <View style={{ alignItems: "center", marginBottom: spacing.l }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18, lineHeight: 24 }}>✠</Text>
              <Text style={{ color: C.ink, fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, textAlign: "center", marginTop: 12 }}>
                What is on your heart?
              </Text>
              <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, textAlign: "center", marginTop: 8 }}>
                Write an intention. A composed prayer needs the service, which is not running here.
              </Text>
            </View>

            {/* Text input */}
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: C.ink2,
                marginBottom: spacing.m,
                paddingVertical: 4,
              }}
            >
              <TextInput
                style={{
                  color: C.ink,
                  fontFamily: fonts.regular,
                  fontSize: 18,
                  lineHeight: 28,
                  minHeight: 88,
                  textAlignVertical: "top",
                }}
                placeholder="e.g. for healing of my father's illness..."
                placeholderTextColor={C.textMuted}
                value={intention}
                onChangeText={setIntention}
                multiline
                autoFocus
              />
            </View>

            {/* Compose button */}
            <Pressable
              onPress={() => composePrayer(intention)}
              disabled={!intention.trim()}
              style={({ pressed }) => ({
                backgroundColor:
                  "transparent",
                borderWidth: 1,
                borderColor:
                  !intention.trim() ? C.hairline : C.sacredGold,
                borderRadius: radii.pill,
                paddingVertical: spacing.m,
                alignItems: "center",
                marginBottom: spacing.l,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{
                  color: !intention.trim() ? C.textMuted : C.sacredGold,
                  fontFamily: fonts.regular,
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Compose Prayer
              </Text>
            </Pressable>

            {/* Examples */}
            <Text style={{ color: C.rubric, fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, fontVariant: ["small-caps"], letterSpacing: 0.6, marginBottom: 4 }}>
              Examples
            </Text>
            <View>
              {EXAMPLE_INTENTIONS.map((ex) => (
                <Pressable
                  key={ex}
                  onPress={() => setIntention(ex)}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: C.rule,
                    backgroundColor: pressed ? C.highlight : "transparent",
                  })}
                >
                  <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 18, lineHeight: 26 }}>{ex}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        )}

        {stage === "composing" && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.l }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 0,
                backgroundColor: "transparent",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: C.sacredGold,
                marginBottom: spacing.l,
              }}
            >
              <MaterialCommunityIcons name="cross" size={36} color={C.sacredGold} />
            </View>
            <ActivityIndicator color={C.sacredGold} size="large" style={{ marginBottom: spacing.m }} />
            <Text style={{ color: C.sacredGold, fontFamily: fonts.regular, fontWeight: "700", fontSize: 18, textAlign: "center" }}>
              Composing your prayer…
            </Text>
            <Text style={{ color: C.ink2, fontFamily: fonts.italic, fontSize: 17, textAlign: "center", marginTop: spacing.s, lineHeight: 26 }}>
              "Ask, and it will be given to you; seek, and you will find." — Matthew 7:7
            </Text>
          </View>
        )}

        {stage === "result" && (
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: spacing.l, paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Intention label */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
                marginBottom: spacing.m,
                paddingBottom: spacing.m,
                borderBottomWidth: 1,
                borderColor: C.hairline,
              }}
            >
              <MaterialCommunityIcons name="hands-pray" size={14} color={C.textMuted} />
              <Text style={{ color: C.textMuted, fontFamily: fonts.regular, fontSize: 13, fontStyle: "italic", flex: 1 }}>
                {intention.trim()}
              </Text>
            </View>

            {/* Ornamental top */}
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, textAlign: "center", fontSize: 18, lineHeight: 24, marginBottom: spacing.m }}>
              ✠
            </Text>

            {/* Prayer text */}
            <View style={{ marginBottom: spacing.l }}>
              <Text
                style={{
                  color: C.ink,
                  fontFamily: fonts.regular,
                  fontSize: 20,
                  lineHeight: 32,
                }}
              >
                {prayerText}
                {streaming && <Text style={{ color: C.sacredGold }}>▌</Text>}
              </Text>
            </View>

            {/* Ornamental bottom */}
            {!streaming && (
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, textAlign: "center", fontSize: 18, lineHeight: 24, marginBottom: spacing.l }}>
                ✠
              </Text>
            )}

            {/* Action buttons */}
            {!streaming && (
              <View style={{ gap: spacing.s }}>
                <Pressable
                  onPress={handleSave}
                  disabled={saved}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.s,
                    paddingVertical: spacing.m,
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: saved ? C.hairline : C.sacredGold,
                    backgroundColor: "transparent",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <MaterialCommunityIcons
                    name={saved ? "check" : "bookmark-outline"}
                    size={18}
                    color={saved ? C.textMuted : C.sacredGold}
                  />
                  <Text
                    style={{
                      color: saved ? C.textMuted : C.sacredGold,
                      fontFamily: fonts.regular,
                      fontWeight: "700",
                      fontSize: 15,
                    }}
                  >
                    {saved ? "Saved to Bookmarks" : "Save to Bookmarks"}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleShare}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.s,
                    paddingVertical: spacing.m,
                    borderRadius: radii.pill,
                    borderWidth: 1,
                    borderColor: C.hairline,
                    backgroundColor: C.surfaceElevated,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="share-outline" size={18} color={C.textSecondary} />
                  <Text style={{ color: C.textSecondary, fontFamily: fonts.regular, fontWeight: "600", fontSize: 15 }}>
                    Share Prayer
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleReset}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.s,
                    paddingVertical: spacing.m,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <MaterialCommunityIcons name="refresh" size={16} color={C.textMuted} />
                  <Text style={{ color: C.textMuted, fontFamily: fonts.regular, fontSize: 14 }}>
                    Compose Another
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
