import { Pressable, View, Text, Image } from 'react-native';
import { FiligreeFrame } from '@/components/ui/FiligreeFrame';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function TodaysPrayerCard({
  quote,
  onPress,
}: {
  quote: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
      <FiligreeFrame>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 88,
              height: 110,
              borderRadius: 8,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.m,
              borderWidth: 1,
              borderColor: colors.hairline,
              overflow: 'hidden',
            }}
          >
            <Image
              source={require('@/assets/images/saint-nicholas.png')}
              style={{ width: 88, height: 110 }}
              resizeMode="cover"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '700',
                color: colors.sacredGold,
                marginBottom: 6,
                fontFamily: 'serif',
              }}
            >
              Today's Prayer
            </Text>
            <Text
              style={{
                fontFamily: 'serif',
                fontStyle: 'italic',
                fontSize: 13,
                color: colors.ivoryVellum,
                lineHeight: 19,
              }}
            >
              {quote}
            </Text>
            <Text
              style={{
                color: colors.sacredGold,
                marginTop: spacing.s,
                textAlign: 'center',
                letterSpacing: 2,
              }}
            >
              — ✟ —
            </Text>
          </View>
        </View>
      </FiligreeFrame>
    </Pressable>
  );
}
