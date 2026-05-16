# Formi

**Formi** (form + me). 정체성 없는 말랑한 자아가 생활 기록을 통해 형태를 얻어 가는 앱입니다. 생활 스냅을 찍으면 페르소나가 성장하고, AI가 내가 모르는 생활 습관까지 발견해 건강한 루틴으로 바꿔줍니다.

이전 작업명은 Persona Habit 이며 일부 문서에 아직 남아 있습니다.

## Concept

- 공부, 식단, 운동, 독서, 정리, 셀프케어 같은 생활 순간을 사진 스냅으로 기록합니다.
- 스냅 기록은 여러 페르소나의 XP, 레벨, 꾸미기 아이템, 진화 상태로 변환됩니다.
- 대표 페르소나의 집, 방 꾸미기, 페르소나 꾸미기, 친구 모임 소셜 루프를 포함합니다.
- 7일 리포트에서 AI가 장소, 시간, 카테고리 패턴을 분석해 숨은 습관과 건강한 다음 행동을 제안합니다.

## 저장소 구조

- 루트 — iOS/Android 출시 전 제품 흐름을 검증한 모바일 웹 프로토타입 (Vite + React).
- `mobile/` — Expo (SDK 54) 기반 iOS/Android 네이티브 앱. 현재 활성 개발 대상. 실행법은 [mobile/README.md](mobile/README.md).
- 도메인 로직 (`src/lib/*` 의 persona/journal/social/memory/weather 등) 은 웹과 네이티브가 공유합니다.

## Prototype (웹)

웹 버전은 iOS/Android 앱 출시 전 제품 흐름을 검증한 모바일 웹 프로토타입입니다.

- Vite
- React
- TypeScript
- Vitest
- CSS layered character animation
- Interactive snap decoration and latest-snap persona home reaction
- Local alpha persistence for snap records, persona nicknames, decor, and proof stamps
- Korean-first i18n foundation with persisted language preference

## Local Run

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/
```

## Checks

```bash
npm run lint
npm run format:check
npm run test:run
npm run build
npm run ci
```

`npm run ci` is the full local harness. GitHub Actions runs the same command on pushes and pull requests to `main`.

## Product Docs

- PRD: `docs/superpowers/specs/2026-05-13-persona-habit-prd.md`
- PRD Korean: `docs/superpowers/specs/2026-05-13-persona-habit-prd-ko.md`
- Alpha report: `docs/alpha/persona-habit-alpha-report.md`
- 10-tester evaluation: `docs/alpha/persona-habit-10-tester-evaluation-report.md`
- i18n plan: `docs/i18n/persona-habit-i18n-plan.md`
- Roadmap: `docs/roadmap/persona-habit-roadmap.md`
- Agent org chart: `docs/agents/persona-habit-agent-org-chart.md`
- Native readiness: `docs/native/expo-readiness-plan.md`
- Proof snap benchmark: `docs/snap/persona-proof-snap-benchmark.md`
- Implementation plan: `docs/superpowers/plans/2026-05-13-persona-habit-prototype.md`
- Next build plan: `docs/superpowers/plans/2026-05-14-roadmap-refresh-next-build.md`
