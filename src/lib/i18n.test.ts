import { describe, expect, it } from "vitest";
import {
  defaultLocale,
  formatSnapCountLabel,
  getCategoryLabelForLocale,
  getPersonaStampPositionLabel,
  getPlaceLabelForLocale,
  getTabLabel,
  normalizeLocale,
  t
} from "./i18n";

describe("i18n", () => {
  it("keeps Korean as the alpha default locale", () => {
    expect(defaultLocale).toBe("ko");
    expect(t("ko", "today.title")).toBe("오늘의 기록");
    expect(getTabLabel("today", "ko")).toBe("오늘");
    expect(t("ko", "today.onboarding.primary")).toBe("첫 스냅 찍기");
  });

  it("translates core app chrome and taxonomy labels to English", () => {
    expect(t("en", "today.title")).toBe("Today's record");
    expect(getTabLabel("snap", "en")).toBe("Snap");
    expect(getCategoryLabelForLocale("study", "en")).toBe("Study");
    expect(getPlaceLabelForLocale("library", "en")).toBe("Library");
    expect(getPersonaStampPositionLabel("top-left", "en")).toBe("Top left");
    expect(t("en", "snap.shareImage")).toBe("Save share image");
    expect(t("en", "snap.saveFeedback.home")).toBe("View Home");
    expect(t("en", "today.onboarding.dialogTitle")).toBe("First 30-second guide");
    expect(t("en", "today.onboarding.next")).toBe("Next");
    expect(t("en", "today.onboarding.title")).toBe("One snap starts the loop");
    expect(formatSnapCountLabel("en", 2)).toBe("Today #2");
  });

  it("falls back to Korean when a stored locale is not supported", () => {
    expect(normalizeLocale("fr")).toBe("ko");
    expect(normalizeLocale("en")).toBe("en");
  });
});
