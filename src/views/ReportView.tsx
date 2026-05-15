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
  const memoryCurations = useMemo(() => buildMemoryCurations(records), [records]);
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
          <p className="eyebrow">Weekly Loop</p>
          <h1 id="report-title">7일 생활 리포트</h1>
        </div>
      </div>

      <div className="mode-switch report-mode-switch" aria-label="리포트 보기 방식">
        <button
          type="button"
          className={reportMode === "weekly" ? "is-selected" : ""}
          aria-pressed={reportMode === "weekly"}
          onClick={() => setReportMode("weekly")}
        >
          <CalendarDays size={17} aria-hidden="true" />
          7일 요약
        </button>
        <button
          type="button"
          className={reportMode === "memory" ? "is-selected" : ""}
          aria-pressed={reportMode === "memory"}
          onClick={() => setReportMode("memory")}
        >
          <Archive size={17} aria-hidden="true" />
          오래된 기억
        </button>
      </div>

      {reportMode === "weekly" ? (
        <>
          <div className="report-summary">
            <MetricTile label="주간 스냅" value={`${weeklyRecords.length}`} tone="leaf" />
            <MetricTile label="대표 성장" value={`Lv.${personas[0]?.level ?? 1}`} tone="coral" />
            <MetricTile label="숨은 패턴" value={`${visibleInsights.length}`} tone="blue" />
          </div>

          <section className="insight-list" aria-labelledby="ai-habit-title">
            <h2 id="ai-habit-title">AI가 발견한 숨은 습관</h2>
            {insightFeedbackMessage ? (
              <p className="insight-feedback-message" role="status">
                {insightFeedbackMessage}
              </p>
            ) : null}
            {hiddenInsights.length > 0 ? (
              <div className="hidden-insight-panel">
                <strong>숨긴 인사이트 {hiddenInsights.length}개</strong>
                <button
                  type="button"
                  onClick={() => {
                    setInsightFeedback((current) => ({
                      ...current,
                      hiddenInsightTitles: []
                    }));
                    setInsightFeedbackMessage("숨긴 인사이트를 다시 보여줄게요");
                  }}
                >
                  숨긴 인사이트 다시 보기
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
                  <p>{isSoftened ? softenInsightBody(insight.body) : insight.body}</p>
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
                        setInsightFeedbackMessage("조금 더 부드럽게 볼게요");
                      }}
                    >
                      문구 순하게
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
                        setInsightFeedbackMessage("이런 분석은 덜 보여줄게요");
                      }}
                    >
                      관심 없음
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
            <p className="eyebrow">Memory Search</p>
            <h2 id="memory-title">기억 더듬기</h2>
          </div>
          <p>오래된 스냅을 AI가 다시 꺼내서, 지금의 페르소나가 어디서 시작됐는지 묻습니다.</p>
          <div className="memory-filter-panel" aria-label="기억 필터">
            <div>
              <h3>기억 필터</h3>
              <span>필터: {formatMemoryFilterLabel(memoryFilter)}</span>
            </div>
            <div className="memory-filter-row">
              <button
                type="button"
                className={memoryFilter.type === "all" ? "is-selected" : ""}
                aria-pressed={memoryFilter.type === "all"}
                onClick={() => setMemoryFilter({ type: "all", value: "전체" })}
              >
                전체
              </button>
              {memoryFilterOptions.months.map((month) => (
                <button
                  type="button"
                  key={`month-${month}`}
                  className={isActiveFilter(memoryFilter, "month", month) ? "is-selected" : ""}
                  aria-pressed={isActiveFilter(memoryFilter, "month", month)}
                  onClick={() => setMemoryFilter({ type: "month", value: month })}
                >
                  월 · {month}
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
                  장소 · {place}
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
                  페르소나 · {persona}
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

function softenInsightBody(body: string) {
  return `가능성으로 보면, ${body
    .replace("타입일 가능성이 큽니다.", "타입일 수도 있어요.")
    .replace("같이 있어야 오래 갑니다.", "같이 있으면 더 오래 갈 수 있어요.")}`;
}

function isActiveFilter(filter: MemoryFilter, type: MemoryFilter["type"], value: string) {
  return filter.type === type && filter.value === value;
}

function formatMemoryFilterLabel(filter: MemoryFilter) {
  if (filter.type === "all") {
    return "전체";
  }

  if (filter.type === "month") {
    return `월 · ${filter.value}`;
  }

  if (filter.type === "place") {
    return `장소 · ${filter.value}`;
  }

  return `페르소나 · ${filter.value}`;
}

function getRecentRecords(records: SnapRecord[], days: number) {
  const latestTime = records.reduce(
    (latest, record) => Math.max(latest, new Date(record.createdAt).getTime()),
    0
  );
  const threshold = latestTime - days * 24 * 60 * 60 * 1000;

  return records.filter((record) => new Date(record.createdAt).getTime() >= threshold);
}
