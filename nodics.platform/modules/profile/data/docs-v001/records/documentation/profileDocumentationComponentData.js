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
    "code": "nodicsDocsComponentplatformOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "platform.overview",
      "title": "Platform overview",
      "route": "/docs/framework/platform-overview",
      "section": "user-enterprise-and-tenant-management",
      "sectionTitle": "User, Enterprise, and Tenant Management",
      "group": "user-enterprise-and-tenant-management",
      "groupTitle": "User, Enterprise, and Tenant Management",
      "parentId": "user-enterprise-and-tenant-management",
      "hierarchyPath": [
        "User, Enterprise, and Tenant Management",
        "Platform overview"
      ],
      "hierarchyDepth": 2,
      "documentType": "overview",
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
      "summary": "How Platform, Profile, BackOffice, authentication, authorization, Axis backend content, and module governance fit together.",
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
        "platform.module-registry",
        "framework.modular-architecture"
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
        "table",
        "screenshot",
        "code-example"
      ],
      "searchKeywords": [
        "user-enterprise-and-tenant-management",
        "platform-and-profile-foundations",
        "platform-overview"
      ],
      "topicKeywords": [
        "User, Enterprise, and Tenant Management",
        "Platform and Profile Foundations",
        "Platform overview"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "`nodics.platform` extends Core and supplies the foundation for human-facing employee operations. In the current reference stack, Platform includes Profile, BackOffice, and the backend Axis module that owns Axis-specific importable content and capability metadata."
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, Platform is the front desk of the backend. It authenticates employees, exposes the BackOffice bootstrap contract, tells Axis which functional modules are registered and active, and provides browser-safe metadata so users can operate the project without guessing what is installed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business purpose",
          "anchor": "platformOverview-1-business-purpose"
        },
        {
          "kind": "paragraph",
          "text": "Platform is where a Nodics project becomes operable by people. Core makes the runtime possible; Platform makes it visible and governed for employees."
        },
        {
          "kind": "paragraph",
          "text": "Platform helps the business answer:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "who can log in;",
            "which enterprise and tenant context is active;",
            "which functional modules are available to this project;",
            "which modules are mandatory, optional, registered, active, inactive, or unavailable;",
            "which navigation, actions, schemas, APIs, and documentation sources are safe for the current user;",
            "which administrative changes were made and by whom."
          ]
        },
        {
          "kind": "paragraph",
          "text": "This prevents Axis from becoming a hardcoded menu. Axis asks Platform and BackOffice what is allowed, then renders it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Beginner mental model",
          "anchor": "platformOverview-2-beginner-mental-model"
        },
        {
          "kind": "paragraph",
          "text": "Think of the local reference stack like a building:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Core is the foundation and utilities.",
            "Platform is the reception/security desk.",
            "Profile verifies who the employee is.",
            "BackOffice tells the employee which rooms they are allowed to see.",
            "WCMS provides content and documentation rooms.",
            "Cron provides scheduled background rooms.",
            "Axis is the screen the employee uses to navigate the building."
          ]
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Axis[\"Axis browser\"] --> Profile[\"Profile<br/>login and employee session\"]\n  Axis --> BackOffice[\"BackOffice<br/>registry, navigation, schemas, APIs\"]\n  BackOffice --> Registry[\"Functional module registry\"]\n  BackOffice --> Capabilities[\"Browser-safe capabilities\"]\n  Profile --> Session[\"Human session contract\"]\n  Registry --> Modules[\"Core, Platform, WCMS, Cron, additional modules\"]"
        },
        {
          "kind": "paragraph",
          "text": "Axis does not decide which rooms exist. Platform/BackOffice returns the authorized projection."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Authentication and authorization flow",
          "anchor": "platformOverview-3-authentication-and-authorization-flow"
        },
        {
          "kind": "paragraph",
          "text": "Platform is the first runtime most Axis users touch, so beginners often assume login is a frontend problem. It is not. Axis collects credentials and renders the session experience, but Profile and Platform own the authentication, session, authorization, enterprise, and tenant checks."
        },
        {
          "kind": "image",
          "alt": "Authentication flow",
          "title": "Authentication flow reference from the archived documentation set",
          "mediaCode": "nodicsDocsImage_c3589b67dcdfbef11b44a85d"
        },
        {
          "kind": "image",
          "alt": "Authorization flow",
          "title": "Authorization flow reference from the archived documentation set",
          "mediaCode": "nodicsDocsImage_5748f710a8dca2fcb2d23b01"
        },
        {
          "kind": "paragraph",
          "text": "The diagrams show the principle: a secured request must travel through the approved request processor, session/token validation, cache/provider lookup, and owning service. Axis hiding a menu is only a usability aid. The backend must still reject unauthorized API access directly."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "What Platform owns",
          "anchor": "platformOverview-4-what-platform-owns"
        },
        {
          "kind": "paragraph",
          "text": "Platform owns the employee-facing backend foundation:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Profile identity and employee authentication;",
            "BackOffice bootstrap and browser-safe discovery;",
            "functional module registry and lifecycle APIs;",
            "module health projections;",
            "API/Swagger discovery surfaces;",
            "administrative navigation and capability metadata;",
            "audit events for registry and BackOffice actions;",
            "backend-owned Axis product data through `modules/axis`;",
            "Platform documentation and module-level contracts."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Platform does not own WCMS content data, media storage, Cron job execution, or customer-specific project behavior. It may show metadata for those modules, but the owning module remains authoritative."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime loading and customization",
          "anchor": "platformOverview-5-runtime-loading-and-customization"
        },
        {
          "kind": "paragraph",
          "text": "A Platform server loads Core first, Platform second, and customer/project layers later according to the effective server graph and module index order."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Core[\"nodics.foundation\"] --> Platform[\"nodics.platform\"]\n  Platform --> CustomerPlatform[\"optional customer Platform extension\"]\n  CustomerPlatform --> Project[\"customer project module\"]\n  Project --> Environment[\"environment module\"]\n  Environment --> Server[\"platformServer\"]"
        },
        {
          "kind": "paragraph",
          "text": "A customer extension can customize Platform behavior while the displayed functional module identity remains `nodics.platform`. This is important: a customized Platform is still Platform unless the customer intentionally defines a new business capability."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "BackOffice and Axis boundary",
          "anchor": "platformOverview-6-backoffice-and-axis-boundary"
        },
        {
          "kind": "paragraph",
          "text": "BackOffice is the backend authority for the Axis bootstrap experience. Axis is the browser renderer. This boundary protects security and maintainability:"
        },
        {
          "kind": "table",
          "headers": [
            "Concern",
            "Owner"
          ],
          "rows": [
            [
              "Employee login and session enforcement",
              "Profile/Platform backend"
            ],
            [
              "Registry state and module lifecycle",
              "BackOffice/Platform backend"
            ],
            [
              "Authorized navigation metadata",
              "BackOffice/Platform backend"
            ],
            [
              "Page rendering, interaction, responsive UI",
              "`nodics.axis` frontend"
            ],
            [
              "Axis documentation/content records",
              "Platform `modules/axis` backend module"
            ],
            [
              "Framework documentation",
              "Implementing capability modules own `data/docs-v001`; `nodics.docs` owns shared overviews and composition"
            ],
            [
              "Customer documentation",
              "Customer project"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "If a page appears in Axis, that does not mean the frontend owns the data or the business operation. Axis renders what the backend exposes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer model",
          "anchor": "platformOverview-7-developer-model"
        },
        {
          "kind": "paragraph",
          "text": "When adding Platform behavior, first decide whether the change belongs to Profile, BackOffice, the Axis backend module, or a customer extension."
        },
        {
          "kind": "paragraph",
          "text": "Examples:"
        },
        {
          "kind": "table",
          "headers": [
            "Need",
            "Likely owner"
          ],
          "rows": [
            [
              "Login/session behavior",
              "Profile"
            ],
            [
              "Module registry lifecycle",
              "BackOffice"
            ],
            [
              "Axis product documentation data",
              "Platform `modules/axis`"
            ],
            [
              "Axis React page rendering",
              "`nodics.axis` frontend"
            ],
            [
              "Customer-specific Platform override",
              "Customer extension module"
            ],
            [
              "Runtime server port or database",
              "Customer environment/server config"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not add Platform logic to Axis because the user clicks the button in Axis. The browser button is presentation. The operation belongs to the backend module that owns the business rule."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "DevOps and security model",
          "anchor": "platformOverview-8-devops-and-security-model"
        },
        {
          "kind": "paragraph",
          "text": "Platform is security-sensitive because it is the entry point for employee authentication and BackOffice discovery. Operators should treat Platform as a critical runtime:"
        },
        {
          "kind": "unordered-list",
          "items": [
            "keep human credentials separate from service/Cron credentials;",
            "keep public browser configuration separate from private secrets;",
            "log authentication and registry lifecycle events;",
            "reject unauthorized direct route/API access even when Axis hides a menu;",
            "keep CORS, CSRF, CSP, cookie/session, token, and audience rules explicit;",
            "monitor Platform readiness before starting manual Axis evaluation;",
            "verify module registry persistence across restarts."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "QA acceptance checklist",
          "anchor": "platformOverview-9-qa-acceptance-checklist"
        },
        {
          "kind": "paragraph",
          "text": "Platform is healthy when:"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Platform starts after Core and before customer project layers.",
            "The reference admin can authenticate.",
            "BackOffice bootstrap returns browser-safe authorized metadata.",
            "Core, Platform, and WCMS are mandatory active modules in the reference stack.",
            "Optional Process automation appears only when processServer is observed.",
            "Registry lifecycle actions persist and update Axis without refresh.",
            "Unauthorized registry/API operations fail closed.",
            "Documentation-source registry exposes Framework, Swagger, Axis, and customer docs from the correct owners.",
            "Module Health reflects backend runtime evidence without frontend guessing.",
            "Fresh local acceptance passes after database reset."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "platformOverview-10-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating BackOffice as a frontend concern because Axis displays BackOffice screens.",
            "Putting WCMS content records into `nodics.axis`.",
            "Renaming Platform when a customer extension only customizes Platform.",
            "Assuming a live runtime means the optional module is registered.",
            "Making Axis decide permissions or registry state locally.",
            "Storing secrets in browser-visible configuration."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Platform is the governance bridge between backend capability and employee operation. Keep that bridge explicit, audited, and backend-owned."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "platformOverview-11-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify Platform from both the API side and the Axis side. The API proof is that Platform starts after Core, exposes secured Profile and BackOffice contracts, rejects unauthorized access, and persists functional module registry state. The Axis proof is that a reference employee can log in, obtain authorized navigation, see mandatory modules, operate optional module lifecycle actions without manual refresh, open documentation-source products, and recover safely when Platform is unavailable."
        },
        {
          "kind": "paragraph",
          "text": "For documentation or data changes, maintain and validate the owning CMS data releases and confirm Platform advertises the correct source owners: framework composition from `nodics.docs` referencing canonical implementing-module documentation releases, Axis product docs from the Platform Axis backend module, Swagger/API sources from registered runtime modules, and customer docs from the owning customer project. If a documentation source appears only because Axis hardcoded it, the Platform contract is incomplete."
        }
      ],
      "searchText": "Platform overview How Platform, Profile, BackOffice, authentication, authorization, Axis backend content, and module governance fit together. # Platform overview\n\n`nodics.platform` extends Core and supplies the foundation for human-facing employee operations. In the current reference stack, Platform includes Profile, BackOffice, and the backend Axis module that owns Axis-specific importable content and capability metadata.\n\nFor a beginner, Platform is the front desk of the backend. It authenticates employees, exposes the BackOffice bootstrap contract, tells Axis which functional modules are registered and active, and provides browser-safe metadata so users can operate the project without guessing what is installed.\n\n## Business purpose\n\nPlatform is where a Nodics project becomes operable by people. Core makes the runtime possible; Platform makes it visible and governed for employees.\n\nPlatform helps the business answer:\n\n- who can log in;\n- which enterprise and tenant context is active;\n- which functional modules are available to this project;\n- which modules are mandatory, optional, registered, active, inactive, or unavailable;\n- which navigation, actions, schemas, APIs, and documentation sources are safe for the current user;\n- which administrative changes were made and by whom.\n\nThis prevents Axis from becoming a hardcoded menu. Axis asks Platform and BackOffice what is allowed, then renders it.\n\n## Beginner mental model\n\nThink of the local reference stack like a building:\n\n- Core is the foundation and utilities.\n- Platform is the reception/security desk.\n- Profile verifies who the employee is.\n- BackOffice tells the employee which rooms they are allowed to see.\n- WCMS provides content and documentation rooms.\n- Cron provides scheduled background rooms.\n- Axis is the screen the employee uses to navigate the building.\n\n```mermaid\nflowchart LR\n  Axis[\"Axis browser\"] --> Profile[\"Profile<br/>login and employee session\"]\n  Axis --> BackOffice[\"BackOffice<br/>registry, navigation, schemas, APIs\"]\n  BackOffice --> Registry[\"Functional module registry\"]\n  BackOffice --> Capabilities[\"Browser-safe capabilities\"]\n  Profile --> Session[\"Human session contract\"]\n  Registry --> Modules[\"Core, Platform, WCMS, Cron, additional modules\"]\n```\n\nAxis does not decide which rooms exist. Platform/BackOffice returns the authorized projection.\n\n## Authentication and authorization flow\n\nPlatform is the first runtime most Axis users touch, so beginners often assume login is a frontend problem. It is not. Axis collects credentials and renders the session experience, but Profile and Platform own the authentication, session, authorization, enterprise, and tenant checks.\n\n![Authentication flow](media:nodicsDocsImage_c3589b67dcdfbef11b44a85d)\n\n![Authorization flow](media:nodicsDocsImage_5748f710a8dca2fcb2d23b01)\n\nThe diagrams show the principle: a secured request must travel through the approved request processor, session/token validation, cache/provider lookup, and owning service. Axis hiding a menu is only a usability aid. The backend must still reject unauthorized API access directly.\n\n## What Platform owns\n\nPlatform owns the employee-facing backend foundation:\n\n- Profile identity and employee authentication;\n- BackOffice bootstrap and browser-safe discovery;\n- functional module registry and lifecycle APIs;\n- module health projections;\n- API/Swagger discovery surfaces;\n- administrative navigation and capability metadata;\n- audit events for registry and BackOffice actions;\n- backend-owned Axis product data through `modules/axis`;\n- Platform documentation and module-level contracts.\n\nPlatform does not own WCMS content data, media storage, Cron job execution, or customer-specific project behavior. It may show metadata for those modules, but the owning module remains authoritative.\n\n## Runtime loading and customization\n\nA Platform server loads Core first, Platform second, and customer/project layers later according to the effective server graph and module index order.\n\n```mermaid\nflowchart TD\n  Core[\"nodics.foundation\"] --> Platform[\"nodics.platform\"]\n  Platform --> CustomerPlatform[\"optional customer Platform extension\"]\n  CustomerPlatform --> Project[\"customer project module\"]\n  Project --> Environment[\"environment module\"]\n  Environment --> Server[\"platformServer\"]\n```\n\nA customer extension can customize Platform behavior while the displayed functional module identity remains `nodics.platform`. This is important: a customized Platform is still Platform unless the customer intentionally defines a new business capability.\n\n## BackOffice and Axis boundary\n\nBackOffice is the backend authority for the Axis bootstrap experience. Axis is the browser renderer. This boundary protects security and maintainability:\n\n| Concern | Owner |\n| --- | --- |\n| Employee login and session enforcement | Profile/Platform backend |\n| Registry state and module lifecycle | BackOffice/Platform backend |\n| Authorized navigation metadata | BackOffice/Platform backend |\n| Page rendering, interaction, responsive UI | `nodics.axis` frontend |\n| Axis documentation/content records | Platform `modules/axis` backend module |\n| Framework documentation | Implementing capability modules own `data/docs-v001`; `nodics.docs` owns shared overviews and composition |\n| Customer documentation | Customer project |\n\nIf a page appears in Axis, that does not mean the frontend owns the data or the business operation. Axis renders what the backend exposes.\n\n## Developer model\n\nWhen adding Platform behavior, first decide whether the change belongs to Profile, BackOffice, the Axis backend module, or a customer extension.\n\nExamples:\n\n| Need | Likely owner |\n| --- | --- |\n| Login/session behavior | Profile |\n| Module registry lifecycle | BackOffice |\n| Axis product documentation data | Platform `modules/axis` |\n| Axis React page rendering | `nodics.axis` frontend |\n| Customer-specific Platform override | Customer extension module |\n| Runtime server port or database | Customer environment/server config |\n\nDo not add Platform logic to Axis because the user clicks the button in Axis. The browser button is presentation. The operation belongs to the backend module that owns the business rule.\n\n## DevOps and security model\n\nPlatform is security-sensitive because it is the entry point for employee authentication and BackOffice discovery. Operators should treat Platform as a critical runtime:\n\n- keep human credentials separate from service/Cron credentials;\n- keep public browser configuration separate from private secrets;\n- log authentication and registry lifecycle events;\n- reject unauthorized direct route/API access even when Axis hides a menu;\n- keep CORS, CSRF, CSP, cookie/session, token, and audience rules explicit;\n- monitor Platform readiness before starting manual Axis evaluation;\n- verify module registry persistence across restarts.\n\n## QA acceptance checklist\n\nPlatform is healthy when:\n\n1. Platform starts after Core and before customer project layers.\n2. The reference admin can authenticate.\n3. BackOffice bootstrap returns browser-safe authorized metadata.\n4. Core, Platform, and WCMS are mandatory active modules in the reference stack.\n5. Optional Process automation appears only when processServer is observed.\n6. Registry lifecycle actions persist and update Axis without refresh.\n7. Unauthorized registry/API operations fail closed.\n8. Documentation-source registry exposes Framework, Swagger, Axis, and customer docs from the correct owners.\n9. Module Health reflects backend runtime evidence without frontend guessing.\n10. Fresh local acceptance passes after database reset.\n\n## Common mistakes\n\n- Treating BackOffice as a frontend concern because Axis displays BackOffice screens.\n- Putting WCMS content records into `nodics.axis`.\n- Renaming Platform when a customer extension only customizes Platform.\n- Assuming a live runtime means the optional module is registered.\n- Making Axis decide permissions or registry state locally.\n- Storing secrets in browser-visible configuration.\n\nPlatform is the governance bridge between backend capability and employee operation. Keep that bridge explicit, audited, and backend-owned.\n\n## Verification\n\nVerify Platform from both the API side and the Axis side. The API proof is that Platform starts after Core, exposes secured Profile and BackOffice contracts, rejects unauthorized access, and persists functional module registry state. The Axis proof is that a reference employee can log in, obtain authorized navigation, see mandatory modules, operate optional module lifecycle actions without manual refresh, open documentation-source products, and recover safely when Platform is unavailable.\n\nFor documentation or data changes, maintain and validate the owning CMS data releases and confirm Platform advertises the correct source owners: framework composition from `nodics.docs` referencing canonical implementing-module documentation releases, Axis product docs from the Platform Axis backend module, Swagger/API sources from registered runtime modules, and customer docs from the owning customer project. If a documentation source appears only because Axis hardcoded it, the Platform contract is incomplete.\n",
      "previous": {
        "title": "Business Customization in Axis",
        "route": "/docs/framework/axis-business-customization"
      },
      "next": {
        "title": "Security, Identity, and Access Governance",
        "route": "/docs/framework/security-identity-access-governance"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "profile",
        "owner": "profile",
        "sourcePath": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
        "wordCount": 1163,
        "checksum": "63872c01e6a6eb95e72610fd70091f5f3cc4ed502a7bc718b35355efc0a0c326"
      },
      "slug": "platform-overview",
      "locale": "en",
      "navigationGroup": "Platform and Profile Foundations",
      "navigationGroupCode": "platform-and-profile-foundations",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        },
        {
          "documentId": "framework.modular-architecture",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentsecurityIdentityAccessGovernance",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "security.identity-access-governance",
      "title": "Security, Identity, and Access Governance",
      "route": "/docs/framework/security-identity-access-governance",
      "section": "security-governance-and-compliance",
      "sectionTitle": "Security, Governance, and Compliance",
      "group": "security-governance-and-compliance",
      "groupTitle": "Security, Governance, and Compliance",
      "parentId": "security-governance-and-compliance",
      "hierarchyPath": [
        "Security, Governance, and Compliance",
        "Security, Identity, and Access Governance"
      ],
      "hierarchyDepth": 2,
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
      "summary": "Authentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities.",
      "visibility": "public",
      "accessMode": "PUBLIC",
      "publiclyAvailable": true,
      "requiresAuthentication": false,
      "allowedRoles": [],
      "allowedGroups": [],
      "allowedPermissions": [],
      "lifecycleState": "ONLINE",
      "version": "0.16.22",
      "maturityState": "operational",
      "implementationState": "current",
      "renderingComponent": "documentation.component.article",
      "relatedPages": [
        "platform.overview",
        "axis.business-customization",
        "docs.overview",
        "promotion.campaigns-coupon-issuance",
        "cart.customer-intent-calculation",
        "digital.purchase-delivery-reveal"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/schemas",
        "src/service",
        "src/service/customer/defaultCustomerRegistrationService.js",
        "llm/contracts/customer-registration-form.md",
        "test/profileCustomerRegistrationForm.test.js",
        "test/customerRegistrationPlacementContract.test.js"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix",
        "table"
      ],
      "searchKeywords": [
        "security-governance-and-compliance",
        "identity-and-access-governance",
        "security-identity-and-access-governance",
        "ordinary-customer-signup",
        "optional-eligibility",
        "active-placement"
      ],
      "topicKeywords": [
        "Security, Governance, and Compliance",
        "Identity and Access Governance",
        "Security, Identity, and Access Governance",
        "ordinary-customer-signup",
        "optional-eligibility",
        "active-placement"
      ],
      "headings": [
        {
          "text": "October 2026 Source Consolidation Boundary",
          "anchor": "securityIdentityAccessGovernance-1-october-2026-source-consolidation-boundary",
          "level": 2
        },
        {
          "text": "Target Consent And Relationship Changes",
          "anchor": "securityIdentityAccessGovernance-2-target-consent-and-relationship-changes",
          "level": 3
        },
        {
          "text": "Historical Identity And Application Recovery",
          "anchor": "securityIdentityAccessGovernance-3-historical-identity-and-application-recovery",
          "level": 3
        },
        {
          "text": "Customize And Accept Safely",
          "anchor": "securityIdentityAccessGovernance-4-customize-and-accept-safely",
          "level": 3
        },
        {
          "text": "Enterprise Hierarchy Evidence",
          "anchor": "securityIdentityAccessGovernance-5-enterprise-hierarchy-evidence",
          "level": 2
        },
        {
          "text": "Explicit Structural Recovery Resumption",
          "anchor": "securityIdentityAccessGovernance-6-explicit-structural-recovery-resumption",
          "level": 2
        },
        {
          "text": "Accepted Hierarchical Delegation Design",
          "anchor": "securityIdentityAccessGovernance-7-accepted-hierarchical-delegation-design",
          "level": 2
        },
        {
          "text": "Staged Customer Consent And Recovery",
          "anchor": "securityIdentityAccessGovernance-8-staged-customer-consent-and-recovery",
          "level": 2
        },
        {
          "text": "Business context",
          "anchor": "securityIdentityAccessGovernance-9-business-context",
          "level": 2
        },
        {
          "text": "Journey and ownership",
          "anchor": "securityIdentityAccessGovernance-10-journey-and-ownership",
          "level": 2
        },
        {
          "text": "Data and configuration detail",
          "anchor": "securityIdentityAccessGovernance-11-data-and-configuration-detail",
          "level": 2
        },
        {
          "text": "Customization and extension",
          "anchor": "securityIdentityAccessGovernance-12-customization-and-extension",
          "level": 2
        },
        {
          "text": "Operations and governance",
          "anchor": "securityIdentityAccessGovernance-13-operations-and-governance",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "securityIdentityAccessGovernance-14-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "securityIdentityAccessGovernance-15-verification",
          "level": 2
        },
        {
          "text": "Current implementation coverage",
          "anchor": "securityIdentityAccessGovernance-16-current-implementation-coverage",
          "level": 2
        },
        {
          "text": "Enterprise-scope expiry and reliable access decisions",
          "anchor": "securityIdentityAccessGovernance-17-enterprise-scope-expiry-and-reliable-access-decisions",
          "level": 2
        },
        {
          "text": "Worked example: temporary responsibility",
          "anchor": "securityIdentityAccessGovernance-18-worked-example-temporary-responsibility",
          "level": 3
        },
        {
          "text": "Failure and recovery",
          "anchor": "securityIdentityAccessGovernance-19-failure-and-recovery",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-20-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Employee self-application intake",
          "anchor": "securityIdentityAccessGovernance-21-employee-self-application-intake",
          "level": 2
        },
        {
          "text": "Withdrawal, Corrected Attempts And Deadlines",
          "anchor": "securityIdentityAccessGovernance-22-withdrawal-corrected-attempts-and-deadlines",
          "level": 3
        },
        {
          "text": "Worked request and failure recovery",
          "anchor": "securityIdentityAccessGovernance-23-worked-request-and-failure-recovery",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-24-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Personal memberships and enterprise context",
          "anchor": "securityIdentityAccessGovernance-25-personal-memberships-and-enterprise-context",
          "level": 2
        },
        {
          "text": "Current-enterprise team administration",
          "anchor": "securityIdentityAccessGovernance-26-current-enterprise-team-administration",
          "level": 2
        },
        {
          "text": "Application review recovery: decisions and messages are separate",
          "anchor": "securityIdentityAccessGovernance-27-application-review-recovery-decisions-and-messages-are-separate",
          "level": 2
        },
        {
          "text": "Developer and support integration",
          "anchor": "securityIdentityAccessGovernance-28-developer-and-support-integration",
          "level": 3
        },
        {
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-29-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Read-only legacy identity assessment",
          "anchor": "securityIdentityAccessGovernance-30-read-only-legacy-identity-assessment",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-31-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Scope changes and evidenced team recovery",
          "anchor": "securityIdentityAccessGovernance-32-scope-changes-and-evidenced-team-recovery",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-33-customize-and-extend-safely",
          "level": 3
        },
        {
          "text": "Live Context Admission And Privacy Boundary",
          "anchor": "securityIdentityAccessGovernance-34-live-context-admission-and-privacy-boundary",
          "level": 2
        },
        {
          "text": "Configure The Live Context Bridge",
          "anchor": "securityIdentityAccessGovernance-35-configure-the-live-context-bridge",
          "level": 3
        },
        {
          "text": "Native Customer Issue And Refresh",
          "anchor": "securityIdentityAccessGovernance-36-native-customer-issue-and-refresh",
          "level": 3
        },
        {
          "text": "Repair Committed Consent Stamps",
          "anchor": "securityIdentityAccessGovernance-37-repair-committed-consent-stamps",
          "level": 3
        },
        {
          "text": "Canonical Contact Verification And Notification Preferences",
          "anchor": "securityIdentityAccessGovernance-38-canonical-contact-verification-and-notification-preferences",
          "level": 3
        },
        {
          "text": "Customize Contact And Eligibility Safely",
          "anchor": "securityIdentityAccessGovernance-39-customize-contact-and-eligibility-safely",
          "level": 3
        },
        {
          "text": "Ordinary Customer signup and optional eligibility",
          "anchor": "profile-ordinary-signup-optional-eligibility",
          "level": 2
        },
        {
          "text": "Customize ordinary registration without weakening admission",
          "anchor": "profile-ordinary-signup-customization",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "heading",
          "level": 2,
          "text": "October 2026 Source Consolidation Boundary",
          "anchor": "securityIdentityAccessGovernance-1-october-2026-source-consolidation-boundary"
        },
        {
          "kind": "paragraph",
          "text": "For business users and operators, source availability is different from an enabled enterprise journey. The current branch adds explicit target-owned consent, held hierarchy changes, historical application retirement and staged historical identity linking. Those capabilities retain independent false qualifications. Beginners must not activate switches to bypass missing owner approval or unfinished acceptance. Developers extend existing Profile owners; Kickoff remains lightweight."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Target Consent And Relationship Changes",
          "anchor": "securityIdentityAccessGovernance-2-target-consent-and-relationship-changes"
        },
        {
          "kind": "paragraph",
          "text": "Profile stores private consent on existing Enterprise records, not another tree or identity registry. New enterprise creation captures creationDefault=false with empty rights; retries retain existing rights and later configuration changes never retrofit them. Positive-default source requires an explicitly approved `creationRights` policy, fresh human platform authority and a ready immediate-parent administrator; missing approval or incomplete rights reject before setup writes. This policy remains null by default. Source administration also recognizes fresh accepted assignments with an explicit `ENTERPRISE_ADMIN` role classification, not a role label or broad group alone. Targets can grant explicit ancestor VIEW/INVITE consent with role and exact- recipient ceilings, bounded expiry and canonical source evidence. Independently qualified MANAGE_ACCESS permits bounded onward commands, never operational authority, automatic descendant access or Customer consent. Onward qualification stays false."
        },
        {
          "kind": "paragraph",
          "text": "Consent routes GET/POST `/nodics/profile/v0/enterprise-administration/consent` use management exposure, human access authentication, configured permission and no-store responses. Generic CRUD cannot manufacture, replace or erase private proof. Operator projections contain only current revision and bounded grant summaries, not canonical locators, command hashes or credentials. Ancestor invitations revalidate ceilings at acceptance and membership issue/switch/refresh. Independent typed consent stamps join canonical and membership proofs; groups are never unioned across enterprises."
        },
        {
          "kind": "paragraph",
          "text": "The target-aware GET `/enterprise-administration/:enterpriseCode/workspace` publishes versioned presentation, revision, authorized source-assignment choices, explicit commands and bounded options. Matching GET/POST `/:enterpriseCode/consent` routes retain independent target admission; selecting a target is not permission. Grant commands use an opaque `recipientAssignmentCode`, resolved by Profile, rather than a browser-supplied canonical identity locator. Axis reviews one inspected revision and one operation ID; a failed or uncertain response leads to inspection, not automatic replay. Backend navigation remains hidden until enforcement is qualified."
        },
        {
          "kind": "paragraph",
          "text": "Profile's secured pipeline contribution rechecks owner contexts after token authentication on each request. This observes expiry/source loss and current relationship evidence. Installed cross-runtime/module-boundary enforcement and distributed cache behavior are not yet demonstrated; production qualification must cover all consumers."
        },
        {
          "kind": "paragraph",
          "text": "Hierarchy GET/POST `/enterprise-administration/hierarchy` are separate fresh PASSWORD platform-super-admin operations. A held operation advances relationship epoch, rejects hierarchy reads while PENDING, revokes only retained path-dependent grants and repairs their individual stamps before the final parent CAS. Interrupted commands retain their exact original identity and targets; they are never stolen on timeout. Returning to an old parent never revives old consent. Reverse subEnterprises is not a second authority."
        },
        {
          "kind": "paragraph",
          "text": "Separately qualified POST `/enterprise-administration/hierarchy/recover` consumes an exact retained operation ID and graph revision. Recovery is not a timeout-based lock takeover. Terminal cancellation retains the original parent and advanced epoch, so the abandoned command cannot acknowledge a late parent change or revive old grants. Private cancellation facts must be verified by the consent owner before hierarchy reads resume. Installed concurrency, source-loss and lost-acknowledgement acceptance are still required; no recovery switch has been enabled."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Historical Identity And Application Recovery",
          "anchor": "securityIdentityAccessGovernance-3-historical-identity-and-application-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Historical canonical linking requires current proof of both original passwords, reviewed inventory fingerprint and independently qualified retirement guards. It stages the original target inactive, retires its local credential at the Password owner and retains private recovery evidence. Canonical credentials and histories are preserved; no membership, customer consent or active session follows from linking. Targets with dependent checkpoints/memberships reject rather than being silently reassociated. Customer eligibility now has a Profile-owned live admission path consuming published Rules policies and current original account, credential, lockout and consent evidence. It is not a fabricated KYC approval or an email-as-verification shortcut. Policy, provider and installation qualification remain explicit; missing evidence rejects."
        },
        {
          "kind": "paragraph",
          "text": "Application retirement can select an exact retained WITHDRAWN/EXPIRED historical attempt with the current assignment revision. The owner uses its original Process correlation and never mutates a resubmitted application's history or new decision. Axis confirms the selected attempt and handles competing/uncertain results without automatic replay. Inspection is retained source evidence, not live proof of retirement."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize And Accept Safely",
          "anchor": "securityIdentityAccessGovernance-4-customize-and-accept-safely"
        },
        {
          "kind": "paragraph",
          "text": "Existing later Profile modules contribute `config/properties.js`; preserve false qualifications until accepted installed evidence. Tighten `administrationConsent` maximumGrants, maximumLifetimeDays and allowedRoleCodes through layering. Exported owner members may narrow behavior but cannot remove canonical proof, private evidence, conditional acknowledgements, role/action/recipient ceilings or non-revival. Full command and recovery detail is in Profile's `administration-consent-commands.md` and `enterprise-membership.md`; those contracts do not authorize runtime migration."
        },
        {
          "kind": "paragraph",
          "text": "For example, a later-loaded Profile extension can narrow limits and change labels in its existing `config/properties.js` without replacing authentication or persistence:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  enterpriseManagement: {\n    administrationConsent: {\n      maximumGrants: 10,\n      maximumLifetimeDays: 7,\n      maximumDelegationDepth: 2,\n      workspace: {\n        presentation: { title: \"Organisation Administration\" },\n      },\n    },\n  },\n};"
        },
        {
          "kind": "paragraph",
          "text": "The module must extend Profile and load after it through the normal runtime hierarchy. The example inherits disabled qualification and false creation defaults; it neither grants permissions nor rewrites existing rights. Role classification does not add permissions to imported groups. Approved action permissions remain governed group/ scope records. Validate default and later-layer composition, malformed configuration, stale revisions, denied sources, expiry, cancellation and uncertain-write inspection in the joint session before activation. Do not copy the full default configuration."
        },
        {
          "kind": "table",
          "headers": [
            "Evidence",
            "Current Boundary"
          ],
          "rows": [
            [
              "Source/fixtures",
              "Authored; behavioral fixtures NOT RUN"
            ],
            [
              "Static governance",
              "Reported separately after consolidation"
            ],
            [
              "Installed indexes/cache/owner retirement",
              "Qualification remains false"
            ],
            [
              "Axis/Circa automated and visual acceptance",
              "Joint session, NOT RUN"
            ],
            [
              "Runtime imports, notification sends and release",
              "Not authorized in this batch"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Enterprise Hierarchy Evidence",
          "anchor": "securityIdentityAccessGovernance-5-enterprise-hierarchy-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Profile's existing Enterprise owner resolves a child-to-root chain using fresh, bounded, non-recursive Enterprise and Tenant reads. Parent and tenant references use code coordinates, including resolved objects whose code is reloaded. The singular `superEnterprise` is the traversal source; `subEnterprises` is not an independent authority or proof of a bidirectional transaction."
        },
        {
          "kind": "paragraph",
          "text": "`enterpriseManagement.hierarchy.maximumDepth` defaults to 32 records including the child. Later Profile layers may narrow it within the integer range 1-128. Missing/inactive/ambiguous dependencies, cycles, malformed references and overflow reject; a second pass detects observed drift but is not an atomic graph snapshot. Creation validates its proposed parent before tenant, enterprise and activation writes, including self/descendant-parent refusal. Existing creation retries do not retrofit rights or create another enterprise."
        },
        {
          "kind": "paragraph",
          "text": "This framework dependency grants no parent administration or business-data access. Target consent, bounded grant provenance, authority ceilings, serialized reparenting and dependent-session invalidation remain separate implementation requirements. Projects customize the existing exported Profile owner and layered depth setting; they do not copy the hierarchy into Kickoff, Axis or Circa. The new fixtures are authored for joint testing, not accepted runtime evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Explicit Structural Recovery Resumption",
          "anchor": "securityIdentityAccessGovernance-6-explicit-structural-recovery-resumption"
        },
        {
          "kind": "paragraph",
          "text": "The independently qualified migration recovery command accepts an exact reviewed audit code/fingerprint under fresh original PASSWORD platform authority. An interrupted RECOVERING audit resumes only its original persisted operation fence. It never clears a lease, takes another operation identity or infers canonical identity linking from structural evidence."
        },
        {
          "kind": "paragraph",
          "text": "The acknowledged completed prefix must still match audited post-state. Remaining records must match exact pre/post facts: post-state is skipped; pre-state uses the existing conditional owner write. Every progress checkpoint compares phase, operation, fingerprint and previous applied count. All post-states are rechecked before terminal acknowledgement; an already completed recovered audit permits only read-only replay against unchanged post-state. Drift or owner failures reject. This is not a transactional snapshot, credential restoration or runtime/index qualification. ROLLING_BACK inspection remains separate and does not gain resume authority from this change. Behavioral and concurrency acceptance stays required."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Accepted Hierarchical Delegation Design",
          "anchor": "securityIdentityAccessGovernance-7-accepted-hierarchical-delegation-design"
        },
        {
          "kind": "paragraph",
          "text": "Enterprise parent/child relationships already belong to Profile. The approved framework direction is target-consented ancestor administration, supporting descendant depth without automatic subtree access. Employees still receive explicit target-enterprise memberships and roles; parent relationships and enterprise business roles do not automatically grant access. Administrative scope is separate from operational and business-data access. This applies across Nodics, not only to one application or accelerator."
        },
        {
          "kind": "paragraph",
          "text": "Administrators must remain within their assignable-role/action ceiling. Preserve grant provenance, separate enterprise session permissions and independent valid grants. New subsidiaries do not automatically receive employee access. Reparenting, revocation, expiry and source authority changes require grant revalidation and affected access/refresh invalidation, without deleting existing customer or asset history. Configuration and extensions remain in Profile's existing layers."
        },
        {
          "kind": "paragraph",
          "text": "The enterprise's super administrator controls parent access. Consent defaults to false; a layered global default is evaluated only when creating the enterprise to initialize explicit rights. Changing that default does not rewrite existing rights and it is not reapplied when reparenting. Later changes use explicit grant/revocation commands. Immediate-parent access requires consent; higher ancestors must be explicitly selected. Backend visibility follows valid scoped grants, not merely hierarchy membership or frontend filters."
        },
        {
          "kind": "paragraph",
          "text": "Access management is a separate permission with approved role, action, recipient and enterprise ceilings. A parent grant does not automatically confer full super administration or redelegation. Revocation invalidates dependent onward grants and affected sessions, preserves independent memberships and never automatically revives revoked grants. Reparenting removes old hierarchy-dependent authority; the new parent requires fresh explicit consent. Protect the last active enterprise super administrator against removal, suspension or demotion until a replacement is active; exceptional recovery requires an audited platform-super-administrator action."
        },
        {
          "kind": "paragraph",
          "text": "Authorized administrators of the designated PLATFORM_OWNER enterprise retain platform-wide administration independent of parent consent. Mere enterprise membership/business role is insufficient; tenant boundaries, route permissions, account checks and auditing still apply. This is not automatic customer-data access or impersonation authority."
        },
        {
          "kind": "paragraph",
          "text": "Maturity: accepted design, not complete implementation or installed acceptance. Current exact-target/platform checks are unchanged. A hierarchy-only permission bypass is prohibited; complete scope, grant, session and mutation enforcement must be implemented and qualified before activation. No customer-specific engine or new parallel hierarchy is needed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Staged Customer Consent And Recovery",
          "anchor": "securityIdentityAccessGovernance-8-staged-customer-consent-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "The enterprise lifecycle source includes separately qualified Customer consent renewal/withdrawal. Renewal requires the current disclosed terms and inspected revision; withdrawal retains purchases/history and Employee access while invalidating old Customer proof. These are not deployed acceptance claims. Enable only after the joint owner/browser tests and eligibility qualification."
        },
        {
          "kind": "paragraph",
          "text": "Acceptance itself changes no Employee cookie. Explicit Customer session transition is a separate Profile action: it validates exact origin and CSRF, consumes matching Employee refresh proof, clears Employee cookies and writes distinct Customer cookies. The returned access token belongs only in memory; refresh never leaves HttpOnly cookies. An uncertain transition clears both cookie namespaces and requires sign-in or supported recovery, never an automatic retry or staff-grant upgrade."
        },
        {
          "kind": "paragraph",
          "text": "Structural identity recovery rechecks stored audited pre/post state and rejects drift. It is not email-based linking, global uniqueness certification or automatic crash recovery. Canonical index declarations remain disabled pending governed installed index preparation. Historical identity linking requires separate ownership proof."
        },
        {
          "kind": "paragraph",
          "text": "Operators can separately qualify Profile's read-only `/identity/migration/inspect` with a saved auditCode/fingerprint and confirmed:true. It reports bounded positional pre/post/drift observations, not identities, credentials or replay authority. Inspection flags default false; recovery enablement cannot implicitly enable it. Inspection alone leaves RECOVERING/ROLLING_BACK locked. Explicit reviewed same-fence resumption is a separate recovery command; ROLLING_BACK remains inspection-only here. Audit drift rejects, provider failures return no partial report, and record observations are explicitly non-atomic. Neither an all-post report nor static checks prove that an interrupted worker has stopped."
        },
        {
          "kind": "paragraph",
          "text": "Authentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "A platform that lets business users change content, configuration, and runtime behavior must prove who can read, edit, review, approve, publish, and operate each capability. Profile centralizes users, groups, permissions, token context, and enterprise or tenant assignments. Capability modules declare permission needs, while routes, services, and Axis workspaces enforce them consistently."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "securityIdentityAccessGovernance-9-business-context"
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
              "A platform that lets business users change content, configuration, and runtime behavior must prove who can read, edit, review, approve, publish, and operate each capability."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Profile centralizes users, groups, permissions, token context, and enterprise or tenant assignments. Capability modules declare permission needs, while routes, services, and Axis workspaces enforce them consistently."
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
          "anchor": "securityIdentityAccessGovernance-10-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Profile owns users, employees, groups, permissions, and identity context. Documentation author and read-only viewer roles extend this model without creating a separate documentation-only security authority. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "Security, Governance, and Compliance",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.platform",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "profile",
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
          "anchor": "securityIdentityAccessGovernance-11-data-and-configuration-detail"
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
          "text": "permission: { code: \"documentation.draft.create\", group: \"documentationAuthorUserGroup\", publish: false }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "securityIdentityAccessGovernance-12-customization-and-extension"
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
          "anchor": "securityIdentityAccessGovernance-13-operations-and-governance"
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
          "anchor": "securityIdentityAccessGovernance-14-common-mistakes"
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
          "anchor": "securityIdentityAccessGovernance-15-verification"
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
          "anchor": "securityIdentityAccessGovernance-16-current-implementation-coverage"
        },
        {
          "kind": "paragraph",
          "text": "Security, identity, and access governance covers employees, customers, enterprises, tenants, user groups, permissions, principal scope assignments, authentication providers, browser sessions, internal runtime tokens, password records, and identity migration evidence. This page also owns the documentation roles discussed for Axis: super admin, admin reviewer/approver, documentation author, and read-only Axis viewer. Admin may review, approve, and publish; author can create and update documentation content; viewer can inspect Axis applications without write permissions."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Principal[\"Customer or employee\"] --> Auth[\"Authentication provider\"]\n  Auth --> Session[\"Token/session\"]\n  Session --> Scope[\"Enterprise and tenant scope\"]\n  Scope --> Groups[\"User groups and permissions\"]\n  Groups --> Decision[\"Route and operation decision\"]\n  Decision --> Audit[\"Audit and support evidence\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Access topic",
            "Source records",
            "Documentation requirement"
          ],
          "rows": [
            [
              "Enterprise and tenant",
              "Enterprise, Tenant, Address, Contact.",
              "Isolation, activation, default tenant behavior, and migration risk."
            ],
            [
              "Principal identity",
              "User, Employee, Customer, Password, UserState.",
              "Authentication, status, ownership, and protected data handling."
            ],
            [
              "Group and permission",
              "UserGroup and resolved permissions.",
              "Exact permission codes, inherited access, and denial behavior."
            ],
            [
              "Scope assignment",
              "PrincipalScopeAssignment.",
              "Which enterprise/tenant/domain a principal can act within."
            ],
            [
              "Documentation access",
              "Page access policy and lifecycle visibility.",
              "Public, authenticated, role-based, group-based, permission-based, or restricted visibility."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "For Axis, every left-navigation entry and page action should map to a backend-declared capability and permission. The frontend may hide unavailable actions for usability, but backend authorization remains the decision point. For Nexus, public pages must come only from Online content and must not expose restricted documentation, secrets, internal routes, or draft implementation notes."
        },
        {
          "kind": "paragraph",
          "text": "Implementation evidence comes from profile route contracts, authentication service tests, browser session tests, runtime internal token tests, user group permission resolution, principal authorization scope contracts, recursive interceptor tests, identity governance and migration tests, mandatory identity bootstrap checks, and generated schema contracts for Enterprise, Tenant, Customer, Employee, UserGroup, User, UserState, Password, and PrincipalScopeAssignment."
        },
        {
          "kind": "paragraph",
          "text": "Profile refresh sessions use the Profile-owned `auth` cache channel. Its module configuration references nAuth's strict channel defaults through nConfig; do not copy those defaults into a customer environment or redirect identity ownership. The deployment must still enable the distributed provider. Later Profile channel overrides use normal layering, preserving atomic consume and no local fallback."
        },
        {
          "kind": "paragraph",
          "text": "Browser sessions resolve credentialed origins through nRouter's existing `resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists share one policy; explicit denials and endpoint disables take precedence. Profile continues to enforce cookie security, CSRF and refresh rotation."
        },
        {
          "kind": "paragraph",
          "text": "During a governed Local reset, the provider's private authority may reach scope cleanup after Employee deletion. Profile must prove principal absence through an authoritative read and await nAuth shared-stamp revocation. It must reject failed reads or revocation, and a request field cannot forge reset authority. Existing principals and ordinary scope mutations still require exactly one acknowledged Employee update. This rule is independent of reset inventory ordering."
        },
        {
          "kind": "paragraph",
          "text": "Scoped runtime route admission recognizes `userGroup` and `serviceAccountUserGroup` as base route classes. These labels do not become JWT groups or expand permissions. nRouter still enforces the approved module, explicit action permission, accepted token type and deployment exposure. Administrator and human-only groups remain ineligible; later deployment policy may narrow the list."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Enterprise-scope expiry and reliable access decisions",
          "anchor": "securityIdentityAccessGovernance-17-enterprise-scope-expiry-and-reliable-access-decisions"
        },
        {
          "kind": "paragraph",
          "text": "**Functional owner:** `nodics.platform`; technical owner: Profile. This section explains the source-level scope safeguards on the lifecycle feature branch. Generated-runtime, browser and business-reader acceptance remain separate."
        },
        {
          "kind": "paragraph",
          "text": "A scope identifies a responsibility within an enterprise or another business boundary. It does not prove identity, create an employee or replace ordinary route permissions. All those controls still apply."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Worked example: temporary responsibility",
          "anchor": "securityIdentityAccessGovernance-18-worked-example-temporary-responsibility"
        },
        {
          "kind": "paragraph",
          "text": "Suppose an existing direct enterprise scope starts at `2026-09-30T08:00:00Z` and ends at `2026-10-01T08:00:00Z`. These are illustrative UTC values."
        },
        {
          "kind": "ordered-list",
          "items": [
            "Before the start, that scope grants no access.",
            "At the exact start, it may become effective, subject to identity, enterprise, role and other permission checks.",
            "At the exact end, it has expired. The end is exclusive; there is no extra request or one-second grace period.",
            "Renewal requires the existing authorised scope-management operation. Registration retry or account recovery does not extend a scope."
          ]
        },
        {
          "kind": "paragraph",
          "text": "A missing boundary can be open where the existing policy permits. A supplied invalid date cannot be treated as missing. Each boundary is checked separately, so a missing end cannot hide a malformed start, or vice versa."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  R[Request scoped access] --> O[Read current scope through its owner]\n  O --> V{Valid owner response and stored policy?}\n  V -->|No| D[Reject; do not infer permission]\n  V -->|Yes| T[Check status, time, principal and normal permissions]\n  T --> A[Apply existing ALLOW and DENY rules]"
        },
        {
          "kind": "paragraph",
          "text": "This authored flow explains the control order. It is not a rendered deployment screenshot or evidence that a live account was tested."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Failure and recovery",
          "anchor": "securityIdentityAccessGovernance-19-failure-and-recovery"
        },
        {
          "kind": "paragraph",
          "text": "If a stored DENY carries a malformed time, resolution fails instead of discarding it and exposing a matching ALLOW. An unavailable database or failed owner response is likewise not an empty successful scope list. Keep the operation closed and provide the authorised maintainer with a non-secret request reference. Correct policy records only through their owning administrative service; do not edit a database directly or suppress a denial to make the screen work."
        },
        {
          "kind": "paragraph",
          "text": "An inactive record and a record without a stored ACTIVE state cannot be revived by applying configuration defaults while reading it. This is different from applying valid defaults when intentionally creating a new record."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-20-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Keep validation in `DefaultPrincipalScopeGovernanceService` and reuse the existing scope registry and permission rules. A project may supply legitimate effective dates through supported owner operations. It may not customize a read failure into permission or make an invalid time mean unlimited access. Delegation policy and membership revocation are separate concerns: disabling new invitations for a role does not, by itself, revoke an existing assignment."
        },
        {
          "kind": "paragraph",
          "text": "Validate changes with `principalScopeLifetimeContract.test.js` and the existing `principalAuthorizationScopeContract.test.js`. Installed persistence, interface behaviour, diagram rendering and guide publication require their own evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Employee self-application intake",
          "anchor": "securityIdentityAccessGovernance-21-employee-self-application-intake"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Withdrawal, Corrected Attempts And Deadlines",
          "anchor": "securityIdentityAccessGovernance-22-withdrawal-corrected-attempts-and-deadlines"
        },
        {
          "kind": "paragraph",
          "text": "Profile now contains independently qualified application lifecycle source, with matching Axis rendering. This is employee access onboarding, not deactivation of an already approved enterprise. Deployment acceptance has not been established."
        },
        {
          "kind": "paragraph",
          "text": "Applicants can withdraw their own pending application using the advertised withdrawal command and displayed revision after mailbox proof. Approval and withdrawal share revision/hash concurrency checks: a stale action rejects rather than overwriting a newer outcome. Axis asks for confirmation and requires progress inspection after an uncertain response. Identical acknowledged withdrawals are read-only; other mailboxes and approved/claimed registrations are ineligible."
        },
        {
          "kind": "paragraph",
          "text": "Rejected, withdrawn or expired attempts can be corrected after new mailbox verification, subject to current enterprise eligibility and attempt limits. Each fresh attempt retains its predecessor's details, outcome and Process correlation privately, has a new attempt-bound hash and consumes fresh proof. Safe history shows attempt, outcome, submission/closure/deadline timestamps and reviewer feedback, never private proof, workflow handles, tenant or credentials."
        },
        {
          "kind": "paragraph",
          "text": "Framework configuration lives at `enterpriseManagement.applications.lifecycle`: `qualified: false`, `maximumAttempts: 5`, `maximumHistoryBytes: 65536`, `expiryDays: null`. An explicitly chosen 1-365 day expiry freezes its deadline at draft creation. Changing configuration does not retrofit existing applications. Profile lazily enforces deadlines on resolution, status, submission, reviewer-list reads and decision application. It never expires approved/registered access. Idle records are not proactively swept by this source; no cron job or business deadline has been invented. Later project/runtime layers can narrow limits and override presentation through normal partial exports, without copying the lifecycle owner."
        },
        {
          "kind": "paragraph",
          "text": "Application history is protected from generic CRUD through private owner-write admission. A delayed claimed Process callback for a closed old attempt completes with no access outcome rather than approving a fresh attempt. Independently false `applications.review.retirementQualified` enables source-owned retirement after committed closure. Its signed Process route requires original context and one waiting governed task; task CAS competes with completion, and matching private closure evidence allows staged lost-ack recovery. Claimed remote actions require inspection. Closure is not rolled back by retirement uncertainty. Existing Axis recovery adds the revision-bound RETRY_REVIEW_RETIREMENT command for qualified closed reviews. Superseded historical attempts and idle sweeps remain separate; generic governed-review cancellation is not bypassed. Before activation, jointly verify races, stale callbacks, lost acknowledgements, expiry boundaries, correction/history, exact installed permissions, keyboard/focus and narrow Axis layouts."
        },
        {
          "kind": "paragraph",
          "text": "See the [account access contract](../../../../nodics.platform/modules/profile/llm/contracts/account-access-journeys.md) for exact commands, bounds, customization and remaining integration gates."
        },
        {
          "kind": "paragraph",
          "text": "This Profile capability saves a new person's request to join an enterprise. It is disabled by default. The source-tested intake and read-only administrator list do not yet constitute the complete Axis/Process approval journey. Do not enable the business journey until its actual client and workflow integration have passed their separate acceptance checks."
        },
        {
          "kind": "paragraph",
          "text": "For the applicant, email verification proves control of the mailbox. It does not make the person an employee. For an administrator, a pending request means that verified details are available for review; it does not mean a workflow decision was made, a password was created, or access was granted."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Email[Existing Profile email verification] --> Eligible[Named eligible enterprise choices]\n  Eligible --> Details[First name, last name and optional message]\n  Details --> Draft[Private application draft]\n  Draft --> Proof[Consume proof for this exact application]\n  Proof --> Pending[Awaiting review: no login or scope]\n  Pending --> List[Enterprise-scoped administrator list]\n  Pending -. Separate integration still required .-> Review[Process task and decision]\n  Review -. Separate authorised onboarding .-> Access[Approved membership and account setup]"
        },
        {
          "kind": "paragraph",
          "text": "The solid arrows describe intake. The dashed arrows are required follow-on integration, not a claim that approval or employee activation is implemented by this intake service. Process remains the task and decision authority."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Worked request and failure recovery",
          "anchor": "securityIdentityAccessGovernance-23-worked-request-and-failure-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Suppose Maya requests access to Example Company. The enterprise must already exist and explicitly permit applications. Maya enters her email once through Profile's existing start/verify continuation. Only after successful verification does the response offer enterprise names. An existing employee or customer goes to existing-account authentication instead; this path never creates a duplicate."
        },
        {
          "kind": "paragraph",
          "text": "The frontend must use the backend-advertised application submit path. Its finite request consists of the current continuation, selected enterprise, first and last names, and optional note. It must not submit a password, role, approval, reviewer, tenant or verification flag. For example, the non-secret details are:"
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"enterpriseCode\": \"exampleCompany\",\n  \"firstName\": \"Maya\",\n  \"lastName\": \"Example\",\n  \"note\": \"Joining the operations team\"\n}"
        },
        {
          "kind": "paragraph",
          "text": "The protected continuation is additionally required and stays in client memory; it is deliberately omitted from this example. A saved result has stage `APPLICATION_PENDING` and item status `AWAITING_REVIEW`. The administrator's read-only list is `GET /nodics/profile/v0/enterprise-access/applications`. The owning route still checks employee authentication, access groups, permission and enterprise scope. A platform-authorised administrator may filter enterprises; an ordinary enterprise administrator cannot select another enterprise's records."
        },
        {
          "kind": "table",
          "headers": [
            "Situation",
            "Safe outcome"
          ],
          "rows": [
            [
              "Proof is missing, expired or belongs to another continuation",
              "No application becomes reviewable; verify again."
            ],
            [
              "The code was consumed but its response was lost",
              "Inspect the exact original consumption receipt; do not create a second execution grant."
            ],
            [
              "The submission response was lost after persistence",
              "Exact revision/marker readback confirms the same submission without another record."
            ],
            [
              "The enterprise no longer accepts applications",
              "Stop before submission; the earlier choice is not continuing authority."
            ],
            [
              "An invitation, registration or conflicting application already exists",
              "Preserve it and report a conflict, rather than replacing its history."
            ],
            [
              "Persistence is unavailable or returns an unrelated record",
              "Fail safely; no success or empty permitted directory is inferred."
            ],
            [
              "An administrator attempts another enterprise's review list",
              "Deny the request unless the authenticated platform context explicitly permits it."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-24-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "The Profile defaults live in `enterpriseManagement.applications`. A later project layer may narrow permitted initial roles, choice counts, note length and page size, and refine the declarative presentation. The enterprise record's `employeeApplicationPolicy` contains its explicit `enabled`, `method` and `roleCode` selection. For a standard operator application, use the existing `OPERATOR` responsibility with the supported `PASSWORD` method; no role catalogue belongs in Axis. Absence of enterprise policy means no applications."
        },
        {
          "kind": "paragraph",
          "text": "Do not customise away proof, immutable request binding, existing-record preservation, enterprise filtering or the distinction between application and approval. Configuring an eligible enterprise does not install a Process workflow, grant runtime credentials, enable SMTP, or complete a frontend."
        },
        {
          "kind": "paragraph",
          "text": "Run `node --test nodics.platform/modules/profile/test/enterpriseApplicationIntake.test.js` from the framework root, followed by the existing registration/setup regressions. These tests use actual services with controlled persistence and transport. Real installed-schema, distributed-runtime, browser and business-reader acceptance remain separate. This section is authored source, not evidence of publication."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Personal memberships and enterprise context",
          "anchor": "securityIdentityAccessGovernance-25-personal-memberships-and-enterprise-context"
        },
        {
          "kind": "paragraph",
          "text": "The source now provides a separate My enterprise memberships task. This is not the administrator's team screen: it shows only the current person's assignments and invitations. A reviewed acceptance links a responsibility to the existing canonical person; it neither creates another password nor changes the active browser context. After uncertain acceptance, inspect current state before explicitly resuming a prepared acceptance. Suspended access cannot be entered."
        },
        {
          "kind": "paragraph",
          "text": "Entering an accepted enterprise is a second reviewed action. Profile verifies matching PASSWORD Employee access/refresh contexts, exact current assignment revision and canonical identity, approved browser origin and CSRF. It rotates the HttpOnly refresh credential and returns only target access data. Axis hides the old workspace, cancels/clears caches and loads the target's authenticated bootstrap. It never unions permissions or changes the project's endpoints."
        },
        {
          "kind": "paragraph",
          "text": "A failed or lost switch acknowledgement requires normal sign-in rather than automatic retry or restoration of the old UI. Customer/external switching is unavailable, and a legacy canonical baseline without a managed assignment is entered through normal sign-in. Runtime qualification remains disabled, including `enterpriseManagement.memberships.browserContextSwitchQualified`; source is not joint-session or customer acceptance. The detailed owner/security/customization contract is Profile's `llm/contracts/enterprise-membership.md`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Current-enterprise team administration",
          "anchor": "securityIdentityAccessGovernance-26-current-enterprise-team-administration"
        },
        {
          "kind": "paragraph",
          "text": "Profile now supplies the source contract for a native Axis team task through the existing Employees capability. This is default-disabled implementation source, not a deployed or accepted feature. See Profile's `llm/contracts/enterprise-membership.md` for the owner and extension contract."
        },
        {
          "kind": "paragraph",
          "text": "Once the installed membership inventory, session bindings, assignment claim index and serialized team writes are qualified, and `profileMembership` exposure is explicitly enabled, an admitted administrator can read the current enterprise's bounded team workspace. The signed access context selects the enterprise. A URL, query field or browser draft cannot select another tenant or grant authority."
        },
        {
          "kind": "paragraph",
          "text": "Rows carry an assignment revision and backend-provided actions. The designated default administrator and the last active administrator cannot be suspended or revoked through team commands. Handover targets an existing active administrator; it changes the designation, not credentials or the target's permissions. Missing legacy administrator evidence blocks the task pending reconciliation."
        },
        {
          "kind": "paragraph",
          "text": "Axis reviews the selected person and action before submitting one command. A lost acknowledgement is an uncertain result, not a failed write: inspect current state or explicitly resume the same command with the same operation ID and revision. Never generate a fresh command to escape a pending operation or assume that a completed marker proves success. Browser recovery state is in memory; reload/crash and loss of actor authority require the still-pending operator recovery work before qualification."
        },
        {
          "kind": "paragraph",
          "text": "Later Profile layers customize `enterpriseManagement.teamAdministration.presentation` and exported service members, preserving permission, scope, revision, designation and serialization invariants. Kickoff does not need copied team services or a separate registry. This task does not implement invitation acceptance or browser enterprise-context switching. Behavioral, keyboard, narrow-layout and installed-runtime acceptance remain deferred to the joint validation session."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Application review recovery: decisions and messages are separate",
          "anchor": "securityIdentityAccessGovernance-27-application-review-recovery-decisions-and-messages-are-separate"
        },
        {
          "kind": "paragraph",
          "text": "Consider Maya's request to join Example Enterprise. Profile saves her verified application. Process owns the reviewer task and its decision. Communication owns the subsequent message. A message failure cannot undo a completed review, and a message marked accepted cannot establish that Maya has an active employee account."
        },
        {
          "kind": "paragraph",
          "text": "A lost Process-start response is reconciled using the same saved instance identity and pinned definition version. It does not justify creating another review. An incomplete start is a Process recovery incident, not permission to replay nodes. An authorised recovery command must use the current application revision and the administrator's own permitted enterprise context; another enterprise is denied."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  A[Verified application saved] --> B[Process review correlation retained]\n  B --> C[Process reviewer decision]\n  C --> D[Profile records approved or rejected]\n  D --> E[Freeze non-secret notification inputs]\n  E --> F[Communication intent requested with stable key]\n  F --> G[Record intent reference and request status]\n  F --> H[Unconfirmed: preserve decision and original message]\n  H --> F\n  G --> I[Communication owns delivery and reconciliation]"
        },
        {
          "kind": "paragraph",
          "text": "The return arrow reuses one Communication request identity. It never calls SMTP directly, creates another approval or repeats employee provisioning."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Developer and support integration",
          "anchor": "securityIdentityAccessGovernance-28-developer-and-support-integration"
        },
        {
          "kind": "paragraph",
          "text": "The Profile recovery route is `POST /nodics/profile/v0/enterprise-access/applications/:applicationCode/actions`. Its body contains only `operation` and the current integer `revision`. `RETRY_REVIEW_START` reconciles the existing submitted review. `RETRY_NOTIFICATION` requests the existing approved/rejected outcome message. The route does not accept an approval, password, role, recipient or template. Its response is a fresh management projection, not a new employee or permission. The matched Axis action and authoritative revision view must be connected before this API can be presented as a complete business-user task."
        },
        {
          "kind": "table",
          "headers": [
            "Observed condition",
            "Correct interpretation and recovery"
          ],
          "rows": [
            [
              "Review start is not confirmed",
              "Retain the application and its pinned correlation; reconcile that same Process instance."
            ],
            [
              "Approval saved, message unconfirmed",
              "Keep the approval; retry the same Communication intent through authorised recovery."
            ],
            [
              "Intent already has a reference",
              "Do not request a second provider send from Profile; use Communication's existing delivery recovery."
            ],
            [
              "Application changed after the operator loaded it",
              "Refresh the owning record before another command; do not overwrite the newer revision."
            ],
            [
              "Applicant already registered",
              "Do not send obsolete setup instructions as a new notification."
            ],
            [
              "New application intake paused",
              "Existing review visibility is separate from allowing new applications."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-29-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Use the existing layered review/mail settings for connection selection and safe presentation changes. Existing message snapshots remain immutable across retries; a later wording change applies to later decisions. Override exported owner methods only while preserving human scope, exact revision, Process correlation, single Communication intent and non-secret evidence. The focused source regression is `profile/test/enterpriseApplicationReviewRecovery.test.js`; it does not replace installed-provider, browser, accessibility or business-reader acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Read-only legacy identity assessment",
          "anchor": "securityIdentityAccessGovernance-30-read-only-legacy-identity-assessment"
        },
        {
          "kind": "paragraph",
          "text": "Profile now has an additive source-only assessment command at `POST /nodics/profile/v0/identity/migration/assessment`, accepting `{}` only. It remains disabled by default under `identityGovernance.migration.assessment.enabled`. Approved operators need a human platform-context access token, `runtimeConfigAdminUserGroup` and the existing `identity.migration.preview` permission. Customers, service credentials and tenant administrators outside the platform context cannot use it as an identity directory."
        },
        {
          "kind": "paragraph",
          "text": "The existing migration owner reads counted, bounded inventories through generated Profile services across the authority's declared tenants. Two matching metadata passes produce counts and redacted conflict references for email collisions, customer/employee coexistence, credential references, groups, assignments and interrupted registration. References are opaque and correlate only within one run. No email, password, hash or raw provider error is returned. An unavailable tenant, incomplete page or changed second pass rejects the assessment rather than proving that an account is absent."
        },
        {
          "kind": "paragraph",
          "text": "This is not a transactional snapshot or an executable migration plan. Every successful report retains `atomicSnapshot: false` and `readyForApply: false`. The command performs no repair, account linking, credential rewrite, index change or registration enablement. Preserve existing histories and interrupted operations; an email match never authorizes identity merging. Operator-reviewed reconciliation, administrator coverage, final-write concurrency and live acceptance remain separate."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-31-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "Partners customize the existing layered limits or narrow exported migration-service members, not customer copies of the inventory implementation. The exact API, projection, limits, recovery and extension contract is maintained in Profile's `llm/contracts/identity-assessment.md`; fixture coverage is authored in `test/identityAssessmentContract.test.js`. Neither source documentation nor fixtures claim that target inventory or installed-runtime testing has taken place."
        },
        {
          "kind": "paragraph",
          "text": "For example, in `<project>/modules/<profile-extension>/config/properties.js`, reduce the approved per-pass capacity without activating the route:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  identityGovernance: {\n    migration: { assessment: { enabled: false, maximumRecords: 10000 } },\n  },\n};"
        },
        {
          "kind": "paragraph",
          "text": "The remaining framework limits are inherited. Project/runtime service overrides use the same existing service identity and exported members. They may add stricter checks but cannot permit system-token access, partial success, secret output or automatic identity linking. On a bound failure, review capacity with the operator; on a changed observation, retry a fresh read during an approved quieter window."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Scope changes and evidenced team recovery",
          "anchor": "securityIdentityAccessGovernance-32-scope-changes-and-evidenced-team-recovery"
        },
        {
          "kind": "paragraph",
          "text": "Profile owns security propagation for persisted scope saves/upserts, updates and removals. A validated mutation captures old and new human/customer/group targets privately, then invalidates before writing and again after writing. Group targets include current inheriting groups. Counted fresh inventories reject truncation, repeated identifiers, changing counts and configured overflow. Flat `$set` and `$unset` scope updates are supported; dotted fields and other operators reject."
        },
        {
          "kind": "paragraph",
          "text": "An ordinary original-account mutation uses its generated principal owner and awaits exactly one acknowledged update plus shared security stamps. This is conservative: all proofs bound to that original account may expire. A linked Employee projection instead advances its accepted target membership revision; credentials and other enterprise projections are not rewritten. Linked Customer scope mutation remains unavailable pending governed reverse participation. Scope hooks do not invalidate all sessions after a global configuration change."
        },
        {
          "kind": "paragraph",
          "text": "For users, a scope change can require sign-in or selecting the enterprise again. A failed mutation can leave earlier security invalidations applied; administrators must inspect the owning scope record before deciding whether to resubmit. Missing principals do not produce fictitious acknowledged updates. Runtime deployment scopes keep their existing private reset and service-principal path."
        },
        {
          "kind": "paragraph",
          "text": "For operators, `POST /nodics/profile/v0/enterprise-team/reconcile-committed` accepts only `{enterpriseCode, teamRevision, operationId}`. It requires fresh PASSWORD platform-administrator authority, current assignment permission and independent recovery qualification. New operations retain reviewed input privately. The owner verifies the saved input/hash/actor and exact committed membership state, repairs its stamp, rechecks actor and assignment, then finalizes the held operation through the existing conditional enterprise write. The response contains no private identity/input/hash. The command never resubmits a membership mutation."
        },
        {
          "kind": "paragraph",
          "text": "Flow: operator reviews recorded operation -> Profile admits fresh platform proof -> verifies committed assignment evidence -> repairs stamp -> rechecks authority and assignment -> conditionally records the original outcome. Any uncertainty stops before lease completion. A pending handover, absent input, stale revision, uncommitted write or changed assignment remains locked; timeouts never authorize takeover. General actor-loss recovery and a matching operator UI remain open."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize and extend safely",
          "anchor": "securityIdentityAccessGovernance-33-customize-and-extend-safely"
        },
        {
          "kind": "paragraph",
          "text": "For a stricter inventory bound, use a small later Profile property contribution:"
        },
        {
          "kind": "code",
          "language": "js",
          "text": "module.exports = {\n  identityGovernance: {\n    securityStampInventory: { pageSize: 50, maximumPages: 20 },\n  },\n  enterpriseManagement: {\n    teamAdministration: { operatorRecoveryQualified: false },\n  },\n};"
        },
        {
          "kind": "paragraph",
          "text": "Use `<project>/modules/<profile-extension>/config/properties.js`; inherit the framework owners instead of copying services into Kickoff. Limits are positive integers at most 1000 each. Preserve bounded complete reads and private provenance. Later exported scope/team members may impose stricter admission but cannot bypass canonical credential ownership, acknowledged writes, evidence verification or revision guards. Reject overflow until capacity and operator authority are reviewed; do not treat raising a limit as runtime acceptance."
        },
        {
          "kind": "paragraph",
          "text": "Framework-maintainer fixtures cover direct/group/linked targets, old/new selectors, save preimages, failed acknowledgements, forged targets, default-off recovery, wrong platform/method, missing input, tampered evidence and late assignment changes in `profile/test/humanScopeInvalidationContract.test.js` and `profile/test/teamCommittedRecoveryContract.test.js`. These fixtures are authored, not executed acceptance. Installed distributed cache/persistence, competing writes, user/operator browser acceptance and global-policy invalidation remain separate gates. Documentation is authored source only; no content-pack publication or runtime qualification follows from this guide."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Live Context Admission And Privacy Boundary",
          "anchor": "securityIdentityAccessGovernance-34-live-context-admission-and-privacy-boundary"
        },
        {
          "kind": "paragraph",
          "text": "The October source increment adds generic nAuth/nService validation after JWT, revocation and security stamps. A typed session requires a qualified installed owner and exact matching `{valid:true,owner,code,version}` evidence. The validator receives detached, deeply frozen bounded JSON-safe claims; it cannot change the verified identity, tenant, groups or permissions returned by authorization. Unsupported, missing, malformed or failed owners reject without a stamp-only fallback or private error details."
        },
        {
          "kind": "paragraph",
          "text": "Profile contributes `DefaultProfileSessionContextValidationService`, which calls the live membership, participation or native customer eligibility owner and returns only the matched proof, not canonical records. Qualification remains false. The implemented nService bridge uses existing module topology and transport; remote consumers pass the original signed access token to the fixed private Profile route `POST /internal/session-context/validate`. A separately authenticated runtime principal needs `profile.sessionContext.validate`. Profile independently verifies the subject token, checks exact tenant/enterprise scope and performs live owner admission. Neither service credentials nor unsigned caller claims can impersonate the subject. There is no public unsigned-claims endpoint. Later framework/runtime layers must preserve fresh owning admission and fail-closed validation, not duplicate identity registries in a customer project."
        },
        {
          "kind": "paragraph",
          "text": "Consent provenance retains the governed authorization-policy version. Effective policy changes must advance that version across issuers and consumers; restoring old policy values must not roll back the version or revive old grants. Read-only workspaces project expiry and exact revoke authority without silently writing an expiry transition."
        },
        {
          "kind": "paragraph",
          "text": "Enterprise team evidence and historical identity-retirement markers are stripped from public generated reads. Exact private owner requests retain the evidence needed for guards and recovery. nConfig's logger has source corrections for structured, serialized/quoted JSON and Error redaction, but fixtures remain unrun. The router now admits sensitive routes before body parsing through Logger's private request context, and carries exact admission into derived owner requests. Logger suppresses supported private capture before buffering; providers must use a detached `runSensitiveOperation` request. The credential retirement primitive uses revision CAS and metadata-only acknowledgement rather than putting a stored hash in a query. Installed raw-body/APM/proxy capture, custom sinks, Password writer coverage and distributed cache behavior still require qualification. Source availability does not certify end-to-end privacy or distributed access."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Configure The Live Context Bridge",
          "anchor": "securityIdentityAccessGovernance-35-configure-the-live-context-bridge"
        },
        {
          "kind": "paragraph",
          "text": "The generic contribution lives in nAuth `config/properties.js`; Profile contributes the local owner, while nService owns topology and authenticated transport. Keep `sessionContextValidation.qualified`, `remoteQualified` and `captureProtectionQualified` false until the installed acceptance matrix passes. `connectionName` defaults to `profileModuleName`; it selects an existing connection, not a second endpoint catalogue. `timeoutMs` is bounded to 1-60000 milliseconds. `allowInsecureLoopback` defaults false. HTTPS must preserve certificate verification, and sensitive transport does not follow redirects or carry credentials in a URL."
        },
        {
          "kind": "paragraph",
          "text": "Once a coordinated native-customer rollout is approved, Profile's `requiredPrincipalTypes:[\"customer\"]` must be mirrored across all consumers. A contextless customer token then rejects instead of bypassing current eligibility. Do not upgrade old tokens silently or enable consumers ahead of the issuing owner. Human/service context requirements remain explicit policy, not a blanket platform login redesign. Failure of the selected owner, malformed evidence, changed scope or missing private admission fails closed; existing revocation and stamp checks still run."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Native Customer Issue And Refresh",
          "anchor": "securityIdentityAccessGovernance-36-native-customer-issue-and-refresh"
        },
        {
          "kind": "paragraph",
          "text": "Qualified native customer issuance retains `profile.customerEligibility` with the original customer code/auth revision and both original identity/customer bindings. Issuance rereads the original account, current credentials, lockout and current groups after authentication. It registers existing stamp bindings before creating the pair and performs live eligibility admission again before returning credentials. Refresh revalidates retained context, resolves the same original account and rereads current state; it never substitutes an Employee membership or unions enterprise groups. Failed final admission removes the newly created refresh record. Disabled policy preserves legacy behavior, but is not evidence of installed lifecycle enforcement."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Repair Committed Consent Stamps",
          "anchor": "securityIdentityAccessGovernance-37-repair-committed-consent-stamps"
        },
        {
          "kind": "paragraph",
          "text": "Use GET `/enterprise-administration/:enterpriseCode/consent/stamps/repair` to inspect bounded committed grants. Admission requires a fresh PASSWORD-authenticated target administrator or independent platform super-admin and the separately configured `profile.enterpriseAdministration.repairSecurityStamps` permission. A grant carries only code, revision, status and explicit `canRepair`; private evidence stays in Profile."
        },
        {
          "kind": "paragraph",
          "text": "POST the same path with `enterpriseCode`, inspected `revision`, retained `operationId` and an explicit unique `grantCodes` selection (1-100). Repair verifies the committed source again and advances stamps monotonically. It neither replays grant/revoke nor changes enterprise hierarchy, adopts another command or steals a pending lease. Only an exact COMPLETE receipt acknowledges the reviewed selection. Uncertainty requires fresh inspection and explicit confirmation of the original command. `stampRepairQualified` and `externalInvalidationQualified` remain false until accepted writer coverage, persistence and cache evidence. Customer participation is independent of enterprise administration consent throughout these flows."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Canonical Contact Verification And Notification Preferences",
          "anchor": "securityIdentityAccessGovernance-38-canonical-contact-verification-and-notification-preferences"
        },
        {
          "kind": "paragraph",
          "text": "Profile's `DefaultProfileVerifiedContactService` uses the existing Contact linked from the original canonical identity. A native Customer owns that Customer's contacts; an Employee-backed Customer participation uses the original Employee's contacts without receiving employee permissions. Current actor, customer participation, original locator and complete association are rechecked. Login or email equality is never identity or verification evidence. Channel selection uses the unique lowest-priority active EMAIL/PHONE contact; ties and missing associations reject rather than silently selecting an address."
        },
        {
          "kind": "paragraph",
          "text": "The protected Customer-only POST routes under `/customer/contacts/verification/` are `inspect`, `begin`, `verify`, `consent` and `suppression`. All need qualified private capture, current access/stamps, configured `profile.customer.contact.manage` and explicit API exposure. The browser supplies its ownerId and channel, never an address, template or canonical locator. Inspect returns safe progress; begin includes expectedRevision; verify adds original commandId and transient code. Secrets and proofs stay out of responses and records. Consent adds purpose, its reviewed purposeVersion, explicit granted and operationReference; suppression adds purpose and explicit suppressed. Both require the inspected expectedRevision."
        },
        {
          "kind": "paragraph",
          "text": "GET `/customer/contacts/verification/workspace` publishes the self-owned projection ID, admitted channels, explicit purpose versions/labels and twenty bounded plain-text presentation fields. It accepts no selectors and performs no delivery or mutation. Circa must use this metadata rather than guessing an ID from login/email or supplying its own notification-purpose policy. A hidden/disabled application feature is not backend authorization; every command still proves current self ownership."
        },
        {
          "kind": "paragraph",
          "text": "Circa's shared account/preferences view consumes that workspace across Web and mobile/Telegram. `VITE_CIRCA_CONTACT_PREFERENCES_ENABLED` defaults off and controls presentation only. Customers select an admitted channel, inspect original progress, review a one-shot verification or preference command, and inspect again after an uncertain result. No destination input or technical owner ID is displayed. Consent pins the reviewed purpose version as well as the Contact revision; changed policy requires fresh review. Clearing suppression never grants consent. Held verification checkpoints remain inspect-only when their original proof cannot safely be recovered."
        },
        {
          "kind": "paragraph",
          "text": "An Employee-to-Customer browser handoff first reviews the current participation workspace. `currentTerms` and `canSwitch` are fresh owner projections, not inference from COMPLETE status. When current consent is ready, POST `/employee/browser/customer-participation/switch` consumes the original Employee refresh proof and issues Customer-only authority. The endpoint stays within the existing Employee cookie path, with existing CSRF protection; cookie scope is not widened to all Profile operations. Changed/withdrawn consent requires explicit review, not forced renewal of unchanged terms or silent conversion of staff tokens."
        },
        {
          "kind": "paragraph",
          "text": "The owning sequence is:"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "Customer -> protected Profile self command -> canonical Contact selection\n         -> Contact ISSUE_PENDING CAS -> Communication challenge ISSUE\n         -> original delivery checkpoint -> Communication template delivery\n         -> submitted code -> VERIFY_PENDING CAS -> Communication VERIFY\n         -> CONSUME_PENDING CAS and frozen completion -> Communication CONSUME\n         -> Contact VERIFIED readback -> separate explicit purpose consent\nCommerce committed event -> stored buyer proof -> current Contact proof/consent\n                         -> source reread -> original Communication intent"
        },
        {
          "kind": "paragraph",
          "text": "Contact stores only private versioned binding, checkpoint digests/deadlines, acknowledged verification and consent/suppression. Generic Contact mutation cannot manufacture or erase it; Customer/Employee reassociation and recursive public reads must use the installed guards and redaction. Actual Contact CAS and complete readback are required. A receipt may reconcile only the exact original held consumed command; it does not execute consumption again, extend deadlines or grant consent. Missing transient proof or interrupted expiry remains held for reviewed recovery, not an automatic command replacement or CRUD reset."
        },
        {
          "kind": "paragraph",
          "text": "The resources live under Profile `src/templates/email/contact-email-verification` and `src/templates/sms/contact-sms-verification`. Manifests identify `profile.contact.emailVerification` and `profile.contact.smsVerification`, purpose PROFILE_CANONICAL_CONTACT and declared verificationCode/expiresAt parameters. HTML/text/subject/message files follow the normal layered resource loader; content does not belong in properties, and Employee templates are not a Contact fallback. Communication still owns rendering, provider delivery and durable intent status. Queued/provider-accepted is not independent mailbox receipt."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Customize Contact And Eligibility Safely",
          "anchor": "securityIdentityAccessGovernance-39-customize-contact-and-eligibility-safely"
        },
        {
          "kind": "paragraph",
          "text": "Use a later Profile module's `config/properties.js`, not copied Kickoff services. All `profileVerifiedContacts` qualification gates and its API exposure default false. `maximumVerifiedAgeSeconds` is deliberately unset until a reviewed policy selects it. Sender/provider/secret references and recipients remain approved runtime inputs. The two declared DIGITAL_COUPON_PURCHASED/REFUNDED purposes are transactional descriptors, not granted consent or marketing subscription. Every declared purpose requires explicit self consent for its current version. Suppression overrides it; clearing suppression never grants permission."
        },
        {
          "kind": "paragraph",
          "text": "For example, a custom project may narrow maximumContacts, remove SMS from selected purpose channels and override only `en/email.html` plus `en/email.txt` beneath the same template directory. Preserve manifest identity, purpose, parameters and secure rendering. A genuine regulated evidence provider may extend the existing Rules property catalogue; it may not turn a missing proof into verified or approve every customer. Published policy and scope selections are intentionally unapproved here."
        },
        {
          "kind": "paragraph",
          "text": "The registered generic provider is `profile.customerEligibility`, catalogue version 1, with explicit PROFILE_CUSTOMER_ELIGIBILITY_ALLOW/DENY outcomes. It loads current account/identity/consent/contact facts into a private transient Rules context, not browser-supplied evidence. Denial overrides approval; absence of a matched approved published policy is not eligibility. Regulated KYC vendor integration is a separate later-layer provider, never a fictional framework certificate."
        },
        {
          "kind": "paragraph",
          "text": "Joint acceptance must include native and Employee-backed customers, missing/changed contacts, tied priority, consent withdrawal, suppression, purpose version change, provider rejection, lost consume/delivery acknowledgement, recursive CRUD/cache privacy and cross-runtime financial-source drift. All behavioral and visual evidence remains NOT RUN. The detailed implementation and recovery contract is Profile's `verified-contact-consent.md`; source availability authorizes no sending or migration."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Ordinary Customer signup and optional eligibility",
          "anchor": "profile-ordinary-signup-optional-eligibility"
        },
        {
          "kind": "paragraph",
          "text": "Ordinary customer signup creates a customer identity, like opening a shop account. It is not employee membership, linked participation or evidence that a regulated business check passed. Profile owns form normalization, uniqueness, password hashing, principal policy, active Enterprise/Tenant placement and generated persistence. Cart, DigitalCore and customer adapters consume that identity; they must not create shadow accounts or enable qualification flags to make a purchase pass."
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Form[\"Bounded account form or structured signup\"] --> Placement[\"Fresh active Enterprise and Tenant placement\"]\n  Placement --> Switch{\"Trusted profileCustomerEligibility.enabled\"}\n  Switch -->|false| Ordinary[\"Ordinary signup without eligibility decision receipt\"]\n  Switch -->|true| Owner[\"Selected authoritative eligibility owner and policy\"]\n  Switch -->|missing or non-Boolean| Refuse[\"Fail closed\"]\n  Owner -->|qualified positive decision| Persist[\"Recheck placement before generated persistence\"]\n  Owner -->|denied, absent or malformed| Refuse\n  Ordinary --> Persist\n  Persist --> Account[\"Registered identity; authentication remains separate\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Trusted selection",
            "Required behavior",
            "Not implied"
          ],
          "rows": [
            [
              "enabled: false",
              "Ordinary signup/import requires no eligibility owner, published Rules policy or decision receipt. Active placement and normal security remain mandatory.",
              "No fabricated approval; employee participation gates are not disabled."
            ],
            [
              "enabled: true",
              "Require selected qualified authoritative owner, policy and private decision/audit enforcement. Denied, missing or malformed evidence rejects.",
              "A body flag or customer assertion cannot approve eligibility."
            ],
            [
              "Missing or non-Boolean enabled",
              "Reject malformed configuration rather than silently switching enforcement off.",
              "An unavailable owner is not a reason to invent a permissive default."
            ],
            [
              "Employee-backed Customer participation",
              "Independent consent, qualification and eligibility rules still apply.",
              "Ordinary signup does not establish employee membership or participation rights."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The existing default is the Boolean false. Later layers select the policy through nConfig, not request input. The owner reads fresh exact active Enterprise and Tenant placement for both ordinary and imported signup and rechecks before persistence. An inactive, missing, foreign or inconsistent placement rejects even when optional eligibility is disabled. Conversely, neither employee membership nor paid membership is a universal prerequisite for ordinary customer signup or coupon ownership. Regulated KYC is a separately selected business requirement, never inferred from a default service name."
        },
        {
          "kind": "paragraph",
          "text": "POST /customer/registrations is the existing service-authenticated form route with profile.customer.register. Its mapper accepts bounded email, full name and password and delegates to the normal signup pipeline. Email is trimmed/lowercased, names are normalized without rejecting mononyms, and passwords are not trimmed. Caller code, owner, groups, permissions and verification flags do not confer authority. The response registered:true is not sign-in, verified email ownership or consent to a separate participation scheme. The structured /customer/signup path remains compatible."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize ordinary registration without weakening admission",
          "anchor": "profile-ordinary-signup-customization"
        },
        {
          "kind": "paragraph",
          "text": "A customer project can narrow profileCustomerRegistrationForm limits or customize the documented formCustomerCode member in an existing active Profile layer. For example, shorten an allowed name limit for a deployment while retaining normal normalization, stable identity format, principal uniqueness and password policy. If the deployment requires eligibility, select enabled:true and qualify the authoritative owner and decision policy before admitting users; do not substitute a browser checkbox for the owner decision. Keep imported signup on the same admission and active-placement boundary. Configuration edits follow their normal selected-server refresh/build lifecycle, not a documentation publication."
        },
        {
          "kind": "table",
          "headers": [
            "Success, rejection or interruption",
            "Evidence and recovery"
          ],
          "rows": [
            [
              "Ordinary signup with eligibility disabled",
              "Registered identity plus normal authentication evidence; no invented eligibility receipt."
            ],
            [
              "Eligibility enabled but owner/policy unavailable",
              "Retain the owner refusal. Restore qualified policy/services; do not toggle unrelated participation flags."
            ],
            [
              "Inactive or changed placement",
              "Reject before persistence; resolve Enterprise/Tenant ownership rather than moving a customer by request body."
            ],
            [
              "Interrupted signup response",
              "Reconcile through normal sign-in/account recovery and existing owner records before another registration; never create a shadow identity."
            ],
            [
              "Source/contract tests pass",
              "Form and placement behavior is covered in isolation; live sessions, browser behavior and regulated-provider acceptance remain separate."
            ]
          ]
        },
        {
          "kind": "ordered-list",
          "items": [
            "Run form success/rejection, mononym, privileged-field isolation and stable-identity tests.",
            "Exercise false, true, absent and malformed enablement; prove enabled eligibility denial and unavailable-owner failures remain enforced.",
            "Verify fresh placement and pre-persistence recheck for ordinary and imported signup, including foreign/inactive Enterprise or Tenant.",
            "Test actual customer authentication separately from registration. Retain Employee/Customer participation consent and qualification gates; do not report a successful shop signup as their acceptance."
          ]
        }
      ],
      "searchText": "Security, Identity, and Access Governance Authentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities. # Security, Identity, and Access Governance\n\n## October 2026 Source Consolidation Boundary\n\nFor business users and operators, source availability is different from an enabled enterprise journey. The current branch adds explicit target-owned consent, held hierarchy changes, historical application retirement and staged historical identity linking. Those capabilities retain independent false qualifications. Beginners must not activate switches to bypass missing owner approval or unfinished acceptance. Developers extend existing Profile owners; Kickoff remains lightweight.\n\n### Target Consent And Relationship Changes\n\nProfile stores private consent on existing Enterprise records, not another tree or identity registry. New enterprise creation captures creationDefault=false with empty rights; retries retain existing rights and later configuration changes never retrofit them. Positive-default source requires an explicitly approved `creationRights` policy, fresh human platform authority and a ready immediate-parent administrator; missing approval or incomplete rights reject before setup writes. This policy remains null by default. Source administration also recognizes fresh accepted assignments with an explicit `ENTERPRISE_ADMIN` role classification, not a role label or broad group alone. Targets can grant explicit ancestor VIEW/INVITE consent with role and exact- recipient ceilings, bounded expiry and canonical source evidence. Independently qualified MANAGE_ACCESS permits bounded onward commands, never operational authority, automatic descendant access or Customer consent. Onward qualification stays false.\n\nConsent routes GET/POST `/nodics/profile/v0/enterprise-administration/consent` use management exposure, human access authentication, configured permission and no-store responses. Generic CRUD cannot manufacture, replace or erase private proof. Operator projections contain only current revision and bounded grant summaries, not canonical locators, command hashes or credentials. Ancestor invitations revalidate ceilings at acceptance and membership issue/switch/refresh. Independent typed consent stamps join canonical and membership proofs; groups are never unioned across enterprises.\n\nThe target-aware GET `/enterprise-administration/:enterpriseCode/workspace` publishes versioned presentation, revision, authorized source-assignment choices, explicit commands and bounded options. Matching GET/POST `/:enterpriseCode/consent` routes retain independent target admission; selecting a target is not permission. Grant commands use an opaque `recipientAssignmentCode`, resolved by Profile, rather than a browser-supplied canonical identity locator. Axis reviews one inspected revision and one operation ID; a failed or uncertain response leads to inspection, not automatic replay. Backend navigation remains hidden until enforcement is qualified.\n\nProfile's secured pipeline contribution rechecks owner contexts after token authentication on each request. This observes expiry/source loss and current relationship evidence. Installed cross-runtime/module-boundary enforcement and distributed cache behavior are not yet demonstrated; production qualification must cover all consumers.\n\nHierarchy GET/POST `/enterprise-administration/hierarchy` are separate fresh PASSWORD platform-super-admin operations. A held operation advances relationship epoch, rejects hierarchy reads while PENDING, revokes only retained path-dependent grants and repairs their individual stamps before the final parent CAS. Interrupted commands retain their exact original identity and targets; they are never stolen on timeout. Returning to an old parent never revives old consent. Reverse subEnterprises is not a second authority.\n\nSeparately qualified POST `/enterprise-administration/hierarchy/recover` consumes an exact retained operation ID and graph revision. Recovery is not a timeout-based lock takeover. Terminal cancellation retains the original parent and advanced epoch, so the abandoned command cannot acknowledge a late parent change or revive old grants. Private cancellation facts must be verified by the consent owner before hierarchy reads resume. Installed concurrency, source-loss and lost-acknowledgement acceptance are still required; no recovery switch has been enabled.\n\n### Historical Identity And Application Recovery\n\nHistorical canonical linking requires current proof of both original passwords, reviewed inventory fingerprint and independently qualified retirement guards. It stages the original target inactive, retires its local credential at the Password owner and retains private recovery evidence. Canonical credentials and histories are preserved; no membership, customer consent or active session follows from linking. Targets with dependent checkpoints/memberships reject rather than being silently reassociated. Customer eligibility now has a Profile-owned live admission path consuming published Rules policies and current original account, credential, lockout and consent evidence. It is not a fabricated KYC approval or an email-as-verification shortcut. Policy, provider and installation qualification remain explicit; missing evidence rejects.\n\nApplication retirement can select an exact retained WITHDRAWN/EXPIRED historical attempt with the current assignment revision. The owner uses its original Process correlation and never mutates a resubmitted application's history or new decision. Axis confirms the selected attempt and handles competing/uncertain results without automatic replay. Inspection is retained source evidence, not live proof of retirement.\n\n### Customize And Accept Safely\n\nExisting later Profile modules contribute `config/properties.js`; preserve false qualifications until accepted installed evidence. Tighten `administrationConsent` maximumGrants, maximumLifetimeDays and allowedRoleCodes through layering. Exported owner members may narrow behavior but cannot remove canonical proof, private evidence, conditional acknowledgements, role/action/recipient ceilings or non-revival. Full command and recovery detail is in Profile's `administration-consent-commands.md` and `enterprise-membership.md`; those contracts do not authorize runtime migration.\n\nFor example, a later-loaded Profile extension can narrow limits and change labels in its existing `config/properties.js` without replacing authentication or persistence:\n\n```js\nmodule.exports = {\n  enterpriseManagement: {\n    administrationConsent: {\n      maximumGrants: 10,\n      maximumLifetimeDays: 7,\n      maximumDelegationDepth: 2,\n      workspace: {\n        presentation: { title: \"Organisation Administration\" },\n      },\n    },\n  },\n};\n```\n\nThe module must extend Profile and load after it through the normal runtime hierarchy. The example inherits disabled qualification and false creation defaults; it neither grants permissions nor rewrites existing rights. Role classification does not add permissions to imported groups. Approved action permissions remain governed group/ scope records. Validate default and later-layer composition, malformed configuration, stale revisions, denied sources, expiry, cancellation and uncertain-write inspection in the joint session before activation. Do not copy the full default configuration.\n\n| Evidence | Current Boundary |\n| --- | --- |\n| Source/fixtures | Authored; behavioral fixtures NOT RUN |\n| Static governance | Reported separately after consolidation |\n| Installed indexes/cache/owner retirement | Qualification remains false |\n| Axis/Circa automated and visual acceptance | Joint session, NOT RUN |\n| Runtime imports, notification sends and release | Not authorized in this batch |\n\n## Enterprise Hierarchy Evidence\n\nProfile's existing Enterprise owner resolves a child-to-root chain using fresh, bounded, non-recursive Enterprise and Tenant reads. Parent and tenant references use code coordinates, including resolved objects whose code is reloaded. The singular `superEnterprise` is the traversal source; `subEnterprises` is not an independent authority or proof of a bidirectional transaction.\n\n`enterpriseManagement.hierarchy.maximumDepth` defaults to 32 records including the child. Later Profile layers may narrow it within the integer range 1-128. Missing/inactive/ambiguous dependencies, cycles, malformed references and overflow reject; a second pass detects observed drift but is not an atomic graph snapshot. Creation validates its proposed parent before tenant, enterprise and activation writes, including self/descendant-parent refusal. Existing creation retries do not retrofit rights or create another enterprise.\n\nThis framework dependency grants no parent administration or business-data access. Target consent, bounded grant provenance, authority ceilings, serialized reparenting and dependent-session invalidation remain separate implementation requirements. Projects customize the existing exported Profile owner and layered depth setting; they do not copy the hierarchy into Kickoff, Axis or Circa. The new fixtures are authored for joint testing, not accepted runtime evidence.\n\n## Explicit Structural Recovery Resumption\n\nThe independently qualified migration recovery command accepts an exact reviewed audit code/fingerprint under fresh original PASSWORD platform authority. An interrupted RECOVERING audit resumes only its original persisted operation fence. It never clears a lease, takes another operation identity or infers canonical identity linking from structural evidence.\n\nThe acknowledged completed prefix must still match audited post-state. Remaining records must match exact pre/post facts: post-state is skipped; pre-state uses the existing conditional owner write. Every progress checkpoint compares phase, operation, fingerprint and previous applied count. All post-states are rechecked before terminal acknowledgement; an already completed recovered audit permits only read-only replay against unchanged post-state. Drift or owner failures reject. This is not a transactional snapshot, credential restoration or runtime/index qualification. ROLLING_BACK inspection remains separate and does not gain resume authority from this change. Behavioral and concurrency acceptance stays required.\n\n## Accepted Hierarchical Delegation Design\n\nEnterprise parent/child relationships already belong to Profile. The approved framework direction is target-consented ancestor administration, supporting descendant depth without automatic subtree access. Employees still receive explicit target-enterprise memberships and roles; parent relationships and enterprise business roles do not automatically grant access. Administrative scope is separate from operational and business-data access. This applies across Nodics, not only to one application or accelerator.\n\nAdministrators must remain within their assignable-role/action ceiling. Preserve grant provenance, separate enterprise session permissions and independent valid grants. New subsidiaries do not automatically receive employee access. Reparenting, revocation, expiry and source authority changes require grant revalidation and affected access/refresh invalidation, without deleting existing customer or asset history. Configuration and extensions remain in Profile's existing layers.\n\nThe enterprise's super administrator controls parent access. Consent defaults to false; a layered global default is evaluated only when creating the enterprise to initialize explicit rights. Changing that default does not rewrite existing rights and it is not reapplied when reparenting. Later changes use explicit grant/revocation commands. Immediate-parent access requires consent; higher ancestors must be explicitly selected. Backend visibility follows valid scoped grants, not merely hierarchy membership or frontend filters.\n\nAccess management is a separate permission with approved role, action, recipient and enterprise ceilings. A parent grant does not automatically confer full super administration or redelegation. Revocation invalidates dependent onward grants and affected sessions, preserves independent memberships and never automatically revives revoked grants. Reparenting removes old hierarchy-dependent authority; the new parent requires fresh explicit consent. Protect the last active enterprise super administrator against removal, suspension or demotion until a replacement is active; exceptional recovery requires an audited platform-super-administrator action.\n\nAuthorized administrators of the designated PLATFORM_OWNER enterprise retain platform-wide administration independent of parent consent. Mere enterprise membership/business role is insufficient; tenant boundaries, route permissions, account checks and auditing still apply. This is not automatic customer-data access or impersonation authority.\n\nMaturity: accepted design, not complete implementation or installed acceptance. Current exact-target/platform checks are unchanged. A hierarchy-only permission bypass is prohibited; complete scope, grant, session and mutation enforcement must be implemented and qualified before activation. No customer-specific engine or new parallel hierarchy is needed.\n\n## Staged Customer Consent And Recovery\n\nThe enterprise lifecycle source includes separately qualified Customer consent renewal/withdrawal. Renewal requires the current disclosed terms and inspected revision; withdrawal retains purchases/history and Employee access while invalidating old Customer proof. These are not deployed acceptance claims. Enable only after the joint owner/browser tests and eligibility qualification.\n\nAcceptance itself changes no Employee cookie. Explicit Customer session transition is a separate Profile action: it validates exact origin and CSRF, consumes matching Employee refresh proof, clears Employee cookies and writes distinct Customer cookies. The returned access token belongs only in memory; refresh never leaves HttpOnly cookies. An uncertain transition clears both cookie namespaces and requires sign-in or supported recovery, never an automatic retry or staff-grant upgrade.\n\nStructural identity recovery rechecks stored audited pre/post state and rejects drift. It is not email-based linking, global uniqueness certification or automatic crash recovery. Canonical index declarations remain disabled pending governed installed index preparation. Historical identity linking requires separate ownership proof.\n\nOperators can separately qualify Profile's read-only `/identity/migration/inspect` with a saved auditCode/fingerprint and confirmed:true. It reports bounded positional pre/post/drift observations, not identities, credentials or replay authority. Inspection flags default false; recovery enablement cannot implicitly enable it. Inspection alone leaves RECOVERING/ROLLING_BACK locked. Explicit reviewed same-fence resumption is a separate recovery command; ROLLING_BACK remains inspection-only here. Audit drift rejects, provider failures return no partial report, and record observations are explicitly non-atomic. Neither an all-post report nor static checks prove that an interrupted worker has stopped.\n\nAuthentication, authorization, groups, documentation authoring roles, read-only Axis access, tenant isolation, and audit responsibilities. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nA platform that lets business users change content, configuration, and runtime behavior must prove who can read, edit, review, approve, publish, and operate each capability. Profile centralizes users, groups, permissions, token context, and enterprise or tenant assignments. Capability modules declare permission needs, while routes, services, and Axis workspaces enforce them consistently.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | A platform that lets business users change content, configuration, and runtime behavior must prove who can read, edit, review, approve, publish, and operate each capability. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Profile centralizes users, groups, permissions, token context, and enterprise or tenant assignments. Capability modules declare permission needs, while routes, services, and Axis workspaces enforce them consistently. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nProfile owns users, employees, groups, permissions, and identity context. Documentation author and read-only viewer roles extend this model without creating a separate documentation-only security authority. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | Security, Governance, and Compliance | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.platform | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | profile | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\npermission: { code: \"documentation.draft.create\", group: \"documentationAuthorUserGroup\", publish: false }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Current implementation coverage\n\nSecurity, identity, and access governance covers employees, customers, enterprises, tenants, user groups, permissions, principal scope assignments, authentication providers, browser sessions, internal runtime tokens, password records, and identity migration evidence. This page also owns the documentation roles discussed for Axis: super admin, admin reviewer/approver, documentation author, and read-only Axis viewer. Admin may review, approve, and publish; author can create and update documentation content; viewer can inspect Axis applications without write permissions.\n\n```mermaid\nflowchart LR\n  Principal[\"Customer or employee\"] --> Auth[\"Authentication provider\"]\n  Auth --> Session[\"Token/session\"]\n  Session --> Scope[\"Enterprise and tenant scope\"]\n  Scope --> Groups[\"User groups and permissions\"]\n  Groups --> Decision[\"Route and operation decision\"]\n  Decision --> Audit[\"Audit and support evidence\"]\n```\n\n| Access topic | Source records | Documentation requirement |\n| --- | --- | --- |\n| Enterprise and tenant | Enterprise, Tenant, Address, Contact. | Isolation, activation, default tenant behavior, and migration risk. |\n| Principal identity | User, Employee, Customer, Password, UserState. | Authentication, status, ownership, and protected data handling. |\n| Group and permission | UserGroup and resolved permissions. | Exact permission codes, inherited access, and denial behavior. |\n| Scope assignment | PrincipalScopeAssignment. | Which enterprise/tenant/domain a principal can act within. |\n| Documentation access | Page access policy and lifecycle visibility. | Public, authenticated, role-based, group-based, permission-based, or restricted visibility. |\n\nFor Axis, every left-navigation entry and page action should map to a backend-declared capability and permission. The frontend may hide unavailable actions for usability, but backend authorization remains the decision point. For Nexus, public pages must come only from Online content and must not expose restricted documentation, secrets, internal routes, or draft implementation notes.\n\nImplementation evidence comes from profile route contracts, authentication service tests, browser session tests, runtime internal token tests, user group permission resolution, principal authorization scope contracts, recursive interceptor tests, identity governance and migration tests, mandatory identity bootstrap checks, and generated schema contracts for Enterprise, Tenant, Customer, Employee, UserGroup, User, UserState, Password, and PrincipalScopeAssignment.\n\nProfile refresh sessions use the Profile-owned `auth` cache channel. Its module configuration references nAuth's strict channel defaults through nConfig; do not copy those defaults into a customer environment or redirect identity ownership. The deployment must still enable the distributed provider. Later Profile channel overrides use normal layering, preserving atomic consume and no local fallback.\n\nBrowser sessions resolve credentialed origins through nRouter's existing `resolveCorsOrigins` service. Endpoint-derived origins and explicit origin lists share one policy; explicit denials and endpoint disables take precedence. Profile continues to enforce cookie security, CSRF and refresh rotation.\n\nDuring a governed Local reset, the provider's private authority may reach scope cleanup after Employee deletion. Profile must prove principal absence through an authoritative read and await nAuth shared-stamp revocation. It must reject failed reads or revocation, and a request field cannot forge reset authority. Existing principals and ordinary scope mutations still require exactly one acknowledged Employee update. This rule is independent of reset inventory ordering.\n\nScoped runtime route admission recognizes `userGroup` and `serviceAccountUserGroup` as base route classes. These labels do not become JWT groups or expand permissions. nRouter still enforces the approved module, explicit action permission, accepted token type and deployment exposure. Administrator and human-only groups remain ineligible; later deployment policy may narrow the list.\n\n## Enterprise-scope expiry and reliable access decisions\n\n**Functional owner:** `nodics.platform`; technical owner: Profile. This section explains the source-level scope safeguards on the lifecycle feature branch. Generated-runtime, browser and business-reader acceptance remain separate.\n\nA scope identifies a responsibility within an enterprise or another business boundary. It does not prove identity, create an employee or replace ordinary route permissions. All those controls still apply.\n\n### Worked example: temporary responsibility\n\nSuppose an existing direct enterprise scope starts at `2026-09-30T08:00:00Z` and ends at `2026-10-01T08:00:00Z`. These are illustrative UTC values.\n\n1. Before the start, that scope grants no access.\n2. At the exact start, it may become effective, subject to identity, enterprise, role and other permission checks.\n3. At the exact end, it has expired. The end is exclusive; there is no extra request or one-second grace period.\n4. Renewal requires the existing authorised scope-management operation. Registration retry or account recovery does not extend a scope.\n\nA missing boundary can be open where the existing policy permits. A supplied invalid date cannot be treated as missing. Each boundary is checked separately, so a missing end cannot hide a malformed start, or vice versa.\n\n```mermaid\nflowchart LR\n  R[Request scoped access] --> O[Read current scope through its owner]\n  O --> V{Valid owner response and stored policy?}\n  V -->|No| D[Reject; do not infer permission]\n  V -->|Yes| T[Check status, time, principal and normal permissions]\n  T --> A[Apply existing ALLOW and DENY rules]\n```\n\nThis authored flow explains the control order. It is not a rendered deployment screenshot or evidence that a live account was tested.\n\n### Failure and recovery\n\nIf a stored DENY carries a malformed time, resolution fails instead of discarding it and exposing a matching ALLOW. An unavailable database or failed owner response is likewise not an empty successful scope list. Keep the operation closed and provide the authorised maintainer with a non-secret request reference. Correct policy records only through their owning administrative service; do not edit a database directly or suppress a denial to make the screen work.\n\nAn inactive record and a record without a stored ACTIVE state cannot be revived by applying configuration defaults while reading it. This is different from applying valid defaults when intentionally creating a new record.\n\n### Customize and extend safely\n\nKeep validation in `DefaultPrincipalScopeGovernanceService` and reuse the existing scope registry and permission rules. A project may supply legitimate effective dates through supported owner operations. It may not customize a read failure into permission or make an invalid time mean unlimited access. Delegation policy and membership revocation are separate concerns: disabling new invitations for a role does not, by itself, revoke an existing assignment.\n\nValidate changes with `principalScopeLifetimeContract.test.js` and the existing `principalAuthorizationScopeContract.test.js`. Installed persistence, interface behaviour, diagram rendering and guide publication require their own evidence.\n\n## Employee self-application intake\n\n### Withdrawal, Corrected Attempts And Deadlines\n\nProfile now contains independently qualified application lifecycle source, with matching Axis rendering. This is employee access onboarding, not deactivation of an already approved enterprise. Deployment acceptance has not been established.\n\nApplicants can withdraw their own pending application using the advertised withdrawal command and displayed revision after mailbox proof. Approval and withdrawal share revision/hash concurrency checks: a stale action rejects rather than overwriting a newer outcome. Axis asks for confirmation and requires progress inspection after an uncertain response. Identical acknowledged withdrawals are read-only; other mailboxes and approved/claimed registrations are ineligible.\n\nRejected, withdrawn or expired attempts can be corrected after new mailbox verification, subject to current enterprise eligibility and attempt limits. Each fresh attempt retains its predecessor's details, outcome and Process correlation privately, has a new attempt-bound hash and consumes fresh proof. Safe history shows attempt, outcome, submission/closure/deadline timestamps and reviewer feedback, never private proof, workflow handles, tenant or credentials.\n\nFramework configuration lives at `enterpriseManagement.applications.lifecycle`: `qualified: false`, `maximumAttempts: 5`, `maximumHistoryBytes: 65536`, `expiryDays: null`. An explicitly chosen 1-365 day expiry freezes its deadline at draft creation. Changing configuration does not retrofit existing applications. Profile lazily enforces deadlines on resolution, status, submission, reviewer-list reads and decision application. It never expires approved/registered access. Idle records are not proactively swept by this source; no cron job or business deadline has been invented. Later project/runtime layers can narrow limits and override presentation through normal partial exports, without copying the lifecycle owner.\n\nApplication history is protected from generic CRUD through private owner-write admission. A delayed claimed Process callback for a closed old attempt completes with no access outcome rather than approving a fresh attempt. Independently false `applications.review.retirementQualified` enables source-owned retirement after committed closure. Its signed Process route requires original context and one waiting governed task; task CAS competes with completion, and matching private closure evidence allows staged lost-ack recovery. Claimed remote actions require inspection. Closure is not rolled back by retirement uncertainty. Existing Axis recovery adds the revision-bound RETRY_REVIEW_RETIREMENT command for qualified closed reviews. Superseded historical attempts and idle sweeps remain separate; generic governed-review cancellation is not bypassed. Before activation, jointly verify races, stale callbacks, lost acknowledgements, expiry boundaries, correction/history, exact installed permissions, keyboard/focus and narrow Axis layouts.\n\nSee the [account access contract](../../../../nodics.platform/modules/profile/llm/contracts/account-access-journeys.md) for exact commands, bounds, customization and remaining integration gates.\n\nThis Profile capability saves a new person's request to join an enterprise. It is disabled by default. The source-tested intake and read-only administrator list do not yet constitute the complete Axis/Process approval journey. Do not enable the business journey until its actual client and workflow integration have passed their separate acceptance checks.\n\nFor the applicant, email verification proves control of the mailbox. It does not make the person an employee. For an administrator, a pending request means that verified details are available for review; it does not mean a workflow decision was made, a password was created, or access was granted.\n\n```mermaid\nflowchart TD\n  Email[Existing Profile email verification] --> Eligible[Named eligible enterprise choices]\n  Eligible --> Details[First name, last name and optional message]\n  Details --> Draft[Private application draft]\n  Draft --> Proof[Consume proof for this exact application]\n  Proof --> Pending[Awaiting review: no login or scope]\n  Pending --> List[Enterprise-scoped administrator list]\n  Pending -. Separate integration still required .-> Review[Process task and decision]\n  Review -. Separate authorised onboarding .-> Access[Approved membership and account setup]\n```\n\nThe solid arrows describe intake. The dashed arrows are required follow-on integration, not a claim that approval or employee activation is implemented by this intake service. Process remains the task and decision authority.\n\n### Worked request and failure recovery\n\nSuppose Maya requests access to Example Company. The enterprise must already exist and explicitly permit applications. Maya enters her email once through Profile's existing start/verify continuation. Only after successful verification does the response offer enterprise names. An existing employee or customer goes to existing-account authentication instead; this path never creates a duplicate.\n\nThe frontend must use the backend-advertised application submit path. Its finite request consists of the current continuation, selected enterprise, first and last names, and optional note. It must not submit a password, role, approval, reviewer, tenant or verification flag. For example, the non-secret details are:\n\n```json\n{\n  \"enterpriseCode\": \"exampleCompany\",\n  \"firstName\": \"Maya\",\n  \"lastName\": \"Example\",\n  \"note\": \"Joining the operations team\"\n}\n```\n\nThe protected continuation is additionally required and stays in client memory; it is deliberately omitted from this example. A saved result has stage `APPLICATION_PENDING` and item status `AWAITING_REVIEW`. The administrator's read-only list is `GET /nodics/profile/v0/enterprise-access/applications`. The owning route still checks employee authentication, access groups, permission and enterprise scope. A platform-authorised administrator may filter enterprises; an ordinary enterprise administrator cannot select another enterprise's records.\n\n| Situation | Safe outcome |\n| --- | --- |\n| Proof is missing, expired or belongs to another continuation | No application becomes reviewable; verify again. |\n| The code was consumed but its response was lost | Inspect the exact original consumption receipt; do not create a second execution grant. |\n| The submission response was lost after persistence | Exact revision/marker readback confirms the same submission without another record. |\n| The enterprise no longer accepts applications | Stop before submission; the earlier choice is not continuing authority. |\n| An invitation, registration or conflicting application already exists | Preserve it and report a conflict, rather than replacing its history. |\n| Persistence is unavailable or returns an unrelated record | Fail safely; no success or empty permitted directory is inferred. |\n| An administrator attempts another enterprise's review list | Deny the request unless the authenticated platform context explicitly permits it. |\n\n### Customize and extend safely\n\nThe Profile defaults live in `enterpriseManagement.applications`. A later project layer may narrow permitted initial roles, choice counts, note length and page size, and refine the declarative presentation. The enterprise record's `employeeApplicationPolicy` contains its explicit `enabled`, `method` and `roleCode` selection. For a standard operator application, use the existing `OPERATOR` responsibility with the supported `PASSWORD` method; no role catalogue belongs in Axis. Absence of enterprise policy means no applications.\n\nDo not customise away proof, immutable request binding, existing-record preservation, enterprise filtering or the distinction between application and approval. Configuring an eligible enterprise does not install a Process workflow, grant runtime credentials, enable SMTP, or complete a frontend.\n\nRun `node --test nodics.platform/modules/profile/test/enterpriseApplicationIntake.test.js` from the framework root, followed by the existing registration/setup regressions. These tests use actual services with controlled persistence and transport. Real installed-schema, distributed-runtime, browser and business-reader acceptance remain separate. This section is authored source, not evidence of publication.\n\n## Personal memberships and enterprise context\n\nThe source now provides a separate My enterprise memberships task. This is not the administrator's team screen: it shows only the current person's assignments and invitations. A reviewed acceptance links a responsibility to the existing canonical person; it neither creates another password nor changes the active browser context. After uncertain acceptance, inspect current state before explicitly resuming a prepared acceptance. Suspended access cannot be entered.\n\nEntering an accepted enterprise is a second reviewed action. Profile verifies matching PASSWORD Employee access/refresh contexts, exact current assignment revision and canonical identity, approved browser origin and CSRF. It rotates the HttpOnly refresh credential and returns only target access data. Axis hides the old workspace, cancels/clears caches and loads the target's authenticated bootstrap. It never unions permissions or changes the project's endpoints.\n\nA failed or lost switch acknowledgement requires normal sign-in rather than automatic retry or restoration of the old UI. Customer/external switching is unavailable, and a legacy canonical baseline without a managed assignment is entered through normal sign-in. Runtime qualification remains disabled, including `enterpriseManagement.memberships.browserContextSwitchQualified`; source is not joint-session or customer acceptance. The detailed owner/security/customization contract is Profile's `llm/contracts/enterprise-membership.md`.\n\n## Current-enterprise team administration\n\nProfile now supplies the source contract for a native Axis team task through the existing Employees capability. This is default-disabled implementation source, not a deployed or accepted feature. See Profile's `llm/contracts/enterprise-membership.md` for the owner and extension contract.\n\nOnce the installed membership inventory, session bindings, assignment claim index and serialized team writes are qualified, and `profileMembership` exposure is explicitly enabled, an admitted administrator can read the current enterprise's bounded team workspace. The signed access context selects the enterprise. A URL, query field or browser draft cannot select another tenant or grant authority.\n\nRows carry an assignment revision and backend-provided actions. The designated default administrator and the last active administrator cannot be suspended or revoked through team commands. Handover targets an existing active administrator; it changes the designation, not credentials or the target's permissions. Missing legacy administrator evidence blocks the task pending reconciliation.\n\nAxis reviews the selected person and action before submitting one command. A lost acknowledgement is an uncertain result, not a failed write: inspect current state or explicitly resume the same command with the same operation ID and revision. Never generate a fresh command to escape a pending operation or assume that a completed marker proves success. Browser recovery state is in memory; reload/crash and loss of actor authority require the still-pending operator recovery work before qualification.\n\nLater Profile layers customize `enterpriseManagement.teamAdministration.presentation` and exported service members, preserving permission, scope, revision, designation and serialization invariants. Kickoff does not need copied team services or a separate registry. This task does not implement invitation acceptance or browser enterprise-context switching. Behavioral, keyboard, narrow-layout and installed-runtime acceptance remain deferred to the joint validation session.\n\n## Application review recovery: decisions and messages are separate\n\nConsider Maya's request to join Example Enterprise. Profile saves her verified application. Process owns the reviewer task and its decision. Communication owns the subsequent message. A message failure cannot undo a completed review, and a message marked accepted cannot establish that Maya has an active employee account.\n\nA lost Process-start response is reconciled using the same saved instance identity and pinned definition version. It does not justify creating another review. An incomplete start is a Process recovery incident, not permission to replay nodes. An authorised recovery command must use the current application revision and the administrator's own permitted enterprise context; another enterprise is denied.\n\n```mermaid\nflowchart TD\n  A[Verified application saved] --> B[Process review correlation retained]\n  B --> C[Process reviewer decision]\n  C --> D[Profile records approved or rejected]\n  D --> E[Freeze non-secret notification inputs]\n  E --> F[Communication intent requested with stable key]\n  F --> G[Record intent reference and request status]\n  F --> H[Unconfirmed: preserve decision and original message]\n  H --> F\n  G --> I[Communication owns delivery and reconciliation]\n```\n\nThe return arrow reuses one Communication request identity. It never calls SMTP directly, creates another approval or repeats employee provisioning.\n\n### Developer and support integration\n\nThe Profile recovery route is `POST /nodics/profile/v0/enterprise-access/applications/:applicationCode/actions`. Its body contains only `operation` and the current integer `revision`. `RETRY_REVIEW_START` reconciles the existing submitted review. `RETRY_NOTIFICATION` requests the existing approved/rejected outcome message. The route does not accept an approval, password, role, recipient or template. Its response is a fresh management projection, not a new employee or permission. The matched Axis action and authoritative revision view must be connected before this API can be presented as a complete business-user task.\n\n| Observed condition | Correct interpretation and recovery |\n| --- | --- |\n| Review start is not confirmed | Retain the application and its pinned correlation; reconcile that same Process instance. |\n| Approval saved, message unconfirmed | Keep the approval; retry the same Communication intent through authorised recovery. |\n| Intent already has a reference | Do not request a second provider send from Profile; use Communication's existing delivery recovery. |\n| Application changed after the operator loaded it | Refresh the owning record before another command; do not overwrite the newer revision. |\n| Applicant already registered | Do not send obsolete setup instructions as a new notification. |\n| New application intake paused | Existing review visibility is separate from allowing new applications. |\n\n### Customize and extend safely\n\nUse the existing layered review/mail settings for connection selection and safe presentation changes. Existing message snapshots remain immutable across retries; a later wording change applies to later decisions. Override exported owner methods only while preserving human scope, exact revision, Process correlation, single Communication intent and non-secret evidence. The focused source regression is `profile/test/enterpriseApplicationReviewRecovery.test.js`; it does not replace installed-provider, browser, accessibility or business-reader acceptance.\n\n## Read-only legacy identity assessment\n\nProfile now has an additive source-only assessment command at `POST /nodics/profile/v0/identity/migration/assessment`, accepting `{}` only. It remains disabled by default under `identityGovernance.migration.assessment.enabled`. Approved operators need a human platform-context access token, `runtimeConfigAdminUserGroup` and the existing `identity.migration.preview` permission. Customers, service credentials and tenant administrators outside the platform context cannot use it as an identity directory.\n\nThe existing migration owner reads counted, bounded inventories through generated Profile services across the authority's declared tenants. Two matching metadata passes produce counts and redacted conflict references for email collisions, customer/employee coexistence, credential references, groups, assignments and interrupted registration. References are opaque and correlate only within one run. No email, password, hash or raw provider error is returned. An unavailable tenant, incomplete page or changed second pass rejects the assessment rather than proving that an account is absent.\n\nThis is not a transactional snapshot or an executable migration plan. Every successful report retains `atomicSnapshot: false` and `readyForApply: false`. The command performs no repair, account linking, credential rewrite, index change or registration enablement. Preserve existing histories and interrupted operations; an email match never authorizes identity merging. Operator-reviewed reconciliation, administrator coverage, final-write concurrency and live acceptance remain separate.\n\n### Customize and extend safely\n\nPartners customize the existing layered limits or narrow exported migration-service members, not customer copies of the inventory implementation. The exact API, projection, limits, recovery and extension contract is maintained in Profile's `llm/contracts/identity-assessment.md`; fixture coverage is authored in `test/identityAssessmentContract.test.js`. Neither source documentation nor fixtures claim that target inventory or installed-runtime testing has taken place.\n\nFor example, in `<project>/modules/<profile-extension>/config/properties.js`, reduce the approved per-pass capacity without activating the route:\n\n```js\nmodule.exports = {\n  identityGovernance: {\n    migration: { assessment: { enabled: false, maximumRecords: 10000 } },\n  },\n};\n```\n\nThe remaining framework limits are inherited. Project/runtime service overrides use the same existing service identity and exported members. They may add stricter checks but cannot permit system-token access, partial success, secret output or automatic identity linking. On a bound failure, review capacity with the operator; on a changed observation, retry a fresh read during an approved quieter window.\n\n## Scope changes and evidenced team recovery\n\nProfile owns security propagation for persisted scope saves/upserts, updates and removals. A validated mutation captures old and new human/customer/group targets privately, then invalidates before writing and again after writing. Group targets include current inheriting groups. Counted fresh inventories reject truncation, repeated identifiers, changing counts and configured overflow. Flat `$set` and `$unset` scope updates are supported; dotted fields and other operators reject.\n\nAn ordinary original-account mutation uses its generated principal owner and awaits exactly one acknowledged update plus shared security stamps. This is conservative: all proofs bound to that original account may expire. A linked Employee projection instead advances its accepted target membership revision; credentials and other enterprise projections are not rewritten. Linked Customer scope mutation remains unavailable pending governed reverse participation. Scope hooks do not invalidate all sessions after a global configuration change.\n\nFor users, a scope change can require sign-in or selecting the enterprise again. A failed mutation can leave earlier security invalidations applied; administrators must inspect the owning scope record before deciding whether to resubmit. Missing principals do not produce fictitious acknowledged updates. Runtime deployment scopes keep their existing private reset and service-principal path.\n\nFor operators, `POST /nodics/profile/v0/enterprise-team/reconcile-committed` accepts only `{enterpriseCode, teamRevision, operationId}`. It requires fresh PASSWORD platform-administrator authority, current assignment permission and independent recovery qualification. New operations retain reviewed input privately. The owner verifies the saved input/hash/actor and exact committed membership state, repairs its stamp, rechecks actor and assignment, then finalizes the held operation through the existing conditional enterprise write. The response contains no private identity/input/hash. The command never resubmits a membership mutation.\n\nFlow: operator reviews recorded operation -> Profile admits fresh platform proof -> verifies committed assignment evidence -> repairs stamp -> rechecks authority and assignment -> conditionally records the original outcome. Any uncertainty stops before lease completion. A pending handover, absent input, stale revision, uncommitted write or changed assignment remains locked; timeouts never authorize takeover. General actor-loss recovery and a matching operator UI remain open.\n\n### Customize and extend safely\n\nFor a stricter inventory bound, use a small later Profile property contribution:\n\n```js\nmodule.exports = {\n  identityGovernance: {\n    securityStampInventory: { pageSize: 50, maximumPages: 20 },\n  },\n  enterpriseManagement: {\n    teamAdministration: { operatorRecoveryQualified: false },\n  },\n};\n```\n\nUse `<project>/modules/<profile-extension>/config/properties.js`; inherit the framework owners instead of copying services into Kickoff. Limits are positive integers at most 1000 each. Preserve bounded complete reads and private provenance. Later exported scope/team members may impose stricter admission but cannot bypass canonical credential ownership, acknowledged writes, evidence verification or revision guards. Reject overflow until capacity and operator authority are reviewed; do not treat raising a limit as runtime acceptance.\n\nFramework-maintainer fixtures cover direct/group/linked targets, old/new selectors, save preimages, failed acknowledgements, forged targets, default-off recovery, wrong platform/method, missing input, tampered evidence and late assignment changes in `profile/test/humanScopeInvalidationContract.test.js` and `profile/test/teamCommittedRecoveryContract.test.js`. These fixtures are authored, not executed acceptance. Installed distributed cache/persistence, competing writes, user/operator browser acceptance and global-policy invalidation remain separate gates. Documentation is authored source only; no content-pack publication or runtime qualification follows from this guide.\n\n## Live Context Admission And Privacy Boundary\n\nThe October source increment adds generic nAuth/nService validation after JWT, revocation and security stamps. A typed session requires a qualified installed owner and exact matching `{valid:true,owner,code,version}` evidence. The validator receives detached, deeply frozen bounded JSON-safe claims; it cannot change the verified identity, tenant, groups or permissions returned by authorization. Unsupported, missing, malformed or failed owners reject without a stamp-only fallback or private error details.\n\nProfile contributes `DefaultProfileSessionContextValidationService`, which calls the live membership, participation or native customer eligibility owner and returns only the matched proof, not canonical records. Qualification remains false. The implemented nService bridge uses existing module topology and transport; remote consumers pass the original signed access token to the fixed private Profile route `POST /internal/session-context/validate`. A separately authenticated runtime principal needs `profile.sessionContext.validate`. Profile independently verifies the subject token, checks exact tenant/enterprise scope and performs live owner admission. Neither service credentials nor unsigned caller claims can impersonate the subject. There is no public unsigned-claims endpoint. Later framework/runtime layers must preserve fresh owning admission and fail-closed validation, not duplicate identity registries in a customer project.\n\nConsent provenance retains the governed authorization-policy version. Effective policy changes must advance that version across issuers and consumers; restoring old policy values must not roll back the version or revive old grants. Read-only workspaces project expiry and exact revoke authority without silently writing an expiry transition.\n\nEnterprise team evidence and historical identity-retirement markers are stripped from public generated reads. Exact private owner requests retain the evidence needed for guards and recovery. nConfig's logger has source corrections for structured, serialized/quoted JSON and Error redaction, but fixtures remain unrun. The router now admits sensitive routes before body parsing through Logger's private request context, and carries exact admission into derived owner requests. Logger suppresses supported private capture before buffering; providers must use a detached `runSensitiveOperation` request. The credential retirement primitive uses revision CAS and metadata-only acknowledgement rather than putting a stored hash in a query. Installed raw-body/APM/proxy capture, custom sinks, Password writer coverage and distributed cache behavior still require qualification. Source availability does not certify end-to-end privacy or distributed access.\n\n### Configure The Live Context Bridge\n\nThe generic contribution lives in nAuth `config/properties.js`; Profile contributes the local owner, while nService owns topology and authenticated transport. Keep `sessionContextValidation.qualified`, `remoteQualified` and `captureProtectionQualified` false until the installed acceptance matrix passes. `connectionName` defaults to `profileModuleName`; it selects an existing connection, not a second endpoint catalogue. `timeoutMs` is bounded to 1-60000 milliseconds. `allowInsecureLoopback` defaults false. HTTPS must preserve certificate verification, and sensitive transport does not follow redirects or carry credentials in a URL.\n\nOnce a coordinated native-customer rollout is approved, Profile's `requiredPrincipalTypes:[\"customer\"]` must be mirrored across all consumers. A contextless customer token then rejects instead of bypassing current eligibility. Do not upgrade old tokens silently or enable consumers ahead of the issuing owner. Human/service context requirements remain explicit policy, not a blanket platform login redesign. Failure of the selected owner, malformed evidence, changed scope or missing private admission fails closed; existing revocation and stamp checks still run.\n\n### Native Customer Issue And Refresh\n\nQualified native customer issuance retains `profile.customerEligibility` with the original customer code/auth revision and both original identity/customer bindings. Issuance rereads the original account, current credentials, lockout and current groups after authentication. It registers existing stamp bindings before creating the pair and performs live eligibility admission again before returning credentials. Refresh revalidates retained context, resolves the same original account and rereads current state; it never substitutes an Employee membership or unions enterprise groups. Failed final admission removes the newly created refresh record. Disabled policy preserves legacy behavior, but is not evidence of installed lifecycle enforcement.\n\n### Repair Committed Consent Stamps\n\nUse GET `/enterprise-administration/:enterpriseCode/consent/stamps/repair` to inspect bounded committed grants. Admission requires a fresh PASSWORD-authenticated target administrator or independent platform super-admin and the separately configured `profile.enterpriseAdministration.repairSecurityStamps` permission. A grant carries only code, revision, status and explicit `canRepair`; private evidence stays in Profile.\n\nPOST the same path with `enterpriseCode`, inspected `revision`, retained `operationId` and an explicit unique `grantCodes` selection (1-100). Repair verifies the committed source again and advances stamps monotonically. It neither replays grant/revoke nor changes enterprise hierarchy, adopts another command or steals a pending lease. Only an exact COMPLETE receipt acknowledges the reviewed selection. Uncertainty requires fresh inspection and explicit confirmation of the original command. `stampRepairQualified` and `externalInvalidationQualified` remain false until accepted writer coverage, persistence and cache evidence. Customer participation is independent of enterprise administration consent throughout these flows.\n\n### Canonical Contact Verification And Notification Preferences\n\nProfile's `DefaultProfileVerifiedContactService` uses the existing Contact linked from the original canonical identity. A native Customer owns that Customer's contacts; an Employee-backed Customer participation uses the original Employee's contacts without receiving employee permissions. Current actor, customer participation, original locator and complete association are rechecked. Login or email equality is never identity or verification evidence. Channel selection uses the unique lowest-priority active EMAIL/PHONE contact; ties and missing associations reject rather than silently selecting an address.\n\nThe protected Customer-only POST routes under `/customer/contacts/verification/` are `inspect`, `begin`, `verify`, `consent` and `suppression`. All need qualified private capture, current access/stamps, configured `profile.customer.contact.manage` and explicit API exposure. The browser supplies its ownerId and channel, never an address, template or canonical locator. Inspect returns safe progress; begin includes expectedRevision; verify adds original commandId and transient code. Secrets and proofs stay out of responses and records. Consent adds purpose, its reviewed purposeVersion, explicit granted and operationReference; suppression adds purpose and explicit suppressed. Both require the inspected expectedRevision.\n\nGET `/customer/contacts/verification/workspace` publishes the self-owned projection ID, admitted channels, explicit purpose versions/labels and twenty bounded plain-text presentation fields. It accepts no selectors and performs no delivery or mutation. Circa must use this metadata rather than guessing an ID from login/email or supplying its own notification-purpose policy. A hidden/disabled application feature is not backend authorization; every command still proves current self ownership.\n\nCirca's shared account/preferences view consumes that workspace across Web and mobile/Telegram. `VITE_CIRCA_CONTACT_PREFERENCES_ENABLED` defaults off and controls presentation only. Customers select an admitted channel, inspect original progress, review a one-shot verification or preference command, and inspect again after an uncertain result. No destination input or technical owner ID is displayed. Consent pins the reviewed purpose version as well as the Contact revision; changed policy requires fresh review. Clearing suppression never grants consent. Held verification checkpoints remain inspect-only when their original proof cannot safely be recovered.\n\nAn Employee-to-Customer browser handoff first reviews the current participation workspace. `currentTerms` and `canSwitch` are fresh owner projections, not inference from COMPLETE status. When current consent is ready, POST `/employee/browser/customer-participation/switch` consumes the original Employee refresh proof and issues Customer-only authority. The endpoint stays within the existing Employee cookie path, with existing CSRF protection; cookie scope is not widened to all Profile operations. Changed/withdrawn consent requires explicit review, not forced renewal of unchanged terms or silent conversion of staff tokens.\n\nThe owning sequence is:\n\n```text\nCustomer -> protected Profile self command -> canonical Contact selection\n         -> Contact ISSUE_PENDING CAS -> Communication challenge ISSUE\n         -> original delivery checkpoint -> Communication template delivery\n         -> submitted code -> VERIFY_PENDING CAS -> Communication VERIFY\n         -> CONSUME_PENDING CAS and frozen completion -> Communication CONSUME\n         -> Contact VERIFIED readback -> separate explicit purpose consent\nCommerce committed event -> stored buyer proof -> current Contact proof/consent\n                         -> source reread -> original Communication intent\n```\n\nContact stores only private versioned binding, checkpoint digests/deadlines, acknowledged verification and consent/suppression. Generic Contact mutation cannot manufacture or erase it; Customer/Employee reassociation and recursive public reads must use the installed guards and redaction. Actual Contact CAS and complete readback are required. A receipt may reconcile only the exact original held consumed command; it does not execute consumption again, extend deadlines or grant consent. Missing transient proof or interrupted expiry remains held for reviewed recovery, not an automatic command replacement or CRUD reset.\n\nThe resources live under Profile `src/templates/email/contact-email-verification` and `src/templates/sms/contact-sms-verification`. Manifests identify `profile.contact.emailVerification` and `profile.contact.smsVerification`, purpose PROFILE_CANONICAL_CONTACT and declared verificationCode/expiresAt parameters. HTML/text/subject/message files follow the normal layered resource loader; content does not belong in properties, and Employee templates are not a Contact fallback. Communication still owns rendering, provider delivery and durable intent status. Queued/provider-accepted is not independent mailbox receipt.\n\n### Customize Contact And Eligibility Safely\n\nUse a later Profile module's `config/properties.js`, not copied Kickoff services. All `profileVerifiedContacts` qualification gates and its API exposure default false. `maximumVerifiedAgeSeconds` is deliberately unset until a reviewed policy selects it. Sender/provider/secret references and recipients remain approved runtime inputs. The two declared DIGITAL_COUPON_PURCHASED/REFUNDED purposes are transactional descriptors, not granted consent or marketing subscription. Every declared purpose requires explicit self consent for its current version. Suppression overrides it; clearing suppression never grants permission.\n\nFor example, a custom project may narrow maximumContacts, remove SMS from selected purpose channels and override only `en/email.html` plus `en/email.txt` beneath the same template directory. Preserve manifest identity, purpose, parameters and secure rendering. A genuine regulated evidence provider may extend the existing Rules property catalogue; it may not turn a missing proof into verified or approve every customer. Published policy and scope selections are intentionally unapproved here.\n\nThe registered generic provider is `profile.customerEligibility`, catalogue version 1, with explicit PROFILE_CUSTOMER_ELIGIBILITY_ALLOW/DENY outcomes. It loads current account/identity/consent/contact facts into a private transient Rules context, not browser-supplied evidence. Denial overrides approval; absence of a matched approved published policy is not eligibility. Regulated KYC vendor integration is a separate later-layer provider, never a fictional framework certificate.\n\nJoint acceptance must include native and Employee-backed customers, missing/changed contacts, tied priority, consent withdrawal, suppression, purpose version change, provider rejection, lost consume/delivery acknowledgement, recursive CRUD/cache privacy and cross-runtime financial-source drift. All behavioral and visual evidence remains NOT RUN. The detailed implementation and recovery contract is Profile's `verified-contact-consent.md`; source availability authorizes no sending or migration.\n\n## Ordinary Customer signup and optional eligibility\n\nOrdinary customer signup creates a customer identity, like opening a shop account. It is not employee membership, linked participation or evidence that a regulated business check passed. Profile owns form normalization, uniqueness, password hashing, principal policy, active Enterprise/Tenant placement and generated persistence. Cart, DigitalCore and customer adapters consume that identity; they must not create shadow accounts or enable qualification flags to make a purchase pass.\n\n```mermaid\nflowchart TD\n  Form[\"Bounded account form or structured signup\"] --> Placement[\"Fresh active Enterprise and Tenant placement\"]\n  Placement --> Switch{\"Trusted profileCustomerEligibility.enabled\"}\n  Switch -->|false| Ordinary[\"Ordinary signup without eligibility decision receipt\"]\n  Switch -->|true| Owner[\"Selected authoritative eligibility owner and policy\"]\n  Switch -->|missing or non-Boolean| Refuse[\"Fail closed\"]\n  Owner -->|qualified positive decision| Persist[\"Recheck placement before generated persistence\"]\n  Owner -->|denied, absent or malformed| Refuse\n  Ordinary --> Persist\n  Persist --> Account[\"Registered identity; authentication remains separate\"]\n```\n\n| Trusted selection | Required behavior | Not implied |\n| --- | --- | --- |\n| enabled: false | Ordinary signup/import requires no eligibility owner, published Rules policy or decision receipt. Active placement and normal security remain mandatory. | No fabricated approval; employee participation gates are not disabled. |\n| enabled: true | Require selected qualified authoritative owner, policy and private decision/audit enforcement. Denied, missing or malformed evidence rejects. | A body flag or customer assertion cannot approve eligibility. |\n| Missing or non-Boolean enabled | Reject malformed configuration rather than silently switching enforcement off. | An unavailable owner is not a reason to invent a permissive default. |\n| Employee-backed Customer participation | Independent consent, qualification and eligibility rules still apply. | Ordinary signup does not establish employee membership or participation rights. |\n\nThe existing default is the Boolean false. Later layers select the policy through nConfig, not request input. The owner reads fresh exact active Enterprise and Tenant placement for both ordinary and imported signup and rechecks before persistence. An inactive, missing, foreign or inconsistent placement rejects even when optional eligibility is disabled. Conversely, neither employee membership nor paid membership is a universal prerequisite for ordinary customer signup or coupon ownership. Regulated KYC is a separately selected business requirement, never inferred from a default service name.\n\nPOST /customer/registrations is the existing service-authenticated form route with profile.customer.register. Its mapper accepts bounded email, full name and password and delegates to the normal signup pipeline. Email is trimmed/lowercased, names are normalized without rejecting mononyms, and passwords are not trimmed. Caller code, owner, groups, permissions and verification flags do not confer authority. The response registered:true is not sign-in, verified email ownership or consent to a separate participation scheme. The structured /customer/signup path remains compatible.\n\n## Customize ordinary registration without weakening admission\n\nA customer project can narrow profileCustomerRegistrationForm limits or customize the documented formCustomerCode member in an existing active Profile layer. For example, shorten an allowed name limit for a deployment while retaining normal normalization, stable identity format, principal uniqueness and password policy. If the deployment requires eligibility, select enabled:true and qualify the authoritative owner and decision policy before admitting users; do not substitute a browser checkbox for the owner decision. Keep imported signup on the same admission and active-placement boundary. Configuration edits follow their normal selected-server refresh/build lifecycle, not a documentation publication.\n\n| Success, rejection or interruption | Evidence and recovery |\n| --- | --- |\n| Ordinary signup with eligibility disabled | Registered identity plus normal authentication evidence; no invented eligibility receipt. |\n| Eligibility enabled but owner/policy unavailable | Retain the owner refusal. Restore qualified policy/services; do not toggle unrelated participation flags. |\n| Inactive or changed placement | Reject before persistence; resolve Enterprise/Tenant ownership rather than moving a customer by request body. |\n| Interrupted signup response | Reconcile through normal sign-in/account recovery and existing owner records before another registration; never create a shadow identity. |\n| Source/contract tests pass | Form and placement behavior is covered in isolation; live sessions, browser behavior and regulated-provider acceptance remain separate. |\n\n1. Run form success/rejection, mononym, privileged-field isolation and stable-identity tests.\n2. Exercise false, true, absent and malformed enablement; prove enabled eligibility denial and unavailable-owner failures remain enforced.\n3. Verify fresh placement and pre-persistence recheck for ordinary and imported signup, including foreign/inactive Enterprise or Tenant.\n4. Test actual customer authentication separately from registration. Retain Employee/Customer participation consent and qualification gates; do not report a successful shop signup as their acceptance.\n",
      "previous": {
        "title": "Platform overview",
        "route": "/docs/framework/platform-overview"
      },
      "next": {
        "title": "Application Configuration and Runtime Behavior Management",
        "route": "/docs/framework/configuration-runtime-behavior-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.platform",
        "technicalModule": "profile",
        "owner": "profile",
        "sourcePath": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/profileDocumentationComponentData.js",
        "wordCount": 9077,
        "checksum": "242695c0c83aed34c6fbd34afaa31ddf811350b05dfdf221627b9badad194d30"
      },
      "slug": "security-identity-access-governance",
      "locale": "en",
      "navigationGroup": "Identity and Access Governance",
      "navigationGroupCode": "identity-and-access-governance",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "platform.overview",
          "owner": "profile"
        },
        {
          "documentId": "axis.business-customization",
          "owner": "backoffice"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "promotion.campaigns-coupon-issuance",
          "owner": "promotion"
        },
        {
          "documentId": "cart.customer-intent-calculation",
          "owner": "cart"
        },
        {
          "documentId": "digital.purchase-delivery-reveal",
          "owner": "digitalCore"
        }
      ]
    },
    "active": true
  }
};
