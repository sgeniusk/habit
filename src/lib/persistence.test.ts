import { describe, expect, it } from "vitest";
import {
  loadInsightFeedback,
  loadMeetSuggestionFeedback,
  saveInsightFeedback,
  saveMeetSuggestionFeedback
} from "./persistence";
import type { MeetSuggestionFeedback } from "./socialEngine";

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
});
