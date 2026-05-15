import { describe, expect, it } from "vitest";
import {
  acceptMeetInvite,
  applyMeetSuggestionFeedback,
  buildMeetInvite,
  buildMeetSessionFromInviteToken,
  buildMeetSuggestions,
  completeMeetFirstSnapMission,
  createMeetSession,
  upsertMeetSuggestionFeedback,
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
      title: { ko: "성수천 러닝 모임 추천", en: "Seongsucheon running meet suggestion" },
      signalLabel: { ko: "러닝 스냅 2회", en: "2 running snaps" },
      cta: { ko: "러닝 친구 초대하기", en: "Invite running friends" }
    });
    expect(suggestions[0].reason.ko).toContain("야외 운동 기록이 반복");
    expect(suggestions[0].reason.en).toContain("Outdoor exercise");
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

    expect(suggestions[0].title.ko).toBe("도서관 9시 클럽 추천");
    expect(suggestions[0].signalLabel.ko).toBe("도서관 공부 2회");
    expect(suggestions[0].title.en).toBe("Library 9 AM club suggestion");
  });

  it("applies hidden, pinned, and later feedback to meet suggestions", () => {
    const suggestions = buildMeetSuggestions([
      ...runningRecords,
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

    const tunedSuggestions = applyMeetSuggestionFeedback(
      suggestions,
      upsertMeetSuggestionFeedback(
        upsertMeetSuggestionFeedback([], "running-meet", "later", "2026-05-14T10:00:00.000Z"),
        "library-study-meet",
        "pinned",
        "2026-05-14T10:01:00.000Z"
      )
    );

    expect(tunedSuggestions[0].id).toBe("library-study-meet");
    expect(tunedSuggestions[tunedSuggestions.length - 1]?.id).toBe("running-meet");

    const visibleSuggestions = applyMeetSuggestionFeedback(
      suggestions,
      upsertMeetSuggestionFeedback([], "running-meet", "hidden", "2026-05-14T10:02:00.000Z")
    );

    expect(visibleSuggestions.map((suggestion) => suggestion.id)).not.toContain("running-meet");
  });
});

describe("buildMeetInvite", () => {
  it("turns a meet suggestion into a shareable invite", () => {
    const suggestion = buildMeetSuggestions(runningRecords)[0];
    const invite = buildMeetInvite(suggestion);

    expect(invite.status).toBe("created");
    expect(invite.roomTitle).toEqual({ ko: "성수천 러닝 모임", en: "Seongsucheon running meet" });
    expect(invite.inviteUrl).toBe("https://persona-habit.app/invite/running-meet-88");
    expect(invite.previewMemberName).toEqual({ ko: "예비 러너", en: "Runner-to-be" });
    expect(invite.description.ko).toContain("친구가 링크를 열면");
    expect(invite.description.en).toContain("Opening the link");
  });
});

describe("meet session", () => {
  it("builds an invite acceptance session from a route token", () => {
    const session = buildMeetSessionFromInviteToken("running-meet-88", runningRecords);

    expect(session?.invite.roomTitle.ko).toBe("성수천 러닝 모임");
    expect(session?.invite.inviteUrl).toBe("https://persona-habit.app/invite/running-meet-88");
    expect(session?.firstSnapMission.title).toEqual({
      ko: "첫 러닝 스냅 미션",
      en: "First running snap mission"
    });
  });

  it("stores invite acceptors and converts first snaps into group persona XP", () => {
    const suggestion = buildMeetSuggestions(runningRecords)[0];
    const invite = buildMeetInvite(suggestion);
    const waitingSession = acceptMeetInvite(createMeetSession(invite), {
      id: "friend-runner",
      name: { ko: "예비 러너", en: "Runner-to-be" }
    });

    expect(waitingSession.members[0]).toMatchObject({
      id: "friend-runner",
      status: "waiting-first-snap"
    });
    expect(waitingSession.members[0].name).toEqual({ ko: "예비 러너", en: "Runner-to-be" });
    expect(waitingSession.groupPersona.name).toEqual({
      ko: "공동 러닝 페르소나",
      en: "Shared running persona"
    });
    expect(waitingSession.groupPersona).toMatchObject({ xp: 40, level: 1 });
    expect(waitingSession.firstSnapMission.status).toBe("waiting");

    const completedSession = completeMeetFirstSnapMission(waitingSession, "friend-runner");

    expect(completedSession.members[0]).toMatchObject({
      id: "friend-runner",
      status: "contributed"
    });
    expect(completedSession.groupPersona.xp).toBe(100);
    expect(completedSession.groupPersona.level).toBe(2);
    expect(completedSession.groupPersona.mood).toEqual({
      ko: "첫 스냅을 같이 남기며 활력이 올라왔어요",
      en: "Energy went up after leaving the first snap together"
    });
    expect(completedSession.firstSnapMission.status).toBe("completed");
  });
});
