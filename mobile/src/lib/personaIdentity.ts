// 페르소나 애칭/직업/말투 라벨을 locale 별로 만든다.
import type { HabitCategory, Locale, PersonaVoiceMode } from "../types/habit";
import { getCategoryLabel } from "./personaEngine";

export type PersonaIdentity = {
  nickname: string;
  displayName: string;
  vocativeName: string;
  roleLabel: string;
  upgradeLabel: string;
};

export const defaultPersonaNicknames: Record<HabitCategory, string> = {
  study: "곰곰",
  meal: "냠냠",
  exercise: "달림",
  reading: "책콩",
  cleaning: "차곡",
  selfcare: "숨숨",
  hobby: "쏙쏙"
};

const roleLabelsKo: Record<HabitCategory, string> = {
  study: "학습자",
  meal: "식단러",
  exercise: "러너",
  reading: "독서가",
  cleaning: "정리러",
  selfcare: "회복러",
  hobby: "취미가"
};

const roleLabelsEn: Record<HabitCategory, string> = {
  study: "Learner",
  meal: "Meal keeper",
  exercise: "Runner",
  reading: "Reader",
  cleaning: "Tidier",
  selfcare: "Recoverer",
  hobby: "Hobbyist"
};

export function buildPersonaIdentity({
  category,
  nickname,
  level,
  xp,
  locale = "ko"
}: {
  category: HabitCategory;
  nickname: string;
  level: number;
  xp: number;
  locale?: Locale;
}): PersonaIdentity {
  return {
    nickname,
    displayName: formatPersonaDisplayName(nickname, locale),
    vocativeName: formatPersonaVocative(nickname, locale),
    roleLabel: getPersonaRoleLabel(category, locale),
    upgradeLabel: buildPersonaUpgradeLabel(category, level, xp, locale)
  };
}

export function buildPersonaCompanionLine({
  category,
  nickname,
  level,
  voiceMode = "cute",
  locale = "ko"
}: {
  category: HabitCategory;
  nickname: string;
  level: number;
  voiceMode?: PersonaVoiceMode;
  locale?: Locale;
}) {
  const vocativeName = formatPersonaVocative(nickname, locale);
  const categoryLabel = getCategoryLabel(category, locale);

  if (locale === "en") {
    if (voiceMode === "calm") {
      if (category === "study" && level >= 3) {
        return `${vocativeName} your study rhythm is settling in nicely. The flow toward the know-it-all persona looks good.`;
      }
      return `${vocativeName} your ${categoryLabel.toLowerCase()} snaps are stacking up calmly. The flow is steady enough to look for the next shift.`;
    }

    if (category === "study" && level >= 3) {
      return `${vocativeName} you really put in the ${categoryLabel.toLowerCase()} this time. You leveled up to the know-it-all persona.`;
    }
    return `${vocativeName} your ${categoryLabel.toLowerCase()} snaps stacked up well this round. A little more and a new persona unlocks.`;
  }

  if (voiceMode === "calm") {
    if (category === "study" && level >= 3) {
      return `${vocativeName}, 공부 리듬이 안정적으로 쌓이고 있어. 척척박사 페르소나까지 흐름이 좋아.`;
    }
    return `${vocativeName}, ${categoryLabel} 스냅이 차분히 쌓이고 있어. 다음 변화를 볼 만큼 흐름이 이어지고 있어.`;
  }

  if (category === "study" && level >= 3) {
    return `${vocativeName}. 이번에는 ${categoryLabel}를 많이 했네. 척척박사 페르소나로 업글됐어.`;
  }

  return `${vocativeName}. 이번에는 ${categoryLabel} 스냅이 잘 쌓였네. 조금만 더 하면 새 페르소나가 열릴 것 같아.`;
}

export function getPersonaRoleLabel(category: HabitCategory, locale: Locale = "ko") {
  return locale === "en" ? roleLabelsEn[category] : roleLabelsKo[category];
}

export function buildPersonaUpgradeLabel(
  category: HabitCategory,
  level: number,
  xp: number,
  locale: Locale = "ko"
) {
  if (category === "study" && (level >= 3 || xp >= 240)) {
    return locale === "en" ? "Know-it-all persona" : "척척박사 페르소나";
  }

  if (level >= 4) {
    return locale === "en"
      ? `${getPersonaRoleLabel(category, locale)} master`
      : `${getPersonaRoleLabel(category, locale)} 마스터`;
  }

  return locale === "en"
    ? `${getPersonaRoleLabel(category, locale)} growing`
    : `${getPersonaRoleLabel(category, locale)} 성장 중`;
}

export function formatPersonaDisplayName(nickname: string, locale: Locale = "ko") {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return locale === "en" ? "Persona" : "페르소나";
  }

  if (locale === "en") {
    return trimmed;
  }

  if (hasFinalConsonant(trimmed)) {
    return `${trimmed}이`;
  }

  return trimmed;
}

export function formatPersonaVocative(nickname: string, locale: Locale = "ko") {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return locale === "en" ? "Hi persona," : "페르소나야";
  }

  if (locale === "en") {
    return `Hi ${trimmed},`;
  }

  if (hasFinalConsonant(trimmed)) {
    return `${trimmed}아`;
  }

  return `${trimmed}야`;
}

function hasFinalConsonant(text: string) {
  const lastCharCode = text.charCodeAt(text.length - 1);
  const hangulStart = 0xac00;
  const hangulEnd = 0xd7a3;

  if (lastCharCode < hangulStart || lastCharCode > hangulEnd) {
    return false;
  }

  return (lastCharCode - hangulStart) % 28 !== 0;
}
