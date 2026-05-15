import { useEffect, useMemo, useState } from "react";
import {
  filterOptions,
  findPersonaByCategory,
  personaCatalog,
  stickerOptions,
  tabs
} from "./data/personaCatalog";
import { initialRecords } from "./data/sampleRecords";
import {
  defaultLocale,
  formatSnapCountLabel,
  getTabLabel,
  localeOptions,
  normalizeLocale,
  t
} from "./lib/i18n";
import { getWebImagePickerAdapter, type ImagePickerAdapter } from "./lib/adapters/imagePicker";
import { getWebShareAdapter, type ShareAdapter } from "./lib/adapters/share";
import { getWebSnapRenderer, type SnapRenderer } from "./lib/adapters/snapRenderer";
import {
  loadOnboardingDismissed,
  loadSnapRecords,
  loadUserPreferences,
  saveOnboardingDismissed,
  saveSnapRecords,
  saveUserPreferences,
  type PersistenceWriteOutcome
} from "./lib/persistence";
import { buildPersonaIdentity, defaultPersonaNicknames } from "./lib/personaIdentity";
import { buildPersonaSummaries, findHiddenHabitInsights } from "./lib/personaEngine";
import type {
  HabitCategory,
  Locale,
  PersonaDecorSelection,
  PersonaStampPosition,
  PersonaVoiceMode,
  PlaceType,
  ProofStampId,
  SnapRecord,
  TabId,
  UserPreferenceState
} from "./types/habit";
import { HomeView } from "./views/HomeView";
import { MeetView } from "./views/MeetView";
import { ReportView } from "./views/ReportView";
import { SnapView } from "./views/SnapView";
import { TodayView } from "./views/TodayView";

const defaultSnapRenderer: SnapRenderer = getWebSnapRenderer();
const defaultShareAdapter: ShareAdapter = getWebShareAdapter((blob, filename) =>
  defaultSnapRenderer.downloadSnap({ blob, filename })
);
const defaultImagePicker: ImagePickerAdapter = getWebImagePickerAdapter();

const defaultDecorSelections = Object.fromEntries(
  personaCatalog.map((persona) => [
    persona.id,
    { roomItem: persona.roomItem, outfit: persona.outfit }
  ])
) as Record<string, PersonaDecorSelection>;

const defaultUserPreferences: UserPreferenceState = {
  decorSelections: defaultDecorSelections,
  personaNicknames: defaultPersonaNicknames,
  selectedProofStamps: ["time", "count", "persona"],
  personaStampPosition: "bottom-right",
  personaVoiceMode: "cute",
  locale: defaultLocale
};

