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
} from "lucide-react-native";
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
    category: "study",
    name: { ko: "새벽 학습자", en: "Dawn learner" },
    activity: {
      ko: "창가 책상에서 오늘의 오답을 정리하는 중",
      en: "Sorting today's mistakes at the window desk"
    },
    place: { ko: "집 · 조용한 책상", en: "Home · quiet desk" },
    level: 7,
    tone: "leaf",
    accessory: "study",
    tags: ["아침집중", "도서관형", "꾸준함"],
    roomItem: "원목 책상",
    outfit: "집중 후드"
  },
  {
    id: "routine-runner",
    category: "exercise",
    name: { ko: "루틴 러너", en: "Routine runner" },
    activity: {
      ko: "러닝화를 말리고 스트레칭을 하는 중",
      en: "Drying running shoes and stretching"
    },
    place: { ko: "야외 · 성수천", en: "Outdoors · Seongsucheon" },
    level: 5,
    tone: "blue",
    accessory: "exercise",
    tags: ["밤러닝", "회복", "심폐루틴"],
    roomItem: "러닝 트랙 매트",
    outfit: "바람막이"
  },
  {
    id: "clean-meal",
    category: "meal",
    name: { ko: "클린식단러", en: "Clean meal keeper" },
    activity: {
      ko: "내일 도시락 재료를 고르는 중",
      en: "Picking tomorrow's lunchbox ingredients"
    },
    place: { ko: "집 · 작은 주방", en: "Home · small kitchen" },
    level: 4,
    tone: "coral",
    accessory: "meal",
    tags: ["단백질", "물마시기", "가벼운 점심"],
    roomItem: "그린 식탁",
    outfit: "앞치마"
  },
  {
    id: "page-collector",
    category: "reading",
    name: { ko: "페이지 수집가", en: "Page collector" },
    activity: {
      ko: "카페 구석에서 책갈피를 옮기는 중",
      en: "Moving the bookmark in a cafe corner"
    },
    place: { ko: "카페 · 창가 자리", en: "Cafe · window seat" },
    level: 3,
    tone: "leaf",
    accessory: "reading",
    tags: ["독서", "조용한 몰입", "기록"],
    roomItem: "낮은 서가",
    outfit: "니트 조끼"
  },
  {
    id: "reset-maker",
    category: "cleaning",
    name: { ko: "방정리 장인", en: "Room reset master" },
    activity: {
      ko: "책상 위 물건을 색깔별로 정리하는 중",
      en: "Sorting desk items by color"
    },
    place: { ko: "집 · 정리된 방", en: "Home · tidy room" },
    level: 3,
    tone: "blue",
    accessory: "cleaning",
    tags: ["공간리셋", "정돈", "시작전 루틴"],
    roomItem: "라벨 정리함",
    outfit: "포켓 앞치마"
  },
  {
    id: "healthy-exam",
    category: "selfcare",
    name: { ko: "건강관리형 수험생", en: "Balanced exam keeper" },
    activity: {
      ko: "문제집 옆에 물컵과 러닝화를 두는 중",
      en: "Placing water and running shoes by the workbook"
    },
    place: { ko: "집 · 복합 루틴존", en: "Home · hybrid routine zone" },
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
