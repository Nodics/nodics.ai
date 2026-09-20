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

## Governed lifecycle

Rule definitions move through `DRAFT`, Process-owned approval, and immutable
published versions. Business users prepare and edit only drafts, validate and
simulate them against server-owned property catalogues, then submit the draft
for maker-checker approval. A publish decision creates a new effective version;
it never rewrites historical versions or their evaluation evidence.

Axis discovers the authorized `rules.policy` workspace and `rulesApi`
connection from Back Office bootstrap. Its editor and simulator call Rules APIs
directly. The browser does not calculate scores, choose providers, publish
definitions, or maintain a parallel module registry.

## Release validation

From the repository root, validate the complete integration with:

```bash
npm test --prefix nodics.rulesEngine
npm test --prefix nodics.waste/modules/wasteReward
npm test --prefix nodics.accelerators/modules/waste/modules/eWaste
npm run check:syntax
npm run module:metadata:validate
npm run quality:ownership
npm run llm:validate
```

Also run `npm run verify` in `nodics.axis`. Deployment acceptance must exercise
draft preparation, deterministic simulation, Process approval, confirmed eWaste
assessment, idempotent Loyalty settlement, and exact replay without a second
ledger entry.
