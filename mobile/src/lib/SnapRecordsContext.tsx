// 5 탭이 같은 SnapRecord 배열을 공유하도록 묶는 컨텍스트.
// 로컬(AsyncStorage)을 1차 저장소로 쓰고, Supabase 가 설정돼 있으면 클라우드와 동기화한다.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { initialRecords } from "../data/sampleRecords";
import type { SnapRecord } from "../types/habit";
import {
  ensureAnonymousSession,
  pullSnapRecords,
  pushSnapRecord,
  pushSnapRecords
} from "./cloudSync";
import { loadSnapRecords, saveSnapRecords } from "./persistence";
import { isSupabaseConfigured } from "./supabase";

type SnapRecordsContextValue = {
  records: SnapRecord[];
  loaded: boolean;
  synced: boolean;
  addRecord(record: SnapRecord): void;
  resetRecords(): void;
};

const Context = createContext<SnapRecordsContextValue | null>(null);

function mergeById(local: SnapRecord[], server: SnapRecord[]): SnapRecord[] {
  const byId = new Map<string, SnapRecord>();
  for (const record of local) byId.set(record.id, record);
  for (const record of server) byId.set(record.id, record); // 서버 우선
  return [...byId.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function SnapRecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SnapRecord[]>(initialRecords);
  const [loaded, setLoaded] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = await loadSnapRecords(initialRecords);
      if (cancelled) return;
      setRecords(local);
      setLoaded(true);

      // Supabase 가 설정돼 있으면 익명 세션 + 서버 기록 병합
      if (!isSupabaseConfigured) return;
      await ensureAnonymousSession();
      const server = await pullSnapRecords();
      if (cancelled || !server) return;
      const merged = mergeById(local, server);
      setRecords(merged);
      // 서버에 없던 로컬 기록을 올린다
      const serverIds = new Set(server.map((record) => record.id));
      const localOnly = local.filter((record) => !serverIds.has(record.id));
      await pushSnapRecords(localOnly);
      if (!cancelled) setSynced(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveSnapRecords(records);
  }, [records, loaded]);

  const addRecord = useCallback((record: SnapRecord) => {
    setRecords((current) => [record, ...current]);
    void pushSnapRecord(record);
  }, []);

  const resetRecords = useCallback(() => {
    setRecords(initialRecords);
  }, []);

  return (
    <Context.Provider value={{ records, loaded, synced, addRecord, resetRecords }}>
      {children}
    </Context.Provider>
  );
}

export function useSnapRecords() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("SnapRecordsProvider 가 트리 위에 없습니다.");
  }
  return ctx;
}
