# discoverySource Agents

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow global AI guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Follow every ancestor group `AGENTS.md` from root to this package.
- Register provider seams only. Domain modules own the actual source-provider behavior.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Trusted package metadata declares `functional` ownership because this module owns
persisted discoverySourceProvider state. Source-only helpers may
be loaded elsewhere; that does not grant local schema or service authority.
Unique owner admission remains per explicit publication context.
