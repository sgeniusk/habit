import type { HabitCategory, SnapRecord } from "../types/habit";

export type MeetSignalRecord = SnapRecord;

export type MeetSuggestion = {
  id: string;
  category: HabitCategory;
  title: string;
  reason: string;
  signalLabel: string;
  matchScore: number;
  cta: string;
};

export type MeetInvite = {
  status: "초대 링크 생성됨";
  roomTitle: string;
  inviteUrl: string;
  description: string;
  previewMemberName: string;
  sharedXp: number;
};

export function buildMeetSuggestions(records: MeetSignalRecord[]): MeetSuggestion[] {
  const suggestions: MeetSuggestion[] = [];
  const runningRecords = records.filter(isRunningRecord);
  const libraryStudyRecords = records.filter(
    (record) => record.category === "study" && record.placeType === "library"
  );
  const mealRecords = records.filter((record) => record.category === "meal");

  if (runningRecords.length >= 2) {
    suggestions.push({
      id: "running-meet",
      category: "exercise",
      title: "성수천 러닝 모임 추천",
      reason:
        "야외 운동 기록이 반복되고 있어요. 혼자 뛰는 리듬이 생겼으니 비슷한 시간대의 러너와 묶어볼 만해요.",
      signalLabel: `러닝 스냅 ${runningRecords.length}회`,
      matchScore: 88,
      cta: "러닝 친구 초대하기"
    });
  }

  if (libraryStudyRecords.length >= 2) {
    suggestions.push({
      id: "library-study-meet",
      category: "study",
      title: "도서관 9시 클럽 추천",
      reason:
        "도서관 공부 기록이 반복되고 있어요. 같은 장소에서 시작하는 친구가 있으면 출석 자체가 유인이 됩니다.",
      signalLabel: `도서관 공부 ${libraryStudyRecords.length}회`,
      matchScore: 82,
      cta: "공부방 초대하기"
    });
  }

  if (mealRecords.length >= 2) {
    suggestions.push({
      id: "meal-balance-meet",
      category: "meal",
      title: "가벼운 점심 챌린지 추천",
      reason:
        "식단 스냅이 쌓이고 있어요. 사진으로 식사 리듬을 공유하면 부담 없이 서로의 선택을 밀어줄 수 있어요.",
      signalLabel: `식단 스냅 ${mealRecords.length}회`,
      matchScore: 76,
      cta: "식단 모임 만들기"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "starter-meet",
      category: "selfcare",
      title: "작은 루틴 모임 추천",
      reason:
        "아직 강한 반복 신호는 없지만, 오늘 남긴 스냅 하나를 친구와 같이 시작하면 다음 기록이 쉬워져요.",
      signalLabel: "시작 신호 탐색",
      matchScore: 61,
      cta: "친구 초대하기"
    });
  }

  return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}

function isRunningRecord(record: MeetSignalRecord) {
  const memo = record.memo ?? "";
  const sticker = record.sticker ?? "";
  const runningText = /러닝|런닝|run|km|산책|걷/i.test(`${memo} ${sticker}`);

  return record.category === "exercise" && (record.placeType === "outdoors" || runningText);
}

export function buildMeetInvite(suggestion: MeetSuggestion): MeetInvite {
  const roomTitle = suggestion.title.replace(/\s*추천$/, "");

  return {
    status: "초대 링크 생성됨",
    roomTitle,
    inviteUrl: `https://persona-habit.app/invite/${suggestion.id}-${suggestion.matchScore}`,
    description: "친구가 링크를 열면 모임 대기실로 들어오고, 첫 스냅을 남기면 공동 XP가 쌓여요.",
    previewMemberName: buildPreviewMemberName(suggestion.category),
    sharedXp: 40
  };
}

function buildPreviewMemberName(category: HabitCategory) {
  if (category === "exercise") {
    return "예비 러너";
  }

  if (category === "study") {
    return "집중 메이트";
  }

  if (category === "meal") {
    return "식단 메이트";
  }

  return "루틴 메이트";
}
