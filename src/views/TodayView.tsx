import { useState } from "react";
import {
  Camera,
  Check,
  ChevronRight,
  CloudAlert,
  Droplets,
  Home,
  LocateFixed,
  MapPin,
  MessageCircle,
  PenLine,
  RefreshCw,
  Route,
  Send,
  Sun,
  Wand2,
  X
} from "lucide-react";
import { MetricTile } from "../components/MetricTile";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RecordRow } from "../components/RecordRow";
import { personaCatalog } from "../data/personaCatalog";
import {
  buildJournalDraft,
  buildJournalOpening,
  type JournalDraft,
  type JournalMode
} from "../lib/journalEngine";
import { t, type TranslationKey } from "../lib/i18n";
import { findHiddenHabitInsights } from "../lib/personaEngine";
import {
  buildWeatherCardState,
  buildWeatherJournalContext,
  createAutoWeatherAdapter,
  fallbackWeatherSnapshot,
  type WeatherAdapter,
  type WeatherPermissionState,
  type WeatherSnapshot
} from "../lib/weatherEngine";
import type { Locale, SnapRecord } from "../types/habit";

const defaultWeatherAdapter = createAutoWeatherAdapter();
const onboardingGuideSteps: {
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  Icon: typeof Camera;
}[] = [
  {
    titleKey: "today.onboarding.stepTodayTitle",
    bodyKey: "today.onboarding.stepTodayBody",
    Icon: LocateFixed
  },
  {
    titleKey: "today.onboarding.stepSnapTitle",
    bodyKey: "today.onboarding.stepSnapBody",
    Icon: Camera
  },
  {
    titleKey: "today.onboarding.stepRewardTitle",
    bodyKey: "today.onboarding.stepRewardBody",
    Icon: Home
  }
];

