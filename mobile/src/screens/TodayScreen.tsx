// 오늘 탭. 컨텍스트의 records 를 기반으로 streak 와 대표 페르소나를 derive.
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { findPersonaByCategory } from "../data/personaCatalog";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { localize } from "../lib/i18n";
import { countConsecutiveSnapDays } from "../lib/streakEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

const categoryLabelsKo: Record<string, string> = {
  study: "공부",
  meal: "식단",
  exercise: "운동",
  reading: "독서",
  cleaning: "정리",
  selfcare: "셀프케어",
  hobby: "취미"
};

export function TodayScreen() {
  const { records } = useSnapRecords();
  const featuredPersona = useMemo(
    () => findPersonaByCategory(records[0]?.category ?? "study"),
    [records]
  );
  const streakDays = useMemo(() => countConsecutiveSnapDays(records), [records]);
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

      <View style={styles.heroCta}>
        <Text style={styles.heroCtaTitle}>오늘의 한 컷 남기기</Text>
        <Text style={styles.heroCtaHint}>지금 한 컷 남기면 페르소나가 바로 자라요.</Text>
      </View>

      <View style={styles.heroBand}>
        <Text style={styles.statusPill}>
          대표 페르소나 · {featuredPlace.split("·")[0].trim()}
        </Text>
        <Text style={styles.heroName}>{featuredName}</Text>
        <Text style={styles.heroActivity}>{featuredActivity}.</Text>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>오늘 남긴 기록</Text>
        {records.length === 0 ? (
          <Text style={styles.timelineEmpty}>아직 기록이 없어요. 스냅 탭에서 첫 한 컷을 남겨봐요.</Text>
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
  heroCta: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.ink,
    ...shadows.card
  },
  heroCtaTitle: { color: colors.white, fontWeight: "900", fontSize: 16 },
  heroCtaHint: {
    color: "rgba(255, 255, 255, 0.78)",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4
  },
  heroBand: {
    padding: spacing.lg,
    minHeight: 160,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: "#b7dbbf",
    gap: 6
  },
  statusPill: {
    alignSelf: "flex-start",
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
  heroName: { color: colors.ink, fontWeight: "900", fontSize: 22, marginTop: 8 },
  heroActivity: { color: colors.ink, fontWeight: "700", fontSize: 14 },
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
