import { describe, expect, it } from "vitest";
import { getWebSnapRenderer } from "./snapRenderer";

describe("getWebSnapRenderer", () => {
  it("exposes renderSnap and downloadSnap functions", () => {
    const renderer = getWebSnapRenderer();

    expect(typeof renderer.renderSnap).toBe("function");
    expect(typeof renderer.downloadSnap).toBe("function");
  });
});
