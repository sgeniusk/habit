// Formi 캐릭터 자산을 Nano Banana (Gemini 2.5 Flash Image) 로 생성한다.
// seed.png 가 있으면 그것을 기준으로 편집, 없으면 텍스트로 seed 부터 생성한다.
//
// 사용법:
//   1. GEMINI_API_KEY 환경변수 설정 (또는 .env)
//   2. (선택) Formi 씨앗 캐릭터를 ../mobile/assets/formi/seed.png 로 저장
//   3. cd scripts && npm install && npm run generate
import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");
const SEED_PATH = path.join(OUT_DIR, "seed.png");

const BASE_STYLE =
  "soft blob-like lifestyle persona character named Formi, not an animal, not " +
  "fully human, small simple face, tiny arms and feet, hand-drawn clean line, " +
  "minimal kawaii expression, warm off-white body, soft pastel accents, calm " +
  "and cute but not childish, flat white background, gentle shadow";

const CHARACTER_LOCK =
  "Keep the exact same Formi character from the reference image — identical " +
  "soft blob body shape, same small simple face, same warm off-white color, " +
  "same hand-drawn clean outline and proportions. Do not redraw it as a new " +
  "character. Flat white background, gentle shadow. Change only the following:";

// seed 를 텍스트로 생성할 때 쓰는 프롬프트 (seed.png 가 없을 때만 사용)
const SEED_PROMPT =
  `${BASE_STYLE}, no accessory, neutral calm pose, slightly tilted head, the ` +
  "very first form before any habit. Single centered character. --ar 1:1";

// base 이미지를 편집해 만드는 23 변형
const VARIANTS = [
  // 공부
  ["study-sprout", "add a small open book held softly in the tiny arms, one bookmark peeking out, gentle reading expression."],
  ["study-identity", "dress it in a cozy hoodie with rolled-up sleeves, holding a notebook under one arm and a pencil, shoulders slightly forming, calm focused look."],
  ["study-master", "seat it at a tiny wooden desk with a stack of three books and a warm lamp glow, more human sitting posture, gentle proud smile."],
  // 운동
  ["exercise-sprout", "place a tiny pair of running shoes beside the character, it looks down at the shoes with curiosity, shoes not worn yet."],
  ["exercise-identity", "put the running shoes on and a light windbreaker, body slightly stretched into a runner shape, breathing fresh air."],
  ["exercise-master", "full running pose mid-stride, a small sweat drop, windbreaker flapping, a tiny tree silhouette behind, satisfied calm focus."],
  // 식단
  ["meal-sprout", "give it a small wooden spoon in one tiny hand and a round apple beside the body, calm look at the spoon."],
  ["meal-identity", "dress it in a tiny apron with one pocket, holding a clear glass of water, a small green leaf garnish on the head."],
  ["meal-master", "place it in a tiny pastel kitchen with a wooden cutting board and a half-packed lunchbox, more human chef proportions, warm focused expression."],
  // 독서
  ["reading-sprout", "lean a slightly oversized closed book against the body with a thin bookmark ribbon, one tiny hand touching the book gently."],
  ["reading-identity", "dress it in a soft knit vest, holding a paperback in both small hands, a tiny pair of round reading glasses, calm absorbed look."],
  ["reading-master", "seat it at a tiny cafe window seat with one open book and a warm drink, two small bookshelves in soft background, gentle thoughtful smile."],
  // 정리
  ["cleaning-sprout", "give it a single small label sticker held between two tiny hands and a folded cloth beside the body, neat curious expression."],
  ["cleaning-identity", "dress it in a small pocket apron with three tiny labeled pockets, holding a folded cloth, tidy proud expression."],
  ["cleaning-master", "place it in a small tidy room with three labeled storage boxes and a folded blanket, soft sunlight, calm satisfied smile."],
  // 셀프케어
  ["selfcare-sprout", "give it a small steaming cup held in tiny hands, eyes softly closed in a calm breath, gentle warm aura."],
  ["selfcare-identity", "give it a soft sleeping cap and a small blanket draped around the body, holding the warm cup, relaxed sitting posture."],
  ["selfcare-master", "seat it on a small cushion in a cozy corner with a tiny side table, the warm cup, a folded yoga mat behind, peaceful breath expression."],
  // 추가 자산
  ["icon", "show only the head and small smile, centered, a single tiny mint-green dot accent on top, bold clean outline, vibrant flat white background, recognizable at tiny size, no accessories — app icon style."],
  ["splash", "the character floating gently, calm off-white background fading to soft green below, no accessories, gentle floating shadow — splash screen style."],
  ["empty", "the character looking up with a curious expression, holding nothing, surrounded by a few soft floating dots representing empty habits waiting to form."]
];

async function main() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY (또는 GOOGLE_API_KEY) 환경변수가 필요해요.");
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";

  let seedBase64 = readImageBase64(SEED_PATH);
  if (!seedBase64) {
    console.log("seed.png 가 없어 텍스트로 씨앗 캐릭터를 먼저 생성해요...");
    seedBase64 = await generate(ai, model, [{ text: SEED_PROMPT }]);
    if (!seedBase64) {
      console.error("씨앗 캐릭터 생성 실패. API 키와 모델 접근 권한을 확인해 주세요.");
      process.exit(1);
    }
    saveImage(SEED_PATH, seedBase64);
    console.log("저장: seed.png");
  } else {
    console.log("기존 seed.png 를 기준 캐릭터로 사용해요.");
  }

  for (const [name, change] of VARIANTS) {
    const target = path.join(OUT_DIR, `${name}.png`);
    if (fs.existsSync(target)) {
      console.log(`건너뜀 (이미 있음): ${name}.png`);
      continue;
    }
    const prompt = `${CHARACTER_LOCK} ${change}`;
    const result = await generate(ai, model, [
      { inlineData: { mimeType: "image/png", data: seedBase64 } },
      { text: prompt }
    ]);
    if (result) {
      saveImage(target, result);
      console.log(`저장: ${name}.png`);
    } else {
      console.warn(`실패: ${name}.png (다시 실행하면 이 항목만 재시도해요)`);
    }
  }

  console.log("\n완료. mobile/assets/formi/ 를 확인하세요.");
}

async function generate(ai, model, contents) {
  try {
    const response = await ai.models.generateContent({ model, contents });
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

function readImageBase64(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath).toString("base64");
}

function saveImage(filePath, base64) {
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
}

main();
