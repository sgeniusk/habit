import { describe, expect, it } from "vitest";
import { buildMemoryCurations, type MemorySignalRecord } from "./memoryEngine";

const records: MemorySignalRecord[] = [
  {
    id: "recent-study",
    category: "study",
    placeType: "library",
    memo: "최근 도서관 집중",
    createdAt: "2026-05-12T09:00:00.000+09:00"
  },
  {
    id: "old-run",
    category: "exercise",
    placeType: "outdoors",
    memo: "봄비 맞기 전 3km 러닝",
    sticker: "🏃 러닝",
    createdAt: "2026-04-07T20:20:00.000+09:00"
  }
];

describe("buildMemoryCurations", () => {
  it("curates old records as resurfaced memories", () => {
    const memories = buildMemoryCurations(records);

    expect(memories[0]).toMatchObject({
      title: "오래전의 러닝 감각",
      period: "2026년 4월",
      tags: ["운동", "야외", "오래전 기억"]
    });
    expect(memories[0].summary).toContain("처음 몸을 깨우던 장면");
    expect(memories[0].prompt).toContain("무엇이 제일 시원했는지");
  });

  it("uses the oldest available record when there is no distant memory yet", () => {
    const memories = buildMemoryCurations([records[0]]);

    expect(memories[0].title).toBe("가장 오래된 생활 조각");
    expect(memories[0].summary).toContain("최근 도서관 집중");
  });
});
