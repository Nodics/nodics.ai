# Nodics Rules Engine

`nodics.rulesEngine` is the standard Nodics functional module group for governed, deterministic business-rule definition and evaluation.

It provides reusable rule mechanics without owning consumer-domain meaning. Consumers such as eWaste, Commerce, Risk, Loyalty, or future accelerators contribute their own property catalogues and interpret generic rule outcomes.

## Ownership

- `rulesCore` owns shared rule vocabulary, registries and framework-level contracts.
- `rulesDefinition` owns governed rule-definition persistence and immutable version contracts.
- `rulesEvaluation` owns deterministic condition/group evaluation and simulation.
- `rulesApi` owns secured Rules management/simulation APIs and BackOffice capability projection.

The group root is composition-only. Do not place runtime evaluation or domain policy here.

## Critical boundaries

- No eWaste, Commerce, customer, tenant, provider, or project semantics in the generic evaluator.
- No arbitrary JavaScript, regex execution, expression language, or LLM call inside rule evaluation.
- Consumer modules own properties, allowed values, fallbacks, normalized input quality, and outcome interpretation.
- `nodics.process` remains the workflow/maker-checker authority.
- Loyalty remains the wallet/ledger authority.
- Axis remains a renderer and operator workspace; backend services remain authoritative.

Read `AGENTS.md`, `llm/contracts/README.md`, and child-module guidance before implementation.
