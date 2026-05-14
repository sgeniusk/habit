import { describe, expect, it } from "vitest";
import {
  acceptMeetInvite,
  buildMeetInvite,
  buildMeetSuggestions,
  completeMeetFirstSnapMission,
  createMeetSession,
  type MeetSignalRecord
} from "./socialEngine";

const runningRecords: MeetSignalRecord[] = [
  {
    id: "run-1",
    category: "exercise",
    placeType: "outdoors",
    memo: "퇴근 후 3km 러닝",
    sticker: "🏃 러닝",
    createdAt: "2026-05-10T21:15:00.000+09:00"
  },
  {
    id: "run-2",
    category: "exercise",
    placeType: "outdoors",
    memo: "성수천 런닝 사진",
    sticker: "🏃 러닝",
    createdAt: "2026-05-12T20:05:00.000+09:00"
  }
];

describe("buildMeetSuggestions", () => {
  it("suggests a running group when outdoor running snaps repeat", () => {
    const suggestions = buildMeetSuggestions(runningRecords);

    expect(suggestions[0]).toMatchObject({
      title: "성수천 러닝 모임 추천",
      signalLabel: "러닝 스냅 2회",
      cta: "러닝 친구 초대하기"
    });
    expect(suggestions[0].reason).toContain("야외 운동 기록이 반복");
  });

  it("falls back to a study room when library study repeats", () => {
    const suggestions = buildMeetSuggestions([
      {
        id: "study-1",
        category: "study",
        placeType: "library",
        createdAt: "2026-05-10T09:00:00.000+09:00"
      },
      {
        id: "study-2",
        category: "study",
        placeType: "library",
        createdAt: "2026-05-11T09:00:00.000+09:00"
      }
    ]);

    expect(suggestions[0].title).toBe("도서관 9시 클럽 추천");
    expect(suggestions[0].signalLabel).toBe("도서관 공부 2회");
  });
});

describe("buildMeetInvite", () => {
  it("turns a meet suggestion into a shareable invite", () => {
    const suggestion = buildMeetSuggestions(runningRecords)[0];
    const invite = buildMeetInvite(suggestion);

    expect(invite).toMatchObject({
      status: "초대 링크 생성됨",
      roomTitle: "성수천 러닝 모임",
      inviteUrl: "https://persona-habit.app/invite/running-meet-88",
      previewMemberName: "예비 러너"
    });
    expect(invite.description).toContain("친구가 링크를 열면");
  });
});

describe("meet session", () => {
  it("stores invite acceptors and converts first snaps into group persona XP", () => {
    const suggestion = buildMeetSuggestions(runningRecords)[0];
    const invite = buildMeetInvite(suggestion);
    const waitingSession = acceptMeetInvite(createMeetSession(invite), {
      id: "friend-runner",
      name: "예비 러너"
    });

    expect(waitingSession.members).toContainEqual({
      id: "friend-runner",
      name: "예비 러너",
      status: "waiting-first-snap"
    });
    expect(waitingSession.groupPersona).toMatchObject({
      name: "공동 러닝 페르소나",
      xp: 40,
      level: 1
    });
    expect(waitingSession.firstSnapMission.status).toBe("waiting");

    const completedSession = completeMeetFirstSnapMission(waitingSession, "friend-runner");

    expect(completedSession.members[0]).toMatchObject({
      id: "friend-runner",
      status: "contributed"
    });
    expect(completedSession.groupPersona).toMatchObject({
      xp: 100,
      level: 2,
      mood: "첫 스냅을 같이 남기며 활력이 올라왔어요"
    });
    expect(completedSession.firstSnapMission.status).toBe("completed");
  });
});
