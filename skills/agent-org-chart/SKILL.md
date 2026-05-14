---
name: agent-org-chart
description: Create and document clean company-style agent organization charts. Use when the user asks for an agent org chart, production agent team map, multi-agent organization, agent reporting lines, harness-managed agent structure, or a visual chart like a corporate organizational chart.
---

# Agent Org Chart

Use this skill to turn an agent system into a readable, presentation-ready organization chart and a supporting document. Favor a simple editable HTML/CSS org chart over generated images or wide left-to-right diagrams.

## Workflow

1. Inspect current project docs before inventing roles. Prioritize PRDs, harness plans, README, recent specs, and existing architecture notes.
2. Identify the top-level owner, orchestration layer, harness gates, and specialist agents.
3. Group specialists into 3-5 departments so the chart remains compact.
4. Create a visual artifact and a written document:
   - Primary visual: simple polished HTML using the template pattern in `assets/org-chart-template.html`.
   - Written doc: Markdown under `docs/agents/` with responsibilities, inputs, outputs, and harness checks.
5. Keep the diagram portrait or square when possible. Avoid long horizontal Mermaid chains.
6. Include a short “Operating Rhythm” section that explains how work moves from request to implementation to verification.

## Chart Rules

- Use a simple company org chart layout with compact rectangular boxes.
- Show a clear reporting line: Founder/User -> Orchestrator -> Departments -> Specialist agents.
- Place the Harness Gate near the Orchestrator, not as a distant leaf. It is a recurring approval/checkpoint, not a worker.
- Use short labels and one-line descriptions on cards. Put detailed responsibilities in the Markdown table.
- Do not use decorative icons, circular badges, avatar graphics, generated illustrations, heavy shadows, or dense text.
- Use clean system fonts, flat neutral panels, subtle connector lines, and muted slate/gray headers.
- For Korean projects, write chart labels in Korean unless the repo already uses English for the feature.

## Required Role Set

Adapt names to the project, but cover these responsibilities:

- Founder/User: vision, priorities, final approval.
- Orchestrator Agent: decomposes work, assigns agents, resolves conflicts.
- Harness Gate: validates PRD fit, tests, build, UX, deployment, and documentation.
- Product Detail Agent: turns vague ideas into scoped requirements.
- Benchmark Agent: studies comparable apps and extracts reusable patterns.
- UX Flow Agent: owns user journeys and screen transitions.
- Design System Agent: owns visual language, components, character/room rules.
- Implementation Agent: builds the prototype or app.
- AI/Intelligence Agent: owns AI analysis, recommendations, and generated text.
- Data/Backend Agent: owns schemas, APIs, storage, privacy boundaries.
- Social/Growth Agent: owns invitation, groups, loops, retention.
- QA/Release Agent: tests, audits, and release readiness.

## Output Format

Create files with predictable names:

- `docs/agents/<project>-agent-org-chart.md`
- `docs/agents/<project>-agent-org-chart.html`

The Markdown doc should include:

- Purpose
- HTML organization chart link as the main visual
- Role table
- Harness gates
- Operating rhythm
- Next build queue

The HTML doc should be self-contained, responsive, and visually polished. Avoid using generated PNGs or Mermaid as the main organization chart because they are harder to edit and can sprawl horizontally.

## Validation

Before finishing:

- Check that the chart does not sprawl horizontally.
- Check all role cards have concise labels.
- Check harness gates map to existing scripts or realistic future checks.
- If the project has tests or docs linting, run the relevant verification.
