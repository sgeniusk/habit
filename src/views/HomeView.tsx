import { Shirt, SlidersHorizontal, Sofa } from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { outfitItems, roomItems } from "../data/personaCatalog";
import { localize, t, type TranslationKey } from "../lib/i18n";
import { buildPersonaCompanionLine, buildPersonaIdentity } from "../lib/personaIdentity";
import type { PersonaSummary } from "../lib/personaEngine";
import type { Locale, PersonaCard, PersonaVoiceMode } from "../types/habit";

const voiceModeOptions: {
  id: PersonaVoiceMode;
  labelKey: TranslationKey;
  descriptionKey: TranslationKey;
}[] = [
  {
    id: "cute",
    labelKey: "home.voiceCute",
    descriptionKey: "home.voiceCuteDescription"
  },
  {
    id: "calm",
    labelKey: "home.voiceCalm",
    descriptionKey: "home.voiceCalmDescription"
  }
];

export function HomeView({
  locale,
  personas,
  personaSummaries,
  activePersona,
  selectedRoomItem,
  selectedOutfitItem,
  personaNickname,
  personaVoiceMode,
  onRoomItemChange,
  onOutfitItemChange,
  onPersonaNicknameChange,
  onPersonaVoiceModeChange
}: {
  locale: Locale;
  personas: PersonaCard[];
  personaSummaries: PersonaSummary[];
  activePersona: PersonaCard;
  selectedRoomItem: string;
  selectedOutfitItem: string;
  personaNickname: string;
  personaVoiceMode: PersonaVoiceMode;
  onRoomItemChange: (item: string) => void;
  onOutfitItemChange: (item: string) => void;
  onPersonaNicknameChange: (nickname: string) => void;
  onPersonaVoiceModeChange: (mode: PersonaVoiceMode) => void;
}) {
  const activeSummary = personaSummaries.find(
    (summary) => summary.archetype === activePersona.category
  );
  const activeName = localize(activePersona.name, locale);
  const activeActivity = localize(activePersona.activity, locale);
  const activeLevel = activeSummary?.level ?? 1;
  const activeXp = activeSummary?.xp ?? 0;
  const activeProgress = activeSummary?.progress ?? 0;
  const nextLevelXp = activeXp === 0 ? 100 : activeProgress === 0 ? 100 : 100 - activeProgress;
  const unlockedRewards = activeSummary?.unlockedItems ?? [];
  const personaIdentity = buildPersonaIdentity({
    category: activePersona.category,
    nickname: personaNickname,
    level: activeLevel,
    xp: activeXp
  });
  const companionLine = buildPersonaCompanionLine({
    category: activePersona.category,
    nickname: personaNickname,
    level: activeLevel,
    voiceMode: personaVoiceMode
  });

  function getSummaryForPersona(persona: PersonaCard) {
    return personaSummaries.find((summary) => summary.archetype === persona.category);
  }

  return (
    <section className="screen persona-screen" aria-labelledby="home-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Home</p>
          <h1 id="home-title">{t(locale, "home.title")}</h1>
        </div>
        <span className="deck-count">{`${personas.length}${t(locale, "home.deckCountUnit")}`}</span>
      </div>

      <section className="home-stage" aria-label={activeName}>
        <div className="room-scene">
          <span className="room-window" />
          <span className="room-rug" />
          <span className="room-desk" />
          <span className="room-selected-prop">{selectedRoomItem}</span>
          <span className="outfit-selected-prop">{selectedOutfitItem}</span>
          <PersonaAvatar tone={activePersona.tone} accessory={activePersona.accessory} />
        </div>
        <div className="activity-panel">
          <p className="eyebrow">{t(locale, "home.activityEyebrow")}</p>
          <h2 id="activity-title">{activeName}</h2>
          <strong className="nickname-title">{personaIdentity.displayName}</strong>
          <div className="persona-identity-row" aria-label={t(locale, "home.identityRowLabel")}>
            <span>{`${t(locale, "home.nicknameSubtitle")} · ${personaIdentity.displayName}`}</span>
            <span>{`${t(locale, "home.roleSubtitle")} · ${personaIdentity.roleLabel}`}</span>
          </div>
          <label className="nickname-field">
            <span>{t(locale, "home.nicknameField")}</span>
            <input
              aria-label={t(locale, "home.nicknameField")}
              value={personaNickname}
              onChange={(event) => onPersonaNicknameChange(event.target.value)}
              placeholder={t(locale, "home.nicknamePlaceholder")}
            />
          </label>
          <p className="persona-talk">{companionLine}</p>
          <p>{activeActivity}</p>
          <div
            className="reward-meter"
            aria-label={`${activeName} ${t(locale, "home.rewardAreaLabel")}`}
          >
            <div>
              <strong>
                Lv.{activeLevel} · {activeXp}xp
              </strong>
              <span>{`${t(locale, "home.nextLevel")} ${nextLevelXp}xp`}</span>
            </div>
            <div
              className="progress-track"
              aria-label={`${activeName} ${t(locale, "home.progressAreaLabel")} ${activeProgress}%`}
            >
              <span style={{ width: `${activeProgress}%` }} />
            </div>
          </div>
          <strong className="evolution-badge">{`${t(locale, "home.evolutionLabel")} · ${personaIdentity.upgradeLabel}`}</strong>
          <div className="trait-row">
            {(activeSummary?.traits ?? activePersona.tags).slice(0, 4).map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="reward-unlocks" aria-labelledby="home-unlocks-title">
            <h3 id="home-unlocks-title">{t(locale, "home.unlocks")}</h3>
            <div className="item-row">
              {unlockedRewards.length > 0 ? (
                unlockedRewards.map((item) => <small key={item}>{item}</small>)
              ) : (
                <small>{t(locale, "home.unlocksEmpty")}</small>
              )}
            </div>
          </div>
          <div className="decor-applied-row" aria-label={t(locale, "home.appliedDecorLabel")}>
            <span>{`${t(locale, "home.roomSubtitle")} · ${selectedRoomItem}`}</span>
            <span>{`${t(locale, "home.outfitSubtitle")} · ${selectedOutfitItem}`}</span>
          </div>
        </div>
      </section>

      <div className="decor-grid">
        <section className="decor-card" aria-labelledby="room-decor-title">
          <div>
            <Sofa size={20} aria-hidden="true" />
            <h2 id="room-decor-title">{t(locale, "home.roomDecor")}</h2>
          </div>
          <div className="item-row">
            {roomItems.map((item) => (
              <button
                key={item}
                type="button"
                className={selectedRoomItem === item ? "decor-option is-selected" : "decor-option"}
                aria-pressed={selectedRoomItem === item}
                onClick={() => onRoomItemChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
        <section className="decor-card" aria-labelledby="persona-decor-title">
          <div>
            <Shirt size={20} aria-hidden="true" />
            <h2 id="persona-decor-title">{t(locale, "home.outfitDecor")}</h2>
          </div>
          <div className="item-row">
            {outfitItems.map((item) => (
              <button
                key={item}
                type="button"
                className={
                  selectedOutfitItem === item ? "decor-option is-selected" : "decor-option"
                }
                aria-pressed={selectedOutfitItem === item}
                onClick={() => onOutfitItemChange(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>
        <section className="decor-card voice-card" aria-labelledby="persona-voice-title">
          <div>
            <SlidersHorizontal size={20} aria-hidden="true" />
            <h2 id="persona-voice-title">{t(locale, "home.voiceTitle")}</h2>
          </div>
          <div className="voice-option-row">
            {voiceModeOptions.map((option) => {
              const label = t(locale, option.labelKey);
              const description = t(locale, option.descriptionKey);
              return (
                <button
                  key={option.id}
                  type="button"
                  className={
                    personaVoiceMode === option.id ? "voice-option is-selected" : "voice-option"
                  }
                  aria-label={label}
                  aria-pressed={personaVoiceMode === option.id}
                  onClick={() => onPersonaVoiceModeChange(option.id)}
                >
                  <strong>{label}</strong>
                  <small>{description}</small>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="choice-section" aria-labelledby="persona-list-title">
        <h2 id="persona-list-title">{t(locale, "home.personaList")}</h2>
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
                      {persona.id === activePersona.id
                        ? `${t(locale, "home.featuredPrefix")} · ${localize(persona.name, locale)}`
                        : localize(persona.name, locale)}
                    </h3>
                    <span>Lv.{level}</span>
                  </div>
                  <p>{summary?.evolution ?? t(locale, "home.evolutionPending")}</p>
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
