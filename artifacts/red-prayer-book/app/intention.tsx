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
import { colors as C } from "@/theme/colors";
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
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginRight: spacing.m })}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: C.byzantineCrimson,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: C.sacredGold,
            marginRight: spacing.s,
          }}
        >
          <MaterialCommunityIcons name="hands-pray" size={17} color={C.sacredGold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16 }}>
            Compose a Prayer
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11 }}>Your personal intention, in Orthodox form</Text>
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
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: C.byzantineCrimson,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: C.sacredGold,
                  marginBottom: spacing.m,
                }}
              >
                <MaterialCommunityIcons name="hands-pray" size={28} color={C.sacredGold} />
              </View>
              <Text
                style={{
                  color: C.sacredGold,
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 20,
                  textAlign: "center",
                  marginBottom: spacing.xs,
                }}
              >
                What is on your heart?
              </Text>
              <Text
                style={{
                  color: C.textSecondary,
                  fontFamily: "serif",
                  fontSize: 14,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Describe your intention and Father Seraphim will compose an Orthodox prayer for you.
              </Text>
            </View>

            {/* Text input */}
            <View
              style={{
                borderWidth: 1,
                borderColor: C.sacredGold,
                borderRadius: radii.m,
                backgroundColor: C.surface,
                marginBottom: spacing.m,
                padding: spacing.m,
              }}
            >
              <TextInput
                style={{
                  color: C.textPrimary,
                  fontFamily: "serif",
                  fontSize: 16,
                  lineHeight: 24,
                  minHeight: 80,
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
                  !intention.trim() ? C.surfaceElevated : C.byzantineCrimson,
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
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                Compose Prayer
              </Text>
            </Pressable>

            {/* Examples */}
            <Text
              style={{
                color: C.textMuted,
                fontSize: 12,
                fontWeight: "600",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: spacing.s,
              }}
            >
              Examples
            </Text>
            <View style={{ gap: spacing.xs }}>
              {EXAMPLE_INTENTIONS.map((ex) => (
                <Pressable
                  key={ex}
                  onPress={() => setIntention(ex)}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    padding: spacing.m,
                    borderRadius: radii.m,
                    borderWidth: 1,
                    borderColor: C.hairline,
                    backgroundColor: pressed ? C.surface : C.surfaceElevated,
                    gap: spacing.s,
                  })}
                >
                  <MaterialCommunityIcons name="cross" size={14} color={C.sacredGold} />
                  <Text style={{ color: C.textSecondary, fontFamily: "serif", fontSize: 14, flex: 1 }}>
                    {ex}
                  </Text>
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
                borderRadius: 40,
                backgroundColor: C.byzantineCrimson,
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
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 18, textAlign: "center" }}>
              Composing your prayer…
            </Text>
            <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 13, textAlign: "center", marginTop: spacing.s, lineHeight: 20 }}>
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
              <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 13, fontStyle: "italic", flex: 1 }}>
                {intention.trim()}
              </Text>
            </View>

            {/* Ornamental top */}
            <Text style={{ color: C.sacredGold, textAlign: "center", fontSize: 20, marginBottom: spacing.m, letterSpacing: 8 }}>
              ✦ ✟ ✦
            </Text>

            {/* Prayer text */}
            <View
              style={{
                backgroundColor: C.surfaceElevated,
                borderRadius: radii.m,
                borderWidth: 1,
                borderColor: C.hairline,
                borderLeftWidth: 3,
                borderLeftColor: C.byzantineCrimson,
                padding: spacing.l,
                marginBottom: spacing.l,
              }}
            >
              <Text
                style={{
                  color: C.textPrimary,
                  fontFamily: "serif",
                  fontSize: 16,
                  lineHeight: 28,
                  fontStyle: "italic",
                }}
              >
                {prayerText}
                {streaming && <Text style={{ color: C.sacredGold }}>▌</Text>}
              </Text>
            </View>

            {/* Ornamental bottom */}
            {!streaming && (
              <Text style={{ color: C.sacredGold, textAlign: "center", fontSize: 20, marginBottom: spacing.l, letterSpacing: 8 }}>
                ✦ ✟ ✦
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
                    backgroundColor: saved ? C.surfaceElevated : C.byzantineCrimson,
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
                      fontFamily: "serif",
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
                  <Text style={{ color: C.textSecondary, fontFamily: "serif", fontWeight: "600", fontSize: 15 }}>
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
                  <Text style={{ color: C.textMuted, fontFamily: "serif", fontSize: 14 }}>
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
