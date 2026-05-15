// 오늘 탭의 일기 모듈. 페르소나가 사용자에게 건네는 인사와 정리 초안을 locale 별로 만든다.
import type { Locale } from "../types/habit";

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

export function buildJournalOpening(context: JournalContext, locale: Locale = "ko") {
  if (locale === "en") {
    if (context.condition === "비") {
      return `It's going to rain today. With ${context.humidity}% humidity, your mood may feel a touch damp too.`;
    }

    if (context.distanceFromHomeKm >= 3) {
      return `Clear today and ${context.humidity}% humidity. You're a bit far from home — anywhere good to wander?`;
    }

    return `${context.temperatureC}°C and clear today. Pass me one line about where you are.`;
  }

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
  context,
  locale = "ko"
}: {
  text: string;
  mode: JournalMode;
  context: JournalContext;
  locale?: Locale;
}): JournalDraft {
  const originalLine = text.trim();
  const isWalking = /걷|걸|산책|멀리|나왔|walk|stroll/i.test(originalLine);
  const isResting = /집|쉬|누워|잠|회복|rest|home/i.test(originalLine);
  const isRainy = context.condition === "비" || /비|우산|축축|눅눅|rain/i.test(originalLine);

  if (locale === "en") {
    if (mode === "solo") {
      return {
        originalLine,
        personaLine: "I'll leave your words right next to me, untouched.",
        polishedLine: originalLine,
        moodTags: [conditionTagEn(context.condition), "self-written"],
        mode
      };
    }

    if (isRainy) {
      return {
        originalLine,
        personaLine: "On rainy days your heart dries slowly too. It's fine to drop the pace.",
        polishedLine: "A day I let my heart dry slowly under the rain's hush.",
        moodTags: [conditionTagEn(context.condition), "recovery", "settling"],
        mode
      };
    }

    if (isWalking) {
      return {
        originalLine,
        personaLine:
          "A bit far from home, huh — anywhere good to wander? Tell me how the way back felt too.",
        polishedLine: "A day I walked far in clear weather and reset my inner compass.",
        moodTags: [conditionTagEn(context.condition), "moving", "settling"],
        mode
      };
    }

    if (isResting) {
      return {
        originalLine,
        personaLine: "Today feels like an inward day. Even quiet counts as a record.",
        polishedLine: "A day I tended to myself again in the quiet rhythm of home.",
        moodTags: [conditionTagEn(context.condition), "recovery", "home"],
        mode
      };
    }

    return {
      originalLine,
      personaLine: "That one line — it has been sitting deep inside you for a while.",
      polishedLine: "A day I caught today's small feeling and handed it to myself.",
      moodTags: [conditionTagEn(context.condition), "sense", "record"],
      mode
    };
  }

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

function conditionTagEn(condition: JournalContext["condition"]) {
  if (condition === "비") return "rainy";
  if (condition === "흐림") return "cloudy";
  return "clear";
}
