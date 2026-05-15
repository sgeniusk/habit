// 사용자 스냅에서 모임 제안과 세션을 만들어내는 도메인 엔진. 한국어/영어 데이터를 모두 LocalizedString 으로 돌려준다.
import type { HabitCategory, LocalizedString, SnapRecord } from "../types/habit";

export type MeetSignalRecord = SnapRecord;

export type MeetSuggestion = {
  id: string;
  category: HabitCategory;
  title: LocalizedString;
  reason: LocalizedString;
  signalLabel: LocalizedString;
  matchScore: number;
  cta: LocalizedString;
};

export type MeetSuggestionFeedbackAction = "hidden" | "later" | "pinned";

export type MeetSuggestionFeedback = {
  suggestionId: string;
  action: MeetSuggestionFeedbackAction;
  updatedAt: string;
};

export type MeetInviteStatus = "created";

export type MeetInvite = {
  status: MeetInviteStatus;
  suggestionId: string;
  category: HabitCategory;
  roomTitle: LocalizedString;
  inviteUrl: string;
  description: LocalizedString;
  previewMemberName: LocalizedString;
  sharedXp: number;
};

export type MeetMember = {
  id: string;
  name: LocalizedString;
  status: "waiting-first-snap" | "contributed";
};

export type MeetFirstSnapMission = {
  title: LocalizedString;
  description: LocalizedString;
  rewardXp: number;
  status: "waiting" | "completed";
};

export type MeetGroupPersona = {
  name: LocalizedString;
  xp: number;
  level: number;
  mood: LocalizedString;
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
      title: { ko: "성수천 러닝 모임 추천", en: "Seongsucheon running meet suggestion" },
      reason: {
        ko: "야외 운동 기록이 반복되고 있어요. 혼자 뛰는 리듬이 생겼으니 비슷한 시간대의 러너와 묶어볼 만해요.",
        en: "Outdoor exercise records are repeating. Your solo pace is set, so it makes sense to pair with runners on the same schedule."
      },
      signalLabel: {
        ko: `러닝 스냅 ${runningRecords.length}회`,
        en: `${runningRecords.length} running snaps`
      },
      matchScore: 88,
      cta: { ko: "러닝 친구 초대하기", en: "Invite running friends" }
    });
  }

  if (libraryStudyRecords.length >= 2) {
    suggestions.push({
      id: "library-study-meet",
      category: "study",
      title: { ko: "도서관 9시 클럽 추천", en: "Library 9 AM club suggestion" },
      reason: {
        ko: "도서관 공부 기록이 반복되고 있어요. 같은 장소에서 시작하는 친구가 있으면 출석 자체가 유인이 됩니다.",
        en: "Library study records are repeating. A friend who starts in the same place makes showing up a motivation on its own."
      },
      signalLabel: {
        ko: `도서관 공부 ${libraryStudyRecords.length}회`,
        en: `${libraryStudyRecords.length} library sessions`
      },
      matchScore: 82,
      cta: { ko: "공부방 초대하기", en: "Invite to study room" }
    });
  }

  if (mealRecords.length >= 2) {
    suggestions.push({
      id: "meal-balance-meet",
      category: "meal",
      title: { ko: "가벼운 점심 챌린지 추천", en: "Light lunch challenge suggestion" },
      reason: {
        ko: "식단 스냅이 쌓이고 있어요. 사진으로 식사 리듬을 공유하면 부담 없이 서로의 선택을 밀어줄 수 있어요.",
        en: "Meal snaps are stacking up. Sharing your eating rhythm by photo keeps the gentle nudge mutual."
      },
      signalLabel: {
        ko: `식단 스냅 ${mealRecords.length}회`,
        en: `${mealRecords.length} meal snaps`
      },
      matchScore: 76,
      cta: { ko: "식단 모임 만들기", en: "Start meal meet" }
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "starter-meet",
      category: "selfcare",
      title: { ko: "작은 루틴 모임 추천", en: "Small routine meet suggestion" },
      reason: {
        ko: "아직 강한 반복 신호는 없지만, 오늘 남긴 스냅 하나를 친구와 같이 시작하면 다음 기록이 쉬워져요.",
        en: "No strong repeat signal yet, but starting today's snap together with a friend makes the next entry easier."
      },
      signalLabel: { ko: "시작 신호 탐색", en: "Looking for first signal" },
      matchScore: 61,
      cta: { ko: "친구 초대하기", en: "Invite a friend" }
    });
  }

  return suggestions.sort((a, b) => b.matchScore - a.matchScore);
}

