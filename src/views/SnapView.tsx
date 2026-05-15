import { BarChart3, Download, Home, ImagePlus, Sparkles, Users } from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import {
  categoryOptions,
  filterOptions,
  placeOptions,
  stickerOptions
} from "../data/personaCatalog";
import {
  formatTimeProofLabel,
  getCategoryLabelForLocale,
  getPersonaStampPositionLabel,
  getPlaceLabelForLocale,
  t,
  type TranslationKey
} from "../lib/i18n";
import { buildPersonaIdentity } from "../lib/personaIdentity";
import type {
  HabitCategory,
  Locale,
  PersonaStampPosition,
  PlaceType,
  ProofStampId
} from "../types/habit";

const proofStampOptions: { id: ProofStampId; labelKey: TranslationKey }[] = [
  { id: "time", labelKey: "proof.time" },
  { id: "count", labelKey: "proof.count" },
  { id: "persona", labelKey: "proof.persona" }
];

const personaStampPositions: PersonaStampPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right"
];

export function SnapView({
  locale,
  selectedCategory,
  selectedPlace,
  selectedFilter,
  selectedSticker,
  selectedProofStamps,
  personaStampPosition,
  snapTimeLabel,
  snapCountLabel,
  personaNickname,
  personaCategory,
  personaTone,
  personaAccessory,
  memo,
  photoName,
  photoPreviewUrl,
  photoError,
  shareStatus,
  shareError,
  savedPulse,
  showSaveFeedback,
  onCategoryChange,
  onPlaceChange,
  onFilterChange,
  onStickerChange,
  onProofStampToggle,
  onPersonaStampPositionChange,
  onMemoChange,
  onPhotoSelect,
  onShareImage,
  onSave,
  onSavedHome,
  onSavedReport,
  onSavedMeet
}: {
  locale: Locale;
  selectedCategory: HabitCategory;
  selectedPlace: PlaceType;
  selectedFilter: string;
  selectedSticker: string;
  selectedProofStamps: ProofStampId[];
  personaStampPosition: PersonaStampPosition;
  snapTimeLabel: string;
  snapCountLabel: string;
  personaNickname: string;
  personaCategory: HabitCategory;
  personaTone: string;
  personaAccessory: string;
  memo: string;
  photoName: string;
  photoPreviewUrl: string;
  photoError: string;
  shareStatus: string;
  shareError: string;
  savedPulse: boolean;
  showSaveFeedback: boolean;
  onCategoryChange: (category: HabitCategory) => void;
  onPlaceChange: (place: PlaceType) => void;
  onFilterChange: (filter: string) => void;
  onStickerChange: (sticker: string) => void;
  onProofStampToggle: (stampId: ProofStampId) => void;
  onPersonaStampPositionChange: (position: PersonaStampPosition) => void;
  onMemoChange: (memo: string) => void;
  onPhotoSelect: (file?: File) => void;
  onShareImage: () => void;
  onSave: () => void;
  onSavedHome: () => void;
  onSavedReport: () => void;
  onSavedMeet: () => void;
}) {
  const personaIdentity = buildPersonaIdentity({
    category: personaCategory,
    nickname: personaNickname,
    level: 1,
    xp: 0
  });
  const previewClassName = [
    "photo-drop snap-preview",
    savedPulse ? "is-saved" : "",
    photoPreviewUrl ? "has-image" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="screen capture-screen" aria-labelledby="snap-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">Snap</p>
          <h1 id="snap-title">{t(locale, "snap.title")}</h1>
        </div>
      </div>

      <label className={previewClassName}>
        <input
          aria-label="사진 선택"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => {
            const file = event.target.files?.[0];
            onPhotoSelect(file);
            event.currentTarget.value = "";
          }}
        />
        {photoPreviewUrl ? (
          <figure
            className={`snap-image-frame ${getPreviewFilterClass(selectedFilter)}`}
            data-filter={selectedFilter}
          >
            <img src={photoPreviewUrl} alt={`${photoName} 미리보기`} />
            <figcaption>
              <span className="filter-badge">{selectedFilter} 필터</span>
              <span className="sticker-badge" aria-label={`선택 스티커 ${selectedSticker}`}>
                {selectedSticker}
              </span>
              {selectedProofStamps.includes("time") ? (
                <span className="proof-badge time">
                  {formatTimeProofLabel(locale, snapTimeLabel)}
                </span>
              ) : null}
              {selectedProofStamps.includes("count") ? (
                <span className="proof-badge count">{snapCountLabel}</span>
              ) : null}
              {selectedProofStamps.includes("persona") ? (
                <div
                  className={`persona-proof-stamp position-${personaStampPosition}`}
                  aria-label={`페르소나 도장 ${personaIdentity.displayName}`}
                >
                  <div className="mini-persona-wrap">
                    <PersonaAvatar tone={personaTone} accessory={personaAccessory} />
                  </div>
                  <strong>{personaIdentity.displayName}와 함께해요</strong>
                  <small>직업 · {personaIdentity.roleLabel}</small>
                </div>
              ) : null}
            </figcaption>
          </figure>
        ) : (
          <>
            <ImagePlus size={30} aria-hidden="true" />
            <strong>{photoName || t(locale, "snap.emptyPhoto")}</strong>
            <span>{t(locale, "snap.photoHelp")}</span>
          </>
        )}
        {photoError ? (
          <small className="snap-error" role="alert">
            {photoError}
          </small>
        ) : null}
      </label>

      <section className="choice-section" aria-labelledby="filter-title">
        <h2 id="filter-title">{t(locale, "snap.filter")}</h2>
        <div className="filter-strip">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              className={selectedFilter === filter ? "is-selected" : ""}
              onClick={() => onFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="sticker-title">
        <h2 id="sticker-title">{t(locale, "snap.sticker")}</h2>
        <div className="sticker-strip">
          {stickerOptions.map((sticker) => (
            <button
              key={sticker}
              type="button"
              className={selectedSticker === sticker ? "is-selected" : ""}
              onClick={() => onStickerChange(sticker)}
            >
              {sticker}
            </button>
          ))}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="proof-stamp-title">
        <h2 id="proof-stamp-title">{t(locale, "snap.proofStamp")}</h2>
        <div className="proof-stamp-strip">
          {proofStampOptions.map((stamp) => (
            <button
              key={stamp.id}
              type="button"
              className={selectedProofStamps.includes(stamp.id) ? "is-selected" : ""}
              aria-pressed={selectedProofStamps.includes(stamp.id)}
              onClick={() => onProofStampToggle(stamp.id)}
            >
              {t(locale, stamp.labelKey)}
            </button>
          ))}
        </div>
        {selectedProofStamps.includes("persona") ? (
          <div className="stamp-position-panel" aria-label={t(locale, "stampPosition.title")}>
            <strong>{t(locale, "stampPosition.title")}</strong>
            <div className="stamp-position-grid">
              {personaStampPositions.map((position) => (
                <button
                  key={position}
                  type="button"
                  className={personaStampPosition === position ? "is-selected" : ""}
                  aria-pressed={personaStampPosition === position}
                  onClick={() => onPersonaStampPositionChange(position)}
                >
                  {getPersonaStampPositionLabel(position, locale)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="choice-section" aria-labelledby="category-title">
        <h2 id="category-title">{t(locale, "snap.category")}</h2>
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
                <span>{getCategoryLabelForLocale(option.id, locale)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="choice-section" aria-labelledby="place-title">
        <h2 id="place-title">{t(locale, "snap.place")}</h2>
        <div className="place-scroller">
          {placeOptions.map((place) => (
            <button
              key={place}
              type="button"
              className={selectedPlace === place ? "place-chip is-selected" : "place-chip"}
              onClick={() => onPlaceChange(place)}
            >
              {getPlaceLabelForLocale(place, locale)}
            </button>
          ))}
        </div>
      </section>

      <label className="memo-field">
        <span>{t(locale, "snap.memo")}</span>
        <input
          value={memo}
          onChange={(event) => onMemoChange(event.target.value)}
          placeholder={t(locale, "snap.memoPlaceholder")}
        />
      </label>

      <div className="snap-action-row">
        <button
          type="button"
          className="share-image-button"
          disabled={!photoPreviewUrl}
          onClick={onShareImage}
        >
          <Download size={19} aria-hidden="true" />
          <span>{t(locale, "snap.shareImage")}</span>
        </button>
        <button type="button" className="save-button" onClick={onSave}>
          <Sparkles size={20} aria-hidden="true" />
          <span>{t(locale, "snap.save")}</span>
        </button>
      </div>
      <small className={shareError ? "share-image-help is-error" : "share-image-help"}>
        {shareError || shareStatus || t(locale, "snap.shareHelp")}
      </small>

      {showSaveFeedback && (
        <section className="save-feedback-card" aria-labelledby="save-feedback-title">
          <div>
            <p className="eyebrow">Saved</p>
            <h2 id="save-feedback-title">{t(locale, "snap.saveFeedback.title")}</h2>
            <p>{t(locale, "snap.saveFeedback.body")}</p>
          </div>
          <div className="save-feedback-actions">
            <button type="button" onClick={onSavedHome}>
              <Home size={18} aria-hidden="true" />
              <span>{t(locale, "snap.saveFeedback.home")}</span>
            </button>
            <button type="button" onClick={onSavedReport}>
              <BarChart3 size={18} aria-hidden="true" />
              <span>{t(locale, "snap.saveFeedback.report")}</span>
            </button>
            <button type="button" onClick={onSavedMeet}>
              <Users size={18} aria-hidden="true" />
              <span>{t(locale, "snap.saveFeedback.meet")}</span>
            </button>
          </div>
        </section>
      )}
    </section>
  );
}

function getPreviewFilterClass(filter: string) {
  const filterClasses: Record<string, string> = {
    맑은빛: "filter-bright",
    필름: "filter-film",
    집중: "filter-focus",
    새벽: "filter-dawn",
    단백질: "filter-protein"
  };

  return filterClasses[filter] ?? "filter-bright";
}
