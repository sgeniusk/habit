import type { JournalContext } from "./journalEngine";

export type WeatherPermissionState = "granted" | "denied" | "error" | "loading";

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

export type WeatherCoordinates = {
  latitude: number;
  longitude: number;
};

export type DeviceWeatherProvider = {
  getPosition: () => Promise<WeatherCoordinates>;
  getWeather: (coordinates: WeatherCoordinates) => Promise<WeatherSnapshot>;
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

export function createDeviceWeatherAdapter(provider: DeviceWeatherProvider): WeatherAdapter {
  return {
    async loadCurrentContext() {
      const coordinates = await provider.getPosition();

      return provider.getWeather(coordinates);
    }
  };
}

export function buildWeatherCardState(
  permission: WeatherPermissionState,
  snapshot: WeatherSnapshot
): WeatherCardState {
  if (permission === "loading") {
    return {
      title: "날씨 확인 중",
      locationLabel: "기기 위치 확인",
      detail: "위치 권한과 날씨 제공자를 차례로 확인하고 있어요",
      helperText: "기기 위치와 날씨를 맞추고 있어요",
      actionLabel: "확인 중"
    };
  }

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
