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

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).

Remote workflow callbacks accept only scoped Workflow runtime credentials and opaque execution handles. Claim the current action from Process before using its context; never accept caller-supplied decisions. Editorial enforces exact revision/instance correlation, optimistic decision mutation and publication through nPublish. Human authoring permissions stay on the existing authoring APIs. See `llm/contracts/README.md`.

After the Process claim succeeds and its source context is valid, the callback uses nAuth's existing internal system auth data for the bounded domain persistence request. Preserve the original principal metadata and keep this request local; never grant those groups to the incoming runtime token or acquire persistence authority before a successful claim. The existing schema policy, exact revision/instance checks and nPublish owner still apply.

The existing Online publication target likewise requires a scoped Editorial runtime principal and the Online role before using internal auth data for its target-local persistence. Incoming runtime claims remain unchanged.
