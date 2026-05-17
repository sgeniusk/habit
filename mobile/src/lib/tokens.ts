// 디자인 토큰. Formi 리디자인 스펙(2026-05-17 Claude Design 핸드오프) 기준.
// 따뜻한 크림 베이스 + 세이지 그린 + 골드/테라코타, 가볍고 에디토리얼한 타이포.
export const colors = {
  // 텍스트
  ink: "#1e1c18", // tx9 — 본문 최진하게
  inkSoft: "#4a4740", // tx7
  muted: "#857f78", // tx5
  faint: "#afa99e", // tx4
  // 베이스
  paper: "#faf8f3", // surface
  background: "#f5f2ea", // bg — 따뜻한 크림
  line: "#e8e2d8", // border
  white: "#ffffff", // card
  // 그린 (primary)
  leaf: "#3d9a6e", // g500
  leafDeep: "#2a6e4e", // g700
  leafSoft: "#eef7f2", // g50
  mint: "#cce8d8", // g100
  sage: "#7cc4a4", // g300
  // 골드 (온기)
  gold: "#c89840", // a400
  goldSoft: "#fdf5e0", // a50
  // 테라코타 (캐릭터/강조)
  coral: "#c06858", // t400
  coralSoft: "#fdf0ec", // t50
  // 하늘
  blue: "#6f8bb0",
  sky: "#d8ecf8"
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
} as const;

export const radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  x2: 28,
  pill: 9999
} as const;

// 스펙 타이포 스케일 — Display/H1/H2/H3/Body/Caption/Label. 가벼운 무게(≤700).
export const typography = {
  eyebrow: { fontSize: 11, fontWeight: "700" as const, letterSpacing: 0.9 },
  display: { fontSize: 34, fontWeight: "700" as const, lineHeight: 40, letterSpacing: -1 },
  title: { fontSize: 26, fontWeight: "700" as const, lineHeight: 32, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: "600" as const, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: "600" as const, lineHeight: 23 },
  body: { fontSize: 14, fontWeight: "400" as const, lineHeight: 23 },
  small: { fontSize: 12, fontWeight: "500" as const, letterSpacing: 0.2 }
} as const;

// 따뜻하게 틴트된 부드러운 그림자 (스펙 sh1~sh3)
export const shadows = {
  soft: {
    shadowColor: "#1e1c18",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1
  },
  card: {
    shadowColor: "#1e1c18",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 2
  },
  lift: {
    shadowColor: "#1e1c18",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4
  }
} as const;
