import { describe, expect, it, vi } from "vitest";
import {
  buildSnapExportFilename,
  buildSnapExportOverlayPlan,
  downloadSnapBlob
} from "./snapExport";

describe("snapExport", () => {
  it("builds a stable share image filename from the snap photo name and time", () => {
    expect(
      buildSnapExportFilename("library proof!!.png", new Date("2026-05-15T08:12:00+09:00"))
    ).toBe("persona-habit-library-proof-20260514-2312.png");
  });

  it("places selected proof stamps and the persona stamp in the export overlay plan", () => {
    const plan = buildSnapExportOverlayPlan({
      filter: "필름",
      sticker: "📚 공부",
      proofStamps: ["time", "persona"],
      personaStampPosition: "top-left",
      personaDisplayName: "곰곰이",
      personaRoleLabel: "학습자",
      snapTimeLabel: "23:50",
      snapCountLabel: "오늘 2회차",
      locale: "ko"
    });

    expect(plan.badges.map((badge) => badge.text)).toEqual(["필름 필터", "📚 공부", "23:50 인증"]);
    expect(plan.personaStamp).toMatchObject({
      position: "top-left",
      title: "곰곰이와 함께해요",
      subtitle: "직업 · 학습자",
      x: 36,
      y: 36
    });
  });

  it("downloads a generated blob through an injected browser adapter", () => {
    const click = vi.fn();
    const remove = vi.fn();
    const appendChild = vi.fn();
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => "blob:persona-habit");
    const link = {
      click,
      download: "",
      href: "",
      rel: "",
      remove
    };

    downloadSnapBlob(new Blob(["snap"], { type: "image/png" }), "snap.png", {
      appendChild,
      createLink: () => link,
      createObjectURL,
      revokeObjectURL
    });

    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(link.href).toBe("blob:persona-habit");
    expect(link.download).toBe("snap.png");
    expect(link.rel).toBe("noopener");
    expect(appendChild).toHaveBeenCalledWith(link);
    expect(click).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:persona-habit");
  });
});
