// 모임 탭. socialEngine 의 첫 제안 카드 + 초대 미리보기.
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Sparkles, UserPlus, Users } from "lucide-react-native";

import { initialRecords } from "../data/sampleRecords";
import { localize } from "../lib/i18n";
import {
  acceptMeetInvite,
  buildMeetInvite,
  buildMeetSuggestions,
  type MeetSession
} from "../lib/socialEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

export function MeetScreen() {
  const suggestions = useMemo(() => buildMeetSuggestions(initialRecords), []);
  const topSuggestion = suggestions[0];
  const [session, setSession] = useState<MeetSession | null>(null);

  function createInvite() {
    if (!topSuggestion) return;
    const invite = buildMeetInvite(topSuggestion);
    const newSession = acceptMeetInvite(
      { invite, members: [], firstSnapMission: emptyMission(invite), groupPersona: emptyGroupPersona() },
      { id: "preview-runner", name: invite.previewMemberName }
    );
    setSession(newSession);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topStrip}>
        <View>
          <Text style={styles.eyebrow}>Together</Text>
          <Text style={styles.title}>모임</Text>
        </View>
        <View style={styles.iconBadge}>
          <Users size={18} color={colors.ink} />
        </View>
      </View>

      <View style={styles.heroBand}>
        <Text style={styles.heroEyebrow}>4명이 함께 성장 중</Text>
        <Text style={styles.heroTitle}>아침 루틴 모임</Text>
        <Text style={styles.heroBody}>
          공부, 식단, 러닝 스냅이 섞이며 공동 페르소나가 차분한 실행형으로 자라고 있어요.
        </Text>
      </View>

      {topSuggestion ? (
        <View style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <Sparkles size={16} color={colors.leaf} />
            <Text style={styles.suggestionEyebrow}>AI 모임 제안</Text>
          </View>
          <Text style={styles.suggestionTitle}>{localize(topSuggestion.title, "ko")}</Text>
          <Text style={styles.suggestionReason}>{localize(topSuggestion.reason, "ko")}</Text>
          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>{localize(topSuggestion.signalLabel, "ko")}</Text>
            <Text style={styles.signalMatch}>{topSuggestion.matchScore}% 맞음</Text>
          </View>
          <Pressable style={styles.ctaButton} onPress={createInvite}>
            <UserPlus size={16} color={colors.white} />
            <Text style={styles.ctaButtonText}>{localize(topSuggestion.cta, "ko")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.suggestionCard}>
          <Text style={styles.suggestionTitle}>모임 제안을 모았어요</Text>
          <Text style={styles.suggestionReason}>
            스냅이 더 쌓이면 새로운 모임이 다시 열립니다.
          </Text>
        </View>
      )}

      {session ? (
        <View style={styles.sessionCard}>
          <Text style={styles.sectionTitle}>{localize(session.invite.roomTitle, "ko")} 대기실</Text>
          <Text style={styles.sessionBody}>{localize(session.invite.description, "ko")}</Text>
          <Text style={styles.sessionUrl}>{session.invite.inviteUrl}</Text>
          <Text style={styles.sessionWaiting}>친구 1명 참여 대기 · +{session.invite.sharedXp} 공동 XP</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function emptyMission(invite: ReturnType<typeof buildMeetInvite>) {
  return {
    title: { ko: "첫 스냅 미션", en: "First snap mission" },
    description: {
      ko: `${localize(invite.roomTitle, "ko")} 에 들어온 친구가 첫 스냅을 남겨요.`,
      en: `Friend joins ${localize(invite.roomTitle, "en")} and leaves the first snap.`
    },
    rewardXp: 60,
    status: "waiting" as const
  };
}

function emptyGroupPersona() {
  return {
    name: { ko: "공동 페르소나", en: "Shared persona" },
    xp: 0,
    level: 1,
    mood: { ko: "첫 스냅을 기다리고 있어요", en: "Waiting for the first snap" },
    progress: 0
  };
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  topStrip: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  title: { ...typography.title, color: colors.ink },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center"
  },
  heroBand: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: "#b7dbbf",
    gap: 4
  },
  heroEyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  heroTitle: { ...typography.h2, color: colors.ink, marginTop: 4 },
  heroBody: { ...typography.body, color: colors.ink },
  suggestionCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
    ...shadows.card
  },
  suggestionHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  suggestionEyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  suggestionTitle: { ...typography.h3, color: colors.ink },
  suggestionReason: { ...typography.body, color: colors.muted },
  signalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signalLabel: { color: colors.ink, fontWeight: "800", fontSize: 12 },
  signalMatch: { color: colors.leaf, fontWeight: "900", fontSize: 12 },
  ctaButton: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    backgroundColor: colors.ink
  },
  ctaButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 },
  sessionCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.leaf,
    gap: 6
  },
  sectionTitle: { ...typography.h3, color: colors.ink },
  sessionBody: { ...typography.body, color: colors.muted },
  sessionUrl: {
    marginTop: 4,
    padding: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    color: colors.ink,
    fontFamily: "Menlo",
    fontSize: 11
  },
  sessionWaiting: { color: colors.leaf, fontWeight: "900", fontSize: 12 }
});
