import { useMemo, useState } from "react";
import { Image, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeItem } from "@/components/ui/BadgeItem";
import {
  DropCap,
  HourCheck,
  ManuscriptScroll,
  Ornament,
  SmallCaps,
  TocRow,
  useFrame,
} from "@/components/ui/manuscript";
import { usePalette } from "@/hooks/usePalette";
import { BADGE_DEFS, getAllBadgeProgress, incrementBadge } from "@/lib/badges";
import {
  fetchLiturgicalDay,
  formatCivilDate,
  saintOfTheDay,
} from "@/lib/calendar";
import { CANONICAL_HOURS, getCurrentHour, type CanonicalHour } from "@/lib/canonicalHours";
import { recordStreakToday } from "@/lib/db";
import { getPeriodProgress, getTodayFastStatus } from "@/lib/fasting";
import { getPrayerBySlug } from "@/lib/prayers";
import { isHourKept, localYmd, usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";
import { useEffect } from "react";

const TODAYS_PRAYER =
  "Lord, teach me to pray with my whole heart, and in Your will, not mine, be done.";

const RULE_LINKS: { title: string; href: string; page?: string }[] = [
  { title: "Morning Prayers", href: "/prayers/morning-trisagion", page: "p. 5" },
  { title: "Evening Prayers", href: "/prayers/evening-trisagion", page: "p. 10" },
  { title: "The Nicene Creed", href: "/prayers/the-creed", page: "p. 7" },
  { title: "Psalm 50", href: "/prayers/psalm-50", page: "p. 27" },
  { title: "Orthodox Calendar", href: "/calendar" },
  { title: "Bookmarks", href: "/bookmarks" },
  { title: "The printed book", href: "/book" },
];

const NEEDS: { title: string; slug: string }[] = [
  { title: "Prayer for God's Will", slug: "morning-prayer-grant-me" },
  { title: "A Prayer of Husband and Wife", slug: "for-married" },
  { title: "A Prayer of Single Persons", slug: "for-single" },
  { title: "Before Commencing Any Task", slug: "before-work" },
  { title: "A Prayer in Time of Trouble", slug: "in-time-of-trouble" },
];

function HourAndFast({
  hourId,
  onHour,
}: {
  hourId: string;
  onHour: (id: string) => void;
}) {
  const C = usePalette();
  const hour = CANONICAL_HOURS.find((item) => item.id === hourId) ?? getCurrentHour();
  const fast = getTodayFastStatus();
  const progress = fast.period ? getPeriodProgress(fast.period) : null;
  return (
    <View>
      <SmallCaps>The hour</SmallCaps>
      <Text style={{ fontFamily: fonts.medium, fontSize: 27, lineHeight: 32, color: C.ink, marginTop: 4 }}>
        {hour.name}{" "}
        <Text style={{ fontFamily: fonts.italic, fontSize: 19, color: C.ink2 }}>{hour.greekName}</Text>
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 17, color: C.ink2, marginTop: 2 }}>
        {hour.subtitle} · {hour.timeLabel}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
        {CANONICAL_HOURS.map((item) => {
          const on = item.id === hour.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => onHour(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{ paddingVertical: 8, paddingHorizontal: 8, minHeight: 40, justifyContent: "center" }}
            >
              <Text
                style={{
                  fontFamily: fonts.medium,
                  fontSize: 16,
                  color: on ? C.rubric : C.ink2,
                  fontVariant: ["small-caps"],
                  letterSpacing: 0.4,
                  borderBottomWidth: on ? 1 : 0,
                  borderBottomColor: C.rubric,
                }}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={{ fontFamily: fonts.italic, fontSize: 19, lineHeight: 28, color: C.ink, marginTop: 8 }}>
        “{hour.verse}”
      </Text>
      <Text style={{ fontFamily: fonts.regular, fontSize: 15, color: C.ink2, marginTop: 2 }}>{hour.verseRef}</Text>
      <Pressable onPress={() => router.push(`/hours?id=${hour.id}` as never)} style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Pray {hour.name} ›</Text>
      </Pressable>

      <Ornament />
      <SmallCaps>The fast</SmallCaps>
      <Text style={{ fontFamily: fonts.regular, fontSize: 19, lineHeight: 28, color: C.ink, marginTop: 4 }}>
        {fast.label}
        {fast.period && progress ? `, day ${progress.elapsed} of ${progress.total}` : ""}.
      </Text>
      <Text style={{ fontFamily: fonts.italic, fontSize: 18, lineHeight: 26, color: C.ink2, marginTop: 2 }}>
        {fast.sublabel}
      </Text>
      {fast.rules.slice(0, 3).map((rule) => (
        <Text key={rule} style={{ fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: C.ink2, marginTop: 4 }}>
          · {rule}
        </Text>
      ))}
      <Pressable onPress={() => router.push("/fasting" as never)} style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>The fasting calendar ›</Text>
      </Pressable>
    </View>
  );
}

function SaintPlate({
  name,
  loading,
  failed,
}: {
  name: string;
  loading: boolean;
  failed: boolean;
}) {
  const C = usePalette();
  const showIcon = /nicholas/i.test(name);
  const caption = loading ? "Loading…" : failed ? "Not available offline" : name || "No commemoration listed";
  return (
    <View style={{ width: 108, borderWidth: 1, borderColor: C.rule2, backgroundColor: C.paper, padding: 4 }}>
      {showIcon ? (
        <Image
          source={require("@/assets/images/saint-nicholas.png")}
          style={{ width: "100%", height: 128 }}
          resizeMode="cover"
          accessibilityLabel="Icon of St Nicholas"
        />
      ) : null}
      <Text style={{ fontFamily: fonts.italic, fontSize: 13, lineHeight: 17, color: C.ink2, textAlign: "center", marginTop: 5, marginBottom: 2 }}>
        {caption}
      </Text>
    </View>
  );
}

export default function Home() {
  const C = usePalette();
  const { showMargin } = useFrame();
  const style = usePrefs((state) => state.calendarStyle);
  const checks = usePrefs((state) => state.ruleChecks);
  const toggleHour = usePrefs((state) => state.toggleHour);
  const today = useMemo(() => new Date(), []);
  const ymd = localYmd(today);
  const [hourId, setHourId] = useState(getCurrentHour().id);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      await recordStreakToday();
      await incrementBadge("daily_prayers", 1);
      setBadges(await getAllBadgeProgress());
    })();
  }, []);

  const dayQuery = useQuery({
    queryKey: ["orthocal-day", style, ymd],
    queryFn: () => fetchLiturgicalDay(today, style),
    staleTime: 12 * 60 * 60 * 1000,
  });

  const kept = CANONICAL_HOURS.filter((hour) => isHourKept(ymd, hour.id, checks)).length;
  const aside = <HourAndFast hourId={hourId} onHour={setHourId} />;
  const saintName = dayQuery.data ? saintOfTheDay(dayQuery.data) : "";

  return (
    <ManuscriptScroll inTabs margin={showMargin ? aside : undefined}>
      <Text style={{ textAlign: "center" }}>
        <SmallCaps color={C.ink2} size={17}>
          {formatCivilDate(today)}
        </SmallCaps>
      </Text>
      <Ornament />
      <SmallCaps>Today’s prayer</SmallCaps>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <DropCap text={TODAYS_PRAYER} />
          <Pressable onPress={() => router.push("/prayers/morning-prayer-grant-me" as never)} style={{ minHeight: 44, justifyContent: "center" }}>
            <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Read the prayer ›</Text>
          </Pressable>
        </View>
        <SaintPlate name={saintName} loading={dayQuery.isLoading} failed={dayQuery.isError} />
      </View>
      {dayQuery.data?.summaryTitle ? (
        <Text style={{ fontFamily: fonts.italic, fontSize: 16, color: C.ink2, marginTop: 8 }}>
          {dayQuery.data.summaryTitle}
        </Text>
      ) : null}

      {!showMargin ? (
        <>
          <Ornament />
          {aside}
        </>
      ) : (
        <Ornament />
      )}

      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <SmallCaps>Today’s hours</SmallCaps>
        <Text style={{ fontFamily: fonts.regular, fontSize: 16, color: C.ink2, fontVariant: ["tabular-nums"] }}>
          {kept} of {CANONICAL_HOURS.length} prayed
        </Text>
      </View>
      <View style={{ height: 3, backgroundColor: C.rule, marginTop: 8, marginBottom: 4 }}>
        <View style={{ width: `${(kept / CANONICAL_HOURS.length) * 100}%`, height: 3, backgroundColor: C.rubric }} />
      </View>
      {CANONICAL_HOURS.map((hour: CanonicalHour) => {
        const checked = isHourKept(ymd, hour.id, checks);
        const now = hour.id === getCurrentHour().id;
        return (
          <View key={hour.id} style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.rule, minHeight: 56 }}>
            <Pressable onPress={() => router.push(`/hours?id=${hour.id}` as never)} style={{ flex: 1, paddingVertical: 8 }}>
              <Text style={{ fontFamily: fonts.regular, fontSize: 18, color: now ? C.rubric : C.ink }}>
                {hour.name}
                {now ? "  ·  now" : ""}
              </Text>
              <Text style={{ fontFamily: fonts.italic, fontSize: 15, color: C.ink2 }} numberOfLines={1}>
                {hour.greekName} · {hour.timeLabel}
              </Text>
            </Pressable>
            <HourCheck
              checked={checked}
              label={`Mark ${hour.name} as prayed`}
              onToggle={() => toggleHour(ymd, hour.id)}
            />
          </View>
        );
      })}

      <Ornament />
      <SmallCaps>The rule of prayer</SmallCaps>
      <View>
        {RULE_LINKS.map((link) => (
          <TocRow key={link.title} title={link.title} page={link.page ?? "›"} onPress={() => router.push(link.href as never)} />
        ))}
      </View>

      <Ornament />
      <SmallCaps>For particular needs</SmallCaps>
      {NEEDS.map((item) => {
        const prayer = getPrayerBySlug(item.slug);
        return (
          <TocRow
            key={item.slug}
            title={item.title}
            page={prayer?.bookPage ? `p. ${prayer.bookPage}` : "›"}
            onPress={() => router.push(`/prayers/${item.slug}` as never)}
          />
        );
      })}

      <Pressable
        onPress={() =>
          Share.share({
            message: "The Red Prayer Book — a pocket prayer book for Orthodox Christians.",
          })
        }
        style={{ minHeight: 48, justifyContent: "center" }}
      >
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Share the Red Prayer Book ›</Text>
      </Pressable>

      <Ornament />
      <SmallCaps>Badges</SmallCaps>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {BADGE_DEFS.slice(0, 5).map((def) => (
          <BadgeItem key={def.id} def={def} progress={badges[def.id] ?? 0} size={72} onPress={() => router.push("/you" as never)} />
        ))}
      </View>
    </ManuscriptScroll>
  );
}
