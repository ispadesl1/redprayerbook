import { ScrollView, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { CrossDivider } from '@/components/ui/CrossDivider';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

const SAINTS: Record<string, { name: string; feast: string; life: string }> = {
  'nicholas': {
    name: 'Saint Nicholas the Wonderworker',
    feast: 'December 6 / 19',
    life: `Saint Nicholas was born in the city of Patara in the province of Lycia in Asia Minor. His wealthy parents, who raised him in piety and virtue, reposed after a short illness, leaving their child in the hands of God.

The uncle of Saint Nicholas, Bishop Nicholas of Patara, seeing that his nephew was given over to continual prayer and study of the Holy Scripture, tonsured him a reader, and then ordained him a presbyter.

Saint Nicholas performed many miracles throughout his life, providing for the poor in secret, defending the innocent, and calming storms at sea. He reposed peacefully in old age, and his relics were found to be incorrupt.`,
  },
};

export default function SaintDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const saint = SAINTS[id ?? 'nicholas'] ?? SAINTS['nicholas'];

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
            fontSize: 18,
            color: colors.ivoryVellum,
            flex: 1,
          }}
        >
          Lives of the Saints
        </Text>
      </View>

      <CrossDivider />

      <ScrollView
        contentContainerStyle={{ padding: spacing.m, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: 'center',
            marginBottom: spacing.l,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: colors.sacredGold,
              backgroundColor: colors.byzantineCrimson,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.m,
            }}
          >
            <Text style={{ fontSize: 40 }}>☦</Text>
          </View>
          <Text
            style={{
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 22,
              color: colors.sacredGold,
              textAlign: 'center',
            }}
          >
            {saint.name}
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 13,
              marginTop: 6,
              letterSpacing: 1,
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            Feast Day: {saint.feast}
          </Text>
        </View>

        <CrossDivider />

        <Text
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 15,
            color: colors.textPrimary,
            lineHeight: 24,
            marginTop: spacing.m,
            textAlign: 'justify',
          }}
        >
          {saint.life}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
