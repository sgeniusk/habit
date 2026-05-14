import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Persona Habit prototype", () => {
  it("renders the main mobile tabs", () => {
    render(<App />);

    expect(screen.getByRole("button", { name: "오늘" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "스냅" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "집" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "모임" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "리포트" })).toBeInTheDocument();
  });

  it("shows weather, location, and daily journal choices on Today", () => {
    render(<App />);

    expect(screen.getByText("서울 성수동")).toBeInTheDocument();
    expect(screen.getByText("18도 · 산책하기 좋은 맑음")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "권한 거부 미리보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "실패 상태 보기" })).toBeInTheDocument();
    expect(screen.getByText("오늘 기록 방식")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI랑 같이쓰기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "혼자 기록하기" })).toBeInTheDocument();
  });

  it("previews location weather permission and failure states on Today", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "다시 확인" }));

    expect(await screen.findByText("날씨 동기화 완료")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "권한 거부 미리보기" }));

    expect(screen.getByText("위치 권한이 꺼져 있어요")).toBeInTheDocument();
    expect(screen.getByText("지역 없이 기록")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다시 허용" }));

    expect(screen.getByText("18도 · 산책하기 좋은 맑음")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "실패 상태 보기" }));

    expect(screen.getByText("날씨를 불러오지 못했어요")).toBeInTheDocument();
    expect(screen.getByText("최근 맥락 사용")).toBeInTheDocument();
  });

  it("opens a persona one-line journal and organizes a casual note", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI랑 같이쓰기" }));

    expect(
      screen.getByText("오늘은 맑고 습도 42%. 집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가?")
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText("예: 오늘은 괜히 멀리 걷고 싶었어"),
      "오늘은 괜히 멀리 걷고 싶었어"
    );
    await user.click(screen.getByRole("button", { name: "정리해줘" }));

    expect(screen.getByText("오늘은 괜히 멀리 걷고 싶었어")).toBeInTheDocument();
    expect(
      screen.getByText(
        "집에서 조금 멀리 나왔네. 어디 좋은 데 놀러 가? 돌아오는 길의 느낌도 나한테 말해줘."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("정리된 한 줄")).toBeInTheDocument();
    expect(
      screen.getByText("맑은 날씨에 멀리 걸으며 마음의 방향을 다시 잡은 날.")
    ).toBeInTheDocument();
  });

  it("opens the Snap view with filters and stickers", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));

    expect(screen.getByText("오늘의 한 컷")).toBeInTheDocument();
    expect(screen.getByText("필터")).toBeInTheDocument();
    expect(screen.getByText("스티커")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "꾸며서 올리기" })).toBeInTheDocument();
  });

  it("previews the selected snap image with the active filter and sticker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "필름" }));
    await user.click(screen.getByRole("button", { name: "🏃 러닝" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["snap"], "running-route.png", { type: "image/png" })
    );

    const preview = await screen.findByRole("img", { name: "running-route.png 미리보기" });

    expect(preview).toHaveAttribute("src", expect.stringContaining("data:image/png;base64"));
    expect(screen.getByText("필름 필터")).toBeInTheDocument();
    expect(screen.getByLabelText("선택 스티커 🏃 러닝")).toBeInTheDocument();
  });

  it("adds time, count, and persona proof stamps to the snap preview", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["study"], "library-proof.png", { type: "image/png" })
    );

    await screen.findByRole("img", { name: "library-proof.png 미리보기" });

    expect(screen.getByText("인증 도장")).toBeInTheDocument();
    expect(screen.getByText(/인증$/)).toBeInTheDocument();
    expect(screen.getByText("오늘 1회차")).toBeInTheDocument();
    expect(screen.getByText("곰곰이와 함께해요")).toBeInTheDocument();
    expect(screen.getByText("직업 · 학습자")).toBeInTheDocument();
  });

  it("saves a decorated snap with the selected filter and sticker", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "필름" }));
    await user.click(screen.getByRole("button", { name: "🏃 러닝" }));
    await user.click(screen.getByRole("button", { name: "운동" }));
    await user.click(screen.getByRole("button", { name: "야외" }));
    await user.type(screen.getByPlaceholderText("예: 맑아서 조금 더 걸었다"), "퇴근 후 3km 러닝");
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(screen.getByRole("button", { name: "오늘" }));

    expect(screen.getByText("야외 · 퇴근 후 3km 러닝")).toBeInTheDocument();
    expect(screen.getByText("필름 · 🏃 러닝")).toBeInTheDocument();
  });

  it("keeps the uploaded image on the latest saved snap", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["meal"], "lunch-bowl.png", { type: "image/png" })
    );
    await screen.findByRole("img", { name: "lunch-bowl.png 미리보기" });
    await user.click(screen.getByRole("button", { name: "식단" }));
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(screen.getByRole("button", { name: "오늘" }));

    expect(screen.getByRole("img", { name: "식단 스냅 저장 이미지" })).toBeInTheDocument();
  });

  it("opens the Home view with persona activities and decoration", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    expect(screen.getByText("페르소나의 집")).toBeInTheDocument();
    expect(screen.getByText("지금 하는 일")).toBeInTheDocument();
    expect(screen.getByText("방 꾸미기")).toBeInTheDocument();
    expect(screen.getByText("페르소나 꾸미기")).toBeInTheDocument();
    expect(screen.getByText("새벽 학습자")).toBeInTheDocument();
  });

  it("lets the user name the persona and uses the nickname in companion dialogue", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    const nicknameInput = screen.getByLabelText("페르소나 애칭");

    expect(nicknameInput).toHaveValue("곰곰");
    expect(screen.getByText("직업 · 학습자")).toBeInTheDocument();
    expect(screen.getByText("척척박사 페르소나")).toBeInTheDocument();
    expect(
      screen.getByText("곰곰아. 이번에는 공부를 많이 했네. 척척박사 페르소나로 업글됐어.")
    ).toBeInTheDocument();

    await user.clear(nicknameInput);
    await user.type(nicknameInput, "토리");

    expect(
      screen.getByText("토리야. 이번에는 공부를 많이 했네. 척척박사 페르소나로 업글됐어.")
    ).toBeInTheDocument();
  });

  it("shows record-based XP and unlocked rewards on Home", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    const activePersona = screen.getByRole("region", { name: "새벽 학습자" });

    expect(within(activePersona).getByText("Lv.3 · 240xp")).toBeInTheDocument();
    expect(within(activePersona).getByText("다음 레벨까지 60xp")).toBeInTheDocument();
    expect(screen.getByText("해금된 보상")).toBeInTheDocument();
    expect(screen.getByText("스탠드")).toBeInTheDocument();
    expect(screen.getByText("노트 책상")).toBeInTheDocument();
  });

  it("applies room and outfit decoration selections to the active Home persona", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "집" }));

    const roomDecor = screen.getByRole("region", { name: "방 꾸미기" });
    const outfitDecor = screen.getByRole("region", { name: "페르소나 꾸미기" });

    await user.click(within(roomDecor).getByRole("button", { name: "낮은 서가" }));
    await user.click(within(outfitDecor).getByRole("button", { name: "바람막이" }));

    const activePersona = screen.getByRole("region", { name: "새벽 학습자" });

    expect(within(activePersona).getByText("방 · 낮은 서가")).toBeInTheDocument();
    expect(within(activePersona).getByText("의상 · 바람막이")).toBeInTheDocument();
    expect(within(roomDecor).getByRole("button", { name: "낮은 서가" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(outfitDecor).getByRole("button", { name: "바람막이" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("keeps alpha snap records and persona preferences after remounting", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const getTabBar = () => screen.getByRole("navigation", { name: "주요 화면" });

    await user.click(within(getTabBar()).getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "횟수 도장" }));
    await user.click(screen.getByRole("button", { name: "왼쪽 위" }));
    await user.click(screen.getByRole("button", { name: "필름" }));
    await user.click(screen.getByRole("button", { name: "📚 공부" }));
    await user.upload(
      screen.getByLabelText("사진 선택"),
      new File(["alpha"], "alpha-study.png", { type: "image/png" })
    );
    await screen.findByRole("img", { name: "alpha-study.png 미리보기" });
    await user.type(screen.getByPlaceholderText("예: 맑아서 조금 더 걸었다"), "알파 저장 테스트");
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));

    await user.click(within(getTabBar()).getByRole("button", { name: "집" }));
    await user.clear(screen.getByLabelText("페르소나 애칭"));
    await user.type(screen.getByLabelText("페르소나 애칭"), "토리");
    await user.click(
      within(screen.getByRole("region", { name: "방 꾸미기" })).getByRole("button", {
        name: "낮은 서가"
      })
    );
    await user.click(
      within(screen.getByRole("region", { name: "페르소나 꾸미기" })).getByRole("button", {
        name: "바람막이"
      })
    );

    unmount();
    render(<App />);

    expect(screen.getByText("도서관 · 알파 저장 테스트")).toBeInTheDocument();

    await user.click(within(getTabBar()).getByRole("button", { name: "집" }));

    expect(screen.getByLabelText("페르소나 애칭")).toHaveValue("토리");
    expect(
      screen.getByText("토리야. 이번에는 공부를 많이 했네. 척척박사 페르소나로 업글됐어.")
    ).toBeInTheDocument();

    const activePersona = screen.getByRole("region", { name: "새벽 학습자" });

    expect(within(activePersona).getByText("방 · 낮은 서가")).toBeInTheDocument();
    expect(within(activePersona).getByText("의상 · 바람막이")).toBeInTheDocument();

    await user.click(within(getTabBar()).getByRole("button", { name: "스냅" }));

    expect(screen.getByRole("button", { name: "시간 도장" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "횟수 도장" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "페르소나 도장" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "왼쪽 위" })).toHaveAttribute("aria-pressed", "true");
  });

  it("switches core app chrome to English and keeps the locale after remounting", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "English" }));

    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(screen.getByRole("heading", { name: "Today's record", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Snap" })).toBeInTheDocument();

    await user.click(
      within(screen.getByRole("navigation", { name: "Main screens" })).getByRole("button", {
        name: "Snap"
      })
    );

    expect(screen.getByRole("heading", { name: "Today's snap", level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Study" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Library" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Time stamp" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bottom right" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post with style" })).toBeInTheDocument();

    unmount();
    render(<App />);

    expect(document.documentElement).toHaveAttribute("lang", "en");
    expect(screen.getByRole("button", { name: "Today" })).toBeInTheDocument();
  });

  it("updates the Home persona activity from the latest snap category", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "스냅" }));
    await user.click(screen.getByRole("button", { name: "운동" }));
    await user.click(screen.getByRole("button", { name: "꾸며서 올리기" }));
    await user.click(
      within(screen.getByRole("navigation", { name: "주요 화면" })).getByRole("button", {
        name: "집"
      })
    );

    expect(screen.getByRole("heading", { name: "루틴 러너", level: 2 })).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "루틴 러너" })).getByText(
        "러닝화를 말리고 스트레칭을 하는 중"
      )
    ).toBeInTheDocument();
    expect(screen.getByText("대표 · 루틴 러너")).toBeInTheDocument();
  });

  it("suggests a running meet when running snaps repeat", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));

    expect(screen.getByText("AI 모임 제안")).toBeInTheDocument();
    expect(screen.getByText("성수천 러닝 모임 추천")).toBeInTheDocument();
    expect(screen.getByText("러닝 스냅 2회")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "러닝 친구 초대하기" })).toBeInTheDocument();
  });

  it("lets the user tune meet recommendation feedback", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));

    const runningSuggestion = screen.getByRole("article", { name: "성수천 러닝 모임 추천" });

    await user.click(within(runningSuggestion).getByRole("button", { name: "관심 없음" }));

    expect(screen.getByText("숨긴 모임 추천 1개")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "성수천 러닝 모임 추천" })).toBeNull();
    expect(screen.getByRole("article", { name: "도서관 9시 클럽 추천" })).toBeInTheDocument();

    const studySuggestion = screen.getByRole("article", { name: "도서관 9시 클럽 추천" });

    await user.click(within(studySuggestion).getByRole("button", { name: "추천 고정" }));

    expect(screen.getByText("도서관 9시 클럽 추천을 고정했어요")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "숨긴 추천 다시 보기" }));

    expect(screen.getByRole("article", { name: "성수천 러닝 모임 추천" })).toBeInTheDocument();
  });

  it("creates a meet invite link and previews an accepted invite", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));
    await user.click(screen.getByRole("button", { name: "러닝 친구 초대하기" }));

    expect(screen.getByText("초대 링크 생성됨")).toBeInTheDocument();
    expect(
      screen.getByText("https://persona-habit.app/invite/running-meet-88")
    ).toBeInTheDocument();
    expect(screen.getByText("성수천 러닝 모임 대기실")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초대 링크 복사" }));

    expect(screen.getByText("링크 복사됨")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "공유 문구 만들기" }));

    expect(screen.getByText("공유 문구 준비됨")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초대 수락 미리보기" }));

    expect(screen.getByText("친구 1명 참여 대기")).toBeInTheDocument();
    expect(screen.getByText("+40 공동 XP")).toBeInTheDocument();
    expect(screen.getByText("예비 러너 저장됨")).toBeInTheDocument();
    expect(screen.getByText("첫 러닝 스냅 미션")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+60xp 완료하기" }));

    expect(screen.getByText("첫 스냅 완료")).toBeInTheDocument();
    expect(screen.getByText("공동 러닝 페르소나")).toBeInTheDocument();
    expect(screen.getByText("Lv.2 · 100xp")).toBeInTheDocument();
  });

  it("opens an invite route as an accept screen", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/invite/running-meet-88");

    render(<App />);

    expect(screen.getByText("초대 링크로 들어왔어요")).toBeInTheDocument();
    expect(screen.getByText("성수천 러닝 모임 초대")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "초대 수락하고 시작하기" }));

    expect(screen.getByText("친구 1명 참여 대기")).toBeInTheDocument();
    expect(screen.getByText("초대 손님 저장됨")).toBeInTheDocument();
    expect(screen.getByText("첫 러닝 스냅 미션")).toBeInTheDocument();
  });

  it("keeps the meet room state after remounting the app", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));
    await user.click(screen.getByRole("button", { name: "러닝 친구 초대하기" }));
    await user.click(screen.getByRole("button", { name: "초대 수락 미리보기" }));
    await user.click(screen.getByRole("button", { name: "+60xp 완료하기" }));

    unmount();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "모임" }));

    expect(screen.getByText("미션 완료")).toBeInTheDocument();
    expect(screen.getByText("공동 러닝 페르소나")).toBeInTheDocument();
    expect(screen.getByText("Lv.2 · 100xp")).toBeInTheDocument();
  });

  it("opens the report view from the tab bar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    expect(screen.getByText("7일 생활 리포트")).toBeInTheDocument();
    expect(screen.getByText("AI가 발견한 숨은 습관")).toBeInTheDocument();
  });

  it("lets the user soften or hide AI habit insights", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    const insight = screen.getByRole("article", { name: "도서관에서 집중이 반복돼요" });

    await user.click(within(insight).getByRole("button", { name: "문구 순하게" }));

    expect(screen.getByText("조금 더 부드럽게 볼게요")).toBeInTheDocument();
    expect(within(insight).getByText(/가능성으로 보면/)).toBeInTheDocument();

    await user.click(within(insight).getByRole("button", { name: "관심 없음" }));

    expect(screen.getByText("숨긴 인사이트 1개")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "도서관에서 집중이 반복돼요" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "숨긴 인사이트 다시 보기" }));

    expect(screen.getByRole("article", { name: "도서관에서 집중이 반복돼요" })).toBeInTheDocument();
  });

  it("keeps hidden AI habit insights after remounting the app", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    const insight = screen.getByRole("article", { name: "도서관에서 집중이 반복돼요" });

    await user.click(within(insight).getByRole("button", { name: "관심 없음" }));

    unmount();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));

    expect(screen.getByText("숨긴 인사이트 1개")).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: "도서관에서 집중이 반복돼요" })).toBeNull();
  });

  it("opens AI-curated old memories inside the report view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));
    await user.click(screen.getByRole("button", { name: "오래된 기억" }));

    expect(screen.getByText("기억 더듬기")).toBeInTheDocument();
    expect(screen.getByText("오래전의 러닝 감각")).toBeInTheDocument();
    expect(screen.getByText("2026년 4월")).toBeInTheDocument();
  });

  it("filters old memories by month, place, and persona", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "리포트" }));
    await user.click(screen.getByRole("button", { name: "오래된 기억" }));

    expect(screen.getByText("기억 필터")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "월 · 2026년 4월" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "장소 · 야외" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "페르소나 · 운동" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "장소 · 야외" }));

    expect(screen.getByText("장소 · 야외")).toBeInTheDocument();
    expect(screen.getByText("오래전의 러닝 감각")).toBeInTheDocument();
  });

  it("renders a living animated persona instead of a static image", () => {
    const { container } = render(<App />);

    expect(container.querySelector("[data-animated-persona='true']")).toBeInTheDocument();
    expect(container.querySelector(".avatar-arm.left")).toBeInTheDocument();
    expect(container.querySelector(".avatar-shadow")).toBeInTheDocument();
  });
});
