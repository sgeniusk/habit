// Formi 캐릭터 아바타. 캐릭터 시트에서 잘라낸 N프레임을 단일 이미지로 핑퐁 재생하고,
// 그 위에 살짝 들썩이고 갸우뚱하는 transform 을 얹어 귀여운 idle 을 만든다.
import { useEffect, useMemo, useState } from "react";
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

const FRAME_MS = 120; // 프레임 한 칸 넘어가는 간격

// [0,1,...,n-1,n-2,...,1] 핑퐁 순서를 만든다.
function buildPingPong(length: number): number[] {
  if (length <= 1) return [0];
  const seq: number[] = [];
  for (let i = 0; i < length; i++) seq.push(i);
  for (let i = length - 2; i > 0; i--) seq.push(i);
  return seq;
}

export function FormiAvatar({
  category,
  level = 1,
  size = 120,
  breathing = true
}: FormiAvatarProps) {
  const breath = useSharedValue(0); // 숨쉬기 (위아래 들썩)
  const wobble = useSharedValue(0); // 좌우 갸우뚱
  const [tick, setTick] = useState(0);

  const frames = category ? formiFramesFor(category, level) : formiSeedFrames;
  const sequence = useMemo(
    () => buildPingPong(frames ? frames.length : 1),
    [frames]
  );

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

  // 프레임 핑퐁 (겹침 없는 단일 이미지 교체)
  useEffect(() => {
    if (!breathing || sequence.length <= 1) {
      setTick(0);
      return;
    }
    const id = setInterval(() => setTick((t) => t + 1), FRAME_MS);
    return () => clearInterval(id);
  }, [breathing, sequence]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -breath.value * size * 0.035 },
      { rotateZ: `${wobble.value * 2}deg` },
      { scaleX: 1 + breath.value * 0.02 },
      { scaleY: 1 + breath.value * 0.035 }
    ]
  }));

  const fallback =
    category !== undefined ? formiImageFor(category, level) : formiSeedImage;
  let source = fallback;
  if (frames && frames.length > 0) {
    const idx = sequence[tick % sequence.length] ?? 0;
    source = frames[idx] ?? frames[0];
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
