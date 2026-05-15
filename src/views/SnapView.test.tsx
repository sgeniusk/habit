import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { t } from "../lib/i18n";
import type { ProofStampId } from "../types/habit";
import { SnapView } from "./SnapView";

const baseProps = {
  locale: "ko" as const,
  selectedCategory: "study" as const,
  selectedPlace: "library" as const,
  selectedFilter: "맑은빛",
  selectedSticker: "🔥 루틴",
  selectedProofStamps: ["time", "count", "persona"] as ProofStampId[],
  personaStampPosition: "bottom-right" as const,
  snapTimeLabel: "10:30",
  snapCountLabel: "오늘 1회차",
  personaNickname: "곰곰이",
  personaCategory: "study" as const,
  personaTone: "leaf",
  personaAccessory: "안경",
  memo: "",
  photoName: "study.png",
  photoPreviewUrl: "data:image/png;base64,abc",
  photoError: "",
  shareError: "",
  savedPulse: false,
  showSaveFeedback: false,
  onCategoryChange: vi.fn(),
  onPlaceChange: vi.fn(),
  onFilterChange: vi.fn(),
  onStickerChange: vi.fn(),
  onProofStampToggle: vi.fn(),
  onPersonaStampPositionChange: vi.fn(),
  onMemoChange: vi.fn(),
  onPhotoSelect: vi.fn(),
  onShareImage: vi.fn(),
  onSave: vi.fn(),
  onSavedHome: vi.fn(),
  onSavedReport: vi.fn(),
  onSavedMeet: vi.fn(),
  onShareMeet: vi.fn(),
  onShareMission: vi.fn()
};

describe("SnapView", () => {
  it("offers social next steps after a share image is ready", async () => {
    const user = userEvent.setup();
    const onShareMeet = vi.fn();
    const onShareMission = vi.fn();

    render(
      <SnapView
        {...baseProps}
        shareStatus={t("ko", "snap.shareReady")}
        onShareMeet={onShareMeet}
        onShareMission={onShareMission}
      />
    );

    expect(screen.getByText("공유 다음 행동")).toBeInTheDocument();
    expect(
      screen.getByText("저장한 이미지를 친구에게 보냈다면 모임이나 첫 미션으로 바로 이어가요.")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "모임 초대 만들기" }));
    expect(onShareMeet).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "첫 스냅 미션 보기" }));
    expect(onShareMission).toHaveBeenCalledTimes(1);
  });
});
