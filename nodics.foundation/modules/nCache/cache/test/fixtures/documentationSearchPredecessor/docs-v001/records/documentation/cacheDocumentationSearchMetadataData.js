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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagecacheruntimestatemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagecacheRuntimeStateManagement",
    "title": "Caching and Runtime State Management",
    "summary": "How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior.",
    "searchText": "Caching and Runtime State Management How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior. caching-and-runtime-state-management cache-providers-and-invalidation caching-and-runtime-state-management",
    "keywords": [
      "caching-and-runtime-state-management",
      "cache-providers-and-invalidation",
      "caching-and-runtime-state-management"
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
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationcacheproviderrunbooks",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationCacheProviderRunbooks",
    "title": "Cache Provider Runbooks",
    "summary": "Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance.",
    "searchText": "Cache Provider Runbooks Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance. cache redis hazelcast node-cache invalidation",
    "keywords": [
      "cache",
      "redis",
      "hazelcast",
      "node-cache",
      "invalidation"
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatacacheruntimestatemanagement",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatacacheRuntimeStateManagement",
    "title": "Caching and Runtime State Management",
    "summary": "How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior.",
    "searchText": "Caching and Runtime State Management How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior. # Caching and Runtime State Management\n\nHow local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nA cache can make Nodics fast, but stale or node-local values can confuse business users when a runtime configuration change is visible on one server and not another. Cache behavior is provider-driven and event-aware. Projects can move from local in-memory cache to Redis-compatible providers by changing governed configuration and validating propagation.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | A cache can make Nodics fast, but stale or node-local values can confuse business users when a runtime configuration change is visible on one server and not another. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Cache behavior is provider-driven and event-aware. Projects can move from local in-memory cache to Redis-compatible providers by changing governed configuration and validating propagation. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nnCache owns cache provider abstraction, key policy, invalidation, and runtime diagnostics. Calling modules own what they cache and when stale data is acceptable. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Caching and Runtime State Management | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.foundation | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | nCache | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\ncacheProvider: { name: \"redis\", module: \"nCache\", enabled: true, invalidateOnEvent: true }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n### Subscription startup and shutdown\n\nA channel with configured events becomes ready only after subscription succeeds. Its subscriber client belongs to that channel, and central cache shutdown closes it alongside the publisher. Shared references close once. A failed subscription closes its unregistered client before returning the original failure; a failure closing one resource does not prevent attempts to close the others. These rules also apply when later runtime bootstrap fails after cache initialization.\n\nA Redis engine connection that fails before registration is also owned startup work: the adapter closes it before rejecting, so its reconnect timer cannot keep a failed process alive. Failed close attempts do not suppress the original startup error. Runtime revocation and principal stamps share `authSecurity.securityStamp.cacheModuleName`; Profile ownership is unchanged.\n",
    "keywords": [
      "caching-and-runtime-state-management",
      "cache-providers-and-invalidation",
      "caching-and-runtime-state-management",
      "Caching and Runtime State Management",
      "Cache Providers and Invalidation",
      "Caching and Runtime State Management"
    ],
    "facets": {
      "section": "caching-and-runtime-state-management",
      "group": "caching-and-runtime-state-management",
      "navigationDepth": 2,
      "documentType": "configuration",
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
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationcacheproviderrunbooks",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationCacheProviderRunbooks",
    "title": "Cache Provider Runbooks",
    "summary": "Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance.",
    "searchText": "Cache Provider Runbooks Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance. # Cache Provider Runbooks\n\nnCache provides local, Redis and Hazelcast adapters behind declared engine/channel contracts. Cached business reads remain copies of owner data; authentication stamps, counters and coordination require stronger fail-closed and atomicity contracts. A cache miss, an unavailable provider and an unsupported capability are different outcomes. A provider name or fallback flag is not permission to substitute local state. For beginners, start with one ordinary business-read channel and the local configuration example, observing its key, expiry and invalidation. Then select the provider required by the deployment and test the same owner operation. Never use that local-read exercise as evidence for authentication, shared counters or cross-node locking; those channels require their own admitted capabilities and failure policy.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Cache group | `../package.json` |\n| Core cache contract | `package.json` |\n| Redis provider | `../redisCache/package.json` |\n| Hazelcast provider | `../hazelcastCache/package.json` |\n| Node cache provider | `../nodeCache/package.json` |\n| Cache overview page | Canonical guide `cache.runtime-state-management` |\n\n## Provider flow\n\n```mermaid\nflowchart LR\n  Owner[\"Owning service + trusted scope\"] --> Channel[\"Qualified cache channel/engine\"]\n  Channel --> Local[\"Node-local\"]\n  Channel --> Redis[\"Redis\"]\n  Channel --> Hazelcast[\"Hazelcast\"]\n  Channel --> Miss[\"Miss: owner-approved source read only\"]\n  Channel --> Failure[\"Protected-state outage: fail closed\"]\n```\n\nThe business problem is freshness with performance. Business users expect a published page, price, stock state, or permission change to become visible without confusing delays. Developers need clear key strategy and invalidation contracts. Operators need provider health, eviction behavior, and recovery commands for production incidents.\n\n## Configuration contract\n\nDefaultCacheConfigurationService deep-merges cache.default.channels/engines with cache.<module>.channels/engines. Channels bind to an enabled engine with concrete connectionHandler/cacheHandler methods and honest capability metadata. DefaultCacheEngineService validates operations and initializes enabled engines; enabled-engine failure rejects startup rather than silently choosing local. Disabled providers are not connection probes.\n\n```js\nmodule.exports = {\n  cache: {\n    example: {\n      channels: { schema: { enabled: true, engine: 'local', fallback: true, ttl: 30 } },\n      engines: { local: { enabled: true, options: { prefix: 'example' } } }\n    }\n  }\n};\n```\n\nThis later-layer example relies on the existing local adapter defaults and an active example module. The resulting schema channel selects local with a 30-second default TTL. Per-call ttl takes precedence over channel ttl, engine ttl, then engine.options.ttl. Explicit ttl:0 means no expiration; negative/nonfinite values reject. A non-expiring local value still disappears when the process restarts.\n\ncreateStorageKey combines channelName + '_' + engine.options.prefix (or moduleName) + optional '_' + tenant + '_' + logical key. For module example, channel schema, prefix example, tenant tenantA and key item:one, the physical key is schema_example_tenantA_item:one. Tenant is only included when supplied: callers must retain trusted tenant context and avoid collisions across runtimes sharing a provider. Separate deployment/runtime namespaces where required by the owner; the key builder does not discover an environment automatically.\n\n| Channel requirement | Safe behavior |\n| --- | --- |\n| Ordinary cacheable business read | Only the owning caller's documented fallback policy may read its source after a miss/outage; source authorization still applies. |\n| Authentication stamps/revocation or shared admission | Fail closed on unavailable required shared state; distributed deployment requires a qualified distributed engine and fallback:false. Local counters/consume are atomic only within one process. |\n| Unsupported adapter operation/capability | Reject activation/use. Do not advertise distributed atomicity from method names or convert consume into get then delete. |\n\n## Runbook\n\nFor Node-local cache, record effective module/channel/tenant/key and TTL, then use the initialized channel adapter's put/get with a non-sensitive object. get returns a detached copy; missing values reject ERR_CACHE_00001. Use flushByKeys with logical keys ['item:one'] in the same scope, then verify that key misses while tenantB's key remains. flushByPrefix with tenant and a narrow logical prefix affects only that namespace. Never use an unscoped local prefix flush as a tenant repair: when both tenant and prefix are absent it calls client.flushAll.\n\nRestart clears local state. Another process has a separate NodeCache even with identical key text. A local consume/counter/version write does not coordinate replicas, and local invalidation is not automatically cross-node delivery. Qualify the configured existing crossNode invalidation transport separately when local caches are used on multiple nodes; do not infer it from an invalidation event name.\n\n```js\nmodule.exports = {\n  cache: {\n    example: {\n      channels: { schema: { enabled: true, engine: 'hazelcast', fallback: false, ttl: 30 } },\n      engines: {\n        hazelcast: {\n          enabled: true,\n          options: {\n            clusterName: 'qualifiedCluster',\n            clusterMembers: ['hazelcast.example.invalid:5701'],\n            connectionTimeoutMs: 5000,\n            lockTimeoutMs: 5000,\n            mapNamePrefix: 'qualifiedRuntime',\n            prefix: 'example'\n          }\n        }\n      }\n    }\n  }\n};\n```\n\nThe Hazelcast overlay inherits the existing adapter handlers/capabilities; replace the illustrative host through approved deployment configuration. buildClientConfig requires a cluster name, nonempty member list and bounded connectionTimeoutMs (1..60000). The map name is mapNamePrefix_module_channel, here qualifiedRuntime_example_schema; characters outside A-Z/a-z/0-9/underscore/dot/hyphen are replaced with underscores. Within that map, tenant/key prefixing is the same as above. Values serialize as JSON, so qualify JSON-compatible types; nCache TTL seconds become map TTL milliseconds, and zero is non-expiring.\n\nFor Hazelcast, verify the effective cluster and map before put/get, tenant-scoped flushByKeys/flushByPrefix and post-invalidation miss. Never clear an entire shared cluster to repair one key. Shared maps do not prove member-loss durability, partition safety or an approved split-brain policy. A connection, serialization or lock failure remains a provider error, not a safe cached authorization result.\n\nRedis connection, Sentinel, values/TTL, atomic operations, scoped invalidation and reset safety remain in canonical foundation.redis-provider-operations, especially foundationRedisProviderOperations-1-provider-ownership-and-activation through -4-verification-and-troubleshooting. Redis consume requires client GETDEL and rejects ERR_CACHE_00006 if unavailable; it has no non-atomic get/delete substitute. Check the selected database and prefix, not a global flush. For any provider incident, inspect source correctness, exact scope and effective engine first; repair the provider/invalidation owner and qualify recovery before reopening protected work.\n\n## Customization and extension guidance\n\nLayer channels, engine options and existing invalidation hooks rather than copy an adapter into a business module. Preserve tenant/principal isolation, clone/JSON semantics, explicit TTL zero, miss/error separation, lifecycle readiness/shutdown and honest distributed/atomic capabilities. Qualify hit, miss, expiry, scoped invalidation, restart, concurrent mutations, unavailable engines and protected-channel denial. Do not replace fail-closed authentication or coordination with blanket degraded fallback.\n\n## Common mistakes\n\n- Treating cached values as authority.\n- Using one key namespace across Staged and Online.\n- Forgetting invalidation after import, publish, or configuration change.\n- Hiding provider outages behind generic business errors.\n- Adding custom cache behavior without production observability.\n\n## Verification\n\nQualify the exact Node-local key and 30-second/zero TTL cases, detached values, tenant-specific invalidation, process restart and a second independent process. Qualify Hazelcast connection/map/key/JSON/TTL behavior plus the lock checks below, then actual deployment member-loss/partition policy separately. Reuse the Redis owner's live runbook.\n\n### Hazelcast concurrent mutations and deadlines\n\nVersion allocation and bounded admission use an independent public asynchronous lock context for each operation. Use official Node.js client 5.7 or later. A shared client without independent contexts can reenter its own map lock and lose concurrent updates. `lockTimeoutMs` defaults to 5000 ms and accepts 1–60000; failed acquisition leaves the entry unchanged. Cluster connection retry defaults to `connectionTimeoutMs`; any explicit retry deadline must remain finite and no more than 60000 ms. Later configuration layers can shorten these deadlines.\n\nRun the guarded provider contract with `--require-live` against an isolated member. It checks concurrent updates from one and three clients, bounded counters, TTL, tenant isolation, lock contention/recovery and failed connection attempts. Then qualify the actual deployment's member-loss and split-brain policy. The local single-member result does not establish production partition guarantees.\n",
    "keywords": [
      "cache",
      "redis",
      "hazelcast",
      "node-cache",
      "invalidation",
      "Caching and Runtime State Management",
      "Cache Foundations",
      "Cache Provider Runbooks"
    ],
    "facets": {
      "section": "caching-and-runtime-state-management",
      "group": "caching-and-runtime-state-management",
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
