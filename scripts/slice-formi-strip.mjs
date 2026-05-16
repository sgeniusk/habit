// Formi 애니메이션 시트 (<name>-strip.png) 를 프레임으로 잘라낸다.
// 배경색을 자동 감지해 투명 처리한 뒤, 연결 덩어리(=캐릭터)를 직접 찾아 프레임으로 추출한다.
// 모델이 1줄·2x4·2x3 등 어떤 레이아웃/배경색으로 그리든 대응한다.
// 모든 프레임은 같은 정사각 캔버스에 바닥 정렬한다.
// 사용법: node slice-formi-strip.mjs <name>
import { PNG } from "pngjs";
import * as fs from "node:fs";
import * as path from "node:path";

const OUT_DIR = path.resolve(import.meta.dirname, "../mobile/assets/formi");
const BG_TOL = 56; // 감지된 배경색에서 이만큼 안쪽이면 배경
const PAD_RATIO = 0.08;
const KEEP_RATIO = 0.32; // 가장 큰 덩어리 대비 이 비율 이상만 캐릭터로 인정

// 모델이 두른 어두운 테두리 프레임을 잘라낸다 (검정 영역만 벗겨낸다).
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
  if (bright(2, 2) < 90 || bright(width - 3, height - 3) < 90) {
    // 검정 프레임(어두움) 을 지나 콘텐츠가 시작될 때까지만 이동
    while (left < midX && bright(left, midY) < 120) left++;
    while (right > midX && bright(right, midY) < 120) right--;
    while (top < midY && bright(midX, top) < 120) top++;
    while (bottom > midY && bright(midX, bottom) < 120) bottom--;
  }
  return { left, top, right, bottom };
}

function sampleBg(png) {
  const { width, height, data } = png;
  const pts = [
    [3, 3],
    [width - 4, 3],
    [3, height - 4],
    [width - 4, height - 4],
    [width >> 1, 3],
    [width >> 1, height - 4],
    [3, height >> 1],
    [width - 4, height >> 1]
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  for (const [x, y] of pts) {
    const o = (y * width + x) * 4;
    r += data[o];
    g += data[o + 1];
    b += data[o + 2];
  }
  return [r / pts.length, g / pts.length, b / pts.length];
}

// 가장자리에서 flood fill 로 배경을 투명 처리한다.
function floodTransparent(png, bg) {
  const { width, height, data } = png;
  const visited = new Uint8Array(width * height);
  const stack = [];
  const isBg = (o) => {
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    const nearBg =
      Math.abs(r - bg[0]) <= BG_TOL &&
      Math.abs(g - bg[1]) <= BG_TOL &&
      Math.abs(b - bg[2]) <= BG_TOL;
    const nearBlack = r <= 30 && g <= 30 && b <= 30;
    return nearBg || nearBlack;
  };
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    if (!isBg(i * 4)) return;
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

// 불투명 연결 덩어리를 모두 찾는다.
function components(png) {
  const { width, height, data } = png;
  const total = width * height;
  const label = new Int32Array(total).fill(-1);
  const comps = [];
  for (let start = 0; start < total; start++) {
    if (data[start * 4 + 3] <= 20 || label[start] !== -1) continue;
    const id = comps.length;
    let size = 0;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    const stack = [start];
    label[start] = id;
    while (stack.length) {
      const p = stack.pop();
      size++;
      const x = p % width;
      const y = (p / width) | 0;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      for (const [nx, ny] of [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (label[ni] !== -1 || data[ni * 4 + 3] <= 20) continue;
        label[ni] = id;
        stack.push(ni);
      }
    }
    comps.push({ id, size, minX, minY, maxX, maxY });
  }
  return { label, comps };
}

function main() {
  const name = process.argv[2];
  if (!name) {
    console.error("사용법: node slice-formi-strip.mjs <name>");
    process.exit(1);
  }
  const stripPath = path.join(OUT_DIR, `${name}-strip.png`);
  if (!fs.existsSync(stripPath)) {
    console.error(`스트립 없음: ${name}-strip.png`);
    process.exit(1);
  }
  const raw = PNG.sync.read(fs.readFileSync(stripPath));

  const t = trimDarkFrame(raw);
  const w = t.right - t.left + 1;
  const h = t.bottom - t.top + 1;
  const sheet = new PNG({ width: w, height: h });
  PNG.bitblt(raw, sheet, t.left, t.top, w, h, 0, 0);

  floodTransparent(sheet, sampleBg(sheet));

  const { label, comps } = components(sheet);
  if (comps.length === 0) {
    console.error(`${name}: 캐릭터를 못 찾음`);
    process.exit(1);
  }
  // 가장 큰 덩어리 기준으로 캐릭터 프레임만 추린다 (테두리 선·잡티·빈 칸 제거).
  // 캐릭터는 bbox 를 어느 정도 채우지만, 셀 테두리 박스는 얇은 링이라 채움 비율이 낮다.
  const maxSize = comps.reduce((m, c) => Math.max(m, c.size), 0);
  const chars = comps.filter((c) => {
    if (c.size < maxSize * KEEP_RATIO) return false;
    const area = (c.maxX - c.minX + 1) * (c.maxY - c.minY + 1);
    const fill = c.size / area;
    return fill >= 0.22;
  });

  // 행 우선 정렬 (centroidY 로 행 묶고, 행 안에서 x 순).
  const avgH =
    chars.reduce((s, c) => s + (c.maxY - c.minY + 1), 0) / chars.length;
  chars.sort((a, b) => (a.minY + a.maxY) / 2 - (b.minY + b.maxY) / 2);
  const rows = [];
  for (const c of chars) {
    const cy = (c.minY + c.maxY) / 2;
    const row = rows[rows.length - 1];
    if (row && cy - row.cy < avgH * 0.55) {
      row.items.push(c);
    } else {
      rows.push({ cy, items: [c] });
    }
  }
  const ordered = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.minX - b.minX);
    ordered.push(...row.items);
  }

  // 공통 정사각 캔버스 (가장 큰 프레임 기준, 바닥 정렬).
  let cwMax = 0;
  let chMax = 0;
  for (const c of ordered) {
    cwMax = Math.max(cwMax, c.maxX - c.minX + 1);
    chMax = Math.max(chMax, c.maxY - c.minY + 1);
  }
  const pad = Math.round(Math.max(cwMax, chMax) * PAD_RATIO);
  const side = Math.max(cwMax, chMax) + pad * 2;

  ordered.forEach((c, i) => {
    const cw = c.maxX - c.minX + 1;
    const ch = c.maxY - c.minY + 1;
    const out = new PNG({ width: side, height: side });
    out.data.fill(0);
    const dx = Math.round((side - cw) / 2);
    const dy = side - pad - ch;
    // 해당 덩어리 픽셀만 복사 (다른 덩어리가 bbox 안에 겹쳐도 배제).
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const si = (c.minY + y) * w + (c.minX + x);
        if (label[si] !== c.id) continue;
        const so = si * 4;
        const di = ((dy + y) * side + (dx + x)) * 4;
        out.data[di] = sheet.data[so];
        out.data[di + 1] = sheet.data[so + 1];
        out.data[di + 2] = sheet.data[so + 2];
        out.data[di + 3] = sheet.data[so + 3];
      }
    }
    fs.writeFileSync(path.join(OUT_DIR, `${name}-f${i}.png`), PNG.sync.write(out));
  });
  console.log(`${name}: ${ordered.length} 프레임 (${side}x${side})`);
}

main();
