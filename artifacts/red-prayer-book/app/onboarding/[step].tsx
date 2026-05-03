import { View, Text, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

const STEPS = [
  {
    title: 'Welcome to\nRed Prayer Book',
    body: 'A living compendium of ancient Orthodox Christian prayer, carried with you always.',
    icon: '✟',
  },
  {
    title: 'Pray With\nThe Holy Fathers',
    body: 'Morning and evening prayers, liturgical calendar, saints\' lives, and the full Orthodox prayer book.',
    icon: '☦',
  },
  {
    title: 'Begin Your\nDaily Prayer',
    body: 'Open the sacred page each day and let your heart rise in prayer to the living God.',
    icon: '🕯',
  },
];

export default function Onboarding() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const stepNum = Math.max(0, Math.min(2, Number(step) || 0));
  const current = STEPS[stepNum];
  const isLast = stepNum === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      router.replace('/(tabs)');
    } else {
      router.push(`/onboarding/${stepNum + 1}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            borderWidth: 2,
            borderColor: colors.sacredGold,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.byzantineCrimson,
            marginBottom: spacing.xl,
          }}
        >
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 100, height: 100, borderRadius: 50 }}
            resizeMode="cover"
          />
        </View>

        <Text
          style={{
            fontFamily: 'serif',
            fontWeight: '700',
            fontSize: 32,
            color: colors.sacredGold,
            textAlign: 'center',
            marginBottom: spacing.m,
            lineHeight: 40,
          }}
        >
          {current.title}
        </Text>

        <Text
          style={{
            fontFamily: 'serif',
            fontStyle: 'italic',
            fontSize: 16,
            color: colors.ivoryVellum,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: spacing.xxl,
          }}
        >
          {current.body}
        </Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.xl }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === stepNum ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === stepNum ? colors.sacredGold : colors.textMuted,
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={handleNext}
          style={({ pressed }) => ({
            backgroundColor: pressed ? colors.surface : colors.byzantineCrimson,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.xxl,
            borderRadius: radii.pill,
            borderWidth: 1,
            borderColor: colors.sacredGold,
          })}
        >
          <Text
            style={{
              color: colors.sacredGold,
              fontFamily: 'serif',
              fontWeight: '700',
              fontSize: 16,
              letterSpacing: 1,
            }}
          >
            {isLast ? 'Begin Your Daily Prayer' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
