import { Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { hitTarget, radii, spacing } from '@/theme/spacing';
import { PressableScale } from '@/components/ui/PressableScale';

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function QuickTile({
  icon,
  label,
  onPress,
  size,
}: {
  icon: MCI;
  label: string;
  onPress?: () => void;
  size: number;
}) {
  const a11yLabel = label.replace(/\n/g, ' ');

  return (
    <PressableScale
      onPress={onPress}
      haptic
      accessibilityLabel={a11yLabel}
      style={{
        width: size,
        height: Math.max(size, hitTarget),
        backgroundColor: colors.byzantineCrimson,
        borderColor: colors.sacredGold,
        borderWidth: 1,
        borderRadius: radii.m,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xxs,
        gap: spacing.xxs,
      }}
    >
      <MaterialCommunityIcons name={icon} size={26} color={colors.sacredGold} />
      <Text
        style={{
          color: colors.textOnAccent,
          fontFamily: fonts.bodyBold,
          fontSize: 10,
          letterSpacing: 0.6,
          textAlign: 'center',
          textTransform: 'uppercase',
          lineHeight: 13,
        }}
      >
        {label}
      </Text>
    </PressableScale>
  );
}
