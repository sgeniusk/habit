// Formi 캐릭터 PNG 매핑. RN 은 동적 require 가 안 되므로 모든 자산을 정적으로 등록한다.
import type { HabitCategory } from "../types/habit";

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
  "selfcare-master": require("../../assets/formi/selfcare-master.png")
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

export const formiSeedImage = images.seed;
export const formiEmptyImage = images.empty;
