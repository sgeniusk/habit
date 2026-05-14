import type { MeetSession } from "./socialEngine";

export const MEET_SESSION_STORAGE_KEY = "persona-habit:meet-session";

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