export default function App() {
  const initialRoute = getInitialRoute();
  const [activeTab, setActiveTab] = useState<TabId>(initialRoute.activeTab);
  const [inviteToken, setInviteToken] = useState(initialRoute.inviteToken);
  const [records, setRecords] = useState(() => loadSnapRecords(initialRecords));
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => loadOnboardingDismissed());
  const [userPreferences, setUserPreferences] = useState(() =>
    loadUserPreferences(defaultUserPreferences)
  );
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>("study");
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>("library");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSticker, setSelectedSticker] = useState(stickerOptions[0]);
  const [memo, setMemo] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [shareStatus, setShareStatus] = useState("");
  const [shareError, setShareError] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);
  const [savedFeedbackVisible, setSavedFeedbackVisible] = useState(false);
  const [storageWarning, setStorageWarning] = useState<PersistenceWriteOutcome>("ok");
  const locale = normalizeLocale(userPreferences.locale);
  const decorSelections = userPreferences.decorSelections;
  const selectedProofStamps = userPreferences.selectedProofStamps;
  const personaStampPosition = userPreferences.personaStampPosition;
  const personaVoiceMode = userPreferences.personaVoiceMode;
  const personaNicknames = useMemo(
    () => ({
      ...defaultPersonaNicknames,
      ...userPreferences.personaNicknames
    }),
    [userPreferences.personaNicknames]
  );

  const personas = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
  const activeHomePersona = useMemo(
    () => findPersonaByCategory(records[0]?.category ?? "study"),
    [records]
  );
  const snapPersona = useMemo(() => findPersonaByCategory(selectedCategory), [selectedCategory]);
  const snapPersonaIdentity = useMemo(
    () =>
      buildPersonaIdentity({
        category: selectedCategory,
        nickname: personaNicknames[selectedCategory],
        level: 1,
        xp: 0
      }),
    [personaNicknames, selectedCategory]
  );
  const activeDecor = decorSelections[activeHomePersona.id] ?? {
    roomItem: activeHomePersona.roomItem,
    outfit: activeHomePersona.outfit
  };
  const todayCount = Math.min(3, records.length - initialRecords.length + 1);
  const snapTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
  const nextSnapCountLabel = formatSnapCountLabel(locale, todayCount);

  useEffect(() => {
    const outcome = saveSnapRecords(records);
    if (outcome !== "ok") {
      queueMicrotask(() => setStorageWarning(outcome));
    }
  }, [records]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const outcome = saveUserPreferences(userPreferences);
    if (outcome !== "ok") {
      queueMicrotask(() => setStorageWarning(outcome));
    }
  }, [userPreferences]);

  function saveRecord() {
    const nextRecord: SnapRecord = {
      id: createRecordId(),
      category: selectedCategory,
      placeType: selectedPlace,
      memo: memo || photoName || t(locale, "snap.emptyPhoto"),
      filter: selectedFilter,
      sticker: selectedSticker,
      imageUrl: photoPreviewUrl || undefined,
      proofStamps: selectedProofStamps,
      createdAt: new Date().toISOString()
    };

    setRecords((current) => [nextRecord, ...current]);
    setMemo("");
    setPhotoName(t(locale, "snap.savedPhoto"));
    setPhotoPreviewUrl("");
    setPhotoError("");
    setShareStatus("");
    setShareError("");
    setSavedPulse(true);
    setSavedFeedbackVisible(true);
    window.setTimeout(() => setSavedPulse(false), 800);
  }

  async function handlePhotoSelect(file?: File) {
    if (!file) {
      return;
    }

    setSavedFeedbackVisible(false);

    if (!defaultImagePicker.isImageMimeType(file.type)) {
      setPhotoPreviewUrl("");
      setPhotoName("");
      setPhotoError(t(locale, "snap.imageOnlyError"));
      setShareStatus("");
      setShareError("");
      return;
    }

    setPhotoName(file.name);

    try {
      const picked = await defaultImagePicker.processFile(file);
      setPhotoPreviewUrl(picked.dataUrl);
      setPhotoError("");
      setShareStatus("");
      setShareError("");
    } catch {
      setPhotoPreviewUrl("");
      setPhotoError(t(locale, "snap.imageLoadError"));
      setShareStatus("");
      setShareError("");
    }
  }

  async function exportShareImage() {
    if (!photoPreviewUrl) {
      setShareStatus("");
      setShareError(t(locale, "snap.shareNoPhoto"));
      return;
    }

    setShareError("");
    setShareStatus(t(locale, "snap.sharePreparing"));

    try {
      const rendered = await defaultSnapRenderer.renderSnap({
        imageUrl: photoPreviewUrl,
        photoName: photoName || "snap",
        filter: selectedFilter,
        sticker: selectedSticker,
        proofStamps: selectedProofStamps,
        personaStampPosition,
        personaDisplayName: snapPersonaIdentity.displayName,
        personaRoleLabel: snapPersonaIdentity.roleLabel,
        snapTimeLabel,
        snapCountLabel: nextSnapCountLabel,
        locale
      });

      await defaultShareAdapter.shareSnap({
        blob: rendered.blob,
        filename: rendered.filename,
        title: t(locale, "snap.title"),
        text: memo || photoName
      });
      setShareStatus(t(locale, "snap.shareReady"));
    } catch {
      setShareStatus("");
      setShareError(t(locale, "snap.shareError"));
    }
  }

  function updateActiveDecor(nextDecor: Partial<PersonaDecorSelection>) {
    setUserPreferences((current) => {
      const currentDecor = current.decorSelections[activeHomePersona.id] ?? {
        roomItem: activeHomePersona.roomItem,
        outfit: activeHomePersona.outfit
      };

      return {
        ...current,
        decorSelections: {
          ...current.decorSelections,
          [activeHomePersona.id]: {
            ...currentDecor,
            ...nextDecor
          }
        }
      };
    });
  }

  function toggleProofStamp(stampId: ProofStampId) {
    setUserPreferences((current) => ({
      ...current,
      selectedProofStamps: current.selectedProofStamps.includes(stampId)
        ? current.selectedProofStamps.filter((currentStampId) => currentStampId !== stampId)
        : [...current.selectedProofStamps, stampId]
    }));
  }

  function updatePersonaNickname(category: HabitCategory, nickname: string) {
    setUserPreferences((current) => ({
      ...current,
      personaNicknames: {
        ...current.personaNicknames,
        [category]: nickname
      }
    }));
  }

  function updatePersonaStampPosition(nextPosition: PersonaStampPosition) {
    setUserPreferences((current) => ({
      ...current,
      personaStampPosition: nextPosition
    }));
  }

  function updatePersonaVoiceMode(nextMode: PersonaVoiceMode) {
    setUserPreferences((current) => ({
      ...current,
      personaVoiceMode: nextMode
    }));
  }

  function updateLocale(nextLocale: Locale) {
    setUserPreferences((current) => ({
      ...current,
      locale: nextLocale
    }));
  }

  function dismissOnboarding() {
    setOnboardingDismissed(true);
    const outcome = saveOnboardingDismissed(true);
    if (outcome !== "ok") {
      setStorageWarning(outcome);
    }
  }

  function dismissStorageWarning() {
    setStorageWarning("ok");
  }

  return (
    <div className="app-shell">
      {storageWarning !== "ok" ? (
        <div className="storage-warning" role="alert">
          <div>
            <strong>
              {storageWarning === "quota-exceeded"
                ? "저장 공간이 거의 가득 찼어요."
                : "저장에 문제가 생겼어요."}
            </strong>
            <p>
              {storageWarning === "quota-exceeded"
                ? "오래된 스냅의 사진을 정리하면 새 기록을 안전하게 저장할 수 있어요."
                : "잠시 후 다시 시도하거나 새로고침해 보세요."}
            </p>
          </div>
          <button type="button" onClick={dismissStorageWarning} aria-label="알림 닫기">
            닫기
          </button>
        </div>
      ) : null}
      <div className="app-toolbar" aria-label={t(locale, "language.label")}>
        {localeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            className={locale === option.id ? "locale-button is-selected" : "locale-button"}
            aria-label={option.label}
            aria-pressed={locale === option.id}
            onClick={() => updateLocale(option.id)}
          >
            <span>{option.shortLabel}</span>
            <strong>{option.label}</strong>
          </button>
        ))}
      </div>
      <main className="app-main">
        {activeTab === "today" && (
          <TodayView
            locale={locale}
            records={records}
            insights={insights}
            todayCount={todayCount}
            showOnboarding={!onboardingDismissed}
            onDismissOnboarding={dismissOnboarding}
            onSnap={() => setActiveTab("snap")}
          />
        )}
        {activeTab === "snap" && (
          <SnapView
            locale={locale}
            selectedCategory={selectedCategory}
            selectedPlace={selectedPlace}
            selectedFilter={selectedFilter}
            selectedSticker={selectedSticker}
            selectedProofStamps={selectedProofStamps}
            personaStampPosition={personaStampPosition}
            snapTimeLabel={snapTimeLabel}
            snapCountLabel={nextSnapCountLabel}
            personaNickname={personaNicknames[selectedCategory]}
            personaCategory={selectedCategory}
            personaTone={snapPersona.tone}
            personaAccessory={snapPersona.accessory}
            memo={memo}
            photoName={photoName}
            photoPreviewUrl={photoPreviewUrl}
            photoError={photoError}
            shareStatus={shareStatus}
            shareError={shareError}
            savedPulse={savedPulse}
            showSaveFeedback={savedFeedbackVisible}
            onCategoryChange={setSelectedCategory}
            onPlaceChange={setSelectedPlace}
            onFilterChange={setSelectedFilter}
            onStickerChange={setSelectedSticker}
            onProofStampToggle={toggleProofStamp}
            onPersonaStampPositionChange={updatePersonaStampPosition}
            onMemoChange={setMemo}
            onPhotoSelect={handlePhotoSelect}
            onShareImage={exportShareImage}
            onSave={saveRecord}
            onSavedHome={() => {
              setInviteToken("");
              setActiveTab("home");
            }}
            onSavedReport={() => {
              setInviteToken("");
              setActiveTab("report");
            }}
            onSavedMeet={() => {
              setInviteToken("");
              setActiveTab("meet");
            }}
            onShareMeet={() => {
              setInviteToken("");
              setActiveTab("meet");
            }}
            onShareMission={() => {
              setInviteToken("");
              setActiveTab("meet");
            }}
          />
        )}
        {activeTab === "home" && (
          <HomeView
            personas={personaCatalog}
            personaSummaries={personas}
            activePersona={activeHomePersona}
            selectedRoomItem={activeDecor.roomItem}
            selectedOutfitItem={activeDecor.outfit}
            personaNickname={personaNicknames[activeHomePersona.category]}
            personaVoiceMode={personaVoiceMode}
            onRoomItemChange={(roomItem) => updateActiveDecor({ roomItem })}
            onOutfitItemChange={(outfit) => updateActiveDecor({ outfit })}
            onPersonaNicknameChange={(nickname) =>
              updatePersonaNickname(activeHomePersona.category, nickname)
            }
            onPersonaVoiceModeChange={updatePersonaVoiceMode}
          />
        )}
        {activeTab === "meet" && <MeetView records={records} inviteToken={inviteToken} />}
        {activeTab === "report" && (
          <ReportView locale={locale} records={records} personas={personas} insights={insights} />
        )}
      </main>

      <nav className="tab-bar" aria-label={t(locale, "nav.main")}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const label = getTabLabel(tab.id, locale);
          return (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "tab-button is-active" : "tab-button"}
              onClick={() => {
                setActiveTab(tab.id);

                if (tab.id !== "meet") {
                  setInviteToken("");
                }
              }}
              aria-label={label}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function getInitialRoute(): { activeTab: TabId; inviteToken: string } {
  const inviteMatch = window.location.pathname.match(/^\/invite\/([^/]+)$/);

  if (inviteMatch) {
    return {
      activeTab: "meet",
      inviteToken: decodeURIComponent(inviteMatch[1])
    };
  }

  return {
    activeTab: "today",
    inviteToken: ""
  };
}

function createRecordId(): string {
  if (
    typeof globalThis !== "undefined" &&
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `record-${globalThis.crypto.randomUUID()}`;
  }

  const randomPart = Math.random().toString(36).slice(2, 10);

  return `record-${Date.now()}-${randomPart}`;
}
