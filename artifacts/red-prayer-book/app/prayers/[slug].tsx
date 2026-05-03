import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CrossDivider } from '@/components/ui/CrossDivider';
import { FiligreeFrame } from '@/components/ui/FiligreeFrame';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

const PRAYERS: Record<string, { title: string; text: string }> = {
  morning: {
    title: 'Morning Prayer',
    text: `O Lord, grant me to greet the coming day in peace. Help me in all things to rely upon Thy holy will. In every hour of the day reveal Thy will to me. Bless my dealings with all who surround me.

Teach me to treat all that comes to me throughout the day with peace of soul and with firm conviction that Thy will governs all. In all my deeds and words, guide my thoughts and feelings. In unexpected events, let me not forget that all are sent by Thee.

Teach me to act firmly and wisely, without embittering and embarrassing others. Give me strength to bear the fatigue of the coming day with all that it shall bring. Direct my will, teach me to pray, and Thou, Thyself, pray in me.

Amen.`,
  },
  evening: {
    title: 'Evening Prayer',
    text: `O Lord our God, in whom we believe and whose name we invoke above every other name: grant us, as we go to our rest, refreshment of body and soul.

Keep us from all the fantasies of the Evil One, and from the temptations that assail us. Calm the impulses of carnal desire, and quench the fiery darts of the Evil One that are craftily aimed at us.

Grant us a peaceful and undisturbed night. Free us from all darkness that comes from sin.

Amen.`,
  },
  will: {
    title: "Prayer for God's Will",
    text: `O God, our Lord and Savior, not my will but Thine be done in all things, always and forever. Let me not trust in my own wisdom, but in Thee who art the source of all wisdom and goodness.

Guide my steps, order my ways, and if in my ignorance I should wander from Thy path, bring me back with mercy and compassion.

Amen.`,
  },
};

export default function PrayerDetail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const prayer = PRAYERS[slug ?? 'morning'] ?? PRAYERS['morning'];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ marginRight: spacing.m }}>
          <Text style={{ color: colors.sacredGold, fontSize: 24 }}>‹</Text>
        </Pressable>
        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 20,
            color: colors.ivoryVellum,
            flex: 1,
          }}
        >
          {prayer.title}
        </Text>
      </View>

      <CrossDivider />

      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <FiligreeFrame>
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 22,
              color: colors.sacredGold,
              textAlign: 'center',
              marginBottom: spacing.m,
            }}
          >
            ✟  {prayer.title}  ✟
          </Text>
          <Text
            style={{
              fontFamily: 'serif',
              fontStyle: 'italic',
              fontSize: 16,
              color: colors.ivoryVellum,
              lineHeight: 26,
              textAlign: 'justify',
            }}
          >
            {prayer.text}
          </Text>
        </FiligreeFrame>
      </ScrollView>
    </SafeAreaView>
  );
}
