import type { HabitCategory, Locale, PersonaStampPosition, PlaceType, TabId } from "../types/habit";

export const defaultLocale: Locale = "ko";
export const supportedLocales = ["ko", "en"] as const;

export const localeOptions: { id: Locale; label: string; shortLabel: string }[] = [
  { id: "ko", label: "한국어", shortLabel: "KO" },
  { id: "en", label: "English", shortLabel: "EN" }
];

export type TranslationKey =
  | "language.label"
  | "nav.main"
  | "tabs.today"
  | "tabs.snap"
  | "tabs.home"
  | "tabs.meet"
  | "tabs.report"
  | "today.title"
  | "today.captureCta"
  | "today.onboarding.eyebrow"
  | "today.onboarding.title"
  | "today.onboarding.body"
  | "today.onboarding.stepSnap"
  | "today.onboarding.stepHome"
  | "today.onboarding.stepReport"
  | "today.onboarding.primary"
  | "today.onboarding.dismiss"
  | "snap.title"
  | "snap.emptyPhoto"
  | "snap.savedPhoto"
  | "snap.photoHelp"
  | "snap.filter"
  | "snap.sticker"
  | "snap.proofStamp"
  | "snap.category"
  | "snap.place"
  | "snap.memo"
  | "snap.memoPlaceholder"
  | "snap.save"
  | "snap.shareImage"
  | "snap.shareHelp"
  | "snap.sharePreparing"
  | "snap.shareReady"
  | "snap.shareNoPhoto"
  | "snap.shareError"
  | "snap.saveFeedback.title"
  | "snap.saveFeedback.body"
  | "snap.saveFeedback.home"
  | "snap.saveFeedback.report"
  | "snap.saveFeedback.meet"
  | "snap.imageOnlyError"
  | "snap.imageLoadError"
  | "proof.time"
  | "proof.count"
  | "proof.persona"
  | "stampPosition.title"
  | "stampPosition.topLeft"
  | "stampPosition.topRight"
  | "stampPosition.bottomLeft"
  | "stampPosition.bottomRight"
  | "category.study"
  | "category.meal"
  | "category.exercise"
  | "category.reading"
  | "category.cleaning"
  | "category.selfcare"
  | "category.hobby"
  | "place.home"
  | "place.library"
  | "place.school"
  | "place.cafe"
  | "place.gym"
  | "place.restaurant"
  | "place.outdoors"
  | "place.other";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  ko: {
    "language.label": "언어 선택",
    "nav.main": "주요 화면",
    "tabs.today": "오늘",
    "tabs.snap": "스냅",
    "tabs.home": "집",
    "tabs.meet": "모임",
    "tabs.report": "리포트",
    "today.title": "오늘의 기록",
    "today.captureCta": "오늘의 한 컷 남기기",
    "today.onboarding.eyebrow": "첫 30초",
    "today.onboarding.title": "스냅 하나로 앱이 움직여요",
    "today.onboarding.body":
      "처음엔 한 컷만 남겨도 충분해요. 그 한 컷이 집, 모임, 리포트로 이어집니다.",
    "today.onboarding.stepSnap": "스냅을 남기면",
    "today.onboarding.stepHome": "집에서 페르소나가 반응해요",
    "today.onboarding.stepReport": "리포트가 숨은 습관을 찾아요",
    "today.onboarding.primary": "첫 스냅 찍기",
    "today.onboarding.dismiss": "안내 닫기",
    "snap.title": "오늘의 한 컷",
    "snap.emptyPhoto": "스냅을 찍어보세요",
    "snap.savedPhoto": "새 스냅 저장됨",
    "snap.photoHelp": "찍고 꾸미면 페르소나의 하루에 바로 붙어요",
    "snap.filter": "필터",
    "snap.sticker": "스티커",
    "snap.proofStamp": "인증 도장",
    "snap.category": "어떤 순간인가요?",
    "snap.place": "어디에서 남겼나요?",
    "snap.memo": "한 줄 감정",
    "snap.memoPlaceholder": "예: 맑아서 조금 더 걸었다",
    "snap.save": "꾸며서 올리기",
    "snap.shareImage": "공유 이미지 저장",
    "snap.shareHelp": "친구에게 보낼 수 있는 PNG로 저장돼요",
    "snap.sharePreparing": "공유 이미지 준비 중",
    "snap.shareReady": "공유 이미지 저장됨",
    "snap.shareNoPhoto": "사진을 먼저 선택해 주세요.",
    "snap.shareError": "공유 이미지를 만들지 못했어요.",
    "snap.saveFeedback.title": "스냅 저장 완료",
    "snap.saveFeedback.body": "집, 모임, 리포트에 바로 반영됐어요.",
    "snap.saveFeedback.home": "집에서 보기",
    "snap.saveFeedback.report": "리포트 보기",
    "snap.saveFeedback.meet": "모임 추천 보기",
    "snap.imageOnlyError": "이미지 파일만 선택할 수 있어요.",
    "snap.imageLoadError": "이미지를 불러오지 못했어요.",
    "proof.time": "시간 도장",
    "proof.count": "횟수 도장",
    "proof.persona": "페르소나 도장",
    "stampPosition.title": "도장 위치",
    "stampPosition.topLeft": "왼쪽 위",
    "stampPosition.topRight": "오른쪽 위",
    "stampPosition.bottomLeft": "왼쪽 아래",
    "stampPosition.bottomRight": "오른쪽 아래",
    "category.study": "공부",
    "category.meal": "식단",
    "category.exercise": "운동",
    "category.reading": "독서",
    "category.cleaning": "정리",
    "category.selfcare": "셀프케어",
    "category.hobby": "취미",
    "place.home": "집",
    "place.library": "도서관",
    "place.school": "학교",
    "place.cafe": "카페",
    "place.gym": "헬스장",
    "place.restaurant": "식당",
    "place.outdoors": "야외",
    "place.other": "기타"
  },
  en: {
    "language.label": "Language",
    "nav.main": "Main screens",
    "tabs.today": "Today",
    "tabs.snap": "Snap",
    "tabs.home": "Home",
    "tabs.meet": "Meet",
    "tabs.report": "Report",
    "today.title": "Today's record",
    "today.captureCta": "Capture today's moment",
    "today.onboarding.eyebrow": "First 30 seconds",
    "today.onboarding.title": "One snap starts the loop",
    "today.onboarding.body":
      "One photo is enough to begin. That moment feeds Home, Meet, and Report.",
    "today.onboarding.stepSnap": "Capture a snap",
    "today.onboarding.stepHome": "Your persona reacts at home",
    "today.onboarding.stepReport": "Report finds hidden habits",
    "today.onboarding.primary": "Take first snap",
    "today.onboarding.dismiss": "Hide guide",
    "snap.title": "Today's snap",
    "snap.emptyPhoto": "Take a snap",
    "snap.savedPhoto": "New snap saved",
    "snap.photoHelp": "Decorate a moment and attach it to your persona's day",
    "snap.filter": "Filter",
    "snap.sticker": "Sticker",
    "snap.proofStamp": "Proof stamps",
    "snap.category": "What kind of moment?",
    "snap.place": "Where did it happen?",
    "snap.memo": "One-line feeling",
    "snap.memoPlaceholder": "Example: the clear weather made me walk more",
    "snap.save": "Post with style",
    "snap.shareImage": "Save share image",
    "snap.shareHelp": "Downloads a PNG you can share",
    "snap.sharePreparing": "Preparing share image",
    "snap.shareReady": "Share image saved",
    "snap.shareNoPhoto": "Choose a photo first.",
    "snap.shareError": "Couldn't create the share image.",
    "snap.saveFeedback.title": "Snap saved",
    "snap.saveFeedback.body": "Home, Meet, and Report have been updated.",
    "snap.saveFeedback.home": "View Home",
    "snap.saveFeedback.report": "View Report",
    "snap.saveFeedback.meet": "View Meet",
    "snap.imageOnlyError": "Please choose an image file.",
    "snap.imageLoadError": "Couldn't load this image.",
    "proof.time": "Time stamp",
    "proof.count": "Count stamp",
    "proof.persona": "Persona stamp",
    "stampPosition.title": "Stamp position",
    "stampPosition.topLeft": "Top left",
    "stampPosition.topRight": "Top right",
    "stampPosition.bottomLeft": "Bottom left",
    "stampPosition.bottomRight": "Bottom right",
    "category.study": "Study",
    "category.meal": "Meal",
    "category.exercise": "Exercise",
    "category.reading": "Reading",
    "category.cleaning": "Cleaning",
    "category.selfcare": "Self-care",
    "category.hobby": "Hobby",
    "place.home": "Home",
    "place.library": "Library",
    "place.school": "School",
    "place.cafe": "Cafe",
    "place.gym": "Gym",
    "place.restaurant": "Restaurant",
    "place.outdoors": "Outdoors",
    "place.other": "Other"
  }
};

