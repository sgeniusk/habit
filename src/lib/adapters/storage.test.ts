import { describe, expect, it } from "vitest";
import { createInMemoryStorageAdapter, getWebStorageAdapter } from "./storage";

describe("createInMemoryStorageAdapter", () => {
  it("stores and reads strings without touching window", () => {
    const adapter = createInMemoryStorageAdapter();

    adapter.setItem("habit:nickname", "토리");

    expect(adapter.getItem("habit:nickname")).toBe("토리");
  });

  it("returns null for missing keys", () => {
    const adapter = createInMemoryStorageAdapter();

    expect(adapter.getItem("habit:missing")).toBeNull();
  });

  it("removes stored keys cleanly", () => {
    const adapter = createInMemoryStorageAdapter();

    adapter.setItem("habit:meet", "spring-park");
    adapter.removeItem("habit:meet");

    expect(adapter.getItem("habit:meet")).toBeNull();
  });
});

describe("getWebStorageAdapter", () => {
  it("returns a same-shape adapter backed by window.localStorage in jsdom", () => {
    const adapter = getWebStorageAdapter();

    adapter.setItem("habit:web", "ok");

    expect(window.localStorage.getItem("habit:web")).toBe("ok");
    expect(adapter.getItem("habit:web")).toBe("ok");

    adapter.removeItem("habit:web");
    expect(window.localStorage.getItem("habit:web")).toBeNull();
  });
});
