# Roadmap Refresh Next Build Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh Persona Habit's development path so the next build can move from a polished prototype into a maintainable snap, persona, journal, and social loop.

**Architecture:** Treat the current app as a working prototype that needs stabilization before more features are added. First split static product data and domain types out of `src/App.tsx`, then make the Snap loop interactive, then connect the Persona Home loop to real records. Keep every step covered by Testing Library or persona engine tests.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS, npm harness.

---

## File Structure

- Create: `src/data/sampleRecords.ts`
  - Owns sample `SnapRecord` data used by the prototype.
- Create: `src/data/personaCatalog.ts`
  - Owns display personas, home activities, room items, outfits, filters, and stickers.
- Create: `src/types/habit.ts`
  - Owns shared domain types: `HabitCategory`, `PlaceType`, `SnapRecord`, `PersonaCard`.
- Modify: `src/lib/personaEngine.ts`
  - Imports shared types, keeps pure growth and insight logic.
- Modify: `src/App.tsx`
  - Uses imported data and types. Keeps tab state and high-level view composition.
- Modify: `src/App.test.tsx`
  - Adds behavior coverage for snap preview, selected filters/stickers, and home reaction state.
- Modify: `src/styles.css`
  - Adds focused styles only when new visible state requires them.
- Modify: `docs/roadmap/persona-habit-roadmap.md`
  - Keep roadmap status current after each phase.

## Chunk 1: Stabilize Domain Boundaries

**Files:**

- Create: `src/types/habit.ts`
- Create: `src/data/sampleRecords.ts`
- Create: `src/data/personaCatalog.ts`
- Modify: `src/lib/personaEngine.ts`
- Modify: `src/App.tsx`
- Test: `src/lib/personaEngine.test.ts`, `src/App.test.tsx`

- [ ] **Step 1: Write type import tests by running current test suite**

  Run: `npm run test:run`

  Expected: current tests pass before the refactor starts.

- [ ] **Step 2: Create `src/types/habit.ts`**

  Move these exported types out of `src/lib/personaEngine.ts`:

  ```ts
  export type HabitCategory =
    | "study"
    | "meal"
    | "exercise"
    | "reading"
    | "cleaning"
    | "selfcare"
    | "hobby";

  export type PlaceType =
    | "home"
    | "library"
    | "school"
    | "cafe"
    | "gym"
    | "restaurant"
    | "outdoors"
    | "other";

  export type SnapRecord = {
    id: string;
    category: HabitCategory;
    placeType: PlaceType;
    createdAt: string;
    memo?: string;
    imageUrl?: string;
    filter?: string;
    sticker?: string;
  };
  ```

- [ ] **Step 3: Preserve backwards compatibility temporarily**

  In `src/lib/personaEngine.ts`, import `SnapRecord` and export a temporary alias:

  ```ts
  export type VerificationRecord = SnapRecord;
  ```

  This lets the refactor stay small while app and tests move over.

- [ ] **Step 4: Move `initialRecords` into `src/data/sampleRecords.ts`**

  Export:

  ```ts
  export const initialRecords: SnapRecord[] = [...]
  ```

- [ ] **Step 5: Move display catalog data into `src/data/personaCatalog.ts`**

  Export:
  - `personaCatalog`
  - `filterOptions`
  - `stickerOptions`
  - `roomItems`
  - `outfitItems`
  - `categoryOptions`
  - `placeOptions`

- [ ] **Step 6: Update imports in `src/App.tsx`**

  Remove inline sample and catalog constants from `App.tsx`. Import them from `src/data/*` and shared types from `src/types/habit`.

- [ ] **Step 7: Run tests and commit**

  Run:

  ```bash
  npm run test:run
  npm run lint
  ```

  Expected: tests and lint pass.

  Commit:

  ```bash
  git add src
  git commit -m "Refactor habit prototype data boundaries"
  ```

## Chunk 2: Make The Snap Loop Feel Real

**Files:**

- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`
- Modify: `src/types/habit.ts`

- [ ] **Step 1: Write failing tests for selected filter and sticker**

  Add a test that opens `스냅`, clicks `필름`, clicks `🏃 러닝`, enters a memo, clicks `꾸며서 올리기`, and expects the new record to appear with the chosen category/place/memo context.

- [ ] **Step 2: Add selected snap decoration state**

  In `App`, add state:

  ```ts
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);
  const [selectedSticker, setSelectedSticker] = useState(stickerOptions[0]);
  ```

- [ ] **Step 3: Store filter and sticker on new records**

  Extend `saveRecord()` so the new `SnapRecord` includes:

  ```ts
  filter: selectedFilter,
  sticker: selectedSticker
  ```

- [ ] **Step 4: Show selected states in Snap view**

  Pass selected filter/sticker props into `SnapView`. Buttons should set state and use `is-selected` when active.

- [ ] **Step 5: Show filter/sticker in `RecordRow`**

  Add small metadata text such as `필름 · 🏃 러닝` when a record has decoration data.

- [ ] **Step 6: Run focused tests**

  Run: `npm test -- --run src/App.test.tsx`

  Expected: new Snap loop test passes.

- [ ] **Step 7: Commit**

  ```bash
  git add src
  git commit -m "Add interactive snap decoration loop"
  ```

## Chunk 3: Connect Persona Home To Records

**Files:**

- Modify: `src/data/personaCatalog.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/lib/personaEngine.ts`

- [ ] **Step 1: Add a failing Home reaction test**

  Add a test that saves an 운동 스냅, opens `집`, and expects `루틴 러너` or a runner activity to become visible as the active home state.

- [ ] **Step 2: Add category-to-persona selection helper**

  Add a pure helper in `personaCatalog.ts`:

  ```ts
  export function findPersonaByCategory(category: HabitCategory): PersonaCard;
  ```

  It should map:
  - `study` -> `새벽 학습자`
  - `exercise` -> `루틴 러너`
  - `meal` -> `클린식단러`
  - `reading` -> `페이지 수집가`
  - `cleaning` -> `방정리 장인`
  - `selfcare` -> `건강관리형 수험생` for now

- [ ] **Step 3: Choose active home persona from latest record**

  In `App`, derive:

  ```ts
  const activeHomePersona = findPersonaByCategory(records[0].category);
  ```

  Pass it to `HomeView`.

- [ ] **Step 4: Keep catalog visible**

  `HomeView` should still show all owned personas, but the stage and activity panel should use `activeHomePersona`.

- [ ] **Step 5: Run focused tests**

  Run: `npm test -- --run src/App.test.tsx`

  Expected: Home reaction test passes.

- [ ] **Step 6: Commit**

  ```bash
  git add src
  git commit -m "Connect home persona to latest snap"
  ```

## Chunk 4: Refresh Roadmap State After Implementation

**Files:**

- Modify: `docs/roadmap/persona-habit-roadmap.md`
- Modify: `README.md`

- [ ] **Step 1: Update roadmap completed items**

  Mark Phase 0 as complete if data boundaries are split and tests pass.

- [ ] **Step 2: Add roadmap link to README**

  Under Product Docs, add:

  ```md
  - Roadmap: `docs/roadmap/persona-habit-roadmap.md`
  ```

- [ ] **Step 3: Run full local harness**

  Run:

  ```bash
  npm run ci
  ```

  Expected: lint, format, tests, build, and audit pass. If local audit cannot reach the npm registry because of sandbox network limits, run `npm run lint`, `npm run format:check`, `npm run test:run`, and `npm run build`, then rely on GitHub Actions for the networked audit.

- [ ] **Step 4: Commit and push**

  ```bash
  git add README.md docs/roadmap/persona-habit-roadmap.md
  git commit -m "Refresh roadmap after snap loop build"
  git push origin main
  ```

## Verification Checklist

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run test:run`
- [ ] `npm run build`
- [ ] `npm run ci` or GitHub Actions CI for networked audit
- [ ] Browser check `http://127.0.0.1:5173/`
- [ ] Vercel production deployment status
