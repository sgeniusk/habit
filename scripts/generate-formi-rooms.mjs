// Formi 방 배경 + 꾸미기 아이템을 Nano Banana (Gemini 2.5 Flash Image) 로 생성한다.
// 방 배경은 캐릭터 없는 빈 방, 아이템은 흰 배경 위 단일 오브젝트 (이후 cutout-bg.mjs 로 투명 처리).
//
// 사용법:
//   1. scripts/.env 에 GEMINI_API_KEY=... 한 줄
//   2. cd scripts && npm install && node generate-formi-rooms.mjs
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");

const STYLE =
  "soft hand-drawn illustration style with clean thin warm-brown outlines, " +
  "flat pastel colors, gentle minimal shading, cute calm cozy mood, the same " +
  "art style as a kawaii blob character app called Formi";

// 캐릭터가 들어갈 빈 방 배경 (정사각형, 캐릭터/사람 없음)
const ROOMS = [
  [
    "room-warm",
    "A cozy small empty room interior, front view, square composition. Warm " +
      "cream-colored wall, light wood plank floor, one window on the left with " +
      "soft warm daylight. No characters, no people, no furniture in the " +
      "center. Leave the lower-center floor wide open and uncluttered."
  ],
  [
    "room-sage",
    "A cozy small empty room interior, front view, square composition. Soft " +
      "sage-green wall, light wood plank floor, one window with gentle " +
      "daylight. No characters, no people, no furniture in the center. Leave " +
      "the lower-center floor wide open and uncluttered."
  ],
  [
    "room-blush",
    "A cozy small empty room interior, front view, square composition. Gentle " +
      "blush-pink wall, light wood plank floor, one small round window. No " +
      "characters, no people, no furniture in the center. Leave the " +
      "lower-center floor wide open and uncluttered."
  ],
  [
    "room-dusk",
    "A cozy small empty room interior, front view, square composition. Calm " +
      "deep warm-taupe wall, warm wood floor, one window with soft dusk light. " +
      "No characters, no people, no furniture in the center. Leave the " +
      "lower-center floor wide open and uncluttered."
  ]
];

// 흰 배경 위 단일 꾸미기 아이템 (이후 투명 처리)
const ITEMS = [
  [
    "item-plant",
    "a single potted leafy green house plant in a terracotta pot, centered, " +
      "no character, no other objects, flat pure white background, gentle shadow"
  ],
  [
    "item-lamp",
    "a single tall slim floor lamp with a soft warm glowing shade, centered, " +
      "no character, no other objects, flat pure white background, gentle shadow"
  ],
  [
    "item-rug",
    "a single round soft cozy rug seen from a slight top-down angle, centered, " +
      "no character, no other objects, flat pure white background, gentle shadow"
  ],
  [
    "item-shelf",
    "a single small low wooden bookshelf with a few colorful books and one " +
      "tiny plant on top, centered, no character, no other objects, flat pure " +
      "white background, gentle shadow"
  ]
];

function loadEnvFile() {
  const envPath = path.join(import.meta.dirname, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function generate(ai, model, prompt) {
  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{ text: prompt }]
    });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData.data;
      }
    }
    return null;
  } catch (error) {
    console.warn("generateContent 오류:", error instanceof Error ? error.message : error);
    return null;
  }
}

function saveImage(filePath, base64) {
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
}

async function main() {
  loadEnvFile();
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY 가 필요해요. scripts/.env 파일을 확인하세요.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const jobs = [
    ...ROOMS.map(([name, body]) => [name, `${body} ${STYLE}.`]),
    ...ITEMS.map(([name, body]) => [name, `A single object icon: ${body}, ${STYLE}.`])
  ];

  for (const [name, prompt] of jobs) {
    const target = path.join(OUT_DIR, `${name}.png`);
    if (fs.existsSync(target)) {
      console.log(`건너뜀 (이미 있음): ${name}.png`);
      continue;
    }
    const result = await generate(ai, model, prompt);
    if (result) {
      saveImage(target, result);
      console.log(`저장: ${name}.png`);
    } else {
      console.warn(`실패: ${name}.png (다시 실행하면 이 항목만 재시도해요)`);
    }
  }

  console.log("\n완료. 아이템은 cutout-bg.mjs 로 투명 처리하세요.");
}

main();
