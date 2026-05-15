import { getCategoryLabel, getPlaceLabel } from "./personaEngine";
import type { SnapRecord } from "../types/habit";

export type MemorySignalRecord = SnapRecord;

export type MemoryCuration = {
  id: string;
  title: string;
  period: string;
  placeLabel: string;
  personaLabel: string;
  summary: string;
  prompt: string;
  tags: string[];
};

export type MemoryFilter =
  | { type: "all"; value: string }
  | { type: "month"; value: string }
  | { type: "place"; value: string }
  | { type: "persona"; value: string };

export type MemoryFilterOptions = {
  months: string[];
  places: string[];
  personas: string[];
};

const DISTANT_MEMORY_DAYS = 14;

export function buildMemoryCurations(records: MemorySignalRecord[]): MemoryCuration[] {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const newestRecord = sortedRecords[sortedRecords.length - 1];
  const newestTime = newestRecord ? new Date(newestRecord.createdAt).getTime() : Date.now();
  const distantRecords = sortedRecords.filter((record) => {
    const ageMs = newestTime - new Date(record.createdAt).getTime();
    return ageMs >= DISTANT_MEMORY_DAYS * 24 * 60 * 60 * 1000;
  });
  const memoryRecords = distantRecords.length > 0 ? distantRecords : sortedRecords.slice(0, 1);

  return memoryRecords.slice(0, 3).map(buildMemoryCard);
}

function buildMemoryCard(record: MemorySignalRecord): MemoryCuration {
  const memo =
    record.memo ??
    `${getPlaceLabel(record.placeType)}에서 남긴 ${getCategoryLabel(record.category)} 기록`;
  const period = formatKoreanMonth(record.createdAt);
  const personaLabel = getCategoryLabel(record.category);
  const placeLabel = getPlaceLabel(record.placeType);
  const tags = [personaLabel, placeLabel];

  if (isRunningMemory(record)) {
    return {
      id: `memory-${record.id}`,
      title: "오래전의 러닝 감각",
      period,
      placeLabel,
      personaLabel,
      summary: `${memo} 기록이 남아 있어요. 지금의 루틴 러너가 처음 몸을 깨우던 장면처럼 보여요.`,
      prompt: "그날 뛰고 돌아온 뒤 무엇이 제일 시원했는지 떠올려볼까요?",
      tags: [...tags, "오래전 기억"]
    };
  }

  return {
    id: `memory-${record.id}`,
    title: "가장 오래된 생활 조각",
    period,
    placeLabel,
    personaLabel,
    summary: `${memo} 기록이 남아 있어요. 지금의 나와는 조금 다른 리듬이지만, 그때도 분명히 무언가를 붙잡고 있었어요.`,
    prompt: "그날의 장소, 냄새, 같이 있던 사람 중 하나만 다시 떠올려볼까요?",
    tags: [...tags, "기억 조각"]
  };
}

export function buildMemoryFilterOptions(memories: MemoryCuration[]): MemoryFilterOptions {
  return {
    months: unique(memories.map((memory) => memory.period)),
    places: unique(memories.map((memory) => memory.placeLabel)),
    personas: unique(memories.map((memory) => memory.personaLabel))
  };
}

export function filterMemoryCurations(memories: MemoryCuration[], filter: MemoryFilter) {
  if (filter.type === "all") {
    return memories;
  }

  if (filter.type === "month") {
    return memories.filter((memory) => memory.period === filter.value);
  }

  if (filter.type === "place") {
    return memories.filter((memory) => memory.placeLabel === filter.value);
  }

  return memories.filter((memory) => memory.personaLabel === filter.value);
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function formatKoreanMonth(createdAt: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    timeZone: "Asia/Seoul"
  }).format(new Date(createdAt));
}

function isRunningMemory(record: MemorySignalRecord) {
  const text = `${record.memo ?? ""} ${record.sticker ?? ""}`;

  return record.category === "exercise" && /러닝|런닝|run|km|산책|걷/i.test(text);
}
