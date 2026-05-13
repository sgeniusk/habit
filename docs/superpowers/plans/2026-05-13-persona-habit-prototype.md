# Persona Habit Prototype Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first web prototype and PRD for a lifestyle proof-shot app where verification photos grow collectible personas and AI discovers hidden habits.

**Architecture:** Use a small Vite + React app with local sample data and pure TypeScript helper functions. Keep the persona/insight rules in `src/lib/personaEngine.ts`, and keep the UI in `src/App.tsx` plus `src/styles.css` so the prototype is easy to inspect.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, lucide-react, CSS.

---

## File Structure

- `docs/superpowers/specs/2026-05-13-persona-habit-prd.md`: Product requirements and launch direction.
- `docs/superpowers/plans/2026-05-13-persona-habit-prototype.md`: This implementation plan.
- `package.json`: Scripts and dependencies for the prototype.
- `index.html`: Vite entry document and font loading.
- `vite.config.ts`: Vite and Vitest configuration.
- `tsconfig.json`: TypeScript compiler settings.
- `src/main.tsx`: React entrypoint.
- `src/App.tsx`: Mobile app prototype screens and interactions.
- `src/styles.css`: Visual system, layout, character styling, responsive behavior.
- `src/lib/personaEngine.ts`: Pure functions for XP, persona summaries, and AI-style insights.
- `src/lib/personaEngine.test.ts`: Unit tests for persona growth and hidden habit insights.
- `src/App.test.tsx`: Smoke tests for the core prototype flow.
- `src/test/setup.ts`: Testing Library setup.

## Chunk 1: Project Setup And Red Tests

- [x] **Step 1: Create docs and project folders**

Run: `mkdir -p docs/superpowers/specs docs/superpowers/plans src/lib src/test`

- [ ] **Step 2: Add package and test configuration**

Create `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, and `src/test/setup.ts`.

- [ ] **Step 3: Write failing persona engine tests**

Create `src/lib/personaEngine.test.ts` with expectations for XP totals, multiple personas, and hidden habit insights.

- [ ] **Step 4: Write failing app smoke test**

Create `src/App.test.tsx` and assert that the app renders the main tabs and switches to the report tab.

- [ ] **Step 5: Run tests and verify RED**

Run: `npm test -- --run`

Expected: tests fail because implementation files are missing.

## Chunk 2: Persona Engine

- [ ] **Step 1: Implement `src/lib/personaEngine.ts`**

Include `buildPersonaSummaries`, `findHiddenHabitInsights`, and `getCategoryLabel`.

- [ ] **Step 2: Run persona engine tests**

Run: `npm test -- --run src/lib/personaEngine.test.ts`

Expected: tests pass.

## Chunk 3: Prototype UI

- [ ] **Step 1: Implement React entry and app**

Create `src/main.tsx` and `src/App.tsx` with Today, Capture, Personas, Rooms, and Report tabs.

- [ ] **Step 2: Implement visual system**

Create `src/styles.css` with a distinctive mobile-first app design, abstract persona characters, stable tab dimensions, and responsive layout.

- [ ] **Step 3: Run app smoke test**

Run: `npm test -- --run src/App.test.tsx`

Expected: tests pass.

## Chunk 4: Verification

- [ ] **Step 1: Run all tests**

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Start dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: local URL is available for browser verification.

- [ ] **Step 4: Browser verify prototype**

Open the local URL and verify the UI renders, tabs work, text fits, and the capture flow is visible.

