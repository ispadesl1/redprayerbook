import { useEffect, useState } from "react";
import { Image, Pressable, Share, Text, View } from "react-native";
import { router } from "expo-router";
import { BadgeItem } from "@/components/ui/BadgeItem";
import {
  DropCap,
  HourCheck,
  ManuscriptScroll,
  Ornament,
  SmallCaps,
  TocRow,
  focusRing,
  onSpaceKey,
  useFrame,
} from "@/components/ui/manuscript";
import { useLiturgicalDay } from "@/hooks/useCalendarData";
import { usePalette } from "@/hooks/usePalette";
import { useToday } from "@/hooks/useToday";
import { BADGE_DEFS, getAllBadgeProgress, incrementBadge } from "@/lib/badges";
import { fastLines, formatCivilDate, saintOfTheDay, seasonOfTheDay, type LiturgicalDay } from "@/lib/calendar";
import { CANONICAL_HOURS, getCurrentHour, type CanonicalHour } from "@/lib/canonicalHours";
import { recordStreakToday } from "@/lib/db";
import { getPrayerBySlug } from "@/lib/prayers";
import { isHourKept, localYmd, usePrefs } from "@/lib/prefs";
import { fonts } from "@/theme/typography";

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

function isWonderworker(name: string): boolean {
  return /Nicholas.*(Myra|Wonderworker)|Wonderworker.*Nicholas/i.test(name);
}

function HourAndFast({
  hourId,
  onHour,
  day,
  failed,
  onRetry,
}: {
  hourId: string;
  onHour: (id: string) => void;
  day?: LiturgicalDay;
  failed: boolean;
  onRetry: () => void;
}) {
  const C = usePalette();
  const hour = CANONICAL_HOURS.find((item) => item.id === hourId) ?? getCurrentHour();
  const fast = day ? fastLines(day) : null;
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
              aria-pressed={on}
              {...({ onKeyDown: onSpaceKey(() => onHour(item.id)) } as object)}
              style={(state) => {
                const focused = "focused" in state && Boolean((state as { focused?: boolean }).focused);
                return {
                  paddingVertical: 8,
                  paddingHorizontal: 8,
                  minHeight: 44,
                  justifyContent: "center" as const,
                  backgroundColor: state.pressed ? C.highlight : "transparent",
                  ...focusRing(C.rubric, focused),
                };
              }}
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
      <View style={{ minHeight: 72, marginTop: 4 }}>
        {day ? (
          <>
            <Text style={{ fontFamily: fonts.regular, fontSize: 19, lineHeight: 28, color: C.ink }}>
              {fast?.title || "No fast is listed for this day."}
            </Text>
            {fast?.detail ? (
              <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2, marginTop: 2 }}>{fast.detail}</Text>
            ) : null}
          </>
        ) : failed ? (
          <>
            <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2 }}>
              The fast for this calendar isn’t available.
            </Text>
            <Pressable onPress={onRetry} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>Try again</Text>
            </Pressable>
          </>
        ) : (
          <Text style={{ fontFamily: fonts.italic, fontSize: 17, lineHeight: 26, color: C.ink2 }}>Loading the fast…</Text>
        )}
      </View>
      <Pressable onPress={() => router.push("/fasting" as never)} accessibilityRole="link" style={{ minHeight: 44, justifyContent: "center" }}>
        <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 18 }}>The book’s fasting calendar ›</Text>
      </Pressable>
    </View>
  );
}

function SaintPlate({
  name,
  season,
  loading,
  failed,
  onRetry,
}: {
  name: string;
  season?: string;
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}) {
  const C = usePalette();
  const showIcon = isWonderworker(name);
  return (
    <View style={{ width: 156, minHeight: 140 }}>
      <SmallCaps size={14}>Saint of the day</SmallCaps>
      {showIcon ? (
        <View style={{ marginTop: 8 }}>
          <Image
            source={require("@/assets/images/saint-nicholas.png")}
            style={{ width: 96, height: 112, borderWidth: 1, borderColor: C.rule2 }}
            resizeMode="cover"
            accessibilityLabel="Icon of St Nicholas the Wonderworker"
          />
          <Text style={{ fontFamily: fonts.medium, fontSize: 16, lineHeight: 21, color: C.ink, marginTop: 6 }}>
            {name}
          </Text>
          {season ? (
            <Text style={{ fontFamily: fonts.italic, fontSize: 15, lineHeight: 20, color: C.ink2, marginTop: 6 }}>{season}</Text>
          ) : null}
        </View>
      ) : (
        <View style={{ marginTop: 8, minHeight: 96 }}>
          <Text style={{ fontFamily: fonts.regular, fontSize: 18, lineHeight: 22, color: C.rubric }}>✠</Text>
          <Text style={{ fontFamily: fonts.medium, fontSize: 20, lineHeight: 26, color: C.ink, marginTop: 4 }}>
            {name || (failed ? "Commemorations unavailable" : " ")}
          </Text>
          {season ? (
            <Text style={{ fontFamily: fonts.italic, fontSize: 15, lineHeight: 20, color: C.ink2, marginTop: 6 }}>{season}</Text>
          ) : null}
          {failed && !name ? (
            <Pressable onPress={onRetry} style={{ minHeight: 44, justifyContent: "center" }}>
              <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 16 }}>Try again</Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

export default function Home() {
  const C = usePalette();
  const { showMargin } = useFrame();
  const style = usePrefs((state) => state.calendarStyle);
  const checks = usePrefs((state) => state.ruleChecks);
  const toggleHour = usePrefs((state) => state.toggleHour);
  const today = useToday();
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

  const dayQuery = useLiturgicalDay(today, style);

  const kept = CANONICAL_HOURS.filter((hour) => isHourKept(ymd, hour.id, checks)).length;
  const aside = (
    <HourAndFast
      hourId={hourId}
      onHour={setHourId}
      day={dayQuery.data}
      failed={dayQuery.isError && !dayQuery.data}
      onRetry={() => dayQuery.refetch()}
    />
  );
  const saintName = dayQuery.data ? saintOfTheDay(dayQuery.data) : "";
  const seasonName = dayQuery.data ? seasonOfTheDay(dayQuery.data) : "";

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
        <SaintPlate
          name={saintName}
          season={seasonName}
          loading={dayQuery.isLoading && !dayQuery.data}
          failed={dayQuery.isError && !dayQuery.data}
          onRetry={() => dayQuery.refetch()}
        />
      </View>

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
        <Text
          accessibilityLiveRegion="polite"
          style={{ fontFamily: fonts.regular, fontSize: 16, color: C.ink2, fontVariant: ["tabular-nums"] }}
        >
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
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(`/hours?id=${hour.id}` as never)}
              style={({ pressed }) => ({ flex: 1, paddingVertical: 8, minHeight: 44, justifyContent: "center", backgroundColor: pressed ? C.highlight : "transparent" })}
            >
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
