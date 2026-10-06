# copilotProvider Agents

## Inheritance

- Follow the repository agent contract: `../../../../../AGENTS.md`.
- Follow the Copilot contracts: `../../../../AGENTS.md` and `../../AGENTS.md`.
- Follow global AI/development guidance:
  `../../../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Follow the root Nodics AI agent contract before changing this boundary:

- root `README.md` explains the human/documentation route.
- root `AGENTS.md` governs repository-wide AI and contributor behavior.
- Read every applicable ancestor `AGENTS.md` from root to this module before editing.
- Read this module `README.md`, `llm/contracts`, `llm/examples`, and generated context.

This generated capability boundary must preserve Nodics structure, layering, configuration-first behavior, override/customization contracts, tests, documentation, and generated-artifact discipline.

Before implementing non-trivial behavior here, record the business outcome, owning layer, studied sources, current implementation, extension path, security/tenant/data/API/release impact, intended files, and validation route.

Preserve explicit profile validation before either transport entrypoint. Missing
token counts must stay unknown across adapters and Axis; never turn them into
zero or claim accounting reconciliation from provider measurement alone.

Accounting is opt-in and generated-service-only. Read
`llm/examples/usage-and-budgets.md` before modifying it. Preserve the unique
tenant-period key, atomic multi-cap revision, trusted call identity/purpose,
bounded journal, original-period settlement and pending uncertain usage.
Do not make this tenant-isolated pool a claimed global platform limit. Never
release capacity because a timeout elapsed or repeat a model call after an
ambiguous acknowledgement. Clamp both top-level and profile output allowances.

Allocation administration uses the same journal and compare-and-swap boundary.
Read `llm/examples/allocation-administration.md`. Preserve configured eligibility
and ceilings, separate enterprise/user grants, current-period scope, stale-edit
checks and atomic audit. Reserve/settle must preserve allocation metadata. Never
turn operational period limits into a second runtime configuration authority.
Optional configured `defaultLimit` recurs each calendar period below `limit`;
preserve explicit zero, eligible-user lists and current-period override semantics.
Recurring defaults remain nConfig/nDynamo policy, not another provider store.

Read `llm/examples/usage-insights-and-reconciliation.md` before modifying usage
inspection or recovery. Receipt capture is private, opt-in and provider-owned;
never add an employee receipt-write or token-count override API. Keep receipt
scope/digest validation, pre-dispatch persistence qualification, original-period
repair, independent reconcile permission, preview/confirmation and atomic audit.
Unknown evidence remains reserved; no provider replay or timed refund. Aggregate
only authorized filtered entries, never totals from a truncated display window.
