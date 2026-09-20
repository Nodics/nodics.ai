# wasteCore Agents

Follow the parent contract: `../../AGENTS.md`.
Follow global guidance: `../../../nodics.foundation/modules/nSetup/llm/ai-enablement-index.md`.

`wasteCore` owns shared Waste enum, status, source-reference, and policy defaults.
Common Waste reference data belongs here when it serves the whole Waste
functional module. Do not place material records, submissions, receipts, impact
results, movement, or partner policy here.

Waste Core owns only the generic Waste Management dashboard anchor and its All submissions and Review queue links. Accelerator subgroups and family-specific view properties belong to their accelerator. Apply `../../../nodics.foundation/modules/nSetup/llm/contracts/module-owned-ui-contribution-contract.md`; never add placeholders for future accelerators.

This capability declares an inert model-service inventory for [governed Local reset](../../../nodics.foundation/modules/nSystem/llm/contracts/local-reset.md).
A server must explicitly select it; contributions never enable reset or bypass tenant, environment, confirmation or required-service checks.

Waste Core owns inert Waste acceptance defaults under `tooling.acceptance`.
Resolve the WASTE and PLATFORM roles from the selected topology; do not copy
customer environment names, server names, ports or initialization profile codes.
The invoking project still owns its journey script and explicit execution.
