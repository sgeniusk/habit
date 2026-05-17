// 페르소나의 방 — 아이소메트릭 꾸미기 엔진.
// 바닥 다이아몬드 그리드 + 가구 배치(깊이 정렬) + 아이템 트레이 + 영속화.
// 가구는 임시 아이소메트릭 도형이며, 디자이너의 스프라이트로 교체할 예정이다.
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Polygon } from "react-native-svg";

import { FormiAvatar } from "./FormiAvatar";
import { colors, radii } from "../lib/tokens";
import type { HabitCategory } from "../types/habit";

const GRID = 5;
const TILE_W = 54;
const TILE_H = 27;
const WALL_H = 66;
const ORIGIN_X = 150;
const ORIGIN_Y = WALL_H + 22;
const CANVAS_W = 300;
const CANVAS_H = ORIGIN_Y + (GRID - 1) * TILE_H + TILE_H + 26;
const CHAR_TILE = { col: 2, row: 2 };
const STORAGE_KEY = "formi:roomLayout";

type FurnitureKind = {
  id: string;
  label: string;
  color: string;
  h: number; // 아이소메트릭 높이 (0 이면 러그처럼 바닥에 깔린다)
};

const KINDS: FurnitureKind[] = [
  { id: "bed", label: "침대", color: "#cf9f86", h: 24 },
  { id: "desk", label: "책상", color: "#b98c5f", h: 34 },
  { id: "shelf", label: "책장", color: "#9cbfa6", h: 46 },
  { id: "plant", label: "화분", color: "#79a866", h: 32 },
  { id: "lamp", label: "조명", color: "#e6c060", h: 42 },
  { id: "table", label: "탁자", color: "#c2925f", h: 18 },
  { id: "rug", label: "러그", color: "#d98f86", h: 0 }
];

type PlacedItem = { id: string; kind: string; col: number; row: number };

function isoX(col: number, row: number): number {
  return (col - row) * (TILE_W / 2);
}
function isoY(col: number, row: number): number {
  return (col + row) * (TILE_H / 2);
}
function tileCenter(col: number, row: number): { x: number; y: number } {
  return { x: ORIGIN_X + isoX(col, row), y: ORIGIN_Y + isoY(col, row) };
}

// hex 색을 비율만큼 밝게/어둡게 (큐브 면 음영용)
function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((n >> 16) & 255) * factor));
  const g = Math.min(255, Math.round(((n >> 8) & 255) * factor));
  const b = Math.min(255, Math.round((n & 255) * factor));
  return `rgb(${r}, ${g}, ${b})`;
}

// 다이아몬드 꼭짓점 문자열 (SVG points)
function diamondPoints(cx: number, cy: number): string {
  return `${cx},${cy - TILE_H / 2} ${cx + TILE_W / 2},${cy} ${cx},${cy + TILE_H / 2} ${cx - TILE_W / 2},${cy}`;
}

