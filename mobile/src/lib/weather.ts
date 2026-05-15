// 위치 + 날씨 + 미세먼지 + 자외선을 Open-Meteo 에서 가져온다. 권한 거부/실패 시 데모 값으로 안전 복귀.
import * as Location from "expo-location";

export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow" | "unknown";

export type WeatherSnapshot = {
  status: "demo" | "live" | "denied" | "error";
  temperatureC: number;
  humidity: number;
  condition: WeatherCondition;
  uvIndex: number;
  pm25: number;
  pm10: number;
  placeLabel: string;
};

export const demoWeather: WeatherSnapshot = {
  status: "demo",
  temperatureC: 18,
  humidity: 42,
  condition: "clear",
  uvIndex: 4,
  pm25: 18,
  pm10: 30,
  placeLabel: "데모 날씨"
};

export async function fetchWeatherSnapshot(): Promise<WeatherSnapshot> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { ...demoWeather, status: "denied", placeLabel: "지역 없이 기록" };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });
    const { latitude, longitude } = position.coords;

    const [weather, air] = await Promise.all([
      fetchOpenMeteoWeather(latitude, longitude),
      fetchOpenMeteoAirQuality(latitude, longitude)
    ]);

    return {
      status: "live",
      temperatureC: weather.temperatureC,
      humidity: weather.humidity,
      condition: weather.condition,
      uvIndex: weather.uvIndex,
      pm25: air.pm25,
      pm10: air.pm10,
      placeLabel: "현재 위치"
    };
  } catch {
    return { ...demoWeather, status: "error", placeLabel: "날씨를 불러오지 못했어요" };
  }
}

async function fetchOpenMeteoWeather(latitude: number, longitude: number) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,uv_index`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("weather request failed");
  }
  const data = (await response.json()) as {
    current?: {
      temperature_2m?: number;
      relative_humidity_2m?: number;
      weather_code?: number;
      uv_index?: number;
    };
  };
  const current = data.current ?? {};
  return {
    temperatureC: Math.round(current.temperature_2m ?? demoWeather.temperatureC),
    humidity: Math.round(current.relative_humidity_2m ?? demoWeather.humidity),
    condition: mapWeatherCode(current.weather_code),
    uvIndex: Math.round((current.uv_index ?? demoWeather.uvIndex) * 10) / 10
  };
}

async function fetchOpenMeteoAirQuality(latitude: number, longitude: number) {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}` +
    `&current=pm2_5,pm10`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("air quality request failed");
  }
  const data = (await response.json()) as {
    current?: { pm2_5?: number; pm10?: number };
  };
  const current = data.current ?? {};
  return {
    pm25: Math.round(current.pm2_5 ?? demoWeather.pm25),
    pm10: Math.round(current.pm10 ?? demoWeather.pm10)
  };
}

function mapWeatherCode(code: number | undefined): WeatherCondition {
  if (code === undefined) {
    return "unknown";
  }
  if (code === 0 || code === 1) {
    return "clear";
  }
  if (code >= 2 && code <= 48) {
    return "cloudy";
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return "rain";
  }
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return "snow";
  }
  return "unknown";
}
