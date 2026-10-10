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
    "code": "nodicsDocsComponentcopilotOrderNotificationOperations",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.order-notification-operations",
      "title": "Order Notification Operations in Copilot",
      "route": "/docs/framework/copilot/order-notification-operations",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Order Notification Operations in Copilot"
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
      "summary": "Inspect bounded Digital Core order-notification evidence and explicitly retry eligible purchased or refunded delivery intents with revision-bound review and no automatic replay.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.original-business-results",
        "copilot.process-inspection",
        "copilot.governed-schema-actions"
      ],
      "sourceEvidence": [
        "../copilotCapability/src/service/defaultCopilotOrderNotificationInspectionService.js",
        "../copilotCapability/test/copilotOrderNotificationInspection.test.js",
        "src/service/defaultCopilotOrderNotificationActionService.js",
        "test/copilotOrderNotificationAction.test.js",
        "../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "architecture-diagram",
        "sequence-flow",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "order",
        "notification",
        "delivery",
        "purchased",
        "refunded",
        "retry",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Digital Commerce",
        "Business Operations"
      ],
      "headings": [
        {
          "text": "Business Purpose",
          "anchor": "copilotOrderNotificationOperations-1-business-purpose",
          "level": 2
        },
        {
          "text": "Audience and First Use",
          "anchor": "copilotOrderNotificationOperations-2-audience-and-first-use",
          "level": 2
        },
        {
          "text": "Ownership",
          "anchor": "copilotOrderNotificationOperations-3-ownership",
          "level": 2
        },
        {
          "text": "Required Configuration",
          "anchor": "copilotOrderNotificationOperations-4-required-configuration",
          "level": 2
        },
        {
          "text": "Employee Journey",
          "anchor": "copilotOrderNotificationOperations-5-employee-journey",
          "level": 2
        },
        {
          "text": "Inspect in conversation",
          "anchor": "copilotOrderNotificationOperations-6-inspect-in-conversation",
          "level": 3
        },
        {
          "text": "Prepare a retry",
          "anchor": "copilotOrderNotificationOperations-7-prepare-a-retry",
          "level": 3
        },
        {
          "text": "Approve and execute",
          "anchor": "copilotOrderNotificationOperations-8-approve-and-execute",
          "level": 3
        },
        {
          "text": "Uncertain Outcomes",
          "anchor": "copilotOrderNotificationOperations-9-uncertain-outcomes",
          "level": 2
        },
        {
          "text": "Rejections",
          "anchor": "copilotOrderNotificationOperations-10-rejections",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "copilotOrderNotificationOperations-11-common-mistakes",
          "level": 2
        },
        {
          "text": "Customization and Extension",
          "anchor": "copilotOrderNotificationOperations-12-customization-and-extension",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotOrderNotificationOperations-13-verification",
          "level": 2
        },
        {
          "text": "Troubleshooting",
          "anchor": "copilotOrderNotificationOperations-14-troubleshooting",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Business Purpose",
          "anchor": "copilotOrderNotificationOperations-1-business-purpose"
        },
        {
          "kind": "paragraph",
          "text": "Copilot can inspect the original notification evidence for one admitted order and prepare a retry of an existing frozen notification intent. Digital Core remains the sole owner of order/financial evidence and notification eligibility; Communication remains the delivery-intent owner. Copilot does not create a new recipient, template, channel, message, order, payment or refund."
        },
        {
          "kind": "table",
          "headers": [
            "Copilot operation",
            "Native owner call",
            "Effect"
          ],
          "rows": [
            [
              "`commerce.orderNotification.workspace`",
              "`GET /orders/:code/notifications/workspace`",
              "Read current bounded workspace and eligibility hints"
            ],
            [
              "`commerce.orderNotification.inspect`",
              "`POST /orders/:code/notifications/inspect`",
              "Read original frozen-intent observations for PURCHASED or REFUNDED"
            ],
            [
              "`commerce.orderNotification.retry`",
              "`POST /orders/:code/notifications/retry`",
              "Request retry of currently eligible original intents after review and approval"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "All three paths are disabled by default. Source availability never grants a user permission or proves a runtime is qualified."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and First Use",
          "anchor": "copilotOrderNotificationOperations-2-audience-and-first-use"
        },
        {
          "kind": "paragraph",
          "text": "Beginners should start with workspace inspection for one disposable order in a non-production enterprise. Confirm that the order reference, revision, event kind and bounded intent states match Digital Core before enabling retry. Do not begin with a customer delivery incident or assume that a delivered message proves the underlying purchase or refund."
        },
        {
          "kind": "paragraph",
          "text": "Business users inspect current notification evidence and approve only an exact order/event review. Operators configure qualified connections, exact scopes and native permissions, then monitor owner evidence without replaying uncertain work. Developers extend Digital Core owner contracts and fixed Copilot allowlists together; they do not add caller-selected endpoints or duplicate delivery state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ownership",
          "anchor": "copilotOrderNotificationOperations-3-ownership"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  U[Axis employee] --> C[Copilot Core]\n  C --> R[Capability read adapter]\n  C --> W[Workbench retry adapter]\n  R --> D[Digital Core notification owner]\n  W --> D\n  D --> O[Order and financial owners]\n  D --> M[Communication frozen intents]\n  D --> C\n  C --> U"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Axis renders conversation, review, approval and original-result inspection. It owns no business or delivery authority.",
            "Capability owns bounded read admission and output minimization.",
            "Workbench owns immutable retry review, confirmation binding, one dispatch attempt and no-replay recovery behavior.",
            "Digital Core owns current staff access, order/enterprise binding, revision, financial evidence, eligible events and fixed command contracts.",
            "Communication owns durable intent status and retry safety."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Required Configuration",
          "anchor": "copilotOrderNotificationOperations-4-required-configuration"
        },
        {
          "kind": "paragraph",
          "text": "Configure read and retry independently through normal Nodics layering. Do not edit generated defaults in a customer module."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "copilot: {\n  capability: {\n    orderNotificationInspection: {\n      enabled: true,\n      connectionName: \"commerceRuntime\",\n      targetAuthority: { runtimeRole: \"COMMERCE\" },\n      scopes: [{\n        tenant: \"master\",\n        enterprise: \"acme\",\n        environment: \"local\",\n        orderCodes: [\"ORDER-1001\"]\n      }]\n    }\n  },\n  workbench: {\n    orderNotificationTarget: {\n      enabled: true,\n      moduleName: \"digitalCore\",\n      connectionName: \"commerceRuntime\",\n      targetAuthority: { runtimeRole: \"COMMERCE\" }\n    },\n    receiptRecovery: { enabled: true }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Digital Core must separately enable and qualify notifications, the native order-notification workspace and API exposure. Copilot configuration cannot activate Digital Core or Communication."
        },
        {
          "kind": "paragraph",
          "text": "Each read scope binds one tenant, enterprise and environment to an exact bounded order-code list. Wildcards, duplicate scope matches, empty actor identity, a `default` connection, target URL overrides and foreign order codes fail closed."
        },
        {
          "kind": "paragraph",
          "text": "Reads require `copilot.data.query` and `commerce.digital.notification.read`. Retry preparation additionally requires `copilot.mutation.prepare` and `commerce.digital.notification.retry`. Final execution additionally requires `copilot.mutation.execute`. Digital Core repeats its current employee, tenant, enterprise, order, revision, financial and delivery-state checks for every native request."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee Journey",
          "anchor": "copilotOrderNotificationOperations-5-employee-journey"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Inspect in conversation",
          "anchor": "copilotOrderNotificationOperations-6-inspect-in-conversation"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"intent\": \"copilot.commerce.notification.inspect\",\n  \"operation\": \"commerce.orderNotification.workspace\",\n  \"code\": \"ORDER-1001\"\n}"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"intent\": \"copilot.commerce.notification.inspect\",\n  \"operation\": \"commerce.orderNotification.inspect\",\n  \"code\": \"ORDER-1001\",\n  \"kind\": \"PURCHASED\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "Copilot returns order reference, revision, financial-state label, event summaries and bounded EMAIL/SMS intent observations. Recipient addresses, templates, transport configuration and private financial records are excluded. A delivered message is not presented as payment, purchase or refund success."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Prepare a retry",
          "anchor": "copilotOrderNotificationOperations-7-prepare-a-retry"
        },
        {
          "kind": "paragraph",
          "text": "Use typed JSON or the bounded sentence form:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"commerce.orderNotification.retry\",\n  \"orderCode\": \"ORDER-1001\",\n  \"kind\": \"PURCHASED\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "`Retry PURCHASED notification for order ORDER-1001`"
        },
        {
          "kind": "paragraph",
          "text": "Preparation reads the fresh owner workspace and succeeds only when the event and native retry command are currently enabled. The stored plan binds the order code, event kind, current order revision, count/digest of eligible original intent identities, executing employee and fixed Commerce target."
        },
        {
          "kind": "paragraph",
          "text": "The review displays every business value needed for approval but does not display recipient addresses or allow the user/model to choose a template, channel or intent identifier."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Approve and execute",
          "anchor": "copilotOrderNotificationOperations-8-approve-and-execute"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant E as Employee\n  participant C as Copilot\n  participant D as Digital Core\n  E->>C: Prepare exact order and kind\n  C->>D: GET current workspace\n  D-->>C: Revision and eligible original intents\n  C-->>E: Immutable review\n  E->>C: Approve exact digest and revision\n  C->>D: GET fresh workspace\n  D-->>C: Fresh revision and eligibility\n  C->>D: POST retry with kind revision confirmed true\n  D-->>C: REQUESTED plus bounded original outcomes\n  C-->>E: Retry requested; delivery not yet proven"
        },
        {
          "kind": "paragraph",
          "text": "Execution refuses if target, permissions, revision, eligible intent count or intent digest changed after review. The native retry receives no arbitrary URL, recipient, channel, template, provider, amount or intent code. Transport retries are disabled (`maxAttempts: 1`)."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Uncertain Outcomes",
          "anchor": "copilotOrderNotificationOperations-9-uncertain-outcomes"
        },
        {
          "kind": "paragraph",
          "text": "If the native response is lost or malformed after dispatch, the Copilot action remains `OUTCOME_UNKNOWN`. Original-result inspection sends one fixed Digital Core inspection request for the same order and event. It reports current observed intent state but deliberately leaves the original retry unconfirmed: current delivery state cannot prove which actor or request caused a transition."
        },
        {
          "kind": "paragraph",
          "text": "Never execute again to discover the result. Never convert `RETRY_PENDING`, `DELIVERING` or `DELIVERED` into an original command receipt. The adapter does not replay or optimistically complete the action."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Rejections",
          "anchor": "copilotOrderNotificationOperations-10-rejections"
        },
        {
          "kind": "unordered-list",
          "items": [
            "unconfigured, disabled or ambiguous scope;",
            "foreign tenant, enterprise, environment or order;",
            "wildcard order lists or caller-supplied routing;",
            "missing Copilot or native read/retry grant;",
            "PURCHASED/REFUNDED values not explicitly supplied;",
            "unknown fields, path syntax or oversized input;",
            "disabled native workspace or ineligible event;",
            "terminal, absent, uncertain or unobserved intent set;",
            "revision, target, permission, intent count or digest drift;",
            "malformed/negative owner envelopes or foreign intent identities;",
            "recipient, template, channel, provider or intent-code input;",
            "automatic retry after transport uncertainty."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "copilotOrderNotificationOperations-11-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Enabling retry before the read workspace and employee authorization have been verified in the same tenant, enterprise and environment.",
            "Treating a notification state as proof that an order, payment or refund completed successfully.",
            "Adding recipient, template, channel or provider inputs to make the command more flexible; those values belong to the native owners and frozen intent.",
            "Retrying after a timeout instead of inspecting the original evidence and preserving an unconfirmed result.",
            "Using a default connection, wildcard order scope or service credential in place of the signed employee authority.",
            "Customizing Copilot without updating the Digital Core contract, tests, parser allowlist and operator documentation in the same change."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and Extension",
          "anchor": "copilotOrderNotificationOperations-12-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects may narrow scope lists, choose a qualified connection and override plain presentation labels. They must not add arbitrary routes, weaken exact-order selection, treat metadata as permission, copy Digital Core financial logic into Copilot, add a second notification journal, or turn inspection into retry."
        },
        {
          "kind": "paragraph",
          "text": "When adding an event kind, extend Digital Core first, then update the owner DTO, route contract, Copilot fixed allowlists, tests, capability descriptor, Axis parser and this guide together."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotOrderNotificationOperations-13-verification"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test \\\n  nodics.copilot/modules/copilotCapability/test/copilotOrderNotificationInspection.test.js \\\n  nodics.copilot/modules/copilotWorkbench/test/copilotOrderNotificationAction.test.js \\\n  nodics.copilot/modules/copilotCore/test/copilotIntentPlanning.test.js \\\n  nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceNotificationContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "Focused tests cover fixed routes, provider exclusion, minimized output, fresh eligibility, permission denial, malformed evidence, drift, exact retry body and inspection-only uncertainty. Digital Core tests remain authoritative for historical commit evidence, workspace qualification and native eligibility."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting",
          "anchor": "copilotOrderNotificationOperations-14-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Check"
          ],
          "rows": [
            [
              "No inspection choices",
              "Read adapter enabled, exact scope, both read permissions, qualified non-default connection"
            ],
            [
              "Retry not proposed",
              "Workbench target, planner, prepare/read/retry permissions and explicit order/kind"
            ],
            [
              "Review disappears before execution",
              "Employee, enterprise, target, order revision or eligible intent set changed"
            ],
            [
              "Outcome remains unknown",
              "Inspect original evidence; do not execute again"
            ],
            [
              "No eligible intent",
              "Digital Core event state, financial proof, observed original intent and terminal-state rules"
            ],
            [
              "Owner response rejected",
              "Contract version, order/revision, fixed kinds, intent identity and positive envelope"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "This implementation is source- and unit-verified. Reference-runtime activation, real Communication delivery and signed-in visual acceptance remain deployment qualification work and must not be inferred from these tests."
        }
      ],
      "searchText": "Order Notification Operations in Copilot Inspect bounded Digital Core order-notification evidence and explicitly retry eligible purchased or refunded delivery intents with revision-bound review and no automatic replay. # Order Notification Operations in Copilot\n\n## Business Purpose\n\nCopilot can inspect the original notification evidence for one admitted order and prepare a retry of an existing frozen notification intent. Digital Core remains the sole owner of order/financial evidence and notification eligibility; Communication remains the delivery-intent owner. Copilot does not create a new recipient, template, channel, message, order, payment or refund.\n\n| Copilot operation | Native owner call | Effect |\n| --- | --- | --- |\n| `commerce.orderNotification.workspace` | `GET /orders/:code/notifications/workspace` | Read current bounded workspace and eligibility hints |\n| `commerce.orderNotification.inspect` | `POST /orders/:code/notifications/inspect` | Read original frozen-intent observations for PURCHASED or REFUNDED |\n| `commerce.orderNotification.retry` | `POST /orders/:code/notifications/retry` | Request retry of currently eligible original intents after review and approval |\n\nAll three paths are disabled by default. Source availability never grants a user permission or proves a runtime is qualified.\n\n## Audience and First Use\n\nBeginners should start with workspace inspection for one disposable order in a non-production enterprise. Confirm that the order reference, revision, event kind and bounded intent states match Digital Core before enabling retry. Do not begin with a customer delivery incident or assume that a delivered message proves the underlying purchase or refund.\n\nBusiness users inspect current notification evidence and approve only an exact order/event review. Operators configure qualified connections, exact scopes and native permissions, then monitor owner evidence without replaying uncertain work. Developers extend Digital Core owner contracts and fixed Copilot allowlists together; they do not add caller-selected endpoints or duplicate delivery state.\n\n## Ownership\n\n```mermaid\nflowchart LR\n  U[Axis employee] --> C[Copilot Core]\n  C --> R[Capability read adapter]\n  C --> W[Workbench retry adapter]\n  R --> D[Digital Core notification owner]\n  W --> D\n  D --> O[Order and financial owners]\n  D --> M[Communication frozen intents]\n  D --> C\n  C --> U\n```\n\n- Axis renders conversation, review, approval and original-result inspection. It owns no business or delivery authority.\n- Capability owns bounded read admission and output minimization.\n- Workbench owns immutable retry review, confirmation binding, one dispatch attempt and no-replay recovery behavior.\n- Digital Core owns current staff access, order/enterprise binding, revision, financial evidence, eligible events and fixed command contracts.\n- Communication owns durable intent status and retry safety.\n\n## Required Configuration\n\nConfigure read and retry independently through normal Nodics layering. Do not edit generated defaults in a customer module.\n\n```js\ncopilot: {\n  capability: {\n    orderNotificationInspection: {\n      enabled: true,\n      connectionName: \"commerceRuntime\",\n      targetAuthority: { runtimeRole: \"COMMERCE\" },\n      scopes: [{\n        tenant: \"master\",\n        enterprise: \"acme\",\n        environment: \"local\",\n        orderCodes: [\"ORDER-1001\"]\n      }]\n    }\n  },\n  workbench: {\n    orderNotificationTarget: {\n      enabled: true,\n      moduleName: \"digitalCore\",\n      connectionName: \"commerceRuntime\",\n      targetAuthority: { runtimeRole: \"COMMERCE\" }\n    },\n    receiptRecovery: { enabled: true }\n  }\n}\n```\n\nDigital Core must separately enable and qualify notifications, the native order-notification workspace and API exposure. Copilot configuration cannot activate Digital Core or Communication.\n\nEach read scope binds one tenant, enterprise and environment to an exact bounded order-code list. Wildcards, duplicate scope matches, empty actor identity, a `default` connection, target URL overrides and foreign order codes fail closed.\n\nReads require `copilot.data.query` and `commerce.digital.notification.read`. Retry preparation additionally requires `copilot.mutation.prepare` and `commerce.digital.notification.retry`. Final execution additionally requires `copilot.mutation.execute`. Digital Core repeats its current employee, tenant, enterprise, order, revision, financial and delivery-state checks for every native request.\n\n## Employee Journey\n\n### Inspect in conversation\n\n```json\n{\n  \"intent\": \"copilot.commerce.notification.inspect\",\n  \"operation\": \"commerce.orderNotification.workspace\",\n  \"code\": \"ORDER-1001\"\n}\n```\n\n```json\n{\n  \"intent\": \"copilot.commerce.notification.inspect\",\n  \"operation\": \"commerce.orderNotification.inspect\",\n  \"code\": \"ORDER-1001\",\n  \"kind\": \"PURCHASED\"\n}\n```\n\nCopilot returns order reference, revision, financial-state label, event summaries and bounded EMAIL/SMS intent observations. Recipient addresses, templates, transport configuration and private financial records are excluded. A delivered message is not presented as payment, purchase or refund success.\n\n### Prepare a retry\n\nUse typed JSON or the bounded sentence form:\n\n```json\n{\n  \"operation\": \"commerce.orderNotification.retry\",\n  \"orderCode\": \"ORDER-1001\",\n  \"kind\": \"PURCHASED\"\n}\n```\n\n`Retry PURCHASED notification for order ORDER-1001`\n\nPreparation reads the fresh owner workspace and succeeds only when the event and native retry command are currently enabled. The stored plan binds the order code, event kind, current order revision, count/digest of eligible original intent identities, executing employee and fixed Commerce target.\n\nThe review displays every business value needed for approval but does not display recipient addresses or allow the user/model to choose a template, channel or intent identifier.\n\n### Approve and execute\n\n```mermaid\nsequenceDiagram\n  participant E as Employee\n  participant C as Copilot\n  participant D as Digital Core\n  E->>C: Prepare exact order and kind\n  C->>D: GET current workspace\n  D-->>C: Revision and eligible original intents\n  C-->>E: Immutable review\n  E->>C: Approve exact digest and revision\n  C->>D: GET fresh workspace\n  D-->>C: Fresh revision and eligibility\n  C->>D: POST retry with kind revision confirmed true\n  D-->>C: REQUESTED plus bounded original outcomes\n  C-->>E: Retry requested; delivery not yet proven\n```\n\nExecution refuses if target, permissions, revision, eligible intent count or intent digest changed after review. The native retry receives no arbitrary URL, recipient, channel, template, provider, amount or intent code. Transport retries are disabled (`maxAttempts: 1`).\n\n## Uncertain Outcomes\n\nIf the native response is lost or malformed after dispatch, the Copilot action remains `OUTCOME_UNKNOWN`. Original-result inspection sends one fixed Digital Core inspection request for the same order and event. It reports current observed intent state but deliberately leaves the original retry unconfirmed: current delivery state cannot prove which actor or request caused a transition.\n\nNever execute again to discover the result. Never convert `RETRY_PENDING`, `DELIVERING` or `DELIVERED` into an original command receipt. The adapter does not replay or optimistically complete the action.\n\n## Rejections\n\n- unconfigured, disabled or ambiguous scope;\n- foreign tenant, enterprise, environment or order;\n- wildcard order lists or caller-supplied routing;\n- missing Copilot or native read/retry grant;\n- PURCHASED/REFUNDED values not explicitly supplied;\n- unknown fields, path syntax or oversized input;\n- disabled native workspace or ineligible event;\n- terminal, absent, uncertain or unobserved intent set;\n- revision, target, permission, intent count or digest drift;\n- malformed/negative owner envelopes or foreign intent identities;\n- recipient, template, channel, provider or intent-code input;\n- automatic retry after transport uncertainty.\n\n## Common mistakes\n\n- Enabling retry before the read workspace and employee authorization have been verified in the same tenant, enterprise and environment.\n- Treating a notification state as proof that an order, payment or refund completed successfully.\n- Adding recipient, template, channel or provider inputs to make the command more flexible; those values belong to the native owners and frozen intent.\n- Retrying after a timeout instead of inspecting the original evidence and preserving an unconfirmed result.\n- Using a default connection, wildcard order scope or service credential in place of the signed employee authority.\n- Customizing Copilot without updating the Digital Core contract, tests, parser allowlist and operator documentation in the same change.\n\n## Customization and Extension\n\nProjects may narrow scope lists, choose a qualified connection and override plain presentation labels. They must not add arbitrary routes, weaken exact-order selection, treat metadata as permission, copy Digital Core financial logic into Copilot, add a second notification journal, or turn inspection into retry.\n\nWhen adding an event kind, extend Digital Core first, then update the owner DTO, route contract, Copilot fixed allowlists, tests, capability descriptor, Axis parser and this guide together.\n\n## Verification\n\n```bash\nnode --test \\\n  nodics.copilot/modules/copilotCapability/test/copilotOrderNotificationInspection.test.js \\\n  nodics.copilot/modules/copilotWorkbench/test/copilotOrderNotificationAction.test.js \\\n  nodics.copilot/modules/copilotCore/test/copilotIntentPlanning.test.js \\\n  nodics.commerce/modules/digitalCommerce/modules/digitalCore/test/digitalCommerceNotificationContract.test.js\n```\n\nFocused tests cover fixed routes, provider exclusion, minimized output, fresh eligibility, permission denial, malformed evidence, drift, exact retry body and inspection-only uncertainty. Digital Core tests remain authoritative for historical commit evidence, workspace qualification and native eligibility.\n\n## Troubleshooting\n\n| Symptom | Check |\n| --- | --- |\n| No inspection choices | Read adapter enabled, exact scope, both read permissions, qualified non-default connection |\n| Retry not proposed | Workbench target, planner, prepare/read/retry permissions and explicit order/kind |\n| Review disappears before execution | Employee, enterprise, target, order revision or eligible intent set changed |\n| Outcome remains unknown | Inspect original evidence; do not execute again |\n| No eligible intent | Digital Core event state, financial proof, observed original intent and terminal-state rules |\n| Owner response rejected | Contract version, order/revision, fixed kinds, intent identity and positive envelope |\n\nThis implementation is source- and unit-verified. Reference-runtime activation, real Communication delivery and signed-in visual acceptance remain deployment qualification work and must not be inferred from these tests.\n",
      "next": {
        "title": "Governed Selected-Schema Actions in Copilot",
        "route": "/docs/framework/copilot/governed-schema-actions"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1284,
        "checksum": "2edba9bf21a96b5883f689a85cf4667b10bc0094987afa979fb1ac4505e4a831"
      },
      "slug": "copilot-order-notification-operations",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 38,
      "references": [
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.process-inspection",
          "owner": "copilotCapability"
        },
        {
          "documentId": "copilot.governed-schema-actions",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentcopilotGovernedSchemaActions",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.governed-schema-actions",
      "title": "Governed Selected-Schema Actions in Copilot",
      "route": "/docs/framework/copilot/governed-schema-actions",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Governed Selected-Schema Actions in Copilot"
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
      "summary": "Configure and use single-record generated create, update, and delete through selected Knowledge collections, complete review, native permissions, and original receipts.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.collection-inspection",
        "copilot.original-business-results",
        "copilot.standalone-business-actions"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotSchemaActionService.js",
        "test/copilotSchemaActionRuntime.live.test.js",
        "../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaCommandReceiptService.js",
        "../../../nodics.foundation/modules/nController/src/controller/common.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "architecture-diagram",
        "sequence-flow",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "schema",
        "record",
        "create",
        "update",
        "delete",
        "collection",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Schema Workbench",
        "Business Operations"
      ],
      "headings": [
        {
          "text": "Purpose",
          "anchor": "copilotGovernedSchemaActions-1-purpose",
          "level": 2
        },
        {
          "text": "Audience and First Use",
          "anchor": "copilotGovernedSchemaActions-2-audience-and-first-use",
          "level": 2
        },
        {
          "text": "Supported Commands",
          "anchor": "copilotGovernedSchemaActions-3-supported-commands",
          "level": 2
        },
        {
          "text": "Administrator Setup",
          "anchor": "copilotGovernedSchemaActions-4-administrator-setup",
          "level": 2
        },
        {
          "text": "Permission Model",
          "anchor": "copilotGovernedSchemaActions-5-permission-model",
          "level": 2
        },
        {
          "text": "Business User Journey",
          "anchor": "copilotGovernedSchemaActions-6-business-user-journey",
          "level": 2
        },
        {
          "text": "Command Examples",
          "anchor": "copilotGovernedSchemaActions-7-command-examples",
          "level": 2
        },
        {
          "text": "Create",
          "anchor": "copilotGovernedSchemaActions-8-create",
          "level": 3
        },
        {
          "text": "Update",
          "anchor": "copilotGovernedSchemaActions-9-update",
          "level": 3
        },
        {
          "text": "Delete",
          "anchor": "copilotGovernedSchemaActions-10-delete",
          "level": 3
        },
        {
          "text": "Confirmation and Execution",
          "anchor": "copilotGovernedSchemaActions-11-confirmation-and-execution",
          "level": 2
        },
        {
          "text": "Original-Result Recovery",
          "anchor": "copilotGovernedSchemaActions-12-original-result-recovery",
          "level": 2
        },
        {
          "text": "Input and Review Boundaries",
          "anchor": "copilotGovernedSchemaActions-13-input-and-review-boundaries",
          "level": 2
        },
        {
          "text": "Deliberate Exclusions",
          "anchor": "copilotGovernedSchemaActions-14-deliberate-exclusions",
          "level": 2
        },
        {
          "text": "Troubleshooting",
          "anchor": "copilotGovernedSchemaActions-15-troubleshooting",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotGovernedSchemaActions-16-common-mistakes",
          "level": 2
        },
        {
          "text": "Customization Contract",
          "anchor": "copilotGovernedSchemaActions-17-customization-contract",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotGovernedSchemaActions-18-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose",
          "anchor": "copilotGovernedSchemaActions-1-purpose"
        },
        {
          "kind": "paragraph",
          "text": "Authorized employees can create, update, or delete one record through Copilot when an administrator has selected the database collection for Knowledge use and has separately allowlisted that exact source and schema for mutation. nDatabase remains the schema, authorization, validation, concurrency, persistence, and receipt owner. Copilot owns clarification, complete review, actor-bound approval, one dispatch attempt, and original-result recovery."
        },
        {
          "kind": "paragraph",
          "text": "This feature does not expose arbitrary APIs or every Axis form. It supports only native `GENERATED_CRUD` schemas with an active generated route, an editable `code` identity, current Staged authoring permission, and a private native command receipt. Bulk mutation and business-owned aggregate forms are excluded."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Audience and First Use",
          "anchor": "copilotGovernedSchemaActions-2-audience-and-first-use"
        },
        {
          "kind": "paragraph",
          "text": "Beginners should start with one disposable record in a non-production Staged runtime and stop at the review screen before learning execution. Business users work from the conversation and owning Axis workspace; they do not need database credentials or runtime URLs. Administrators and operators configure exact source, schema, permission, and receipt admission. Developers extend the native schema or add a fixed domain command without moving ownership into Copilot."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  User[Authorized employee] --> Conversation[Copilot conversation]\n  Conversation --> Select[Selected Knowledge source and collection]\n  Select --> Descriptor[Fresh native schema descriptor]\n  Descriptor --> Review[Complete field review]\n  Review --> Approve[Actor-bound approval]\n  Approve --> Claim[Durable one-time action claim]\n  Claim --> Native[Generated nDatabase route]\n  Native --> Journal[Private native receipt]\n  Native --> Record[Owned business record]\n  Journal --> Recover[Read-only original-result inspection]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Supported Commands",
          "anchor": "copilotGovernedSchemaActions-3-supported-commands"
        },
        {
          "kind": "table",
          "headers": [
            "Command",
            "Native route",
            "Result required"
          ],
          "rows": [
            [
              "`data.record.create`",
              "Descriptor-declared `PUT /{schema}`",
              "Exact created `code`"
            ],
            [
              "`data.record.update`",
              "Descriptor-declared `PATCH /{schema}`",
              "Exactly one affected record"
            ],
            [
              "`data.record.delete`",
              "Descriptor-declared `DELETE /{schema}`",
              "Exactly one affected record"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The route, method, API version, module, source policy digest, and descriptor are captured during review and rechecked before dispatch. A prompt cannot supply or replace any of them."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Setup",
          "anchor": "copilotGovernedSchemaActions-4-administrator-setup"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Register the database source through the existing Knowledge source registry.",
            "Assign it to an active Knowledge group and select the intended collection.",
            "Enable schema actions and allowlist each exact source/schema pair. Wildcards are rejected.",
            "Enable native command receipts for the schema-owning module and configure the schema's private `commandReceipt.journalSchema`.",
            "Grant Copilot preparation/execution permissions and the native schema write permission independently. Configuration never grants authority.",
            "Qualify the native runtime, private receipt journal, and original-result inspection before rollout."
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: {\n    workbench: {\n      schemaActions: {\n        enabled: true,\n        sources: {\n          \"product-data\": [\"approvedRecord\"]\n        },\n        timeoutMs: 30000\n      },\n      receiptRecovery: { enabled: true }\n    }\n  },\n  commandReceipts: {\n    enabled: true,\n    owners: { product: true }\n  }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The defaults are disabled. `timeoutMs` must be from 1,000 to 120,000 ms. Do not put framework capability into a customer Kickoff module. Use the normal layered Nodics configuration owner for the deployment."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Permission Model",
          "anchor": "copilotGovernedSchemaActions-5-permission-model"
        },
        {
          "kind": "paragraph",
          "text": "Preparation requires an authenticated employee plus `copilot.data.query`, `copilot.mutation.prepare`, and `system.schema.manage`. It also requires current source, group, tenant, enterprise, environment, collection, and native schema access. Execution additionally requires `copilot.mutation.execute`; original result inspection requires `copilot.mutation.reconcile`."
        },
        {
          "kind": "paragraph",
          "text": "nDatabase still checks the current generated write permission, schema access, ownership, authoring stage, field policy, references, and concurrency on every operation. Copilot permissions cannot override what the employee can do in Axis or through the native owner."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business User Journey",
          "anchor": "copilotGovernedSchemaActions-6-business-user-journey"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **AI & Copilot > Conversation** under the intended enterprise.",
            "Identify the exact Knowledge source and collection. Similar labels are not guessed, and an excluded collection remains unavailable.",
            "Ask for one create, update, or delete, or provide typed JSON.",
            "Resolve every clarification. Copilot does not invent required values, identity, revision, or fields.",
            "Review the operation, source, schema, executing employee, and every command leaf. Nothing has changed yet.",
            "Approve the current digest and revision, then execute once.",
            "Verify the result in the owning Axis workspace.",
            "If completion is uncertain, use **Inspect original business results**. Never create another action to retry an ambiguous write."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Command Examples",
          "anchor": "copilotGovernedSchemaActions-7-command-examples"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Create",
          "anchor": "copilotGovernedSchemaActions-8-create"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"data.record.create\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"model\": {\n    \"code\": \"RECORD-001\",\n    \"name\": \"Reviewed record\",\n    \"active\": true,\n    \"revision\": 1\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Every required editable field must be explicit. Descriptor defaults do not let Copilot silently omit a required business choice."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Update",
          "anchor": "copilotGovernedSchemaActions-9-update"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"data.record.update\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"identity\": { \"code\": \"RECORD-001\", \"revision\": 1 },\n  \"changes\": { \"name\": \"Reviewed record v2\" }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The update cannot change identity or concurrency fields. The native owner rejects a stale revision."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Delete",
          "anchor": "copilotGovernedSchemaActions-10-delete"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"data.record.delete\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"identity\": { \"code\": \"RECORD-001\", \"revision\": 1 }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Use the native delete-impact view before approval when dependencies matter. The generated owner still enforces reference restrictions and current revision."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Confirmation and Execution",
          "anchor": "copilotGovernedSchemaActions-11-confirmation-and-execution"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Axis\n  participant Core as Copilot Core\n  participant Workbench\n  participant Knowledge\n  participant Database as Native schema API\n  participant Receipt as Private receipt\n  Axis->>Core: Typed command or bounded prose\n  Core->>Workbench: Prepare as original employee\n  Workbench->>Knowledge: Authorize selected source and collection\n  Knowledge->>Database: Read fresh schema descriptors\n  Workbench-->>Axis: Complete immutable review\n  Axis->>Workbench: Approve exact digest and revision\n  Axis->>Workbench: Execute once\n  Workbench->>Workbench: Atomically claim action\n  Workbench->>Database: Fixed generated route and idempotency key\n  Database->>Receipt: Claim original command\n  Database->>Database: Existing generated create/update/delete\n  Database->>Receipt: Record acknowledged result\n  Database-->>Workbench: Native result\n  Workbench-->>Axis: Consumed or outcome unknown"
        },
        {
          "kind": "paragraph",
          "text": "The executor writes `RUNNING` before dispatch. Only the exact created code or one affected row proves completion. Transport rejection, malformed acknowledgement, or a lost persistence acknowledgement produces `OUTCOME_UNKNOWN`; it never causes an automatic second native call."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Original-Result Recovery",
          "anchor": "copilotGovernedSchemaActions-12-original-result-recovery"
        },
        {
          "kind": "paragraph",
          "text": "The native inspection route is:"
        },
        {
          "kind": "paragraph",
          "text": "`POST /nodics/{module}/v0/{schema}/commands/inspect`"
        },
        {
          "kind": "paragraph",
          "text": "Copilot supplies the original operation, exact input, and original idempotency key from the immutable action. Users cannot choose another module, schema, query, or receipt. Recovery rechecks actor, tenant, enterprise, source policy, collection selection, schema authorization, and native permission. A completed receipt can close the uncertain row; a missing or started receipt remains uncertain. Inspection never sends the write again."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Input and Review Boundaries",
          "anchor": "copilotGovernedSchemaActions-13-input-and-review-boundaries"
        },
        {
          "kind": "unordered-list",
          "items": [
            "One record per action; no bulk create, update, or delete.",
            "At most 80 submitted fields, 65,536 serialized bytes, depth eight, and 240 reviewed leaves.",
            "Review sections contain at most 20 leaves and are not silently truncated.",
            "Unknown, hidden, read-only, or sensitive fields are rejected.",
            "Credential-shaped keys such as password, token, secret, authorization, private key, credential, or API key are rejected at every nested level.",
            "Text leaves are at most 2,000 characters and cannot contain control characters.",
            "Only safe explicit codes identify source, schema, and record."
          ]
        },
        {
          "kind": "paragraph",
          "text": "These limits are a security boundary, not a target to increase for complex business setup. Add a domain-owned operation for aggregate workflows."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Deliberate Exclusions",
          "anchor": "copilotGovernedSchemaActions-14-deliberate-exclusions"
        },
        {
          "kind": "table",
          "headers": [
            "Exclusion",
            "Reason",
            "Extension path"
          ],
          "rows": [
            [
              "Wildcard sources or schemas",
              "Would create broad mutation authority",
              "Add reviewed exact entries"
            ],
            [
              "Bulk mutation",
              "Needs partial-failure and recovery semantics",
              "Add an owning batch/Workflow contract"
            ],
            [
              "Business form with `createOperation`",
              "Aggregate owner has stronger invariants",
              "Use that domain command"
            ],
            [
              "Online/read-only authoring",
              "Native lifecycle forbids generic writes",
              "Use Staged or owner publication flow"
            ],
            [
              "Arbitrary route/module/method",
              "Would bypass native capability ownership",
              "Add a fixed reviewed adapter"
            ],
            [
              "Service-token fallback",
              "Would replace the employee's actual authority",
              "Grant the employee through the owner"
            ],
            [
              "Automatic retry/rollback",
              "Completion may be uncertain",
              "Inspect original receipt; use owner reversal"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting",
          "anchor": "copilotGovernedSchemaActions-15-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning",
            "Action"
          ],
          "rows": [
            [
              "Configuration required",
              "Feature, source, or exact schema is not allowlisted",
              "Review deployment configuration"
            ],
            [
              "Permission required",
              "Copilot or native schema permission is missing",
              "Request the narrow missing grant"
            ],
            [
              "Collection unavailable",
              "Source/group/collection selection excludes it",
              "Review Knowledge assignment"
            ],
            [
              "Clarification required",
              "A material input is missing",
              "Send a complete corrected command"
            ],
            [
              "Descriptor changed",
              "Route, lifecycle, fields, or policy drifted",
              "Prepare and review a fresh action"
            ],
            [
              "Revision conflict",
              "Another write changed the record",
              "Read current state and start a new review"
            ],
            [
              "`OUTCOME_UNKNOWN`",
              "Native completion is not proven",
              "Inspect original results; do not retry"
            ],
            [
              "Receipt unavailable",
              "Native journal is disabled or unqualified",
              "Keep unresolved and fix owner setup"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotGovernedSchemaActions-16-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Selecting a collection for Knowledge reads does not authorize mutation; the exact schema action allowlist and current employee permissions are separate.",
            "A successful review is not a native write. Approval and execution are separate.",
            "`OUTCOME_UNKNOWN` is not failure evidence and must not be retried.",
            "A record visible after an uncertain command is not proof that this command created it; use the original receipt.",
            "Enabling command receipts does not make every generated schema eligible.",
            "Generic CRUD is not a substitute for enterprise onboarding, publication, redemption, workflow, or another business-owned aggregate operation.",
            "Production enablement still requires deployment-specific runtime, permission, journal, privacy, and persistence qualification."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization Contract",
          "anchor": "copilotGovernedSchemaActions-17-customization-contract"
        },
        {
          "kind": "paragraph",
          "text": "Add eligible fields and forms through the owning schema's effective Backoffice metadata. Add sources through the existing Knowledge registry and assignments. Add permissions through nAuth/Profile governance. Do not add a Copilot-owned schema registry, duplicate persistence service, generic endpoint executor, or project Kickoff implementation."
        },
        {
          "kind": "paragraph",
          "text": "For a business aggregate, implement and document a fixed domain command with its own native validation, idempotency, receipt identity, reversal policy, and live acceptance. Then register that bounded capability with Copilot; do not relabel it as generic CRUD."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotGovernedSchemaActions-18-verification"
        },
        {
          "kind": "paragraph",
          "text": "Local tests cover create, update, delete, source selection, exact allowlists, descriptor drift, sensitive fields, intent planning, confirmation rendering, receipt binding, and no-replay execution. Disposable real-runtime acceptance starts Profile, Copilot, Product, MongoDB, Redis, and Elasticsearch, then proves denied-reader behavior, create/update/delete, delete-impact, duplicate-execution refusal, private receipt inspection, and restart persistence."
        },
        {
          "kind": "paragraph",
          "text": "That acceptance qualifies the synthetic selected schema in the local composition. It does not claim that every generated schema, customer deployment, permission set, or business aggregate has been qualified."
        }
      ],
      "searchText": "Governed Selected-Schema Actions in Copilot Configure and use single-record generated create, update, and delete through selected Knowledge collections, complete review, native permissions, and original receipts. # Governed Selected-Schema Actions in Copilot\n\n## Purpose\n\nAuthorized employees can create, update, or delete one record through Copilot when an administrator has selected the database collection for Knowledge use and has separately allowlisted that exact source and schema for mutation. nDatabase remains the schema, authorization, validation, concurrency, persistence, and receipt owner. Copilot owns clarification, complete review, actor-bound approval, one dispatch attempt, and original-result recovery.\n\nThis feature does not expose arbitrary APIs or every Axis form. It supports only native `GENERATED_CRUD` schemas with an active generated route, an editable `code` identity, current Staged authoring permission, and a private native command receipt. Bulk mutation and business-owned aggregate forms are excluded.\n\n## Audience and First Use\n\nBeginners should start with one disposable record in a non-production Staged runtime and stop at the review screen before learning execution. Business users work from the conversation and owning Axis workspace; they do not need database credentials or runtime URLs. Administrators and operators configure exact source, schema, permission, and receipt admission. Developers extend the native schema or add a fixed domain command without moving ownership into Copilot.\n\n```mermaid\nflowchart LR\n  User[Authorized employee] --> Conversation[Copilot conversation]\n  Conversation --> Select[Selected Knowledge source and collection]\n  Select --> Descriptor[Fresh native schema descriptor]\n  Descriptor --> Review[Complete field review]\n  Review --> Approve[Actor-bound approval]\n  Approve --> Claim[Durable one-time action claim]\n  Claim --> Native[Generated nDatabase route]\n  Native --> Journal[Private native receipt]\n  Native --> Record[Owned business record]\n  Journal --> Recover[Read-only original-result inspection]\n```\n\n## Supported Commands\n\n| Command | Native route | Result required |\n| --- | --- | --- |\n| `data.record.create` | Descriptor-declared `PUT /{schema}` | Exact created `code` |\n| `data.record.update` | Descriptor-declared `PATCH /{schema}` | Exactly one affected record |\n| `data.record.delete` | Descriptor-declared `DELETE /{schema}` | Exactly one affected record |\n\nThe route, method, API version, module, source policy digest, and descriptor are captured during review and rechecked before dispatch. A prompt cannot supply or replace any of them.\n\n## Administrator Setup\n\n1. Register the database source through the existing Knowledge source registry.\n2. Assign it to an active Knowledge group and select the intended collection.\n3. Enable schema actions and allowlist each exact source/schema pair. Wildcards are rejected.\n4. Enable native command receipts for the schema-owning module and configure the schema's private `commandReceipt.journalSchema`.\n5. Grant Copilot preparation/execution permissions and the native schema write permission independently. Configuration never grants authority.\n6. Qualify the native runtime, private receipt journal, and original-result inspection before rollout.\n\n```js\nmodule.exports = {\n  copilot: {\n    workbench: {\n      schemaActions: {\n        enabled: true,\n        sources: {\n          \"product-data\": [\"approvedRecord\"]\n        },\n        timeoutMs: 30000\n      },\n      receiptRecovery: { enabled: true }\n    }\n  },\n  commandReceipts: {\n    enabled: true,\n    owners: { product: true }\n  }\n};\n```\n\nThe defaults are disabled. `timeoutMs` must be from 1,000 to 120,000 ms. Do not put framework capability into a customer Kickoff module. Use the normal layered Nodics configuration owner for the deployment.\n\n## Permission Model\n\nPreparation requires an authenticated employee plus `copilot.data.query`, `copilot.mutation.prepare`, and `system.schema.manage`. It also requires current source, group, tenant, enterprise, environment, collection, and native schema access. Execution additionally requires `copilot.mutation.execute`; original result inspection requires `copilot.mutation.reconcile`.\n\nnDatabase still checks the current generated write permission, schema access, ownership, authoring stage, field policy, references, and concurrency on every operation. Copilot permissions cannot override what the employee can do in Axis or through the native owner.\n\n## Business User Journey\n\n1. Open **AI & Copilot > Conversation** under the intended enterprise.\n2. Identify the exact Knowledge source and collection. Similar labels are not guessed, and an excluded collection remains unavailable.\n3. Ask for one create, update, or delete, or provide typed JSON.\n4. Resolve every clarification. Copilot does not invent required values, identity, revision, or fields.\n5. Review the operation, source, schema, executing employee, and every command leaf. Nothing has changed yet.\n6. Approve the current digest and revision, then execute once.\n7. Verify the result in the owning Axis workspace.\n8. If completion is uncertain, use **Inspect original business results**. Never create another action to retry an ambiguous write.\n\n## Command Examples\n\n### Create\n\n```json\n{\n  \"operation\": \"data.record.create\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"model\": {\n    \"code\": \"RECORD-001\",\n    \"name\": \"Reviewed record\",\n    \"active\": true,\n    \"revision\": 1\n  }\n}\n```\n\nEvery required editable field must be explicit. Descriptor defaults do not let Copilot silently omit a required business choice.\n\n### Update\n\n```json\n{\n  \"operation\": \"data.record.update\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"identity\": { \"code\": \"RECORD-001\", \"revision\": 1 },\n  \"changes\": { \"name\": \"Reviewed record v2\" }\n}\n```\n\nThe update cannot change identity or concurrency fields. The native owner rejects a stale revision.\n\n### Delete\n\n```json\n{\n  \"operation\": \"data.record.delete\",\n  \"sourceCode\": \"product-data\",\n  \"schemaName\": \"approvedRecord\",\n  \"identity\": { \"code\": \"RECORD-001\", \"revision\": 1 }\n}\n```\n\nUse the native delete-impact view before approval when dependencies matter. The generated owner still enforces reference restrictions and current revision.\n\n## Confirmation and Execution\n\n```mermaid\nsequenceDiagram\n  participant Axis\n  participant Core as Copilot Core\n  participant Workbench\n  participant Knowledge\n  participant Database as Native schema API\n  participant Receipt as Private receipt\n  Axis->>Core: Typed command or bounded prose\n  Core->>Workbench: Prepare as original employee\n  Workbench->>Knowledge: Authorize selected source and collection\n  Knowledge->>Database: Read fresh schema descriptors\n  Workbench-->>Axis: Complete immutable review\n  Axis->>Workbench: Approve exact digest and revision\n  Axis->>Workbench: Execute once\n  Workbench->>Workbench: Atomically claim action\n  Workbench->>Database: Fixed generated route and idempotency key\n  Database->>Receipt: Claim original command\n  Database->>Database: Existing generated create/update/delete\n  Database->>Receipt: Record acknowledged result\n  Database-->>Workbench: Native result\n  Workbench-->>Axis: Consumed or outcome unknown\n```\n\nThe executor writes `RUNNING` before dispatch. Only the exact created code or one affected row proves completion. Transport rejection, malformed acknowledgement, or a lost persistence acknowledgement produces `OUTCOME_UNKNOWN`; it never causes an automatic second native call.\n\n## Original-Result Recovery\n\nThe native inspection route is:\n\n`POST /nodics/{module}/v0/{schema}/commands/inspect`\n\nCopilot supplies the original operation, exact input, and original idempotency key from the immutable action. Users cannot choose another module, schema, query, or receipt. Recovery rechecks actor, tenant, enterprise, source policy, collection selection, schema authorization, and native permission. A completed receipt can close the uncertain row; a missing or started receipt remains uncertain. Inspection never sends the write again.\n\n## Input and Review Boundaries\n\n- One record per action; no bulk create, update, or delete.\n- At most 80 submitted fields, 65,536 serialized bytes, depth eight, and 240 reviewed leaves.\n- Review sections contain at most 20 leaves and are not silently truncated.\n- Unknown, hidden, read-only, or sensitive fields are rejected.\n- Credential-shaped keys such as password, token, secret, authorization, private key, credential, or API key are rejected at every nested level.\n- Text leaves are at most 2,000 characters and cannot contain control characters.\n- Only safe explicit codes identify source, schema, and record.\n\nThese limits are a security boundary, not a target to increase for complex business setup. Add a domain-owned operation for aggregate workflows.\n\n## Deliberate Exclusions\n\n| Exclusion | Reason | Extension path |\n| --- | --- | --- |\n| Wildcard sources or schemas | Would create broad mutation authority | Add reviewed exact entries |\n| Bulk mutation | Needs partial-failure and recovery semantics | Add an owning batch/Workflow contract |\n| Business form with `createOperation` | Aggregate owner has stronger invariants | Use that domain command |\n| Online/read-only authoring | Native lifecycle forbids generic writes | Use Staged or owner publication flow |\n| Arbitrary route/module/method | Would bypass native capability ownership | Add a fixed reviewed adapter |\n| Service-token fallback | Would replace the employee's actual authority | Grant the employee through the owner |\n| Automatic retry/rollback | Completion may be uncertain | Inspect original receipt; use owner reversal |\n\n## Troubleshooting\n\n| Observation | Meaning | Action |\n| --- | --- | --- |\n| Configuration required | Feature, source, or exact schema is not allowlisted | Review deployment configuration |\n| Permission required | Copilot or native schema permission is missing | Request the narrow missing grant |\n| Collection unavailable | Source/group/collection selection excludes it | Review Knowledge assignment |\n| Clarification required | A material input is missing | Send a complete corrected command |\n| Descriptor changed | Route, lifecycle, fields, or policy drifted | Prepare and review a fresh action |\n| Revision conflict | Another write changed the record | Read current state and start a new review |\n| `OUTCOME_UNKNOWN` | Native completion is not proven | Inspect original results; do not retry |\n| Receipt unavailable | Native journal is disabled or unqualified | Keep unresolved and fix owner setup |\n\n## Common Mistakes\n\n- Selecting a collection for Knowledge reads does not authorize mutation; the exact schema action allowlist and current employee permissions are separate.\n- A successful review is not a native write. Approval and execution are separate.\n- `OUTCOME_UNKNOWN` is not failure evidence and must not be retried.\n- A record visible after an uncertain command is not proof that this command created it; use the original receipt.\n- Enabling command receipts does not make every generated schema eligible.\n- Generic CRUD is not a substitute for enterprise onboarding, publication, redemption, workflow, or another business-owned aggregate operation.\n- Production enablement still requires deployment-specific runtime, permission, journal, privacy, and persistence qualification.\n\n## Customization Contract\n\nAdd eligible fields and forms through the owning schema's effective Backoffice metadata. Add sources through the existing Knowledge registry and assignments. Add permissions through nAuth/Profile governance. Do not add a Copilot-owned schema registry, duplicate persistence service, generic endpoint executor, or project Kickoff implementation.\n\nFor a business aggregate, implement and document a fixed domain command with its own native validation, idempotency, receipt identity, reversal policy, and live acceptance. Then register that bounded capability with Copilot; do not relabel it as generic CRUD.\n\n## Verification\n\nLocal tests cover create, update, delete, source selection, exact allowlists, descriptor drift, sensitive fields, intent planning, confirmation rendering, receipt binding, and no-replay execution. Disposable real-runtime acceptance starts Profile, Copilot, Product, MongoDB, Redis, and Elasticsearch, then proves denied-reader behavior, create/update/delete, delete-impact, duplicate-execution refusal, private receipt inspection, and restart persistence.\n\nThat acceptance qualifies the synthetic selected schema in the local composition. It does not claim that every generated schema, customer deployment, permission set, or business aggregate has been qualified.\n",
      "previous": {
        "title": "Order Notification Operations in Copilot",
        "route": "/docs/framework/copilot/order-notification-operations"
      },
      "next": {
        "title": "Process Definition and Instance Actions in Copilot",
        "route": "/docs/framework/copilot/process-lifecycle-actions"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1529,
        "checksum": "73608edd2afb848381a04ee8bea7ded38eaae6a73283580acc0fb06b600e0e61"
      },
      "slug": "copilot-governed-schema-actions",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 37,
      "references": [
        {
          "documentId": "copilot.collection-inspection",
          "owner": "copilotKnowledge"
        },
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.standalone-business-actions",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentcopilotProcessLifecycleActions",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.process-lifecycle-actions",
      "title": "Process Definition and Instance Actions in Copilot",
      "route": "/docs/framework/copilot/process-lifecycle-actions",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Process Definition and Instance Actions in Copilot"
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
      "summary": "Govern process definition drafts, publication, instance starts, cancellation, incident retry and compensation through complete review and original native receipts.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.process-task-actions",
        "copilot.process-trigger-actions",
        "copilot.process-inspection",
        "copilot.original-business-results"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotProcessLifecycleActionService.js",
        "test/copilotProcessLifecycleRuntime.live.test.js",
        "../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionCommandReceiptService.js",
        "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessInstanceCommandReceiptService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "architecture-diagram",
        "sequence-flow",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "process",
        "definition",
        "instance",
        "publish",
        "retry",
        "compensate",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Process",
        "Business Operations"
      ],
      "headings": [
        {
          "text": "Purpose",
          "anchor": "copilotProcessLifecycleActions-1-purpose",
          "level": 2
        },
        {
          "text": "Business Journey",
          "anchor": "copilotProcessLifecycleActions-2-business-journey",
          "level": 2
        },
        {
          "text": "Definition Commands",
          "anchor": "copilotProcessLifecycleActions-3-definition-commands",
          "level": 2
        },
        {
          "text": "Create a Draft",
          "anchor": "copilotProcessLifecycleActions-4-create-a-draft",
          "level": 3
        },
        {
          "text": "Update, Validate, and Publish",
          "anchor": "copilotProcessLifecycleActions-5-update-validate-and-publish",
          "level": 3
        },
        {
          "text": "Prepare or Discard a Later Draft",
          "anchor": "copilotProcessLifecycleActions-6-prepare-or-discard-a-later-draft",
          "level": 3
        },
        {
          "text": "Instance Commands",
          "anchor": "copilotProcessLifecycleActions-7-instance-commands",
          "level": 2
        },
        {
          "text": "Start",
          "anchor": "copilotProcessLifecycleActions-8-start",
          "level": 3
        },
        {
          "text": "Cancel",
          "anchor": "copilotProcessLifecycleActions-9-cancel",
          "level": 3
        },
        {
          "text": "Retry and Compensate",
          "anchor": "copilotProcessLifecycleActions-10-retry-and-compensate",
          "level": 3
        },
        {
          "text": "Permissions and Configuration",
          "anchor": "copilotProcessLifecycleActions-11-permissions-and-configuration",
          "level": 2
        },
        {
          "text": "Recovery",
          "anchor": "copilotProcessLifecycleActions-12-recovery",
          "level": 2
        },
        {
          "text": "Input and Review Limits",
          "anchor": "copilotProcessLifecycleActions-13-input-and-review-limits",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotProcessLifecycleActions-14-verification",
          "level": 2
        },
        {
          "text": "Troubleshooting",
          "anchor": "copilotProcessLifecycleActions-15-troubleshooting",
          "level": 2
        },
        {
          "text": "Safe Customization",
          "anchor": "copilotProcessLifecycleActions-16-safe-customization",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotProcessLifecycleActions-17-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose",
          "anchor": "copilotProcessLifecycleActions-1-purpose"
        },
        {
          "kind": "paragraph",
          "text": "Authorized employees can review and execute ten fixed Workflow commands through Copilot: create, update, prepare, validate, publish, and delete/archive a process definition; start, cancel, retry, and compensate a process instance. Workflow remains the lifecycle and persistence owner. Copilot collects exact values, shows every submitted field, records approval, dispatches once, and inspects the original native receipt when the outcome is uncertain."
        },
        {
          "kind": "paragraph",
          "text": "This is not an arbitrary API tool. It cannot select another module, URL, method, permission, tenant, enterprise, employee, or operation. An LLM can propose a typed command from literal user input, but it cannot authorize or execute one."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  User[Employee in Axis] --> Conversation[Copilot conversation]\n  Conversation --> Clarify[Clarify exact inputs]\n  Clarify --> Review[Immutable full-field review]\n  Review --> Approve[Actor-bound approval]\n  Approve --> Execute[Durable one-time claim]\n  Execute --> Workflow[Workflow native command]\n  Workflow --> Receipt[Private original receipt]\n  Workflow --> State[Definition or instance state]\n  Receipt --> Recover[Inspection without replay]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business Journey",
          "anchor": "copilotProcessLifecycleActions-2-business-journey"
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, use a disposable definition with a START, TASK, and END node. Practice review and rejection before enabling execution, then confirm each state in the Process workspace. A business user should never need database credentials or a runtime URL to complete the reviewed journey."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **AI Copilot**, then **Conversation**, under the intended enterprise.",
            "Identify the exact definition or instance in the Process workspace. Similar names are not resolved by guessing.",
            "Submit a typed command or a supported plain-language request. Missing graph, context, reason, or incident attempt produces clarification and no mutation.",
            "Review the operation, native identifier, executing employee, and every nested command leaf. Long graphs are split into review sections rather than hidden.",
            "Approve the current digest and revision, then execute it. A changed actor, enterprise, permission, target, input, digest, or revision fails closed.",
            "Inspect native Process state. A successful instance start is not proof that later tasks or domain actions completed.",
            "If the reply is lost or ambiguous, choose **Inspect original business results**. Do not submit the command again."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Definition Commands",
          "anchor": "copilotProcessLifecycleActions-3-definition-commands"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Create a Draft",
          "anchor": "copilotProcessLifecycleActions-4-create-a-draft"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.definition.create\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"name\": \"Employee onboarding\",\n  \"graph\": {\n    \"nodes\": [\n      { \"code\": \"start\", \"type\": \"START\" },\n      { \"code\": \"review\", \"type\": \"TASK\", \"name\": \"Review\" },\n      { \"code\": \"end\", \"type\": \"END\" }\n    ],\n    \"transitions\": [\n      { \"code\": \"to-review\", \"source\": \"start\", \"target\": \"review\" },\n      { \"code\": \"to-end\", \"source\": \"review\", \"target\": \"end\" }\n    ]\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Creation is insert-only. Workflow validates the graph, fixes `DRAFT`, version zero and draft revision one, then reads the stored owner record back before acknowledging success. Optional `designer`, `policy`, and explicit `active` values are fully reviewed."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Update, Validate, and Publish",
          "anchor": "copilotProcessLifecycleActions-5-update-validate-and-publish"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.definition.update\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"name\": \"Employee onboarding v2\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "Only a draft can be updated. Supply at least one of `name`, `graph`, `designer`, `policy`, or `active`. Workflow binds the status and draft revision read before the write, requires exactly one affected record, and verifies fresh readback."
        },
        {
          "kind": "paragraph",
          "text": "Use `validate process definition employee-onboarding` to record graph validation without publishing. Then use `publish process definition employee-onboarding`. Publishing creates an immutable version with a checksum and conditionally moves the aggregate to `PUBLISHED`. A validation acknowledgement is not publication."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Prepare or Discard a Later Draft",
          "anchor": "copilotProcessLifecycleActions-6-prepare-or-discard-a-later-draft"
        },
        {
          "kind": "paragraph",
          "text": "`prepare process definition employee-onboarding` copies the latest immutable published graph into the next editable draft. It does not modify the published version. `delete process definition employee-onboarding` has three native outcomes:"
        },
        {
          "kind": "table",
          "headers": [
            "Current state",
            "Native outcome"
          ],
          "rows": [
            [
              "New draft with no published version",
              "`DELETED_DRAFT`"
            ],
            [
              "Draft prepared from a published version",
              "`DRAFT_DISCARDED`; latest published graph is restored"
            ],
            [
              "Published definition",
              "`ARCHIVED`; versions are retained as audit evidence"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The review says delete because it is the fixed native route; the final state is decided by Workflow from fresh lifecycle state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Instance Commands",
          "anchor": "copilotProcessLifecycleActions-7-instance-commands"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Start",
          "anchor": "copilotProcessLifecycleActions-8-start"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.instance.start\",\n  \"instanceCode\": \"employee-onboarding-2026-001\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"context\": {\n    \"enterpriseCode\": \"acme\",\n    \"employeeReference\": \"new-hire-17\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "The new instance code and context are mandatory. Empty context must be supplied as `{}`; Copilot never invents business context. Optional `version` pins an immutable version and optional `name` labels the instance. Workflow checks operational admission and published state, inserts once, enters the graph, and marks start complete. An exact native replay is owner-controlled; Copilot still uses original-receipt recovery rather than a second dispatch."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Cancel",
          "anchor": "copilotProcessLifecycleActions-9-cancel"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.instance.cancel\",\n  \"instanceCode\": \"employee-onboarding-2026-001\",\n  \"reason\": \"Hiring request withdrawn\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "Cancellation is limited to created, running, or waiting instances. Workflow rejects generic cancellation when the immutable definition contains a governed actor policy that requires a domain withdrawal contract. Otherwise it uses an exact-state update, verifies the cancelled instance and confirms that no open tasks remain before writing audit evidence."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Retry and Compensate",
          "anchor": "copilotProcessLifecycleActions-10-retry-and-compensate"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.instance.retry\",\n  \"instanceCode\": \"employee-onboarding-2026-002\",\n  \"expectedAttempt\": 1\n}"
        },
        {
          "kind": "paragraph",
          "text": "Retry requires the current non-negative incident attempt. Workflow accepts only a failed instance with an open retryable ACTION incident, atomically claims the next attempt, and uses the pinned process version. Failure remains a failure; Copilot cannot convert a thrown domain error into success."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.instance.compensate\",\n  \"instanceCode\": \"employee-onboarding-2026-002\",\n  \"payload\": { \"reason\": \"Reverse completed external step\" }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Compensation requires a failed node with a declarative domain-owned compensation adapter. The payload is optional but, when supplied, every leaf is reviewed. Process coordinates incident state; the domain adapter owns business reversal. `COMPLETED` means that adapter acknowledged this compensation attempt, not that unrelated external systems were reconciled."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Permissions and Configuration",
          "anchor": "copilotProcessLifecycleActions-11-permissions-and-configuration"
        },
        {
          "kind": "table",
          "headers": [
            "Command",
            "Native permission"
          ],
          "rows": [
            [
              "Create definition",
              "`process.definition.create`"
            ],
            [
              "Update or prepare draft",
              "`process.definition.update`"
            ],
            [
              "Validate draft",
              "`process.definition.validate`"
            ],
            [
              "Publish draft",
              "`process.definition.publish`"
            ],
            [
              "Delete/discard/archive definition",
              "`process.definition.delete`"
            ],
            [
              "Start instance",
              "`process.instance.start`"
            ],
            [
              "Cancel instance",
              "`process.instance.cancel`"
            ],
            [
              "Retry incident",
              "`process.instance.retry`"
            ],
            [
              "Execute compensation",
              "`process.instance.compensate`"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Preparation also requires `copilot.mutation.prepare`; final dispatch requires current `copilot.mutation.execute`. Original-result inspection requires `copilot.mutation.reconcile`, the original native command permission, and `process.definition.read` or `process.backoffice.view` for the family."
        },
        {
          "kind": "paragraph",
          "text": "The target and receipts are default-disabled. Configure them in a deployment- owned later layer, never in a customer Kickoff module merely to expose framework functionality:"
        },
        {
          "kind": "paragraph",
          "text": "A production operator must qualify the connection, receipt persistence and native permissions in each target environment before enabling the target."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: {\n    workbench: {\n      processLifecycleTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      processLifecycleTimeoutMs: 30000,\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The connection must already exist and be qualified by normal nService/runtime configuration. `default` is rejected. The timeout may be 1,000 to 120,000 ms; transport attempts remain fixed at one. Configuration never grants permissions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Recovery",
          "anchor": "copilotProcessLifecycleActions-12-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Definition receipts are inspected at:"
        },
        {
          "kind": "paragraph",
          "text": "`POST /nodics/process/v0/definitions/{code}/commands/{kind}/receipt/query`"
        },
        {
          "kind": "paragraph",
          "text": "Instance receipts are inspected at:"
        },
        {
          "kind": "paragraph",
          "text": "`POST /nodics/process/v0/instances/{code}/commands/{kind}/receipt/query`"
        },
        {
          "kind": "paragraph",
          "text": "The body contains the exact original native `command` and `idempotencyKey`. These endpoints are for the existing Copilot recovery flow; operators should not reconstruct keys manually. Inspection checks current employee authority and the original actor, enterprise, tenant, operation, arguments, target, and result identity. It never invokes the lifecycle method."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Axis\n  participant Copilot\n  participant Workflow\n  participant Journal as Private receipt\n  Axis->>Copilot: Execute approved revision\n  Copilot->>Copilot: Claim action once\n  Copilot->>Workflow: Fixed command + original credentials + key\n  Workflow->>Journal: Record started command\n  Workflow->>Workflow: Native lifecycle transition\n  Workflow->>Journal: Record original result\n  Workflow--xCopilot: Response may be lost\n  Axis->>Copilot: Inspect original result\n  Copilot->>Workflow: Receipt query only\n  Workflow->>Journal: Read exact binding\n  Journal-->>Axis: Completed or outcome unknown"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Input and Review Limits",
          "anchor": "copilotProcessLifecycleActions-13-input-and-review-limits"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Identifiers are explicit safe codes up to 128 characters.",
            "Unknown top-level fields and arbitrary endpoints are rejected.",
            "Credential-like nested keys are rejected.",
            "JSON depth is eight, each object/array has at most 80 entries, reviewed leaves are capped at 240, and the native body is capped at 65,536 bytes.",
            "Individual text leaves are capped at 2,000 characters and control characters are rejected.",
            "Review sections contain at most 20 fields and are never silently truncated."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Large domain payloads or executable callbacks require a separate owner-reviewed adapter. Do not increase limits to turn this into a generic transport."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotProcessLifecycleActions-14-verification"
        },
        {
          "kind": "paragraph",
          "text": "`copilotProcessLifecycleAction.test.js` covers all ten commands, exact routing, complete review, missing/invalid input, credential rejection, grant denial and target drift. `processLifecycleCommandReceipt.test.js` covers native permission, exact input/result binding and inspection without replay. The opt-in `copilotProcessLifecycleRuntime.live.test.js` uses disposable Profile, Workflow, Copilot and MongoDB runtimes plus local Ollama for a representative natural- language publish journey, restart-safe receipts, denied access and persisted definition/instance outcomes."
        },
        {
          "kind": "paragraph",
          "text": "Retry and compensation need a disposable domain ACTION/compensation adapter to prove their successful native effects. Their deterministic owner tests do not claim a live customer-domain reversal."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting",
          "anchor": "copilotProcessLifecycleActions-15-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Meaning and response"
          ],
          "rows": [
            [
              "Configuration required",
              "Qualify the fixed Workflow connection and effective later-layer settings"
            ],
            [
              "Permission required",
              "Grant only the needed native and Copilot permissions through Profile ownership"
            ],
            [
              "Clarification requested",
              "Supply every listed business value and create a new review"
            ],
            [
              "Concurrent change",
              "Reload current Process state; do not force the stale transition"
            ],
            [
              "Outcome unknown",
              "Inspect the original receipt; never repeat the command automatically"
            ],
            [
              "Retry policy exhausted",
              "Resolve the owner incident or use an approved compensation contract"
            ],
            [
              "Compensation unavailable",
              "The failed node has no domain-owned declarative compensation adapter"
            ],
            [
              "Definition archived",
              "Create a new governed definition/version; do not reactivate through generic CRUD"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Safe Customization",
          "anchor": "copilotProcessLifecycleActions-16-safe-customization"
        },
        {
          "kind": "paragraph",
          "text": "Developers extend this capability only through normal later-layer contracts. Later layers may tighten graph policy, input bounds, permissions, target qualification, presentation copy, or domain action admission. Preserve Workflow ownership, exact native routes, create-only insertion, conditional writes, fresh readback, original credentials, immutable review, receipt privacy, and no automatic replay. Axis may customize labels and layout but cannot add authority."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotProcessLifecycleActions-17-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a validated draft as published or a started instance as completed.",
            "Repeating a command after a timeout instead of inspecting its original receipt.",
            "Using generic schema CRUD to bypass definition, incident, or compensation policy.",
            "Putting Workflow authority, service URLs, or credentials in Axis or model input.",
            "Assuming an administrator role grants every enterprise and native permission.",
            "Describing deterministic retry or compensation tests as proof of a customer domain adapter's live business reversal."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Continue with [Process Task Actions](/docs/framework/copilot/process-task-actions), [Process Trigger Actions](/docs/framework/copilot/process-trigger-actions), [Process Inspection](/docs/framework/copilot/process-inspection), and [Original Business Results](/docs/framework/copilot/original-business-results)."
        }
      ],
      "searchText": "Process Definition and Instance Actions in Copilot Govern process definition drafts, publication, instance starts, cancellation, incident retry and compensation through complete review and original native receipts. # Process Definition and Instance Actions in Copilot\n\n## Purpose\n\nAuthorized employees can review and execute ten fixed Workflow commands through Copilot: create, update, prepare, validate, publish, and delete/archive a process definition; start, cancel, retry, and compensate a process instance. Workflow remains the lifecycle and persistence owner. Copilot collects exact values, shows every submitted field, records approval, dispatches once, and inspects the original native receipt when the outcome is uncertain.\n\nThis is not an arbitrary API tool. It cannot select another module, URL, method, permission, tenant, enterprise, employee, or operation. An LLM can propose a typed command from literal user input, but it cannot authorize or execute one.\n\n```mermaid\nflowchart LR\n  User[Employee in Axis] --> Conversation[Copilot conversation]\n  Conversation --> Clarify[Clarify exact inputs]\n  Clarify --> Review[Immutable full-field review]\n  Review --> Approve[Actor-bound approval]\n  Approve --> Execute[Durable one-time claim]\n  Execute --> Workflow[Workflow native command]\n  Workflow --> Receipt[Private original receipt]\n  Workflow --> State[Definition or instance state]\n  Receipt --> Recover[Inspection without replay]\n```\n\n## Business Journey\n\nFor a beginner, use a disposable definition with a START, TASK, and END node. Practice review and rejection before enabling execution, then confirm each state in the Process workspace. A business user should never need database credentials or a runtime URL to complete the reviewed journey.\n\n1. Open **AI Copilot**, then **Conversation**, under the intended enterprise.\n2. Identify the exact definition or instance in the Process workspace. Similar names are not resolved by guessing.\n3. Submit a typed command or a supported plain-language request. Missing graph, context, reason, or incident attempt produces clarification and no mutation.\n4. Review the operation, native identifier, executing employee, and every nested command leaf. Long graphs are split into review sections rather than hidden.\n5. Approve the current digest and revision, then execute it. A changed actor, enterprise, permission, target, input, digest, or revision fails closed.\n6. Inspect native Process state. A successful instance start is not proof that later tasks or domain actions completed.\n7. If the reply is lost or ambiguous, choose **Inspect original business results**. Do not submit the command again.\n\n## Definition Commands\n\n### Create a Draft\n\n```json\n{\n  \"operation\": \"process.definition.create\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"name\": \"Employee onboarding\",\n  \"graph\": {\n    \"nodes\": [\n      { \"code\": \"start\", \"type\": \"START\" },\n      { \"code\": \"review\", \"type\": \"TASK\", \"name\": \"Review\" },\n      { \"code\": \"end\", \"type\": \"END\" }\n    ],\n    \"transitions\": [\n      { \"code\": \"to-review\", \"source\": \"start\", \"target\": \"review\" },\n      { \"code\": \"to-end\", \"source\": \"review\", \"target\": \"end\" }\n    ]\n  }\n}\n```\n\nCreation is insert-only. Workflow validates the graph, fixes `DRAFT`, version zero and draft revision one, then reads the stored owner record back before acknowledging success. Optional `designer`, `policy`, and explicit `active` values are fully reviewed.\n\n### Update, Validate, and Publish\n\n```json\n{\n  \"operation\": \"process.definition.update\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"name\": \"Employee onboarding v2\"\n}\n```\n\nOnly a draft can be updated. Supply at least one of `name`, `graph`, `designer`, `policy`, or `active`. Workflow binds the status and draft revision read before the write, requires exactly one affected record, and verifies fresh readback.\n\nUse `validate process definition employee-onboarding` to record graph validation without publishing. Then use `publish process definition employee-onboarding`. Publishing creates an immutable version with a checksum and conditionally moves the aggregate to `PUBLISHED`. A validation acknowledgement is not publication.\n\n### Prepare or Discard a Later Draft\n\n`prepare process definition employee-onboarding` copies the latest immutable published graph into the next editable draft. It does not modify the published version. `delete process definition employee-onboarding` has three native outcomes:\n\n| Current state | Native outcome |\n| --- | --- |\n| New draft with no published version | `DELETED_DRAFT` |\n| Draft prepared from a published version | `DRAFT_DISCARDED`; latest published graph is restored |\n| Published definition | `ARCHIVED`; versions are retained as audit evidence |\n\nThe review says delete because it is the fixed native route; the final state is decided by Workflow from fresh lifecycle state.\n\n## Instance Commands\n\n### Start\n\n```json\n{\n  \"operation\": \"process.instance.start\",\n  \"instanceCode\": \"employee-onboarding-2026-001\",\n  \"definitionCode\": \"employee-onboarding\",\n  \"context\": {\n    \"enterpriseCode\": \"acme\",\n    \"employeeReference\": \"new-hire-17\"\n  }\n}\n```\n\nThe new instance code and context are mandatory. Empty context must be supplied as `{}`; Copilot never invents business context. Optional `version` pins an immutable version and optional `name` labels the instance. Workflow checks operational admission and published state, inserts once, enters the graph, and marks start complete. An exact native replay is owner-controlled; Copilot still uses original-receipt recovery rather than a second dispatch.\n\n### Cancel\n\n```json\n{\n  \"operation\": \"process.instance.cancel\",\n  \"instanceCode\": \"employee-onboarding-2026-001\",\n  \"reason\": \"Hiring request withdrawn\"\n}\n```\n\nCancellation is limited to created, running, or waiting instances. Workflow rejects generic cancellation when the immutable definition contains a governed actor policy that requires a domain withdrawal contract. Otherwise it uses an exact-state update, verifies the cancelled instance and confirms that no open tasks remain before writing audit evidence.\n\n### Retry and Compensate\n\n```json\n{\n  \"operation\": \"process.instance.retry\",\n  \"instanceCode\": \"employee-onboarding-2026-002\",\n  \"expectedAttempt\": 1\n}\n```\n\nRetry requires the current non-negative incident attempt. Workflow accepts only a failed instance with an open retryable ACTION incident, atomically claims the next attempt, and uses the pinned process version. Failure remains a failure; Copilot cannot convert a thrown domain error into success.\n\n```json\n{\n  \"operation\": \"process.instance.compensate\",\n  \"instanceCode\": \"employee-onboarding-2026-002\",\n  \"payload\": { \"reason\": \"Reverse completed external step\" }\n}\n```\n\nCompensation requires a failed node with a declarative domain-owned compensation adapter. The payload is optional but, when supplied, every leaf is reviewed. Process coordinates incident state; the domain adapter owns business reversal. `COMPLETED` means that adapter acknowledged this compensation attempt, not that unrelated external systems were reconciled.\n\n## Permissions and Configuration\n\n| Command | Native permission |\n| --- | --- |\n| Create definition | `process.definition.create` |\n| Update or prepare draft | `process.definition.update` |\n| Validate draft | `process.definition.validate` |\n| Publish draft | `process.definition.publish` |\n| Delete/discard/archive definition | `process.definition.delete` |\n| Start instance | `process.instance.start` |\n| Cancel instance | `process.instance.cancel` |\n| Retry incident | `process.instance.retry` |\n| Execute compensation | `process.instance.compensate` |\n\nPreparation also requires `copilot.mutation.prepare`; final dispatch requires current `copilot.mutation.execute`. Original-result inspection requires `copilot.mutation.reconcile`, the original native command permission, and `process.definition.read` or `process.backoffice.view` for the family.\n\nThe target and receipts are default-disabled. Configure them in a deployment- owned later layer, never in a customer Kickoff module merely to expose framework functionality:\n\nA production operator must qualify the connection, receipt persistence and native permissions in each target environment before enabling the target.\n\n```js\nmodule.exports = {\n  copilot: {\n    workbench: {\n      processLifecycleTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      processLifecycleTimeoutMs: 30000,\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};\n```\n\nThe connection must already exist and be qualified by normal nService/runtime configuration. `default` is rejected. The timeout may be 1,000 to 120,000 ms; transport attempts remain fixed at one. Configuration never grants permissions.\n\n## Recovery\n\nDefinition receipts are inspected at:\n\n`POST /nodics/process/v0/definitions/{code}/commands/{kind}/receipt/query`\n\nInstance receipts are inspected at:\n\n`POST /nodics/process/v0/instances/{code}/commands/{kind}/receipt/query`\n\nThe body contains the exact original native `command` and `idempotencyKey`. These endpoints are for the existing Copilot recovery flow; operators should not reconstruct keys manually. Inspection checks current employee authority and the original actor, enterprise, tenant, operation, arguments, target, and result identity. It never invokes the lifecycle method.\n\n```mermaid\nsequenceDiagram\n  participant Axis\n  participant Copilot\n  participant Workflow\n  participant Journal as Private receipt\n  Axis->>Copilot: Execute approved revision\n  Copilot->>Copilot: Claim action once\n  Copilot->>Workflow: Fixed command + original credentials + key\n  Workflow->>Journal: Record started command\n  Workflow->>Workflow: Native lifecycle transition\n  Workflow->>Journal: Record original result\n  Workflow--xCopilot: Response may be lost\n  Axis->>Copilot: Inspect original result\n  Copilot->>Workflow: Receipt query only\n  Workflow->>Journal: Read exact binding\n  Journal-->>Axis: Completed or outcome unknown\n```\n\n## Input and Review Limits\n\n- Identifiers are explicit safe codes up to 128 characters.\n- Unknown top-level fields and arbitrary endpoints are rejected.\n- Credential-like nested keys are rejected.\n- JSON depth is eight, each object/array has at most 80 entries, reviewed leaves are capped at 240, and the native body is capped at 65,536 bytes.\n- Individual text leaves are capped at 2,000 characters and control characters are rejected.\n- Review sections contain at most 20 fields and are never silently truncated.\n\nLarge domain payloads or executable callbacks require a separate owner-reviewed adapter. Do not increase limits to turn this into a generic transport.\n\n## Verification\n\n`copilotProcessLifecycleAction.test.js` covers all ten commands, exact routing, complete review, missing/invalid input, credential rejection, grant denial and target drift. `processLifecycleCommandReceipt.test.js` covers native permission, exact input/result binding and inspection without replay. The opt-in `copilotProcessLifecycleRuntime.live.test.js` uses disposable Profile, Workflow, Copilot and MongoDB runtimes plus local Ollama for a representative natural- language publish journey, restart-safe receipts, denied access and persisted definition/instance outcomes.\n\nRetry and compensation need a disposable domain ACTION/compensation adapter to prove their successful native effects. Their deterministic owner tests do not claim a live customer-domain reversal.\n\n## Troubleshooting\n\n| Symptom | Meaning and response |\n| --- | --- |\n| Configuration required | Qualify the fixed Workflow connection and effective later-layer settings |\n| Permission required | Grant only the needed native and Copilot permissions through Profile ownership |\n| Clarification requested | Supply every listed business value and create a new review |\n| Concurrent change | Reload current Process state; do not force the stale transition |\n| Outcome unknown | Inspect the original receipt; never repeat the command automatically |\n| Retry policy exhausted | Resolve the owner incident or use an approved compensation contract |\n| Compensation unavailable | The failed node has no domain-owned declarative compensation adapter |\n| Definition archived | Create a new governed definition/version; do not reactivate through generic CRUD |\n\n## Safe Customization\n\nDevelopers extend this capability only through normal later-layer contracts. Later layers may tighten graph policy, input bounds, permissions, target qualification, presentation copy, or domain action admission. Preserve Workflow ownership, exact native routes, create-only insertion, conditional writes, fresh readback, original credentials, immutable review, receipt privacy, and no automatic replay. Axis may customize labels and layout but cannot add authority.\n\n## Common Mistakes\n\n- Treating a validated draft as published or a started instance as completed.\n- Repeating a command after a timeout instead of inspecting its original receipt.\n- Using generic schema CRUD to bypass definition, incident, or compensation policy.\n- Putting Workflow authority, service URLs, or credentials in Axis or model input.\n- Assuming an administrator role grants every enterprise and native permission.\n- Describing deterministic retry or compensation tests as proof of a customer domain adapter's live business reversal.\n\nContinue with [Process Task Actions](/docs/framework/copilot/process-task-actions), [Process Trigger Actions](/docs/framework/copilot/process-trigger-actions), [Process Inspection](/docs/framework/copilot/process-inspection), and [Original Business Results](/docs/framework/copilot/original-business-results).\n",
      "previous": {
        "title": "Governed Selected-Schema Actions in Copilot",
        "route": "/docs/framework/copilot/governed-schema-actions"
      },
      "next": {
        "title": "Process Trigger Actions in Copilot",
        "route": "/docs/framework/copilot/process-trigger-actions"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1621,
        "checksum": "4c0aafbb7c92bb5208cbd336857557788a11a62645296c8c26c368c3a64965f1"
      },
      "slug": "copilot-process-lifecycle-actions",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 36,
      "references": [
        {
          "documentId": "copilot.process-task-actions",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.process-trigger-actions",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.process-inspection",
          "owner": "copilotCapability"
        },
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentcopilotProcessTriggerActions",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.process-trigger-actions",
      "title": "Process Trigger Actions in Copilot",
      "route": "/docs/framework/copilot/process-trigger-actions",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Process Trigger Actions in Copilot"
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
      "summary": "Review trigger metadata changes and explicit workflow starts with original employee authority and native receipt recovery.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.process-task-actions",
        "copilot.process-inspection",
        "copilot.original-business-results"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotProcessTriggerActionService.js",
        "test/copilotProcessTriggerRuntime.live.test.js",
        "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTriggerCommandReceiptService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "process",
        "trigger",
        "workflow",
        "archive",
        "execute",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Process",
        "Business Operations"
      ],
      "headings": [
        {
          "text": "Purpose and Ownership",
          "anchor": "copilotProcessTriggerActions-1-purpose-and-ownership",
          "level": 2
        },
        {
          "text": "Business User Journey",
          "anchor": "copilotProcessTriggerActions-2-business-user-journey",
          "level": 2
        },
        {
          "text": "Create a Trigger",
          "anchor": "copilotProcessTriggerActions-3-create-a-trigger",
          "level": 2
        },
        {
          "text": "Update a Trigger",
          "anchor": "copilotProcessTriggerActions-4-update-a-trigger",
          "level": 2
        },
        {
          "text": "Execute a Trigger",
          "anchor": "copilotProcessTriggerActions-5-execute-a-trigger",
          "level": 2
        },
        {
          "text": "Archive a Trigger",
          "anchor": "copilotProcessTriggerActions-6-archive-a-trigger",
          "level": 2
        },
        {
          "text": "Administrator Setup",
          "anchor": "copilotProcessTriggerActions-7-administrator-setup",
          "level": 2
        },
        {
          "text": "Recovery and Troubleshooting",
          "anchor": "copilotProcessTriggerActions-8-recovery-and-troubleshooting",
          "level": 2
        },
        {
          "text": "Customize and Extend Safely",
          "anchor": "copilotProcessTriggerActions-9-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Verification and Evidence Boundary",
          "anchor": "copilotProcessTriggerActions-10-verification-and-evidence-boundary",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotProcessTriggerActions-11-common-mistakes",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose and Ownership",
          "anchor": "copilotProcessTriggerActions-1-purpose-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "A Workflow trigger is a relationship to a process definition. An authorized employee can create or update that relationship, archive it, or explicitly execute it to start a workflow instance. A trigger is not a Cron job: creating trigger metadata does not install a schedule, and archival does not delete an existing Cron job or cancel instances already started."
        },
        {
          "kind": "paragraph",
          "text": "Workflow owns trigger state, definition resolution, instance creation, domain callbacks and audit. Copilot owns clarification, full-field review and the approved command envelope. Axis renders the existing confirmation controls. No provider receives transport authority, and no customer-project implementation is required for the reusable capability."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business User Journey",
          "anchor": "copilotProcessTriggerActions-2-business-user-journey"
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, start with a MANUAL, DRAFT, inactive trigger against a synthetic published definition. Check that creation changes only metadata before trying an explicitly approved execution. A trigger identifies what can start; an instance is the actual run. They have different identifiers and lifecycles."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Sign in to Axis and select the intended enterprise. Open AI Copilot, then Conversation. Use the native Process workspace to identify the definition and trigger; the assistant does not invent identifiers from similar names.",
            "Submit an exact command below. Missing references or activation choices produce clarification without making a business change.",
            "Inspect the review: operation, trigger, executing employee and every supplied native field, including nested schedule or context values.",
            "Approve the current review. Approval alone does not dispatch the command.",
            "Execute the approved revision. A changed plan or stale revision is rejected.",
            "Check the result in Process. For execution, inspect the instance and its tasks/incidents; a successful start acknowledgement is not a guarantee that later workflow or domain actions completed.",
            "After an uncertain result, select **Inspect original business results**. Do not resend the command, change the instance identifier or create a new confirmation to work around the uncertainty."
          ]
        },
        {
          "kind": "paragraph",
          "text": "The source-backed screen flow is:"
        },
        {
          "kind": "table",
          "headers": [
            "Screen state",
            "User action",
            "Business effect"
          ],
          "rows": [
            [
              "Conversation",
              "Submit exact command",
              "Validates input and builds a review only"
            ],
            [
              "Review pending",
              "Inspect every field, approve or reject",
              "Records intent only"
            ],
            [
              "Approved",
              "Execute current revision",
              "Claims one durable action, then calls Workflow once"
            ],
            [
              "Consumed",
              "Inspect native Process state",
              "No further execution of that confirmation"
            ],
            [
              "Outcome unknown",
              "Inspect original result",
              "Reads the original native receipt, never repeats the command"
            ],
            [
              "Receipt still unknown",
              "Investigate native owner evidence",
              "Remains unresolved; no automatic replay"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Create a Trigger",
          "anchor": "copilotProcessTriggerActions-3-create-a-trigger"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.trigger.create\",\n  \"triggerCode\": \"monthly-review\",\n  \"definitionCode\": \"review-process\",\n  \"name\": \"Monthly review\",\n  \"triggerType\": \"MANUAL\",\n  \"status\": \"DRAFT\",\n  \"active\": false\n}"
        },
        {
          "kind": "paragraph",
          "text": "`triggerCode`, `definitionCode`, `name`, `triggerType`, `status` and `active` are required. The adapter never silently chooses ACTIVE or assumes that the trigger should be enabled. Types are MANUAL, CRON or EVENT; supported initial states are DRAFT, ACTIVE or PAUSED. The owner module is fixed to `nodics.process` and included in the review. Optional fields are positive integer `version`, `cronJobCode` and `schedule` metadata. An omitted version uses native Workflow's version resolution at execution; it is not a pinned-version guarantee."
        },
        {
          "kind": "paragraph",
          "text": "Creation is insert-only. An existing trigger cannot be overwritten by another create request, including a concurrent request with the same code."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Update a Trigger",
          "anchor": "copilotProcessTriggerActions-4-update-a-trigger"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.trigger.update\",\n  \"triggerCode\": \"monthly-review\",\n  \"status\": \"ACTIVE\",\n  \"active\": true\n}"
        },
        {
          "kind": "paragraph",
          "text": "At least one changed field is required. Allowed fields are `name`, `version`, `triggerType`, `cronJobCode`, `status`, `schedule` and `active`. Changing the definition or metadata owner is not supported by this update contract. Workflow refuses archived triggers. Its update binds the state read immediately before the write, requires an acknowledged single match and checks fresh native readback before reporting success. This is execution-time concurrency protection, not a claim that preview took a lock or captured a record revision."
        },
        {
          "kind": "paragraph",
          "text": "With the existing intent planner enabled, the following requests a review:"
        },
        {
          "kind": "blockquote",
          "text": "Please update trigger monthly-review with status ACTIVE and active true"
        },
        {
          "kind": "paragraph",
          "text": "The model must supply literal identifiers and explicit numeric/boolean choices. Unknown fields, invented activation choices and unsupported output require clarification or rejection. The planner consumes the normal accounted model budget; it has no fallback execution path when the provider or budget is unavailable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Execute a Trigger",
          "anchor": "copilotProcessTriggerActions-5-execute-a-trigger"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.trigger.execute\",\n  \"triggerCode\": \"monthly-review\",\n  \"instanceCode\": \"monthly-review-october\",\n  \"context\": {}\n}"
        },
        {
          "kind": "paragraph",
          "text": "The new instance identifier and context object must be explicit. Empty context means an explicitly supplied `{}`, not inferred business values. Optional fields are `correlationId` and positive integer `version`. Workflow must find an active trigger, resolve an admissible published definition, pass operational admission and apply its normal start/lifecycle and domain policies. The new instance can execute downstream domain actions immediately; review the definition first."
        },
        {
          "kind": "paragraph",
          "text": "The short form `execute trigger monthly-review` asks for the missing instance and context. It does not execute with invented values. Typed commands and exact short forms do not call an LLM. Trigger exchanges are excluded from subsequent provider history; configured activity recording is a separate concern."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Archive a Trigger",
          "anchor": "copilotProcessTriggerActions-6-archive-a-trigger"
        },
        {
          "kind": "paragraph",
          "text": "Enter `archive trigger monthly-review`, or submit:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.trigger.archive\",\n  \"triggerCode\": \"monthly-review\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "Workflow sets the trigger inactive and ARCHIVED after acknowledged conditional persistence. It retains the relationship and original evidence. This command does not remove a scheduler definition, withdraw a domain review or compensate work already performed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Setup",
          "anchor": "copilotProcessTriggerActions-7-administrator-setup"
        },
        {
          "kind": "paragraph",
          "text": "An operator should first qualify the original employee's native permissions and the target connection in a disposable local runtime. Do not enable a production target solely because the synthetic acceptance suite passes."
        },
        {
          "kind": "paragraph",
          "text": "Use an existing deployment-owned nService alias and actual runtime authority. Configure the Copilot target and native Workflow receipt owner in their respective runtimes through normal layered `config/properties.js`:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: {\n    workbench: {\n      processTriggerTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "The example does not create the connection, activate modules, enable the Copilot API, or grant an employee any permission. Never add URLs or service credentials to the command. A default connection is not an admissible trigger target."
        },
        {
          "kind": "table",
          "headers": [
            "Boundary",
            "Required authority"
          ],
          "rows": [
            [
              "Prepare any trigger command",
              "EMPLOYEE actor, tenant and enterprise; `copilot.mutation.prepare` plus native command grant"
            ],
            [
              "Create/update/archive",
              "`process.trigger.manage`; native route access-group and exposure policy also apply"
            ],
            [
              "Execute trigger",
              "`process.trigger.execute`; native route access-group, activation and domain policy also apply"
            ],
            [
              "Execute approved Copilot plan",
              "Current `copilot.mutation.execute`, original actor/scope, exact revision/digest and unchanged qualified target"
            ],
            [
              "Inspect original result",
              "`copilot.mutation.reconcile`, prepare/execute grants, current native command grant and `process.backoffice.view`"
            ],
            [
              "Write original native receipts",
              "Native `commandReceipts.enabled` and `owners.workflow`"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Both trigger writes and receipt recovery are default-disabled. Disabling new writes does not erase original evidence or permit replay. Authorized original inspection remains possible with recording disabled; routing and current permissions must still match."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Recovery and Troubleshooting",
          "anchor": "copilotProcessTriggerActions-8-recovery-and-troubleshooting"
        },
        {
          "kind": "paragraph",
          "text": "Original evidence uses the existing private `processCommandReceipt` model and shared native receipt protocol. The native inspection endpoint is:"
        },
        {
          "kind": "paragraph",
          "text": "`POST /nodics/process/v0/triggers/{triggerCode}/commands/{kind}/receipt/query`"
        },
        {
          "kind": "paragraph",
          "text": "Its exact body is `{ \"command\": originalNativeBody, \"idempotencyKey\": originalKey }`. The original body includes `code` and fixed `ownerModule` for creation. Normal users should use the confirmation's inspection button rather than reconstructing this input. Current record existence is never substituted for an original receipt."
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Meaning and next step"
          ],
          "rows": [
            [
              "Configuration required",
              "Qualify the existing owner alias, authority and enablement; do not select another owner as fallback"
            ],
            [
              "Permission denied",
              "Review the employee's effective native and Copilot permissions; an administrator title alone is insufficient"
            ],
            [
              "Missing fields",
              "Supply the named values and submit a new review; no mutation occurred during preparation"
            ],
            [
              "Archived/inactive trigger",
              "Review native state; execution must not silently reactivate it"
            ],
            [
              "Stale revision",
              "Reload the original confirmation; never substitute another revision by guessing"
            ],
            [
              "Failed or ambiguous native write",
              "The action remains unknown; inspect original evidence before any further action"
            ],
            [
              "STARTED or missing receipt",
              "Completion is unproven; no retry or success claim is permitted"
            ],
            [
              "Completed start, later incident",
              "Inspect the native instance; start acknowledgement is not full workflow success"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and Extend Safely",
          "anchor": "copilotProcessTriggerActions-9-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "A developer extends the existing module through the normal later-layer contract; frontend rendering does not confer backend authority."
        },
        {
          "kind": "paragraph",
          "text": "Partners change only their project-owned later layer. For example, `<project>/modules/<overlay>/config/properties.js` may override:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: { workbench: {\n    processTriggerTimeoutMs: 12000,\n    processTriggerPresentation: {\n      title: \"Workflow trigger review\",\n      summary: \"Review every proposed field before starting workflow activity.\"\n    }\n  } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "All other framework defaults remain inherited. The transport timeout must be an integer from 1,000 to 120,000 milliseconds; retries remain fixed at one attempt. Presentation overrides cannot add commands or weaken authorization."
        },
        {
          "kind": "paragraph",
          "text": "Inputs allow safe identifiers up to 128 characters, leaf text up to 1,000 characters, nesting depth five, at most 40 entries per object/array and 100 reviewed leaves, and a native body at most 12,000 characters. Credential-like keys, executable objects, arbitrary endpoints and unknown top-level fields are rejected. Supply no secrets in context or metadata. Broader domain-specific payload shapes require an owner-reviewed adapter, not a copied generic executor."
        },
        {
          "kind": "paragraph",
          "text": "Review sections contain at most 20 fields each and preserve every leaf; long reviews are split, not truncated. Labels must fit the existing 128-character Axis contract. Excessively long nested paths are rejected before a plan is saved."
        },
        {
          "kind": "paragraph",
          "text": "Workflow service overlays can tighten trigger lifecycle validation through normal service layering. Preserve insert-only creation, conditional writes, fresh acknowledged readback, exact employee/scope/input receipt binding and inspection without replay. Cron remains the only scheduler owner."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and Evidence Boundary",
          "anchor": "copilotProcessTriggerActions-10-verification-and-evidence-boundary"
        },
        {
          "kind": "paragraph",
          "text": "`copilotProcessTriggerAction.test.js` composes real Core, approval, executor, recovery, native metadata lifecycle and shared receipt logic using isolated stores. It checks all four commands, denied/drifted scope, stale/duplicate execution, write failure, malformed receipts, input bounds and later-layer presentation."
        },
        {
          "kind": "paragraph",
          "text": "`copilotProcessTriggerRuntime.live.test.js` separately enables real disposable Profile, Copilot, Workflow, MongoDB and local Ollama. It exercises all four commands, persisted native state, denied roles, restart and original receipts. Its response-loss case loses the reply only after the native trigger starts the instance, then reconciles after restart without a second start."
        },
        {
          "kind": "paragraph",
          "text": "Axis's confirmation tests cover the four explicit recovery identities. The `process-task-review.visual.html?mode=trigger` fixture renders the actual shared component with synthetic state for desktop/mobile review and unknown-outcome inspection. It is not evidence of a signed-in full Axis deployment. These checks qualify the bounded trigger adapter, not every Workflow operation or domain graph."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotProcessTriggerActions-11-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating CRON trigger metadata as an installed schedule. Configure scheduling through Cron's own governed journey and verify its separate lifecycle.",
            "Treating ACTIVE status as sufficient when `active` is false. Both native execution prerequisites must hold; neither is silently repaired by Copilot.",
            "Reusing an instance identifier to conceal an uncertain execution. Inspect the original action and receipt; do not attempt another trigger command as a probe.",
            "Treating confirmation as permission. Native employee grants, current routing, lifecycle and domain rules are rechecked at execution.",
            "Copying framework configuration defaults into a customer project. Override only the deployment choice or intentional presentation/timeout difference."
          ]
        }
      ],
      "searchText": "Process Trigger Actions in Copilot Review trigger metadata changes and explicit workflow starts with original employee authority and native receipt recovery. # Process Trigger Actions in Copilot\n\n## Purpose and Ownership\n\nA Workflow trigger is a relationship to a process definition. An authorized employee can create or update that relationship, archive it, or explicitly execute it to start a workflow instance. A trigger is not a Cron job: creating trigger metadata does not install a schedule, and archival does not delete an existing Cron job or cancel instances already started.\n\nWorkflow owns trigger state, definition resolution, instance creation, domain callbacks and audit. Copilot owns clarification, full-field review and the approved command envelope. Axis renders the existing confirmation controls. No provider receives transport authority, and no customer-project implementation is required for the reusable capability.\n\n## Business User Journey\n\nFor a beginner, start with a MANUAL, DRAFT, inactive trigger against a synthetic published definition. Check that creation changes only metadata before trying an explicitly approved execution. A trigger identifies what can start; an instance is the actual run. They have different identifiers and lifecycles.\n\n1. Sign in to Axis and select the intended enterprise. Open AI Copilot, then Conversation. Use the native Process workspace to identify the definition and trigger; the assistant does not invent identifiers from similar names.\n2. Submit an exact command below. Missing references or activation choices produce clarification without making a business change.\n3. Inspect the review: operation, trigger, executing employee and every supplied native field, including nested schedule or context values.\n4. Approve the current review. Approval alone does not dispatch the command.\n5. Execute the approved revision. A changed plan or stale revision is rejected.\n6. Check the result in Process. For execution, inspect the instance and its tasks/incidents; a successful start acknowledgement is not a guarantee that later workflow or domain actions completed.\n7. After an uncertain result, select **Inspect original business results**. Do not resend the command, change the instance identifier or create a new confirmation to work around the uncertainty.\n\nThe source-backed screen flow is:\n\n| Screen state | User action | Business effect |\n| --- | --- | --- |\n| Conversation | Submit exact command | Validates input and builds a review only |\n| Review pending | Inspect every field, approve or reject | Records intent only |\n| Approved | Execute current revision | Claims one durable action, then calls Workflow once |\n| Consumed | Inspect native Process state | No further execution of that confirmation |\n| Outcome unknown | Inspect original result | Reads the original native receipt, never repeats the command |\n| Receipt still unknown | Investigate native owner evidence | Remains unresolved; no automatic replay |\n\n## Create a Trigger\n\n```json\n{\n  \"operation\": \"process.trigger.create\",\n  \"triggerCode\": \"monthly-review\",\n  \"definitionCode\": \"review-process\",\n  \"name\": \"Monthly review\",\n  \"triggerType\": \"MANUAL\",\n  \"status\": \"DRAFT\",\n  \"active\": false\n}\n```\n\n`triggerCode`, `definitionCode`, `name`, `triggerType`, `status` and `active` are required. The adapter never silently chooses ACTIVE or assumes that the trigger should be enabled. Types are MANUAL, CRON or EVENT; supported initial states are DRAFT, ACTIVE or PAUSED. The owner module is fixed to `nodics.process` and included in the review. Optional fields are positive integer `version`, `cronJobCode` and `schedule` metadata. An omitted version uses native Workflow's version resolution at execution; it is not a pinned-version guarantee.\n\nCreation is insert-only. An existing trigger cannot be overwritten by another create request, including a concurrent request with the same code.\n\n## Update a Trigger\n\n```json\n{\n  \"operation\": \"process.trigger.update\",\n  \"triggerCode\": \"monthly-review\",\n  \"status\": \"ACTIVE\",\n  \"active\": true\n}\n```\n\nAt least one changed field is required. Allowed fields are `name`, `version`, `triggerType`, `cronJobCode`, `status`, `schedule` and `active`. Changing the definition or metadata owner is not supported by this update contract. Workflow refuses archived triggers. Its update binds the state read immediately before the write, requires an acknowledged single match and checks fresh native readback before reporting success. This is execution-time concurrency protection, not a claim that preview took a lock or captured a record revision.\n\nWith the existing intent planner enabled, the following requests a review:\n\nPlease update trigger monthly-review with status ACTIVE and active true\n\nThe model must supply literal identifiers and explicit numeric/boolean choices. Unknown fields, invented activation choices and unsupported output require clarification or rejection. The planner consumes the normal accounted model budget; it has no fallback execution path when the provider or budget is unavailable.\n\n## Execute a Trigger\n\n```json\n{\n  \"operation\": \"process.trigger.execute\",\n  \"triggerCode\": \"monthly-review\",\n  \"instanceCode\": \"monthly-review-october\",\n  \"context\": {}\n}\n```\n\nThe new instance identifier and context object must be explicit. Empty context means an explicitly supplied `{}`, not inferred business values. Optional fields are `correlationId` and positive integer `version`. Workflow must find an active trigger, resolve an admissible published definition, pass operational admission and apply its normal start/lifecycle and domain policies. The new instance can execute downstream domain actions immediately; review the definition first.\n\nThe short form `execute trigger monthly-review` asks for the missing instance and context. It does not execute with invented values. Typed commands and exact short forms do not call an LLM. Trigger exchanges are excluded from subsequent provider history; configured activity recording is a separate concern.\n\n## Archive a Trigger\n\nEnter `archive trigger monthly-review`, or submit:\n\n```json\n{\n  \"operation\": \"process.trigger.archive\",\n  \"triggerCode\": \"monthly-review\"\n}\n```\n\nWorkflow sets the trigger inactive and ARCHIVED after acknowledged conditional persistence. It retains the relationship and original evidence. This command does not remove a scheduler definition, withdraw a domain review or compensate work already performed.\n\n## Administrator Setup\n\nAn operator should first qualify the original employee's native permissions and the target connection in a disposable local runtime. Do not enable a production target solely because the synthetic acceptance suite passes.\n\nUse an existing deployment-owned nService alias and actual runtime authority. Configure the Copilot target and native Workflow receipt owner in their respective runtimes through normal layered `config/properties.js`:\n\n```js\nmodule.exports = {\n  copilot: {\n    workbench: {\n      processTriggerTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};\n```\n\nThe example does not create the connection, activate modules, enable the Copilot API, or grant an employee any permission. Never add URLs or service credentials to the command. A default connection is not an admissible trigger target.\n\n| Boundary | Required authority |\n| --- | --- |\n| Prepare any trigger command | EMPLOYEE actor, tenant and enterprise; `copilot.mutation.prepare` plus native command grant |\n| Create/update/archive | `process.trigger.manage`; native route access-group and exposure policy also apply |\n| Execute trigger | `process.trigger.execute`; native route access-group, activation and domain policy also apply |\n| Execute approved Copilot plan | Current `copilot.mutation.execute`, original actor/scope, exact revision/digest and unchanged qualified target |\n| Inspect original result | `copilot.mutation.reconcile`, prepare/execute grants, current native command grant and `process.backoffice.view` |\n| Write original native receipts | Native `commandReceipts.enabled` and `owners.workflow` |\n\nBoth trigger writes and receipt recovery are default-disabled. Disabling new writes does not erase original evidence or permit replay. Authorized original inspection remains possible with recording disabled; routing and current permissions must still match.\n\n## Recovery and Troubleshooting\n\nOriginal evidence uses the existing private `processCommandReceipt` model and shared native receipt protocol. The native inspection endpoint is:\n\n`POST /nodics/process/v0/triggers/{triggerCode}/commands/{kind}/receipt/query`\n\nIts exact body is `{ \"command\": originalNativeBody, \"idempotencyKey\": originalKey }`. The original body includes `code` and fixed `ownerModule` for creation. Normal users should use the confirmation's inspection button rather than reconstructing this input. Current record existence is never substituted for an original receipt.\n\n| Symptom | Meaning and next step |\n| --- | --- |\n| Configuration required | Qualify the existing owner alias, authority and enablement; do not select another owner as fallback |\n| Permission denied | Review the employee's effective native and Copilot permissions; an administrator title alone is insufficient |\n| Missing fields | Supply the named values and submit a new review; no mutation occurred during preparation |\n| Archived/inactive trigger | Review native state; execution must not silently reactivate it |\n| Stale revision | Reload the original confirmation; never substitute another revision by guessing |\n| Failed or ambiguous native write | The action remains unknown; inspect original evidence before any further action |\n| STARTED or missing receipt | Completion is unproven; no retry or success claim is permitted |\n| Completed start, later incident | Inspect the native instance; start acknowledgement is not full workflow success |\n\n## Customize and Extend Safely\n\nA developer extends the existing module through the normal later-layer contract; frontend rendering does not confer backend authority.\n\nPartners change only their project-owned later layer. For example, `<project>/modules/<overlay>/config/properties.js` may override:\n\n```js\nmodule.exports = {\n  copilot: { workbench: {\n    processTriggerTimeoutMs: 12000,\n    processTriggerPresentation: {\n      title: \"Workflow trigger review\",\n      summary: \"Review every proposed field before starting workflow activity.\"\n    }\n  } }\n};\n```\n\nAll other framework defaults remain inherited. The transport timeout must be an integer from 1,000 to 120,000 milliseconds; retries remain fixed at one attempt. Presentation overrides cannot add commands or weaken authorization.\n\nInputs allow safe identifiers up to 128 characters, leaf text up to 1,000 characters, nesting depth five, at most 40 entries per object/array and 100 reviewed leaves, and a native body at most 12,000 characters. Credential-like keys, executable objects, arbitrary endpoints and unknown top-level fields are rejected. Supply no secrets in context or metadata. Broader domain-specific payload shapes require an owner-reviewed adapter, not a copied generic executor.\n\nReview sections contain at most 20 fields each and preserve every leaf; long reviews are split, not truncated. Labels must fit the existing 128-character Axis contract. Excessively long nested paths are rejected before a plan is saved.\n\nWorkflow service overlays can tighten trigger lifecycle validation through normal service layering. Preserve insert-only creation, conditional writes, fresh acknowledged readback, exact employee/scope/input receipt binding and inspection without replay. Cron remains the only scheduler owner.\n\n## Verification and Evidence Boundary\n\n`copilotProcessTriggerAction.test.js` composes real Core, approval, executor, recovery, native metadata lifecycle and shared receipt logic using isolated stores. It checks all four commands, denied/drifted scope, stale/duplicate execution, write failure, malformed receipts, input bounds and later-layer presentation.\n\n`copilotProcessTriggerRuntime.live.test.js` separately enables real disposable Profile, Copilot, Workflow, MongoDB and local Ollama. It exercises all four commands, persisted native state, denied roles, restart and original receipts. Its response-loss case loses the reply only after the native trigger starts the instance, then reconciles after restart without a second start.\n\nAxis's confirmation tests cover the four explicit recovery identities. The `process-task-review.visual.html?mode=trigger` fixture renders the actual shared component with synthetic state for desktop/mobile review and unknown-outcome inspection. It is not evidence of a signed-in full Axis deployment. These checks qualify the bounded trigger adapter, not every Workflow operation or domain graph.\n\n## Common Mistakes\n\n- Treating CRON trigger metadata as an installed schedule. Configure scheduling through Cron's own governed journey and verify its separate lifecycle.\n- Treating ACTIVE status as sufficient when `active` is false. Both native execution prerequisites must hold; neither is silently repaired by Copilot.\n- Reusing an instance identifier to conceal an uncertain execution. Inspect the original action and receipt; do not attempt another trigger command as a probe.\n- Treating confirmation as permission. Native employee grants, current routing, lifecycle and domain rules are rechecked at execution.\n- Copying framework configuration defaults into a customer project. Override only the deployment choice or intentional presentation/timeout difference.\n",
      "previous": {
        "title": "Process Definition and Instance Actions in Copilot",
        "route": "/docs/framework/copilot/process-lifecycle-actions"
      },
      "next": {
        "title": "Process Task Actions in Copilot",
        "route": "/docs/framework/copilot/process-task-actions"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1746,
        "checksum": "f854ffda8a8eb064065d5b9bf01c46fb3bb243ff4bfe2abbda8d73e30f2ba74f"
      },
      "slug": "copilot-process-trigger-actions",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 35,
      "references": [
        {
          "documentId": "copilot.process-task-actions",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.process-inspection",
          "owner": "copilotCapability"
        },
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentcopilotProcessTaskActions",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.process-task-actions",
      "title": "Process Task Actions in Copilot",
      "route": "/docs/framework/copilot/process-task-actions",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Process Task Actions in Copilot"
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
      "summary": "Review and confirm fixed human task commands through native Workflow permissions, durable original receipts and uncertainty-safe inspection.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.29",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.process-inspection",
        "copilot.original-business-results"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotProcessTaskActionService.js",
        "test/copilotProcessTaskRuntime.live.test.js",
        "../../../nodics.process/modules/workflow/src/service/operation/defaultProcessTaskCommandReceiptService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "process",
        "tasks",
        "claim",
        "assign",
        "complete",
        "cancel",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Process",
        "Business Operations"
      ],
      "headings": [
        {
          "text": "Purpose and Ownership",
          "anchor": "copilotProcessTaskActions-1-purpose-and-ownership",
          "level": 2
        },
        {
          "text": "Employee Journey",
          "anchor": "copilotProcessTaskActions-2-employee-journey",
          "level": 2
        },
        {
          "text": "Optional Natural Language",
          "anchor": "copilotProcessTaskActions-3-optional-natural-language",
          "level": 2
        },
        {
          "text": "Administrator Setup",
          "anchor": "copilotProcessTaskActions-4-administrator-setup",
          "level": 2
        },
        {
          "text": "Execution and Original Results",
          "anchor": "copilotProcessTaskActions-5-execution-and-original-results",
          "level": 2
        },
        {
          "text": "Customize and Extend Safely",
          "anchor": "copilotProcessTaskActions-6-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotProcessTaskActions-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification and Evidence Limits",
          "anchor": "copilotProcessTaskActions-8-verification-and-evidence-limits",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "Purpose and Ownership",
          "anchor": "copilotProcessTaskActions-1-purpose-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Employees can prepare, review and confirm four existing Workflow operations: claim a task, assign a task, complete a task and cancel a task. Copilot does not execute a workflow itself. Workflow owns current task state, actor policy, assignee checks, decision validation, transitions, domain callbacks and audit."
        },
        {
          "kind": "paragraph",
          "text": "This is a bounded integration, not coverage of every Process operation. It does not author definitions, publish graphs, start instances, retry failed actions, compensate workflows or manage triggers. Task cancellation does not cancel an instance, withdraw a domain review or reverse a completed decision."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee Journey",
          "anchor": "copilotProcessTaskActions-2-employee-journey"
        },
        {
          "kind": "paragraph",
          "text": "For a beginner business user, a task is one pending unit of human work inside a workflow instance. Claiming takes responsibility; completion records a decision. Neither is interchangeable with approval of the Copilot proposal itself."
        },
        {
          "kind": "paragraph",
          "text": "The existing screen flow is **AI Copilot > Conversation > Review > Approve > Execute > Result**. No new task-management screen or separate approval system is required. Use Process inspection or the native Process page to identify the exact task first. Copilot does not resolve task names or guess identifiers."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open the intended enterprise and a conversation under your employee account.",
            "Enter an exact command from the examples below.",
            "Supply any requested missing identifier, assignee, reason or decision.",
            "Read the review. It lists the operation, task, executing employee and every supplied command field. Preparation has not modified a task and does not establish that the task exists or that Workflow will allow the transition.",
            "Approve the current review, then explicitly execute that approved revision. Editing the proposal or changing enterprise requires a new review.",
            "Check the command result. For completion, also inspect the native instance: a completed human task does not prove downstream domain actions succeeded.",
            "If the result is uncertain, inspect the original result. Do not repeat the task command or manufacture a replacement action to work around uncertainty."
          ]
        },
        {
          "kind": "table",
          "headers": [
            "Intent",
            "Example",
            "Native effect"
          ],
          "rows": [
            [
              "Claim",
              "`claim task review-42`",
              "Claims the open task for the current employee."
            ],
            [
              "Assign",
              "`assign task review-42 to reviewer-login`",
              "Reassigns an eligible task through native administrator policy."
            ],
            [
              "Complete",
              "Typed decision below",
              "Completes the task and invokes native workflow advancement."
            ],
            [
              "Cancel",
              "`cancel task review-42 because Duplicate request`",
              "Cancels the eligible task only. Domain-owned review cancellation may be refused."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"operation\": \"process.task.complete\",\n  \"taskCode\": \"review-42\",\n  \"decision\": {\n    \"approved\": false,\n    \"reason\": \"Required evidence is missing\"\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Typed operations accept exactly `operation`, `taskCode` and the operation-specific field: `assignee`, `decision` or `reason`. Claim has no extra input. Supported decision fields are `approved` (boolean), `reason`, `outcome`, `transitionCode` and `targetNodeCode`. Workflow still decides whether those fields are valid for the pinned graph and current actor. Emergency override, caller-supplied approval lists, arbitrary nested decision data, endpoints and credentials are not accepted by this adapter. Use the native governed journey when a policy requires another shape; do not encode it inside a reason."
        },
        {
          "kind": "paragraph",
          "text": "One plan contains one task command. Identifiers are bounded to 128 characters; reasons and other decision text to 1,000 characters. Unknown fields and malformed values are rejected. Missing values produce clarification rather than defaults. Task commands and results are excluded from later provider conversation context. Configured activity recording remains independent of provider-context eligibility."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Optional Natural Language",
          "anchor": "copilotProcessTaskActions-3-optional-natural-language"
        },
        {
          "kind": "paragraph",
          "text": "The exact short forms above do not call a model. With the existing accounted intent planner enabled, a sentence such as the following may also prepare a review:"
        },
        {
          "kind": "blockquote",
          "text": "Please complete task review-42 with approved false and reason Required evidence is missing"
        },
        {
          "kind": "paragraph",
          "text": "The model only extracts a proposal. Backend checks require literal identifiers and text, the requested command verb, and an explicit `approved true` or `approved false` for a proposed boolean decision. \"Complete this task\" is not authority to invent approval. Unrecognized or unsupported output asks for clarification. Provider failure or budget exhaustion cannot bypass review or use an unaccounted fallback. The preparation call consumes the existing token budget; typed preparation and native command execution do not require a model."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Setup",
          "anchor": "copilotProcessTaskActions-4-administrator-setup"
        },
        {
          "kind": "paragraph",
          "text": "An administrator or operator should qualify a synthetic workflow with the actual employee roles before enabling task commands for business users."
        },
        {
          "kind": "paragraph",
          "text": "Use the existing layered `config/properties.js` in the owning deployment. Select an already configured nService alias and its actual runtime authority. Do not put URLs, service credentials or a second runtime registry in Copilot properties."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: {\n    workbench: {\n      processTaskTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This example assumes that the deployment already owns a `process` alias with `PROCESS` authority. It does not create that connection or enable the Copilot API. Apply Workflow receipt settings to its runtime, not just the Copilot runtime. New Copilot task commands and original-result recovery are default-disabled."
        },
        {
          "kind": "table",
          "headers": [
            "Setting or grant",
            "Responsibility"
          ],
          "rows": [
            [
              "`copilot.workbench.processTaskTarget`",
              "Explicit write admission and pinned native target, separate from read-inspection configuration."
            ],
            [
              "`commandReceipts.enabled`, `owners.workflow`",
              "Native private original-command recording before any keyed task mutation."
            ],
            [
              "`copilot.mutation.prepare`",
              "Prepare an employee-owned review."
            ],
            [
              "`copilot.mutation.execute`",
              "Execute an approved current revision."
            ],
            [
              "`process.task.claim/assign/complete/cancel`",
              "Independent native grant matching the command. Native route access groups still apply."
            ],
            [
              "`copilot.mutation.reconcile`",
              "Independently inspect original action outcomes."
            ],
            [
              "`process.backoffice.view`",
              "Required by the native original task receipt inspection route."
            ],
            [
              "`copilot.workbench.receiptRecovery.enabled`",
              "Enable original-result inspection, not replay."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Employee access tokens and the enterprise header are forwarded unchanged. No service-token fallback exists. Workflow's record access, tenant isolation, reviewer policy and lifecycle validation remain mandatory even when Copilot grants are present. Permission and target changes invalidate pending execution."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Execution and Original Results",
          "anchor": "copilotProcessTaskActions-5-execution-and-original-results"
        },
        {
          "kind": "paragraph",
          "text": "The sequence is: private Copilot approval and row claim, private Workflow original command claim, native task operation, native acknowledgement validation, original receipt completion, then Copilot result persistence. These are not a distributed transaction. Failures between stages may legitimately leave an unknown outcome."
        },
        {
          "kind": "paragraph",
          "text": "Workflow stores `processCommandReceipt` through the existing nDatabase private journal protocol. It has no generic CRUD, BackOffice, event or cache exposure. Receipt identity binds tenant, enterprise, employee, command kind and original key; its digest binds the exact task identifier and body. A receipt records the original acknowledgement, not a guess based on a task that now looks completed."
        },
        {
          "kind": "paragraph",
          "text": "Native original evidence is read through `POST /nodics/process/v0/tasks/:taskCode/commands/:command/receipt/query` with `{ \"idempotencyKey\": \"original-key\", \"command\": { ...originalBody } }`. `:command` is only `claim`, `assign`, `complete` or `cancel`. The route requires employee authentication, Process view permission and the original native command permission. Copilot uses its existing **Inspect original business results** action; business users need not construct this request."
        },
        {
          "kind": "paragraph",
          "text": "Missing or STARTED evidence stays unknown. A positively verified COMPLETED receipt can close an uncertain Copilot action without repeating the task operation. Disabling new writes preserves authorized original-result inspection. Changing the target, employee, enterprise or reviewed payload cannot adopt another receipt. Historical unkeyed native commands have no backfilled receipt. Native calls with no key preserve their existing behavior; a present but malformed key is rejected, never silently treated as an unkeyed command."
        },
        {
          "kind": "table",
          "headers": [
            "Problem",
            "Meaning",
            "Next step"
          ],
          "rows": [
            [
              "Clarification",
              "Required input was not supplied.",
              "Supply explicit values and review again."
            ],
            [
              "Permission denied",
              "Copilot or native employee authority is absent.",
              "Ask the appropriate administrator; do not switch to service credentials."
            ],
            [
              "Approval revision conflict",
              "The displayed proof is stale.",
              "Reload the existing action."
            ],
            [
              "Outcome unknown",
              "Native dispatch or acknowledgement is uncertain.",
              "Inspect the original receipt; do not retry the mutation."
            ],
            [
              "Task completed but instance failed",
              "Decision and downstream execution have different outcomes.",
              "Inspect Process incidents and use native recovery policy."
            ],
            [
              "Native review cancellation refused",
              "Generic cancellation cannot implement the domain withdrawal contract.",
              "Follow the owning domain's withdrawal journey."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and Extend Safely",
          "anchor": "copilotProcessTaskActions-6-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Developers must extend the owning service through standard Nodics layering rather than replacing employee authorization with a frontend check."
        },
        {
          "kind": "paragraph",
          "text": "For a partner deployment, routing and admission overrides belong in its existing environment/server `config/properties.js`. For example, replacing only `copilot.workbench.processTaskTarget.connectionName` with `automationPeer` selects that existing alias; retain the true target authority. An empty or invalid alias must reject preparation. A later module may override the exported adapter `input` method to reject `targetNodeCode` for a stricter deployment, using the standard service layering contract. It must not broaden fixed routes or suppress the complete review, current grants, native policy, CAS or receipt checks."
        },
        {
          "kind": "paragraph",
          "text": "Workflow extensions belong in the existing Workflow lifecycle/policy services. Domain side effects stay in their native owners. Do not copy workflow execution into Copilot, Axis or a customer startup module. Runtime tests must qualify the effective later-layer implementation, not just its source declaration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotProcessTaskActions-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a task name as a stable task identifier can target the wrong work. Inspect the task and review its exact code before approval.",
            "Treating a completed task as a successful end-to-end workflow hides downstream incidents. Inspect the native instance and its activity after completion.",
            "Sending another command after a timeout can repeat business effects. Inspect the original result first; missing evidence is not permission to retry.",
            "Enabling Copilot routing without native receipt recording does not make a keyed task command executable. Qualify both runtime configurations."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification and Evidence Limits",
          "anchor": "copilotProcessTaskActions-8-verification-and-evidence-limits"
        },
        {
          "kind": "paragraph",
          "text": "Focused tests exercise review, approval, actor/enterprise/target drift, rejected inputs, native receipt binding, lost replies, duplicate dispatch prevention and configuration shutdown. Workflow tests cover exact assignment CAS/readback and existing completion/retirement/actor-policy boundaries. The opt-in `copilotProcessTaskRuntime.live.test.js` uses actual employee authentication, native task persistence, a local Ollama preparation, denial and restart inspection in disposable runtime storage. It does not certify every deployed Process graph, all policy decision shapes or customer domain callbacks. Screenshots and broad signed-in Axis acceptance are separate evidence, not implied by API tests."
        }
      ],
      "searchText": "Process Task Actions in Copilot Review and confirm fixed human task commands through native Workflow permissions, durable original receipts and uncertainty-safe inspection. # Process Task Actions in Copilot\n\n## Purpose and Ownership\n\nEmployees can prepare, review and confirm four existing Workflow operations: claim a task, assign a task, complete a task and cancel a task. Copilot does not execute a workflow itself. Workflow owns current task state, actor policy, assignee checks, decision validation, transitions, domain callbacks and audit.\n\nThis is a bounded integration, not coverage of every Process operation. It does not author definitions, publish graphs, start instances, retry failed actions, compensate workflows or manage triggers. Task cancellation does not cancel an instance, withdraw a domain review or reverse a completed decision.\n\n## Employee Journey\n\nFor a beginner business user, a task is one pending unit of human work inside a workflow instance. Claiming takes responsibility; completion records a decision. Neither is interchangeable with approval of the Copilot proposal itself.\n\nThe existing screen flow is **AI Copilot > Conversation > Review > Approve > Execute > Result**. No new task-management screen or separate approval system is required. Use Process inspection or the native Process page to identify the exact task first. Copilot does not resolve task names or guess identifiers.\n\n1. Open the intended enterprise and a conversation under your employee account.\n2. Enter an exact command from the examples below.\n3. Supply any requested missing identifier, assignee, reason or decision.\n4. Read the review. It lists the operation, task, executing employee and every supplied command field. Preparation has not modified a task and does not establish that the task exists or that Workflow will allow the transition.\n5. Approve the current review, then explicitly execute that approved revision. Editing the proposal or changing enterprise requires a new review.\n6. Check the command result. For completion, also inspect the native instance: a completed human task does not prove downstream domain actions succeeded.\n7. If the result is uncertain, inspect the original result. Do not repeat the task command or manufacture a replacement action to work around uncertainty.\n\n| Intent | Example | Native effect |\n| --- | --- | --- |\n| Claim | `claim task review-42` | Claims the open task for the current employee. |\n| Assign | `assign task review-42 to reviewer-login` | Reassigns an eligible task through native administrator policy. |\n| Complete | Typed decision below | Completes the task and invokes native workflow advancement. |\n| Cancel | `cancel task review-42 because Duplicate request` | Cancels the eligible task only. Domain-owned review cancellation may be refused. |\n\n```json\n{\n  \"operation\": \"process.task.complete\",\n  \"taskCode\": \"review-42\",\n  \"decision\": {\n    \"approved\": false,\n    \"reason\": \"Required evidence is missing\"\n  }\n}\n```\n\nTyped operations accept exactly `operation`, `taskCode` and the operation-specific field: `assignee`, `decision` or `reason`. Claim has no extra input. Supported decision fields are `approved` (boolean), `reason`, `outcome`, `transitionCode` and `targetNodeCode`. Workflow still decides whether those fields are valid for the pinned graph and current actor. Emergency override, caller-supplied approval lists, arbitrary nested decision data, endpoints and credentials are not accepted by this adapter. Use the native governed journey when a policy requires another shape; do not encode it inside a reason.\n\nOne plan contains one task command. Identifiers are bounded to 128 characters; reasons and other decision text to 1,000 characters. Unknown fields and malformed values are rejected. Missing values produce clarification rather than defaults. Task commands and results are excluded from later provider conversation context. Configured activity recording remains independent of provider-context eligibility.\n\n## Optional Natural Language\n\nThe exact short forms above do not call a model. With the existing accounted intent planner enabled, a sentence such as the following may also prepare a review:\n\nPlease complete task review-42 with approved false and reason Required evidence is missing\n\nThe model only extracts a proposal. Backend checks require literal identifiers and text, the requested command verb, and an explicit `approved true` or `approved false` for a proposed boolean decision. \"Complete this task\" is not authority to invent approval. Unrecognized or unsupported output asks for clarification. Provider failure or budget exhaustion cannot bypass review or use an unaccounted fallback. The preparation call consumes the existing token budget; typed preparation and native command execution do not require a model.\n\n## Administrator Setup\n\nAn administrator or operator should qualify a synthetic workflow with the actual employee roles before enabling task commands for business users.\n\nUse the existing layered `config/properties.js` in the owning deployment. Select an already configured nService alias and its actual runtime authority. Do not put URLs, service credentials or a second runtime registry in Copilot properties.\n\n```js\nmodule.exports = {\n  copilot: {\n    workbench: {\n      processTaskTarget: {\n        enabled: true,\n        moduleName: \"workflow\",\n        connectionName: \"process\",\n        targetAuthority: { runtimeRole: \"PROCESS\" }\n      },\n      receiptRecovery: { enabled: true }\n    },\n    core: { intentPlanning: { enabled: true } }\n  },\n  commandReceipts: { enabled: true, owners: { workflow: true } }\n};\n```\n\nThis example assumes that the deployment already owns a `process` alias with `PROCESS` authority. It does not create that connection or enable the Copilot API. Apply Workflow receipt settings to its runtime, not just the Copilot runtime. New Copilot task commands and original-result recovery are default-disabled.\n\n| Setting or grant | Responsibility |\n| --- | --- |\n| `copilot.workbench.processTaskTarget` | Explicit write admission and pinned native target, separate from read-inspection configuration. |\n| `commandReceipts.enabled`, `owners.workflow` | Native private original-command recording before any keyed task mutation. |\n| `copilot.mutation.prepare` | Prepare an employee-owned review. |\n| `copilot.mutation.execute` | Execute an approved current revision. |\n| `process.task.claim/assign/complete/cancel` | Independent native grant matching the command. Native route access groups still apply. |\n| `copilot.mutation.reconcile` | Independently inspect original action outcomes. |\n| `process.backoffice.view` | Required by the native original task receipt inspection route. |\n| `copilot.workbench.receiptRecovery.enabled` | Enable original-result inspection, not replay. |\n\nEmployee access tokens and the enterprise header are forwarded unchanged. No service-token fallback exists. Workflow's record access, tenant isolation, reviewer policy and lifecycle validation remain mandatory even when Copilot grants are present. Permission and target changes invalidate pending execution.\n\n## Execution and Original Results\n\nThe sequence is: private Copilot approval and row claim, private Workflow original command claim, native task operation, native acknowledgement validation, original receipt completion, then Copilot result persistence. These are not a distributed transaction. Failures between stages may legitimately leave an unknown outcome.\n\nWorkflow stores `processCommandReceipt` through the existing nDatabase private journal protocol. It has no generic CRUD, BackOffice, event or cache exposure. Receipt identity binds tenant, enterprise, employee, command kind and original key; its digest binds the exact task identifier and body. A receipt records the original acknowledgement, not a guess based on a task that now looks completed.\n\nNative original evidence is read through `POST /nodics/process/v0/tasks/:taskCode/commands/:command/receipt/query` with `{ \"idempotencyKey\": \"original-key\", \"command\": { ...originalBody } }`. `:command` is only `claim`, `assign`, `complete` or `cancel`. The route requires employee authentication, Process view permission and the original native command permission. Copilot uses its existing **Inspect original business results** action; business users need not construct this request.\n\nMissing or STARTED evidence stays unknown. A positively verified COMPLETED receipt can close an uncertain Copilot action without repeating the task operation. Disabling new writes preserves authorized original-result inspection. Changing the target, employee, enterprise or reviewed payload cannot adopt another receipt. Historical unkeyed native commands have no backfilled receipt. Native calls with no key preserve their existing behavior; a present but malformed key is rejected, never silently treated as an unkeyed command.\n\n| Problem | Meaning | Next step |\n| --- | --- | --- |\n| Clarification | Required input was not supplied. | Supply explicit values and review again. |\n| Permission denied | Copilot or native employee authority is absent. | Ask the appropriate administrator; do not switch to service credentials. |\n| Approval revision conflict | The displayed proof is stale. | Reload the existing action. |\n| Outcome unknown | Native dispatch or acknowledgement is uncertain. | Inspect the original receipt; do not retry the mutation. |\n| Task completed but instance failed | Decision and downstream execution have different outcomes. | Inspect Process incidents and use native recovery policy. |\n| Native review cancellation refused | Generic cancellation cannot implement the domain withdrawal contract. | Follow the owning domain's withdrawal journey. |\n\n## Customize and Extend Safely\n\nDevelopers must extend the owning service through standard Nodics layering rather than replacing employee authorization with a frontend check.\n\nFor a partner deployment, routing and admission overrides belong in its existing environment/server `config/properties.js`. For example, replacing only `copilot.workbench.processTaskTarget.connectionName` with `automationPeer` selects that existing alias; retain the true target authority. An empty or invalid alias must reject preparation. A later module may override the exported adapter `input` method to reject `targetNodeCode` for a stricter deployment, using the standard service layering contract. It must not broaden fixed routes or suppress the complete review, current grants, native policy, CAS or receipt checks.\n\nWorkflow extensions belong in the existing Workflow lifecycle/policy services. Domain side effects stay in their native owners. Do not copy workflow execution into Copilot, Axis or a customer startup module. Runtime tests must qualify the effective later-layer implementation, not just its source declaration.\n\n## Common Mistakes\n\n- Treating a task name as a stable task identifier can target the wrong work. Inspect the task and review its exact code before approval.\n- Treating a completed task as a successful end-to-end workflow hides downstream incidents. Inspect the native instance and its activity after completion.\n- Sending another command after a timeout can repeat business effects. Inspect the original result first; missing evidence is not permission to retry.\n- Enabling Copilot routing without native receipt recording does not make a keyed task command executable. Qualify both runtime configurations.\n\n## Verification and Evidence Limits\n\nFocused tests exercise review, approval, actor/enterprise/target drift, rejected inputs, native receipt binding, lost replies, duplicate dispatch prevention and configuration shutdown. Workflow tests cover exact assignment CAS/readback and existing completion/retirement/actor-policy boundaries. The opt-in `copilotProcessTaskRuntime.live.test.js` uses actual employee authentication, native task persistence, a local Ollama preparation, denial and restart inspection in disposable runtime storage. It does not certify every deployed Process graph, all policy decision shapes or customer domain callbacks. Screenshots and broad signed-in Axis acceptance are separate evidence, not implied by API tests.\n",
      "previous": {
        "title": "Process Trigger Actions in Copilot",
        "route": "/docs/framework/copilot/process-trigger-actions"
      },
      "next": {
        "title": "Data-release Inspection in Copilot",
        "route": "/docs/framework/copilot/import-inspection"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1557,
        "checksum": "c69767a18fcea6296692575b34192e2c8053845d9c7d01d79bdc15dd8231cdac"
      },
      "slug": "copilot-process-task-actions",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 34,
      "references": [
        {
          "documentId": "copilot.process-inspection",
          "owner": "copilotCapability"
        },
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record5": {
    "code": "nodicsDocsComponentcopilotSecureCouponFulfillment",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.secure-coupon-fulfillment",
      "title": "Secure Coupon Fulfillment",
      "route": "/docs/framework/copilot/secure-coupon-fulfillment",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Secure Coupon Fulfillment"
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
      "summary": "Validate, review and confirm native merchant fulfillment, then inspect original receipts after uncertain outcomes without replay.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.27",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.original-business-results",
        "copilot.standalone-business-actions",
        "digital.purchase-delivery-reveal",
        "promotion.campaigns-coupon-issuance"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotCouponActionService.js",
        "test/copilotCouponRuntime.live.test.js",
        "../../../nodics.commerce/modules/digitalCommerce/modules/digitalCore/src/service/defaultDigitalCommerceMerchantService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service",
        "test/copilotCouponAction.test.js",
        "llm/examples/secure-coupon-fulfillment.md",
        "llm/contracts/README.md"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "coupon",
        "merchant",
        "fulfillment",
        "redemption",
        "receipt"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Business Operations",
        "Coupon Fulfillment",
        "Recovery"
      ],
      "headings": [
        {
          "text": "Availability and prerequisites",
          "anchor": "copilotSecureCouponFulfillment-1-availability-and-prerequisites",
          "level": 2
        },
        {
          "text": "Configure and open",
          "anchor": "copilotSecureCouponFulfillment-2-configure-and-open",
          "level": 2
        },
        {
          "text": "Complete a redemption",
          "anchor": "copilotSecureCouponFulfillment-3-complete-a-redemption",
          "level": 2
        },
        {
          "text": "Review redemption activity",
          "anchor": "copilotSecureCouponFulfillment-4-review-redemption-activity",
          "level": 2
        },
        {
          "text": "Simulated ITEM visibility is read-only, not a Copilot action",
          "anchor": "copilot-coupon-simulation-read-boundary",
          "level": 2
        },
        {
          "text": "Screen and owner flow",
          "anchor": "copilotSecureCouponFulfillment-5-screen-and-owner-flow",
          "level": 2
        },
        {
          "text": "Recover an uncertain result",
          "anchor": "copilotSecureCouponFulfillment-6-recover-an-uncertain-result",
          "level": 2
        },
        {
          "text": "API and privacy contract",
          "anchor": "copilotSecureCouponFulfillment-7-api-and-privacy-contract",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "copilotSecureCouponFulfillment-8-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "copilotSecureCouponFulfillment-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotSecureCouponFulfillment-10-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Canonical functional owner: `nodics.copilot`. Technical coordinator: `copilotWorkbench`. Digital Core owns merchant validation and fulfillment receipts; Promotion owns coupon eligibility and redemption; Profile owns staff identity, permissions and issuer/outlet scope. Axis displays these contracts."
        },
        {
          "kind": "paragraph",
          "text": "Beginners and business users should follow **Complete a redemption** after an administrator has enabled the capability. Operators own setup and uncertain result investigation. Developers should use **Customize and extend safely** before changing configuration or integrating another native provider."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Availability and prerequisites",
          "anchor": "copilotSecureCouponFulfillment-1-availability-and-prerequisites"
        },
        {
          "kind": "paragraph",
          "text": "This optional capability is disabled by default. It does not grant employee permissions, create a merchant, settle an external POS transaction or enable a provider merely because its form appears."
        },
        {
          "kind": "table",
          "headers": [
            "Requirement",
            "Owner and configuration"
          ],
          "rows": [
            [
              "Copilot route admission and private action storage",
              "Copilot API/Policy/Workbench and generated persistence"
            ],
            [
              "Operational Commerce connection",
              "Existing named `digitalCore` connection with `COMMERCE` authority"
            ],
            [
              "Secure adapter",
              "`copilot.workbench.couponTarget.enabled: true`"
            ],
            [
              "Preparation",
              "`copilot.mutation.prepare`, `commerce.coupon.pos.redeem`, `profile.scope.read` plus normal route admission"
            ],
            [
              "Redemption activity",
              "`copilot.data.query`, `commerce.coupon.pos.redeem` plus current Profile staff scope"
            ],
            [
              "Execution and original receipt inspection",
              "Additionally `copilot.mutation.execute`"
            ],
            [
              "Issuer and outlet access",
              "Live Profile scope assignment, independently checked by Digital Core"
            ],
            [
              "Bounded issuer display lookup",
              "Commerce runtime credential with `profile.enterprise.reference.read`"
            ],
            [
              "Native merchant readiness",
              "Digital Core merchant provider, Promotion eligibility and any selected outlet/pricing prerequisites"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The runtime credential is only for Profile's bounded reference lookup. Human fulfillment continues with the original employee identity. An employee's authenticated partition is not automatically an issuing merchant scope."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configure and open",
          "anchor": "copilotSecureCouponFulfillment-2-configure-and-open"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Deploy the normal owner modules and generated private action persistence. Keep sensitive-request logging protection enabled.",
            "Configure the operational Commerce connection through existing runtime configuration. Do not reuse a Staged product-authoring target.",
            "Enable the adapter through the project's existing external configuration layer. The example connection must already exist:"
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "   module.exports = {\n     copilot: {\n       workbench: {\n         couponTarget: {\n           enabled: true,\n           moduleName: \"digitalCore\",\n           connectionName: \"commerce-owner\",\n           targetAuthority: { runtimeRole: \"COMMERCE\" },\n         },\n       },\n     },\n   };"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Assign the approved employee permissions and actual enterprise/outlet scope through Profile. Never substitute a browser flag or service credential.",
            "Qualify native provider readiness separately. `MERCHANT_SCREEN` is staff fulfillment attestation; `LOCAL_SAMPLE` is test evidence. Neither proves an unintegrated external POS has settled a purchase.",
            "Reload Axis and open AI & Copilot, then the conversation page. The fresh context response advertises **Redeem a coupon** only when configured and authorized. The Workspace dashboard remains separate from conversation."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Complete a redemption",
          "anchor": "copilotSecureCouponFulfillment-3-complete-a-redemption"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Select **Redeem a coupon**. Opening the form only loads authorized input metadata; it does not validate or redeem a code.",
            "Enter the customer-presented code in the masked field and the original transaction/receipt reference. Select an authorized outlet when required. For priced benefits use the source-reference label supplied by the owner.",
            "Select **Validate and review**. The transient code clears immediately. The sensitive request goes to native validation, not a language model or chat.",
            "Review the issuer, benefit, receipt, outlet, proof expiry and entitlement revision. Supported priced benefits include the original source revision, currency and amounts. Unsupported benefit shapes are rejected, not hidden.",
            "Select **Approve reviewed fulfillment**. Approval binds the exact plan digest and revision. It neither performs fulfillment nor grants missing authority.",
            "Only after providing the benefit, select **Confirm fulfilled benefit and redeem**. One durable action claim precedes the original employee command.",
            "Keep the action reference. After navigation, **Open existing action** reloads it with current backend ownership checks. Never use a new action as a retry for an uncertain original fulfillment."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Review redemption activity",
          "anchor": "copilotSecureCouponFulfillment-4-review-redemption-activity"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **Redeem a coupon**, then select **Redemption activity**. Axis requests the current Digital Core queue only when this tab is selected.",
            "Review the product, claim status and receipt reference. The table is bounded to 100 owner records and shows an explicit recovery marker when the original receipt requires investigation.",
            "Select **Refresh activity** for a new owner read. Refresh never validates, claims, confirms or retries a coupon.",
            "Treat the list as current enterprise-scoped operational evidence, not a ledger total or customer history. Coupon tokens, customer identities and native command keys are excluded from the Copilot and Axis contracts."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "anchor": "copilot-coupon-simulation-read-boundary",
          "text": "Simulated ITEM visibility is read-only, not a Copilot action"
        },
        {
          "kind": "paragraph",
          "text": "Digital Core may expose an existing LOCAL_SIMULATION merchant outcome through its enterprise-scoped queue or original receipt query. Copilot preserves that owner-authored meaning without implementing ITEM preparation, approval or execution. Real ITEM and simulated ITEM benefit shapes remain unsupported by this adapter: its existing benefit parser admits PRICED_CART only. A visible queue row, a receipt marked COMPLETED, an enabled coupon form or a human-approved Local simulation cannot create an ITEM plan or grant mutation authority. Use digital.purchase-delivery-reveal#digital-local-item-simulation for the native owner path."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"simulated\": true,\n  \"deliveryVerified\": false,\n  \"evidenceMode\": \"LOCAL_SIMULATION\"\n}"
        },
        {
          "kind": "table",
          "headers": [
            "Read surface or boundary",
            "Required behavior",
            "Excluded meaning or effect"
          ],
          "rows": [
            [
              "Merchant queue",
              "Each native row may retain only the complete exact simulation triad alongside bounded minimized fields",
              "No raw token, buyer identity, private command, arbitrary delivery proof or new plan"
            ],
            [
              "UNCONFIRMED original receipt",
              "Return the triad at response top level when native evidence includes it; keep the original action uncertain",
              "No confirmation, provider call, redemption retry or inference that goods were delivered"
            ],
            [
              "COMPLETED original receipt",
              "Return the triad only after exact original entitlement/key/receipt/outlet binding, current authority and acknowledged action CAS",
              "Workflow reconciliation is not immutable physical delivery or permission to execute ITEM"
            ],
            [
              "Malformed tags",
              "Partial, contradictory, coerced, inherited, hidden or accessor fields refuse; getters are not evaluated by simulationTags",
              "Never repair a partial triad or infer it from request, authentication, environment or configuration"
            ],
            [
              "No native tags",
              "Return no simulation/verification fields",
              "Absence never asserts verified delivery"
            ],
            [
              "Preparation / execution",
              "Reject ITEM and simulated ITEM owner evidence before creating a plan; unexpected simulated completion evidence cannot confirm an ordinary execution",
              "No ITEM mutation support, new provider, alternate plan shape or retry"
            ]
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Native[Digital original queue or receipt] --> Auth[Existing employee and native read authority]\n  Auth --> Tags{Owner simulation tags?}\n  Tags -->|Absent| Ordinary[Ordinary minimized projection - no verification inference]\n  Tags -->|Complete exact triad| Sim[Explicit simulated and deliveryVerified false]\n  Tags -->|Partial or contradictory| Refuse[Refuse response - no completion]\n  Sim --> Receipt[Original receipt binding and action CAS still required]\n  Receipt --> Read[Read or reconcile existing outcome only]\n  Item[ITEM preparation or execution request] --> Unsupported[Unsupported - no new plan or dispatch]"
        },
        {
          "kind": "paragraph",
          "text": "Read projection uses the existing signed employee credential, fixed Digital Core routes, independently required permissions and post-read target/grant checks. Receipt reconciliation can advance the original uncertain Copilot action only from the exact committed original command and a positively acknowledged revision CAS; the native operation is inspection-only. A timeout, mismatched receipt, missing owner, revoked scope or malformed tags preserves uncertainty. Do not call confirm again, replace the key or use a simulation label as delivery proof."
        },
        {
          "kind": "paragraph",
          "text": "Fulfillment simulation is explicitly unverified and nonimmutable: its deterministic hash is correlation, not authentication or a physical receipt. Digital coordination timestamps and generic DELIVERED status retain a different workflow meaning. Frontends and AI tools must preserve the complete native triad and present simulated/unverified goods, never a money discount or verified delivery. Already-redeemed benefit inverses remain disabled; see promotion.campaigns-coupon-issuance#promotion-used-benefit-inverses-disabled. Queue visibility adds no RELEASE, replenishment, used-coupon refund or compensation authority."
        },
        {
          "kind": "paragraph",
          "text": "Partners may narrow existing read admission and customize presentation through the owning later layer, but must retain descriptor-based tag validation, private-field minimization, exact original authority and receipts, and explicit unsupported ITEM preparation/execution. Add regressions for every partial tag combination, wrong values/types, inherited/accessor/hidden fields, both receipt states, ordinary absent-tag rows, concurrent original inspection and no second confirmation. copilotCouponAction.test.js exercises actual Core queue/reconciliation with isolated owner ports; its 30 source cases do not requalify historical native tests, current installed deployment, browser behavior, ITEM mutation or goods delivery."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Screen and owner flow",
          "anchor": "copilotSecureCouponFulfillment-5-screen-and-owner-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  A[Conversation] --> B[Secure masked form]\n  A --> Q[Redemption activity]\n  Q --> R[One employee-authorized Digital Core queue read]\n  R --> S[Bounded minimized table]\n  B --> C[Validate with Digital Core, Profile and Promotion]\n  C --> D[Minimized private proof and review]\n  D --> E[Explicit approval: no fulfillment write]\n  E --> F[Explicit fulfillment confirmation]\n  F --> G[Durable claim and native owner command]\n  G --> H{Exact completion evidence?}\n  H -->|Yes| I[Confirmed native receipt]\n  H -->|No| J[Retain uncertain action]\n  J --> K[Reload and inspect original receipt]\n  K --> L{Exact original evidence?}\n  L -->|Yes| I\n  L -->|No| J"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Recover an uncertain result",
          "anchor": "copilotSecureCouponFulfillment-6-recover-an-uncertain-result"
        },
        {
          "kind": "paragraph",
          "text": "A timeout or lost acknowledgement is not evidence that the benefit was not provided. Copilot stops further fulfillment and retains the original action."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Select **Reload action**. `EXECUTING` and `OUTCOME_UNKNOWN` actions can expose **Check original receipt**.",
            "Inspect the original receipt. This is read-only at the native owner; it does not invoke confirm, redeem, claim, a provider or a new command key.",
            "Only native `REDEEMED` state plus the exact original committed receipt can complete the existing action. Current permissions, target, staff scope and evidence are rechecked before the action revision is advanced atomically.",
            "Missing evidence, incomplete commits, changed outlets or lost scope remain unconfirmed. An authorized Commerce operator must investigate the original command through its owner workflow. Do not create a replacement fulfillment."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Approval expiry prevents new execution, not inspection of an old completion. Concurrent inspection cannot produce two action completions."
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Interpretation and next step"
          ],
          "rows": [
            [
              "Secure form absent",
              "Check adapter target, current context and preparation grants; do not widen default roles"
            ],
            [
              "Validation denied",
              "Check current employee merchant/outlet scope and native eligibility"
            ],
            [
              "Proof expired or review changed",
              "Obtain fresh native validation and explicitly review again"
            ],
            [
              "Stale action revision",
              "Reload the existing action; never overwrite a newer decision"
            ],
            [
              "Outcome unknown after restart",
              "Inspect the original receipt, not a second confirmation"
            ],
            [
              "Receipt mismatch or owner unavailable",
              "Preserve uncertainty and investigate with the owner"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API and privacy contract",
          "anchor": "copilotSecureCouponFulfillment-7-api-and-privacy-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Entry",
            "Purpose"
          ],
          "rows": [
            [
              "`GET /copilotApi/v0/coupons/workspace`",
              "Authorized form metadata"
            ],
            [
              "`GET /copilotApi/v0/coupons/redemptions`",
              "Bounded, minimized merchant redemption activity"
            ],
            [
              "`POST /copilotApi/v0/coupons/prepare`",
              "Sensitive validation and private review"
            ],
            [
              "Existing confirmation approve/reject/execute/get",
              "Revision/digest-bound action lifecycle"
            ],
            [
              "`POST /copilotApi/v0/confirmations/:confirmationCode/coupon-receipt`",
              "Reconcile the original receipt"
            ],
            [
              "`POST /digitalCore/v0/merchant/redemptions/:code/receipt/query`",
              "Current employee-scoped native evidence"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Deployment prefixes follow normal module exposure. Preparation accepts only `couponToken`, `merchantReceiptReference` and optional `storeCode`. Inspection accepts `expectedRevision` and `argumentsDigest`; callers cannot replace the target, command key or receipt. Private actions retain minimized proof/review, not the raw token or customer identity. Native business `deliveredAt` is distinct from framework-owned persistence `created`/`updated` timestamps."
        },
        {
          "kind": "paragraph",
          "text": "Recognized coupon-redemption messages are redirected before provider invocation or conversation persistence. Only neutral guidance is retained and excluded from future provider context. This is not universal secret detection or historical cleansing: never paste codes into ordinary chat, titles, receipt references or free-form review fields."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "copilotSecureCouponFulfillment-8-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Use the project's existing external properties file loaded by `nConfig`, not a new customer kickoff service or edits to generated framework defaults. A project may name that file `config/properties.js`; its deployment must select the file through the existing configuration contract. Framework defaults live at `nodics.copilot/modules/copilotWorkbench/config/properties.js` and are reference material, not the project's customization destination."
        },
        {
          "kind": "paragraph",
          "text": "For example, merge these labels into the existing project configuration:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  copilot: {\n    workbench: {\n      couponPresentation: {\n        open: \"Redeem customer coupon\",\n        redemptionsTab: \"Recent fulfillment activity\",\n        refreshRedemptions: \"Refresh fulfillment activity\",\n        receipt: \"Original till receipt reference\",\n        execute: \"Confirm benefit provided and redeem\",\n      },\n    },\n  },\n};"
        },
        {
          "kind": "paragraph",
          "text": "Keep all effective labels bounded and nonempty. Preserve the remaining default labels and re-run context/UI tests after applying the layered configuration. Changing labels cannot disable review, approval, native authority, sensitive logging, revision checks, token minimization or original-command recovery. Changing a target invalidates old plans and requires new validation/review."
        },
        {
          "kind": "paragraph",
          "text": "New providers or benefit shapes require native domain qualification, strict DTO parsing and regression tests before UI support. There is no supported generic API executor or direct coupon-status database override. Verify malformed labels, revoked permissions, expired proofs, stale revisions, mismatched receipts and uncertain outcomes; each must reject safely or retain uncertainty."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "copilotSecureCouponFulfillment-9-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating approval as execution: approval only records the reviewed decision.",
            "Using enterprise identity as merchant access: Profile staff scope is separate.",
            "Pasting raw codes into ordinary chat or receipt fields: use the masked form.",
            "Retrying a timeout by creating another action: inspect the original receipt.",
            "Treating staff attestation as external POS settlement: qualify that provider separately before making a settlement claim.",
            "Treating the activity table as a complete ledger or retry control: it is a bounded read and never repeats fulfillment.",
            "Updating coupon status directly or bypassing the native owner: no supported customization permits this."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotSecureCouponFulfillment-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "From the framework root, with a local MongoDB replica set, Elasticsearch binary and Ollama available:"
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \\\nNODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \\\nNODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \\\nnode --test nodics.copilot/modules/copilotWorkbench/test/copilotCouponRuntime.live.test.js"
        },
        {
          "kind": "paragraph",
          "text": "The fixture owns private namespaces, ports and Platform/operational Commerce processes. It creates a synthetic campaign and real native reservation, sale, entitlement and delivery records; its paid-order reference is a prerequisite, not payment-checkout acceptance. Cleanup removes only fixture-owned resources."
        },
        {
          "kind": "paragraph",
          "text": "The focused unit and Axis suites additionally prove the fixed merchant queue, independent read permission, post-read policy recheck, strict 100-row bound, private-field minimization and uncached UI transport. The three live scenarios prove authorized fulfillment, actual native response loss with read-only recovery after restart, and a recognized coupon conversation with local Ollama availability but zero model calls/raw-token persistence. They also check reader denial, an employee with no merchant scope, approval without fulfillment, stale revisions and exactly one native confirmation."
        },
        {
          "kind": "paragraph",
          "text": "This qualifies the local `MERCHANT_SCREEN` profile without outlet or monetary benefit selection. It does not qualify external POS, activated pricing, publication, production deployment or a new signed-in browser journey. Axis component/visual fixtures are separate UI evidence. CMS data validation is not publication or visual acceptance."
        }
      ],
      "searchText": "Secure Coupon Fulfillment Validate, review and confirm native merchant fulfillment, then inspect original receipts after uncertain outcomes without replay. # Secure Coupon Fulfillment\n\nCanonical functional owner: `nodics.copilot`. Technical coordinator: `copilotWorkbench`. Digital Core owns merchant validation and fulfillment receipts; Promotion owns coupon eligibility and redemption; Profile owns staff identity, permissions and issuer/outlet scope. Axis displays these contracts.\n\nBeginners and business users should follow **Complete a redemption** after an administrator has enabled the capability. Operators own setup and uncertain result investigation. Developers should use **Customize and extend safely** before changing configuration or integrating another native provider.\n\n## Availability and prerequisites\n\nThis optional capability is disabled by default. It does not grant employee permissions, create a merchant, settle an external POS transaction or enable a provider merely because its form appears.\n\n| Requirement | Owner and configuration |\n| --- | --- |\n| Copilot route admission and private action storage | Copilot API/Policy/Workbench and generated persistence |\n| Operational Commerce connection | Existing named `digitalCore` connection with `COMMERCE` authority |\n| Secure adapter | `copilot.workbench.couponTarget.enabled: true` |\n| Preparation | `copilot.mutation.prepare`, `commerce.coupon.pos.redeem`, `profile.scope.read` plus normal route admission |\n| Redemption activity | `copilot.data.query`, `commerce.coupon.pos.redeem` plus current Profile staff scope |\n| Execution and original receipt inspection | Additionally `copilot.mutation.execute` |\n| Issuer and outlet access | Live Profile scope assignment, independently checked by Digital Core |\n| Bounded issuer display lookup | Commerce runtime credential with `profile.enterprise.reference.read` |\n| Native merchant readiness | Digital Core merchant provider, Promotion eligibility and any selected outlet/pricing prerequisites |\n\nThe runtime credential is only for Profile's bounded reference lookup. Human fulfillment continues with the original employee identity. An employee's authenticated partition is not automatically an issuing merchant scope.\n\n## Configure and open\n\n1. Deploy the normal owner modules and generated private action persistence. Keep sensitive-request logging protection enabled.\n2. Configure the operational Commerce connection through existing runtime configuration. Do not reuse a Staged product-authoring target.\n3. Enable the adapter through the project's existing external configuration layer. The example connection must already exist:\n\n```js\n   module.exports = {\n     copilot: {\n       workbench: {\n         couponTarget: {\n           enabled: true,\n           moduleName: \"digitalCore\",\n           connectionName: \"commerce-owner\",\n           targetAuthority: { runtimeRole: \"COMMERCE\" },\n         },\n       },\n     },\n   };\n```\n\n1. Assign the approved employee permissions and actual enterprise/outlet scope through Profile. Never substitute a browser flag or service credential.\n2. Qualify native provider readiness separately. `MERCHANT_SCREEN` is staff fulfillment attestation; `LOCAL_SAMPLE` is test evidence. Neither proves an unintegrated external POS has settled a purchase.\n3. Reload Axis and open AI & Copilot, then the conversation page. The fresh context response advertises **Redeem a coupon** only when configured and authorized. The Workspace dashboard remains separate from conversation.\n\n## Complete a redemption\n\n1. Select **Redeem a coupon**. Opening the form only loads authorized input metadata; it does not validate or redeem a code.\n2. Enter the customer-presented code in the masked field and the original transaction/receipt reference. Select an authorized outlet when required. For priced benefits use the source-reference label supplied by the owner.\n3. Select **Validate and review**. The transient code clears immediately. The sensitive request goes to native validation, not a language model or chat.\n4. Review the issuer, benefit, receipt, outlet, proof expiry and entitlement revision. Supported priced benefits include the original source revision, currency and amounts. Unsupported benefit shapes are rejected, not hidden.\n5. Select **Approve reviewed fulfillment**. Approval binds the exact plan digest and revision. It neither performs fulfillment nor grants missing authority.\n6. Only after providing the benefit, select **Confirm fulfilled benefit and redeem**. One durable action claim precedes the original employee command.\n7. Keep the action reference. After navigation, **Open existing action** reloads it with current backend ownership checks. Never use a new action as a retry for an uncertain original fulfillment.\n\n## Review redemption activity\n\n1. Open **Redeem a coupon**, then select **Redemption activity**. Axis requests the current Digital Core queue only when this tab is selected.\n2. Review the product, claim status and receipt reference. The table is bounded to 100 owner records and shows an explicit recovery marker when the original receipt requires investigation.\n3. Select **Refresh activity** for a new owner read. Refresh never validates, claims, confirms or retries a coupon.\n4. Treat the list as current enterprise-scoped operational evidence, not a ledger total or customer history. Coupon tokens, customer identities and native command keys are excluded from the Copilot and Axis contracts.\n\n## Simulated ITEM visibility is read-only, not a Copilot action\n\nDigital Core may expose an existing LOCAL_SIMULATION merchant outcome through its enterprise-scoped queue or original receipt query. Copilot preserves that owner-authored meaning without implementing ITEM preparation, approval or execution. Real ITEM and simulated ITEM benefit shapes remain unsupported by this adapter: its existing benefit parser admits PRICED_CART only. A visible queue row, a receipt marked COMPLETED, an enabled coupon form or a human-approved Local simulation cannot create an ITEM plan or grant mutation authority. Use digital.purchase-delivery-reveal#digital-local-item-simulation for the native owner path.\n\n```json\n{\n  \"simulated\": true,\n  \"deliveryVerified\": false,\n  \"evidenceMode\": \"LOCAL_SIMULATION\"\n}\n```\n\n| Read surface or boundary | Required behavior | Excluded meaning or effect |\n| --- | --- | --- |\n| Merchant queue | Each native row may retain only the complete exact simulation triad alongside bounded minimized fields | No raw token, buyer identity, private command, arbitrary delivery proof or new plan |\n| UNCONFIRMED original receipt | Return the triad at response top level when native evidence includes it; keep the original action uncertain | No confirmation, provider call, redemption retry or inference that goods were delivered |\n| COMPLETED original receipt | Return the triad only after exact original entitlement/key/receipt/outlet binding, current authority and acknowledged action CAS | Workflow reconciliation is not immutable physical delivery or permission to execute ITEM |\n| Malformed tags | Partial, contradictory, coerced, inherited, hidden or accessor fields refuse; getters are not evaluated by simulationTags | Never repair a partial triad or infer it from request, authentication, environment or configuration |\n| No native tags | Return no simulation/verification fields | Absence never asserts verified delivery |\n| Preparation / execution | Reject ITEM and simulated ITEM owner evidence before creating a plan; unexpected simulated completion evidence cannot confirm an ordinary execution | No ITEM mutation support, new provider, alternate plan shape or retry |\n\n```mermaid\nflowchart TD\n  Native[Digital original queue or receipt] --> Auth[Existing employee and native read authority]\n  Auth --> Tags{Owner simulation tags?}\n  Tags -->|Absent| Ordinary[Ordinary minimized projection - no verification inference]\n  Tags -->|Complete exact triad| Sim[Explicit simulated and deliveryVerified false]\n  Tags -->|Partial or contradictory| Refuse[Refuse response - no completion]\n  Sim --> Receipt[Original receipt binding and action CAS still required]\n  Receipt --> Read[Read or reconcile existing outcome only]\n  Item[ITEM preparation or execution request] --> Unsupported[Unsupported - no new plan or dispatch]\n```\n\nRead projection uses the existing signed employee credential, fixed Digital Core routes, independently required permissions and post-read target/grant checks. Receipt reconciliation can advance the original uncertain Copilot action only from the exact committed original command and a positively acknowledged revision CAS; the native operation is inspection-only. A timeout, mismatched receipt, missing owner, revoked scope or malformed tags preserves uncertainty. Do not call confirm again, replace the key or use a simulation label as delivery proof.\n\nFulfillment simulation is explicitly unverified and nonimmutable: its deterministic hash is correlation, not authentication or a physical receipt. Digital coordination timestamps and generic DELIVERED status retain a different workflow meaning. Frontends and AI tools must preserve the complete native triad and present simulated/unverified goods, never a money discount or verified delivery. Already-redeemed benefit inverses remain disabled; see promotion.campaigns-coupon-issuance#promotion-used-benefit-inverses-disabled. Queue visibility adds no RELEASE, replenishment, used-coupon refund or compensation authority.\n\nPartners may narrow existing read admission and customize presentation through the owning later layer, but must retain descriptor-based tag validation, private-field minimization, exact original authority and receipts, and explicit unsupported ITEM preparation/execution. Add regressions for every partial tag combination, wrong values/types, inherited/accessor/hidden fields, both receipt states, ordinary absent-tag rows, concurrent original inspection and no second confirmation. copilotCouponAction.test.js exercises actual Core queue/reconciliation with isolated owner ports; its 30 source cases do not requalify historical native tests, current installed deployment, browser behavior, ITEM mutation or goods delivery.\n\n## Screen and owner flow\n\n```mermaid\nflowchart TD\n  A[Conversation] --> B[Secure masked form]\n  A --> Q[Redemption activity]\n  Q --> R[One employee-authorized Digital Core queue read]\n  R --> S[Bounded minimized table]\n  B --> C[Validate with Digital Core, Profile and Promotion]\n  C --> D[Minimized private proof and review]\n  D --> E[Explicit approval: no fulfillment write]\n  E --> F[Explicit fulfillment confirmation]\n  F --> G[Durable claim and native owner command]\n  G --> H{Exact completion evidence?}\n  H -->|Yes| I[Confirmed native receipt]\n  H -->|No| J[Retain uncertain action]\n  J --> K[Reload and inspect original receipt]\n  K --> L{Exact original evidence?}\n  L -->|Yes| I\n  L -->|No| J\n```\n\n## Recover an uncertain result\n\nA timeout or lost acknowledgement is not evidence that the benefit was not provided. Copilot stops further fulfillment and retains the original action.\n\n1. Select **Reload action**. `EXECUTING` and `OUTCOME_UNKNOWN` actions can expose **Check original receipt**.\n2. Inspect the original receipt. This is read-only at the native owner; it does not invoke confirm, redeem, claim, a provider or a new command key.\n3. Only native `REDEEMED` state plus the exact original committed receipt can complete the existing action. Current permissions, target, staff scope and evidence are rechecked before the action revision is advanced atomically.\n4. Missing evidence, incomplete commits, changed outlets or lost scope remain unconfirmed. An authorized Commerce operator must investigate the original command through its owner workflow. Do not create a replacement fulfillment.\n\nApproval expiry prevents new execution, not inspection of an old completion. Concurrent inspection cannot produce two action completions.\n\n| Symptom | Interpretation and next step |\n| --- | --- |\n| Secure form absent | Check adapter target, current context and preparation grants; do not widen default roles |\n| Validation denied | Check current employee merchant/outlet scope and native eligibility |\n| Proof expired or review changed | Obtain fresh native validation and explicitly review again |\n| Stale action revision | Reload the existing action; never overwrite a newer decision |\n| Outcome unknown after restart | Inspect the original receipt, not a second confirmation |\n| Receipt mismatch or owner unavailable | Preserve uncertainty and investigate with the owner |\n\n## API and privacy contract\n\n| Entry | Purpose |\n| --- | --- |\n| `GET /copilotApi/v0/coupons/workspace` | Authorized form metadata |\n| `GET /copilotApi/v0/coupons/redemptions` | Bounded, minimized merchant redemption activity |\n| `POST /copilotApi/v0/coupons/prepare` | Sensitive validation and private review |\n| Existing confirmation approve/reject/execute/get | Revision/digest-bound action lifecycle |\n| `POST /copilotApi/v0/confirmations/:confirmationCode/coupon-receipt` | Reconcile the original receipt |\n| `POST /digitalCore/v0/merchant/redemptions/:code/receipt/query` | Current employee-scoped native evidence |\n\nDeployment prefixes follow normal module exposure. Preparation accepts only `couponToken`, `merchantReceiptReference` and optional `storeCode`. Inspection accepts `expectedRevision` and `argumentsDigest`; callers cannot replace the target, command key or receipt. Private actions retain minimized proof/review, not the raw token or customer identity. Native business `deliveredAt` is distinct from framework-owned persistence `created`/`updated` timestamps.\n\nRecognized coupon-redemption messages are redirected before provider invocation or conversation persistence. Only neutral guidance is retained and excluded from future provider context. This is not universal secret detection or historical cleansing: never paste codes into ordinary chat, titles, receipt references or free-form review fields.\n\n## Customize and extend safely\n\nUse the project's existing external properties file loaded by `nConfig`, not a new customer kickoff service or edits to generated framework defaults. A project may name that file `config/properties.js`; its deployment must select the file through the existing configuration contract. Framework defaults live at `nodics.copilot/modules/copilotWorkbench/config/properties.js` and are reference material, not the project's customization destination.\n\nFor example, merge these labels into the existing project configuration:\n\n```js\nmodule.exports = {\n  copilot: {\n    workbench: {\n      couponPresentation: {\n        open: \"Redeem customer coupon\",\n        redemptionsTab: \"Recent fulfillment activity\",\n        refreshRedemptions: \"Refresh fulfillment activity\",\n        receipt: \"Original till receipt reference\",\n        execute: \"Confirm benefit provided and redeem\",\n      },\n    },\n  },\n};\n```\n\nKeep all effective labels bounded and nonempty. Preserve the remaining default labels and re-run context/UI tests after applying the layered configuration. Changing labels cannot disable review, approval, native authority, sensitive logging, revision checks, token minimization or original-command recovery. Changing a target invalidates old plans and requires new validation/review.\n\nNew providers or benefit shapes require native domain qualification, strict DTO parsing and regression tests before UI support. There is no supported generic API executor or direct coupon-status database override. Verify malformed labels, revoked permissions, expired proofs, stale revisions, mismatched receipts and uncertain outcomes; each must reject safely or retain uncertainty.\n\n## Common mistakes\n\n- Treating approval as execution: approval only records the reviewed decision.\n- Using enterprise identity as merchant access: Profile staff scope is separate.\n- Pasting raw codes into ordinary chat or receipt fields: use the masked form.\n- Retrying a timeout by creating another action: inspect the original receipt.\n- Treating staff attestation as external POS settlement: qualify that provider separately before making a settlement claim.\n- Treating the activity table as a complete ledger or retry control: it is a bounded read and never repeats fulfillment.\n- Updating coupon status directly or bypassing the native owner: no supported customization permits this.\n\n## Verification\n\nFrom the framework root, with a local MongoDB replica set, Elasticsearch binary and Ollama available:\n\n```sh\nNODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 \\\nNODICS_ERASURE_ES_HOME=/opt/homebrew/opt/elasticsearch-full/libexec \\\nNODICS_ERASURE_MONGO_URI='mongodb://127.0.0.1:27017/?replicaSet=nodicsLocal' \\\nnode --test nodics.copilot/modules/copilotWorkbench/test/copilotCouponRuntime.live.test.js\n```\n\nThe fixture owns private namespaces, ports and Platform/operational Commerce processes. It creates a synthetic campaign and real native reservation, sale, entitlement and delivery records; its paid-order reference is a prerequisite, not payment-checkout acceptance. Cleanup removes only fixture-owned resources.\n\nThe focused unit and Axis suites additionally prove the fixed merchant queue, independent read permission, post-read policy recheck, strict 100-row bound, private-field minimization and uncached UI transport. The three live scenarios prove authorized fulfillment, actual native response loss with read-only recovery after restart, and a recognized coupon conversation with local Ollama availability but zero model calls/raw-token persistence. They also check reader denial, an employee with no merchant scope, approval without fulfillment, stale revisions and exactly one native confirmation.\n\nThis qualifies the local `MERCHANT_SCREEN` profile without outlet or monetary benefit selection. It does not qualify external POS, activated pricing, publication, production deployment or a new signed-in browser journey. Axis component/visual fixtures are separate UI evidence. CMS data validation is not publication or visual acceptance.\n",
      "previous": {
        "title": "Rules Inspection in Copilot",
        "route": "/docs/framework/copilot/rules-inspection"
      },
      "next": {
        "title": "Existing Enterprise Invitations and Product Prices",
        "route": "/docs/framework/copilot/standalone-business-actions"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 2248,
        "checksum": "59cd1b69ac2d7e15cd5803d0c81e79a6b028437eaf27c1528145fe42c8912806"
      },
      "slug": "copilot-secure-coupon-fulfillment",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "copilot.standalone-business-actions",
          "owner": "copilotWorkbench"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore",
          "anchor": "digital-local-item-simulation"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion",
          "anchor": "promotion-used-benefit-inverses-disabled"
        }
      ]
    },
    "active": true
  },
  "record6": {
    "code": "nodicsDocsComponentcopilotStandaloneBusinessActions",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.standalone-business-actions",
      "title": "Existing Enterprise Invitations and Product Prices",
      "route": "/docs/framework/copilot/standalone-business-actions",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Existing Enterprise Invitations and Product Prices"
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
      "summary": "Prepare, review and execute standalone invitations and price rows through native Profile and Pricing owners.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.26",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.original-business-results"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotInvitationActionService.js",
        "src/service/defaultCopilotPriceActionService.js",
        "test/copilotStandaloneActions.test.js",
        "../copilotCore/test/copilotLocalOllama.acceptance.test.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "invitations",
        "prices",
        "review",
        "ollama"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Business Operations",
        "Invitations",
        "Pricing"
      ],
      "headings": [
        {
          "text": "Business Outcome",
          "anchor": "copilotStandaloneBusinessActions-1-business-outcome",
          "level": 2
        },
        {
          "text": "Administrator Setup",
          "anchor": "copilotStandaloneBusinessActions-2-administrator-setup",
          "level": 2
        },
        {
          "text": "Manage Admission in Axis",
          "anchor": "copilotStandaloneBusinessActions-3-manage-admission-in-axis",
          "level": 2
        },
        {
          "text": "Reviewed Controls on Desktop and Mobile",
          "anchor": "copilotStandaloneBusinessActions-4-reviewed-controls-on-desktop-and-mobile",
          "level": 3
        },
        {
          "text": "Invite Employees Step by Step",
          "anchor": "copilotStandaloneBusinessActions-5-invite-employees-step-by-step",
          "level": 2
        },
        {
          "text": "Create Prices Step by Step",
          "anchor": "copilotStandaloneBusinessActions-6-create-prices-step-by-step",
          "level": 2
        },
        {
          "text": "API and Execution Contract",
          "anchor": "copilotStandaloneBusinessActions-7-api-and-execution-contract",
          "level": 2
        },
        {
          "text": "Troubleshooting and Recovery",
          "anchor": "copilotStandaloneBusinessActions-8-troubleshooting-and-recovery",
          "level": 2
        },
        {
          "text": "Customize and Extend Safely",
          "anchor": "copilotStandaloneBusinessActions-9-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotStandaloneBusinessActions-10-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotStandaloneBusinessActions-11-verification",
          "level": 2
        },
        {
          "text": "Native Authoring Acceptance",
          "anchor": "copilotStandaloneBusinessActions-12-native-authoring-acceptance",
          "level": 3
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Functional owner: `nodics.copilot`. Technical owner: `copilotWorkbench`. Profile owns invitations and access; Pricing owns price rows and authoring policy."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business Outcome",
          "anchor": "copilotStandaloneBusinessActions-1-business-outcome"
        },
        {
          "kind": "paragraph",
          "text": "Use the conversation to invite employees into an enterprise that already exists, or create prices for products that already exist. Neither journey creates an enterprise or product as a side effect. Invitations remain pending registration. Creating a price row does not activate a price book or publish a customer price."
        },
        {
          "kind": "paragraph",
          "text": "Both journeys follow **prepare, review, approve, execute, inspect**. Preparation and approval save only the Copilot action. Execution makes the native owner calls. At most 20 invitations or 20 price rows are accepted in one standalone action."
        },
        {
          "kind": "paragraph",
          "text": "Beginners should start with the step-by-step journey for their task and stop at review until every value is correct. Developers should read the native execution contract before extending fields. An operator should preserve the original action reference and follow the recovery table whenever completion is uncertain."
        },
        {
          "kind": "image",
          "alt": "Standalone invitation and price reviews on desktop",
          "title": "Standalone invitation and price reviews on desktop",
          "mediaCode": "nodicsDocsImage_8d7b92f27f546c58c325bef0"
        },
        {
          "kind": "paragraph",
          "text": "Capture context: local Axis real confirmation renderer, synthetic data, 1280x900 desktop and 390x844 mobile. These are not signed-in customer records."
        },
        {
          "kind": "image",
          "alt": "Completed invitation and approved price on mobile",
          "title": "Completed invitation and approved price on mobile",
          "mediaCode": "nodicsDocsImage_7a40db1693b914c52b810113"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Setup",
          "anchor": "copilotStandaloneBusinessActions-2-administrator-setup"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Compose existing Copilot API, Core, Conversation, Policy and Workbench modules. Keep generated private `copilotAction` persistence enabled with atomic revision claims. Do not add customer kickoff orchestration or a second action store.",
            "Configure the native Profile target and existing Product/Pricing workbench target through the approved Nodics configuration layer. The connection names below are placeholders for already registered deployment connections.",
            "Enable only the new journey needed. Both flags default to `false`:"
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "   copilot: {\n     workbench: {\n       standaloneInvitationsEnabled: true,\n       standalonePricesEnabled: true,\n       enterpriseTarget: {\n         enabled: true,\n         moduleName: 'profile',\n         connectionName: 'registered-profile-owner',\n         targetAuthority: null\n       },\n       target: {\n         pricingModule: 'pricing',\n         connectionName: 'registered-commerce-owner',\n         targetAuthority: null\n       }\n     }\n   }"
        },
        {
          "kind": "paragraph",
          "text": "Preserve existing `target.productModule` and other settings when applying a partial change. Standalone prices do not require a Product module target."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Grant `copilot.mutation.prepare` and `copilot.mutation.execute` independently. Invitations additionally require `profile.enterpriseAccess.assign`, but not `profile.enterprise.create`. Profile still checks administrator rights, consent, destination enterprise and allowed invitation roles on every request. Pricing still checks native schema write access and authoring/publication policy. A Copilot permission does not imply either native permission.",
            "Preserve the employee bearer and initiating enterprise header. Explicitly naming a different destination enterprise does not switch the initiating identity or bypass Profile's destination authorization.",
            "For optional natural-language extraction, enable `copilot.core.intentPlanning.enabled` and configure the existing provider, model and budget owners. Explicit JSON works without a model call. Never send secrets or coupon tokens through these commands.",
            "For native original-result inspection, provision the Profile/Pricing private receipt journals and enable the reviewed recording/recovery prerequisites in [Original Business Results](/docs/framework/copilot/original-business-results). Grant `copilot.mutation.reconcile` independently. Source installation changes no gates."
          ]
        },
        {
          "kind": "table",
          "headers": [
            "Setting",
            "Default",
            "Effect"
          ],
          "rows": [
            [
              "`standaloneInvitationsEnabled`",
              "`false`",
              "Admits invitation-only preparation and execution"
            ],
            [
              "`standalonePricesEnabled`",
              "`false`",
              "Admits standalone price-row preparation and execution"
            ],
            [
              "`enterpriseTarget`",
              "Disabled, unconfigured",
              "Existing Profile routing, never a caller URL"
            ],
            [
              "`target.pricingModule/connectionName`",
              "Deployment-owned",
              "Existing native Pricing routing"
            ],
            [
              "`core.intentPlanning.enabled`",
              "`false`",
              "Optional permission-filtered extraction through accounted provider"
            ],
            [
              "`workbench.receiptRecovery.enabled`",
              "`false`",
              "Exact native inspection and reviewed unstarted-row continuation"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Manage Admission in Axis",
          "anchor": "copilotStandaloneBusinessActions-3-manage-admission-in-axis"
        },
        {
          "kind": "paragraph",
          "text": "Beginners should ask an authorized administrator to configure these controls; business users do not need elevated configuration permissions to use an admitted journey for which they already have native access."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **AI & Copilot > Copilot Settings > Business action controls** with `copilot.configuration.read`, `copilot.configuration.manage` and the separate `copilot.configuration.admin` grant. Enterprise delegation cannot supply the elevated grant or expose this section.",
            "Read the **tenant-wide** notice. All enterprises sharing the runtime are affected, although each operation still requires its own current permissions.",
            "Choose new invitation admission, new price admission, supported request interpretation and original-result inspection independently. Each defaults off. These controls expose no endpoint, credential, native journal or grant.",
            "Enter the reason, select **Review proposal**, check every before/after value, then **Submit for approval** once. Keep the request reference. No checkbox change or proposal submission immediately activates a feature.",
            "Follow the existing independent runtime approval/activation journey. Reload Settings after activation to inspect the effective revision. Native targets and durable receipt prerequisites must already be configured by their owners."
          ]
        },
        {
          "kind": "paragraph",
          "text": "To stop new standalone writes, propose clearing the invitation/price controls. You may leave **Inspect original business results** enabled. Non-coupon original inspection can then resolve already-submitted commands even when their new-write gate is off. Original routing, identity and native permissions must still match. Completed rows are never replayed. A fresh review of unstarted rows does not override disabled execution; independently re-enable the journey before executing."
        },
        {
          "kind": "paragraph",
          "text": "Turning off interpretation affects new provider planning, not explicit JSON commands or native write permissions. Turning off inspection removes that Copilot recovery surface; it does not delete receipts. A gate change is not cancellation or rollback of a native command already in flight. Coupon recovery remains separate."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Reviewed Controls on Desktop and Mobile",
          "anchor": "copilotStandaloneBusinessActions-4-reviewed-controls-on-desktop-and-mobile"
        },
        {
          "kind": "paragraph",
          "text": "These screenshots use the real Axis Settings renderer with synthetic descriptors and responses. They demonstrate layout and proposal-only behavior, not signed-in deployment acceptance or a real configuration change."
        },
        {
          "kind": "image",
          "alt": "Reviewing inspection while new writes remain paused",
          "title": "Reviewing inspection while new writes remain paused",
          "mediaCode": "nodicsDocsImage_63d0952a6d65da39beec22a6"
        },
        {
          "kind": "paragraph",
          "text": "Desktop review shows only the changed inspection value. The other three controls remain off; the tenant-wide notice remains visible before submission."
        },
        {
          "kind": "image",
          "alt": "Mobile request awaiting independent runtime approval",
          "title": "Mobile request awaiting independent runtime approval",
          "mediaCode": "nodicsDocsImage_b5a055b15860bc0f3f00ac2d"
        },
        {
          "kind": "paragraph",
          "text": "The mobile result is a request awaiting approval, not an active setting. Inputs are locked after submission to prevent duplicate requests. Use the existing runtime approval process, then reload Settings to retrieve effective values."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Invite Employees Step by Step",
          "anchor": "copilotStandaloneBusinessActions-5-invite-employees-step-by-step"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Open **AI & Copilot > Copilot Conversation** under the correct initiating enterprise. The Workspace prerequisites show invitation admission separately from enterprise creation. Prerequisites are not an execution authorization.",
            "Supply the existing destination enterprise code and every email and role:"
          ]
        },
        {
          "kind": "code",
          "language": "json",
          "text": "   {\n     \"operation\": \"profile.enterprise.invite\",\n     \"enterpriseCode\": \"DEMO_AI\",\n     \"employees\": [\n       { \"email\": \"operator@example.invalid\", \"roleCode\": \"VIEWER\" }\n     ]\n   }"
        },
        {
          "kind": "paragraph",
          "text": "With intent planning enabled, the equivalent prompt is: `Invite employee operator@example.invalid with role VIEWER to existing enterprise DEMO_AI.` Supported roles are `ENTERPRISE_ADMIN`, `CONTENT_MANAGER`, `OPERATOR`, and `VIEWER`; actual Profile policy may refuse a role for the current employee."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Resolve missing fields by submitting the complete corrected command. Copilot does not silently merge previous messages. Empty invitation lists, duplicate emails after case normalization, extra authority fields and unknown roles fail.",
            "Review every email, role, destination enterprise and generated invitation row identity. No native invitation has been sent at this point.",
            "Approve the current revision, then explicitly execute once. Each row goes to `POST /enterprises/:enterpriseCode/access-assignments` with the employee bearer and a stable idempotency key. No enterprise-create call occurs.",
            "Read each outcome. Native acknowledgement must identify the exact destination, email, role and `PENDING` status. Invitees must still complete Profile's existing registration process. A pending invitation is not an active employee account."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Create Prices Step by Step",
          "anchor": "copilotStandaloneBusinessActions-6-create-prices-step-by-step"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Confirm that the product and price book already exist in the intended native authoring context. This adapter does not discover or create missing references. The review explicitly says that reference existence has not been verified. The current native draft schema accepts identifier strings; successful draft creation does not establish that a Product or PriceBook with that code exists.",
            "Supply a new price-row code and all six explicit fields:"
          ]
        },
        {
          "kind": "code",
          "language": "json",
          "text": "   {\n     \"operation\": \"commerce.price.create\",\n     \"prices\": [{\n       \"code\": \"DEMO_PRICE\",\n       \"priceBookCode\": \"DEMO_BOOK\",\n       \"productCode\": \"DEMO_PRODUCT\",\n       \"unitAmount\": \"12.3400\",\n       \"currency\": \"AED\",\n       \"minQuantity\": \"1\"\n     }]\n   }"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Keep monetary and quantity values as strings. Numbers, exponents, negative values and a zero minimum quantity are rejected. Amounts allow up to 24 integer digits and 12 decimal places. Currency must be three uppercase letters; the native owner remains responsible for business-valid currencies and references.",
            "Review the exact amount, currency, product, price book, minimum quantity, code and generated initial revision `1`. Precision and trailing zeroes are preserved.",
            "Approve, then execute. Each row uses the native generated `PUT /pricerow` creation contract with one transport attempt and the original employee.",
            "Inspect outcomes. Use the existing Pricing and publication workflows for any later activation/publication. Copilot does not directly alter lifecycle status."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API and Execution Contract",
          "anchor": "copilotStandaloneBusinessActions-7-api-and-execution-contract"
        },
        {
          "kind": "paragraph",
          "text": "Preparation endpoints are `POST /v0/invitations/prepare` and `POST /v0/prices/prepare` under the normal Copilot API exposure. They use the same bodies as conversation commands, require secured employee access tokens, declare sensitive request handling and return `Cache-Control: no-store`. They return a clarification or the normal immutable confirmation, never a business record. Approval, execution and original-result inspection reuse existing confirmations routes; no new client-side execution registry exists."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n    participant User as Axis employee\n    participant Core as Copilot Core\n    participant Workbench as Workbench and Policy\n    participant Native as Profile or Pricing\n    User->>Core: Explicit command or supported prose\n    Core->>Workbench: Validate bounded values and current grants\n    Workbench-->>User: Saved review and actor-bound challenge\n    User->>Workbench: Approve current digest and revision\n    User->>Workbench: Execute once\n    Workbench->>Workbench: Atomic action claim\n    loop Reviewed rows\n        Workbench->>Native: Native command with employee identity\n        Native-->>Workbench: Exact result or uncertain response\n    end\n    Workbench-->>User: Per-row outcomes\n    User->>Workbench: Inspect original results if uncertain\n    Workbench->>Native: Original receipt read only\n    Workbench-->>User: Completion or fresh review for unstarted rows"
        },
        {
          "kind": "paragraph",
          "text": "Every executed field is in the displayed review and plan digest. Added record fields, changed targets, stale revisions and foreign action scope fail closed. Permissions and target configuration are checked before each native dispatch. There is no automatic replay, compensation, service-token fallback or publication."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting and Recovery",
          "anchor": "copilotStandaloneBusinessActions-8-troubleshooting-and-recovery"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning",
            "Next step"
          ],
          "rows": [
            [
              "Configuration required",
              "Journey flag or native target is missing",
              "Administrator reviews the correct configuration layer"
            ],
            [
              "Permission required",
              "Independent Copilot or Profile grant is missing",
              "Request an authorized policy review, not a broad wildcard"
            ],
            [
              "Clarification",
              "Material values are absent or cannot be grounded in the human message",
              "Send a complete explicit corrected command"
            ],
            [
              "Native refusal",
              "Owner validation, consent, references or authoring policy refused the operation",
              "Correct through the native owner; do not bypass it"
            ],
            [
              "`OUTCOME_UNKNOWN`",
              "A native write may have happened, but completion is not proven",
              "Preserve action reference and inspect original results"
            ],
            [
              "`NOT_STARTED` after another uncertain row",
              "Later rows were deliberately not submitted",
              "Continue only after all started rows are proven and a new approval is issued"
            ],
            [
              "Original receipt remains unknown",
              "No exact completion evidence is available",
              "Keep locked; current record existence is not receipt proof"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not create a replacement action to evade an uncertain row. Native original inspection uses `POST /enterprises/:enterpriseCode/access-assignments/commands/inspect` or `POST /pricerow/commands/inspect`; it never sends the original write again."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and Extend Safely",
          "anchor": "copilotStandaloneBusinessActions-9-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Use normal project-owned configuration files, such as your project's existing `config/properties.js`, for the flags and registered routing names. Use the existing later-layer override mechanism for presentation text under `copilot.core.conversationContext.journeys`; verify the effective property path in Core's defaults before applying deployment overrides. Do not put framework behavior in custom kickoff modules or configure a browser-supplied endpoint."
        },
        {
          "kind": "paragraph",
          "text": "A worked safe customization is to keep `standalonePricesEnabled: false` while admitting invitation-only use with `standaloneInvitationsEnabled: true`, preserving the existing Profile target and separate invitation grant. The Workspace then explains price configuration as unavailable; no source edits or new permissions are needed to display that state. Tests must verify it remains unavailable both in explicit JSON preparation and provider-advertised forms."
        },
        {
          "kind": "paragraph",
          "text": "New fields or owner operations require a framework adapter change, complete digest-bound review, native permission/validation contracts and exact receipt mapping. The hard bounds, explicit review, employee credentials, immutable target, atomic claim and no-uncertain-replay guarantees are not configurable shortcuts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotStandaloneBusinessActions-10-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Requesting enterprise-create permission for an invitation-only task. Use the independent invitation permission and let Profile evaluate destination access.",
            "Sending a decimal as a JSON number. Use an exact string to avoid rounding.",
            "Treating preparation as proof that a product, enterprise or price book exists. Native permissions/schema/authoring policy are enforced at execution, but current PriceRow draft authoring does not establish referenced-record existence.",
            "Treating an invitation as an activated employee or a price row as published. Registration and publication remain separate native-owner journeys.",
            "Starting a fresh command after a lost response. Inspect the original receipt; unknown completion must remain locked rather than duplicated."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotStandaloneBusinessActions-11-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run the isolated contract suite and the opt-in local synthetic inference test:"
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "node --test nodics.copilot/modules/copilotWorkbench/test/copilotStandaloneActions.test.js\nnode --test nodics.copilot/modules/copilotCore/test/copilotIntentPlanning.test.js\nNODICS_COPILOT_LOCAL_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotCore/test/copilotLocalOllama.acceptance.test.js"
        },
        {
          "kind": "paragraph",
          "text": "The opt-in test pins loopback `127.0.0.1:11434`, uses the existing Ollama adapter, and defaults to `gemma3:4b`. `NODICS_COPILOT_LOCAL_MODEL` selects another installed local model. It sends fictional values only, performs no business writes and validates actual extraction and measured model usage. Its test-only provider bridge does not verify deployed usage persistence, authenticated APIs or budgets. Without opt-in, these two network tests skip."
        },
        {
          "kind": "paragraph",
          "text": "Axis verification uses `test/assistant/AssistantConfirmationCard.test.tsx` and `test/assistant/standalone-actions.visual.html` at desktop/mobile sizes. Signed-in acceptance still requires deployment-owned permissions, private receipt storage, native authoring targets and disposable approved business records. source-controlled CMS documentation is not automatically imported or published to a runtime."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Native Authoring Acceptance",
          "anchor": "copilotStandaloneBusinessActions-12-native-authoring-acceptance"
        },
        {
          "kind": "paragraph",
          "text": "The framework includes independent disposable live tests for standalone prices and products with linked prices. They authenticate real employees through Profile, start an owned Commerce Staged runtime with CURRENT versioned MongoDB storage, and use real native APIs and private command receipts. No test writes to the customer project's databases or starts a frontend."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Start the local MongoDB replica set and Ollama using the deployment's existing service configuration. Install/select a local model through the provider guide.",
            "Set `NODICS_ERASURE_ES_HOME` to the installed Elasticsearch home used by the shared isolated fixture, and `NODICS_ERASURE_MONGO_URI` to the local replica-set URI. Despite the historical variable name, these tests do not erase customer indexes; the fixture creates and cleans its own provider resources.",
            "From the framework root run each test below with those variables exported:"
          ]
        },
        {
          "kind": "code",
          "language": "sh",
          "text": "   NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotWorkbench/test/copilotPriceRuntime.live.test.js\n   NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotWorkbench/test/copilotProductRuntime.live.test.js"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Each suite must pass all three scenarios: direct preparation, controlled loss of a successful native price response, and real Ollama prose extraction. Without opt-in the tests skip; a skip is not live acceptance.",
            "Inspect failures at the native owner first. Do not widen native grants, bypass CURRENT versioned authoring, or replace a failed owner with a stub. Teardown runs after success or failure and closes only owned resources."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Both suites prove denied-reader boundaries, no native writes during review or approval, stale-revision refusal, exact native values, persisted confirmation and native-owner restart. In the two-product lost-price case, completed products and the first price remain intact; inspection makes no writes, and renewed approval creates only the unstarted second price. Diagnostics assert the exact number of native completions. Duplicate conversation-turn submission adds no model charge."
        },
        {
          "kind": "paragraph",
          "text": "The fixtures use synthetic catalogue and price-book identifiers rather than published catalogues. This is native draft authoring/recovery acceptance, not reference resolution, price-book activation, publication, storefront pricing, full Axis browser acceptance or coverage of every operation in Commerce."
        }
      ],
      "searchText": "Existing Enterprise Invitations and Product Prices Prepare, review and execute standalone invitations and price rows through native Profile and Pricing owners. # Existing Enterprise Invitations and Product Prices\n\nFunctional owner: `nodics.copilot`. Technical owner: `copilotWorkbench`. Profile owns invitations and access; Pricing owns price rows and authoring policy.\n\n## Business Outcome\n\nUse the conversation to invite employees into an enterprise that already exists, or create prices for products that already exist. Neither journey creates an enterprise or product as a side effect. Invitations remain pending registration. Creating a price row does not activate a price book or publish a customer price.\n\nBoth journeys follow **prepare, review, approve, execute, inspect**. Preparation and approval save only the Copilot action. Execution makes the native owner calls. At most 20 invitations or 20 price rows are accepted in one standalone action.\n\nBeginners should start with the step-by-step journey for their task and stop at review until every value is correct. Developers should read the native execution contract before extending fields. An operator should preserve the original action reference and follow the recovery table whenever completion is uncertain.\n\n![Standalone invitation and price reviews on desktop](media:nodicsDocsImage_8d7b92f27f546c58c325bef0)\n\nCapture context: local Axis real confirmation renderer, synthetic data, 1280x900 desktop and 390x844 mobile. These are not signed-in customer records.\n\n![Completed invitation and approved price on mobile](media:nodicsDocsImage_7a40db1693b914c52b810113)\n\n## Administrator Setup\n\n1. Compose existing Copilot API, Core, Conversation, Policy and Workbench modules. Keep generated private `copilotAction` persistence enabled with atomic revision claims. Do not add customer kickoff orchestration or a second action store.\n2. Configure the native Profile target and existing Product/Pricing workbench target through the approved Nodics configuration layer. The connection names below are placeholders for already registered deployment connections.\n3. Enable only the new journey needed. Both flags default to `false`:\n\n```js\n   copilot: {\n     workbench: {\n       standaloneInvitationsEnabled: true,\n       standalonePricesEnabled: true,\n       enterpriseTarget: {\n         enabled: true,\n         moduleName: 'profile',\n         connectionName: 'registered-profile-owner',\n         targetAuthority: null\n       },\n       target: {\n         pricingModule: 'pricing',\n         connectionName: 'registered-commerce-owner',\n         targetAuthority: null\n       }\n     }\n   }\n```\n\nPreserve existing `target.productModule` and other settings when applying a partial change. Standalone prices do not require a Product module target.\n\n1. Grant `copilot.mutation.prepare` and `copilot.mutation.execute` independently. Invitations additionally require `profile.enterpriseAccess.assign`, but not `profile.enterprise.create`. Profile still checks administrator rights, consent, destination enterprise and allowed invitation roles on every request. Pricing still checks native schema write access and authoring/publication policy. A Copilot permission does not imply either native permission.\n2. Preserve the employee bearer and initiating enterprise header. Explicitly naming a different destination enterprise does not switch the initiating identity or bypass Profile's destination authorization.\n3. For optional natural-language extraction, enable `copilot.core.intentPlanning.enabled` and configure the existing provider, model and budget owners. Explicit JSON works without a model call. Never send secrets or coupon tokens through these commands.\n4. For native original-result inspection, provision the Profile/Pricing private receipt journals and enable the reviewed recording/recovery prerequisites in [Original Business Results](/docs/framework/copilot/original-business-results). Grant `copilot.mutation.reconcile` independently. Source installation changes no gates.\n\n| Setting | Default | Effect |\n| --- | --- | --- |\n| `standaloneInvitationsEnabled` | `false` | Admits invitation-only preparation and execution |\n| `standalonePricesEnabled` | `false` | Admits standalone price-row preparation and execution |\n| `enterpriseTarget` | Disabled, unconfigured | Existing Profile routing, never a caller URL |\n| `target.pricingModule/connectionName` | Deployment-owned | Existing native Pricing routing |\n| `core.intentPlanning.enabled` | `false` | Optional permission-filtered extraction through accounted provider |\n| `workbench.receiptRecovery.enabled` | `false` | Exact native inspection and reviewed unstarted-row continuation |\n\n## Manage Admission in Axis\n\nBeginners should ask an authorized administrator to configure these controls; business users do not need elevated configuration permissions to use an admitted journey for which they already have native access.\n\n1. Open **AI & Copilot > Copilot Settings > Business action controls** with `copilot.configuration.read`, `copilot.configuration.manage` and the separate `copilot.configuration.admin` grant. Enterprise delegation cannot supply the elevated grant or expose this section.\n2. Read the **tenant-wide** notice. All enterprises sharing the runtime are affected, although each operation still requires its own current permissions.\n3. Choose new invitation admission, new price admission, supported request interpretation and original-result inspection independently. Each defaults off. These controls expose no endpoint, credential, native journal or grant.\n4. Enter the reason, select **Review proposal**, check every before/after value, then **Submit for approval** once. Keep the request reference. No checkbox change or proposal submission immediately activates a feature.\n5. Follow the existing independent runtime approval/activation journey. Reload Settings after activation to inspect the effective revision. Native targets and durable receipt prerequisites must already be configured by their owners.\n\nTo stop new standalone writes, propose clearing the invitation/price controls. You may leave **Inspect original business results** enabled. Non-coupon original inspection can then resolve already-submitted commands even when their new-write gate is off. Original routing, identity and native permissions must still match. Completed rows are never replayed. A fresh review of unstarted rows does not override disabled execution; independently re-enable the journey before executing.\n\nTurning off interpretation affects new provider planning, not explicit JSON commands or native write permissions. Turning off inspection removes that Copilot recovery surface; it does not delete receipts. A gate change is not cancellation or rollback of a native command already in flight. Coupon recovery remains separate.\n\n### Reviewed Controls on Desktop and Mobile\n\nThese screenshots use the real Axis Settings renderer with synthetic descriptors and responses. They demonstrate layout and proposal-only behavior, not signed-in deployment acceptance or a real configuration change.\n\n![Reviewing inspection while new writes remain paused](media:nodicsDocsImage_63d0952a6d65da39beec22a6)\n\nDesktop review shows only the changed inspection value. The other three controls remain off; the tenant-wide notice remains visible before submission.\n\n![Mobile request awaiting independent runtime approval](media:nodicsDocsImage_b5a055b15860bc0f3f00ac2d)\n\nThe mobile result is a request awaiting approval, not an active setting. Inputs are locked after submission to prevent duplicate requests. Use the existing runtime approval process, then reload Settings to retrieve effective values.\n\n## Invite Employees Step by Step\n\n1. Open **AI & Copilot > Copilot Conversation** under the correct initiating enterprise. The Workspace prerequisites show invitation admission separately from enterprise creation. Prerequisites are not an execution authorization.\n2. Supply the existing destination enterprise code and every email and role:\n\n```json\n   {\n     \"operation\": \"profile.enterprise.invite\",\n     \"enterpriseCode\": \"DEMO_AI\",\n     \"employees\": [\n       { \"email\": \"operator@example.invalid\", \"roleCode\": \"VIEWER\" }\n     ]\n   }\n```\n\nWith intent planning enabled, the equivalent prompt is: `Invite employee operator@example.invalid with role VIEWER to existing enterprise DEMO_AI.` Supported roles are `ENTERPRISE_ADMIN`, `CONTENT_MANAGER`, `OPERATOR`, and `VIEWER`; actual Profile policy may refuse a role for the current employee.\n\n1. Resolve missing fields by submitting the complete corrected command. Copilot does not silently merge previous messages. Empty invitation lists, duplicate emails after case normalization, extra authority fields and unknown roles fail.\n2. Review every email, role, destination enterprise and generated invitation row identity. No native invitation has been sent at this point.\n3. Approve the current revision, then explicitly execute once. Each row goes to `POST /enterprises/:enterpriseCode/access-assignments` with the employee bearer and a stable idempotency key. No enterprise-create call occurs.\n4. Read each outcome. Native acknowledgement must identify the exact destination, email, role and `PENDING` status. Invitees must still complete Profile's existing registration process. A pending invitation is not an active employee account.\n\n## Create Prices Step by Step\n\n1. Confirm that the product and price book already exist in the intended native authoring context. This adapter does not discover or create missing references. The review explicitly says that reference existence has not been verified. The current native draft schema accepts identifier strings; successful draft creation does not establish that a Product or PriceBook with that code exists.\n2. Supply a new price-row code and all six explicit fields:\n\n```json\n   {\n     \"operation\": \"commerce.price.create\",\n     \"prices\": [{\n       \"code\": \"DEMO_PRICE\",\n       \"priceBookCode\": \"DEMO_BOOK\",\n       \"productCode\": \"DEMO_PRODUCT\",\n       \"unitAmount\": \"12.3400\",\n       \"currency\": \"AED\",\n       \"minQuantity\": \"1\"\n     }]\n   }\n```\n\n1. Keep monetary and quantity values as strings. Numbers, exponents, negative values and a zero minimum quantity are rejected. Amounts allow up to 24 integer digits and 12 decimal places. Currency must be three uppercase letters; the native owner remains responsible for business-valid currencies and references.\n2. Review the exact amount, currency, product, price book, minimum quantity, code and generated initial revision `1`. Precision and trailing zeroes are preserved.\n3. Approve, then execute. Each row uses the native generated `PUT /pricerow` creation contract with one transport attempt and the original employee.\n4. Inspect outcomes. Use the existing Pricing and publication workflows for any later activation/publication. Copilot does not directly alter lifecycle status.\n\n## API and Execution Contract\n\nPreparation endpoints are `POST /v0/invitations/prepare` and `POST /v0/prices/prepare` under the normal Copilot API exposure. They use the same bodies as conversation commands, require secured employee access tokens, declare sensitive request handling and return `Cache-Control: no-store`. They return a clarification or the normal immutable confirmation, never a business record. Approval, execution and original-result inspection reuse existing confirmations routes; no new client-side execution registry exists.\n\n```mermaid\nsequenceDiagram\n    participant User as Axis employee\n    participant Core as Copilot Core\n    participant Workbench as Workbench and Policy\n    participant Native as Profile or Pricing\n    User->>Core: Explicit command or supported prose\n    Core->>Workbench: Validate bounded values and current grants\n    Workbench-->>User: Saved review and actor-bound challenge\n    User->>Workbench: Approve current digest and revision\n    User->>Workbench: Execute once\n    Workbench->>Workbench: Atomic action claim\n    loop Reviewed rows\n        Workbench->>Native: Native command with employee identity\n        Native-->>Workbench: Exact result or uncertain response\n    end\n    Workbench-->>User: Per-row outcomes\n    User->>Workbench: Inspect original results if uncertain\n    Workbench->>Native: Original receipt read only\n    Workbench-->>User: Completion or fresh review for unstarted rows\n```\n\nEvery executed field is in the displayed review and plan digest. Added record fields, changed targets, stale revisions and foreign action scope fail closed. Permissions and target configuration are checked before each native dispatch. There is no automatic replay, compensation, service-token fallback or publication.\n\n## Troubleshooting and Recovery\n\n| Observation | Meaning | Next step |\n| --- | --- | --- |\n| Configuration required | Journey flag or native target is missing | Administrator reviews the correct configuration layer |\n| Permission required | Independent Copilot or Profile grant is missing | Request an authorized policy review, not a broad wildcard |\n| Clarification | Material values are absent or cannot be grounded in the human message | Send a complete explicit corrected command |\n| Native refusal | Owner validation, consent, references or authoring policy refused the operation | Correct through the native owner; do not bypass it |\n| `OUTCOME_UNKNOWN` | A native write may have happened, but completion is not proven | Preserve action reference and inspect original results |\n| `NOT_STARTED` after another uncertain row | Later rows were deliberately not submitted | Continue only after all started rows are proven and a new approval is issued |\n| Original receipt remains unknown | No exact completion evidence is available | Keep locked; current record existence is not receipt proof |\n\nDo not create a replacement action to evade an uncertain row. Native original inspection uses `POST /enterprises/:enterpriseCode/access-assignments/commands/inspect` or `POST /pricerow/commands/inspect`; it never sends the original write again.\n\n## Customize and Extend Safely\n\nUse normal project-owned configuration files, such as your project's existing `config/properties.js`, for the flags and registered routing names. Use the existing later-layer override mechanism for presentation text under `copilot.core.conversationContext.journeys`; verify the effective property path in Core's defaults before applying deployment overrides. Do not put framework behavior in custom kickoff modules or configure a browser-supplied endpoint.\n\nA worked safe customization is to keep `standalonePricesEnabled: false` while admitting invitation-only use with `standaloneInvitationsEnabled: true`, preserving the existing Profile target and separate invitation grant. The Workspace then explains price configuration as unavailable; no source edits or new permissions are needed to display that state. Tests must verify it remains unavailable both in explicit JSON preparation and provider-advertised forms.\n\nNew fields or owner operations require a framework adapter change, complete digest-bound review, native permission/validation contracts and exact receipt mapping. The hard bounds, explicit review, employee credentials, immutable target, atomic claim and no-uncertain-replay guarantees are not configurable shortcuts.\n\n## Common Mistakes\n\n- Requesting enterprise-create permission for an invitation-only task. Use the independent invitation permission and let Profile evaluate destination access.\n- Sending a decimal as a JSON number. Use an exact string to avoid rounding.\n- Treating preparation as proof that a product, enterprise or price book exists. Native permissions/schema/authoring policy are enforced at execution, but current PriceRow draft authoring does not establish referenced-record existence.\n- Treating an invitation as an activated employee or a price row as published. Registration and publication remain separate native-owner journeys.\n- Starting a fresh command after a lost response. Inspect the original receipt; unknown completion must remain locked rather than duplicated.\n\n## Verification\n\nRun the isolated contract suite and the opt-in local synthetic inference test:\n\n```sh\nnode --test nodics.copilot/modules/copilotWorkbench/test/copilotStandaloneActions.test.js\nnode --test nodics.copilot/modules/copilotCore/test/copilotIntentPlanning.test.js\nNODICS_COPILOT_LOCAL_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotCore/test/copilotLocalOllama.acceptance.test.js\n```\n\nThe opt-in test pins loopback `127.0.0.1:11434`, uses the existing Ollama adapter, and defaults to `gemma3:4b`. `NODICS_COPILOT_LOCAL_MODEL` selects another installed local model. It sends fictional values only, performs no business writes and validates actual extraction and measured model usage. Its test-only provider bridge does not verify deployed usage persistence, authenticated APIs or budgets. Without opt-in, these two network tests skip.\n\nAxis verification uses `test/assistant/AssistantConfirmationCard.test.tsx` and `test/assistant/standalone-actions.visual.html` at desktop/mobile sizes. Signed-in acceptance still requires deployment-owned permissions, private receipt storage, native authoring targets and disposable approved business records. source-controlled CMS documentation is not automatically imported or published to a runtime.\n\n### Native Authoring Acceptance\n\nThe framework includes independent disposable live tests for standalone prices and products with linked prices. They authenticate real employees through Profile, start an owned Commerce Staged runtime with CURRENT versioned MongoDB storage, and use real native APIs and private command receipts. No test writes to the customer project's databases or starts a frontend.\n\n1. Start the local MongoDB replica set and Ollama using the deployment's existing service configuration. Install/select a local model through the provider guide.\n2. Set `NODICS_ERASURE_ES_HOME` to the installed Elasticsearch home used by the shared isolated fixture, and `NODICS_ERASURE_MONGO_URI` to the local replica-set URI. Despite the historical variable name, these tests do not erase customer indexes; the fixture creates and cleans its own provider resources.\n3. From the framework root run each test below with those variables exported:\n\n```sh\n   NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotWorkbench/test/copilotPriceRuntime.live.test.js\n   NODICS_COPILOT_PERSISTENT_ACCEPTANCE=1 node --test nodics.copilot/modules/copilotWorkbench/test/copilotProductRuntime.live.test.js\n```\n\n1. Each suite must pass all three scenarios: direct preparation, controlled loss of a successful native price response, and real Ollama prose extraction. Without opt-in the tests skip; a skip is not live acceptance.\n2. Inspect failures at the native owner first. Do not widen native grants, bypass CURRENT versioned authoring, or replace a failed owner with a stub. Teardown runs after success or failure and closes only owned resources.\n\nBoth suites prove denied-reader boundaries, no native writes during review or approval, stale-revision refusal, exact native values, persisted confirmation and native-owner restart. In the two-product lost-price case, completed products and the first price remain intact; inspection makes no writes, and renewed approval creates only the unstarted second price. Diagnostics assert the exact number of native completions. Duplicate conversation-turn submission adds no model charge.\n\nThe fixtures use synthetic catalogue and price-book identifiers rather than published catalogues. This is native draft authoring/recovery acceptance, not reference resolution, price-book activation, publication, storefront pricing, full Axis browser acceptance or coverage of every operation in Commerce.\n",
      "previous": {
        "title": "Secure Coupon Fulfillment",
        "route": "/docs/framework/copilot/secure-coupon-fulfillment"
      },
      "next": {
        "title": "Collection Inspection In Conversation",
        "route": "/docs/framework/copilot/collection-inspection"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 2437,
        "checksum": "970d51df91345cc4a9ebe637fb04f57d163b191c654522bfc2e441b2f9fbaad6"
      },
      "slug": "copilot-standalone-business-actions",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 29,
      "references": [
        {
          "documentId": "copilot.original-business-results",
          "owner": "copilotWorkbench"
        }
      ]
    },
    "active": true
  },
  "record7": {
    "code": "nodicsDocsComponentcopilotOriginalBusinessResults",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "copilot.original-business-results",
      "title": "Original Business Results and Safe Continuation",
      "route": "/docs/framework/copilot/original-business-results",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Original Business Results and Safe Continuation"
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
      "summary": "Inspect native original command receipts and approve only never-started rows after uncertain business execution.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.26",
      "maturityState": "partial",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "copilot.retention-lifecycle"
      ],
      "sourceEvidence": [
        "src/service/defaultCopilotActionRecoveryService.js",
        "test/copilotActionRecovery.test.js",
        "../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelCommandReceiptService.js",
        "../../../nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseCommandReceiptService.js",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "copilot",
        "receipts",
        "recovery",
        "continuation"
      ],
      "topicKeywords": [
        "AI Copilot",
        "Business Operations",
        "Recovery"
      ],
      "headings": [
        {
          "text": "Business Outcome",
          "anchor": "copilotOriginalBusinessResults-1-business-outcome",
          "level": 2
        },
        {
          "text": "Signed-In Local Enterprise Evidence",
          "anchor": "copilotOriginalBusinessResults-2-signed-in-local-enterprise-evidence",
          "level": 3
        },
        {
          "text": "Administrator Setup",
          "anchor": "copilotOriginalBusinessResults-3-administrator-setup",
          "level": 2
        },
        {
          "text": "Employee Journey",
          "anchor": "copilotOriginalBusinessResults-4-employee-journey",
          "level": 2
        },
        {
          "text": "State Diagram",
          "anchor": "copilotOriginalBusinessResults-5-state-diagram",
          "level": 2
        },
        {
          "text": "API Contract",
          "anchor": "copilotOriginalBusinessResults-6-api-contract",
          "level": 2
        },
        {
          "text": "Troubleshooting",
          "anchor": "copilotOriginalBusinessResults-7-troubleshooting",
          "level": 2
        },
        {
          "text": "Customization and Extension",
          "anchor": "copilotOriginalBusinessResults-8-customization-and-extension",
          "level": 2
        },
        {
          "text": "Common Mistakes",
          "anchor": "copilotOriginalBusinessResults-9-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "copilotOriginalBusinessResults-10-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Functional owner: `nodics.copilot`. Technical owner: `copilotWorkbench`. Product, Pricing, Waste Collection and Profile own their native command journals. nDatabase supplies the bounded persistence protocol; Axis renders the result."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business Outcome",
          "anchor": "copilotOriginalBusinessResults-1-business-outcome"
        },
        {
          "kind": "paragraph",
          "text": "An interrupted response does not establish whether a business operation failed. Copilot can inspect the original native acknowledgement without submitting that operation again. Completed rows remain completed. If every submitted row is proven complete, a new approval can cover the rows that were never started."
        },
        {
          "kind": "paragraph",
          "text": "This guide covers Product creation with PriceRows, Profile enterprise creation with pending employee invitations, standalone existing-enterprise invitations, standalone price-row creation, and Waste collection-centre creation. Follow [standalone business actions](/docs/framework/copilot/standalone-business-actions) for their setup, review and native-owner boundaries. Coupon fulfillment retains its separate Commerce receipt inspector. This is not a generic adapter for every Axis operation, and invitations do not activate accounts."
        },
        {
          "kind": "image",
          "alt": "Original result inspection on desktop",
          "title": "Original result inspection on desktop",
          "mediaCode": "nodicsDocsImage_f2edf099c35b56266359228a"
        },
        {
          "kind": "image",
          "alt": "Fresh continuation approval on mobile",
          "title": "Fresh continuation approval on mobile",
          "mediaCode": "nodicsDocsImage_96ccaa65de50c5f56592bbb2"
        },
        {
          "kind": "paragraph",
          "text": "These screenshots use synthetic renderer data, not a signed-in customer runtime."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Signed-In Local Enterprise Evidence",
          "anchor": "copilotOriginalBusinessResults-2-signed-in-local-enterprise-evidence"
        },
        {
          "kind": "paragraph",
          "text": "The following captures are from the complete Axis application with actual Profile authentication, local Ollama, native enterprise execution and durable MongoDB receipts. The data is disposable and synthetic."
        },
        {
          "kind": "image",
          "alt": "Completed enterprise and invitations in full Axis",
          "title": "Completed enterprise and invitations in full Axis",
          "mediaCode": "nodicsDocsImage_97d044b2e35d2bcbb6509942"
        },
        {
          "kind": "image",
          "alt": "Completed action at mobile width",
          "title": "Completed action at mobile width",
          "mediaCode": "nodicsDocsImage_4b7eb14a37d6bfb149253fd9"
        },
        {
          "kind": "paragraph",
          "text": "The tested sequence lost the response after the native enterprise succeeded, restarted the backend, inspected the original receipt, obtained fresh approval and executed only the three never-started invitations. Native queries verified one enterprise and four PENDING invitations including its administrator. A second conversation recovered its review after a reload during model execution; rejecting it added no invitation and did not repeat the model charge. This is local-profile acceptance, not proof of every business adapter, notification delivery, invitee activation or distributed failover."
        },
        {
          "kind": "paragraph",
          "text": "Beginners should follow the Employee Journey and preserve the original action reference when execution is uncertain. Developers should read the API Contract and Customization and Extension sections before adding another native adapter."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Administrator Setup",
          "anchor": "copilotOriginalBusinessResults-3-administrator-setup"
        },
        {
          "kind": "paragraph",
          "text": "Collection-point creation is insert-only: using an existing centre code in a new approved create must not edit that centre. If it cannot be confirmed, preserve the action reference and use **Inspect original business results**. An earlier record with the same code is not proof that this command succeeded. Use the native collection-point update journey for an intended edit. This rule applies even when new receipt recording is disabled; it does not change internal import or Product/Pricing versioning behavior."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Deploy the matching framework owners and Axis client. Keep the implementation in framework modules, not customer kickoff modules.",
            "Provision `productCommandReceipt`, `pricingCommandReceipt`, `wasteCollectionCommandReceipt` and `profileCommandReceipt` in their owning modules. Each extends nDatabase's abstract `commandReceipt` schema and has a unique code index. Keep generic routes, cache, events, search and BackOffice editing disabled for these journals.",
            "Qualify the existing `DURABLE_JOURNAL` persistence path, including majority primary readback, durable insert-only identity and atomic conditional updates. A successful volatile test double is not deployment qualification. Do not replace the generated model service with a second storage connection. Include the effective service hierarchy in qualification. When `vService` is active, its save/update adapters must retain shared database admission and its read selector must retain private-read qualification. Confirm that duplicate journal creation cannot overwrite the original and stale conditional completion matches zero records. Keep journals unversioned even on Staged runtimes with versioned Product/Pricing data. The framework's opt-in vService MongoDB tests cover this boundary in disposable storage; run native Copilot acceptance as a separate authenticated gate. Existing overwritten evidence cannot be reconstructed by installing this fix, and uncertainty never permits resubmitting the original business operation.",
            "On each native owner, explicitly admit recording through layered configuration:"
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "   commandReceipts: {\n     enabled: true,\n     owners: { product: true, pricing: true, wasteCollection: true, profile: true }\n   }"
        },
        {
          "kind": "paragraph",
          "text": "Defaults are `enabled: false` and no admitted owners. Admit only modules composed on that runtime. Once admitted, these wrapped commands require a stable original idempotency key; legacy callers without one fail closed."
        },
        {
          "kind": "ordered-list",
          "items": [
            "On Copilot, enable `copilot.workbench.receiptRecovery.enabled` through the normal reviewed deployment process. Configure `label` and `continuation` presentation text. No deployment gate is enabled by source installation.",
            "Grant the employee `copilot.mutation.prepare`, `copilot.mutation.execute` and independently `copilot.mutation.reconcile`. Preserve native schema write, enterprise setup/access, consent and role permissions. Recovery cannot widen any of these grants. The original tenant, enterprise and human actor must match.",
            "Configure canonical native module names and existing target authority. Product and Pricing may have different owning modules. A changed execution target invalidates reconciliation; credentials and destinations never come from chat.",
            "Validate a disposable test-runtime action end to end before production enablement. Include lost response, current access revocation and a competing reconciliation request. Do not create or delete customer records for testing."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee Journey",
          "anchor": "copilotOriginalBusinessResults-4-employee-journey"
        },
        {
          "kind": "paragraph",
          "text": "New-write admission is distinct from evidence inspection. Disabling standalone invitation/price admission, Profile enterprise creation admission or Waste collection-centre admission does not by itself block non-coupon original-result reads. The independent recovery gate, current employee/native grants and exact original target remain mandatory. Removing or changing the native target fails closed; an alternate route cannot be used to infer the original result."
        },
        {
          "kind": "paragraph",
          "text": "If inspection proves all submitted rows complete, unstarted rows may receive a fresh review, but execution still refuses while their journey is disabled. An approval or caller-supplied `inspection` field cannot bypass the disabled gate. Administrators can propose the standalone admission, interpretation and recovery controls through **Copilot Settings > Business action controls**. Independent runtime governance owns activation; none of these controls erase native receipts."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Prepare the supported operation in Copilot and review every primary and related record. Resolve missing required information before approving.",
            "Approve the displayed action, then explicitly execute it. Keep the action reference visible in the conversation.",
            "If the response is interrupted, do not submit the same business request as a new task. The action shows `OUTCOME_UNKNOWN` or `EXECUTING`; Execute is absent.",
            "Select **Inspect original business results**. Axis first reads the current original action, then asks the fixed owning APIs for original receipts.",
            "When a submitted row is proven complete, its state becomes `COMPLETED`. If any submitted row is unresolved, the action remains `OUTCOME_UNKNOWN` and no continuation approval is offered.",
            "If all submitted rows completed and later rows remain `NOT_STARTED`, review the refreshed confirmation. The notice distinguishes completed work from remaining work. Approve this new revision, then execute explicitly.",
            "Continuation skips all completed rows and submits only never-started rows. Another lost response follows the same inspection path. There is no timer, automatic retry, compensation or rollback.",
            "Reloading a recorded conversation restores its latest owned action from the private action journal when recovery is admitted. An older action can still be inspected by its exact API reference. Recording-off conversations do not acquire transcript history merely because a business journal exists."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "State Diagram",
          "anchor": "copilotOriginalBusinessResults-5-state-diagram"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n    approved[\"Approved action\"] --> execution[\"Claim and dispatch original row\"]\n    execution --> unknown[\"Response or completion uncertain\"]\n    unknown --> inspect[\"Explicit original receipt inspection\"]\n    inspect --> proof{\"Original completion proven?\"}\n    proof -->|No| unknown\n    proof -->|Yes| remaining{\"Any never-started rows?\"}\n    remaining -->|No| complete[\"Consumed: all rows complete\"]\n    remaining -->|Yes| review[\"Review and approve a new revision\"]\n    review --> continuation[\"Execute never-started rows only\"]\n    continuation --> execution"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "API Contract",
          "anchor": "copilotOriginalBusinessResults-6-api-contract"
        },
        {
          "kind": "paragraph",
          "text": "All paths below are relative to the appropriate module's versioned API base. They are authenticated, sensitive and noncacheable; none accepts a destination, provider credential, arbitrary query or alternate actor."
        },
        {
          "kind": "table",
          "headers": [
            "Owner",
            "Method and Path",
            "Body"
          ],
          "rows": [
            [
              "Copilot API",
              "`POST /confirmations/:confirmationCode/original-results`",
              "`expectedRevision`, `argumentsDigest`"
            ],
            [
              "Product",
              "`POST /product/commands/inspect`",
              "`model`, `idempotencyKey`"
            ],
            [
              "Pricing",
              "`POST /pricerow/commands/inspect`",
              "`model`, `idempotencyKey`"
            ],
            [
              "Waste Collection",
              "`POST /wastecollectionpoint/commands/inspect`",
              "`model`, `idempotencyKey`"
            ],
            [
              "Profile",
              "`POST /enterprises/commands/inspect`",
              "`model`, `idempotencyKey`"
            ],
            [
              "Profile",
              "`POST /enterprises/:enterpriseCode/access-assignments/commands/inspect`",
              "`command`, `idempotencyKey`; original command contains its matching key"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Copilot derives the original key from plan ID, schema and row identity. Native inspection returns contract version, original scope, command fingerprint, argument fingerprint and `COMPLETED` or `OUTCOME_UNKNOWN`. Completion includes only a bounded result identity and result fingerprint, never the full record."
        },
        {
          "kind": "paragraph",
          "text": "Each receipt is inserted as STARTED before the one native dispatch. COMPLETED is written only after exact native acknowledgement and current authorization. A crash between the business write and completion receipt deliberately remains unknown. This protocol is not a distributed exactly-once transaction. The journal keeps its original scalar claim predicate separate from the model passed to generated save. Schema defaults and pipeline metadata must not become new completion conditions. The native result and exact original claim still have to match; this does not relax durable-journal validation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting",
          "anchor": "copilotOriginalBusinessResults-7-troubleshooting"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "Meaning and Action"
          ],
          "rows": [
            [
              "Inspection control absent",
              "Verify independent grant, enabled Copilot recovery and supported operation. Do not broaden native access."
            ],
            [
              "No receipt for a historical action",
              "Remains unknown. Do not backfill completion from record existence."
            ],
            [
              "Recording disabled after execution",
              "Existing native receipts remain inspectable under current native authority."
            ],
            [
              "Source action still APPROVED after transport loss",
              "Axis keeps the uncertainty lock; a delayed original execution may still arrive. A read does not authorize retry."
            ],
            [
              "Receipt STARTED but record exists",
              "Still unknown: record existence does not prove the original command's entire outcome."
            ],
            [
              "Current employee permission or consent revoked",
              "Inspection fails closed even if the original command was allowed. Restore access only through normal owner governance."
            ],
            [
              "Revision changed",
              "Reload original evidence. Do not overwrite another claimant or reuse stale approval."
            ],
            [
              "Domain write acknowledged but journal response lost",
              "Inspection may recover the retained completion. If completion was not durably recorded, uncertainty remains."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and Extension",
          "anchor": "copilotOriginalBusinessResults-8-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Extend only native adapters with explicit schema, authorization, route and result contracts. Do not send model-generated URLs or treat all schema CRUD as supported business journeys. Keep original intent immutable and bound continuation to its digest. Do not discard native receipts through transcript or action retention."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common Mistakes",
          "anchor": "copilotOriginalBusinessResults-9-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a timeout or a current record as proof of original completion.",
            "Reusing the old approval or replaying a completed row during continuation.",
            "Enabling recovery before private schemas, unique indexes and provider durability are qualified, or granting native permissions merely to make a button appear.",
            "Deleting native receipts through transcript retention or inventing receipts for historical operations whose result was never acknowledged."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "copilotOriginalBusinessResults-10-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run `modelCommandReceipt.test.js`, `enterpriseCommandReceipt.test.js`, `copilotActionRecovery.test.js`, existing typed domain action tests, generated controller/router contracts, and Axis client/presentation/card tests. Browser checks must cover desktop, mobile, uncertainty lock, new approval and completion. Live provider, authenticated runtime and deployed schema qualification remain separate acceptance evidence."
        }
      ],
      "searchText": "Original Business Results and Safe Continuation Inspect native original command receipts and approve only never-started rows after uncertain business execution. # Original Business Results and Safe Continuation\n\nFunctional owner: `nodics.copilot`. Technical owner: `copilotWorkbench`. Product, Pricing, Waste Collection and Profile own their native command journals. nDatabase supplies the bounded persistence protocol; Axis renders the result.\n\n## Business Outcome\n\nAn interrupted response does not establish whether a business operation failed. Copilot can inspect the original native acknowledgement without submitting that operation again. Completed rows remain completed. If every submitted row is proven complete, a new approval can cover the rows that were never started.\n\nThis guide covers Product creation with PriceRows, Profile enterprise creation with pending employee invitations, standalone existing-enterprise invitations, standalone price-row creation, and Waste collection-centre creation. Follow [standalone business actions](/docs/framework/copilot/standalone-business-actions) for their setup, review and native-owner boundaries. Coupon fulfillment retains its separate Commerce receipt inspector. This is not a generic adapter for every Axis operation, and invitations do not activate accounts.\n\n![Original result inspection on desktop](media:nodicsDocsImage_f2edf099c35b56266359228a)\n\n![Fresh continuation approval on mobile](media:nodicsDocsImage_96ccaa65de50c5f56592bbb2)\n\nThese screenshots use synthetic renderer data, not a signed-in customer runtime.\n\n### Signed-In Local Enterprise Evidence\n\nThe following captures are from the complete Axis application with actual Profile authentication, local Ollama, native enterprise execution and durable MongoDB receipts. The data is disposable and synthetic.\n\n![Completed enterprise and invitations in full Axis](media:nodicsDocsImage_97d044b2e35d2bcbb6509942)\n\n![Completed action at mobile width](media:nodicsDocsImage_4b7eb14a37d6bfb149253fd9)\n\nThe tested sequence lost the response after the native enterprise succeeded, restarted the backend, inspected the original receipt, obtained fresh approval and executed only the three never-started invitations. Native queries verified one enterprise and four PENDING invitations including its administrator. A second conversation recovered its review after a reload during model execution; rejecting it added no invitation and did not repeat the model charge. This is local-profile acceptance, not proof of every business adapter, notification delivery, invitee activation or distributed failover.\n\nBeginners should follow the Employee Journey and preserve the original action reference when execution is uncertain. Developers should read the API Contract and Customization and Extension sections before adding another native adapter.\n\n## Administrator Setup\n\nCollection-point creation is insert-only: using an existing centre code in a new approved create must not edit that centre. If it cannot be confirmed, preserve the action reference and use **Inspect original business results**. An earlier record with the same code is not proof that this command succeeded. Use the native collection-point update journey for an intended edit. This rule applies even when new receipt recording is disabled; it does not change internal import or Product/Pricing versioning behavior.\n\n1. Deploy the matching framework owners and Axis client. Keep the implementation in framework modules, not customer kickoff modules.\n2. Provision `productCommandReceipt`, `pricingCommandReceipt`, `wasteCollectionCommandReceipt` and `profileCommandReceipt` in their owning modules. Each extends nDatabase's abstract `commandReceipt` schema and has a unique code index. Keep generic routes, cache, events, search and BackOffice editing disabled for these journals.\n3. Qualify the existing `DURABLE_JOURNAL` persistence path, including majority primary readback, durable insert-only identity and atomic conditional updates. A successful volatile test double is not deployment qualification. Do not replace the generated model service with a second storage connection. Include the effective service hierarchy in qualification. When `vService` is active, its save/update adapters must retain shared database admission and its read selector must retain private-read qualification. Confirm that duplicate journal creation cannot overwrite the original and stale conditional completion matches zero records. Keep journals unversioned even on Staged runtimes with versioned Product/Pricing data. The framework's opt-in vService MongoDB tests cover this boundary in disposable storage; run native Copilot acceptance as a separate authenticated gate. Existing overwritten evidence cannot be reconstructed by installing this fix, and uncertainty never permits resubmitting the original business operation.\n4. On each native owner, explicitly admit recording through layered configuration:\n\n```js\n   commandReceipts: {\n     enabled: true,\n     owners: { product: true, pricing: true, wasteCollection: true, profile: true }\n   }\n```\n\nDefaults are `enabled: false` and no admitted owners. Admit only modules composed on that runtime. Once admitted, these wrapped commands require a stable original idempotency key; legacy callers without one fail closed.\n\n1. On Copilot, enable `copilot.workbench.receiptRecovery.enabled` through the normal reviewed deployment process. Configure `label` and `continuation` presentation text. No deployment gate is enabled by source installation.\n2. Grant the employee `copilot.mutation.prepare`, `copilot.mutation.execute` and independently `copilot.mutation.reconcile`. Preserve native schema write, enterprise setup/access, consent and role permissions. Recovery cannot widen any of these grants. The original tenant, enterprise and human actor must match.\n3. Configure canonical native module names and existing target authority. Product and Pricing may have different owning modules. A changed execution target invalidates reconciliation; credentials and destinations never come from chat.\n4. Validate a disposable test-runtime action end to end before production enablement. Include lost response, current access revocation and a competing reconciliation request. Do not create or delete customer records for testing.\n\n## Employee Journey\n\nNew-write admission is distinct from evidence inspection. Disabling standalone invitation/price admission, Profile enterprise creation admission or Waste collection-centre admission does not by itself block non-coupon original-result reads. The independent recovery gate, current employee/native grants and exact original target remain mandatory. Removing or changing the native target fails closed; an alternate route cannot be used to infer the original result.\n\nIf inspection proves all submitted rows complete, unstarted rows may receive a fresh review, but execution still refuses while their journey is disabled. An approval or caller-supplied `inspection` field cannot bypass the disabled gate. Administrators can propose the standalone admission, interpretation and recovery controls through **Copilot Settings > Business action controls**. Independent runtime governance owns activation; none of these controls erase native receipts.\n\n1. Prepare the supported operation in Copilot and review every primary and related record. Resolve missing required information before approving.\n2. Approve the displayed action, then explicitly execute it. Keep the action reference visible in the conversation.\n3. If the response is interrupted, do not submit the same business request as a new task. The action shows `OUTCOME_UNKNOWN` or `EXECUTING`; Execute is absent.\n4. Select **Inspect original business results**. Axis first reads the current original action, then asks the fixed owning APIs for original receipts.\n5. When a submitted row is proven complete, its state becomes `COMPLETED`. If any submitted row is unresolved, the action remains `OUTCOME_UNKNOWN` and no continuation approval is offered.\n6. If all submitted rows completed and later rows remain `NOT_STARTED`, review the refreshed confirmation. The notice distinguishes completed work from remaining work. Approve this new revision, then execute explicitly.\n7. Continuation skips all completed rows and submits only never-started rows. Another lost response follows the same inspection path. There is no timer, automatic retry, compensation or rollback.\n8. Reloading a recorded conversation restores its latest owned action from the private action journal when recovery is admitted. An older action can still be inspected by its exact API reference. Recording-off conversations do not acquire transcript history merely because a business journal exists.\n\n## State Diagram\n\n```mermaid\nflowchart TD\n    approved[\"Approved action\"] --> execution[\"Claim and dispatch original row\"]\n    execution --> unknown[\"Response or completion uncertain\"]\n    unknown --> inspect[\"Explicit original receipt inspection\"]\n    inspect --> proof{\"Original completion proven?\"}\n    proof -->|No| unknown\n    proof -->|Yes| remaining{\"Any never-started rows?\"}\n    remaining -->|No| complete[\"Consumed: all rows complete\"]\n    remaining -->|Yes| review[\"Review and approve a new revision\"]\n    review --> continuation[\"Execute never-started rows only\"]\n    continuation --> execution\n```\n\n## API Contract\n\nAll paths below are relative to the appropriate module's versioned API base. They are authenticated, sensitive and noncacheable; none accepts a destination, provider credential, arbitrary query or alternate actor.\n\n| Owner | Method and Path | Body |\n| --- | --- | --- |\n| Copilot API | `POST /confirmations/:confirmationCode/original-results` | `expectedRevision`, `argumentsDigest` |\n| Product | `POST /product/commands/inspect` | `model`, `idempotencyKey` |\n| Pricing | `POST /pricerow/commands/inspect` | `model`, `idempotencyKey` |\n| Waste Collection | `POST /wastecollectionpoint/commands/inspect` | `model`, `idempotencyKey` |\n| Profile | `POST /enterprises/commands/inspect` | `model`, `idempotencyKey` |\n| Profile | `POST /enterprises/:enterpriseCode/access-assignments/commands/inspect` | `command`, `idempotencyKey`; original command contains its matching key |\n\nCopilot derives the original key from plan ID, schema and row identity. Native inspection returns contract version, original scope, command fingerprint, argument fingerprint and `COMPLETED` or `OUTCOME_UNKNOWN`. Completion includes only a bounded result identity and result fingerprint, never the full record.\n\nEach receipt is inserted as STARTED before the one native dispatch. COMPLETED is written only after exact native acknowledgement and current authorization. A crash between the business write and completion receipt deliberately remains unknown. This protocol is not a distributed exactly-once transaction. The journal keeps its original scalar claim predicate separate from the model passed to generated save. Schema defaults and pipeline metadata must not become new completion conditions. The native result and exact original claim still have to match; this does not relax durable-journal validation.\n\n## Troubleshooting\n\n| Observation | Meaning and Action |\n| --- | --- |\n| Inspection control absent | Verify independent grant, enabled Copilot recovery and supported operation. Do not broaden native access. |\n| No receipt for a historical action | Remains unknown. Do not backfill completion from record existence. |\n| Recording disabled after execution | Existing native receipts remain inspectable under current native authority. |\n| Source action still APPROVED after transport loss | Axis keeps the uncertainty lock; a delayed original execution may still arrive. A read does not authorize retry. |\n| Receipt STARTED but record exists | Still unknown: record existence does not prove the original command's entire outcome. |\n| Current employee permission or consent revoked | Inspection fails closed even if the original command was allowed. Restore access only through normal owner governance. |\n| Revision changed | Reload original evidence. Do not overwrite another claimant or reuse stale approval. |\n| Domain write acknowledged but journal response lost | Inspection may recover the retained completion. If completion was not durably recorded, uncertainty remains. |\n\n## Customization and Extension\n\nExtend only native adapters with explicit schema, authorization, route and result contracts. Do not send model-generated URLs or treat all schema CRUD as supported business journeys. Keep original intent immutable and bound continuation to its digest. Do not discard native receipts through transcript or action retention.\n\n## Common Mistakes\n\n- Treating a timeout or a current record as proof of original completion.\n- Reusing the old approval or replaying a completed row during continuation.\n- Enabling recovery before private schemas, unique indexes and provider durability are qualified, or granting native permissions merely to make a button appear.\n- Deleting native receipts through transcript retention or inventing receipts for historical operations whose result was never acknowledged.\n\n## Verification\n\nRun `modelCommandReceipt.test.js`, `enterpriseCommandReceipt.test.js`, `copilotActionRecovery.test.js`, existing typed domain action tests, generated controller/router contracts, and Axis client/presentation/card tests. Browser checks must cover desktop, mobile, uncertainty lock, new approval and completion. Live provider, authenticated runtime and deployed schema qualification remain separate acceptance evidence.\n",
      "previous": {
        "title": "Collection Inspection In Conversation",
        "route": "/docs/framework/copilot/collection-inspection"
      },
      "next": {
        "title": "Recorded Manual Knowledge Refresh",
        "route": "/docs/framework/copilot/recorded-manual-refresh"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.copilot",
        "technicalModule": "copilotWorkbench",
        "owner": "copilotWorkbench",
        "sourcePath": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/copilotWorkbenchDocumentationComponentData.js",
        "wordCount": 1706,
        "checksum": "6e08e7617f5a17eea0eb0c185c09e7f1dab6f37a362b7be32615848d9d55b1a4"
      },
      "slug": "copilot-original-business-results",
      "locale": "en",
      "navigationGroup": "AI Copilot",
      "navigationGroupCode": "ai-copilot",
      "navigationGroupOrder": 20,
      "navigationOrder": 28,
      "references": [
        {
          "documentId": "copilot.retention-lifecycle",
          "owner": "copilotConversation"
        }
      ]
    },
    "active": true
  }
};
