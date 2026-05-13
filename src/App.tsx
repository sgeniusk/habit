import {
  Activity,
  Apple,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Home,
  ImagePlus,
  Medal,
  Moon,
  Sparkles,
  Users,
  Utensils
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildPersonaSummaries,
  findHiddenHabitInsights,
  getCategoryLabel,
  getPlaceLabel,
  type HabitCategory,
  type PlaceType,
  type VerificationRecord
} from "./lib/personaEngine";

type TabId = "today" | "capture" | "personas" | "rooms" | "report";

const initialRecords: VerificationRecord[] = [
  {
    id: "sample-study-1",
    category: "study",
    placeType: "library",
    memo: "아침 문제풀이",
    createdAt: "2026-05-09T09:20:00.000+09:00"
  },
  {
    id: "sample-meal-1",
    category: "meal",
    placeType: "restaurant",
    memo: "가벼운 점심",
    createdAt: "2026-05-09T12:40:00.000+09:00"
  },
  {
    id: "sample-exercise-1",
    category: "exercise",
    placeType: "outdoors",
    memo: "20분 러닝",
    createdAt: "2026-05-10T21:15:00.000+09:00"
  },
  {
    id: "sample-study-2",
    category: "study",
    placeType: "library",
    memo: "도서관 2층",
    createdAt: "2026-05-11T09:35:00.000+09:00"
  },
  {
    id: "sample-reading-1",
    category: "reading",
    placeType: "cafe",
    memo: "책 18쪽",
    createdAt: "2026-05-12T18:10:00.000+09:00"
  }
];

const categoryOptions: Array<{
  id: HabitCategory;
  label: string;
  icon: typeof BookOpen;
  tone: string;
}> = [
  { id: "study", label: "공부", icon: BookOpen, tone: "leaf" },
  { id: "meal", label: "식단", icon: Utensils, tone: "coral" },
  { id: "exercise", label: "운동", icon: Activity, tone: "blue" },
  { id: "reading", label: "독서", icon: BookOpen, tone: "gold" },
  { id: "cleaning", label: "정리", icon: Home, tone: "mint" },
  { id: "selfcare", label: "관리", icon: Moon, tone: "ink" }
];

const placeOptions: PlaceType[] = [
  "home",
  "library",
  "school",
  "cafe",
  "gym",
  "restaurant",
  "outdoors"
];

