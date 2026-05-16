// Formi 애니메이션 스트립 (<name>-strip.png) 을 N 프레임으로 잘라낸다.
// 흰/연회색 배경을 투명 처리하고, 모든 프레임을 같은 union bbox 로 잘라 정렬을 맞춘다.
// 사용법: node slice-formi-strip.mjs <name> [frameCount=3]
import { PNG } from "pngjs";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");
const TOLERANCE = 48; // 흰색 + 연한 셀 테두리까지 배경으로 간주
const PAD_RATIO = 0.08;

function isBg(r, g, b) {
  // 연한 흰/회색 배경 또는 모델이 두른 순수 검정 프레임
  const nearWhite = 255 - r <= TOLERANCE && 255 - g <= TOLERANCE && 255 - b <= TOLERANCE;
  const nearBlack = r <= 28 && g <= 28 && b <= 28;
  return nearWhite || nearBlack;
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
    if (!isBg(data[o], data[o + 1], data[o + 2])) return;
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

// 모델이 두른 어두운 테두리 프레임을 찾아 잘라낼 영역을 구한다.
function trimDarkFrame(png) {
  const { width, height, data } = png;
  const bright = (x, y) => {
    const o = (y * width + x) * 4;
    return Math.max(data[o], data[o + 1], data[o + 2]);
  };
  const midX = width >> 1;
  const midY = height >> 1;
  let left = 0;
  let right = width - 1;
  let top = 0;
  let bottom = height - 1;
  // 코너가 어두우면 테두리 프레임이 있다고 보고 밝은 영역까지 안쪽으로 이동
  if (bright(2, 2) < 90 || bright(width - 3, height - 3) < 90) {
    while (left < midX && bright(left, midY) < 234) left++;
    while (right > midX && bright(right, midY) < 234) right--;
    while (top < midY && bright(midX, top) < 234) top++;
    while (bottom > midY && bright(midX, bottom) < 234) bottom--;
  }
  return { left, top, right, bottom };
}

// 가장 큰 불투명 연결 덩어리(=캐릭터)만 남기고 나머지 조각(테두리 선 등)을 지운다.
function keepLargestComponent(png) {
  const { width, height, data } = png;
  const total = width * height;
  const label = new Int32Array(total).fill(-1);
  let cur = 0;
  let best = -1;
  let bestSize = 0;
  for (let start = 0; start < total; start++) {
    if (data[start * 4 + 3] <= 12 || label[start] !== -1) continue;
    let size = 0;
    const stack = [start];
    label[start] = cur;
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % width;
      const y = (p / width) | 0;
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];
      for (const [nx, ny] of neighbors) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (label[ni] !== -1 || data[ni * 4 + 3] <= 12) continue;
        label[ni] = cur;
        stack.push(ni);
      }
    }
    if (size > bestSize) {
      bestSize = size;
      best = cur;
    }
    cur++;
  }
  for (let i = 0; i < total; i++) {
    if (label[i] !== -1 && label[i] !== best) {
      data[i * 4 + 3] = 0;
    }
  }
}

function bounds(png) {
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

function main() {
  const name = process.argv[2];
  const frames = Number(process.argv[3] ?? 3);
  if (!name) {
    console.error("사용법: node slice-formi-strip.mjs <name> [frameCount=3]");
    process.exit(1);
  }
  const stripPath = path.join(OUT_DIR, `${name}-strip.png`);
  if (!fs.existsSync(stripPath)) {
    console.error(`스트립 없음: ${name}-strip.png`);
    process.exit(1);
  }
  const strip = PNG.sync.read(fs.readFileSync(stripPath));
  // 모델이 두른 어두운 프레임을 잘라낸 안쪽 영역만 사용
  const t = trimDarkFrame(strip);
  const stripW = t.right - t.left + 1;
  const stripH = t.bottom - t.top + 1;
  const cellW = Math.floor(stripW / frames);

  // 각 셀을 잘라 투명 처리
  const cells = [];
  for (let f = 0; f < frames; f++) {
    const cell = new PNG({ width: cellW, height: stripH });
    PNG.bitblt(strip, cell, t.left + f * cellW, t.top, cellW, stripH, 0, 0);
    floodTransparent(cell);
    keepLargestComponent(cell);
    cells.push(cell);
  }

  // 모든 프레임의 union bbox 계산 (정렬 유지)
  let minX = cellW;
  let minY = stripH;
  let maxX = -1;
  let maxY = -1;
  for (const cell of cells) {
    const b = bounds(cell);
    if (b.maxX < 0) continue;
    minX = Math.min(minX, b.minX);
    minY = Math.min(minY, b.minY);
    maxX = Math.max(maxX, b.maxX);
    maxY = Math.max(maxY, b.maxY);
  }
  const cw = maxX - minX + 1;
  const ch = maxY - minY + 1;
  const pad = Math.round(Math.max(cw, ch) * PAD_RATIO);
  const side = Math.max(cw, ch) + pad * 2;
  const dx = Math.round((side - cw) / 2);
  const dy = Math.round((side - ch) / 2);

  for (let f = 0; f < frames; f++) {
    const out = new PNG({ width: side, height: side });
    out.data.fill(0);
    PNG.bitblt(cells[f], out, minX, minY, cw, ch, dx, dy);
    const outPath = path.join(OUT_DIR, `${name}-f${f}.png`);
    fs.writeFileSync(outPath, PNG.sync.write(out));
    console.log(`프레임 저장: ${name}-f${f}.png (${side}x${side})`);
  }
  console.log("완료.");
}

main();
