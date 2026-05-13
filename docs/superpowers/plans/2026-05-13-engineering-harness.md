# Engineering Harness Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a repeatable engineering harness so every push can lint, format-check, test, build, audit, and deploy with confidence.

**Architecture:** Keep the harness lightweight and close to the existing Vite React app. Add package scripts for local use, flat ESLint and Prettier config files for style gates, and a GitHub Actions workflow that runs the same checks on push and pull request events.

**Tech Stack:** npm scripts, ESLint flat config, TypeScript ESLint, Prettier, GitHub Actions, Vercel Git integration.

---

## Chunk 1: Local Harness

**Files:**

- Modify: `package.json`
- Create: `eslint.config.js`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `README.md`

- [x] Step 1: Verify current RED state with `npm run ci`.
- [x] Step 2: Install lint and format dependencies.
- [x] Step 3: Add scripts: `lint`, `format`, `format:check`, `typecheck`, `test:run`, and `ci`.
- [x] Step 4: Add ESLint and Prettier configuration.
- [x] Step 5: Run formatter once so `format:check` can pass.

## Chunk 2: GitHub Harness

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`

- [x] Step 1: Add CI workflow using Node 24 and `npm ci`.
- [x] Step 2: Run `npm run ci` in CI.
- [x] Step 3: Add Dependabot for npm and GitHub Actions updates.

## Chunk 3: Verification And Publish

- [x] Step 1: Run `npm run ci`.
- [ ] Step 2: Commit the harness changes.
- [ ] Step 3: Push to GitHub.
- [ ] Step 4: Confirm GitHub Actions run status.
