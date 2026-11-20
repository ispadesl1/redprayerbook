import { Linking, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { focusRing, ManuscriptScroll } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { goBack } from "@/lib/navigation";
import { SERVICE_README } from "@/lib/service";
import { fonts } from "@/theme/typography";

const STEPS = [
  "Install dependencies with pnpm install.",
  "Copy artifacts/api-server/.env.example to .env and set DATABASE_URL, PORT, and your own Anthropic key. This book does not include a key.",
  "Push the database schema, then start the API server.",
  "Point the app at it with EXPO_PUBLIC_API_URL, including http:// for a local server.",
];

export function ServiceConnect({
  title,
  checking = false,
}: {
  title: string;
  checking?: boolean;
}) {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <View
        style={{
          paddingTop: insets.top + 4,
          paddingHorizontal: 8,
          borderBottomWidth: 1,
          borderBottomColor: C.rule,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: C.paper,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={goBack}
          style={(state) => ({
            minWidth: 44,
            minHeight: 44,
            alignItems: "center",
            justifyContent: "center",
            ...focusRing(C.rubric, "focused" in state && Boolean((state as { focused?: boolean }).focused)),
          })}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>‹</Text>
        </Pressable>
        <Text style={{ flex: 1, fontFamily: fonts.medium, fontSize: 22, lineHeight: 28, color: C.ink }}>{title}</Text>
      </View>
      <ManuscriptScroll>
        <Text style={{ textAlign: "center", color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 28 }}>✠</Text>
        {checking ? (
          <Text style={{ fontFamily: fonts.italic, fontSize: 20, lineHeight: 30, color: C.ink2, textAlign: "center", marginTop: 28 }}>
            Checking…
          </Text>
        ) : null}
        {!checking ? (
        <>
        <Text style={{ fontFamily: fonts.medium, fontSize: 32, lineHeight: 38, color: C.ink, textAlign: "center", marginTop: 16 }}>
          Connect the service
        </Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 28, color: C.ink2, textAlign: "center", marginTop: 12 }}>
          Companion and Compose a Prayer need the API server. Nothing is composed until it is connected.
        </Text>
        <View style={{ marginTop: 28 }}>
          {STEPS.map((step, index) => (
            <Text key={step} style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 28, color: C.ink, marginTop: 12 }}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Open the setup steps in the README"
          onPress={() => Linking.openURL(SERVICE_README)}
          style={(state) => ({
            minHeight: 44,
            justifyContent: "center",
            marginTop: 22,
            ...focusRing(C.rubric, "focused" in state && Boolean((state as { focused?: boolean }).focused)),
          })}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>The setup steps are in the README ›</Text>
        </Pressable>
        </>
        ) : null}
      </ManuscriptScroll>
    </View>
  );
}
