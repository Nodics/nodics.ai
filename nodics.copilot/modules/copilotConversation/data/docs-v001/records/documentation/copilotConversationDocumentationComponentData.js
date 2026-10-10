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
  "record0": {
    "code": "nodicsDocsComponentcopilotRetentionLifecycle",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.retention-lifecycle",
      "title": "Copilot Conversation Retention and Recovery",
      "route": "/docs/framework/copilot/retention-lifecycle",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Copilot Conversation Retention and Recovery"
      ],
      "hierarchyDepth": 2,
      "documentType": "operations",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ],
      "businessAudience": [],
      "technicalAudience": [],
      "summary": "Explicit reviewed retention, legal-hold intersection, bounded transactional pages, original-operation recovery and frozen stop, with deployment qualification and sanitized Axis captures.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.24",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "cron.operations",
        "tooling.ai-developer-enablement"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotRetentionExecutionService.js",
        "test/copilotRetentionExecution.test.js",
        "../../../nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimePropertyReadFenceService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram"
      ],
      "searchKeywords": [
        "copilot",
        "retention",
        "legal hold",
        "recovery",
        "conversation"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Retention",
        "Recovery"
      ],
      "headings": [
        {
          "text": "Independent Audit Retention",
          "anchor": "copilotRetentionLifecycle-1-independent-audit-retention",
          "level": 2
        },
        {
          "text": "Deployment and Policy",
          "anchor": "copilotRetentionLifecycle-2-deployment-and-policy",
          "level": 3
        },
        {
          "text": "Operator Journey",
          "anchor": "copilotRetentionLifecycle-3-operator-journey",
          "level": 3
        },
        {
          "text": "API and Customization",
          "anchor": "copilotRetentionLifecycle-4-api-and-customization",
          "level": 3
        },
        {
          "text": "Verified Interface",
          "anchor": "copilotRetentionLifecycle-5-verified-interface",
          "level": 3
        },
        {
          "text": "Ownership",
          "anchor": "copilotRetentionLifecycle-6-ownership",
          "level": 2
        },
        {
          "text": "Deployment Steps",
          "anchor": "copilotRetentionLifecycle-7-deployment-steps",
          "level": 2
        },
        {
          "text": "Administrator Journey",
          "anchor": "copilotRetentionLifecycle-8-administrator-journey",
          "level": 2
        },
        {
          "text": "Recovery and Holds",
          "anchor": "copilotRetentionLifecycle-9-recovery-and-holds",
          "level": 2
        },
        {
          "text": "Close an Active Conversation",
          "anchor": "copilotRetentionLifecycle-10-close-an-active-conversation",
          "level": 3
        },
        {
          "text": "Resume a Stopped Retention Operation",
          "anchor": "copilotRetentionLifecycle-11-resume-a-stopped-retention-operation",
          "level": 3
        },
        {
          "text": "Secured API",
          "anchor": "copilotRetentionLifecycle-12-secured-api",
          "level": 2
        },
        {
          "text": "Customize and Extend Safely",
          "anchor": "copilotRetentionLifecycle-13-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotRetentionLifecycle-14-verification",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotRetentionLifecycle-15-common-mistakes",
          "level": 2
        },
        {
          "text": "Axis Capture Evidence",
          "anchor": "copilotRetentionLifecycle-16-axis-capture-evidence",
          "level": 2
        },
        {
          "text": "Source and Publication State",
          "anchor": "copilotRetentionLifecycle-17-source-and-publication-state",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Independent Audit Retention",
          "anchor": "copilotRetentionLifecycle-1-independent-audit-retention"
        },
        {
          "kind": "paragraph",
          "text": "Audit retention is separate from conversation-content deletion. It owns only `TRANSCRIPT_ACCESS` receipts and terminal `ACTION` records. Provider accounting, conversation tombstones, retention receipts, active approvals, running commands and `OUTCOME_UNKNOWN` actions are never selected. Missing enterprise audit policy means preserve indefinitely; transcript expiry and holds are not audit policy."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Deployment and Policy",
          "anchor": "copilotRetentionLifecycle-2-deployment-and-policy"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Deploy private `copilotAuditRetentionOperation` with its unique code index. Qualify journaled persistence and atomic transactions covering this receipt, `copilotTranscriptAccess` and `copilotAction`. Keep generic routes, caches and events disabled. Standalone nontransactional storage is not enough.",
            "Qualify `databaseTransactions.enabled`, `failClosed`, multi-record atomicity and journaled commit. Enable the existing nDynamo read fence for owner `copilotConversation` with durable governed tenant-property persistence.",
            "Grant human operators `copilot.activity.read` and independently `copilot.audit.retention.execute`. Configuration additionally needs existing configuration-management authority and `copilot.audit.retention.configure`. Super administrators may delegate the **Independent audit retention policy** section through Enterprise administration. Delegation does not grant the independent configuration permission or the execution permission.",
            "In AI Configuration, select **Transcript access audit retention** or **Action audit retention** for the enterprise. Set independent days, hold-all, held audit codes and held conversation codes. Use existing proposal, review and activation. New forms default to preserving all audit.",
            "After deployment acceptance, explicitly enable `copilot.conversation.auditRetention.deletionEnabled`, default false, through deployment governance. The business form cannot enable deletion or relax persistence qualification. `maximumBatch` defaults 25, allowed range 1-100."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Example `auditRetention.enterprisePolicies` entry, intentionally held:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\"tenantCode\":\"exampleTenant\",\"enterpriseCode\":\"exampleEnterprise\",\n \"kind\":\"TRANSCRIPT_ACCESS\",\"retentionDays\":365,\"holdAll\":true,\n \"recordCodes\":[],\"conversationCodes\":[]}"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Operator Journey",
          "anchor": "copilotRetentionLifecycle-3-operator-journey"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **Copilot > Activity > Audit retention**. The independent capability must be admitted. Without policy no deletion category is available, but original operation recovery can remain visible.",
            "Select a category, enter a business reason, then **Review audit deletion**. This bounded read creates no receipt, acquires no fence and deletes nothing.",
            "Review count, exact UTC cutoff and reference. Held records are excluded. Action candidates must be `EXECUTED`, `CANCELLED`, `REJECTED` or `EXPIRED`; missing trustworthy scope or dates never becomes inferred eligibility.",
            "Tick the irreversible-deletion confirmation, then **Delete reviewed batch** once. The original reference remains visible. Offline commands are not queued.",
            "Completion covers only this reviewed batch. Refresh Activity to review another batch; there is no automatic drain loop or automatic uncertain retry.",
            "After response loss, use **Inspect original operation**. `COMPLETED` and the removed count were committed with deletion in one transaction. Missing evidence remains `OUTCOME_UNKNOWN`, not proof of rollback.",
            "**Stop pending operation** stops `PREPARED`; **Release retained policy fence** releases a terminal operation's retained fence. Neither retries deletion. If deletion won a concurrent race, it reports `COMPLETED`, not a false stop. A rejected transaction rolls back removal and completion together. Recovery works with deletion disabled, subject to original actor and qualified storage. No actor takeover is implied."
          ]
        },
        {
          "kind": "code",
          "language": "text",
          "text": "review -> exact audit identities/hashes + policy revision + cutoff\nconfirm -> PREPARED journal -> nDynamo policy-revision fence\n        -> transaction: recheck originals/holds; delete batch; commit receipt\n        -> durable readback -> release original fence\nlost acknowledgement -> original inspection -> stop/release only; no delete replay"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "API and Customization",
          "anchor": "copilotRetentionLifecycle-4-api-and-customization"
        },
        {
          "kind": "paragraph",
          "text": "Authenticated fixed POST routes: `/activity/audit-retention/preview`, `/execute`, `/inspect`, `/stop`. Preview accepts exactly `{kind, reason}`. Execute adds the returned `operationCode`, `cutoff`, `reviewDigest` and `confirmed: true`. Inspect/stop accept only `{operationCode}`. Extra keys and stale reviews fail. Responses contain bounded counts and original state, never audit content, private selected-record hashes or fence tokens. Inspection does not release a fence; the explicit stop/release command does."
        },
        {
          "kind": "paragraph",
          "text": "Customize `auditRetention.presentation` without dropping required text keys. Keep policy in the administration owner and rendering in Axis. Do not add direct database calls, TTL cleanup or a nontransactional fallback. Minimal deletion receipts are retained indefinitely and cannot erase themselves. Provider accounting still needs its accounting owner's policy; this operation cannot erase that ledger. Test holds, policy drift, foreign rows, rollback, lost commits, terminal-only actions and no-replay UI. Local fixtures are not live deletion or regulatory approval of a retention period."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Verified Interface",
          "anchor": "copilotRetentionLifecycle-5-verified-interface"
        },
        {
          "kind": "paragraph",
          "text": "These captures use the real Axis renderer with synthetic owner responses, not live audit deletion. Desktop review was checked at 1280x900, and mobile review and lost-response recovery at 390x844. No horizontal overflow was observed."
        },
        {
          "kind": "image",
          "alt": "Independent audit deletion review",
          "title": "Independent audit deletion review",
          "mediaCode": "nodicsDocsImage_81767797d181627278c1adb5"
        },
        {
          "kind": "image",
          "alt": "Mobile audit review",
          "title": "Mobile audit review",
          "mediaCode": "nodicsDocsImage_471cce946bd104a0d005cc84"
        },
        {
          "kind": "image",
          "alt": "Original audit receipt recovery after a lost response",
          "title": "Original audit receipt recovery after a lost response",
          "mediaCode": "nodicsDocsImage_9f53acee42afea34112c81aa"
        },
        {
          "kind": "paragraph",
          "text": "Beginners should start with the administrator journey: reviewing metadata never deletes content. Business administrators decide which expired conversation is reviewed, while the operator qualifies storage and deployment before production. Developers preserve the canonical owner contracts when customizing labels or the typed renderer."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership",
          "anchor": "copilotRetentionLifecycle-6-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Conversation owns reviewed retention and the private `retentionOperation` on its existing parent record. Generated services own persistence, nDatabase owns opaque transactions, MongoDB owns snapshot/majority/journal mechanics, and nDynamo owns committed configuration and its private revision fence. Axis is presentation only. Conversation-content retention reuses its parent receipt; independent audit retention uses the private generated receipt described above. No project/Kickoff implementation or background scheduler is added."
        },
        {
          "kind": "paragraph",
          "text": "Only bound messages, events and turns of one expired CLOSED/ARCHIVED conversation are eligible. The parent tombstone, operation reason/actor/counts, transcript access receipts, action audit and provider accounting remain. Their retention is separate. This is not backup erasure, export cleanup or a legacy migration. Conversation closure is a separate non-destructive command in the same lifecycle panel."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Deployment Steps",
          "anchor": "copilotRetentionLifecycle-7-deployment-steps"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Deploy every Conversation writer with the transactional parent guard, including remote workers. Verify no legacy writer can bypass it. Local tests do not prove full writer coverage, and age is not proof that a worker has stopped.",
            "Qualify the actual transaction-capable MongoDB replica set or sharded topology. Enable `databaseTransactions.enabled` with `failClosed: true`. All participating schemas retain transaction eligibility and disabled cache/events. The adapter must advertise `journaledCommit` and commit with majority plus journal.",
            "Enable canonical nDynamo persistence and `runtimePropertyGovernance.persistence.requireDurableJournal: true`. Internal generated CAS uses majority/journal; readback uses primary/majority. Unqualified providers, broad updates and transaction mixing are rejected.",
            "Enable `runtimePropertyGovernance.readFence.enabled` and explicitly admit `readFence.owners.copilotConversation: true`. Verify a committed persisted property revision exists before preparing retention.",
            "Configure `copilot.conversation.storage: 'GENERATED_SERVICE'`, `writerFence.enabled: true` and `lifecycle.maximumBatch` between 1 and 100. Only after qualification separately enable `lifecycle.deletionEnabled` through normal configuration governance. Both writer/deletion gates ship disabled.",
            "Grant the original employee `copilot.activity.read`, `copilot.activity.lifecycle.read` and `copilot.activity.lifecycle.execute`. These grants do not confer transcript access or any cross-enterprise authority.",
            "On disposable data qualify two employees/enterprises, competing writers, hold activation, rollback, process termination, primary changes and lost responses. No automatic deployment, real deletion or topology qualification is performed by the source test suite."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Journey",
          "anchor": "copilotRetentionLifecycle-8-administrator-journey"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Select the enterprise, open Activity, then Retention review and Load review.",
            "Review age, hold and state; open Retention operation for the conversation. Backend capability admission controls whether the command panel is displayed.",
            "Enter a business reason and choose Review deletion. This creates no operation or fence. The digest binds actor, parent, timestamp, writer token and policy.",
            "Check the confirmation and choose Confirm retention operation. PREPARED evidence is durably persisted. No content is deleted and no policy fence is acquired yet.",
            "Confirm and choose Delete next batch. The owner acquires/inspects its pinned property fence, then removes at most one bounded page and advances the journal in one transaction. Empty pages advance through messages, events and turns.",
            "Confirm each next batch explicitly. There is no auto-run loop or retry. At PURGED the content stages are empty, the parent tombstone remains and the exact fence is released after durable readback. Never reuse the conversation identity."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Recovery and Holds",
          "anchor": "copilotRetentionLifecycle-9-recovery-and-holds"
        },
        {
          "kind": "paragraph",
          "text": "After a timeout, choose Inspect original operation, not Begin or automatic retry. An empty inspect body retrieves the original actor's operation for that exact conversation, including after a lost begin response. It returns the stored revision and counts. A later explicit advance must use that revision; stale ones fail."
        },
        {
          "kind": "paragraph",
          "text": "Stop and preserve remaining content records STOPPED transactionally and freezes the parent as RETENTION_STOPPED. Only after primary-majority terminal readback does it release the fence. It neither restores deleted content nor reopens writers. STOPPED cannot advance directly. A fresh review can reauthorize the remaining deletion without restoring content or reopening writers. If terminal acknowledgement or release is lost, inspect and explicitly repeat terminal stop/release with the observed revision. That operation cannot delete another page."
        },
        {
          "kind": "paragraph",
          "text": "Inspection and stopping work with deletion disabled while durable persistence, writer fencing and original authority remain qualified. If those prerequisites are disabled, restore qualified deployment before recovery. Never delete a fence manually. Legacy/foreign child bindings abort the page; stop and escalate to the migration owner instead of guessing or silently omitting ownership."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Close an Active Conversation",
          "anchor": "copilotRetentionLifecycle-10-close-an-active-conversation"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Select the conversation, enter a business reason and choose **Review conversation closure**.",
            "Read the closure notice. Closure stops new content writes; it does not cancel provider calls or business operations already running.",
            "Confirm the reviewed closure. The exact parent revision/write token must still match; concurrent conversation activity invalidates the review.",
            "The owner records CLOSED and the closure timestamp atomically. No content is deleted, and retention age starts at closure rather than an earlier activity.",
            "After an uncertain response, choose **Inspect original closure**, never submit Close again. Inspection requires the original actor and current independent lifecycle authority. Holds remain effective and closure does not remove them."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Closure remains available with the deletion gate off, but requires qualified durable persistence and the transactional writer guard. Its private receipt is not exposed in ordinary conversation records."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Resume a Stopped Retention Operation",
          "anchor": "copilotRetentionLifecycle-11-resume-a-stopped-retention-operation"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Inspect the original retention operation and confirm STOPPED.",
            "Finish its exact stop/fence release if that acknowledgement was lost.",
            "Enter a fresh business reason and choose **Review remaining deletion**.",
            "The owner checks the current committed policy, active holds, original content cutoff, original actor, exact revision and absence of the prior fence.",
            "Confirm the new review. State becomes RESUMING; no content is removed by this command. The operation identity, stage and cumulative deletion counts remain.",
            "Explicitly delete the next batch. It acquires a fence for the newly reviewed policy and continues from retained progress, without repeating deleted pages."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Lost resumption acknowledgement requires original-operation inspection. A stale review, new hold, longer unelapsed retention period or missing historical cutoff rejects. At most twenty resumptions are retained; reaching that bound refuses another resumption rather than truncating prior audit. Old operation journals without an original cutoff remain inspectable/stoppable but cannot be resumed. Partner overrides may change presentation, not these identity, fence or recovery rules. Run retention execution, API routing and Axis retention tests for changes."
        },
        {
          "kind": "paragraph",
          "text": "The tenant property fence blocks governed property changes, including new holds, while deletion is in progress. A proposed hold is not active until activation succeeds. For an urgent hold, stop retention, verify durable STOPPED and fence release, then activate the hold. The broad fence may delay unrelated settings; there is no TTL or implicit takeover that could admit deletion under stale holds."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Secured API",
          "anchor": "copilotRetentionLifecycle-12-secured-api"
        },
        {
          "kind": "paragraph",
          "text": "All are sensitive, no-store, employee access-token POSTs below `/activity/:conversationCode/retention/`. The route owns conversation identity; the body cannot override tenant, actor, enterprise, storage options or policy."
        },
        {
          "kind": "table",
          "headers": [
            "Suffix",
            "Exact body",
            "Effect"
          ],
          "rows": [
            [
              "preview",
              "reason",
              "Read-only digest and bounded batch size"
            ],
            [
              "begin",
              "reason, reviewDigest, confirmed: true",
              "Persist reviewed intent once"
            ],
            [
              "inspect",
              "empty, or operationCode",
              "Read original actor's evidence"
            ],
            [
              "advance",
              "operationCode, expectedRevision",
              "One transactional bounded page"
            ],
            [
              "stop",
              "operationCode, expectedRevision",
              "Freeze terminal state and release exact fence"
            ],
            [
              "resume-preview",
              "operationCode, expectedRevision, reason",
              "Review remaining stopped work under current policy"
            ],
            [
              "resume",
              "operationCode, expectedRevision, reason, reviewDigest, confirmed",
              "Record resumption without deleting content"
            ],
            [
              "close-preview",
              "reason",
              "Review ACTIVE conversation closure"
            ],
            [
              "close",
              "reason, reviewDigest, confirmed",
              "Close without deleting content or canceling external work"
            ],
            [
              "close-inspect",
              "empty",
              "Read original actor's recorded closure"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Receipts contain contractVersion 1, tenant/enterprise context, conversationCode, operationCode, revision, state, per-store counts and terminal completedAt. Private reason, policy, fence token and content are omitted. Stale/foreign/duplicate evidence, body extensions, contradictory acknowledgements and unqualified storage fail closed."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n    actor Admin\n    participant Axis\n    participant Conversation\n    participant Dynamo as nDynamo\n    participant DB as nDatabase\n    Admin->>Axis: Review and confirm\n    Axis->>Conversation: Begin with current digest\n    Conversation->>DB: Durable parent CAS: PREPARED\n    Admin->>Axis: Confirm next batch\n    Axis->>Conversation: Advance original operation and revision\n    Conversation->>Dynamo: Acquire or inspect pinned policy fence\n    Conversation->>DB: Transaction: parent check, bounded delete, journal update\n    DB-->>Conversation: Commit or uncertain outcome\n    Conversation->>DB: Primary-majority parent readback\n    alt Terminal persisted state\n        Conversation->>Dynamo: Release exact fence\n    end\n    Conversation-->>Axis: Scoped receipt or unconfirmed error"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and Extend Safely",
          "anchor": "copilotRetentionLifecycle-13-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Customize `lifecycle.executionPresentation` through layered configuration or wrap the existing typed Axis panel. Preserve grants, scope, explicit confirmation, no-replay recovery and late-response disposal. No arbitrary transport destinations, local authority, browser persistence, audit deletion, TTL or batch above 100."
        },
        {
          "kind": "paragraph",
          "text": "For a project-specific label, extend the existing active project configuration module's `config/properties.js`; do not duplicate the framework service in a customer module or change Kickoff to own retention. For example:"
        },
        {
          "kind": "code",
          "language": "javascript",
          "text": "/** @file Project presentation and bounded batch override; does not enable deletion. */\nmodule.exports = {\n    copilot: {\n        conversation: {\n            lifecycle: {\n                maximumBatch: 25,\n                executionPresentation: { title: 'Review recorded conversation retention' }\n            }\n        }\n    }\n};"
        },
        {
          "kind": "paragraph",
          "text": "Inherited presentation keys remain with the framework defaults. Apply through the project's established configuration lifecycle and inspect the effective settings. A label or smaller batch must not manufacture execution permission. Reject a batch above 100; after a failed change, keep the previously effective configuration and use the existing governance recovery, not browser overrides."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotRetentionLifecycle-14-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run Conversation retention/writer/persistence suites, API route tests, nDynamo fence tests, generated durable-pipeline and MongoDB transaction tests. Axis has `CopilotRetention.test.tsx`, lifecycle tests and synthetic `retention.visual.html`. These do not prove deployed failover, backup erasure, writer coverage or signed-in persistent-runtime acceptance. Independent audit retention remains outside this content-purge operation and must not be claimed as completed by it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotRetentionLifecycle-15-common-mistakes"
        },
        {
          "kind": "table",
          "headers": [
            "Mistake",
            "Required response"
          ],
          "rows": [
            [
              "Treating an expired row as deletion authorization",
              "Obtain fresh review and independent execution admission"
            ],
            [
              "Enabling only the deletion flag",
              "Qualify every writer, persisted policy fence and transaction provider first"
            ],
            [
              "Retrying after a timeout",
              "Inspect the original operation and observed revision"
            ],
            [
              "Assuming a submitted hold is active",
              "Confirm activation; stop in-progress retention before activating a new hold"
            ],
            [
              "Deleting private audit or fence records manually",
              "Preserve evidence and recover through the owning service"
            ],
            [
              "Treating a stopped record as an active session",
              "Keep it frozen; never recreate its identity"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Axis Capture Evidence",
          "anchor": "copilotRetentionLifecycle-16-axis-capture-evidence"
        },
        {
          "kind": "paragraph",
          "text": "These are real Axis renderer captures from the isolated synthetic fixture at `/test/assistant/retention.visual.html`, taken 2026-10-03 at 1280 x 1000 and 390 x 844. They contain fictional records and no real credentials or customer content. The walkthrough verified explicit review, confirmation, one batch, inspection and frozen stop, with no horizontal overflow or browser errors. They are renderer evidence, not signed-in persistence or destructive acceptance."
        },
        {
          "kind": "image",
          "alt": "Desktop retention review with separate confirmation",
          "title": "Desktop retention review with separate confirmation",
          "mediaCode": "nodicsDocsImage_35b2bc35b6cf4b00f051d8aa"
        },
        {
          "kind": "image",
          "alt": "Mobile retention review with wrapped controls",
          "title": "Mobile retention review with wrapped controls",
          "mediaCode": "nodicsDocsImage_0c47086aa063e3aad0fe7da2"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source and Publication State",
          "anchor": "copilotRetentionLifecycle-17-source-and-publication-state"
        },
        {
          "kind": "paragraph",
          "text": "Functional owner: `nodics.copilot`; technical owner: `copilotConversation`. The service, private schemas, configuration and owner tests are under `nodics.copilot/modules/copilotConversation`. Secured API mapping belongs to `copilotApi`; orchestration belongs to `copilotCore`. Axis's typed client and panel live under its existing `src/assistant` boundary. nDynamo and nDatabase remain the only policy/persistence coordination owners."
        },
        {
          "kind": "paragraph",
          "text": "This page is maintained as CMS data in the framework content pack. Validating a release does not import it into Platform, activate documentation navigation or publish it to a customer. Use the existing governed content-pack release/import process and verify the rendered page in the target environment."
        }
      ],
      "searchText": "Copilot Conversation Retention and Recovery Explicit reviewed retention, legal-hold intersection, bounded transactional pages, original-operation recovery and frozen stop, with deployment qualification and sanitized Axis captures. # Copilot Conversation Retention and Recovery\n\n## Independent Audit Retention\n\nAudit retention is separate from conversation-content deletion. It owns only `TRANSCRIPT_ACCESS` receipts and terminal `ACTION` records. Provider accounting, conversation tombstones, retention receipts, active approvals, running commands and `OUTCOME_UNKNOWN` actions are never selected. Missing enterprise audit policy means preserve indefinitely; transcript expiry and holds are not audit policy.\n\n### Deployment and Policy\n\n1. Deploy private `copilotAuditRetentionOperation` with its unique code index. Qualify journaled persistence and atomic transactions covering this receipt, `copilotTranscriptAccess` and `copilotAction`. Keep generic routes, caches and events disabled. Standalone nontransactional storage is not enough.\n2. Qualify `databaseTransactions.enabled`, `failClosed`, multi-record atomicity and journaled commit. Enable the existing nDynamo read fence for owner `copilotConversation` with durable governed tenant-property persistence.\n3. Grant human operators `copilot.activity.read` and independently `copilot.audit.retention.execute`. Configuration additionally needs existing configuration-management authority and `copilot.audit.retention.configure`. Super administrators may delegate the **Independent audit retention policy** section through Enterprise administration. Delegation does not grant the independent configuration permission or the execution permission.\n4. In AI Configuration, select **Transcript access audit retention** or **Action audit retention** for the enterprise. Set independent days, hold-all, held audit codes and held conversation codes. Use existing proposal, review and activation. New forms default to preserving all audit.\n5. After deployment acceptance, explicitly enable `copilot.conversation.auditRetention.deletionEnabled`, default false, through deployment governance. The business form cannot enable deletion or relax persistence qualification. `maximumBatch` defaults 25, allowed range 1-100.\n\nExample `auditRetention.enterprisePolicies` entry, intentionally held:\n\n```json\n{\"tenantCode\":\"exampleTenant\",\"enterpriseCode\":\"exampleEnterprise\",\n \"kind\":\"TRANSCRIPT_ACCESS\",\"retentionDays\":365,\"holdAll\":true,\n \"recordCodes\":[],\"conversationCodes\":[]}\n```\n\n### Operator Journey\n\n1. Open **Copilot > Activity > Audit retention**. The independent capability must be admitted. Without policy no deletion category is available, but original operation recovery can remain visible.\n2. Select a category, enter a business reason, then **Review audit deletion**. This bounded read creates no receipt, acquires no fence and deletes nothing.\n3. Review count, exact UTC cutoff and reference. Held records are excluded. Action candidates must be `EXECUTED`, `CANCELLED`, `REJECTED` or `EXPIRED`; missing trustworthy scope or dates never becomes inferred eligibility.\n4. Tick the irreversible-deletion confirmation, then **Delete reviewed batch** once. The original reference remains visible. Offline commands are not queued.\n5. Completion covers only this reviewed batch. Refresh Activity to review another batch; there is no automatic drain loop or automatic uncertain retry.\n6. After response loss, use **Inspect original operation**. `COMPLETED` and the removed count were committed with deletion in one transaction. Missing evidence remains `OUTCOME_UNKNOWN`, not proof of rollback.\n7. **Stop pending operation** stops `PREPARED`; **Release retained policy fence** releases a terminal operation's retained fence. Neither retries deletion. If deletion won a concurrent race, it reports `COMPLETED`, not a false stop. A rejected transaction rolls back removal and completion together. Recovery works with deletion disabled, subject to original actor and qualified storage. No actor takeover is implied.\n\n```text\nreview -> exact audit identities/hashes + policy revision + cutoff\nconfirm -> PREPARED journal -> nDynamo policy-revision fence\n        -> transaction: recheck originals/holds; delete batch; commit receipt\n        -> durable readback -> release original fence\nlost acknowledgement -> original inspection -> stop/release only; no delete replay\n```\n\n### API and Customization\n\nAuthenticated fixed POST routes: `/activity/audit-retention/preview`, `/execute`, `/inspect`, `/stop`. Preview accepts exactly `{kind, reason}`. Execute adds the returned `operationCode`, `cutoff`, `reviewDigest` and `confirmed: true`. Inspect/stop accept only `{operationCode}`. Extra keys and stale reviews fail. Responses contain bounded counts and original state, never audit content, private selected-record hashes or fence tokens. Inspection does not release a fence; the explicit stop/release command does.\n\nCustomize `auditRetention.presentation` without dropping required text keys. Keep policy in the administration owner and rendering in Axis. Do not add direct database calls, TTL cleanup or a nontransactional fallback. Minimal deletion receipts are retained indefinitely and cannot erase themselves. Provider accounting still needs its accounting owner's policy; this operation cannot erase that ledger. Test holds, policy drift, foreign rows, rollback, lost commits, terminal-only actions and no-replay UI. Local fixtures are not live deletion or regulatory approval of a retention period.\n\n### Verified Interface\n\nThese captures use the real Axis renderer with synthetic owner responses, not live audit deletion. Desktop review was checked at 1280x900, and mobile review and lost-response recovery at 390x844. No horizontal overflow was observed.\n\n![Independent audit deletion review](media:nodicsDocsImage_81767797d181627278c1adb5)\n\n![Mobile audit review](media:nodicsDocsImage_471cce946bd104a0d005cc84)\n\n![Original audit receipt recovery after a lost response](media:nodicsDocsImage_9f53acee42afea34112c81aa)\n\nBeginners should start with the administrator journey: reviewing metadata never deletes content. Business administrators decide which expired conversation is reviewed, while the operator qualifies storage and deployment before production. Developers preserve the canonical owner contracts when customizing labels or the typed renderer.\n\n## Ownership\n\nConversation owns reviewed retention and the private `retentionOperation` on its existing parent record. Generated services own persistence, nDatabase owns opaque transactions, MongoDB owns snapshot/majority/journal mechanics, and nDynamo owns committed configuration and its private revision fence. Axis is presentation only. Conversation-content retention reuses its parent receipt; independent audit retention uses the private generated receipt described above. No project/Kickoff implementation or background scheduler is added.\n\nOnly bound messages, events and turns of one expired CLOSED/ARCHIVED conversation are eligible. The parent tombstone, operation reason/actor/counts, transcript access receipts, action audit and provider accounting remain. Their retention is separate. This is not backup erasure, export cleanup or a legacy migration. Conversation closure is a separate non-destructive command in the same lifecycle panel.\n\n## Deployment Steps\n\n1. Deploy every Conversation writer with the transactional parent guard, including remote workers. Verify no legacy writer can bypass it. Local tests do not prove full writer coverage, and age is not proof that a worker has stopped.\n2. Qualify the actual transaction-capable MongoDB replica set or sharded topology. Enable `databaseTransactions.enabled` with `failClosed: true`. All participating schemas retain transaction eligibility and disabled cache/events. The adapter must advertise `journaledCommit` and commit with majority plus journal.\n3. Enable canonical nDynamo persistence and `runtimePropertyGovernance.persistence.requireDurableJournal: true`. Internal generated CAS uses majority/journal; readback uses primary/majority. Unqualified providers, broad updates and transaction mixing are rejected.\n4. Enable `runtimePropertyGovernance.readFence.enabled` and explicitly admit `readFence.owners.copilotConversation: true`. Verify a committed persisted property revision exists before preparing retention.\n5. Configure `copilot.conversation.storage: 'GENERATED_SERVICE'`, `writerFence.enabled: true` and `lifecycle.maximumBatch` between 1 and 100. Only after qualification separately enable `lifecycle.deletionEnabled` through normal configuration governance. Both writer/deletion gates ship disabled.\n6. Grant the original employee `copilot.activity.read`, `copilot.activity.lifecycle.read` and `copilot.activity.lifecycle.execute`. These grants do not confer transcript access or any cross-enterprise authority.\n7. On disposable data qualify two employees/enterprises, competing writers, hold activation, rollback, process termination, primary changes and lost responses. No automatic deployment, real deletion or topology qualification is performed by the source test suite.\n\n## Administrator Journey\n\n1. Select the enterprise, open Activity, then Retention review and Load review.\n2. Review age, hold and state; open Retention operation for the conversation. Backend capability admission controls whether the command panel is displayed.\n3. Enter a business reason and choose Review deletion. This creates no operation or fence. The digest binds actor, parent, timestamp, writer token and policy.\n4. Check the confirmation and choose Confirm retention operation. PREPARED evidence is durably persisted. No content is deleted and no policy fence is acquired yet.\n5. Confirm and choose Delete next batch. The owner acquires/inspects its pinned property fence, then removes at most one bounded page and advances the journal in one transaction. Empty pages advance through messages, events and turns.\n6. Confirm each next batch explicitly. There is no auto-run loop or retry. At PURGED the content stages are empty, the parent tombstone remains and the exact fence is released after durable readback. Never reuse the conversation identity.\n\n## Recovery and Holds\n\nAfter a timeout, choose Inspect original operation, not Begin or automatic retry. An empty inspect body retrieves the original actor's operation for that exact conversation, including after a lost begin response. It returns the stored revision and counts. A later explicit advance must use that revision; stale ones fail.\n\nStop and preserve remaining content records STOPPED transactionally and freezes the parent as RETENTION_STOPPED. Only after primary-majority terminal readback does it release the fence. It neither restores deleted content nor reopens writers. STOPPED cannot advance directly. A fresh review can reauthorize the remaining deletion without restoring content or reopening writers. If terminal acknowledgement or release is lost, inspect and explicitly repeat terminal stop/release with the observed revision. That operation cannot delete another page.\n\nInspection and stopping work with deletion disabled while durable persistence, writer fencing and original authority remain qualified. If those prerequisites are disabled, restore qualified deployment before recovery. Never delete a fence manually. Legacy/foreign child bindings abort the page; stop and escalate to the migration owner instead of guessing or silently omitting ownership.\n\n### Close an Active Conversation\n\n1. Select the conversation, enter a business reason and choose **Review conversation closure**.\n2. Read the closure notice. Closure stops new content writes; it does not cancel provider calls or business operations already running.\n3. Confirm the reviewed closure. The exact parent revision/write token must still match; concurrent conversation activity invalidates the review.\n4. The owner records CLOSED and the closure timestamp atomically. No content is deleted, and retention age starts at closure rather than an earlier activity.\n5. After an uncertain response, choose **Inspect original closure**, never submit Close again. Inspection requires the original actor and current independent lifecycle authority. Holds remain effective and closure does not remove them.\n\nClosure remains available with the deletion gate off, but requires qualified durable persistence and the transactional writer guard. Its private receipt is not exposed in ordinary conversation records.\n\n### Resume a Stopped Retention Operation\n\n1. Inspect the original retention operation and confirm STOPPED.\n2. Finish its exact stop/fence release if that acknowledgement was lost.\n3. Enter a fresh business reason and choose **Review remaining deletion**.\n4. The owner checks the current committed policy, active holds, original content cutoff, original actor, exact revision and absence of the prior fence.\n5. Confirm the new review. State becomes RESUMING; no content is removed by this command. The operation identity, stage and cumulative deletion counts remain.\n6. Explicitly delete the next batch. It acquires a fence for the newly reviewed policy and continues from retained progress, without repeating deleted pages.\n\nLost resumption acknowledgement requires original-operation inspection. A stale review, new hold, longer unelapsed retention period or missing historical cutoff rejects. At most twenty resumptions are retained; reaching that bound refuses another resumption rather than truncating prior audit. Old operation journals without an original cutoff remain inspectable/stoppable but cannot be resumed. Partner overrides may change presentation, not these identity, fence or recovery rules. Run retention execution, API routing and Axis retention tests for changes.\n\nThe tenant property fence blocks governed property changes, including new holds, while deletion is in progress. A proposed hold is not active until activation succeeds. For an urgent hold, stop retention, verify durable STOPPED and fence release, then activate the hold. The broad fence may delay unrelated settings; there is no TTL or implicit takeover that could admit deletion under stale holds.\n\n## Secured API\n\nAll are sensitive, no-store, employee access-token POSTs below `/activity/:conversationCode/retention/`. The route owns conversation identity; the body cannot override tenant, actor, enterprise, storage options or policy.\n\n| Suffix | Exact body | Effect |\n| --- | --- | --- |\n| preview | reason | Read-only digest and bounded batch size |\n| begin | reason, reviewDigest, confirmed: true | Persist reviewed intent once |\n| inspect | empty, or operationCode | Read original actor's evidence |\n| advance | operationCode, expectedRevision | One transactional bounded page |\n| stop | operationCode, expectedRevision | Freeze terminal state and release exact fence |\n| resume-preview | operationCode, expectedRevision, reason | Review remaining stopped work under current policy |\n| resume | operationCode, expectedRevision, reason, reviewDigest, confirmed | Record resumption without deleting content |\n| close-preview | reason | Review ACTIVE conversation closure |\n| close | reason, reviewDigest, confirmed | Close without deleting content or canceling external work |\n| close-inspect | empty | Read original actor's recorded closure |\n\nReceipts contain contractVersion 1, tenant/enterprise context, conversationCode, operationCode, revision, state, per-store counts and terminal completedAt. Private reason, policy, fence token and content are omitted. Stale/foreign/duplicate evidence, body extensions, contradictory acknowledgements and unqualified storage fail closed.\n\n```mermaid\nsequenceDiagram\n    actor Admin\n    participant Axis\n    participant Conversation\n    participant Dynamo as nDynamo\n    participant DB as nDatabase\n    Admin->>Axis: Review and confirm\n    Axis->>Conversation: Begin with current digest\n    Conversation->>DB: Durable parent CAS: PREPARED\n    Admin->>Axis: Confirm next batch\n    Axis->>Conversation: Advance original operation and revision\n    Conversation->>Dynamo: Acquire or inspect pinned policy fence\n    Conversation->>DB: Transaction: parent check, bounded delete, journal update\n    DB-->>Conversation: Commit or uncertain outcome\n    Conversation->>DB: Primary-majority parent readback\n    alt Terminal persisted state\n        Conversation->>Dynamo: Release exact fence\n    end\n    Conversation-->>Axis: Scoped receipt or unconfirmed error\n```\n\n## Customize and Extend Safely\n\nCustomize `lifecycle.executionPresentation` through layered configuration or wrap the existing typed Axis panel. Preserve grants, scope, explicit confirmation, no-replay recovery and late-response disposal. No arbitrary transport destinations, local authority, browser persistence, audit deletion, TTL or batch above 100.\n\nFor a project-specific label, extend the existing active project configuration module's `config/properties.js`; do not duplicate the framework service in a customer module or change Kickoff to own retention. For example:\n\n```javascript\n/** @file Project presentation and bounded batch override; does not enable deletion. */\nmodule.exports = {\n    copilot: {\n        conversation: {\n            lifecycle: {\n                maximumBatch: 25,\n                executionPresentation: { title: 'Review recorded conversation retention' }\n            }\n        }\n    }\n};\n```\n\nInherited presentation keys remain with the framework defaults. Apply through the project's established configuration lifecycle and inspect the effective settings. A label or smaller batch must not manufacture execution permission. Reject a batch above 100; after a failed change, keep the previously effective configuration and use the existing governance recovery, not browser overrides.\n\n## Verification\n\nRun Conversation retention/writer/persistence suites, API route tests, nDynamo fence tests, generated durable-pipeline and MongoDB transaction tests. Axis has `CopilotRetention.test.tsx`, lifecycle tests and synthetic `retention.visual.html`. These do not prove deployed failover, backup erasure, writer coverage or signed-in persistent-runtime acceptance. Independent audit retention remains outside this content-purge operation and must not be claimed as completed by it.\n\n## Common Mistakes\n\n| Mistake | Required response |\n| --- | --- |\n| Treating an expired row as deletion authorization | Obtain fresh review and independent execution admission |\n| Enabling only the deletion flag | Qualify every writer, persisted policy fence and transaction provider first |\n| Retrying after a timeout | Inspect the original operation and observed revision |\n| Assuming a submitted hold is active | Confirm activation; stop in-progress retention before activating a new hold |\n| Deleting private audit or fence records manually | Preserve evidence and recover through the owning service |\n| Treating a stopped record as an active session | Keep it frozen; never recreate its identity |\n\n## Axis Capture Evidence\n\nThese are real Axis renderer captures from the isolated synthetic fixture at `/test/assistant/retention.visual.html`, taken 2026-10-03 at 1280 x 1000 and 390 x 844. They contain fictional records and no real credentials or customer content. The walkthrough verified explicit review, confirmation, one batch, inspection and frozen stop, with no horizontal overflow or browser errors. They are renderer evidence, not signed-in persistence or destructive acceptance.\n\n![Desktop retention review with separate confirmation](media:nodicsDocsImage_35b2bc35b6cf4b00f051d8aa)\n\n![Mobile retention review with wrapped controls](media:nodicsDocsImage_0c47086aa063e3aad0fe7da2)\n\n## Source and Publication State\n\nFunctional owner: `nodics.copilot`; technical owner: `copilotConversation`. The service, private schemas, configuration and owner tests are under `nodics.copilot/modules/copilotConversation`. Secured API mapping belongs to `copilotApi`; orchestration belongs to `copilotCore`. Axis's typed client and panel live under its existing `src/assistant` boundary. nDynamo and nDatabase remain the only policy/persistence coordination owners.\n\nThis page is maintained as CMS data in the framework content pack. Validating a release does not import it into Platform, activate documentation navigation or publish it to a customer. Use the existing governed content-pack release/import process and verify the rendered page in the target environment.\n",
      "previous": {
        "title": "Copilot Knowledge Progress and Recovery",
        "route": "/docs/framework/copilot/knowledge-generation-recovery"
      },
      "next": {
        "title": "Circa Collection-Centre Record Reference",
        "route": "/docs/framework/accelerators/circa/collection-reference"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotConversation",
        "owner": "copilotConversation",
        "sourcePath": "data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotConversationDocumentationComponentData.js",
        "wordCount": 2527,
        "checksum": "a53ee261a686cf7acbd5106b0577d4870e4f6b91772119aa8767bf8549dd3ade"
      },
      "slug": "copilot-retention-lifecycle",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "cron.operations",
          "owner": "cronjob"
        },
        {
          "documentId": "tooling.ai-developer-enablement",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  }
};
