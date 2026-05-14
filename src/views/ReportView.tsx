import { useMemo, useState } from "react";
import { Archive, CalendarDays } from "lucide-react";
import { MetricTile } from "../components/MetricTile";
import { buildMemoryCurations } from "../lib/memoryEngine";
import { buildPersonaSummaries, findHiddenHabitInsights } from "../lib/personaEngine";
import type { SnapRecord } from "../types/habit";

type ReportMode = "weekly" | "memory";

export function ReportView({
  records,
  personas,
  insights
}: {
  records: SnapRecord[];
  personas: ReturnType<typeof buildPersonaSummaries>;
  insights: ReturnType<typeof findHiddenHabitInsights>;
}) {
  const [reportMode, setReportMode] = useState<ReportMode>("weekly");
  const weeklyRecords = useMemo(() => getRecentRecords(records, 7), [records]);
  const weeklyInsights = useMemo(() => findHiddenHabitInsights(weeklyRecords), [weeklyRecords]);
  const memoryCurations = useMemo(() => buildMemoryCurations(records), [records]);
  const activeInsights = weeklyInsights.length > 0 ? weeklyInsights : insights;

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
            <MetricTile label="숨은 패턴" value={`${activeInsights.length}`} tone="blue" />
          </div>

          <section className="insight-list" aria-labelledby="ai-habit-title">
            <h2 id="ai-habit-title">AI가 발견한 숨은 습관</h2>
            {activeInsights.map((insight) => (
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
        </>
      ) : (
        <section className="memory-section" aria-labelledby="memory-title">
          <div>
            <p className="eyebrow">Memory Search</p>
            <h2 id="memory-title">기억 더듬기</h2>
          </div>
          <p>오래된 스냅을 AI가 다시 꺼내서, 지금의 페르소나가 어디서 시작됐는지 묻습니다.</p>
          <div className="memory-list">
            {memoryCurations.map((memory) => (
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

function getRecentRecords(records: SnapRecord[], days: number) {
  const latestTime = records.reduce(
    (latest, record) => Math.max(latest, new Date(record.createdAt).getTime()),
    0
  );
  const threshold = latestTime - days * 24 * 60 * 60 * 1000;

  return records.filter((record) => new Date(record.createdAt).getTime() >= threshold);
}
