/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageengagementcustomerfeedback",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageengagementCustomerFeedback",
    "title": "Customer feedback, complaints, and closed-loop action",
    "summary": "Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization.",
    "searchText": "Customer feedback, complaints, and closed-loop action Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization. customer-engagement-and-feedback feedback-and-complaints customer-feedback-complaints-and-closed-loop-action",
    "keywords": [
      "customer-engagement-and-feedback",
      "feedback-and-complaints",
      "customer-feedback-complaints-and-closed-loop-action"
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
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataengagementcustomerfeedback",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataengagementCustomerFeedback",
    "title": "Customer feedback, complaints, and closed-loop action",
    "summary": "Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization.",
    "searchText": "Customer feedback, complaints, and closed-loop action Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization. # Customer feedback, complaints, and closed-loop action\n\nCustomer Feedback helps a business collect a suggestion, complaint, experience report, praise, or survey response and turn it into a traceable outcome. This beginner-friendly guide follows the complete journey from submission through triage, assignment, follow-up, resolution, confirmation, insight, and recovery.\n\nThink of feedback as a case folder with two sides. One side preserves what the customer actually submitted. The other records what the business inferred and did: category, priority, Process task, contact attempts, downstream handoffs, resolution, and optional insights. The inferred side may be corrected; it never overwrites the source side.\n\nThe capability is owned by `nodics.engagement/customerFeedback`. Shared submission, consent, assignment, SLA, relation, form-definition, Process-reference, and integration-reference contracts remain in `engagementCore`. HTTP routes and safe DTOs belong to `engagementApi`. Axis renders the backend-published workspaces and actions.\n\n## Who uses it and why\n\n| Reader | Primary outcome |\n| --- | --- |\n| Customer | Submit feedback, follow its progress, provide more information, and confirm or dispute resolution. |\n| Business user | Triage, classify, assign, contact, escalate, resolve, and reopen feedback. |\n| Administrator | Configure types, forms, queues, SLAs, permissions, channels, attempts, and insight policy. |\n| Developer | Extend targets, policies, handoff adapters, rules, and project behavior safely. |\n| Operator or security reviewer | Monitor backlog, SLA, provider failures, retries, tenant boundaries, privacy, and deletion propagation. |\n\nThe business value is a measurable closed loop. The organization can see not only how many responses arrived, but whether customers were contacted, whether the issue was resolved and accepted, where responsibility moved, and which themes are supported by source evidence.\n\n## End-to-end journey\n\n```mermaid\nflowchart LR\n  Submit[\"Customer submits feedback\"] --> Source[\"Protected source record\"]\n  Source --> Classify[\"Rule, operator, or advisory AI classification\"]\n  Classify --> Assign[\"Queue, owner, SLA and Process reference\"]\n  Assign --> Work[\"Request information, act, or escalate\"]\n  Work --> Handoff[\"Downstream owner intent/reference\"]\n  Work --> FollowUp[\"Same or preferred-channel follow-up\"]\n  FollowUp --> Resolve[\"Versioned resolution\"]\n  Resolve --> Confirm{\"Customer confirms?\"}\n  Confirm -->|Yes| Close[\"Closed and accepted\"]\n  Confirm -->|No| Reopen[\"Reopened with audit evidence\"]\n  Source --> Insight[\"Traceable topic, cluster, trend, anomaly, or summary\"]\n  Insight --> Human[\"Accept, correct, reject, or delete\"]\n```\n\n## Customer journey\n\n1. Open the project’s feedback or survey form. The declarative form definition comes from Engagement Core and must be accessible, versioned, and server-validated.\n2. Choose a type and optionally a target, desired outcome, structured answers, scores, preferred follow-up channel, and governed Media attachment references.\n3. Submit anonymously only when project policy permits it. An identified customer receives an owner-scoped record; the public acknowledgement exposes only safe reference, status, time, and correlation fields.\n4. When more information is requested, respond through the customer experience instead of sending secrets or private evidence through an untracked channel.\n5. Review the proposed resolution and confirm it when satisfactory. A rejected or incomplete outcome can be reopened according to policy.\n\nAn anonymous record cannot later be exposed as if it had an authenticated owner. A customer cannot read another customer’s record by changing a URL. Operators may view protected content only with explicit permission and tenant scope.\n\n## Axis business-user journey\n\nAxis exposes five backend-governed views:\n\n- Customer Feedback for the full operational queue and authorized lifecycle actions.\n- Complaints for a complaint-focused SLA and escalation view.\n- Feedback Follow-up for offered, attempted, contacted, resolved, accepted, no-response, failed, and suppressed evidence.\n- Feedback Surveys for Engagement-owned form definitions and immutable versions.\n- Feedback Insights for topics, clusters, trends, anomalies, summaries, confidence, model/policy versions, corrections, and deletion state.\n\nOpen Customer Experience → Customer Feedback, filter by status, priority, severity, queue, target, or due date, and inspect the protected detail. Choose only actions published by the backend. Every action includes the expected revision, so a stale browser cannot silently overwrite a newer decision.\n\nThe standard lifecycle is `RECEIVED → TRIAGED → ASSIGNED → IN_PROGRESS`. Work may wait for the customer or an internal owner, escalate, resolve, close after confirmation, and reopen. Invalid transitions fail with a stable domain error. Axis refreshes the authoritative query after an action; it does not maintain a browser-side case store.\n\n## Follow-up, resolution, and downstream handoff\n\nFollow-up uses the same or preferred channel, or an explicitly allowed email, SMS, phone, or in-app channel. Each attempt records a bounded status and provider reference. Attempt limits prevent endless automated contact, and Communication owns message rendering and delivery.\n\nA resolution is versioned with an outcome code, business-safe summary, resolver, time, confirmation evidence, and status. Reopening does not erase the previous resolution. If action belongs to Order, Fulfillment, Payment, Profile, Security, or another system, Feedback creates an idempotent handoff reference. The target module executes its own business action. Feedback must not issue refunds, replace products, or change identity records itself.\n\n## Classification and insights\n\nClassification may be supplied by a rule, operator, import, or governed AI adapter. It records category, topic, sentiment, priority, severity, confidence, policy/model reference, evidence, and correction lineage. Sentiment is advisory; it must not by itself reject, suppress, or deprioritize a complaint.\n\nInsights name every source feedback code. Low-confidence output is rejected by policy. A human may correct or reject a proposed value. When source feedback is deleted or anonymized under privacy policy, every derived insight that references it is marked deleted or rebuilt. If AI is unavailable, deterministic and manual operation remains available; no AI output directly contacts a customer or changes lifecycle state.\n\n## API and security boundaries\n\n`POST /public/feedback` accepts a bounded submission and returns a minimal acknowledgement. Authenticated customers use `/customer/feedback` for owner-scoped records. Operators use `/operator/feedback`, lifecycle actions, classification, and insight endpoints with explicit permissions. Generic generated schema routers remain disabled.\n\nTenant context is resolved by the backend, never trusted from a public body. Public DTOs omit message text, attachments, identity, internal evidence, handoff details, and model prompts. Media binaries remain Media-owned. Process tasks remain Process-owned. Provider secrets and message content never belong in funnel or integration events.\n\n## Configure and extend safely\n\nProjects can configure allowed feedback types, anonymous policy, attachment limits, default priority, lifecycle transitions, follow-up channels and attempt limits, insight confidence, and retention policy through a later layer. A project may replace routing, classification, SLA, handoff, or insight services in a later-loaded module while preserving tenant isolation, source traceability, corrections, deletion propagation, and deterministic fallback.\n\nDo not copy framework services, edit generated CRUD files, create a second forms engine, put downstream business actions in Feedback, or calculate lifecycle state in Axis. Prove the default and project override with focused tests.\n\n## Operations and recovery\n\nMonitor received volume, untriaged age, SLA breaches, assignment load, waiting states, follow-up attempts, resolution and acceptance rates, reopen rate, handoff retries/dead letters, insight rejection/correction, and deletion-propagation lag. Logs and metrics use codes and correlation IDs without customer text.\n\n| Failure | Safe recovery |\n| --- | --- |\n| Process unavailable | Preserve feedback and pending reference; retry Process handoff idempotently. |\n| Communication unavailable | Keep follow-up evidence pending/failed; retry delivery without duplicating the case. |\n| Downstream owner times out | Retain intent and idempotency key, reconcile external state, then retry or dead-letter. |\n| Stale Axis action | Reject revision conflict, reload current state, and let the user reassess. |\n| AI unavailable or low confidence | Use deterministic/manual classification; do not block safe operations. |\n| Source deletion | Propagate deletion/anonymization to insights, exports, indexes, and provider references under policy. |\n\n## Common mistakes\n\n- Replacing the customer’s words with a summary or sentiment label.\n- Treating every low score as a complaint or every positive score as closed.\n- Letting Feedback initiate an Order refund or other domain-owned action.\n- Sending private content in analytics, communication, or integration events.\n- Allowing Axis to invent transitions, queues, survey schemas, or permissions.\n- Publishing AI insight without confidence, model/prompt version, source codes, and human correction.\n- Closing a case because a provider accepted a message rather than because the business outcome was completed.\n\n## Verification\n\nProve successful identified and anonymous intake, invalid type, oversized attachments, cross-owner and cross-tenant denial, stale revision, invalid transition, complaint escalation, waiting/resume, resolution/confirmation/reopen, follow-up limit, Process/provider outage and retry, source-traceable insight, human correction, AI fallback, and deletion propagation. Run generated schema contracts, Engagement API security/route tests, the Axis Customer Engagement regression, documentation generation/validation, and the effective engagement-server build.\n\nNext: Unified Engagement Operations explains rebuildable cross-domain queues and dashboards without creating a new writable business authority.\n\n## Customization and extension\n\nCustomer projects can extend Feedback with additional classifications, survey schemas, SLA policies, insight providers, response templates, and escalation rules. Those extensions must stay behind the Feedback and Engagement API boundaries, preserve tenant isolation, keep source text protected, and prove fallback behavior when Process, Communication, or an insight provider is unavailable.\n",
    "keywords": [
      "customer-engagement-and-feedback",
      "feedback-and-complaints",
      "customer-feedback-complaints-and-closed-loop-action",
      "Customer Engagement and Feedback",
      "Feedback and Complaints",
      "Customer feedback, complaints, and closed-loop action"
    ],
    "facets": {
      "section": "customer-engagement-and-feedback",
      "group": "customer-engagement-and-feedback",
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
      "maturityState": "operational"
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
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
