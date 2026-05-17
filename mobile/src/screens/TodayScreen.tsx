// 오늘 탭. streak + 대표 페르소나 + 위치 날씨/미세먼지/자외선 + 페르소나 챙김 알림.
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Check, X } from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { WeatherScene } from "../components/WeatherScene";
import { findPersonaByCategory } from "../data/personaCatalog";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { buildAdvisories } from "../lib/advisory";
import { localize } from "../lib/i18n";
import { buildPersonaSummaries } from "../lib/personaEngine";
import { filterOverlay } from "../lib/snapFilters";
import { countConsecutiveSnapDays } from "../lib/streakEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";
import { demoWeather, fetchWeatherSnapshot, type WeatherSnapshot } from "../lib/weather";
import type { ProofStampId, SnapRecord } from "../types/habit";

const categoryLabelsKo: Record<string, string> = {
  study: "공부",
  meal: "식단",
  exercise: "운동",
  reading: "독서",
  cleaning: "정리",
  selfcare: "셀프케어",
  hobby: "취미"
};

const placeLabelsKo: Record<string, string> = {
  home: "집",
  library: "도서관",
  school: "학교",
  cafe: "카페",
  gym: "헬스장",
  restaurant: "식당",
  outdoors: "야외",
  other: "기타"
};

const proofStampLabelsKo: Record<ProofStampId, string> = {
  time: "시간",
  count: "횟수",
  persona: "페르소나"
};

function formatRecordDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "기록 시각 미상";
  }
  let hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, "0");
  const ampm = hour < 12 ? "오전" : "오후";
  hour = hour % 12 || 12;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${ampm} ${hour}:${minute}`;
}

export function TodayScreen() {
  const { records } = useSnapRecords();
  const navigation = useNavigation();
  const [weather, setWeather] = useState<WeatherSnapshot>(demoWeather);
  const [selectedRecord, setSelectedRecord] = useState<SnapRecord | null>(null);

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

      <WeatherScene weather={weather} />
      <View style={styles.metricsCard}>
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
            <Pressable
              key={record.id}
              style={({ pressed }) => [styles.recordRow, pressed && styles.recordRowPressed]}
              onPress={() => setSelectedRecord(record)}
            >
              {record.imageUrl ? (
                <View style={styles.recordThumb}>
                  <Image
                    source={{ uri: record.imageUrl }}
                    style={styles.recordThumbImage}
                  />
                  {filterOverlay(record.filter) ? (
                    <View style={[StyleSheet.absoluteFill, filterOverlay(record.filter)!]} />
                  ) : null}
                </View>
              ) : (
                <View style={[styles.recordThumb, styles.recordThumbEmpty]}>
                  <Text style={styles.recordThumbEmoji}>
                    {record.sticker?.split(" ")[0] ?? "🌱"}
                  </Text>
                </View>
              )}
              <View style={styles.recordBody}>
                <Text style={styles.recordCategory}>
                  {categoryLabelsKo[record.category] ?? record.category}
                </Text>
                <Text style={styles.recordMemo} numberOfLines={1}>
                  {record.memo ?? "스냅 기록"}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </ScrollView>
  );
}

function RecordDetailModal({
  record,
  onClose
}: {
  record: SnapRecord | null;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={record !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={() => {}}>
          {record ? (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {categoryLabelsKo[record.category] ?? record.category} 스냅
                </Text>
                <Pressable style={styles.modalClose} onPress={onClose} hitSlop={8}>
                  <X size={18} color={colors.muted} />
                </Pressable>
              </View>
              {record.imageUrl ? (
                <View style={styles.modalImage}>
                  <Image
                    source={{ uri: record.imageUrl }}
                    style={styles.modalImageInner}
                    resizeMode="cover"
                  />
                  {filterOverlay(record.filter) ? (
                    <View style={[StyleSheet.absoluteFill, filterOverlay(record.filter)!]} />
                  ) : null}
                  {record.sticker ? (
                    <View style={styles.modalSticker}>
                      <Text style={styles.modalStickerText}>{record.sticker}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={[styles.modalImage, styles.modalImageEmpty]}>
                  <Text style={styles.modalImageEmptyText}>사진 없이 남긴 기록</Text>
                </View>
              )}
              <Text style={styles.modalDate}>{formatRecordDate(record.createdAt)}</Text>
              {record.memo ? (
                <Text style={styles.modalMemo}>{record.memo}</Text>
              ) : null}
              <View style={styles.modalMetaRow}>
                <ModalMeta label="장소" value={placeLabelsKo[record.placeType] ?? record.placeType} />
                <ModalMeta label="필터" value={record.filter ?? "기본"} />
                <ModalMeta label="스티커" value={record.sticker ?? "없음"} />
              </View>
              {(record.proofStamps ?? []).length > 0 ? (
                <View style={styles.modalStampRow}>
                  <Text style={styles.modalStampLabel}>인증 도장</Text>
                  {(record.proofStamps ?? []).map((stamp) => (
                    <Text key={stamp} style={styles.modalStamp}>
                      {proofStampLabelsKo[stamp] ?? stamp}
                    </Text>
                  ))}
                </View>
              ) : null}
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ModalMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.modalMeta}>
      <Text style={styles.modalMetaLabel}>{label}</Text>
      <Text style={styles.modalMetaValue}>{value}</Text>
    </View>
  );
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
  metricsCard: {
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
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
  recordThumb: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  recordThumbImage: { width: "100%", height: "100%" },
  recordThumbEmpty: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line
  },
  recordThumbEmoji: { fontSize: 20 },
  recordBody: { flex: 1, gap: 3 },
  recordCategory: {
    alignSelf: "flex-start",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.leafSoft,
    color: colors.leaf,
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  },
  recordMemo: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  recordRowPressed: { opacity: 0.6 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(20, 26, 22, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    gap: spacing.sm
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  modalTitle: { ...typography.h3, color: colors.ink },
  modalClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  modalImageInner: { width: "100%", height: "100%" },
  modalImageEmpty: { alignItems: "center", justifyContent: "center" },
  modalImageEmptyText: { color: colors.muted, fontWeight: "700", fontSize: 13 },
  modalSticker: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    borderWidth: 1,
    borderColor: colors.ink
  },
  modalStickerText: { color: colors.ink, fontWeight: "900", fontSize: 12 },
  modalDate: { color: colors.muted, fontWeight: "800", fontSize: 12 },
  modalMemo: { color: colors.ink, fontWeight: "700", fontSize: 14, lineHeight: 20 },
  modalMetaRow: { flexDirection: "row", gap: 8 },
  modalMeta: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    gap: 3
  },
  modalMetaLabel: { color: colors.muted, fontWeight: "800", fontSize: 10 },
  modalMetaValue: { color: colors.ink, fontWeight: "900", fontSize: 12 },
  modalStampRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6
  },
  modalStampLabel: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  modalStamp: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.leafSoft,
    color: colors.leaf,
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  }
});
