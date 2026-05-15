import { describe, expect, it } from "vitest";
import { countConsecutiveSnapDays } from "./streakEngine";
import type { SnapRecord } from "../types/habit";

function snap(id: string, createdAt: string): SnapRecord {
  return {
    id,
    category: "study",
    placeType: "library",
    createdAt
  };
}

describe("countConsecutiveSnapDays", () => {
  it("returns 0 when there are no records", () => {
    expect(countConsecutiveSnapDays([])).toBe(0);
  });

  it("counts consecutive days from the latest snap", () => {
    const records = [
      snap("r1", "2026-05-12T09:00:00.000Z"),
      snap("r2", "2026-05-11T09:00:00.000Z"),
      snap("r3", "2026-05-10T09:00:00.000Z"),
      snap("r4", "2026-05-09T09:00:00.000Z"),
      snap("r5", "2026-04-07T20:00:00.000Z")
    ];

    expect(countConsecutiveSnapDays(records)).toBe(4);
  });

  it("collapses multiple snaps from the same day into one streak day", () => {
    const records = [
      snap("r1", "2026-05-12T09:00:00.000Z"),
      snap("r2", "2026-05-12T18:00:00.000Z"),
      snap("r3", "2026-05-11T09:00:00.000Z")
    ];

    expect(countConsecutiveSnapDays(records)).toBe(2);
  });

  it("stops at the first missing day", () => {
    const records = [
      snap("r1", "2026-05-12T09:00:00.000Z"),
      snap("r2", "2026-05-11T09:00:00.000Z"),
      snap("r3", "2026-05-08T09:00:00.000Z")
    ];

    expect(countConsecutiveSnapDays(records)).toBe(2);
  });
});
