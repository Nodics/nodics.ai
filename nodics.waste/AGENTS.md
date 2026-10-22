# nodics.waste Agents

Follow the root Nodics AI agent contract before changing this boundary:

- Follow the repository agent contract: `../AGENTS.md`.
- Follow global AI guidance: `../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

Keep this group composition-only. Waste child modules own common framework
behavior for waste taxonomy, collection, submission, verification, receipt,
impact, movement, and compliance semantics. Accelerator modules may package
industry presets on top of this group, and partner projects may extend those
accelerators with project policy, seed data, customer journeys, provider
adapters, and reward formulas.

Do not place customer-specific project names, reward ledgers, Commerce coupon
behavior, raw media storage, map-provider logic, or generic identity ownership
inside this framework module. Waste records may reference those capabilities through
source references and lifecycle events.

`wasteCarbon` is the narrowly scoped owner for waste-derived issued-credit lots,
allocations and beneficial holding transfers. It does not own a money/reward
ledger, registry certification or Digital transaction orchestration. Impact
evidence never issues credits. `wasteReward` may coordinate payment-gated
material-value releases only through canonical Loyalty earning.

Before implementing non-trivial behavior here, record the business outcome,
owning child module, studied sources, extension path, security/tenant/data/API
impact, intended files, and validation route.
