import type { Locale, PersonaStampPosition, ProofStampId } from "../types/habit";

const EXPORT_SIZE = 1080;
const EXPORT_PADDING = 36;
const BADGE_HEIGHT = 54;
const BADGE_GAP = 14;
const PERSONA_STAMP_WIDTH = 410;
const PERSONA_STAMP_HEIGHT = 126;

export type SnapExportRequest = {
  imageUrl: string;
  photoName: string;
  filter: string;
  sticker: string;
  proofStamps: ProofStampId[];
  personaStampPosition: PersonaStampPosition;
  personaDisplayName: string;
  personaRoleLabel: string;
  snapTimeLabel: string;
  snapCountLabel: string;
  locale: Locale;
};

export type SnapExportBadge = {
  id: "filter" | "sticker" | "time" | "count";
  text: string;
  x: number;
  y: number;
};

export type SnapExportPersonaStamp = {
  position: PersonaStampPosition;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SnapExportOverlayPlan = {
  size: number;
  badges: SnapExportBadge[];
  personaStamp: SnapExportPersonaStamp | null;
};

export type SnapDownloadAdapter = {
  appendChild: (link: SnapDownloadLink) => void;
  createLink: () => SnapDownloadLink;
  createObjectURL: (blob: Blob) => string;
  revokeObjectURL: (url: string) => void;
};

export type SnapDownloadLink = {
  click: () => void;
  download: string;
  href: string;
  rel: string;
  remove: () => void;
};

export function buildSnapExportFilename(photoName: string, createdAt = new Date()) {
  const baseName = photoName.replace(/\.[^.]+$/, "");
  const normalizedName = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const safeName = normalizedName || "snap";
  const timestamp = [
    createdAt.getUTCFullYear(),
    String(createdAt.getUTCMonth() + 1).padStart(2, "0"),
    String(createdAt.getUTCDate()).padStart(2, "0"),
    "-",
    String(createdAt.getUTCHours()).padStart(2, "0"),
    String(createdAt.getUTCMinutes()).padStart(2, "0")
  ].join("");

  return `persona-habit-${safeName}-${timestamp}.png`;
}

export function buildSnapExportOverlayPlan(
  request: Omit<SnapExportRequest, "imageUrl" | "photoName">
) {
  const badges: SnapExportBadge[] = [
    {
      id: "filter",
      text: formatFilterBadge(request.filter, request.locale),
      x: EXPORT_PADDING,
      y: EXPORT_SIZE - EXPORT_PADDING - BADGE_HEIGHT
    },
    {
      id: "sticker",
      text: request.sticker,
      x: EXPORT_SIZE - EXPORT_PADDING - 210,
      y: EXPORT_PADDING
    }
  ];

  if (request.proofStamps.includes("time")) {
    badges.push({
      id: "time",
      text:
        request.locale === "ko"
          ? `${request.snapTimeLabel} 인증`
          : `Proof ${request.snapTimeLabel}`,
      x: EXPORT_PADDING,
      y: EXPORT_SIZE - EXPORT_PADDING - BADGE_HEIGHT * 2 - BADGE_GAP
    });
  }

  if (request.proofStamps.includes("count")) {
    badges.push({
      id: "count",
      text: request.snapCountLabel,
      x: EXPORT_PADDING,
      y: EXPORT_SIZE - EXPORT_PADDING - BADGE_HEIGHT * 3 - BADGE_GAP * 2
    });
  }

  return {
    size: EXPORT_SIZE,
    badges,
    personaStamp: request.proofStamps.includes("persona") ? buildPersonaStampPlan(request) : null
  };
}

export async function createSnapExportBlob(request: SnapExportRequest) {
  const image = await loadImage(request.imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = EXPORT_SIZE;
  canvas.height = EXPORT_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available.");
  }

  drawSnapImage(context, image, request.filter);
  drawSnapOverlay(context, request);

  return canvasToBlob(canvas);
}

export function downloadSnapBlob(
  blob: Blob,
  filename: string,
  adapter = createBrowserDownloadAdapter()
) {
  const objectUrl = adapter.createObjectURL(blob);
  const link = adapter.createLink();
  link.href = objectUrl;
  link.download = filename;
  link.rel = "noopener";

  adapter.appendChild(link);
  link.click();
  link.remove();
  adapter.revokeObjectURL(objectUrl);
}

function buildPersonaStampPlan(
  request: Omit<SnapExportRequest, "imageUrl" | "photoName">
): SnapExportPersonaStamp {
  const base = {
    position: request.personaStampPosition,
    title:
      request.locale === "ko"
        ? `${request.personaDisplayName}와 함께해요`
        : `With ${request.personaDisplayName}`,
    subtitle:
      request.locale === "ko"
        ? `직업 · ${request.personaRoleLabel}`
        : `Role · ${request.personaRoleLabel}`,
    width: PERSONA_STAMP_WIDTH,
    height: PERSONA_STAMP_HEIGHT
  };

  if (request.personaStampPosition === "top-left") {
    return { ...base, x: EXPORT_PADDING, y: EXPORT_PADDING };
  }

  if (request.personaStampPosition === "top-right") {
    return { ...base, x: EXPORT_SIZE - EXPORT_PADDING - PERSONA_STAMP_WIDTH, y: EXPORT_PADDING };
  }

  if (request.personaStampPosition === "bottom-left") {
    return { ...base, x: EXPORT_PADDING, y: EXPORT_SIZE - EXPORT_PADDING - PERSONA_STAMP_HEIGHT };
  }

  return {
    ...base,
    x: EXPORT_SIZE - EXPORT_PADDING - PERSONA_STAMP_WIDTH,
    y: EXPORT_SIZE - EXPORT_PADDING - PERSONA_STAMP_HEIGHT
  };
}

function formatFilterBadge(filter: string, locale: Locale) {
  return locale === "ko" ? `${filter} 필터` : `${filter} filter`;
}

function createBrowserDownloadAdapter(): SnapDownloadAdapter {
  return {
    appendChild: (link) => document.body.appendChild(link as HTMLAnchorElement),
    createLink: () => document.createElement("a"),
    createObjectURL: (blob) => URL.createObjectURL(blob),
    revokeObjectURL: (url) => URL.revokeObjectURL(url)
  };
}

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Snap image could not be loaded for export."));
    image.src = imageUrl;
  });
}

