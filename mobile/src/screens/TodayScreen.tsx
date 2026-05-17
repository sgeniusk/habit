// 오늘 탭. streak + 대표 페르소나 + 위치 날씨/미세먼지/자외선 + 페르소나 챙김 알림.
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Check, CloudRain, MapPin, Snowflake, Sun, Wind } from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { findPersonaByCategory } from "../data/personaCatalog";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { buildAdvisories } from "../lib/advisory";
import { localize } from "../lib/i18n";
import { buildPersonaSummaries } from "../lib/personaEngine";
import { countConsecutiveSnapDays } from "../lib/streakEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";
import { demoWeather, fetchWeatherSnapshot, type WeatherSnapshot } from "../lib/weather";

const categoryLabelsKo: Record<string, string> = {
  study: "공부",
  meal: "식단",
  exercise: "운동",
  reading: "독서",
  cleaning: "정리",
  selfcare: "셀프케어",
  hobby: "취미"
};

const conditionLabelsKo: Record<WeatherSnapshot["condition"], string> = {
  clear: "맑음",
  cloudy: "흐림",
  rain: "비",
  snow: "눈",
  unknown: "날씨"
};

export function TodayScreen() {
  const { records } = useSnapRecords();
  const navigation = useNavigation();
  const [weather, setWeather] = useState<WeatherSnapshot>(demoWeather);

  useEffect(() => {
    let cancelled = false;
    fetchWeatherSnapshot().then((snapshot) => {
      if (!cancelled) {
        setWeather(snapshot);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const featuredPersona = useMemo(
    () => findPersonaByCategory(records[0]?.category ?? "study"),
    [records]
  );
  const summaries = useMemo(() => buildPersonaSummaries(records), [records]);
  const featuredLevel =
    summaries.find((summary) => summary.archetype === featuredPersona.category)?.level ?? 1;
  const streakDays = useMemo(() => countConsecutiveSnapDays(records), [records]);
  const advisories = useMemo(
    () => buildAdvisories(weather, featuredPersona.category),
    [weather, featuredPersona.category]
  );
  const featuredName = localize(featuredPersona.name, "ko");
  const featuredActivity = localize(featuredPersona.activity, "ko");
  const featuredPlace = localize(featuredPersona.place, "ko");

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topStrip}>
        <View>
          <Text style={styles.eyebrow}>Today</Text>
          <Text style={styles.title}>오늘의 기록</Text>
        </View>
        <View style={styles.streakBadge}>
          <Check size={16} color={colors.ink} />
          <Text style={styles.streakBadgeText}>{streakDays}일</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
        onPress={() => navigation.navigate("Snap" as never)}
      >
        <Text style={styles.heroCtaTitle}>오늘의 한 컷 남기기</Text>
        <Text style={styles.heroCtaHint}>지금 한 컷 남기면 페르소나가 바로 자라요.</Text>
      </Pressable>

      <View style={styles.weatherCard}>
        <View style={styles.weatherTop}>
          <WeatherIcon condition={weather.condition} />
          <View style={styles.weatherTexts}>
            <Text style={styles.weatherTemp}>
              {weather.temperatureC}도 · {conditionLabelsKo[weather.condition]}
            </Text>
            <View style={styles.weatherPlaceRow}>
              <MapPin size={12} color={colors.muted} />
              <Text style={styles.weatherPlace}>{weather.placeLabel}</Text>
            </View>
          </View>
        </View>
        <View style={styles.weatherMetrics}>
          <WeatherMetric label="습도" value={`${weather.humidity}%`} />
          <WeatherMetric label="자외선" value={`${weather.uvIndex}`} accent={weather.uvIndex >= 6} />
          <WeatherMetric label="PM2.5" value={`${weather.pm25}`} accent={weather.pm25 >= 35} />
          <WeatherMetric label="PM10" value={`${weather.pm10}`} accent={weather.pm10 >= 80} />
        </View>
      </View>

      {advisories.length > 0 ? (
        <View style={styles.advisoryList}>
          {advisories.map((advisory) => (
            <View key={advisory.id} style={[styles.advisory, advisoryToneStyle(advisory.tone)]}>
              <Text style={styles.advisoryPersona}>{featuredName}</Text>
              <Text style={styles.advisoryMessage}>{advisory.message}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.heroBand}>
        <FormiAvatar category={featuredPersona.category} level={featuredLevel} size={132} />
        <Text style={styles.statusPill}>
          대표 페르소나 · {featuredPlace.split("·")[0].trim()}
        </Text>
        <Text style={styles.heroName}>{featuredName}</Text>
        <Text style={styles.heroActivity}>{featuredActivity}.</Text>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>오늘 남긴 기록</Text>
        {records.length === 0 ? (
          <Text style={styles.timelineEmpty}>
            아직 기록이 없어요. 스냅 탭에서 첫 한 컷을 남겨봐요.
          </Text>
        ) : (
          records.slice(0, 5).map((record) => (
            <View key={record.id} style={styles.recordRow}>
              <Text style={styles.recordCategory}>
                {categoryLabelsKo[record.category] ?? record.category}
              </Text>
              <Text style={styles.recordMemo} numberOfLines={1}>
                {record.memo ?? "스냅 기록"}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function WeatherIcon({ condition }: { condition: WeatherSnapshot["condition"] }) {
  if (condition === "rain") {
    return <CloudRain size={26} color={colors.blue} />;
  }
  if (condition === "snow") {
    return <Snowflake size={26} color={colors.blue} />;
  }
  if (condition === "cloudy") {
    return <Wind size={26} color={colors.muted} />;
  }
  return <Sun size={26} color={colors.gold} />;
}

function WeatherMetric({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.metric, accent && styles.metricAccent]}>
      <Text style={[styles.metricValue, accent && styles.metricValueAccent]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function advisoryToneStyle(tone: "info" | "caution" | "warn") {
  if (tone === "warn") {
    return { backgroundColor: colors.coralSoft, borderColor: "#ffd2cc" };
  }
  if (tone === "caution") {
    return { backgroundColor: "#fff7e6", borderColor: "#ffe2ad" };
  }
  return { backgroundColor: colors.leafSoft, borderColor: "#cce8d0" };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  topStrip: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  eyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  title: { ...typography.title, color: colors.ink },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  streakBadgeText: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  heroCta: { padding: spacing.lg, borderRadius: radii.lg, backgroundColor: colors.ink, ...shadows.card },
  heroCtaPressed: { opacity: 0.88 },
  heroCtaTitle: { color: colors.white, fontWeight: "900", fontSize: 16 },
  heroCtaHint: { color: "rgba(255,255,255,0.78)", fontWeight: "700", fontSize: 12, marginTop: 4 },
  weatherCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.md
  },
  weatherTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  weatherTexts: { gap: 2 },
  weatherTemp: { color: colors.ink, fontWeight: "900", fontSize: 16 },
  weatherPlaceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  weatherPlace: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  weatherMetrics: { flexDirection: "row", gap: 6 },
  metric: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    gap: 2
  },
  metricAccent: { backgroundColor: colors.coralSoft },
  metricValue: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  metricValueAccent: { color: colors.coral },
  metricLabel: { color: colors.muted, fontWeight: "800", fontSize: 10 },
  advisoryList: { gap: spacing.sm },
  advisory: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 3
  },
  advisoryPersona: { color: colors.ink, fontWeight: "900", fontSize: 12 },
  advisoryMessage: { color: colors.ink, fontWeight: "700", fontSize: 13, lineHeight: 19 },
  heroBand: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: "#b7dbbf",
    gap: 6,
    alignItems: "center"
  },
  statusPill: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden"
  },
  heroName: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 4,
    textAlign: "center"
  },
  heroActivity: { color: colors.ink, fontWeight: "700", fontSize: 14, textAlign: "center" },
  timeline: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10
  },
  sectionTitle: { ...typography.h3, color: colors.ink },
  timelineEmpty: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  recordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  recordCategory: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.leafSoft,
    color: colors.leaf,
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  },
  recordMemo: { flex: 1, color: colors.ink, fontWeight: "700", fontSize: 13 }
});
