import { useState } from "react";
import {
  Activity,
  Apple,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Link,
  Share2,
  Sparkles,
  Trophy,
  UserPlus,
  Users
} from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RoomRow } from "../components/RoomRow";
import {
  acceptMeetInvite,
  buildMeetInvite,
  buildMeetSuggestions,
  completeMeetFirstSnapMission,
  createMeetSession,
  type MeetSession
} from "../lib/socialEngine";
import type { SnapRecord } from "../types/habit";

export function MeetView({ records }: { records: SnapRecord[] }) {
  const suggestions = buildMeetSuggestions(records);
  const topSuggestion = suggestions[0];
  const [meetSession, setMeetSession] = useState<MeetSession | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const waitingMember = meetSession?.members.find(
    (member) => member.status === "waiting-first-snap"
  );
  const contributedMember = meetSession?.members.find((member) => member.status === "contributed");

  function createInvite() {
    setMeetSession(createMeetSession(buildMeetInvite(topSuggestion)));
    setShareStatus("");
  }

  async function copyInviteLink() {
    if (!meetSession) {
      return;
    }

    try {
      await navigator.clipboard?.writeText?.(meetSession.invite.inviteUrl);
      setShareStatus("링크 복사됨");
    } catch {
      setShareStatus("링크를 길게 눌러 복사해요");
    }
  }

  function prepareShareMessage() {
    setShareStatus("공유 문구 준비됨");
  }

  function previewInviteAccept() {
    setMeetSession((currentSession) => {
      const session = currentSession ?? createMeetSession(buildMeetInvite(topSuggestion));

      return acceptMeetInvite(session, {
        id: "preview-runner",
        name: session.invite.previewMemberName
      });
    });
  }

  function completeFirstSnapMission() {
    setMeetSession((currentSession) =>
      currentSession
        ? completeMeetFirstSnapMission(currentSession, "preview-runner")
        : currentSession
    );
  }

  return (
    <section className="screen rooms-screen" aria-labelledby="meet-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Together</p>
          <h1 id="meet-title">모임</h1>
        </div>
        <button type="button" className="icon-button" aria-label="친구 초대">
          <Users size={20} aria-hidden="true" />
        </button>
      </div>

      <article className="room-hero">
        <div>
          <p className="eyebrow">4명이 함께 성장 중</p>
          <h2>아침 루틴 모임</h2>
          <p>공부, 식단, 러닝 스냅이 섞이며 공동 페르소나가 차분한 실행형으로 자라고 있어요.</p>
        </div>
        <PersonaAvatar tone="blue" accessory="group" />
      </article>

      <section className="meet-suggestion-card" aria-labelledby="meet-suggestion-title">
        <div className="suggestion-heading">
          <span className="suggestion-icon">
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="eyebrow">AI 모임 제안</p>
            <h2 id="meet-suggestion-title">{topSuggestion.title}</h2>
          </div>
        </div>
        <p>{topSuggestion.reason}</p>
        <div className="suggestion-signal-row">
          <span>{topSuggestion.signalLabel}</span>
          <strong>{topSuggestion.matchScore}% 맞음</strong>
        </div>
        <button type="button" className="invite-suggestion-button" onClick={createInvite}>
          <UserPlus size={18} aria-hidden="true" />
          {topSuggestion.cta}
        </button>
      </section>

      {meetSession ? (
        <section className="meet-invite-card" aria-labelledby="meet-invite-title">
          <div className="invite-status-row">
            <span>
              <Link size={15} aria-hidden="true" />
              {waitingMember
                ? "친구 1명 참여 대기"
                : contributedMember
                  ? "미션 완료"
                  : meetSession.invite.status}
            </span>
            {waitingMember ? <strong>+{meetSession.invite.sharedXp} 공동 XP</strong> : null}
          </div>
          <div>
            <p className="eyebrow">Invite Room</p>
            <h2 id="meet-invite-title">{meetSession.invite.roomTitle} 대기실</h2>
          </div>
          <p>{meetSession.invite.description}</p>
          <code>{meetSession.invite.inviteUrl}</code>
          <div className="invite-action-row">
            <button type="button" onClick={copyInviteLink}>
              <Clipboard size={16} aria-hidden="true" />
              초대 링크 복사
            </button>
            <button type="button" onClick={prepareShareMessage}>
              <Share2 size={16} aria-hidden="true" />
              공유 문구 만들기
            </button>
          </div>
          {shareStatus ? <strong className="invite-share-status">{shareStatus}</strong> : null}
          {waitingMember || contributedMember ? (
            <>
              <div className="invite-member-row">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{(waitingMember ?? contributedMember)?.name} 저장됨</span>
              </div>
              <section className="group-persona-card" aria-label="공동 페르소나 성장">
                <div>
                  <Trophy size={18} aria-hidden="true" />
                  <div>
                    <h3>{meetSession.groupPersona.name}</h3>
                    <span>
                      Lv.{meetSession.groupPersona.level} · {meetSession.groupPersona.xp}xp
                    </span>
                  </div>
                </div>
                <p>{meetSession.groupPersona.mood}</p>
                <div className="progress-track" aria-label="공동 페르소나 진행률">
                  <span style={{ width: `${Math.max(meetSession.groupPersona.progress, 8)}%` }} />
                </div>
              </section>
              <section
                className="first-snap-mission"
                aria-label={meetSession.firstSnapMission.title}
              >
                <div>
                  <strong>{meetSession.firstSnapMission.title}</strong>
                  <span>
                    {meetSession.firstSnapMission.status === "completed"
                      ? "첫 스냅 완료"
                      : "대기 중"}
                  </span>
                </div>
                <p>{meetSession.firstSnapMission.description}</p>
                {meetSession.firstSnapMission.status === "waiting" ? (
                  <button type="button" onClick={completeFirstSnapMission}>
                    +{meetSession.firstSnapMission.rewardXp}xp 완료하기
                  </button>
                ) : null}
              </section>
            </>
          ) : (
            <button type="button" className="accept-preview-button" onClick={previewInviteAccept}>
              초대 수락 미리보기
            </button>
          )}
        </section>
      ) : null}

      <div className="room-stack">
        <RoomRow title="도서관 9시 클럽" subtitle="오늘 3명 기록" value="82%" icon={BookOpen} />
        <RoomRow title="저녁 산책반" subtitle="이번 주 11개 스냅" value="64%" icon={Activity} />
        <RoomRow title="덜 시켜먹기" subtitle="식단 기록 연속 4일" value="71%" icon={Apple} />
      </div>
    </section>
  );
}
