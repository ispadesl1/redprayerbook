import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { CurlingPage } from "./CurlingPage";
import { StaticPage } from "./StaticPage";
import { PageJumpSheet } from "./PageJumpSheet";
import { useBookStore } from "@/lib/store";
import { playFlipSfx } from "@/lib/audio";
import { usePalette } from "@/hooks/usePalette";
import { fonts } from "@/theme/typography";
import { spacing } from "@/theme/spacing";

const EASE = Easing.bezier(0.23, 1, 0.32, 1);

export function BookView() {
  const currentIndex = useBookStore((s) => s.currentIndex);
  const setCurrentIndex = useBookStore((s) => s.setCurrentIndex);
  const totalPages = useBookStore((s) => s.totalPages);
  const [jumpSheetVisible, setJumpSheetVisible] = useState(false);
  const [underIndex, setUnderIndex] = useState(Math.min(totalPages - 1, currentIndex + 1));
  const C = usePalette();
  const prefersReduced = useReducedMotion();
  const reduced = useSharedValue(!!prefersReduced);
  useEffect(() => {
    reduced.value = !!prefersReduced;
  }, [prefersReduced, reduced]);

  const { width: W, height: H } = useWindowDimensions();
  const pageWidth = Math.min(W, 720);
  const pageHeight = Math.max(320, H - 220);
  const curl = useSharedValue(0);
  const dir = useSharedValue(1);

  useEffect(() => {
    setUnderIndex(Math.min(totalPages - 1, currentIndex + 1));
  }, [currentIndex, totalPages]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          const forward = e.translationX <= 0;
          const nextDir = forward ? 1 : -1;
          if (dir.value !== nextDir) {
            dir.value = nextDir;
            const under = currentIndex + nextDir;
            if (under >= 0 && under < totalPages) runOnJS(setUnderIndex)(under);
          }
          curl.value = Math.max(0, Math.min(1, Math.abs(e.translationX) / pageWidth));
        })
        .onEnd((e) => {
          const forward = dir.value === 1;
          const distance = Math.abs(e.translationX) / pageWidth;
          const velocity = Math.abs(e.velocityX) / pageWidth;
          const go = distance > 0.35 || velocity > 1.2;
          const canGo = forward ? currentIndex < totalPages - 1 : currentIndex > 0;
          if (reduced.value) {
            if (go && canGo) runOnJS(setCurrentIndex)(currentIndex + (forward ? 1 : -1));
            curl.value = 0;
            return;
          }
          if (go && canGo) {
            curl.value = withTiming(1, { duration: 240, easing: EASE }, () => {
              runOnJS(setCurrentIndex)(currentIndex + (forward ? 1 : -1));
              curl.value = 0;
              runOnJS(playFlipSfx)();
            });
          } else {
            curl.value = withTiming(0, { duration: 200, easing: EASE });
          }
        }),
    [pageWidth, currentIndex, totalPages, reduced, dir, curl],
  );

  const pageStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  return (
    <View style={{ flex: 1, backgroundColor: C.paper, alignItems: "center" }}>
      <View style={{ width: pageWidth, height: pageHeight, backgroundColor: C.paper }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
          <StaticPage index={Math.max(0, underIndex)} side="left" />
        </View>
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, pageStyle]}>
            <CurlingPage
              progress={curl}
              frontIndex={currentIndex}
              backIndex={Math.max(0, Math.min(totalPages - 1, underIndex))}
              width={pageWidth}
              height={pageHeight}
            />
          </Animated.View>
        </GestureDetector>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          backgroundColor: C.paper,
          borderTopColor: C.rule,
          borderTopWidth: 1,
          width: "100%",
          maxWidth: 720,
        }}
      >
        <Pressable
          accessibilityLabel="Previous page"
          onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: currentIndex === 0 ? 0.3 : 1 }}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 28, lineHeight: 32 }}>‹</Text>
        </Pressable>

        <Pressable
          accessibilityLabel={`Page ${currentIndex + 1} of ${totalPages}`}
          onPress={() => setJumpSheetVisible(true)}
          style={{ minHeight: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.m, borderColor: C.rule, borderWidth: 1 }}
        >
          <Text style={{ color: C.ink, fontFamily: fonts.regular, fontSize: 16 }}>
            Page {currentIndex + 1} of {totalPages}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel="Next page"
          onPress={() => setCurrentIndex(Math.min(totalPages - 1, currentIndex + 1))}
          style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", opacity: currentIndex === totalPages - 1 ? 0.3 : 1 }}
        >
          <Text style={{ color: C.rubric, fontFamily: fonts.regular, fontSize: 28, lineHeight: 32 }}>›</Text>
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
