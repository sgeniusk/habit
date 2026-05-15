// 스냅 기록의 최근 연속 기록 일수를 계산해 오늘 탭의 streak 배지를 데이터 기반으로 만든다.

import type { SnapRecord } from "../types/habit";

export function countConsecutiveSnapDays(records: SnapRecord[]): number {
  if (records.length === 0) {
    return 0;
  }

  const uniqueDays = Array.from(new Set(records.map((record) => toIsoDate(record.createdAt))))
    .filter((value): value is string => typeof value === "string" && value.length === 10)
    .sort()
    .reverse();

  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previous = uniqueDays[index - 1];
    const current = uniqueDays[index];

    if (current === addDays(previous, -1)) {
      streak += 1;
    } else {
      break;
    }
  }

  return streak;
}

function toIsoDate(value: string): string | null {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
