import { useState } from "react";
import { ScrollView, View, Text, Pressable, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";
import { addHighlight } from "@/lib/db";
import { incrementBadge } from "@/lib/badges";

const JOHN_1 = [
  "In the beginning was the Word, and the Word was with God, and the Word was God.",
  "He was in the beginning with God.",
  "All things were made through Him, and without Him was not anything made that was made.",
  "In Him was life, and the life was the light of men.",
  "And the light shines in the darkness, and the darkness did not comprehend it.",
  "There was a man sent from God, whose name was John.",
  "This man came for a witness, to bear witness of the Light, that all through him might believe.",
  "He was not the Light, but came to bear witness of the Light.",
  "That was the true Light which enlightens every man coming into the world.",
  "He was in the world, and the world was made through Him, and the world did not know Him.",
  "He came to His own, and His own did not receive Him.",
  "But as many as received Him, to them He gave power to become sons of God, even to those who believe in His name,",
  "who were born, not of blood nor of the will of the flesh nor of the will of man, but of God.",
  "And the Word became flesh and dwelt among us, and we beheld His glory, glory as of the only-begotten from the Father, full of grace and truth.",
];

export default function Bible() {
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState(false);

  const handleLongPress = (v: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerse(v);
    setActionModal(true);
  };

  const handleHighlight = async () => {
    if (selectedVerse == null) return;
    setHighlighted((prev) => new Set(prev).add(selectedVerse));
    setActionModal(false);
    try {
      await addHighlight("john", 1, selectedVerse, "#D4AF37");
      await incrementBadge("share_verses");
    } catch {}
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
        }}
      >
        <Pressable style={{ padding: 4 }}>
          <MaterialCommunityIcons name="chevron-left" size={26} color={C.sacredGold} />
        </Pressable>
        <Text
          style={{
            flex: 1,
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 22,
            color: C.sacredGold,
            textAlign: "center",
          }}
        >
          Bible
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.s }}>
          <Pressable style={{ padding: 4 }}>
            <MaterialCommunityIcons name="magnify" size={22} color={C.sacredGold} />
          </Pressable>
          <Pressable style={{ padding: 4 }}>
            <MaterialCommunityIcons name="dots-horizontal" size={22} color={C.sacredGold} />
          </Pressable>
        </View>
      </View>

      {/* Gold divider */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.m, marginBottom: spacing.s }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
        <MaterialCommunityIcons name="cross" size={16} color={C.sacredGold} style={{ marginHorizontal: 8 }} />
        <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.m, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title block */}
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 26,
            color: C.sacredGold,
            textAlign: "center",
            marginTop: spacing.m,
          }}
        >
          The Gospel of Saint John
        </Text>
        <Text
          style={{
            color: C.sacredGold,
            textAlign: "center",
            letterSpacing: 3,
            marginVertical: spacing.xs,
            fontWeight: "700",
            textTransform: "uppercase",
            fontSize: 12,
          }}
        >
          Chapter 1
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.m }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
          <MaterialCommunityIcons name="cross" size={14} color={C.sacredGold} style={{ marginHorizontal: 8 }} />
          <View style={{ flex: 1, height: 1, backgroundColor: C.hairline }} />
        </View>

        {/* Verses */}
        {JOHN_1.map((verse, i) => {
          const verseNum = i + 1;
          const isHighlighted = highlighted.has(verseNum);
          return (
            <Pressable
              key={i}
              onLongPress={() => handleLongPress(verseNum)}
              style={({ pressed }) => ({
                flexDirection: "row",
                marginBottom: spacing.s,
                padding: 6,
                borderRadius: 8,
                backgroundColor: isHighlighted
                  ? "rgba(212,175,55,0.12)"
                  : pressed
                  ? "rgba(255,255,255,0.04)"
                  : "transparent",
                borderLeftWidth: isHighlighted ? 2 : 0,
                borderLeftColor: C.sacredGold,
              })}
            >
              <Text
                style={{
                  color: C.sacredGold,
                  fontFamily: "serif",
                  fontWeight: "700",
                  fontSize: 15,
                  width: 26,
                  textAlign: "right",
                  marginRight: spacing.s,
                  lineHeight: 24,
                }}
              >
                {verseNum}
              </Text>
              <Text
                style={{
                  color: isHighlighted ? C.ivoryVellum : C.textPrimary,
                  flex: 1,
                  fontFamily: "serif",
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                {verse}
              </Text>
            </Pressable>
          );
        })}

        {/* Commentary */}
        <View
          style={{
            marginTop: spacing.l,
            padding: spacing.m,
            backgroundColor: C.surfaceElevated,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: C.hairline,
            flexDirection: "row",
            gap: spacing.s,
          }}
        >
          <MaterialCommunityIcons name="cross" size={18} color={C.sacredGold} style={{ marginTop: 2 }} />
          <Text
            style={{
              color: C.textPrimary,
              fontFamily: "serif",
              fontStyle: "italic",
              fontSize: 14,
              lineHeight: 22,
              flex: 1,
            }}
          >
            The Evangelist John opens with a deliberate echo of Genesis, proclaiming the eternal
            pre-existence of the Logos, the Second Person of the Holy Trinity.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom dock — sticky above tab bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          backgroundColor: C.surface,
          borderTopColor: C.hairline,
          borderTopWidth: 1,
        }}
      >
        <Pressable
          style={{
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xs,
            borderColor: C.sacredGold,
            borderWidth: 1,
            borderRadius: radii.pill,
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Text style={{ color: C.sacredGold, fontSize: 13, fontWeight: "600" }}>John 1</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={C.sacredGold} />
        </Pressable>

        <Pressable
          style={{
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xs,
            borderColor: C.hairline,
            borderWidth: 1,
            borderRadius: radii.pill,
            backgroundColor: C.surfaceElevated,
          }}
        >
          <Text style={{ color: C.textSecondary, fontSize: 13 }}>OSB</Text>
        </Pressable>

        <View style={{ flexDirection: "row", gap: spacing.xs }}>
          {(["chevron-left", "chevron-right"] as const).map((icon) => (
            <Pressable
              key={icon}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                borderColor: C.hairline,
                borderWidth: 1,
              }}
            >
              <MaterialCommunityIcons name={icon} size={20} color={C.sacredGold} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Verse action sheet */}
      <Modal
        visible={actionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setActionModal(false)}
        />
        <View
          style={{
            backgroundColor: C.surfaceElevated,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.l,
            paddingBottom: spacing.xxl,
          }}
        >
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.sacredGold, alignSelf: "center", marginBottom: spacing.m }} />
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16, textAlign: "center", marginBottom: spacing.m }}>
            Verse {selectedVerse}
          </Text>
          {[
            { label: "Highlight", icon: "marker" as const, action: handleHighlight },
            { label: "Copy", icon: "content-copy" as const, action: () => setActionModal(false) },
            { label: "Share", icon: "share-variant" as const, action: () => setActionModal(false) },
            { label: "Bookmark", icon: "bookmark-plus-outline" as const, action: () => setActionModal(false) },
          ].map(({ label, icon, action }) => (
            <Pressable
              key={label}
              onPress={action}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: spacing.m,
                opacity: pressed ? 0.7 : 1,
                borderBottomWidth: 1,
                borderColor: C.hairline,
                gap: spacing.m,
              })}
            >
              <MaterialCommunityIcons name={icon} size={22} color={C.sacredGold} />
              <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 16 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
