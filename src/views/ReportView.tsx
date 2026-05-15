import { useEffect, useMemo, useState } from "react";
import { Archive, CalendarDays } from "lucide-react";
import { MetricTile } from "../components/MetricTile";
import { t, type TranslationKey } from "../lib/i18n";
import {
  buildMemoryCurations,
  buildMemoryFilterOptions,
  filterMemoryCurations,
  type MemoryFilter
} from "../lib/memoryEngine";
import { loadInsightFeedback, saveInsightFeedback } from "../lib/persistence";
import {
  buildPersonaSummaries,
  findHiddenHabitInsights,
  type HabitInsightConfidence
} from "../lib/personaEngine";
import type { Locale, SnapRecord } from "../types/habit";

type ReportMode = "weekly" | "memory";

export function ReportView({
  locale,
  records,
  personas,
  insights
}: {
  locale: Locale;
  records: SnapRecord[];
  personas: ReturnType<typeof buildPersonaSummaries>;
  insights: ReturnType<typeof findHiddenHabitInsights>;
}) {
  const [reportMode, setReportMode] = useState<ReportMode>("weekly");
  const [memoryFilter, setMemoryFilter] = useState<MemoryFilter>({ type: "all", value: "전체" });
  const [insightFeedback, setInsightFeedback] = useState(() => loadInsightFeedback());
  const [insightFeedbackMessage, setInsightFeedbackMessage] = useState("");
  const softenedInsights = insightFeedback.softenedInsightTitles;
  const hiddenInsights = insightFeedback.hiddenInsightTitles;
  const weeklyRecords = useMemo(() => getRecentRecords(records, 7), [records]);
  const weeklyInsights = useMemo(() => findHiddenHabitInsights(weeklyRecords), [weeklyRecords]);
  const memoryCurations = useMemo(() => buildMemoryCurations(records, locale), [records, locale]);
  const memoryFilterOptions = useMemo(
    () => buildMemoryFilterOptions(memoryCurations),
    [memoryCurations]
  );
  const filteredMemories = useMemo(
    () => filterMemoryCurations(memoryCurations, memoryFilter),
    [memoryCurations, memoryFilter]
  );
  const activeInsights = weeklyInsights.length > 0 ? weeklyInsights : insights;
  const visibleInsights = activeInsights.filter(
    (insight) => !hiddenInsights.includes(insight.title)
  );

  useEffect(() => {
    saveInsightFeedback(insightFeedback);
  }, [insightFeedback]);

  return (
    <section className="screen report-screen" aria-labelledby="report-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">{t(locale, "report.weeklyEyebrow")}</p>
          <h1 id="report-title">{t(locale, "report.title")}</h1>
        </div>
      </div>

      <div className="mode-switch report-mode-switch" aria-label={t(locale, "report.modeAria")}>
        <button
          type="button"
          className={reportMode === "weekly" ? "is-selected" : ""}
          aria-pressed={reportMode === "weekly"}
          onClick={() => setReportMode("weekly")}
        >
          <CalendarDays size={17} aria-hidden="true" />
          {t(locale, "report.modeWeekly")}
        </button>
        <button
          type="button"
          className={reportMode === "memory" ? "is-selected" : ""}
          aria-pressed={reportMode === "memory"}
          onClick={() => setReportMode("memory")}
        >
          <Archive size={17} aria-hidden="true" />
          {t(locale, "report.modeMemory")}
        </button>
      </div>

      {reportMode === "weekly" ? (
        <>
          <div className="report-summary">
            <MetricTile
              label={t(locale, "report.metricWeeklySnap")}
              value={`${weeklyRecords.length}`}
              tone="leaf"
            />
            <MetricTile
              label={t(locale, "report.metricFeaturedGrowth")}
              value={`Lv.${personas[0]?.level ?? 1}`}
              tone="coral"
            />
            <MetricTile
              label={t(locale, "report.metricHiddenPattern")}
              value={`${visibleInsights.length}`}
              tone="blue"
            />
          </div>

          <section className="insight-list" aria-labelledby="ai-habit-title">
            <h2 id="ai-habit-title">{t(locale, "report.aiHabitTitle")}</h2>
            {insightFeedbackMessage ? (
              <p className="insight-feedback-message" role="status">
                {insightFeedbackMessage}
              </p>
            ) : null}
            {hiddenInsights.length > 0 ? (
              <div className="hidden-insight-panel">
                <strong>{formatHiddenInsightCount(locale, hiddenInsights.length)}</strong>
                <button
                  type="button"
                  onClick={() => {
                    setInsightFeedback((current) => ({
                      ...current,
                      hiddenInsightTitles: []
                    }));
                    setInsightFeedbackMessage(t(locale, "report.restoreHiddenMessage"));
                  }}
                >
                  {t(locale, "report.restoreHiddenInsights")}
                </button>
              </div>
            ) : null}
            {visibleInsights.map((insight) => {
              const isSoftened = softenedInsights.includes(insight.title);

              return (
                <article className="insight-card" key={insight.title} aria-label={insight.title}>
                  <div>
                    <h3>{insight.title}</h3>
                    <span>{t(locale, confidenceTranslationKey(insight.confidence))}</span>
                  </div>
                  <p>{isSoftened ? softenInsightBody(insight.body, locale) : insight.body}</p>
                  <p className="insight-evidence">
                    <span>{t(locale, "insight.evidenceLabel")}</span>
                    {insight.evidence}
                  </p>
                  <strong>{insight.recommendation}</strong>
                  <div className="insight-action-row">
                    <button
                      type="button"
                      onClick={() => {
                        setInsightFeedback((current) => ({
                          ...current,
                          softenedInsightTitles: current.softenedInsightTitles.includes(
                            insight.title
                          )
                            ? current.softenedInsightTitles
                            : [...current.softenedInsightTitles, insight.title]
                        }));
                        setInsightFeedbackMessage(t(locale, "report.softenedMessage"));
                      }}
                    >
                      {t(locale, "report.softenButton")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInsightFeedback((current) => ({
                          ...current,
                          hiddenInsightTitles: current.hiddenInsightTitles.includes(insight.title)
                            ? current.hiddenInsightTitles
                            : [...current.hiddenInsightTitles, insight.title]
                        }));
                        setInsightFeedbackMessage(t(locale, "report.hiddenMessage"));
                      }}
                    >
                      {t(locale, "report.hideButton")}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      ) : (
        <section className="memory-section" aria-labelledby="memory-title">
          <div>
            <p className="eyebrow">{t(locale, "report.memoryEyebrow")}</p>
            <h2 id="memory-title">{t(locale, "report.memoryTitle")}</h2>
          </div>
          <p>{t(locale, "report.memoryDescription")}</p>
          <div className="memory-filter-panel" aria-label={t(locale, "report.memoryFilterAria")}>
            <div>
              <h3>{t(locale, "report.memoryFilterTitle")}</h3>
              <span>{`${t(locale, "report.memoryFilterPrefix")}: ${formatMemoryFilterLabel(memoryFilter, locale)}`}</span>
            </div>
            <div className="memory-filter-row">
              <button
                type="button"
                className={memoryFilter.type === "all" ? "is-selected" : ""}
                aria-pressed={memoryFilter.type === "all"}
                onClick={() =>
                  setMemoryFilter({ type: "all", value: t(locale, "report.memoryFilterAll") })
                }
              >
                {t(locale, "report.memoryFilterAll")}
              </button>
              {memoryFilterOptions.months.map((month) => (
                <button
                  type="button"
                  key={`month-${month}`}
                  className={isActiveFilter(memoryFilter, "month", month) ? "is-selected" : ""}
                  aria-pressed={isActiveFilter(memoryFilter, "month", month)}
                  onClick={() => setMemoryFilter({ type: "month", value: month })}
                >
                  {`${t(locale, "report.memoryFilterMonth")} · ${month}`}
                </button>
              ))}
              {memoryFilterOptions.places.map((place) => (
                <button
                  type="button"
                  key={`place-${place}`}
                  className={isActiveFilter(memoryFilter, "place", place) ? "is-selected" : ""}
                  aria-pressed={isActiveFilter(memoryFilter, "place", place)}
                  onClick={() => setMemoryFilter({ type: "place", value: place })}
                >
                  {`${t(locale, "report.memoryFilterPlace")} · ${place}`}
                </button>
              ))}
              {memoryFilterOptions.personas.map((persona) => (
                <button
                  type="button"
                  key={`persona-${persona}`}
                  className={isActiveFilter(memoryFilter, "persona", persona) ? "is-selected" : ""}
                  aria-pressed={isActiveFilter(memoryFilter, "persona", persona)}
                  onClick={() => setMemoryFilter({ type: "persona", value: persona })}
                >
                  {`${t(locale, "report.memoryFilterPersona")} · ${persona}`}
                </button>
              ))}
            </div>
          </div>
          <div className="memory-list">
            {filteredMemories.map((memory) => (
              <article className="memory-card" key={memory.id}>
                <div>
                  <span>{memory.period}</span>
                  <h3>{memory.title}</h3>
                </div>
                <p>{memory.summary}</p>
                <strong>{memory.prompt}</strong>
                <div className="trait-row">
                  {memory.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function confidenceTranslationKey(confidence: HabitInsightConfidence): TranslationKey {
  if (confidence === "high") {
    return "insight.confidenceHigh";
  }

  if (confidence === "low") {
    return "insight.confidenceLow";
  }

  return "insight.confidenceMedium";
}

function softenInsightBody(body: string, locale: Locale) {
  if (locale === "en") {
    const softer = body
      .replace("타입일 가능성이 큽니다.", "타입일 수도 있어요.")
      .replace("같이 있어야 오래 갑니다.", "같이 있으면 더 오래 갈 수 있어요.");
    return `As a possibility, ${softer}`;
  }

  return `가능성으로 보면, ${body
    .replace("타입일 가능성이 큽니다.", "타입일 수도 있어요.")
    .replace("같이 있어야 오래 갑니다.", "같이 있으면 더 오래 갈 수 있어요.")}`;
}

function isActiveFilter(filter: MemoryFilter, type: MemoryFilter["type"], value: string) {
  return filter.type === type && filter.value === value;
}

function formatMemoryFilterLabel(filter: MemoryFilter, locale: Locale) {
  if (filter.type === "all") {
    return t(locale, "report.memoryFilterAll");
  }

  if (filter.type === "month") {
    return `${t(locale, "report.memoryFilterMonth")} · ${filter.value}`;
  }

  if (filter.type === "place") {
    return `${t(locale, "report.memoryFilterPlace")} · ${filter.value}`;
  }

  return `${t(locale, "report.memoryFilterPersona")} · ${filter.value}`;
}

function formatHiddenInsightCount(locale: Locale, count: number) {
  if (locale === "en") {
    return `${count} hidden insight${count === 1 ? "" : "s"}`;
  }

  return `숨긴 인사이트 ${count}개`;
}

function getRecentRecords(records: SnapRecord[], days: number) {
  const latestTime = records.reduce(
    (latest, record) => Math.max(latest, new Date(record.createdAt).getTime()),
    0
  );
  const threshold = latestTime - days * 24 * 60 * 60 * 1000;

  return records.filter((record) => new Date(record.createdAt).getTime() >= threshold);
}
