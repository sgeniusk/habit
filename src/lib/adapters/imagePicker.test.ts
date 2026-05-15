import { describe, expect, it } from "vitest";
import { getWebImagePickerAdapter } from "./imagePicker";

describe("getWebImagePickerAdapter", () => {
  it("returns a data url for a valid image file", async () => {
    const adapter = getWebImagePickerAdapter();
    const file = new File(["bytes"], "lunch.png", { type: "image/png" });

    const picked = await adapter.processFile(file);

    expect(picked.filename).toBe("lunch.png");
    expect(picked.dataUrl.startsWith("data:")).toBe(true);
  });

  it("accepts standard image MIME types", () => {
    const adapter = getWebImagePickerAdapter();

    expect(adapter.isImageMimeType("image/png")).toBe(true);
    expect(adapter.isImageMimeType("image/jpeg")).toBe(true);
  });

  it("rejects empty or non-image MIME types", () => {
    const adapter = getWebImagePickerAdapter();

    expect(adapter.isImageMimeType("")).toBe(false);
    expect(adapter.isImageMimeType(undefined)).toBe(false);
    expect(adapter.isImageMimeType("application/pdf")).toBe(false);
  });
});
