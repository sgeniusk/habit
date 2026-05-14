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
  loadSnapRecords,
  loadUserPreferences,
  saveSnapRecords,
  saveUserPreferences
} from "./lib/persistence";
import { defaultPersonaNicknames } from "./lib/personaIdentity";
import { buildPersonaSummaries, findHiddenHabitInsights } from "./lib/personaEngine";
import type {
  HabitCategory,
  PersonaDecorSelection,
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

const defaultDecorSelections = Object.fromEntries(
  personaCatalog.map((persona) => [
    persona.id,
    { roomItem: persona.roomItem, outfit: persona.outfit }
  ])
) as Record<string, PersonaDecorSelection>;

const defaultUserPreferences: UserPreferenceState = {
  decorSelections: defaultDecorSelections,
  personaNicknames: defaultPersonaNicknames,
  selectedProofStamps: ["time", "count", "persona"]
};

export default function App() {
  const initialRoute = getInitialRoute();
  const [activeTab, setActiveTab] = useState<TabId>(initialRoute.activeTab);
  const [inviteToken, setInviteToken] = useState(initialRoute.inviteToken);
  const [records, setRecords] = useState(() => loadSnapRecords(initialRecords));
  const [userPreferences, setUserPreferences] = useState(() =>
    loadUserPreferences(defaultUserPreferences)
  );
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>("study");
  const [selectedPlace, setSelectedPlace] = useState<PlaceType>("library");
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSticker, setSelectedSticker] = useState(stickerOptions[0]);
  const [memo, setMemo] = useState("");
  const [photoName, setPhotoName] = useState("스냅을 찍어보세요");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [savedPulse, setSavedPulse] = useState(false);
  const decorSelections = userPreferences.decorSelections;
  const selectedProofStamps = userPreferences.selectedProofStamps;
  const personaNicknames = {
    ...defaultPersonaNicknames,
    ...userPreferences.personaNicknames
  };

  const personas = useMemo(() => buildPersonaSummaries(records), [records]);
  const insights = useMemo(() => findHiddenHabitInsights(records), [records]);
  const activeHomePersona = useMemo(
    () => findPersonaByCategory(records[0]?.category ?? "study"),
    [records]
  );
  const snapPersona = useMemo(() => findPersonaByCategory(selectedCategory), [selectedCategory]);
  const activeDecor = decorSelections[activeHomePersona.id] ?? {
    roomItem: activeHomePersona.roomItem,
    outfit: activeHomePersona.outfit
  };
  const todayCount = Math.min(3, records.length - initialRecords.length + 1);
  const nextSnapCountLabel = `오늘 ${todayCount}회차`;
  const snapTimeLabel = new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());

  useEffect(() => {
    saveSnapRecords(records);
  }, [records]);

  useEffect(() => {
    saveUserPreferences(userPreferences);
  }, [userPreferences]);

  function saveRecord() {
    const nextRecord: SnapRecord = {
      id: `record-${Date.now()}`,
      category: selectedCategory,
      placeType: selectedPlace,
      memo: memo || photoName,
      filter: selectedFilter,
      sticker: selectedSticker,
      imageUrl: photoPreviewUrl || undefined,
      proofStamps: selectedProofStamps,
      createdAt: new Date().toISOString()
    };

    setRecords((current) => [nextRecord, ...current]);
    setMemo("");
    setPhotoName("새 스냅 저장됨");
    setPhotoPreviewUrl("");
    setPhotoError("");
    setSavedPulse(true);
    window.setTimeout(() => setSavedPulse(false), 800);
  }

  function handlePhotoSelect(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoPreviewUrl("");
      setPhotoName("이미지를 다시 선택해 주세요");
      setPhotoError("이미지 파일만 선택할 수 있어요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreviewUrl(reader.result);
        setPhotoError("");
      } else {
        setPhotoPreviewUrl("");
        setPhotoError("이미지를 불러오지 못했어요.");
      }
    };
    reader.onerror = () => {
      setPhotoPreviewUrl("");
      setPhotoError("이미지를 불러오지 못했어요.");
    };

    setPhotoName(file.name);
    reader.readAsDataURL(file);
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

  return (
    <div className="app-shell">
      <main className="app-main">
        {activeTab === "today" && (
          <TodayView
            records={records}
            insights={insights}
            todayCount={todayCount}
            onSnap={() => setActiveTab("snap")}
          />
        )}
        {activeTab === "snap" && (
          <SnapView
            selectedCategory={selectedCategory}
            selectedPlace={selectedPlace}
            selectedFilter={selectedFilter}
            selectedSticker={selectedSticker}
            selectedProofStamps={selectedProofStamps}
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
            savedPulse={savedPulse}
            onCategoryChange={setSelectedCategory}
            onPlaceChange={setSelectedPlace}
            onFilterChange={setSelectedFilter}
            onStickerChange={setSelectedSticker}
            onProofStampToggle={toggleProofStamp}
            onMemoChange={setMemo}
            onPhotoSelect={handlePhotoSelect}
            onSave={saveRecord}
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
            onRoomItemChange={(roomItem) => updateActiveDecor({ roomItem })}
            onOutfitItemChange={(outfit) => updateActiveDecor({ outfit })}
            onPersonaNicknameChange={(nickname) =>
              updatePersonaNickname(activeHomePersona.category, nickname)
            }
          />
        )}
        {activeTab === "meet" && <MeetView records={records} inviteToken={inviteToken} />}
        {activeTab === "report" && (
          <ReportView records={records} personas={personas} insights={insights} />
        )}
      </main>

      <nav className="tab-bar" aria-label="주요 화면">
        {tabs.map((tab) => {
          const Icon = tab.icon;
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
              aria-label={tab.label}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{tab.label}</span>
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
