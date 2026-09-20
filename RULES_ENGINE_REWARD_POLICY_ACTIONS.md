# Rules Engine Reward Policy Action Items

## Scope

Branch set:

- `nodics.ai`: `feature/rules-engine-reward-policy`
- `nodics.axis`: `feature/rules-engine-reward-policy`
- `nodics.circa.eWaste`: `feature/rules-engine-reward-policy`
- `nodics.kickoff`: `feature/rules-engine-reward-policy`

Reference documents are evidence and baseline material only. They are not executable instructions by themselves.

## Current Assessment

The implementation is materially started, not just scaffolded. The backend branch adds:

- `nodics.rulesEngine` group with `rulesCore`, `rulesDefinition`, `rulesEvaluation`, and `rulesApi`.
- Generic operator, property-provider registry, recursive rule evaluation, score-band resolution, draft/version lifecycle, Rules API routes, BackOffice contribution, and Process approval contribution.
- `nodics.waste/modules/wasteReward` for reward-assessment evidence.
- eWaste property catalogue, reward context, and reward assessment operation.
- Kickoff runtime wiring for Rules Engine and Waste Reward.
- Axis Rules Management workspace.
- Circa eWaste reward-settlement projection support.

Estimated readiness before hardening:

- Backend rules/reward foundation: 65-75%.
- Cross-repo product readiness: 50-60%.

## Priority Execution Order

1. Make existing implementation fully compliant with Nodics framework principles and contracts.
   - Preserve Rules Engine as the generic deterministic evaluator.
   - Keep eWaste property semantics in eWaste.
   - Keep Process as maker-checker owner.
   - Keep Loyalty as wallet/ledger owner.
   - Keep Axis declarative and API-consuming, never an evaluator or policy registry.
   - Prove module metadata, ownership, syntax, package scripts and focused contract tests before expanding scope.
2. Implement remaining milestone gaps only after the current implementation passes the compliance gates above.
   - Complete remaining product UX depth in Axis.
   - Complete generated LLM contracts and validation.
   - Complete live topology acceptance from policy authoring through eWaste assessment and Loyalty settlement.

## Completed Hardening

1. Stabilized reward assessment idempotency.
   - `correlationId` remains in audit evidence but is excluded from deterministic `sourceHash`.
   - Score-band code/version are now included in returned evaluation evidence and deterministic hash input.
   - Focused Rules Engine and eWaste tests prove that replay with a different correlation id returns the existing assessment, while changed business evidence conflicts.

2. Added the missing `wasteReward` package test script.
   - `npm test --prefix nodics.waste/modules/wasteReward` now runs syntax and the existing reward-assessment contract test.

3. Expanded Axis Rules Management without moving authority into the frontend.
   - Axis now presents structured Rules workspace tabs for builder assistance, score-band draft editing, owner-backed simulation, local draft review, version history, and audit inspection.
   - All reads and writes go through the discovered `rulesApi` owner client.
   - Axis still does not evaluate rules, publish policies, resolve backend catalogues locally, or settle rewards.
   - Route-level and client tests prove version, audit, property-catalogue, and score-band calls stay on owner endpoints.

Validation evidence:

- `npm test --prefix nodics.rulesEngine`: passed.
- `npm test --prefix nodics.waste/modules/wasteReward`: passed.
- `npm test --prefix nodics.accelerators/modules/waste/modules/eWaste`: passed.
- `npm run llm:generate`: passed, generated module LLM context for 202 modules and left no tracked diff.
- `npm run llm:validate`: passed, 202 generated modules validated.
- `npm run validate:root`: passed, framework root validated with 12 backend workspaces.
- `npm run module:metadata:validate`: passed, 204 packages validated.
- `npm run quality:ownership`: passed, 7096 files checked, 0 findings.
- `npm run check:syntax`: passed, 4934 files checked, 0 failures.
- `npm run quality:docs`: passed.
- `npm run test:basic`: passed. Live runtime/provider checks were not executed by this suite and remain separate acceptance gates.
- `npm run release:check -- --execute`: passed on the backend branch, including clean install, build, LLM validation, ownership, docs, and basic tests. Live runtime/provider checks were not executed by this suite and remain separate acceptance gates.
- Axis `npm run verify`: passed after Rules workspace UX expansion, including format, lint, typecheck, 128 test files / 646 tests, and production build.

