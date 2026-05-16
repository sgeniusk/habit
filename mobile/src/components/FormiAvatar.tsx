// Formi 캐릭터 아바타. 카테고리 + 레벨로 알맞은 PNG 를 고르고 살아있는 듯한 idle 애니메이션을 준다.
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
  const scale = useSharedValue(1);
  const offsetY = useSharedValue(0);
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (!breathing) {
      scale.value = 1;
      offsetY.value = 0;
      tilt.value = 0;
      return;
    }
    // 숨쉬기 (위아래로 살짝 부풀기)
    scale.value = withRepeat(
      withSequence(
        withTiming(1.045, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    // 둥실 떠오르기 (숨쉬기와 다른 주기라 더 자연스럽다)
    offsetY.value = withRepeat(
      withSequence(
        withTiming(-size * 0.055, { duration: 2100, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2100, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
    // 갸우뚱 (좌우로 살짝 기울기)
    tilt.value = withRepeat(
      withSequence(
        withTiming(2.6, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2.6, { duration: 2600, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [breathing, scale, offsetY, tilt, size]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: offsetY.value },
      { scale: scale.value },
      { rotateZ: `${tilt.value}deg` }
    ]
  }));

  const source = category ? formiImageFor(category, level) : formiSeedImage;

  return (
    <Animated.Image
      source={source}
      resizeMode="contain"
      style={[{ width: size, height: size }, animatedStyle]}
    />
  );
}
