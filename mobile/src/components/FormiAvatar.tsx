// Formi 캐릭터 아바타. 카테고리 + 레벨로 PNG 를 고르고, 블롭답게 스쿼시·스트레치 바운스를 준다.
import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

import { formiImageFor, formiSeedImage } from "../lib/formiAssets";
import type { HabitCategory } from "../types/habit";

type FormiAvatarProps = {
  category?: HabitCategory;
  level?: number;
  size?: number;
  breathing?: boolean;
};

export function FormiAvatar({
  category,
  level = 1,
  size = 120,
  breathing = true
}: FormiAvatarProps) {
  // lift: 0 바닥 ~ 1 정점. stretch: 음수 납작 ~ 양수 길쭉.
  const lift = useSharedValue(0);
  const stretch = useSharedValue(0);

  useEffect(() => {
    if (!breathing) {
      lift.value = 0;
      stretch.value = 0;
      return;
    }
    // 한 바퀴 2.0초: 웅크림 → 점프 → 정점 → 낙하 → 착지 → 회복 → 휴식
    lift.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 170 }),
        withTiming(1, { duration: 330, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 170 }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) }),
        withTiming(0, { duration: 90 }),
        withTiming(0, { duration: 240 }),
        withTiming(0, { duration: 700 })
      ),
      -1
    );
    stretch.value = withRepeat(
      withSequence(
        withTiming(-0.55, { duration: 170, easing: Easing.out(Easing.quad) }),
        withTiming(0.7, { duration: 330, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 170, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 300, easing: Easing.in(Easing.quad) }),
        withTiming(-0.8, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 240, easing: Easing.out(Easing.back(2.4)) }),
        withTiming(0, { duration: 700 })
      ),
      -1
    );
  }, [breathing, lift, stretch, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -lift.value * size * 0.17 },
      { scaleX: 1 - stretch.value * 0.13 },
      { scaleY: 1 + stretch.value * 0.15 }
    ]
  }));

  const source = category ? formiImageFor(category, level) : formiSeedImage;

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={[
        { width: size, height: size, transformOrigin: "50% 100%" },
        animatedStyle
      ]}
    />
  );
}
