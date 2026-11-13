# discoveryRuntime Agents

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow every ancestor group `AGENTS.md` from root to this package.
- Delegate engine execution through generated services and `nSearch`; do not own low-level provider clients.

## Explicit ownership

The package declares `sourceOnly` after stateful operations moved behind the
Discovery Configuration and Projection DMS APIs. It transforms queries and
responses without accessing local persistence or provider models. This is a
source-based classification, not an exemption for modules without HTTP routes.
Do not add local state or claims without revisiting ownership. Trusted callers
may select explicit publication context; no runtime role or endpoint inference.
