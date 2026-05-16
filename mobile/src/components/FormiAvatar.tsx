// Formi 캐릭터 아바타. 두 프레임(팔 내림 ⟷ 올림)을 크로스페이드로 오가며
// 살짝 들썩이고 갸우뚱하는 귀여운 idle 애니메이션을 준다.
import { useEffect } from "react";
import { View } from "react-native";
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

const HOLD_MS = 620; // 한 프레임에서 다른 프레임으로 건너가는 시간

export function FormiAvatar({
  category,
  level = 1,
  size = 120,
  breathing = true
}: FormiAvatarProps) {
  const breath = useSharedValue(0); // 숨쉬기 (위아래 들썩)
  const wobble = useSharedValue(0); // 좌우 갸우뚱
  const blend = useSharedValue(0); // 0 = 팔 내린 프레임, 1 = 팔 올린 프레임

  useEffect(() => {
    if (!breathing) {
      breath.value = 0;
      wobble.value = 0;
      blend.value = 0;
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
    blend.value = withRepeat(
      withSequence(
        withTiming(1, { duration: HOLD_MS, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: HOLD_MS, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [breathing, breath, wobble, blend]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -breath.value * size * 0.04 },
      { rotateZ: `${wobble.value * 2.5}deg` },
      { scaleX: 1 + breath.value * 0.02 },
      { scaleY: 1 + breath.value * 0.04 }
    ]
  }));
  const topStyle = useAnimatedStyle(() => ({ opacity: 1 - blend.value }));

  const frames = category ? formiFramesFor(category, level) : formiSeedFrames;
  const fallback =
    category !== undefined ? formiImageFor(category, level) : formiSeedImage;
  const frameDown = frames ? frames[0] ?? fallback : fallback;
  const frameUp = frames
    ? frames[frames.length - 1] ?? frames[0] ?? fallback
    : fallback;

  const imageStyle = {
    width: size,
    height: size,
    transformOrigin: "50% 100%" as const
  };

  return (
    <View style={{ width: size, height: size }}>
      <Animated.Image
        source={frameUp}
        resizeMode="contain"
        style={[imageStyle, bodyStyle]}
      />
      <Animated.Image
        source={frameDown}
        resizeMode="contain"
        style={[
          imageStyle,
          { position: "absolute", top: 0, left: 0 },
          bodyStyle,
          topStyle
        ]}
      />
    </View>
  );
}
