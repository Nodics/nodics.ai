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
  "nodicsDocsComponentcopilotProviderUsageBudgets": {
    "code": "nodicsDocsComponentcopilotProviderUsageBudgets",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.provider-usage-budgets",
      "title": "Copilot Provider Usage and Budgets",
      "route": "/docs/framework/copilot-provider-usage-budgets",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Copilot Provider Usage and Budgets"
      ],
      "hierarchyDepth": 2,
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
      "businessAudience": [
        "business user",
        "implementation partner",
        "copilotProvider capability owner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Copilot Provider Usage and Budgets: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "STAGED",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "source-verified",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.original-business-results",
        "copilot.governed-schema-actions"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotProviderService.js",
        "src/service/defaultCopilotBudgetService.js",
        "src/service/defaultCopilotUsageService.js",
        "src/service/defaultCopilotReconciliationService.js",
        "test/copilotBudgets.test.js",
        "test/copilotReconciliation.test.js",
        "../ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService.js",
        "../ollamaProvider/AGENTS.md",
        "../openAiProvider/src/service/defaultOpenAiCopilotProviderAdapterService.js",
        "../openAiProvider/AGENTS.md",
        "../claudeProvider/src/service/defaultClaudeCopilotProviderAdapterService.js",
        "../claudeProvider/AGENTS.md",
        "../geminiProvider/src/service/defaultGeminiCopilotProviderAdapterService.js",
        "../geminiProvider/AGENTS.md",
        "config/properties.js",
        "test/providerValidation.test.js",
        "test/copilotUsage.test.js",
        "llm/contracts/README.md"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "copilotProvider",
        "source-backed",
        "ownership",
        "operations"
      ],
      "topicKeywords": [
        "Copilot Provider Usage and Budgets",
        "AI and Developer Tooling"
      ],
      "headings": [
        {
          "text": "Copilot Provider Usage and Budgets",
          "anchor": "copilot-provider-usage-budgets",
          "level": 1
        },
        {
          "text": "Provider boundary and business outcome",
          "anchor": "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
          "level": 2
        },
        {
          "text": "Calendar accounting and allocation",
          "anchor": "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
          "level": 2
        },
        {
          "text": "Inspection and reconciliation",
          "anchor": "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
          "level": 2
        },
        {
          "text": "Verification and failure recovery",
          "anchor": "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "copilot-provider-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Documentation selection assets and acceptance",
          "anchor": "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "copilot-provider-usage-budgets-common-mistakes",
          "level": 2
        },
        {
          "text": "Provider adapter contracts and shared ownership",
          "anchor": "copilot-provider-adapter-contracts",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 1,
          "text": "Copilot Provider Usage and Budgets",
          "anchor": "copilot-provider-usage-budgets"
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, a provider is the backend connection to a selected language model; a budget is the capacity that a call is permitted to reserve. Start by inspecting an approved profile and a read-only usage view. A held reservation means the outcome needs evidence, not that the employee should repeat the prompt or manually refund the call. Follow the request, accounting and recovery sections below before changing an allocation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Provider boundary and business outcome",
          "anchor": "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome"
        },
        {
          "kind": "paragraph",
          "text": "An administrator uses this capability to select a permitted model profile, inspect employee usage and investigate held capacity. Developers should read the provider and journal boundaries before enabling accounting; operators should distinguish an unavailable ledger, an uncertain model outcome and a measured total. The examples below preserve trusted tenant/enterprise identity and require separate grants for allocation or reconciliation."
        },
        {
          "kind": "paragraph",
          "text": "The copilotProviders family groups interchangeable transports; copilotProvider implements the neutral request, usage and budget boundary. A business team can choose an approved provider profile without moving business decisions or credentials into Axis. A successful model response is language output, not permission to mutate a record, proof of factual correctness or a billing settlement. The wrapper validates the explicitly selected profile before both ordinary and streaming dispatch, including selected tuning values, required adapter capabilities, message count and request-byte limits. Unknown profile names are rejected, but validateProfile does not reject all unknown keys inside an existing profile. A misspelled tuning key can therefore be ignored; validate project policy explicitly before dispatch."
        },
        {
          "kind": "paragraph",
          "text": "Actual vendor transport stays in the selected child adapter. Secret references resolve on the backend rather than becoming prompt content. Tool-calling capability is checked before dispatch; tool execution still uses its independent governed business operation. No generic provider retry is added after an uncertain acknowledgement. A consumer must retain stable trusted call identity and purpose so that accounting can distinguish one logical operation from another without treating a transport timeout as evidence of non-execution."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Profile[Explicit approved profile] --> Validate[Validate shape and bounds]\n  Validate --> Reserve[Opt-in atomic period reservation]\n  Reserve --> Adapter[Selected transport adapter]\n  Adapter --> Usage[Normalized usage and measured total]\n  Usage --> Settle[Original period settlement]\n  Usage --> Pending[No measured total remains reserved]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Calendar accounting and allocation",
          "anchor": "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation"
        },
        {
          "kind": "paragraph",
          "text": "Accounting is opt-in. Its persistence is the generated private copilotUsagePeriod service, not a process-memory counter or direct driver call. A unique tenant-period key and revision compare-and-swap bind all participating caps to one atomic update. DAY and MONTH periods use the configured IANA timezone, and settlement goes back to the original reservation period even when the response crosses midnight. A configured zero limit blocks usage; missing allocation is unassigned rather than an unlimited implicit personal grant."
        },
        {
          "kind": "paragraph",
          "text": "The accounting journal has a configured maximumEntries between 1 and 5000. Treat capacity exhaustion as a visible operational limitation, not permission to discard pending calls. Reservation output allowance clamps both the top-level request and the profile allowance. Personal, enterprise and tenant-level views must retain their independent authorization. These are tenant-isolated allocations, not a global platform pool, external invoice, prepaid payment balance or a guarantee that a vendor bill matches the measured count. Current-period administration uses a separate permission, expected revision, preview and confirmation with the same atomic audit journal. Recurring defaults remain layered nConfig/nDynamo policy; a period override is not another configuration authority."
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning",
            "Allowed next step"
          ],
          "rows": [
            [
              "Missing totalTokens",
              "No measured total for settlement",
              "Retain the reservation; inspect original evidence"
            ],
            [
              "Known total but missing input/output",
              "Normalized usage UNKNOWN; ledger can settle MEASURED",
              "Display both meanings; no fully measured receipt is captured"
            ],
            [
              "Measured input/output/total",
              "Provider measurement only",
              "Apply original-period accounting rules"
            ],
            [
              "Provider timeout",
              "Execution outcome uncertain",
              "No automatic replay or timed refund"
            ],
            [
              "Allocation edit conflict",
              "Current revision changed",
              "Refresh and review again"
            ],
            [
              "Accounting enabled without qualified private persistence",
              "Pre-dispatch prerequisite absent",
              "Reject dispatch"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Inspection and reconciliation",
          "anchor": "copilotProviderUsageBudgets-3-inspection-and-reconciliation"
        },
        {
          "kind": "paragraph",
          "text": "A usage display may show the latest 100 rows, but filtered aggregates must be computed over all authorized matching entries rather than that truncated window. Missing input, output or total measurements remain null with UNKNOWN status. Do not present a partially measured call as a zero-cost call. Allocation metadata must survive ordinary reserve and settle operations; otherwise an operational usage update could accidentally remove a reviewed limit. Measurement completeness and ledger settlement are separate: normalizeUsage marks UNKNOWN when a component is absent, but settle accepts a nonnegative safe-integer totalTokens, including zero. A response with only a measured total can thus settle the journal as MEASURED while its provider usage stays UNKNOWN. Automatic receipt capture requires all three measured counts, so that partial response creates no reconciliation receipt. Only an absent or invalid total keeps the full reservation pending."
        },
        {
          "kind": "paragraph",
          "text": "Receipt capture is private, opt-in and provider-owned through insert-only copilotUsageReceipt records. There is no employee API for inventing a receipt or overriding token counts. Reconciliation validates receipt scope and digest, inspects the original reservation and previews the proposed repair. Confirmation checks current permission and original-period revision again, then records the repair and audit atomically. Without verified evidence the reservation stays pending. Time passing, an operator assumption or a new model response cannot establish the old call outcome. Preview is read-only; confirmation binds the original receipt digest, call identity and current unresolved state, while the backend selects the latest journal revision for CAS. It does not accept a client expectedRevision field. Refresh the call after an ambiguous acknowledgement; an exact duplicate repair command can recover an existing matching result, while changing its identity or measured evidence is a conflict."
        },
        {
          "kind": "paragraph",
          "text": "For example, reserve a bounded allowance for call A near the end of a calendar period. If the adapter returns after the reset, inspect A in the original period rather than charging the new allocation. If the transport fails after dispatch, do not send A again to obtain a cleaner receipt. Investigate the original provider-owned evidence, retain UNKNOWN when counts are absent, and use the separate reconciliation permission only when a verified receipt supports a repair. Journal scale, retention, billing and cross-tenant pool behavior remain separate qualification work."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and failure recovery",
          "anchor": "copilotProviderUsageBudgets-4-verification-and-failure-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Run providerValidation, copilotUsage, copilotBudgets and copilotReconciliation contracts. Include rejected profile typos, unsupported capabilities, absent measurements, simultaneous cap reservations, explicit zero, period rollover, allocation conflicts, forged receipt scope and denied reconciliation. Verify streaming uses the same admission contract. Then qualify the actual adapter, private database indexes, deployment capture policy and employee permissions separately. A passing in-memory test cannot establish vendor transport behavior, database concurrency or signed-in Axis acceptance. Keep raw prompts, secrets and receipt payloads out of ordinary logs and documentation screenshots."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "copilot-provider-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "An administrator uses current-period allocations to control permitted employee spending; a developer uses provider profiles to bound model requests. Put an intentional output reduction in later project config/properties.js under copilot.providers.profiles.conversation, inheriting adapter defaults and secret references. Verify the selected default profile actually names conversation. Keep accounting disabled until generated period storage and unique indexes are qualified; reconciliation additionally requires private receipt get/save services. The neutral wrapper estimates a reservation from serialized request bytes plus the output allowance. This is not an exact tokenizer or a guarantee against measured overruns."
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "// A later project config/properties.js contribution; inherit other settings.\nmodule.exports = {\n  copilot: { providers: { profiles: {\n    conversation: { maximumOutputTokens: 512 }\n  } } }\n};\n// With accounting enabled, a request above 512 is rejected;\n// both invocation.maximumOutputTokens and profile allowance are clamped."
        },
        {
          "kind": "table",
          "headers": [
            "Task",
            "Required grants or context",
            "Recovery"
          ],
          "rows": [
            [
              "Inspect own usage",
              "copilot.assistant.read and trusted tenant/enterprise/loginId",
              "Unavailable is not zero; restore qualified storage"
            ],
            [
              "Edit employee/enterprise allocation",
              "Both read grants plus copilot.budget.user.manage or copilot.budget.enterprise.manage",
              "ERR_CPP_00006: reload period, policy digest and allocation revision, then preview again"
            ],
            [
              "Reconcile an unresolved call",
              "Both read grants plus copilot.usage.reconcile and a verified receipt",
              "Keep capacity held when evidence is missing; never replay the model"
            ],
            [
              "Reserve above capacity",
              "Configured tenant, enterprise and user caps",
              "ERR_CPP_00003: inspect commitments or use a separately authorized allocation change"
            ],
            [
              "Repeat an existing call ID",
              "Stable original call identity",
              "ERR_CPP_00004: inspect the original call; a new conversation is not a refund"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Loader-visible changes belong in later project src/service/defaultCopilotProviderService.js or a provider adapter member, preserving pre-dispatch validation, trusted call attribution, atomic multi-cap accounting and no ambiguous transport replay. Allocation commands use preview, confirmed: true and a stable changeId; do not edit generated journal records directly. Run the owner providerValidation, copilotUsage, copilotBudgets and copilotReconciliation tests after a real implementation change, including denied grants and both invocation paths. Fixtures do not qualify deployed storage or vendor billing."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation selection assets and acceptance",
          "anchor": "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "Partner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference."
        },
        {
          "kind": "paragraph",
          "text": "This guide is canonical CMS data owned by copilotProvider. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation."
        },
        {
          "kind": "paragraph",
          "text": "Images belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded."
        },
        {
          "kind": "paragraph",
          "text": "Canonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "copilot-provider-usage-budgets-common-mistakes"
        },
        {
          "kind": "paragraph",
          "text": "Do not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Provider adapter contracts and shared ownership",
          "anchor": "copilot-provider-adapter-contracts"
        },
        {
          "kind": "paragraph",
          "text": "This provider-neutral guide is the shared entry point for ollamaProvider, openAiProvider, claudeProvider and geminiProvider. Each adapter owns transport mapping and normalization, not conversation permissions, business mutations or budgets. Keep shared explanations here rather than copying them into vendor guides. Selecting a provider requires explicit backend configuration, a permitted capability profile and any required secret reference. The table describes checked-in adapters, not a promise that an external endpoint or every model supports identical features."
        },
        {
          "kind": "table",
          "headers": [
            "Implementing module",
            "Request mapping",
            "Response and stream behavior",
            "Boundary"
          ],
          "rows": [
            [
              "ollamaProvider",
              "Configured chat URL, model and options; structured output selects JSON format. Remote hosts require explicit policy.",
              "Bounded NDJSON chunks; done=true required. prompt_eval_count and eval_count provide measured usage.",
              "Local defaults do not authorize arbitrary remote endpoints."
            ],
            [
              "openAiProvider",
              "Responses input, backend bearer, optional images and strict response schema; profile.webSearch explicitly selects provider search.",
              "output_text and bounded returned source references; explicit non-completed status or refusal rejects. invokeStream emits one final result.",
              "Do not advertise incremental streaming or business-tool execution."
            ],
            [
              "claudeProvider",
              "Separate system instruction and user/assistant Messages; backend x-api-key and API version.",
              "Text and tool_use blocks; missing counts stay null. invokeStream emits one completion.",
              "Tool descriptors do not prove authorized execution."
            ],
            [
              "geminiProvider",
              "System instruction, user/model contents, generationConfig and backend x-goog-api-key.",
              "First candidate text and function-call descriptors; usageMetadata may be absent. invokeStream emits one completion.",
              "Missing measurements are not zero usage or verified completion."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Compare the effective provider profile, request bounds, supported capabilities and actual adapter mapping before changing a prompt. A timeout does not prove non-execution; do not replay an uncertain call to improve its accounting evidence. Fixture tests do not establish vendor availability, installed credentials, privacy qualification or billing. Later project configuration and focused loader-visible extensions must preserve authorization and usage semantics, and test ordinary and stream entry points. The Claude and Gemini request builders do not map request.tools even though their normalizers can return tool descriptors; provider capability metadata alone does not prove a complete request mapping. Their size check occurs after response.text buffering and cancellation uses a supplied signal, so qualify transport memory and timeout behavior separately rather than promising uniformly bounded streaming."
        }
      ],
      "searchText": "Copilot Provider Usage and Budgets Copilot Provider Usage and Budgets: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Copilot Provider Usage and Budgets\n\nFor a beginner, a provider is the backend connection to a selected language model; a budget is the capacity that a call is permitted to reserve. Start by inspecting an approved profile and a read-only usage view. A held reservation means the outcome needs evidence, not that the employee should repeat the prompt or manually refund the call. Follow the request, accounting and recovery sections below before changing an allocation.\n\n## Provider boundary and business outcome\n\nAn administrator uses this capability to select a permitted model profile, inspect employee usage and investigate held capacity. Developers should read the provider and journal boundaries before enabling accounting; operators should distinguish an unavailable ledger, an uncertain model outcome and a measured total. The examples below preserve trusted tenant/enterprise identity and require separate grants for allocation or reconciliation.\n\nThe copilotProviders family groups interchangeable transports; copilotProvider implements the neutral request, usage and budget boundary. A business team can choose an approved provider profile without moving business decisions or credentials into Axis. A successful model response is language output, not permission to mutate a record, proof of factual correctness or a billing settlement. The wrapper validates the explicitly selected profile before both ordinary and streaming dispatch, including selected tuning values, required adapter capabilities, message count and request-byte limits. Unknown profile names are rejected, but validateProfile does not reject all unknown keys inside an existing profile. A misspelled tuning key can therefore be ignored; validate project policy explicitly before dispatch.\n\nActual vendor transport stays in the selected child adapter. Secret references resolve on the backend rather than becoming prompt content. Tool-calling capability is checked before dispatch; tool execution still uses its independent governed business operation. No generic provider retry is added after an uncertain acknowledgement. A consumer must retain stable trusted call identity and purpose so that accounting can distinguish one logical operation from another without treating a transport timeout as evidence of non-execution.\n\n```mermaid\nflowchart LR\n  Profile[Explicit approved profile] --> Validate[Validate shape and bounds]\n  Validate --> Reserve[Opt-in atomic period reservation]\n  Reserve --> Adapter[Selected transport adapter]\n  Adapter --> Usage[Normalized usage and measured total]\n  Usage --> Settle[Original period settlement]\n  Usage --> Pending[No measured total remains reserved]\n```\n\n## Calendar accounting and allocation\n\nAccounting is opt-in. Its persistence is the generated private copilotUsagePeriod service, not a process-memory counter or direct driver call. A unique tenant-period key and revision compare-and-swap bind all participating caps to one atomic update. DAY and MONTH periods use the configured IANA timezone, and settlement goes back to the original reservation period even when the response crosses midnight. A configured zero limit blocks usage; missing allocation is unassigned rather than an unlimited implicit personal grant.\n\nThe accounting journal has a configured maximumEntries between 1 and 5000. Treat capacity exhaustion as a visible operational limitation, not permission to discard pending calls. Reservation output allowance clamps both the top-level request and the profile allowance. Personal, enterprise and tenant-level views must retain their independent authorization. These are tenant-isolated allocations, not a global platform pool, external invoice, prepaid payment balance or a guarantee that a vendor bill matches the measured count. Current-period administration uses a separate permission, expected revision, preview and confirmation with the same atomic audit journal. Recurring defaults remain layered nConfig/nDynamo policy; a period override is not another configuration authority.\n\n| Observation | Meaning | Allowed next step |\n| --- | --- | --- |\n| Missing totalTokens | No measured total for settlement | Retain the reservation; inspect original evidence |\n| Known total but missing input/output | Normalized usage UNKNOWN; ledger can settle MEASURED | Display both meanings; no fully measured receipt is captured |\n| Measured input/output/total | Provider measurement only | Apply original-period accounting rules |\n| Provider timeout | Execution outcome uncertain | No automatic replay or timed refund |\n| Allocation edit conflict | Current revision changed | Refresh and review again |\n| Accounting enabled without qualified private persistence | Pre-dispatch prerequisite absent | Reject dispatch |\n\n## Inspection and reconciliation\n\nA usage display may show the latest 100 rows, but filtered aggregates must be computed over all authorized matching entries rather than that truncated window. Missing input, output or total measurements remain null with UNKNOWN status. Do not present a partially measured call as a zero-cost call. Allocation metadata must survive ordinary reserve and settle operations; otherwise an operational usage update could accidentally remove a reviewed limit. Measurement completeness and ledger settlement are separate: normalizeUsage marks UNKNOWN when a component is absent, but settle accepts a nonnegative safe-integer totalTokens, including zero. A response with only a measured total can thus settle the journal as MEASURED while its provider usage stays UNKNOWN. Automatic receipt capture requires all three measured counts, so that partial response creates no reconciliation receipt. Only an absent or invalid total keeps the full reservation pending.\n\nReceipt capture is private, opt-in and provider-owned through insert-only copilotUsageReceipt records. There is no employee API for inventing a receipt or overriding token counts. Reconciliation validates receipt scope and digest, inspects the original reservation and previews the proposed repair. Confirmation checks current permission and original-period revision again, then records the repair and audit atomically. Without verified evidence the reservation stays pending. Time passing, an operator assumption or a new model response cannot establish the old call outcome. Preview is read-only; confirmation binds the original receipt digest, call identity and current unresolved state, while the backend selects the latest journal revision for CAS. It does not accept a client expectedRevision field. Refresh the call after an ambiguous acknowledgement; an exact duplicate repair command can recover an existing matching result, while changing its identity or measured evidence is a conflict.\n\nFor example, reserve a bounded allowance for call A near the end of a calendar period. If the adapter returns after the reset, inspect A in the original period rather than charging the new allocation. If the transport fails after dispatch, do not send A again to obtain a cleaner receipt. Investigate the original provider-owned evidence, retain UNKNOWN when counts are absent, and use the separate reconciliation permission only when a verified receipt supports a repair. Journal scale, retention, billing and cross-tenant pool behavior remain separate qualification work.\n\n## Verification and failure recovery\n\nRun providerValidation, copilotUsage, copilotBudgets and copilotReconciliation contracts. Include rejected profile typos, unsupported capabilities, absent measurements, simultaneous cap reservations, explicit zero, period rollover, allocation conflicts, forged receipt scope and denied reconciliation. Verify streaming uses the same admission contract. Then qualify the actual adapter, private database indexes, deployment capture policy and employee permissions separately. A passing in-memory test cannot establish vendor transport behavior, database concurrency or signed-in Axis acceptance. Keep raw prompts, secrets and receipt payloads out of ordinary logs and documentation screenshots.\n\n## Customize and extend safely\n\nAn administrator uses current-period allocations to control permitted employee spending; a developer uses provider profiles to bound model requests. Put an intentional output reduction in later project config/properties.js under copilot.providers.profiles.conversation, inheriting adapter defaults and secret references. Verify the selected default profile actually names conversation. Keep accounting disabled until generated period storage and unique indexes are qualified; reconciliation additionally requires private receipt get/save services. The neutral wrapper estimates a reservation from serialized request bytes plus the output allowance. This is not an exact tokenizer or a guarantee against measured overruns.\n\n```javascript\n// A later project config/properties.js contribution; inherit other settings.\nmodule.exports = {\n  copilot: { providers: { profiles: {\n    conversation: { maximumOutputTokens: 512 }\n  } } }\n};\n// With accounting enabled, a request above 512 is rejected;\n// both invocation.maximumOutputTokens and profile allowance are clamped.\n```\n\n| Task | Required grants or context | Recovery |\n| --- | --- | --- |\n| Inspect own usage | copilot.assistant.read and trusted tenant/enterprise/loginId | Unavailable is not zero; restore qualified storage |\n| Edit employee/enterprise allocation | Both read grants plus copilot.budget.user.manage or copilot.budget.enterprise.manage | ERR_CPP_00006: reload period, policy digest and allocation revision, then preview again |\n| Reconcile an unresolved call | Both read grants plus copilot.usage.reconcile and a verified receipt | Keep capacity held when evidence is missing; never replay the model |\n| Reserve above capacity | Configured tenant, enterprise and user caps | ERR_CPP_00003: inspect commitments or use a separately authorized allocation change |\n| Repeat an existing call ID | Stable original call identity | ERR_CPP_00004: inspect the original call; a new conversation is not a refund |\n\nLoader-visible changes belong in later project src/service/defaultCopilotProviderService.js or a provider adapter member, preserving pre-dispatch validation, trusted call attribution, atomic multi-cap accounting and no ambiguous transport replay. Allocation commands use preview, confirmed: true and a stable changeId; do not edit generated journal records directly. Run the owner providerValidation, copilotUsage, copilotBudgets and copilotReconciliation tests after a real implementation change, including denied grants and both invocation paths. Fixtures do not qualify deployed storage or vendor billing.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by copilotProvider. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n\n## Provider adapter contracts and shared ownership\n\nThis provider-neutral guide is the shared entry point for ollamaProvider, openAiProvider, claudeProvider and geminiProvider. Each adapter owns transport mapping and normalization, not conversation permissions, business mutations or budgets. Keep shared explanations here rather than copying them into vendor guides. Selecting a provider requires explicit backend configuration, a permitted capability profile and any required secret reference. The table describes checked-in adapters, not a promise that an external endpoint or every model supports identical features.\n\n| Implementing module | Request mapping | Response and stream behavior | Boundary |\n| --- | --- | --- | --- |\n| ollamaProvider | Configured chat URL, model and options; structured output selects JSON format. Remote hosts require explicit policy. | Bounded NDJSON chunks; done=true required. prompt_eval_count and eval_count provide measured usage. | Local defaults do not authorize arbitrary remote endpoints. |\n| openAiProvider | Responses input, backend bearer, optional images and strict response schema; profile.webSearch explicitly selects provider search. | output_text and bounded returned source references; explicit non-completed status or refusal rejects. invokeStream emits one final result. | Do not advertise incremental streaming or business-tool execution. |\n| claudeProvider | Separate system instruction and user/assistant Messages; backend x-api-key and API version. | Text and tool_use blocks; missing counts stay null. invokeStream emits one completion. | Tool descriptors do not prove authorized execution. |\n| geminiProvider | System instruction, user/model contents, generationConfig and backend x-goog-api-key. | First candidate text and function-call descriptors; usageMetadata may be absent. invokeStream emits one completion. | Missing measurements are not zero usage or verified completion. |\n\nCompare the effective provider profile, request bounds, supported capabilities and actual adapter mapping before changing a prompt. A timeout does not prove non-execution; do not replay an uncertain call to improve its accounting evidence. Fixture tests do not establish vendor availability, installed credentials, privacy qualification or billing. Later project configuration and focused loader-visible extensions must preserve authorization and usage semantics, and test ordinary and stream entry points. The Claude and Gemini request builders do not map request.tools even though their normalizers can return tool descriptors; provider capability metadata alone does not prove a complete request mapping. Their size check occurs after response.text buffering and cancellation uses a supplied signal, so qualify transport memory and timeout behavior separately rather than promising uniformly bounded streaming.\n",
      "source": {
        "repository": "nodics.ai",
        "owner": "copilotProvider",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotProvider",
        "path": "data/docs-v001/records/documentation/copilotProviderDocumentationComponentData.js",
        "sourcePath": "data/docs-v001/records/documentation/copilotProviderDocumentationComponentData.js",
        "checksum": "b916ab141c41519e38c15c3d4a30dd915c82125de8d2577303ee4c5029c8deec",
        "wordCount": 2164
      },
      "slug": "copilot-provider-usage-budgets",
      "locale": "en",
      "navigationGroup": "Copilot Provider",
      "navigationGroupCode": "copilotProvider",
      "navigationGroupOrder": 70,
      "navigationOrder": 2000,
      "references": [
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.governed-schema-actions",
          "owner": "copilotWorkbench"
        }
      ],
      "sourceCoverage": [
        {
          "modulePath": ".",
          "implementationState": "IMPLEMENTED",
          "anchors": [
            "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
            "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
            "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
            "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
            "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance"
          ],
          "evidence": [
            "src/service/defaultCopilotProviderService.js",
            "src/service/defaultCopilotBudgetService.js",
            "src/service/defaultCopilotUsageService.js",
            "src/service/defaultCopilotReconciliationService.js",
            "test/copilotBudgets.test.js",
            "test/copilotReconciliation.test.js"
          ]
        },
        {
          "modulePath": "../..",
          "implementationState": "COMPOSITION_ONLY",
          "anchors": [
            "copilotProviderUsageBudgets-1-provider-boundary-and-business-outcome",
            "copilotProviderUsageBudgets-2-calendar-accounting-and-allocation",
            "copilotProviderUsageBudgets-3-inspection-and-reconciliation",
            "copilotProviderUsageBudgets-4-verification-and-failure-recovery",
            "copilotProviderUsageBudgets-5-documentation-selection-assets-and-acceptance"
          ],
          "evidence": [
            "src/service/defaultCopilotProviderService.js",
            "src/service/defaultCopilotBudgetService.js",
            "src/service/defaultCopilotUsageService.js",
            "src/service/defaultCopilotReconciliationService.js",
            "test/copilotBudgets.test.js",
            "test/copilotReconciliation.test.js"
          ]
        }
      ],
      "sourceOwnership": [
        {
          "modulePath": "../ollamaProvider",
          "implementationState": "IMPLEMENTED",
          "anchor": "copilot-provider-adapter-contracts",
          "evidence": [
            "../ollamaProvider/src/service/defaultOllamaCopilotProviderAdapterService.js",
            "../ollamaProvider/AGENTS.md"
          ],
          "rationale": "This transport adapter is explicitly referenced by the shared provider guide and adapter comparison. Provider selection, usage and failure handling remain shared contracts, avoiding competing vendor copies. This mapping is not detailed-section certification or live-provider qualification."
        },
        {
          "modulePath": "../openAiProvider",
          "implementationState": "IMPLEMENTED",
          "anchor": "copilot-provider-adapter-contracts",
          "evidence": [
            "../openAiProvider/src/service/defaultOpenAiCopilotProviderAdapterService.js",
            "../openAiProvider/AGENTS.md"
          ],
          "rationale": "This transport adapter is explicitly referenced by the shared provider guide and adapter comparison. Provider selection, usage and failure handling remain shared contracts, avoiding competing vendor copies. This mapping is not detailed-section certification or live-provider qualification."
        },
        {
          "modulePath": "../claudeProvider",
          "implementationState": "IMPLEMENTED",
          "anchor": "copilot-provider-adapter-contracts",
          "evidence": [
            "../claudeProvider/src/service/defaultClaudeCopilotProviderAdapterService.js",
            "../claudeProvider/AGENTS.md"
          ],
          "rationale": "This transport adapter is explicitly referenced by the shared provider guide and adapter comparison. Provider selection, usage and failure handling remain shared contracts, avoiding competing vendor copies. This mapping is not detailed-section certification or live-provider qualification."
        },
        {
          "modulePath": "../geminiProvider",
          "implementationState": "IMPLEMENTED",
          "anchor": "copilot-provider-adapter-contracts",
          "evidence": [
            "../geminiProvider/src/service/defaultGeminiCopilotProviderAdapterService.js",
            "../geminiProvider/AGENTS.md"
          ],
          "rationale": "This transport adapter is explicitly referenced by the shared provider guide and adapter comparison. Provider selection, usage and failure handling remain shared contracts, avoiding competing vendor copies. This mapping is not detailed-section certification or live-provider qualification."
        }
      ]
    },
    "active": true
  }
};
