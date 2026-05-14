import { describe, expect, it } from "vitest";
import { buildJournalDraft, buildJournalOpening, type JournalContext } from "./journalEngine";

const context: JournalContext = {
  condition: "맑음",
  temperatureC: 18,
  humidity: 42,
  location: "서울 성수동",
  distanceFromHomeKm: 4.2
};

describe("buildJournalOpening", () => {
  it("uses weather, humidity, and distance as persona conversation context", () => {
    expect(buildJournalOpening(context)).toBe(
      "오늘은 맑고 습도 42%. 집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가?"
    );
  });

  it("reacts to rainy weather before distance", () => {
    expect(buildJournalOpening({ ...context, condition: "비", humidity: 78 })).toBe(
      "오늘은 비 온대. 습도도 78%라 마음도 조금 눅눅할 수 있어."
    );
  });
});

describe("buildJournalDraft", () => {
  it("turns a casual walking line into a persona reply and polished one-line diary", () => {
    const draft = buildJournalDraft({
      text: "오늘은 괜히 멀리 걷고 싶었어",
      mode: "ai",
      context
    });

    expect(draft.personaLine).toBe(
      "집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가? 돌아오는 길의 느낌도 나한테 말해줘."
    );
    expect(draft.polishedLine).toBe("맑은 날씨에 멀리 걸으며 마음의 방향을 다시 잡은 날.");
    expect(draft.moodTags).toEqual(["맑음", "이동", "정리"]);
  });
});
