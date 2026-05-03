import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';
import { getStreakCount, recordStreakToday } from '@/lib/db';

const BADGES = [
  { icon: '📖', label: 'Bible Read', value: '7' },
  { icon: '✦', label: 'Share Verses', value: '12' },
  { icon: '📝', label: 'Notes', value: '18' },
  { icon: '☽', label: 'Days Fasted', value: '26' },
  { icon: '✟', label: 'Daily Prayers', value: '45' },
  { icon: '⚡', label: 'Streak', value: '1' },
  { icon: '☦', label: 'Calendar', value: '3' },
  { icon: '🕯', label: 'Vespers', value: '9' },
];

const ACTIVITY_TABS = ['All', 'Highlights', 'Notes', 'Badges'];

export default function You() {
  const [activeTab, setActiveTab] = useState(0);
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        await recordStreakToday();
        const count = await getStreakCount();
        setStreak(count);
      } catch {}
    })();
  }, []);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top chip cluster */}
        <View
          style={{
            alignSelf: 'flex-end',
            flexDirection: 'row',
            gap: spacing.s,
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.m,
            borderRadius: radii.pill,
            borderColor: colors.sacredGold,
            borderWidth: 1,
          }}
        >
          {['▦', '⚙', '≡'].map((g) => (
            <Pressable key={g}>
              <Text style={{ color: colors.sacredGold, fontSize: 16 }}>{g}</Text>
            </Pressable>
          ))}
        </View>

        {/* Profile row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.m }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'serif',
                fontWeight: '700',
                fontSize: 26,
                color: colors.ivoryVellum,
              }}
            >
              Andy Acevedo
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs }}>
              {['Friends 1', 'Following 1'].map((p) => (
                <View
                  key={p}
                  style={{
                    paddingHorizontal: spacing.s,
                    paddingVertical: 4,
                    borderColor: colors.sacredGold,
                    borderWidth: 1,
                    borderRadius: radii.pill,
                  }}
                >
                  <Text style={{ color: colors.sacredGold, fontSize: 11 }}>{p}</Text>
                </View>
              ))}
            </View>
          </View>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: colors.sacredGold,
              backgroundColor: colors.byzantineCrimson,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: colors.sacredGold,
                fontFamily: 'serif',
                fontWeight: '700',
                fontSize: 30,
              }}
            >
              A
            </Text>
          </View>
        </View>

        {/* Add church */}
        <Pressable
          style={({ pressed }) => ({
            marginTop: spacing.m,
            paddingVertical: spacing.m,
            borderColor: colors.sacredGold,
            borderWidth: 1,
            borderRadius: radii.m,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: spacing.xs,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={{ color: colors.sacredGold }}>✟</Text>
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: 'serif',
              fontWeight: '600',
              fontSize: 15,
            }}
          >
            Add Your Church
          </Text>
        </Pressable>

        {/* Stat tiles */}
        <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.m }}>
          {['Saved', 'Prayer', 'Giving'].map((label) => (
            <View
              key={label}
              style={{
                flex: 1,
                paddingVertical: spacing.l,
                alignItems: 'center',
                borderColor: colors.hairline,
                borderWidth: 1,
                borderRadius: radii.m,
                backgroundColor: colors.surfaceElevated,
              }}
            >
              <Text style={{ color: colors.sacredGold, fontSize: 20, marginBottom: 4 }}>
                ✦
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: 'serif',
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        {/* Streak */}
        <View
          style={{
            marginTop: spacing.m,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.m,
            borderColor: colors.hairline,
            borderWidth: 1,
            borderRadius: radii.m,
            backgroundColor: colors.surfaceElevated,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: colors.ivoryVellum,
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 36,
              marginRight: spacing.m,
            }}
          >
            {streak}
          </Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.textPrimary, fontFamily: 'serif', fontSize: 15 }}>
              Day Streak
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              Keep praying every day
            </Text>
          </View>
          <Text style={{ color: colors.sacredGold, fontSize: 28 }}>⚡</Text>
        </View>

        {/* Badges */}
        <View
          style={{
            marginTop: spacing.m,
            padding: spacing.m,
            borderColor: colors.hairline,
            borderWidth: 1,
            borderRadius: radii.m,
            backgroundColor: colors.surfaceElevated,
          }}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 15,
              marginBottom: spacing.m,
            }}
          >
            {BADGES.length} Badges
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s }}>
            {BADGES.map(({ icon, label, value }) => (
              <View key={label} style={{ alignItems: 'center', width: 60 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    borderWidth: 2,
                    borderColor: colors.sacredGold,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>
                <Text
                  style={{
                    color: colors.sacredGold,
                    fontWeight: '700',
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {value}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 9,
                    textAlign: 'center',
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Activity section */}
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 22,
            color: colors.ivoryVellum,
            marginTop: spacing.l,
          }}
        >
          Activity
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.xs, marginTop: spacing.s }}>
          {ACTIVITY_TABS.map((t, i) => (
            <Pressable
              key={t}
              onPress={() => setActiveTab(i)}
              style={{
                paddingHorizontal: spacing.s,
                paddingVertical: 6,
                borderRadius: radii.pill,
                borderColor: colors.sacredGold,
                borderWidth: 1,
                backgroundColor:
                  activeTab === i ? colors.sacredGold : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === i ? colors.surfaceDeep : colors.sacredGold,
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={{
            marginTop: spacing.m,
            padding: spacing.m,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: colors.hairline,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.textMuted, fontFamily: 'serif', fontSize: 14 }}>
            Your activity will appear here as you pray daily.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
