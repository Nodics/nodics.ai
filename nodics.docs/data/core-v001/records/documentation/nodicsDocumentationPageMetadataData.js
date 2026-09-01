/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation page metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsMetadatadocsGateway",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.gateway",
    "title": "Nodics Documentation",
    "summary": "Public documentation gateway for framework, Axis, Kickoff, and generated API contract entry points.",
    "businessSummary": "Nodics Documentation explains the business purpose, supported decisions, operational impact, and controls for the Start Here journey.",
    "technicalSummary": "Nodics Documentation records owning module nodics.docs, technical module documentation, source path docs/pages/framework/documentation-gateway.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsGateway",
    "targetRoute": "nodicsDocsRoutedocsGateway",
    "articleComponent": "nodicsDocsComponentdocsGateway",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsgateway",
    "headings": [
      {
        "text": "Choose the right entry point",
        "anchor": "docsGateway-1-choose-the-right-entry-point",
        "level": 2
      },
      {
        "text": "First setup sequence",
        "anchor": "docsGateway-2-first-setup-sequence",
        "level": 2
      },
      {
        "text": "What appears before publication",
        "anchor": "docsGateway-3-what-appears-before-publication",
        "level": 2
      },
      {
        "text": "How documentation publication works",
        "anchor": "docsGateway-4-how-documentation-publication-works",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsGateway-5-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsGateway-6-verification",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "docsGateway-7-continue",
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
        "title": "Entry point, Best reader, Use it when"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "docs.documentation-roadmap",
      "docs.documentation-publishing-model"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/documentation-gateway.md",
    "sourceChecksum": "0e008661ea8abe0fb19248bdf60ec06bedbe83f6546558fdf840acbc55c6ee11",
    "sourceWordCount": 921,
    "audience": [
      "business",
      "architect",
      "administrator",
      "developer",
      "operator",
      "qa"
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
    "active": true
  },
  "record1": {
    "code": "nodicsDocsMetadataframeworkOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.what-is-nodics",
    "title": "What is Nodics?",
    "summary": "Introductory definition of Nodics, its enterprise purpose, and the first mental model for business, developer, and operator readers.",
    "businessSummary": "What is Nodics? explains the business purpose, supported decisions, operational impact, and controls for the Framework Value and Adoption journey.",
    "technicalSummary": "What is Nodics? records owning module nodics.docs, technical module documentation, source path docs/pages/framework/what-is-nodics.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageframeworkOverview",
    "targetRoute": "nodicsDocsRouteframeworkOverview",
    "articleComponent": "nodicsDocsComponentframeworkOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkoverview",
    "headings": [
      {
        "text": "Business definition",
        "anchor": "frameworkOverview-1-business-definition",
        "level": 2
      },
      {
        "text": "Technical definition",
        "anchor": "frameworkOverview-2-technical-definition",
        "level": 2
      },
      {
        "text": "What teams can build",
        "anchor": "frameworkOverview-3-what-teams-can-build",
        "level": 2
      },
      {
        "text": "Where to continue",
        "anchor": "frameworkOverview-4-where-to-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkOverview-5-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkOverview-6-verification",
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
        "title": "Business question, Nodics answer"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.why-nodics-exists",
      "framework.how-nodics-works",
      "framework.adoption-and-first-journey",
      "framework.modular-architecture",
      "framework.local-quick-start",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/what-is-nodics.md",
    "sourceChecksum": "99e075a8f2ba041e252dcd30c8e32be2028193caa2c248fd3ba3d6c817265f11",
    "sourceWordCount": 598,
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
    "active": true
  },
  "record2": {
    "code": "nodicsDocsMetadataframeworkWhyNodicsExists",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.why-nodics-exists",
    "title": "Why Nodics Exists",
    "summary": "Industry problems, business value, and why Nodics turns fast delivery into governed enterprise software.",
    "businessSummary": "Why Nodics Exists explains the business purpose, supported decisions, operational impact, and controls for the Framework Value and Adoption journey.",
    "technicalSummary": "Why Nodics Exists records owning module nodics.docs, technical module documentation, source path docs/pages/framework/why-nodics-exists.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageframeworkWhyNodicsExists",
    "targetRoute": "nodicsDocsRouteframeworkWhyNodicsExists",
    "articleComponent": "nodicsDocsComponentframeworkWhyNodicsExists",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkwhynodicsexists",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "frameworkWhyNodicsExists-1-business-problem",
        "level": 2
      },
      {
        "text": "From fast MVP to durable platform",
        "anchor": "frameworkWhyNodicsExists-2-from-fast-mvp-to-durable-platform",
        "level": 2
      },
      {
        "text": "Why a business should care",
        "anchor": "frameworkWhyNodicsExists-3-why-a-business-should-care",
        "level": 2
      },
      {
        "text": "What this means for developers",
        "anchor": "frameworkWhyNodicsExists-4-what-this-means-for-developers",
        "level": 2
      },
      {
        "text": "Operator and governance impact",
        "anchor": "frameworkWhyNodicsExists-5-operator-and-governance-impact",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkWhyNodicsExists-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkWhyNodicsExists-7-verification",
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
        "title": "Enterprise pressure, Common failure, Nodics response"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.how-nodics-works",
      "framework.adoption-and-first-journey",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/why-nodics-exists.md",
    "sourceChecksum": "e2e32c987e05fa836308ba587a62c2871d1cbc2d20a09e7d756f80ec70be8446",
    "sourceWordCount": 941,
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
    "active": true
  },
  "record3": {
    "code": "nodicsDocsMetadataframeworkHowNodicsWorks",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.how-nodics-works",
    "title": "How Nodics Works",
    "summary": "Mental model for framework modules, customer projects, Axis, public applications, runtime ownership, and customization.",
    "businessSummary": "How Nodics Works explains the business purpose, supported decisions, operational impact, and controls for the Framework Value and Adoption journey.",
    "technicalSummary": "How Nodics Works records owning module nodics.docs, technical module documentation, source path docs/pages/framework/how-nodics-works.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageframeworkHowNodicsWorks",
    "targetRoute": "nodicsDocsRouteframeworkHowNodicsWorks",
    "articleComponent": "nodicsDocsComponentframeworkHowNodicsWorks",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkhownodicsworks",
    "headings": [
      {
        "text": "Mental model",
        "anchor": "frameworkHowNodicsWorks-1-mental-model",
        "level": 2
      },
      {
        "text": "Runtime flow",
        "anchor": "frameworkHowNodicsWorks-2-runtime-flow",
        "level": 2
      },
      {
        "text": "Backend-driven experience",
        "anchor": "frameworkHowNodicsWorks-3-backend-driven-experience",
        "level": 2
      },
      {
        "text": "Customization model",
        "anchor": "frameworkHowNodicsWorks-4-customization-model",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "frameworkHowNodicsWorks-5-operator-view",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkHowNodicsWorks-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkHowNodicsWorks-7-verification",
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
        "title": "Layer, What it does, Reader impact"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.why-nodics-exists",
      "framework.adoption-and-first-journey",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/how-nodics-works.md",
    "sourceChecksum": "83c6cddaeb7ef6dcaa2f798b391671fd909f404f399d1751d2a9f1785862809e",
    "sourceWordCount": 778,
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
    "active": true
  },
  "record4": {
    "code": "nodicsDocsMetadataframeworkAdoptionAndFirstJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.adoption-and-first-journey",
    "title": "Adoption and First Journey",
    "summary": "The first business, developer, and operator path through setup, capability registration, imports, publishing, and browser verification.",
    "businessSummary": "Adoption and First Journey explains the business purpose, supported decisions, operational impact, and controls for the Framework Value and Adoption journey.",
    "technicalSummary": "Adoption and First Journey records owning module nodics.docs, technical module documentation, source path docs/pages/framework/adoption-and-first-journey.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageframeworkAdoptionAndFirstJourney",
    "targetRoute": "nodicsDocsRouteframeworkAdoptionAndFirstJourney",
    "articleComponent": "nodicsDocsComponentframeworkAdoptionAndFirstJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkadoptionandfirstjourney",
    "headings": [
      {
        "text": "First reader sequence",
        "anchor": "frameworkAdoptionAndFirstJourney-1-first-reader-sequence",
        "level": 2
      },
      {
        "text": "Business adoption journey",
        "anchor": "frameworkAdoptionAndFirstJourney-2-business-adoption-journey",
        "level": 2
      },
      {
        "text": "Developer adoption journey",
        "anchor": "frameworkAdoptionAndFirstJourney-3-developer-adoption-journey",
        "level": 2
      },
      {
        "text": "Operator adoption journey",
        "anchor": "frameworkAdoptionAndFirstJourney-4-operator-adoption-journey",
        "level": 2
      },
      {
        "text": "Documentation entry points",
        "anchor": "frameworkAdoptionAndFirstJourney-5-documentation-entry-points",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkAdoptionAndFirstJourney-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkAdoptionAndFirstJourney-7-verification",
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
        "title": "Step, Reader action, Why it matters"
      },
      {
        "kind": "table",
        "title": "Entry point, Best for, Continue to"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.why-nodics-exists",
      "framework.how-nodics-works",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/adoption-and-first-journey.md",
    "sourceChecksum": "783f2b3b93690a11f6c1fdf793a3413ae1c32247620cb3449b2bbe8b67be8ea0",
    "sourceWordCount": 868,
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
    "active": true
  },
  "record5": {
    "code": "nodicsDocsMetadatadocsDocumentationRoadmap",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.documentation-roadmap",
    "title": "Documentation Roadmap",
    "summary": "How the Nodics documentation product is organized and how readers choose the right path through the enterprise hierarchy.",
    "businessSummary": "Documentation Roadmap explains the business purpose, supported decisions, operational impact, and controls for the Reader Journey and Coverage Map journey.",
    "technicalSummary": "Documentation Roadmap records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/documentation-roadmap.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsDocumentationRoadmap",
    "targetRoute": "nodicsDocsRoutedocsDocumentationRoadmap",
    "articleComponent": "nodicsDocsComponentdocsDocumentationRoadmap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationroadmap",
    "headings": [
      {
        "text": "Business context",
        "anchor": "docsDocumentationRoadmap-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "docsDocumentationRoadmap-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "docsDocumentationRoadmap-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "docsDocumentationRoadmap-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "docsDocumentationRoadmap-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "README segregation contract",
        "anchor": "docsDocumentationRoadmap-6-readme-segregation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsDocumentationRoadmap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsDocumentationRoadmap-8-verification",
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
      },
      {
        "kind": "table",
        "title": "README section, Required purpose, What must move to real docs"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "docs.documentation-principles",
      "docs.reader-journey-and-coverage",
      "docs.documentation-publishing-model",
      "docs.overview",
      "framework.capability-documentation-maturity-pattern"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/documentation-roadmap.md",
    "sourceChecksum": "3c22d41779e0c6d02a4b030705e083176203bbd674295c9f1827ea168aaee77c",
    "sourceWordCount": 1360,
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
    "active": true
  },
  "record6": {
    "code": "nodicsDocsMetadatadocsDocumentationPrinciples",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.documentation-principles",
    "title": "Documentation Principles",
    "summary": "Framework-level documentation rules for README thinness, detailed docs depth, visual evidence, customization, publishing, and access.",
    "businessSummary": "Documentation Principles explains the business purpose, supported decisions, operational impact, and controls for the Reader Journey and Coverage Map journey.",
    "technicalSummary": "Documentation Principles records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/documentation-principles.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsDocumentationPrinciples",
    "targetRoute": "nodicsDocsRoutedocsDocumentationPrinciples",
    "articleComponent": "nodicsDocsComponentdocsDocumentationPrinciples",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationprinciples",
    "headings": [
      {
        "text": "README and real documentation split",
        "anchor": "docsDocumentationPrinciples-1-readme-and-real-documentation-split",
        "level": 2
      },
      {
        "text": "Generation preservation contract",
        "anchor": "docsDocumentationPrinciples-2-generation-preservation-contract",
        "level": 2
      },
      {
        "text": "Required topic depth",
        "anchor": "docsDocumentationPrinciples-3-required-topic-depth",
        "level": 2
      },
      {
        "text": "Visual contract",
        "anchor": "docsDocumentationPrinciples-4-visual-contract",
        "level": 2
      },
      {
        "text": "Configuration and customization principle",
        "anchor": "docsDocumentationPrinciples-5-configuration-and-customization-principle",
        "level": 2
      },
      {
        "text": "Publishing and access principle",
        "anchor": "docsDocumentationPrinciples-6-publishing-and-access-principle",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsDocumentationPrinciples-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsDocumentationPrinciples-8-verification",
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
        "title": "Location, Purpose, Detail level"
      },
      {
        "kind": "table",
        "title": "Area, Authority, Generator behavior"
      },
      {
        "kind": "table",
        "title": "Governance area, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "docs.documentation-roadmap",
      "docs.reader-journey-and-coverage",
      "docs.documentation-publishing-model",
      "framework.what-is-nodics"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/documentation-principles.md",
    "sourceChecksum": "c8ff2cdd269fad5d6210d685249b09c31a54fae662c6a123f7718194d304afb0",
    "sourceWordCount": 920,
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
    "active": true
  },
  "record7": {
    "code": "nodicsDocsMetadatadocsReaderJourneyAndCoverage",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.reader-journey-and-coverage",
    "title": "Reader Journey and Coverage",
    "summary": "How business users, developers, operators, QA owners, administrators, and AI tools navigate capability documentation.",
    "businessSummary": "Reader Journey and Coverage explains the business purpose, supported decisions, operational impact, and controls for the Reader Journey and Coverage Map journey.",
    "technicalSummary": "Reader Journey and Coverage records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/reader-journey-and-coverage.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsReaderJourneyAndCoverage",
    "targetRoute": "nodicsDocsRoutedocsReaderJourneyAndCoverage",
    "articleComponent": "nodicsDocsComponentdocsReaderJourneyAndCoverage",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsreaderjourneyandcoverage",
    "headings": [
      {
        "text": "Audience paths",
        "anchor": "docsReaderJourneyAndCoverage-1-audience-paths",
        "level": 2
      },
      {
        "text": "Coverage map",
        "anchor": "docsReaderJourneyAndCoverage-2-coverage-map",
        "level": 2
      },
      {
        "text": "Topic composition",
        "anchor": "docsReaderJourneyAndCoverage-3-topic-composition",
        "level": 2
      },
      {
        "text": "Navigation behavior",
        "anchor": "docsReaderJourneyAndCoverage-4-navigation-behavior",
        "level": 2
      },
      {
        "text": "Business and technical balance",
        "anchor": "docsReaderJourneyAndCoverage-5-business-and-technical-balance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsReaderJourneyAndCoverage-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsReaderJourneyAndCoverage-7-verification",
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
        "title": "Reader, First question, Page must provide"
      },
      {
        "kind": "table",
        "title": "Perspective, Required content"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "docs.documentation-roadmap",
      "docs.documentation-principles",
      "docs.documentation-publishing-model",
      "framework.what-is-nodics"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/reader-journey-and-coverage.md",
    "sourceChecksum": "096514c89141a83cb82833f4e7c2209bf3136e55cdf80431575e475f19440c3a",
    "sourceWordCount": 734,
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
    "active": true
  },
  "record8": {
    "code": "nodicsDocsMetadatadocsDocumentationPublishingModel",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.documentation-publishing-model",
    "title": "Documentation Publishing Model",
    "summary": "How documentation source becomes content catalog data, Staged records, approval tasks, Online pages, and public or authenticated delivery.",
    "businessSummary": "Documentation Publishing Model explains the business purpose, supported decisions, operational impact, and controls for the Reader Journey and Coverage Map journey.",
    "technicalSummary": "Documentation Publishing Model records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/documentation-publishing-model.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsDocumentationPublishingModel",
    "targetRoute": "nodicsDocsRoutedocsDocumentationPublishingModel",
    "articleComponent": "nodicsDocsComponentdocsDocumentationPublishingModel",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationpublishingmodel",
    "headings": [
      {
        "text": "Source to Online flow",
        "anchor": "docsDocumentationPublishingModel-1-source-to-online-flow",
        "level": 2
      },
      {
        "text": "Content catalog authority",
        "anchor": "docsDocumentationPublishingModel-2-content-catalog-authority",
        "level": 2
      },
      {
        "text": "Access and workflow",
        "anchor": "docsDocumentationPublishingModel-3-access-and-workflow",
        "level": 2
      },
      {
        "text": "Axis and public experience",
        "anchor": "docsDocumentationPublishingModel-4-axis-and-public-experience",
        "level": 2
      },
      {
        "text": "Developer and operator responsibilities",
        "anchor": "docsDocumentationPublishingModel-5-developer-and-operator-responsibilities",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsDocumentationPublishingModel-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsDocumentationPublishingModel-7-verification",
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
        "title": "Record changed, Workflow impact, Verification"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "docs.documentation-roadmap",
      "docs.documentation-principles",
      "docs.reader-journey-and-coverage",
      "framework.what-is-nodics"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/documentation-publishing-model.md",
    "sourceChecksum": "6d6bfe5300a12a8df6f5a99c5cbbd2cc7f7e69318ee3437b53512254948b9ea8",
    "sourceWordCount": 922,
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
    "active": true
  },
  "record9": {
    "code": "nodicsDocsMetadataframeworkModularArchitecture",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.modular-architecture",
    "title": "Modular architecture and ownership",
    "summary": "How functional modules, technical modules, runtime servers, and customer projects fit together.",
    "businessSummary": "Modular architecture and ownership explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Modular architecture and ownership records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/modular-architecture.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkModularArchitecture",
    "targetRoute": "nodicsDocsRouteframeworkModularArchitecture",
    "articleComponent": "nodicsDocsComponentframeworkModularArchitecture",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkmodulararchitecture",
    "headings": [
      {
        "text": "Ownership model",
        "anchor": "frameworkModularArchitecture-1-ownership-model",
        "level": 2
      },
      {
        "text": "What to read next",
        "anchor": "frameworkModularArchitecture-2-what-to-read-next",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkModularArchitecture-3-business-perspective",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "frameworkModularArchitecture-4-technical-perspective",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkModularArchitecture-5-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkModularArchitecture-6-verification",
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
        "title": "Layer, What it owns, Reader impact"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "table",
      "diagram"
    ],
    "relatedPages": [
      "framework.runtime-server-composition",
      "framework.module-loading-service-precedence",
      "framework.architecture-decision-guide",
      "foundation.overview",
      "framework.customization-guide",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/modular-architecture.md",
    "sourceChecksum": "8918b924ad914c2ef5fe04fb0da6ca3c9349b73f0539c4ffd9987298569ba2e0",
    "sourceWordCount": 513,
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
    "active": true
  },
  "record10": {
    "code": "nodicsDocsMetadataframeworkRuntimeServerComposition",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.runtime-server-composition",
    "title": "Runtime Server Composition",
    "summary": "How project topology composes framework modules into Platform, WCMS, Process, and other runtime servers.",
    "businessSummary": "Runtime Server Composition explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Runtime Server Composition records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/runtime-server-composition.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/runtime-server-composition.md",
    "sourceChecksum": "62c519ad4061a1c6293ab79e456c00e42081ef2f209e24c1ae9560a336eb9be1",
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
    "active": true
  },
  "record11": {
    "code": "nodicsDocsMetadataframeworkModuleLoadingServicePrecedence",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.module-loading-service-precedence",
    "title": "Module Loading and Service Precedence",
    "summary": "How runtime loading order, service overrides, and project layers decide which implementation is active.",
    "businessSummary": "Module Loading and Service Precedence explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Module Loading and Service Precedence records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/module-loading-and-service-precedence.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/module-loading-and-service-precedence.md",
    "sourceChecksum": "150b656348c44e3e1a9e1bdb0efe196e1b50e0ba7986cf367dc6c8873a270909",
    "sourceWordCount": 681,
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
    "active": true
  },
  "record12": {
    "code": "nodicsDocsMetadataframeworkArchitectureDecisionGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.architecture-decision-guide",
    "title": "Architecture Decision Guide",
    "summary": "Decision path for choosing framework, project, content, provider, service, pipeline, schema, route, or renderer ownership.",
    "businessSummary": "Architecture Decision Guide explains the business purpose, supported decisions, operational impact, and controls for the Modularity and Ownership journey.",
    "technicalSummary": "Architecture Decision Guide records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/architecture-decision-guide.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkArchitectureDecisionGuide",
    "targetRoute": "nodicsDocsRouteframeworkArchitectureDecisionGuide",
    "articleComponent": "nodicsDocsComponentframeworkArchitectureDecisionGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkarchitecturedecisionguide",
    "headings": [
      {
        "text": "Decision path",
        "anchor": "frameworkArchitectureDecisionGuide-1-decision-path",
        "level": 2
      },
      {
        "text": "Ownership table",
        "anchor": "frameworkArchitectureDecisionGuide-2-ownership-table",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkArchitectureDecisionGuide-3-business-perspective",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkArchitectureDecisionGuide-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkArchitectureDecisionGuide-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkArchitectureDecisionGuide-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkArchitectureDecisionGuide-7-verification",
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
        "title": "Change type, Preferred owner, Avoid"
      }
    ],
    "visualRequirements": [
      "decision-tree",
      "table"
    ],
    "relatedPages": [
      "foundation.overview",
      "framework.customization-guide",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/architecture-decision-guide.md",
    "sourceChecksum": "749c570f553b85eb967357625a2d526e8f18f15e95ec26db68e5b125de574970",
    "sourceWordCount": 597,
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
    "active": true
  },
  "record13": {
    "code": "nodicsDocsMetadataplatformModuleRegistry",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.module-registry",
    "title": "Functional module registry",
    "summary": "Durable project registration and runtime observation rules.",
    "businessSummary": "Functional module registry explains the business purpose, supported decisions, operational impact, and controls for the Functional Module Registry journey.",
    "technicalSummary": "Functional module registry records owning module nodics.platform, technical module backoffice, source path docs/pages/nodics.platform/module-registry.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageplatformModuleRegistry",
    "targetRoute": "nodicsDocsRouteplatformModuleRegistry",
    "articleComponent": "nodicsDocsComponentplatformModuleRegistry",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformmoduleregistry",
    "headings": [
      {
        "text": "Why the registry exists",
        "anchor": "platformModuleRegistry-1-why-the-registry-exists",
        "level": 2
      },
      {
        "text": "Lifecycle states",
        "anchor": "platformModuleRegistry-2-lifecycle-states",
        "level": 2
      },
      {
        "text": "Mandatory versus optional modules",
        "anchor": "platformModuleRegistry-3-mandatory-versus-optional-modules",
        "level": 2
      },
      {
        "text": "Business value",
        "anchor": "platformModuleRegistry-4-business-value",
        "level": 2
      },
      {
        "text": "Business example: deciding to enable Process automation",
        "anchor": "platformModuleRegistry-5-business-example-deciding-to-enable-process-automation",
        "level": 2
      },
      {
        "text": "Developer model",
        "anchor": "platformModuleRegistry-6-developer-model",
        "level": 2
      },
      {
        "text": "API and UI contract expectations",
        "anchor": "platformModuleRegistry-7-api-and-ui-contract-expectations",
        "level": 2
      },
      {
        "text": "DevOps and operator model",
        "anchor": "platformModuleRegistry-8-devops-and-operator-model",
        "level": 2
      },
      {
        "text": "What the registry must not do",
        "anchor": "platformModuleRegistry-9-what-the-registry-must-not-do",
        "level": 2
      },
      {
        "text": "Security and audit expectations",
        "anchor": "platformModuleRegistry-10-security-and-audit-expectations",
        "level": 2
      },
      {
        "text": "Verification checklist",
        "anchor": "platformModuleRegistry-11-verification-checklist",
        "level": 2
      },
      {
        "text": "Acceptance scenarios",
        "anchor": "platformModuleRegistry-12-acceptance-scenarios",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformModuleRegistry-13-common-mistakes",
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
        "title": "State, Beginner meaning, Axis action"
      },
      {
        "kind": "table",
        "title": "Module type, Example, User lifecycle"
      },
      {
        "kind": "table",
        "title": "Scenario, Expected result"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "source-map-table",
      "code-example"
    ],
    "relatedPages": [
      "platform.overview",
      "foundation.overview",
      "framework.local-quick-start"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.platform/module-registry.md",
    "sourceChecksum": "17b8b9c31521ce8f127a7ada88c305ffbd881d5dc88830cecbad2ff35fb8c2cb",
    "sourceWordCount": 1513,
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
    "active": true
  },
  "record14": {
    "code": "nodicsDocsMetadatafoundationOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.overview",
    "title": "Foundation overview",
    "summary": "Beginner, developer, and operations guide to the Foundation runtime, request path, cache, events, configuration, and quality rules.",
    "businessSummary": "Foundation overview explains the business purpose, supported decisions, operational impact, and controls for the Runtime Foundation journey.",
    "technicalSummary": "Foundation overview records owning module nodics.foundation, technical module nSetup, source path docs/pages/nodics.foundation/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPagefoundationOverview",
    "targetRoute": "nodicsDocsRoutefoundationOverview",
    "articleComponent": "nodicsDocsComponentfoundationOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationoverview",
    "headings": [
      {
        "text": "Business purpose",
        "anchor": "foundationOverview-1-business-purpose",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "foundationOverview-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "What Core owns",
        "anchor": "foundationOverview-3-what-core-owns",
        "level": 2
      },
      {
        "text": "Runtime loading model",
        "anchor": "foundationOverview-4-runtime-loading-model",
        "level": 2
      },
      {
        "text": "Request processing model",
        "anchor": "foundationOverview-5-request-processing-model",
        "level": 2
      },
      {
        "text": "Cache, search, events, and logging",
        "anchor": "foundationOverview-6-cache-search-events-and-logging",
        "level": 2
      },
      {
        "text": "Configuration-first rule",
        "anchor": "foundationOverview-7-configuration-first-rule",
        "level": 2
      },
      {
        "text": "Developer workflow",
        "anchor": "foundationOverview-8-developer-workflow",
        "level": 2
      },
      {
        "text": "Axis visibility",
        "anchor": "foundationOverview-9-axis-visibility",
        "level": 2
      },
      {
        "text": "DevOps and QA checks",
        "anchor": "foundationOverview-10-devops-and-qa-checks",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationOverview-11-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationOverview-12-verification",
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
        "title": "Business concern, Core contribution"
      },
      {
        "kind": "image",
        "title": "Request processing reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "Request processor flow reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "API cache flow reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "Item cache flow reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "Search cache flow reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "Event handler process reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "EMS producer reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "EMS consumer reference from the archived documentation set"
      },
      {
        "kind": "table",
        "title": "Need, Correct direction"
      }
    ],
    "visualRequirements": [
      "data-flow",
      "table",
      "screenshot",
      "code-example"
    ],
    "relatedPages": [
      "framework.modular-architecture",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/overview.md",
    "sourceChecksum": "bbf8706eef679243ca452815f50eb52693a255d0f938b56218fe16894d317997",
    "sourceWordCount": 1517,
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
    "active": true
  },
  "record15": {
    "code": "nodicsDocsMetadataapplicationsSuite",
    "product": "nodicsDocumentationProduct",
    "documentId": "applications.suite",
    "title": "Nodics Application Suite",
    "summary": "Business and technical overview of Axis, Nexus, and Kickoff as application experiences built on the Nodics Framework.",
    "businessSummary": "Nodics Application Suite explains the business purpose, supported decisions, operational impact, and controls for the Application Overview journey.",
    "technicalSummary": "Nodics Application Suite records owning module nodics.docs, technical module documentation, source path docs/pages/applications/application-suite.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageapplicationsSuite",
    "targetRoute": "nodicsDocsRouteapplicationsSuite",
    "articleComponent": "nodicsDocsComponentapplicationsSuite",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataapplicationssuite",
    "headings": [
      {
        "text": "Business perspective",
        "anchor": "applicationsSuite-1-business-perspective",
        "level": 2
      },
      {
        "text": "Application journey",
        "anchor": "applicationsSuite-2-application-journey",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "applicationsSuite-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Customization model",
        "anchor": "applicationsSuite-4-customization-model",
        "level": 2
      },
      {
        "text": "Access and publication",
        "anchor": "applicationsSuite-5-access-and-publication",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "applicationsSuite-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "applicationsSuite-7-verification",
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
        "title": "Application, Primary business purpose, Typical user, Publication visibility"
      },
      {
        "kind": "table",
        "title": "Change, Correct owner, Validation expectation"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.local-quick-start",
      "docs.overview",
      "process.visual-designer"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/application-suite.md",
    "sourceChecksum": "4658250d63e824fe65cf4f7cc228a4912f3684bf6f2e70fd9e6f65a72305741b",
    "sourceWordCount": 939,
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
    "active": true
  },
  "record16": {
    "code": "nodicsDocsMetadatasolutionsTaskExecutionEngine",
    "product": "nodicsDocumentationProduct",
    "documentId": "solutions.task-execution-engine",
    "title": "Task Execution Engine",
    "summary": "How customers use Nodics Process, Cron, Pipelines, Events, and governed runtime change to build a Task Execution Engine.",
    "businessSummary": "Task Execution Engine explains the business purpose, supported decisions, operational impact, and controls for the Solution Patterns journey.",
    "technicalSummary": "Task Execution Engine records owning module nodics.docs, technical module documentation, source path docs/pages/applications/task-execution-engine.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagesolutionsTaskExecutionEngine",
    "targetRoute": "nodicsDocsRoutesolutionsTaskExecutionEngine",
    "articleComponent": "nodicsDocsComponentsolutionsTaskExecutionEngine",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasolutionstaskexecutionengine",
    "headings": [
      {
        "text": "Business context",
        "anchor": "solutionsTaskExecutionEngine-1-business-context",
        "level": 2
      },
      {
        "text": "Execution journey",
        "anchor": "solutionsTaskExecutionEngine-2-execution-journey",
        "level": 2
      },
      {
        "text": "Capability composition",
        "anchor": "solutionsTaskExecutionEngine-3-capability-composition",
        "level": 2
      },
      {
        "text": "Configuration and extension",
        "anchor": "solutionsTaskExecutionEngine-4-configuration-and-extension",
        "level": 2
      },
      {
        "text": "Operations and troubleshooting",
        "anchor": "solutionsTaskExecutionEngine-5-operations-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "solutionsTaskExecutionEngine-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "solutionsTaskExecutionEngine-7-verification",
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
        "title": "Business question, TEE answer"
      },
      {
        "kind": "table",
        "title": "Journey step, Business view, Technical owner"
      },
      {
        "kind": "table",
        "title": "Capability, Role in TEE, Documentation link to maintain"
      },
      {
        "kind": "table",
        "title": "Extension need, Recommended approach, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "process.scheduled-automation",
      "pipeline.business-logic-orchestration",
      "events.messaging-cluster-coordination",
      "runtime.governed-change",
      "cron.node-responsibility-tee"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/task-execution-engine.md",
    "sourceChecksum": "e5a4bebc6b1224b8e0aa07d39e6ad75f8d791020145c79485ff93070323cffbd",
    "sourceWordCount": 1078,
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
    "active": true
  },
  "record17": {
    "code": "nodicsDocsMetadatasolutionsDataEngineeringAnalyticsPlatform",
    "product": "nodicsDocumentationProduct",
    "documentId": "solutions.data-engineering-analytics-platform",
    "title": "Data Engineering and Analytics Platform",
    "summary": "How customers use Nodics import, export, discovery, provider, event, pipeline, and publishing capabilities to build governed data platforms.",
    "businessSummary": "Data Engineering and Analytics Platform explains the business purpose, supported decisions, operational impact, and controls for the Solution Patterns journey.",
    "technicalSummary": "Data Engineering and Analytics Platform records owning module nodics.docs, technical module documentation, source path docs/pages/applications/data-engineering-analytics-platform.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagesolutionsDataEngineeringAnalyticsPlatform",
    "targetRoute": "nodicsDocsRoutesolutionsDataEngineeringAnalyticsPlatform",
    "articleComponent": "nodicsDocsComponentsolutionsDataEngineeringAnalyticsPlatform",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasolutionsdataengineeringanalyticsplatform",
    "headings": [
      {
        "text": "Business context",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-1-business-context",
        "level": 2
      },
      {
        "text": "Data journey",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-2-data-journey",
        "level": 2
      },
      {
        "text": "Capability composition",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-3-capability-composition",
        "level": 2
      },
      {
        "text": "Configuration and extension",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-4-configuration-and-extension",
        "level": 2
      },
      {
        "text": "Operations and troubleshooting",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-5-operations-and-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "solutionsDataEngineeringAnalyticsPlatform-7-verification",
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
        "title": "Business question, DEAP answer"
      },
      {
        "kind": "table",
        "title": "Journey step, Business view, Technical owner"
      },
      {
        "kind": "table",
        "title": "Capability, Role in DEAP, Documentation link to maintain"
      },
      {
        "kind": "table",
        "title": "Extension need, Recommended approach, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "data.import-export-migration",
      "discovery.search-indexing",
      "schema.data-modeling-management",
      "persistence.provider-data-access-layer",
      "pipeline.business-logic-orchestration",
      "events.messaging-cluster-coordination"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/data-engineering-analytics-platform.md",
    "sourceChecksum": "f7fdb519bb93877315a9f33baecc195dcf4aa825e01f1c60e742f293bd986bb8",
    "sourceWordCount": 1121,
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
    "active": true
  },
  "record18": {
    "code": "nodicsDocsMetadataacceleratorsAgoraIndustryTemplates",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.agora-industry-templates",
    "title": "Accelerators and Industry Solution Templates",
    "summary": "Agora accelerator family overview for Apparel, Electronics, and Telco customer commerce storefronts.",
    "businessSummary": "Accelerators and Industry Solution Templates explains the business purpose, supported decisions, operational impact, and controls for the Agora Accelerator Family journey.",
    "technicalSummary": "Accelerators and Industry Solution Templates records owning module nodics.docs, technical module documentation, source path docs/pages/accelerators/agora-industry-templates.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageacceleratorsAgoraIndustryTemplates",
    "targetRoute": "nodicsDocsRouteacceleratorsAgoraIndustryTemplates",
    "articleComponent": "nodicsDocsComponentacceleratorsAgoraIndustryTemplates",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoraindustrytemplates",
    "headings": [
      {
        "text": "Business perspective",
        "anchor": "acceleratorsAgoraIndustryTemplates-1-business-perspective",
        "level": 2
      },
      {
        "text": "Accelerator flow",
        "anchor": "acceleratorsAgoraIndustryTemplates-2-accelerator-flow",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "acceleratorsAgoraIndustryTemplates-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "acceleratorsAgoraIndustryTemplates-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Publication and visibility",
        "anchor": "acceleratorsAgoraIndustryTemplates-5-publication-and-visibility",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsAgoraIndustryTemplates-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsAgoraIndustryTemplates-7-verification",
        "level": 2
      },
      {
        "text": "Active Accelerator Coverage",
        "anchor": "acceleratorsAgoraIndustryTemplates-8-active-accelerator-coverage",
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
        "title": "Accelerator, Business fit, Starting journey, Expected customization"
      },
      {
        "kind": "table",
        "title": "Layer, What changes here, What should not change here"
      },
      {
        "kind": "table",
        "title": "Accelerator, Business focus, Documentation references"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "applications.suite",
      "commerce.overview",
      "commerce.cart-order",
      "wcms.overview",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/accelerators/agora-industry-templates.md",
    "sourceChecksum": "cdc44c2598230da0f12feb32391167f5ea0f03a9c74e2b3792ea619378379a4d",
    "sourceWordCount": 1090,
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
    "active": true
  },
  "record19": {
    "code": "nodicsDocsMetadataacceleratorsAgoraApparelProductDataAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.agora-apparel-product-data-authoring",
    "title": "Agora Apparel Product Data Authoring",
    "summary": "Step-by-step source-backed guide for adding Agora Apparel product, price, inventory, content, media, and search data through project release folders.",
    "businessSummary": "Agora Apparel Product Data Authoring explains the business purpose, supported decisions, operational impact, and controls for the Agora Accelerator Family journey.",
    "technicalSummary": "Agora Apparel Product Data Authoring records owning module nodics.docs, technical module documentation, source path docs/pages/accelerators/agora-apparel-product-data-authoring.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageacceleratorsAgoraApparelProductDataAuthoring",
    "targetRoute": "nodicsDocsRouteacceleratorsAgoraApparelProductDataAuthoring",
    "articleComponent": "nodicsDocsComponentacceleratorsAgoraApparelProductDataAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsagoraapparelproductdataauthoring",
    "headings": [
      {
        "text": "Business result",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-1-business-result",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-3-source-map",
        "level": 2
      },
      {
        "text": "Step-by-step authoring",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-4-step-by-step-authoring",
        "level": 2
      },
      {
        "text": "Header contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-5-header-contract",
        "level": 2
      },
      {
        "text": "Record contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-6-record-contract",
        "level": 2
      },
      {
        "text": "Product dependency map",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-7-product-dependency-map",
        "level": 2
      },
      {
        "text": "Media contract",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-8-media-contract",
        "level": 2
      },
      {
        "text": "Import execution flow",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-9-import-execution-flow",
        "level": 2
      },
      {
        "text": "Customization model",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-10-customization-model",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-11-configuration-behavior",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-12-verification",
        "level": 2
      },
      {
        "text": "Industry standards references",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-13-industry-standards-references",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-14-common-mistakes",
        "level": 2
      },
      {
        "text": "Completion checklist",
        "anchor": "acceleratorsAgoraApparelProductDataAuthoring-15-completion-checklist",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Capability, Owning module"
      },
      {
        "kind": "table",
        "title": "Data file, Purpose, Typical key"
      },
      {
        "kind": "table",
        "title": "Allowed in data, Owned by importer or runtime"
      },
      {
        "kind": "table",
        "title": "Need, Safe customization"
      },
      {
        "kind": "table",
        "title": "Configuration area, Where it belongs, What it controls"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "accelerators.agora-industry-templates",
      "data.import-export-migration",
      "catalog.product-discovery-management",
      "pricing.promotions-tax-management",
      "inventory.stock-management",
      "wcms.media-import-publication",
      "discovery.search-indexing"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/accelerators/agora-apparel-product-data-authoring.md",
    "sourceChecksum": "4b4d6133324e08e729976434251136627ffca3395ded1b50f68f1efd5e333b99",
    "sourceWordCount": 1940,
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
    "active": true
  },
  "record20": {
    "code": "nodicsDocsMetadataframeworkLocalQuickStart",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-quick-start",
    "title": "Local quick start with Kickoff and Axis",
    "summary": "Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation.",
    "businessSummary": "Local quick start with Kickoff and Axis explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Local quick start with Kickoff and Axis records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/local-quick-start.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkLocalQuickStart",
    "targetRoute": "nodicsDocsRouteframeworkLocalQuickStart",
    "articleComponent": "nodicsDocsComponentframeworkLocalQuickStart",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalquickstart",
    "headings": [
      {
        "text": "Quick path",
        "anchor": "frameworkLocalQuickStart-1-quick-path",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalQuickStart-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalQuickStart-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "frameworkLocalQuickStart-4-operator-view",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkLocalQuickStart-5-continue-with",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "frameworkLocalQuickStart-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalQuickStart-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalQuickStart-8-verification",
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
        "title": "Step, Command or action, Expected result"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.fresh-schema-setup-journey",
      "framework.local-runtime-troubleshooting",
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/local-quick-start.md",
    "sourceChecksum": "c5afa8595b3b077b1109c02327e0c6aeb3069d268d090bf3620fc5e69910f279",
    "sourceWordCount": 621,
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
    "active": true
  },
  "record21": {
    "code": "nodicsDocsMetadataframeworkFreshSchemaSetupJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.fresh-schema-setup-journey",
    "title": "Fresh Schema Setup Journey",
    "summary": "Required order for initializing Axis, registering capabilities, importing app packs, publishing Online, and verifying browsers.",
    "businessSummary": "Fresh Schema Setup Journey explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Fresh Schema Setup Journey records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/fresh-schema-setup-journey.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkFreshSchemaSetupJourney",
    "targetRoute": "nodicsDocsRouteframeworkFreshSchemaSetupJourney",
    "articleComponent": "nodicsDocsComponentframeworkFreshSchemaSetupJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkfreshschemasetupjourney",
    "headings": [
      {
        "text": "Required order",
        "anchor": "frameworkFreshSchemaSetupJourney-1-required-order",
        "level": 2
      },
      {
        "text": "Setup table",
        "anchor": "frameworkFreshSchemaSetupJourney-2-setup-table",
        "level": 2
      },
      {
        "text": "Business and user experience",
        "anchor": "frameworkFreshSchemaSetupJourney-3-business-and-user-experience",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkFreshSchemaSetupJourney-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkFreshSchemaSetupJourney-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkFreshSchemaSetupJourney-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkFreshSchemaSetupJourney-7-verification",
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
        "title": "Step, Action, Why it comes here"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/fresh-schema-setup-journey.md",
    "sourceChecksum": "d2d7d374fea70af084c2ab3b8954ffb3ef7a26212f2b0030429a15c72302ff79",
    "sourceWordCount": 596,
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
    "active": true
  },
  "record22": {
    "code": "nodicsDocsMetadataframeworkLocalRuntimeTroubleshooting",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-runtime-troubleshooting",
    "title": "Local Runtime Troubleshooting",
    "summary": "Practical troubleshooting for ports, stale topology state, schema import failures, publication state, and missing navigation.",
    "businessSummary": "Local Runtime Troubleshooting explains the business purpose, supported decisions, operational impact, and controls for the Local Workspace Setup journey.",
    "technicalSummary": "Local Runtime Troubleshooting records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/local-runtime-troubleshooting.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkLocalRuntimeTroubleshooting",
    "targetRoute": "nodicsDocsRouteframeworkLocalRuntimeTroubleshooting",
    "articleComponent": "nodicsDocsComponentframeworkLocalRuntimeTroubleshooting",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalruntimetroubleshooting",
    "headings": [
      {
        "text": "Troubleshooting flow",
        "anchor": "frameworkLocalRuntimeTroubleshooting-1-troubleshooting-flow",
        "level": 2
      },
      {
        "text": "Common local signals",
        "anchor": "frameworkLocalRuntimeTroubleshooting-2-common-local-signals",
        "level": 2
      },
      {
        "text": "Business impact",
        "anchor": "frameworkLocalRuntimeTroubleshooting-3-business-impact",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkLocalRuntimeTroubleshooting-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalRuntimeTroubleshooting-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalRuntimeTroubleshooting-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalRuntimeTroubleshooting-7-verification",
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
        "title": "Symptom, Likely cause, Action"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.what-is-nodics",
      "framework.local-verification-checklist",
      "platform.module-registry"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/local-runtime-troubleshooting.md",
    "sourceChecksum": "d29ac1144b732d06ca3b941d0abb95e4465a155d14e0464d71f2bbe2f161f784",
    "sourceWordCount": 575,
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
    "active": true
  },
  "record23": {
    "code": "nodicsDocsMetadatainstallerInstalledRuntimeApplicationBuilder",
    "product": "nodicsDocumentationProduct",
    "documentId": "installer.installed-runtime-application-builder",
    "title": "Installed Runtime Installer and Application Builder APIs",
    "summary": "Safe read-only runtime API model for installed workspace inspection, setup planning, operation catalogue, and redacted evidence.",
    "businessSummary": "Installed Runtime Installer and Application Builder APIs explains the business purpose, supported decisions, operational impact, and controls for the Installed Runtime APIs journey.",
    "technicalSummary": "Installed Runtime Installer and Application Builder APIs records owning module nodics.platform, technical module installer, source path docs/pages/installer/installed-runtime-application-builder.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "installer",
    "targetPage": "nodicsDocsPageinstallerInstalledRuntimeApplicationBuilder",
    "targetRoute": "nodicsDocsRouteinstallerInstalledRuntimeApplicationBuilder",
    "articleComponent": "nodicsDocsComponentinstallerInstalledRuntimeApplicationBuilder",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatainstallerinstalledruntimeapplicationbuilder",
    "headings": [
      {
        "text": "Business perspective",
        "anchor": "installerInstalledRuntimeApplicationBuilder-1-business-perspective",
        "level": 2
      },
      {
        "text": "Runtime flow",
        "anchor": "installerInstalledRuntimeApplicationBuilder-2-runtime-flow",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "installerInstalledRuntimeApplicationBuilder-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Configuration and customization",
        "anchor": "installerInstalledRuntimeApplicationBuilder-4-configuration-and-customization",
        "level": 2
      },
      {
        "text": "Access and publication",
        "anchor": "installerInstalledRuntimeApplicationBuilder-5-access-and-publication",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "installerInstalledRuntimeApplicationBuilder-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "installerInstalledRuntimeApplicationBuilder-7-verification",
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
        "title": "Question, Business answer, Technical owner"
      },
      {
        "kind": "table",
        "title": "Extension need, Correct approach, Required validation"
      }
    ],
    "visualRequirements": [
      "data-flow",
      "source-map-table"
    ],
    "relatedPages": [
      "framework.local-quick-start",
      "framework.local-verification-checklist",
      "platform.module-registry",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/installer/installed-runtime-application-builder.md",
    "sourceChecksum": "2028758435ca7c43fc56859411303d7138152e800457120b2b150ec588d55fbc",
    "sourceWordCount": 862,
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
    "active": true
  },
  "record24": {
    "code": "nodicsDocsMetadatabuilderWorkspaceGeneration",
    "product": "nodicsDocumentationProduct",
    "documentId": "builder.workspace-generation",
    "title": "Application Builder and Workspace Generation",
    "summary": "How the installed runtime exposes governed workspace discovery, readiness, setup planning, and accelerator selection for Axis-driven application building.",
    "businessSummary": "Application Builder and Workspace Generation explains the business purpose, supported decisions, operational impact, and controls for the Workspace Generation Journey journey.",
    "technicalSummary": "Application Builder and Workspace Generation records owning module nodics.platform, technical module installer, source path docs/pages/installer/workspace-generation.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "installer",
    "targetPage": "nodicsDocsPagebuilderWorkspaceGeneration",
    "targetRoute": "nodicsDocsRoutebuilderWorkspaceGeneration",
    "articleComponent": "nodicsDocsComponentbuilderWorkspaceGeneration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatabuilderworkspacegeneration",
    "headings": [
      {
        "text": "Business context",
        "anchor": "builderWorkspaceGeneration-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "builderWorkspaceGeneration-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "builderWorkspaceGeneration-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "builderWorkspaceGeneration-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "builderWorkspaceGeneration-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "builderWorkspaceGeneration-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "builderWorkspaceGeneration-7-verification",
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
      "installer.installed-runtime-application-builder",
      "framework.local-quick-start",
      "accelerators.agora-industry-templates"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/installer/workspace-generation.md",
    "sourceChecksum": "a2c49f72be7387cb8ebae3c3972b79c41f5ea99e5cd325606f0f3f4710c949d1",
    "sourceWordCount": 1112,
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
    "active": true
  },
  "record25": {
    "code": "nodicsDocsMetadataprocessVisualDesigner",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.visual-designer",
    "title": "Visual Workflow Designer Contract",
    "summary": "Describe the backend-owned graph contract, Axis editor projection, and validation workflow for the visual designer.",
    "businessSummary": "Visual Workflow Designer Contract explains the business purpose, supported decisions, operational impact, and controls for the Visual Workflow Designer journey.",
    "technicalSummary": "Visual Workflow Designer Contract records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/visual-designer.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessVisualDesigner",
    "targetRoute": "nodicsDocsRouteprocessVisualDesigner",
    "articleComponent": "nodicsDocsComponentprocessVisualDesigner",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessvisualdesigner",
    "headings": [
      {
        "text": "Ownership model",
        "anchor": "processVisualDesigner-1-ownership-model",
        "level": 2
      },
      {
        "text": "MVP graph contract",
        "anchor": "processVisualDesigner-2-mvp-graph-contract",
        "level": 2
      },
      {
        "text": "What the browser may do",
        "anchor": "processVisualDesigner-3-what-the-browser-may-do",
        "level": 2
      },
      {
        "text": "How a beginner should use the first designer",
        "anchor": "processVisualDesigner-4-how-a-beginner-should-use-the-first-designer",
        "level": 2
      },
      {
        "text": "Designer library evolution",
        "anchor": "processVisualDesigner-5-designer-library-evolution",
        "level": 2
      },
      {
        "text": "Designer acceptance",
        "anchor": "processVisualDesigner-6-designer-acceptance",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processVisualDesigner-7-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processVisualDesigner-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processVisualDesigner-9-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processVisualDesigner-10-customization-and-extension",
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
        "title": "Question, Why it matters, Where the answer belongs"
      }
    ],
    "visualRequirements": [
      "architecture-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.first-human-task",
      "process.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/visual-designer.md",
    "sourceChecksum": "9e8ca476ba60644063e982e3ac448a60bb9da92bfd425c5dbe7684ab2dedd84b",
    "sourceWordCount": 818,
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
    "active": true
  },
  "record26": {
    "code": "nodicsDocsMetadataaxisBusinessCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "axis.business-customization",
    "title": "Business Customization in Axis",
    "summary": "How Axis lets authorized users manage navigation, content areas, documentation pages, runtime configuration, and capability-specific business data.",
    "businessSummary": "Business Customization in Axis explains the business purpose, supported decisions, operational impact, and controls for the Axis Customization Workspace journey.",
    "technicalSummary": "Business Customization in Axis records owning module nodics.platform, technical module backoffice, source path docs/pages/applications/axis-business-customization.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageaxisBusinessCustomization",
    "targetRoute": "nodicsDocsRouteaxisBusinessCustomization",
    "articleComponent": "nodicsDocsComponentaxisBusinessCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataaxisbusinesscustomization",
    "headings": [
      {
        "text": "Business context",
        "anchor": "axisBusinessCustomization-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "axisBusinessCustomization-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "axisBusinessCustomization-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "axisBusinessCustomization-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "axisBusinessCustomization-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "axisBusinessCustomization-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "axisBusinessCustomization-7-verification",
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
      "docs.overview",
      "process.visual-designer",
      "wcms.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/axis-business-customization.md",
    "sourceChecksum": "61d42e4d8b073baaeb0b6eeb10984fc09f2b8cce88b03013dafece801b8fa9c6",
    "sourceWordCount": 1107,
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
    "active": true
  },
  "record27": {
    "code": "nodicsDocsMetadataplatformOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.overview",
    "title": "Platform overview",
    "summary": "How Platform, Profile, BackOffice, authentication, authorization, Axis backend content, and module governance fit together.",
    "businessSummary": "Platform overview explains the business purpose, supported decisions, operational impact, and controls for the Platform and Profile Foundations journey.",
    "technicalSummary": "Platform overview records owning module nodics.platform, technical module profile, source path docs/pages/nodics.platform/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "profile",
    "targetPage": "nodicsDocsPageplatformOverview",
    "targetRoute": "nodicsDocsRouteplatformOverview",
    "articleComponent": "nodicsDocsComponentplatformOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformoverview",
    "headings": [
      {
        "text": "Business purpose",
        "anchor": "platformOverview-1-business-purpose",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "platformOverview-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Authentication and authorization flow",
        "anchor": "platformOverview-3-authentication-and-authorization-flow",
        "level": 2
      },
      {
        "text": "What Platform owns",
        "anchor": "platformOverview-4-what-platform-owns",
        "level": 2
      },
      {
        "text": "Runtime loading and customization",
        "anchor": "platformOverview-5-runtime-loading-and-customization",
        "level": 2
      },
      {
        "text": "BackOffice and Axis boundary",
        "anchor": "platformOverview-6-backoffice-and-axis-boundary",
        "level": 2
      },
      {
        "text": "Developer model",
        "anchor": "platformOverview-7-developer-model",
        "level": 2
      },
      {
        "text": "DevOps and security model",
        "anchor": "platformOverview-8-devops-and-security-model",
        "level": 2
      },
      {
        "text": "QA acceptance checklist",
        "anchor": "platformOverview-9-qa-acceptance-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformOverview-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "platformOverview-11-verification",
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
        "kind": "image",
        "title": "Authentication flow reference from the archived documentation set"
      },
      {
        "kind": "image",
        "title": "Authorization flow reference from the archived documentation set"
      },
      {
        "kind": "table",
        "title": "Concern, Owner"
      },
      {
        "kind": "table",
        "title": "Need, Likely owner"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "screenshot",
      "code-example"
    ],
    "relatedPages": [
      "platform.module-registry",
      "framework.modular-architecture"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.platform/overview.md",
    "sourceChecksum": "c9a98c3ee7b86b2d41a8a844d5f1e7d0414f7520459f70f877c41fb8243de83d",
    "sourceWordCount": 1173,
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
    "active": true
  },
  "record28": {
    "code": "nodicsDocsMetadatasecurityIdentityAccessGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "security.identity-access-governance",
    "title": "Security, Identity, and Access Governance",
    "summary": "Authentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities.",
    "businessSummary": "Security, Identity, and Access Governance explains the business purpose, supported decisions, operational impact, and controls for the Identity and Access Governance journey.",
    "technicalSummary": "Security, Identity, and Access Governance records owning module nodics.platform, technical module profile, source path docs/pages/nodics.platform/security-identity-access.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "profile",
    "targetPage": "nodicsDocsPagesecurityIdentityAccessGovernance",
    "targetRoute": "nodicsDocsRoutesecurityIdentityAccessGovernance",
    "articleComponent": "nodicsDocsComponentsecurityIdentityAccessGovernance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasecurityidentityaccessgovernance",
    "headings": [
      {
        "text": "Business context",
        "anchor": "securityIdentityAccessGovernance-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "securityIdentityAccessGovernance-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "securityIdentityAccessGovernance-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "securityIdentityAccessGovernance-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "securityIdentityAccessGovernance-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "securityIdentityAccessGovernance-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "securityIdentityAccessGovernance-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "securityIdentityAccessGovernance-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Access topic, Source records, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "platform.overview",
      "axis.business-customization",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.platform/security-identity-access.md",
    "sourceChecksum": "08bdfbebd5f31af01a69e4fc92a07d4c5a00bdaab4473a40a99480b10102ee04",
    "sourceWordCount": 1395,
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
    "active": true
  },
  "record29": {
    "code": "nodicsDocsMetadataconfigurationRuntimeBehaviorManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "configuration.runtime-behavior-management",
    "title": "Application Configuration and Runtime Behavior Management",
    "summary": "How configuration layers, provider choices, runtime settings, and project overrides change Nodics behavior safely.",
    "businessSummary": "Application Configuration and Runtime Behavior Management explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Application Configuration and Runtime Behavior Management records owning module nodics.foundation, technical module nConfig, source path docs/pages/nodics.foundation/runtime-configuration.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nConfig",
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
        "text": "Operations and governance",
        "anchor": "configurationRuntimeBehaviorManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "configurationRuntimeBehaviorManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "configurationRuntimeBehaviorManagement-7-verification",
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
      "foundation.overview",
      "configuration.framework-startup-lifecycle",
      "cache.runtime-state-management",
      "foundation.error-handling-status-codes",
      "routing.api-governance",
      "runtime.governed-change"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/runtime-configuration.md",
    "sourceChecksum": "2169965597707258cb2dd01e6f6204076fb581df3d070d5fe1fd0768423aad36",
    "sourceWordCount": 1137,
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
    "active": true
  },
  "record30": {
    "code": "nodicsDocsMetadataconfigurationFrameworkStartupLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "configuration.framework-startup-lifecycle",
    "title": "Framework Startup Lifecycle",
    "summary": "Step-by-step startup path from runtime launch through nConfig module discovery, configuration loading, lifecycle hooks, init data import, identity bootstrap, and server readiness.",
    "businessSummary": "Framework Startup Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Framework Startup Lifecycle records owning module nodics.foundation, technical module nConfig, source path docs/pages/nodics.foundation/framework-startup-lifecycle.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nConfig",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/framework-startup-lifecycle.md",
    "sourceChecksum": "0a00af7e356086166a86b88e1e5c6ec7f6fcd5cf55064248150ec02b7f3f2bd1",
    "sourceWordCount": 3140,
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
    "active": true
  },
  "record31": {
    "code": "nodicsDocsMetadataroutingApiGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "routing.api-governance",
    "title": "Routing and API Governance",
    "summary": "How Nodics owns route metadata, generated CRUD routes, security, permissions, request context, and runtime API behavior.",
    "businessSummary": "Routing and API Governance explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Routing and API Governance records owning module nodics.foundation, technical module nRouter, source path docs/pages/nodics.foundation/routing-api-governance.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nRouter",
    "targetPage": "nodicsDocsPageroutingApiGovernance",
    "targetRoute": "nodicsDocsRouteroutingApiGovernance",
    "articleComponent": "nodicsDocsComponentroutingApiGovernance",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataroutingapigovernance",
    "headings": [
      {
        "text": "Business context",
        "anchor": "routingApiGovernance-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "routingApiGovernance-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "routingApiGovernance-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "routingApiGovernance-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "routingApiGovernance-5-related-developer-guides",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "routingApiGovernance-6-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "routingApiGovernance-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "routingApiGovernance-8-verification",
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
        "title": "Business question, Routing answer"
      },
      {
        "kind": "table",
        "title": "Responsibility, Owner, Notes"
      },
      {
        "kind": "table",
        "title": "Route detail, What to document, Verification signal"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
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
      "runtime.governed-change",
      "security.identity-access-governance",
      "routing.api-request-lifecycle",
      "foundation.error-handling-status-codes",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/routing-api-governance.md",
    "sourceChecksum": "08ce35501fa66df1945c78dd596eac2363b56df1efdc431412fa0b5d65f106e0",
    "sourceWordCount": 1374,
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
    "active": true
  },
  "record32": {
    "code": "nodicsDocsMetadataroutingApiRequestLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "routing.api-request-lifecycle",
    "title": "API Request Lifecycle and Handler Pipeline",
    "summary": "How each Nodics HTTP request moves from Express route binding through request context, exposure checks, authentication branches, cache lookup, controller dispatch, response handlers, and safe customization.",
    "businessSummary": "API Request Lifecycle and Handler Pipeline explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "API Request Lifecycle and Handler Pipeline records owning module nodics.foundation, technical module nRouter, source path docs/pages/nodics.foundation/api-request-lifecycle-handler-pipeline.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nRouter",
    "targetPage": "nodicsDocsPageroutingApiRequestLifecycle",
    "targetRoute": "nodicsDocsRouteroutingApiRequestLifecycle",
    "articleComponent": "nodicsDocsComponentroutingApiRequestLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataroutingapirequestlifecycle",
    "headings": [
      {
        "text": "Source map",
        "anchor": "routingApiRequestLifecycle-1-source-map",
        "level": 2
      },
      {
        "text": "End-to-end flow",
        "anchor": "routingApiRequestLifecycle-2-end-to-end-flow",
        "level": 2
      },
      {
        "text": "Main pipeline nodes",
        "anchor": "routingApiRequestLifecycle-3-main-pipeline-nodes",
        "level": 2
      },
      {
        "text": "Route metadata contract",
        "anchor": "routingApiRequestLifecycle-4-route-metadata-contract",
        "level": 2
      },
      {
        "text": "Secured, non-secured, and public branches",
        "anchor": "routingApiRequestLifecycle-5-secured-non-secured-and-public-branches",
        "level": 2
      },
      {
        "text": "Response and error handling",
        "anchor": "routingApiRequestLifecycle-6-response-and-error-handling",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "routingApiRequestLifecycle-7-customization-and-extension",
        "level": 2
      },
      {
        "text": "Developer example",
        "anchor": "routingApiRequestLifecycle-8-developer-example",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "routingApiRequestLifecycle-9-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "routingApiRequestLifecycle-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "routingApiRequestLifecycle-11-verification",
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
        "title": "Runtime area, Source location, Responsibility"
      },
      {
        "kind": "table",
        "title": "Node, What it does, Safe customization"
      },
      {
        "kind": "table",
        "title": "Branch, When used, Required context"
      },
      {
        "kind": "table",
        "title": "Need, Recommended extension, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely layer, First check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "routing.api-governance",
      "foundation.error-handling-status-codes",
      "pipeline.business-logic-orchestration",
      "foundation.service-runtime-overrides",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/api-request-lifecycle-handler-pipeline.md",
    "sourceChecksum": "804afe6fe824956ff109ed4d1fe447a4de170c10556d7f64f5c603eb70e30c78",
    "sourceWordCount": 1901,
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
    "active": true
  },
  "record33": {
    "code": "nodicsDocsMetadatafoundationErrorHandlingStatusCodes",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.error-handling-status-codes",
    "title": "Error Handling and Status Codes",
    "summary": "How Nodics errors, status definitions, response handlers, HTTP status codes, localization metadata, safe public messages, and project overrides work.",
    "businessSummary": "Error Handling and Status Codes explains the business purpose, supported decisions, operational impact, and controls for the Configuration Layers and Behavior journey.",
    "technicalSummary": "Error Handling and Status Codes records owning module nodics.foundation, technical module nCommon, source path docs/pages/nodics.foundation/error-handling-and-status-codes.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nCommon",
    "targetPage": "nodicsDocsPagefoundationErrorHandlingStatusCodes",
    "targetRoute": "nodicsDocsRoutefoundationErrorHandlingStatusCodes",
    "articleComponent": "nodicsDocsComponentfoundationErrorHandlingStatusCodes",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationerrorhandlingstatuscodes",
    "headings": [
      {
        "text": "Business context",
        "anchor": "foundationErrorHandlingStatusCodes-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime ownership",
        "anchor": "foundationErrorHandlingStatusCodes-2-runtime-ownership",
        "level": 2
      },
      {
        "text": "End-to-end flow",
        "anchor": "foundationErrorHandlingStatusCodes-3-end-to-end-flow",
        "level": 2
      },
      {
        "text": "Error code format",
        "anchor": "foundationErrorHandlingStatusCodes-4-error-code-format",
        "level": 2
      },
      {
        "text": "Status definition contract",
        "anchor": "foundationErrorHandlingStatusCodes-5-status-definition-contract",
        "level": 2
      },
      {
        "text": "Throwing errors",
        "anchor": "foundationErrorHandlingStatusCodes-6-throwing-errors",
        "level": 2
      },
      {
        "text": "Aggregated validation errors",
        "anchor": "foundationErrorHandlingStatusCodes-7-aggregated-validation-errors",
        "level": 2
      },
      {
        "text": "Success response format",
        "anchor": "foundationErrorHandlingStatusCodes-8-success-response-format",
        "level": 2
      },
      {
        "text": "Error response format",
        "anchor": "foundationErrorHandlingStatusCodes-9-error-response-format",
        "level": 2
      },
      {
        "text": "HTTP status guidance",
        "anchor": "foundationErrorHandlingStatusCodes-10-http-status-guidance",
        "level": 2
      },
      {
        "text": "Response handler selection",
        "anchor": "foundationErrorHandlingStatusCodes-11-response-handler-selection",
        "level": 2
      },
      {
        "text": "Configuration",
        "anchor": "foundationErrorHandlingStatusCodes-12-configuration",
        "level": 2
      },
      {
        "text": "Project customization",
        "anchor": "foundationErrorHandlingStatusCodes-13-project-customization",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "foundationErrorHandlingStatusCodes-14-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationErrorHandlingStatusCodes-15-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationErrorHandlingStatusCodes-16-verification",
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
        "title": "Business need, Error contract answer"
      },
      {
        "kind": "table",
        "title": "Runtime area, Source location, Responsibility"
      },
      {
        "kind": "table",
        "title": "Part, Example, Meaning"
      },
      {
        "kind": "table",
        "title": "Field, Required, Meaning"
      },
      {
        "kind": "table",
        "title": "HTTP status, Use for, Example Nodics condition"
      },
      {
        "kind": "table",
        "title": "Need, Extension point, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, First check"
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
      "configuration.framework-startup-lifecycle",
      "routing.api-governance",
      "routing.api-request-lifecycle",
      "pipeline.business-logic-orchestration",
      "applications.axis-setup-error-contracts"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/error-handling-and-status-codes.md",
    "sourceChecksum": "a5c3950ed93b6f5fbf235c7d10fd2215f0ba13a7cb7dabc49a320ac5d334bf0c",
    "sourceWordCount": 2011,
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
    "active": true
  },
  "record34": {
    "code": "nodicsDocsMetadataruntimeGovernedChange",
    "product": "nodicsDocumentationProduct",
    "documentId": "runtime.governed-change",
    "title": "Governed Runtime Change Capability",
    "summary": "How Nodics handles runtime configuration and business behavior changes across clustered nodes through governed APIs and event propagation.",
    "businessSummary": "Governed Runtime Change Capability explains the business purpose, supported decisions, operational impact, and controls for the Governed Runtime Change journey.",
    "technicalSummary": "Governed Runtime Change Capability records owning module nodics.foundation, technical module nConfig, source path docs/pages/nodics.foundation/governed-runtime-change.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nConfig",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/governed-runtime-change.md",
    "sourceChecksum": "c0694ea53e4f8ee34c0d6517ff307482862325cbc083f26019242ac709809cd2",
    "sourceWordCount": 1284,
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
    "active": true
  },
  "record35": {
    "code": "nodicsDocsMetadatalocalizationInternationalization",
    "product": "nodicsDocumentationProduct",
    "documentId": "localization.internationalization",
    "title": "Localization and Internationalization",
    "summary": "Locales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences.",
    "businessSummary": "Localization and Internationalization explains the business purpose, supported decisions, operational impact, and controls for the Localized Experience Management journey.",
    "technicalSummary": "Localization and Internationalization records owning module nodics.localization, technical module localization, source path docs/pages/nodics.localization/localization-internationalization.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.localization",
    "technicalModule": "localization",
    "targetPage": "nodicsDocsPagelocalizationInternationalization",
    "targetRoute": "nodicsDocsRoutelocalizationInternationalization",
    "articleComponent": "nodicsDocsComponentlocalizationInternationalization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocalizationinternationalization",
    "headings": [
      {
        "text": "Business context",
        "anchor": "localizationInternationalization-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "localizationInternationalization-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "localizationInternationalization-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "localizationInternationalization-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "localizationInternationalization-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "localizationInternationalization-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "localizationInternationalization-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "localizationInternationalization-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Area, Business purpose, Developer extension"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "commerce.cart-order",
      "docs.documentation-roadmap"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.localization/localization-internationalization.md",
    "sourceChecksum": "afb02a3195fe1d658961242b225b001745112c246ddc6023216e480345490c40",
    "sourceWordCount": 1336,
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
    "active": true
  },
  "record36": {
    "code": "nodicsDocsMetadataschemaDataModelingManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "schema.data-modeling-management",
    "title": "Data Modeling and Schema Management",
    "summary": "How schemas define model behavior, generated services, API contracts, validation, and project-layer property extension.",
    "businessSummary": "Data Modeling and Schema Management explains the business purpose, supported decisions, operational impact, and controls for the Schema and Model Extension journey.",
    "technicalSummary": "Data Modeling and Schema Management records owning module nodics.foundation, technical module nSchema, source path docs/pages/nodics.foundation/schema-data-modeling.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSchema",
    "targetPage": "nodicsDocsPageschemaDataModelingManagement",
    "targetRoute": "nodicsDocsRouteschemaDataModelingManagement",
    "articleComponent": "nodicsDocsComponentschemaDataModelingManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataschemadatamodelingmanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "schemaDataModelingManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "schemaDataModelingManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "schemaDataModelingManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "schemaDataModelingManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "schemaDataModelingManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "schemaDataModelingManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "schemaDataModelingManagement-7-verification",
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
      "persistence.provider-data-access-layer",
      "framework.customization-guide",
      "axis.business-customization"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/schema-data-modeling.md",
    "sourceChecksum": "7d820135ba6f2cb1dfeb349e6c4836ea21fab3aaea7d7d50ca1513ebdd3f3714",
    "sourceWordCount": 1074,
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
    "active": true
  },
  "record37": {
    "code": "nodicsDocsMetadatapersistenceProviderDataAccessLayer",
    "product": "nodicsDocumentationProduct",
    "documentId": "persistence.provider-data-access-layer",
    "title": "Provider and Data Access Layer",
    "summary": "How the Nodics data access layer uses MongoDB today while preserving provider seams for additional database providers.",
    "businessSummary": "Provider and Data Access Layer explains the business purpose, supported decisions, operational impact, and controls for the Provider and Data Access Layer journey.",
    "technicalSummary": "Provider and Data Access Layer records owning module nodics.foundation, technical module nDatabase, source path docs/pages/nodics.foundation/provider-data-access-layer.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nDatabase",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/provider-data-access-layer.md",
    "sourceChecksum": "628acdf1762318903f8d5fee9fb7e562d88f48f45ba6a850feca4f86d90e4b0d",
    "sourceWordCount": 1133,
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
    "active": true
  },
  "record38": {
    "code": "nodicsDocsMetadatacacheRuntimeStateManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "cache.runtime-state-management",
    "title": "Caching and Runtime State Management",
    "summary": "How local node cache, Redis-style providers, invalidation, runtime state, and diagnostics influence application behavior.",
    "businessSummary": "Caching and Runtime State Management explains the business purpose, supported decisions, operational impact, and controls for the Cache Providers and Invalidation journey.",
    "technicalSummary": "Caching and Runtime State Management records owning module nodics.foundation, technical module nCache, source path docs/pages/nodics.foundation/cache-runtime-state.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nCache",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/cache-runtime-state.md",
    "sourceChecksum": "c6cce78c2346dc16ff96e1c6ee5089022d2a5698b27d1479402ad417b6622c95",
    "sourceWordCount": 1098,
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
    "active": true
  },
  "record39": {
    "code": "nodicsDocsMetadataframeworkCustomizationGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.customization-guide",
    "title": "Customization and extension guide",
    "summary": "How customer projects customize Nodics safely without forking framework authority.",
    "businessSummary": "Customization and extension guide explains the business purpose, supported decisions, operational impact, and controls for the Project-Layer Customization journey.",
    "technicalSummary": "Customization and extension guide records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/customization-guide.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkCustomizationGuide",
    "targetRoute": "nodicsDocsRouteframeworkCustomizationGuide",
    "articleComponent": "nodicsDocsComponentframeworkCustomizationGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkcustomizationguide",
    "headings": [
      {
        "text": "Customization ladder",
        "anchor": "frameworkCustomizationGuide-1-customization-ladder",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkCustomizationGuide-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkCustomizationGuide-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkCustomizationGuide-4-continue-with",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkCustomizationGuide-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkCustomizationGuide-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkCustomizationGuide-7-verification",
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
        "title": "Change type, First place to check, Why"
      }
    ],
    "visualRequirements": [
      "diagram",
      "comparison-table"
    ],
    "relatedPages": [
      "framework.backend-extension-patterns",
      "framework.axis-content-customization",
      "framework.architecture-decision-guide",
      "framework.modular-architecture",
      "process.custom-project-extension"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/customization-guide.md",
    "sourceChecksum": "4cecb2e3a0096457a874cb5f3e504386eef63af9a7e8aa11a1cd4360b35dcb0b",
    "sourceWordCount": 512,
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
    "active": true
  },
  "record40": {
    "code": "nodicsDocsMetadataframeworkBackendExtensionPatterns",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.backend-extension-patterns",
    "title": "Backend Extension Patterns",
    "summary": "How projects extend behavior through configuration, provider adapters, services, validators, pipelines, schemas, and events.",
    "businessSummary": "Backend Extension Patterns explains the business purpose, supported decisions, operational impact, and controls for the Project-Layer Customization journey.",
    "technicalSummary": "Backend Extension Patterns records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/backend-extension-patterns.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkBackendExtensionPatterns",
    "targetRoute": "nodicsDocsRouteframeworkBackendExtensionPatterns",
    "articleComponent": "nodicsDocsComponentframeworkBackendExtensionPatterns",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkbackendextensionpatterns",
    "headings": [
      {
        "text": "Extension options",
        "anchor": "frameworkBackendExtensionPatterns-1-extension-options",
        "level": 2
      },
      {
        "text": "Decision flow",
        "anchor": "frameworkBackendExtensionPatterns-2-decision-flow",
        "level": 2
      },
      {
        "text": "Business and developer impact",
        "anchor": "frameworkBackendExtensionPatterns-3-business-and-developer-impact",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkBackendExtensionPatterns-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkBackendExtensionPatterns-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkBackendExtensionPatterns-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkBackendExtensionPatterns-7-verification",
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
        "title": "Pattern, Use when, Verification"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.modular-architecture",
      "process.custom-project-extension",
      "docs.overview",
      "routing.api-request-lifecycle",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/backend-extension-patterns.md",
    "sourceChecksum": "11c6040650132ab56a709c8766c7ca2ed8696640bdd1f8bccaea1a4ef0318a68",
    "sourceWordCount": 575,
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
    "active": true
  },
  "record41": {
    "code": "nodicsDocsMetadataframeworkAxisContentCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.axis-content-customization",
    "title": "Axis Content Customization",
    "summary": "How business users customize backend-owned content, navigation, visibility, setup records, and publishing decisions from Axis.",
    "businessSummary": "Axis Content Customization explains the business purpose, supported decisions, operational impact, and controls for the Project-Layer Customization journey.",
    "technicalSummary": "Axis Content Customization records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/axis-content-customization.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkAxisContentCustomization",
    "targetRoute": "nodicsDocsRouteframeworkAxisContentCustomization",
    "articleComponent": "nodicsDocsComponentframeworkAxisContentCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkaxiscontentcustomization",
    "headings": [
      {
        "text": "Customization journey",
        "anchor": "frameworkAxisContentCustomization-1-customization-journey",
        "level": 2
      },
      {
        "text": "What business users can change",
        "anchor": "frameworkAxisContentCustomization-2-what-business-users-can-change",
        "level": 2
      },
      {
        "text": "Business value",
        "anchor": "frameworkAxisContentCustomization-3-business-value",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "frameworkAxisContentCustomization-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkAxisContentCustomization-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkAxisContentCustomization-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkAxisContentCustomization-7-verification",
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
        "title": "Change, Owner, Notes"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.modular-architecture",
      "process.custom-project-extension",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/axis-content-customization.md",
    "sourceChecksum": "414adcd134568b56217c7cd40682703219f39f1ddb721e808f3d3367ff614a50",
    "sourceWordCount": 508,
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
    "active": true
  },
  "record42": {
    "code": "nodicsDocsMetadataprocessDeveloperCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.developer-customization",
    "title": "Developer Customization Guide",
    "summary": "Show where developers extend Process behavior, where domain actions belong, and how customer modules customize safely.",
    "businessSummary": "Developer Customization Guide explains the business purpose, supported decisions, operational impact, and controls for the Process Customization journey.",
    "technicalSummary": "Developer Customization Guide records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/developer-customization.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessDeveloperCustomization",
    "targetRoute": "nodicsDocsRouteprocessDeveloperCustomization",
    "articleComponent": "nodicsDocsComponentprocessDeveloperCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessdevelopercustomization",
    "headings": [
      {
        "text": "Where code belongs",
        "anchor": "processDeveloperCustomization-1-where-code-belongs",
        "level": 2
      },
      {
        "text": "Customization-first approach",
        "anchor": "processDeveloperCustomization-2-customization-first-approach",
        "level": 2
      },
      {
        "text": "Domain action boundary",
        "anchor": "processDeveloperCustomization-3-domain-action-boundary",
        "level": 2
      },
      {
        "text": "API extension rule",
        "anchor": "processDeveloperCustomization-4-api-extension-rule",
        "level": 2
      },
      {
        "text": "Generated artifacts",
        "anchor": "processDeveloperCustomization-5-generated-artifacts",
        "level": 2
      },
      {
        "text": "Developer acceptance checklist",
        "anchor": "processDeveloperCustomization-6-developer-acceptance-checklist",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processDeveloperCustomization-7-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processDeveloperCustomization-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processDeveloperCustomization-9-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processDeveloperCustomization-10-business-context",
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
        "title": "Need, Owning place"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "comparison-table",
      "code-example"
    ],
    "relatedPages": [
      "process.custom-project-extension",
      "process.action-adapters"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/developer-customization.md",
    "sourceChecksum": "f6e67e748c42d4343fc9620f23b5bb87e9f0b0be45c4eb3a39cd59eba2524172",
    "sourceWordCount": 610,
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
    "active": true
  },
  "record43": {
    "code": "nodicsDocsMetadataprocessCustomProjectExtension",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.custom-project-extension",
    "title": "Custom Project Extension Guide",
    "summary": "Explain how customer overlays customize Process behavior while preserving functional module identity and backend governance.",
    "businessSummary": "Custom Project Extension Guide explains the business purpose, supported decisions, operational impact, and controls for the Customer Project Extensions journey.",
    "technicalSummary": "Custom Project Extension Guide records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/custom-project-extension.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessCustomProjectExtension",
    "targetRoute": "nodicsDocsRouteprocessCustomProjectExtension",
    "articleComponent": "nodicsDocsComponentprocessCustomProjectExtension",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocesscustomprojectextension",
    "headings": [
      {
        "text": "Example topology",
        "anchor": "processCustomProjectExtension-1-example-topology",
        "level": 2
      },
      {
        "text": "What belongs in a customer extension",
        "anchor": "processCustomProjectExtension-2-what-belongs-in-a-customer-extension",
        "level": 2
      },
      {
        "text": "What should not be customized casually",
        "anchor": "processCustomProjectExtension-3-what-should-not-be-customized-casually",
        "level": 2
      },
      {
        "text": "Documentation ownership",
        "anchor": "processCustomProjectExtension-4-documentation-ownership",
        "level": 2
      },
      {
        "text": "Extension decision and lifecycle",
        "anchor": "processCustomProjectExtension-5-extension-decision-and-lifecycle",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processCustomProjectExtension-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processCustomProjectExtension-7-verification",
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
        "title": "Need, Correct extension point, Authority that remains unchanged"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "comparison-table"
    ],
    "relatedPages": [
      "framework.customization-guide",
      "process.developer-customization"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/custom-project-extension.md",
    "sourceChecksum": "3827beef4aeaeab95cc351b96a90bc558e228aca156059c88486bb5a65c6c720",
    "sourceWordCount": 550,
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
    "active": true
  },
  "record44": {
    "code": "nodicsDocsMetadatacommerceBaseFoundations",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.base-foundations",
    "title": "Base Commerce foundations",
    "summary": "Beginner-to-operator guide for Store, Product, Pricing, Tax, Promotion, Inventory, exact decisions, publication, recovery, and customization.",
    "businessSummary": "Base Commerce foundations explains the business purpose, supported decisions, operational impact, and controls for the Commerce Foundations journey.",
    "technicalSummary": "Base Commerce foundations records owning module nodics.commerce, technical module baseCommerce, source path docs/pages/nodics.commerce/base-commerce.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "baseCommerce",
    "targetPage": "nodicsDocsPagecommerceBaseFoundations",
    "targetRoute": "nodicsDocsRoutecommerceBaseFoundations",
    "articleComponent": "nodicsDocsComponentcommerceBaseFoundations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercebasefoundations",
    "headings": [
      {
        "text": "Business journey",
        "anchor": "commerceBaseFoundations-1-business-journey",
        "level": 2
      },
      {
        "text": "Beginner example",
        "anchor": "commerceBaseFoundations-2-beginner-example",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceBaseFoundations-3-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commerceBaseFoundations-4-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Security and failure behavior",
        "anchor": "commerceBaseFoundations-5-security-and-failure-behavior",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceBaseFoundations-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceBaseFoundations-7-verification",
        "level": 2
      },
      {
        "text": "Store, Channel, And Point Of Service Coverage",
        "anchor": "commerceBaseFoundations-8-store-channel-and-point-of-service-coverage",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "commerceBaseFoundations-9-customization-and-extension",
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
        "title": "Question, Owner, Evidence"
      },
      {
        "kind": "table",
        "title": "Record, Business purpose, Documentation detail"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "commerce.overview",
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/base-commerce.md",
    "sourceChecksum": "04c94da1041ed8830067cb584ef294a56490eb22e83e9f7be25583ee3212485a",
    "sourceWordCount": 947,
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
    "active": true
  },
  "record45": {
    "code": "nodicsDocsMetadatawcmsOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.overview",
    "title": "WCMS content management",
    "summary": "How Nodics manages sites, catalogs, pages, components, routes, and delivery through the WCMS runtime.",
    "businessSummary": "WCMS content management explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "WCMS content management records owning module nodics.wcms, technical module wcms, source path docs/pages/nodics.wcms/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsOverview",
    "targetRoute": "nodicsDocsRoutewcmsOverview",
    "articleComponent": "nodicsDocsComponentwcmsOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsoverview",
    "headings": [
      {
        "text": "WCMS model",
        "anchor": "wcmsOverview-1-wcms-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsOverview-2-business-perspective",
        "level": 2
      },
      {
        "text": "Technical perspective",
        "anchor": "wcmsOverview-3-technical-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "wcmsOverview-4-continue-with",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsOverview-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsOverview-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsOverview-7-verification",
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
        "title": "Concept, Meaning, Who cares"
      }
    ],
    "visualRequirements": [
      "diagram",
      "source-map-table"
    ],
    "relatedPages": [
      "wcms.content-catalog-model",
      "wcms.page-designer-components",
      "wcms.site-publication-visibility",
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/overview.md",
    "sourceChecksum": "f8eec3d7d2f58d99bb51c1b9e16551994276cc84e6898c5548a219bd0f584523",
    "sourceWordCount": 539,
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
    "active": true
  },
  "record46": {
    "code": "nodicsDocsMetadatawcmsContentCatalogModel",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.content-catalog-model",
    "title": "Content Catalog Model",
    "summary": "How sites, catalogs, pages, components, media, routes, access policy, and publication state drive public content.",
    "businessSummary": "Content Catalog Model explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Content Catalog Model records owning module nodics.wcms, technical module wcms, source path docs/pages/nodics.wcms/content-catalog-model.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsContentCatalogModel",
    "targetRoute": "nodicsDocsRoutewcmsContentCatalogModel",
    "articleComponent": "nodicsDocsComponentwcmsContentCatalogModel",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmscontentcatalogmodel",
    "headings": [
      {
        "text": "Catalog objects",
        "anchor": "wcmsContentCatalogModel-1-catalog-objects",
        "level": 2
      },
      {
        "text": "Data flow",
        "anchor": "wcmsContentCatalogModel-2-data-flow",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsContentCatalogModel-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "wcmsContentCatalogModel-4-operator-view",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsContentCatalogModel-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsContentCatalogModel-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsContentCatalogModel-7-verification",
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
        "title": "Object, Purpose, Business impact"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/content-catalog-model.md",
    "sourceChecksum": "c07e400a2c4fa909a88ebb5e5a232404b50e005dabf893306325904d5f8791e3",
    "sourceWordCount": 556,
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
    "active": true
  },
  "record47": {
    "code": "nodicsDocsMetadatawcmsPageDesignerComponents",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.page-designer-components",
    "title": "Page Designer and Components",
    "summary": "How Axis-managed content areas, components, renderer metadata, sequence, validation, and publishing work together.",
    "businessSummary": "Page Designer and Components explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Page Designer and Components records owning module nodics.wcms, technical module wcms, source path docs/pages/nodics.wcms/page-designer-and-components.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsPageDesignerComponents",
    "targetRoute": "nodicsDocsRoutewcmsPageDesignerComponents",
    "articleComponent": "nodicsDocsComponentwcmsPageDesignerComponents",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmspagedesignercomponents",
    "headings": [
      {
        "text": "Authoring journey",
        "anchor": "wcmsPageDesignerComponents-1-authoring-journey",
        "level": 2
      },
      {
        "text": "Component contract",
        "anchor": "wcmsPageDesignerComponents-2-component-contract",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsPageDesignerComponents-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Business and operator impact",
        "anchor": "wcmsPageDesignerComponents-4-business-and-operator-impact",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsPageDesignerComponents-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsPageDesignerComponents-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsPageDesignerComponents-7-verification",
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
        "title": "Area, Business meaning, Technical meaning"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/page-designer-and-components.md",
    "sourceChecksum": "9b041f66db05bcaf893292f0e1590ff80508d3bb7640fe365dcf40b49f5e467f",
    "sourceWordCount": 505,
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
    "active": true
  },
  "record48": {
    "code": "nodicsDocsMetadatawcmsSitePublicationVisibility",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.site-publication-visibility",
    "title": "Site Publication and Visibility",
    "summary": "How Staged, approval, Online, access policy, maintenance pages, and public delivery determine what users see.",
    "businessSummary": "Site Publication and Visibility explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "Site Publication and Visibility records owning module nodics.wcms, technical module wcms, source path docs/pages/nodics.wcms/site-publication-and-visibility.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "wcms",
    "targetPage": "nodicsDocsPagewcmsSitePublicationVisibility",
    "targetRoute": "nodicsDocsRoutewcmsSitePublicationVisibility",
    "articleComponent": "nodicsDocsComponentwcmsSitePublicationVisibility",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmssitepublicationvisibility",
    "headings": [
      {
        "text": "Visibility flow",
        "anchor": "wcmsSitePublicationVisibility-1-visibility-flow",
        "level": 2
      },
      {
        "text": "Visibility matrix",
        "anchor": "wcmsSitePublicationVisibility-2-visibility-matrix",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "wcmsSitePublicationVisibility-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "wcmsSitePublicationVisibility-4-operator-view",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsSitePublicationVisibility-5-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsSitePublicationVisibility-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsSitePublicationVisibility-7-verification",
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
        "title": "State, Axis authoring, Axis reading, Nexus/Agora public, Notes"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.publishing-lifecycle",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/site-publication-and-visibility.md",
    "sourceChecksum": "b7014f3a7cf6316ed680f6043b111ef934d8527a67a09a89f233e68777ac5997",
    "sourceWordCount": 532,
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
    "active": true
  },
  "record49": {
    "code": "nodicsDocsMetadatacatalogProductDiscoveryManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "catalog.product-discovery-management",
    "title": "Product Catalog and Discovery Management",
    "summary": "Products, categories, variants, localized attributes, catalog publication, discovery projections, and project customization.",
    "businessSummary": "Product Catalog and Discovery Management explains the business purpose, supported decisions, operational impact, and controls for the Catalog Model and Publication journey.",
    "technicalSummary": "Product Catalog and Discovery Management records owning module nodics.commerce, technical module product, source path docs/pages/nodics.commerce/product-catalog-discovery.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "product",
    "targetPage": "nodicsDocsPagecatalogProductDiscoveryManagement",
    "targetRoute": "nodicsDocsRoutecatalogProductDiscoveryManagement",
    "articleComponent": "nodicsDocsComponentcatalogProductDiscoveryManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacatalogproductdiscoverymanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "catalogProductDiscoveryManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "catalogProductDiscoveryManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "catalogProductDiscoveryManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "catalogProductDiscoveryManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "catalogProductDiscoveryManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "catalogProductDiscoveryManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "catalogProductDiscoveryManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "catalogProductDiscoveryManagement-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Entity or service area, Business purpose, Developer extension point"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.base-foundations",
      "discovery.search-indexing",
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/product-catalog-discovery.md",
    "sourceChecksum": "b309c99219073bc15a0668bb86ef51c9189842f0d76876803ac8cffd47b1c1aa",
    "sourceWordCount": 1391,
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
    "active": true
  },
  "record50": {
    "code": "nodicsDocsMetadatadiscoverySearchIndexing",
    "product": "nodicsDocumentationProduct",
    "documentId": "discovery.search-indexing",
    "title": "Search, Indexing, and Discovery",
    "summary": "Elasticsearch, Solr, provider adapters, catalog/content indexing, ranking, query profiles, and search metadata governance.",
    "businessSummary": "Search, Indexing, and Discovery explains the business purpose, supported decisions, operational impact, and controls for the Search Providers and Indexing journey.",
    "technicalSummary": "Search, Indexing, and Discovery records owning module nodics.discovery, technical module discovery, source path docs/pages/nodics.discovery/search-indexing-discovery.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.discovery",
    "technicalModule": "discovery",
    "targetPage": "nodicsDocsPagediscoverySearchIndexing",
    "targetRoute": "nodicsDocsRoutediscoverySearchIndexing",
    "articleComponent": "nodicsDocsComponentdiscoverySearchIndexing",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadiscoverysearchindexing",
    "headings": [
      {
        "text": "Business context",
        "anchor": "discoverySearchIndexing-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "discoverySearchIndexing-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "discoverySearchIndexing-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "discoverySearchIndexing-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "discoverySearchIndexing-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "discoverySearchIndexing-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "discoverySearchIndexing-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "discoverySearchIndexing-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Discovery item, What it controls, Evidence to maintain"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "catalog.product-discovery-management",
      "docs.overview",
      "persistence.provider-data-access-layer"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.discovery/search-indexing-discovery.md",
    "sourceChecksum": "4e974ac8e3de3f8ac460159604b8adf5a08cdaa85e5d1e0831d2af1d44a57476",
    "sourceWordCount": 1397,
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
    "active": true
  },
  "record51": {
    "code": "nodicsDocsMetadatawcmsMediaManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-management",
    "title": "Media management",
    "summary": "Governed upload, storage policy, media metadata, source contexts, and safe frontend boundaries.",
    "businessSummary": "Media management explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media management records owning module nodics.wcms, technical module media, source path docs/pages/nodics.wcms/media-management.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaManagement",
    "targetRoute": "nodicsDocsRoutewcmsMediaManagement",
    "articleComponent": "nodicsDocsComponentwcmsMediaManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediamanagement",
    "headings": [
      {
        "text": "Media model",
        "anchor": "wcmsMediaManagement-1-media-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaManagement-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaManagement-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "wcmsMediaManagement-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaManagement-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaManagement-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaManagement-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaManagement-8-verification",
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
        "title": "Area, Rule"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.overview",
      "commerce.base-foundations",
      "wcms.media-storage-delivery",
      "wcms.media-import-publication"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/media-management.md",
    "sourceChecksum": "08efd60090733a0d838738f9813cf24e044fc15367a0c9774cb1efb6b313fe44",
    "sourceWordCount": 568,
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
    "active": true
  },
  "record52": {
    "code": "nodicsDocsMetadatawcmsMediaStorageDelivery",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-storage-delivery",
    "title": "Media Storage and Delivery",
    "summary": "Provider, access, URL, cache, and browser delivery model for media used by content and storefront experiences.",
    "businessSummary": "Media Storage and Delivery explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Storage and Delivery records owning module nodics.wcms, technical module media, source path docs/pages/nodics.wcms/media-storage-and-delivery.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaStorageDelivery",
    "targetRoute": "nodicsDocsRoutewcmsMediaStorageDelivery",
    "articleComponent": "nodicsDocsComponentwcmsMediaStorageDelivery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediastoragedelivery",
    "headings": [
      {
        "text": "Delivery flow",
        "anchor": "wcmsMediaStorageDelivery-1-delivery-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaStorageDelivery-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaStorageDelivery-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "wcmsMediaStorageDelivery-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaStorageDelivery-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaStorageDelivery-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaStorageDelivery-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaStorageDelivery-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaStorageDelivery-9-verification",
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
        "title": "Concern, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/media-storage-and-delivery.md",
    "sourceChecksum": "f652503a1a4cec26692c53ca4f6437aa3633b5a7dad9626b0d0342bb81590de8",
    "sourceWordCount": 647,
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
    "active": true
  },
  "record53": {
    "code": "nodicsDocsMetadatawcmsMediaImportPublication",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-import-publication",
    "title": "Media Import and Publication",
    "summary": "Complete content-pack preparation for media assets, media records, page references, and Online publication.",
    "businessSummary": "Media Import and Publication explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Import and Publication records owning module nodics.wcms, technical module media, source path docs/pages/nodics.wcms/media-import-and-publication.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaImportPublication",
    "targetRoute": "nodicsDocsRoutewcmsMediaImportPublication",
    "articleComponent": "nodicsDocsComponentwcmsMediaImportPublication",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaimportpublication",
    "headings": [
      {
        "text": "Import flow",
        "anchor": "wcmsMediaImportPublication-1-import-flow",
        "level": 2
      },
      {
        "text": "Complete site preparation",
        "anchor": "wcmsMediaImportPublication-2-complete-site-preparation",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "wcmsMediaImportPublication-3-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "wcmsMediaImportPublication-4-developer-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "wcmsMediaImportPublication-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "wcmsMediaImportPublication-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaImportPublication-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaImportPublication-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaImportPublication-9-verification",
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
        "title": "Asset type, What must be imported"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "wcms.media-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/media-import-and-publication.md",
    "sourceChecksum": "2e58f163ceca47ca05ced3330cf0d67a60981b96c7bad41cbe99055eac4a4b4b",
    "sourceWordCount": 603,
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
    "active": true
  },
  "record54": {
    "code": "nodicsDocsMetadatainventoryStockManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "inventory.stock-management",
    "title": "Inventory and Stock Management",
    "summary": "Inventory balances, stock movements, reservations, warehouse relationships, availability summaries, and checkout protection.",
    "businessSummary": "Inventory and Stock Management explains the business purpose, supported decisions, operational impact, and controls for the Stock Availability and Reservation journey.",
    "technicalSummary": "Inventory and Stock Management records owning module nodics.commerce, technical module inventory, source path docs/pages/nodics.commerce/inventory-stock-management.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "inventory",
    "targetPage": "nodicsDocsPageinventoryStockManagement",
    "targetRoute": "nodicsDocsRouteinventoryStockManagement",
    "articleComponent": "nodicsDocsComponentinventoryStockManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatainventorystockmanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "inventoryStockManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "inventoryStockManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "inventoryStockManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "inventoryStockManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "inventoryStockManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "inventoryStockManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "inventoryStockManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "inventoryStockManagement-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Record, Business meaning, Customization detail"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "catalog.product-discovery-management",
      "fulfillment.shipping-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/inventory-stock-management.md",
    "sourceChecksum": "e720c4c53199a88f3ac3a8bdfdcd81c6174d804d1ac9fd527a2025f2fcf33583",
    "sourceWordCount": 1313,
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
    "active": true
  },
  "record55": {
    "code": "nodicsDocsMetadatapricingPromotionsTaxManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "pricing.promotions-tax-management",
    "title": "Pricing, Promotions, and Tax Management",
    "summary": "Price books, price rows, promotion decisions, coupon behavior, tax policies, calculation evidence, and extension boundaries.",
    "businessSummary": "Pricing, Promotions, and Tax Management explains the business purpose, supported decisions, operational impact, and controls for the Commercial Decisioning journey.",
    "technicalSummary": "Pricing, Promotions, and Tax Management records owning module nodics.commerce, technical module pricing, source path docs/pages/nodics.commerce/pricing-promotions-tax.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "pricing",
    "targetPage": "nodicsDocsPagepricingPromotionsTaxManagement",
    "targetRoute": "nodicsDocsRoutepricingPromotionsTaxManagement",
    "articleComponent": "nodicsDocsComponentpricingPromotionsTaxManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatapricingpromotionstaxmanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "pricingPromotionsTaxManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "pricingPromotionsTaxManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "pricingPromotionsTaxManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "pricingPromotionsTaxManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "pricingPromotionsTaxManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "pricingPromotionsTaxManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "pricingPromotionsTaxManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "pricingPromotionsTaxManagement-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Capability, Source records, Runtime question"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "inventory.stock-management",
      "commerce.base-foundations"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/pricing-promotions-tax.md",
    "sourceChecksum": "cb6a8db7c9489938730d41c45ae4ce6c7c0aab872856e2f2240909028c708b97",
    "sourceWordCount": 1347,
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
    "active": true
  },
  "record56": {
    "code": "nodicsDocsMetadatacommerceOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.overview",
    "title": "Commerce overview",
    "summary": "Beginner orientation to the Commerce journey, ownership map, capability state, security baseline, verification, and safe customization.",
    "businessSummary": "Commerce overview explains the business purpose, supported decisions, operational impact, and controls for the Commerce Journey Overview journey.",
    "technicalSummary": "Commerce overview records owning module nodics.commerce, technical module commerce, source path docs/pages/nodics.commerce/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "commerce",
    "targetPage": "nodicsDocsPagecommerceOverview",
    "targetRoute": "nodicsDocsRoutecommerceOverview",
    "articleComponent": "nodicsDocsComponentcommerceOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceoverview",
    "headings": [
      {
        "text": "What Commerce is",
        "anchor": "commerceOverview-1-what-commerce-is",
        "level": 2
      },
      {
        "text": "Module map",
        "anchor": "commerceOverview-2-module-map",
        "level": 2
      },
      {
        "text": "Choose your documentation journey",
        "anchor": "commerceOverview-3-choose-your-documentation-journey",
        "level": 2
      },
      {
        "text": "Current implementation state",
        "anchor": "commerceOverview-4-current-implementation-state",
        "level": 2
      },
      {
        "text": "Safe customization",
        "anchor": "commerceOverview-5-safe-customization",
        "level": 2
      },
      {
        "text": "Security and evidence baseline",
        "anchor": "commerceOverview-6-security-and-evidence-baseline",
        "level": 2
      },
      {
        "text": "How to verify the implementation",
        "anchor": "commerceOverview-7-how-to-verify-the-implementation",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceOverview-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceOverview-9-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Journey step, Owning capability, Durable evidence"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "commerce.base-foundations",
      "commerce.cart-order",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/overview.md",
    "sourceChecksum": "31687c61ad085dc107ef015e162e26f827d93ee31c9ffd13050b7eb6b200db94",
    "sourceWordCount": 1073,
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
    "active": true
  },
  "record57": {
    "code": "nodicsDocsMetadatacommerceCartOrder",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.cart-order",
    "title": "Cart, checkout, and order placement",
    "summary": "Customer, developer, and operator journey for exact calculation, placement, idempotency, compensation, immutable Orders, and recovery.",
    "businessSummary": "Cart, checkout, and order placement explains the business purpose, supported decisions, operational impact, and controls for the Cart and Order Placement journey.",
    "technicalSummary": "Cart, checkout, and order placement records owning module nodics.commerce, technical module checkout, source path docs/pages/nodics.commerce/cart-order.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "checkout",
    "targetPage": "nodicsDocsPagecommerceCartOrder",
    "targetRoute": "nodicsDocsRoutecommerceCartOrder",
    "articleComponent": "nodicsDocsComponentcommerceCartOrder",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercecartorder",
    "headings": [
      {
        "text": "Customer journey",
        "anchor": "commerceCartOrder-1-customer-journey",
        "level": 2
      },
      {
        "text": "Calculation explained for beginners",
        "anchor": "commerceCartOrder-2-calculation-explained-for-beginners",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceCartOrder-3-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commerceCartOrder-4-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Security and failure behavior",
        "anchor": "commerceCartOrder-5-security-and-failure-behavior",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceCartOrder-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceCartOrder-7-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Stage, Owner, Result"
      }
    ],
    "visualRequirements": [
      "table"
    ],
    "relatedPages": [
      "commerce.overview",
      "commerce.payment-fulfillment",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/cart-order.md",
    "sourceChecksum": "e66c2d17bc9eed58575550c69573e8f653bb3ead76493eca204477aa36887ad7",
    "sourceWordCount": 659,
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
    "active": true
  },
  "record58": {
    "code": "nodicsDocsMetadatacommercePaymentFulfillment",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.payment-fulfillment",
    "title": "Payment and fulfillment operations",
    "summary": "Provider-safe payment and fulfillment guide covering methods, adapters, callbacks, reconciliation, shipment, tracking, warehouse work, and returns.",
    "businessSummary": "Payment and fulfillment operations explains the business purpose, supported decisions, operational impact, and controls for the Payment and Fulfillment Boundary journey.",
    "technicalSummary": "Payment and fulfillment operations records owning module nodics.commerce, technical module payment, source path docs/pages/nodics.commerce/payment-fulfillment.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "payment",
    "targetPage": "nodicsDocsPagecommercePaymentFulfillment",
    "targetRoute": "nodicsDocsRoutecommercePaymentFulfillment",
    "articleComponent": "nodicsDocsComponentcommercePaymentFulfillment",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercepaymentfulfillment",
    "headings": [
      {
        "text": "Business journey",
        "anchor": "commercePaymentFulfillment-1-business-journey",
        "level": 2
      },
      {
        "text": "Payment for beginners",
        "anchor": "commercePaymentFulfillment-2-payment-for-beginners",
        "level": 2
      },
      {
        "text": "Fulfillment for beginners",
        "anchor": "commercePaymentFulfillment-3-fulfillment-for-beginners",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commercePaymentFulfillment-4-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commercePaymentFulfillment-5-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commercePaymentFulfillment-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commercePaymentFulfillment-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commercePaymentFulfillment-8-verification",
        "level": 2
      },
      {
        "text": "Payment Transaction And Reconciliation Coverage",
        "anchor": "commercePaymentFulfillment-9-payment-transaction-and-reconciliation-coverage",
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
        "title": "Concern, Authority, Safe evidence"
      },
      {
        "kind": "table",
        "title": "Record, Business meaning, Required operator evidence"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/payment-fulfillment.md",
    "sourceChecksum": "8bc73f067affb71340c91efb3270f8a3540bdd5554a6539bfc3e7f0692f0f7d9",
    "sourceWordCount": 847,
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
    "active": true
  },
  "record59": {
    "code": "nodicsDocsMetadatafulfillmentShippingManagement",
    "product": "nodicsDocumentationProduct",
    "documentId": "fulfillment.shipping-management",
    "title": "Shipping and Fulfillment Management",
    "summary": "Shipping methods, fulfillment policy, consignments, warehouse handoff, shipment tracking, and provider integration boundaries.",
    "businessSummary": "Shipping and Fulfillment Management explains the business purpose, supported decisions, operational impact, and controls for the Shipping and Fulfillment Flow journey.",
    "technicalSummary": "Shipping and Fulfillment Management records owning module nodics.commerce, technical module fulfillment, source path docs/pages/nodics.commerce/shipping-fulfillment.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "fulfillment",
    "targetPage": "nodicsDocsPagefulfillmentShippingManagement",
    "targetRoute": "nodicsDocsRoutefulfillmentShippingManagement",
    "articleComponent": "nodicsDocsComponentfulfillmentShippingManagement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafulfillmentshippingmanagement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "fulfillmentShippingManagement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "fulfillmentShippingManagement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "fulfillmentShippingManagement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "fulfillmentShippingManagement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "fulfillmentShippingManagement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "fulfillmentShippingManagement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "fulfillmentShippingManagement-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "fulfillmentShippingManagement-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Capability, Source records, What Axis should expose"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.payment-fulfillment",
      "inventory.stock-management",
      "order.management-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/shipping-fulfillment.md",
    "sourceChecksum": "437ead72af79aacea210dd412da5bdbf0e3eb872a129e2ba6ec1606a27d58544",
    "sourceWordCount": 1336,
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
    "active": true
  },
  "record60": {
    "code": "nodicsDocsMetadataorderManagementLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "order.management-lifecycle",
    "title": "Order Management Lifecycle",
    "summary": "Order state, operational ownership, fulfillment coordination, lifecycle requests, history, reversals, and support visibility.",
    "businessSummary": "Order Management Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Order State and Operations journey.",
    "technicalSummary": "Order Management Lifecycle records owning module nodics.commerce, technical module order, source path docs/pages/nodics.commerce/order-management.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "order",
    "targetPage": "nodicsDocsPageorderManagementLifecycle",
    "targetRoute": "nodicsDocsRouteorderManagementLifecycle",
    "articleComponent": "nodicsDocsComponentorderManagementLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataordermanagementlifecycle",
    "headings": [
      {
        "text": "Business context",
        "anchor": "orderManagementLifecycle-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "orderManagementLifecycle-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "orderManagementLifecycle-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "orderManagementLifecycle-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "orderManagementLifecycle-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "orderManagementLifecycle-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "orderManagementLifecycle-7-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "orderManagementLifecycle-8-current-implementation-coverage",
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
      },
      {
        "kind": "table",
        "title": "Record or service, Business purpose, Developer concern"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.returns-refunds",
      "fulfillment.shipping-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/order-management.md",
    "sourceChecksum": "b1daedb56941635e4203f9ae17ed381d7b6d82214ef8cb7ff488f288a774dffa",
    "sourceWordCount": 1333,
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
    "active": true
  },
  "record61": {
    "code": "nodicsDocsMetadatacommerceReturnsRefunds",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.returns-refunds",
    "title": "Cancellation, return, and refund lifecycle",
    "summary": "Structured self-service and operator journey for policy, maker-checker approval, owner intents, checkpoints, recovery, and final Order evidence.",
    "businessSummary": "Cancellation, return, and refund lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Reverse Order Lifecycle journey.",
    "technicalSummary": "Cancellation, return, and refund lifecycle records owning module nodics.commerce, technical module order, source path docs/pages/nodics.commerce/returns-refunds.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "order",
    "targetPage": "nodicsDocsPagecommerceReturnsRefunds",
    "targetRoute": "nodicsDocsRoutecommerceReturnsRefunds",
    "articleComponent": "nodicsDocsComponentcommerceReturnsRefunds",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercereturnsrefunds",
    "headings": [
      {
        "text": "Why one lifecycle is needed",
        "anchor": "commerceReturnsRefunds-1-why-one-lifecycle-is-needed",
        "level": 2
      },
      {
        "text": "Customer self-service journey",
        "anchor": "commerceReturnsRefunds-2-customer-self-service-journey",
        "level": 2
      },
      {
        "text": "Administrator and operator journey",
        "anchor": "commerceReturnsRefunds-3-administrator-and-operator-journey",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceReturnsRefunds-4-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and DevOps guidance",
        "anchor": "commerceReturnsRefunds-5-operator-and-devops-guidance",
        "level": 2
      },
      {
        "text": "Security and privacy",
        "anchor": "commerceReturnsRefunds-6-security-and-privacy",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceReturnsRefunds-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceReturnsRefunds-8-verification",
        "level": 2
      },
      {
        "text": "Return Receipt And Reversal Calculation Coverage",
        "anchor": "commerceReturnsRefunds-9-return-receipt-and-reversal-calculation-coverage",
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
        "title": "Intent, Typical prerequisite, Domain actions"
      },
      {
        "kind": "table",
        "title": "Reverse-flow record, Purpose, Documentation requirement"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.cart-order",
      "commerce.payment-fulfillment"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/returns-refunds.md",
    "sourceChecksum": "d2e2eafcb911f10b8dc155704484bacaa54e2d92c28a8f6f91df76cc14213bc0",
    "sourceWordCount": 903,
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
    "active": true
  },
  "record62": {
    "code": "nodicsDocsMetadataengagementCustomerReviews",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.customer-reviews",
    "title": "Customer reviews and ratings",
    "summary": "Beginner-to-operator journey for review submission, moderation, publication, rating aggregates, recovery, APIs, and safe customization.",
    "businessSummary": "Customer reviews and ratings explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Customer reviews and ratings records owning module nodics.engagement, technical module customerReview, source path docs/pages/nodics.engagement/customer-reviews.md, extension points, validation, and troubleshooting evidence.",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/customer-reviews.md",
    "sourceChecksum": "9b95eb7216b36b91b8a16b25f3d198148c307e56a43be4ce653c44efd2903b90",
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
    "active": true
  },
  "record63": {
    "code": "nodicsDocsMetadataengagementReviewModerationGovernance",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.review-moderation-governance",
    "title": "Review Moderation and Governance",
    "summary": "Axis moderation queues, approval and rejection decisions, permissions, state transitions, and audit expectations.",
    "businessSummary": "Review Moderation and Governance explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Review Moderation and Governance records owning module nodics.engagement, technical module customerReview, source path docs/pages/nodics.engagement/review-moderation-and-governance.md, extension points, validation, and troubleshooting evidence.",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/review-moderation-and-governance.md",
    "sourceChecksum": "bc41edd1b7287331356ec3463decc88df8a159e47b83bf0d9e1a39c3aebba6aa",
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
    "active": true
  },
  "record64": {
    "code": "nodicsDocsMetadataengagementReviewAggregationRecovery",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.review-aggregation-recovery",
    "title": "Review Aggregation and Recovery",
    "summary": "Rating aggregate correctness, recalculation, event recovery, and product or discovery visibility after review changes.",
    "businessSummary": "Review Aggregation and Recovery explains the business purpose, supported decisions, operational impact, and controls for the Reviews and Ratings journey.",
    "technicalSummary": "Review Aggregation and Recovery records owning module nodics.engagement, technical module customerReview, source path docs/pages/nodics.engagement/review-aggregation-and-recovery.md, extension points, validation, and troubleshooting evidence.",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/review-aggregation-and-recovery.md",
    "sourceChecksum": "08ae6d8b0340800b3957360bf4b8bb6e56311cfaeeb0900450d224d86189ea43",
    "sourceWordCount": 589,
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
    "active": true
  },
  "record65": {
    "code": "nodicsDocsMetadataengagementCustomerFeedback",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.customer-feedback",
    "title": "Customer feedback, complaints, and closed-loop action",
    "summary": "Beginner-to-operator journey for feedback intake, triage, follow-up, resolution, handoffs, surveys, insights, recovery, and safe customization.",
    "businessSummary": "Customer feedback, complaints, and closed-loop action explains the business purpose, supported decisions, operational impact, and controls for the Feedback and Complaints journey.",
    "technicalSummary": "Customer feedback, complaints, and closed-loop action records owning module nodics.engagement, technical module customerFeedback, source path docs/pages/nodics.engagement/customer-feedback.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "customerFeedback",
    "targetPage": "nodicsDocsPageengagementCustomerFeedback",
    "targetRoute": "nodicsDocsRouteengagementCustomerFeedback",
    "articleComponent": "nodicsDocsComponentengagementCustomerFeedback",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementcustomerfeedback",
    "headings": [
      {
        "text": "Who uses it and why",
        "anchor": "engagementCustomerFeedback-1-who-uses-it-and-why",
        "level": 2
      },
      {
        "text": "End-to-end journey",
        "anchor": "engagementCustomerFeedback-2-end-to-end-journey",
        "level": 2
      },
      {
        "text": "Customer journey",
        "anchor": "engagementCustomerFeedback-3-customer-journey",
        "level": 2
      },
      {
        "text": "Axis business-user journey",
        "anchor": "engagementCustomerFeedback-4-axis-business-user-journey",
        "level": 2
      },
      {
        "text": "Follow-up, resolution, and downstream handoff",
        "anchor": "engagementCustomerFeedback-5-follow-up-resolution-and-downstream-handoff",
        "level": 2
      },
      {
        "text": "Classification and insights",
        "anchor": "engagementCustomerFeedback-6-classification-and-insights",
        "level": 2
      },
      {
        "text": "API and security boundaries",
        "anchor": "engagementCustomerFeedback-7-api-and-security-boundaries",
        "level": 2
      },
      {
        "text": "Configure and extend safely",
        "anchor": "engagementCustomerFeedback-8-configure-and-extend-safely",
        "level": 2
      },
      {
        "text": "Operations and recovery",
        "anchor": "engagementCustomerFeedback-9-operations-and-recovery",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementCustomerFeedback-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementCustomerFeedback-11-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "engagementCustomerFeedback-12-customization-and-extension",
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
        "title": "Reader, Primary outcome"
      },
      {
        "kind": "table",
        "title": "Failure, Safe recovery"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.unified-operations",
      "engagement.governed-automation"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/customer-feedback.md",
    "sourceChecksum": "ae807913c0ef0bf3f7a623ce7ca6da489883a1e73bd95911a04f9eb15a7d3fad",
    "sourceWordCount": 1385,
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
    "active": true
  },
  "record66": {
    "code": "nodicsDocsMetadataengagementUnifiedOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.unified-operations",
    "title": "Unified engagement operations",
    "summary": "Beginner-to-operator journey for unified queues, dashboards, batch previews, repair evidence, bounded exports, authority boundaries, and recovery.",
    "businessSummary": "Unified engagement operations explains the business purpose, supported decisions, operational impact, and controls for the Unified Engagement Operations journey.",
    "technicalSummary": "Unified engagement operations records owning module nodics.engagement, technical module engagementCore, source path docs/pages/nodics.engagement/unified-operations.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "engagementCore",
    "targetPage": "nodicsDocsPageengagementUnifiedOperations",
    "targetRoute": "nodicsDocsRouteengagementUnifiedOperations",
    "articleComponent": "nodicsDocsComponentengagementUnifiedOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementunifiedoperations",
    "headings": [
      {
        "text": "Who uses it and why",
        "anchor": "engagementUnifiedOperations-1-who-uses-it-and-why",
        "level": 2
      },
      {
        "text": "End-to-end journey",
        "anchor": "engagementUnifiedOperations-2-end-to-end-journey",
        "level": 2
      },
      {
        "text": "Axis operator journey",
        "anchor": "engagementUnifiedOperations-3-axis-operator-journey",
        "level": 2
      },
      {
        "text": "Batch actions",
        "anchor": "engagementUnifiedOperations-4-batch-actions",
        "level": 2
      },
      {
        "text": "Export journey",
        "anchor": "engagementUnifiedOperations-5-export-journey",
        "level": 2
      },
      {
        "text": "Repair and reconciliation",
        "anchor": "engagementUnifiedOperations-6-repair-and-reconciliation",
        "level": 2
      },
      {
        "text": "Security and ownership boundaries",
        "anchor": "engagementUnifiedOperations-7-security-and-ownership-boundaries",
        "level": 2
      },
      {
        "text": "Configure and extend safely",
        "anchor": "engagementUnifiedOperations-8-configure-and-extend-safely",
        "level": 2
      },
      {
        "text": "Operations and recovery",
        "anchor": "engagementUnifiedOperations-9-operations-and-recovery",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementUnifiedOperations-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementUnifiedOperations-11-verification",
        "level": 2
      },
      {
        "text": "Contact, testimonial, and analytics coverage",
        "anchor": "engagementUnifiedOperations-12-contact-testimonial-and-analytics-coverage",
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
        "title": "Reader, Primary outcome"
      },
      {
        "kind": "table",
        "title": "Failure, Safe response"
      },
      {
        "kind": "table",
        "title": "Capability, Records, Business outcome"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "engagement.customer-reviews",
      "engagement.customer-feedback"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/unified-operations.md",
    "sourceChecksum": "f0e7f910a023bf605838e5653fc3eac2b24ebf8527ec090b95836fc10dcf3860",
    "sourceWordCount": 1506,
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
    "active": true
  },
  "record67": {
    "code": "nodicsDocsMetadataengagementGovernedAutomation",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.governed-automation",
    "title": "Governed automation and AI",
    "summary": "Beginner-to-operator journey for optional AI proposals, deterministic fallback, evidence, evaluation, human review, overrides, monitoring, and safe extension.",
    "businessSummary": "Governed automation and AI explains the business purpose, supported decisions, operational impact, and controls for the Governed Automation and AI journey.",
    "technicalSummary": "Governed automation and AI records owning module nodics.engagement, technical module engagementCore, source path docs/pages/nodics.engagement/governed-automation.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "engagementCore",
    "targetPage": "nodicsDocsPageengagementGovernedAutomation",
    "targetRoute": "nodicsDocsRouteengagementGovernedAutomation",
    "articleComponent": "nodicsDocsComponentengagementGovernedAutomation",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementgovernedautomation",
    "headings": [
      {
        "text": "Supported capabilities",
        "anchor": "engagementGovernedAutomation-1-supported-capabilities",
        "level": 2
      },
      {
        "text": "Decision journey",
        "anchor": "engagementGovernedAutomation-2-decision-journey",
        "level": 2
      },
      {
        "text": "Axis business-user journey",
        "anchor": "engagementGovernedAutomation-3-axis-business-user-journey",
        "level": 2
      },
      {
        "text": "Evidence and evaluation",
        "anchor": "engagementGovernedAutomation-4-evidence-and-evaluation",
        "level": 2
      },
      {
        "text": "Failure and fallback",
        "anchor": "engagementGovernedAutomation-5-failure-and-fallback",
        "level": 2
      },
      {
        "text": "Security and privacy",
        "anchor": "engagementGovernedAutomation-6-security-and-privacy",
        "level": 2
      },
      {
        "text": "Configure and extend safely",
        "anchor": "engagementGovernedAutomation-7-configure-and-extend-safely",
        "level": 2
      },
      {
        "text": "Monitoring and rollback",
        "anchor": "engagementGovernedAutomation-8-monitoring-and-rollback",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementGovernedAutomation-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementGovernedAutomation-10-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "engagementGovernedAutomation-11-customization-and-extension",
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
        "title": "Capability, Typical assistance, Required control"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "engagement.customer-feedback",
      "engagement.enterprise-operations"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/governed-automation.md",
    "sourceChecksum": "973100a33011fca8e175f4998a3651b2b0c8425ef33066ffc4619d341ca77892",
    "sourceWordCount": 1139,
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
    "active": true
  },
  "record68": {
    "code": "nodicsDocsMetadataengagementEnterpriseOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.enterprise-operations",
    "title": "Enterprise scale, resilience, and ecosystem operations",
    "summary": "Beginner-to-operator journey for capacity, regional residency, provider delivery, backpressure, recovery, compatibility, accessibility, security, and release acceptance.",
    "businessSummary": "Enterprise scale, resilience, and ecosystem operations explains the business purpose, supported decisions, operational impact, and controls for the Enterprise Engagement Operations journey.",
    "technicalSummary": "Enterprise scale, resilience, and ecosystem operations records owning module nodics.engagement, technical module engagementCore, source path docs/pages/nodics.engagement/enterprise-operations.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "engagementCore",
    "targetPage": "nodicsDocsPageengagementEnterpriseOperations",
    "targetRoute": "nodicsDocsRouteengagementEnterpriseOperations",
    "articleComponent": "nodicsDocsComponentengagementEnterpriseOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagemententerpriseoperations",
    "headings": [
      {
        "text": "Production journey",
        "anchor": "engagementEnterpriseOperations-1-production-journey",
        "level": 2
      },
      {
        "text": "Capacity and pagination",
        "anchor": "engagementEnterpriseOperations-2-capacity-and-pagination",
        "level": 2
      },
      {
        "text": "Regional residency and recovery",
        "anchor": "engagementEnterpriseOperations-3-regional-residency-and-recovery",
        "level": 2
      },
      {
        "text": "Provider and webhook delivery",
        "anchor": "engagementEnterpriseOperations-4-provider-and-webhook-delivery",
        "level": 2
      },
      {
        "text": "Axis operator journey",
        "anchor": "engagementEnterpriseOperations-5-axis-operator-journey",
        "level": 2
      },
      {
        "text": "Compatibility and deprecation",
        "anchor": "engagementEnterpriseOperations-6-compatibility-and-deprecation",
        "level": 2
      },
      {
        "text": "Privacy, security, and accessibility",
        "anchor": "engagementEnterpriseOperations-7-privacy-security-and-accessibility",
        "level": 2
      },
      {
        "text": "Developer and DevOps release journey",
        "anchor": "engagementEnterpriseOperations-8-developer-and-devops-release-journey",
        "level": 2
      },
      {
        "text": "Monitoring and runbooks",
        "anchor": "engagementEnterpriseOperations-9-monitoring-and-runbooks",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementEnterpriseOperations-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementEnterpriseOperations-11-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "engagementEnterpriseOperations-12-customization-and-extension",
        "level": 2
      }
    ],
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [],
    "visualRequirements": [
      "diagram"
    ],
    "relatedPages": [
      "engagement.unified-operations",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/enterprise-operations.md",
    "sourceChecksum": "588e7db6713405813e06c58733154c05faf76427412da1428d697d63da0244d1",
    "sourceWordCount": 1268,
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
    "active": true
  },
  "record69": {
    "code": "nodicsDocsMetadatacommunicationOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.overview",
    "title": "Communication, delivery, and verification",
    "summary": "Beginner-to-operator journey for templates, intent, consent, suppression, verification, provider delivery, callbacks, retry, inbox, recovery, and domain integration.",
    "businessSummary": "Communication, delivery, and verification explains the business purpose, supported decisions, operational impact, and controls for the Communication Delivery and Verification journey.",
    "technicalSummary": "Communication, delivery, and verification records owning module nodics.communication, technical module commsCore, source path docs/pages/nodics.communication/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "commsCore",
    "targetPage": "nodicsDocsPagecommunicationOverview",
    "targetRoute": "nodicsDocsRoutecommunicationOverview",
    "articleComponent": "nodicsDocsComponentcommunicationOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationoverview",
    "headings": [
      {
        "text": "Module structure",
        "anchor": "communicationOverview-1-module-structure",
        "level": 2
      },
      {
        "text": "End-to-end delivery journey",
        "anchor": "communicationOverview-2-end-to-end-delivery-journey",
        "level": 2
      },
      {
        "text": "Template and rendering journey",
        "anchor": "communicationOverview-3-template-and-rendering-journey",
        "level": 2
      },
      {
        "text": "Consent, purpose, and suppression",
        "anchor": "communicationOverview-4-consent-purpose-and-suppression",
        "level": 2
      },
      {
        "text": "Idempotency and delivery evidence",
        "anchor": "communicationOverview-5-idempotency-and-delivery-evidence",
        "level": 2
      },
      {
        "text": "Verification journey",
        "anchor": "communicationOverview-6-verification-journey",
        "level": 2
      },
      {
        "text": "Axis and customer journey",
        "anchor": "communicationOverview-7-axis-and-customer-journey",
        "level": 2
      },
      {
        "text": "Engagement integration",
        "anchor": "communicationOverview-8-engagement-integration",
        "level": 2
      },
      {
        "text": "Provider activation and operations",
        "anchor": "communicationOverview-9-provider-activation-and-operations",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communicationOverview-10-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "communicationOverview-11-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "communicationOverview-12-customization-and-extension",
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
        "title": "Module, Responsibility"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "engagement.customer-feedback",
      "process.action-adapters"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.communication/overview.md",
    "sourceChecksum": "d5c8d09a2dec76c4aca405670999fbfa826e3baa7009dda74e550d5f97eef467",
    "sourceWordCount": 1067,
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
    "active": true
  },
  "record70": {
    "code": "nodicsDocsMetadataeventsMessagingClusterCoordination",
    "product": "nodicsDocumentationProduct",
    "documentId": "events.messaging-cluster-coordination",
    "title": "Events, Messaging, and Cluster Coordination",
    "summary": "Event publishing, event splitting, cluster propagation, node responsibility transfer, runtime refresh, and provider extension.",
    "businessSummary": "Events, Messaging, and Cluster Coordination explains the business purpose, supported decisions, operational impact, and controls for the Events and Cluster Coordination journey.",
    "technicalSummary": "Events, Messaging, and Cluster Coordination records owning module nodics.foundation, technical module nEms, source path docs/pages/nodics.foundation/events-messaging-cluster.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nEms",
    "targetPage": "nodicsDocsPageeventsMessagingClusterCoordination",
    "targetRoute": "nodicsDocsRouteeventsMessagingClusterCoordination",
    "articleComponent": "nodicsDocsComponenteventsMessagingClusterCoordination",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataeventsmessagingclustercoordination",
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
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Business need, Event and messaging answer"
      },
      {
        "kind": "table",
        "title": "Capability area, Main responsibility, Current implementation detail"
      },
      {
        "kind": "table",
        "title": "Cluster scenario, Business result, Technical behavior"
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
      "runtime.governed-change",
      "cron.operations",
      "cache.runtime-state-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/events-messaging-cluster.md",
    "sourceChecksum": "32a59b3a1e73bee57407925adeaec92216489087d68141ea45dd18ba2fc3dd98",
    "sourceWordCount": 1372,
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
    "active": true
  },
  "record71": {
    "code": "nodicsDocsMetadataprocessOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.overview",
    "title": "Business Process and Automation Overview",
    "summary": "Understand why nodics.process exists, how it helps business users, developers, and operators, and where it fits with Core, Cron, Platform, Axis, and customer modules.",
    "businessSummary": "Business Process and Automation Overview explains the business purpose, supported decisions, operational impact, and controls for the Process Overview journey.",
    "technicalSummary": "Business Process and Automation Overview records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/process-overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessOverview",
    "targetRoute": "nodicsDocsRouteprocessOverview",
    "articleComponent": "nodicsDocsComponentprocessOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessoverview",
    "headings": [
      {
        "text": "Beginner mental model",
        "anchor": "processOverview-1-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Where Process fits in Nodics",
        "anchor": "processOverview-2-where-process-fits-in-nodics",
        "level": 2
      },
      {
        "text": "Business value",
        "anchor": "processOverview-3-business-value",
        "level": 2
      },
      {
        "text": "Relationship with Cron",
        "anchor": "processOverview-4-relationship-with-cron",
        "level": 2
      },
      {
        "text": "Relationship with domain modules",
        "anchor": "processOverview-5-relationship-with-domain-modules",
        "level": 2
      },
      {
        "text": "What exists in the current MVP",
        "anchor": "processOverview-6-what-exists-in-the-current-mvp",
        "level": 2
      },
      {
        "text": "Extension direction",
        "anchor": "processOverview-7-extension-direction",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processOverview-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processOverview-9-verification",
        "level": 2
      },
      {
        "text": "Commerce And Content Workflow Coverage",
        "anchor": "processOverview-10-commerce-and-content-workflow-coverage",
        "level": 2
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
        "title": "Module, Responsibility"
      },
      {
        "kind": "table",
        "title": "Need, Owner"
      },
      {
        "kind": "table",
        "title": "Process record, Business purpose, Extension point"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "process.first-workflow",
      "process.runtime-lifecycle",
      "process.workflow-orchestration-patterns",
      "cron.operations"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/process-overview.md",
    "sourceChecksum": "0c88520fe4d10189ba1a1f09210c83fe30896087ca4d33e998b78cec88eed394",
    "sourceWordCount": 1096,
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
    "active": true
  },
  "record72": {
    "code": "nodicsDocsMetadataprocessRuntimeLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.runtime-lifecycle",
    "title": "Runtime Instance and Task Lifecycle",
    "summary": "Learn the backend-owned lifecycle for definitions, versions, instances, tasks, audit events, and scheduled trigger relationships.",
    "businessSummary": "Runtime Instance and Task Lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Runtime Lifecycle journey.",
    "technicalSummary": "Runtime Instance and Task Lifecycle records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/runtime-lifecycle.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessRuntimeLifecycle",
    "targetRoute": "nodicsDocsRouteprocessRuntimeLifecycle",
    "articleComponent": "nodicsDocsComponentprocessRuntimeLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessruntimelifecycle",
    "headings": [
      {
        "text": "Lifecycle summary",
        "anchor": "processRuntimeLifecycle-1-lifecycle-summary",
        "level": 2
      },
      {
        "text": "Definition lifecycle",
        "anchor": "processRuntimeLifecycle-2-definition-lifecycle",
        "level": 2
      },
      {
        "text": "Starting an instance",
        "anchor": "processRuntimeLifecycle-3-starting-an-instance",
        "level": 2
      },
      {
        "text": "Task lifecycle",
        "anchor": "processRuntimeLifecycle-4-task-lifecycle",
        "level": 2
      },
      {
        "text": "Instance detail and audit",
        "anchor": "processRuntimeLifecycle-5-instance-detail-and-audit",
        "level": 2
      },
      {
        "text": "Scheduled triggers",
        "anchor": "processRuntimeLifecycle-6-scheduled-triggers",
        "level": 2
      },
      {
        "text": "QA checklist",
        "anchor": "processRuntimeLifecycle-7-qa-checklist",
        "level": 2
      },
      {
        "text": "Customization examples",
        "anchor": "processRuntimeLifecycle-8-customization-examples",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processRuntimeLifecycle-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processRuntimeLifecycle-10-verification",
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
        "title": "Action, API, Permission, Allowed from, Result"
      },
      {
        "kind": "table",
        "title": "Concern, Owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.incident-recovery",
      "process.workflow-orchestration-patterns"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/runtime-lifecycle.md",
    "sourceChecksum": "e3acf8b7e13d3f4743feba18c2eebfb8ee23d3cacc9375febb0c3cb7799f4571",
    "sourceWordCount": 1003,
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
    "active": true
  },
  "record73": {
    "code": "nodicsDocsMetadataprocessWorkflowOrchestrationPatterns",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.workflow-orchestration-patterns",
    "title": "Workflow Orchestration Patterns",
    "summary": "How Process workflows govern long-running business lifecycle with product export aggregation, filters, multi-target branching, ACTION adapters, retry, and recovery.",
    "businessSummary": "Workflow Orchestration Patterns explains the business purpose, supported decisions, operational impact, and controls for the Runtime Lifecycle journey.",
    "technicalSummary": "Workflow Orchestration Patterns records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/workflow-orchestration-patterns.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessWorkflowOrchestrationPatterns",
    "targetRoute": "nodicsDocsRouteprocessWorkflowOrchestrationPatterns",
    "articleComponent": "nodicsDocsComponentprocessWorkflowOrchestrationPatterns",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessworkfloworchestrationpatterns",
    "headings": [
      {
        "text": "Pipeline and workflow boundary",
        "anchor": "processWorkflowOrchestrationPatterns-1-pipeline-and-workflow-boundary",
        "level": 2
      },
      {
        "text": "Workflow lifecycle",
        "anchor": "processWorkflowOrchestrationPatterns-2-workflow-lifecycle",
        "level": 2
      },
      {
        "text": "Product export use case",
        "anchor": "processWorkflowOrchestrationPatterns-3-product-export-use-case",
        "level": 2
      },
      {
        "text": "Workflow definition example",
        "anchor": "processWorkflowOrchestrationPatterns-4-workflow-definition-example",
        "level": 2
      },
      {
        "text": "Starting the export workflow",
        "anchor": "processWorkflowOrchestrationPatterns-5-starting-the-export-workflow",
        "level": 2
      },
      {
        "text": "Data aggregation contract",
        "anchor": "processWorkflowOrchestrationPatterns-6-data-aggregation-contract",
        "level": 2
      },
      {
        "text": "Filters and target policies",
        "anchor": "processWorkflowOrchestrationPatterns-7-filters-and-target-policies",
        "level": 2
      },
      {
        "text": "Action adapters",
        "anchor": "processWorkflowOrchestrationPatterns-8-action-adapters",
        "level": 2
      },
      {
        "text": "Multi-directional split patterns",
        "anchor": "processWorkflowOrchestrationPatterns-9-multi-directional-split-patterns",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processWorkflowOrchestrationPatterns-10-customization-and-extension",
        "level": 2
      },
      {
        "text": "Error and recovery",
        "anchor": "processWorkflowOrchestrationPatterns-11-error-and-recovery",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processWorkflowOrchestrationPatterns-12-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processWorkflowOrchestrationPatterns-13-common-mistakes",
        "level": 2
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
        "title": "Concern, Pipeline, Workflow"
      },
      {
        "kind": "table",
        "title": "Step, Runtime action, Developer meaning"
      },
      {
        "kind": "table",
        "title": "Filter area, Example, Owner"
      },
      {
        "kind": "table",
        "title": "Pattern, Use when, Shape"
      },
      {
        "kind": "table",
        "title": "Need, Extension point, Do not do"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "process.runtime-lifecycle",
      "process.action-adapters",
      "process.incident-recovery",
      "pipeline.business-logic-orchestration",
      "data.import-export-migration",
      "catalog.product-discovery-management",
      "pricing.promotions-tax-management",
      "inventory.stock-management"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/workflow-orchestration-patterns.md",
    "sourceChecksum": "cc13a175674a11e683fa2185964e2a20cb4129b4d00af4951849b7a07f3dfa0e",
    "sourceWordCount": 2049,
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
    "active": true
  },
  "record74": {
    "code": "nodicsDocsMetadataprocessFirstWorkflow",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.first-workflow",
    "title": "Build Your First Workflow",
    "summary": "Create a first Process workflow from START through TASK, DECISION, ACTION, TIMER, SUB_PROCESS, and END with beginner-safe examples.",
    "businessSummary": "Build Your First Workflow explains the business purpose, supported decisions, operational impact, and controls for the Workflow Getting Started journey.",
    "technicalSummary": "Build Your First Workflow records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/first-workflow.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessFirstWorkflow",
    "targetRoute": "nodicsDocsRouteprocessFirstWorkflow",
    "articleComponent": "nodicsDocsComponentprocessFirstWorkflow",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessfirstworkflow",
    "headings": [
      {
        "text": "What you are building",
        "anchor": "processFirstWorkflow-1-what-you-are-building",
        "level": 2
      },
      {
        "text": "Step 1: create a draft definition",
        "anchor": "processFirstWorkflow-2-step-1-create-a-draft-definition",
        "level": 2
      },
      {
        "text": "Step 2: understand the nodes",
        "anchor": "processFirstWorkflow-3-step-2-understand-the-nodes",
        "level": 2
      },
      {
        "text": "Step 3: connect the nodes",
        "anchor": "processFirstWorkflow-4-step-3-connect-the-nodes",
        "level": 2
      },
      {
        "text": "Step 4: save, validate, publish",
        "anchor": "processFirstWorkflow-5-step-4-save-validate-publish",
        "level": 2
      },
      {
        "text": "Common beginner mistakes",
        "anchor": "processFirstWorkflow-6-common-beginner-mistakes",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processFirstWorkflow-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processFirstWorkflow-8-verification",
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
        "title": "Node type, Beginner meaning, Runtime owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.first-human-task",
      "process.workflow-orchestration-patterns"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/first-workflow.md",
    "sourceChecksum": "8bf130684dcd828660611f97a89475431c7ee9c75bf746031398f990b5ecd484",
    "sourceWordCount": 582,
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
    "active": true
  },
  "record75": {
    "code": "nodicsDocsMetadataprocessFirstHumanTask",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.first-human-task",
    "title": "Build Your First Human Task Flow",
    "summary": "Understand task lifecycle, assignment, Axis presentation, and customer customization for human workflow steps.",
    "businessSummary": "Build Your First Human Task Flow explains the business purpose, supported decisions, operational impact, and controls for the Human Task Flow journey.",
    "technicalSummary": "Build Your First Human Task Flow records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/first-human-task.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessFirstHumanTask",
    "targetRoute": "nodicsDocsRouteprocessFirstHumanTask",
    "articleComponent": "nodicsDocsComponentprocessFirstHumanTask",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessfirsthumantask",
    "headings": [
      {
        "text": "Example business scenario",
        "anchor": "processFirstHumanTask-1-example-business-scenario",
        "level": 2
      },
      {
        "text": "Task fields you should understand",
        "anchor": "processFirstHumanTask-2-task-fields-you-should-understand",
        "level": 2
      },
      {
        "text": "How Axis should present task work",
        "anchor": "processFirstHumanTask-3-how-axis-should-present-task-work",
        "level": 2
      },
      {
        "text": "Developer customization",
        "anchor": "processFirstHumanTask-4-developer-customization",
        "level": 2
      },
      {
        "text": "End-to-end task example",
        "anchor": "processFirstHumanTask-5-end-to-end-task-example",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processFirstHumanTask-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processFirstHumanTask-7-verification",
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
        "title": "Field, Why it matters"
      },
      {
        "kind": "table",
        "title": "Test path, Expected result, Evidence"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table"
    ],
    "relatedPages": [
      "process.first-workflow",
      "process.visual-designer"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/first-human-task.md",
    "sourceChecksum": "0451d4ac3be9154c1fb74996e6af09f7e294f0321635f61b7e8e8202cf8b59e1",
    "sourceWordCount": 591,
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
    "active": true
  },
  "record76": {
    "code": "nodicsDocsMetadataprocessBusinessValue",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.business-value",
    "title": "Business Value and Adoption Model",
    "summary": "Explain the business problems Process solves, how it lowers operating cost, and how business users should think about automation governance.",
    "businessSummary": "Business Value and Adoption Model explains the business purpose, supported decisions, operational impact, and controls for the Business Value and Adoption journey.",
    "technicalSummary": "Business Value and Adoption Model records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/business-value.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessBusinessValue",
    "targetRoute": "nodicsDocsRouteprocessBusinessValue",
    "articleComponent": "nodicsDocsComponentprocessBusinessValue",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessbusinessvalue",
    "headings": [
      {
        "text": "The business problem",
        "anchor": "processBusinessValue-1-the-business-problem",
        "level": 2
      },
      {
        "text": "What Process gives business users",
        "anchor": "processBusinessValue-2-what-process-gives-business-users",
        "level": 2
      },
      {
        "text": "Why this reduces cost",
        "anchor": "processBusinessValue-3-why-this-reduces-cost",
        "level": 2
      },
      {
        "text": "Adoption path",
        "anchor": "processBusinessValue-4-adoption-path",
        "level": 2
      },
      {
        "text": "Business-user acceptance",
        "anchor": "processBusinessValue-5-business-user-acceptance",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processBusinessValue-6-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processBusinessValue-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processBusinessValue-8-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processBusinessValue-9-customization-and-extension",
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
        "title": "Business question, Without Process, With Nodics Process"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "source-map-table",
      "code-example"
    ],
    "relatedPages": [
      "process.overview",
      "process.first-workflow"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/business-value.md",
    "sourceChecksum": "01140013a39b0e1b9519420211d473169bcfb53259b8dc36f8fe0599eee71595",
    "sourceWordCount": 659,
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
    "active": true
  },
  "record77": {
    "code": "nodicsDocsMetadatapipelineBusinessLogicOrchestration",
    "product": "nodicsDocumentationProduct",
    "documentId": "pipeline.business-logic-orchestration",
    "title": "Pipeline and Business Logic Orchestration",
    "summary": "How Nodics pipelines compose validation, enrichment, decisioning, side effects, events, and project-layer business logic.",
    "businessSummary": "Pipeline and Business Logic Orchestration explains the business purpose, supported decisions, operational impact, and controls for the Pipeline Execution Model journey.",
    "technicalSummary": "Pipeline and Business Logic Orchestration records owning module nodics.foundation, technical module nPipeline, source path docs/pages/nodics.foundation/pipeline-business-logic.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nPipeline",
    "targetPage": "nodicsDocsPagepipelineBusinessLogicOrchestration",
    "targetRoute": "nodicsDocsRoutepipelineBusinessLogicOrchestration",
    "articleComponent": "nodicsDocsComponentpipelineBusinessLogicOrchestration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatapipelinebusinesslogicorchestration",
    "headings": [
      {
        "text": "Business context",
        "anchor": "pipelineBusinessLogicOrchestration-1-business-context",
        "level": 2
      },
      {
        "text": "Runtime model",
        "anchor": "pipelineBusinessLogicOrchestration-2-runtime-model",
        "level": 2
      },
      {
        "text": "Pipeline lifecycle",
        "anchor": "pipelineBusinessLogicOrchestration-3-pipeline-lifecycle",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "pipelineBusinessLogicOrchestration-4-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Author a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-5-author-a-pipeline",
        "level": 2
      },
      {
        "text": "Call a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-6-call-a-pipeline",
        "level": 2
      },
      {
        "text": "Pass data through a pipeline",
        "anchor": "pipelineBusinessLogicOrchestration-7-pass-data-through-a-pipeline",
        "level": 2
      },
      {
        "text": "Node handler contract",
        "anchor": "pipelineBusinessLogicOrchestration-8-node-handler-contract",
        "level": 2
      },
      {
        "text": "Add, remove, or reorder nodes",
        "anchor": "pipelineBusinessLogicOrchestration-9-add-remove-or-reorder-nodes",
        "level": 2
      },
      {
        "text": "Branching and target nodes",
        "anchor": "pipelineBusinessLogicOrchestration-10-branching-and-target-nodes",
        "level": 2
      },
      {
        "text": "Nested pipelines",
        "anchor": "pipelineBusinessLogicOrchestration-11-nested-pipelines",
        "level": 2
      },
      {
        "text": "Error lifecycle",
        "anchor": "pipelineBusinessLogicOrchestration-12-error-lifecycle",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "pipelineBusinessLogicOrchestration-13-customization-and-extension",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "pipelineBusinessLogicOrchestration-14-related-developer-guides",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "pipelineBusinessLogicOrchestration-15-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "pipelineBusinessLogicOrchestration-16-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "pipelineBusinessLogicOrchestration-17-verification",
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
        "title": "Business need, Pipeline answer"
      },
      {
        "kind": "table",
        "title": "Source area, Purpose, Runtime effect"
      },
      {
        "kind": "table",
        "title": "Step, Runtime action, Developer meaning"
      },
      {
        "kind": "table",
        "title": "Configuration or record, Meaning, Update behavior"
      },
      {
        "kind": "table",
        "title": "Argument, Purpose, Guidance"
      },
      {
        "kind": "table",
        "title": "Object, What belongs here, What should not belong here"
      },
      {
        "kind": "table",
        "title": "Method, Meaning, When to call"
      },
      {
        "kind": "table",
        "title": "Failure, Runtime behavior, Developer fix"
      },
      {
        "kind": "table",
        "title": "Customization goal, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
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
      "framework.customization-guide",
      "commerce.cart-order",
      "runtime.governed-change",
      "routing.api-request-lifecycle",
      "process.workflow-orchestration-patterns",
      "foundation.module-to-module-communication"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/pipeline-business-logic.md",
    "sourceChecksum": "5980c207b3962d09d9bb14cbb4a8c20c049b5eb91b8b92c24b0e83fe7b5ef3d0",
    "sourceWordCount": 2886,
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
    "active": true
  },
  "record78": {
    "code": "nodicsDocsMetadatacronOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.operations",
    "title": "Cron operations",
    "summary": "Scheduled job ownership, runtime placement, lifecycle commands, resilience, and production safety.",
    "businessSummary": "Cron operations explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Cron operations records owning module nodics.process, technical module cronjob, source path docs/pages/nodics.process/cronjob-operations.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronOperations",
    "targetRoute": "nodicsDocsRoutecronOperations",
    "articleComponent": "nodicsDocsComponentcronOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronoperations",
    "headings": [
      {
        "text": "Scheduled work model",
        "anchor": "cronOperations-1-scheduled-work-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "cronOperations-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "cronOperations-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "cronOperations-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "cronOperations-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronOperations-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "cronOperations-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronOperations-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronOperations-9-verification",
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
        "title": "Concern, What the documentation must explain"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "diagram",
      "table"
    ],
    "relatedPages": [
      "cron.node-responsibility-tee",
      "cron.project-customization",
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/cronjob-operations.md",
    "sourceChecksum": "d12171a4416afd05c2873e578cc7bb0f83db70621f48b3297cbb6fadfddb865a",
    "sourceWordCount": 592,
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
    "active": true
  },
  "record79": {
    "code": "nodicsDocsMetadatacronNodeResponsibilityTee",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.node-responsibility-tee",
    "title": "Cron Node Responsibility and TEE",
    "summary": "How scheduled work ownership, failover, responsibility transfer, recovery, and TEE references should be documented.",
    "businessSummary": "Cron Node Responsibility and TEE explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Cron Node Responsibility and TEE records owning module nodics.process, technical module cronjob, source path docs/pages/nodics.process/cron-node-responsibility-and-tee.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronNodeResponsibilityTee",
    "targetRoute": "nodicsDocsRoutecronNodeResponsibilityTee",
    "articleComponent": "nodicsDocsComponentcronNodeResponsibilityTee",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronnoderesponsibilitytee",
    "headings": [
      {
        "text": "Responsibility flow",
        "anchor": "cronNodeResponsibilityTee-1-responsibility-flow",
        "level": 2
      },
      {
        "text": "Business and technical model",
        "anchor": "cronNodeResponsibilityTee-2-business-and-technical-model",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cronNodeResponsibilityTee-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator view",
        "anchor": "cronNodeResponsibilityTee-4-operator-view",
        "level": 2
      },
      {
        "text": "Project configuration points",
        "anchor": "cronNodeResponsibilityTee-5-project-configuration-points",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronNodeResponsibilityTee-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronNodeResponsibilityTee-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronNodeResponsibilityTee-8-verification",
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
        "title": "Concern, Required behavior"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/cron-node-responsibility-and-tee.md",
    "sourceChecksum": "b06089fc6302630a5ea7941ed0096014decaf17b5cdc89c5646ba1d9ad336432",
    "sourceWordCount": 566,
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
    "active": true
  },
  "record80": {
    "code": "nodicsDocsMetadatacronProjectCustomization",
    "product": "nodicsDocumentationProduct",
    "documentId": "cron.project-customization",
    "title": "Project Cron Customization",
    "summary": "How customer projects add scheduled business work with job definitions, triggers, permissions, retry, audit, and tests.",
    "businessSummary": "Project Cron Customization explains the business purpose, supported decisions, operational impact, and controls for the Cron Operations journey.",
    "technicalSummary": "Project Cron Customization records owning module nodics.process, technical module cronjob, source path docs/pages/nodics.process/project-cron-customization.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPagecronProjectCustomization",
    "targetRoute": "nodicsDocsRoutecronProjectCustomization",
    "articleComponent": "nodicsDocsComponentcronProjectCustomization",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacronprojectcustomization",
    "headings": [
      {
        "text": "Project job model",
        "anchor": "cronProjectCustomization-1-project-job-model",
        "level": 2
      },
      {
        "text": "Implementation checklist",
        "anchor": "cronProjectCustomization-2-implementation-checklist",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "cronProjectCustomization-3-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operator and QA impact",
        "anchor": "cronProjectCustomization-4-operator-and-qa-impact",
        "level": 2
      },
      {
        "text": "Configuration ownership",
        "anchor": "cronProjectCustomization-5-configuration-ownership",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "cronProjectCustomization-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "cronProjectCustomization-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "cronProjectCustomization-8-verification",
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
        "title": "Area, What to define"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "process.scheduled-automation",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/project-cron-customization.md",
    "sourceChecksum": "c28d21262832db742aa3e4c64bb5f85972b38dd65976f31d8aaa2d8c1c065cc1",
    "sourceWordCount": 570,
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
    "active": true
  },
  "record81": {
    "code": "nodicsDocsMetadataprocessProcessCronRuntime",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.process-cron-runtime",
    "title": "Process and Cronjob Shared Runtime",
    "summary": "Clarify how processServer can include workflow and cronjob while each module keeps a separate ownership boundary.",
    "businessSummary": "Process and Cronjob Shared Runtime explains the business purpose, supported decisions, operational impact, and controls for the Process and Cron Runtime Boundary journey.",
    "technicalSummary": "Process and Cronjob Shared Runtime records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/process-cron-runtime.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessProcessCronRuntime",
    "targetRoute": "nodicsDocsRouteprocessProcessCronRuntime",
    "articleComponent": "nodicsDocsComponentprocessProcessCronRuntime",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessprocesscronruntime",
    "headings": [
      {
        "text": "The key rule",
        "anchor": "processProcessCronRuntime-1-the-key-rule",
        "level": 2
      },
      {
        "text": "Example topology",
        "anchor": "processProcessCronRuntime-2-example-topology",
        "level": 2
      },
      {
        "text": "Why this is attractive for partners",
        "anchor": "processProcessCronRuntime-3-why-this-is-attractive-for-partners",
        "level": 2
      },
      {
        "text": "Safe lifecycle behavior",
        "anchor": "processProcessCronRuntime-4-safe-lifecycle-behavior",
        "level": 2
      },
      {
        "text": "Cron job handoff shape",
        "anchor": "processProcessCronRuntime-5-cron-job-handoff-shape",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processProcessCronRuntime-6-continue",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processProcessCronRuntime-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processProcessCronRuntime-8-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processProcessCronRuntime-9-customization-and-extension",
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
        "title": "Concern, Owner"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "cron.operations",
      "process.scheduled-automation"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/process-cron-runtime.md",
    "sourceChecksum": "b355e6fc1c28539516879630405e6de888cbe2a6266317aaa8e769501e90dbb4",
    "sourceWordCount": 576,
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
    "active": true
  },
  "record82": {
    "code": "nodicsDocsMetadataprocessScheduledAutomation",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.scheduled-automation",
    "title": "Scheduled Automation and Cron Triggers",
    "summary": "Show how active Process triggers are executed by Cron or another authorized scheduler with correlation and audit evidence.",
    "businessSummary": "Scheduled Automation and Cron Triggers explains the business purpose, supported decisions, operational impact, and controls for the Scheduled Automation Triggers journey.",
    "technicalSummary": "Scheduled Automation and Cron Triggers records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/scheduled-automation.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessScheduledAutomation",
    "targetRoute": "nodicsDocsRouteprocessScheduledAutomation",
    "articleComponent": "nodicsDocsComponentprocessScheduledAutomation",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessscheduledautomation",
    "headings": [
      {
        "text": "Why this split exists",
        "anchor": "processScheduledAutomation-1-why-this-split-exists",
        "level": 2
      },
      {
        "text": "Trigger lifecycle",
        "anchor": "processScheduledAutomation-2-trigger-lifecycle",
        "level": 2
      },
      {
        "text": "Runtime execution contract",
        "anchor": "processScheduledAutomation-3-runtime-execution-contract",
        "level": 2
      },
      {
        "text": "Cron-owned job declaration",
        "anchor": "processScheduledAutomation-4-cron-owned-job-declaration",
        "level": 2
      },
      {
        "text": "What business users should see in Axis",
        "anchor": "processScheduledAutomation-5-what-business-users-should-see-in-axis",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processScheduledAutomation-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processScheduledAutomation-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processScheduledAutomation-8-verification",
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
        "title": "State, Meaning"
      },
      {
        "kind": "table",
        "title": "Axis concept, Backend owner, What the user controls"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "cron.operations",
      "process.process-cron-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/scheduled-automation.md",
    "sourceChecksum": "aef323b6002cac0865e9d03df4c4b7d846f4f7adc7b601e52fe7f85b6804bcaa",
    "sourceWordCount": 603,
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
    "active": true
  },
  "record83": {
    "code": "nodicsDocsMetadatadataImportExportMigration",
    "product": "nodicsDocumentationProduct",
    "documentId": "data.import-export-migration",
    "title": "Data Import, Export, and Migration",
    "summary": "Import definitions, data installation, exports, migration registers, release evidence, rollback boundaries, and customer onboarding.",
    "businessSummary": "Data Import, Export, and Migration explains the business purpose, supported decisions, operational impact, and controls for the Data Movement and Migration journey.",
    "technicalSummary": "Data Import, Export, and Migration records owning module nodics.foundation, technical module nImport, source path docs/pages/nodics.foundation/data-import-export-migration.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nImport",
    "targetPage": "nodicsDocsPagedataImportExportMigration",
    "targetRoute": "nodicsDocsRoutedataImportExportMigration",
    "articleComponent": "nodicsDocsComponentdataImportExportMigration",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportmigration",
    "headings": [
      {
        "text": "Business context",
        "anchor": "dataImportExportMigration-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "dataImportExportMigration-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "dataImportExportMigration-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Two data creation lanes",
        "anchor": "dataImportExportMigration-4-two-data-creation-lanes",
        "level": 2
      },
      {
        "text": "Module release data authoring",
        "anchor": "dataImportExportMigration-5-module-release-data-authoring",
        "level": 2
      },
      {
        "text": "Header files",
        "anchor": "dataImportExportMigration-6-header-files",
        "level": 2
      },
      {
        "text": "Record files",
        "anchor": "dataImportExportMigration-7-record-files",
        "level": 2
      },
      {
        "text": "Generated files",
        "anchor": "dataImportExportMigration-8-generated-files",
        "level": 2
      },
      {
        "text": "Release lifecycle",
        "anchor": "dataImportExportMigration-9-release-lifecycle",
        "level": 2
      },
      {
        "text": "Lifecycle and destination",
        "anchor": "dataImportExportMigration-10-lifecycle-and-destination",
        "level": 2
      },
      {
        "text": "Developer workflow",
        "anchor": "dataImportExportMigration-11-developer-workflow",
        "level": 2
      },
      {
        "text": "Guided initialization profiles",
        "anchor": "dataImportExportMigration-12-guided-initialization-profiles",
        "level": 2
      },
      {
        "text": "Provider-specific documentation rule",
        "anchor": "dataImportExportMigration-13-provider-specific-documentation-rule",
        "level": 2
      },
      {
        "text": "Media assets",
        "anchor": "dataImportExportMigration-14-media-assets",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "dataImportExportMigration-15-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "dataImportExportMigration-16-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "dataImportExportMigration-17-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "dataImportExportMigration-18-verification",
        "level": 2
      },
      {
        "text": "Current implementation coverage",
        "anchor": "dataImportExportMigration-19-current-implementation-coverage",
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
        "title": "Lane, Who uses it, Where it starts, What it is for, Authority"
      },
      {
        "kind": "table",
        "title": "Folder, Meaning"
      },
      {
        "kind": "table",
        "title": "Header part, Meaning"
      },
      {
        "kind": "table",
        "title": "File or folder, Required, Created by, Purpose"
      },
      {
        "kind": "table",
        "title": "File or folder, Created by, Purpose"
      },
      {
        "kind": "table",
        "title": "Concept, Meaning"
      },
      {
        "kind": "table",
        "title": "Rule, Contract"
      },
      {
        "kind": "table",
        "title": "Profile, Runtime owner, Typical steps, Purpose"
      },
      {
        "kind": "table",
        "title": "Provider concern, Required detail"
      },
      {
        "kind": "table",
        "title": "Customization type, Recommended path, Avoid"
      },
      {
        "kind": "table",
        "title": "Operational concern, Required documentation detail"
      },
      {
        "kind": "table",
        "title": "Data movement area, Business purpose, Required documentation"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.publishing-lifecycle",
      "docs.overview",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/data-import-export-migration.md",
    "sourceChecksum": "8b7227a5e828b871dd0a5094fde890e3849c4664799c50537dd423e66066ceb8",
    "sourceWordCount": 3553,
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
    "active": true
  },
  "record84": {
    "code": "nodicsDocsMetadataprocessActionAdapters",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.action-adapters",
    "title": "Action Adapter Contract",
    "summary": "Learn why ACTION nodes use registered declarative adapters and how customer and domain modules own business execution.",
    "businessSummary": "Action Adapter Contract explains the business purpose, supported decisions, operational impact, and controls for the Action Adapter Integration journey.",
    "technicalSummary": "Action Adapter Contract records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/action-adapters.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessActionAdapters",
    "targetRoute": "nodicsDocsRouteprocessActionAdapters",
    "articleComponent": "nodicsDocsComponentprocessActionAdapters",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessactionadapters",
    "headings": [
      {
        "text": "Safe default",
        "anchor": "processActionAdapters-1-safe-default",
        "level": 2
      },
      {
        "text": "What is not allowed",
        "anchor": "processActionAdapters-2-what-is-not-allowed",
        "level": 2
      },
      {
        "text": "Customer extension pattern",
        "anchor": "processActionAdapters-3-customer-extension-pattern",
        "level": 2
      },
      {
        "text": "QA checklist",
        "anchor": "processActionAdapters-4-qa-checklist",
        "level": 2
      },
      {
        "text": "Adapter operating contract",
        "anchor": "processActionAdapters-5-adapter-operating-contract",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processActionAdapters-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processActionAdapters-7-verification",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Concern, Required behavior, Rejection evidence"
      }
    ],
    "visualRequirements": [
      "comparison-table",
      "code-example"
    ],
    "relatedPages": [
      "process.developer-customization",
      "communication.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/action-adapters.md",
    "sourceChecksum": "69b8dbd402083354fd0a806a8f1fddeea899090b1d79820c4c6db83c68ccd771",
    "sourceWordCount": 606,
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
    "active": true
  },
  "record85": {
    "code": "nodicsDocsMetadataframeworkDevopsRuntime",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.devops-runtime",
    "title": "Runtime and DevOps operations",
    "summary": "Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance.",
    "businessSummary": "Runtime and DevOps operations explains the business purpose, supported decisions, operational impact, and controls for the Runtime and DevOps journey.",
    "technicalSummary": "Runtime and DevOps operations records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/devops-runtime.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkDevopsRuntime",
    "targetRoute": "nodicsDocsRouteframeworkDevopsRuntime",
    "articleComponent": "nodicsDocsComponentframeworkDevopsRuntime",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkdevopsruntime",
    "headings": [
      {
        "text": "Runtime map",
        "anchor": "frameworkDevopsRuntime-1-runtime-map",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkDevopsRuntime-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkDevopsRuntime-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkDevopsRuntime-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkDevopsRuntime-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkDevopsRuntime-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkDevopsRuntime-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkDevopsRuntime-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkDevopsRuntime-9-verification",
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
        "title": "Area, Owner question"
      }
    ],
    "visualRequirements": [
      "data-flow",
      "troubleshooting-matrix",
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.local-verification-checklist",
      "foundation.overview",
      "commerce.enterprise-operations",
      "framework.runtime-release-rollback",
      "framework.local-runtime-troubleshooting",
      "framework.local-browser-acceptance-journey"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/devops-runtime.md",
    "sourceChecksum": "bab9f5e395c8b41f6920210fe2923f3c80398ba2e75416d9cb0aaf9cdba9892e",
    "sourceWordCount": 584,
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
    "active": true
  },
  "record86": {
    "code": "nodicsDocsMetadataframeworkRuntimeReleaseRollback",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.runtime-release-rollback",
    "title": "Runtime Release and Rollback",
    "summary": "Release and rollback guidance for code, configuration, content, data import, generated contracts, and browser evidence.",
    "businessSummary": "Runtime Release and Rollback explains the business purpose, supported decisions, operational impact, and controls for the Runtime and DevOps journey.",
    "technicalSummary": "Runtime Release and Rollback records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/runtime-release-and-rollback.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkRuntimeReleaseRollback",
    "targetRoute": "nodicsDocsRouteframeworkRuntimeReleaseRollback",
    "articleComponent": "nodicsDocsComponentframeworkRuntimeReleaseRollback",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkruntimereleaserollback",
    "headings": [
      {
        "text": "Release flow",
        "anchor": "frameworkRuntimeReleaseRollback-1-release-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkRuntimeReleaseRollback-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkRuntimeReleaseRollback-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "frameworkRuntimeReleaseRollback-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkRuntimeReleaseRollback-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkRuntimeReleaseRollback-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkRuntimeReleaseRollback-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkRuntimeReleaseRollback-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkRuntimeReleaseRollback-9-verification",
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
        "title": "Release item, Rollback question"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/runtime-release-and-rollback.md",
    "sourceChecksum": "6e453024e4444c4827d820c355ee00f0c60adde872497bcc7f3c0ca8e83f15c9",
    "sourceWordCount": 594,
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
    "active": true
  },
  "record87": {
    "code": "nodicsDocsMetadataframeworkLocalBrowserAcceptanceJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-browser-acceptance-journey",
    "title": "Local Browser Acceptance Journey",
    "summary": "Fresh-schema browser acceptance path for Axis, documentation, Nexus, Agora, setup actions, and unpublished states.",
    "businessSummary": "Local Browser Acceptance Journey explains the business purpose, supported decisions, operational impact, and controls for the Local Verification and Acceptance journey.",
    "technicalSummary": "Local Browser Acceptance Journey records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/local-browser-acceptance-journey.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkLocalBrowserAcceptanceJourney",
    "targetRoute": "nodicsDocsRouteframeworkLocalBrowserAcceptanceJourney",
    "articleComponent": "nodicsDocsComponentframeworkLocalBrowserAcceptanceJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalbrowseracceptancejourney",
    "headings": [
      {
        "text": "Browser path",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-1-browser-path",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Operator perspective",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-4-operator-perspective",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalBrowserAcceptanceJourney-9-verification",
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
        "title": "Route, What to verify"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table"
    ],
    "relatedPages": [
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/local-browser-acceptance-journey.md",
    "sourceChecksum": "e3c60eba65d02083657b982992668b40853c3a0c9506ac3b9e8f5dbb0f234d8b",
    "sourceWordCount": 596,
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
    "active": true
  },
  "record88": {
    "code": "nodicsDocsMetadataframeworkLocalVerificationChecklist",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.local-verification-checklist",
    "title": "Local verification and acceptance checklist",
    "summary": "How to prove the local framework, customer-project servers, Axis, documentation, registry, imports, WCMS, and Cron are healthy.",
    "businessSummary": "Local verification and acceptance checklist explains the business purpose, supported decisions, operational impact, and controls for the Local Verification and Acceptance journey.",
    "technicalSummary": "Local verification and acceptance checklist records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/local-verification-checklist.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkLocalVerificationChecklist",
    "targetRoute": "nodicsDocsRouteframeworkLocalVerificationChecklist",
    "articleComponent": "nodicsDocsComponentframeworkLocalVerificationChecklist",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworklocalverificationchecklist",
    "headings": [
      {
        "text": "Acceptance flow",
        "anchor": "frameworkLocalVerificationChecklist-1-acceptance-flow",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "frameworkLocalVerificationChecklist-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "frameworkLocalVerificationChecklist-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "frameworkLocalVerificationChecklist-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "frameworkLocalVerificationChecklist-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "frameworkLocalVerificationChecklist-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "frameworkLocalVerificationChecklist-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkLocalVerificationChecklist-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkLocalVerificationChecklist-9-verification",
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
        "title": "Check, Why it matters"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.local-quick-start",
      "framework.devops-runtime",
      "process.qa-regression-guide",
      "framework.fresh-schema-setup-journey",
      "framework.local-browser-acceptance-journey",
      "framework.local-runtime-troubleshooting"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/local-verification-checklist.md",
    "sourceChecksum": "4967d849379e54e38d5f4b49beab9e5bdbb8446d8e8cac20de47910f314809b7",
    "sourceWordCount": 581,
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
    "active": true
  },
  "record89": {
    "code": "nodicsDocsMetadatacommerceEnterpriseOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.enterprise-operations",
    "title": "Commerce enterprise operations and migration",
    "summary": "Capacity, backpressure, providers, recovery, compatibility, tenant migration, rollback, legacy retirement, and production qualification guidance.",
    "businessSummary": "Commerce enterprise operations and migration explains the business purpose, supported decisions, operational impact, and controls for the Commerce Enterprise Operations journey.",
    "technicalSummary": "Commerce enterprise operations and migration records owning module nodics.commerce, technical module checkoutCore, source path docs/pages/nodics.commerce/enterprise-operations.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "checkoutCore",
    "targetPage": "nodicsDocsPagecommerceEnterpriseOperations",
    "targetRoute": "nodicsDocsRoutecommerceEnterpriseOperations",
    "articleComponent": "nodicsDocsComponentcommerceEnterpriseOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceenterpriseoperations",
    "headings": [
      {
        "text": "Operational outcome",
        "anchor": "commerceEnterpriseOperations-1-operational-outcome",
        "level": 2
      },
      {
        "text": "Beginner mental model",
        "anchor": "commerceEnterpriseOperations-2-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Capacity and backpressure",
        "anchor": "commerceEnterpriseOperations-3-capacity-and-backpressure",
        "level": 2
      },
      {
        "text": "Backup, restore, and disaster recovery",
        "anchor": "commerceEnterpriseOperations-4-backup-restore-and-disaster-recovery",
        "level": 2
      },
      {
        "text": "Compatibility and upgrades",
        "anchor": "commerceEnterpriseOperations-5-compatibility-and-upgrades",
        "level": 2
      },
      {
        "text": "Tenant migration journey",
        "anchor": "commerceEnterpriseOperations-6-tenant-migration-journey",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "commerceEnterpriseOperations-7-developer-guidance",
        "level": 2
      },
      {
        "text": "Operator and release-owner guidance",
        "anchor": "commerceEnterpriseOperations-8-operator-and-release-owner-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceEnterpriseOperations-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceEnterpriseOperations-10-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "commerceEnterpriseOperations-11-customization-and-extension",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Evidence layer, Framework proof, Deployment proof"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.overview",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/enterprise-operations.md",
    "sourceChecksum": "9e2c0b59b184702802ac511ff9f1c3632d989af8d14690f6f83536f18beb5654",
    "sourceWordCount": 1016,
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
    "active": true
  },
  "record90": {
    "code": "nodicsDocsMetadataprocessIncidentRecovery",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.incident-recovery",
    "title": "Incident, Retry, and Compensation Operations",
    "summary": "Operate failed ACTION nodes through Process-owned incidents, bounded retries, dead-letter handling, and declarative domain-owned compensation.",
    "businessSummary": "Incident, Retry, and Compensation Operations explains the business purpose, supported decisions, operational impact, and controls for the Process Incident Recovery journey.",
    "technicalSummary": "Incident, Retry, and Compensation Operations records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/incident-recovery.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessIncidentRecovery",
    "targetRoute": "nodicsDocsRouteprocessIncidentRecovery",
    "articleComponent": "nodicsDocsComponentprocessIncidentRecovery",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessincidentrecovery",
    "headings": [
      {
        "text": "The recovery lifecycle",
        "anchor": "processIncidentRecovery-1-the-recovery-lifecycle",
        "level": 2
      },
      {
        "text": "What an operator sees",
        "anchor": "processIncidentRecovery-2-what-an-operator-sees",
        "level": 2
      },
      {
        "text": "Retry safely",
        "anchor": "processIncidentRecovery-3-retry-safely",
        "level": 2
      },
      {
        "text": "Compensate safely",
        "anchor": "processIncidentRecovery-4-compensate-safely",
        "level": 2
      },
      {
        "text": "Developer contract",
        "anchor": "processIncidentRecovery-5-developer-contract",
        "level": 2
      },
      {
        "text": "Operational checklist",
        "anchor": "processIncidentRecovery-6-operational-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processIncidentRecovery-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processIncidentRecovery-8-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processIncidentRecovery-9-business-context",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processIncidentRecovery-10-customization-and-extension",
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
        "title": "Operation, Permission, Result"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix",
      "code-example"
    ],
    "relatedPages": [
      "process.runtime-lifecycle",
      "process.qa-regression-guide"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/incident-recovery.md",
    "sourceChecksum": "2f0c67f9dffe6b27b45b37319a6b609a49ff515adb22329e4c688ab710484d5e",
    "sourceWordCount": 711,
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
    "active": true
  },
  "record91": {
    "code": "nodicsDocsMetadataprocessDevopsTopology",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.devops-topology",
    "title": "DevOps and Runtime Topology",
    "summary": "Explain deployment topology, observability, fresh bootstrap evidence, and production sustainability for Process runtimes.",
    "businessSummary": "DevOps and Runtime Topology explains the business purpose, supported decisions, operational impact, and controls for the Process Runtime Topology journey.",
    "technicalSummary": "DevOps and Runtime Topology records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/devops-topology.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessDevopsTopology",
    "targetRoute": "nodicsDocsRouteprocessDevopsTopology",
    "articleComponent": "nodicsDocsComponentprocessDevopsTopology",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessdevopstopology",
    "headings": [
      {
        "text": "Runtime shape",
        "anchor": "processDevopsTopology-1-runtime-shape",
        "level": 2
      },
      {
        "text": "Fresh bootstrap evidence",
        "anchor": "processDevopsTopology-2-fresh-bootstrap-evidence",
        "level": 2
      },
      {
        "text": "What to monitor",
        "anchor": "processDevopsTopology-3-what-to-monitor",
        "level": 2
      },
      {
        "text": "Failure and recovery",
        "anchor": "processDevopsTopology-4-failure-and-recovery",
        "level": 2
      },
      {
        "text": "Release discipline",
        "anchor": "processDevopsTopology-5-release-discipline",
        "level": 2
      },
      {
        "text": "Continue",
        "anchor": "processDevopsTopology-6-continue",
        "level": 2
      },
      {
        "text": "Deployment qualification evidence",
        "anchor": "processDevopsTopology-7-deployment-qualification-evidence",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processDevopsTopology-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processDevopsTopology-9-verification",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processDevopsTopology-10-customization-and-extension",
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
        "title": "Signal, Why it matters"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "framework.devops-runtime"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/devops-topology.md",
    "sourceChecksum": "7d240ebe6dd99e9e76d8d50a9396671fdbfcee2d8dba1fdb1a98496af7429979",
    "sourceWordCount": 584,
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
    "active": true
  },
  "record92": {
    "code": "nodicsDocsMetadataprocessQaRegressionGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.qa-regression-guide",
    "title": "Process QA and Regression Guide",
    "summary": "Define backend, fresh database, Axis smoke, and negative regression checks for Process and Cron automation.",
    "businessSummary": "Process QA and Regression Guide explains the business purpose, supported decisions, operational impact, and controls for the Process Regression Evidence journey.",
    "technicalSummary": "Process QA and Regression Guide records owning module nodics.process, technical module workflow, source path docs/pages/nodics.process/qa-regression-guide.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "workflow",
    "targetPage": "nodicsDocsPageprocessQaRegressionGuide",
    "targetRoute": "nodicsDocsRouteprocessQaRegressionGuide",
    "articleComponent": "nodicsDocsComponentprocessQaRegressionGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessqaregressionguide",
    "headings": [
      {
        "text": "Minimum backend regression",
        "anchor": "processQaRegressionGuide-1-minimum-backend-regression",
        "level": 2
      },
      {
        "text": "Fresh database acceptance",
        "anchor": "processQaRegressionGuide-2-fresh-database-acceptance",
        "level": 2
      },
      {
        "text": "Manual Axis smoke checklist",
        "anchor": "processQaRegressionGuide-3-manual-axis-smoke-checklist",
        "level": 2
      },
      {
        "text": "Negative tests that matter",
        "anchor": "processQaRegressionGuide-4-negative-tests-that-matter",
        "level": 2
      },
      {
        "text": "Regression evidence matrix",
        "anchor": "processQaRegressionGuide-5-regression-evidence-matrix",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processQaRegressionGuide-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processQaRegressionGuide-7-verification",
        "level": 2
      },
      {
        "text": "Business context",
        "anchor": "processQaRegressionGuide-8-business-context",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "processQaRegressionGuide-9-customization-and-extension",
        "level": 2
      }
    ],
    "diagrams": [],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Layer, Positive proof, Negative or recovery proof"
      }
    ],
    "visualRequirements": [
      "troubleshooting-matrix",
      "command-example"
    ],
    "relatedPages": [
      "process.incident-recovery",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/qa-regression-guide.md",
    "sourceChecksum": "0c86880105908c40e68789774a7f0368e3257fa596363f9567223696b97c4f58",
    "sourceWordCount": 698,
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
    "active": true
  },
  "record93": {
    "code": "nodicsDocsMetadataframeworkCapabilityDocumentationMaturityPattern",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.capability-documentation-maturity-pattern",
    "title": "Capability documentation maturity pattern",
    "summary": "How to document concept, design-contract, partial, and operational capabilities without creating false runtime authority.",
    "businessSummary": "Capability documentation maturity pattern explains the business purpose, supported decisions, operational impact, and controls for the Documentation Contract and Quality journey.",
    "technicalSummary": "Capability documentation maturity pattern records owning module nodics.docs, technical module documentation, source path docs/pages/framework/capability-documentation-maturity-pattern.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPageframeworkCapabilityDocumentationMaturityPattern",
    "targetRoute": "nodicsDocsRouteframeworkCapabilityDocumentationMaturityPattern",
    "articleComponent": "nodicsDocsComponentframeworkCapabilityDocumentationMaturityPattern",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkcapabilitydocumentationmaturitypattern",
    "headings": [
      {
        "text": "Why this matters",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-1-why-this-matters",
        "level": 2
      },
      {
        "text": "Documentation maturity levels",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-2-documentation-maturity-levels",
        "level": 2
      },
      {
        "text": "Required page structure",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-3-required-page-structure",
        "level": 2
      },
      {
        "text": "Source-backed coverage rule",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-4-source-backed-coverage-rule",
        "level": 2
      },
      {
        "text": "Example: documenting a Workflow capability",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-5-example-documenting-a-workflow-capability",
        "level": 2
      },
      {
        "text": "Example: documenting a Commerce capability",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-6-example-documenting-a-commerce-capability",
        "level": 2
      },
      {
        "text": "Diagrams and visual guidance",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-7-diagrams-and-visual-guidance",
        "level": 2
      },
      {
        "text": "Customize and extend safely",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-8-customize-and-extend-safely",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-9-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkCapabilityDocumentationMaturityPattern-10-verification",
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
        "title": "Level, Meaning, Allowed content"
      },
      {
        "kind": "table",
        "title": "Coverage area, Required detail"
      }
    ],
    "visualRequirements": [
      "diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "docs.overview",
      "framework.customization-guide"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/capability-documentation-maturity-pattern.md",
    "sourceChecksum": "12ec14b0796becbe04fc94a91de252eda62a1cdfa65d86696236bf797fc2631c",
    "sourceWordCount": 1567,
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
    "active": true
  },
  "record94": {
    "code": "nodicsDocsMetadatadocsOverview",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.overview",
    "title": "Docs overview",
    "summary": "How Nodics framework documentation is authored, generated, validated, imported, rendered, and kept separate from Axis and customer project documentation.",
    "businessSummary": "Docs overview explains the business purpose, supported decisions, operational impact, and controls for the Documentation Runtime and Publishing journey.",
    "technicalSummary": "Docs overview records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/overview.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsOverview",
    "targetRoute": "nodicsDocsRoutedocsOverview",
    "articleComponent": "nodicsDocsComponentdocsOverview",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsoverview",
    "headings": [
      {
        "text": "Documentation model",
        "anchor": "docsOverview-1-documentation-model",
        "level": 2
      },
      {
        "text": "Business perspective",
        "anchor": "docsOverview-2-business-perspective",
        "level": 2
      },
      {
        "text": "Developer perspective",
        "anchor": "docsOverview-3-developer-perspective",
        "level": 2
      },
      {
        "text": "Continue with",
        "anchor": "docsOverview-4-continue-with",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "docsOverview-5-operational-evidence",
        "level": 2
      },
      {
        "text": "Reader and implementation contract",
        "anchor": "docsOverview-6-reader-and-implementation-contract",
        "level": 2
      },
      {
        "text": "Documentation maintenance rule",
        "anchor": "docsOverview-7-documentation-maintenance-rule",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsOverview-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsOverview-9-verification",
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
        "title": "Area, Ownership"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table"
    ],
    "relatedPages": [
      "framework.capability-documentation-maturity-pattern",
      "wcms.publishing-lifecycle",
      "docs.documentation-principles",
      "docs.reader-journey-and-coverage",
      "docs.documentation-publishing-model"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/overview.md",
    "sourceChecksum": "e522c9aab41ff1d70100d9deabcc752453d0a79f7b0e694a16d12948cf499cd3",
    "sourceWordCount": 554,
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
    "active": true
  },
  "record95": {
    "code": "nodicsDocsMetadatawcmsPublishingLifecycle",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.publishing-lifecycle",
    "title": "Staged-to-Online publishing lifecycle",
    "summary": "Author, approve, deploy, recover, and customize immutable WCMS releases across physically separated Staged and Online runtimes.",
    "businessSummary": "Staged-to-Online publishing lifecycle explains the business purpose, supported decisions, operational impact, and controls for the Content Publication Lifecycle journey.",
    "technicalSummary": "Staged-to-Online publishing lifecycle records owning module nodics.wcms, technical module cms, source path docs/pages/nodics.wcms/publishing-lifecycle.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "cms",
    "targetPage": "nodicsDocsPagewcmsPublishingLifecycle",
    "targetRoute": "nodicsDocsRoutewcmsPublishingLifecycle",
    "articleComponent": "nodicsDocsComponentwcmsPublishingLifecycle",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmspublishinglifecycle",
    "headings": [
      {
        "text": "Why separate Staged and Online",
        "anchor": "wcmsPublishingLifecycle-1-why-separate-staged-and-online",
        "level": 2
      },
      {
        "text": "Data lifecycle categories",
        "anchor": "wcmsPublishingLifecycle-2-data-lifecycle-categories",
        "level": 2
      },
      {
        "text": "Running example",
        "anchor": "wcmsPublishingLifecycle-3-running-example",
        "level": 2
      },
      {
        "text": "Site bundle shape",
        "anchor": "wcmsPublishingLifecycle-4-site-bundle-shape",
        "level": 2
      },
      {
        "text": "Initialization and reusable site bundles",
        "anchor": "wcmsPublishingLifecycle-5-initialization-and-reusable-site-bundles",
        "level": 2
      },
      {
        "text": "Security and integrity rules",
        "anchor": "wcmsPublishingLifecycle-6-security-and-integrity-rules",
        "level": 2
      },
      {
        "text": "Customization boundary",
        "anchor": "wcmsPublishingLifecycle-7-customization-boundary",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsPublishingLifecycle-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsPublishingLifecycle-9-verification",
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
        "title": "Category, Examples, Lifecycle"
      },
      {
        "kind": "table",
        "title": "Shape, Purpose"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "docs.overview"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/publishing-lifecycle.md",
    "sourceChecksum": "1696d525a966507376890389ab5f713d6a0cf3d04017d4fe20637c2f7606eb0c",
    "sourceWordCount": 1196,
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
    "active": true
  },
  "record96": {
    "code": "nodicsDocsMetadataapplicationsNexusDataContentGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "applications.nexus-data-content-guide",
    "title": "Nexus Data and Content Guide",
    "summary": "How Nexus corporate content, media, editorial, engagement, Staged publication, Online delivery, and browser validation are authored from project data releases.",
    "businessSummary": "Nexus Data and Content Guide explains the business purpose, supported decisions, operational impact, and controls for the Application Overview journey.",
    "technicalSummary": "Nexus Data and Content Guide records owning module nodics.kickoff, technical module nexus.web, source path docs/pages/applications/nexus-data-content-guide.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.kickoff",
    "technicalModule": "nexus.web",
    "targetPage": "nodicsDocsPageapplicationsNexusDataContentGuide",
    "targetRoute": "nodicsDocsRouteapplicationsNexusDataContentGuide",
    "articleComponent": "nodicsDocsComponentapplicationsNexusDataContentGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataapplicationsnexusdatacontentguide",
    "headings": [
      {
        "text": "Source map",
        "anchor": "applicationsNexusDataContentGuide-1-source-map",
        "level": 2
      },
      {
        "text": "Release layout",
        "anchor": "applicationsNexusDataContentGuide-2-release-layout",
        "level": 2
      },
      {
        "text": "Header contract",
        "anchor": "applicationsNexusDataContentGuide-3-header-contract",
        "level": 2
      },
      {
        "text": "Import and publication flow",
        "anchor": "applicationsNexusDataContentGuide-4-import-and-publication-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "applicationsNexusDataContentGuide-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "applicationsNexusDataContentGuide-6-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "applicationsNexusDataContentGuide-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "applicationsNexusDataContentGuide-8-verification",
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
        "title": "Area, Current source"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely owner, User-safe message, Technical evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "applications.suite",
      "wcms.overview",
      "wcms.media-import-publication",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/nexus-data-content-guide.md",
    "sourceChecksum": "a00f81961bbd87c0fe28dee3f17e90fc5fb902f41d73907b018028792a681706",
    "sourceWordCount": 920,
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
    "active": true
  },
  "record97": {
    "code": "nodicsDocsMetadataapplicationsAxisSetupErrorContracts",
    "product": "nodicsDocumentationProduct",
    "documentId": "applications.axis-setup-error-contracts",
    "title": "Axis Setup and User-Safe Error Contracts",
    "summary": "How Axis presents setup, retry, blocker, and initialization errors with safe business messages while preserving technical evidence for operators.",
    "businessSummary": "Axis Setup and User-Safe Error Contracts explains the business purpose, supported decisions, operational impact, and controls for the Setup and Accelerators journey.",
    "technicalSummary": "Axis Setup and User-Safe Error Contracts records owning module nodics.platform, technical module backoffice, source path docs/pages/applications/axis-setup-error-contracts.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageapplicationsAxisSetupErrorContracts",
    "targetRoute": "nodicsDocsRouteapplicationsAxisSetupErrorContracts",
    "articleComponent": "nodicsDocsComponentapplicationsAxisSetupErrorContracts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataapplicationsaxissetuperrorcontracts",
    "headings": [
      {
        "text": "Source map",
        "anchor": "applicationsAxisSetupErrorContracts-1-source-map",
        "level": 2
      },
      {
        "text": "State model",
        "anchor": "applicationsAxisSetupErrorContracts-2-state-model",
        "level": 2
      },
      {
        "text": "Error contract",
        "anchor": "applicationsAxisSetupErrorContracts-3-error-contract",
        "level": 2
      },
      {
        "text": "Setup flow",
        "anchor": "applicationsAxisSetupErrorContracts-4-setup-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "applicationsAxisSetupErrorContracts-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "applicationsAxisSetupErrorContracts-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "applicationsAxisSetupErrorContracts-7-verification",
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
        "title": "Area, Current source"
      },
      {
        "kind": "table",
        "title": "Backend condition, Axis headline, Axis detail, Technical detail"
      }
    ],
    "visualRequirements": [
      "lifecycle-state-diagram",
      "table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "axis.business-customization",
      "platform.module-registry",
      "framework.fresh-schema-setup-journey",
      "applications.suite"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/applications/axis-setup-error-contracts.md",
    "sourceChecksum": "6db1ff9e1afd069c474a4b3f97220a13dfa3648faa664dc0ae63053b2db4329d",
    "sourceWordCount": 821,
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
    "active": true
  },
  "record98": {
    "code": "nodicsDocsMetadatawcmsCmsSourceMapAuthoringContract",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.cms-source-map-authoring-contract",
    "title": "CMS Source Map and Authoring Contract",
    "summary": "Exact CMS implementation map for sites, routes, pages, components, renderers, migration, publication manifests, delivery cache, and governance.",
    "businessSummary": "CMS Source Map and Authoring Contract explains the business purpose, supported decisions, operational impact, and controls for the Content Model and Delivery journey.",
    "technicalSummary": "CMS Source Map and Authoring Contract records owning module nodics.wcms, technical module cms, source path docs/pages/nodics.wcms/cms-source-map-and-authoring-contract.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "cms",
    "targetPage": "nodicsDocsPagewcmsCmsSourceMapAuthoringContract",
    "targetRoute": "nodicsDocsRoutewcmsCmsSourceMapAuthoringContract",
    "articleComponent": "nodicsDocsComponentwcmsCmsSourceMapAuthoringContract",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmscmssourcemapauthoringcontract",
    "headings": [
      {
        "text": "Source map",
        "anchor": "wcmsCmsSourceMapAuthoringContract-1-source-map",
        "level": 2
      },
      {
        "text": "Content model",
        "anchor": "wcmsCmsSourceMapAuthoringContract-2-content-model",
        "level": 2
      },
      {
        "text": "Authoring contract",
        "anchor": "wcmsCmsSourceMapAuthoringContract-3-authoring-contract",
        "level": 2
      },
      {
        "text": "Publication and delivery",
        "anchor": "wcmsCmsSourceMapAuthoringContract-4-publication-and-delivery",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsCmsSourceMapAuthoringContract-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operational checks",
        "anchor": "wcmsCmsSourceMapAuthoringContract-6-operational-checks",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsCmsSourceMapAuthoringContract-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsCmsSourceMapAuthoringContract-8-verification",
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
        "title": "Capability, Source location"
      },
      {
        "kind": "table",
        "title": "Check, Owner, Evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.overview",
      "wcms.content-catalog-model",
      "wcms.page-designer-components",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/cms-source-map-and-authoring-contract.md",
    "sourceChecksum": "0951eb7b346d28374138aebdb77167dbd860622ce57460ff0e166903e99fabab",
    "sourceWordCount": 781,
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
    "active": true
  },
  "record99": {
    "code": "nodicsDocsMetadatawcmsMediaOperationsRunbook",
    "product": "nodicsDocumentationProduct",
    "documentId": "wcms.media-operations-runbook",
    "title": "Media Operations Runbook",
    "summary": "Operational contract for media import hydration, storage providers, publication transfer, DR replication, cleanup lifecycle, and browser delivery evidence.",
    "businessSummary": "Media Operations Runbook explains the business purpose, supported decisions, operational impact, and controls for the Media Lifecycle and Storage journey.",
    "technicalSummary": "Media Operations Runbook records owning module nodics.wcms, technical module media, source path docs/pages/nodics.wcms/media-operations-runbook.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.wcms",
    "technicalModule": "media",
    "targetPage": "nodicsDocsPagewcmsMediaOperationsRunbook",
    "targetRoute": "nodicsDocsRoutewcmsMediaOperationsRunbook",
    "articleComponent": "nodicsDocsComponentwcmsMediaOperationsRunbook",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatawcmsmediaoperationsrunbook",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "wcmsMediaOperationsRunbook-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "wcmsMediaOperationsRunbook-2-source-map",
        "level": 2
      },
      {
        "text": "Import contract",
        "anchor": "wcmsMediaOperationsRunbook-3-import-contract",
        "level": 2
      },
      {
        "text": "Storage and provider model",
        "anchor": "wcmsMediaOperationsRunbook-4-storage-and-provider-model",
        "level": 2
      },
      {
        "text": "Publication and DR",
        "anchor": "wcmsMediaOperationsRunbook-5-publication-and-dr",
        "level": 2
      },
      {
        "text": "Operations",
        "anchor": "wcmsMediaOperationsRunbook-6-operations",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "wcmsMediaOperationsRunbook-7-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "wcmsMediaOperationsRunbook-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "wcmsMediaOperationsRunbook-9-verification",
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
        "title": "Capability, Source location"
      },
      {
        "kind": "table",
        "title": "Provider area, Responsibility, Operator evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "wcms.media-management",
      "wcms.media-storage-delivery",
      "wcms.media-import-publication",
      "wcms.publishing-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.wcms/media-operations-runbook.md",
    "sourceChecksum": "b740475fc531c039dfed1e48d092e7f2ba99f9f3557915a5735529b5aabe65b7",
    "sourceWordCount": 829,
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
    "active": true
  },
  "record100": {
    "code": "nodicsDocsMetadatadataImportExportProviderGuides",
    "product": "nodicsDocumentationProduct",
    "documentId": "data.import-export-provider-guides",
    "title": "Import and Export Provider Guides",
    "summary": "Provider-level guide for JavaScript, JSON, CSV, and Excel import/export behavior, masking, parser rules, diagnostics, and extension boundaries.",
    "businessSummary": "Import and Export Provider Guides explains the business purpose, supported decisions, operational impact, and controls for the Data Movement and Migration journey.",
    "technicalSummary": "Import and Export Provider Guides records owning module nodics.foundation, technical module nImport, source path docs/pages/nodics.foundation/import-export-provider-guides.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nImport",
    "targetPage": "nodicsDocsPagedataImportExportProviderGuides",
    "targetRoute": "nodicsDocsRoutedataImportExportProviderGuides",
    "articleComponent": "nodicsDocsComponentdataImportExportProviderGuides",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadataimportexportproviderguides",
    "headings": [
      {
        "text": "Source map",
        "anchor": "dataImportExportProviderGuides-1-source-map",
        "level": 2
      },
      {
        "text": "Provider model",
        "anchor": "dataImportExportProviderGuides-2-provider-model",
        "level": 2
      },
      {
        "text": "JavaScript release data",
        "anchor": "dataImportExportProviderGuides-3-javascript-release-data",
        "level": 2
      },
      {
        "text": "JSON, CSV, and Excel",
        "anchor": "dataImportExportProviderGuides-4-json-csv-and-excel",
        "level": 2
      },
      {
        "text": "Export contract",
        "anchor": "dataImportExportProviderGuides-5-export-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "dataImportExportProviderGuides-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "dataImportExportProviderGuides-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "dataImportExportProviderGuides-8-verification",
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
        "title": "Capability, Source location"
      },
      {
        "kind": "table",
        "title": "Format, Best use, Watch point"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "data.import-export-migration",
      "wcms.media-operations-runbook",
      "framework.local-verification-checklist"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/import-export-provider-guides.md",
    "sourceChecksum": "7a61b1f82fe212a4dd698669b0c5876b9d0fb0b90145d5bf62e9cdcf74c64443",
    "sourceWordCount": 753,
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
    "active": true
  },
  "record101": {
    "code": "nodicsDocsMetadatacommerceDataAuthoringFulfillment",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.data-authoring-fulfillment",
    "title": "Commerce Data Authoring and Fulfillment",
    "summary": "How product, category, price, inventory, search, order, fulfillment, return, and refund data are authored, imported, published, and verified.",
    "businessSummary": "Commerce Data Authoring and Fulfillment explains the business purpose, supported decisions, operational impact, and controls for the Catalog Model and Publication journey.",
    "technicalSummary": "Commerce Data Authoring and Fulfillment records owning module nodics.commerce, technical module baseCommerce, source path docs/pages/nodics.commerce/commerce-data-authoring-and-fulfillment.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "baseCommerce",
    "targetPage": "nodicsDocsPagecommerceDataAuthoringFulfillment",
    "targetRoute": "nodicsDocsRoutecommerceDataAuthoringFulfillment",
    "articleComponent": "nodicsDocsComponentcommerceDataAuthoringFulfillment",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercedataauthoringfulfillment",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commerceDataAuthoringFulfillment-1-source-map",
        "level": 2
      },
      {
        "text": "Data bundle",
        "anchor": "commerceDataAuthoringFulfillment-2-data-bundle",
        "level": 2
      },
      {
        "text": "Authoring sequence",
        "anchor": "commerceDataAuthoringFulfillment-3-authoring-sequence",
        "level": 2
      },
      {
        "text": "Header and record contract",
        "anchor": "commerceDataAuthoringFulfillment-4-header-and-record-contract",
        "level": 2
      },
      {
        "text": "Fulfillment flow",
        "anchor": "commerceDataAuthoringFulfillment-5-fulfillment-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commerceDataAuthoringFulfillment-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceDataAuthoringFulfillment-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceDataAuthoringFulfillment-8-verification",
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
        "title": "Capability, Source location"
      },
      {
        "kind": "table",
        "title": "Step, Business view, Developer contract, Operator evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "catalog.product-discovery-management",
      "commerce.payment-fulfillment",
      "fulfillment.shipping-management",
      "accelerators.agora-apparel-product-data-authoring"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/commerce-data-authoring-and-fulfillment.md",
    "sourceChecksum": "5d2b5fc7a1cb924d793f1898e2ac264c0b7989e43dec7c36d828db46d8e293ef",
    "sourceWordCount": 754,
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
    "active": true
  },
  "record102": {
    "code": "nodicsDocsMetadatadocsDocumentationPublishingRunbook",
    "product": "nodicsDocumentationProduct",
    "documentId": "docs.documentation-publishing-runbook",
    "title": "Documentation Publishing Runbook",
    "summary": "Runbook for authored Markdown, catalogue metadata, generated WCMS records, Staged review, Online activation, rollback evidence, and consumer rendering.",
    "businessSummary": "Documentation Publishing Runbook explains the business purpose, supported decisions, operational impact, and controls for the Documentation Runtime and Publishing journey.",
    "technicalSummary": "Documentation Publishing Runbook records owning module nodics.docs, technical module documentation, source path docs/pages/nodics.docs/documentation-publishing-runbook.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagedocsDocumentationPublishingRunbook",
    "targetRoute": "nodicsDocsRoutedocsDocumentationPublishingRunbook",
    "articleComponent": "nodicsDocsComponentdocsDocumentationPublishingRunbook",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatadocsdocumentationpublishingrunbook",
    "headings": [
      {
        "text": "Source map",
        "anchor": "docsDocumentationPublishingRunbook-1-source-map",
        "level": 2
      },
      {
        "text": "Publishing model",
        "anchor": "docsDocumentationPublishingRunbook-2-publishing-model",
        "level": 2
      },
      {
        "text": "Authoring steps",
        "anchor": "docsDocumentationPublishingRunbook-3-authoring-steps",
        "level": 2
      },
      {
        "text": "Generated data contract",
        "anchor": "docsDocumentationPublishingRunbook-4-generated-data-contract",
        "level": 2
      },
      {
        "text": "Review and Online activation",
        "anchor": "docsDocumentationPublishingRunbook-5-review-and-online-activation",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "docsDocumentationPublishingRunbook-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "docsDocumentationPublishingRunbook-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "docsDocumentationPublishingRunbook-8-verification",
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
        "title": "Capability, Source location"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "docs.overview",
      "docs.documentation-publishing-model",
      "wcms.publishing-lifecycle",
      "reference.source-backed-documentation-coverage-audit"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.docs/documentation-publishing-runbook.md",
    "sourceChecksum": "bf505eab722000d91ad26dbdb541551d458650831b5fb41343a35fcdebc49344",
    "sourceWordCount": 690,
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
    "active": true
  },
  "record103": {
    "code": "nodicsDocsMetadataplatformModuleRegistryJourney",
    "product": "nodicsDocumentationProduct",
    "documentId": "platform.module-registry-journey",
    "title": "Module Registry Journey",
    "summary": "How installed modules become registered, activated, dependency-checked, and visible to Axis as governed business capabilities.",
    "businessSummary": "Module Registry Journey explains the business purpose, supported decisions, operational impact, and controls for the Module Registry Foundations journey.",
    "technicalSummary": "Module Registry Journey records owning module nodics.platform, technical module backoffice, source path docs/pages/nodics.platform/module-registry-journey.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.platform",
    "technicalModule": "backoffice",
    "targetPage": "nodicsDocsPageplatformModuleRegistryJourney",
    "targetRoute": "nodicsDocsRouteplatformModuleRegistryJourney",
    "articleComponent": "nodicsDocsComponentplatformModuleRegistryJourney",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataplatformmoduleregistryjourney",
    "headings": [
      {
        "text": "Source map",
        "anchor": "platformModuleRegistryJourney-1-source-map",
        "level": 2
      },
      {
        "text": "Lifecycle",
        "anchor": "platformModuleRegistryJourney-2-lifecycle",
        "level": 2
      },
      {
        "text": "Registry contract",
        "anchor": "platformModuleRegistryJourney-3-registry-contract",
        "level": 2
      },
      {
        "text": "Dependency and activation rules",
        "anchor": "platformModuleRegistryJourney-4-dependency-and-activation-rules",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "platformModuleRegistryJourney-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "platformModuleRegistryJourney-6-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "platformModuleRegistryJourney-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "platformModuleRegistryJourney-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "platform.module-registry",
      "applications.axis-setup-error-contracts",
      "framework.module-loading-service-precedence"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.platform/module-registry-journey.md",
    "sourceChecksum": "cb9429ef5dfe31f92cec00aa6f9164390c15abf565540dc5e1d79a1832f69a37",
    "sourceWordCount": 773,
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
    "active": true
  },
  "record104": {
    "code": "nodicsDocsMetadatacommerceSearchGuide",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.search-guide",
    "title": "Commerce Search Guide",
    "summary": "How commerce search projections, ranking rules, index freshness, rebuild evidence, and storefront discovery are governed.",
    "businessSummary": "Commerce Search Guide explains the business purpose, supported decisions, operational impact, and controls for the Search Providers and Indexing journey.",
    "technicalSummary": "Commerce Search Guide records owning module nodics.commerce, technical module commerceSearch, source path docs/pages/nodics.commerce/commerce-search-guide.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "commerceSearch",
    "targetPage": "nodicsDocsPagecommerceSearchGuide",
    "targetRoute": "nodicsDocsRoutecommerceSearchGuide",
    "articleComponent": "nodicsDocsComponentcommerceSearchGuide",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercesearchguide",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commerceSearchGuide-1-source-map",
        "level": 2
      },
      {
        "text": "Projection flow",
        "anchor": "commerceSearchGuide-2-projection-flow",
        "level": 2
      },
      {
        "text": "Ranking and rules",
        "anchor": "commerceSearchGuide-3-ranking-and-rules",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commerceSearchGuide-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "commerceSearchGuide-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "commerceSearchGuide-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceSearchGuide-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceSearchGuide-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "discovery.search-indexing",
      "catalog.product-discovery-management",
      "commerce.data-authoring-fulfillment"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/commerce-search-guide.md",
    "sourceChecksum": "da569e961eaf20479d0d5f1e6c16b68cf010dd3e51d29173c1d110e269e4c4ce",
    "sourceWordCount": 539,
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
    "active": true
  },
  "record105": {
    "code": "nodicsDocsMetadatalocalizationRuntimeAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "localization.runtime-authoring",
    "title": "Localization Runtime Authoring",
    "summary": "How localized records, fallback behavior, content and product translation, import data, and runtime API boundaries work.",
    "businessSummary": "Localization Runtime Authoring explains the business purpose, supported decisions, operational impact, and controls for the Localization Foundations journey.",
    "technicalSummary": "Localization Runtime Authoring records owning module nodics.localization, technical module localizationCore, source path docs/pages/nodics.localization/localization-runtime-authoring.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.localization",
    "technicalModule": "localizationCore",
    "targetPage": "nodicsDocsPagelocalizationRuntimeAuthoring",
    "targetRoute": "nodicsDocsRoutelocalizationRuntimeAuthoring",
    "articleComponent": "nodicsDocsComponentlocalizationRuntimeAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatalocalizationruntimeauthoring",
    "headings": [
      {
        "text": "Source map",
        "anchor": "localizationRuntimeAuthoring-1-source-map",
        "level": 2
      },
      {
        "text": "Resolution model",
        "anchor": "localizationRuntimeAuthoring-2-resolution-model",
        "level": 2
      },
      {
        "text": "Authoring contract",
        "anchor": "localizationRuntimeAuthoring-3-authoring-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "localizationRuntimeAuthoring-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "localizationRuntimeAuthoring-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "localizationRuntimeAuthoring-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "localizationRuntimeAuthoring-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "localizationRuntimeAuthoring-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "localization.internationalization",
      "wcms.cms-source-map-authoring-contract",
      "commerce.data-authoring-fulfillment"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.localization/localization-runtime-authoring.md",
    "sourceChecksum": "5e7a010a863fda0f09cbcf726557dd362b29541221ff150607b9e4ebd8e349a9",
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
    "active": true
  },
  "record106": {
    "code": "nodicsDocsMetadatacommercePaymentProviderBoundaries",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.payment-provider-boundaries",
    "title": "Payment Core and Provider Boundaries",
    "summary": "How Payment Core, payment methods, gateway providers, safe payloads, reconciliation, refunds, and provider extension boundaries work.",
    "businessSummary": "Payment Core and Provider Boundaries explains the business purpose, supported decisions, operational impact, and controls for the Payment Operations journey.",
    "technicalSummary": "Payment Core and Provider Boundaries records owning module nodics.commerce, technical module payment, source path docs/pages/nodics.commerce/payment-provider-boundaries.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "payment",
    "targetPage": "nodicsDocsPagecommercePaymentProviderBoundaries",
    "targetRoute": "nodicsDocsRoutecommercePaymentProviderBoundaries",
    "articleComponent": "nodicsDocsComponentcommercePaymentProviderBoundaries",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercepaymentproviderboundaries",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commercePaymentProviderBoundaries-1-source-map",
        "level": 2
      },
      {
        "text": "Boundary model",
        "anchor": "commercePaymentProviderBoundaries-2-boundary-model",
        "level": 2
      },
      {
        "text": "Safe payload contract",
        "anchor": "commercePaymentProviderBoundaries-3-safe-payload-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commercePaymentProviderBoundaries-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "commercePaymentProviderBoundaries-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "commercePaymentProviderBoundaries-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commercePaymentProviderBoundaries-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commercePaymentProviderBoundaries-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "commerce.payment-fulfillment",
      "commerce.cart-order",
      "commerce.returns-refunds"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/payment-provider-boundaries.md",
    "sourceChecksum": "e1286919850ea76d6e41f35efc89e0855dd529b90307d7b2b940d456ad46d063",
    "sourceWordCount": 533,
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
    "active": true
  },
  "record107": {
    "code": "nodicsDocsMetadataloyaltyWalletsRewardsLedger",
    "product": "nodicsDocumentationProduct",
    "documentId": "loyalty.wallets-rewards-ledger",
    "title": "Loyalty Wallets, Rewards, and Ledger",
    "summary": "Business, developer, operator, and customization guidance for reward wallets, balances, reservations, redemptions, ledger evidence, and Commerce reward payment provider integration.",
    "businessSummary": "Loyalty Wallets, Rewards, and Ledger explains the business purpose, supported decisions, operational impact, and controls for the Loyalty Foundations journey.",
    "technicalSummary": "Loyalty Wallets, Rewards, and Ledger records owning module nodics.loyalty, technical module loyaltyWallet, source path docs/pages/nodics.loyalty/loyalty-wallets-rewards-and-ledger.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.loyalty",
    "technicalModule": "loyaltyWallet",
    "targetPage": "nodicsDocsPageloyaltyWalletsRewardsLedger",
    "targetRoute": "nodicsDocsRouteloyaltyWalletsRewardsLedger",
    "articleComponent": "nodicsDocsComponentloyaltyWalletsRewardsLedger",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataloyaltywalletsrewardsledger",
    "headings": [
      {
        "text": "Beginner mental model",
        "anchor": "loyaltyWalletsRewardsLedger-1-beginner-mental-model",
        "level": 2
      },
      {
        "text": "Business problem",
        "anchor": "loyaltyWalletsRewardsLedger-2-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "loyaltyWalletsRewardsLedger-3-source-map",
        "level": 2
      },
      {
        "text": "Owner model",
        "anchor": "loyaltyWalletsRewardsLedger-4-owner-model",
        "level": 2
      },
      {
        "text": "Runtime topology",
        "anchor": "loyaltyWalletsRewardsLedger-5-runtime-topology",
        "level": 2
      },
      {
        "text": "Business journeys",
        "anchor": "loyaltyWalletsRewardsLedger-6-business-journeys",
        "level": 2
      },
      {
        "text": "Earn",
        "anchor": "loyaltyWalletsRewardsLedger-7-earn",
        "level": 3
      },
      {
        "text": "Reserve",
        "anchor": "loyaltyWalletsRewardsLedger-8-reserve",
        "level": 3
      },
      {
        "text": "Capture",
        "anchor": "loyaltyWalletsRewardsLedger-9-capture",
        "level": 3
      },
      {
        "text": "Release",
        "anchor": "loyaltyWalletsRewardsLedger-10-release",
        "level": 3
      },
      {
        "text": "Reverse",
        "anchor": "loyaltyWalletsRewardsLedger-11-reverse",
        "level": 3
      },
      {
        "text": "Reward payment provider checkout pattern",
        "anchor": "loyaltyWalletsRewardsLedger-12-reward-payment-provider-checkout-pattern",
        "level": 2
      },
      {
        "text": "Developer guidance",
        "anchor": "loyaltyWalletsRewardsLedger-13-developer-guidance",
        "level": 2
      },
      {
        "text": "Customization guidance",
        "anchor": "loyaltyWalletsRewardsLedger-14-customization-guidance",
        "level": 2
      },
      {
        "text": "Security and governance",
        "anchor": "loyaltyWalletsRewardsLedger-15-security-and-governance",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "loyaltyWalletsRewardsLedger-16-operational-evidence",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "loyaltyWalletsRewardsLedger-17-verification",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "loyaltyWalletsRewardsLedger-18-common-mistakes",
        "level": 2
      },
      {
        "text": "Reader checklist",
        "anchor": "loyaltyWalletsRewardsLedger-19-reader-checklist",
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
        "title": "Area, Source location"
      },
      {
        "kind": "table",
        "title": "Journey part, Owner"
      },
      {
        "kind": "table",
        "title": "Change, Put it here"
      },
      {
        "kind": "table",
        "title": "Evidence, Why it matters"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "command-example"
    ],
    "relatedPages": [
      "commerce.payment-provider-boundaries",
      "commerce.payment-fulfillment",
      "framework.customization-guide",
      "framework.local-browser-acceptance-journey"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.loyalty/loyalty-wallets-rewards-and-ledger.md",
    "sourceChecksum": "0bf2b29ebcd0290f7bc326d3b323d475c1d5376e3cab4806ee8f15ab6c889eef",
    "sourceWordCount": 1542,
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
    "active": true
  },
  "record108": {
    "code": "nodicsDocsMetadatacommerceShoppingListCommerceBoundary",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.shopping-list-commerce-boundary",
    "title": "Shopping List Commerce Boundary",
    "summary": "Why wishlist, compare, and save-for-later belong to Commerce while Profile remains the identity authority.",
    "businessSummary": "Shopping List Commerce Boundary explains the business purpose, supported decisions, operational impact, and controls for the Customer Data and Identity journey.",
    "technicalSummary": "Shopping List Commerce Boundary records owning module nodics.commerce, technical module shoppingList, source path docs/pages/nodics.commerce/shopping-list-commerce-boundary.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "shoppingList",
    "targetPage": "nodicsDocsPagecommerceShoppingListCommerceBoundary",
    "targetRoute": "nodicsDocsRoutecommerceShoppingListCommerceBoundary",
    "articleComponent": "nodicsDocsComponentcommerceShoppingListCommerceBoundary",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommerceshoppinglistcommerceboundary",
    "headings": [
      {
        "text": "Source map",
        "anchor": "commerceShoppingListCommerceBoundary-1-source-map",
        "level": 2
      },
      {
        "text": "Ownership model",
        "anchor": "commerceShoppingListCommerceBoundary-2-ownership-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "commerceShoppingListCommerceBoundary-3-contract",
        "level": 2
      },
      {
        "text": "Business configuration guidance",
        "anchor": "commerceShoppingListCommerceBoundary-4-business-configuration-guidance",
        "level": 2
      },
      {
        "text": "Developer extension guidance",
        "anchor": "commerceShoppingListCommerceBoundary-5-developer-extension-guidance",
        "level": 2
      },
      {
        "text": "Extending product-keeping journeys",
        "anchor": "commerceShoppingListCommerceBoundary-6-extending-product-keeping-journeys",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceShoppingListCommerceBoundary-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Migration principle",
        "anchor": "commerceShoppingListCommerceBoundary-8-migration-principle",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceShoppingListCommerceBoundary-9-verification",
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
        "title": "Use case, Suggested list type, Why it fits Shopping List"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "security.identity-access-governance",
      "commerce.cart-order",
      "commerce.payment-provider-boundaries"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/shopping-list-commerce-boundary.md",
    "sourceChecksum": "2adf3d91cabe9afdeb6856fbf9250519cbf98dd659e1263f4861404e4d5ee3b8",
    "sourceWordCount": 1093,
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
    "active": true
  },
  "record109": {
    "code": "nodicsDocsMetadatafoundationNmsRuntimeMonitoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.nms-runtime-monitoring",
    "title": "NMS Runtime Monitoring",
    "summary": "How NMS captures node health, runtime roles, responsibility, capability state, degraded conditions, and operator recovery evidence.",
    "businessSummary": "NMS Runtime Monitoring explains the business purpose, supported decisions, operational impact, and controls for the Runtime Health and Support journey.",
    "technicalSummary": "NMS Runtime Monitoring records owning module nodics.foundation, technical module nNms, source path docs/pages/nodics.foundation/nms-runtime-monitoring.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nNms",
    "targetPage": "nodicsDocsPagefoundationNmsRuntimeMonitoring",
    "targetRoute": "nodicsDocsRoutefoundationNmsRuntimeMonitoring",
    "articleComponent": "nodicsDocsComponentfoundationNmsRuntimeMonitoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationnmsruntimemonitoring",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationNmsRuntimeMonitoring-1-source-map",
        "level": 2
      },
      {
        "text": "Monitoring model",
        "anchor": "foundationNmsRuntimeMonitoring-2-monitoring-model",
        "level": 2
      },
      {
        "text": "Health contract",
        "anchor": "foundationNmsRuntimeMonitoring-3-health-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationNmsRuntimeMonitoring-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "foundationNmsRuntimeMonitoring-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationNmsRuntimeMonitoring-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationNmsRuntimeMonitoring-7-verification",
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
        "title": "Signal, Meaning, Consumer"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.devops-runtime",
      "framework.local-verification-checklist",
      "process.runtime-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/nms-runtime-monitoring.md",
    "sourceChecksum": "7794cb9d2c263ca334f4eeb67df899485ab4ec5edae5c344f946e2605699f624",
    "sourceWordCount": 516,
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
    "active": true
  },
  "record110": {
    "code": "nodicsDocsMetadatafoundationServiceRuntimeOverrides",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.service-runtime-overrides",
    "title": "Service Runtime and Override Precedence",
    "summary": "How generated services, virtual services, module graph resolution, customer overrides, fallback behavior, and extension safety work.",
    "businessSummary": "Service Runtime and Override Precedence explains the business purpose, supported decisions, operational impact, and controls for the Service Runtime and Overrides journey.",
    "technicalSummary": "Service Runtime and Override Precedence records owning module nodics.foundation, technical module nService, source path docs/pages/nodics.foundation/service-runtime-overrides.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nService",
    "targetPage": "nodicsDocsPagefoundationServiceRuntimeOverrides",
    "targetRoute": "nodicsDocsRoutefoundationServiceRuntimeOverrides",
    "articleComponent": "nodicsDocsComponentfoundationServiceRuntimeOverrides",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationserviceruntimeoverrides",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationServiceRuntimeOverrides-1-source-map",
        "level": 2
      },
      {
        "text": "Resolution flow",
        "anchor": "foundationServiceRuntimeOverrides-2-resolution-flow",
        "level": 2
      },
      {
        "text": "Precedence contract",
        "anchor": "foundationServiceRuntimeOverrides-3-precedence-contract",
        "level": 2
      },
      {
        "text": "Operational evidence",
        "anchor": "foundationServiceRuntimeOverrides-4-operational-evidence",
        "level": 2
      },
      {
        "text": "Related developer guides",
        "anchor": "foundationServiceRuntimeOverrides-5-related-developer-guides",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationServiceRuntimeOverrides-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "foundationServiceRuntimeOverrides-7-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationServiceRuntimeOverrides-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationServiceRuntimeOverrides-9-verification",
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
        "title": "Question, Evidence"
      },
      {
        "kind": "table",
        "title": "Topic, When to use it"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.module-loading-service-precedence",
      "framework.backend-extension-patterns",
      "runtime.governed-change",
      "foundation.module-to-module-communication",
      "routing.api-request-lifecycle"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/service-runtime-overrides.md",
    "sourceChecksum": "10b2b76efde639fa2f847cc550fa900c68860498a9e578e3ad7e49b2d8dd6634",
    "sourceWordCount": 601,
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
    "active": true
  },
  "record111": {
    "code": "nodicsDocsMetadatafoundationModuleToModuleCommunication",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.module-to-module-communication",
    "title": "Module-to-Module Communication",
    "summary": "How DefaultModuleService invokes local services or remote module APIs through target authority, Runtime Registry, static endpoints, internal auth, retries, circuit breakers, and bounded external HTTP calls.",
    "businessSummary": "Module-to-Module Communication explains the business purpose, supported decisions, operational impact, and controls for the Service Runtime and Overrides journey.",
    "technicalSummary": "Module-to-Module Communication records owning module nodics.foundation, technical module nService, source path docs/pages/nodics.foundation/module-to-module-communication.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nService",
    "targetPage": "nodicsDocsPagefoundationModuleToModuleCommunication",
    "targetRoute": "nodicsDocsRoutefoundationModuleToModuleCommunication",
    "articleComponent": "nodicsDocsComponentfoundationModuleToModuleCommunication",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationmoduletomodulecommunication",
    "headings": [
      {
        "text": "Source map",
        "anchor": "foundationModuleToModuleCommunication-1-source-map",
        "level": 2
      },
      {
        "text": "Invocation model",
        "anchor": "foundationModuleToModuleCommunication-2-invocation-model",
        "level": 2
      },
      {
        "text": "Local invocation",
        "anchor": "foundationModuleToModuleCommunication-3-local-invocation",
        "level": 2
      },
      {
        "text": "Remote invocation",
        "anchor": "foundationModuleToModuleCommunication-4-remote-invocation",
        "level": 2
      },
      {
        "text": "Target authority",
        "anchor": "foundationModuleToModuleCommunication-5-target-authority",
        "level": 2
      },
      {
        "text": "Headers and internal authentication",
        "anchor": "foundationModuleToModuleCommunication-6-headers-and-internal-authentication",
        "level": 2
      },
      {
        "text": "External HTTP requests",
        "anchor": "foundationModuleToModuleCommunication-7-external-http-requests",
        "level": 2
      },
      {
        "text": "Transport resilience and diagnostics",
        "anchor": "foundationModuleToModuleCommunication-8-transport-resilience-and-diagnostics",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "foundationModuleToModuleCommunication-9-customization-and-extension",
        "level": 2
      },
      {
        "text": "Developer examples",
        "anchor": "foundationModuleToModuleCommunication-10-developer-examples",
        "level": 2
      },
      {
        "text": "Operator troubleshooting",
        "anchor": "foundationModuleToModuleCommunication-11-operator-troubleshooting",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationModuleToModuleCommunication-12-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationModuleToModuleCommunication-13-verification",
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
        "title": "Runtime area, Source location, Responsibility"
      },
      {
        "kind": "table",
        "title": "Input, Normalized output"
      },
      {
        "kind": "table",
        "title": "Need, Recommended extension, Avoid"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely layer, First check"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "foundation.service-runtime-overrides",
      "routing.api-request-lifecycle",
      "framework.module-loading-service-precedence",
      "framework.backend-extension-patterns",
      "runtime.governed-change"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/module-to-module-communication.md",
    "sourceChecksum": "5b1b931b80a4698b26a65f51964b26a7ccabfbc216771c5db45795a0e82eab70",
    "sourceWordCount": 1786,
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
    "active": true
  },
  "record112": {
    "code": "nodicsDocsMetadatafoundationCacheProviderRunbooks",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.cache-provider-runbooks",
    "title": "Cache Provider Runbooks",
    "summary": "Redis, Hazelcast, node cache, key strategy, invalidation, provider health, fallback behavior, and production cache recovery guidance.",
    "businessSummary": "Cache Provider Runbooks explains the business purpose, supported decisions, operational impact, and controls for the Cache Foundations journey.",
    "technicalSummary": "Cache Provider Runbooks records owning module nodics.foundation, technical module nCache, source path docs/pages/nodics.foundation/cache-provider-runbooks.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nCache",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/cache-provider-runbooks.md",
    "sourceChecksum": "99859f8f38df2804ff39429814bb7108fc37fdcc0e4aa5e37b7711301329c663",
    "sourceWordCount": 527,
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
    "active": true
  },
  "record113": {
    "code": "nodicsDocsMetadatafoundationDatabaseProviderBoundaries",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.database-provider-boundaries",
    "title": "Database Provider Boundaries",
    "summary": "How MongoDB, virtual DB, Cassandra, Elasticsearch, schemas, query translation, indexes, migration, and provider validation are separated.",
    "businessSummary": "Database Provider Boundaries explains the business purpose, supported decisions, operational impact, and controls for the Database Provider Contracts journey.",
    "technicalSummary": "Database Provider Boundaries records owning module nodics.foundation, technical module nDatabase, source path docs/pages/nodics.foundation/database-provider-boundaries.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nDatabase",
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
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/database-provider-boundaries.md",
    "sourceChecksum": "1f14d3036b5542ebd0e35328a45d43e8b9ae2f8f76c6308ab3d3f413af68be70",
    "sourceWordCount": 526,
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
    "active": true
  },
  "record114": {
    "code": "nodicsDocsMetadatasecurityOtpSecurityFlow",
    "product": "nodicsDocumentationProduct",
    "documentId": "security.otp-security-flow",
    "title": "OTP and Security Flow",
    "summary": "OTP generation, delivery intent, verification, expiry, retry, throttling, lockout, audit, and secure frontend message behavior.",
    "businessSummary": "OTP and Security Flow explains the business purpose, supported decisions, operational impact, and controls for the Authentication and Verification journey.",
    "technicalSummary": "OTP and Security Flow records owning module nodics.foundation, technical module nOtp, source path docs/pages/nodics.platform/otp-security-flow.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nOtp",
    "targetPage": "nodicsDocsPagesecurityOtpSecurityFlow",
    "targetRoute": "nodicsDocsRoutesecurityOtpSecurityFlow",
    "articleComponent": "nodicsDocsComponentsecurityOtpSecurityFlow",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatasecurityotpsecurityflow",
    "headings": [
      {
        "text": "Source map",
        "anchor": "securityOtpSecurityFlow-1-source-map",
        "level": 2
      },
      {
        "text": "Flow",
        "anchor": "securityOtpSecurityFlow-2-flow",
        "level": 2
      },
      {
        "text": "Policy contract",
        "anchor": "securityOtpSecurityFlow-3-policy-contract",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "securityOtpSecurityFlow-4-configuration-behavior",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "securityOtpSecurityFlow-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "securityOtpSecurityFlow-6-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "securityOtpSecurityFlow-7-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "securityOtpSecurityFlow-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "securityOtpSecurityFlow-9-verification",
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
        "title": "Policy, Purpose"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "security.identity-access-governance",
      "communication.overview",
      "communication.provider-runbooks"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.platform/otp-security-flow.md",
    "sourceChecksum": "05ce678726ef82e1fd248a9a6147c4c037fca20355feb403bd7a3a90ff863d25",
    "sourceWordCount": 576,
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
    "active": true
  },
  "record115": {
    "code": "nodicsDocsMetadatacommunicationProviderRunbooks",
    "product": "nodicsDocumentationProduct",
    "documentId": "communication.provider-runbooks",
    "title": "Communication Provider Runbooks",
    "summary": "SMTP and SMS provider delivery, template, locale, suppression, retry, callback, receipt, privacy, and failure evidence guidance.",
    "businessSummary": "Communication Provider Runbooks explains the business purpose, supported decisions, operational impact, and controls for the Provider Delivery journey.",
    "technicalSummary": "Communication Provider Runbooks records owning module nodics.communication, technical module communication, source path docs/pages/nodics.communication/provider-runbooks.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.communication",
    "technicalModule": "communication",
    "targetPage": "nodicsDocsPagecommunicationProviderRunbooks",
    "targetRoute": "nodicsDocsRoutecommunicationProviderRunbooks",
    "articleComponent": "nodicsDocsComponentcommunicationProviderRunbooks",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommunicationproviderrunbooks",
    "headings": [
      {
        "text": "Source map",
        "anchor": "communicationProviderRunbooks-1-source-map",
        "level": 2
      },
      {
        "text": "Delivery flow",
        "anchor": "communicationProviderRunbooks-2-delivery-flow",
        "level": 2
      },
      {
        "text": "Provider contract",
        "anchor": "communicationProviderRunbooks-3-provider-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "communicationProviderRunbooks-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "communicationProviderRunbooks-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "communicationProviderRunbooks-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "communicationProviderRunbooks-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "communicationProviderRunbooks-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "communication.overview",
      "security.otp-security-flow",
      "engagement.contact-submission-operations"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.communication/provider-runbooks.md",
    "sourceChecksum": "440ad7047234f446fe8d08eea5bcc301b69ddd4c8b4b68436b2c9e80093144be",
    "sourceWordCount": 531,
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
    "active": true
  },
  "record116": {
    "code": "nodicsDocsMetadataengagementContactSubmissionOperations",
    "product": "nodicsDocumentationProduct",
    "documentId": "engagement.contact-submission-operations",
    "title": "Contact Submission Operations",
    "summary": "How contact forms, submissions, validation, moderation, workflow routing, notifications, retention, audit, and recovery work.",
    "businessSummary": "Contact Submission Operations explains the business purpose, supported decisions, operational impact, and controls for the Contact and Feedback journey.",
    "technicalSummary": "Contact Submission Operations records owning module nodics.engagement, technical module contactSubmission, source path docs/pages/nodics.engagement/contact-submission-operations.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.engagement",
    "technicalModule": "contactSubmission",
    "targetPage": "nodicsDocsPageengagementContactSubmissionOperations",
    "targetRoute": "nodicsDocsRouteengagementContactSubmissionOperations",
    "articleComponent": "nodicsDocsComponentengagementContactSubmissionOperations",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataengagementcontactsubmissionoperations",
    "headings": [
      {
        "text": "Source map",
        "anchor": "engagementContactSubmissionOperations-1-source-map",
        "level": 2
      },
      {
        "text": "Lifecycle",
        "anchor": "engagementContactSubmissionOperations-2-lifecycle",
        "level": 2
      },
      {
        "text": "Data contract",
        "anchor": "engagementContactSubmissionOperations-3-data-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "engagementContactSubmissionOperations-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "engagementContactSubmissionOperations-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "engagementContactSubmissionOperations-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "engagementContactSubmissionOperations-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "engagementContactSubmissionOperations-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "engagement.unified-operations",
      "engagement.governed-automation",
      "communication.provider-runbooks"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.engagement/contact-submission-operations.md",
    "sourceChecksum": "677f6f0b426f876ec4c5028db5cc936ebe0333a881fa499013e3f0f648cc240e",
    "sourceWordCount": 520,
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
    "active": true
  },
  "record117": {
    "code": "nodicsDocsMetadataprocessWorkflowBpmSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.workflow-bpm-source-map",
    "title": "Workflow and BPM Source Map",
    "summary": "How workflow definitions, transitions, human tasks, action adapters, callbacks, history, incidents, and operator visibility fit together.",
    "businessSummary": "Workflow and BPM Source Map explains the business purpose, supported decisions, operational impact, and controls for the Workflow Runtime journey.",
    "technicalSummary": "Workflow and BPM Source Map records owning module nodics.process, technical module nbpm, source path docs/pages/nodics.process/workflow-bpm-source-map.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "nbpm",
    "targetPage": "nodicsDocsPageprocessWorkflowBpmSourceMap",
    "targetRoute": "nodicsDocsRouteprocessWorkflowBpmSourceMap",
    "articleComponent": "nodicsDocsComponentprocessWorkflowBpmSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocessworkflowbpmsourcemap",
    "headings": [
      {
        "text": "Source map",
        "anchor": "processWorkflowBpmSourceMap-1-source-map",
        "level": 2
      },
      {
        "text": "Workflow model",
        "anchor": "processWorkflowBpmSourceMap-2-workflow-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "processWorkflowBpmSourceMap-3-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processWorkflowBpmSourceMap-4-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "processWorkflowBpmSourceMap-5-implementation-handoff",
        "level": 2
      },
      {
        "text": "Evidence checklist",
        "anchor": "processWorkflowBpmSourceMap-6-evidence-checklist",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processWorkflowBpmSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processWorkflowBpmSourceMap-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "process.overview",
      "process.first-workflow",
      "process.first-human-task",
      "process.action-adapters"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/workflow-bpm-source-map.md",
    "sourceChecksum": "2ecd2c4a1eb102768bcfe2d146fef6d3e30cc4cee892f326069dfa57232c6268",
    "sourceWordCount": 515,
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
    "active": true
  },
  "record118": {
    "code": "nodicsDocsMetadataprocessCronjobDataAuthoring",
    "product": "nodicsDocumentationProduct",
    "documentId": "process.cronjob-data-authoring",
    "title": "CronJob Data Authoring",
    "summary": "How CronJob records, headers, schedules, execution policy, retry, idempotency, and Process server ownership are authored and verified.",
    "businessSummary": "CronJob Data Authoring explains the business purpose, supported decisions, operational impact, and controls for the Scheduled Automation Triggers journey.",
    "technicalSummary": "CronJob Data Authoring records owning module nodics.process, technical module cronjob, source path docs/pages/nodics.process/cronjob-data-authoring.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.process",
    "technicalModule": "cronjob",
    "targetPage": "nodicsDocsPageprocessCronjobDataAuthoring",
    "targetRoute": "nodicsDocsRouteprocessCronjobDataAuthoring",
    "articleComponent": "nodicsDocsComponentprocessCronjobDataAuthoring",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataprocesscronjobdataauthoring",
    "headings": [
      {
        "text": "Source map",
        "anchor": "processCronjobDataAuthoring-1-source-map",
        "level": 2
      },
      {
        "text": "Data shape",
        "anchor": "processCronjobDataAuthoring-2-data-shape",
        "level": 2
      },
      {
        "text": "Header contract",
        "anchor": "processCronjobDataAuthoring-3-header-contract",
        "level": 2
      },
      {
        "text": "Runtime behavior",
        "anchor": "processCronjobDataAuthoring-4-runtime-behavior",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "processCronjobDataAuthoring-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "processCronjobDataAuthoring-6-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "processCronjobDataAuthoring-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "processCronjobDataAuthoring-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "cron.operations",
      "process.process-cron-runtime",
      "cron.project-customization"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.process/cronjob-data-authoring.md",
    "sourceChecksum": "e710ee81b8cbb25275377f09f5f33951ee283268efe33c201f11ce9a7a5cbed3",
    "sourceWordCount": 542,
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
    "active": true
  },
  "record119": {
    "code": "nodicsDocsMetadataframeworkReleaseUpgradeCompatibility",
    "product": "nodicsDocumentationProduct",
    "documentId": "framework.release-upgrade-compatibility",
    "title": "Release and Upgrade Compatibility",
    "summary": "How data release folders, generated manifests, immutable baselines, upgrades, rollback, checksum drift, and customer extensions are governed.",
    "businessSummary": "Release and Upgrade Compatibility explains the business purpose, supported decisions, operational impact, and controls for the Release Compatibility journey.",
    "technicalSummary": "Release and Upgrade Compatibility records owning module nodics.foundation, technical module nSetup, source path docs/pages/framework/release-upgrade-compatibility.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPageframeworkReleaseUpgradeCompatibility",
    "targetRoute": "nodicsDocsRouteframeworkReleaseUpgradeCompatibility",
    "articleComponent": "nodicsDocsComponentframeworkReleaseUpgradeCompatibility",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataframeworkreleaseupgradecompatibility",
    "headings": [
      {
        "text": "Source map",
        "anchor": "frameworkReleaseUpgradeCompatibility-1-source-map",
        "level": 2
      },
      {
        "text": "Folder contract",
        "anchor": "frameworkReleaseUpgradeCompatibility-2-folder-contract",
        "level": 2
      },
      {
        "text": "Compatibility rules",
        "anchor": "frameworkReleaseUpgradeCompatibility-3-compatibility-rules",
        "level": 2
      },
      {
        "text": "Configuration behavior",
        "anchor": "frameworkReleaseUpgradeCompatibility-4-configuration-behavior",
        "level": 2
      },
      {
        "text": "Upgrade flow",
        "anchor": "frameworkReleaseUpgradeCompatibility-5-upgrade-flow",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "frameworkReleaseUpgradeCompatibility-6-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Implementation handoff",
        "anchor": "frameworkReleaseUpgradeCompatibility-7-implementation-handoff",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "frameworkReleaseUpgradeCompatibility-8-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "frameworkReleaseUpgradeCompatibility-9-verification",
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
        "title": "Rule, Meaning"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "data.import-export-migration",
      "docs.documentation-publishing-runbook",
      "framework.runtime-release-rollback"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/framework/release-upgrade-compatibility.md",
    "sourceChecksum": "2cc031453c94eddde6fe28ebcedb0cc8fbf373841fb79765c725d39cd19924d6",
    "sourceWordCount": 570,
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
    "active": true
  },
  "record120": {
    "code": "nodicsDocsMetadatacommerceFulfillmentCoreSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "commerce.fulfillment-core-source-map",
    "title": "Fulfillment Core Source Map",
    "summary": "Exact source map for fulfillment execution, carrier adapters, return execution, integration readiness, customer policy, operator evidence, and recovery.",
    "businessSummary": "Fulfillment Core Source Map explains the business purpose, supported decisions, operational impact, and controls for the Shipping and Fulfillment Flow journey.",
    "technicalSummary": "Fulfillment Core Source Map records owning module nodics.commerce, technical module fulfillmentCore, source path docs/pages/nodics.commerce/fulfillment-core-source-map.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.commerce",
    "technicalModule": "fulfillmentCore",
    "targetPage": "nodicsDocsPagecommerceFulfillmentCoreSourceMap",
    "targetRoute": "nodicsDocsRoutecommerceFulfillmentCoreSourceMap",
    "articleComponent": "nodicsDocsComponentcommerceFulfillmentCoreSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatacommercefulfillmentcoresourcemap",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "commerceFulfillmentCoreSourceMap-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "commerceFulfillmentCoreSourceMap-2-source-map",
        "level": 2
      },
      {
        "text": "Execution flow",
        "anchor": "commerceFulfillmentCoreSourceMap-3-execution-flow",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "commerceFulfillmentCoreSourceMap-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "commerceFulfillmentCoreSourceMap-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "commerceFulfillmentCoreSourceMap-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "commerceFulfillmentCoreSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "commerceFulfillmentCoreSourceMap-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "fulfillment.shipping-management",
      "commerce.data-authoring-fulfillment",
      "commerce.payment-provider-boundaries"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.commerce/fulfillment-core-source-map.md",
    "sourceChecksum": "1ed851ffb168715ff3bc5b0806d484fc795b5d1c113bb541f84b578cda6c84ea",
    "sourceWordCount": 561,
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
    "active": true
  },
  "record121": {
    "code": "nodicsDocsMetadataacceleratorsDomainCommerceSourceMap",
    "product": "nodicsDocumentationProduct",
    "documentId": "accelerators.domain-commerce-source-map",
    "title": "Domain Commerce Accelerator Source Map",
    "summary": "How domain commerce, electronics product, telco catalog, and telco subscription accelerators extend Commerce without becoming duplicate authorities.",
    "businessSummary": "Domain Commerce Accelerator Source Map explains the business purpose, supported decisions, operational impact, and controls for the Agora Accelerator Family journey.",
    "technicalSummary": "Domain Commerce Accelerator Source Map records owning module nodics.accelerators, technical module domainCommerceCore, source path docs/pages/accelerators/domain-commerce-source-map.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.accelerators",
    "technicalModule": "domainCommerceCore",
    "targetPage": "nodicsDocsPageacceleratorsDomainCommerceSourceMap",
    "targetRoute": "nodicsDocsRouteacceleratorsDomainCommerceSourceMap",
    "articleComponent": "nodicsDocsComponentacceleratorsDomainCommerceSourceMap",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadataacceleratorsdomaincommercesourcemap",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "acceleratorsDomainCommerceSourceMap-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "acceleratorsDomainCommerceSourceMap-2-source-map",
        "level": 2
      },
      {
        "text": "Layering model",
        "anchor": "acceleratorsDomainCommerceSourceMap-3-layering-model",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "acceleratorsDomainCommerceSourceMap-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "acceleratorsDomainCommerceSourceMap-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "acceleratorsDomainCommerceSourceMap-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "acceleratorsDomainCommerceSourceMap-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "acceleratorsDomainCommerceSourceMap-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "accelerators.agora-industry-templates",
      "accelerators.agora-apparel-product-data-authoring",
      "commerce.search-guide"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/accelerators/domain-commerce-source-map.md",
    "sourceChecksum": "3abf80bc049ad5dd4798434165e7a9926d2a4997ba928d9ea37f690006033eb9",
    "sourceWordCount": 532,
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
    "active": true
  },
  "record122": {
    "code": "nodicsDocsMetadatafoundationToolingRuntimeContracts",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.tooling-runtime-contracts",
    "title": "Tooling Runtime Contracts",
    "summary": "How Nodics tooling commands, generated manifests, documentation validation, AI context, application builder contracts, and qualification gates are governed.",
    "businessSummary": "Tooling Runtime Contracts explains the business purpose, supported decisions, operational impact, and controls for the AI and Developer Enablement journey.",
    "technicalSummary": "Tooling Runtime Contracts records owning module nodics.foundation, technical module nTooling, source path docs/pages/nodics.foundation/tooling-runtime-contracts.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nTooling",
    "targetPage": "nodicsDocsPagefoundationToolingRuntimeContracts",
    "targetRoute": "nodicsDocsRoutefoundationToolingRuntimeContracts",
    "articleComponent": "nodicsDocsComponentfoundationToolingRuntimeContracts",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationtoolingruntimecontracts",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "foundationToolingRuntimeContracts-1-business-problem",
        "level": 2
      },
      {
        "text": "Source map",
        "anchor": "foundationToolingRuntimeContracts-2-source-map",
        "level": 2
      },
      {
        "text": "Tooling flow",
        "anchor": "foundationToolingRuntimeContracts-3-tooling-flow",
        "level": 2
      },
      {
        "text": "Contract",
        "anchor": "foundationToolingRuntimeContracts-4-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "foundationToolingRuntimeContracts-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Operating rules",
        "anchor": "foundationToolingRuntimeContracts-6-operating-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "foundationToolingRuntimeContracts-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "foundationToolingRuntimeContracts-8-verification",
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
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "tooling.ai-developer-enablement",
      "framework.release-upgrade-compatibility",
      "reference.source-backed-documentation-coverage-audit"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/tooling-runtime-contracts.md",
    "sourceChecksum": "68bbf0fbe03742b22d9b28adf6147f41d4e1f9c3a74dbf256fc01301593c0fdd",
    "sourceWordCount": 521,
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
    "active": true
  },
  "record123": {
    "code": "nodicsDocsMetadatafoundationEmsRuntimeClientRunbook",
    "product": "nodicsDocumentationProduct",
    "documentId": "foundation.ems-runtime-client-runbook",
    "title": "EMS Runtime and Client Runbook",
    "summary": "How EMS runtime, EMS Client, broker providers, tenant resolution, retries, event processing, and operator evidence are governed.",
    "businessSummary": "EMS Runtime and Client Runbook explains the business purpose, supported decisions, operational impact, and controls for the Events and Cluster Coordination journey.",
    "technicalSummary": "EMS Runtime and Client Runbook records owning module nodics.foundation, technical module nEms, source path docs/pages/nodics.foundation/ems-runtime-client-runbook.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nEms",
    "targetPage": "nodicsDocsPagefoundationEmsRuntimeClientRunbook",
    "targetRoute": "nodicsDocsRoutefoundationEmsRuntimeClientRunbook",
    "articleComponent": "nodicsDocsComponentfoundationEmsRuntimeClientRunbook",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatafoundationemsruntimeclientrunbook",
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
    "diagrams": [
      {
        "language": "mermaid"
      }
    ],
    "visualAssets": [
      {
        "kind": "table",
        "title": "Area, Source location"
      }
    ],
    "visualRequirements": [
      "sequence-flow",
      "table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "events.messaging-cluster-coordination",
      "communication.provider-runbooks",
      "process.workflow-bpm-source-map"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/ems-runtime-client-runbook.md",
    "sourceChecksum": "c4982d84698122883ff906c46fe1a97d64e7946f28ce5cc1d29fd427ffbad3e6",
    "sourceWordCount": 540,
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
    "active": true
  },
  "record124": {
    "code": "nodicsDocsMetadatareferenceInternalSourceBoundaryRegister",
    "product": "nodicsDocumentationProduct",
    "documentId": "reference.internal-source-boundary-register",
    "title": "Internal Source Boundary Register",
    "summary": "Owner mapping for internal provider and utility modules that are covered by broader business capability pages instead of standalone product pages.",
    "businessSummary": "Internal Source Boundary Register explains the business purpose, supported decisions, operational impact, and controls for the Source Map and Glossary journey.",
    "technicalSummary": "Internal Source Boundary Register records owning module nodics.docs, technical module documentation, source path docs/pages/reference/internal-source-boundary-register.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagereferenceInternalSourceBoundaryRegister",
    "targetRoute": "nodicsDocsRoutereferenceInternalSourceBoundaryRegister",
    "articleComponent": "nodicsDocsComponentreferenceInternalSourceBoundaryRegister",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatareferenceinternalsourceboundaryregister",
    "headings": [
      {
        "text": "Business problem",
        "anchor": "referenceInternalSourceBoundaryRegister-1-business-problem",
        "level": 2
      },
      {
        "text": "Classification flow",
        "anchor": "referenceInternalSourceBoundaryRegister-2-classification-flow",
        "level": 2
      },
      {
        "text": "Register",
        "anchor": "referenceInternalSourceBoundaryRegister-3-register",
        "level": 2
      },
      {
        "text": "Classification contract",
        "anchor": "referenceInternalSourceBoundaryRegister-4-classification-contract",
        "level": 2
      },
      {
        "text": "Customization and extension guidance",
        "anchor": "referenceInternalSourceBoundaryRegister-5-customization-and-extension-guidance",
        "level": 2
      },
      {
        "text": "Promotion rules",
        "anchor": "referenceInternalSourceBoundaryRegister-6-promotion-rules",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "referenceInternalSourceBoundaryRegister-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "referenceInternalSourceBoundaryRegister-8-verification",
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
        "title": "Internal source boundary, Covered by owner page"
      }
    ],
    "visualRequirements": [
      "diagram",
      "table",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "reference.source-backed-documentation-coverage-audit",
      "reference.documentation-gap-backlog",
      "commerce.payment-provider-boundaries",
      "discovery.search-indexing"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/reference/internal-source-boundary-register.md",
    "sourceChecksum": "52e421f35b2ec020bcd42f3fa78730347164c352d082bcd09f0f0240127fd94b",
    "sourceWordCount": 603,
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
    "active": true
  },
  "record125": {
    "code": "nodicsDocsMetadatatoolingAiDeveloperEnablement",
    "product": "nodicsDocumentationProduct",
    "documentId": "tooling.ai-developer-enablement",
    "title": "AI and Developer Tooling",
    "summary": "How AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely.",
    "businessSummary": "AI and Developer Tooling explains the business purpose, supported decisions, operational impact, and controls for the AI and Developer Enablement journey.",
    "technicalSummary": "AI and Developer Tooling records owning module nodics.foundation, technical module nSetup, source path docs/pages/nodics.foundation/ai-developer-tooling.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.foundation",
    "technicalModule": "nSetup",
    "targetPage": "nodicsDocsPagetoolingAiDeveloperEnablement",
    "targetRoute": "nodicsDocsRoutetoolingAiDeveloperEnablement",
    "articleComponent": "nodicsDocsComponenttoolingAiDeveloperEnablement",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatatoolingaideveloperenablement",
    "headings": [
      {
        "text": "Business context",
        "anchor": "toolingAiDeveloperEnablement-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "toolingAiDeveloperEnablement-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "toolingAiDeveloperEnablement-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "toolingAiDeveloperEnablement-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "toolingAiDeveloperEnablement-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "toolingAiDeveloperEnablement-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "toolingAiDeveloperEnablement-7-verification",
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
      "framework.capability-documentation-maturity-pattern",
      "docs.documentation-roadmap",
      "pipeline.business-logic-orchestration"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/nodics.foundation/ai-developer-tooling.md",
    "sourceChecksum": "a8d94b8d7116c514556516279d8872a88996deee05988bc72c440ba675767a69",
    "sourceWordCount": 1106,
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
    "active": true
  },
  "record126": {
    "code": "nodicsDocsMetadatareferenceSourceMapGlossary",
    "product": "nodicsDocumentationProduct",
    "documentId": "reference.source-map-glossary",
    "title": "Reference Source Map and Glossary",
    "summary": "Business-friendly names, technical source owners, module identifiers, common terms, and navigation-to-code references for documentation readers.",
    "businessSummary": "Reference Source Map and Glossary explains the business purpose, supported decisions, operational impact, and controls for the Source Map and Glossary journey.",
    "technicalSummary": "Reference Source Map and Glossary records owning module nodics.docs, technical module documentation, source path docs/pages/reference/source-map-glossary.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagereferenceSourceMapGlossary",
    "targetRoute": "nodicsDocsRoutereferenceSourceMapGlossary",
    "articleComponent": "nodicsDocsComponentreferenceSourceMapGlossary",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatareferencesourcemapglossary",
    "headings": [
      {
        "text": "Business context",
        "anchor": "referenceSourceMapGlossary-1-business-context",
        "level": 2
      },
      {
        "text": "Journey and ownership",
        "anchor": "referenceSourceMapGlossary-2-journey-and-ownership",
        "level": 2
      },
      {
        "text": "Data and configuration detail",
        "anchor": "referenceSourceMapGlossary-3-data-and-configuration-detail",
        "level": 2
      },
      {
        "text": "Customization and extension",
        "anchor": "referenceSourceMapGlossary-4-customization-and-extension",
        "level": 2
      },
      {
        "text": "Operations and governance",
        "anchor": "referenceSourceMapGlossary-5-operations-and-governance",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "referenceSourceMapGlossary-6-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "referenceSourceMapGlossary-7-verification",
        "level": 2
      },
      {
        "text": "Business Capability Coverage Map",
        "anchor": "referenceSourceMapGlossary-8-business-capability-coverage-map",
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
      },
      {
        "kind": "table",
        "title": "No., Business capability, Primary documentation page, Main implementation evidence"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "docs.documentation-roadmap",
      "platform.module-registry",
      "framework.customization-guide"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/reference/source-map-glossary.md",
    "sourceChecksum": "653b54f50b6aab845519becddac0b6b55b22b5f4b75b730ab3ca7bf325922e9a",
    "sourceWordCount": 2108,
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
    "active": true
  },
  "record127": {
    "code": "nodicsDocsMetadatareferenceSourceBackedDocumentationCoverageAudit",
    "product": "nodicsDocumentationProduct",
    "documentId": "reference.source-backed-documentation-coverage-audit",
    "title": "Source-Backed Documentation Coverage Audit",
    "summary": "Code-to-documentation coverage audit contract for finding missing or shallow Nodics functionality documentation across framework, projects, data, assets, and applications.",
    "businessSummary": "Source-Backed Documentation Coverage Audit explains the business purpose, supported decisions, operational impact, and controls for the Source Map and Glossary journey.",
    "technicalSummary": "Source-Backed Documentation Coverage Audit records owning module nodics.docs, technical module documentation, source path docs/pages/reference/source-backed-documentation-coverage-audit.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagereferenceSourceBackedDocumentationCoverageAudit",
    "targetRoute": "nodicsDocsRoutereferenceSourceBackedDocumentationCoverageAudit",
    "articleComponent": "nodicsDocsComponentreferenceSourceBackedDocumentationCoverageAudit",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatareferencesourcebackeddocumentationcoverageaudit",
    "headings": [
      {
        "text": "Audit method",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-1-audit-method",
        "level": 2
      },
      {
        "text": "Coverage standard",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-2-coverage-standard",
        "level": 2
      },
      {
        "text": "Audience levels",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-3-audience-levels",
        "level": 2
      },
      {
        "text": "Ownership checklist",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-4-ownership-checklist",
        "level": 2
      },
      {
        "text": "Creation and publication lanes",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-5-creation-and-publication-lanes",
        "level": 2
      },
      {
        "text": "Media and asset rule",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-6-media-and-asset-rule",
        "level": 2
      },
      {
        "text": "Error message standard",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-7-error-message-standard",
        "level": 2
      },
      {
        "text": "Fresh schema and browser proof",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-8-fresh-schema-and-browser-proof",
        "level": 2
      },
      {
        "text": "First inventory snapshot",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-9-first-inventory-snapshot",
        "level": 2
      },
      {
        "text": "Documentation backlog workflow",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-10-documentation-backlog-workflow",
        "level": 2
      },
      {
        "text": "External reference policy",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-11-external-reference-policy",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-12-common-mistakes",
        "level": 2
      },
      {
        "text": "Troubleshooting",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-13-troubleshooting",
        "level": 2
      },
      {
        "text": "Acceptance rule",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-14-acceptance-rule",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "referenceSourceBackedDocumentationCoverageAudit-15-verification",
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
        "title": "Signal, Why it matters"
      },
      {
        "kind": "table",
        "title": "Required section, Reader it helps"
      },
      {
        "kind": "table",
        "title": "Audience level, Required answer"
      },
      {
        "kind": "table",
        "title": "Ownership layer, Documentation must state"
      },
      {
        "kind": "table",
        "title": "Media layer, Meaning"
      },
      {
        "kind": "table",
        "title": "Error concern, Required detail"
      },
      {
        "kind": "table",
        "title": "Proof type, Examples"
      },
      {
        "kind": "table",
        "title": "Priority, Area, Why it is important, Documentation action"
      },
      {
        "kind": "table",
        "title": "Symptom, Likely cause, Action"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "framework.capability-documentation-maturity-pattern",
      "docs.reader-journey-and-coverage",
      "data.import-export-migration",
      "accelerators.agora-apparel-product-data-authoring"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/reference/source-backed-documentation-coverage-audit.md",
    "sourceChecksum": "4d4752d26711b9614d199cbb7c9ba6ccafcc1f4ef54bd5ec02e8e55fca97b974",
    "sourceWordCount": 2234,
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
    "active": true
  },
  "record128": {
    "code": "nodicsDocsMetadatareferenceDocumentationGapBacklog",
    "product": "nodicsDocumentationProduct",
    "documentId": "reference.documentation-gap-backlog",
    "title": "Documentation Gap Backlog",
    "summary": "Classified backlog for closing source-backed documentation gaps across runtime capabilities, data releases, media, applications, operations, and validation.",
    "businessSummary": "Documentation Gap Backlog explains the business purpose, supported decisions, operational impact, and controls for the Source Map and Glossary journey.",
    "technicalSummary": "Documentation Gap Backlog records owning module nodics.docs, technical module documentation, source path docs/pages/reference/documentation-gap-backlog.md, extension points, validation, and troubleshooting evidence.",
    "ownerFunctionalModule": "nodics.docs",
    "technicalModule": "documentation",
    "targetPage": "nodicsDocsPagereferenceDocumentationGapBacklog",
    "targetRoute": "nodicsDocsRoutereferenceDocumentationGapBacklog",
    "articleComponent": "nodicsDocsComponentreferenceDocumentationGapBacklog",
    "template": "nodicsDocumentationArticleTemplate",
    "searchMetadata": "nodicsDocsSearchpagenodicsdocsmetadatareferencedocumentationgapbacklog",
    "headings": [
      {
        "text": "Backlog flow",
        "anchor": "referenceDocumentationGapBacklog-1-backlog-flow",
        "level": 2
      },
      {
        "text": "Classification policy",
        "anchor": "referenceDocumentationGapBacklog-2-classification-policy",
        "level": 2
      },
      {
        "text": "P0 closure items",
        "anchor": "referenceDocumentationGapBacklog-3-p0-closure-items",
        "level": 2
      },
      {
        "text": "P1 closure items",
        "anchor": "referenceDocumentationGapBacklog-4-p1-closure-items",
        "level": 2
      },
      {
        "text": "P2 closure items",
        "anchor": "referenceDocumentationGapBacklog-5-p2-closure-items",
        "level": 2
      },
      {
        "text": "Closure workflow",
        "anchor": "referenceDocumentationGapBacklog-6-closure-workflow",
        "level": 2
      },
      {
        "text": "Common mistakes",
        "anchor": "referenceDocumentationGapBacklog-7-common-mistakes",
        "level": 2
      },
      {
        "text": "Verification",
        "anchor": "referenceDocumentationGapBacklog-8-verification",
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
        "title": "Classification, Meaning, Required action"
      },
      {
        "kind": "table",
        "title": "Status, Item, Source areas, Documentation outcome"
      },
      {
        "kind": "table",
        "title": "Status, Item, Source areas, Documentation outcome"
      },
      {
        "kind": "table",
        "title": "Status, Item, Source areas, Documentation outcome"
      }
    ],
    "visualRequirements": [
      "diagram",
      "configuration-table",
      "code-example",
      "troubleshooting-matrix"
    ],
    "relatedPages": [
      "reference.source-backed-documentation-coverage-audit",
      "reference.source-map-glossary",
      "framework.capability-documentation-maturity-pattern",
      "data.import-export-migration"
    ],
    "sourceRepository": "nodics.docs",
    "sourcePath": "docs/pages/reference/documentation-gap-backlog.md",
    "sourceChecksum": "2ff6c0d573938eee55b1f505f30cf337ab99fed8d74c19dfcc2c0f31560c5ac2",
    "sourceWordCount": 1452,
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
    "active": true
  }
};
