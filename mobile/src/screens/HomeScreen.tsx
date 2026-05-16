// 집 탭. 대표 페르소나 영역 + 페르소나 컬렉션 + 말투 톤 토글.
import { useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { findPersonaByCategory, personaCatalog } from "../data/personaCatalog";
import {
  decorImageFor,
  roomDecors,
  roomImageFor,
  roomScenes
} from "../lib/formiAssets";
import { usePreferences } from "../lib/PreferencesContext";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { localize } from "../lib/i18n";
import { buildPersonaSummaries } from "../lib/personaEngine";
import {
  buildPersonaCompanionLine,
  buildPersonaIdentity,
  defaultPersonaNicknames
} from "../lib/personaIdentity";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

export function HomeScreen() {
  const { records } = useSnapRecords();
  const { preferences, setVoiceMode, setRoomScene, toggleRoomDecor } = usePreferences();
  const voiceMode = preferences.voiceMode;
  const roomScene = preferences.roomScene;
  const roomDecor = preferences.roomDecor;

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  const summaries = useMemo(() => buildPersonaSummaries(records), [records]);
  const featuredPersona = useMemo(
    () => findPersonaByCategory(records[0]?.category ?? "study"),
    [records]
  );
  const activePersona =
    personaCatalog.find((persona) => persona.id === selectedPersonaId) ?? featuredPersona;
  const activeSummary = summaries.find(
    (summary) => summary.archetype === activePersona.category
  );
  const activeLevel = activeSummary?.level ?? 1;
  const activeXp = activeSummary?.xp ?? 0;
  const activeProgress = activeSummary?.progress ?? 0;
  const unlockedRewards = activeSummary?.unlockedItems ?? [];

  const identity = useMemo(
    () =>
      buildPersonaIdentity({
        category: activePersona.category,
        nickname: defaultPersonaNicknames[activePersona.category] ?? "",
        level: activeLevel,
        xp: activeXp,
        locale: "ko"
      }),
    [activePersona.category, activeLevel, activeXp]
  );

  const companion = useMemo(
    () =>
      buildPersonaCompanionLine({
        category: activePersona.category,
        nickname: defaultPersonaNicknames[activePersona.category] ?? "",
        level: activeLevel,
        voiceMode,
        locale: "ko"
      }),
    [activePersona.category, activeLevel, voiceMode]
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
          <Text style={styles.featuredBadgeText}>
            {activePersona.id === featuredPersona.id ? "대표" : "선택"}
          </Text>
        </View>
        <View style={styles.heroAvatarWrap}>
          <FormiAvatar category={activePersona.category} level={activeLevel} size={150} />
        </View>
        <Text style={styles.heroName}>{localize(activePersona.name, "ko")}</Text>
        <Text style={styles.heroNick}>{identity.displayName}</Text>
        <Text style={styles.heroActivity}>{localize(activePersona.activity, "ko")}</Text>
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

      <View style={styles.toneCard}>
        <Text style={styles.sectionTitle}>방 꾸미기</Text>
        <View style={styles.roomPreview}>
          <Image
            source={roomImageFor(roomScene)}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          {roomDecor.includes("item-rug") ? (
            <Image
              source={decorImageFor("item-rug")}
              style={styles.decorRug}
              resizeMode="contain"
            />
          ) : null}
          {roomDecor.includes("item-shelf") ? (
            <Image
              source={decorImageFor("item-shelf")}
              style={styles.decorShelf}
              resizeMode="contain"
            />
          ) : null}
          {roomDecor.includes("item-lamp") ? (
            <Image
              source={decorImageFor("item-lamp")}
              style={styles.decorLamp}
              resizeMode="contain"
            />
          ) : null}
          {roomDecor.includes("item-plant") ? (
            <Image
              source={decorImageFor("item-plant")}
              style={styles.decorPlant}
              resizeMode="contain"
            />
          ) : null}
          <View style={styles.roomCharacter}>
            <FormiAvatar category={activePersona.category} level={activeLevel} size={120} />
          </View>
        </View>

        <Text style={styles.roomPickerLabel}>방 배경</Text>
        <View style={styles.chipRow}>
          {roomScenes.map((scene) => (
            <Pressable
              key={scene.id}
              style={[styles.chip, roomScene === scene.id && styles.chipActive]}
              onPress={() => setRoomScene(scene.id)}
            >
              <Text style={[styles.chipText, roomScene === scene.id && styles.chipTextActive]}>
                {scene.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.roomPickerLabel}>꾸미기 아이템</Text>
        <View style={styles.chipRow}>
          {roomDecors.map((decor) => {
            const on = roomDecor.includes(decor.id);
            return (
              <Pressable
                key={decor.id}
                style={[styles.chip, on && styles.chipActive]}
                onPress={() => toggleRoomDecor(decor.id)}
              >
                <Text style={[styles.chipText, on && styles.chipTextActive]}>
                  {on ? "✓ " : ""}
                  {decor.label}
                </Text>
              </Pressable>
            );
          })}
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
          const isActive = persona.id === activePersona.id;
          return (
            <Pressable
              key={persona.id}
              style={[styles.personaCard, isActive && styles.personaCardFeatured]}
              onPress={() => setSelectedPersonaId(persona.id)}
            >
              <FormiAvatar
                category={persona.category}
                level={summary?.level ?? 1}
                size={52}
                breathing={false}
              />
              <View style={styles.personaCardInfo}>
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
            </Pressable>
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
  heroAvatarWrap: { alignItems: "center", marginVertical: 4 },
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
  personaCardInfo: { flex: 1 },
  personaCardName: { color: colors.ink, fontWeight: "900", fontSize: 15 },
  personaCardActivity: { color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 2 },
  personaCardRight: { alignItems: "flex-end" },
  personaCardLevel: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  personaCardXp: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  chipActive: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  chipText: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  chipTextActive: { color: colors.leaf },
  roomPreview: {
    height: 220,
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    position: "relative"
  },
  roomCharacter: {
    position: "absolute",
    bottom: 14,
    left: "50%",
    marginLeft: -60,
    width: 120,
    alignItems: "center"
  },
  decorRug: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    marginLeft: -82,
    width: 164,
    height: 62
  },
  decorShelf: { position: "absolute", bottom: 18, left: 12, width: 80, height: 98 },
  decorLamp: { position: "absolute", bottom: 20, right: 12, width: 46, height: 110 },
  decorPlant: { position: "absolute", bottom: 10, right: 44, width: 54, height: 82 },
  roomPickerLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 6
  }
});
