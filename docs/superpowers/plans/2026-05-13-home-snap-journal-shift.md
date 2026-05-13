# Home Snap Journal Shift Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Shift the prototype from a strict proof-shot habit app into a lifestyle snap, persona home, weather-aware daily journal, and decoration loop.

**Architecture:** Keep the existing single-file React prototype for speed, but update the product language and visible flows. Add a richer persona catalog in `src/App.tsx`, preserve pure habit analysis in `src/lib/personaEngine.ts`, and cover the new tab labels and key UI surfaces in `src/App.test.tsx`.

**Tech Stack:** React, TypeScript, CSS, Vitest, Testing Library.

---

## Chunk 1: Test The New Product Shape

**Files:**

- Modify: `src/App.test.tsx`

- [x] Step 1: Change tab expectations from `인증/페르소나/방` to `스냅/집/모임`.
- [x] Step 2: Add assertions for weather/location, journal mode choice, home decoration, persona activity, and snap filters.
- [x] Step 3: Run `npm test -- --run src/App.test.tsx` and verify RED.

## Chunk 2: Prototype UI Update

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [x] Step 1: Rename tab ids and labels to `today/snap/home/meet/report`.
- [x] Step 2: Update Today view with outdoor representative persona, weather/location card, daily journal, and AI/self writing choice.
- [x] Step 3: Update Snap view with softer language, filters, stickers, one-line mood, and publish CTA.
- [x] Step 4: Replace Persona view with Home view showing active persona activity, persona collection, room decoration, and avatar styling.
- [x] Step 5: Rename Rooms to Meet and soften copy around group lifestyle rooms.

## Chunk 3: PRD Update And Verification

**Files:**

- Modify: `docs/superpowers/specs/2026-05-13-persona-habit-prd-ko.md`
- Modify: `docs/superpowers/specs/2026-05-13-persona-habit-prd.md`
- Modify: `README.md` if wording needs alignment.

- [x] Step 1: Update PRDs with the new tab structure and benchmark-inspired feature scope.
- [x] Step 2: Run `npm run ci`.
- [x] Step 3: Browser verify Vercel/local target after deployment.
