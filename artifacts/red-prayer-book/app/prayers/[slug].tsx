import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';
import {
  getPrayerBySlug,
  Prayer,
  PRAYER_SECTIONS,
} from '@/lib/prayers';
import {
  isPrayerBookmarked,
  addPrayerBookmark,
  removePrayerBookmark,
  recordPrayerRead,
} from '@/lib/db';

function BackButton() {
  return (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.s,
        borderRadius: radii.pill,
        backgroundColor: pressed ? 'rgba(212,175,55,0.1)' : 'transparent',
      })}
    >
      <Text style={{ color: colors.sacredGold, fontSize: 20, marginRight: 4 }}>‹</Text>
      <Text style={{ color: colors.sacredGold, fontSize: 13, fontFamily: 'serif' }}>
        Prayer Book
      </Text>
    </Pressable>
  );
}

function GoldRule() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.m,
      }}
    >
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
      <Text style={{ color: colors.sacredGold, fontSize: 12, marginHorizontal: spacing.s }}>
        ✦
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
    </View>
  );
}

function Rubric({ text }: { text: string }) {
  return (
    <View
      style={{
        backgroundColor: 'rgba(139,14,26,0.18)',
        borderLeftWidth: 2,
        borderLeftColor: colors.byzantineCrimson,
        borderRadius: radii.s,
        paddingHorizontal: spacing.s,
        paddingVertical: spacing.xs,
        marginBottom: spacing.m,
      }}
    >
      <Text
        style={{
          fontFamily: 'serif',
          fontStyle: 'italic',
          fontSize: 13,
          color: colors.textSecondary,
          lineHeight: 20,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function PrayerText({ text }: { text: string }) {
  const paragraphs = text.split('\n\n');
  return (
    <>
      {paragraphs.map((para, idx) => {
        const isHeading =
          /^[A-Z]{4,}/.test(para.trim()) && para.length < 60;
        const isDialogLine =
          /^(PRIEST|CHOIR|PEOPLE|READER|And the Priest|The Priest|Then|Meanwhile)/.test(
            para.trim(),
          );
        const isItalicStage =
          para.trim().startsWith('(') && para.trim().endsWith(')');

        if (isHeading) {
          return (
            <Text
              key={idx}
              style={{
                fontFamily: 'serif',
                fontWeight: '700',
                fontSize: 14,
                color: colors.sacredGold,
                textAlign: 'center',
                letterSpacing: 0.8,
                marginTop: idx > 0 ? spacing.m : 0,
                marginBottom: spacing.xs,
              }}
            >
              {para.trim()}
            </Text>
          );
        }

        if (isItalicStage) {
          return (
            <Text
              key={idx}
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: colors.textMuted,
                lineHeight: 20,
                textAlign: 'center',
                marginBottom: spacing.s,
              }}
            >
              {para.trim()}
            </Text>
          );
        }

        if (isDialogLine) {
          const lines = para.split('\n');
          return (
            <View key={idx} style={{ marginBottom: spacing.s }}>
              {lines.map((line, li) => (
                <Text
                  key={li}
                  style={{
                    fontFamily: 'serif',
                    fontSize: 15,
                    color: /^(PRIEST|CHOIR|PEOPLE|READER)/.test(line.trim())
                      ? colors.martyrRed
                      : colors.textPrimary,
                    lineHeight: 24,
                    fontWeight: /^(PRIEST|CHOIR|PEOPLE|READER)/.test(
                      line.trim(),
                    )
                      ? '700'
                      : '400',
                  }}
                >
                  {line}
                </Text>
              ))}
            </View>
          );
        }

        return (
          <Text
            key={idx}
            style={{
              fontFamily: 'serif',
              fontSize: 16,
              color: colors.textPrimary,
              lineHeight: 28,
              textAlign: 'justify',
              marginBottom: idx < paragraphs.length - 1 ? spacing.m : 0,
            }}
          >
            {para.trim()}
          </Text>
        );
      })}
    </>
  );
}

function ListContent({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: spacing.s,
          }}
        >
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: 'rgba(212,175,55,0.15)',
              borderWidth: 1,
              borderColor: colors.hairline,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.s,
              marginTop: 1,
              flexShrink: 0,
            }}
          >
            <Text
              style={{
                color: colors.sacredGold,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {idx + 1}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: 'serif',
              fontSize: 16,
              color: colors.textPrimary,
              lineHeight: 26,
              flex: 1,
            }}
          >
            {item}
          </Text>
        </View>
      ))}
    </>
  );
}

