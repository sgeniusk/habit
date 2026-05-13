# Persona Habit Prototype

생활 인증샷을 찍으면 귀여운 페르소나가 성장하고, AI가 내가 모르는 생활 습관까지 발견해 건강한 루틴으로 바꿔주는 앱 프로토타입입니다.

## Concept

- 공부, 식단, 운동, 독서, 정리, 셀프케어 같은 생활 인증을 사진으로 기록합니다.
- 인증 기록은 여러 페르소나의 XP, 레벨, 꾸미기 아이템, 진화 상태로 변환됩니다.
- 친구와 함께 생활방을 만들고 공동 페르소나를 키우는 소셜 루프를 포함합니다.
- 7일 리포트에서 AI가 장소, 시간, 카테고리 패턴을 분석해 숨은 습관과 건강한 다음 행동을 제안합니다.

## Prototype

현재 버전은 iOS/Android 앱 출시 전 제품 흐름을 검증하기 위한 모바일 웹 프로토타입입니다.

- Vite
- React
- TypeScript
- Vitest
- CSS layered character animation

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
- Implementation plan: `docs/superpowers/plans/2026-05-13-persona-habit-prototype.md`
