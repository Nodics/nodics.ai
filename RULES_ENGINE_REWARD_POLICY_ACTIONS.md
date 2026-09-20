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

## Immediate Fixes

1. Stabilize reward assessment idempotency.
   - Owner: `nodics.rulesEngine` and eWaste reward assessment.
   - Problem: `DefaultRuleEvaluationService` includes `correlationId` in `sourceHash`; eWaste replay compares `existing.sourceHash` with the new evaluation hash. The same submission/revision/policy can conflict when replayed under a different request/correlation id.
   - Expected fix: keep correlation evidence for audit, but exclude request correlation from the deterministic business-input hash used for idempotency.
   - Required tests:
     - Same business inputs with different correlation ids return the existing assessment.
     - Changed business inputs for the same assessment code still conflict.

2. Add a `wasteReward` test script.
   - Owner: `nodics.waste/modules/wasteReward`.
   - Problem: `nodics.rulesEngine/README.md` requires `npm test --prefix nodics.waste/modules/wasteReward`, but `wasteReward/package.json` has no `test` script.
   - Expected fix: add package scripts matching the local capability convention and run `wasteReward` contract tests.

3. Verify root package/workspace metadata for new modules.
   - Owner: `nodics.ai` framework metadata.
   - Problem: `nodics.rulesEngine` and `nodics.waste` are runtime module groups but are not listed in root npm workspaces. Confirm whether this is intentional module-loader policy or a package governance gap.
   - Expected fix: either document the intentional exclusion in the module/release contract or update workspace/package metadata consistently.

4. Run dependency-backed validation from a clean install.
   - Owner: release validation.
   - Problem: isolated worktree validation was blocked by missing installed dependencies (`lodash`, `flatted`).
   - Expected fix: run `npm ci` in the feature worktree or validate in an already installed clean checkout, then rerun the gates below.

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
