# discoveryQuery Agents

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow every ancestor group `AGENTS.md` from root to this package.
- Keep query profiles generic. Domain APIs own customer DTOs and response projection.

## Explicit ownership

The package declares `sourceOnly`: its bounded query/options builders are local
source helpers without callable endpoints or persisted authority. Any future
callable/schema claim contradicts this declaration and must reject admission.
