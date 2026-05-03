import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { CrossDivider } from '@/components/ui/CrossDivider';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';
import { addHighlight } from '@/lib/db';

const JOHN_1 = [
  'In the beginning was the Word, and the Word was with God, and the Word was God.',
  'He was in the beginning with God.',
  'All things were made through Him, and without Him was not anything made that was made.',
  'In Him was life, and the life was the light of men.',
  'And the light shines in the darkness, and the darkness did not comprehend it.',
  'There was a man sent from God, whose name was John.',
  'This man came for a witness, to bear witness of the Light, that all through him might believe.',
  'He was not the Light, but came to bear witness of the Light.',
  'That was the true Light which enlightens every man coming into the world.',
  'He was in the world, and the world was made through Him, and the world did not know Him.',
  'He came to His own, and His own did not receive Him.',
  'But as many as received Him, to them He gave power to become sons of God, even to those who believe in His name,',
  'who were born, not of blood nor of the will of the flesh nor of the will of man, but of God.',
  'And the Word became flesh and dwelt among us, and we beheld His glory, glory as of the only-begotten from the Father, full of grace and truth.',
];

export default function Bible() {
  const [highlighted, setHighlighted] = useState<Set<number>>(new Set());
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [actionModal, setActionModal] = useState(false);

  const handleLongPress = (verseNum: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedVerse(verseNum);
    setActionModal(true);
  };

  const handleHighlight = async () => {
    if (selectedVerse == null) return;
    const newSet = new Set(highlighted);
    newSet.add(selectedVerse);
    setHighlighted(newSet);
    setActionModal(false);
    try {
      await addHighlight('john', 1, selectedVerse, '#D4AF37');
    } catch {}
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
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
        <Text style={{ color: colors.sacredGold, fontSize: 22 }}>‹</Text>
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 22,
            color: colors.ivoryVellum,
          }}
        >
          Bible
        </Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Text style={{ color: colors.sacredGold, fontSize: 18 }}>🔍</Text>
          <Text style={{ color: colors.sacredGold, fontSize: 18 }}>⋯</Text>
        </View>
      </View>

      <CrossDivider />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.m, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 28,
            color: colors.sacredGold,
            textAlign: 'center',
            marginTop: spacing.l,
          }}
        >
          The Gospel of Saint John
        </Text>
        <Text
          style={{
            color: colors.sacredGold,
            textAlign: 'center',
            letterSpacing: 3,
            marginVertical: spacing.s,
            fontWeight: '600',
            textTransform: 'uppercase',
            fontSize: 12,
          }}
        >
          Chapter 1
        </Text>

        <CrossDivider />

        <View style={{ marginTop: spacing.m }}>
          {JOHN_1.map((verse, i) => (
            <Pressable
              key={i}
              onLongPress={() => handleLongPress(i + 1)}
              style={{
                flexDirection: 'row',
                marginBottom: spacing.s,
                padding: 6,
                borderRadius: 8,
                backgroundColor: highlighted.has(i + 1)
                  ? 'rgba(212,175,55,0.15)'
                  : 'transparent',
              }}
            >
              <Text
                style={{
                  color: colors.sacredGold,
                  fontFamily: 'serif',
                  fontWeight: '700',
                  fontSize: 16,
                  width: 28,
                  textAlign: 'right',
                  marginRight: spacing.s,
                }}
              >
                {i + 1}
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  flex: 1,
                  fontFamily: 'serif',
                  fontSize: 15,
                  lineHeight: 24,
                }}
              >
                {verse}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Commentary card */}
        <View
          style={{
            marginTop: spacing.l,
            padding: spacing.m,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radii.l,
            borderWidth: 1,
            borderColor: colors.hairline,
          }}
        >
          <Text style={{ color: colors.sacredGold, fontSize: 18, marginBottom: 4 }}>
            ✟
          </Text>
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: 'serif',
              fontStyle: 'italic',
              fontSize: 14,
              lineHeight: 22,
            }}
          >
            The Evangelist John opens with a deliberate echo of Genesis, proclaiming
            the eternal pre-existence of the Logos, the Second Person of the Holy
            Trinity. In the beginning was the Word — not created but eternally begotten.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom dock */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          backgroundColor: colors.surface,
          borderTopColor: colors.hairline,
          borderTopWidth: 1,
        }}
      >
        <Pressable
          style={{
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xs,
            borderColor: colors.sacredGold,
            borderWidth: 1,
            borderRadius: radii.pill,
          }}
        >
          <Text style={{ color: colors.sacredGold, fontSize: 13 }}>John 1 ⌄</Text>
        </Pressable>

        <Pressable
          style={{
            paddingHorizontal: spacing.m,
            paddingVertical: spacing.xs,
            borderColor: colors.hairline,
            borderWidth: 1,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceElevated,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>OSB</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: spacing.s }}>
          <Pressable
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: colors.hairline,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: colors.sacredGold, fontSize: 18 }}>‹</Text>
          </Pressable>
          <Pressable
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: colors.hairline,
              borderWidth: 1,
            }}
          >
            <Text style={{ color: colors.sacredGold, fontSize: 18 }}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Verse action modal */}
      <Modal
        visible={actionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModal(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setActionModal(false)}
        />
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: spacing.l,
            paddingBottom: spacing.xxl,
          }}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 16,
              marginBottom: spacing.m,
              textAlign: 'center',
            }}
          >
            Verse {selectedVerse}
          </Text>
          {[
            { label: 'Highlight', icon: '✦', action: handleHighlight },
            { label: 'Copy', icon: '⎘', action: () => setActionModal(false) },
            { label: 'Share', icon: '↗', action: () => setActionModal(false) },
            { label: 'Bookmark', icon: '🔖', action: () => setActionModal(false) },
          ].map(({ label, icon, action }) => (
            <Pressable
              key={label}
              onPress={action}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.m,
                opacity: pressed ? 0.7 : 1,
                borderBottomWidth: 1,
                borderColor: colors.hairline,
              })}
            >
              <Text style={{ color: colors.sacredGold, fontSize: 20, width: 36 }}>
                {icon}
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontFamily: 'serif',
                  fontSize: 16,
                }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}
