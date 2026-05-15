import { describe, expect, it } from "vitest";
import {
  buildPersonaSummaries,
  findHiddenHabitInsights,
  type VerificationRecord
} from "./personaEngine";

const records: VerificationRecord[] = [
  {
    id: "r1",
    category: "study",
    placeType: "library",
    createdAt: "2026-05-01T09:20:00.000Z"
  },
  {
    id: "r2",
    category: "study",
    placeType: "library",
    createdAt: "2026-05-02T09:40:00.000Z"
  },
  {
    id: "r3",
    category: "meal",
    placeType: "restaurant",
    createdAt: "2026-05-02T13:10:00.000Z"
  },
  {
    id: "r4",
    category: "exercise",
    placeType: "outdoors",
    createdAt: "2026-05-03T22:30:00.000Z"
  }
];

describe("buildPersonaSummaries", () => {
  it("creates multiple category personas with levels and XP", () => {
    const personas = buildPersonaSummaries(records);

    expect(personas).toHaveLength(3);
    expect(personas[0]).toMatchObject({
      archetype: "study",
      name: "도서관 집중러",
      xp: 240,
      level: 3
    });
    expect(personas.map((persona) => persona.archetype)).toContain("exercise");
  });

  it("adds hybrid persona traits when study and exercise both exist", () => {
    const personas = buildPersonaSummaries(records);
    const studyPersona = personas.find((persona) => persona.archetype === "study");

    expect(studyPersona?.traits).toContain("건강한 학습 루프");
  });

  it("upgrades a high-XP study persona into a know-it-all scholar evolution", () => {
    const personas = buildPersonaSummaries(records);
    const studyPersona = personas.find((persona) => persona.archetype === "study");

    expect(studyPersona?.evolution).toBe("척척박사 페르소나");
  });
});

describe("findHiddenHabitInsights", () => {
  it("surfaces place and late-night behavior patterns", () => {
    const insights = findHiddenHabitInsights(records);

    expect(insights.map((insight) => insight.title)).toContain("도서관에서 집중이 반복돼요");
    expect(insights.map((insight) => insight.title)).toContain("밤 루틴을 살펴볼 시간");
  });

  it("explains the evidence behind each hidden habit insight", () => {
    const insights = findHiddenHabitInsights(records);

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "도서관에서 집중이 반복돼요",
          evidence: "공부 스냅 2개가 도서관에서 반복됐어요."
        }),
        expect.objectContaining({
          title: "생활 스냅이 페르소나로 쌓이고 있어요",
          evidence: "최근 스냅 4개에 공부, 식단, 운동 3가지 생활 축이 함께 있어요."
        })
      ])
    );
  });
});
