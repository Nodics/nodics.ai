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
    "code": "nodicsDocsComponentlocalizationInternationalization",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "localization.internationalization",
      "title": "Localization and Internationalization",
      "route": "/docs/framework/localization-internationalization",
      "section": "localization-and-internationalization",
      "sectionTitle": "Localization and Internationalization",
      "group": "localization-and-internationalization",
      "groupTitle": "Localization and Internationalization",
      "parentId": "localization-and-internationalization",
      "hierarchyPath": [
        "Localization and Internationalization",
        "Localization and Internationalization"
      ],
      "hierarchyDepth": 2,
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
      "summary": "Locales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences.",
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
        "wcms.overview",
        "commerce.cart-order",
        "docs.documentation-roadmap"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
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
        "localization-and-internationalization",
        "localized-experience-management",
        "localization-and-internationalization"
      ],
      "topicKeywords": [
        "Localization and Internationalization",
        "Localized Experience Management",
        "Localization and Internationalization"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Locales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "Global enterprises need localized labels, content, messages, and commerce data without duplicating business logic or hardcoding text in applications. Nodics stores language-sensitive values as governed data, validates fallback behavior, and lets Axis and Nexus render locale-specific experience from backend records and publication state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "localizationInternationalization-1-business-context"
        },
        {
          "kind": "paragraph",
          "text": "For a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed."
        },
        {
          "kind": "table",
          "headers": [
            "Business question",
            "Answer for this topic"
          ],
          "rows": [
            [
              "What problem does it solve?",
              "Global enterprises need localized labels, content, messages, and commerce data without duplicating business logic or hardcoding text in applications."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Nodics stores language-sensitive values as governed data, validates fallback behavior, and lets Axis and Nexus render locale-specific experience from backend records and publication state."
            ],
            [
              "What must be governed?",
              "Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Journey and ownership",
          "anchor": "localizationInternationalization-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Localization owns message keys, values, releases, and fallback policy. CMS and Commerce own domain records that may carry localized fields. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Responsibility",
            "Owner",
            "Notes"
          ],
          "rows": [
            [
              "Business capability name",
              "Localization and Internationalization",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.localization",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "localization",
              "Holds the relevant schema, service, router, data, or contract detail where applicable."
            ],
            [
              "Axis experience",
              "Backend-declared workspace",
              "Axis renders metadata and actions but does not become the authority."
            ],
            [
              "Public experience",
              "Online content delivery",
              "Nexus renders only records approved for public access."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data and configuration detail",
          "anchor": "localizationInternationalization-3-data-and-configuration-detail"
        },
        {
          "kind": "paragraph",
          "text": "Every topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override."
        },
        {
          "kind": "table",
          "headers": [
            "Detail area",
            "What to document",
            "Verification signal"
          ],
          "rows": [
            [
              "Model or record",
              "Type code, catalog, tenant, enterprise, state, owner, and lifecycle.",
              "Schema contract or generated model test."
            ],
            [
              "Configuration key",
              "Default value, override location, environment scope, and runtime impact.",
              "Config validation and runtime refresh evidence."
            ],
            [
              "API or event",
              "Route/event name, payload boundary, permission, idempotency, and failure mode.",
              "Route, service, event, and authorization tests."
            ],
            [
              "Publication and access",
              "Staged/Online state, access mode, roles, groups, and permissions.",
              "Content-pack validation and access-policy test."
            ]
          ]
        },
        {
          "kind": "code",
          "language": "js",
          "text": "localization: { key: \"checkout.placeOrder\", locale: \"en\", fallbackLocale: \"en\", owner: \"checkout\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "localizationInternationalization-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Developers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself."
        },
        {
          "kind": "table",
          "headers": [
            "Customization type",
            "Recommended path",
            "Avoid"
          ],
          "rows": [
            [
              "Business label, navigation, or content area",
              "Axis-managed content catalog item with publication workflow.",
              "Hardcoding labels or page trees in the frontend."
            ],
            [
              "Runtime setting",
              "Module configuration with validation and governed runtime propagation.",
              "Editing node-local files on each server by hand."
            ],
            [
              "Domain behavior",
              "Extension service, validator, pipeline step, or provider adapter.",
              "Forking the standard module for customer-only logic."
            ],
            [
              "Public visibility",
              "Access policy with public/authenticated/role-based state.",
              "Exposing internal or draft pages through Nexus."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operations and governance",
          "anchor": "localizationInternationalization-5-operations-and-governance"
        },
        {
          "kind": "paragraph",
          "text": "Operators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected."
        },
        {
          "kind": "table",
          "headers": [
            "Operational concern",
            "Required documentation detail"
          ],
          "rows": [
            [
              "Security",
              "Authentication mode, permission code, role/group, tenant and enterprise isolation."
            ],
            [
              "Audit",
              "Actor, timestamp, source record, checksum, approval, route/event, and result."
            ],
            [
              "Resilience",
              "Retry, idempotency, compensation, fallback, cache invalidation, and rollback."
            ],
            [
              "Observability",
              "Logs, metrics, dashboard cards, health checks, and support evidence."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "localizationInternationalization-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a friendly navigation label as the technical source owner.",
            "Writing only developer details and skipping the business decision that the page supports.",
            "Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.",
            "Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.",
            "Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.",
            "Changing runtime behavior without explaining production impact, cluster propagation, and rollback.",
            "Leaving CMS documentation without source evidence, validation commands, and maturity state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "localizationInternationalization-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required."
        },
        {
          "kind": "paragraph",
          "text": "For implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current implementation coverage",
          "anchor": "localizationInternationalization-8-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Localization covers language-ready application behavior, not only translated strings. The current implementation includes localization keys, values, releases, online pointers, contribution import, override policy, message validation, translation memory, machine translation ports, publication adapters, and operations services. Commerce, WCMS, Editorial, Process, Axis, and Nexus can contribute localized messages while the localization capability keeps release and publication ownership clear."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Owner[\"Owning module contribution\"] --> Key[\"Localization key\"]\n  Key --> Value[\"Locale value\"]\n  Value --> Validation[\"Message validation\"]\n  Validation --> Release[\"Localization release\"]\n  Release --> Pointer[\"Online pointer\"]\n  Pointer --> Runtime[\"Axis, Nexus, or API runtime text\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Business purpose",
            "Developer extension"
          ],
          "rows": [
            [
              "LocalizationKey",
              "Stable message identity and namespace.",
              "Add module-owned keys with clear exposure policy."
            ],
            [
              "LocalizationValue",
              "Locale-specific message text and completeness.",
              "Add locale values, fallback rules, and validation."
            ],
            [
              "Release and online pointer",
              "Controlled promotion of approved text.",
              "Extend publication adapter and release validation."
            ],
            [
              "Translation memory port",
              "Reuse approved translation suggestions.",
              "Add provider adapter without making it authoritative."
            ],
            [
              "Override policy",
              "Govern project-specific wording changes.",
              "Document owner, scope, and conflict handling."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Business users should see missing translations, release readiness, approval state, language fallback, and public/authenticated visibility. Developers must document parameter names, ICU-style placeholders where used, maximum length, HTML allowance, locale fallback, import/export behavior, and whether the message can be exposed publicly. Operators should verify that Online text is released, not draft, and that customer-facing pages do not mix locales."
        },
        {
          "kind": "paragraph",
          "text": "Implementation evidence comes from localization operations tests, contribution service tests, import/export and publication services, release management, message validation, translation memory port, configured contributions, and generated schema contracts for LocalizationKey, LocalizationValue, LocalizationRelease, and LocalizationOnlinePointer."
        }
      ],
      "searchText": "Localization and Internationalization Locales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences. # Localization and Internationalization\n\nLocales, translations, fallback behavior, localized content, project overrides, and release validation for multilingual customer experiences. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nGlobal enterprises need localized labels, content, messages, and commerce data without duplicating business logic or hardcoding text in applications. Nodics stores language-sensitive values as governed data, validates fallback behavior, and lets Axis and Nexus render locale-specific experience from backend records and publication state.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | Global enterprises need localized labels, content, messages, and commerce data without duplicating business logic or hardcoding text in applications. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Nodics stores language-sensitive values as governed data, validates fallback behavior, and lets Axis and Nexus render locale-specific experience from backend records and publication state. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nLocalization owns message keys, values, releases, and fallback policy. CMS and Commerce own domain records that may carry localized fields. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Localization and Internationalization | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.localization | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | localization | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\nlocalization: { key: \"checkout.placeOrder\", locale: \"en\", fallbackLocale: \"en\", owner: \"checkout\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nLocalization covers language-ready application behavior, not only translated strings. The current implementation includes localization keys, values, releases, online pointers, contribution import, override policy, message validation, translation memory, machine translation ports, publication adapters, and operations services. Commerce, WCMS, Editorial, Process, Axis, and Nexus can contribute localized messages while the localization capability keeps release and publication ownership clear.\n\n```mermaid\nflowchart LR\n  Owner[\"Owning module contribution\"] --> Key[\"Localization key\"]\n  Key --> Value[\"Locale value\"]\n  Value --> Validation[\"Message validation\"]\n  Validation --> Release[\"Localization release\"]\n  Release --> Pointer[\"Online pointer\"]\n  Pointer --> Runtime[\"Axis, Nexus, or API runtime text\"]\n```\n\n| Area | Business purpose | Developer extension |\n| --- | --- | --- |\n| LocalizationKey | Stable message identity and namespace. | Add module-owned keys with clear exposure policy. |\n| LocalizationValue | Locale-specific message text and completeness. | Add locale values, fallback rules, and validation. |\n| Release and online pointer | Controlled promotion of approved text. | Extend publication adapter and release validation. |\n| Translation memory port | Reuse approved translation suggestions. | Add provider adapter without making it authoritative. |\n| Override policy | Govern project-specific wording changes. | Document owner, scope, and conflict handling. |\n\nBusiness users should see missing translations, release readiness, approval state, language fallback, and public/authenticated visibility. Developers must document parameter names, ICU-style placeholders where used, maximum length, HTML allowance, locale fallback, import/export behavior, and whether the message can be exposed publicly. Operators should verify that Online text is released, not draft, and that customer-facing pages do not mix locales.\n\nImplementation evidence comes from localization operations tests, contribution service tests, import/export and publication services, release management, message validation, translation memory port, configured contributions, and generated schema contracts for LocalizationKey, LocalizationValue, LocalizationRelease, and LocalizationOnlinePointer.\n",
      "previous": {
        "title": "Governed Runtime Change Capability",
        "route": "/docs/framework/runtime-governed-change"
      },
      "next": {
        "title": "Data Modeling and Schema Management",
        "route": "/docs/framework/schema-data-modeling-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.localization",
        "technicalModule": "localizationCore",
        "owner": "localizationCore",
        "sourcePath": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
        "wordCount": 1344,
        "checksum": "bf0e5a6fb49094b0cc015af07751742d4c0509bdbebb3e0d022e95a5ec18fafa"
      },
      "slug": "localization-internationalization",
      "locale": "en",
      "navigationGroup": "Localized Experience Management",
      "navigationGroupCode": "localized-experience-management",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "wcms.overview",
          "owner": "wcms"
        },
        {
          "documentId": "commerce.cart-order",
          "owner": "checkoutCore"
        },
        {
          "documentId": "docs.documentation-roadmap",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentlocalizationRuntimeAuthoring",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "localization.runtime-authoring",
      "title": "Localization Runtime Authoring",
      "route": "/docs/framework/localization-runtime-authoring",
      "section": "localization-and-internationalization",
      "sectionTitle": "Localization and Internationalization",
      "group": "localization-and-internationalization",
      "groupTitle": "Localization and Internationalization",
      "parentId": "localization-and-internationalization",
      "hierarchyPath": [
        "Localization and Internationalization",
        "Localization Runtime Authoring"
      ],
      "hierarchyDepth": 2,
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
      "summary": "How localized records, fallback behavior, content and product translation, import data, and runtime API boundaries work.",
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
        "localization.internationalization",
        "wcms.cms-source-map-authoring-contract",
        "commerce.data-authoring-fulfillment"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "../../../nodics.wcms/modules/cms/src/service/localization/defaultCmsContentLocalizationService.js",
        "../../../nodics.foundation/modules/nData/nImport/import/src/service/import/defaultImportService.js",
        "../../../../nodics.kickoff/modules/agora.apparel/data/sample-v001/commerce/records",
        "src/schemas",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "localization",
        "fallback",
        "locale",
        "translation",
        "authoring"
      ],
      "topicKeywords": [
        "Localization and Internationalization",
        "Localization Foundations",
        "Localization Runtime Authoring"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Localization has three distinct owner contracts: CMS component property variants, Product/category/variant business localizations, and UI/message key-value releases. They share locale concepts, not one fallback algorithm or one publication model. Preserve a shared business identity, author translations through its owner, and verify the actual resolver rather than assume every missing translation falls back to base text. For beginners, first decide whether the text belongs to a CMS component, a business product or a UI message. Follow that owner's record and header example, then compare exact, partial, missing and unsupported-locale results. Verify the published result through the matching delivery contract rather than treating a saved translation as a globally available bundle."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "localizationRuntimeAuthoring-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Owner",
            "Exact framework source"
          ],
          "rows": [
            [
              "CMS variants",
              "`nodics.wcms/modules/cms/src/schemas/schemas.js`; `src/service/localization/defaultCmsContentLocalizationService.js` under that owner."
            ],
            [
              "Product variants",
              "`nodics.commerce/modules/baseCommerce/modules/product/src/schemas/schemas.js`; `src/service/defaultProductLocalizationPolicyService.js` under that owner."
            ],
            [
              "UI/message schemas and import",
              "`nodics.localization/modules/localizationCore/src/schemas/schemas.js`; `src/service/defaultLocalizationContributionService.js`, `defaultLocalizationImportExportService.js` under that owner."
            ],
            [
              "UI release construction",
              "`nodics.localization/modules/localizationCore/src/service/defaultLocalizationReleaseManagementService.js` and its repository port."
            ],
            [
              "Public API and secured management",
              "`nodics.localization/modules/localizationApi/src/router/routers.js`, `src/controller/defaultLocalizationApiController.js`, `src/facade/defaultLocalizationApiFacade.js`, `src/service/defaultLocalizationBundleService.js` under that owner."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Resolution model",
          "anchor": "localizationRuntimeAuthoring-2-resolution-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Locale[\"Requested locale\"] --> CMS[\"CMS: selected exact/fallback variant + shared properties\"]\n  Locale --> Product[\"Product: selected READY localization or missing\"]\n  Locale --> UI[\"UI: published immutable bundle for requested scope\"]\n  CMS --> CMSMeta[\"requestedLocale, resolvedLocale, fallbackUsed, missing\"]\n  Product --> ProductMeta[\"value and resolution metadata; no base merge here\"]\n  UI --> Entries[\"Public-exposure namespace entries or unavailable release\"]"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is consistent customer communication. A missing locale can break a product page, legal message, email, or content route. Developers need a repeatable record shape. Operators need evidence for fallback behavior in production so missing translations do not appear as broken pages."
        },
        {
          "kind": "table",
          "headers": [
            "Owner / worked policy",
            "Exact, fallback and missing result",
            "Unsupported / partial behavior"
          ],
          "rows": [
            [
              "CMS: supported en/fr, fallbacks [en]; shared {title:'Shared',body:'Shared body'}; en {title:'English'}; fr {title:'Francais'}.",
              "fr selects fr and merges only that variant over shared properties; no fr variant selects en with fallbackUsed:true; no eligible variant uses shared properties with missing:true.",
              "de is rejected with ERR_CMS_00107 when supportedLocales is constrained. Partial fr leaves shared body, not en.body. requiredLocales declarations can reject missing mandatory properties during validation."
            ],
            [
              "Product: supported en/fr; fallbacks [en]; only en READY {name:'Dress'}.",
              "fr resolves en with fallbackUsed:true; fr READY wins if present; no READY locale yields value:undefined and missing:true.",
              "validate rejects unsupported locale ERR_PRODUCT_L10N_0003, but resolve itself builds requested/fallback chain without a supported-locale gate. Resolver does not merge partial fields or base data. completeness requires configured locales READY and required fields; missing locale/field yields ERR_PRODUCT_L10N_0006/0007."
            ],
            [
              "UI/messages: APPROVED values, STANDARD then matching PROJECT then TENANT precedence.",
              "build emits only keys with eligible values; incomplete default locale blocks by default. A published bundle returns its stored entries for the requested namespaces/exposures, not a per-key CMS/Product fallback chain.",
              "Non-default missing keys may be absent; defaultMessage is not automatically emitted by this builder. No Online release yields ERR_LAPI_00001. Bundle service bounds inputs but does not itself enforce a global supported-locale list or compare requested locale/channel against every loaded release field; verify repository/transport scope rather than claim that guard here."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Authoring contract",
          "anchor": "localizationRuntimeAuthoring-3-authoring-contract"
        },
        {
          "kind": "paragraph",
          "text": "CMS owns cmsComponentLocalization (componentCode, locale, properties, DRAFT/READY), with localized:true declarations and requiredLocales in cmsTypeCode.propertySchema. Product owns productLocalization, categoryLocalization and productVariantLocalization: tenant, owner code, locale, status DRAFT/READY and revision; required fields depend on schema and completeness policy. UI localizationKey definitions and localizationValue drafts are non-versioned authoring records; APPROVED values feed an immutable localizationRelease and localizationOnlinePointer. Importing a READY record is not publication approval."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Example developer headers for existing business-data schemas.\nmodule.exports = {\n  cms: { componentLocales: {\n    options: { enabled: true, schemaName: 'cmsComponentLocalization', operation: 'saveAll', dataFilePrefix: 'catalogComponentLocaleData' },\n    query: { code: '$code', tenant: '$tenant', catalogVersion: '$catalogVersion' }\n  } },\n  product: { productLocales: {\n    options: { enabled: true, schemaName: 'productLocalization', operation: 'saveAll', dataFilePrefix: 'catalogProductLocaleData' },\n    query: { code: '$code', tenant: '$tenant' }\n  } }\n};"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Separate record files matching the respective header prefixes.\nconst cmsRecords = { bannerFr: {\n  code: 'banner_fr', tenant: 'demo', catalogVersion: 'Staged',\n  componentCode: 'banner', locale: 'fr', properties: { title: 'Catalogue' }, status: 'DRAFT'\n} }; // The banner type must declare title.localized:true.\nconst productRecords = { dressEn: {\n  code: 'linenDress_en', tenant: 'demo', productCode: 'linenDress',\n  locale: 'en', name: 'Linen Dress', description: 'Woven dress', status: 'DRAFT', revision: 0\n} };\n// Export the appropriate object from each record file; run owner validation before READY/publication."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// UI/message contribution envelope for importContribution; not a CMS header.\nconst contribution = {\n  formatVersion: 1, ownerModule: 'localizationCore', entries: [{\n    namespace: 'catalog', key: 'empty', defaultMessage: 'No products',\n    parameters: [], exposure: 'PUBLIC', protected: false,\n    overrideScopes: ['STANDARD', 'PROJECT', 'TENANT']\n  }]\n};\n// A separate localizationValue draft for the same key:\nconst value = { code: 'catalogEmptyFr', namespace: 'catalog', key: 'empty',\n  locale: 'fr', message: 'Aucun produit', state: 'DRAFT', revision: 0,\n  scopeType: 'TENANT', scopeCode: 'demo', auditTrail: [] };\n// Import validates contribution identity/exposure/message and upserts keys idempotently.\n// Draft -> review -> APPROVED -> build immutable release -> governed publish; do not seed an Online pointer."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "localizationRuntimeAuthoring-4-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can add locale providers, fallback strategies, field validators, translation workflow hooks, and locale-specific formatting. Business users should see missing translation tasks and approval state in Axis. AI tools can assist translation, but they must preserve stable keys, source locale, review state, and terminology rules. Operators should track fallback rates and missing locale counts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "localizationRuntimeAuthoring-5-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "Public GET /localization/bundles/:locale accepts bounded namespaces, scopeCode and channel filters; tenant stays server-resolved, not body-selected. The controller maps filters; the bundle service requires tenant/scope/channel/locale, nonempty namespace list (default maximum 50), and namespace grammar, loads the Online pointer and validates the immutable release. It filters to configured publicExposures (default PUBLIC), limits keys (default 10000), returns locale/scope/channel/releaseVersion/entries, and derives ETag from checksum; a matching If-None-Match returns 304. Gzip is transport encoding, not a separate release."
        },
        {
          "kind": "paragraph",
          "text": "The public facade is read-only and does not expose draft schema CRUD. Contribution import/export and authoring, review, approve, build, publish and rollback routes are authenticated management operations with distinct permissions in localizationApi routers; publish/rollback delegate to nPublish. Example public request: GET /localization/bundles/fr?scopeCode=catalogStore&channel=web&namespaces=catalog. Scope/channel filters are inputs, not authorization evidence; prove selected repository pointer tenant/scope/channel/locale isolation. A checksum proves release integrity, not translation quality, correct fallback, or external cache freshness."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Evidence checklist",
          "anchor": "localizationRuntimeAuthoring-6-evidence-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Every localization change should carry source locale, target locale, field list, reviewer, fallback decision, and the consuming route or API. Production operators should know whether a fallback was expected or caused by missing data. Developers should include tests for partial translation because mixed content is common during rollout. Business users should be able to see which terms are ready for publication and which still need review."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "localizationRuntimeAuthoring-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Duplicating entire products or pages per locale instead of localizing fields.",
            "Publishing translated content before business review.",
            "Forgetting fallback rules for emails, pages, and product cards.",
            "Mixing locale data with currency, pricing, or tax authority.",
            "Hiding missing translation counts from production monitoring."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "localizationRuntimeAuthoring-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Import base and localized records into a fresh schema. Request exact locale, fallback locale, and unsupported locale responses. Open Axis, Nexus, or Agora in the browser and verify labels, pages, products, and empty states. Production readiness requires developer tests, business review evidence, operator fallback metrics, and QA proof for each supported locale."
        }
      ],
      "searchText": "Localization Runtime Authoring How localized records, fallback behavior, content and product translation, import data, and runtime API boundaries work. # Localization Runtime Authoring\n\nLocalization has three distinct owner contracts: CMS component property variants, Product/category/variant business localizations, and UI/message key-value releases. They share locale concepts, not one fallback algorithm or one publication model. Preserve a shared business identity, author translations through its owner, and verify the actual resolver rather than assume every missing translation falls back to base text. For beginners, first decide whether the text belongs to a CMS component, a business product or a UI message. Follow that owner's record and header example, then compare exact, partial, missing and unsupported-locale results. Verify the published result through the matching delivery contract rather than treating a saved translation as a globally available bundle.\n\n## Source map\n\n| Owner | Exact framework source |\n| --- | --- |\n| CMS variants | `nodics.wcms/modules/cms/src/schemas/schemas.js`; `src/service/localization/defaultCmsContentLocalizationService.js` under that owner. |\n| Product variants | `nodics.commerce/modules/baseCommerce/modules/product/src/schemas/schemas.js`; `src/service/defaultProductLocalizationPolicyService.js` under that owner. |\n| UI/message schemas and import | `nodics.localization/modules/localizationCore/src/schemas/schemas.js`; `src/service/defaultLocalizationContributionService.js`, `defaultLocalizationImportExportService.js` under that owner. |\n| UI release construction | `nodics.localization/modules/localizationCore/src/service/defaultLocalizationReleaseManagementService.js` and its repository port. |\n| Public API and secured management | `nodics.localization/modules/localizationApi/src/router/routers.js`, `src/controller/defaultLocalizationApiController.js`, `src/facade/defaultLocalizationApiFacade.js`, `src/service/defaultLocalizationBundleService.js` under that owner. |\n\n## Resolution model\n\n```mermaid\nflowchart TD\n  Locale[\"Requested locale\"] --> CMS[\"CMS: selected exact/fallback variant + shared properties\"]\n  Locale --> Product[\"Product: selected READY localization or missing\"]\n  Locale --> UI[\"UI: published immutable bundle for requested scope\"]\n  CMS --> CMSMeta[\"requestedLocale, resolvedLocale, fallbackUsed, missing\"]\n  Product --> ProductMeta[\"value and resolution metadata; no base merge here\"]\n  UI --> Entries[\"Public-exposure namespace entries or unavailable release\"]\n```\n\nThe business problem is consistent customer communication. A missing locale can break a product page, legal message, email, or content route. Developers need a repeatable record shape. Operators need evidence for fallback behavior in production so missing translations do not appear as broken pages.\n\n| Owner / worked policy | Exact, fallback and missing result | Unsupported / partial behavior |\n| --- | --- | --- |\n| CMS: supported en/fr, fallbacks [en]; shared {title:'Shared',body:'Shared body'}; en {title:'English'}; fr {title:'Francais'}. | fr selects fr and merges only that variant over shared properties; no fr variant selects en with fallbackUsed:true; no eligible variant uses shared properties with missing:true. | de is rejected with ERR_CMS_00107 when supportedLocales is constrained. Partial fr leaves shared body, not en.body. requiredLocales declarations can reject missing mandatory properties during validation. |\n| Product: supported en/fr; fallbacks [en]; only en READY {name:'Dress'}. | fr resolves en with fallbackUsed:true; fr READY wins if present; no READY locale yields value:undefined and missing:true. | validate rejects unsupported locale ERR_PRODUCT_L10N_0003, but resolve itself builds requested/fallback chain without a supported-locale gate. Resolver does not merge partial fields or base data. completeness requires configured locales READY and required fields; missing locale/field yields ERR_PRODUCT_L10N_0006/0007. |\n| UI/messages: APPROVED values, STANDARD then matching PROJECT then TENANT precedence. | build emits only keys with eligible values; incomplete default locale blocks by default. A published bundle returns its stored entries for the requested namespaces/exposures, not a per-key CMS/Product fallback chain. | Non-default missing keys may be absent; defaultMessage is not automatically emitted by this builder. No Online release yields ERR_LAPI_00001. Bundle service bounds inputs but does not itself enforce a global supported-locale list or compare requested locale/channel against every loaded release field; verify repository/transport scope rather than claim that guard here. |\n\n## Authoring contract\n\nCMS owns cmsComponentLocalization (componentCode, locale, properties, DRAFT/READY), with localized:true declarations and requiredLocales in cmsTypeCode.propertySchema. Product owns productLocalization, categoryLocalization and productVariantLocalization: tenant, owner code, locale, status DRAFT/READY and revision; required fields depend on schema and completeness policy. UI localizationKey definitions and localizationValue drafts are non-versioned authoring records; APPROVED values feed an immutable localizationRelease and localizationOnlinePointer. Importing a READY record is not publication approval.\n\n```js\n// Example developer headers for existing business-data schemas.\nmodule.exports = {\n  cms: { componentLocales: {\n    options: { enabled: true, schemaName: 'cmsComponentLocalization', operation: 'saveAll', dataFilePrefix: 'catalogComponentLocaleData' },\n    query: { code: '$code', tenant: '$tenant', catalogVersion: '$catalogVersion' }\n  } },\n  product: { productLocales: {\n    options: { enabled: true, schemaName: 'productLocalization', operation: 'saveAll', dataFilePrefix: 'catalogProductLocaleData' },\n    query: { code: '$code', tenant: '$tenant' }\n  } }\n};\n```\n\n```js\n// Separate record files matching the respective header prefixes.\nconst cmsRecords = { bannerFr: {\n  code: 'banner_fr', tenant: 'demo', catalogVersion: 'Staged',\n  componentCode: 'banner', locale: 'fr', properties: { title: 'Catalogue' }, status: 'DRAFT'\n} }; // The banner type must declare title.localized:true.\nconst productRecords = { dressEn: {\n  code: 'linenDress_en', tenant: 'demo', productCode: 'linenDress',\n  locale: 'en', name: 'Linen Dress', description: 'Woven dress', status: 'DRAFT', revision: 0\n} };\n// Export the appropriate object from each record file; run owner validation before READY/publication.\n```\n\n```js\n// UI/message contribution envelope for importContribution; not a CMS header.\nconst contribution = {\n  formatVersion: 1, ownerModule: 'localizationCore', entries: [{\n    namespace: 'catalog', key: 'empty', defaultMessage: 'No products',\n    parameters: [], exposure: 'PUBLIC', protected: false,\n    overrideScopes: ['STANDARD', 'PROJECT', 'TENANT']\n  }]\n};\n// A separate localizationValue draft for the same key:\nconst value = { code: 'catalogEmptyFr', namespace: 'catalog', key: 'empty',\n  locale: 'fr', message: 'Aucun produit', state: 'DRAFT', revision: 0,\n  scopeType: 'TENANT', scopeCode: 'demo', auditTrail: [] };\n// Import validates contribution identity/exposure/message and upserts keys idempotently.\n// Draft -> review -> APPROVED -> build immutable release -> governed publish; do not seed an Online pointer.\n```\n\n## Customization and extension guidance\n\nDevelopers can add locale providers, fallback strategies, field validators, translation workflow hooks, and locale-specific formatting. Business users should see missing translation tasks and approval state in Axis. AI tools can assist translation, but they must preserve stable keys, source locale, review state, and terminology rules. Operators should track fallback rates and missing locale counts.\n\n## Implementation handoff\n\nPublic GET /localization/bundles/:locale accepts bounded namespaces, scopeCode and channel filters; tenant stays server-resolved, not body-selected. The controller maps filters; the bundle service requires tenant/scope/channel/locale, nonempty namespace list (default maximum 50), and namespace grammar, loads the Online pointer and validates the immutable release. It filters to configured publicExposures (default PUBLIC), limits keys (default 10000), returns locale/scope/channel/releaseVersion/entries, and derives ETag from checksum; a matching If-None-Match returns 304. Gzip is transport encoding, not a separate release.\n\nThe public facade is read-only and does not expose draft schema CRUD. Contribution import/export and authoring, review, approve, build, publish and rollback routes are authenticated management operations with distinct permissions in localizationApi routers; publish/rollback delegate to nPublish. Example public request: GET /localization/bundles/fr?scopeCode=catalogStore&channel=web&namespaces=catalog. Scope/channel filters are inputs, not authorization evidence; prove selected repository pointer tenant/scope/channel/locale isolation. A checksum proves release integrity, not translation quality, correct fallback, or external cache freshness.\n\n## Evidence checklist\n\nEvery localization change should carry source locale, target locale, field list, reviewer, fallback decision, and the consuming route or API. Production operators should know whether a fallback was expected or caused by missing data. Developers should include tests for partial translation because mixed content is common during rollout. Business users should be able to see which terms are ready for publication and which still need review.\n\n## Common mistakes\n\n- Duplicating entire products or pages per locale instead of localizing fields.\n- Publishing translated content before business review.\n- Forgetting fallback rules for emails, pages, and product cards.\n- Mixing locale data with currency, pricing, or tax authority.\n- Hiding missing translation counts from production monitoring.\n\n## Verification\n\nImport base and localized records into a fresh schema. Request exact locale, fallback locale, and unsupported locale responses. Open Axis, Nexus, or Agora in the browser and verify labels, pages, products, and empty states. Production readiness requires developer tests, business review evidence, operator fallback metrics, and QA proof for each supported locale.\n",
      "previous": {
        "title": "Commerce Search Guide",
        "route": "/docs/framework/commerce-search-guide"
      },
      "next": {
        "title": "Payment Core and Provider Boundaries",
        "route": "/docs/framework/commerce-payment-provider-boundaries"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.localization",
        "technicalModule": "localizationCore",
        "owner": "localizationCore",
        "sourcePath": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/localizationCoreDocumentationComponentData.js",
        "wordCount": 1211,
        "checksum": "f0c656df2c5566172cd59ecc6618e8f1cf0d9187210df8e239cf5295d0747ecb"
      },
      "slug": "localization-runtime-authoring",
      "locale": "en",
      "navigationGroup": "Localization Foundations",
      "navigationGroupCode": "localization-foundations",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "localization.internationalization",
          "owner": "localizationCore"
        },
        {
          "documentId": "wcms.cms-source-map-authoring-contract",
          "owner": "cms"
        },
        {
          "documentId": "commerce.data-authoring-fulfillment",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  }
};
