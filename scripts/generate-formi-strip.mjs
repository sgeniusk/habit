// Formi idle 애니메이션 스프라이트 시트를 한 장으로 생성한다.
// 한 이미지 안에 4프레임 (팔 동작 루프) 을 같이 그리게 해서 프레임끼리 일관되게 만든다.
// 사용법: cd scripts && node generate-formi-strip.mjs [name ...]   (기본: seed)
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");

const STRIP_PROMPT =
  "Create a 6-frame idle animation sprite sheet of this exact Formi " +
  "character. Six frames placed in a single horizontal row, six equal " +
  "side-by-side cells, on a flat pure WHITE background. Absolutely NO black " +
  "border, NO frame, NO outline boxes or lines around the cells — only the " +
  "characters on plain white. The SAME character appears in every cell — " +
  "identical body shape, identical size, identical position inside each " +
  "cell, identical colors, accessories and clean outline. Across the six " +
  "frames the character plays ONE smooth gradual loop, slowly raising its " +
  "two tiny arms step by step: frame 1 both little arms resting low at the " +
  "sides, eyes open; frame 2 arms raised a little; frame 3 arms raised " +
  "about halfway, eyes open; frame 4 arms raised higher, eyes slightly " +
  "narrowed; frame 5 arms almost fully up, eyes nearly closed; frame 6 " +
  "both little arms raised up high in a happy stretch, eyes fully closed " +
  "in gentle downward-curved happy arcs, tiny smile. Each frame is a small " +
  "smooth step from the previous one. ONLY the arms and eyes change — do " +
  "NOT move, resize, rotate or redraw the body. Very wide 6:1 image.";

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

  for (const arg of names) {
    // "out=ref" 형식이면 ref 이미지를 기준으로 out-strip 을 만든다 (책상 없는 버전 등).
    const [name, refName] = arg.includes("=") ? arg.split("=") : [arg, arg];
    const basePath = path.join(OUT_DIR, `${refName}.png`);
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
