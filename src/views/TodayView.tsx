import { Camera, Check, ChevronRight, MapPin, PenLine, Sun, Wand2 } from "lucide-react";
import { MetricTile } from "../components/MetricTile";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RecordRow } from "../components/RecordRow";
import { personaCatalog } from "../data/personaCatalog";
import { findHiddenHabitInsights } from "../lib/personaEngine";
import type { SnapRecord } from "../types/habit";

export function TodayView({
  records,
  insights,
  todayCount,
  onSnap
}: {
  records: SnapRecord[];
  insights: ReturnType<typeof findHiddenHabitInsights>;
  todayCount: number;
  onSnap: () => void;
}) {
  const featuredPersona = personaCatalog[0];

  return (
    <section className="screen today-screen" aria-labelledby="today-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Today</p>
          <h1 id="today-title">오늘의 기록</h1>
        </div>
        <div className="streak-badge">
          <Check size={18} aria-hidden="true" />
          <span>6일</span>
        </div>
      </div>

      <section className="weather-card" aria-label="오늘 날씨와 지역">
        <div>
          <span className="weather-icon">
            <Sun size={22} aria-hidden="true" />
          </span>
          <div>
            <strong>18도 · 산책하기 좋은 맑음</strong>
            <p>
              <MapPin size={14} aria-hidden="true" />
              서울 성수동
            </p>
          </div>
        </div>
        <small>현재 위치 기준</small>
      </section>

      <div className="hero-band outdoor-hero">
        <PersonaAvatar tone={featuredPersona.tone} accessory="study" />
        <div className="hero-copy">
          <span className="status-pill">대표 페르소나 · 야외</span>
          <h2>{featuredPersona.name}</h2>
          <p>맑은 날씨라 산책 후 도서관으로 향하는 중이에요.</p>
          <div className="progress-track" aria-label={`레벨 ${featuredPersona.level} 진행률`}>
            <span style={{ width: "68%" }} />
          </div>
        </div>
      </div>

      <button type="button" className="capture-cta" onClick={onSnap}>
        <Camera size={22} aria-hidden="true" />
        <span>오늘의 한 컷 남기기</span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      <section className="journal-card" aria-labelledby="journal-title">
        <div>
          <p className="eyebrow">Journal</p>
          <h2 id="journal-title">오늘 기록 방식</h2>
        </div>
        <div className="mode-switch">
          <button type="button">
            <Wand2 size={17} aria-hidden="true" />
            AI랑 같이쓰기
          </button>
          <button type="button">
            <PenLine size={17} aria-hidden="true" />
            혼자 기록하기
          </button>
        </div>
        <p>사진, 날씨, 장소, 오늘의 감정을 바탕으로 일기를 시작할 수 있어요.</p>
      </section>

      <div className="daily-grid">
        <MetricTile label="오늘 스냅" value={`${todayCount}/3`} tone="leaf" />
        <MetricTile label="보유 페르소나" value={`${personaCatalog.length}`} tone="blue" />
        <MetricTile label="모임 기여" value="+28xp" tone="coral" />
      </div>

      <section className="insight-band" aria-labelledby="hidden-habit-title">
        <div>
          <p className="eyebrow">AI Insight</p>
          <h2 id="hidden-habit-title">숨은 습관 발견</h2>
        </div>
        <p>{insights[0]?.body}</p>
      </section>

      <section className="timeline-section" aria-labelledby="timeline-title">
        <h2 id="timeline-title">오늘 남긴 기록</h2>
        <div className="record-list">
          {records.slice(0, 4).map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </div>
      </section>
    </section>
  );
}
