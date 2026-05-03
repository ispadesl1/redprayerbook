import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing, radii, shadows } from '@/theme/spacing';
import { PRAYER_SECTIONS, PrayerSection, Prayer } from '@/lib/prayers';

const SECTION_ICONS: Record<string, string> = {
  morning: '☀',
  creed: '✟',
  midday: '◎',
  evening: '☽',
  'church-prayers': '⛪',
  'daily-life': '🕊',
  'special-prayers': '✦',
  'psalm-50': '✦',
  'spiritual-helps': '📖',
  confession: '🕊',
  communion: '✦',
  'various-occasions': '✦',
};

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View
      style={{
        marginHorizontal: spacing.m,
        marginBottom: spacing.s,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceElevated,
        borderRadius: radii.pill,
        borderWidth: 1,
        borderColor: colors.hairline,
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.xs,
      }}
    >
      <Text style={{ color: colors.textMuted, marginRight: spacing.xs, fontSize: 14 }}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search prayers…"
        placeholderTextColor={colors.textMuted}
        style={{
          flex: 1,
          color: colors.textPrimary,
          fontSize: 14,
          fontFamily: 'serif',
          paddingVertical: 2,
        }}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

function SectionCard({
  section,
  expanded,
  onToggle,
}: {
  section: PrayerSection;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View
      style={{
        marginHorizontal: spacing.m,
        marginBottom: spacing.s,
        borderRadius: radii.m,
        borderWidth: 1,
        borderColor: colors.hairline,
        backgroundColor: colors.surfaceElevated,
        overflow: 'hidden',
        ...shadows.card,
      }}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          backgroundColor: pressed
            ? 'rgba(212,175,55,0.08)'
            : 'transparent',
        })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.s,
            backgroundColor: section.color + '22',
            borderWidth: 1,
            borderColor: section.color + '55',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: spacing.s,
          }}
        >
          <Text style={{ fontSize: 18 }}>{section.icon}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 15,
              color: colors.sacredGold,
              letterSpacing: 0.3,
            }}
          >
            {section.title}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              marginTop: 1,
            }}
          >
            {section.prayers.length} {section.prayers.length === 1 ? 'prayer' : 'prayers'}
          </Text>
        </View>

        <Text
          style={{
            color: colors.sacredGold,
            fontSize: 18,
            marginLeft: spacing.xs,
            transform: [{ rotate: expanded ? '90deg' : '0deg' }],
          }}
        >
          ›
        </Text>
      </Pressable>

      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.hairline,
          }}
        >
          {section.prayers.map((prayer, idx) => (
            <PrayerRow
              key={prayer.slug}
              prayer={prayer}
              isLast={idx === section.prayers.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function PrayerRow({ prayer, isLast }: { prayer: Prayer; isLast: boolean }) {
  const kindLabel: Record<string, string> = {
    prayer: 'Prayer',
    psalm: 'Psalm',
    catechism: 'Catechism',
    responsive: 'Responsive',
    list: 'List',
  };

  const kindColor: Record<string, string> = {
    prayer: colors.sacredGold,
    psalm: colors.vesperPurple,
    catechism: colors.liturgicalGreen,
    responsive: colors.iconGold,
    list: colors.silverGleam,
  };

  return (
    <Pressable
      onPress={() => router.push(`/prayers/${prayer.slug}` as any)}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.m,
        paddingVertical: spacing.s,
        backgroundColor: pressed ? 'rgba(212,175,55,0.06)' : 'transparent',
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: 'rgba(212,175,55,0.1)',
      })}
    >
      <View style={{ flex: 1, paddingLeft: spacing.xs }}>
        <Text
          style={{
            fontFamily: 'serif',
            fontSize: 14,
            color: colors.textPrimary,
            fontWeight: '600',
          }}
        >
          {prayer.title}
        </Text>
        {prayer.subtitle ? (
          <Text
            style={{
              fontSize: 11,
              color: colors.textMuted,
              marginTop: 1,
              fontStyle: 'italic',
            }}
          >
            {prayer.subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          backgroundColor: (kindColor[prayer.kind] ?? colors.sacredGold) + '22',
          borderRadius: radii.pill,
          paddingHorizontal: 7,
          paddingVertical: 2,
          marginLeft: spacing.xs,
        }}
      >
        <Text
          style={{
            fontSize: 10,
            color: kindColor[prayer.kind] ?? colors.sacredGold,
            fontWeight: '600',
          }}
        >
          {kindLabel[prayer.kind] ?? prayer.kind}
        </Text>
      </View>

      <Text style={{ color: colors.textMuted, marginLeft: spacing.xs, fontSize: 14 }}>›</Text>
    </Pressable>
  );
}

function SearchResults({ query }: { query: string }) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  const results: Array<{ prayer: Prayer; sectionTitle: string }> = [];
  for (const section of PRAYER_SECTIONS) {
    for (const prayer of section.prayers) {
      if (
        prayer.title.toLowerCase().includes(q) ||
        (prayer.subtitle ?? '').toLowerCase().includes(q) ||
        (prayer.text ?? '').toLowerCase().includes(q) ||
        (prayer.items ?? []).join(' ').toLowerCase().includes(q)
      ) {
        results.push({ prayer, sectionTitle: section.title });
      }
    }
  }

  if (results.length === 0) {
    return (
      <View
        style={{
          marginHorizontal: spacing.m,
          marginTop: spacing.xl,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: 14 }}>
          No prayers found for "{query}"
        </Text>
      </View>
    );
  }

  return (
    <View style={{ marginHorizontal: spacing.m }}>
      <Text
        style={{
          fontSize: 11,
          color: colors.textMuted,
          marginBottom: spacing.s,
          letterSpacing: 0.5,
        }}
      >
        {results.length} result{results.length !== 1 ? 's' : ''}
      </Text>
      {results.map(({ prayer, sectionTitle }) => (
        <Pressable
          key={prayer.slug}
          onPress={() => router.push(`/prayers/${prayer.slug}` as any)}
          style={({ pressed }) => ({
            backgroundColor: pressed
              ? 'rgba(212,175,55,0.08)'
              : colors.surfaceElevated,
            borderRadius: radii.m,
            borderWidth: 1,
            borderColor: colors.hairline,
            padding: spacing.s,
            marginBottom: spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
          })}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: 'serif',
                fontWeight: '700',
                fontSize: 14,
                color: colors.sacredGold,
              }}
            >
              {prayer.title}
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
              {sectionTitle}
            </Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 14 }}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function Prayers() {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['morning'])
  );
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.surfaceDeep }}
    >
      <View
        style={{
          paddingHorizontal: spacing.m,
          paddingTop: spacing.s,
          paddingBottom: spacing.xs,
          borderBottomColor: colors.hairline,
          borderBottomWidth: 1,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 22,
            color: colors.sacredGold,
            letterSpacing: 1.5,
            textAlign: 'center',
            marginBottom: spacing.xs,
          }}
        >
          ✟  Prayer Book  ✟
        </Text>
        <Text
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 11,
            color: colors.textMuted,
            textAlign: 'center',
            marginBottom: spacing.s,
            letterSpacing: 0.5,
          }}
        >
          A Pocket Prayer Book for Orthodox Christians
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.m, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {isSearching ? (
          <SearchResults query={searchQuery} />
        ) : (
          <>
            <GoldDivider />
            {PRAYER_SECTIONS.map((section) => (
              <SectionCard
                key={section.id}
                section={section}
                expanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function GoldDivider() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: spacing.m,
        marginBottom: spacing.m,
      }}
    >
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.hairline,
        }}
      />
      <Text
        style={{
          color: colors.sacredGold,
          fontSize: 12,
          marginHorizontal: spacing.s,
          opacity: 0.7,
        }}
      >
        ✦
      </Text>
      <View
        style={{
          flex: 1,
          height: 1,
          backgroundColor: colors.hairline,
        }}
      />
    </View>
  );
}
