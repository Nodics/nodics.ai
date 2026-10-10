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
    "code": "nodicsDocsComponentfoundationNmsRuntimeMonitoring",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.nms-runtime-monitoring",
      "title": "NMS Runtime Monitoring",
      "route": "/docs/framework/foundation-nms-runtime-monitoring",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "NMS Runtime Monitoring"
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
      "summary": "How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.7",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "framework.devops-runtime",
        "framework.local-verification-checklist",
        "process.runtime-lifecycle"
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
        "table",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "nms",
        "monitoring",
        "node",
        "runtime-health",
        "operator"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Runtime Health and Support",
        "NMS Runtime Monitoring"
      ],
      "headings": [
        {
          "text": "Source map",
          "anchor": "foundationNmsRuntimeMonitoring-1-source-map",
          "level": 2
        },
        {
          "text": "Monitoring model",
          "anchor": "foundationNmsRuntimeMonitoring-2-monitoring-model",
          "level": 2
        },
        {
          "text": "Health contract",
          "anchor": "foundationNmsRuntimeMonitoring-3-health-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "foundationNmsRuntimeMonitoring-4-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Implementation handoff",
          "anchor": "foundationNmsRuntimeMonitoring-5-implementation-handoff",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationNmsRuntimeMonitoring-6-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationNmsRuntimeMonitoring-7-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "nNms provides configured peer notification, ping-based node state, responsibility negotiation and node up/down event hooks. Its state is process-local coordination context, not a durable monitoring lake, capability readiness verdict or proven operations dashboard. An active flag means only the current manager's node-state rule; it does not prove required dependencies or business journeys are healthy. For beginners, identify the local node and one configured peer, then follow the configuration and observed-state walkthrough without changing their identities. Compare a ping observation with the runtime's separate readiness evidence. Read the documented sender and stop-handler limitations before selecting recovery; stopping a check is not repairing a failed node."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationNmsRuntimeMonitoring-1-source-map"
        },
        {
          "kind": "paragraph",
          "text": "A developer investigating node state should trace the configured manager, sender, route and event handler together. Reproduce the documented sender/stop-handler limitations with isolated fixtures before changing recovery behavior. Preserve runtime and tenant identity, and qualify real readiness separately rather than deriving business availability from a volatile peer flag."
        },
        {
          "kind": "table",
          "headers": [
            "Owner-relative source",
            "Responsibility"
          ],
          "rows": [
            [
              "src/service/node/defaultNodeManagerService.js",
              "notifyNodeStarted, checkActiveNodes/checkActiveNode, requestResponsibility, stopHealthCheck."
            ],
            [
              "src/service/config/defaultNodeConfigurationService.js",
              "module.nms.nodes active/inactive/granted state."
            ],
            [
              "src/router/routers.js; config/properties.js",
              "Secured system routes and disabled-by-default ping configuration."
            ],
            [
              "../../nodics.js",
              "Foundation startup invokes notification/checks when activateNodePing is true."
            ],
            [
              "Canonical configuration.runtime-behavior-management, framework.devops-runtime, process.runtime-lifecycle",
              "Separate configuration, topology and business execution evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Monitoring model",
          "anchor": "foundationNmsRuntimeMonitoring-2-monitoring-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Config[\"Pingable active router-enabled modules\"] --> Nodes[\"Router server node configuration\"]\n  Nodes --> Notify[\"Peer startup notification\"]\n  Notify --> Checks[\"Periodic ping of eligible peers\"]\n  Checks --> State[\"Volatile module.nms.nodes\"]\n  State --> Events[\"Node up/down owner hooks\"]"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  activateNodePing: true,\n  nodePingTimeout: 10000,\n  nodePingableModules: { cronjob: { enabled: true } }\n};"
        },
        {
          "kind": "paragraph",
          "text": "This is an illustrative deployment overlay, not topology provisioning. The selected runtime must already load cronjob, enable its router and declare its peer nodes through router/server configuration. Foundation starts notifyNodeStarted then checkActiveNodes only with activateNodePing enabled. Each selected module must also have nodePingableModules.<module>.enabled. nodePingTimeout is the setInterval period in milliseconds (default10000; the method has a 5000 fallback), not an HTTP request deadline or readiness timeout."
        },
        {
          "kind": "paragraph",
          "text": "Example: nodeA checks configured nodeB. An absent entry passes isNodeActive, so nodeB is initially eligible. A failed ping writes active:false and calls handleNodeInactive. Later checkActiveNode skips peers recorded inactive; automatic ping revival is not established. Activation notification or another explicitly governed recovery path must mark the peer active again. State disappears on restart; missing state defaults true, never affirmative health evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Health contract",
          "anchor": "foundationNmsRuntimeMonitoring-3-health-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Observation",
            "What the source supports",
            "What it does not establish"
          ],
          "rows": [
            [
              "module.nms.nodes[nodeId].active",
              "updateNodeActive/updateNodeInActive and isNodeActive; absent entry is treated as active.",
              "Last heartbeat timestamp, durable history, required dependency readiness or failover success."
            ],
            [
              "granted/responsibleNode",
              "grantNodeResponsibility records a grant and active:false; manager uses existing request/precedence checks.",
              "Distributed lease, exactly-once business work or ownership of a Cron/Process operation."
            ],
            [
              "nodeUpEvent/nodeDownEvent",
              "State-change handler dispatch to owning reactions.",
              "Installed dashboard, persistent metrics, alerts or BackOffice availability."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Keep nSystem readiness and runtime lifecycle contributors, BackOffice registration/availability, and heavy monitoring/history with their existing owners. Correlate their evidence with selected project/environment/server/node/tenant; do not promote an NMS flag into a combined healthy status."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "foundationNmsRuntimeMonitoring-4-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Customize the existing node up/down handlers and layered ping/module configuration. Keep checks bounded and credentials private; preserve module/router selection and exact peer identity. Dependency, queue, publication and business-health contributors belong to their respective lifecycle/readiness owners, not an invented NMS contributor API. Any operations UI must use a separately implemented secured projection and state its evidence age."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "foundationNmsRuntimeMonitoring-5-implementation-handoff"
        },
        {
          "kind": "table",
          "headers": [
            "Secured system route (POST)",
            "Intended action and recovery boundary"
          ],
          "rows": [
            [
              "/node/active/:nodeId",
              "Records activation and dispatches node-active hooks. Use only after the exact peer has been independently verified/repaired; this is not a readiness probe."
            ],
            [
              "/node/request/responsibility/:nodeId",
              "Runs manager grant/deny logic; missing nodeId rejects and competing responsibility can return ERR_RES_00001. Reconcile owning work before requesting a transfer."
            ],
            [
              "/node/health/check/stop",
              "Intended to clear the module interval, not stop/restart/repair a process or grant responsibility."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Current implementation gaps block treating these as a qualified recovery recipe: notifyNode constructs GET node/active/... while the declared activation route is POST; stopHealthCheck refers to moduleName without deriving it from request. A deployed override may differ, but this source alone does not prove either path succeeds. Do not work around them with raw state writes, public routes or broader credentials. Escalate to the nNms owner and qualify the effective implementation before use."
        },
        {
          "kind": "paragraph",
          "text": "During an incident, retain sanitized ping failure, exact peer/module coordinates and observed state; inspect the actual node and dependency owners, repair through the deployment operator's existing process, then verify activation, event handling and responsibility at the business owner. Stopping checks suppresses observation and can leave stale state. It is not recovery. Runtime repair and long-term incident history remain with their existing operational owners."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationNmsRuntimeMonitoring-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a running process as proof that every capability is healthy.",
            "Showing raw dependency exceptions to business users.",
            "Adding expensive health checks that harm production traffic.",
            "Hiding node responsibility for scheduled jobs.",
            "Failing to carry correlation ids through setup or publication errors."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationNmsRuntimeMonitoring-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Qualification must cover disabled ping, inactive/non-router modules, initial unknown state, failed peer ping, inactive-peer skipping, competing responsibility and restart loss of state. Exercise secured route method compatibility and the stop handler defect in isolation before any recovery claim. Independently qualify readiness, BackOffice availability, the intended monitoring UI and actual multi-node work ownership."
        }
      ],
      "searchText": "NMS Runtime Monitoring How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence. # NMS Runtime Monitoring\n\nnNms provides configured peer notification, ping-based node state, responsibility negotiation and node up/down event hooks. Its state is process-local coordination context, not a durable monitoring lake, capability readiness verdict or proven operations dashboard. An active flag means only the current manager's node-state rule; it does not prove required dependencies or business journeys are healthy. For beginners, identify the local node and one configured peer, then follow the configuration and observed-state walkthrough without changing their identities. Compare a ping observation with the runtime's separate readiness evidence. Read the documented sender and stop-handler limitations before selecting recovery; stopping a check is not repairing a failed node.\n\n## Source map\n\nA developer investigating node state should trace the configured manager, sender, route and event handler together. Reproduce the documented sender/stop-handler limitations with isolated fixtures before changing recovery behavior. Preserve runtime and tenant identity, and qualify real readiness separately rather than deriving business availability from a volatile peer flag.\n\n| Owner-relative source | Responsibility |\n| --- | --- |\n| src/service/node/defaultNodeManagerService.js | notifyNodeStarted, checkActiveNodes/checkActiveNode, requestResponsibility, stopHealthCheck. |\n| src/service/config/defaultNodeConfigurationService.js | module.nms.nodes active/inactive/granted state. |\n| src/router/routers.js; config/properties.js | Secured system routes and disabled-by-default ping configuration. |\n| ../../nodics.js | Foundation startup invokes notification/checks when activateNodePing is true. |\n| Canonical configuration.runtime-behavior-management, framework.devops-runtime, process.runtime-lifecycle | Separate configuration, topology and business execution evidence. |\n\n## Monitoring model\n\n```mermaid\nflowchart TD\n  Config[\"Pingable active router-enabled modules\"] --> Nodes[\"Router server node configuration\"]\n  Nodes --> Notify[\"Peer startup notification\"]\n  Notify --> Checks[\"Periodic ping of eligible peers\"]\n  Checks --> State[\"Volatile module.nms.nodes\"]\n  State --> Events[\"Node up/down owner hooks\"]\n```\n\n```js\nmodule.exports = {\n  activateNodePing: true,\n  nodePingTimeout: 10000,\n  nodePingableModules: { cronjob: { enabled: true } }\n};\n```\n\nThis is an illustrative deployment overlay, not topology provisioning. The selected runtime must already load cronjob, enable its router and declare its peer nodes through router/server configuration. Foundation starts notifyNodeStarted then checkActiveNodes only with activateNodePing enabled. Each selected module must also have nodePingableModules.<module>.enabled. nodePingTimeout is the setInterval period in milliseconds (default10000; the method has a 5000 fallback), not an HTTP request deadline or readiness timeout.\n\nExample: nodeA checks configured nodeB. An absent entry passes isNodeActive, so nodeB is initially eligible. A failed ping writes active:false and calls handleNodeInactive. Later checkActiveNode skips peers recorded inactive; automatic ping revival is not established. Activation notification or another explicitly governed recovery path must mark the peer active again. State disappears on restart; missing state defaults true, never affirmative health evidence.\n\n## Health contract\n\n| Observation | What the source supports | What it does not establish |\n| --- | --- | --- |\n| module.nms.nodes[nodeId].active | updateNodeActive/updateNodeInActive and isNodeActive; absent entry is treated as active. | Last heartbeat timestamp, durable history, required dependency readiness or failover success. |\n| granted/responsibleNode | grantNodeResponsibility records a grant and active:false; manager uses existing request/precedence checks. | Distributed lease, exactly-once business work or ownership of a Cron/Process operation. |\n| nodeUpEvent/nodeDownEvent | State-change handler dispatch to owning reactions. | Installed dashboard, persistent metrics, alerts or BackOffice availability. |\n\nKeep nSystem readiness and runtime lifecycle contributors, BackOffice registration/availability, and heavy monitoring/history with their existing owners. Correlate their evidence with selected project/environment/server/node/tenant; do not promote an NMS flag into a combined healthy status.\n\n## Customization and extension guidance\n\nCustomize the existing node up/down handlers and layered ping/module configuration. Keep checks bounded and credentials private; preserve module/router selection and exact peer identity. Dependency, queue, publication and business-health contributors belong to their respective lifecycle/readiness owners, not an invented NMS contributor API. Any operations UI must use a separately implemented secured projection and state its evidence age.\n\n## Implementation handoff\n\n| Secured system route (POST) | Intended action and recovery boundary |\n| --- | --- |\n| /node/active/:nodeId | Records activation and dispatches node-active hooks. Use only after the exact peer has been independently verified/repaired; this is not a readiness probe. |\n| /node/request/responsibility/:nodeId | Runs manager grant/deny logic; missing nodeId rejects and competing responsibility can return ERR_RES_00001. Reconcile owning work before requesting a transfer. |\n| /node/health/check/stop | Intended to clear the module interval, not stop/restart/repair a process or grant responsibility. |\n\nCurrent implementation gaps block treating these as a qualified recovery recipe: notifyNode constructs GET node/active/... while the declared activation route is POST; stopHealthCheck refers to moduleName without deriving it from request. A deployed override may differ, but this source alone does not prove either path succeeds. Do not work around them with raw state writes, public routes or broader credentials. Escalate to the nNms owner and qualify the effective implementation before use.\n\nDuring an incident, retain sanitized ping failure, exact peer/module coordinates and observed state; inspect the actual node and dependency owners, repair through the deployment operator's existing process, then verify activation, event handling and responsibility at the business owner. Stopping checks suppresses observation and can leave stale state. It is not recovery. Runtime repair and long-term incident history remain with their existing operational owners.\n\n## Common mistakes\n\n- Treating a running process as proof that every capability is healthy.\n- Showing raw dependency exceptions to business users.\n- Adding expensive health checks that harm production traffic.\n- Hiding node responsibility for scheduled jobs.\n- Failing to carry correlation ids through setup or publication errors.\n\n## Verification\n\nQualification must cover disabled ping, inactive/non-router modules, initial unknown state, failed peer ping, inactive-peer skipping, competing responsibility and restart loss of state. Exercise secured route method compatibility and the stop handler defect in isolation before any recovery claim. Independently qualify readiness, BackOffice availability, the intended monitoring UI and actual multi-node work ownership.\n",
      "previous": {
        "title": "Shopping List Commerce Boundary",
        "route": "/docs/framework/commerce-shopping-list-commerce-boundary"
      },
      "next": {
        "title": "Service Runtime and Override Precedence",
        "route": "/docs/framework/foundation-service-runtime-overrides"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nms",
        "owner": "nms",
        "sourcePath": "data/docs-v001/records/documentation/nmsDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nmsDocumentationComponentData.js",
        "wordCount": 889,
        "checksum": "4a0355621dd4e838438619c670293db6ec584da94e3943644232760db0feda1b"
      },
      "slug": "foundation-nms-runtime-monitoring",
      "locale": "en",
      "navigationGroup": "Runtime Health and Support",
      "navigationGroupCode": "runtime-health-and-support",
      "navigationGroupOrder": 40,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.devops-runtime",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "process.runtime-lifecycle",
          "owner": "workflow"
        },
        {
          "documentId": "configuration.runtime-behavior-management",
          "owner": "config"
        }
      ]
    },
    "active": true
  }
};
