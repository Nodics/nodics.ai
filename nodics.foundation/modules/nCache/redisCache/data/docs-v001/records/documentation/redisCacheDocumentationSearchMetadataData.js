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
  "nodicsDocsSearchnodenodicsdocsnodepagefoundationredisprovideroperations": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepagefoundationredisprovideroperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePagefoundationRedisProviderOperations",
    "title": "Redis Cache Provider Operations",
    "summary": "Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Redis Cache Provider Operations Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "keywords": [
      "redisCache",
      "source-backed",
      "ownership",
      "operations"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  },
  "nodicsDocsSearchpagenodicsdocsmetadatafoundationredisprovideroperations": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadatafoundationredisprovideroperations",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadatafoundationRedisProviderOperations",
    "title": "Redis Cache Provider Operations",
    "summary": "Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "searchText": "Redis Cache Provider Operations Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries. # Redis Cache Provider Operations\n\nFor a beginner, Redis is a replaceable cache provider, not the authoritative business database. Start by inspecting the effective cache selection and testing a harmless set/get/remove cycle in an isolated namespace. A missing cache value should be distinguished from a provider connection failure. Before enabling this provider, follow the configuration, expiry and failure sections and verify the consuming capability's behavior when Redis is unavailable.\n\n## Provider ownership and activation\n\nUse Redis when several Nodics processes need the same cache or distributed authentication state. Operators select and qualify its connection, namespace and outage policy; developers use the composed Cache contract for temporary values. The worked deployment override and recovery matrix below distinguish a cache miss from an unavailable strict-auth provider and from an explicitly governed offline cleanup.\n\nredisCache owns Redis SDK integration behind the shared Cache contract. Consumers use loader-composed cache services rather than importing Redis directly. Activation comes from layered cache.enabled, engine.enabled and channel.enabled flags; a connection URL or namespace prefix is only a value, not an activation switch. The current shared cache/config/properties.js default for the Redis engine prefix is localRuntimeAuth, inherited through nConfig, with deployment overrides available for isolation. The prefix does not replace module, channel or runtime tenant keying.\n\nStandalone connections use the node Redis client. Sentinel selection requires sentinel.enabled true, a master name and nonempty valid host/port endpoints, and uses the existing ioredis adapter. Server credentials and Sentinel credentials are separate. Sentinel option mapping supplies default ten-second connect and command timeouts, ready checks, three retries per request and a retry delay capped at five seconds. These are defaults, not comprehensive numeric bounds on operator configuration; standalone behavior uses its configured node Redis socket options. TLS configuration is normalized at the provider boundary. Do not place secrets in documentation data, browser fixtures or command output.\n\n```mermaid\nflowchart LR\n  Config[Layered activation and connection values] --> Engine[Redis engine]\n  Engine --> Client[Standalone or Sentinel client]\n  Client --> Adapter[Namespaced cache operations]\n  Adapter --> Channels[Schema router or strict auth channels]\n  Engine --> Subscriber[Awaited event subscriber]\n  Client --> Shutdown[Central lifecycle owner]\n  Subscriber --> Shutdown\n```\n\n## Values TTL and atomic operations\n\nput serializes the supplied JSON shape. get deserializes one key and returns the owning cache-miss error when absent. TTL resolution preserves explicit zero as non-expiring; positive values use expiry. Neither ordinary put nor a missing key should invent an authorization decision. consume requires atomic GETDEL support and rejects when the client lacks it, avoiding a racy get-then-delete fallback for one-time values. Strict authentication channels must never fall back to local memory because Redis is unavailable.\n\nputVersioned uses one Redis script to compare and store a safe nonnegative integer version. A lower version is rejected; an equal version is accepted and can replace the value. advance can raise the incoming value above the stored version, with overflow above JavaScript safe-integer range rejected. The result returns the actual stored revision rather than merely echoing the request. This atomicity is scoped to one adapter key; it is not a transaction across unrelated database records. incrementBounded validates positive safe-integer amount, maximum and positive TTL and updates the bounded counter through a script. The script sets expiry on an allowed write, so operators must not infer a fixed-window policy from a high-level comment alone. incrementBounded refreshes expiry after every allowed increment, while a denied increment leaves the stored value and expiry untouched. Ordinary flushByPrefix performs incremental SCAN but collects all matching keys into memory and sends one deletion; it does not have the bounded exact-key inventory guarantees of offline Local maintenance.\n\n| Operation | Source behavior | Operational rule |\n| --- | --- | --- |\n| TTL zero | Non-expiring value | Use intentionally and test retention |\n| consume | Atomic GETDEL required | No read/delete emulation |\n| putVersioned | Single-key script and actual version | Reject stale or overflowing writes |\n| flushByPrefix | Namespaced incremental SCAN | Not a global database reset |\n| Strict auth outage | No local fallback | Fail closed and restore provider |\n\n## Lifecycle invalidation and reset safety\n\nConnection acquisition is awaited before client registration. A startup failure closes the acquired client through its supported destroy, disconnect or quit path while preserving the original failure. Configured event subscriptions are also required startup work: duplicate subscriber connection and all subscriptions must complete before readiness. Subscribers returned to their channel are owned by central shutdown alongside engine clients. Close every owned client exactly once and attempt remaining closes even after one close fails. Event startup issues CONFIG SET notify-keyspace-events Ex on the configured server before creating the subscriber, so permissions and effects on other notification consumers require deployment review. Failure rejects startup; do not quietly omit a required subscription.\n\nExpiry events use configured service and event names. Prefix invalidation builds the shared namespace and collects matching keys through incremental SCAN rather than issuing a blocking global key query. Offline Local reset is a different provider-owned maintenance contract: private bounded inventory, reviewed exact keys, exact batch deletion and count-only partial or uncertain receipts. There is no global FLUSH shortcut or startup security purge. A partner must preserve unrelated namespaces and cannot broaden deletion because a first batch was uncertain.\n\nFor a deployment changing from standalone to Sentinel, retain the same channel and tenant namespace rules, configure master/endpoints and credential separation, then run deterministic configuration tests before live qualification. Exercise failover and central shutdown with the actual client versions and infrastructure. A mocked Redis script can verify arguments but cannot prove server concurrency, partition behavior, Sentinel readiness or runtime cleanup. For a failed authentication cache, report the provider failure safely and restore the configured channel; never mint a local session as a workaround.\n\n## Verification and troubleshooting\n\nRun Sentinel configuration and Local maintenance contracts plus the central cache adapter, lifecycle and versioned-write contracts. Use guarded cacheRedisLive only against an explicitly selected disposable provider namespace, and record skips honestly. Include explicit zero TTL, stale and advancing versions, GETDEL absence, bounded-counter rejection, subscription failure and shutdown after partial startup. Diagnose connection, namespace and channel activation separately. Do not log raw keys containing private identity or values containing tokens. Source checks prove contract shape; live provider tests and signed-in authentication acceptance are separate evidence.\n\n## Customize and extend safely\n\nAn operator selects Redis when several Nodics processes need shared state, then qualifies the chosen topology and strict-auth outage behavior. An application developer contributes only actual differences to project/environment config/properties.js under cache.default.engines.redis and the intended channels. redisCache/config/properties.js is currently empty; the shared cache capability supplies engine defaults. Keep module, channel and trusted tenant keying, explicit zero TTL, atomic consume and strict channel failure policy when overriding loader-visible members in project src/service/cache/defaultRedisCacheService.js or src/service/engine/defaultRedisCacheEngineService.js.\n\n```javascript\n// Later deployment config/properties.js; inherit connection/secret settings.\nmodule.exports = { cache: { default: { engines: { redis: {\n  enabled: true, options: { prefix: 'isolatedRuntimeAuth' }\n} } } } };\n// Also select Redis on the intended enabled channel through existing policy.\n// auth + tenantA + session => auth_isolatedRuntimeAuth_tenantA_session\n```\n\n| Rejection or symptom | Source boundary | Recovery |\n| --- | --- | --- |\n| Invalid TTL | ERR_CACHE_00009 from shared resolveTtl | Correct request/channel/engine TTL; use integer positive Redis EX seconds or intentional zero |\n| Atomic consume unavailable | ERR_CACHE_00006 when getDel method is absent | Restore a qualified client/server; never emulate get then delete |\n| Stale versioned write | Lower stored comparison or unsafe integer | Reload authoritative revision; do not assume equal revisions reject |\n| Missing expiry subscription | CONFIG SET, duplicate/connect or subscribe failure | Restore required server grant/configuration and qualify startup/central shutdown |\n| Offline reset key drift or uncertain DEL | Private exact-key maintenance inventory | Keep incomplete count-only evidence; re-establish writer exclusion and review before any new deletion |\n\nA namespace prefix alone does not prove isolation or authorize reset. Offline maintenance additionally requires an attested exclusive disposable deployment, excluded writers, exact loopback standalone endpoint/database, no Sentinel or TLS, a private inventory within 1000 keys/1 MiB/256 pages, and unchanged reviewed keys before batches of at most 100. Ordinary runtime invalidation is not this maintenance interface. Verify namespace separation, equal/lower/advancing versions, expiry refresh and required subscriber cleanup in owner contracts, then perform guarded live qualification against disposable infrastructure. Never infer live failover or safe global cleanup from a fixture.\n\n## Documentation selection assets and acceptance\n\nPartner extension guidance: select this capability through the existing module graph and use later project configuration or a loader-visible service extension for an intentional difference. Preserve its canonical identity, independent authorization, bounded inputs and original evidence. Add a focused regression for the changed policy and run the inherited owner tests. Do not fork the framework guide into another module merely to customize branding; reference it from a project guide that explains only the real difference.\n\nThis guide is canonical CMS data owned by redisCache. Its optional CONTENT_PACK lives in data/docs-v001, separate from business DATA_RELEASE sections. A partner importing business records does not need to install this guide. Axis exposes the documentation profile independently and imports its declared CMS closure plus shared scaffold into WCMS Staged. The functional group provides navigation context without owning a duplicate article body. Follow owner-qualified related references for shared behavior; a reference must not silently install another capability pack or create a second implementation.\n\nImages belong to the same documentation release as their owning Media records and declared asset files. Preserve stable Media codes, release-relative asset paths and checksums. Shared images may stay with the explicitly included documentation foundation; capability-specific images stay with that capability. Diagrams and tables are canonical content blocks, not separate Markdown authoring copies. A new screenshot must be privacy-safe, accessible and traceable to the depicted version. An image is explanatory evidence only, not proof that a runtime operation succeeded.\n\nCanonical article corrections require source editorial review before authoring records may be STAGED and the owning route made selectable for normal publication. STAGED and route.active=true express editorial readiness and selection eligibility; they do not approve a Process task, create a live version or prove public delivery. The integration owner refreshes body counts and integrity metadata, declared-file hashes and composed checksums, validates references and the selected release, then imports and follows normal review, approval and publication. Preserve empty reviewer/approver fields and existing audit evidence until the owning process records real decisions. Installed import, approval, published delivery and signed-in browser acceptance remain separate results.\n\n## Common mistakes\n\nDo not confuse a helper result with a completed authorized business operation. Do not bypass the owning persistence, publication or recovery contract to clear a dashboard. Do not copy shared behavior into an accelerator or put capability data into a composition-only group. Do not treat fixture output, missing measurement or a passing source test as live qualification. Preserve original evidence and report uncertain outcomes without an automatic replay.\n",
    "keywords": [
      "redisCache",
      "source-backed",
      "ownership",
      "operations"
    ],
    "facets": {
      "section": "accelerators-and-industry-solution-templates",
      "group": "accelerators-and-industry-solution-templates",
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
      "maturityState": "partial"
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
    "lifecycleState": "STAGED",
    "indexState": "INDEX_READY",
    "active": true
  }
};
