// 날씨/자외선/미세먼지를 페르소나 톤의 부드러운 알림으로 바꾼다. 잔소리가 아니라 챙김.
import type { HabitCategory } from "../types/habit";
import type { WeatherSnapshot } from "./weather";

export type AdvisoryTone = "info" | "caution" | "warn";

export type Advisory = {
  id: string;
  tone: AdvisoryTone;
  message: string;
};

export function buildAdvisories(
  weather: WeatherSnapshot,
  featuredCategory: HabitCategory
): Advisory[] {
  const advisories: Advisory[] = [];

  if (weather.uvIndex >= 8) {
    advisories.push({
      id: "uv-strong",
      tone: "warn",
      message: `자외선 ${weather.uvIndex}. 썬크림 꼭 챙기고, 한낮 외출은 짧게.`
    });
  } else if (weather.uvIndex >= 6) {
    advisories.push({
      id: "uv-mid",
      tone: "caution",
      message: `자외선 ${weather.uvIndex}. 나가는 길에 썬크림 한 번 잊지 마.`
    });
  }

  if (weather.pm25 >= 75) {
    advisories.push({
      id: "pm-high",
      tone: "warn",
      message:
        featuredCategory === "exercise"
          ? `미세먼지 PM2.5 ${weather.pm25}. 오늘은 실내 운동이 어때?`
          : `미세먼지 PM2.5 ${weather.pm25}. 마스크 챙기고 창문은 닫아두자.`
    });
  } else if (weather.pm25 >= 35) {
    advisories.push({
      id: "pm-mid",
      tone: "caution",
      message: `미세먼지 PM2.5 ${weather.pm25}. 오래 걸을 거면 마스크가 좋아.`
    });
  }

  if (weather.condition === "rain") {
    advisories.push({
      id: "rain",
      tone: "info",
      message: "비가 와. 우산 챙기고, 오늘 스냅은 실내 한 컷도 좋아."
    });
  }

  if (weather.condition === "snow") {
    advisories.push({
      id: "snow",
      tone: "info",
      message: "눈이 와. 따뜻하게 입고, 미끄러운 길 조심해."
    });
  }

  if (advisories.length === 0 && weather.status === "live") {
    advisories.push({
      id: "clear",
      tone: "info",
      message: "오늘 날씨는 무난해. 가볍게 한 컷 남기기 좋은 날이야."
    });
  }

  return advisories;
}
