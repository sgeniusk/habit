import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Persona Habit prototype", () => {
  it("renders the main mobile tabs", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "스냅" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "집" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "모임" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "리포트" })).toBeInTheDocument();
  });

  it("shows weather, location, and daily journal choices on Today", () => {
    render(<App />);

    expect(screen.getByText("서울 성수동")).toBeInTheDocument();
    expect(screen.getByText("18도 · 산책하기 좋은 맑음")).toBeInTheDocument();
    expect(screen.getByText("오늘 기록 방식")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI랑 같이쓰기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "혼자 기록하기" })).toBeInTheDocument();
  });

  it("opens a persona one-line journal and organizes a casual note", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI랑 같이쓰기" }));

    expect(
      screen.getByText("오늘은 맑고 습도 42%. 집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가?")
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("예: 오늘은 괜히 멀리 걷고 싶었어"),
      "오늘은 괜히 멀리 걷고 싶었어"
    );
    await user.click(screen.getByRole("button", { name: "정리해줘" }));

    expect(screen.getByText("오늘은 괜히 멀리 걷고 싶었어")).toBeInTheDocument();
    expect(
      screen.getByText(
        "집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가? 돌아오는 길의 느낌도 나한테 말해줘."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("정리된 한 줄")).toBeInTheDocument();
    expect(
      screen.getByText("맑은 날씨에 멀리 걸으며 마음의 방향을 다시 잡은 날.")
    ).toBeInTheDocument();
  });

  it("opens the Snap view with filters and stickers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));

    expect(screen.getByText("오늘의 한 컷")).toBeInTheDocument();
    expect(screen.getByText("필터")).toBeInTheDocument();
    expect(screen.getByText("스티커")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "꾸며서 올리기" })).toBeInTheDocument();
  });

  it("previews the selected snap image with the active filter and sticker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "필름" }));
    await user.click(screen.getByRole("button", { name: "🏃 러닝" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["snap"], "running-route.png", { type: "image/png" })
    );

    const preview = await screen.findByRole("img", { name: "running-route.png 미리보기" });

    expect(preview).toHaveAttribute("src", expect.stringContaining("data:image/png;base64"));
    expect(screen.getByText("필름 필터")).toBeInTheDocument();
    expect(screen.getByLabelText("선택 스티커 🏃 러닝")).toBeInTheDocument();
  });

  it("saves a decorated snap with the selected filter and sticker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "필름" }));
    await user.click(screen.getByRole("button", { name: "🏃 러닝" }));
    await user.click(screen.getByRole("button", { name: "운동" }));
    await user.click(screen.getByRole("button", { name: "야외" }));
    await user.type(screen.getByPlaceholderText("예: 맑아서 조금 더 걸었다"), "퇴근 후 3km 러닝");
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(screen.getByRole("button", { name: "오늘" }));

    expect(screen.getByText("야외 · 퇴근 후 3km 러닝")).toBeInTheDocument();
    expect(screen.getByText("필름 · 🏃 러닝")).toBeInTheDocument();
  });

  it("keeps the uploaded image on the latest saved snap", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["meal"], "lunch-bowl.png", { type: "image/png" })
    );
    await screen.findByRole("img", { name: "lunch-bowl.png 미리보기" });
    await user.click(screen.getByRole("button", { name: "식단" }));
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(screen.getByRole("button", { name: "오늘" }));

    expect(screen.getByRole("img", { name: "식단 스냅 저장 이미지" })).toBeInTheDocument();
  });

  it("opens the Home view with persona activities and decoration", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    expect(screen.getByText("페르소나의 집")).toBeInTheDocument();
    expect(screen.getByText("지금 하는 일")).toBeInTheDocument();
    expect(screen.getByText("방 꾸미기")).toBeInTheDocument();
    expect(screen.getByText("페르소나 꾸미기")).toBeInTheDocument();
    expect(screen.getByText("새벽 학습자")).toBeInTheDocument();
  });

  it("shows record-based XP and unlocked rewards on Home", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    const activePersona = screen.getByRole("region", { name: "새벽 학습자" });

    expect(within(activePersona).getByText("Lv.3 · 240xp")).toBeInTheDocument();
    expect(within(activePersona).getByText("다음 레벨까지 60xp")).toBeInTheDocument();
    expect(screen.getByText("해금된 보상")).toBeInTheDocument();
    expect(screen.getByText("스탠드")).toBeInTheDocument();
    expect(screen.getByText("노트 책상")).toBeInTheDocument();
  });

  it("applies room and outfit decoration selections to the active Home persona", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    const roomDecor = screen.getByRole("region", { name: "방 꾸미기" });
    const outfitDecor = screen.getByRole("region", { name: "페르소나 꾸미기" });

    await user.click(within(roomDecor).getByRole("button", { name: "낮은 서가" }));
    await user.click(within(outfitDecor).getByRole("button", { name: "바람막이" }));

    const activePersona = screen.getByRole("region", { name: "새벽 학습자" });

    expect(within(activePersona).getByText("방 · 낮은 서가")).toBeInTheDocument();
    expect(within(activePersona).getByText("의상 · 바람막이")).toBeInTheDocument();
    expect(within(roomDecor).getByRole("button", { name: "낮은 서가" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(outfitDecor).getByRole("button", { name: "바람막이" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("updates the Home persona activity from the latest snap category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "운동" }));
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(
      within(screen.getByRole("navigation", { name: "주요 화면" })).getByRole("button", {
        name: "집"
      })
    );

    expect(screen.getByRole("heading", { name: "루틴 러너", level: 2 })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "루틴 러너" })).getByText(
        "러닝화를 말리고 스트레칭을 하는 중"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("대표 · 루틴 러너")).toBeInTheDocument();
  });

  it("suggests a running meet when running snaps repeat", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));

    expect(screen.getByText("AI 모임 제안")).toBeInTheDocument();
    expect(screen.getByText("성수천 러닝 모임 추천")).toBeInTheDocument();
    expect(screen.getByText("러닝 스냅 2회")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "러닝 친구 초대하기" })).toBeInTheDocument();
  });

  it("creates a meet invite link and previews an accepted invite", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));
    await user.click(screen.getByRole("button", { name: "러닝 친구 초대하기" }));

    expect(screen.getByText("초대 링크 생성됨")).toBeInTheDocument();
    expect(
      screen.getByText("https://persona-habit.app/invite/running-meet-88")
    ).toBeInTheDocument();
    expect(screen.getByText("성수천 러닝 모임 대기실")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초대 수락 미리보기" }));

    expect(screen.getByText("친구 1명 참여 대기")).toBeInTheDocument();
    expect(screen.getByText("+40 공동 XP")).toBeInTheDocument();
  });

  it("opens the report view from the tab bar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    expect(screen.getByText("7일 생활 리포트")).toBeInTheDocument();
    expect(screen.getByText("AI가 발견한 숨은 습관")).toBeInTheDocument();
  });

  it("opens AI-curated old memories inside the report view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));
    await user.click(screen.getByRole("button", { name: "오래된 기억" }));

    expect(screen.getByText("기억 더듬기")).toBeInTheDocument();
    expect(screen.getByText("오래전의 러닝 감각")).toBeInTheDocument();
    expect(screen.getByText("2026년 4월")).toBeInTheDocument();
  });

  it("renders a living animated persona instead of a static image", () => {
    const { container } = render(<App />);

    expect(container.querySelector("[data-animated-persona='true']")).toBeInTheDocument();
    expect(container.querySelector(".avatar-arm.left")).toBeInTheDocument();
    expect(container.querySelector(".avatar-shadow")).toBeInTheDocument();
  });
});
