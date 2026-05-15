import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getWebShareAdapter } from "./share";

describe("getWebShareAdapter", () => {
  let originalShare: typeof navigator.share | undefined;
  let originalCanShare: typeof navigator.canShare | undefined;

  beforeEach(() => {
    originalShare = navigator.share;
    originalCanShare = navigator.canShare;
  });

  afterEach(() => {
    if (originalShare === undefined) {
      delete (navigator as { share?: unknown }).share;
    } else {
      (navigator as { share: typeof navigator.share }).share = originalShare;
    }

    if (originalCanShare === undefined) {
      delete (navigator as { canShare?: unknown }).canShare;
    } else {
      (navigator as { canShare: typeof navigator.canShare }).canShare = originalCanShare;
    }
  });

  it("downloads when navigator.share is missing", async () => {
    delete (navigator as { share?: unknown }).share;

    const downloadFallback = vi.fn();
    const adapter = getWebShareAdapter(downloadFallback);

    const result = await adapter.shareSnap({
      blob: new Blob(["snap"], { type: "image/png" }),
      filename: "snap.png"
    });

    expect(result).toBe("downloaded");
    expect(downloadFallback).toHaveBeenCalledTimes(1);
  });

  it("uses navigator.share when the platform supports file sharing", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const canShare = vi.fn().mockReturnValue(true);
    (navigator as { share?: typeof navigator.share }).share = share;
    (navigator as { canShare?: typeof navigator.canShare }).canShare = canShare;

    const downloadFallback = vi.fn();
    const adapter = getWebShareAdapter(downloadFallback);

    const result = await adapter.shareSnap({
      blob: new Blob(["snap"], { type: "image/png" }),
      filename: "snap.png",
      title: "오늘의 한 컷"
    });

    expect(result).toBe("shared");
    expect(share).toHaveBeenCalledTimes(1);
    expect(canShare).toHaveBeenCalledTimes(1);
    expect(downloadFallback).not.toHaveBeenCalled();
  });

  it("treats user-cancelled share as success without falling back to download", async () => {
    const abortError =
      typeof DOMException !== "undefined"
        ? new DOMException("user cancelled", "AbortError")
        : Object.assign(new Error("user cancelled"), { name: "AbortError" });
    const share = vi.fn().mockRejectedValue(abortError);
    const canShare = vi.fn().mockReturnValue(true);
    (navigator as { share?: typeof navigator.share }).share = share;
    (navigator as { canShare?: typeof navigator.canShare }).canShare = canShare;

    const downloadFallback = vi.fn();
    const adapter = getWebShareAdapter(downloadFallback);

    const result = await adapter.shareSnap({
      blob: new Blob(["snap"], { type: "image/png" }),
      filename: "snap.png"
    });

    expect(result).toBe("shared");
    expect(downloadFallback).not.toHaveBeenCalled();
  });
});
