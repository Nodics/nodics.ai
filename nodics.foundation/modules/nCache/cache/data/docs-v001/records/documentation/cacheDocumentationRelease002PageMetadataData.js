/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Module-owned documentation page metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatacacheRuntimeStateManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "cache.runtime-state-management",
    "title": "Caching and Runtime State Management",
    "summary": "How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior.",
    "businessSummary": "Caching and Runtime State Management explains the business purpose, supported decisions, operational impact, and controls for the Cache Providers and Invalidation journey.",
    "technicalSummary": "Caching and Runtime State Management has canonical documentation records in cache at data/docs-v001/records/documentation/cacheDocumentationRelease002ComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "cache",
    "targetPage": "nodicsDocsPagecacheRuntimeStateManagement",
    "targetRoute": "nodicsDocsRoutecacheRuntimeStateManagement",
    "articleComponent": "nodicsDocsComponentcacheRuntimeStateManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacacheruntimestatemanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "cacheRuntimeStateManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "cacheRuntimeStateManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "cacheRuntimeStateManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cacheRuntimeStateManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "cacheRuntimeStateManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cacheRuntimeStateManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cacheRuntimeStateManagement-7-verification",
        "level": 2
      },
      {
        "text": "Subscription startup and shutdown",
        "anchor": "cacheRuntimeStateManagement-8-subscription-startup-and-shutdown",
        "level": 3
      },
      {
        "text": "Isolated queries and current published evidence",
        "anchor": "cache-runtime-state-management-search-freshness",
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
        "title": "Business question, Answer for this topic"
      },
      {
        "kind": "table",
        "title": "Responsibility, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Detail area, What to document, Verification signal"
      },
      {
        "kind": "table",
        "title": "Customization type, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Operational concern, Required documentation detail"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "configuration.runtime-behavior-management",
      "runtime.governed-change",
      "events.messaging-cluster-coordination"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cacheDocumentationRelease002ComponentData.js",
    "sourceChecksum": "619c9b350034257d069ebd2a72c6c2337f76b32fdd4dba68f58ea9c7701245df",
    "sourceWordCount": 1409,
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
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1409,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatafoundationCacheProviderRunbooks",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.cache-provider-runbooks",
    "title": "Cache Provider Runbooks",
    "summary": "Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance.",
    "businessSummary": "Cache Provider Runbooks explains the business purpose, supported decisions, operational impact, and controls for the Cache Foundations journey.",
    "technicalSummary": "Cache Provider Runbooks has canonical documentation records in cache at data/docs-v001/records/documentation/cacheDocumentationRelease002ComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "cache",
    "targetPage": "nodicsDocsPagefoundationCacheProviderRunbooks",
    "targetRoute": "nodicsDocsRoutefoundationCacheProviderRunbooks",
    "articleComponent": "nodicsDocsComponentfoundationCacheProviderRunbooks",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationcacheproviderrunbooks",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationCacheProviderRunbooks-1-source-map",
        "level": 2
      },
      {
        "text": "Provider flow",
        "anchor": "foundationCacheProviderRunbooks-2-provider-flow",
        "level": 2
      },
      {
        "text": "Configuration contract",
        "anchor": "foundationCacheProviderRunbooks-3-configuration-contract",
        "level": 2
      },
      {
        "text": "Runbook",
        "anchor": "foundationCacheProviderRunbooks-4-runbook",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationCacheProviderRunbooks-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationCacheProviderRunbooks-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationCacheProviderRunbooks-7-verification",
        "level": 2
      },
      {
        "text": "Hazelcast concurrent mutations and deadlines",
        "anchor": "foundationCacheProviderRunbooks-8-hazelcast-concurrent-mutations-and-deadlines",
        "level": 3
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Configuration, Purpose, Production note"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "cache.runtime-state-management",
      "runtime.governed-change",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/cacheDocumentationRelease002ComponentData.js",
    "sourceChecksum": "cb85f90c390edbf2ee6ae0f2b3a84c5842371a1431d3805cec873dae07d31d02",
    "sourceWordCount": 1174,
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
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 1174,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../package.json",
      "package.json",
      "../redisCache/package.json",
      "../hazelcastCache/package.json",
      "../nodeCache/package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