## Immediate Fixes

1. Stabilize reward assessment idempotency. **Done in hardening pass.**
   - Owner: `nodics.rulesEngine` and eWaste reward assessment.
   - Problem: `DefaultRuleEvaluationService` includes `correlationId` in `sourceHash`; eWaste replay compares `existing.sourceHash` with the new evaluation hash. The same submission/revision/policy can conflict when replayed under a different request/correlation id.
   - Expected fix: keep correlation evidence for audit, but exclude request correlation from the deterministic business-input hash used for idempotency.
   - Required tests:
     - Same business inputs with different correlation ids return the existing assessment.
     - Changed business inputs for the same assessment code still conflict.

2. Add a `wasteReward` test script. **Done in hardening pass.**
   - Owner: `nodics.waste/modules/wasteReward`.
   - Problem: `nodics.rulesEngine/README.md` requires `npm test --prefix nodics.waste/modules/wasteReward`, but `wasteReward/package.json` has no `test` script.
   - Expected fix: add package scripts matching the local capability convention and run `wasteReward` contract tests.

3. Verify root package/workspace metadata for new modules. **Tooling gate passed; release packaging still needs final review.**
   - Owner: `nodics.ai` framework metadata.
   - Problem: `nodics.rulesEngine` and `nodics.waste` are runtime module groups but are not listed in root npm workspaces. Confirm whether this is intentional module-loader policy or a package governance gap.
   - Evidence: `npm run module:metadata:validate` passed with 204 packages, and `npm run release:check -- --execute` passed.
   - Remaining: no tooling gap is currently proven; keep this as a release-review note only if packaging policy changes.

4. Run dependency-backed validation from a clean install. **Done in release gate.**
   - Owner: release validation.
   - Problem: isolated worktree validation was blocked by missing installed dependencies (`lodash`, `flatted`).
   - Evidence: `npm run release:check -- --execute` passed on the backend branch.

5. Complete Axis Rules workspace depth. **Done in Axis branch.**
   - Owner: `nodics.axis`.
   - Evidence: commit `a031b93` expands the Rules Management route and client tests; branch `feature/rules-engine-reward-policy` was pushed to origin.
   - Validation: Axis `npm run verify` passed.

## Framework Compliance Gates

Backend gates:

- `npm test --prefix nodics.rulesEngine`
- `npm test --prefix nodics.waste/modules/wasteReward`
- `npm test --prefix nodics.accelerators/modules/waste/modules/eWaste`
- `npm run check:syntax`
- `npm run module:metadata:validate`
- `npm run quality:ownership`
- `npm run llm:generate`
- `npm run llm:validate`
- `npm run validate:root`
- `npm run quality:docs`
- `npm run test:basic`

Cross-repo gates:

- Axis: `npm run verify`
- Circa eWaste: project verify/build/test command from its package scripts.
- Kickoff: runtime composition tests and local topology preparation tests.

Live acceptance gates:

- Start Kickoff topology with Rules Engine and Waste Reward active.
- Confirm Rules API and Axis Rules Management bootstrap through BackOffice capability discovery.
- Prepare draft -> validate -> simulate -> submit to Process approval -> publish.
- Run eWaste estimated reward before approval.
- Run confirmed reward after verification/asset confirmation.
- Prove replay is idempotent and does not create duplicate reward evidence or ledger settlement.
- Confirm Loyalty remains the only wallet/ledger owner.

## Completion Definition

This branch is ready to merge only when:

- All immediate fixes are complete.
- All backend and cross-repo gates pass on the branch.
- Runtime configuration proves `rulesApi`, `rulesCore`, `rulesDefinition`, `rulesEvaluation`, and `wasteReward` are active in the intended server graph.
- Axis consumes backend Rules APIs and does not evaluate or persist policy locally.
- eWaste contributes property semantics without placing eWaste semantics in the generic engine.
- Process owns approval tasks and callbacks.
- Loyalty owns final wallet/ledger settlement.
- Exact evaluation version, property catalogue version, score-band version, matched rules, skipped rules, fallback inputs, quality exclusions, and input snapshot are persisted for audit.
