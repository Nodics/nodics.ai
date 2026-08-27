# contactSubmission Agents

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow the Engagement group contract: `../../AGENTS.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

## Boundary rules

- Treat contact schemas and services as the contact-domain authority.
- Do not copy archived CRES or gNotify implementation into this package.
- Keep routes in `engagementApi`, shared intake in `engagementCore`, and provider delivery/lifecycle in owning adapters.
- Preserve one-way dependencies and keep generated artifacts derived from source definitions.
- Update local contracts, examples, tests, README, and generated context together when behavior begins.
