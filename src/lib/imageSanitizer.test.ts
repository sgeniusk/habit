import { describe, expect, it } from "vitest";
import { sanitizeImageFile } from "./imageSanitizer";

describe("sanitizeImageFile", () => {
  it("falls back to a data URL when the canvas pipeline is unavailable", async () => {
    const file = new File(["snap"], "lunch.png", { type: "image/png" });

    const dataUrl = await sanitizeImageFile(file);

    expect(dataUrl.startsWith("data:image/")).toBe(true);
  });

  it("handles an unknown mime type by still returning a data URL", async () => {
    const file = new File(["snap-bytes"], "weird.bin", { type: "" });

    const dataUrl = await sanitizeImageFile(file);

    expect(dataUrl.startsWith("data:")).toBe(true);
  });
});
