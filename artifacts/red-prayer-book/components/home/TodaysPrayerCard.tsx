import { View, Text, Image } from 'react-native';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { radii, spacing } from '@/theme/spacing';
import { PressableScale } from '@/components/ui/PressableScale';

export function TodaysPrayerCard({
  quote,
  onPress,
}: {
  quote: string;
  onPress?: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic={!!onPress}
      accessibilityLabel="Today's Prayer"
      style={{
        marginHorizontal: spacing.m,
        marginBottom: spacing.s,
        borderRadius: radii.l,
        borderWidth: 1,
        borderColor: colors.sacredGold,
        overflow: 'hidden',
        backgroundColor: colors.byzantineCrimson,
      }}
    >
      {[
        { top: 6, left: 8 },
        { top: 6, right: 8 },
        { bottom: 6, left: 8 },
        { bottom: 6, right: 8 },
      ].map((pos, i) => (
        <Text
          key={i}
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={{
            position: 'absolute',
            ...pos,
            color: colors.sacredGold,
            fontSize: 11,
            zIndex: 2,
          }}
        >
          ❦
        </Text>
      ))}

      <View style={{ flexDirection: 'row', minHeight: 160 }}>
        <View style={{ width: 130, backgroundColor: colors.surfaceDeep }}>
          <Image
            source={require('@/assets/images/saint-nicholas.png')}
            style={{ width: 130, height: '100%', minHeight: 160 }}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={{ flex: 1, padding: spacing.m, justifyContent: 'center' }}>
          <Text
            style={{
              ...type.title,
              color: colors.sacredGold,
            }}
          >
            Today's Prayer
          </Text>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 13,
              color: colors.textOnAccent,
              lineHeight: 20,
              marginTop: spacing.xs,
            }}
          >
            {quote}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: spacing.s,
            }}
            accessibilityElementsHidden
          >
            <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
            <Text style={{ color: colors.sacredGold, marginHorizontal: spacing.xs, fontSize: 14 }}>
              ✟
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.hairline }} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
