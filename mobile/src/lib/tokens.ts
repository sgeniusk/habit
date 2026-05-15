// 웹의 styles.css 토큰을 RN StyleSheet 친화로 매핑한다.
export const colors = {
  ink: "#1c2733",
  muted: "#667267",
  paper: "#fbfcf3",
  background: "#f4f7e8",
  line: "#d8e2d1",
  leaf: "#2f9d65",
  leafSoft: "#e6f6e8",
  mint: "#ccefd6",
  coral: "#ef6f63",
  coralSoft: "#fff5f3",
  blue: "#5477d2",
  gold: "#f0bf3b",
  white: "#ffffff"
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
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999
} as const;

export const typography = {
  eyebrow: { fontSize: 12, fontWeight: "800" as const, letterSpacing: 0.6 },
  title: { fontSize: 26, fontWeight: "900" as const, lineHeight: 30 },
  h2: { fontSize: 20, fontWeight: "900" as const, lineHeight: 24 },
  h3: { fontSize: 16, fontWeight: "900" as const, lineHeight: 20 },
  body: { fontSize: 14, fontWeight: "700" as const, lineHeight: 20 },
  small: { fontSize: 12, fontWeight: "800" as const }
} as const;

export const shadows = {
  card: {
    shadowColor: "#1c2733",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3
  }
} as const;
