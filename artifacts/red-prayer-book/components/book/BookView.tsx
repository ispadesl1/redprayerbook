import { useEffect, useMemo, useState } from 'react';
import { View, Dimensions, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CurlingPage } from './CurlingPage';
import { StaticPage } from './StaticPage';
import { PageJumpSheet } from './PageJumpSheet';
import { useBookStore } from '@/lib/store';
import { playFlipSfx, playRiffleSfx, stopRiffleSfx } from '@/lib/audio';
import { colors } from '@/theme/colors';
import { spacing, radii } from '@/theme/spacing';

type Props = {
  riffleTarget: number | null;
  onRiffleComplete: () => void;
};

export function BookView({ riffleTarget, onRiffleComplete }: Props) {
  const currentIndex = useBookStore((s) => s.currentIndex);
  const setCurrentIndex = useBookStore((s) => s.setCurrentIndex);
  const totalPages = useBookStore((s) => s.totalPages);
  const [jumpSheetVisible, setJumpSheetVisible] = useState(false);

  const { width: W, height: H } = Dimensions.get('window');
  const pageWidth = W;
  const pageHeight = H - 180;

  const curl = useSharedValue(0);

  useEffect(() => {
    if (riffleTarget == null) return;
    const target = Math.max(0, Math.min(totalPages - 1, riffleTarget));
    const direction = target > currentIndex ? 1 : -1;
    const distance = Math.abs(target - currentIndex);
    if (distance === 0) {
      onRiffleComplete();
      return;
    }
    playRiffleSfx();
    let stepIndex = currentIndex;
    const stepMs = Math.max(60, 220 - distance * 4);
    let cancelled = false;
    function nextStep() {
      if (cancelled) return;
      stepIndex += direction;
      setCurrentIndex(stepIndex);
      curl.value = withSequence(
        withTiming(direction === 1 ? 1 : 0, {
          duration: stepMs * 0.5,
          easing: Easing.in(Easing.cubic),
        }),
        withTiming(0, { duration: 0 })
      );
      if (stepIndex === target) {
        setTimeout(() => {
          stopRiffleSfx();
          runOnJS(onRiffleComplete)();
        }, stepMs);
      } else {
        setTimeout(nextStep, stepMs);
      }
    }
    nextStep();
    return () => {
      cancelled = true;
      stopRiffleSfx();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riffleTarget]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          const t = Math.max(0, Math.min(1, -e.translationX / pageWidth));
          curl.value = t;
        })
        .onEnd((e) => {
          const released = -e.translationX / pageWidth;
          const velocity = -e.velocityX / pageWidth;
          const goesForward = released > 0.5 || velocity > 1.4;
          if (goesForward && currentIndex < totalPages - 1) {
            curl.value = withTiming(
              1,
              { duration: 320, easing: Easing.out(Easing.cubic) },
              () => {
                runOnJS(setCurrentIndex)(currentIndex + 1);
                curl.value = 0;
                runOnJS(playFlipSfx)();
              }
            );
          } else {
            curl.value = withTiming(0, {
              duration: 240,
              easing: Easing.out(Easing.cubic),
            });
          }
        }),
    [pageWidth, currentIndex, totalPages]
  );

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: 0.25 + curl.value * 0.35,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceDeep }}>
      <View style={{ width: pageWidth, height: pageHeight, backgroundColor: '#111' }}>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <StaticPage index={Math.max(0, currentIndex - 1)} side="left" />
        </View>

        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <StaticPage index={currentIndex} side="right" />
        </View>

        <Animated.View
          style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, shadowStyle]}
        >
          <GestureDetector gesture={pan}>
            <CurlingPage
              progress={curl}
              frontIndex={currentIndex}
              backIndex={Math.min(totalPages - 1, currentIndex + 1)}
              width={pageWidth}
              height={pageHeight}
            />
          </GestureDetector>
        </Animated.View>
      </View>

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
          onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          style={{
            padding: spacing.xs,
            opacity: currentIndex === 0 ? 0.3 : 1,
          }}
        >
          <Text style={{ color: colors.sacredGold, fontSize: 28 }}>‹</Text>
        </Pressable>

        <Pressable
          onPress={() => setJumpSheetVisible(true)}
          style={{
            alignItems: 'center',
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.m,
            borderRadius: radii.pill,
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.hairline,
            borderWidth: 1,
          }}
        >
          <Text style={{ color: colors.sacredGold, fontFamily: 'serif', fontSize: 13 }}>
            Page {currentIndex + 1} of {totalPages}  ✎
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setCurrentIndex(Math.min(totalPages - 1, currentIndex + 1))}
          style={{
            padding: spacing.xs,
            opacity: currentIndex === totalPages - 1 ? 0.3 : 1,
          }}
        >
          <Text style={{ color: colors.sacredGold, fontSize: 28 }}>›</Text>
        </Pressable>
      </View>

      <PageJumpSheet
        totalPages={totalPages}
        currentIndex={currentIndex}
        onJump={(i) => setCurrentIndex(i)}
        visible={jumpSheetVisible}
        onClose={() => setJumpSheetVisible(false)}
      />
    </View>
  );
}
