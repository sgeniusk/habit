// 오늘 탭. streak 일수와 대표 페르소나 활동을 도메인 로직에서 derive 한다.
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";

import { findPersonaByCategory } from "../data/personaCatalog";
import { initialRecords } from "../data/sampleRecords";
import { localize } from "../lib/i18n";
import { countConsecutiveSnapDays } from "../lib/streakEngine";

const records = initialRecords;
const latestRecord = records[0];
const featuredPersona = findPersonaByCategory(latestRecord?.category ?? "study");
const featuredName = localize(featuredPersona.name, "ko");
const featuredActivity = localize(featuredPersona.activity, "ko");
const featuredPlace = localize(featuredPersona.place, "ko");
const streakDays = countConsecutiveSnapDays(records);

export function TodayScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topStrip}>
        <View>
          <Text style={styles.eyebrow}>Today</Text>
          <Text style={styles.title}>오늘의 기록</Text>
        </View>
        <View style={styles.streakBadge}>
          <Check size={16} color="#1c2733" />
          <Text style={styles.streakBadgeText}>{streakDays}일</Text>
        </View>
      </View>

      <View style={styles.heroCta}>
        <Text style={styles.heroCtaTitle}>오늘의 한 컷 남기기</Text>
        <Text style={styles.heroCtaHint}>지금 한 컷 남기면 페르소나가 바로 자라요.</Text>
      </View>

      <View style={styles.heroBand}>
        <Text style={styles.statusPill}>대표 페르소나 · {featuredPlace.split("·")[0].trim()}</Text>
        <Text style={styles.heroName}>{featuredName}</Text>
        <Text style={styles.heroActivity}>{featuredActivity}.</Text>
      </View>

      <View style={styles.timeline}>
        <Text style={styles.sectionTitle}>오늘 남긴 기록</Text>
        {records.slice(0, 4).map((record) => (
          <View key={record.id} style={styles.recordRow}>
            <Text style={styles.recordCategory}>{categoryLabel(record.category)}</Text>
            <Text style={styles.recordMemo} numberOfLines={1}>
              {record.memo ?? "스냅 기록"}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function categoryLabel(category: string) {
  const map: Record<string, string> = {
    study: "공부",
    meal: "식단",
    exercise: "운동",
    reading: "독서",
    cleaning: "정리",
    selfcare: "셀프케어",
    hobby: "취미"
  };
  return map[category] ?? category;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f4f7e8" },
  content: { padding: 18, gap: 14 },
  topStrip: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  eyebrow: { color: "#2f9d65", fontWeight: "800", fontSize: 12, textTransform: "uppercase" },
  title: { color: "#1c2733", fontWeight: "900", fontSize: 26, lineHeight: 30 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e2d1"
  },
  streakBadgeText: { color: "#1c2733", fontWeight: "900", fontSize: 13 },
  heroCta: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#1c2733"
  },
  heroCtaTitle: { color: "#ffffff", fontWeight: "900", fontSize: 16 },
  heroCtaHint: {
    color: "rgba(255, 255, 255, 0.78)",
    fontWeight: "700",
    fontSize: 12,
    marginTop: 4
  },
  heroBand: {
    padding: 18,
    minHeight: 160,
    borderRadius: 14,
    backgroundColor: "#ccefd6",
    borderWidth: 1,
    borderColor: "#b7dbbf",
    gap: 6
  },
  statusPill: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e2d1",
    color: "#1c2733",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden"
  },
  heroName: { color: "#1c2733", fontWeight: "900", fontSize: 22, marginTop: 8 },
  heroActivity: { color: "#1c2733", fontWeight: "700", fontSize: 14 },
  timeline: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d8e2d1",
    gap: 10
  },
  sectionTitle: { color: "#1c2733", fontWeight: "900", fontSize: 16 },
  recordRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  recordCategory: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#e6f6e8",
    color: "#2f9d65",
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  },
  recordMemo: { flex: 1, color: "#1c2733", fontWeight: "700", fontSize: 13 }
});
