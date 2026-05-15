// 스냅 공유 어댑터. 웹은 navigator.share 또는 다운로드 fallback, 네이티브는 expo-sharing 으로 매핑한다.

export type ShareSnapResult = "shared" | "downloaded" | "unsupported";

export type ShareSnapInput = {
  blob: Blob;
  filename: string;
  title?: string;
  text?: string;
};

export type ShareAdapter = {
  shareSnap(input: ShareSnapInput): Promise<ShareSnapResult>;
};

export function getWebShareAdapter(
  downloadFallback: (blob: Blob, filename: string) => void
): ShareAdapter {
  return {
    async shareSnap({ blob, filename, title, text }) {
      const win = typeof window !== "undefined" ? window : undefined;
      const nav = win?.navigator as Navigator | undefined;

      if (nav && typeof nav.share === "function") {
        const file = new File([blob], filename, { type: blob.type || "image/png" });
        const sharePayload: ShareData = { files: [file], title, text };

        if (typeof nav.canShare !== "function" || nav.canShare(sharePayload)) {
          try {
            await nav.share(sharePayload);
            return "shared";
          } catch (error) {
            if (isAbortError(error)) {
              return "shared";
            }
          }
        }
      }

      downloadFallback(blob, filename);
      return "downloaded";
    }
  };
}

function isAbortError(error: unknown): boolean {
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return error.name === "AbortError";
  }

  if (error instanceof Error) {
    return error.name === "AbortError";
  }

  return false;
}