export function TodayView({
  locale,
  records,
  insights,
  todayCount,
  showOnboarding,
  onDismissOnboarding,
  onSnap,
  weatherAdapter = defaultWeatherAdapter
}: {
  locale: Locale;
  records: SnapRecord[];
  insights: ReturnType<typeof findHiddenHabitInsights>;
  todayCount: number;
  showOnboarding: boolean;
  onDismissOnboarding: () => void;
  onSnap: () => void;
  weatherAdapter?: WeatherAdapter;
}) {
  const featuredPersona = personaCatalog[0];
  const [journalMode, setJournalMode] = useState<JournalMode>("ai");
  const [journalLine, setJournalLine] = useState("");
  const [journalDrafts, setJournalDrafts] = useState<JournalDraft[]>([]);
  const [weatherPermission, setWeatherPermission] = useState<WeatherPermissionState>("granted");
  const [weatherSnapshot, setWeatherSnapshot] = useState<WeatherSnapshot>(fallbackWeatherSnapshot);
  const [weatherSyncMessage, setWeatherSyncMessage] = useState("");
  const [onboardingStep, setOnboardingStep] = useState(0);
  const weatherCard = buildWeatherCardState(weatherPermission, weatherSnapshot);
  const journalContext = buildWeatherJournalContext(weatherSnapshot);
  const currentOnboardingStep = onboardingGuideSteps[onboardingStep];
  const OnboardingIcon = currentOnboardingStep.Icon;
  const personaOpening =
    journalMode === "ai"
      ? buildJournalOpening(journalContext)
      : "네 문장 그대로 남겨둘게. 오늘의 목소리를 먼저 믿어보자.";

  async function grantWeatherPermission() {
    setWeatherPermission("loading");
    setWeatherSyncMessage("");

    try {
      setWeatherSnapshot(await weatherAdapter.loadCurrentContext());
      setWeatherPermission("granted");
      setWeatherSyncMessage("날씨 동기화 완료");
    } catch {
      setWeatherPermission("error");
    }
  }

  function denyWeatherPermission() {
    setWeatherPermission("denied");
    setWeatherSyncMessage("");
  }

  function showWeatherFailure() {
    setWeatherPermission("error");
    setWeatherSyncMessage("");
  }

  function saveJournalDraft() {
    const trimmedLine = journalLine.trim();

    if (!trimmedLine) {
      return;
    }

    setJournalDrafts((current) => [
      buildJournalDraft({
        text: trimmedLine,
        mode: journalMode,
        context: journalContext
      }),
      ...current
    ]);
    setJournalLine("");
  }

  function advanceOnboarding() {
    setOnboardingStep((currentStep) => Math.min(currentStep + 1, onboardingGuideSteps.length - 1));
  }

  function startFirstSnapMission() {
    onDismissOnboarding();
    onSnap();
  }

  return (
    <section className="screen today-screen" aria-labelledby="today-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Today</p>
          <h1 id="today-title">{t(locale, "today.title")}</h1>
        </div>
        <div className="streak-badge">
          <Check size={18} aria-hidden="true" />
          <span>6일</span>
        </div>
      </div>

      {showOnboarding ? (
        <div className="onboarding-scrim">
          <section
            className="onboarding-card onboarding-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-dialog-title"
            aria-describedby="onboarding-step-body"
          >
            <div className="onboarding-copy">
              <div className="onboarding-dialog-topline">
                <p className="eyebrow">{t(locale, "today.onboarding.eyebrow")}</p>
                <span>{`${onboardingStep + 1}/${onboardingGuideSteps.length}`}</span>
              </div>
              <h2 id="onboarding-dialog-title">{t(locale, "today.onboarding.dialogTitle")}</h2>
              <div className="onboarding-step-callout">
                <span className="onboarding-step-icon">
                  <OnboardingIcon size={22} aria-hidden="true" />
                </span>
                <div>
                  <h3>{t(locale, currentOnboardingStep.titleKey)}</h3>
                  <p id="onboarding-step-body">{t(locale, currentOnboardingStep.bodyKey)}</p>
                </div>
              </div>
            </div>
            <div className="onboarding-steps" aria-label={t(locale, "today.onboarding.title")}>
              {onboardingGuideSteps.map((step, stepIndex) => {
                const StepIcon = step.Icon;
                return (
                  <span
                    key={step.titleKey}
                    className={stepIndex === onboardingStep ? "is-active" : ""}
                  >
                    <StepIcon size={17} aria-hidden="true" />
                    {t(locale, step.titleKey)}
                  </span>
                );
              })}
            </div>
            <div className="onboarding-actions">
              {onboardingStep < onboardingGuideSteps.length - 1 ? (
                <button type="button" className="onboarding-primary" onClick={advanceOnboarding}>
                  <ChevronRight size={18} aria-hidden="true" />
                  <span>{t(locale, "today.onboarding.next")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="onboarding-primary"
                  onClick={startFirstSnapMission}
                >
                  <Camera size={18} aria-hidden="true" />
                  <span>{t(locale, "today.onboarding.primary")}</span>
                </button>
              )}
              <button type="button" className="onboarding-dismiss" onClick={onDismissOnboarding}>
                <X size={17} aria-hidden="true" />
                <span>{t(locale, "today.onboarding.skip")}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <section className="weather-card" aria-label="오늘 날씨와 지역">
        <div>
          <span className="weather-icon">
            {weatherPermission === "error" ? (
              <CloudAlert size={22} aria-hidden="true" />
            ) : (
              <Sun size={22} aria-hidden="true" />
            )}
          </span>
          <div>
            <strong>{weatherCard.title}</strong>
            <p>
              <MapPin size={14} aria-hidden="true" />
              {weatherCard.locationLabel}
            </p>
          </div>
        </div>
        <p className="weather-detail">{weatherCard.detail}</p>
        <small>{weatherCard.helperText}</small>
        <div className="weather-action-row">
          <button type="button" onClick={grantWeatherPermission}>
            {weatherPermission === "granted" ? (
              <RefreshCw size={15} aria-hidden="true" />
            ) : (
              <LocateFixed size={15} aria-hidden="true" />
            )}
            {weatherCard.actionLabel}
          </button>
          {import.meta.env.PROD ? null : (
            <>
              <button type="button" onClick={denyWeatherPermission}>
                권한 거부 미리보기
              </button>
              <button type="button" onClick={showWeatherFailure}>
                실패 상태 보기
              </button>
            </>
          )}
        </div>
        {weatherSyncMessage ? (
          <strong className="weather-sync-status">{weatherSyncMessage}</strong>
        ) : null}
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
        <span>{t(locale, "today.captureCta")}</span>
        <ChevronRight size={20} aria-hidden="true" />
      </button>

      <section className="journal-card" aria-labelledby="journal-title">
        <div>
          <p className="eyebrow">Journal</p>
          <h2 id="journal-title">오늘 기록 방식</h2>
        </div>
        <div className="mode-switch">
          <button
            type="button"
            className={journalMode === "ai" ? "is-selected" : ""}
            aria-pressed={journalMode === "ai"}
            onClick={() => setJournalMode("ai")}
          >
            <Wand2 size={17} aria-hidden="true" />
            AI랑 같이쓰기
          </button>
          <button
            type="button"
            className={journalMode === "solo" ? "is-selected" : ""}
            aria-pressed={journalMode === "solo"}
            onClick={() => setJournalMode("solo")}
          >
            <PenLine size={17} aria-hidden="true" />
            혼자 기록하기
          </button>
        </div>
        <div className="journal-context-row" aria-label="오늘 일기 맥락">
          <span>
            <Droplets size={15} aria-hidden="true" />
            습도 {journalContext.humidity}%
          </span>
          <span>
            <Route size={15} aria-hidden="true" />
            집에서 {journalContext.distanceFromHomeKm}km
          </span>
        </div>
        <div className="journal-dialogue">
          <div className="journal-persona">
            <PersonaAvatar tone={featuredPersona.tone} accessory="study" />
          </div>
          <div className="journal-bubble">
            <span>
              <MessageCircle size={15} aria-hidden="true" />
              {featuredPersona.name}
            </span>
            <p>{personaOpening}</p>
          </div>
        </div>
        <label className="journal-compose">
          <span>한 줄 일기</span>
          <textarea
            value={journalLine}
            onChange={(event) => setJournalLine(event.target.value)}
            placeholder="예: 오늘은 괜히 멀리 걷고 싶었어"
            rows={3}
          />
        </label>
        <button type="button" className="journal-send-button" onClick={saveJournalDraft}>
          <Send size={18} aria-hidden="true" />
          <span>정리해줘</span>
        </button>
        {journalDrafts.length > 0 ? (
          <div className="journal-draft-list">
            {journalDrafts.map((draft) => (
              <article className="journal-draft-card" key={`${draft.originalLine}-${draft.mode}`}>
                <p className="journal-original">{draft.originalLine}</p>
                <p className="journal-persona-line">{draft.personaLine}</p>
                <div>
                  <span>정리된 한 줄</span>
                  <strong>{draft.polishedLine}</strong>
                </div>
                <div className="trait-row">
                  {draft.moodTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : null}
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
            <RecordRow key={record.id} record={record} locale={locale} />
          ))}
        </div>
      </section>
    </section>
  );
}
