import {
  Activity,
  Apple,
  BookOpen,
  Camera,
  Check,
  ChevronRight,
  Home,
  ImagePlus,
  MapPin,
  Medal,
  Moon,
  PenLine,
  Shirt,
  Sofa,
  Sparkles,
  Sun,
  Users,
  Utensils,
  Wand2
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

type TabId = "today" | "snap" | "home" | "meet" | "report";

type PersonaCard = {
  id: string;
  name: string;
  activity: string;
  place: string;
  level: number;
  tone: "leaf" | "coral" | "blue";
  accessory: string;
  tags: string[];
  roomItem: string;
  outfit: string;
};

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
  },
  {
    id: "sample-selfcare-1",
    category: "selfcare",
    placeType: "home",
    memo: "잠들기 전 스트레칭",
    createdAt: "2026-05-12T22:20:00.000+09:00"
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
  { id: "selfcare", label: "셀프케어", icon: Moon, tone: "ink" }
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
  { id: "today", label: "오늘", icon: Sun },
  { id: "snap", label: "스냅", icon: Camera },
  { id: "home", label: "집", icon: Home },
  { id: "meet", label: "모임", icon: Users },
  { id: "report", label: "리포트", icon: Medal }
];

const personaCatalog: PersonaCard[] = [
  {
    id: "dawn-learner",
    name: "새벽 학습자",
    activity: "창가 책상에서 오늘의 오답을 정리하는 중",
    place: "집 · 조용한 책상",
    level: 7,
    tone: "leaf",
    accessory: "study",
    tags: ["아침집중", "도서관형", "꾸준함"],
    roomItem: "원목 책상",
    outfit: "집중 후드"
  },
  {
    id: "routine-runner",
    name: "루틴 러너",
    activity: "러닝화를 말리고 스트레칭을 하는 중",
    place: "야외 · 성수천",
    level: 5,
    tone: "blue",
    accessory: "exercise",
    tags: ["밤러닝", "회복", "심폐루틴"],
    roomItem: "러닝 트랙 매트",
    outfit: "바람막이"
  },
  {
    id: "clean-meal",
    name: "클린식단러",
    activity: "내일 도시락 재료를 고르는 중",
    place: "집 · 작은 주방",
    level: 4,
    tone: "coral",
    accessory: "meal",
    tags: ["단백질", "물마시기", "가벼운 점심"],
    roomItem: "그린 식탁",
    outfit: "앞치마"
  },
  {
    id: "page-collector",
    name: "페이지 수집가",
    activity: "카페 구석에서 책갈피를 옮기는 중",
    place: "카페 · 창가 자리",
    level: 3,
    tone: "leaf",
    accessory: "reading",
    tags: ["독서", "조용한 몰입", "기록"],
    roomItem: "낮은 서가",
    outfit: "니트 조끼"
  },
  {
    id: "reset-maker",
    name: "방정리 장인",
    activity: "책상 위 물건을 색깔별로 정리하는 중",
    place: "집 · 정리된 방",
    level: 3,
    tone: "blue",
    accessory: "cleaning",
    tags: ["공간리셋", "정돈", "시작전 루틴"],
    roomItem: "라벨 정리함",
    outfit: "포켓 앞치마"
  },
  {
    id: "healthy-exam",
    name: "건강관리형 수험생",
    activity: "문제집 옆에 물컵과 러닝화를 두는 중",
    place: "집 · 복합 루틴존",
    level: 6,
    tone: "coral",
    accessory: "group",
    tags: ["공부+운동", "회복", "균형"],
    roomItem: "집중 스탠드",
    outfit: "트레이닝 셋업"
  }
];

