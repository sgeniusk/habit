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

  it("opens the Snap view with filters and stickers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));

    expect(screen.getByText("오늘의 한 컷")).toBeInTheDocument();
    expect(screen.getByText("필터")).toBeInTheDocument();
    expect(screen.getByText("스티커")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "꾸며서 올리기" })).toBeInTheDocument();
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

  it("opens the report view from the tab bar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    expect(screen.getByText("7일 생활 리포트")).toBeInTheDocument();
    expect(screen.getByText("AI가 발견한 숨은 습관")).toBeInTheDocument();
  });

  it("renders a living animated persona instead of a static image", () => {
    const { container } = render(<App />);

    expect(container.querySelector("[data-animated-persona='true']")).toBeInTheDocument();
    expect(container.querySelector(".avatar-arm.left")).toBeInTheDocument();
    expect(container.querySelector(".avatar-shadow")).toBeInTheDocument();
  });
});
