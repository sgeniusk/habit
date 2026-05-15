import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Apple,
  BookOpen,
  CheckCircle2,
  Clipboard,
  Link,
  Share2,
  Sparkles,
  Trophy,
  UserPlus,
  Users
} from "lucide-react";
import { PersonaAvatar } from "../components/PersonaAvatar";
import { RoomRow } from "../components/RoomRow";
import { localize, t } from "../lib/i18n";
import {
  acceptMeetInvite,
  applyMeetSuggestionFeedback,
  buildMeetInvite,
  buildMeetSessionFromInviteToken,
  buildMeetSuggestions,
  completeMeetFirstSnapMission,
  createMeetSession,
  upsertMeetSuggestionFeedback,
  type MeetSuggestionFeedbackAction,
  type MeetSession
} from "../lib/socialEngine";
import {
  loadMeetSession,
  loadMeetSuggestionFeedback,
  saveMeetSession,
  saveMeetSuggestionFeedback
} from "../lib/persistence";
import type { Locale, SnapRecord } from "../types/habit";

export function MeetView({
  locale,
  records,
  inviteToken = ""
}: {
  locale: Locale;
  records: SnapRecord[];
  inviteToken?: string;
}) {
  const baseSuggestions = useMemo(() => buildMeetSuggestions(records), [records]);
  const [suggestionFeedback, setSuggestionFeedback] = useState(() => loadMeetSuggestionFeedback());
  const suggestions = useMemo(
    () => applyMeetSuggestionFeedback(baseSuggestions, suggestionFeedback),
    [baseSuggestions, suggestionFeedback]
  );
  const topSuggestion = suggestions[0];
  const hiddenSuggestionCount = suggestionFeedback.filter(
    (feedback) => feedback.action === "hidden"
  ).length;
  const routeInviteSession = useMemo(
    () => (inviteToken ? buildMeetSessionFromInviteToken(inviteToken, records) : null),
    [inviteToken, records]
  );
  const [meetSession, setMeetSession] = useState<MeetSession | null>(() => loadMeetSession());
  const [shareStatus, setShareStatus] = useState("");
  const [suggestionStatus, setSuggestionStatus] = useState("");
  const waitingMember = meetSession?.members.find(
    (member) => member.status === "waiting-first-snap"
  );
  const contributedMember = meetSession?.members.find((member) => member.status === "contributed");

  useEffect(() => {
    if (meetSession) {
      saveMeetSession(meetSession);
    }
  }, [meetSession]);

  useEffect(() => {
    saveMeetSuggestionFeedback(suggestionFeedback);
  }, [suggestionFeedback]);

  function createInvite() {
    if (!topSuggestion) {
      return;
    }

    setMeetSession(createMeetSession(buildMeetInvite(topSuggestion)));
    setShareStatus("");
  }

  async function copyInviteLink() {
    if (!meetSession) {
      return;
    }

    try {
      await navigator.clipboard?.writeText?.(meetSession.invite.inviteUrl);
      setShareStatus(t(locale, "meet.shareCopySuccess"));
    } catch {
      setShareStatus(t(locale, "meet.shareCopyManual"));
    }
  }

  function prepareShareMessage() {
    setShareStatus(t(locale, "meet.shareMessageReady"));
  }

  function previewInviteAccept() {
    setMeetSession((currentSession) => {
      if (!topSuggestion) {
        return currentSession;
      }

      const session = currentSession ?? createMeetSession(buildMeetInvite(topSuggestion));

      return acceptMeetInvite(session, {
        id: "preview-runner",
        name: session.invite.previewMemberName
      });
    });
  }

  function completeFirstSnapMission() {
    setMeetSession((currentSession) =>
      currentSession
        ? completeMeetFirstSnapMission(currentSession, "preview-runner")
        : currentSession
    );
  }

  function acceptRouteInvite() {
    if (!routeInviteSession) {
      return;
    }

    setMeetSession(
      acceptMeetInvite(routeInviteSession, {
        id: "route-guest",
        name: { ko: "초대 손님", en: "Invited guest" }
      })
    );
  }

  function tuneSuggestionFeedback(action: MeetSuggestionFeedbackAction) {
    if (!topSuggestion) {
      return;
    }

    setSuggestionFeedback((current) =>
      upsertMeetSuggestionFeedback(current, topSuggestion.id, action)
    );
    setSuggestionStatus(
      buildSuggestionFeedbackMessage(localize(topSuggestion.title, locale), action, locale)
    );
  }

  function restoreHiddenSuggestions() {
    setSuggestionFeedback([]);
    setSuggestionStatus(t(locale, "meet.restoreFeedbackMessage"));
  }

  return (
    <section className="screen rooms-screen" aria-labelledby="meet-title">
      <div className="top-strip">
        <div>
          <p className="eyebrow">{t(locale, "meet.eyebrow")}</p>
          <h1 id="meet-title">{t(locale, "meet.title")}</h1>
        </div>
        <button type="button" className="icon-button" aria-label={t(locale, "meet.iconAria")}>
          <Users size={20} aria-hidden="true" />
        </button>
      </div>

      <article className="room-hero">
        <div>
          <p className="eyebrow">{t(locale, "meet.heroEyebrow")}</p>
          <h2>{t(locale, "meet.heroTitle")}</h2>
          <p>{t(locale, "meet.heroDescription")}</p>
        </div>
        <PersonaAvatar tone="blue" accessory="group" />
      </article>

      {suggestionStatus ? (
        <p className="meet-feedback-status" role="status">
          {suggestionStatus}
        </p>
      ) : null}

      {hiddenSuggestionCount > 0 ? (
        <div className="hidden-meet-panel">
          <strong>{formatHiddenMeetCount(locale, hiddenSuggestionCount)}</strong>
          <button type="button" onClick={restoreHiddenSuggestions}>
            {t(locale, "meet.restoreHidden")}
          </button>
        </div>
      ) : null}

      {topSuggestion ? (
        <article
          className="meet-suggestion-card"
          aria-labelledby="meet-suggestion-title"
          aria-label={localize(topSuggestion.title, locale)}
        >
          <div className="suggestion-heading">
            <span className="suggestion-icon">
              <Sparkles size={18} aria-hidden="true" />
            </span>
            <div>
              <p className="eyebrow">{t(locale, "meet.suggestionEyebrow")}</p>
              <h2 id="meet-suggestion-title">{localize(topSuggestion.title, locale)}</h2>
            </div>
          </div>
          <p>{localize(topSuggestion.reason, locale)}</p>
          <div className="suggestion-signal-row">
            <span>{localize(topSuggestion.signalLabel, locale)}</span>
            <strong>{`${topSuggestion.matchScore}% ${t(locale, "meet.matchSuffix")}`}</strong>
          </div>
          <div className="suggestion-feedback-row" aria-label={t(locale, "meet.feedbackAria")}>
            <button type="button" onClick={() => tuneSuggestionFeedback("pinned")}>
              {t(locale, "meet.feedbackPin")}
            </button>
            <button type="button" onClick={() => tuneSuggestionFeedback("later")}>
              {t(locale, "meet.feedbackLater")}
            </button>
            <button type="button" onClick={() => tuneSuggestionFeedback("hidden")}>
              {t(locale, "meet.feedbackHide")}
            </button>
          </div>
          <button type="button" className="invite-suggestion-button" onClick={createInvite}>
            <UserPlus size={18} aria-hidden="true" />
            {localize(topSuggestion.cta, locale)}
          </button>
        </article>
      ) : (
        <section className="meet-suggestion-card" aria-labelledby="hidden-all-meet-title">
          <div>
            <p className="eyebrow">{t(locale, "meet.suggestionEyebrow")}</p>
            <h2 id="hidden-all-meet-title">{t(locale, "meet.allHiddenTitle")}</h2>
          </div>
          <p>{t(locale, "meet.allHiddenBody")}</p>
        </section>
      )}

      {!meetSession && routeInviteSession ? (
        <section className="invite-accept-card" aria-labelledby="invite-accept-title">
          <div>
            <p className="eyebrow">{t(locale, "meet.inviteRouteEyebrow")}</p>
            <h2 id="invite-accept-title">{t(locale, "meet.inviteRouteTitle")}</h2>
          </div>
          <strong>{`${localize(routeInviteSession.invite.roomTitle, locale)} ${t(locale, "meet.inviteRouteSubtitle")}`}</strong>
          <p>{t(locale, "meet.inviteRouteBody")}</p>
          <button type="button" onClick={acceptRouteInvite}>
            {t(locale, "meet.inviteRouteAccept")}
          </button>
        </section>
      ) : null}

      {meetSession ? (
        <section className="meet-invite-card" aria-labelledby="meet-invite-title">
          <div className="invite-status-row">
            <span>
              <Link size={15} aria-hidden="true" />
              {waitingMember
                ? t(locale, "meet.inviteWaiting")
                : contributedMember
                  ? t(locale, "meet.inviteCompleted")
                  : t(locale, "meet.inviteCreated")}
            </span>
            {waitingMember ? (
              <strong>{`+${meetSession.invite.sharedXp} ${t(locale, "meet.sharedXpSuffix")}`}</strong>
            ) : null}
          </div>
          <div>
            <p className="eyebrow">{t(locale, "meet.inviteRoomEyebrow")}</p>
            <h2 id="meet-invite-title">{`${localize(meetSession.invite.roomTitle, locale)} ${t(locale, "meet.inviteRoomSuffix")}`}</h2>
          </div>
          <p>{localize(meetSession.invite.description, locale)}</p>
          <code>{meetSession.invite.inviteUrl}</code>
          <div className="invite-action-row">
            <button type="button" onClick={copyInviteLink}>
              <Clipboard size={16} aria-hidden="true" />
              {t(locale, "meet.copyInvite")}
            </button>
            <button type="button" onClick={prepareShareMessage}>
              <Share2 size={16} aria-hidden="true" />
              {t(locale, "meet.prepareShare")}
            </button>
          </div>
          {shareStatus ? <strong className="invite-share-status">{shareStatus}</strong> : null}
          {waitingMember || contributedMember ? (
            <>
              <div className="invite-member-row">
                <CheckCircle2 size={18} aria-hidden="true" />
                <span>{`${localize((waitingMember ?? contributedMember)?.name ?? { ko: "", en: "" }, locale)} ${t(locale, "meet.memberSavedSuffix")}`}</span>
              </div>
              <section
                className="group-persona-card"
                aria-label={t(locale, "meet.groupPersonaAria")}
              >
                <div>
                  <Trophy size={18} aria-hidden="true" />
                  <div>
                    <h3>{localize(meetSession.groupPersona.name, locale)}</h3>
                    <span>
                      Lv.{meetSession.groupPersona.level} · {meetSession.groupPersona.xp}xp
                    </span>
                  </div>
                </div>
                <p>{localize(meetSession.groupPersona.mood, locale)}</p>
                <div className="progress-track" aria-label={t(locale, "meet.groupProgressAria")}>
                  <span style={{ width: `${Math.max(meetSession.groupPersona.progress, 8)}%` }} />
                </div>
              </section>
              <section
                className="first-snap-mission"
                aria-label={localize(meetSession.firstSnapMission.title, locale)}
              >
                <div>
                  <strong>{localize(meetSession.firstSnapMission.title, locale)}</strong>
                  <span>
                    {meetSession.firstSnapMission.status === "completed"
                      ? t(locale, "meet.missionCompleted")
                      : t(locale, "meet.missionWaiting")}
                  </span>
                </div>
                <p>{localize(meetSession.firstSnapMission.description, locale)}</p>
                {meetSession.firstSnapMission.status === "waiting" ? (
                  <button type="button" onClick={completeFirstSnapMission}>
                    {`+${meetSession.firstSnapMission.rewardXp}xp ${t(locale, "meet.missionCompleteButton")}`}
                  </button>
                ) : null}
              </section>
            </>
          ) : (
            <button type="button" className="accept-preview-button" onClick={previewInviteAccept}>
              {t(locale, "meet.previewAccept")}
            </button>
          )}
        </section>
      ) : null}

      <div className="room-stack">
        <RoomRow title="도서관 9시 클럽" subtitle="오늘 3명 기록" value="82%" icon={BookOpen} />
        <RoomRow title="저녁 산책반" subtitle="이번 주 11개 스냅" value="64%" icon={Activity} />
        <RoomRow title="덜 시켜먹기" subtitle="식단 기록 연속 4일" value="71%" icon={Apple} />
      </div>
    </section>
  );
}

function formatHiddenMeetCount(locale: Locale, count: number) {
  if (locale === "en") {
    return `${count} hidden suggestion${count === 1 ? "" : "s"}`;
  }

  return `숨긴 모임 추천 ${count}개`;
}

function buildSuggestionFeedbackMessage(
  title: string,
  action: MeetSuggestionFeedbackAction,
  locale: Locale
) {
  if (locale === "en") {
    if (action === "pinned") {
      return `${title} pinned`;
    }
    if (action === "later") {
      return `${title} saved for later`;
    }
    return `${title} will be hidden`;
  }

  if (action === "pinned") {
    return `${title}을 고정했어요`;
  }

  if (action === "later") {
    return `${title}은 나중에 다시 볼게요`;
  }

  return `${title}은 덜 보여줄게요`;
}
