import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { getCalendarEntry, julianShift } from '@/lib/calendar';
import type { CalendarEntry } from '@/lib/calendar';

type Props = {
  visible: boolean;
  onClose: () => void;
  dayInfo: { year: number; month: number; day: number } | null;
  style: 'new' | 'old';
};

export function DaySheet({ visible, onClose, dayInfo, style }: Props) {
  if (!dayInfo) return null;
  const date = julianShift(
    new Date(dayInfo.year, dayInfo.month, dayInfo.day),
    style
  );
  const entry = getCalendarEntry(date);
  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' }}
        onPress={onClose}
      />
      <View
        style={{
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderColor: colors.hairline,
          maxHeight: '70%',
        }}
      >
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.sacredGold,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 4,
          }}
        />
        <ScrollView
          contentContainerStyle={{
            padding: spacing.l,
            paddingBottom: spacing.xxxl,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 12,
              marginBottom: 4,
            }}
          >
            {dateLabel}
          </Text>
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 22,
              color: colors.sacredGold,
              marginBottom: spacing.s,
            }}
          >
            {entry?.title ?? 'No feast listed'}
          </Text>

          {entry?.saints?.length ? (
            <Text
              style={{
                color: colors.textPrimary,
                fontFamily: 'serif',
                fontSize: 14,
                marginBottom: spacing.s,
              }}
            >
              {entry.saints.join(' • ')}
            </Text>
          ) : null}

          {entry?.fast ? (
            <View
              style={{
                alignSelf: 'flex-start',
                paddingHorizontal: spacing.s,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: colors.vesperPurple,
                marginBottom: spacing.m,
              }}
            >
              <Text
                style={{
                  color: colors.ivoryVellum,
                  fontSize: 11,
                  letterSpacing: 1.2,
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}
              >
                {entry.fast}
              </Text>
            </View>
          ) : null}

          {entry?.epistle ? (
            <ReadingSection
              title={`Epistle — ${entry.epistle.ref}`}
              body={entry.epistle.text}
            />
          ) : null}
          {entry?.gospel ? (
            <ReadingSection
              title={`Gospel — ${entry.gospel.ref}`}
              body={entry.gospel.text}
            />
          ) : null}

          {entry?.tone ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: spacing.m,
              }}
            >
              Tone {entry.tone} of the Week
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ReadingSection({
  title,
  body,
}: {
  title: string;
  body?: string;
}) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text
        style={{
          color: colors.sacredGold,
          fontFamily: 'serif',
          fontWeight: '700',
          fontSize: 15,
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: colors.textPrimary,
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 14,
            lineHeight: 21,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
