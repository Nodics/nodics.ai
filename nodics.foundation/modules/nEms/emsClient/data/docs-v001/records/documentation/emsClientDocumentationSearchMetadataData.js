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
    "code": "nodicsDocsSearchnodenodicsdocsnodepageeventsmessagingclustercoordination",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageeventsMessagingClusterCoordination",
    "title": "Events, Messaging, and Cluster Coordination",
    "summary": "Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension.",
    "searchText": "Events, Messaging, and Cluster Coordination Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension. event-and-messaging-management events-and-cluster-coordination events-messaging-and-cluster-coordination",
    "keywords": [
      "event-and-messaging-management",
      "events-and-cluster-coordination",
      "events-messaging-and-cluster-coordination"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationemsruntimeclientrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationEmsRuntimeClientRunbook",
    "title": "EMS Runtime and Client Runbook",
    "summary": "How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed.",
    "searchText": "EMS Runtime and Client Runbook How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed. ems ems-client events broker tenant-resolution",
    "keywords": [
      "ems",
      "ems-client",
      "events",
      "broker",
      "tenant-resolution"
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
  "record2": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataeventsmessagingclustercoordination",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataeventsMessagingClusterCoordination",
    "title": "Events, Messaging, and Cluster Coordination",
    "summary": "Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension.",
    "searchText": "Events, Messaging, and Cluster Coordination Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension. # Events, Messaging, and Cluster Coordination\n\nEvents and messaging are the Nodics capabilities that keep local behavior, runtime change, workload ownership, and cross-module notifications coordinated across the platform. They are related but not identical. The local event capability registers listeners and handles in-process events. The messaging capability publishes and consumes messages through configured providers such as Kafka or ActiveMQ and can coordinate responsibilities when nodes go down or come back online.\n\nThis page is for beginners, business users, developers, operators, QA owners, architects, and AI tools. Business users should understand why runtime changes or scheduled responsibilities do not need to be repeated manually on every node. Developers should understand where to add events, listeners, message handlers, provider configuration, tenant validation, and node handoff logic. Operators should understand how to verify that clustered behavior is consistent in production.\n\n## Business context\n\nThe business problem is clustered consistency. A platform can run on several nodes, and every node may hold local runtime state such as pipeline definitions, router configuration, event listeners, API keys, consumers, publishers, or cron responsibilities. When one node is down, work still needs to continue. When it returns, responsibilities should move back cleanly. When a configuration or business-logic change is approved at runtime, every affected node must refresh safely.\n\n| Business need | Event and messaging answer |\n| --- | --- |\n| Keep runtime changes consistent | Publish events that refresh local registries and caches. |\n| Avoid manual node updates | Let consumers, publishers, and listeners react to a single governed change. |\n| Continue work during node failure | Temporarily start remote publishers or consumers on an available node. |\n| Restore ownership after recovery | Shut down temporary responsibilities when the original node returns. |\n| Support external integrations | Use provider adapters for broker-specific publish and consume behavior. |\n\n## Runtime model\n\nThe local event capability loads listener definitions from module files and from persisted listener records when a listener model is available. It registers common and module-specific listeners, respects active state, and can bind listeners to the current node id. Event errors are enriched with layer, phase, event name, tenant, source, target, module, and state so support teams can trace what failed.\n\n```mermaid\nflowchart LR\n  Change[\"Governed change\"] --> Event[\"Local event\"]\n  Event --> Listener[\"Registered listener\"]\n  Listener --> Registry[\"Refresh local registry\"]\n  External[\"External message\"] --> Consumer[\"EMS consumer\"]\n  Consumer --> Pipeline[\"Message handler pipeline\"]\n  Pipeline --> Publish[\"Publish or handle event\"]\n  Down[\"Remote node down\"] --> Takeover[\"Temporary workload takeover\"]\n  Up[\"Remote node up\"] --> Restore[\"Return workload ownership\"]\n```\n\nThe messaging capability manages broker clients, publishers, and consumers. `DefaultEmsClientService` publishes single or batch payloads, resolves publishers by queue, registers consumers and publishers, and delegates provider operations to the configured handler. `DefaultMessageProcessService` validates the queue and message, resolves the message-handler pipeline, checks tenant rules, and either handles a local event or publishes it onward when the target module is not active locally.\n\n| Capability area | Main responsibility | Current implementation detail |\n| --- | --- | --- |\n| Local event registry | Load and register event listeners. | File listeners plus persisted listener records, active flag, and node id filtering. |\n| Message publication | Send messages to configured queues. | Single and batch publish with queue-to-publisher resolution. |\n| Message consumption | Receive broker messages and process them. | Consumer calls a configured message-handler pipeline. |\n| Tenant handling | Decide which tenant the message belongs to. | Header tenant, message tenant, tenant restriction, system queue, and default fallback rules. |\n| Node coordination | Move temporary work during failure and restore it on recovery. | Remote consumers and publishers can be started with temporary node ownership. |\n\n## Provider detail\n\nMessaging providers stay behind adapters. The Kafka provider builds broker lists, retry options, message lists, producers, and consumers through `kafkajs`. The ActiveMQ provider uses STOMP failover connections, publishes to queue destinations, registers consumers through channels, and handles reconnect or error conditions through the provider layer.\n\n```js\nemsClient: {\n  messageHandlers: {\n    commerceRuntimeEvent: 'jsonMessageHandler'\n  },\n  queues: {\n    runtimeConfigurationChanged: {\n      options: {\n        messageHandler: 'commerceRuntimeEvent',\n        tenantRestricted: true\n      }\n    }\n  }\n}\n```\n\nProvider configuration must explain which broker is used, which queues are enabled, which publisher or consumer owns the queue, what node normally owns the workload, and whether temporary takeover is allowed. Documentation should also state whether payloads are business events, integration messages, operational control messages, or runtime refresh instructions.\n\n## Cluster coordination\n\nNode handoff is one of the most important parts of this topic. When a remote node goes down, the node-down handler can start publishers and consumers that were configured to run on that remote node. It marks them with a temporary node so the current node can operate the workload and records the temporary data under the remote node runtime state. When the remote node comes back up, the node-up handler closes those temporary consumers and publishers so responsibility can return to the original owner.\n\n| Cluster scenario | Business result | Technical behavior |\n| --- | --- | --- |\n| Runtime configuration changed | Operators update once, cluster refreshes. | Event listener updates local configuration or registry. |\n| Pipeline changed | Business logic changes consistently. | Pipeline update event refreshes effective pipeline definitions. |\n| Remote node down | Workload continues on available node. | Temporary publishers/consumers are configured with current node as `tempNode`. |\n| Remote node up | Ownership returns cleanly. | Temporary consumers and publishers are closed from remote runtime data. |\n| Target module inactive locally | Event reaches another active owner. | Message process publishes the event instead of handling it locally. |\n\n## Customization and extension\n\nDevelopers should add new listeners in the owning capability and new message flows through queue, publisher, consumer, provider, and pipeline configuration. A customer project can add an event listener for a project rule, define a message handler pipeline, add a provider adapter, or configure node-specific workload ownership. Each change must document tenant behavior, payload shape, retry or error policy, idempotency, and operational evidence.\n\n| Customization goal | Recommended path | Required documentation |\n| --- | --- | --- |\n| Add local runtime refresh | Event listener in owning capability. | Event name, payload, source, affected registry, and node propagation expectation. |\n| Add broker message flow | Queue, publisher, consumer, and handler pipeline. | Provider, queue, tenant rules, payload contract, retry, and dead-letter handling. |\n| Add provider support | Provider client adapter. | Connection, publish, consume, close, retry, readiness, and failure behavior. |\n| Add node-specific workload | Run-on-node configuration. | Normal owner, temporary owner, handoff trigger, restoration behavior, and monitoring. |\n\n## Operations and governance\n\nEvents and messages can change application behavior, trigger publication, invalidate caches, move workloads, or call downstream integrations. They need explicit security and observability. Every operational page must explain who can trigger the event, which tenant and enterprise it affects, whether the payload contains sensitive data, how retries work, how idempotency is achieved, and where support teams can see the result.\n\n| Failure mode | Symptom | Troubleshooting step |\n| --- | --- | --- |\n| Listener not registered | Event is emitted but no local behavior changes. | Check listener active state, node id, module event map, and registry load. |\n| Tenant missing | Message processing rejects the payload. | Confirm tenant header, message tenant, system queue flag, and default fallback rules. |\n| Publisher not available | Publish call fails or batch item reports failure. | Check queue mapping, configured publisher, provider client, and runtime handle. |\n| Temporary workload not restored | A recovered node does not regain ownership. | Inspect remote runtime data and node-up shutdown of temporary consumers/publishers. |\n| Provider-specific failure | Kafka or ActiveMQ consumer stops. | Review provider adapter logs, reconnect behavior, broker availability, and lifecycle hooks. |\n\n## Common mistakes\n\n- Treating local events and broker messages as the same mechanism.\n- Adding a listener without documenting payload shape, tenant scope, and source ownership.\n- Sending runtime-change messages that are not idempotent.\n- Forgetting node ownership rules when a consumer or publisher is configured for a specific node.\n- Handling a target event locally when the target module is not active on the current node.\n- Adding a provider adapter without readiness, close, retry, and error documentation.\n- Skipping operational proof that every active node refreshed the expected runtime state.\n\n## Verification\n\nVerification must prove local event behavior, broker messaging behavior, and cluster handoff behavior. Documentation checks must confirm the business context, implementation source map, flow diagram, configuration table, code example, troubleshooting matrix, customization guidance, common mistakes, and validation commands. Implementation checks should cover event listener registration, listener update and removal, message validation, tenant resolution, local versus remote event dispatch, publisher and consumer registration, batch publish failures, provider adapter behavior, lifecycle drain and shutdown, node-down takeover, and node-up restoration.\n\nUseful focused checks include event service tests, EMS client service contract tests, EMS message process contract tests, runtime lifecycle tests, pipeline runtime change tests, cron lifecycle tests, and documentation content-pack validation. Production-like validation should also include a multi-node scenario where a runtime configuration change, a pipeline change, and a temporary workload takeover are each observed from the operator view.\n",
    "keywords": [
      "event-and-messaging-management",
      "events-and-cluster-coordination",
      "events-messaging-and-cluster-coordination",
      "Event and Messaging Management",
      "Events and Cluster Coordination",
      "Events, Messaging, and Cluster Coordination"
    ],
    "facets": {
      "section": "event-and-messaging-management",
      "group": "event-and-messaging-management",
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
  },
  "record3": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationemsruntimeclientrunbook",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationEmsRuntimeClientRunbook",
    "title": "EMS Runtime and Client Runbook",
    "summary": "How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed.",
    "searchText": "EMS Runtime and Client Runbook How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed. # EMS Runtime and Client Runbook\n\nEMS coordinates event and message behavior across Nodics modules. The EMS runtime owns message contracts, listeners, publisher selection, retry, tenant resolution, and provider coordination. EMS Client gives modules a controlled way to publish and process messages. For beginners, EMS is the delivery path for system events; the business module still owns why an event exists and what it means.\n\n## Business problem\n\nThe business problem is reliable coordination between services. Import, publication, cache invalidation, communication, workflow, and monitoring can all depend on events. Business users do not need broker details, but they need confidence that a governed operation did not disappear between modules. Developers need stable message contracts. Operators need production evidence for published, consumed, retried, failed, and tenant-scoped messages.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| EMS module | `..` |\n| EMS Client module | `.` |\n| Kafka provider | `../kafka` |\n| ActiveMQ provider | `../activemq` |\n| EMS tests | `test`, `../kafka/test` |\n| Existing event docs | Canonical guide `events.messaging-cluster-coordination` |\n\n## Message flow\n\n```mermaid\nsequenceDiagram\n  participant Module as Owning module\n  participant Client as EMS Client\n  participant Runtime as EMS runtime\n  participant Provider as Broker provider\n  participant Listener as Consumer\n\n  Module->>Client: Publish message intent\n  Client->>Runtime: Resolve tenant and publisher\n  Runtime->>Provider: Send message\n  Provider->>Listener: Deliver message\n  Listener->>Runtime: Record processing result\n```\n\n## Contract\n\nMessages should include contract code, tenant, correlation id, source module, event type, bounded payload, retry policy, and processing result. Providers own broker-specific connection and delivery. Business modules own payload meaning and follow-up behavior.\n\n```js\nconst event = {\n  contract: 'cms.publication.completed/v1',\n  tenant: 'default',\n  sourceModule: 'cms',\n  correlationId: 'publication-1001'\n};\n```\n\n## Customization and extension guidance\n\nDevelopers can add message contracts, listeners, providers, publisher selection, retry handling, tenant resolvers, and dead-letter processing. Business users should see event impact as operation state, not broker details. Operators should inspect provider health, queue depth, retries, failed messages, tenant routing, and consumer lag. QA should test publish, consume, retry, duplicate handling, tenant isolation, and unavailable provider behavior.\n\n## Operating rules\n\nEach message contract should define producer, consumer, payload shape, tenant scope, idempotency key, retry limit, and failure evidence. EMS Client should be the normal entry point for module code so provider details remain replaceable. Provider modules can tune Kafka or ActiveMQ delivery, but they should not change business meaning. Axis and NMS should surface message health as operation readiness, lag, retries, and failed-message evidence.\n\nDecision makers should read EMS evidence as operational confidence, not as a separate business workflow. A publication, import, or notification journey is healthy only when the owning module state and message evidence agree. That keeps broker details technical while still proving cross-module reliability.\n\n## Common mistakes\n\n- Putting business decisions inside generic EMS provider code.\n- Publishing messages without tenant or correlation id.\n- Treating broker acknowledgement as business completion.\n- Dropping failed messages without dead-letter evidence.\n- Showing provider errors directly in business setup pages.\n\n## Verification\n\nRun EMS Client route, service, active publisher, message process, tenant resolution, and provider tests. In a fresh local runtime, publish a controlled event, consume it, force a provider failure, and verify retry and evidence. Production readiness requires business-safe operation state, developer message contracts, operator broker evidence, and QA proof of tenant isolation.\n",
    "keywords": [
      "ems",
      "ems-client",
      "events",
      "broker",
      "tenant-resolution",
      "Event and Messaging Management",
      "Events and Cluster Coordination",
      "EMS Runtime and Client Runbook"
    ],
    "facets": {
      "section": "event-and-messaging-management",
      "group": "event-and-messaging-management",
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
