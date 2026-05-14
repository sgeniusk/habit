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
  suggestionId: string;
  category: HabitCategory;
  roomTitle: string;
  inviteUrl: string;
  description: string;
  previewMemberName: string;
  sharedXp: number;
};

export type MeetMember = {
  id: string;
  name: string;
  status: "waiting-first-snap" | "contributed";
};

export type MeetFirstSnapMission = {
  title: string;
  description: string;
  rewardXp: number;
  status: "waiting" | "completed";
};

export type MeetGroupPersona = {
  name: string;
  xp: number;
  level: number;
  mood: string;
  progress: number;
};

export type MeetSession = {
  invite: MeetInvite;
  members: MeetMember[];
  firstSnapMission: MeetFirstSnapMission;
  groupPersona: MeetGroupPersona;
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
    suggestionId: suggestion.id,
    category: suggestion.category,
    roomTitle,
    inviteUrl: `https://persona-habit.app/invite/${suggestion.id}-${suggestion.matchScore}`,
    description: "친구가 링크를 열면 모임 대기실로 들어오고, 첫 스냅을 남기면 공동 XP가 쌓여요.",
    previewMemberName: buildPreviewMemberName(suggestion.category),
    sharedXp: 40
  };
}

export function buildMeetSessionFromInviteToken(
  inviteToken: string,
  records: MeetSignalRecord[]
): MeetSession | null {
  const normalizedToken = inviteToken.replace(/^\/?invite\//, "");
  const suggestion = buildMeetSuggestions(records).find(
    (meetSuggestion) => `${meetSuggestion.id}-${meetSuggestion.matchScore}` === normalizedToken
  );

  return suggestion ? createMeetSession(buildMeetInvite(suggestion)) : null;
}

export function createMeetSession(invite: MeetInvite): MeetSession {
  return {
    invite,
    members: [],
    firstSnapMission: {
      title: buildFirstSnapMissionTitle(invite.category),
      description: `${invite.roomTitle}에 들어온 친구가 첫 생활 스냅을 남기면 공동 페르소나가 바로 성장해요.`,
      rewardXp: 60,
      status: "waiting"
    },
    groupPersona: buildGroupPersona(invite.category, 0, "아직 첫 스냅을 기다리고 있어요")
  };
}

export function acceptMeetInvite(session: MeetSession, member: Omit<MeetMember, "status">) {
  if (session.members.some((existingMember) => existingMember.id === member.id)) {
    return session;
  }

  const members: MeetMember[] = [
    ...session.members,
    {
      ...member,
      status: "waiting-first-snap"
    }
  ];
  const nextXp = session.groupPersona.xp + session.invite.sharedXp;

  return {
    ...session,
    members,
    groupPersona: buildGroupPersona(
      session.invite.category,
      nextXp,
      "새 친구가 들어와 첫 스냅을 준비하고 있어요"
    )
  };
}

export function completeMeetFirstSnapMission(session: MeetSession, memberId: string) {
  if (session.firstSnapMission.status === "completed") {
    return session;
  }

  const members = session.members.map((member) =>
    member.id === memberId ? { ...member, status: "contributed" as const } : member
  );
  const nextXp = session.groupPersona.xp + session.firstSnapMission.rewardXp;

  return {
    ...session,
    members,
    firstSnapMission: {
      ...session.firstSnapMission,
      status: "completed" as const
    },
    groupPersona: buildGroupPersona(
      session.invite.category,
      nextXp,
      "첫 스냅을 같이 남기며 활력이 올라왔어요"
    )
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

function buildFirstSnapMissionTitle(category: HabitCategory) {
  if (category === "exercise") {
    return "첫 러닝 스냅 미션";
  }

  if (category === "study") {
    return "첫 공부 스냅 미션";
  }

  if (category === "meal") {
    return "첫 식단 스냅 미션";
  }

  return "첫 생활 스냅 미션";
}

function buildGroupPersona(category: HabitCategory, xp: number, mood: string): MeetGroupPersona {
  return {
    name: `공동 ${getGroupPersonaLabel(category)} 페르소나`,
    xp,
    level: Math.floor(xp / 100) + 1,
    mood,
    progress: xp % 100
  };
}

function getGroupPersonaLabel(category: HabitCategory) {
  if (category === "exercise") {
    return "러닝";
  }

  if (category === "study") {
    return "공부";
  }

  if (category === "meal") {
    return "식단";
  }

  return "루틴";
}
