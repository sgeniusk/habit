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

type GeolocationLike = {
  getCurrentPosition: (
    success: (position: GeolocationPosition) => void,
    error?: (error: GeolocationPositionError) => void,
    options?: PositionOptions
  ) => void;
};

type WeatherFetchResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

type WeatherFetch = (url: string) => Promise<WeatherFetchResponse>;

export type BrowserWeatherProviderOptions = {
  geolocation?: GeolocationLike;
  fetcher?: WeatherFetch;
  homeCoordinates?: WeatherCoordinates;
  locationLabel?: string;
};

type OpenMeteoCurrentResponse = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
  };
};

const defaultHomeCoordinates: WeatherCoordinates = {
  latitude: 37.5446,
  longitude: 127.0557
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

export function createBrowserWeatherProvider({
  geolocation = globalThis.navigator?.geolocation,
  fetcher = globalThis.fetch?.bind(globalThis),
  homeCoordinates = defaultHomeCoordinates,
  locationLabel = "현재 위치"
}: BrowserWeatherProviderOptions = {}): DeviceWeatherProvider {
  return {
    getPosition() {
      if (!geolocation) {
        return Promise.reject(new Error("Geolocation is unavailable"));
      }

      return new Promise<WeatherCoordinates>((resolve, reject) => {
        geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => reject(error),
          {
            enableHighAccuracy: false,
            maximumAge: 10 * 60 * 1000,
            timeout: 8 * 1000
          }
        );
      });
    },

    async getWeather(coordinates) {
      if (!fetcher) {
        throw new Error("Weather fetch is unavailable");
      }

      const url = new URL("https://api.open-meteo.com/v1/forecast");

      url.searchParams.set("latitude", String(coordinates.latitude));
      url.searchParams.set("longitude", String(coordinates.longitude));
      url.searchParams.set("current", "temperature_2m,relative_humidity_2m,weather_code");
      url.searchParams.set("timezone", "auto");

      const response = await fetcher(url.toString());

      if (!response.ok) {
        throw new Error("Weather provider returned an error");
      }

      const data = (await response.json()) as OpenMeteoCurrentResponse;
      const current = data.current;
      const temperature = current?.temperature_2m;
      const humidity = current?.relative_humidity_2m;
      const weatherCode = current?.weather_code;

      if (
        typeof temperature !== "number" ||
        !Number.isFinite(temperature) ||
        typeof humidity !== "number" ||
        !Number.isFinite(humidity) ||
        typeof weatherCode !== "number" ||
        !Number.isFinite(weatherCode)
      ) {
        throw new Error("Weather provider response is missing current conditions");
      }

      return {
        condition: mapOpenMeteoWeatherCode(weatherCode),
        temperatureC: Math.round(temperature),
        humidity: Math.round(humidity),
        location: locationLabel,
        distanceFromHomeKm: calculateDistanceKm(homeCoordinates, coordinates),
        source: "device"
      };
    }
  };
}

export function createAutoWeatherAdapter(
  options: BrowserWeatherProviderOptions = {}
): WeatherAdapter {
  const geolocation = options.geolocation ?? globalThis.navigator?.geolocation;
  const fetcher = options.fetcher ?? globalThis.fetch?.bind(globalThis);

  if (!geolocation || !fetcher) {
    return demoWeatherAdapter;
  }

  return createDeviceWeatherAdapter(
    createBrowserWeatherProvider({
      ...options,
      geolocation,
      fetcher
    })
  );
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

function mapOpenMeteoWeatherCode(code: number): WeatherSnapshot["condition"] {
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95) {
    return "비";
  }

  if ((code >= 1 && code <= 3) || (code >= 45 && code <= 48) || (code >= 71 && code <= 77)) {
    return "흐림";
  }

  return "맑음";
}

function calculateDistanceKm(from: WeatherCoordinates, to: WeatherCoordinates) {
  const earthRadiusKm = 6371;
  const latitudeDistance = toRadians(to.latitude - from.latitude);
  const longitudeDistance = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);
  const haversine =
    Math.sin(latitudeDistance / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDistance / 2) ** 2;
  const distance = 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return Math.round(distance * 10) / 10;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
