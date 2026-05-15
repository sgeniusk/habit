import { getCategoryLabelForLocale, getPlaceLabelForLocale } from "./i18n";
import type { HabitCategory, Locale, PlaceType, SnapRecord } from "../types/habit";

export type VerificationRecord = SnapRecord;

export type PersonaSummary = {
  archetype: HabitCategory;
  name: string;
  level: number;
  xp: number;
  progress: number;
  primaryPlace: PlaceType;
  traits: string[];
  unlockedItems: string[];
  evolution: string;
};

export type HabitInsightConfidence = "high" | "medium" | "low";

export type HabitInsight = {
  title: string;
  body: string;
  evidence: string;
  recommendation: string;
  confidence: HabitInsightConfidence;
  sourceRecordIds: string[];
};

const personaNames: Record<HabitCategory, string> = {
  study: "도서관 집중러",
  meal: "리듬 식단러",
  exercise: "루틴 러너",
  reading: "페이지 수집가",
  cleaning: "정돈 설계자",
  selfcare: "회복 관리자",
  hobby: "취향 탐험가"
};

const baseTraits: Record<HabitCategory, string[]> = {
  study: ["집중 축적", "환경 기반 학습"],
  meal: ["식사 관찰", "에너지 관리"],
  exercise: ["움직임 회복", "체력 루틴"],
  reading: ["조용한 몰입", "지식 수집"],
  cleaning: ["공간 리셋", "생활 정돈"],
  selfcare: ["회복 감각", "몸 신호 관찰"],
  hobby: ["취향 기록", "탐색 에너지"]
};

const unlockedItems: Record<HabitCategory, string[]> = {
  study: ["스탠드", "노트 책상", "집중 후드"],
  meal: ["도시락 가방", "물컵", "그린 앞치마"],
  exercise: ["러닝화", "트랙 배경", "바람막이"],
  reading: ["북마크", "낮은 의자", "작은 서가"],
  cleaning: ["정리함", "맑은 창문", "라벨 스티커"],
  selfcare: ["수면등", "보습 키트", "숨 고르기 매트"],
  hobby: ["작업 앞치마", "컬러 팔레트", "레코드 선반"]
};

export function getCategoryLabel(category: HabitCategory, locale: Locale = "ko") {
  return getCategoryLabelForLocale(category, locale);
}

export function getPlaceLabel(placeType: PlaceType, locale: Locale = "ko") {
  return getPlaceLabelForLocale(placeType, locale);
}

export function buildPersonaSummaries(records: VerificationRecord[]): PersonaSummary[] {
  const grouped = records.reduce<Record<HabitCategory, VerificationRecord[]>>(
    (acc, record) => {
      acc[record.category] = [...(acc[record.category] ?? []), record];
      return acc;
    },
    {} as Record<HabitCategory, VerificationRecord[]>
  );

  const categories = Object.keys(grouped) as HabitCategory[];
  const hasStudy = Boolean(grouped.study?.length);
  const hasExercise = Boolean(grouped.exercise?.length);

  return categories
    .map((category) => {
      const categoryRecords = grouped[category];
      const primaryPlace = findPrimaryPlace(categoryRecords);
      const samePlaceCount = categoryRecords.filter(
        (record) => record.placeType === primaryPlace
      ).length;
      const consistencyBonus = samePlaceCount > 1 ? samePlaceCount * 20 : 20;
      const xp = categoryRecords.length * 100 + consistencyBonus;
      const level = Math.max(1, Math.floor(xp / 100) + 1);
      const traits = [...baseTraits[category]];

      if (hasStudy && hasExercise && category === "study") {
        traits.push("건강한 학습 루프");
      }

      if (samePlaceCount > 1) {
        traits.push(`${getPlaceLabel(primaryPlace)} 반복형`);
      }

      return {
        archetype: category,
        name: personaNames[category],
        level,
        xp,
        progress: xp % 100,
        primaryPlace,
        traits,
        unlockedItems: unlockedItems[category].slice(0, Math.min(level, 3)),
        evolution: buildEvolutionLabel(category, level, primaryPlace)
      };
    })
    .sort((a, b) => b.xp - a.xp);
}

