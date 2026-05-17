// 날씨를 애니메이션 자연 풍경으로 표현한다.
// 비/눈은 실제로 떨어지고, 맑으면 해가 빛나고, 흐리면 구름이 흐른다.
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop } from "react-native-svg";
import { MapPin } from "lucide-react-native";

import type { WeatherSnapshot } from "../lib/weather";

const HEIGHT = 172;
type Condition = WeatherSnapshot["condition"];

const conditionLabels: Record<Condition, string> = {
  clear: "맑음",
  cloudy: "흐림",
  rain: "비",
  snow: "눈",
  unknown: "날씨"
};

// 조건별 하늘 그라데이션 [위, 아래]
const skies: Record<Condition, [string, string]> = {
  clear: ["#6fc1ec", "#e7f3df"],
  cloudy: ["#93a7b5", "#d8e0dd"],
  rain: ["#566b7d", "#94a7a9"],
  snow: ["#a8bacb", "#eef3f4"],
  unknown: ["#93a7b5", "#d8e0dd"]
};

// 어두운 하늘에서는 흰 글씨
const darkSky: Record<Condition, boolean> = {
  clear: false,
  cloudy: false,
  rain: true,
  snow: false,
  unknown: false
};

// left 는 px (카드 폭은 대략 320~390, 0~340 범위면 충분히 덮인다)
const RAIN = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 39 + 8) % 344,
  delay: (i * 120) % 1100,
  duration: 720 + ((i * 97) % 430)
}));

const SNOW = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 47 + 6) % 344,
  delay: (i * 330) % 4200,
  duration: 3600 + ((i * 270) % 2000),
  size: 5 + (i % 3) * 2
}));

const CLOUDS = [
  { top: 20, scale: 1, delay: 0, duration: 23000 },
  { top: 52, scale: 0.66, delay: 9000, duration: 28000 },
  { top: 12, scale: 0.5, delay: 16000, duration: 33000 }
];

function RainDrop({
  left,
  delay,
  duration
}: {
  left: number;
  delay: number;
  duration: number;
}) {
  const y = useSharedValue(-24);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(HEIGHT + 24, { duration, easing: Easing.linear }), -1)
    );
  }, [delay, duration, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <Animated.View style={[styles.raindrop, { left }, style]} />;
}

function SnowFlake({
  left,
  delay,
  duration,
  size
}: {
  left: number;
  delay: number;
  duration: number;
  size: number;
}) {
  const y = useSharedValue(-12);
  const x = useSharedValue(0);
  useEffect(() => {
    y.value = withDelay(
      delay,
      withRepeat(withTiming(HEIGHT + 12, { duration, easing: Easing.linear }), -1)
    );
    x.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(7, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(-7, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1
      )
    );
  }, [delay, duration, x, y]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { translateX: x.value }]
  }));
  return (
    <Animated.View
      style={[
        styles.snowflake,
        { left, width: size, height: size, borderRadius: size / 2 },
        style
      ]}
    />
  );
}

function DriftCloud({
  top,
  scale,
  delay,
  duration
}: {
  top: number;
  scale: number;
  delay: number;
  duration: number;
}) {
  const x = useSharedValue(-110);
  useEffect(() => {
    x.value = withDelay(
      delay,
      withRepeat(withTiming(460, { duration, easing: Easing.linear }), -1)
    );
  }, [delay, duration, x]);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { scale }]
  }));
  return (
    <Animated.View style={[styles.cloud, { top }, style]}>
      <View style={[styles.cloudPuff, styles.cloudPuffLeft]} />
      <View style={[styles.cloudPuff, styles.cloudPuffMid]} />
      <View style={[styles.cloudPuff, styles.cloudPuffRight]} />
      <View style={styles.cloudBase} />
    </Animated.View>
  );
}

function SunGlow() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.ease) })
      ),
      -1
    );
  }, [pulse]);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + pulse.value * 0.4,
    transform: [{ scale: 1 + pulse.value * 0.28 }]
  }));
  return (
    <View style={styles.sunWrap}>
      <Animated.View style={[styles.sunGlow, glowStyle]} />
      <View style={styles.sunCore} />
    </View>
  );
}

export function WeatherScene({ weather }: { weather: WeatherSnapshot }) {
  const condition = weather.condition;
  const [skyTop, skyBottom] = skies[condition] ?? skies.unknown;
  const onDark = darkSky[condition] ?? false;
  const ink = onDark ? "#ffffff" : "#1f2a23";
  const sub = onDark ? "rgba(255,255,255,0.82)" : "#5d6b60";

  return (
    <View style={styles.scene}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={skyTop} />
            <Stop offset="1" stopColor={skyBottom} />
          </SvgGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#sky)" />
      </Svg>

      {condition === "clear" ? <SunGlow /> : null}
      {(condition === "clear" || condition === "cloudy" || condition === "rain"
        ? CLOUDS.slice(0, condition === "clear" ? 1 : 3)
        : []
      ).map((cloud, index) => (
        <DriftCloud key={index} {...cloud} />
      ))}
      {condition === "rain"
        ? RAIN.map((drop, index) => <RainDrop key={index} {...drop} />)
        : null}
      {condition === "snow"
        ? SNOW.map((flake, index) => <SnowFlake key={index} {...flake} />)
        : null}

      <View style={styles.overlay}>
        <Text style={[styles.temp, { color: ink }]}>{weather.temperatureC}°</Text>
        <Text style={[styles.condition, { color: ink }]}>
          {conditionLabels[condition] ?? "날씨"}
        </Text>
        <View style={styles.placeRow}>
          <MapPin size={12} color={sub} />
          <Text style={[styles.place, { color: sub }]}>{weather.placeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    height: HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#93a7b5"
  },
  raindrop: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 14,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.7)"
  },
  snowflake: {
    position: "absolute",
    top: 0,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  cloud: { position: "absolute", left: 0, width: 96, height: 48 },
  cloudPuff: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 999
  },
  cloudPuffLeft: { width: 38, height: 38, left: 4, top: 12 },
  cloudPuffMid: { width: 50, height: 50, left: 26, top: 2 },
  cloudPuffRight: { width: 36, height: 36, left: 56, top: 14 },
  cloudBase: {
    position: "absolute",
    left: 6,
    top: 30,
    width: 84,
    height: 20,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.92)"
  },
  sunWrap: { position: "absolute", top: 18, right: 22, alignItems: "center", justifyContent: "center" },
  sunGlow: {
    position: "absolute",
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "rgba(255, 214, 102, 0.55)"
  },
  sunCore: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffd66a"
  },
  overlay: { position: "absolute", left: 18, bottom: 16, gap: 2 },
  temp: { fontWeight: "700", fontSize: 38, lineHeight: 42 },
  condition: { fontWeight: "700", fontSize: 15 },
  placeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  place: { fontWeight: "600", fontSize: 12 }
});
