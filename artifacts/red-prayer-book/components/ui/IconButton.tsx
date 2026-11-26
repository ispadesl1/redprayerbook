import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { hitTarget } from '@/theme/spacing';
import { PressableScale } from './PressableScale';

type MCI = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = colors.sacredGold,
  size = 24,
  haptic = false,
}: {
  icon: MCI;
  onPress?: () => void;
  accessibilityLabel: string;
  color?: string;
  size?: number;
  haptic?: boolean;
}) {
  return (
    <PressableScale
      onPress={onPress}
      haptic={haptic}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={{
        minWidth: hitTarget,
        minHeight: hitTarget,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <MaterialCommunityIcons name={icon} size={size} color={color} />
    </PressableScale>
  );
}
