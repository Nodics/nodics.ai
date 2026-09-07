# copilotProviders Agents

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This is a pure provider-family group. Do not add services, provider selection,
credentials, transport behavior, schemas, routes, or tests directly here.
Provider-neutral behavior belongs in `modules/copilotProvider`; provider-specific
transport and configuration belong in adapter children such as
`modules/ollamaProvider`.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.
