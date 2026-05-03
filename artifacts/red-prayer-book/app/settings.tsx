import { useEffect, useState, useCallback } from "react";
import { ScrollView, View, Text, Switch, Pressable, Modal } from "react-native";
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

// ─── Time Picker Modal ────────────────────────────────────────────────────────

type TimePickerProps = {
  visible: boolean;
  hour: number;
  minute: number;
  label: string;
  onConfirm: (hour: number, minute: number) => void;
  onClose: () => void;
};

const MINUTE_STEPS = [0, 15, 30, 45];

function TimePicker({ visible, hour, minute, label, onConfirm, onClose }: TimePickerProps) {
  const [h, setH] = useState(hour);
  const [m, setM] = useState(minute);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) { setH(hour); setM(minute); }
  }, [visible, hour, minute]);

  const ampm = h < 12 ? "AM" : "PM";
  const display12 = h % 12 === 0 ? 12 : h % 12;

  const incHour = () => setH((prev) => (prev + 1) % 24);
  const decHour = () => setH((prev) => (prev + 23) % 24);
  const incMinute = () =>
    setM((prev) => {
      const idx = MINUTE_STEPS.indexOf(prev);
      return MINUTE_STEPS[(idx + 1) % MINUTE_STEPS.length];
    });
  const decMinute = () =>
    setM((prev) => {
      const idx = MINUTE_STEPS.indexOf(prev);
      return MINUTE_STEPS[(idx + MINUTE_STEPS.length - 1) % MINUTE_STEPS.length];
    });
  const toggleAmPm = () => setH((prev) => (prev + 12) % 24);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" }}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: C.surfaceElevated,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: C.hairline,
            width: 300,
            overflow: "hidden",
          }}
        >
          {/* Modal header */}
          <View
            style={{
              backgroundColor: C.surface,
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.m,
              borderBottomWidth: 1,
              borderBottomColor: C.hairline,
              alignItems: "center",
            }}
          >
            <Text style={{ color: C.sacredGold, fontFamily: "serif", fontWeight: "700", fontSize: 16 }}>
              {label}
            </Text>
          </View>

          {/* Clock face */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: spacing.xl,
              gap: spacing.xs,
            }}
          >
            {/* Hour column */}
            <Column
              value={String(display12).padStart(2, "0")}
              onInc={incHour}
              onDec={decHour}
            />

            <Text style={{ color: C.sacredGold, fontSize: 36, fontWeight: "700", marginBottom: 4 }}>:</Text>

            {/* Minute column */}
            <Column
              value={String(m).padStart(2, "0")}
              onInc={incMinute}
              onDec={decMinute}
            />

            {/* AM/PM toggle */}
            <Pressable
              onPress={toggleAmPm}
              style={{
                marginLeft: spacing.s,
                backgroundColor: C.byzantineCrimson + "33",
                borderRadius: radii.m,
                borderWidth: 1,
                borderColor: C.byzantineCrimson,
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.xs,
              }}
            >
              <Text
                style={{
                  color: C.sacredGold,
                  fontSize: 18,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {ampm}
              </Text>
            </Pressable>
          </View>

          {/* Preview */}
          <View style={{ alignItems: "center", marginBottom: spacing.m }}>
            <Text style={{ color: C.textMuted, fontStyle: "italic", fontSize: 13 }}>
              Reminder at {display12}:{String(m).padStart(2, "0")} {ampm} every day
            </Text>
          </View>

          {/* Buttons */}
          <View
            style={{
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: C.hairline,
            }}
          >
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: spacing.m,
                alignItems: "center",
                backgroundColor: pressed ? C.surface : "transparent",
                borderRightWidth: 1,
                borderRightColor: C.hairline,
              })}
            >
              <Text style={{ color: C.textMuted, fontSize: 15, fontWeight: "600" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(h, m)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: spacing.m,
                alignItems: "center",
                backgroundColor: pressed ? C.byzantineCrimson + "44" : "transparent",
              })}
            >
              <Text style={{ color: C.sacredGold, fontSize: 15, fontWeight: "700" }}>Set Time</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function Column({
  value,
  onInc,
  onDec,
}: {
  value: string;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={{ alignItems: "center", gap: spacing.xs }}>
      <Pressable
        onPress={onInc}
        style={({ pressed }) => ({
          padding: spacing.xs,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <MaterialCommunityIcons name="chevron-up" size={28} color={C.sacredGold} />
      </Pressable>
      <View
        style={{
          backgroundColor: C.surface,
          borderRadius: radii.m,
          borderWidth: 1,
          borderColor: C.hairline,
          width: 64,
          height: 64,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: C.ivoryVellum,
            fontSize: 32,
            fontWeight: "700",
            fontFamily: "serif",
          }}
        >
          {value}
        </Text>
      </View>
      <Pressable
        onPress={onDec}
        style={({ pressed }) => ({
          padding: spacing.xs,
          opacity: pressed ? 0.5 : 1,
        })}
      >
        <MaterialCommunityIcons name="chevron-down" size={28} color={C.sacredGold} />
      </Pressable>
    </View>
  );
}

// ─── Settings helpers ─────────────────────────────────────────────────────────

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

function fmt12(hour: number, minute: number): string {
  const ampm = hour < 12 ? "AM" : "PM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:${String(minute).padStart(2, "0")} ${ampm}`;
}

// ─── Notification block ───────────────────────────────────────────────────────

type ReminderKey = "morning" | "midday" | "evening";

const REMINDER_META: Record<ReminderKey, { icon: string; label: string; body: string; prayer: string }> = {
  morning: {
    icon: "☀",
    label: "Morning Prayers",
    body: "Opens Morning Prayers (Trisagion)",
    prayer: "morning-trisagion",
  },
  midday: {
    icon: "◎",
    label: "Midday Prayer",
    body: "Opens Midday Prayer",
    prayer: "midday-prayer",
  },
  evening: {
    icon: "☽",
    label: "Evening Prayers",
    body: "Opens Evening Prayers",
    prayer: "evening-trisagion",
  },
};

function ReminderRow({
  kind,
  settings,
  onToggle,
  onTimePress,
  last,
}: {
  kind: ReminderKey;
  settings: NotifSettings;
  onToggle: (val: boolean) => void;
  onTimePress: () => void;
  last?: boolean;
}) {
  const meta = REMINDER_META[kind];
  const enabled: boolean = settings[kind] as boolean;
  const hour: number = settings[`${kind}Hour` as keyof NotifSettings] as number;
  const minute: number = settings[`${kind}Minute` as keyof NotifSettings] as number;

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: spacing.m,
          paddingHorizontal: spacing.m,
          backgroundColor: C.surfaceElevated,
          borderBottomWidth: enabled ? 1 : last ? 0 : 1,
          borderColor: C.hairline,
        }}
      >
        <Text style={{ fontSize: 18, marginRight: spacing.s }}>{meta.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.textPrimary, fontFamily: "serif", fontSize: 15 }}>
            {meta.label}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>
            {enabled ? `Daily at ${fmt12(hour, minute)} · ${meta.body}` : meta.body}
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: "#333", true: C.byzantineCrimson }}
          thumbColor={enabled ? C.sacredGold : "#666"}
        />
      </View>

      {enabled && (
        <Pressable
          onPress={onTimePress}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: spacing.s,
            paddingHorizontal: spacing.m,
            paddingLeft: spacing.m + 34,
            backgroundColor: pressed ? C.surface : C.surfaceElevated + "CC",
            borderBottomWidth: last ? 0 : 1,
            borderColor: C.hairline,
          })}
        >
          <MaterialCommunityIcons name="clock-outline" size={15} color={C.sacredGold} style={{ marginRight: spacing.xs }} />
          <Text style={{ flex: 1, color: C.sacredGold, fontSize: 14, fontFamily: "serif" }}>
            {fmt12(hour, minute)}
          </Text>
          <Text style={{ color: C.textMuted, fontSize: 12 }}>Change time ›</Text>
        </Pressable>
      )}
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type PickerTarget = { kind: ReminderKey; hour: number; minute: number } | null;

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotifSettings | null>(null);
  const [calStyle, setCalStyle] = useState<"new" | "old">("new");
  const [picker, setPicker] = useState<PickerTarget>(null);

  useEffect(() => {
    getNotifSettings().then(setSettings);
  }, []);

  const toggle = useCallback(
    async (kind: ReminderKey, val: boolean) => {
      if (!settings) return;
      if (val) {
        const granted = await requestPermissions();
        if (!granted) return;
      }
      const next = { ...settings, [kind]: val };
      setSettings(next);
      await saveNotifSettings(next);
    },
    [settings],
  );

  const openPicker = useCallback(
    (kind: ReminderKey) => {
      if (!settings) return;
      const hour = settings[`${kind}Hour` as keyof NotifSettings] as number;
      const minute = settings[`${kind}Minute` as keyof NotifSettings] as number;
      setPicker({ kind, hour, minute });
    },
    [settings],
  );

  const confirmTime = useCallback(
    async (hour: number, minute: number) => {
      if (!settings || !picker) return;
      const next = {
        ...settings,
        [`${picker.kind}Hour`]: hour,
        [`${picker.kind}Minute`]: minute,
      };
      setSettings(next);
      await saveNotifSettings(next);
      setPicker(null);
    },
    [settings, picker],
  );

  if (!settings) return null;

  return (
    <View style={{ flex: 1, backgroundColor: C.surfaceDeep }}>
      {/* Sheet header */}
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
        <Text style={{ fontFamily: "serif", fontWeight: "700", fontSize: 18, color: C.sacredGold }}>
          Settings
        </Text>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <Text style={{ color: C.sacredGold, fontWeight: "700", fontSize: 16 }}>Done</Text>
        </Pressable>
      </View>

      {/* Grabber */}
      <View
        style={{
          width: 36, height: 4, borderRadius: 2,
          backgroundColor: C.sacredGold, alignSelf: "center",
          marginTop: spacing.s, opacity: 0.5,
        }}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Prayer Reminders ── */}
        <SectionHeader label="Prayer Reminders" />
        <Text
          style={{
            color: C.textMuted,
            fontSize: 12,
            paddingHorizontal: spacing.m,
            paddingBottom: spacing.s,
            lineHeight: 18,
          }}
        >
          Tapping a reminder notification opens the prayer directly.
        </Text>
        <View
          style={{
            marginHorizontal: spacing.m,
            borderRadius: radii.m,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: C.hairline,
          }}
        >
          <ReminderRow
            kind="morning"
            settings={settings}
            onToggle={(v) => toggle("morning", v)}
            onTimePress={() => openPicker("morning")}
          />
          <ReminderRow
            kind="midday"
            settings={settings}
            onToggle={(v) => toggle("midday", v)}
            onTimePress={() => openPicker("midday")}
          />
          <ReminderRow
            kind="evening"
            settings={settings}
            onToggle={(v) => toggle("evening", v)}
            onTimePress={() => openPicker("evening")}
            last
          />
        </View>

        {/* ── Calendar ── */}
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
          <View
            style={{
              flexDirection: "row",
              backgroundColor: C.surfaceElevated,
              padding: spacing.m,
              alignItems: "center",
            }}
          >
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
                  <Text style={{ color: C.sacredGold, fontSize: 12, fontWeight: "600" }}>
                    {s === "new" ? "New" : "Old"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        {/* ── Reading ── */}
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

        {/* ── About ── */}
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

      {/* Time picker modal */}
      {picker && (
        <TimePicker
          visible
          label={`${REMINDER_META[picker.kind].icon}  ${REMINDER_META[picker.kind].label}`}
          hour={picker.hour}
          minute={picker.minute}
          onConfirm={confirmTime}
          onClose={() => setPicker(null)}
        />
      )}
    </View>
  );
}