const tabLabelKeys: Record<TabId, TranslationKey> = {
  today: "tabs.today",
  snap: "tabs.snap",
  home: "tabs.home",
  meet: "tabs.meet",
  report: "tabs.report"
};

const categoryLabelKeys: Record<HabitCategory, TranslationKey> = {
  study: "category.study",
  meal: "category.meal",
  exercise: "category.exercise",
  reading: "category.reading",
  cleaning: "category.cleaning",
  selfcare: "category.selfcare",
  hobby: "category.hobby"
};

const placeLabelKeys: Record<PlaceType, TranslationKey> = {
  home: "place.home",
  library: "place.library",
  school: "place.school",
  cafe: "place.cafe",
  gym: "place.gym",
  restaurant: "place.restaurant",
  outdoors: "place.outdoors",
  other: "place.other"
};

const personaStampPositionLabelKeys: Record<PersonaStampPosition, TranslationKey> = {
  "top-left": "stampPosition.topLeft",
  "top-right": "stampPosition.topRight",
  "bottom-left": "stampPosition.bottomLeft",
  "bottom-right": "stampPosition.bottomRight"
};

export function normalizeLocale(locale: unknown): Locale {
  return locale === "en" || locale === "ko" ? locale : defaultLocale;
}

export function t(locale: Locale, key: TranslationKey) {
  return translations[locale][key] ?? translations[defaultLocale][key];
}

export function getTabLabel(tabId: TabId, locale: Locale) {
  return t(locale, tabLabelKeys[tabId]);
}

export function getCategoryLabelForLocale(category: HabitCategory, locale: Locale) {
  return t(locale, categoryLabelKeys[category]);
}

export function getPlaceLabelForLocale(placeType: PlaceType, locale: Locale) {
  return t(locale, placeLabelKeys[placeType]);
}

export function getPersonaStampPositionLabel(position: PersonaStampPosition, locale: Locale) {
  return t(locale, personaStampPositionLabelKeys[position]);
}

export function formatSnapCountLabel(locale: Locale, count: number) {
  return locale === "ko" ? `오늘 ${count}회차` : `Today #${count}`;
}

export function formatTimeProofLabel(locale: Locale, timeLabel: string) {
  return locale === "ko" ? `${timeLabel} 인증` : `Proof ${timeLabel}`;
}
