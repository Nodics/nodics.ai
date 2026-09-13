# Editorial Agent Contract

## Inheritance

- Follow the repository agent contract: `../../../AGENTS.md`.
- Follow the WCMS contract: `../../AGENTS.md`.
- Follow global AI/development guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context before changing the capability.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.
