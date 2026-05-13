import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Persona Habit prototype", () => {
  it("renders the main mobile tabs", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "인증" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "페르소나" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "방" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "리포트" })).toBeInTheDocument();
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
