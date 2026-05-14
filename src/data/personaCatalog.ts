import {
  Activity,
  BookOpen,
  Camera,
  Home,
  Medal,
  Moon,
  Sun,
  Users,
  Utensils,
  type LucideIcon
} from "lucide-react";
import type { HabitCategory, PersonaCard, PlaceType, TabId } from "../types/habit";

export type CategoryOption = {
  id: HabitCategory;
  label: string;
  icon: LucideIcon;
  tone: string;
};

export type TabOption = {
  id: TabId;
  label: string;
  icon: LucideIcon;
};

export const categoryOptions: CategoryOption[] = [
  { id: "study", label: "공부", icon: BookOpen, tone: "leaf" },
  { id: "meal", label: "식단", icon: Utensils, tone: "coral" },
  { id: "exercise", label: "운동", icon: Activity, tone: "blue" },
  { id: "reading", label: "독서", icon: BookOpen, tone: "gold" },
  { id: "cleaning", label: "정리", icon: Home, tone: "mint" },
  { id: "selfcare", label: "셀프케어", icon: Moon, tone: "ink" }
];

export const placeOptions: PlaceType[] = [
  "home",
  "library",
  "school",
  "cafe",
  "gym",
  "restaurant",
  "outdoors"
];

export const tabs: TabOption[] = [
  { id: "today", label: "오늘", icon: Sun },
  { id: "snap", label: "스냅", icon: Camera },
  { id: "home", label: "집", icon: Home },
  { id: "meet", label: "모임", icon: Users },
  { id: "report", label: "리포트", icon: Medal }
];

export const personaCatalog: PersonaCard[] = [
  {
    id: "dawn-learner",
    name: "새벽 학습자",
    activity: "창가 책상에서 오늘의 오답을 정리하는 중",
    place: "집 · 조용한 책상",
    level: 7,
    tone: "leaf",
    accessory: "study",
    tags: ["아침집중", "도서관형", "꾸준함"],
    roomItem: "원목 책상",
    outfit: "집중 후드"
  },
  {
    id: "routine-runner",
    name: "루틴 러너",
    activity: "러닝화를 말리고 스트레칭을 하는 중",
    place: "야외 · 성수천",
    level: 5,
    tone: "blue",
    accessory: "exercise",
    tags: ["밤러닝", "회복", "심폐루틴"],
    roomItem: "러닝 트랙 매트",
    outfit: "바람막이"
  },
  {
    id: "clean-meal",
    name: "클린식단러",
    activity: "내일 도시락 재료를 고르는 중",
    place: "집 · 작은 주방",
    level: 4,
    tone: "coral",
    accessory: "meal",
    tags: ["단백질", "물마시기", "가벼운 점심"],
    roomItem: "그린 식탁",
    outfit: "앞치마"
  },
  {
    id: "page-collector",
    name: "페이지 수집가",
    activity: "카페 구석에서 책갈피를 옮기는 중",
    place: "카페 · 창가 자리",
    level: 3,
    tone: "leaf",
    accessory: "reading",
    tags: ["독서", "조용한 몰입", "기록"],
    roomItem: "낮은 서가",
    outfit: "니트 조끼"
  },
  {
    id: "reset-maker",
    name: "방정리 장인",
    activity: "책상 위 물건을 색깔별로 정리하는 중",
    place: "집 · 정리된 방",
    level: 3,
    tone: "blue",
    accessory: "cleaning",
    tags: ["공간리셋", "정돈", "시작전 루틴"],
    roomItem: "라벨 정리함",
    outfit: "포켓 앞치마"
  },
  {
    id: "healthy-exam",
    name: "건강관리형 수험생",
    activity: "문제집 옆에 물컵과 러닝화를 두는 중",
    place: "집 · 복합 루틴존",
    level: 6,
    tone: "coral",
    accessory: "group",
    tags: ["공부+운동", "회복", "균형"],
    roomItem: "집중 스탠드",
    outfit: "트레이닝 셋업"
  }
];

const personaByCategory: Record<HabitCategory, string> = {
  study: "dawn-learner",
  meal: "clean-meal",
  exercise: "routine-runner",
  reading: "page-collector",
  cleaning: "reset-maker",
  selfcare: "healthy-exam",
  hobby: "healthy-exam"
};

export function findPersonaByCategory(category: HabitCategory): PersonaCard {
  const personaId = personaByCategory[category];
  return personaCatalog.find((persona) => persona.id === personaId) ?? personaCatalog[0];
}

export const filterOptions = ["맑은빛", "필름", "집중", "새벽", "단백질"];
export const stickerOptions = ["🔥 루틴", "📚 공부", "🏃 러닝", "🥗 식단", "✨ 성장"];
export const roomItems = ["원목 책상", "낮은 서가", "러닝 매트", "그린 식탁"];
export const outfitItems = ["집중 후드", "바람막이", "앞치마", "니트 조끼"];
