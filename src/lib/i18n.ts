import type {
  HabitCategory,
  Locale,
  LocalizedString,
  PersonaStampPosition,
  PlaceType,
  TabId
} from "../types/habit";

export function localize(value: LocalizedString | string, locale: Locale): string {
  if (typeof value === "string") {
    return value;
  }
  return value[locale] ?? value.ko;
}

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
  | "today.onboarding.dialogTitle"
  | "today.onboarding.title"
  | "today.onboarding.body"
  | "today.onboarding.stepTodayTitle"
  | "today.onboarding.stepTodayBody"
  | "today.onboarding.stepSnapTitle"
  | "today.onboarding.stepSnapBody"
  | "today.onboarding.stepRewardTitle"
  | "today.onboarding.stepRewardBody"
  | "today.onboarding.stepSnap"
  | "today.onboarding.stepHome"
  | "today.onboarding.stepReport"
  | "today.onboarding.primary"
  | "today.onboarding.next"
  | "today.onboarding.skip"
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
  | "snap.shareNext.title"
  | "snap.shareNext.body"
  | "snap.shareNext.meet"
  | "snap.shareNext.mission"
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
  | "place.other"
  | "insight.confidenceHigh"
  | "insight.confidenceMedium"
  | "insight.confidenceLow"
  | "insight.evidenceLabel"
  | "home.title"
  | "home.deckCountUnit"
  | "home.activityEyebrow"
  | "home.identityRowLabel"
  | "home.nicknameSubtitle"
  | "home.roleSubtitle"
  | "home.nicknameField"
  | "home.nicknamePlaceholder"
  | "home.nextLevel"
  | "home.evolutionLabel"
  | "home.unlocks"
  | "home.unlocksEmpty"
  | "home.appliedDecor"
  | "home.roomSubtitle"
  | "home.outfitSubtitle"
  | "home.roomDecor"
  | "home.outfitDecor"
  | "home.voiceTitle"
  | "home.voiceCute"
  | "home.voiceCuteDescription"
  | "home.voiceCalm"
  | "home.voiceCalmDescription"
  | "home.personaList"
  | "home.featuredPrefix"
  | "home.evolutionPending"
  | "home.rewardAreaLabel"
  | "home.progressAreaLabel"
  | "home.appliedDecorLabel"
  | "meet.title"
  | "meet.eyebrow"
  | "meet.iconAria"
  | "meet.heroEyebrow"
  | "meet.heroTitle"
  | "meet.heroDescription"
  | "meet.hiddenCountSuffix"
  | "meet.restoreHidden"
  | "meet.suggestionEyebrow"
  | "meet.matchSuffix"
  | "meet.feedbackAria"
  | "meet.feedbackPin"
  | "meet.feedbackLater"
  | "meet.feedbackHide"
  | "meet.allHiddenTitle"
  | "meet.allHiddenBody"
  | "meet.inviteRouteEyebrow"
  | "meet.inviteRouteTitle"
  | "meet.inviteRouteSubtitle"
  | "meet.inviteRouteBody"
  | "meet.inviteRouteAccept"
  | "meet.inviteWaiting"
  | "meet.inviteCompleted"
  | "meet.inviteCreated"
  | "meet.sharedXpSuffix"
  | "meet.inviteRoomEyebrow"
  | "meet.inviteRoomSuffix"
  | "meet.copyInvite"
  | "meet.prepareShare"
  | "meet.shareCopySuccess"
  | "meet.shareCopyManual"
  | "meet.shareMessageReady"
  | "meet.memberSavedSuffix"
  | "meet.groupPersonaAria"
  | "meet.groupProgressAria"
  | "meet.missionCompleted"
  | "meet.missionWaiting"
  | "meet.missionCompleteButton"
  | "meet.previewAccept"
  | "meet.feedbackPinMessage"
  | "meet.feedbackLaterMessage"
  | "meet.feedbackHideMessage"
  | "meet.restoreFeedbackMessage"
  | "today.weatherCardAria"
  | "today.journalEyebrow"
  | "today.journalModeTitle"
  | "today.journalModeAi"
  | "today.journalModeSolo"
  | "today.journalContextAria"
  | "today.journalHumidityPrefix"
  | "today.journalDistancePrefix"
  | "today.journalLineLabel"
  | "today.journalLinePlaceholder"
  | "today.journalSend"
  | "today.journalSoloIntro"
  | "today.journalPolishedLabel"
  | "today.metricSnap"
  | "today.metricPersonas"
  | "today.metricMeet"
  | "today.insightEyebrow"
  | "today.insightTitle"
  | "today.timelineTitle"
  | "report.title"
  | "report.weeklyEyebrow"
  | "report.modeAria"
  | "report.modeWeekly"
  | "report.modeMemory"
  | "report.metricWeeklySnap"
  | "report.metricFeaturedGrowth"
  | "report.metricHiddenPattern"
  | "report.aiHabitTitle"
  | "report.restoreHiddenInsights"
  | "report.restoreHiddenMessage"
  | "report.softenedMessage"
  | "report.hiddenMessage"
  | "report.softenButton"
  | "report.hideButton"
  | "report.memoryEyebrow"
  | "report.memoryTitle"
  | "report.memoryDescription"
  | "report.memoryFilterAria"
  | "report.memoryFilterTitle"
  | "report.memoryFilterPrefix"
  | "report.memoryFilterAll"
  | "report.memoryFilterMonth"
  | "report.memoryFilterPlace"
  | "report.memoryFilterPersona";

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
    "today.onboarding.dialogTitle": "첫 30초 도움말",
    "today.onboarding.title": "스냅 하나로 앱이 움직여요",
    "today.onboarding.body":
      "처음엔 한 컷만 남겨도 충분해요. 그 한 컷이 집, 모임, 리포트로 이어집니다.",
    "today.onboarding.stepTodayTitle": "오늘은 하루 기록의 입구예요",
    "today.onboarding.stepTodayBody":
      "날씨, 위치, 한 줄 감정을 보고 오늘 어떤 순간을 남길지 가볍게 고릅니다.",
    "today.onboarding.stepSnapTitle": "스냅에서 한 컷을 남겨요",
    "today.onboarding.stepSnapBody":
      "사진을 고르고 필터, 스티커, 시간/횟수/페르소나 도장을 붙여 기록합니다.",
    "today.onboarding.stepRewardTitle": "집과 리포트가 바로 반응해요",
    "today.onboarding.stepRewardBody":
      "저장하면 페르소나 집, 모임 추천, 리포트가 바로 업데이트됩니다.",
    "today.onboarding.stepSnap": "스냅을 남기면",
    "today.onboarding.stepHome": "집에서 페르소나가 반응해요",
    "today.onboarding.stepReport": "리포트가 숨은 습관을 찾아요",
    "today.onboarding.primary": "첫 스냅 찍기",
    "today.onboarding.next": "다음",
    "today.onboarding.skip": "건너뛰기",
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
    "snap.shareNext.title": "공유 다음 행동",
    "snap.shareNext.body": "저장한 이미지를 친구에게 보냈다면 모임이나 첫 미션으로 바로 이어가요.",
    "snap.shareNext.meet": "모임 초대 만들기",
    "snap.shareNext.mission": "첫 스냅 미션 보기",
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
    "place.other": "기타",
    "insight.confidenceHigh": "높음",
    "insight.confidenceMedium": "보통",
    "insight.confidenceLow": "낮음",
    "insight.evidenceLabel": "근거",
    "home.title": "페르소나의 집",
    "home.deckCountUnit": "종",
    "home.activityEyebrow": "지금 하는 일",
    "home.identityRowLabel": "페르소나 정체성",
    "home.nicknameSubtitle": "애칭",
    "home.roleSubtitle": "직업",
    "home.nicknameField": "페르소나 애칭",
    "home.nicknamePlaceholder": "예: 곰곰",
    "home.nextLevel": "다음 레벨까지",
    "home.evolutionLabel": "진화",
    "home.unlocks": "해금된 보상",
    "home.unlocksEmpty": "첫 스냅 보상 대기",
    "home.appliedDecor": "적용 중인 꾸미기",
    "home.roomSubtitle": "방",
    "home.outfitSubtitle": "의상",
    "home.roomDecor": "방 꾸미기",
    "home.outfitDecor": "페르소나 꾸미기",
    "home.voiceTitle": "말투/테마",
    "home.voiceCute": "귀여운 톤",
    "home.voiceCuteDescription": "장난스럽고 응원하는 말투",
    "home.voiceCalm": "차분한 톤",
    "home.voiceCalmDescription": "담백하고 기록 중심 말투",
    "home.personaList": "보유 페르소나",
    "home.featuredPrefix": "대표",
    "home.evolutionPending": "생활 스냅을 기다리는 중",
    "home.rewardAreaLabel": "성장 보상",
    "home.progressAreaLabel": "보상 진행률",
    "home.appliedDecorLabel": "적용 중인 꾸미기",
    "meet.title": "모임",
    "meet.eyebrow": "Together",
    "meet.iconAria": "친구 초대",
    "meet.heroEyebrow": "4명이 함께 성장 중",
    "meet.heroTitle": "아침 루틴 모임",
    "meet.heroDescription":
      "공부, 식단, 러닝 스냅이 섞이며 공동 페르소나가 차분한 실행형으로 자라고 있어요.",
    "meet.hiddenCountSuffix": "개",
    "meet.restoreHidden": "숨긴 추천 다시 보기",
    "meet.suggestionEyebrow": "AI 모임 제안",
    "meet.matchSuffix": "맞음",
    "meet.feedbackAria": "모임 추천 피드백",
    "meet.feedbackPin": "추천 고정",
    "meet.feedbackLater": "나중에 보기",
    "meet.feedbackHide": "관심 없음",
    "meet.allHiddenTitle": "추천을 모두 숨겼어요",
    "meet.allHiddenBody": "지금은 모임 제안을 쉬고, 생활 스냅이 더 쌓이면 다시 열어볼 수 있어요.",
    "meet.inviteRouteEyebrow": "Invite Link",
    "meet.inviteRouteTitle": "초대 링크로 들어왔어요",
    "meet.inviteRouteSubtitle": "초대",
    "meet.inviteRouteBody":
      "첫 생활 스냅을 남기면 공동 페르소나가 바로 자라요. 초대를 수락하면 모임 대기실에 들어갑니다.",
    "meet.inviteRouteAccept": "초대 수락하고 시작하기",
    "meet.inviteWaiting": "친구 1명 참여 대기",
    "meet.inviteCompleted": "미션 완료",
    "meet.inviteCreated": "초대 링크 생성됨",
    "meet.sharedXpSuffix": "공동 XP",
    "meet.inviteRoomEyebrow": "Invite Room",
    "meet.inviteRoomSuffix": "대기실",
    "meet.copyInvite": "초대 링크 복사",
    "meet.prepareShare": "공유 문구 만들기",
    "meet.shareCopySuccess": "링크 복사됨",
    "meet.shareCopyManual": "링크를 길게 눌러 복사해요",
    "meet.shareMessageReady": "공유 문구 준비됨",
    "meet.memberSavedSuffix": "저장됨",
    "meet.groupPersonaAria": "공동 페르소나 성장",
    "meet.groupProgressAria": "공동 페르소나 진행률",
    "meet.missionCompleted": "첫 스냅 완료",
    "meet.missionWaiting": "대기 중",
    "meet.missionCompleteButton": "완료하기",
    "meet.previewAccept": "초대 수락 미리보기",
    "meet.feedbackPinMessage": "고정했어요",
    "meet.feedbackLaterMessage": "나중에 다시 볼게요",
    "meet.feedbackHideMessage": "덜 보여줄게요",
    "meet.restoreFeedbackMessage": "숨긴 추천을 다시 볼게요",
    "today.weatherCardAria": "오늘 날씨와 지역",
    "today.journalEyebrow": "Journal",
    "today.journalModeTitle": "오늘 기록 방식",
    "today.journalModeAi": "AI랑 같이쓰기",
    "today.journalModeSolo": "혼자 기록하기",
    "today.journalContextAria": "오늘 일기 맥락",
    "today.journalHumidityPrefix": "습도",
    "today.journalDistancePrefix": "집에서",
    "today.journalLineLabel": "한 줄 일기",
    "today.journalLinePlaceholder": "예: 오늘은 괜히 멀리 걷고 싶었어",
    "today.journalSend": "정리해줘",
    "today.journalSoloIntro": "네 문장 그대로 남겨둘게. 오늘의 목소리를 먼저 믿어보자.",
    "today.journalPolishedLabel": "정리된 한 줄",
    "today.metricSnap": "오늘 스냅",
    "today.metricPersonas": "보유 페르소나",
    "today.metricMeet": "모임 기여",
    "today.insightEyebrow": "AI Insight",
    "today.insightTitle": "숨은 습관 발견",
    "today.timelineTitle": "오늘 남긴 기록",
    "report.title": "7일 생활 리포트",
    "report.weeklyEyebrow": "Weekly Loop",
    "report.modeAria": "리포트 보기 방식",
    "report.modeWeekly": "7일 요약",
    "report.modeMemory": "오래된 기억",
    "report.metricWeeklySnap": "주간 스냅",
    "report.metricFeaturedGrowth": "대표 성장",
    "report.metricHiddenPattern": "숨은 패턴",
    "report.aiHabitTitle": "AI가 발견한 숨은 습관",
    "report.restoreHiddenInsights": "숨긴 인사이트 다시 보기",
    "report.restoreHiddenMessage": "숨긴 인사이트를 다시 보여줄게요",
    "report.softenedMessage": "조금 더 부드럽게 볼게요",
    "report.hiddenMessage": "이런 분석은 덜 보여줄게요",
    "report.softenButton": "문구 순하게",
    "report.hideButton": "관심 없음",
    "report.memoryEyebrow": "Memory Search",
    "report.memoryTitle": "기억 더듬기",
    "report.memoryDescription":
      "오래된 스냅을 AI가 다시 꺼내서, 지금의 페르소나가 어디서 시작됐는지 묻습니다.",
    "report.memoryFilterAria": "기억 필터",
    "report.memoryFilterTitle": "기억 필터",
    "report.memoryFilterPrefix": "필터",
    "report.memoryFilterAll": "전체",
    "report.memoryFilterMonth": "월",
    "report.memoryFilterPlace": "장소",
    "report.memoryFilterPersona": "페르소나"
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
    "today.onboarding.dialogTitle": "First 30-second guide",
    "today.onboarding.title": "One snap starts the loop",
    "today.onboarding.body":
      "One photo is enough to begin. That moment feeds Home, Meet, and Report.",
    "today.onboarding.stepTodayTitle": "Today is your entry point",
    "today.onboarding.stepTodayBody":
      "Check the weather, place, and one-line feeling before choosing what to capture.",
    "today.onboarding.stepSnapTitle": "Capture one moment in Snap",
    "today.onboarding.stepSnapBody":
      "Pick a photo, then add a filter, sticker, and time/count/persona stamps.",
    "today.onboarding.stepRewardTitle": "Home and Report react right away",
    "today.onboarding.stepRewardBody":
      "Saving updates your persona home, meet suggestions, and report immediately.",
    "today.onboarding.stepSnap": "Capture a snap",
    "today.onboarding.stepHome": "Your persona reacts at home",
    "today.onboarding.stepReport": "Report finds hidden habits",
    "today.onboarding.primary": "Take first snap",
    "today.onboarding.next": "Next",
    "today.onboarding.skip": "Skip",
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
    "snap.shareNext.title": "Share next step",
    "snap.shareNext.body": "After sending the image, continue into a room invite or first mission.",
    "snap.shareNext.meet": "Create meet invite",
    "snap.shareNext.mission": "View first snap mission",
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
    "place.other": "Other",
    "insight.confidenceHigh": "High",
    "insight.confidenceMedium": "Medium",
    "insight.confidenceLow": "Low",
    "insight.evidenceLabel": "Evidence",
    "home.title": "Persona home",
    "home.deckCountUnit": "personas",
    "home.activityEyebrow": "Now doing",
    "home.identityRowLabel": "Persona identity",
    "home.nicknameSubtitle": "Nickname",
    "home.roleSubtitle": "Role",
    "home.nicknameField": "Persona nickname",
    "home.nicknamePlaceholder": "e.g. Curly",
    "home.nextLevel": "Until next level",
    "home.evolutionLabel": "Evolution",
    "home.unlocks": "Unlocked rewards",
    "home.unlocksEmpty": "Waiting for first snap reward",
    "home.appliedDecor": "Applied decor",
    "home.roomSubtitle": "Room",
    "home.outfitSubtitle": "Outfit",
    "home.roomDecor": "Room decor",
    "home.outfitDecor": "Persona decor",
    "home.voiceTitle": "Voice / theme",
    "home.voiceCute": "Cute tone",
    "home.voiceCuteDescription": "Playful and cheering voice",
    "home.voiceCalm": "Calm tone",
    "home.voiceCalmDescription": "Reserved and record-led voice",
    "home.personaList": "Owned personas",
    "home.featuredPrefix": "Featured",
    "home.evolutionPending": "Waiting for daily snaps",
    "home.rewardAreaLabel": "Growth rewards",
    "home.progressAreaLabel": "Reward progress",
    "home.appliedDecorLabel": "Applied decor",
    "meet.title": "Meet",
    "meet.eyebrow": "Together",
    "meet.iconAria": "Invite friends",
    "meet.heroEyebrow": "4 people growing together",
    "meet.heroTitle": "Morning routine meet",
    "meet.heroDescription": "Study, meal, and running snaps mix into a calm shared persona.",
    "meet.hiddenCountSuffix": "items",
    "meet.restoreHidden": "Show hidden suggestions",
    "meet.suggestionEyebrow": "AI meet suggestion",
    "meet.matchSuffix": "match",
    "meet.feedbackAria": "Meet suggestion feedback",
    "meet.feedbackPin": "Pin suggestion",
    "meet.feedbackLater": "Later",
    "meet.feedbackHide": "Not interested",
    "meet.allHiddenTitle": "All suggestions hidden",
    "meet.allHiddenBody":
      "Take a break from meet suggestions — they will return as you log more snaps.",
    "meet.inviteRouteEyebrow": "Invite Link",
    "meet.inviteRouteTitle": "Opened via invite link",
    "meet.inviteRouteSubtitle": "invite",
    "meet.inviteRouteBody":
      "Your first snap grows the shared persona. Accept the invite to enter the meet lobby.",
    "meet.inviteRouteAccept": "Accept invite and start",
    "meet.inviteWaiting": "1 friend waiting",
    "meet.inviteCompleted": "Mission complete",
    "meet.inviteCreated": "Invite link created",
    "meet.sharedXpSuffix": "shared XP",
    "meet.inviteRoomEyebrow": "Invite Room",
    "meet.inviteRoomSuffix": "lobby",
    "meet.copyInvite": "Copy invite link",
    "meet.prepareShare": "Make share message",
    "meet.shareCopySuccess": "Link copied",
    "meet.shareCopyManual": "Long-press the link to copy",
    "meet.shareMessageReady": "Share message ready",
    "meet.memberSavedSuffix": "saved",
    "meet.groupPersonaAria": "Shared persona growth",
    "meet.groupProgressAria": "Shared persona progress",
    "meet.missionCompleted": "First snap complete",
    "meet.missionWaiting": "Waiting",
    "meet.missionCompleteButton": "Complete",
    "meet.previewAccept": "Preview invite accept",
    "meet.feedbackPinMessage": "pinned",
    "meet.feedbackLaterMessage": "saved for later",
    "meet.feedbackHideMessage": "will be hidden",
    "meet.restoreFeedbackMessage": "Showing hidden suggestions again",
    "today.weatherCardAria": "Today's weather and place",
    "today.journalEyebrow": "Journal",
    "today.journalModeTitle": "How to log today",
    "today.journalModeAi": "Write with AI",
    "today.journalModeSolo": "Write solo",
    "today.journalContextAria": "Today's journal context",
    "today.journalHumidityPrefix": "Humidity",
    "today.journalDistancePrefix": "From home",
    "today.journalLineLabel": "One-line journal",
    "today.journalLinePlaceholder": "e.g. felt like walking a little farther today",
    "today.journalSend": "Polish",
    "today.journalSoloIntro": "Your sentence stays as-is. Trust today's own voice first.",
    "today.journalPolishedLabel": "Polished line",
    "today.metricSnap": "Today snaps",
    "today.metricPersonas": "Personas",
    "today.metricMeet": "Meet xp",
    "today.insightEyebrow": "AI Insight",
    "today.insightTitle": "Hidden habit",
    "today.timelineTitle": "Logged today",
    "report.title": "7-day life report",
    "report.weeklyEyebrow": "Weekly Loop",
    "report.modeAria": "Report view mode",
    "report.modeWeekly": "7-day summary",
    "report.modeMemory": "Memories",
    "report.metricWeeklySnap": "Weekly snaps",
    "report.metricFeaturedGrowth": "Featured growth",
    "report.metricHiddenPattern": "Hidden patterns",
    "report.aiHabitTitle": "AI-spotted hidden habits",
    "report.restoreHiddenInsights": "Show hidden insights",
    "report.restoreHiddenMessage": "Showing hidden insights again",
    "report.softenedMessage": "Reading this more gently",
    "report.hiddenMessage": "This kind of analysis will appear less",
    "report.softenButton": "Soften wording",
    "report.hideButton": "Not interested",
    "report.memoryEyebrow": "Memory Search",
    "report.memoryTitle": "Memory recall",
    "report.memoryDescription": "AI brings older snaps back to ask where today's persona began.",
    "report.memoryFilterAria": "Memory filter",
    "report.memoryFilterTitle": "Memory filter",
    "report.memoryFilterPrefix": "Filter",
    "report.memoryFilterAll": "All",
    "report.memoryFilterMonth": "Month",
    "report.memoryFilterPlace": "Place",
    "report.memoryFilterPersona": "Persona"
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
