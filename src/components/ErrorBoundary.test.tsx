import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function ThrowingChild(): null {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("renders the recovery UI when a child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /잠깐 문제가 생겼어요/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /새로고침/ })).toBeInTheDocument();
  });

  it("renders children unchanged when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>오늘의 한 컷</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("오늘의 한 컷")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
