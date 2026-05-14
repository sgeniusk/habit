export type JournalMode = "ai" | "solo";

export type JournalContext = {
  condition: "맑음" | "비" | "흐림";
  temperatureC: number;
  humidity: number;
  location: string;
  distanceFromHomeKm: number;
};

export type JournalDraft = {
  originalLine: string;
  personaLine: string;
  polishedLine: string;
  moodTags: string[];
  mode: JournalMode;
};

export const todayJournalContext: JournalContext = {
  condition: "맑음",
  temperatureC: 18,
  humidity: 42,
  location: "서울 성수동",
  distanceFromHomeKm: 4.2
};

export function buildJournalOpening(context: JournalContext) {
  if (context.condition === "비") {
    return `오늘은 비 온대. 습도도 ${context.humidity}%라 마음도 조금 눅눅할 수 있어.`;
  }

  if (context.distanceFromHomeKm >= 3) {
    return `오늘은 맑고 습도 ${context.humidity}%. 집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가?`;
  }

  return `오늘은 ${context.temperatureC}도 ${context.condition}. 지금 있는 곳의 분위기를 한 줄만 건네줘.`;
}

export function buildJournalDraft({
  text,
  mode,
  context
}: {
  text: string;
  mode: JournalMode;
  context: JournalContext;
}): JournalDraft {
  const originalLine = text.trim();
  const isWalking = /걷|걸|산책|멀리|나왔/.test(originalLine);
  const isResting = /집|쉬|누워|잠|회복/.test(originalLine);
  const isRainy = context.condition === "비" || /비|우산|축축|눅눅/.test(originalLine);

  if (mode === "solo") {
    return {
      originalLine,
      personaLine: "내가 손대지 않고 네 말 그대로 옆에 둘게.",
      polishedLine: originalLine,
      moodTags: [context.condition, "직접기록"],
      mode
    };
  }

  if (isRainy) {
    return {
      originalLine,
      personaLine: "비 오는 날엔 마음도 천천히 말려야 해. 오늘은 속도를 낮춰도 괜찮아.",
      polishedLine: "비의 기척 속에서 천천히 마음을 말린 날.",
      moodTags: [context.condition, "회복", "정리"],
      mode
    };
  }

  if (isWalking) {
    return {
      originalLine,
      personaLine:
        "집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가? 돌아오는 길의 느낌도 나한테 말해줘.",
      polishedLine: "맑은 날씨에 멀리 걸으며 마음의 방향을 다시 잡은 날.",
      moodTags: [context.condition, "이동", "정리"],
      mode
    };
  }

  if (isResting) {
    return {
      originalLine,
      personaLine: "오늘은 안쪽을 돌보는 날 같아. 조용한 것도 충분히 기록이야.",
      polishedLine: "집 안의 조용한 리듬으로 나를 다시 돌본 날.",
      moodTags: [context.condition, "회복", "집"],
      mode
    };
  }

  return {
    originalLine,
    personaLine: "그 한 줄, 지금 네 안쪽에서 꽤 오래 머문 말 같아.",
    polishedLine: "오늘의 작은 감각을 놓치지 않고 나에게 건넨 날.",
    moodTags: [context.condition, "감각", "기록"],
    mode
  };
}
