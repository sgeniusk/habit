import { Activity, Apple, BookOpen, Sparkles, UserPlus, Users } from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RoomRow } from "../components/RoomRow";
import { buildMeetSuggestions } from "../lib/socialEngine";
import type { SnapRecord } from "../types/habit";

export function MeetView({ records }: { records: SnapRecord[] }) {
  const suggestions = buildMeetSuggestions(records);
  const topSuggestion = suggestions[0];

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
        <button type="button" className="invite-suggestion-button">
          <UserPlus size={18} aria-hidden="true" />
          {topSuggestion.cta}
        </button>
      </section>

      <div className="room-stack">
        <RoomRow title="도서관 9시 클럽" subtitle="오늘 3명 기록" value="82%" icon={BookOpen} />
        <RoomRow title="저녁 산책반" subtitle="이번 주 11개 스냅" value="64%" icon={Activity} />
        <RoomRow title="덜 시켜먹기" subtitle="식단 기록 연속 4일" value="71%" icon={Apple} />
      </div>
    </section>
  );
}
