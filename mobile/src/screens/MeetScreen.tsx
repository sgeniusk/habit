// 모임 탭. AI 제안 → 초대 생성 → 링크 복사 → 수락 미리보기 → 첫 스냅 미션 → 공동 페르소나 성장.
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import {
  CheckCircle2,
  Clipboard as ClipboardIcon,
  Send,
  Sparkles,
  Trophy,
  UserPlus,
  Users
} from "lucide-react-native";

import { FormiAvatar } from "../components/FormiAvatar";
import { useSnapRecords } from "../lib/SnapRecordsContext";
import { localize } from "../lib/i18n";
import {
  acceptMeetInvite,
  buildMeetInvite,
  buildMeetSuggestions,
  completeMeetFirstSnapMission,
  createMeetSession,
  type MeetSession
} from "../lib/socialEngine";
import { colors, radii, shadows, spacing, typography } from "../lib/tokens";

export function MeetScreen() {
  const { records } = useSnapRecords();
  const suggestions = useMemo(() => buildMeetSuggestions(records), [records]);
  const topSuggestion = suggestions[0];
  const [session, setSession] = useState<MeetSession | null>(null);
  const [statusToast, setStatusToast] = useState("");

  const waitingMember = session?.members.find((member) => member.status === "waiting-first-snap");
  const contributedMember = session?.members.find((member) => member.status === "contributed");

  function flashToast(message: string) {
    setStatusToast(message);
    setTimeout(() => setStatusToast(""), 2000);
  }

  function createInvite() {
    if (!topSuggestion) return;
    setSession(createMeetSession(buildMeetInvite(topSuggestion)));
    flashToast("초대 링크가 만들어졌어요.");
  }

  async function copyInviteLink() {
    if (!session) return;
    await Clipboard.setStringAsync(session.invite.inviteUrl);
    flashToast("초대 링크를 복사했어요.");
  }

  async function shareInvite() {
    if (!session) return;
    const title = localize(session.invite.roomTitle, "ko");
    try {
      await Share.share({
        message: `${title}에 초대할게요. 같이 생활 스냅 남기며 페르소나를 키워요 🌱 ${session.invite.inviteUrl}`
      });
    } catch {
      // 공유 취소나 실패는 조용히 넘어간다.
    }
  }

  function previewAccept() {
    setSession((current) =>
      current
        ? acceptMeetInvite(current, {
            id: "preview-member",
            name: current.invite.previewMemberName
          })
        : current
    );
    flashToast("친구가 초대를 수락했어요.");
  }

  function completeMission() {
    setSession((current) =>
      current ? completeMeetFirstSnapMission(current, "preview-member") : current
    );
    flashToast("첫 스냅 미션을 완료했어요.");
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
        <View style={styles.heroBandRow}>
          <FormiAvatar category={records[0]?.category ?? "study"} level={4} size={84} />
          <View style={styles.heroBandTexts}>
            <Text style={styles.heroEyebrow}>같이 하면 더 오래 가요</Text>
            <Text style={styles.heroTitle}>스냅으로 만드는 모임</Text>
          </View>
        </View>
        <Text style={styles.heroBody}>
          반복되는 생활 스냅을 읽어 비슷한 리듬의 친구와 묶어줘요. 압박이 아니라 같이 돌아오는
          장치예요.
        </Text>
      </View>

      {topSuggestion ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Sparkles size={16} color={colors.leaf} />
            <Text style={styles.cardEyebrow}>AI 모임 제안</Text>
          </View>
          <Text style={styles.cardTitle}>{localize(topSuggestion.title, "ko")}</Text>
          <Text style={styles.cardBody}>{localize(topSuggestion.reason, "ko")}</Text>
          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>{localize(topSuggestion.signalLabel, "ko")}</Text>
            <Text style={styles.signalMatch}>{topSuggestion.matchScore}% 맞음</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={createInvite}>
            <UserPlus size={16} color={colors.white} />
            <Text style={styles.primaryButtonText}>{localize(topSuggestion.cta, "ko")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>모임 제안을 모으는 중</Text>
          <Text style={styles.cardBody}>스냅이 더 쌓이면 새로운 모임이 열립니다.</Text>
        </View>
      )}

      {session ? (
        <View style={styles.sessionCard}>
          <Text style={styles.cardEyebrow}>Invite Room</Text>
          <Text style={styles.cardTitle}>
            {localize(session.invite.roomTitle, "ko")} 대기실
          </Text>
          <Text style={styles.cardBody}>{localize(session.invite.description, "ko")}</Text>
          <Text style={styles.inviteUrl}>{session.invite.inviteUrl}</Text>
          <Pressable style={styles.primaryButton} onPress={shareInvite}>
            <Send size={15} color={colors.white} />
            <Text style={styles.primaryButtonText}>초대 보내기</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={copyInviteLink}>
            <ClipboardIcon size={15} color={colors.ink} />
            <Text style={styles.secondaryButtonText}>초대 링크 복사</Text>
          </Pressable>

          {!waitingMember && !contributedMember ? (
            <Pressable style={styles.outlineButton} onPress={previewAccept}>
              <Text style={styles.outlineButtonText}>초대 수락 미리보기</Text>
            </Pressable>
          ) : null}

          {waitingMember || contributedMember ? (
            <View style={styles.memberRow}>
              <CheckCircle2 size={16} color={colors.leaf} />
              <Text style={styles.memberText}>
                {localize((waitingMember ?? contributedMember)!.name, "ko")} 참여
              </Text>
            </View>
          ) : null}

          {waitingMember || contributedMember ? (
            <View style={styles.groupPersonaCard}>
              <View style={styles.groupPersonaHeader}>
                <Trophy size={16} color={colors.gold} />
                <Text style={styles.groupPersonaName}>
                  {localize(session.groupPersona.name, "ko")}
                </Text>
              </View>
              <Text style={styles.groupPersonaLevel}>
                Lv.{session.groupPersona.level} · {session.groupPersona.xp}xp
              </Text>
              <Text style={styles.groupPersonaMood}>
                {localize(session.groupPersona.mood, "ko")}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.max(session.groupPersona.progress, 8)}%` }
                  ]}
                />
              </View>
            </View>
          ) : null}

          {waitingMember ? (
            <View style={styles.missionCard}>
              <Text style={styles.missionTitle}>
                {localize(session.firstSnapMission.title, "ko")}
              </Text>
              <Text style={styles.missionBody}>
                {localize(session.firstSnapMission.description, "ko")}
              </Text>
              <Pressable style={styles.primaryButton} onPress={completeMission}>
                <Text style={styles.primaryButtonText}>
                  +{session.firstSnapMission.rewardXp}xp 완료하기
                </Text>
              </Pressable>
            </View>
          ) : null}

          {contributedMember ? (
            <View style={styles.missionDone}>
              <Text style={styles.missionDoneText}>첫 스냅 미션 완료</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {statusToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{statusToast}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl * 2 },
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
    gap: 8
  },
  heroBandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroBandTexts: { flex: 1, gap: 2 },
  heroEyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  heroTitle: { ...typography.h2, color: colors.ink, marginTop: 4 },
  heroBody: { ...typography.body, color: colors.ink },
  card: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
    ...shadows.card
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardEyebrow: { ...typography.eyebrow, color: colors.leaf, textTransform: "uppercase" },
  cardTitle: { ...typography.h3, color: colors.ink },
  cardBody: { ...typography.body, color: colors.muted },
  signalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  signalLabel: { color: colors.ink, fontWeight: "800", fontSize: 12 },
  signalMatch: { color: colors.leaf, fontWeight: "900", fontSize: 12 },
  primaryButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: radii.md,
    backgroundColor: colors.ink
  },
  primaryButtonText: { color: colors.white, fontWeight: "900", fontSize: 14 },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 11,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line
  },
  secondaryButtonText: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  outlineButton: {
    paddingVertical: 11,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.leaf,
    backgroundColor: colors.leafSoft,
    alignItems: "center"
  },
  outlineButtonText: { color: colors.leaf, fontWeight: "900", fontSize: 13 },
  sessionCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.leaf,
    gap: spacing.sm
  },
  inviteUrl: {
    padding: 8,
    borderRadius: radii.sm,
    backgroundColor: colors.background,
    color: colors.ink,
    fontSize: 11,
    fontWeight: "700"
  },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  memberText: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  groupPersonaCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.background,
    gap: 4
  },
  groupPersonaHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  groupPersonaName: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  groupPersonaLevel: { color: colors.ink, fontWeight: "900", fontSize: 13 },
  groupPersonaMood: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  progressTrack: {
    height: 10,
    marginTop: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden"
  },
  progressFill: { height: "100%", backgroundColor: colors.leaf },
  missionCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    borderWidth: 1,
    borderColor: "#cce8d0",
    gap: 6
  },
  missionTitle: { color: colors.ink, fontWeight: "900", fontSize: 14 },
  missionBody: { color: colors.muted, fontWeight: "700", fontSize: 12, lineHeight: 18 },
  missionDone: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.leafSoft,
    borderWidth: 1,
    borderColor: "#cce8d0"
  },
  missionDoneText: { color: colors.leaf, fontWeight: "900", fontSize: 13 },
  toast: {
    padding: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.ink
  },
  toastText: { color: colors.white, fontWeight: "900", fontSize: 13 }
});
