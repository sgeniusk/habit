// 5 탭이 같은 SnapRecord 배열을 공유하도록 묶는 컨텍스트. 첫 로드 + 저장은 AsyncStorage.
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

import { initialRecords } from "../data/sampleRecords";
import type { SnapRecord } from "../types/habit";
import { loadSnapRecords, saveSnapRecords } from "./persistence";

type SnapRecordsContextValue = {
  records: SnapRecord[];
  loaded: boolean;
  addRecord(record: SnapRecord): void;
  resetRecords(): void;
};

const Context = createContext<SnapRecordsContextValue | null>(null);

export function SnapRecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<SnapRecord[]>(initialRecords);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSnapRecords(initialRecords).then((nextRecords) => {
      if (cancelled) return;
      setRecords(nextRecords);
      setLoaded(true);
    });
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
  }, []);

  const resetRecords = useCallback(() => {
    setRecords(initialRecords);
  }, []);

  return (
    <Context.Provider value={{ records, loaded, addRecord, resetRecords }}>
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
