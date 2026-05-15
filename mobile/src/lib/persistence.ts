// AsyncStorage 위에 비동기 영속화 헬퍼를 둔다. 손상된 데이터는 자동으로 fallback 복구.
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SnapRecord } from "../types/habit";

const SNAP_RECORDS_KEY = "persona-habit:snap-records";

export type PersistenceOutcome = "ok" | "error";

export async function loadSnapRecords(fallback: SnapRecord[]): Promise<SnapRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SNAP_RECORDS_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return fallback;
    }
    const guarded = parsed.filter(isSnapRecordShape);
    return guarded.length > 0 ? guarded : fallback;
  } catch {
    return fallback;
  }
}

export async function saveSnapRecords(records: SnapRecord[]): Promise<PersistenceOutcome> {
  try {
    await AsyncStorage.setItem(SNAP_RECORDS_KEY, JSON.stringify(records));
    return "ok";
  } catch {
    return "error";
  }
}

export async function clearSnapRecords(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SNAP_RECORDS_KEY);
  } catch {
    // 무시. AsyncStorage 제거 실패는 다음 시도에서 자연 복구.
  }
}

function isSnapRecordShape(value: unknown): value is SnapRecord {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.category === "string" &&
    typeof record.placeType === "string" &&
    typeof record.createdAt === "string"
  );
}
