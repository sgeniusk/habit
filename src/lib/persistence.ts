// localStorage 영속화 계층. quota/JSON.parse 실패를 모두 흡수해 호출자에 안전 신호만 돌려준다.
import { getWebStorageAdapter, type StorageAdapter } from "./adapters/storage";
import type { SnapRecord, UserPreferenceState } from "../types/habit";
import type { MeetSession, MeetSuggestionFeedback } from "./socialEngine";

export const MEET_SESSION_STORAGE_KEY = "persona-habit:meet-session";
export const MEET_SUGGESTION_FEEDBACK_STORAGE_KEY = "persona-habit:meet-suggestion-feedback";
export const INSIGHT_FEEDBACK_STORAGE_KEY = "persona-habit:insight-feedback";
export const SNAP_RECORDS_STORAGE_KEY = "persona-habit:snap-records";
export const USER_PREFERENCES_STORAGE_KEY = "persona-habit:user-preferences";
export const ONBOARDING_DISMISSED_STORAGE_KEY = "persona-habit:onboarding-guide-v2-dismissed";

export type InsightFeedbackState = {
  hiddenInsightTitles: string[];
  softenedInsightTitles: string[];
};

export type PersistenceWriteOutcome = "ok" | "quota-exceeded" | "error";

let lastWriteOutcome: PersistenceWriteOutcome = "ok";

export function getLastPersistenceWriteOutcome(): PersistenceWriteOutcome {
  return lastWriteOutcome;
}

export function resetLastPersistenceWriteOutcome() {
  lastWriteOutcome = "ok";
}

export function loadMeetSession(
  storage: StorageAdapter = getWebStorageAdapter()
): MeetSession | null {
  const rawSession = storage.getItem(MEET_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as MeetSession;
  } catch {
    safeRemove(storage, MEET_SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveMeetSession(
  session: MeetSession,
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, MEET_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadMeetSuggestionFeedback(
  storage: StorageAdapter = getWebStorageAdapter()
): MeetSuggestionFeedback[] {
  return loadJson<MeetSuggestionFeedback[]>(MEET_SUGGESTION_FEEDBACK_STORAGE_KEY, [], storage);
}

export function saveMeetSuggestionFeedback(
  feedback: MeetSuggestionFeedback[],
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, MEET_SUGGESTION_FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export function loadInsightFeedback(
  storage: StorageAdapter = getWebStorageAdapter()
): InsightFeedbackState {
  return loadJson<InsightFeedbackState>(
    INSIGHT_FEEDBACK_STORAGE_KEY,
    {
      hiddenInsightTitles: [],
      softenedInsightTitles: []
    },
    storage
  );
}

export function saveInsightFeedback(
  feedback: InsightFeedbackState,
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, INSIGHT_FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export function loadOnboardingDismissed(storage: StorageAdapter = getWebStorageAdapter()) {
  return loadJson<boolean>(ONBOARDING_DISMISSED_STORAGE_KEY, false, storage);
}

export function saveOnboardingDismissed(
  dismissed: boolean,
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, ONBOARDING_DISMISSED_STORAGE_KEY, JSON.stringify(dismissed));
}

export function loadSnapRecords(
  fallbackRecords: SnapRecord[],
  storage: StorageAdapter = getWebStorageAdapter()
) {
  const records = loadJson<SnapRecord[]>(SNAP_RECORDS_STORAGE_KEY, fallbackRecords, storage);

  if (!Array.isArray(records)) {
    return fallbackRecords;
  }

  const guarded = records.filter(isSnapRecordShape);

  if (guarded.length !== records.length) {
    if (guarded.length === 0) {
      safeRemove(storage, SNAP_RECORDS_STORAGE_KEY);
      return fallbackRecords;
    }
    safeSet(storage, SNAP_RECORDS_STORAGE_KEY, JSON.stringify(guarded));
  }

  return guarded;
}

export function saveSnapRecords(
  records: SnapRecord[],
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, SNAP_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function loadUserPreferences(
  fallbackPreferences: UserPreferenceState,
  storage: StorageAdapter = getWebStorageAdapter()
) {
  const storedPreferences = loadJson<Partial<UserPreferenceState>>(
    USER_PREFERENCES_STORAGE_KEY,
    fallbackPreferences,
    storage
  );

  return {
    decorSelections: {
      ...fallbackPreferences.decorSelections,
      ...(storedPreferences.decorSelections ?? {})
    },
    personaNicknames: {
      ...fallbackPreferences.personaNicknames,
      ...(storedPreferences.personaNicknames ?? {})
    },
    selectedProofStamps:
      storedPreferences.selectedProofStamps ?? fallbackPreferences.selectedProofStamps,
    personaStampPosition: isPersonaStampPosition(storedPreferences.personaStampPosition)
      ? storedPreferences.personaStampPosition
      : fallbackPreferences.personaStampPosition,
    personaVoiceMode: isPersonaVoiceMode(storedPreferences.personaVoiceMode)
      ? storedPreferences.personaVoiceMode
      : fallbackPreferences.personaVoiceMode,
    locale:
      storedPreferences.locale === "ko" || storedPreferences.locale === "en"
        ? storedPreferences.locale
        : fallbackPreferences.locale
  };
}

export function saveUserPreferences(
  preferences: UserPreferenceState,
  storage: StorageAdapter = getWebStorageAdapter()
) {
  return safeSet(storage, USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

function loadJson<T>(key: string, fallback: T, storage: StorageAdapter): T {
  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    safeRemove(storage, key);
    return fallback;
  }
}

function safeSet(storage: StorageAdapter, key: string, value: string): PersistenceWriteOutcome {
  try {
    storage.setItem(key, value);
    lastWriteOutcome = "ok";
    return "ok";
  } catch (error) {
    if (isQuotaError(error)) {
      lastWriteOutcome = "quota-exceeded";
      return "quota-exceeded";
    }
    lastWriteOutcome = "error";
    return "error";
  }
}

function safeRemove(storage: StorageAdapter, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // 무시한다. removeItem 자체가 실패할 만한 상황은 quota 와 무관하고 안전하게 다음 시도로 넘긴다.
  }
}

function isQuotaError(error: unknown): boolean {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return (
      error.name === "QuotaExceededError" ||
      error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      error.code === 22 ||
      error.code === 1014
    );
  }

  if (error instanceof Error) {
    return error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED";
  }

  return false;
}

function isSnapRecordShape(value: unknown): value is SnapRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.category === "string" &&
    typeof record.placeType === "string" &&
    typeof record.createdAt === "string"
  );
}

function isPersonaStampPosition(
  value: unknown
): value is UserPreferenceState["personaStampPosition"] {
  return (
    value === "top-left" ||
    value === "top-right" ||
    value === "bottom-left" ||
    value === "bottom-right"
  );
}

function isPersonaVoiceMode(value: unknown): value is UserPreferenceState["personaVoiceMode"] {
  return value === "cute" || value === "calm";
}
