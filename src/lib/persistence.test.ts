import { describe, expect, it } from "vitest";
import {
  loadInsightFeedback,
  loadMeetSuggestionFeedback,
  loadSnapRecords,
  loadUserPreferences,
  saveInsightFeedback,
  saveMeetSuggestionFeedback,
  saveSnapRecords,
  saveUserPreferences,
  USER_PREFERENCES_STORAGE_KEY
} from "./persistence";
import type { MeetSuggestionFeedback } from "./socialEngine";
import type { SnapRecord, UserPreferenceState } from "../types/habit";

function createMemoryStorage() {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    }
  };
}

describe("persistence", () => {
  it("stores AI insight feedback for later report visits", () => {
    const storage = createMemoryStorage();

    saveInsightFeedback(
      {
        hiddenInsightTitles: ["도서관에서 집중이 반복돼요"],
        softenedInsightTitles: ["밤 루틴을 살펴볼 시간"]
      },
      storage
    );

    expect(loadInsightFeedback(storage)).toEqual({
      hiddenInsightTitles: ["도서관에서 집중이 반복돼요"],
      softenedInsightTitles: ["밤 루틴을 살펴볼 시간"]
    });
  });

  it("stores meet suggestion feedback safely", () => {
    const storage = createMemoryStorage();
    const feedback: MeetSuggestionFeedback[] = [
      {
        suggestionId: "running-meet",
        action: "hidden",
        updatedAt: "2026-05-14T10:00:00.000Z"
      }
    ];

    saveMeetSuggestionFeedback(feedback, storage);

    expect(loadMeetSuggestionFeedback(storage)).toEqual(feedback);
  });

  it("stores snap records for alpha refresh persistence", () => {
    const storage = createMemoryStorage();
    const records: SnapRecord[] = [
      {
        id: "alpha-snap",
        category: "study",
        placeType: "library",
        memo: "알파 저장 테스트",
        filter: "필름",
        sticker: "📚 공부",
        proofStamps: ["time", "persona"],
        createdAt: "2026-05-15T09:00:00.000+09:00"
      }
    ];

    saveSnapRecords(records, storage);

    expect(loadSnapRecords([], storage)).toEqual(records);
  });

  it("stores persona, decor, and proof stamp preferences", () => {
    const storage = createMemoryStorage();
    const preferences: UserPreferenceState = {
      decorSelections: {
        "dawn-learner": {
          roomItem: "낮은 서가",
          outfit: "바람막이"
        }
      },
      personaNicknames: {
        study: "토리",
        meal: "냠냠",
        exercise: "달림",
        reading: "책콩",
        cleaning: "차곡",
        selfcare: "숨숨",
        hobby: "쏙쏙"
      },
      selectedProofStamps: ["time", "persona"],
      personaStampPosition: "top-left",
      locale: "en"
    };

    saveUserPreferences(preferences, storage);

    expect(
      loadUserPreferences(
        {
          decorSelections: {},
          personaNicknames: {},
          selectedProofStamps: [],
          personaStampPosition: "bottom-right",
          locale: "ko"
        },
        storage
      )
    ).toEqual(preferences);
  });

  it("fills missing preference fields from alpha defaults", () => {
    const storage = createMemoryStorage();

    storage.setItem(
      USER_PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        selectedProofStamps: ["persona"]
      })
    );

    expect(
      loadUserPreferences(
        {
          decorSelections: {
            "dawn-learner": {
              roomItem: "원목 책상",
              outfit: "집중 후드"
            }
          },
          personaNicknames: {
            study: "곰곰"
          },
          selectedProofStamps: ["time", "count", "persona"],
          personaStampPosition: "bottom-right",
          locale: "ko"
        },
        storage
      )
    ).toEqual({
      decorSelections: {
        "dawn-learner": {
          roomItem: "원목 책상",
          outfit: "집중 후드"
        }
      },
      personaNicknames: {
        study: "곰곰"
      },
      selectedProofStamps: ["persona"],
      personaStampPosition: "bottom-right",
      locale: "ko"
    });
  });
});
