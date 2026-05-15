import type { HabitCategory, PersonaVoiceMode } from "../types/habit";
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

const roleLabels: Record<HabitCategory, string> = {
  study: "학습자",
  meal: "식단러",
  exercise: "러너",
  reading: "독서가",
  cleaning: "정리러",
  selfcare: "회복러",
  hobby: "취미가"
};

export function buildPersonaIdentity({
  category,
  nickname,
  level,
  xp
}: {
  category: HabitCategory;
  nickname: string;
  level: number;
  xp: number;
}): PersonaIdentity {
  return {
    nickname,
    displayName: formatPersonaDisplayName(nickname),
    vocativeName: formatPersonaVocative(nickname),
    roleLabel: getPersonaRoleLabel(category),
    upgradeLabel: buildPersonaUpgradeLabel(category, level, xp)
  };
}

export function buildPersonaCompanionLine({
  category,
  nickname,
  level,
  voiceMode = "cute"
}: {
  category: HabitCategory;
  nickname: string;
  level: number;
  voiceMode?: PersonaVoiceMode;
}) {
  const vocativeName = formatPersonaVocative(nickname);
  const categoryLabel = getCategoryLabel(category);

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

export function getPersonaRoleLabel(category: HabitCategory) {
  return roleLabels[category];
}

export function buildPersonaUpgradeLabel(category: HabitCategory, level: number, xp: number) {
  if (category === "study" && (level >= 3 || xp >= 240)) {
    return "척척박사 페르소나";
  }

  if (level >= 4) {
    return `${getPersonaRoleLabel(category)} 마스터`;
  }

  return `${getPersonaRoleLabel(category)} 성장 중`;
}

export function formatPersonaDisplayName(nickname: string) {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return "페르소나";
  }

  if (hasFinalConsonant(trimmed)) {
    return `${trimmed}이`;
  }

  return trimmed;
}

export function formatPersonaVocative(nickname: string) {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return "페르소나야";
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
