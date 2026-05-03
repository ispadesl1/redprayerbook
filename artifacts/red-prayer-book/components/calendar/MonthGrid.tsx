import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';
import { getCalendarEntry, julianShift } from '@/lib/calendar';
import { DaySheet } from './DaySheet';

type Props = {
  year: number;
  month: number;
  style: 'new' | 'old';
};

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function MonthGrid({ year, month, style }: Props) {
  const [activeDay, setActiveDay] = useState<{
    year: number;
    month: number;
    day: number;
  } | null>(null);

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (number | null)[] = [];
    for (let i = 0; i < startDow; i++) out.push(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [year, month]);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.byzantineCrimson,
        }}
      >
        {DOW.map((d) => (
          <View
            key={d}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}
          >
            <Text
              style={{
                color: colors.sacredGold,
                fontSize: 10,
                letterSpacing: 1.2,
                fontWeight: '600',
                textTransform: 'uppercase',
              }}
            >
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          borderColor: colors.hairline,
          borderWidth: 1,
        }}
      >
        {cells.map((d, i) => {
          if (d == null) {
            return (
              <View
                key={`empty-${i}`}
                style={{
                  width: '14.285%',
                  minHeight: 80,
                  borderColor: colors.hairline,
                  borderWidth: 0.5,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              />
            );
          }
          const date = julianShift(new Date(year, month, d), style);
          const entry = getCalendarEntry(date);
          const isToday =
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <Pressable
              key={`day-${i}`}
              onPress={() => setActiveDay({ year, month, day: d })}
              style={({ pressed }) => ({
                width: '14.285%',
                minHeight: 80,
                borderColor: colors.hairline,
                borderWidth: 0.5,
                padding: 4,
                backgroundColor: isToday
                  ? 'rgba(139,14,26,0.3)'
                  : pressed
                  ? 'rgba(212,175,55,0.1)'
                  : 'transparent',
              })}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: isToday ? colors.sacredGold : colors.ivoryVellum,
                    fontWeight: '700',
                    fontSize: 14,
                  }}
                >
                  {d}
                </Text>
                {entry?.fast === 'fish' ? (
                  <Text style={{ fontSize: 8, marginLeft: 2 }}>🐟</Text>
                ) : null}
              </View>
              {entry?.title ? (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: 'serif',
                    fontSize: 8,
                    marginTop: 2,
                    lineHeight: 11,
                  }}
                  numberOfLines={3}
                >
                  {entry.title}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <DaySheet
        visible={!!activeDay}
        onClose={() => setActiveDay(null)}
        dayInfo={activeDay}
        style={style}
      />
    </View>
  );
}
