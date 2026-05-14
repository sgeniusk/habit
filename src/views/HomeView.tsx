import { Shirt, Sofa } from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { outfitItems, roomItems } from "../data/personaCatalog";
import type { PersonaSummary } from "../lib/personaEngine";
import type { PersonaCard } from "../types/habit";

export function HomeView({
  personas,
  personaSummaries,
  activePersona
}: {
  personas: PersonaCard[];
  personaSummaries: PersonaSummary[];
  activePersona: PersonaCard;
}) {
  const activeSummary = personaSummaries.find(
    (summary) => summary.archetype === activePersona.category
  );
  const activeLevel = activeSummary?.level ?? 1;
  const activeXp = activeSummary?.xp ?? 0;
  const activeProgress = activeSummary?.progress ?? 0;
  const nextLevelXp = activeXp === 0 ? 100 : activeProgress === 0 ? 100 : 100 - activeProgress;
  const unlockedRewards = activeSummary?.unlockedItems ?? [];

  function getSummaryForPersona(persona: PersonaCard) {
    return personaSummaries.find((summary) => summary.archetype === persona.category);
  }

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
          <div className="reward-meter" aria-label={`${activePersona.name} 성장 보상`}>
            <div>
              <strong>
                Lv.{activeLevel} · {activeXp}xp
              </strong>
              <span>다음 레벨까지 {nextLevelXp}xp</span>
            </div>
            <div
              className="progress-track"
              aria-label={`${activePersona.name} 보상 진행률 ${activeProgress}%`}
            >
              <span style={{ width: `${activeProgress}%` }} />
            </div>
          </div>
          <div className="trait-row">
            {(activeSummary?.traits ?? activePersona.tags).slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="reward-unlocks" aria-labelledby="home-unlocks-title">
            <h3 id="home-unlocks-title">해금된 보상</h3>
            <div className="item-row">
              {unlockedRewards.length > 0 ? (
                unlockedRewards.map((item) => <small key={item}>{item}</small>)
              ) : (
                <small>첫 스냅 보상 대기</small>
              )}
            </div>
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
          {personas.map((persona) => {
            const summary = getSummaryForPersona(persona);
            const level = summary?.level ?? 1;
            const xp = summary?.xp ?? 0;

            return (
              <article className="persona-card" key={persona.id}>
                <PersonaAvatar tone={persona.tone} accessory={persona.accessory} />
                <div className="persona-detail">
                  <div className="persona-heading">
                    <h3>
                      {persona.id === activePersona.id ? `대표 · ${persona.name}` : persona.name}
                    </h3>
                    <span>Lv.{level}</span>
                  </div>
                  <p>{summary?.evolution ?? "생활 스냅을 기다리는 중"}</p>
                  <div className="persona-xp-row">
                    <span>{xp}xp</span>
                    <span>{summary?.unlockedItems.length ?? 0}개 해금</span>
                  </div>
                  <div className="trait-row">
                    {(summary?.traits ?? persona.tags).slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
