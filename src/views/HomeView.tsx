import { Shirt, Sofa } from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { outfitItems, roomItems } from "../data/personaCatalog";
import type { PersonaCard } from "../types/habit";

export function HomeView({
  personas,
  activePersona
}: {
  personas: PersonaCard[];
  activePersona: PersonaCard;
}) {
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
