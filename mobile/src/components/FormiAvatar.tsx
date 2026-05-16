// Formi 캐릭터 아바타. 단일 이미지로 두 프레임(팔 내림 ⟷ 올림)을 깔끔하게 번갈아 보여주고,
// 그 위에 살짝 들썩이고 갸우뚱하는 transform 을 얹어 귀여운 idle 을 만든다.
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

const SWAP_MS = 480; // 두 프레임을 번갈아 보여주는 간격

export function FormiAvatar({
  category,
  level = 1,
  size = 120,
  breathing = true
}: FormiAvatarProps) {
  const breath = useSharedValue(0); // 숨쉬기 (위아래 들썩)
  const wobble = useSharedValue(0); // 좌우 갸우뚱
  const [alt, setAlt] = useState(false); // false = 팔 내린 프레임, true = 팔 올린 프레임

  useEffect(() => {
    if (!breathing) {
      breath.value = 0;
      wobble.value = 0;
      return;
    }
    breath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    wobble.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(-1, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [breathing, breath, wobble]);

  // 두 프레임을 깔끔하게 번갈아 (겹침 없는 단일 이미지 교체)
  useEffect(() => {
    if (!breathing) {
      setAlt(false);
      return;
    }
    const id = setInterval(() => setAlt((a) => !a), SWAP_MS);
    return () => clearInterval(id);
  }, [breathing]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -breath.value * size * 0.04 },
      { rotateZ: `${wobble.value * 2.5}deg` },
      { scaleX: 1 + breath.value * 0.02 },
      { scaleY: 1 + breath.value * 0.04 }
    ]
  }));

  const frames = category ? formiFramesFor(category, level) : formiSeedFrames;
  const fallback =
    category !== undefined ? formiImageFor(category, level) : formiSeedImage;
  let source = fallback;
  if (frames && frames.length > 0) {
    source = (alt ? frames[frames.length - 1] : frames[0]) ?? frames[0];
  }

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={[
        { width: size, height: size, transformOrigin: "50% 100%" as const },
        bodyStyle
      ]}
    />
  );
}
