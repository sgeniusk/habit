// 리포트 탭. AI 인사이트 카드 (근거 라인 상단 + 기본 톤 순한 표현 + 토글).
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { usePreferences } from "../lib/PreferencesContext";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import {
  buildPersonaSummaries,
  findHiddenHabitInsights,
  type HabitInsight,
  type HabitInsightConfidence
} from "../lib/personaEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

export function ReportScreen() {
  const { records } = useSnapRecords();
  const { preferences, setInsightSoften } = usePreferences();
  const softenAll = preferences.insightSoften;

  const summaries = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
  const visible = insights;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.eyebrow}>Weekly Loop</Text>
        <Text style={styles.title}>7일 생활 리포트</Text>
      </View>

      <View style={styles.summaryRow}>
        <SummaryTile label="주간 스냅" value={`${records.length}`} tone="leaf" />
        <SummaryTile label="대표 성장" value={`Lv.${summaries[0]?.level ?? 1}`} tone="coral" />
        <SummaryTile label="숨은 패턴" value={`${visible.length}`} tone="blue" />
      </View>

      <View style={styles.insightHeader}>
        <Text style={styles.sectionTitle}>AI가 발견한 숨은 습관</Text>
        <Pressable
          style={[styles.toneToggle, softenAll && styles.toneToggleActive]}
          onPress={() => setInsightSoften(!softenAll)}
        >
          <Text style={[styles.toneToggleText, softenAll && styles.toneToggleTextActive]}>
            AI 톤
          </Text>
          <Text style={[styles.toneToggleValue, softenAll && styles.toneToggleValueActive]}>
            {softenAll ? "순한 표현" : "원문"}
          </Text>
        </Pressable>
      </View>

      {visible.map((insight) => (
        <InsightCard key={insight.title} insight={insight} softened={softenAll} />
      ))}
    </ScrollView>
  );
}

function InsightCard({ insight, softened }: { insight: HabitInsight; softened: boolean }) {
  const body = softened ? softenBody(insight.body) : insight.body;

  return (
    <View style={styles.insightCard}>
      <View style={styles.insightTop}>
        <Text style={styles.insightTitle}>{insight.title}</Text>
        <Text style={[styles.confidenceBadge, confidenceStyle(insight.confidence)]}>
          {confidenceLabel(insight.confidence)}
        </Text>
      </View>
      <View style={styles.evidenceRow}>
        <Text style={styles.evidenceLabel}>근거</Text>
        <Text style={styles.evidenceText}>{insight.evidence}</Text>
      </View>
      <Text style={styles.insightBody}>{body}</Text>
      <Text style={styles.insightRec}>{insight.recommendation}</Text>
    </View>
  );
}

function SummaryTile({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: "leaf" | "coral" | "blue";
}) {
  return (
    <View style={[styles.summaryTile, tileToneStyle(tone)]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function tileToneStyle(tone: "leaf" | "coral" | "blue") {
  if (tone === "coral") return { backgroundColor: colors.coralSoft, borderColor: "#ffd7d1" };
  if (tone === "blue") return { backgroundColor: "#eef2ff", borderColor: "#cbd5fb" };
  return { backgroundColor: colors.leafSoft, borderColor: "#cce8d0" };
}

function confidenceLabel(value: HabitInsightConfidence) {
  if (value === "high") return "높음";
  if (value === "low") return "낮음";
  return "보통";
}

function confidenceStyle(value: HabitInsightConfidence) {
  if (value === "high") return { backgroundColor: colors.leafSoft, color: colors.leaf };
  if (value === "low") return { backgroundColor: "#eef2ff", color: colors.blue };
  return { backgroundColor: colors.coralSoft, color: colors.coral };
}

function softenBody(body: string) {
  return `가능성으로 보면, ${body
    .replace("타입일 가능성이 큽니다.", "타입일 수도 있어요.")
    .replace("같이 있어야 오래 갑니다.", "같이 있으면 더 오래 갈 수 있어요.")}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  eyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  title: { ...typography.title, color: colors.ink },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryTile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 2
  },
  summaryValue: { color: colors.ink, fontWeight: "900", fontSize: 18 },
  summaryLabel: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  insightHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm
  },
  sectionTitle: { ...typography.h3, color: colors.ink },
  toneToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  toneToggleActive: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  toneToggleText: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  toneToggleTextActive: { color: colors.leaf },
  toneToggleValue: { color: colors.muted, fontWeight: "900", fontSize: 11 },
  toneToggleValueActive: { color: colors.leaf },
  insightCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
    ...shadows.card
  },
  insightTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  insightTitle: { ...typography.h3, color: colors.ink, flex: 1 },
  confidenceBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.sm,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden"
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background
  },
  evidenceLabel: {
    color: colors.muted,
    fontWeight: "900",
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  evidenceText: { flex: 1, color: colors.ink, fontWeight: "700", fontSize: 12 },
  insightBody: { ...typography.body, color: colors.muted },
  insightRec: { color: colors.ink, fontWeight: "900", fontSize: 13 }
});
