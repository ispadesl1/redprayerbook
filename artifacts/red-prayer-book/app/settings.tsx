import { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ManuscriptScroll, SmallCaps, StackBar, focusRing, onSpaceKey } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { CALENDAR_CREDIT } from "@/lib/calendar";
import {
  getNotifSettings,
  requestPermissions,
  saveNotifSettings,
  type NotifSettings,
} from "@/lib/notifications";
import { usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

type ReminderKey = "morning" | "midday" | "evening";

const REMINDERS: { key: ReminderKey; label: string; detail: string }[] = [
  { key: "morning", label: "Morning prayers", detail: "Opens the Trisagion" },
  { key: "midday", label: "Midday prayer", detail: "Opens the midday prayer" },
  { key: "evening", label: "Evening prayers", detail: "Opens evening prayers" },
];

function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const C = usePalette();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      aria-checked={value}
      onPress={() => onChange(!value)}
      {...({ onKeyDown: onSpaceKey(() => onChange(!value)) } as object)}
      style={(state) => {
        const focused = "focused" in state && Boolean((state as { focused?: boolean }).focused);
        return {
          minWidth: 44,
          minHeight: 44,
          justifyContent: "center" as const,
          alignItems: "center" as const,
          paddingHorizontal: 8,
          ...focusRing(C.rubric, focused),
        };
      }}
    >
      <Text
        style={{
          fontFamily: fonts.medium,
          fontSize: 16,
          color: value ? C.rubric : C.ink2,
          borderBottomWidth: value ? 1 : 0,
          borderBottomColor: C.rubric,
          fontVariant: ["small-caps"],
        }}
      >
        {value ? "On" : "Off"}
      </Text>
    </Pressable>
  );
}

