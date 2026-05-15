// 업로드된 이미지의 EXIF/GPS 메타데이터를 제거하고 크기를 줄여 localStorage 부담을 낮춘다.

export type SanitizeImageOptions = {
  maxDimension?: number;
  quality?: number;
};

export const SANITIZED_IMAGE_MIME = "image/jpeg";

export async function sanitizeImageFile(
  file: File,
  options: SanitizeImageOptions = {}
): Promise<string> {
  const maxDimension = options.maxDimension ?? 1600;
  const quality = options.quality ?? 0.85;

  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return readFileAsDataUrl(file);
  }

  if (!canvasSupportsImageEncode()) {
    return readFileAsDataUrl(file);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImageFromUrl(objectUrl);
    const { width, height } = fitWithin(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      maxDimension
    );

    if (width === 0 || height === 0) {
      return readFileAsDataUrl(file);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      return readFileAsDataUrl(file);
    }

    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, quality);

    if (!blob) {
      return readFileAsDataUrl(file);
    }

    return blobToDataUrl(blob);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasSupportsImageEncode(): boolean {
  try {
    const probe = document.createElement("canvas");
    const context = probe.getContext("2d");
    return context !== null && typeof probe.toBlob === "function";
  } catch {
    return false;
  }
}

function fitWithin(width: number, height: number, maxDimension: number) {
  if (width <= maxDimension && height <= maxDimension) {
    return { width: Math.round(width), height: Math.round(height) };
  }

  const ratio = width >= height ? maxDimension / width : maxDimension / height;

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio))
  };
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image decode failed"));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), SANITIZED_IMAGE_MIME, quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("blob to data url failed"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("blob to data url failed"));
    reader.readAsDataURL(blob);
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("file to data url failed"));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("file to data url failed"));
    reader.readAsDataURL(file);
  });
}
