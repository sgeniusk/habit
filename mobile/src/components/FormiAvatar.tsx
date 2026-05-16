// Formi 캐릭터 아바타. 4프레임(팔 동작) 스프라이트를 핑퐁으로 돌려 idle 애니메이션을 만들고,
// 그 위에 잔잔한 숨쉬기 transform 을 얹는다.
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

// 프레임 재생 순서 (핑퐁): 팔 내림 → 올림 → 만세 → 내림. 끊김 없이 반복된다.
const PINGPONG = [0, 1, 2, 3, 2, 1];
const FRAME_MS = 240;

export function FormiAvatar({
  category,
  level = 1,
  size = 120,
  breathing = true
}: FormiAvatarProps) {
  const breath = useSharedValue(0);
  const [step, setStep] = useState(0);

  const frames = category ? formiFramesFor(category, level) : formiSeedFrames;

  // 잔잔한 숨쉬기 (발을 바닥에 고정한 채 살짝 부풀고 떠오른다)
  useEffect(() => {
    if (!breathing) {
      breath.value = 0;
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [breathing, breath]);

  // 프레임 핑퐁 루프
  useEffect(() => {
    if (!breathing || !frames) {
      setStep(0);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PINGPONG.length;
      setStep(i);
    }, FRAME_MS);
    return () => clearInterval(id);
  }, [breathing, frames]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -breath.value * size * 0.03 },
      { scaleX: 1 + breath.value * 0.02 },
      { scaleY: 1 + breath.value * 0.035 }
    ]
  }));

  const frameIndex = PINGPONG[step] ?? 0;
  const source = frames
    ? frames[frameIndex] ?? frames[0]
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
