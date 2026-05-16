// mobile/assets/formi/ 의 <name>-fN.png 들을 스캔해 frameSets 목록 파일을 생성한다.
// RN 은 동적 require 가 안 되므로 캐릭터별 프레임 수가 달라도 정적으로 등록해야 한다.
// 사용법: node build-frame-manifest.mjs
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");
const TARGET = path.resolve(import.meta.dirname, "../mobile/src/lib/formiFrames.ts");

const groups = {};
for (const file of fs.readdirSync(OUT_DIR)) {
  const m = file.match(/^(.+)-f(\d+)\.png$/);
  if (!m) continue;
  (groups[m[1]] ??= []).push({ n: Number(m[2]), file });
}

const names = Object.keys(groups).sort();
let out = "// 자동 생성 파일 — scripts/build-frame-manifest.mjs 로 갱신한다. 직접 수정하지 마세요.\n";
out += "/* eslint-disable */\n";
out += "export const frameSets = {\n";
for (const name of names) {
  const frames = groups[name].sort((a, b) => a.n - b.n);
  out += `  ${JSON.stringify(name)}: [\n`;
  for (const fr of frames) {
    out += `    require("../../assets/formi/${fr.file}"),\n`;
  }
  out += "  ],\n";
}
out += "} as const;\n";

fs.writeFileSync(TARGET, out);
console.log(`생성: formiFrames.ts — ${names.length} 캐릭터`);
for (const name of names) {
  console.log(`  ${name}: ${groups[name].length} 프레임`);
}
