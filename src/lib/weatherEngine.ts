import type { JournalContext } from "./journalEngine";

export type WeatherPermissionState = "granted" | "denied" | "error";

export type WeatherSnapshot = {
  condition: JournalContext["condition"];
  temperatureC: number;
  humidity: number;
  location: string;
  distanceFromHomeKm: number;
  source: "demo" | "device" | "fallback";
};

export type WeatherCardState = {
  title: string;
  locationLabel: string;
  detail: string;
  helperText: string;
  actionLabel: string;
};

export type WeatherAdapter = {
  loadCurrentContext: () => Promise<WeatherSnapshot>;
};

export const fallbackWeatherSnapshot: WeatherSnapshot = {
  condition: "맑음",
  temperatureC: 18,
  humidity: 42,
  location: "서울 성수동",
  distanceFromHomeKm: 4.2,
  source: "demo"
};

export const demoWeatherAdapter: WeatherAdapter = {
  async loadCurrentContext() {
    return fallbackWeatherSnapshot;
  }
};

export function buildWeatherCardState(
  permission: WeatherPermissionState,
  snapshot: WeatherSnapshot
): WeatherCardState {
  if (permission === "denied") {
    return {
      title: "위치 권한이 꺼져 있어요",
      locationLabel: "지역 없이 기록",
      detail: "습도와 거리 대신 직접 남긴 한 줄을 중심으로 정리해요",
      helperText: "수동으로 오늘 감각을 남길 수 있어요",
      actionLabel: "다시 허용"
    };
  }

  if (permission === "error") {
    return {
      title: "날씨를 불러오지 못했어요",
      locationLabel: "최근 맥락 사용",
      detail: `${snapshot.temperatureC}도 · 습도 ${snapshot.humidity}% 임시 맥락`,
      helperText: "연결이 돌아오면 다시 현재 날씨를 확인해요",
      actionLabel: "다시 확인"
    };
  }

  return {
    title: `${snapshot.temperatureC}도 · 산책하기 좋은 ${snapshot.condition}`,
    locationLabel: snapshot.location,
    detail: `습도 ${snapshot.humidity}% · 집에서 ${snapshot.distanceFromHomeKm}km`,
    helperText: "현재 위치 기준",
    actionLabel: "다시 확인"
  };
}

export function buildWeatherJournalContext(snapshot: WeatherSnapshot): JournalContext {
  return {
    condition: snapshot.condition,
    temperatureC: snapshot.temperatureC,
    humidity: snapshot.humidity,
    location: snapshot.location,
    distanceFromHomeKm: snapshot.distanceFromHomeKm
  };
}
