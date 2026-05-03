import { useState } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MonthGrid } from '@/components/calendar/MonthGrid';
import { CrossDivider } from '@/components/ui/CrossDivider';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [calStyle, setCalStyle] = useState<'new' | 'old'>('new');

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.surfaceDeep }}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
          }}
        >
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 24,
              color: colors.ivoryVellum,
            }}
          >
            Calendar
          </Text>
          <View
            style={{
              flexDirection: 'row',
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: colors.hairline,
              overflow: 'hidden',
            }}
          >
            {(['new', 'old'] as const).map((s) => (
              <Pressable
                key={s}
                onPress={() => setCalStyle(s)}
                style={{
                  paddingHorizontal: spacing.m,
                  paddingVertical: 6,
                  backgroundColor:
                    calStyle === s ? colors.byzantineCrimson : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: calStyle === s ? colors.sacredGold : colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  {s === 'new' ? 'New' : 'Old'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <CrossDivider />

        {/* Month navigation */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.s,
          }}
        >
          <Pressable onPress={prevMonth} style={{ padding: spacing.s }}>
            <Text style={{ color: colors.sacredGold, fontSize: 24 }}>‹</Text>
          </Pressable>

          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'serif',
                fontWeight: '700',
                fontSize: 22,
                color: colors.sacredGold,
              }}
            >
              {MONTHS[month]}
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              {year}
            </Text>
          </View>

          <Pressable onPress={nextMonth} style={{ padding: spacing.s }}>
            <Text style={{ color: colors.sacredGold, fontSize: 24 }}>›</Text>
          </Pressable>
        </View>

        <MonthGrid year={year} month={month} style={calStyle} />

        <View
          style={{
            margin: spacing.m,
            padding: spacing.m,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: colors.hairline,
          }}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 16,
              marginBottom: 4,
            }}
          >
            Tone of the Week
          </Text>
          <Text style={{ color: colors.textSecondary, fontFamily: 'serif', fontSize: 13 }}>
            Tone {(new Date().getDay() % 8) + 1} · {calStyle === 'old' ? 'Old (Julian)' : 'New (Gregorian)'} Calendar
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
