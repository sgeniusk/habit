// 말투 톤, 인사이트 표현 강도 같은 사용자 설정을 AsyncStorage 에 영속화한다.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PersonaVoiceMode } from "../types/habit";
import { cancelDailyReminder, scheduleDailyReminder } from "./notifications";

const PREFERENCES_KEY = "formi:preferences";

export type Preferences = {
  voiceMode: PersonaVoiceMode;
  insightSoften: boolean;
  roomItem: string;
  outfit: string;
  roomScene: string;
  roomDecor: string[];
  roomMood: string;
  // 매일 스냅 알림 설정
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
};

const defaultPreferences: Preferences = {
  voiceMode: "cute",
  insightSoften: true,
  roomItem: "원목 책상",
  outfit: "집중 후드",
  roomScene: "room-warm",
  roomDecor: ["item-plant", "item-rug"],
  roomMood: "day",
  reminderEnabled: false,
  reminderHour: 21,
  reminderMinute: 0
};

type PreferencesContextValue = {
  preferences: Preferences;
  loaded: boolean;
  setVoiceMode(mode: PersonaVoiceMode): void;
  setInsightSoften(value: boolean): void;
  setRoomItem(item: string): void;
  setOutfit(item: string): void;
  setRoomScene(scene: string): void;
  toggleRoomDecor(decor: string): void;
  setRoomMood(mood: string): void;
  setReminderEnabled(value: boolean): void;
  setReminderTime(hour: number, minute: number): void;
};

const Context = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PREFERENCES_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          setPreferences(mergePreferences(raw));
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)).catch(() => {
      // 저장 실패는 다음 변경에서 자연 재시도
    });
  }, [preferences, loaded]);

  const setVoiceMode = useCallback((mode: PersonaVoiceMode) => {
    setPreferences((current) => ({ ...current, voiceMode: mode }));
  }, []);

  const setInsightSoften = useCallback((value: boolean) => {
    setPreferences((current) => ({ ...current, insightSoften: value }));
  }, []);

  const setRoomItem = useCallback((item: string) => {
    setPreferences((current) => ({ ...current, roomItem: item }));
  }, []);

  const setOutfit = useCallback((item: string) => {
    setPreferences((current) => ({ ...current, outfit: item }));
  }, []);

  const setRoomScene = useCallback((scene: string) => {
    setPreferences((current) => ({ ...current, roomScene: scene }));
  }, []);

  const toggleRoomDecor = useCallback((decor: string) => {
    setPreferences((current) => ({
      ...current,
      roomDecor: current.roomDecor.includes(decor)
        ? current.roomDecor.filter((item) => item !== decor)
        : [...current.roomDecor, decor]
    }));
  }, []);

  const setRoomMood = useCallback((mood: string) => {
    setPreferences((current) => ({ ...current, roomMood: mood }));
  }, []);

  const setReminderEnabled = useCallback((value: boolean) => {
    setPreferences((current) => ({ ...current, reminderEnabled: value }));
  }, []);

  const setReminderTime = useCallback((hour: number, minute: number) => {
    setPreferences((current) => ({ ...current, reminderHour: hour, reminderMinute: minute }));
  }, []);

  // 알림 설정이 바뀌면 기기 예약을 다시 맞춘다.
  useEffect(() => {
    if (!loaded) return;
    if (preferences.reminderEnabled) {
      scheduleDailyReminder(preferences.reminderHour, preferences.reminderMinute);
    } else {
      cancelDailyReminder();
    }
  }, [
    loaded,
    preferences.reminderEnabled,
    preferences.reminderHour,
    preferences.reminderMinute
  ]);

  return (
    <Context.Provider
      value={{
        preferences,
        loaded,
        setVoiceMode,
        setInsightSoften,
        setRoomItem,
        setOutfit,
        setRoomScene,
        toggleRoomDecor,
        setRoomMood,
        setReminderEnabled,
        setReminderTime
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("PreferencesProvider 가 트리 위에 없습니다.");
  }
  return ctx;
}

function mergePreferences(raw: string): Preferences {
  try {
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      voiceMode: parsed.voiceMode === "calm" ? "calm" : "cute",
      insightSoften: typeof parsed.insightSoften === "boolean" ? parsed.insightSoften : true,
      roomItem:
        typeof parsed.roomItem === "string" ? parsed.roomItem : defaultPreferences.roomItem,
      outfit: typeof parsed.outfit === "string" ? parsed.outfit : defaultPreferences.outfit,
      roomScene:
        typeof parsed.roomScene === "string" ? parsed.roomScene : defaultPreferences.roomScene,
      roomDecor: Array.isArray(parsed.roomDecor)
        ? parsed.roomDecor.filter((item): item is string => typeof item === "string")
        : defaultPreferences.roomDecor,
      roomMood:
        typeof parsed.roomMood === "string" ? parsed.roomMood : defaultPreferences.roomMood,
      reminderEnabled:
        typeof parsed.reminderEnabled === "boolean"
          ? parsed.reminderEnabled
          : defaultPreferences.reminderEnabled,
      reminderHour:
        typeof parsed.reminderHour === "number" &&
        parsed.reminderHour >= 0 &&
        parsed.reminderHour <= 23
          ? parsed.reminderHour
          : defaultPreferences.reminderHour,
      reminderMinute:
        typeof parsed.reminderMinute === "number" &&
        parsed.reminderMinute >= 0 &&
        parsed.reminderMinute <= 59
          ? parsed.reminderMinute
          : defaultPreferences.reminderMinute
    };
  } catch {
    return defaultPreferences;
  }
}
