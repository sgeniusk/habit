import { MetricTile } from "../components/MetricTile";
import { buildPersonaSummaries, findHiddenHabitInsights } from "../lib/personaEngine";
import type { SnapRecord } from "../types/habit";

export function ReportView({
  records,
  personas,
  insights
}: {
  records: SnapRecord[];
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
