// 집 탭. 대표 페르소나 영역 + 페르소나 컬렉션 + 말투 톤 토글.
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { findPersonaByCategory, personaCatalog } from "../data/personaCatalog";
import { initialRecords } from "../data/sampleRecords";
import { localize } from "../lib/i18n";
import { buildPersonaSummaries } from "../lib/personaEngine";
import {
  buildPersonaCompanionLine,
  buildPersonaIdentity,
  defaultPersonaNicknames
} from "../lib/personaIdentity";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";
import type { PersonaVoiceMode } from "../types/habit";

const records = initialRecords;
const summaries = buildPersonaSummaries(records);
const featuredPersona = findPersonaByCategory(records[0]?.category ?? "study");
const activeSummary = summaries.find((summary) => summary.archetype === featuredPersona.category);
const activeLevel = activeSummary?.level ?? 1;
const activeXp = activeSummary?.xp ?? 0;
const activeProgress = activeSummary?.progress ?? 0;
const unlockedRewards = activeSummary?.unlockedItems ?? [];

export function HomeScreen() {
  const [voiceMode, setVoiceMode] = useState<PersonaVoiceMode>("cute");

  const identity = useMemo(
    () =>
      buildPersonaIdentity({
        category: featuredPersona.category,
        nickname: defaultPersonaNicknames[featuredPersona.category] ?? "",
        level: activeLevel,
        xp: activeXp,
        locale: "ko"
      }),
    []
  );

  const companion = useMemo(
    () =>
      buildPersonaCompanionLine({
        category: featuredPersona.category,
        nickname: defaultPersonaNicknames[featuredPersona.category] ?? "",
        level: activeLevel,
        voiceMode,
        locale: "ko"
      }),
    [voiceMode]
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View>
        <Text style={styles.eyebrow}>Home</Text>
        <Text style={styles.title}>페르소나의 집</Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.featuredBadge}>
          <Sparkles size={12} color={colors.ink} />
          <Text style={styles.featuredBadgeText}>대표</Text>
        </View>
        <Text style={styles.heroName}>{localize(featuredPersona.name, "ko")}</Text>
        <Text style={styles.heroNick}>{identity.displayName}</Text>
        <Text style={styles.heroActivity}>{localize(featuredPersona.activity, "ko")}</Text>
        <Text style={styles.companionLine}>{companion}</Text>

        <View style={styles.rewardMeter}>
          <Text style={styles.rewardLevel}>
            Lv.{activeLevel} · {activeXp}xp
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.max(activeProgress, 8)}%` }]} />
          </View>
          <Text style={styles.rewardEvolution}>{identity.upgradeLabel}</Text>
        </View>

        {unlockedRewards.length > 0 ? (
          <View style={styles.rewardChips}>
            {unlockedRewards.map((item) => (
              <Text key={item} style={styles.rewardChip}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.toneCard}>
        <Text style={styles.sectionTitle}>말투 / 테마</Text>
        <View style={styles.toneRow}>
          <Pressable
            style={[styles.toneOption, voiceMode === "cute" && styles.toneOptionActive]}
            onPress={() => setVoiceMode("cute")}
          >
            <Text style={[styles.toneOptionTitle, voiceMode === "cute" && styles.toneOptionTitleActive]}>
              귀여운 톤
            </Text>
            <Text style={styles.toneOptionHint}>장난스럽고 응원하는 말투</Text>
          </Pressable>
          <Pressable
            style={[styles.toneOption, voiceMode === "calm" && styles.toneOptionActive]}
            onPress={() => setVoiceMode("calm")}
          >
            <Text style={[styles.toneOptionTitle, voiceMode === "calm" && styles.toneOptionTitleActive]}>
              차분한 톤
            </Text>
            <Text style={styles.toneOptionHint}>담백하고 기록 중심 말투</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.collectionHeader}>
        <Text style={styles.sectionTitle}>보유 페르소나</Text>
        <Text style={styles.collectionCount}>{personaCatalog.length}종</Text>
      </View>
      <View style={styles.collectionList}>
        {personaCatalog.map((persona) => {
          const summary = summaries.find((item) => item.archetype === persona.category);
          const isFeatured = persona.id === featuredPersona.id;
          return (
            <View
              key={persona.id}
              style={[styles.personaCard, isFeatured && styles.personaCardFeatured]}
            >
              <View>
                <Text style={styles.personaCardName}>
                  {isFeatured ? "대표 · " : ""}
                  {localize(persona.name, "ko")}
                </Text>
                <Text style={styles.personaCardActivity} numberOfLines={1}>
                  {localize(persona.activity, "ko")}
                </Text>
              </View>
              <View style={styles.personaCardRight}>
                <Text style={styles.personaCardLevel}>Lv.{summary?.level ?? 1}</Text>
                <Text style={styles.personaCardXp}>{summary?.xp ?? 0}xp</Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  eyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  title: { ...typography.title, color: colors.ink },
  heroCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
    ...shadows.card
  },
  featuredBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.gold
  },
  featuredBadgeText: { color: colors.ink, fontWeight: "900", fontSize: 11, overflow: "hidden" },
  heroName: { ...typography.h2, color: colors.ink, marginTop: 6 },
  heroNick: { color: colors.leaf, fontWeight: "900", fontSize: 14 },
  heroActivity: { ...typography.body, color: colors.muted, marginTop: 2 },
  companionLine: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    color: colors.ink,
    fontWeight: "800",
    fontSize: 13,
    lineHeight: 19
  },
  rewardMeter: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    gap: 6
  },
  rewardLevel: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  progressFill: { height: "100%", backgroundColor: colors.leaf },
  rewardEvolution: { color: colors.leaf, fontWeight: "900", fontSize: 12 },
  rewardChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  rewardChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.leafSoft,
    color: colors.leaf,
    fontWeight: "900",
    fontSize: 11,
    overflow: "hidden"
  },
  toneCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm
  },
  sectionTitle: { ...typography.h3, color: colors.ink },
  toneRow: { flexDirection: "row", gap: 8 },
  toneOption: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    gap: 4
  },
  toneOptionActive: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  toneOptionTitle: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  toneOptionTitleActive: { color: colors.leaf },
  toneOptionHint: { color: colors.muted, fontWeight: "700", fontSize: 11 },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm
  },
  collectionCount: { color: colors.muted, fontWeight: "800", fontSize: 12 },
  collectionList: { gap: spacing.sm },
  personaCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8
  },
  personaCardFeatured: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  personaCardName: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  personaCardActivity: { color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 2 },
  personaCardRight: { alignItems: "flex-end" },
  personaCardLevel: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  personaCardXp: { color: colors.muted, fontWeight: "800", fontSize: 11 }
});
