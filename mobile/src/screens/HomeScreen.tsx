// 집 탭. 대표 페르소나 영역 + 페르소나 컬렉션 + 매일 스냅 알림 + 말투 톤 토글.
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Sparkles } from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { IsoRoom } from "../components/IsoRoom";
import { findPersonaByCategory, personaCatalog } from "../data/personaCatalog";
import { useAuth } from "../lib/AuthContext";
import { requestNotificationPermission } from "../lib/notifications";
import { usePreferences } from "../lib/PreferencesContext";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { isSupabaseConfigured } from "../lib/supabase";
import { localize } from "../lib/i18n";
import { buildPersonaSummaries } from "../lib/personaEngine";
import {
  buildPersonaCompanionLine,
  buildPersonaIdentity,
  defaultPersonaNicknames
} from "../lib/personaIdentity";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

// 매일 스냅 알림 시간 프리셋
const REMINDER_PRESETS = [
  { label: "아침 8시", hour: 8, minute: 0 },
  { label: "오후 1시", hour: 13, minute: 0 },
  { label: "저녁 7시", hour: 19, minute: 0 },
  { label: "밤 9시", hour: 21, minute: 0 }
];

export function HomeScreen() {
  const { records } = useSnapRecords();
  const { preferences, setVoiceMode, setReminderEnabled, setReminderTime } = usePreferences();
  const { isLoggedIn, signInWithGoogle, signOut } = useAuth();
  const voiceMode = preferences.voiceMode;

  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);

  // 알림을 켤 때만 권한을 요청하고, 거부되면 켜지 않는다.
  const handleToggleReminder = useCallback(
    async (value: boolean) => {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            "알림 권한이 필요해요",
            "기기 설정에서 Formi 알림을 켜면 매일 스냅 알림을 받을 수 있어요."
          );
          return;
        }
      }
      setReminderEnabled(value);
    },
    [setReminderEnabled]
  );

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

      <View style={styles.toneCard}>
        <Text style={styles.sectionTitle}>페르소나의 방</Text>
        <IsoRoom category={activePersona.category} level={activeLevel} />
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

      {isSupabaseConfigured ? (
        <View style={styles.accountCard}>
          {isLoggedIn ? (
            <>
              <View style={styles.accountText}>
                <Text style={styles.accountTitle}>로그인됨</Text>
                <Text style={styles.accountHint}>기록이 계정에 안전하게 보관돼요.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
                onPress={signOut}
              >
                <Text style={styles.signOutText}>로그아웃</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={styles.accountText}>
                <Text style={styles.accountTitle}>기록을 안전하게</Text>
                <Text style={styles.accountHint}>
                  구글로 로그인하면 폰을 바꿔도 페르소나가 따라와요.
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
                onPress={signInWithGoogle}
              >
                <Text style={styles.googleButtonText}>구글로 로그인</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      {Platform.OS !== "web" ? (
        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <View style={styles.accountText}>
              <Text style={styles.accountTitle}>매일 스냅 알림</Text>
              <Text style={styles.accountHint}>
                정한 시간에 오늘의 스냅을 잊지 않게 알려줘요.
              </Text>
            </View>
            <Switch
              value={preferences.reminderEnabled}
              onValueChange={handleToggleReminder}
              trackColor={{ false: colors.line, true: colors.leaf }}
            />
          </View>
          {preferences.reminderEnabled ? (
            <View style={styles.reminderTimes}>
              {REMINDER_PRESETS.map((preset) => {
                const active =
                  preferences.reminderHour === preset.hour &&
                  preferences.reminderMinute === preset.minute;
                return (
                  <Pressable
                    key={preset.label}
                    style={({ pressed }) => [
                      styles.timeChip,
                      active && styles.timeChipActive,
                      pressed && styles.pressed
                    ]}
                    onPress={() => setReminderTime(preset.hour, preset.minute)}
                  >
                    <Text
                      style={[styles.timeChipText, active && styles.timeChipTextActive]}
                    >
                      {preset.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}

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
  featuredBadgeText: { color: colors.ink, fontWeight: "700", fontSize: 11, overflow: "hidden" },
  heroAvatarWrap: { alignItems: "center", marginVertical: 4 },
  heroName: { ...typography.h2, color: colors.ink, marginTop: 6 },
  heroNick: { color: colors.leaf, fontWeight: "700", fontSize: 14 },
  heroActivity: { ...typography.body, color: colors.muted, marginTop: 2 },
  companionLine: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    color: colors.ink,
    fontWeight: "600",
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
  rewardLevel: { color: colors.ink, fontWeight: "700", fontSize: 14 },
  progressTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  progressFill: { height: "100%", backgroundColor: colors.leaf },
  rewardEvolution: { color: colors.leaf, fontWeight: "700", fontSize: 12 },
  rewardChips: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 },
  rewardChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.leafSoft,
    color: colors.leaf,
    fontWeight: "700",
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
  accountCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  accountText: { flex: 1, gap: 2 },
  accountTitle: { color: colors.ink, fontWeight: "600", fontSize: 14 },
  accountHint: { color: colors.muted, fontWeight: "400", fontSize: 11, lineHeight: 16 },
  googleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  googleButtonText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  signOutButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line
  },
  signOutText: { color: colors.muted, fontWeight: "600", fontSize: 13 },
  reminderCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.md
  },
  reminderHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  reminderTimes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line
  },
  timeChipActive: { backgroundColor: colors.leafSoft, borderColor: colors.leaf },
  timeChipText: { color: colors.muted, fontWeight: "600", fontSize: 12 },
  timeChipTextActive: { color: colors.leafDeep },
  pressed: { opacity: 0.85 },
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
  toneOptionTitle: { color: colors.ink, fontWeight: "700", fontSize: 14 },
  toneOptionTitleActive: { color: colors.leaf },
  toneOptionHint: { color: colors.muted, fontWeight: "700", fontSize: 11 },
  collectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm
  },
  collectionCount: { color: colors.muted, fontWeight: "600", fontSize: 12 },
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
  personaCardName: { color: colors.ink, fontWeight: "700", fontSize: 15 },
  personaCardActivity: { color: colors.muted, fontWeight: "700", fontSize: 12, marginTop: 2 },
  personaCardRight: { alignItems: "flex-end" },
  personaCardLevel: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  personaCardXp: { color: colors.muted, fontWeight: "600", fontSize: 11 },
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
  chipText: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: colors.leaf }
});