export function applyMeetSuggestionFeedback(
  suggestions: MeetSuggestion[],
  feedback: MeetSuggestionFeedback[]
) {
  const latestFeedback = new Map(
    feedback.map((feedbackItem) => [feedbackItem.suggestionId, feedbackItem])
  );

  return suggestions
    .filter((suggestion) => latestFeedback.get(suggestion.id)?.action !== "hidden")
    .sort((a, b) => {
      const aAction = latestFeedback.get(a.id)?.action;
      const bAction = latestFeedback.get(b.id)?.action;

      if (aAction === "pinned" && bAction !== "pinned") {
        return -1;
      }

      if (bAction === "pinned" && aAction !== "pinned") {
        return 1;
      }

      if (aAction === "later" && bAction !== "later") {
        return 1;
      }

      if (bAction === "later" && aAction !== "later") {
        return -1;
      }

      return b.matchScore - a.matchScore;
    });
}

export function upsertMeetSuggestionFeedback(
  feedback: MeetSuggestionFeedback[],
  suggestionId: string,
  action: MeetSuggestionFeedbackAction,
  updatedAt = new Date().toISOString()
): MeetSuggestionFeedback[] {
  return [
    ...feedback.filter((feedbackItem) => feedbackItem.suggestionId !== suggestionId),
    {
      suggestionId,
      action,
      updatedAt
    }
  ];
}

function isRunningRecord(record: MeetSignalRecord) {
  const memo = record.memo ?? "";
  const sticker = record.sticker ?? "";
  const runningText = /러닝|런닝|run|km|산책|걷/i.test(`${memo} ${sticker}`);

  return record.category === "exercise" && (record.placeType === "outdoors" || runningText);
}

export function buildMeetInvite(suggestion: MeetSuggestion): MeetInvite {
  const roomTitle: LocalizedString = {
    ko: suggestion.title.ko.replace(/\s*추천$/, ""),
    en: suggestion.title.en.replace(/\s+suggestion$/i, "")
  };

  return {
    status: "created",
    suggestionId: suggestion.id,
    category: suggestion.category,
    roomTitle,
    inviteUrl: `https://persona-habit.app/invite/${suggestion.id}-${suggestion.matchScore}`,
    description: {
      ko: "친구가 링크를 열면 모임 대기실로 들어오고, 첫 스냅을 남기면 공동 XP가 쌓여요.",
      en: "Opening the link puts your friend in the meet lobby. Their first snap adds shared XP."
    },
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
      description: {
        ko: `${invite.roomTitle.ko}에 들어온 친구가 첫 생활 스냅을 남기면 공동 페르소나가 바로 성장해요.`,
        en: `When a friend who joined ${invite.roomTitle.en} leaves their first snap, the shared persona grows right away.`
      },
      rewardXp: 60,
      status: "waiting"
    },
    groupPersona: buildGroupPersona(invite.category, 0, {
      ko: "아직 첫 스냅을 기다리고 있어요",
      en: "Waiting for the first snap"
    })
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
    groupPersona: buildGroupPersona(session.invite.category, nextXp, {
      ko: "새 친구가 들어와 첫 스냅을 준비하고 있어요",
      en: "A new friend just joined and is preparing the first snap"
    })
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
    groupPersona: buildGroupPersona(session.invite.category, nextXp, {
      ko: "첫 스냅을 같이 남기며 활력이 올라왔어요",
      en: "Energy went up after leaving the first snap together"
    })
  };
}

function buildPreviewMemberName(category: HabitCategory): LocalizedString {
  if (category === "exercise") {
    return { ko: "예비 러너", en: "Runner-to-be" };
  }

  if (category === "study") {
    return { ko: "집중 메이트", en: "Focus mate" };
  }

  if (category === "meal") {
    return { ko: "식단 메이트", en: "Meal mate" };
  }

  return { ko: "루틴 메이트", en: "Routine mate" };
}

function buildFirstSnapMissionTitle(category: HabitCategory): LocalizedString {
  if (category === "exercise") {
    return { ko: "첫 러닝 스냅 미션", en: "First running snap mission" };
  }

  if (category === "study") {
    return { ko: "첫 공부 스냅 미션", en: "First study snap mission" };
  }

  if (category === "meal") {
    return { ko: "첫 식단 스냅 미션", en: "First meal snap mission" };
  }

  return { ko: "첫 생활 스냅 미션", en: "First life snap mission" };
}

function buildGroupPersona(
  category: HabitCategory,
  xp: number,
  mood: LocalizedString
): MeetGroupPersona {
  const label = getGroupPersonaLabel(category);

  return {
    name: { ko: `공동 ${label.ko} 페르소나`, en: `Shared ${label.en} persona` },
    xp,
    level: Math.floor(xp / 100) + 1,
    mood,
    progress: xp % 100
  };
}

function getGroupPersonaLabel(category: HabitCategory): LocalizedString {
  if (category === "exercise") {
    return { ko: "러닝", en: "running" };
  }

  if (category === "study") {
    return { ko: "공부", en: "study" };
  }

  if (category === "meal") {
    return { ko: "식단", en: "meal" };
  }

  return { ko: "루틴", en: "routine" };
}
