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
  "nodicsDocsSearchnodenodicsdocsnodepagerulesdeterministicevaluation": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagerulesdeterministicevaluation",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagerulesDeterministicEvaluation",
    "title": "Deterministic Rules Evaluation",
    "summary": "Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Deterministic Rules Evaluation Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "keywords": [
      "rulesEvaluation",
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
  "nodicsDocsSearchpagenodicsdocsmetadatarulesdeterministicevaluation": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatarulesdeterministicevaluation",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatarulesDeterministicEvaluation",
    "title": "Deterministic Rules Evaluation",
    "summary": "Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Deterministic Rules Evaluation Deterministic Rules Evaluation: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Deterministic Rules Evaluation\n\nFor a beginner, rules evaluation means comparing declared facts with a selected policy to obtain a reproducible decision. Begin with the small fact and policy example below, inspect why it matched, and compare a nonmatching case. Evaluation does not itself save a business record, approve a workflow or choose which policy your deployment is authorized to use. The business capability remains responsible for interpreting and applying the result.\n\n## Engine ownership and business result\n\nBusiness analysts use rules to make a repeatable decision from named evidence, such as whether a verified quantity qualifies for score. Developers provide domain properties and provenance; administrators govern definitions through Rules/Process. Operators inspect groupResults to explain the result, while the owning business operation separately decides whether it may act on it.\n\nnodics.rulesEngine is a composition-only family. rulesDefinition owns versioned definitions, rulesCore owns operator and outcome registries, rulesEvaluation owns deterministic explanation and rulesApi owns secured HTTP entrypoints. Consumer capabilities own the meaning of properties, quality provenance and supported outcomes. This separation lets a business team explain why a decision was reached without making Axis an evaluator, turning a rule into arbitrary executable code or embedding customer reward formulas in the generic engine.\n\nThe evaluation service requires a ruleSet and propertyProviderCode. Enabled root groups are evaluated in sequence order through the group service. The returned result includes rule-set identity and version, property-catalogue and band references, calculatedScore and finalScore, matchedRules and skippedRules arrays, group details, scoreBandCode and rewardOutcome. It returns the selected band code rather than the whole band object. The service does not write records, credit a wallet, start a Process task, call an LLM or establish caller permission. Those effects require the owning consumer operation after an independently governed decision.\n\n```mermaid\nflowchart LR\n  Version[Version-bound rule set] --> Property[Consumer property provider]\n  Property --> Quality[Quality and confidence policy]\n  Quality --> Condition[Registered operator]\n  Condition --> Group[ALL or ANY group]\n  Group --> Score[Validated outcomes and bounded score]\n  Score --> Evidence[Explainable result and source hash]\n  Evidence -. Owning operation only .-> Effect[Governed business effect]\n```\n\n## Availability quality and group logic\n\nProperty resolution preserves zero and false as available values. Undefined, null and an empty string are unavailable; missing data must not be guessed as zero. Consumer providers resolve configured fallback chains. The generic engine applies the required quality and confidence checks before an ordinary operator. FALLBACK_ALLOWED permits the consumer fallback path, not a license to substitute an arbitrary field or relax quality silently. IS_AVAILABLE and IS_NOT_AVAILABLE are explicit availability tests and are handled before the ordinary quality policy. available: true is also required; a nonempty value alone is insufficient. No minimum quality means quality passes without comparison; no minimum confidence means confidence passes. With a configured minimum, confidence accepts 0..1 or percentages through 100 and rejects invalid required thresholds. Availability operators use the provider's available flag and value without applying the ordinary quality rejection.\n\nAn unavailable OPTIONAL condition is IGNORED and marked not applicable. ALL and ANY groups consider only applicable conditions and child groups. A group with no applicable members is not matched; it is not automatically true because every optional member disappeared. ALL requires every applicable member to match, while ANY requires at least one. Disabled conditions and child groups are excluded. Invalid group operators are rejected and nesting beyond the configured maximum, default five, throws. These rules prevent absent evidence from turning a fully optional group into a reward award.\n\n| Input situation | Evaluation meaning | Business explanation |\n| --- | --- | --- |\n| Value zero or false | Available | A real value was supplied |\n| Optional value unavailable | Ignored and not applicable | No decision from this condition |\n| All members ignored | Group not matched | Insufficient applicable evidence |\n| Required quality fails | Unavailable result | Do not invent confidence |\n| Nesting exceeds limit | Evaluation rejected | Simplify or explicitly configure supported depth |\n\n## Scores bands and reproducibility\n\nOnly matched groups with outcomes contribute to flattened matched-rule evidence. Outcomes are validated through the rulesCore registry before score aggregation. ADD_SCORE amounts must be finite numeric values. The calculated score is then clamped to the configured minimum and maximum. Score-band resolution is a separate step; when bands are present its default gap behavior rejects a score with no applicable band instead of quietly choosing a neighboring reward. Consumers should verify their complete band coverage, boundaries and outcome types before publishing a definition. flattenGroups visits children even when their parent did not match. A child with its own matched outcome can therefore add score independently, and parent and child outcomes can both contribute. Put a shared prerequisite into each awarding group or use grouping-only children without outcomes when a parent must be the sole award boundary. Band endpoints are inclusive: adjacent bands sharing the same endpoint are ambiguous and reject. NO_OUTCOME permits an uncovered score to return no selected band; no scoreBands at all also returns no band.\n\nThe service derives a SHA-256 source hash from selected semantic evidence. Correlation identity is retained for diagnostics but excluded from that hash, allowing equivalent evaluation inputs to retain equivalent semantic evidence across diagnostic requests. The top-level result is frozen; nested objects are not guaranteed deeply immutable by Object.freeze alone. Treat persisted published definitions as version-bound source and copy or protect nested evidence at the consuming persistence boundary. Do not claim a cryptographic signature, tamper-proof storage or replay authorization from a source hash. groupResults is the reliable place to inspect failed conditions. Group evaluation sets outcome to null for unmatched groups, while skippedRules filters unmatched results that still have an outcome; ordinary failed groups consequently do not populate skippedRules. Do not treat an empty skippedRules array as proof every rule matched. The hash uses JSON.stringify of selected result evidence, not canonicalized source bytes or the entire input snapshot.\n\nFor example, a Waste consumer can expose a verified material quantity and a confidence classification through its property provider. A generic condition compares that property using a registered operator. An optional unavailable condition is ignored; it must not be filled from model text. A matched outcome may add score, and a configured band may propose a reward. Waste then decides whether its original evidence and lifecycle permit downstream Loyalty posting. The same generic evaluator can serve Commerce or other capabilities without importing Waste schemas or owning their business transitions.\n\n## Verification and recovery\n\nExercise missing provider context, zero and false availability, optional exclusions, ALL and ANY combinations, nested-depth rejection, quality and confidence failures, invalid outcome types, nonfinite score additions, clamp boundaries and uncovered bands. Verify correlation changes do not alter semantic hashes when semantic inputs are equal. Test the consumer property provider independently and keep its evidence vocabulary versioned. When evaluation fails, correct the draft definition or source evidence through its owner; do not bypass the registry with scripts or execute a compensating reward from Axis. Separate pure evaluation proof from authorization, persisted-version lookup and actual business-effect acceptance.\n\n## Customize and extend safely\n\nA business analyst can simulate a draft score policy; a partner developer supplies the property meanings and evidence through its own registered consumer provider. Keep that provider in project src/service and register it with DefaultRulePropertyCatalogueRegistryService using getCatalogue, resolveProperty and optional resolveFallback. Reuse the consumer registration path and never accept a service name from the browser. Later member overrides may refine evaluator behavior only while preserving domain neutrality, deterministic results, quality checks and separate secured execution. rulesEvaluation/config/properties.js is empty: maximumGroupDepth is a request field, defaulting to five, rather than a magic module property.\n\n```javascript\n// Within an authorized consumer operation; provider is already registered.\nconst request = { ruleSet: approvedSnapshot,\n  propertyProviderCode: configuredProviderCode,\n  propertyCatalogueCode: catalogue.code,\n  propertyCatalogueVersion: catalogue.version,\n  input: authorizedFacts, maximumGroupDepth: 3 };\nconst result = SERVICE.DefaultRuleSimulationService.simulate(request);\n// result.simulation === true; no persistence, approval or wallet posting.\n```\n\nTest an unavailable OPTIONAL property under ALL and ANY, an available false/zero, below-quality fallback, depth rejection and overlapping/gapped bands. Include a failed parent with a matching awarding child; it exposes the independent child contribution. If no band covers a calculated score, inspect finalScore and the immutable band version, correct a draft and simulate again before Process approval of a new version. Never rewrite a published policy or replace missing evidence with AI text. Preserve the original provider catalogue/version and groupResults when the consumer stores an assessment.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by rulesEvaluation. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
    "keywords": [
      "rulesEvaluation",
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
