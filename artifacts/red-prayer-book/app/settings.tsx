import { useEffect, useState } from "react";
import { ScrollView, View, Text, Switch, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  getNotifSettings,
  saveNotifSettings,
  requestPermissions,
  type NotifSettings,
} from "@/lib/notifications";
import { colors as C } from "@/theme/colors";
import { spacing, radii } from "@/theme/spacing";

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      style={{
        color: C.sacredGold,
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 2,
        textTransform: "uppercase",
        paddingHorizontal: spacing.m,
        paddingTop: spacing.l,
        paddingBottom: spacing.xs,
      }}
    >
      {label}
    </Text>
  );
}

function SettingsRow({
  label,
  subtitle,
  right,
  onPress,
  last,
}: {
  label: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: spacing.m,
        paddingHorizontal: spacing.m,
        backgroundColor: pressed && onPress ? C.surface : C.surfaceElevated,
        borderBottomWidth: last ? 0 : 1,
        borderColor: C.hairline,
      })}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 15 }}>{label}</Text>
        {subtitle ? (
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>
      {right ?? null}
    </Pressable>
  );
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotifSettings | null>(null);
  const [calStyle, setCalStyle] = useState<"new" | "old">("new");

  useEffect(() => {
    getNotifSettings().then(setSettings);
  }, []);

  const toggleMorning = async (val: boolean) => {
    if (!settings) return;
    if (val) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    const next = { ...settings, morning: val };
    setSettings(next);
    await saveNotifSettings(next);
  };

  const toggleEvening = async (val: boolean) => {
    if (!settings) return;
    if (val) {
      const granted = await requestPermissions();
      if (!granted) return;
    }
    const next = { ...settings, evening: val };
    setSettings(next);
    await saveNotifSettings(next);
  };

  if (!settings) return null;

  return (
    <View style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Sheet header — Apple HIG: Cancel left, Done right */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.m,
          paddingTop: insets.top + spacing.s,
          paddingBottom: spacing.s,
          borderBottomWidth: 1,
          borderColor: C.hairline,
          backgroundColor: C.surfaceElevated,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: C.sacredGold, fontSize: 16 }}>Cancel</Text>
        </Pressable>
        <Text
          style={{
            fontFamily: "serif",
            fontWeight: "700",
            fontSize: 18,
            color: C.sacredGold,
          }}
        >
          Settings
        </Text>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: C.sacredGold, fontWeight: "700", fontSize: 16 }}>Done</Text>
        </Pressable>
      </View>

      {/* Grabber */}
      <View
        style={{
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: C.sacredGold,
          alignSelf: "center",
          marginTop: spacing.s,
          opacity: 0.5,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader label="Notifications" />
        <View
          style={{
            marginHorizontal: spacing.m,
            borderRadius: radii.m,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <SettingsRow
            label="Morning Prayer"
            subtitle="Reminder to open the prayer book at sunrise"
            right={
              <Switch
                value={settings.morning}
                onValueChange={toggleMorning}
                trackColor={{ false: "#333", true: C.byzantineCrimson }}
                thumbColor={settings.morning ? C.sacredGold : "#666"}
              />
            }
          />
          {settings.morning && (
            <SettingsRow
              label="Morning Time"
              subtitle={`${settings.morningHour}:${String(settings.morningMinute).padStart(2, "0")} ${settings.morningHour < 12 ? "AM" : "PM"}`}
              right={<MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />}
            />
          )}
          <SettingsRow
            label="Evening Prayer"
            subtitle="Reminder for Vespers and evening prayers"
            last
            right={
              <Switch
                value={settings.evening}
                onValueChange={toggleEvening}
                trackColor={{ false: "#333", true: C.byzantineCrimson }}
                thumbColor={settings.evening ? C.sacredGold : "#666"}
              />
            }
          />
          {settings.evening && (
            <SettingsRow
              label="Evening Time"
              subtitle={`${settings.eveningHour}:${String(settings.eveningMinute).padStart(2, "0")} ${settings.eveningHour < 12 ? "AM" : "PM"}`}
              last
              right={<MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />}
            />
          )}
        </View>

        <SectionHeader label="Calendar" />
        <View
          style={{
            marginHorizontal: spacing.m,
            borderRadius: radii.m,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <View style={{ flexDirection: "row", backgroundColor: C.surfaceElevated, padding: spacing.m, alignItems: "center" }}>
            <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 15, flex: 1 }}>
              Calendar Style
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["new", "old"] as const).map((s) => (
                <Pressable
                  key={s}
                  onPress={() => setCalStyle(s)}
                  style={{
                    paddingHorizontal: spacing.m,
                    paddingVertical: 6,
                    borderRadius: radii.pill,
                    borderColor: C.sacredGold,
                    borderWidth: 1,
                    backgroundColor: calStyle === s ? C.byzantineCrimson : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: C.sacredGold,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {s === "new" ? "New" : "Old"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <SectionHeader label="Reading" />
        <View
          style={{
            marginHorizontal: spacing.m,
            borderRadius: radii.m,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <SettingsRow
            label="Bible Translation"
            subtitle="Orthodox Study Bible (OSB)"
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />}
            onPress={() => {}}
          />
          <SettingsRow
            label="Font Size"
            subtitle="Medium"
            last
            right={<MaterialCommunityIcons name="chevron-right" size={20} color={C.sacredGold} />}
            onPress={() => {}}
          />
        </View>

        <SectionHeader label="About" />
        <View
          style={{
            marginHorizontal: spacing.m,
            borderRadius: radii.m,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <SettingsRow label="Version" subtitle="1.0.0" right={null} />
          <SettingsRow
            label="Privacy Policy"
            right={<MaterialCommunityIcons name="open-in-new" size={16} color={C.sacredGold} />}
            onPress={() => {}}
          />
          <SettingsRow
            label="Terms of Service"
            last
            right={<MaterialCommunityIcons name="open-in-new" size={16} color={C.sacredGold} />}
            onPress={() => {}}
          />
        </View>

        <View style={{ alignItems: "center", paddingTop: spacing.xl }}>
          <Text style={{ color: C.sacredGold, fontFamily: "serif", fontSize: 14, letterSpacing: 1 }}>
            ✟  Sacred Words. Timeless Faith.  ✟
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 11, marginTop: 6 }}>
            Red Prayer Book · Always With You
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