export function IsoRoom({
  category,
  level
}: {
  category: HabitCategory;
  level: number;
}) {
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [pendingKind, setPendingKind] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setPlaced(parsed as PlacedItem[]);
          } catch {
            // 손상된 저장값은 무시
          }
        }
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(placed)).catch(() => {
      // 저장 실패는 다음 변경에서 재시도
    });
  }, [placed, loaded]);

  function isOccupied(col: number, row: number): boolean {
    if (col === CHAR_TILE.col && row === CHAR_TILE.row) return true;
    return placed.some((item) => item.col === col && item.row === row);
  }

  function handleTilePress(col: number, row: number) {
    if (!pendingKind || isOccupied(col, row)) return;
    setPlaced((current) => [
      ...current,
      { id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`, kind: pendingKind, col, row }
    ]);
  }

  function removeItem(id: string) {
    setPlaced((current) => current.filter((item) => item.id !== id));
  }

  // 바닥 타일
  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      tiles.push({ col, row });
    }
  }

  // 벽 꼭짓점
  const top = tileCenter(0, 0);
  const right = tileCenter(GRID - 1, 0);
  const left = tileCenter(0, GRID - 1);
  const topC = { x: top.x, y: top.y - TILE_H / 2 };
  const rightC = { x: right.x + TILE_W / 2, y: right.y };
  const leftC = { x: left.x - TILE_W / 2, y: left.y };

  // 가구 + 캐릭터를 깊이순으로 정렬
  const actors = [
    ...placed.map((item) => ({ type: "item" as const, item, depth: item.col + item.row })),
    {
      type: "char" as const,
      item: null,
      depth: CHAR_TILE.col + CHAR_TILE.row
    }
  ].sort((a, b) => a.depth - b.depth);

  return (
    <View>
      <View style={styles.canvas}>
        <Svg width={CANVAS_W} height={CANVAS_H} style={StyleSheet.absoluteFill}>
          {/* 뒷벽 */}
          <Polygon
            points={`${topC.x},${topC.y} ${leftC.x},${leftC.y} ${leftC.x},${leftC.y - WALL_H} ${topC.x},${topC.y - WALL_H}`}
            fill="#e7ddc9"
          />
          <Polygon
            points={`${topC.x},${topC.y} ${rightC.x},${rightC.y} ${rightC.x},${rightC.y - WALL_H} ${topC.x},${topC.y - WALL_H}`}
            fill="#d8cdb6"
          />
          {/* 바닥 타일 */}
          {tiles.map(({ col, row }) => {
            const { x, y } = tileCenter(col, row);
            const tint = (col + row) % 2 === 0 ? "#cdb98f" : "#c4ae82";
            return (
              <Polygon
                key={`f-${col}-${row}`}
                points={diamondPoints(x, y)}
                fill={tint}
                stroke="#b6a079"
                strokeWidth={1}
              />
            );
          })}
        </Svg>

        {/* 배치용 타일 (투명 Pressable) */}
        {tiles.map(({ col, row }) => {
          const { x, y } = tileCenter(col, row);
          return (
            <Pressable
              key={`t-${col}-${row}`}
              onPress={() => handleTilePress(col, row)}
              style={{
                position: "absolute",
                left: x - TILE_W / 2,
                top: y - TILE_H / 2,
                width: TILE_W,
                height: TILE_H,
                zIndex: 1
              }}
            />
          );
        })}

        {/* 가구 + 캐릭터 (깊이순) */}
        {actors.map((actor) => {
          if (actor.type === "char") {
            const { x, y } = tileCenter(CHAR_TILE.col, CHAR_TILE.row);
            return (
              <View
                key="char"
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: x - 39,
                  top: y - 78 + 9,
                  zIndex: 10 + actor.depth
                }}
              >
                <FormiAvatar category={category} level={level} size={78} />
              </View>
            );
          }
          const kind = KINDS.find((k) => k.id === actor.item.kind);
          if (!kind) return null;
          return (
            <FurnitureSprite
              key={actor.item.id}
              kind={kind}
              col={actor.item.col}
              row={actor.item.row}
              depth={actor.depth}
              onPress={() => removeItem(actor.item.id)}
            />
          );
        })}
      </View>

      <Text style={styles.hint}>
        {pendingKind
          ? "방 안 빈 칸을 탭해서 놓아요. 가구를 탭하면 치워져요."
          : "아이템을 고른 뒤 방 안을 탭해 꾸며요."}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tray}
      >
        {KINDS.map((kind) => {
          const active = pendingKind === kind.id;
          return (
            <Pressable
              key={kind.id}
              style={[styles.trayItem, active && styles.trayItemActive]}
              onPress={() => setPendingKind(active ? null : kind.id)}
            >
              <View style={[styles.traySwatch, { backgroundColor: kind.color }]} />
              <Text style={[styles.trayLabel, active && styles.trayLabelActive]}>
                {kind.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// 가구 한 점 — 임시 아이소메트릭 큐브
function FurnitureSprite({
  kind,
  col,
  row,
  depth,
  onPress
}: {
  kind: FurnitureKind;
  col: number;
  row: number;
  depth: number;
  onPress: () => void;
}) {
  const { x: cx, y: cy } = tileCenter(col, row);
  const h = kind.h;
  const boxW = TILE_W;
  const boxH = TILE_H + h;
  const left = cx - TILE_W / 2;
  const topY = cy - TILE_H / 2 - h;

  // SVG 로컬 좌표 — 바닥 다이아몬드 중심
  const bcx = TILE_W / 2;
  const bcy = h + TILE_H / 2;
  const T = { x: bcx, y: bcy - TILE_H / 2 };
  const R = { x: bcx + TILE_W / 2, y: bcy };
  const B = { x: bcx, y: bcy + TILE_H / 2 };
  const L = { x: bcx - TILE_W / 2, y: bcy };

  return (
    <Pressable
      onPress={onPress}
      style={{ position: "absolute", left, top: topY, width: boxW, height: boxH, zIndex: 10 + depth }}
    >
      <Svg width={boxW} height={boxH}>
        {h > 0 ? (
          <>
            <Polygon
              points={`${L.x},${L.y} ${B.x},${B.y} ${B.x},${B.y - h} ${L.x},${L.y - h}`}
              fill={shade(kind.color, 0.82)}
            />
            <Polygon
              points={`${B.x},${B.y} ${R.x},${R.y} ${R.x},${R.y - h} ${B.x},${B.y - h}`}
              fill={shade(kind.color, 0.66)}
            />
          </>
        ) : null}
        <Polygon
          points={`${T.x},${T.y - h} ${R.x},${R.y - h} ${B.x},${B.y - h} ${L.x},${L.y - h}`}
          fill={h > 0 ? shade(kind.color, 1.12) : kind.color}
          stroke={shade(kind.color, 0.7)}
          strokeWidth={1}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_W,
    height: CANVAS_H,
    alignSelf: "center"
  },
  hint: {
    marginTop: 8,
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center"
  },
  tray: { gap: 8, paddingVertical: 10, paddingHorizontal: 2 },
  trayItem: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white
  },
  trayItemActive: { borderColor: colors.leaf, backgroundColor: colors.leafSoft },
  traySwatch: { width: 26, height: 26, borderRadius: 6 },
  trayLabel: { color: colors.ink, fontWeight: "600", fontSize: 11 },
  trayLabelActive: { color: colors.leaf }
});
