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

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export function loadMeetSession(storage: StorageLike = window.localStorage): MeetSession | null {
  const rawSession = storage.getItem(MEET_SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as MeetSession;
  } catch {
    storage.removeItem(MEET_SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveMeetSession(session: MeetSession, storage: StorageLike = window.localStorage) {
  storage.setItem(MEET_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function loadMeetSuggestionFeedback(
  storage: StorageLike = window.localStorage
): MeetSuggestionFeedback[] {
  return loadJson<MeetSuggestionFeedback[]>(MEET_SUGGESTION_FEEDBACK_STORAGE_KEY, [], storage);
}

export function saveMeetSuggestionFeedback(
  feedback: MeetSuggestionFeedback[],
  storage: StorageLike = window.localStorage
) {
  storage.setItem(MEET_SUGGESTION_FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export function loadInsightFeedback(
  storage: StorageLike = window.localStorage
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
  storage: StorageLike = window.localStorage
) {
  storage.setItem(INSIGHT_FEEDBACK_STORAGE_KEY, JSON.stringify(feedback));
}

export function loadOnboardingDismissed(storage: StorageLike = window.localStorage) {
  return loadJson<boolean>(ONBOARDING_DISMISSED_STORAGE_KEY, false, storage);
}

export function saveOnboardingDismissed(
  dismissed: boolean,
  storage: StorageLike = window.localStorage
) {
  storage.setItem(ONBOARDING_DISMISSED_STORAGE_KEY, JSON.stringify(dismissed));
}

export function loadSnapRecords(
  fallbackRecords: SnapRecord[],
  storage: StorageLike = window.localStorage
) {
  return loadJson<SnapRecord[]>(SNAP_RECORDS_STORAGE_KEY, fallbackRecords, storage);
}

export function saveSnapRecords(records: SnapRecord[], storage: StorageLike = window.localStorage) {
  storage.setItem(SNAP_RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function loadUserPreferences(
  fallbackPreferences: UserPreferenceState,
  storage: StorageLike = window.localStorage
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
  storage: StorageLike = window.localStorage
) {
  storage.setItem(USER_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

function loadJson<T>(key: string, fallback: T, storage: StorageLike): T {
  const rawValue = storage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    storage.removeItem(key);
    return fallback;
  }
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
