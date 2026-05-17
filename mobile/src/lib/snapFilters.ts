// 스냅 사진 필터. 사진 위에 얹는 반투명 색 오버레이로 분위기를 입힌다.
// 메타데이터로만 저장되던 필터를 실제 사진에 보이게 한다.
export type FilterOverlay = { backgroundColor: string } | null;

const overlays: Record<string, string> = {
  맑은빛: "rgba(255, 244, 214, 0.20)",
  필름: "rgba(116, 90, 58, 0.26)",
  집중: "rgba(66, 88, 108, 0.24)",
  새벽: "rgba(84, 102, 168, 0.28)",
  단백질: "rgba(232, 142, 64, 0.22)"
};

// 필터 이름에 맞는 오버레이 스타일을 돌려준다. 없으면 null.
export function filterOverlay(filter: string | undefined | null): FilterOverlay {
  if (!filter) {
    return null;
  }
  const color = overlays[filter];
  return color ? { backgroundColor: color } : null;
}
