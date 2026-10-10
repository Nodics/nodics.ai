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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationnmsruntimemonitoring",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationNmsRuntimeMonitoring",
    "title": "NMS Runtime Monitoring",
    "summary": "How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence.",
    "searchText": "NMS Runtime Monitoring How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence. nms monitoring node runtime-health operator",
    "keywords": [
      "nms",
      "monitoring",
      "node",
      "runtime-health",
      "operator"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationnmsruntimemonitoring",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationNmsRuntimeMonitoring",
    "title": "NMS Runtime Monitoring",
    "summary": "How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence.",
    "searchText": "NMS Runtime Monitoring How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence. # NMS Runtime Monitoring\n\nnNms provides configured peer notification, ping-based node state, responsibility negotiation and node up/down event hooks. Its state is process-local coordination context, not a durable monitoring lake, capability readiness verdict or proven operations dashboard. An active flag means only the current manager's node-state rule; it does not prove required dependencies or business journeys are healthy. For beginners, identify the local node and one configured peer, then follow the configuration and observed-state walkthrough without changing their identities. Compare a ping observation with the runtime's separate readiness evidence. Read the documented sender and stop-handler limitations before selecting recovery; stopping a check is not repairing a failed node.\n\n## Source map\n\nA developer investigating node state should trace the configured manager, sender, route and event handler together. Reproduce the documented sender/stop-handler limitations with isolated fixtures before changing recovery behavior. Preserve runtime and tenant identity, and qualify real readiness separately rather than deriving business availability from a volatile peer flag.\n\n| Owner-relative source | Responsibility |\n| --- | --- |\n| src/service/node/defaultNodeManagerService.js | notifyNodeStarted, checkActiveNodes/checkActiveNode, requestResponsibility, stopHealthCheck. |\n| src/service/config/defaultNodeConfigurationService.js | module.nms.nodes active/inactive/granted state. |\n| src/router/routers.js; config/properties.js | Secured system routes and disabled-by-default ping configuration. |\n| ../../nodics.js | Foundation startup invokes notification/checks when activateNodePing is true. |\n| Canonical configuration.runtime-behavior-management, framework.devops-runtime, process.runtime-lifecycle | Separate configuration, topology and business execution evidence. |\n\n## Monitoring model\n\n```mermaid\nflowchart TD\n  Config[\"Pingable active router-enabled modules\"] --> Nodes[\"Router server node configuration\"]\n  Nodes --> Notify[\"Peer startup notification\"]\n  Notify --> Checks[\"Periodic ping of eligible peers\"]\n  Checks --> State[\"Volatile module.nms.nodes\"]\n  State --> Events[\"Node up/down owner hooks\"]\n```\n\n```js\nmodule.exports = {\n  activateNodePing: true,\n  nodePingTimeout: 10000,\n  nodePingableModules: { cronjob: { enabled: true } }\n};\n```\n\nThis is an illustrative deployment overlay, not topology provisioning. The selected runtime must already load cronjob, enable its router and declare its peer nodes through router/server configuration. Foundation starts notifyNodeStarted then checkActiveNodes only with activateNodePing enabled. Each selected module must also have nodePingableModules.<module>.enabled. nodePingTimeout is the setInterval period in milliseconds (default10000; the method has a 5000 fallback), not an HTTP request deadline or readiness timeout.\n\nExample: nodeA checks configured nodeB. An absent entry passes isNodeActive, so nodeB is initially eligible. A failed ping writes active:false and calls handleNodeInactive. Later checkActiveNode skips peers recorded inactive; automatic ping revival is not established. Activation notification or another explicitly governed recovery path must mark the peer active again. State disappears on restart; missing state defaults true, never affirmative health evidence.\n\n## Health contract\n\n| Observation | What the source supports | What it does not establish |\n| --- | --- | --- |\n| module.nms.nodes[nodeId].active | updateNodeActive/updateNodeInActive and isNodeActive; absent entry is treated as active. | Last heartbeat timestamp, durable history, required dependency readiness or failover success. |\n| granted/responsibleNode | grantNodeResponsibility records a grant and active:false; manager uses existing request/precedence checks. | Distributed lease, exactly-once business work or ownership of a Cron/Process operation. |\n| nodeUpEvent/nodeDownEvent | State-change handler dispatch to owning reactions. | Installed dashboard, persistent metrics, alerts or BackOffice availability. |\n\nKeep nSystem readiness and runtime lifecycle contributors, BackOffice registration/availability, and heavy monitoring/history with their existing owners. Correlate their evidence with selected project/environment/server/node/tenant; do not promote an NMS flag into a combined healthy status.\n\n## Customization and extension guidance\n\nCustomize the existing node up/down handlers and layered ping/module configuration. Keep checks bounded and credentials private; preserve module/router selection and exact peer identity. Dependency, queue, publication and business-health contributors belong to their respective lifecycle/readiness owners, not an invented NMS contributor API. Any operations UI must use a separately implemented secured projection and state its evidence age.\n\n## Implementation handoff\n\n| Secured system route (POST) | Intended action and recovery boundary |\n| --- | --- |\n| /node/active/:nodeId | Records activation and dispatches node-active hooks. Use only after the exact peer has been independently verified/repaired; this is not a readiness probe. |\n| /node/request/responsibility/:nodeId | Runs manager grant/deny logic; missing nodeId rejects and competing responsibility can return ERR_RES_00001. Reconcile owning work before requesting a transfer. |\n| /node/health/check/stop | Intended to clear the module interval, not stop/restart/repair a process or grant responsibility. |\n\nCurrent implementation gaps block treating these as a qualified recovery recipe: notifyNode constructs GET node/active/... while the declared activation route is POST; stopHealthCheck refers to moduleName without deriving it from request. A deployed override may differ, but this source alone does not prove either path succeeds. Do not work around them with raw state writes, public routes or broader credentials. Escalate to the nNms owner and qualify the effective implementation before use.\n\nDuring an incident, retain sanitized ping failure, exact peer/module coordinates and observed state; inspect the actual node and dependency owners, repair through the deployment operator's existing process, then verify activation, event handling and responsibility at the business owner. Stopping checks suppresses observation and can leave stale state. It is not recovery. Runtime repair and long-term incident history remain with their existing operational owners.\n\n## Common mistakes\n\n- Treating a running process as proof that every capability is healthy.\n- Showing raw dependency exceptions to business users.\n- Adding expensive health checks that harm production traffic.\n- Hiding node responsibility for scheduled jobs.\n- Failing to carry correlation ids through setup or publication errors.\n\n## Verification\n\nQualification must cover disabled ping, inactive/non-router modules, initial unknown state, failed peer ping, inactive-peer skipping, competing responsibility and restart loss of state. Exercise secured route method compatibility and the stop handler defect in isolation before any recovery claim. Independently qualify readiness, BackOffice availability, the intended monitoring UI and actual multi-node work ownership.\n",
    "keywords": [
      "nms",
      "monitoring",
      "node",
      "runtime-health",
      "operator",
      "Operations, Monitoring, and Recovery",
      "Runtime Health and Support",
      "NMS Runtime Monitoring"
    ],
    "facets": {
      "section": "operations-monitoring-and-recovery",
      "group": "operations-monitoring-and-recovery",
      "navigationDepth": 2,
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
