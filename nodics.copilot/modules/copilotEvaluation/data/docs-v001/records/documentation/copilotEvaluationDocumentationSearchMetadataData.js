/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Canonical module-owned documentation CMS component records. */
module.exports = {
  "nodicsDocsSearchnodenodicsdocsnodepagecopilotevaluationreleasegates": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecopilotevaluationreleasegates",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecopilotEvaluationReleaseGates",
    "title": "Copilot Evaluation and Release Gates",
    "summary": "Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Copilot Evaluation and Release Gates Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "keywords": [
      "copilotEvaluation",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "nodicsDocsSearchpagenodicsdocsmetadatacopilotevaluationreleasegates": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacopilotevaluationreleasegates",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacopilotEvaluationReleaseGates",
    "title": "Copilot Evaluation and Release Gates",
    "summary": "Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Copilot Evaluation and Release Gates Copilot Evaluation and Release Gates: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Copilot Evaluation and Release Gates\n\nA beginner can treat an evaluation as a repeatable examination of a candidate Copilot configuration. Start with a named case, its expected behavior and the exact candidate identity, then inspect the resulting evidence. A passing local examination is not permission to release the candidate: the applicable release policy and authorized approval remain separate. Keep failed and missing evidence visible rather than changing the expected answer to obtain a pass.\n\n## Purpose and evidence boundary\n\nQA engineers use a versioned case suite to compare a candidate's groundedness, safety, task completion and feedback. Business owners agree the scoring rubric and release criteria; developers supply validated measurements and the effective configuration. Operators inspect failed cases and provenance before a release manager makes the separate governed decision.\n\ncopilotEvaluation supplies a small deterministic scoring helper and a suite release-gate helper. It lets teams make explicit a numeric acceptance convention for a set of evaluated conversations. It does not call a model to judge truth, retrieve grounding evidence, authorize actions, publish a release or persist an evaluation automatically. The distinction matters to business readers: a PASS means that supplied scores satisfy this helper, not that a generated answer is correct, safe for every audience or independently verified.\n\nThe evaluate method begins with groundedness, safety, completion and userFeedback scores of zero. It overlays input.scores, converts values numerically and clamps each to the interval zero through one. Additional score keys are accepted and enter the arithmetic mean alongside the four defaults. A caller must therefore define and validate its score vocabulary before invoking this helper. Adding a fifth high score changes the average; omitting a required default leaves its zero contribution in place. The evaluator field defaults to rule and is a label, not proof of evaluator identity or trusted provenance.\n\n```mermaid\nflowchart LR\n  Cases[Versioned evaluation cases] --> Scores[Trusted scoring process]\n  Scores --> Evaluate[Normalize scores and compute mean]\n  Evaluate --> Outcome[PASS or REVIEW]\n  Outcome --> Gate[Suite pass rate and safety floor]\n  Gate --> Decision[Separate governed release decision]\n```\n\n## Scoring and threshold semantics\n\nEvery supplied key contributes equally. Number conversion followed by a falsy-to-zero fallback means malformed numeric input becomes zero rather than a validation exception, and out-of-range finite values are clamped. This permissive helper is not a substitute for an ingestion schema that rejects unknown dimensions or malformed measurement. Store the original trusted scoring method and case revision through the owning persistence operation, not by assuming that a normalized result retains all evidence. Positive Infinity becomes one during clamping, and negative Infinity becomes zero. Reject nonfinite values in the scoring caller instead of treating normalization as evidence of valid measurement.\n\nThe pass threshold defaults to 0.75 using a logical-or default. Consequently an explicit numeric zero also selects 0.75 in this implementation. Do not advertise numeric zero as a supported way to disable the threshold. A truthy string '0' is numerically converted to zero, demonstrating why callers must validate configuration types. A result at or above the effective threshold is PASS; lower results need REVIEW. The returned code, tenant and conversation identify supplied context and createdAt records helper time. Those fields do not independently authenticate the caller or bind the score to immutable conversation bytes. Production consumers must establish those guarantees in their owning API and storage boundary.\n\n| Case | Helper behavior | Consumer responsibility |\n| --- | --- | --- |\n| Four perfect default scores | Mean one and PASS at default threshold | Retain trusted case evidence |\n| Missing default score | That dimension remains zero | Explain missing evaluation |\n| Extra dimension | Included in the mean | Validate the approved vocabulary |\n| Threshold zero | Falls back to 0.75 | Do not claim gate disabled |\n| Empty suite | Release gate fails | Supply actual evaluated cases |\n\n## Suite safety and release decision\n\nreleaseGate fails an empty suite with COPILOT_EVALUATION_SUITE_EMPTY. For a nonempty suite it calculates the fraction of items whose outcome is exactly PASS. It compares that rate with releaseGate.minimumPassRate, which defaults to 0.9 using the same logical-or pattern, so a numeric zero does not disable the pass-rate requirement. The separate safety test fails when any item has safety below failOnSafetyScoreBelow, whose default is one. A strong average cannot compensate for a safety-floor failure. The configuration is supplied to the method; it does not fetch nConfig itself. Missing safety becomes zero, but a raw nonnumeric safety string converts to NaN, whose less-than comparison is false. Null items can also throw. Validate every raw suite item and finite safety score before releaseGate; the helper is not a complete fail-closed input validator.\n\nFor a ten-case suite with nine PASS results, the default rate requirement may be satisfied, but a single safety score below one still prevents passage. This is useful separation between overall quality and mandatory safety. It remains only as reliable as the supplied item objects: the helper does not establish that every case was executed, that results came from the configured model, or that another client did not rewrite outcome. Validate complete input and bind the suite to the exact candidate version before calling it. A release process should record the returned decision and its evidence through existing governance rather than interpreting a boolean as publication authority.\n\nAn operator investigating a failed gate should inspect case coverage, the lowest safety score and the effective thresholds first. Correct a scoring or fixture defect by versioning the case and rerunning the genuine evaluation. Do not remove the failed case, introduce extra dimensions to lift the average or replace REVIEW labels merely to pass. Conversely, a numeric false result is not proof that the model invocation failed; execution evidence and evaluation evidence are different records. Keep their identifiers linked without copying private conversation text into a public guide.\n\n## Verification and honest limits\n\nRun copilotEvaluationReleaseGateContract and add caller-specific checks for missing dimensions, additional dimensions, clamping, malformed numeric values, threshold-zero behavior, exact safety boundaries, empty suites and incomplete results. Qualify persistence and authorization in the consuming workflow. Keep source tests, actual model evaluation, signed-in inspection and release approval as separate evidence stages. This capability currently provides a simple arithmetic policy; statistical confidence, independent human review, adversarial testing and automated truth verification are not implied by its presence.\n\n## Customize and extend safely\n\nQA owners use this helper to compare a versioned candidate against an agreed suite; a release manager still owns the actual release decision. Keep rubric cases and their provenance in project-owned test fixtures. Later project config/properties.js may refine copilot.evaluation.passThreshold and releaseGate.minimumPassRate, but the caller must resolve the effective configuration and pass it explicitly. requiredDimensions is declared in properties but neither helper reads it; adding a dimension there does not enforce completeness or remove the built-in userFeedback zero. The public result contains scores and PASS/REVIEW, not the computed arithmetic mean.\n\n```javascript\nconst configuration = CONFIG.get('copilot').evaluation;\nconst service = SERVICE.DefaultCopilotEvaluationService;\nconst result = service.evaluate({ code: 'candidate-help',\n  scores: { groundedness: 1, safety: 1, completion: 1, userFeedback: 1 }\n}, configuration);\nconst gate = service.releaseGate([result], configuration);\n// With framework defaults: result.outcome === 'PASS', gate.passed === true.\n// Persist provenance and request release approval through the owning process.\n```\n\nA deliberate evaluator override belongs in later project src/service/defaultCopilotEvaluationService.js and must preserve caller authorization, trusted scoring provenance and separate release authority. Exercise extra and absent dimensions, finite-number validation, numeric/string zero settings, missing or malformed safety and exact threshold boundaries in that caller. COPILOT_SAFETY_GATE_FAILED requires inspection of the actual cases; COPILOT_PASS_RATE_GATE_FAILED requires checking the agreed coverage and effective minimumPassRate. Correct and version invalid fixtures or the candidate, then rerun evaluation. An empty suite must remain rejected, and no successful arithmetic gate may publish by itself.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by copilotEvaluation. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
    "keywords": [
      "copilotEvaluation",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
      "navigationDepth": 2,
      "documentType": "how-to",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "maturityState": "partial"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
