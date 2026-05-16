// Formi 캐릭터 PNG 매핑. RN 은 동적 require 가 안 되므로 모든 자산을 정적으로 등록한다.
import type { HabitCategory } from "../types/habit";
// idle 애니메이션 프레임 묶음 (캐릭터 시트에서 잘라낸 N프레임). build-frame-manifest.mjs 가 생성한다.
import { frameSets } from "./formiFrames";

export type FormiStage = "seed" | "sprout" | "identity" | "master";

const images = {
  seed: require("../../assets/formi/seed.png"),
  empty: require("../../assets/formi/empty.png"),
  icon: require("../../assets/formi/icon.png"),
  splash: require("../../assets/formi/splash.png"),
  "study-sprout": require("../../assets/formi/study-sprout.png"),
  "study-identity": require("../../assets/formi/study-identity.png"),
  "study-master": require("../../assets/formi/study-master.png"),
  "exercise-sprout": require("../../assets/formi/exercise-sprout.png"),
  "exercise-identity": require("../../assets/formi/exercise-identity.png"),
  "exercise-master": require("../../assets/formi/exercise-master.png"),
  "meal-sprout": require("../../assets/formi/meal-sprout.png"),
  "meal-identity": require("../../assets/formi/meal-identity.png"),
  "meal-master": require("../../assets/formi/meal-master.png"),
  "reading-sprout": require("../../assets/formi/reading-sprout.png"),
  "reading-identity": require("../../assets/formi/reading-identity.png"),
  "reading-master": require("../../assets/formi/reading-master.png"),
  "cleaning-sprout": require("../../assets/formi/cleaning-sprout.png"),
  "cleaning-identity": require("../../assets/formi/cleaning-identity.png"),
  "cleaning-master": require("../../assets/formi/cleaning-master.png"),
  "selfcare-sprout": require("../../assets/formi/selfcare-sprout.png"),
  "selfcare-identity": require("../../assets/formi/selfcare-identity.png"),
  "selfcare-master": require("../../assets/formi/selfcare-master.png"),
  "room-warm": require("../../assets/formi/room-warm-v2.png"),
  "room-sage": require("../../assets/formi/room-sage-v2.png"),
  "room-blush": require("../../assets/formi/room-blush-v2.png"),
  "room-dusk": require("../../assets/formi/room-dusk-v2.png"),
  "item-plant": require("../../assets/formi/item-plant.png"),
  "item-lamp": require("../../assets/formi/item-lamp.png"),
  "item-rug": require("../../assets/formi/item-rug.png"),
  "item-shelf": require("../../assets/formi/item-shelf.png")
} as const;


// PNG 가 없는 카테고리 (hobby) 는 가장 가까운 카테고리로 대체한다.
const categoryFallback: Record<HabitCategory, HabitCategory> = {
  study: "study",
  meal: "meal",
  exercise: "exercise",
  reading: "reading",
  cleaning: "cleaning",
  selfcare: "selfcare",
  hobby: "selfcare"
};

export function stageForLevel(level: number): FormiStage {
  if (level >= 8) return "master";
  if (level >= 5) return "identity";
  if (level >= 2) return "sprout";
  return "seed";
}

export function formiImageFor(category: HabitCategory, level: number) {
  const stage = stageForLevel(level);
  if (stage === "seed") {
    return images.seed;
  }
  const mappedCategory = categoryFallback[category] ?? "selfcare";
  const key = `${mappedCategory}-${stage}` as keyof typeof images;
  return images[key] ?? images.seed;
}

// 카테고리/레벨에 맞는 idle 애니메이션 프레임 묶음을 돌려준다.
export function formiFramesFor(category: HabitCategory, level: number) {
  const stage = stageForLevel(level);
  if (stage === "seed") {
    return frameSets.seed;
  }
  const mappedCategory = categoryFallback[category] ?? "selfcare";
  const key = `${mappedCategory}-${stage}` as keyof typeof frameSets;
  return frameSets[key] ?? frameSets.seed;
}

export const formiSeedFrames = frameSets.seed;
export const formiSeedImage = images.seed;
export const formiEmptyImage = images.empty;

// 방 배경 (캐릭터가 그 위에 선다)
export type RoomScene = { id: string; label: string };
export const roomScenes: RoomScene[] = [
  { id: "room-warm", label: "따뜻한 방" },
  { id: "room-sage", label: "세이지 방" },
  { id: "room-blush", label: "블러시 방" },
  { id: "room-dusk", label: "노을 방" }
];

// 방 꾸미기 아이템 (방 배경 위에 얹는다)
export type RoomDecor = { id: string; label: string };
export const roomDecors: RoomDecor[] = [
  { id: "item-rug", label: "러그" },
  { id: "item-shelf", label: "책장" },
  { id: "item-plant", label: "화분" },
  { id: "item-lamp", label: "조명" }
];

export function roomImageFor(sceneId: string) {
  const key = sceneId as keyof typeof images;
  return images[key] ?? images["room-warm"];
}

export function decorImageFor(decorId: string) {
  const key = decorId as keyof typeof images;
  return images[key] ?? images["item-plant"];
}