export function findHiddenHabitInsights(records: VerificationRecord[]): HabitInsight[] {
  const insights: HabitInsight[] = [];
  const studyRecords = records.filter((record) => record.category === "study");
  const libraryStudyRecords = studyRecords.filter((record) => record.placeType === "library");
  const libraryStudyCount = libraryStudyRecords.length;
  const lateNightRecords = records.filter((record) => {
    const hour = new Date(record.createdAt).getHours();
    return hour >= 21 || hour <= 3;
  });
  const lateNightCount = lateNightRecords.length;
  const categoryLabels = Array.from(new Set(records.map((record) => record.category)))
    .map((category) => getCategoryLabel(category))
    .join(", ");

  if (libraryStudyCount >= 2) {
    insights.push({
      title: "도서관에서 집중이 반복돼요",
      body: "공부 스냅이 도서관에 몰려 있어요. 의지가 아니라 환경이 집중을 도와주는 타입일 가능성이 큽니다.",
      evidence: `공부 스냅 ${libraryStudyCount}개가 도서관에서 반복됐어요.`,
      recommendation: "이번 주에는 어려운 과목을 도서관 시간대에 배치해 보세요.",
      confidence: "high",
      sourceRecordIds: libraryStudyRecords.slice(0, 3).map((record) => record.id)
    });
  }

  if (lateNightCount > 0) {
    insights.push({
      title: "밤 루틴을 살펴볼 시간",
      body: "늦은 시간 스냅이 보여요. 밤에도 움직일 힘이 있지만, 회복 루틴이 같이 있어야 오래 갑니다.",
      evidence: `밤 9시 이후 또는 새벽 스냅 ${lateNightCount}개가 보여요.`,
      recommendation: "밤 스냅 다음에는 물, 스트레칭, 짧은 정리 중 하나를 붙여 보세요.",
      confidence: lateNightCount >= 2 ? "high" : "medium",
      sourceRecordIds: lateNightRecords.slice(0, 3).map((record) => record.id)
    });
  }

  if (records.length >= 4) {
    insights.push({
      title: "생활 스냅이 페르소나로 쌓이고 있어요",
      body: "공부, 식단, 운동처럼 다른 종류의 기록이 함께 쌓이면 단일 습관보다 오래 지속되는 생활 정체성이 만들어집니다.",
      evidence: `최근 스냅 ${records.length}개에 ${categoryLabels} ${new Set(records.map((record) => record.category)).size}가지 생활 축이 함께 있어요.`,
      recommendation: "이번 주 대표 페르소나 하나와 보조 페르소나 하나를 같이 키워 보세요.",
      confidence: "medium",
      sourceRecordIds: records.slice(0, 3).map((record) => record.id)
    });
  }

  return insights;
}

function findPrimaryPlace(records: VerificationRecord[]): PlaceType {
  const counts = records.reduce<Record<PlaceType, number>>(
    (acc, record) => {
      acc[record.placeType] = (acc[record.placeType] ?? 0) + 1;
      return acc;
    },
    {} as Record<PlaceType, number>
  );

  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "other") as PlaceType;
}

function buildEvolutionLabel(category: HabitCategory, level: number, placeType: PlaceType) {
  if (category === "study" && level >= 3) {
    return "척척박사 페르소나";
  }

  if (level >= 4) {
    return `${getPlaceLabel(placeType)} 기반 ${getCategoryLabel(category)} 마스터`;
  }

  if (level >= 3) {
    return `${getCategoryLabel(category)} 페르소나 진화 대기`;
  }

  return `${getCategoryLabel(category)} 씨앗 단계`;
}
