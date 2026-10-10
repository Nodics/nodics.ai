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
    "code": "nodicsDocsMetadataframeworkRuntimeServerComposition",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.runtime-server-composition",
    "title": "Runtime Server Composition",
    "summary": "How project topology composes framework modules into Platform, WCMS, Process, and other runtime servers.",
    "businessSummary": "Runtime Server Composition explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Runtime Server Composition has canonical documentation records in config at data/docs-v001/records/documentation/configDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "config",
    "targetPage": "nodicsDocsPageframeworkRuntimeServerComposition",
    "targetRoute": "nodicsDocsRouteframeworkRuntimeServerComposition",
    "articleComponent": "nodicsDocsComponentframeworkRuntimeServerComposition",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkruntimeservercomposition",
    "headings": [
      {
        "text": "Runtime model",
        "anchor": "frameworkRuntimeServerComposition-1-runtime-model",
        "level": 2
      },
      {
        "text": "Composition decisions",
        "anchor": "frameworkRuntimeServerComposition-2-composition-decisions",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkRuntimeServerComposition-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "frameworkRuntimeServerComposition-4-operator-view",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkRuntimeServerComposition-5-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkRuntimeServerComposition-6-verification",
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
        "title": "Decision, Business impact, Technical impact"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "foundation.overview",
      "framework.customization-guide",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
    "sourceChecksum": "1324b171c3f261bda0d82e217be0c82ec26728f8ac858b893b903d0ccb9f0adf",
    "sourceWordCount": 517,
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
    "wordCount": 517,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record1": {
    "code": "nodicsDocsMetadataframeworkModuleLoadingServicePrecedence",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.module-loading-service-precedence",
    "title": "Module Loading and Service Precedence",
    "summary": "How runtime loading order, service overrides, and project layers decide which implementation is active.",
    "businessSummary": "Module Loading and Service Precedence explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Module Loading and Service Precedence has canonical documentation records in config at data/docs-v001/records/documentation/configDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "config",
    "targetPage": "nodicsDocsPageframeworkModuleLoadingServicePrecedence",
    "targetRoute": "nodicsDocsRouteframeworkModuleLoadingServicePrecedence",
    "articleComponent": "nodicsDocsComponentframeworkModuleLoadingServicePrecedence",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkmoduleloadingserviceprecedence",
    "headings": [
      {
        "text": "Loading order",
        "anchor": "frameworkModuleLoadingServicePrecedence-1-loading-order",
        "level": 2
      },
      {
        "text": "Business and developer impact",
        "anchor": "frameworkModuleLoadingServicePrecedence-2-business-and-developer-impact",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkModuleLoadingServicePrecedence-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "frameworkModuleLoadingServicePrecedence-4-operator-view",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkModuleLoadingServicePrecedence-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkModuleLoadingServicePrecedence-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkModuleLoadingServicePrecedence-7-verification",
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
        "title": "Reader, Why precedence matters"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "foundation.overview",
      "framework.customization-guide",
      "platform.module-registry",
      "foundation.module-to-module-communication",
      "routing.api-request-lifecycle"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
    "sourceChecksum": "a133e75dd0bb45c7209193d20b44628b7f61decb7955e993c58490743518d2b5",
    "sourceWordCount": 755,
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
    "wordCount": 755,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record2": {
    "code": "nodicsDocsMetadataconfigurationRuntimeBehaviorManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "configuration.runtime-behavior-management",
    "title": "Application Configuration and Runtime Behavior Management",
    "summary": "How configuration layers, provider choices, runtime settings, and project overrides change Nodics behavior safely.",
    "businessSummary": "Application Configuration and Runtime Behavior Management explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Application Configuration and Runtime Behavior Management has canonical documentation records in config at data/docs-v001/records/documentation/configDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "config",
    "targetPage": "nodicsDocsPageconfigurationRuntimeBehaviorManagement",
    "targetRoute": "nodicsDocsRouteconfigurationRuntimeBehaviorManagement",
    "articleComponent": "nodicsDocsComponentconfigurationRuntimeBehaviorManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataconfigurationruntimebehaviormanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "configurationRuntimeBehaviorManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "configurationRuntimeBehaviorManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "configurationRuntimeBehaviorManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "configurationRuntimeBehaviorManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "configurationRuntimeBehaviorManagement-5-customize-and-extend-safely",
        "level": 3
      },
      {
        "text": "Rejected placement",
        "anchor": "configurationRuntimeBehaviorManagement-6-rejected-placement",
        "level": 3
      },
      {
        "text": "Operations and governance",
        "anchor": "configurationRuntimeBehaviorManagement-7-operations-and-governance",
        "level": 2
      },
      {
        "text": "Migration and rollback",
        "anchor": "configurationRuntimeBehaviorManagement-8-migration-and-rollback",
        "level": 3
      },
      {
        "text": "Common mistakes",
        "anchor": "configurationRuntimeBehaviorManagement-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "configurationRuntimeBehaviorManagement-10-verification",
        "level": 2
      },
      {
        "text": "Capability inventories and project tooling",
        "anchor": "configurationRuntimeBehaviorManagement-11-capability-inventories-and-project-tooling",
        "level": 2
      },
      {
        "text": "Installed project command",
        "anchor": "configurationRuntimeBehaviorManagement-12-installed-project-command",
        "level": 2
      },
      {
        "text": "Declarative property bindings",
        "anchor": "configurationRuntimeBehaviorManagement-13-declarative-property-bindings",
        "level": 2
      },
      {
        "text": "Build exclusion and interrupted-build recovery",
        "anchor": "configurationRuntimeBehaviorManagement-14-build-exclusion-and-interrupted-build-recovery",
        "level": 3
      },
      {
        "text": "Generated output containment",
        "anchor": "configurationRuntimeBehaviorManagement-15-generated-output-containment",
        "level": 3
      },
      {
        "text": "Defaults that stay with their owners",
        "anchor": "configurationRuntimeBehaviorManagement-16-defaults-that-stay-with-their-owners",
        "level": 2
      },
      {
        "text": "Customize and extend safely: exact collections",
        "anchor": "configurationRuntimeBehaviorManagement-17-customize-and-extend-safely-exact-collections",
        "level": 3
      },
      {
        "text": "Runtime callback authority",
        "anchor": "configurationRuntimeBehaviorManagement-18-runtime-callback-authority",
        "level": 2
      },
      {
        "text": "Minimal topology and shared deployment references",
        "anchor": "configurationRuntimeBehaviorManagement-19-minimal-topology-and-shared-deployment-references",
        "level": 2
      },
      {
        "text": "Consumer defaults and property ownership",
        "anchor": "configurationRuntimeBehaviorManagement-20-consumer-defaults-and-property-ownership",
        "level": 3
      },
      {
        "text": "Origins from configured frontend endpoints",
        "anchor": "configurationRuntimeBehaviorManagement-21-origins-from-configured-frontend-endpoints",
        "level": 2
      },
      {
        "text": "Mandatory configuration ownership restrictions",
        "anchor": "configurationRuntimeBehaviorManagement-22-mandatory-configuration-ownership-restrictions",
        "level": 2
      },
      {
        "text": "MongoDB default database names",
        "anchor": "configurationRuntimeBehaviorManagement-23-mongodb-default-database-names",
        "level": 2
      },
      {
        "text": "Redis default prefix",
        "anchor": "configurationRuntimeBehaviorManagement-24-redis-default-prefix",
        "level": 2
      },
      {
        "text": "Capability-owned acceptance tooling",
        "anchor": "configurationRuntimeBehaviorManagement-25-capability-owned-acceptance-tooling",
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
        "title": "Reader, Start here"
      },
      {
        "kind": "table",
        "title": "Configuration or behavior, Authoritative home"
      },
      {
        "kind": "table",
        "title": "Category, Customer action, Example"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Recovery"
      },
      {
        "kind": "table",
        "title": "Configuration, Inherited owner behavior, Project or deployment choice"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "foundation.overview",
      "configuration.framework-startup-lifecycle",
      "cache.runtime-state-management",
      "foundation.error-handling-status-codes",
      "routing.api-governance",
      "runtime.governed-change"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
    "sourceChecksum": "fb41624abd367eacd67b3f72dea7d6d8a50509fb24448f065e43bcb27932bc85",
    "sourceWordCount": 4301,
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
    "wordCount": 4301,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  },
  "record3": {
    "code": "nodicsDocsMetadataconfigurationFrameworkStartupLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "configuration.framework-startup-lifecycle",
    "title": "Framework Startup Lifecycle",
    "summary": "Step-by-step startup path from runtime launch through nConfig module discovery, configuration loading, lifecycle hooks, init data import, identity bootstrap, and server readiness.",
    "businessSummary": "Framework Startup Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Framework Startup Lifecycle has canonical documentation records in config at data/docs-v001/records/documentation/configDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "config",
    "targetPage": "nodicsDocsPageconfigurationFrameworkStartupLifecycle",
    "targetRoute": "nodicsDocsRouteconfigurationFrameworkStartupLifecycle",
    "articleComponent": "nodicsDocsComponentconfigurationFrameworkStartupLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataconfigurationframeworkstartuplifecycle",
    "headings": [
      {
        "text": "Business context",
        "anchor": "configurationFrameworkStartupLifecycle-1-business-context",
        "level": 2
      },
      {
        "text": "Entry point",
        "anchor": "configurationFrameworkStartupLifecycle-2-entry-point",
        "level": 2
      },
      {
        "text": "Full startup flow",
        "anchor": "configurationFrameworkStartupLifecycle-3-full-startup-flow",
        "level": 2
      },
      {
        "text": "Module discovery contract",
        "anchor": "configurationFrameworkStartupLifecycle-4-module-discovery-contract",
        "level": 2
      },
      {
        "text": "Active module resolution",
        "anchor": "configurationFrameworkStartupLifecycle-5-active-module-resolution",
        "level": 2
      },
      {
        "text": "Configuration loading",
        "anchor": "configurationFrameworkStartupLifecycle-6-configuration-loading",
        "level": 2
      },
      {
        "text": "File and artifact loading",
        "anchor": "configurationFrameworkStartupLifecycle-7-file-and-artifact-loading",
        "level": 2
      },
      {
        "text": "Module-level lifecycle hook",
        "anchor": "configurationFrameworkStartupLifecycle-8-module-level-lifecycle-hook",
        "level": 2
      },
      {
        "text": "Pre-scripts",
        "anchor": "configurationFrameworkStartupLifecycle-9-pre-scripts",
        "level": 2
      },
      {
        "text": "Post-scripts",
        "anchor": "configurationFrameworkStartupLifecycle-10-post-scripts",
        "level": 2
      },
      {
        "text": "Entity lifecycle hooks",
        "anchor": "configurationFrameworkStartupLifecycle-11-entity-lifecycle-hooks",
        "level": 2
      },
      {
        "text": "Fresh schema and init data",
        "anchor": "configurationFrameworkStartupLifecycle-12-fresh-schema-and-init-data",
        "level": 2
      },
      {
        "text": "Mandatory bootstrap reconcilers",
        "anchor": "configurationFrameworkStartupLifecycle-13-mandatory-bootstrap-reconcilers",
        "level": 2
      },
      {
        "text": "Internal identity and tenant context",
        "anchor": "configurationFrameworkStartupLifecycle-14-internal-identity-and-tenant-context",
        "level": 2
      },
      {
        "text": "Router startup and readiness",
        "anchor": "configurationFrameworkStartupLifecycle-15-router-startup-and-readiness",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "configurationFrameworkStartupLifecycle-16-operations-and-governance",
        "level": 2
      },
      {
        "text": "Customization decision guide",
        "anchor": "configurationFrameworkStartupLifecycle-17-customization-decision-guide",
        "level": 2
      },
      {
        "text": "Safe pre-module-load customization",
        "anchor": "configurationFrameworkStartupLifecycle-18-safe-pre-module-load-customization",
        "level": 2
      },
      {
        "text": "Safe post-module-load customization",
        "anchor": "configurationFrameworkStartupLifecycle-19-safe-post-module-load-customization",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "configurationFrameworkStartupLifecycle-20-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "configurationFrameworkStartupLifecycle-21-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "configurationFrameworkStartupLifecycle-22-verification",
        "level": 2
      },
      {
        "text": "Proving completed startup and failure cleanup",
        "anchor": "configurationFrameworkStartupLifecycle-23-proving-completed-startup-and-failure-cleanup",
        "level": 2
      }
    ],
    "diagrams": [
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
        "title": "Business need, Startup answer"
      },
      {
        "kind": "table",
        "title": "Step, Runtime action, Source owner"
      },
      {
        "kind": "table",
        "title": "Metadata, Meaning"
      },
      {
        "kind": "table",
        "title": "Source, How it participates"
      },
      {
        "kind": "table",
        "title": "Artifact, Location, Runtime registry"
      },
      {
        "kind": "table",
        "title": "Operator check, Evidence to collect"
      },
      {
        "kind": "table",
        "title": "Need, Use, Why"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely area, What to check"
      },
      {
        "kind": "table",
        "title": "Scenario, Expected result, Evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "configuration.runtime-behavior-management",
      "framework.module-loading-service-precedence",
      "routing.api-request-lifecycle",
      "foundation.error-handling-status-codes",
      "pipeline.business-logic-orchestration",
      "data.import-export-migration",
      "framework.local-quick-start"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
    "sourceChecksum": "c5bc1401f1771e8a44956c2205735bde6c3278d5ca7e17191e2d9d003d3dbba2",
    "sourceWordCount": 3402,
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
    "wordCount": 3402,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "../../nodics.js",
      "nodics.js",
      "bin/nodics.js",
      "bin/config.js",
      "src/utils/utils.js",
      "src/service/DefaultFrameworkInitializerService.js",
      "src/service/DefaultScriptsHandlerService.js",
      "src/service/defaultFilesLoaderService.js",
      "src/service/defaultEnumService.js",
      "src/service/defaultClassesHandlerService.js",
      "../nDatabase/database/src/service/connection/defaultDatabaseConnectionHandlerService.js",
      "../nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService.js",
      "../nData/nImport/import/src/service/import/defaultImportService.js",
      "../nData/nImport/import/src/pipelines/pipelines.js",
      "../nRouter/src/service/router/defaultRouterService.js",
      "../../../nodics.platform/modules/profile/nodics.js",
      "../../../nodics.platform/modules/profile/src/service/profile/defaultProfileService.js",
      "package.json",
      "src/service"
    ]
  },
  "record4": {
    "code": "nodicsDocsMetadataruntimeGovernedChange",
    "product": "nodicsDocumentationProduct",
    "documentId": "runtime.governed-change",
    "title": "Governed Runtime Change Capability",
    "summary": "How Nodics handles runtime configuration and business behavior changes across clustered nodes through governed APIs and event propagation.",
    "businessSummary": "Governed Runtime Change Capability explains the business purpose, supported decisions, operational impact, and controls for the Governed Runtime Change journey.",
    "technicalSummary": "Governed Runtime Change Capability has canonical documentation records in config at data/docs-v001/records/documentation/configDocumentationComponentData.js, with functional visibility under nodics.foundation. Referenced capability modules retain their own implementation and validation authority.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "config",
    "targetPage": "nodicsDocsPageruntimeGovernedChange",
    "targetRoute": "nodicsDocsRouteruntimeGovernedChange",
    "articleComponent": "nodicsDocsComponentruntimeGovernedChange",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataruntimegovernedchange",
    "headings": [
      {
        "text": "Business context",
        "anchor": "runtimeGovernedChange-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime model",
        "anchor": "runtimeGovernedChange-2-runtime-model",
        "level": 2
      },
      {
        "text": "Lifecycle and node safety",
        "anchor": "runtimeGovernedChange-3-lifecycle-and-node-safety",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "runtimeGovernedChange-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "runtimeGovernedChange-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "runtimeGovernedChange-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "runtimeGovernedChange-7-verification",
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
        "title": "Business need, Runtime-change answer"
      },
      {
        "kind": "table",
        "title": "Runtime area, Current mechanism, What changes locally"
      },
      {
        "kind": "table",
        "title": "Lifecycle concern, Documentation requirement"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Required explanation"
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
      "configuration.runtime-behavior-management",
      "events.messaging-cluster-coordination",
      "pipeline.business-logic-orchestration"
    ],
    "sourceRepository": "nodics.ai",
    "sourcePath": "data/docs-v001/records/documentation/configDocumentationComponentData.js",
    "sourceChecksum": "07fba0e1d51410d70ad61804682e02408a941f6b3158741d5c517c8c895cbf94",
    "sourceWordCount": 1282,
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
    "wordCount": 1282,
    "sourceEvidence": [
      "../../../nodics.docs/data/manifest.json",
      "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
      "package.json",
      "src/service"
    ]
  }
};