const filterOptions = ["맑은빛", "필름", "집중", "새벽", "단백질"];
const stickerOptions = ["🔥 루틴", "📚 공부", "🏃 러닝", "🥗 식단", "✨ 성장"];
const roomItems = ["원목 책상", "낮은 서가", "러닝 매트", "그린 식탁"];
const outfitItems = ["집중 후드", "바람막이", "앞치마", "니트 조끼"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("today");
  const [records, setRecords] = useState(initialRecords);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>("study");
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>("library");
  const [memo, setMemo] = useState("");
  const [photoName, setPhotoName] = useState("스냅을 찍어보세요");
  const [savedPulse, setSavedPulse] = useState(false);

  const personas = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
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
    setPhotoName("새 스냅 저장됨");
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 800);
  }

  return (
    <div className="app-shell">
      <main className="app-main">
        {activeTab === "today" && (
          <TodayView
            records={records}
            insights={insights}
            todayCount={todayCount}
            onSnap={() => setActiveTab("snap")}
          />
        )}
        {activeTab === "snap" && (
          <SnapView
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
        {activeTab === "home" && <HomeView personas={personaCatalog} />}
        {activeTab === "meet" && <MeetView />}
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
  insights,
  todayCount,
  onSnap
}: {
  records: VerificationRecord[];
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

function SnapView({
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
    <section className="screen capture-screen" aria-labelledby="snap-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Snap</p>
          <h1 id="snap-title">오늘의 한 컷</h1>
        </div>
      </div>

      <label
        className={savedPulse ? "photo-drop snap-preview is-saved" : "photo-drop snap-preview"}
      >
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
        <span>찍고 꾸미면 페르소나의 하루에 바로 붙어요</span>
      </label>

      <section className="choice-section" aria-labelledby="filter-title">
        <h2 id="filter-title">필터</h2>
        <div className="filter-strip">
          {filterOptions.map((filter, index) => (
            <button key={filter} type="button" className={index === 0 ? "is-selected" : ""}>
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="sticker-title">
        <h2 id="sticker-title">스티커</h2>
        <div className="sticker-strip">
          {stickerOptions.map((sticker) => (
            <button key={sticker} type="button">
              {sticker}
            </button>
          ))}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="category-title">
        <h2 id="category-title">어떤 순간인가요?</h2>
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
        <h2 id="place-title">어디에서 남겼나요?</h2>
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
        <span>한 줄 감정</span>
        <input
          value={memo}
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder="예: 맑아서 조금 더 걸었다"
        />
      </label>

      <button type="button" className="save-button" onClick={onSave}>
        <Sparkles size={20} aria-hidden="true" />
        <span>꾸며서 올리기</span>
      </button>
    </section>
  );
}

function HomeView({ personas }: { personas: PersonaCard[] }) {
  const activePersona = personas[0];

  return (
    <section className="screen persona-screen" aria-labelledby="home-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Home</p>
          <h1 id="home-title">페르소나의 집</h1>
        </div>
        <span className="deck-count">{personas.length}종</span>
      </div>

      <section className="home-stage" aria-labelledby="activity-title">
        <div className="room-scene">
          <span className="room-window" />
          <span className="room-rug" />
          <span className="room-desk" />
          <PersonaAvatar tone={activePersona.tone} accessory={activePersona.accessory} />
        </div>
        <div className="activity-panel">
          <p className="eyebrow">지금 하는 일</p>
          <h2 id="activity-title">{activePersona.name}</h2>
          <p>{activePersona.activity}</p>
          <div className="trait-row">
            {activePersona.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <div className="decor-grid">
        <section className="decor-card" aria-labelledby="room-decor-title">
          <div>
            <Sofa size={20} aria-hidden="true" />
            <h2 id="room-decor-title">방 꾸미기</h2>
          </div>
          <div className="item-row">
            {roomItems.map((item) => (
              <small key={item}>{item}</small>
            ))}
          </div>
        </section>
        <section className="decor-card" aria-labelledby="persona-decor-title">
          <div>
            <Shirt size={20} aria-hidden="true" />
            <h2 id="persona-decor-title">페르소나 꾸미기</h2>
          </div>
          <div className="item-row">
            {outfitItems.map((item) => (
              <small key={item}>{item}</small>
            ))}
          </div>
        </section>
      </div>

      <section className="choice-section" aria-labelledby="persona-list-title">
        <h2 id="persona-list-title">보유 페르소나</h2>
        <div className="persona-list">
          {personas.map((persona) => (
            <article className="persona-card" key={persona.id}>
              <PersonaAvatar tone={persona.tone} accessory={persona.accessory} />
              <div className="persona-detail">
                <div className="persona-heading">
                  <h3>
                    {persona.id === activePersona.id ? `대표 · ${persona.name}` : persona.name}
                  </h3>
                  <span>Lv.{persona.level}</span>
                </div>
                <p>{persona.activity}</p>
                <div className="trait-row">
                  {persona.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function MeetView() {
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

      <div className="room-stack">
        <RoomRow title="도서관 9시 클럽" subtitle="오늘 3명 기록" value="82%" icon={BookOpen} />
        <RoomRow title="저녁 산책반" subtitle="이번 주 11개 스냅" value="64%" icon={Activity} />
        <RoomRow title="덜 시켜먹기" subtitle="식단 기록 연속 4일" value="71%" icon={Apple} />
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
        <MetricTile label="전체 스냅" value={`${records.length}`} tone="leaf" />
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
        <h3>{getCategoryLabel(record.category)} 스냅</h3>
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
