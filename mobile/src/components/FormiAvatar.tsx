// Formi 캐릭터 아바타. 프레임(눈 뜸/감음)을 번갈아 깜빡이고, 블롭답게 스쿼시·스트레치 바운스를 준다.
import { useEffect, useState } from "react";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

import {
  formiFramesFor,
  formiImageFor,
  formiSeedFrames,
  formiSeedImage
} from "../lib/formiAssets";
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
  // frame: 0 눈 뜸, 1 반쯤, 2 눈 감음
  const [frame, setFrame] = useState(0);

  const frames = category ? formiFramesFor(category, level) : formiSeedFrames;

  // 바운스 (transform): 웅크림 → 점프 → 정점 → 낙하 → 착지 → 회복 → 휴식
  useEffect(() => {
    if (!breathing) {
      lift.value = 0;
      stretch.value = 0;
      return;
    }
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

  // 깜빡임 (프레임 교체): 가만히 있다 가끔 0 → 1 → 2 → 1 → 0
  useEffect(() => {
    if (!breathing || !frames) {
      setFrame(0);
      return;
    }
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(
        setTimeout(() => {
          if (!cancelled) fn();
        }, ms)
      );
    };
    const loop = () => {
      const delay = 2400 + Math.random() * 2400;
      after(delay, () => {
        setFrame(1);
        after(70, () => setFrame(2));
        after(170, () => setFrame(1));
        after(240, () => {
          setFrame(0);
          loop();
        });
      });
    };
    loop();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [breathing, frames]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -lift.value * size * 0.17 },
      { scaleX: 1 - stretch.value * 0.13 },
      { scaleY: 1 + stretch.value * 0.15 }
    ]
  }));

  const source = frames
    ? frames[frame] ?? frames[0]
    : category
      ? formiImageFor(category, level)
      : formiSeedImage;

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
