# copilotApi Agents

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Route names must be unique across every group in `copilotApi`: nRouter resolves
the live definition by module plus route name, not the enclosing group. Preserve
public URLs, permissions and operations when renaming a conflicting key. Run the
registered HTTP dispatch regression, including erasure routes, after route edits.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