function fmt12(hour: number, minute: number): string {
  const ampm = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

export default function Settings() {
  const C = usePalette();
  const insets = useSafeAreaInsets();
  const appearance = usePrefs((state) => state.appearance);
  const setAppearance = usePrefs((state) => state.setAppearance);
  const calendarStyle = usePrefs((state) => state.calendarStyle);
  const setCalendarStyle = usePrefs((state) => state.setCalendarStyle);
  const readStep = usePrefs((state) => state.readStep);
  const setReadStep = usePrefs((state) => state.setReadStep);
  const [settings, setSettings] = useState<NotifSettings | null>(null);
  const [picker, setPicker] = useState<ReminderKey | null>(null);
  const [hour, setHour] = useState(7);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    getNotifSettings().then(setSettings);
  }, []);

  const toggle = useCallback(
    async (kind: ReminderKey, value: boolean) => {
      if (!settings) return;
      if (value) {
        const granted = await requestPermissions();
        if (!granted && value) return;
      }
      const next = { ...settings, [kind]: value };
      setSettings(next);
      await saveNotifSettings(next);
    },
    [settings],
  );

  const openPicker = (kind: ReminderKey) => {
    if (!settings) return;
    setHour(settings[`${kind}Hour`] as number);
    setMinute(settings[`${kind}Minute`] as number);
    setPicker(kind);
  };

  const confirmTime = async () => {
    if (!settings || !picker) return;
    const next = { ...settings, [`${picker}Hour`]: hour, [`${picker}Minute`]: minute };
    setSettings(next);
    await saveNotifSettings(next);
    setPicker(null);
  };

  if (!settings) {
    return <View style={{ flex: 1, backgroundColor: C.paper }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="Settings" onBack={() => router.back()} />
      <ManuscriptScroll>
        <SmallCaps>Appearance</SmallCaps>
        <View style={{ flexDirection: "row", alignItems: "center", minHeight: 56, borderBottomWidth: 1, borderBottomColor: C.rule }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>Night vellum</Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2 }}>A dark sepia for Vespers and the night hours</Text>
          </View>
          <Toggle
            value={appearance === "night"}
            onChange={(value) => setAppearance(value ? "night" : "light")}
            label="Night vellum"
          />
        </View>

        <View style={{ marginTop: 28 }}>
          <SmallCaps>Prayer reminders</SmallCaps>
          <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2, marginTop: 4, marginBottom: 8 }}>
            A reminder opens the prayer. Permission is asked only when a reminder is turned on.
          </Text>
          {REMINDERS.map((item) => {
            const enabled = settings[item.key];
            const h = settings[`${item.key}Hour`] as number;
            const m = settings[`${item.key}Minute`] as number;
            return (
              <View key={item.key} style={{ borderBottomWidth: 1, borderBottomColor: C.rule, paddingVertical: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>{item.label}</Text>
                    <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2 }}>{item.detail}</Text>
                  </View>
                  <Toggle value={enabled} onChange={(value) => toggle(item.key, value)} label={item.label} />
                </View>
                {enabled ? (
                  <Pressable onPress={() => openPicker(item.key)} style={{ minHeight: 40, justifyContent: "center" }}>
                    <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 17 }}>{fmt12(h, m)} · change time</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: 28 }}>
          <SmallCaps>Calendar</SmallCaps>
          <View style={{ flexDirection: "row", gap: 18, marginTop: 8 }}>
            {(["new", "old"] as const).map((item) => {
              const on = calendarStyle === item;
              return (
                <Pressable key={item} onPress={() => setCalendarStyle(item)} style={{ minHeight: 44, justifyContent: "center" }}>
                  <Text
                    style={{
                      fontFamily: fonts.medium,
                      fontSize: 18,
                      color: on ? C.rubric : C.ink2,
                      borderBottomWidth: on ? 1 : 0,
                      borderBottomColor: C.rubric,
                      fontVariant: ["small-caps"],
                    }}
                  >
                    {item === "new" ? "New Calendar" : "Old Calendar"}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={{ fontFamily: fonts.italic, fontSize: 15, lineHeight: 22, color: C.ink2, marginTop: 8 }}>
            {CALENDAR_CREDIT}
          </Text>
        </View>

        <View style={{ marginTop: 28 }}>
          <SmallCaps>Reading</SmallCaps>
          <View style={{ borderBottomWidth: 1, borderBottomColor: C.rule, paddingVertical: 12 }}>
            <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>Bible translation</Text>
            <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2, marginTop: 2 }}>
              King James Version (KJV), from bible-api.com
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.rule, paddingVertical: 8 }}>
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 18, color: C.ink }}>Prayer text size</Text>
            <Pressable accessibilityLabel="Smaller text" onPress={() => setReadStep(readStep - 1)} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 16, lineHeight: 20 }}>A</Text>
            </Pressable>
            <Pressable accessibilityLabel="Larger text" onPress={() => setReadStep(readStep + 1)} style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 22, lineHeight: 26 }}>A</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: 28 }}>
          <SmallCaps>About</SmallCaps>
          <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: C.ink, marginTop: 8 }}>Version 1.0.0</Text>
          <Text style={{ fontFamily: fonts.italic, fontSize: 16, lineHeight: 24, color: C.ink2, marginTop: 12 }}>
            <Text style={{ fontFamily: fonts.regular }}>✠</Text> Sacred words, set like the printed book.
          </Text>
        </View>
      </ManuscriptScroll>

      <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <Pressable style={{ flex: 1, backgroundColor: C.scrim }} onPress={() => setPicker(null)} />
        <View style={{ backgroundColor: C.paper, padding: 24, paddingBottom: insets.bottom + 24 }}>
          <Text style={{ fontFamily: fonts.medium, fontSize: 22, color: C.ink, textAlign: "center" }}>
            {fmt12(hour, minute)}
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 24, marginVertical: 16 }}>
            <Pressable onPress={() => setHour((value) => (value + 23) % 24)} style={{ padding: 8 }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>Hour −</Text>
            </Pressable>
            <Pressable onPress={() => setHour((value) => (value + 1) % 24)} style={{ padding: 8 }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>Hour +</Text>
            </Pressable>
            <Pressable onPress={() => setMinute((value) => (value + 45) % 60)} style={{ padding: 8 }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>Min −</Text>
            </Pressable>
            <Pressable onPress={() => setMinute((value) => (value + 15) % 60)} style={{ padding: 8 }}>
              <Text style={{ color: C.rubric, fontSize: 18 }}>Min +</Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Pressable onPress={() => setPicker(null)} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.ink2, fontFamily: fonts.regular, fontSize: 18 }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={confirmTime} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.medium, fontSize: 18 }}>Set time</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