function drawSnapImage(context: CanvasRenderingContext2D, image: HTMLImageElement, filter: string) {
  const imageWidth = image.naturalWidth || image.width || EXPORT_SIZE;
  const imageHeight = image.naturalHeight || image.height || EXPORT_SIZE;
  const sourceRatio = imageWidth / imageHeight;
  const targetRatio = 1;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = imageWidth;
  let sourceHeight = imageHeight;

  if (sourceRatio > targetRatio) {
    sourceWidth = imageHeight * targetRatio;
    sourceX = (imageWidth - sourceWidth) / 2;
  } else {
    sourceHeight = imageWidth / targetRatio;
    sourceY = (imageHeight - sourceHeight) / 2;
  }

  context.save();
  context.filter = getCanvasFilter(filter);
  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    EXPORT_SIZE,
    EXPORT_SIZE
  );
  context.restore();

  const gradient = context.createLinearGradient(0, 0, 0, EXPORT_SIZE);
  gradient.addColorStop(0, "rgba(20, 28, 36, 0.10)");
  gradient.addColorStop(0.62, "rgba(20, 28, 36, 0.02)");
  gradient.addColorStop(1, "rgba(20, 28, 36, 0.24)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
}

function drawSnapOverlay(context: CanvasRenderingContext2D, request: SnapExportRequest) {
  const plan = buildSnapExportOverlayPlan(request);

  plan.badges.forEach((badge) => drawBadge(context, badge));

  if (plan.personaStamp) {
    drawPersonaStamp(context, plan.personaStamp);
  }
}

function drawBadge(context: CanvasRenderingContext2D, badge: SnapExportBadge) {
  context.save();
  context.font = "900 32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  const width = Math.max(160, Math.min(360, context.measureText(badge.text).width + 74));
  roundedRect(context, badge.x, badge.y, width, BADGE_HEIGHT, 18);
  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = "#1f2f26";
  context.stroke();
  context.fillStyle = "#1f2f26";
  context.textBaseline = "middle";
  context.fillText(badge.text, badge.x + 28, badge.y + BADGE_HEIGHT / 2 + 1);
  context.restore();
}

function drawPersonaStamp(context: CanvasRenderingContext2D, stamp: SnapExportPersonaStamp) {
  context.save();
  roundedRect(context, stamp.x, stamp.y, stamp.width, stamp.height, 24);
  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = "#1f2f26";
  context.stroke();

  context.beginPath();
  context.arc(stamp.x + 64, stamp.y + 63, 39, 0, Math.PI * 2);
  context.fillStyle = "#e6f6e8";
  context.fill();
  context.lineWidth = 4;
  context.strokeStyle = "#2f9d65";
  context.stroke();

  context.fillStyle = "#1f2f26";
  context.font = "950 34px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(stamp.title.slice(0, 1), stamp.x + 64, stamp.y + 64);

  context.textAlign = "start";
  context.font = "950 32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(stamp.title, stamp.x + 122, stamp.y + 51);
  context.fillStyle = "#2f9d65";
  context.font = "900 25px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.fillText(stamp.subtitle, stamp.x + 122, stamp.y + 86);
  context.restore();
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function getCanvasFilter(filter: string) {
  const filters: Record<string, string> = {
    맑은빛: "brightness(1.08) saturate(1.08)",
    필름: "contrast(0.92) saturate(0.82) sepia(0.24)",
    집중: "contrast(1.12) saturate(0.96)",
    새벽: "brightness(0.93) saturate(0.88) hue-rotate(12deg)",
    단백질: "saturate(1.16) contrast(1.04)"
  };

  return filters[filter] ?? filters.맑은빛;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Snap image export failed."));
    }, "image/png");
  });
}
