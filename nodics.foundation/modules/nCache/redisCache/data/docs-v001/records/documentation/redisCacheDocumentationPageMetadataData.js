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
  "nodicsDocsMetadatafoundationRedisProviderOperations": {
    "code": "nodicsDocsMetadatafoundationRedisProviderOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.redis-provider-operations",
    "title": "Redis Cache Provider Operations",
    "summary": "Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "businessSummary": "Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "technicalSummary": "Redis Cache Provider Operations: source-backed behavior, ownership, extension, failure handling and acceptance boundaries.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "redisCache",
    "targetPage": "nodicsDocsPagefoundationRedisProviderOperations",
    "targetRoute": "nodicsDocsRoutefoundationRedisProviderOperations",
    "articleComponent": "nodicsDocsComponentfoundationRedisProviderOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationredisprovideroperations",
    "headings": [
      {
        "text": "Redis Cache Provider Operations",
        "anchor": "foundation-redis-provider-operations",
        "level": 1
      },
      {
        "text": "Provider ownership and activation",
        "anchor": "foundationRedisProviderOperations-1-provider-ownership-and-activation",
        "level": 2
      },
      {
        "text": "Values TTL and atomic operations",
        "anchor": "foundationRedisProviderOperations-2-values-ttl-and-atomic-operations",
        "level": 2
      },
      {
        "text": "Lifecycle invalidation and reset safety",
        "anchor": "foundationRedisProviderOperations-3-lifecycle-invalidation-and-reset-safety",
        "level": 2
      },
      {
        "text": "Verification and troubleshooting",
        "anchor": "foundationRedisProviderOperations-4-verification-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "redis-cache-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Documentation selection assets and acceptance",
        "anchor": "foundationRedisProviderOperations-5-documentation-selection-assets-and-acceptance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundation-redis-provider-operations-common-mistakes",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Operation, Source behavior, Operational rule"
      },
      {
        "kind": "table",
        "title": "Rejection or symptom, Source boundary, Recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "foundation.cache-provider-runbooks",
      "foundation.database-provider-boundaries"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/redisCacheDocumentationComponentData.js",
    "sourceChecksum": "cf447e8dc4446df8500488b92aff33cb567392d7a1ffd61734e22a8ef9836dd9",
    "sourceWordCount": 1745,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa",
      "ai-tool"
    ],
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.draft.update"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "CONTENT_CHANGE",
      "ACCESS_POLICY_CHANGE",
      "SOURCE_EVIDENCE_CHANGE"
    ],
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "STAGED",
    "maturityState": "REFERENCE",
    "active": true,
    "wordCount": 1745,
    "sourceEvidence": [
      "src/service/cache/defaultRedisCacheService.js",
      "src/service/engine/defaultRedisCacheEngineService.js",
      "src/service/engine/defaultSentinelRedisClientAdapterService.js",
      "src/service/maintenance/defaultRedisLocalResetMaintenanceService.js",
      "test/redisSentinelConfigurationContract.test.js",
      "llm/contracts/local-reset-maintenance.md",
      "config/properties.js",
      "../cache/config/properties.js",
      "../cache/src/service/config/defaultCacheConfigurationService.js"
    ],
    "sourceCoverage": [
      {
        "modulePath": ".",
        "implementationState": "IMPLEMENTED",
        "anchors": [
          "foundationRedisProviderOperations-1-provider-ownership-and-activation",
          "foundationRedisProviderOperations-2-values-ttl-and-atomic-operations",
          "foundationRedisProviderOperations-3-lifecycle-invalidation-and-reset-safety",
          "foundationRedisProviderOperations-4-verification-and-troubleshooting",
          "foundationRedisProviderOperations-5-documentation-selection-assets-and-acceptance"
        ],
        "evidence": [
          "src/service/cache/defaultRedisCacheService.js",
          "src/service/engine/defaultRedisCacheEngineService.js",
          "src/service/engine/defaultSentinelRedisClientAdapterService.js",
          "src/service/maintenance/defaultRedisLocalResetMaintenanceService.js",
          "test/redisSentinelConfigurationContract.test.js",
          "llm/contracts/local-reset-maintenance.md"
        ]
      }
    ],
    "businessAudience": [
      "business user",
      "implementation partner",
      "redisCache capability owner"
    ]
  }
};
