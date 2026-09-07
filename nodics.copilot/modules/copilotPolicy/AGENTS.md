# copilotPolicy Agents

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the Copilot parent contract: `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

This module is the mandatory provider-neutral Copilot security-policy boundary.
Before changing it, read `llm/contracts/security-enforcement-contract.md` and
the parent `../../llm/contracts/copilot-security-governance-contract.md`.
Policy must fail closed, remain independent of the selected provider, and must
never replace nAuth or an owning domain API's final authorization. No later
layer may weaken the parent security invariants.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.
