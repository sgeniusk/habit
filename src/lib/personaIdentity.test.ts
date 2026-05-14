import { describe, expect, it } from "vitest";
import {
  buildPersonaCompanionLine,
  buildPersonaIdentity,
  formatPersonaDisplayName,
  formatPersonaVocative
} from "./personaIdentity";

describe("personaIdentity", () => {
  it("formats consonant-ending Korean nicknames for display and dialogue", () => {
    expect(formatPersonaDisplayName("곰곰")).toBe("곰곰이");
    expect(formatPersonaVocative("곰곰")).toBe("곰곰아");
  });

  it("formats vowel-ending Korean nicknames without an extra 이", () => {
    expect(formatPersonaDisplayName("토리")).toBe("토리");
    expect(formatPersonaVocative("토리")).toBe("토리야");
  });

  it("builds a study persona identity with a role and upgrade dialogue", () => {
    expect(
      buildPersonaIdentity({
        category: "study",
        nickname: "곰곰",
        level: 3,
        xp: 240
      })
    ).toMatchObject({
      displayName: "곰곰이",
      roleLabel: "학습자",
      upgradeLabel: "척척박사 페르소나"
    });

    expect(buildPersonaCompanionLine({ category: "study", nickname: "곰곰", level: 3 })).toBe(
      "곰곰아. 이번에는 공부를 많이 했네. 척척박사 페르소나로 업글됐어."
    );
  });
});
