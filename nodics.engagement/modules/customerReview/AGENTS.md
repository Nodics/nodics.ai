# customerReview Agents

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.core/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the Engagement group contract: `../../AGENTS.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

## Boundary rules

- Treat Phase 6 review, authenticity, moderation, response, abuse, appeal, and migration contracts as active framework behavior.
- Do not copy archived CRES or gNotify implementation into this package.
- Keep generated schema routers disabled and use dedicated `engagementApi` operations.
- Preserve immutable content versions and authenticity/disclosure evidence.
- Never restrict a review solely because its rating or sentiment is unfavorable.
- Never permit incentives conditioned on positive or negative sentiment.
- Treat archived CRES as read-only mapping evidence; clean cutover is default and dual-write remains disabled unless separately approved.
- Preserve one-way dependencies and keep generated artifacts derived from source definitions.
- Update local contracts, examples, tests, README, generated context, APIs, permissions, Axis metadata, and migration documentation together when behavior changes.
