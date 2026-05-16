// Formi 캐릭터 아바타. 카테고리 + 레벨로 알맞은 PNG 를 고르고 천천히 숨쉬는 애니메이션을 준다.
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

  useEffect(() => {
    if (!breathing) {
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1.035, { duration: 1700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1700, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [breathing, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
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
