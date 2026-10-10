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
    "code": "nodicsDocsComponentengagementCustomerFeedback",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "engagement.customer-feedback",
      "title": "Customer feedback, complaints, and closed-loop action",
      "route": "/docs/framework/engagement-customer-feedback",
      "section": "customer-engagement-and-feedback",
      "sectionTitle": "Customer Engagement and Feedback",
      "group": "customer-engagement-and-feedback",
      "groupTitle": "Customer Engagement and Feedback",
      "parentId": "customer-engagement-and-feedback",
      "hierarchyPath": [
        "Customer Engagement and Feedback",
        "Customer feedback, complaints, and closed-loop action"
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
        "administrator",
        "implementation partner"
      ],
      "technicalAudience": [
        "architect",
        "developer",
        "operator",
        "qa engineer",
        "ai tool"
      ],
      "summary": "Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.5",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "engagement.unified-operations",
        "engagement.governed-automation"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "customer-engagement-and-feedback",
        "feedback-and-complaints",
        "customer-feedback-complaints-and-closed-loop-action"
      ],
      "topicKeywords": [
        "Customer Engagement and Feedback",
        "Feedback and Complaints",
        "Customer feedback, complaints, and closed-loop action"
      ],
      "headings": [
        {
          "text": "Who uses it and why",
          "anchor": "engagementCustomerFeedback-1-who-uses-it-and-why",
          "level": 2
        },
        {
          "text": "End-to-end journey",
          "anchor": "engagementCustomerFeedback-2-end-to-end-journey",
          "level": 2
        },
        {
          "text": "Customer journey",
          "anchor": "engagementCustomerFeedback-3-customer-journey",
          "level": 2
        },
        {
          "text": "Axis business-user journey",
          "anchor": "engagementCustomerFeedback-4-axis-business-user-journey",
          "level": 2
        },
        {
          "text": "Follow-up, resolution, and downstream handoff",
          "anchor": "engagementCustomerFeedback-5-follow-up-resolution-and-downstream-handoff",
          "level": 2
        },
        {
          "text": "Classification and insights",
          "anchor": "engagementCustomerFeedback-6-classification-and-insights",
          "level": 2
        },
        {
          "text": "API and security boundaries",
          "anchor": "engagementCustomerFeedback-7-api-and-security-boundaries",
          "level": 2
        },
        {
          "text": "Configure and extend safely",
          "anchor": "engagementCustomerFeedback-8-configure-and-extend-safely",
          "level": 2
        },
        {
          "text": "Operations and recovery",
          "anchor": "engagementCustomerFeedback-9-operations-and-recovery",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "engagementCustomerFeedback-10-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "engagementCustomerFeedback-11-verification",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "engagementCustomerFeedback-12-customization-and-extension",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Customer Feedback helps a business collect a suggestion, complaint, experience report, praise, or survey response and turn it into a traceable outcome. This beginner-friendly guide follows the complete journey from submission through triage, assignment, follow-up, resolution, confirmation, insight, and recovery."
        },
        {
          "kind": "paragraph",
          "text": "Think of feedback as a case folder with two sides. One side preserves what the customer actually submitted. The other records what the business inferred and did: category, priority, Process task, contact attempts, downstream handoffs, resolution, and optional insights. The inferred side may be corrected; it never overwrites the source side."
        },
        {
          "kind": "paragraph",
          "text": "The capability is owned by `nodics.engagement/customerFeedback`. Shared submission, consent, assignment, SLA, relation, form-definition, Process-reference, and integration-reference contracts remain in `engagementCore`. HTTP routes and safe DTOs belong to `engagementApi`. Axis renders the backend-published workspaces and actions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Who uses it and why",
          "anchor": "engagementCustomerFeedback-1-who-uses-it-and-why"
        },
        {
          "kind": "table",
          "headers": [
            "Reader",
            "Primary outcome"
          ],
          "rows": [
            [
              "Customer",
              "Submit feedback, follow its progress, provide more information, and confirm or dispute resolution."
            ],
            [
              "Business user",
              "Triage, classify, assign, contact, escalate, resolve, and reopen feedback."
            ],
            [
              "Administrator",
              "Configure types, forms, queues, SLAs, permissions, channels, attempts, and insight policy."
            ],
            [
              "Developer",
              "Extend targets, policies, handoff adapters, rules, and project behavior safely."
            ],
            [
              "Operator or security reviewer",
              "Monitor backlog, SLA, provider failures, retries, tenant boundaries, privacy, and deletion propagation."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The business value is a measurable closed loop. The organization can see not only how many responses arrived, but whether customers were contacted, whether the issue was resolved and accepted, where responsibility moved, and which themes are supported by source evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "End-to-end journey",
          "anchor": "engagementCustomerFeedback-2-end-to-end-journey"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Submit[\"Customer submits feedback\"] --> Source[\"Protected source record\"]\n  Source --> Classify[\"Rule, operator, or advisory AI classification\"]\n  Classify --> Assign[\"Queue, owner, SLA and Process reference\"]\n  Assign --> Work[\"Request information, act, or escalate\"]\n  Work --> Handoff[\"Downstream owner intent/reference\"]\n  Work --> FollowUp[\"Same or preferred-channel follow-up\"]\n  FollowUp --> Resolve[\"Versioned resolution\"]\n  Resolve --> Confirm{\"Customer confirms?\"}\n  Confirm -->|Yes| Close[\"Closed and accepted\"]\n  Confirm -->|No| Reopen[\"Reopened with audit evidence\"]\n  Source --> Insight[\"Traceable topic, cluster, trend, anomaly, or summary\"]\n  Insight --> Human[\"Accept, correct, reject, or delete\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customer journey",
          "anchor": "engagementCustomerFeedback-3-customer-journey"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open the project’s feedback or survey form. The declarative form definition comes from Engagement Core and must be accessible, versioned, and server-validated.",
            "Choose a type and optionally a target, desired outcome, structured answers, scores, preferred follow-up channel, and governed Media attachment references.",
            "Submit anonymously only when project policy permits it. An identified customer receives an owner-scoped record; the public acknowledgement exposes only safe reference, status, time, and correlation fields.",
            "When more information is requested, respond through the customer experience instead of sending secrets or private evidence through an untracked channel.",
            "Review the proposed resolution and confirm it when satisfactory. A rejected or incomplete outcome can be reopened according to policy."
          ]
        },
        {
          "kind": "paragraph",
          "text": "An anonymous record cannot later be exposed as if it had an authenticated owner. A customer cannot read another customer’s record by changing a URL. Operators may view protected content only with explicit permission and tenant scope."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Axis business-user journey",
          "anchor": "engagementCustomerFeedback-4-axis-business-user-journey"
        },
        {
          "kind": "paragraph",
          "text": "Axis exposes five backend-governed views:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Customer Feedback for the full operational queue and authorized lifecycle actions.",
            "Complaints for a complaint-focused SLA and escalation view.",
            "Feedback Follow-up for offered, attempted, contacted, resolved, accepted, no-response, failed, and suppressed evidence.",
            "Feedback Surveys for Engagement-owned form definitions and immutable versions.",
            "Feedback Insights for topics, clusters, trends, anomalies, summaries, confidence, model/policy versions, corrections, and deletion state."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Open Customer Experience → Customer Feedback, filter by status, priority, severity, queue, target, or due date, and inspect the protected detail. Choose only actions published by the backend. Every action includes the expected revision, so a stale browser cannot silently overwrite a newer decision."
        },
        {
          "kind": "paragraph",
          "text": "The standard lifecycle is `RECEIVED → TRIAGED → ASSIGNED → IN_PROGRESS`. Work may wait for the customer or an internal owner, escalate, resolve, close after confirmation, and reopen. Invalid transitions fail with a stable domain error. Axis refreshes the authoritative query after an action; it does not maintain a browser-side case store."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Follow-up, resolution, and downstream handoff",
          "anchor": "engagementCustomerFeedback-5-follow-up-resolution-and-downstream-handoff"
        },
        {
          "kind": "paragraph",
          "text": "Follow-up uses the same or preferred channel, or an explicitly allowed email, SMS, phone, or in-app channel. Each attempt records a bounded status and provider reference. Attempt limits prevent endless automated contact, and Communication owns message rendering and delivery."
        },
        {
          "kind": "paragraph",
          "text": "A resolution is versioned with an outcome code, business-safe summary, resolver, time, confirmation evidence, and status. Reopening does not erase the previous resolution. If action belongs to Order, Fulfillment, Payment, Profile, Security, or another system, Feedback creates an idempotent handoff reference. The target module executes its own business action. Feedback must not issue refunds, replace products, or change identity records itself."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Classification and insights",
          "anchor": "engagementCustomerFeedback-6-classification-and-insights"
        },
        {
          "kind": "paragraph",
          "text": "Classification may be supplied by a rule, operator, import, or governed AI adapter. It records category, topic, sentiment, priority, severity, confidence, policy/model reference, evidence, and correction lineage. Sentiment is advisory; it must not by itself reject, suppress, or deprioritize a complaint."
        },
        {
          "kind": "paragraph",
          "text": "Insights name every source feedback code. Low-confidence output is rejected by policy. A human may correct or reject a proposed value. When source feedback is deleted or anonymized under privacy policy, every derived insight that references it is marked deleted or rebuilt. If AI is unavailable, deterministic and manual operation remains available; no AI output directly contacts a customer or changes lifecycle state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API and security boundaries",
          "anchor": "engagementCustomerFeedback-7-api-and-security-boundaries"
        },
        {
          "kind": "paragraph",
          "text": "`POST /public/feedback` accepts a bounded submission and returns a minimal acknowledgement. Authenticated customers use `/customer/feedback` for owner-scoped records. Operators use `/operator/feedback`, lifecycle actions, classification, and insight endpoints with explicit permissions. Generic generated schema routers remain disabled."
        },
        {
          "kind": "paragraph",
          "text": "Tenant context is resolved by the backend, never trusted from a public body. Public DTOs omit message text, attachments, identity, internal evidence, handoff details, and model prompts. Media binaries remain Media-owned. Process tasks remain Process-owned. Provider secrets and message content never belong in funnel or integration events."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configure and extend safely",
          "anchor": "engagementCustomerFeedback-8-configure-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Projects can configure allowed feedback types, anonymous policy, attachment limits, default priority, lifecycle transitions, follow-up channels and attempt limits, insight confidence, and retention policy through a later layer. A project may replace routing, classification, SLA, handoff, or insight services in a later-loaded module while preserving tenant isolation, source traceability, corrections, deletion propagation, and deterministic fallback."
        },
        {
          "kind": "paragraph",
          "text": "Do not copy framework services, edit generated CRUD files, create a second forms engine, put downstream business actions in Feedback, or calculate lifecycle state in Axis. Prove the default and project override with focused tests."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and recovery",
          "anchor": "engagementCustomerFeedback-9-operations-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Monitor received volume, untriaged age, SLA breaches, assignment load, waiting states, follow-up attempts, resolution and acceptance rates, reopen rate, handoff retries/dead letters, insight rejection/correction, and deletion-propagation lag. Logs and metrics use codes and correlation IDs without customer text."
        },
        {
          "kind": "table",
          "headers": [
            "Failure",
            "Safe recovery"
          ],
          "rows": [
            [
              "Process unavailable",
              "Preserve feedback and pending reference; retry Process handoff idempotently."
            ],
            [
              "Communication unavailable",
              "Keep follow-up evidence pending/failed; retry delivery without duplicating the case."
            ],
            [
              "Downstream owner times out",
              "Retain intent and idempotency key, reconcile external state, then retry or dead-letter."
            ],
            [
              "Stale Axis action",
              "Reject revision conflict, reload current state, and let the user reassess."
            ],
            [
              "AI unavailable or low confidence",
              "Use deterministic/manual classification; do not block safe operations."
            ],
            [
              "Source deletion",
              "Propagate deletion/anonymization to insights, exports, indexes, and provider references under policy."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "engagementCustomerFeedback-10-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Replacing the customer’s words with a summary or sentiment label.",
            "Treating every low score as a complaint or every positive score as closed.",
            "Letting Feedback initiate an Order refund or other domain-owned action.",
            "Sending private content in analytics, communication, or integration events.",
            "Allowing Axis to invent transitions, queues, survey schemas, or permissions.",
            "Publishing AI insight without confidence, model/prompt version, source codes, and human correction.",
            "Closing a case because a provider accepted a message rather than because the business outcome was completed."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "engagementCustomerFeedback-11-verification"
        },
        {
          "kind": "paragraph",
          "text": "Prove successful identified and anonymous intake, invalid type, oversized attachments, cross-owner and cross-tenant denial, stale revision, invalid transition, complaint escalation, waiting/resume, resolution/confirmation/reopen, follow-up limit, Process/provider outage and retry, source-traceable insight, human correction, AI fallback, and deletion propagation. Run generated schema contracts, Engagement API security/route tests, the Axis Customer Engagement regression, documentation generation/validation, and the effective engagement-server build."
        },
        {
          "kind": "paragraph",
          "text": "Next: Unified Engagement Operations explains rebuildable cross-domain queues and dashboards without creating a new writable business authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "engagementCustomerFeedback-12-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Customer projects can extend Feedback with additional classifications, survey schemas, SLA policies, insight providers, response templates, and escalation rules. Those extensions must stay behind the Feedback and Engagement API boundaries, preserve tenant isolation, keep source text protected, and prove fallback behavior when Process, Communication, or an insight provider is unavailable."
        }
      ],
      "searchText": "Customer feedback, complaints, and closed-loop action Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization. # Customer feedback, complaints, and closed-loop action\n\nCustomer Feedback helps a business collect a suggestion, complaint, experience report, praise, or survey response and turn it into a traceable outcome. This beginner-friendly guide follows the complete journey from submission through triage, assignment, follow-up, resolution, confirmation, insight, and recovery.\n\nThink of feedback as a case folder with two sides. One side preserves what the customer actually submitted. The other records what the business inferred and did: category, priority, Process task, contact attempts, downstream handoffs, resolution, and optional insights. The inferred side may be corrected; it never overwrites the source side.\n\nThe capability is owned by `nodics.engagement/customerFeedback`. Shared submission, consent, assignment, SLA, relation, form-definition, Process-reference, and integration-reference contracts remain in `engagementCore`. HTTP routes and safe DTOs belong to `engagementApi`. Axis renders the backend-published workspaces and actions.\n\n## Who uses it and why\n\n| Reader | Primary outcome |\n| --- | --- |\n| Customer | Submit feedback, follow its progress, provide more information, and confirm or dispute resolution. |\n| Business user | Triage, classify, assign, contact, escalate, resolve, and reopen feedback. |\n| Administrator | Configure types, forms, queues, SLAs, permissions, channels, attempts, and insight policy. |\n| Developer | Extend targets, policies, handoff adapters, rules, and project behavior safely. |\n| Operator or security reviewer | Monitor backlog, SLA, provider failures, retries, tenant boundaries, privacy, and deletion propagation. |\n\nThe business value is a measurable closed loop. The organization can see not only how many responses arrived, but whether customers were contacted, whether the issue was resolved and accepted, where responsibility moved, and which themes are supported by source evidence.\n\n## End-to-end journey\n\n```mermaid\nflowchart LR\n  Submit[\"Customer submits feedback\"] --> Source[\"Protected source record\"]\n  Source --> Classify[\"Rule, operator, or advisory AI classification\"]\n  Classify --> Assign[\"Queue, owner, SLA and Process reference\"]\n  Assign --> Work[\"Request information, act, or escalate\"]\n  Work --> Handoff[\"Downstream owner intent/reference\"]\n  Work --> FollowUp[\"Same or preferred-channel follow-up\"]\n  FollowUp --> Resolve[\"Versioned resolution\"]\n  Resolve --> Confirm{\"Customer confirms?\"}\n  Confirm -->|Yes| Close[\"Closed and accepted\"]\n  Confirm -->|No| Reopen[\"Reopened with audit evidence\"]\n  Source --> Insight[\"Traceable topic, cluster, trend, anomaly, or summary\"]\n  Insight --> Human[\"Accept, correct, reject, or delete\"]\n```\n\n## Customer journey\n\n1. Open the project’s feedback or survey form. The declarative form definition comes from Engagement Core and must be accessible, versioned, and server-validated.\n2. Choose a type and optionally a target, desired outcome, structured answers, scores, preferred follow-up channel, and governed Media attachment references.\n3. Submit anonymously only when project policy permits it. An identified customer receives an owner-scoped record; the public acknowledgement exposes only safe reference, status, time, and correlation fields.\n4. When more information is requested, respond through the customer experience instead of sending secrets or private evidence through an untracked channel.\n5. Review the proposed resolution and confirm it when satisfactory. A rejected or incomplete outcome can be reopened according to policy.\n\nAn anonymous record cannot later be exposed as if it had an authenticated owner. A customer cannot read another customer’s record by changing a URL. Operators may view protected content only with explicit permission and tenant scope.\n\n## Axis business-user journey\n\nAxis exposes five backend-governed views:\n\n- Customer Feedback for the full operational queue and authorized lifecycle actions.\n- Complaints for a complaint-focused SLA and escalation view.\n- Feedback Follow-up for offered, attempted, contacted, resolved, accepted, no-response, failed, and suppressed evidence.\n- Feedback Surveys for Engagement-owned form definitions and immutable versions.\n- Feedback Insights for topics, clusters, trends, anomalies, summaries, confidence, model/policy versions, corrections, and deletion state.\n\nOpen Customer Experience → Customer Feedback, filter by status, priority, severity, queue, target, or due date, and inspect the protected detail. Choose only actions published by the backend. Every action includes the expected revision, so a stale browser cannot silently overwrite a newer decision.\n\nThe standard lifecycle is `RECEIVED → TRIAGED → ASSIGNED → IN_PROGRESS`. Work may wait for the customer or an internal owner, escalate, resolve, close after confirmation, and reopen. Invalid transitions fail with a stable domain error. Axis refreshes the authoritative query after an action; it does not maintain a browser-side case store.\n\n## Follow-up, resolution, and downstream handoff\n\nFollow-up uses the same or preferred channel, or an explicitly allowed email, SMS, phone, or in-app channel. Each attempt records a bounded status and provider reference. Attempt limits prevent endless automated contact, and Communication owns message rendering and delivery.\n\nA resolution is versioned with an outcome code, business-safe summary, resolver, time, confirmation evidence, and status. Reopening does not erase the previous resolution. If action belongs to Order, Fulfillment, Payment, Profile, Security, or another system, Feedback creates an idempotent handoff reference. The target module executes its own business action. Feedback must not issue refunds, replace products, or change identity records itself.\n\n## Classification and insights\n\nClassification may be supplied by a rule, operator, import, or governed AI adapter. It records category, topic, sentiment, priority, severity, confidence, policy/model reference, evidence, and correction lineage. Sentiment is advisory; it must not by itself reject, suppress, or deprioritize a complaint.\n\nInsights name every source feedback code. Low-confidence output is rejected by policy. A human may correct or reject a proposed value. When source feedback is deleted or anonymized under privacy policy, every derived insight that references it is marked deleted or rebuilt. If AI is unavailable, deterministic and manual operation remains available; no AI output directly contacts a customer or changes lifecycle state.\n\n## API and security boundaries\n\n`POST /public/feedback` accepts a bounded submission and returns a minimal acknowledgement. Authenticated customers use `/customer/feedback` for owner-scoped records. Operators use `/operator/feedback`, lifecycle actions, classification, and insight endpoints with explicit permissions. Generic generated schema routers remain disabled.\n\nTenant context is resolved by the backend, never trusted from a public body. Public DTOs omit message text, attachments, identity, internal evidence, handoff details, and model prompts. Media binaries remain Media-owned. Process tasks remain Process-owned. Provider secrets and message content never belong in funnel or integration events.\n\n## Configure and extend safely\n\nProjects can configure allowed feedback types, anonymous policy, attachment limits, default priority, lifecycle transitions, follow-up channels and attempt limits, insight confidence, and retention policy through a later layer. A project may replace routing, classification, SLA, handoff, or insight services in a later-loaded module while preserving tenant isolation, source traceability, corrections, deletion propagation, and deterministic fallback.\n\nDo not copy framework services, edit generated CRUD files, create a second forms engine, put downstream business actions in Feedback, or calculate lifecycle state in Axis. Prove the default and project override with focused tests.\n\n## Operations and recovery\n\nMonitor received volume, untriaged age, SLA breaches, assignment load, waiting states, follow-up attempts, resolution and acceptance rates, reopen rate, handoff retries/dead letters, insight rejection/correction, and deletion-propagation lag. Logs and metrics use codes and correlation IDs without customer text.\n\n| Failure | Safe recovery |\n| --- | --- |\n| Process unavailable | Preserve feedback and pending reference; retry Process handoff idempotently. |\n| Communication unavailable | Keep follow-up evidence pending/failed; retry delivery without duplicating the case. |\n| Downstream owner times out | Retain intent and idempotency key, reconcile external state, then retry or dead-letter. |\n| Stale Axis action | Reject revision conflict, reload current state, and let the user reassess. |\n| AI unavailable or low confidence | Use deterministic/manual classification; do not block safe operations. |\n| Source deletion | Propagate deletion/anonymization to insights, exports, indexes, and provider references under policy. |\n\n## Common mistakes\n\n- Replacing the customer’s words with a summary or sentiment label.\n- Treating every low score as a complaint or every positive score as closed.\n- Letting Feedback initiate an Order refund or other domain-owned action.\n- Sending private content in analytics, communication, or integration events.\n- Allowing Axis to invent transitions, queues, survey schemas, or permissions.\n- Publishing AI insight without confidence, model/prompt version, source codes, and human correction.\n- Closing a case because a provider accepted a message rather than because the business outcome was completed.\n\n## Verification\n\nProve successful identified and anonymous intake, invalid type, oversized attachments, cross-owner and cross-tenant denial, stale revision, invalid transition, complaint escalation, waiting/resume, resolution/confirmation/reopen, follow-up limit, Process/provider outage and retry, source-traceable insight, human correction, AI fallback, and deletion propagation. Run generated schema contracts, Engagement API security/route tests, the Axis Customer Engagement regression, documentation generation/validation, and the effective engagement-server build.\n\nNext: Unified Engagement Operations explains rebuildable cross-domain queues and dashboards without creating a new writable business authority.\n\n## Customization and extension\n\nCustomer projects can extend Feedback with additional classifications, survey schemas, SLA policies, insight providers, response templates, and escalation rules. Those extensions must stay behind the Feedback and Engagement API boundaries, preserve tenant isolation, keep source text protected, and prove fallback behavior when Process, Communication, or an insight provider is unavailable.\n",
      "previous": {
        "title": "Review Aggregation and Recovery",
        "route": "/docs/framework/engagement-review-aggregation-recovery"
      },
      "next": {
        "title": "Unified engagement operations",
        "route": "/docs/framework/engagement-unified-operations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.engagement",
        "technicalModule": "customerFeedback",
        "owner": "customerFeedback",
        "sourcePath": "data/docs-v001/records/documentation/customerFeedbackDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/customerFeedbackDocumentationComponentData.js",
        "wordCount": 1388,
        "checksum": "9312e0e15b3cd8a59c80db2e9a6f7f68a4dffbb704dd9c1a16ac3672f2c8060d"
      },
      "slug": "engagement-customer-feedback",
      "locale": "en",
      "navigationGroup": "Feedback and Complaints",
      "navigationGroupCode": "feedback-and-complaints",
      "navigationGroupOrder": 20,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "engagement.unified-operations",
          "owner": "engagementCore"
        },
        {
          "documentId": "engagement.governed-automation",
          "owner": "engagementCore"
        }
      ]
    },
    "active": true
  }
};
