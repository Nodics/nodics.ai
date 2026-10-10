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
    "code": "nodicsDocsMetadataschemaDataModelingManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "schema.data-modeling-management",
    "title": "Data Modeling and Schema Management",
    "summary": "How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension.",
    "businessSummary": "Data Modeling and Schema Management explains the business purpose, supported decisions, operational impact, and controls for the Schema and Model Extension journey.",
    "technicalSummary": "Data Modeling and Schema Management has canonical documentation records in database at data/docs-v001/records/documentation/databaseDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "database",
    "targetPage": "nodicsDocsPageschemaDataModelingManagement",
    "targetRoute": "nodicsDocsRouteschemaDataModelingManagement",
    "articleComponent": "nodicsDocsComponentschemaDataModelingManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataschemadatamodelingmanagement",
    "headings": [
      {
        "text": "Shared schema metadata for every API consumer",
        "anchor": "schemaDataModelingManagement-1-shared-schema-metadata-for-every-api-consumer",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "schemaDataModelingManagement-2-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Failure, compatibility and operational rollout",
        "anchor": "schemaDataModelingManagement-3-failure-compatibility-and-operational-rollout",
        "level": 3
      },
      {
        "text": "Validation and remaining route migration",
        "anchor": "schemaDataModelingManagement-4-validation-and-remaining-route-migration",
        "level": 3
      },
      {
        "text": "Generated create, update and delete contracts",
        "anchor": "schemaDataModelingManagement-5-generated-create-update-and-delete-contracts",
        "level": 2
      },
      {
        "text": "Compatibility, errors and retries",
        "anchor": "schemaDataModelingManagement-6-compatibility-errors-and-retries",
        "level": 3
      },
      {
        "text": "Canonical schema discovery",
        "anchor": "schemaDataModelingManagement-7-canonical-schema-discovery",
        "level": 3
      },
      {
        "text": "Selective module APIs and route-driven clients",
        "anchor": "schemaDataModelingManagement-8-selective-module-apis-and-route-driven-clients",
        "level": 3
      },
      {
        "text": "Domain setup and confirmation",
        "anchor": "schemaDataModelingManagement-9-domain-setup-and-confirmation",
        "level": 3
      },
      {
        "text": "Rollout and verification",
        "anchor": "schemaDataModelingManagement-10-rollout-and-verification",
        "level": 3
      },
      {
        "text": "Publication-aware Generic Authoring",
        "anchor": "schemaDataModelingManagement-11-publication-aware-generic-authoring",
        "level": 2
      },
      {
        "text": "Customize and Extend Safely",
        "anchor": "schemaDataModelingManagement-12-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Installed Version Migration",
        "anchor": "schemaDataModelingManagement-13-installed-version-migration",
        "level": 2
      },
      {
        "text": "Failure And Recovery",
        "anchor": "schemaDataModelingManagement-14-failure-and-recovery",
        "level": 3
      },
      {
        "text": "Customize And Extend Safely",
        "anchor": "schemaDataModelingManagement-15-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Technical revisions without manual arithmetic",
        "anchor": "schemaDataModelingManagement-16-technical-revisions-without-manual-arithmetic",
        "level": 2
      },
      {
        "text": "Developer service example",
        "anchor": "schemaDataModelingManagement-17-developer-service-example",
        "level": 3
      },
      {
        "text": "Conflict and recovery behavior",
        "anchor": "schemaDataModelingManagement-18-conflict-and-recovery-behavior",
        "level": 3
      },
      {
        "text": "Customize and extend safely",
        "anchor": "schemaDataModelingManagement-19-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Business context",
        "anchor": "schemaDataModelingManagement-20-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "schemaDataModelingManagement-21-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "schemaDataModelingManagement-22-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "schemaDataModelingManagement-23-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "schemaDataModelingManagement-24-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "schemaDataModelingManagement-25-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "schemaDataModelingManagement-26-verification",
        "level": 2
      },
      {
        "text": "Governed local maintenance",
        "anchor": "schemaDataModelingManagement-27-governed-local-maintenance",
        "level": 3
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      },
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Capability, Canonical interface relative to the module endpoint, Owner"
      },
      {
        "kind": "table",
        "title": "Operation, Caller responsibility, Framework responsibility"
      },
      {
        "kind": "table",
        "title": "Response, Meaning, Recovery"
      },
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
      "persistence.provider-data-access-layer",
      "framework.customization-guide",
      "axis.business-customization"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
    "sourceChecksum": "1b87c548734134dfa122036ff4f76f65124168d5e08413be26d272c478573738",
    "sourceWordCount": 4557,
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
    "wordCount": 4557,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadatapersistenceProviderDataAccessLayer",
    "product": "nodicsDocumentationProduct",
    "documentId": "persistence.provider-data-access-layer",
    "title": "Provider and Data Access Layer",
    "summary": "How the Nodics data access layer uses MongoDB today while preserving provider seams for additional database providers.",
    "businessSummary": "Provider and Data Access Layer explains the business purpose, supported decisions, operational impact, and controls for the Provider and Data Access Layer journey.",
    "technicalSummary": "Provider and Data Access Layer has canonical documentation records in database at data/docs-v001/records/documentation/databaseDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "database",
    "targetPage": "nodicsDocsPagepersistenceProviderDataAccessLayer",
    "targetRoute": "nodicsDocsRoutepersistenceProviderDataAccessLayer",
    "articleComponent": "nodicsDocsComponentpersistenceProviderDataAccessLayer",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatapersistenceproviderdataaccesslayer",
    "headings": [
      {
        "text": "Business context",
        "anchor": "persistenceProviderDataAccessLayer-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime model",
        "anchor": "persistenceProviderDataAccessLayer-2-runtime-model",
        "level": 2
      },
      {
        "text": "MongoDB provider detail",
        "anchor": "persistenceProviderDataAccessLayer-3-mongodb-provider-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "persistenceProviderDataAccessLayer-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "persistenceProviderDataAccessLayer-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "persistenceProviderDataAccessLayer-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "persistenceProviderDataAccessLayer-7-verification",
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
        "title": "Business need, Data-access answer"
      },
      {
        "kind": "table",
        "title": "Layer, Main responsibility, Current behavior"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Required documentation"
      },
      {
        "kind": "table",
        "title": "Failure mode, Symptom, Troubleshooting step"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "schema.data-modeling-management",
      "configuration.runtime-behavior-management",
      "foundation.overview"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
    "sourceChecksum": "8f359deed9539b8976fec434992d1c35328dc96139bd4d8a0bdf8841933cd41f",
    "sourceWordCount": 1202,
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
    "wordCount": 1202,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/schemas",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadatafoundationDatabaseProviderBoundaries",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.database-provider-boundaries",
    "title": "Database Provider Boundaries",
    "summary": "How MongoDB, virtual DB, Cassandra, Elasticsearch, schemas, query translation, indexes, migration, and provider validation are separated.",
    "businessSummary": "Database Provider Boundaries explains the business purpose, supported decisions, operational impact, and controls for the Database Provider Contracts journey.",
    "technicalSummary": "Database Provider Boundaries has canonical documentation records in database at data/docs-v001/records/documentation/databaseDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "database",
    "targetPage": "nodicsDocsPagefoundationDatabaseProviderBoundaries",
    "targetRoute": "nodicsDocsRoutefoundationDatabaseProviderBoundaries",
    "articleComponent": "nodicsDocsComponentfoundationDatabaseProviderBoundaries",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationdatabaseproviderboundaries",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationDatabaseProviderBoundaries-1-source-map",
        "level": 2
      },
      {
        "text": "Boundary model",
        "anchor": "foundationDatabaseProviderBoundaries-2-boundary-model",
        "level": 2
      },
      {
        "text": "Contract rules",
        "anchor": "foundationDatabaseProviderBoundaries-3-contract-rules",
        "level": 2
      },
      {
        "text": "Provider comparison",
        "anchor": "foundationDatabaseProviderBoundaries-4-provider-comparison",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationDatabaseProviderBoundaries-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationDatabaseProviderBoundaries-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationDatabaseProviderBoundaries-7-verification",
        "level": 2
      },
      {
        "text": "Customizing MongoDB schema keyword selection",
        "anchor": "foundationDatabaseProviderBoundaries-8-customizing-mongodb-schema-keyword-selection",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Provider, Use, Watch point"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "persistence.provider-data-access-layer",
      "foundation.cache-provider-runbooks",
      "discovery.search-indexing"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/databaseDocumentationComponentData.js",
    "sourceChecksum": "496a452735af73f49926ff8e1c68a031b6212f12203f9d48cded4c71047a7125",
    "sourceWordCount": 967,
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
    "wordCount": 967,
    "sourceEvidence": [
      "../../../../nodics.docs/data/manifest.json",
      "../../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../package.json",
      "package.json",
      "vDatabase/package.json",
      "../mongodb/package.json",
      "../mongodb/vMongodb/package.json",
      "../cassandradb/package.json",
      "../elasticdb/package.json",
      "src/schemas",
      "src/service"
    ]
  }
};
