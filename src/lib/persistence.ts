import type { MeetSession, MeetSuggestionFeedback } from "./socialEngine";

export const MEET_SESSION_STORAGE_KEY = "persona-habit:meet-session";
export const MEET_SUGGESTION_FEEDBACK_STORAGE_KEY = "persona-habit:meet-suggestion-feedback";
export const INSIGHT_FEEDBACK_STORAGE_KEY = "persona-habit:insight-feedback";

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