function SectionNavPills({ currentSlug }: { currentSlug: string }) {
  const section = PRAYER_SECTIONS.find((s) =>
    s.prayers.some((p) => p.slug === currentSlug),
  );
  if (!section || section.prayers.length <= 1) return null;

  const currentIdx = section.prayers.findIndex((p) => p.slug === currentSlug);

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
        paddingTop: spacing.m,
        borderTopWidth: 1,
        borderTopColor: colors.hairline,
      }}
    >
      {currentIdx > 0 ? (
        <Pressable
          onPress={() =>
            router.replace(
              `/prayers/${section.prayers[currentIdx - 1].slug}` as any,
            )
          }
          style={({ pressed }) => ({
            flex: 1,
            marginRight: spacing.xs,
            backgroundColor: pressed
              ? 'rgba(212,175,55,0.12)'
              : colors.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: spacing.s,
          })}
        >
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>‹ Previous</Text>
          <Text
            style={{
              color: colors.sacredGold,
              fontSize: 13,
              fontFamily: 'serif',
              fontWeight: '600',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {section.prayers[currentIdx - 1].title}
          </Text>
        </Pressable>
      ) : (
        <View style={{ flex: 1, marginRight: spacing.xs }} />
      )}

      {currentIdx < section.prayers.length - 1 ? (
        <Pressable
          onPress={() =>
            router.replace(
              `/prayers/${section.prayers[currentIdx + 1].slug}` as any,
            )
          }
          style={({ pressed }) => ({
            flex: 1,
            marginLeft: spacing.xs,
            backgroundColor: pressed
              ? 'rgba(212,175,55,0.12)'
              : colors.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: spacing.s,
            alignItems: 'flex-end',
          })}
        >
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Next ›</Text>
          <Text
            style={{
              color: colors.sacredGold,
              fontSize: 13,
              fontFamily: 'serif',
              fontWeight: '600',
              marginTop: 2,
            }}
            numberOfLines={1}
          >
            {section.prayers[currentIdx + 1].title}
          </Text>
        </Pressable>
      ) : (
        <View style={{ flex: 1, marginLeft: spacing.xs }} />
      )}
    </View>
  );
}

export default function PrayerDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const prayer =
    getPrayerBySlug(slug ?? '') ?? getPrayerBySlug('morning-trisagion')!;

  const section = PRAYER_SECTIONS.find((s) =>
    s.prayers.some((p) => p.slug === prayer.slug),
  );

  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    isPrayerBookmarked(prayer.slug).then(setBookmarked);
    recordPrayerRead(prayer.slug);
  }, [prayer.slug]);

  const toggleBookmark = useCallback(async () => {
    if (bookmarked) {
      await removePrayerBookmark(prayer.slug);
      setBookmarked(false);
    } else {
      await addPrayerBookmark(
        prayer.slug,
        prayer.title,
        section?.title ?? 'Prayer Book',
      );
      setBookmarked(true);
    }
  }, [bookmarked, prayer.slug, prayer.title, section?.title]);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.surfaceDeep }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.s,
          paddingVertical: spacing.xs,
          borderBottomWidth: 1,
          borderBottomColor: colors.hairline,
          backgroundColor: colors.surface,
        }}
      >
        <BackButton />

        <View style={{ flex: 1 }} />

        {section && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: spacing.s,
              paddingVertical: 4,
              backgroundColor: section.color + '22',
              borderRadius: radii.pill,
              marginRight: spacing.xs,
            }}
          >
            <Text style={{ fontSize: 12, marginRight: 4 }}>{section.icon}</Text>
            <Text
              style={{
                color: section.color,
                fontSize: 11,
                fontWeight: '600',
              }}
              numberOfLines={1}
            >
              {section.title}
            </Text>
          </View>
        )}

        {/* Bookmark button */}
        <Pressable
          onPress={toggleBookmark}
          style={({ pressed }) => ({
            padding: spacing.xs,
            borderRadius: radii.m,
            backgroundColor: pressed
              ? 'rgba(212,175,55,0.15)'
              : bookmarked
              ? 'rgba(212,175,55,0.12)'
              : 'transparent',
            borderWidth: bookmarked ? 1 : 0,
            borderColor: colors.hairline,
          })}
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <MaterialCommunityIcons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={bookmarked ? colors.sacredGold : colors.textMuted}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.m,
          paddingBottom: spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.hairline,
            borderRadius: radii.l,
            backgroundColor: colors.surface,
            padding: spacing.m,
            marginBottom: spacing.m,
          }}
        >
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 22,
              color: colors.sacredGold,
              textAlign: 'center',
              letterSpacing: 0.5,
            }}
          >
            {prayer.title}
          </Text>

          {prayer.subtitle ? (
            <Text
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: colors.textMuted,
                textAlign: 'center',
                marginTop: spacing.xs,
              }}
            >
              {prayer.subtitle}
            </Text>
          ) : null}

          {prayer.bookPage ? (
            <View style={{ alignItems: 'center', marginTop: spacing.s }}>
              <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                — p. {prayer.bookPage} —
              </Text>
            </View>
          ) : null}

          {/* Bookmark hint */}
          {bookmarked && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: spacing.s,
                gap: 4,
              }}
            >
              <MaterialCommunityIcons
                name="bookmark"
                size={12}
                color={colors.sacredGold}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: colors.sacredGold,
                  fontStyle: 'italic',
                  opacity: 0.8,
                }}
              >
                Saved to Bookmarks
              </Text>
            </View>
          )}
        </View>

        <GoldRule />

        {prayer.rubric ? <Rubric text={prayer.rubric} /> : null}

        {prayer.kind === 'list' && prayer.items ? (
          <ListContent items={prayer.items} />
        ) : prayer.text ? (
          <PrayerText text={prayer.text} />
        ) : null}

        <SectionNavPills currentSlug={prayer.slug} />
      </ScrollView>
    </SafeAreaView>
  );
}
