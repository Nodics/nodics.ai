# localizationApi

Audience projection boundary for published runtime bundles and authorized contribution import/export. Public bundle projection exposes only configured public-safe values from an Online immutable release; management routes require employee access and explicit permissions.

Secured management APIs expose coverage, queue, side-by-side, analytics, draft, review, approval, suggestion, release build, publication, and rollback operations. Every route uses a specific `localization.*` permission and retains the trusted server tenant; the adapter selects business inputs without accepting browser-supplied authorization or tenant context. Public bundle APIs deliver bounded JSON through the shared router and support ETag revalidation.

Use this README to understand what this module is for, which capability or composition boundary it owns, how it fits its parent hierarchy, and where developers or AI tools should continue reading.

For implementation rules, read this module `AGENTS.md` after the root-to-leaf ancestor `AGENTS.md` chain. For exact contracts and examples, read this module `llm/` guidance and the relevant global contracts under `modules/nSetup/llm`.

Route-category defaults belong to this capability; deployments supply only intentional overrides.
Preserve nRouter enforcement and independent route authorization. See [exposure ownership](../../../nodics.foundation/modules/nRouter/llm/contracts/README.md#capability-owned-exposure-defaults).
