import { describe, expect, it } from "vitest";
import {
  buildWeatherCardState,
  buildWeatherJournalContext,
  demoWeatherAdapter,
  fallbackWeatherSnapshot
} from "./weatherEngine";

describe("weatherEngine", () => {
  it("builds granted, denied, and error card states for location weather permission", () => {
    expect(buildWeatherCardState("granted", fallbackWeatherSnapshot)).toMatchObject({
      title: "18도 · 산책하기 좋은 맑음",
      locationLabel: "서울 성수동",
      helperText: "현재 위치 기준"
    });

    expect(buildWeatherCardState("denied", fallbackWeatherSnapshot)).toMatchObject({
      title: "위치 권한이 꺼져 있어요",
      locationLabel: "지역 없이 기록",
      helperText: "수동으로 오늘 감각을 남길 수 있어요"
    });

    expect(buildWeatherCardState("error", fallbackWeatherSnapshot)).toMatchObject({
      title: "날씨를 불러오지 못했어요",
      locationLabel: "최근 맥락 사용",
      helperText: "연결이 돌아오면 다시 현재 날씨를 확인해요"
    });
  });

  it("exposes a weather adapter boundary and turns snapshots into journal context", async () => {
    const snapshot = await demoWeatherAdapter.loadCurrentContext();
    const context = buildWeatherJournalContext(snapshot);

    expect(context).toMatchObject({
      condition: "맑음",
      temperatureC: 18,
      humidity: 42,
      location: "서울 성수동",
      distanceFromHomeKm: 4.2
    });
  });
});
