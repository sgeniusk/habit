// 리포트 탭. 7일 요약 (AI 인사이트) 와 오래된 기억 두 모드.
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { usePreferences } from "../lib/PreferencesContext";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { buildMemoryCurations, type MemoryCuration } from "../lib/memoryEngine";
import {
  buildPersonaSummaries,
  findHiddenHabitInsights,
  type HabitInsight,
  type HabitInsightConfidence
} from "../lib/personaEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

type ReportMode = "weekly" | "memory";

export function ReportScreen() {
  const { records } = useSnapRecords();
  const { preferences, setInsightSoften } = usePreferences();
  const softenAll = preferences.insightSoften;
  const [reportMode, setReportMode] = useState<ReportMode>("weekly");

  const summaries = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
  const memories = useMemo(() => buildMemoryCurations(records, "ko"), [records]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.eyebrow}>Weekly Loop</Text>
        <Text style={styles.title}>7일 생활 리포트</Text>
      </View>

      <View style={styles.modeSwitch}>
        <Pressable
          style={[styles.modeButton, reportMode === "weekly" && styles.modeButtonActive]}
          onPress={() => setReportMode("weekly")}
        >
          <Text
            style={[styles.modeButtonText, reportMode === "weekly" && styles.modeButtonTextActive]}
          >
            7일 요약
          </Text>
        </Pressable>
        <Pressable
          style={[styles.modeButton, reportMode === "memory" && styles.modeButtonActive]}
          onPress={() => setReportMode("memory")}
        >
          <Text
            style={[styles.modeButtonText, reportMode === "memory" && styles.modeButtonTextActive]}
          >
            오래된 기억
          </Text>
        </Pressable>
      </View>

      {reportMode === "weekly" ? (
        <>
          <View style={styles.personaBand}>
            <FormiAvatar
              category={summaries[0]?.archetype ?? "study"}
              level={summaries[0]?.level ?? 1}
              size={96}
            />
            <Text style={styles.personaBandText}>
              대표 페르소나가 Lv.{summaries[0]?.level ?? 1} 까지 자랐어요.
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <SummaryTile label="주간 스냅" value={`${records.length}`} tone="leaf" />
            <SummaryTile label="대표 성장" value={`Lv.${summaries[0]?.level ?? 1}`} tone="coral" />
            <SummaryTile label="숨은 패턴" value={`${insights.length}`} tone="blue" />
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

          {insights.map((insight) => (
            <InsightCard key={insight.title} insight={insight} softened={softenAll} />
          ))}
        </>
      ) : (
        <>
          <Text style={styles.memoryIntro}>
            오래된 스냅을 다시 꺼내, 지금의 페르소나가 어디서 시작됐는지 묻습니다.
          </Text>
          {memories.length === 0 ? (
            <View style={styles.insightCard}>
              <Text style={styles.insightBody}>
                아직 오래된 기억이 없어요. 스냅이 2주 넘게 쌓이면 회상 카드가 열립니다.
              </Text>
            </View>
          ) : (
            memories.map((memory) => <MemoryCard key={memory.id} memory={memory} />)
          )}
        </>
      )}
    </ScrollView>
  );
}

function MemoryCard({ memory }: { memory: MemoryCuration }) {
  return (
    <View style={styles.insightCard}>
      <View style={styles.insightTop}>
        <Text style={styles.insightTitle}>{memory.title}</Text>
        <Text style={[styles.confidenceBadge, { backgroundColor: colors.leafSoft, color: colors.leaf }]}>
          {memory.period}
        </Text>
      </View>
      <Text style={styles.insightBody}>{memory.summary}</Text>
      <Text style={styles.insightRec}>{memory.prompt}</Text>
      {memory.tags.length > 0 ? (
        <View style={styles.tagRow}>
          {memory.tags.map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
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
  modeSwitch: {
    flexDirection: "row",
    gap: 6,
    padding: 4,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  modeButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: radii.sm,
    alignItems: "center"
  },
  modeButtonActive: { backgroundColor: colors.leafSoft },
  modeButtonText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  modeButtonTextActive: { color: colors.leaf },
  memoryIntro: { ...typography.body, color: colors.muted },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    color: colors.muted,
    fontWeight: "600",
    fontSize: 11,
    overflow: "hidden"
  },
  personaBand: {
    alignItems: "center",
    gap: 4,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: "#b7dbbf"
  },
  personaBandText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  summaryRow: { flexDirection: "row", gap: 8 },
  summaryTile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 2
  },
  summaryValue: { color: colors.ink, fontWeight: "700", fontSize: 18 },
  summaryLabel: { color: colors.muted, fontWeight: "600", fontSize: 11 },
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
  toneToggleText: { color: colors.muted, fontWeight: "600", fontSize: 11 },
  toneToggleTextActive: { color: colors.leaf },
  toneToggleValue: { color: colors.muted, fontWeight: "700", fontSize: 11 },
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
    fontWeight: "700",
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
    fontWeight: "700",
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: radii.sm,
    backgroundColor: colors.white,
    overflow: "hidden"
  },
  evidenceText: { flex: 1, color: colors.ink, fontWeight: "700", fontSize: 12 },
  insightBody: { ...typography.body, color: colors.muted },
  insightRec: { color: colors.ink, fontWeight: "700", fontSize: 13 }
});
