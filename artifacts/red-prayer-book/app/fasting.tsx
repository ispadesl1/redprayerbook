import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ManuscriptScroll, Ornament, SmallCaps, StackBar } from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import {
  formatShortDate,
  getFastingPeriods,
  getPascha,
  getPeriodProgress,
  getStrictnessLabel,
  getTodayFastStatus,
  SINGLE_FASTS,
  type FastingPeriod,
} from "@/lib/fasting";
import { fonts } from "@/theme/typography";

export default function FastingScreen() {
  const C = usePalette();
  const today = useMemo(() => new Date(), []);
  const year = today.getFullYear();
  const periods = useMemo(() => getFastingPeriods(year), [year]);
  const status = useMemo(() => getTodayFastStatus(today), [today]);
  const pascha = useMemo(() => getPascha(year), [year]);
  const [openId, setOpenId] = useState<string | null>(status.period?.id ?? null);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <StackBar title="Fasting" onBack={() => router.back()} />
      <ManuscriptScroll>
        <SmallCaps>Today</SmallCaps>
        <Text style={{ fontFamily: fonts.medium, fontSize: 28, lineHeight: 34, color: C.ink, marginTop: 6 }}>{status.label}</Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 18, color: C.ink2, marginTop: 4 }}>
          {status.sublabel} · {getStrictnessLabel(status.strictness)}
        </Text>
        {status.rules.map((rule) => (
          <View key={rule} style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <MaterialCommunityIcons
              name={status.isFastFree ? "check-circle-outline" : "close-circle-outline"}
              size={16}
              color={C.rubric}
              style={{ marginTop: 3 }}
            />
            <Text style={{ flex: 1, fontFamily: fonts.regular, fontSize: 17, lineHeight: 24, color: C.ink }}>{rule}</Text>
          </View>
        ))}
        <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2, marginTop: 16 }}>
          Pascha {year}: {formatShortDate(pascha)}
        </Text>
        <Ornament />
        <SmallCaps>The year</SmallCaps>
        {periods.map((period) => (
          <PeriodRow key={period.id} period={period} today={today} open={openId === period.id} onToggle={() => setOpenId((current) => (current === period.id ? null : period.id))} />
        ))}
        <Ornament />
        <SmallCaps>Single-day fasts</SmallCaps>
        {SINGLE_FASTS.map((fast) => (
          <Text key={fast.name} style={{ fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: C.ink, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.rule }}>
            {fast.name}
            <Text style={{ fontFamily: fonts.italic, color: C.ink2 }}> · {formatShortDate(new Date(year, fast.month, fast.day))}</Text>
          </Text>
        ))}
      </ManuscriptScroll>
    </View>
  );
}

function PeriodRow({
  period,
  today,
  open,
  onToggle,
}: {
  period: FastingPeriod;
  today: Date;
  open: boolean;
  onToggle: () => void;
}) {
  const C = usePalette();
  const stamp = (date: Date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
  const active = stamp(today) >= stamp(period.startDate) && stamp(today) <= stamp(period.endDate);
  const progress = active ? getPeriodProgress(period, today) : null;
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.rule }}>
      <Pressable onPress={onToggle} style={({ pressed }) => ({ backgroundColor: pressed ? C.highlight : "transparent", paddingVertical: 12 })}>
        <Text style={{ fontFamily: fonts.regular, fontSize: 19, color: active ? C.rubric : C.ink }}>{period.name}</Text>
        <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2, marginTop: 2 }}>
          {formatShortDate(period.startDate)} – {formatShortDate(period.endDate)}
          {progress ? ` · day ${progress.elapsed} of ${progress.total}` : ""}
        </Text>
      </Pressable>
      {open ? (
        <View style={{ paddingBottom: 12 }}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: C.ink }}>{period.description}</Text>
          {period.rules.map((rule) => (
            <Text key={rule} style={{ fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: C.ink2, marginTop: 4 }}>
              · {rule}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