const tabs: Array<{ id: TabId; label: string; icon: typeof Home }> = [
  { id: "today", label: "오늘", icon: Home },
  { id: "capture", label: "인증", icon: Camera },
  { id: "personas", label: "페르소나", icon: Sparkles },
  { id: "rooms", label: "방", icon: Users },
  { id: "report", label: "리포트", icon: Medal }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [records, setRecords] = useState(initialRecords);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>("study");
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>("library");
  const [memo, setMemo] = useState("");
  const [photoName, setPhotoName] = useState("오늘 인증샷");
  const [savedPulse, setSavedPulse] = useState(false);

  const personas = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
  const topPersona = personas[0];
  const todayCount = Math.min(3, records.length - initialRecords.length + 1);

  function saveRecord() {
    const nextRecord: VerificationRecord = {
      id: `record-${Date.now()}`,
      category: selectedCategory,
      placeType: selectedPlace,
      memo: memo || photoName,
      createdAt: new Date().toISOString()
    };

    setRecords((current) => [nextRecord, ...current]);
    setMemo("");
    setPhotoName("새 인증샷 저장됨");
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 800);
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {activeTab === "today" && (
          <TodayView
            records={records}
            topPersona={topPersona}
            insights={insights}
            todayCount={todayCount}
            onCapture={() => setActiveTab("capture")}
          />
        )}
        {activeTab === "capture" && (
          <CaptureView
            selectedCategory={selectedCategory}
            selectedPlace={selectedPlace}
            memo={memo}
            photoName={photoName}
            savedPulse={savedPulse}
            onCategoryChange={setSelectedCategory}
            onPlaceChange={setSelectedPlace}
            onMemoChange={setMemo}
            onPhotoNameChange={setPhotoName}
            onSave={saveRecord}
          />
        )}
        {activeTab === "personas" && <PersonaView personas={personas} />}
        {activeTab === "rooms" && <RoomsView />}
        {activeTab === "report" && (
          <ReportView records={records} personas={personas} insights={insights} />
        )}
      </main>

      <nav className="tab-bar" aria-label="주요 화면">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab-button is-active" : "tab-button"}
              onClick={() => setActiveTab(tab.id)}
              aria-label={tab.label}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function TodayView({
  records,
  topPersona,
  insights,
  todayCount,
  onCapture
}: {
  records: VerificationRecord[];
  topPersona: ReturnType<typeof buildPersonaSummaries>[number];
  insights: ReturnType<typeof findHiddenHabitInsights>;
  todayCount: number;
  onCapture: () => void;
}) {
  return (
    <section className="screen today-screen" aria-labelledby="today-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Persona Habit</p>
          <h1 id="today-title">오늘의 생활 인증</h1>
        </div>
        <div className="streak-badge">
          <Check size={18} aria-hidden="true" />
          <span>6일</span>
        </div>
      </div>

      <div className="hero-band">
        <PersonaAvatar tone="leaf" accessory="study" />
        <div className="hero-copy">
          <span className="status-pill">대표 페르소나</span>
          <h2>{topPersona.name}</h2>
          <p>{topPersona.evolution}</p>
          <div className="progress-track" aria-label={`레벨 ${topPersona.level} 진행률`}>
            <span style={{ width: `${Math.max(18, topPersona.progress)}%` }} />
          </div>
        </div>
      </div>

      <button type="button" className="capture-cta" onClick={onCapture}>
        <Camera size={22} aria-hidden="true" />
        <span>인증샷 찍기</span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      <div className="daily-grid">
        <MetricTile label="오늘 인증" value={`${todayCount}/3`} tone="leaf" />
        <MetricTile label="보유 페르소나" value="4" tone="blue" />
        <MetricTile label="방 기여" value="+28xp" tone="coral" />
      </div>

      <section className="insight-band" aria-labelledby="hidden-habit-title">
        <div>
          <p className="eyebrow">AI Insight</p>
          <h2 id="hidden-habit-title">숨은 습관 발견</h2>
        </div>
        <p>{insights[0]?.body}</p>
      </section>

      <section className="timeline-section" aria-labelledby="timeline-title">
        <h2 id="timeline-title">최근 인증</h2>
        <div className="record-list">
          {records.slice(0, 4).map((record) => (
            <RecordRow key={record.id} record={record} />
          ))}
        </div>
      </section>
    </section>
  );
}

function CaptureView({
  selectedCategory,
  selectedPlace,
  memo,
  photoName,
  savedPulse,
  onCategoryChange,
  onPlaceChange,
  onMemoChange,
  onPhotoNameChange,
  onSave
}: {
  selectedCategory: HabitCategory;
  selectedPlace: PlaceType;
  memo: string;
  photoName: string;
  savedPulse: boolean;
  onCategoryChange: (category: HabitCategory) => void;
  onPlaceChange: (place: PlaceType) => void;
  onMemoChange: (memo: string) => void;
  onPhotoNameChange: (name: string) => void;
  onSave: () => void;
}) {
  return (
    <section className="screen capture-screen" aria-labelledby="capture-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Proof Shot</p>
          <h1 id="capture-title">생활 인증</h1>
        </div>
      </div>

      <label className={savedPulse ? "photo-drop is-saved" : "photo-drop"}>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onPhotoNameChange(file.name);
            }
          }}
        />
        <ImagePlus size={30} aria-hidden="true" />
        <strong>{photoName}</strong>
        <span>사진을 찍거나 골라서 페르소나 XP로 바꿔요</span>
      </label>

      <section className="choice-section" aria-labelledby="category-title">
        <h2 id="category-title">무슨 인증인가요?</h2>
        <div className="category-grid">
          {categoryOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                type="button"
                className={
                  selectedCategory === option.id
                    ? `category-chip ${option.tone} is-selected`
                    : `category-chip ${option.tone}`
                }
                onClick={() => onCategoryChange(option.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="place-title">
        <h2 id="place-title">어디에서 했나요?</h2>
        <div className="place-scroller">
          {placeOptions.map((place) => (
            <button
              key={place}
              type="button"
              className={selectedPlace === place ? "place-chip is-selected" : "place-chip"}
              onClick={() => onPlaceChange(place)}
            >
              {getPlaceLabel(place)}
            </button>
          ))}
        </div>
      </section>

      <label className="memo-field">
        <span>한 줄 메모</span>
        <input
          value={memo}
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder="예: 도서관 2층에서 50분 집중"
        />
      </label>

      <button type="button" className="save-button" onClick={onSave}>
        <Sparkles size={20} aria-hidden="true" />
        <span>{getCategoryLabel(selectedCategory)} 페르소나에 저장</span>
      </button>
    </section>
  );
}

function PersonaView({ personas }: { personas: ReturnType<typeof buildPersonaSummaries> }) {
  return (
    <section className="screen persona-screen" aria-labelledby="persona-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Persona Deck</p>
          <h1 id="persona-title">내 페르소나</h1>
        </div>
        <span className="deck-count">{personas.length}종</span>
      </div>

      <div className="persona-list">
        {personas.map((persona, index) => (
          <article className="persona-card" key={persona.archetype}>
            <PersonaAvatar tone={index % 2 === 0 ? "leaf" : "coral"} accessory={persona.archetype} />
            <div className="persona-detail">
              <div className="persona-heading">
                <h2>{persona.name}</h2>
                <span>Lv.{persona.level}</span>
              </div>
              <p>{persona.evolution}</p>
              <div className="trait-row">
                {persona.traits.slice(0, 3).map((trait) => (
                  <span key={trait}>{trait}</span>
                ))}
              </div>
              <div className="item-row">
                {persona.unlockedItems.map((item) => (
                  <small key={item}>{item}</small>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RoomsView() {
  return (
    <section className="screen rooms-screen" aria-labelledby="rooms-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Together</p>
          <h1 id="rooms-title">생활방</h1>
        </div>
        <button type="button" className="icon-button" aria-label="친구 초대">
          <Users size={20} aria-hidden="true" />
        </button>
      </div>

      <article className="room-hero">
        <div>
          <p className="eyebrow">4명이 함께 성장 중</p>
          <h2>아침 루틴방</h2>
          <p>공부, 식단, 러닝 인증이 섞이며 공동 페르소나가 차분한 실행형으로 자라고 있어요.</p>
        </div>
        <PersonaAvatar tone="blue" accessory="group" />
      </article>

      <div className="room-stack">
        <RoomRow
          title="도서관 9시 클럽"
          subtitle="오늘 3명 인증"
          value="82%"
          icon={BookOpen}
        />
        <RoomRow title="저녁 산책반" subtitle="이번 주 11개 기록" value="64%" icon={Activity} />
        <RoomRow title="덜 시켜먹기" subtitle="식단 인증 연속 4일" value="71%" icon={Apple} />
      </div>
    </section>
  );
}

function ReportView({
  records,
  personas,
  insights
}: {
  records: VerificationRecord[];
  personas: ReturnType<typeof buildPersonaSummaries>;
  insights: ReturnType<typeof findHiddenHabitInsights>;
}) {
  return (
    <section className="screen report-screen" aria-labelledby="report-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Weekly Loop</p>
          <h1 id="report-title">7일 생활 리포트</h1>
        </div>
      </div>

      <div className="report-summary">
        <MetricTile label="전체 인증" value={`${records.length}`} tone="leaf" />
        <MetricTile label="대표 성장" value={`Lv.${personas[0]?.level ?? 1}`} tone="coral" />
        <MetricTile label="숨은 패턴" value={`${insights.length}`} tone="blue" />
      </div>

      <section className="insight-list" aria-labelledby="ai-habit-title">
        <h2 id="ai-habit-title">AI가 발견한 숨은 습관</h2>
        {insights.map((insight) => (
          <article className="insight-card" key={insight.title}>
            <div>
              <h3>{insight.title}</h3>
              <span>{insight.confidence}</span>
            </div>
            <p>{insight.body}</p>
            <strong>{insight.recommendation}</strong>
          </article>
        ))}
      </section>
    </section>
  );
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`metric-tile ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecordRow({ record }: { record: VerificationRecord }) {
  return (
    <article className="record-row">
      <div className={`record-icon ${record.category}`}>
        <Camera size={17} aria-hidden="true" />
      </div>
      <div>
        <h3>{getCategoryLabel(record.category)} 인증</h3>
        <p>
          {getPlaceLabel(record.placeType)}
          {record.memo ? ` · ${record.memo}` : ""}
        </p>
      </div>
      <span>+120xp</span>
    </article>
  );
}

function RoomRow({
  title,
  subtitle,
  value,
  icon: Icon
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: typeof BookOpen;
}) {
  return (
    <article className="room-row">
      <div className="room-icon">
        <Icon size={19} aria-hidden="true" />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <strong>{value}</strong>
    </article>
  );
}

function PersonaAvatar({ tone, accessory }: { tone: string; accessory: string }) {
  return (
    <div
      className={`persona-avatar ${tone} accessory-${accessory}`}
      aria-hidden="true"
      data-animated-persona="true"
    >
      <span className="avatar-orbit one" />
      <span className="avatar-orbit two" />
      <div className="avatar-core">
        <div className="avatar-head">
          <span className="avatar-ear left" />
          <span className="avatar-ear right" />
          <span className="avatar-eye left" />
          <span className="avatar-eye right" />
          <span className="avatar-cheek left" />
          <span className="avatar-cheek right" />
          <span className="avatar-mouth" />
        </div>
        <span className="avatar-arm left" />
        <span className="avatar-arm right" />
        <div className="avatar-body">
          <span className={`avatar-badge ${accessory}`} />
        </div>
        <span className="avatar-foot left" />
        <span className="avatar-foot right" />
      </div>
      <span className="avatar-shadow" />
    </div>
  );
}
