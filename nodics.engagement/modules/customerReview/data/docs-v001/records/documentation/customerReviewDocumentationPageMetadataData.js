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
    "code": "nodicsDocsMetadataengagementCustomerReviews",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.customer-reviews",
    "title": "Customer reviews and ratings",
    "summary": "Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization.",
    "businessSummary": "Customer reviews and ratings explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Customer reviews and ratings has canonical documentation records in customerReview at data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js, with functional visibility under nodics.engagement. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "customerReview",
    "targetPage": "nodicsDocsPageengagementCustomerReviews",
    "targetRoute": "nodicsDocsRouteengagementCustomerReviews",
    "articleComponent": "nodicsDocsComponentengagementCustomerReviews",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementcustomerreviews",
    "headings": [
      {
        "text": "Review lifecycle",
        "anchor": "engagementCustomerReviews-1-review-lifecycle",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "engagementCustomerReviews-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "engagementCustomerReviews-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "engagementCustomerReviews-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "engagementCustomerReviews-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "engagementCustomerReviews-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "engagementCustomerReviews-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementCustomerReviews-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementCustomerReviews-9-verification",
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
        "title": "Stage, Business question, Technical question"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.unified-operations",
      "engagement.enterprise-operations",
      "engagement.review-moderation-governance",
      "engagement.review-aggregation-recovery"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
    "sourceChecksum": "a9d786ad0572fbdb23b241e613296e604de7746ca5d8b1cd441052ef625c4b16",
    "sourceWordCount": 569,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 569,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataengagementReviewModerationGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.review-moderation-governance",
    "title": "Review Moderation and Governance",
    "summary": "Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations.",
    "businessSummary": "Review Moderation and Governance explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Review Moderation and Governance has canonical documentation records in customerReview at data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js, with functional visibility under nodics.engagement. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "customerReview",
    "targetPage": "nodicsDocsPageengagementReviewModerationGovernance",
    "targetRoute": "nodicsDocsRouteengagementReviewModerationGovernance",
    "articleComponent": "nodicsDocsComponentengagementReviewModerationGovernance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementreviewmoderationgovernance",
    "headings": [
      {
        "text": "Moderation flow",
        "anchor": "engagementReviewModerationGovernance-1-moderation-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "engagementReviewModerationGovernance-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "engagementReviewModerationGovernance-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "engagementReviewModerationGovernance-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "engagementReviewModerationGovernance-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "engagementReviewModerationGovernance-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "engagementReviewModerationGovernance-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementReviewModerationGovernance-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementReviewModerationGovernance-9-verification",
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
        "title": "Decision, Required evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.customer-reviews"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
    "sourceChecksum": "aa526454ec8c616f5b922e868f9cd9d086cae3fa711db16fcdb48a56bada5904",
    "sourceWordCount": 555,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 555,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadataengagementReviewAggregationRecovery",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.review-aggregation-recovery",
    "title": "Review Aggregation and Recovery",
    "summary": "Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes.",
    "businessSummary": "Review Aggregation and Recovery explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Review Aggregation and Recovery has canonical documentation records in customerReview at data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js, with functional visibility under nodics.engagement. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "customerReview",
    "targetPage": "nodicsDocsPageengagementReviewAggregationRecovery",
    "targetRoute": "nodicsDocsRouteengagementReviewAggregationRecovery",
    "articleComponent": "nodicsDocsComponentengagementReviewAggregationRecovery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementreviewaggregationrecovery",
    "headings": [
      {
        "text": "Aggregate flow",
        "anchor": "engagementReviewAggregationRecovery-1-aggregate-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "engagementReviewAggregationRecovery-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "engagementReviewAggregationRecovery-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "engagementReviewAggregationRecovery-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "engagementReviewAggregationRecovery-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "engagementReviewAggregationRecovery-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "engagementReviewAggregationRecovery-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementReviewAggregationRecovery-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementReviewAggregationRecovery-9-verification",
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
        "title": "Aggregate, Why it matters, Recovery signal"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.customer-reviews"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/customerReviewDocumentationComponentData.js",
    "sourceChecksum": "ae7f0739ac16d741f8c39d5b12f7424d307470e0437e95e67d8bd49035e883b1",
    "sourceWordCount": 588,
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
    "lifecycleState": "ONLINE",
    "maturityState": "IMPLEMENTED",
    "active": true,
    "wordCount": 588,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
