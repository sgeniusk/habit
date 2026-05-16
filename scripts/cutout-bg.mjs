// Formi PNG 의 흰 배경을 가장자리 flood fill 로 투명하게 만들고, 캐릭터에 맞춰 정사각형으로 잘라낸다.
// 사용법: node cutout-bg.mjs <파일 또는 폴더> [...추가 경로]
//   예) node cutout-bg.mjs ../mobile/assets/formi
import { PNG } from "pngjs";
import * as fs from "node:fs";
import * as path from "node:path";

const TOLERANCE = 26; // 흰색으로 간주할 채널 허용 오차
const PAD_RATIO = 0.08; // 캐릭터 주변 여백 비율

function isWhite(r, g, b) {
  return 255 - r <= TOLERANCE && 255 - g <= TOLERANCE && 255 - b <= TOLERANCE;
}

function floodTransparent(png) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const o = i * 4;
    if (!isWhite(data[o], data[o + 1], data[o + 2])) return;
    visited[i] = 1;
    stack.push(x, y);
  };
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }
  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    data[(y * width + x) * 4 + 3] = 0;
    push(x + 1, y);
    push(x - 1, y);
    push(x, y + 1);
    push(x, y - 1);
  }
}

function opaqueBounds(png) {
  const { width, height, data } = png;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, minY, maxX, maxY };
}

function cutout(srcPath, outPath) {
  const png = PNG.sync.read(fs.readFileSync(srcPath));
  floodTransparent(png);
  const { minX, minY, maxX, maxY } = opaqueBounds(png);
  if (maxX < 0) {
    console.warn(`불투명 픽셀 없음, 건너뜀: ${path.basename(srcPath)}`);
    return;
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const pad = Math.round(Math.max(cw, ch) * PAD_RATIO);
  const side = Math.max(cw, ch) + pad * 2;
  const out = new PNG({ width: side, height: side });
  out.data.fill(0);
  const dx = Math.round((side - cw) / 2);
  const dy = Math.round((side - ch) / 2);
  PNG.bitblt(png, out, minX, minY, cw, ch, dx, dy);
  fs.writeFileSync(outPath, PNG.sync.write(out));
  console.log(`잘라냄: ${path.basename(outPath)} (${side}x${side})`);
}

function collectTargets(input) {
  const stat = fs.statSync(input);
  if (stat.isDirectory()) {
    return fs
      .readdirSync(input)
      .filter((name) => name.toLowerCase().endsWith(".png"))
      .map((name) => path.join(input, name));
  }
  return [input];
}

function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error("사용법: node cutout-bg.mjs <파일 또는 폴더> [...추가 경로]");
    process.exit(1);
  }
  for (const input of inputs) {
    for (const target of collectTargets(input)) {
      cutout(target, target);
    }
  }
  console.log("\n완료.");
}

main();
