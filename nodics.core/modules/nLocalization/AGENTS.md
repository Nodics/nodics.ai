# nLocalization Agents

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- Follow the repository agent contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This capability is stateless and provider-neutral. Keep persistence, schemas, routers, translation values, tenant policy resolution, and publication lifecycle out of this module. Never trust a browser-supplied tenant, site, or unrestricted locale override; callers must supply authorized scope and policy.

Preserve canonical BCP 47 output, immutable context, bounded inputs, tenant-partitioned keys, stable error codes, and fail-closed authority behavior. Any provider customization must remain configuration-selected and must be proven by an override test.
