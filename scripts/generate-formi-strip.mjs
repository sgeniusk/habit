// Formi 깜빡임 애니메이션 스프라이트 시트를 한 장으로 생성한다.
// 한 이미지 안에 3프레임 (눈 뜸 / 반쯤 / 감음) 을 같이 그리게 해서 프레임끼리 일관되게 만든다.
// 사용법: cd scripts && node generate-formi-strip.mjs [name ...]   (기본: seed)
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");

const STRIP_PROMPT =
  "Create a 3-frame blink animation sprite sheet of this exact Formi " +
  "character. Three frames placed in a single horizontal row, three equal " +
  "side-by-side cells, on a flat pure white background. The SAME character " +
  "appears in every cell — identical body shape, identical size, identical " +
  "position inside each cell, identical colors, accessories and clean " +
  "outline. The ONLY thing that changes between the three frames is the " +
  "eyes: frame 1 (left) eyes fully open and normal, frame 2 (middle) eyes " +
  "half closed, frame 3 (right) eyes fully closed as gentle downward-curved " +
  "happy closed-eye arcs. Do NOT move, resize, rotate or redraw the " +
  "character between frames — only the eyes change. Wide 3:1 image.";

function loadEnvFile() {
  const envPath = path.join(import.meta.dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

async function generate(ai, model, contents) {
  try {
    const response = await ai.models.generateContent({ model, contents });
    const parts = response.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) return part.inlineData.data;
    }
    return null;
  } catch (error) {
    console.warn("generateContent 오류:", error instanceof Error ? error.message : error);
    return null;
  }
}

async function main() {
  loadEnvFile();
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY 가 필요해요. scripts/.env 를 확인하세요.");
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  const names = process.argv.slice(2);
  if (names.length === 0) names.push("seed");

  for (const name of names) {
    const basePath = path.join(OUT_DIR, `${name}.png`);
    const target = path.join(OUT_DIR, `${name}-strip.png`);
    if (!fs.existsSync(basePath)) {
      console.warn(`base 없음, 건너뜀: ${name}.png`);
      continue;
    }
    if (fs.existsSync(target)) {
      console.log(`건너뜀 (이미 있음): ${name}-strip.png`);
      continue;
    }
    const baseBase64 = fs.readFileSync(basePath).toString("base64");
    const result = await generate(ai, model, [
      { inlineData: { mimeType: "image/png", data: baseBase64 } },
      { text: STRIP_PROMPT }
    ]);
    if (result) {
      fs.writeFileSync(target, Buffer.from(result, "base64"));
      console.log(`저장: ${name}-strip.png`);
    } else {
      console.warn(`실패: ${name}-strip.png`);
    }
  }
  console.log("\n완료. slice-formi-strip.mjs 로 프레임을 잘라내세요.");
}

main();
