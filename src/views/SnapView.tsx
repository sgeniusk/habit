import { ImagePlus, Sparkles } from "lucide-react";
import {
  categoryOptions,
  filterOptions,
  placeOptions,
  stickerOptions
} from "../data/personaCatalog";
import { getPlaceLabel } from "../lib/personaEngine";
import type { HabitCategory, PlaceType } from "../types/habit";

export function SnapView({
  selectedCategory,
  selectedPlace,
  selectedFilter,
  selectedSticker,
  memo,
  photoName,
  photoPreviewUrl,
  photoError,
  savedPulse,
  onCategoryChange,
  onPlaceChange,
  onFilterChange,
  onStickerChange,
  onMemoChange,
  onPhotoSelect,
  onSave
}: {
  selectedCategory: HabitCategory;
  selectedPlace: PlaceType;
  selectedFilter: string;
  selectedSticker: string;
  memo: string;
  photoName: string;
  photoPreviewUrl: string;
  photoError: string;
  savedPulse: boolean;
  onCategoryChange: (category: HabitCategory) => void;
  onPlaceChange: (place: PlaceType) => void;
  onFilterChange: (filter: string) => void;
  onStickerChange: (sticker: string) => void;
  onMemoChange: (memo: string) => void;
  onPhotoSelect: (file?: File) => void;
  onSave: () => void;
}) {
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
          <h1 id="snap-title">오늘의 한 컷</h1>
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
            </figcaption>
          </figure>
        ) : (
          <>
            <ImagePlus size={30} aria-hidden="true" />
            <strong>{photoName}</strong>
            <span>찍고 꾸미면 페르소나의 하루에 바로 붙어요</span>
          </>
        )}
        {photoError ? (
          <small className="snap-error" role="alert">
            {photoError}
          </small>
        ) : null}
      </label>

      <section className="choice-section" aria-labelledby="filter-title">
        <h2 id="filter-title">필터</h2>
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
        <h2 id="sticker-title">스티커</h2>
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
