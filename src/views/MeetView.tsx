import { useState } from "react";
import {
  Activity,
  Apple,
  BookOpen,
  CheckCircle2,
  Link,
  Sparkles,
  UserPlus,
  Users
} from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RoomRow } from "../components/RoomRow";
import { buildMeetInvite, buildMeetSuggestions, type MeetInvite } from "../lib/socialEngine";
import type { SnapRecord } from "../types/habit";

export function MeetView({ records }: { records: SnapRecord[] }) {
  const suggestions = buildMeetSuggestions(records);
  const topSuggestion = suggestions[0];
  const [invite, setInvite] = useState<MeetInvite | null>(null);
  const [hasAcceptedPreview, setHasAcceptedPreview] = useState(false);

  function createInvite() {
    setInvite(buildMeetInvite(topSuggestion));
    setHasAcceptedPreview(false);
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

      {invite ? (
        <section className="meet-invite-card" aria-labelledby="meet-invite-title">
          <div className="invite-status-row">
            <span>
              <Link size={15} aria-hidden="true" />
              {hasAcceptedPreview ? "친구 1명 참여 대기" : invite.status}
            </span>
            {hasAcceptedPreview ? <strong>+{invite.sharedXp} 공동 XP</strong> : null}
          </div>
          <div>
            <p className="eyebrow">Invite Room</p>
            <h2 id="meet-invite-title">{invite.roomTitle} 대기실</h2>
          </div>
          <p>{invite.description}</p>
          <code>{invite.inviteUrl}</code>
          {hasAcceptedPreview ? (
            <div className="invite-member-row">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>{invite.previewMemberName}가 첫 스냅을 준비 중이에요.</span>
            </div>
          ) : (
            <button
              type="button"
              className="accept-preview-button"
              onClick={() => setHasAcceptedPreview(true)}
            >
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
