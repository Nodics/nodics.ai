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
    "code": "nodicsDocsComponenteventsMessagingClusterCoordination",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "events.messaging-cluster-coordination",
      "title": "Events, Messaging, and Cluster Coordination",
      "route": "/docs/framework/events-messaging-cluster-coordination",
      "section": "event-and-messaging-management",
      "sectionTitle": "Event and Messaging Management",
      "group": "event-and-messaging-management",
      "groupTitle": "Event and Messaging Management",
      "parentId": "event-and-messaging-management",
      "hierarchyPath": [
        "Event and Messaging Management",
        "Events, Messaging, and Cluster Coordination"
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
      "summary": "Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension.",
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
        "runtime.governed-change",
        "cron.operations",
        "cache.runtime-state-management"
      ],
      "sourceEvidence": [
        "../../../../nodics.docs/data/manifest.json",
        "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
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
        "event-and-messaging-management",
        "events-and-cluster-coordination",
        "events-messaging-and-cluster-coordination"
      ],
      "topicKeywords": [
        "Event and Messaging Management",
        "Events and Cluster Coordination",
        "Events, Messaging, and Cluster Coordination"
      ],
      "headings": [
        {
          "text": "Business context",
          "anchor": "eventsMessagingClusterCoordination-1-business-context",
          "level": 2
        },
        {
          "text": "Runtime model",
          "anchor": "eventsMessagingClusterCoordination-2-runtime-model",
          "level": 2
        },
        {
          "text": "Provider detail",
          "anchor": "eventsMessagingClusterCoordination-3-provider-detail",
          "level": 2
        },
        {
          "text": "Cluster coordination",
          "anchor": "eventsMessagingClusterCoordination-4-cluster-coordination",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "eventsMessagingClusterCoordination-5-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "eventsMessagingClusterCoordination-6-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "eventsMessagingClusterCoordination-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "eventsMessagingClusterCoordination-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Events and messaging are the Nodics capabilities that keep local behavior, runtime change, workload ownership, and cross-module notifications coordinated across the platform. They are related but not identical. The local event capability registers listeners and handles in-process events. The messaging capability publishes and consumes messages through configured providers such as Kafka or ActiveMQ and can coordinate responsibilities when nodes go down or come back online."
        },
        {
          "kind": "paragraph",
          "text": "This page is for beginners, business users, developers, operators, QA owners, architects, and AI tools. Business users should understand why runtime changes or scheduled responsibilities do not need to be repeated manually on every node. Developers should understand where to add events, listeners, message handlers, provider configuration, tenant validation, and node handoff logic. Operators should understand how to verify that clustered behavior is consistent in production."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "eventsMessagingClusterCoordination-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is clustered consistency. A platform can run on several nodes, and every node may hold local runtime state such as pipeline definitions, router configuration, event listeners, API keys, consumers, publishers, or cron responsibilities. When one node is down, work still needs to continue. When it returns, responsibilities should move back cleanly. When a configuration or business-logic change is approved at runtime, every affected node must refresh safely."
        },
        {
          "kind": "table",
          "headers": [
            "Business need",
            "Event and messaging answer"
          ],
          "rows": [
            [
              "Keep runtime changes consistent",
              "Publish events that refresh local registries and caches."
            ],
            [
              "Avoid manual node updates",
              "Let consumers, publishers, and listeners react to a single governed change."
            ],
            [
              "Continue work during node failure",
              "Temporarily start remote publishers or consumers on an available node."
            ],
            [
              "Restore ownership after recovery",
              "Shut down temporary responsibilities when the original node returns."
            ],
            [
              "Support external integrations",
              "Use provider adapters for broker-specific publish and consume behavior."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime model",
          "anchor": "eventsMessagingClusterCoordination-2-runtime-model"
        },
        {
          "kind": "paragraph",
          "text": "The local event capability loads listener definitions from module files and from persisted listener records when a listener model is available. It registers common and module-specific listeners, respects active state, and can bind listeners to the current node id. Event errors are enriched with layer, phase, event name, tenant, source, target, module, and state so support teams can trace what failed."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Change[\"Governed change\"] --> Event[\"Local event\"]\n  Event --> Listener[\"Registered listener\"]\n  Listener --> Registry[\"Refresh local registry\"]\n  External[\"External message\"] --> Consumer[\"EMS consumer\"]\n  Consumer --> Pipeline[\"Message handler pipeline\"]\n  Pipeline --> Publish[\"Publish or handle event\"]\n  Down[\"Remote node down\"] --> Takeover[\"Temporary workload takeover\"]\n  Up[\"Remote node up\"] --> Restore[\"Return workload ownership\"]"
        },
        {
          "kind": "paragraph",
          "text": "The messaging capability manages broker clients, publishers, and consumers. `DefaultEmsClientService` publishes single or batch payloads, resolves publishers by queue, registers consumers and publishers, and delegates provider operations to the configured handler. `DefaultMessageProcessService` validates the queue and message, resolves the message-handler pipeline, checks tenant rules, and either handles a local event or publishes it onward when the target module is not active locally."
        },
        {
          "kind": "table",
          "headers": [
            "Capability area",
            "Main responsibility",
            "Current implementation detail"
          ],
          "rows": [
            [
              "Local event registry",
              "Load and register event listeners.",
              "File listeners plus persisted listener records, active flag, and node id filtering."
            ],
            [
              "Message publication",
              "Send messages to configured queues.",
              "Single and batch publish with queue-to-publisher resolution."
            ],
            [
              "Message consumption",
              "Receive broker messages and process them.",
              "Consumer calls a configured message-handler pipeline."
            ],
            [
              "Tenant handling",
              "Decide which tenant the message belongs to.",
              "Header tenant, message tenant, tenant restriction, system queue, and default fallback rules."
            ],
            [
              "Node coordination",
              "Move temporary work during failure and restore it on recovery.",
              "Remote consumers and publishers can be started with temporary node ownership."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Provider detail",
          "anchor": "eventsMessagingClusterCoordination-3-provider-detail"
        },
        {
          "kind": "paragraph",
          "text": "Messaging providers stay behind adapters. The Kafka provider builds broker lists, retry options, message lists, producers, and consumers through `kafkajs`. The ActiveMQ provider uses STOMP failover connections, publishes to queue destinations, registers consumers through channels, and handles reconnect or error conditions through the provider layer."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "emsClient: {\n  messageHandlers: {\n    commerceRuntimeEvent: 'jsonMessageHandler'\n  },\n  queues: {\n    runtimeConfigurationChanged: {\n      options: {\n        messageHandler: 'commerceRuntimeEvent',\n        tenantRestricted: true\n      }\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "Provider configuration must explain which broker is used, which queues are enabled, which publisher or consumer owns the queue, what node normally owns the workload, and whether temporary takeover is allowed. Documentation should also state whether payloads are business events, integration messages, operational control messages, or runtime refresh instructions."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Cluster coordination",
          "anchor": "eventsMessagingClusterCoordination-4-cluster-coordination"
        },
        {
          "kind": "paragraph",
          "text": "Node handoff is one of the most important parts of this topic. When a remote node goes down, the node-down handler can start publishers and consumers that were configured to run on that remote node. It marks them with a temporary node so the current node can operate the workload and records the temporary data under the remote node runtime state. When the remote node comes back up, the node-up handler closes those temporary consumers and publishers so responsibility can return to the original owner."
        },
        {
          "kind": "table",
          "headers": [
            "Cluster scenario",
            "Business result",
            "Technical behavior"
          ],
          "rows": [
            [
              "Runtime configuration changed",
              "Operators update once, cluster refreshes.",
              "Event listener updates local configuration or registry."
            ],
            [
              "Pipeline changed",
              "Business logic changes consistently.",
              "Pipeline update event refreshes effective pipeline definitions."
            ],
            [
              "Remote node down",
              "Workload continues on available node.",
              "Temporary publishers/consumers are configured with current node as `tempNode`."
            ],
            [
              "Remote node up",
              "Ownership returns cleanly.",
              "Temporary consumers and publishers are closed from remote runtime data."
            ],
            [
              "Target module inactive locally",
              "Event reaches another active owner.",
              "Message process publishes the event instead of handling it locally."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "eventsMessagingClusterCoordination-5-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should add new listeners in the owning capability and new message flows through queue, publisher, consumer, provider, and pipeline configuration. A customer project can add an event listener for a project rule, define a message handler pipeline, add a provider adapter, or configure node-specific workload ownership. Each change must document tenant behavior, payload shape, retry or error policy, idempotency, and operational evidence."
        },
        {
          "kind": "table",
          "headers": [
            "Customization goal",
            "Recommended path",
            "Required documentation"
          ],
          "rows": [
            [
              "Add local runtime refresh",
              "Event listener in owning capability.",
              "Event name, payload, source, affected registry, and node propagation expectation."
            ],
            [
              "Add broker message flow",
              "Queue, publisher, consumer, and handler pipeline.",
              "Provider, queue, tenant rules, payload contract, retry, and dead-letter handling."
            ],
            [
              "Add provider support",
              "Provider client adapter.",
              "Connection, publish, consume, close, retry, readiness, and failure behavior."
            ],
            [
              "Add node-specific workload",
              "Run-on-node configuration.",
              "Normal owner, temporary owner, handoff trigger, restoration behavior, and monitoring."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "eventsMessagingClusterCoordination-6-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Events and messages can change application behavior, trigger publication, invalidate caches, move workloads, or call downstream integrations. They need explicit security and observability. Every operational page must explain who can trigger the event, which tenant and enterprise it affects, whether the payload contains sensitive data, how retries work, how idempotency is achieved, and where support teams can see the result."
        },
        {
          "kind": "table",
          "headers": [
            "Failure mode",
            "Symptom",
            "Troubleshooting step"
          ],
          "rows": [
            [
              "Listener not registered",
              "Event is emitted but no local behavior changes.",
              "Check listener active state, node id, module event map, and registry load."
            ],
            [
              "Tenant missing",
              "Message processing rejects the payload.",
              "Confirm tenant header, message tenant, system queue flag, and default fallback rules."
            ],
            [
              "Publisher not available",
              "Publish call fails or batch item reports failure.",
              "Check queue mapping, configured publisher, provider client, and runtime handle."
            ],
            [
              "Temporary workload not restored",
              "A recovered node does not regain ownership.",
              "Inspect remote runtime data and node-up shutdown of temporary consumers/publishers."
            ],
            [
              "Provider-specific failure",
              "Kafka or ActiveMQ consumer stops.",
              "Review provider adapter logs, reconnect behavior, broker availability, and lifecycle hooks."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "eventsMessagingClusterCoordination-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating local events and broker messages as the same mechanism.",
            "Adding a listener without documenting payload shape, tenant scope, and source ownership.",
            "Sending runtime-change messages that are not idempotent.",
            "Forgetting node ownership rules when a consumer or publisher is configured for a specific node.",
            "Handling a target event locally when the target module is not active on the current node.",
            "Adding a provider adapter without readiness, close, retry, and error documentation.",
            "Skipping operational proof that every active node refreshed the expected runtime state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "eventsMessagingClusterCoordination-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification must prove local event behavior, broker messaging behavior, and cluster handoff behavior. Documentation checks must confirm the business context, implementation source map, flow diagram, configuration table, code example, troubleshooting matrix, customization guidance, common mistakes, and validation commands. Implementation checks should cover event listener registration, listener update and removal, message validation, tenant resolution, local versus remote event dispatch, publisher and consumer registration, batch publish failures, provider adapter behavior, lifecycle drain and shutdown, node-down takeover, and node-up restoration."
        },
        {
          "kind": "paragraph",
          "text": "Useful focused checks include event service tests, EMS client service contract tests, EMS message process contract tests, runtime lifecycle tests, pipeline runtime change tests, cron lifecycle tests, and documentation content-pack validation. Production-like validation should also include a multi-node scenario where a runtime configuration change, a pipeline change, and a temporary workload takeover are each observed from the operator view."
        }
      ],
      "searchText": "Events, Messaging, and Cluster Coordination Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension. # Events, Messaging, and Cluster Coordination\n\nEvents and messaging are the Nodics capabilities that keep local behavior, runtime change, workload ownership, and cross-module notifications coordinated across the platform. They are related but not identical. The local event capability registers listeners and handles in-process events. The messaging capability publishes and consumes messages through configured providers such as Kafka or ActiveMQ and can coordinate responsibilities when nodes go down or come back online.\n\nThis page is for beginners, business users, developers, operators, QA owners, architects, and AI tools. Business users should understand why runtime changes or scheduled responsibilities do not need to be repeated manually on every node. Developers should understand where to add events, listeners, message handlers, provider configuration, tenant validation, and node handoff logic. Operators should understand how to verify that clustered behavior is consistent in production.\n\n## Business context\n\nThe business problem is clustered consistency. A platform can run on several nodes, and every node may hold local runtime state such as pipeline definitions, router configuration, event listeners, API keys, consumers, publishers, or cron responsibilities. When one node is down, work still needs to continue. When it returns, responsibilities should move back cleanly. When a configuration or business-logic change is approved at runtime, every affected node must refresh safely.\n\n| Business need | Event and messaging answer |\n| --- | --- |\n| Keep runtime changes consistent | Publish events that refresh local registries and caches. |\n| Avoid manual node updates | Let consumers, publishers, and listeners react to a single governed change. |\n| Continue work during node failure | Temporarily start remote publishers or consumers on an available node. |\n| Restore ownership after recovery | Shut down temporary responsibilities when the original node returns. |\n| Support external integrations | Use provider adapters for broker-specific publish and consume behavior. |\n\n## Runtime model\n\nThe local event capability loads listener definitions from module files and from persisted listener records when a listener model is available. It registers common and module-specific listeners, respects active state, and can bind listeners to the current node id. Event errors are enriched with layer, phase, event name, tenant, source, target, module, and state so support teams can trace what failed.\n\n```mermaid\nflowchart LR\n  Change[\"Governed change\"] --> Event[\"Local event\"]\n  Event --> Listener[\"Registered listener\"]\n  Listener --> Registry[\"Refresh local registry\"]\n  External[\"External message\"] --> Consumer[\"EMS consumer\"]\n  Consumer --> Pipeline[\"Message handler pipeline\"]\n  Pipeline --> Publish[\"Publish or handle event\"]\n  Down[\"Remote node down\"] --> Takeover[\"Temporary workload takeover\"]\n  Up[\"Remote node up\"] --> Restore[\"Return workload ownership\"]\n```\n\nThe messaging capability manages broker clients, publishers, and consumers. `DefaultEmsClientService` publishes single or batch payloads, resolves publishers by queue, registers consumers and publishers, and delegates provider operations to the configured handler. `DefaultMessageProcessService` validates the queue and message, resolves the message-handler pipeline, checks tenant rules, and either handles a local event or publishes it onward when the target module is not active locally.\n\n| Capability area | Main responsibility | Current implementation detail |\n| --- | --- | --- |\n| Local event registry | Load and register event listeners. | File listeners plus persisted listener records, active flag, and node id filtering. |\n| Message publication | Send messages to configured queues. | Single and batch publish with queue-to-publisher resolution. |\n| Message consumption | Receive broker messages and process them. | Consumer calls a configured message-handler pipeline. |\n| Tenant handling | Decide which tenant the message belongs to. | Header tenant, message tenant, tenant restriction, system queue, and default fallback rules. |\n| Node coordination | Move temporary work during failure and restore it on recovery. | Remote consumers and publishers can be started with temporary node ownership. |\n\n## Provider detail\n\nMessaging providers stay behind adapters. The Kafka provider builds broker lists, retry options, message lists, producers, and consumers through `kafkajs`. The ActiveMQ provider uses STOMP failover connections, publishes to queue destinations, registers consumers through channels, and handles reconnect or error conditions through the provider layer.\n\n```js\nemsClient: {\n  messageHandlers: {\n    commerceRuntimeEvent: 'jsonMessageHandler'\n  },\n  queues: {\n    runtimeConfigurationChanged: {\n      options: {\n        messageHandler: 'commerceRuntimeEvent',\n        tenantRestricted: true\n      }\n    }\n  }\n}\n```\n\nProvider configuration must explain which broker is used, which queues are enabled, which publisher or consumer owns the queue, what node normally owns the workload, and whether temporary takeover is allowed. Documentation should also state whether payloads are business events, integration messages, operational control messages, or runtime refresh instructions.\n\n## Cluster coordination\n\nNode handoff is one of the most important parts of this topic. When a remote node goes down, the node-down handler can start publishers and consumers that were configured to run on that remote node. It marks them with a temporary node so the current node can operate the workload and records the temporary data under the remote node runtime state. When the remote node comes back up, the node-up handler closes those temporary consumers and publishers so responsibility can return to the original owner.\n\n| Cluster scenario | Business result | Technical behavior |\n| --- | --- | --- |\n| Runtime configuration changed | Operators update once, cluster refreshes. | Event listener updates local configuration or registry. |\n| Pipeline changed | Business logic changes consistently. | Pipeline update event refreshes effective pipeline definitions. |\n| Remote node down | Workload continues on available node. | Temporary publishers/consumers are configured with current node as `tempNode`. |\n| Remote node up | Ownership returns cleanly. | Temporary consumers and publishers are closed from remote runtime data. |\n| Target module inactive locally | Event reaches another active owner. | Message process publishes the event instead of handling it locally. |\n\n## Customization and extension\n\nDevelopers should add new listeners in the owning capability and new message flows through queue, publisher, consumer, provider, and pipeline configuration. A customer project can add an event listener for a project rule, define a message handler pipeline, add a provider adapter, or configure node-specific workload ownership. Each change must document tenant behavior, payload shape, retry or error policy, idempotency, and operational evidence.\n\n| Customization goal | Recommended path | Required documentation |\n| --- | --- | --- |\n| Add local runtime refresh | Event listener in owning capability. | Event name, payload, source, affected registry, and node propagation expectation. |\n| Add broker message flow | Queue, publisher, consumer, and handler pipeline. | Provider, queue, tenant rules, payload contract, retry, and dead-letter handling. |\n| Add provider support | Provider client adapter. | Connection, publish, consume, close, retry, readiness, and failure behavior. |\n| Add node-specific workload | Run-on-node configuration. | Normal owner, temporary owner, handoff trigger, restoration behavior, and monitoring. |\n\n## Operations and governance\n\nEvents and messages can change application behavior, trigger publication, invalidate caches, move workloads, or call downstream integrations. They need explicit security and observability. Every operational page must explain who can trigger the event, which tenant and enterprise it affects, whether the payload contains sensitive data, how retries work, how idempotency is achieved, and where support teams can see the result.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Listener not registered | Event is emitted but no local behavior changes. | Check listener active state, node id, module event map, and registry load. |\n| Tenant missing | Message processing rejects the payload. | Confirm tenant header, message tenant, system queue flag, and default fallback rules. |\n| Publisher not available | Publish call fails or batch item reports failure. | Check queue mapping, configured publisher, provider client, and runtime handle. |\n| Temporary workload not restored | A recovered node does not regain ownership. | Inspect remote runtime data and node-up shutdown of temporary consumers/publishers. |\n| Provider-specific failure | Kafka or ActiveMQ consumer stops. | Review provider adapter logs, reconnect behavior, broker availability, and lifecycle hooks. |\n\n## Common mistakes\n\n- Treating local events and broker messages as the same mechanism.\n- Adding a listener without documenting payload shape, tenant scope, and source ownership.\n- Sending runtime-change messages that are not idempotent.\n- Forgetting node ownership rules when a consumer or publisher is configured for a specific node.\n- Handling a target event locally when the target module is not active on the current node.\n- Adding a provider adapter without readiness, close, retry, and error documentation.\n- Skipping operational proof that every active node refreshed the expected runtime state.\n\n## Verification\n\nVerification must prove local event behavior, broker messaging behavior, and cluster handoff behavior. Documentation checks must confirm the business context, implementation source map, flow diagram, configuration table, code example, troubleshooting matrix, customization guidance, common mistakes, and validation commands. Implementation checks should cover event listener registration, listener update and removal, message validation, tenant resolution, local versus remote event dispatch, publisher and consumer registration, batch publish failures, provider adapter behavior, lifecycle drain and shutdown, node-down takeover, and node-up restoration.\n\nUseful focused checks include event service tests, EMS client service contract tests, EMS message process contract tests, runtime lifecycle tests, pipeline runtime change tests, cron lifecycle tests, and documentation content-pack validation. Production-like validation should also include a multi-node scenario where a runtime configuration change, a pipeline change, and a temporary workload takeover are each observed from the operator view.\n",
      "previous": {
        "title": "Communication, delivery, and verification",
        "route": "/docs/framework/communication-overview"
      },
      "next": {
        "title": "Business Process and Automation Overview",
        "route": "/docs/framework/process"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "emsClient",
        "owner": "emsClient",
        "sourcePath": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
        "wordCount": 1372,
        "checksum": "ec9cd53e7258204e3001fbf33c872d3779f12881c7f363af478dd82ab5c74ca4"
      },
      "slug": "events-messaging-cluster-coordination",
      "locale": "en",
      "navigationGroup": "Events and Cluster Coordination",
      "navigationGroupCode": "events-and-cluster-coordination",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "runtime.governed-change",
          "owner": "config"
        },
        {
          "documentId": "cron.operations",
          "owner": "cronjob"
        },
        {
          "documentId": "cache.runtime-state-management",
          "owner": "cache"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentfoundationEmsRuntimeClientRunbook",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.ems-runtime-client-runbook",
      "title": "EMS Runtime and Client Runbook",
      "route": "/docs/framework/foundation-ems-runtime-client-runbook",
      "section": "event-and-messaging-management",
      "sectionTitle": "Event and Messaging Management",
      "group": "event-and-messaging-management",
      "groupTitle": "Event and Messaging Management",
      "parentId": "event-and-messaging-management",
      "hierarchyPath": [
        "Event and Messaging Management",
        "EMS Runtime and Client Runbook"
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
      "summary": "How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed.",
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
        "events.messaging-cluster-coordination",
        "communication.provider-runbooks",
        "process.workflow-bpm-source-map"
      ],
      "sourceEvidence": [
        "../../../../nodics.docs/data/manifest.json",
        "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "..",
        ".",
        "../kafka",
        "../activemq",
        "package.json",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "sequence-flow",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "ems",
        "ems-client",
        "events",
        "broker",
        "tenant-resolution"
      ],
      "topicKeywords": [
        "Event and Messaging Management",
        "Events and Cluster Coordination",
        "EMS Runtime and Client Runbook"
      ],
      "headings": [
        {
          "text": "Business problem",
          "anchor": "foundationEmsRuntimeClientRunbook-1-business-problem",
          "level": 2
        },
        {
          "text": "Source map",
          "anchor": "foundationEmsRuntimeClientRunbook-2-source-map",
          "level": 2
        },
        {
          "text": "Message flow",
          "anchor": "foundationEmsRuntimeClientRunbook-3-message-flow",
          "level": 2
        },
        {
          "text": "Contract",
          "anchor": "foundationEmsRuntimeClientRunbook-4-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "foundationEmsRuntimeClientRunbook-5-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Operating rules",
          "anchor": "foundationEmsRuntimeClientRunbook-6-operating-rules",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationEmsRuntimeClientRunbook-7-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationEmsRuntimeClientRunbook-8-verification",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "EMS coordinates event and message behavior across Nodics modules. The EMS runtime owns message contracts, listeners, publisher selection, retry, tenant resolution, and provider coordination. EMS Client gives modules a controlled way to publish and process messages. For beginners, EMS is the delivery path for system events; the business module still owns why an event exists and what it means."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business problem",
          "anchor": "foundationEmsRuntimeClientRunbook-1-business-problem"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is reliable coordination between services. Import, publication, cache invalidation, communication, workflow, and monitoring can all depend on events. Business users do not need broker details, but they need confidence that a governed operation did not disappear between modules. Developers need stable message contracts. Operators need production evidence for published, consumed, retried, failed, and tenant-scoped messages."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationEmsRuntimeClientRunbook-2-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "EMS module",
              "`..`"
            ],
            [
              "EMS Client module",
              "`.`"
            ],
            [
              "Kafka provider",
              "`../kafka`"
            ],
            [
              "ActiveMQ provider",
              "`../activemq`"
            ],
            [
              "EMS tests",
              "`test`, `../kafka/test`"
            ],
            [
              "Existing event docs",
              "Canonical guide `events.messaging-cluster-coordination`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Message flow",
          "anchor": "foundationEmsRuntimeClientRunbook-3-message-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "sequenceDiagram\n  participant Module as Owning module\n  participant Client as EMS Client\n  participant Runtime as EMS runtime\n  participant Provider as Broker provider\n  participant Listener as Consumer\n\n  Module->>Client: Publish message intent\n  Client->>Runtime: Resolve tenant and publisher\n  Runtime->>Provider: Send message\n  Provider->>Listener: Deliver message\n  Listener->>Runtime: Record processing result"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Contract",
          "anchor": "foundationEmsRuntimeClientRunbook-4-contract"
        },
        {
          "kind": "paragraph",
          "text": "Messages should include contract code, tenant, correlation id, source module, event type, bounded payload, retry policy, and processing result. Providers own broker-specific connection and delivery. Business modules own payload meaning and follow-up behavior."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const event = {\n  contract: 'cms.publication.completed/v1',\n  tenant: 'default',\n  sourceModule: 'cms',\n  correlationId: 'publication-1001'\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "foundationEmsRuntimeClientRunbook-5-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can add message contracts, listeners, providers, publisher selection, retry handling, tenant resolvers, and dead-letter processing. Business users should see event impact as operation state, not broker details. Operators should inspect provider health, queue depth, retries, failed messages, tenant routing, and consumer lag. QA should test publish, consume, retry, duplicate handling, tenant isolation, and unavailable provider behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operating rules",
          "anchor": "foundationEmsRuntimeClientRunbook-6-operating-rules"
        },
        {
          "kind": "paragraph",
          "text": "Each message contract should define producer, consumer, payload shape, tenant scope, idempotency key, retry limit, and failure evidence. EMS Client should be the normal entry point for module code so provider details remain replaceable. Provider modules can tune Kafka or ActiveMQ delivery, but they should not change business meaning. Axis and NMS should surface message health as operation readiness, lag, retries, and failed-message evidence."
        },
        {
          "kind": "paragraph",
          "text": "Decision makers should read EMS evidence as operational confidence, not as a separate business workflow. A publication, import, or notification journey is healthy only when the owning module state and message evidence agree. That keeps broker details technical while still proving cross-module reliability."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationEmsRuntimeClientRunbook-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Putting business decisions inside generic EMS provider code.",
            "Publishing messages without tenant or correlation id.",
            "Treating broker acknowledgement as business completion.",
            "Dropping failed messages without dead-letter evidence.",
            "Showing provider errors directly in business setup pages."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationEmsRuntimeClientRunbook-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run EMS Client route, service, active publisher, message process, tenant resolution, and provider tests. In a fresh local runtime, publish a controlled event, consume it, force a provider failure, and verify retry and evidence. Production readiness requires business-safe operation state, developer message contracts, operator broker evidence, and QA proof of tenant isolation."
        }
      ],
      "searchText": "EMS Runtime and Client Runbook How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed. # EMS Runtime and Client Runbook\n\nEMS coordinates event and message behavior across Nodics modules. The EMS runtime owns message contracts, listeners, publisher selection, retry, tenant resolution, and provider coordination. EMS Client gives modules a controlled way to publish and process messages. For beginners, EMS is the delivery path for system events; the business module still owns why an event exists and what it means.\n\n## Business problem\n\nThe business problem is reliable coordination between services. Import, publication, cache invalidation, communication, workflow, and monitoring can all depend on events. Business users do not need broker details, but they need confidence that a governed operation did not disappear between modules. Developers need stable message contracts. Operators need production evidence for published, consumed, retried, failed, and tenant-scoped messages.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| EMS module | `..` |\n| EMS Client module | `.` |\n| Kafka provider | `../kafka` |\n| ActiveMQ provider | `../activemq` |\n| EMS tests | `test`, `../kafka/test` |\n| Existing event docs | Canonical guide `events.messaging-cluster-coordination` |\n\n## Message flow\n\n```mermaid\nsequenceDiagram\n  participant Module as Owning module\n  participant Client as EMS Client\n  participant Runtime as EMS runtime\n  participant Provider as Broker provider\n  participant Listener as Consumer\n\n  Module->>Client: Publish message intent\n  Client->>Runtime: Resolve tenant and publisher\n  Runtime->>Provider: Send message\n  Provider->>Listener: Deliver message\n  Listener->>Runtime: Record processing result\n```\n\n## Contract\n\nMessages should include contract code, tenant, correlation id, source module, event type, bounded payload, retry policy, and processing result. Providers own broker-specific connection and delivery. Business modules own payload meaning and follow-up behavior.\n\n```js\nconst event = {\n  contract: 'cms.publication.completed/v1',\n  tenant: 'default',\n  sourceModule: 'cms',\n  correlationId: 'publication-1001'\n};\n```\n\n## Customization and extension guidance\n\nDevelopers can add message contracts, listeners, providers, publisher selection, retry handling, tenant resolvers, and dead-letter processing. Business users should see event impact as operation state, not broker details. Operators should inspect provider health, queue depth, retries, failed messages, tenant routing, and consumer lag. QA should test publish, consume, retry, duplicate handling, tenant isolation, and unavailable provider behavior.\n\n## Operating rules\n\nEach message contract should define producer, consumer, payload shape, tenant scope, idempotency key, retry limit, and failure evidence. EMS Client should be the normal entry point for module code so provider details remain replaceable. Provider modules can tune Kafka or ActiveMQ delivery, but they should not change business meaning. Axis and NMS should surface message health as operation readiness, lag, retries, and failed-message evidence.\n\nDecision makers should read EMS evidence as operational confidence, not as a separate business workflow. A publication, import, or notification journey is healthy only when the owning module state and message evidence agree. That keeps broker details technical while still proving cross-module reliability.\n\n## Common mistakes\n\n- Putting business decisions inside generic EMS provider code.\n- Publishing messages without tenant or correlation id.\n- Treating broker acknowledgement as business completion.\n- Dropping failed messages without dead-letter evidence.\n- Showing provider errors directly in business setup pages.\n\n## Verification\n\nRun EMS Client route, service, active publisher, message process, tenant resolution, and provider tests. In a fresh local runtime, publish a controlled event, consume it, force a provider failure, and verify retry and evidence. Production readiness requires business-safe operation state, developer message contracts, operator broker evidence, and QA proof of tenant isolation.\n",
      "previous": {
        "title": "Tooling Runtime Contracts",
        "route": "/docs/framework/foundation-tooling-runtime-contracts"
      },
      "next": {
        "title": "Internal Source Boundary Register",
        "route": "/docs/framework/reference-internal-source-boundary-register"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "emsClient",
        "owner": "emsClient",
        "sourcePath": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/emsClientDocumentationComponentData.js",
        "wordCount": 509,
        "checksum": "c7e5a9e81e3bf549a3798a8fd413db87a4052162b5cfbd1d544a87826993d048"
      },
      "slug": "foundation-ems-runtime-client-runbook",
      "locale": "en",
      "navigationGroup": "Events and Cluster Coordination",
      "navigationGroupCode": "events-and-cluster-coordination",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "events.messaging-cluster-coordination",
          "owner": "emsClient"
        },
        {
          "documentId": "communication.provider-runbooks",
          "owner": "commsCore"
        },
        {
          "documentId": "process.workflow-bpm-source-map",
          "owner": "bpm"
        }
      ]
    },
    "active": true
  }
};
