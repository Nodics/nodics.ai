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
    "code": "nodicsDocsComponentframeworkLocalQuickStart",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.local-quick-start",
      "title": "Local quick start with Kickoff and Axis",
      "route": "/docs/framework/framework-local-quick-start",
      "section": "nodics-installer-and-workspace-setup",
      "sectionTitle": "Nodics Installer and Workspace Setup",
      "group": "nodics-installer-and-workspace-setup",
      "groupTitle": "Nodics Installer and Workspace Setup",
      "parentId": "nodics-installer-and-workspace-setup",
      "hierarchyPath": [
        "Nodics Installer and Workspace Setup",
        "Local quick start with Kickoff and Axis"
      ],
      "hierarchyDepth": 2,
      "documentType": "quickstart",
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
      "summary": "Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation.",
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
        "framework.fresh-schema-setup-journey",
        "framework.local-runtime-troubleshooting",
        "framework.what-is-nodics",
        "framework.local-verification-checklist",
        "platform.module-registry"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "nodics-installer-and-workspace-setup",
        "local-workspace-setup",
        "local-quick-start-with-kickoff-and-axis"
      ],
      "topicKeywords": [
        "Nodics Installer and Workspace Setup",
        "Local Workspace Setup",
        "Local quick start with Kickoff and Axis"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Local Quick Start explains the shortest reliable path for running Nodics on a developer machine. It is not the full enterprise setup manual. Use it to start Kickoff, open Axis, confirm the managed workspace is available, and know where to continue when the schema is fresh or a server fails."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Quick path",
          "anchor": "frameworkLocalQuickStart-1-quick-path"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Configure[\"Check Kickoff env\"] --> Start[\"Start local topology\"]\n  Start --> Axis[\"Open Axis\"]\n  Axis --> Login[\"Login as admin\"]\n  Login --> Setup[\"Run setup journeys\"]\n  Setup --> Verify[\"Open Nexus, Agora, and Docs\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Step",
            "Command or action",
            "Expected result"
          ],
          "rows": [
            [
              "Configure",
              "Review the Kickoff `.env` and topology settings.",
              "Ports and framework root are correct."
            ],
            [
              "Start",
              "Run the project topology command from Kickoff.",
              "Backend services and frontend apps start."
            ],
            [
              "Axis",
              "Open `http://localhost:3100`.",
              "Axis login or first-run setup is visible."
            ],
            [
              "Setup",
              "Use Axis setup screens.",
              "Baseline data, accelerators, and documentation move through governed import and approval."
            ],
            [
              "Verify",
              "Open Axis, Nexus, Agora, and docs links.",
              "Each page either renders Online content or a customer-friendly unpublished message."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "frameworkLocalQuickStart-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "The quick start is for proving that a project workspace can become useful quickly. Business users should see how Axis guides setup instead of requiring hidden scripts. A customer team should understand which data is not imported, which packs need approval, and which storefronts are waiting for Online publication."
        },
        {
          "kind": "paragraph",
          "text": "This page intentionally links to the deeper fresh-schema journey and runtime troubleshooting page instead of carrying every recovery detail here."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, this page should be treated as the map, not the full manual. Follow the visible Axis setup journey first, then open the linked pages only when a specific setup, publishing, or runtime problem needs deeper explanation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "frameworkLocalQuickStart-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers use this page to confirm the local topology, then move to focused pages for schema cleanup, build, server startup, publication, and browser acceptance. If a project adds new modules, content packs, media assets, accelerators, or documentation packs, the local quick start should point to the right setup page rather than expanding into a giant checklist."
        },
        {
          "kind": "paragraph",
          "text": "Project code should continue to use the framework root from the local machine or configured environment. The project should not depend on copied framework modules under `.nodics/framework`."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator view",
          "anchor": "frameworkLocalQuickStart-4-operator-view"
        },
        {
          "kind": "paragraph",
          "text": "An operator should know that quick start success is not only a server process being alive. The useful result is a live Axis workspace with visible setup status, import history, approval tasks, Online readiness, and application links that do not leave the user guessing."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue with",
          "anchor": "frameworkLocalQuickStart-5-continue-with"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**Fresh Schema Setup Journey** for deleting schema data, importing baseline content, publishing Online, and verifying from the browser.",
            "**Local Runtime Troubleshooting** for busy ports, stale supervisor state, remote-service circuit errors, and timeout diagnostics.",
            "**Application Setup and Accelerators** for Nexus, Agora Apparel, Agora Electronics, Agora Telco, and future accelerator setup."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "frameworkLocalQuickStart-6-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "When a project changes the local setup, document the project-specific module list, ports, environment files, content packs, accelerator packs, and any extra startup or approval step. Keep customer setup data in project-owned configuration or generated content packs, not in reusable framework source. If the project adds a new application, the quick start should link to that setup journey and explain the fresh-schema verification path."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkLocalQuickStart-7-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating a successful start command as complete setup.",
            "Importing accelerator data before the required backend capability is registered.",
            "Expecting documentation, Nexus, or Agora to render Online content before the relevant content pack has been approved and published.",
            "Hiding setup instructions in logs instead of exposing them in Axis."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkLocalQuickStart-8-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify the quick start with a fresh schema, a clean build, local server start, Axis setup screens, documentation publication, accelerator publication, and browser checks for `localhost:3100`, `localhost:3200`, and the Agora storefront ports used by the topology."
        }
      ],
      "searchText": "Local quick start with Kickoff and Axis Beginner-friendly steps to configure the framework, start local servers, log in to Axis, and open documentation. # Local quick start with Kickoff and Axis\n\nLocal Quick Start explains the shortest reliable path for running Nodics on a developer machine. It is not the full enterprise setup manual. Use it to start Kickoff, open Axis, confirm the managed workspace is available, and know where to continue when the schema is fresh or a server fails.\n\n## Quick path\n\n```mermaid\nflowchart LR\n  Configure[\"Check Kickoff env\"] --> Start[\"Start local topology\"]\n  Start --> Axis[\"Open Axis\"]\n  Axis --> Login[\"Login as admin\"]\n  Login --> Setup[\"Run setup journeys\"]\n  Setup --> Verify[\"Open Nexus, Agora, and Docs\"]\n```\n\n| Step | Command or action | Expected result |\n| --- | --- | --- |\n| Configure | Review the Kickoff `.env` and topology settings. | Ports and framework root are correct. |\n| Start | Run the project topology command from Kickoff. | Backend services and frontend apps start. |\n| Axis | Open `http://localhost:3100`. | Axis login or first-run setup is visible. |\n| Setup | Use Axis setup screens. | Baseline data, accelerators, and documentation move through governed import and approval. |\n| Verify | Open Axis, Nexus, Agora, and docs links. | Each page either renders Online content or a customer-friendly unpublished message. |\n\n## Business perspective\n\nThe quick start is for proving that a project workspace can become useful quickly. Business users should see how Axis guides setup instead of requiring hidden scripts. A customer team should understand which data is not imported, which packs need approval, and which storefronts are waiting for Online publication.\n\nThis page intentionally links to the deeper fresh-schema journey and runtime troubleshooting page instead of carrying every recovery detail here.\n\nFor beginners, this page should be treated as the map, not the full manual. Follow the visible Axis setup journey first, then open the linked pages only when a specific setup, publishing, or runtime problem needs deeper explanation.\n\n## Developer perspective\n\nDevelopers use this page to confirm the local topology, then move to focused pages for schema cleanup, build, server startup, publication, and browser acceptance. If a project adds new modules, content packs, media assets, accelerators, or documentation packs, the local quick start should point to the right setup page rather than expanding into a giant checklist.\n\nProject code should continue to use the framework root from the local machine or configured environment. The project should not depend on copied framework modules under `.nodics/framework`.\n\n## Operator view\n\nAn operator should know that quick start success is not only a server process being alive. The useful result is a live Axis workspace with visible setup status, import history, approval tasks, Online readiness, and application links that do not leave the user guessing.\n\n## Continue with\n\n- **Fresh Schema Setup Journey** for deleting schema data, importing baseline content, publishing Online, and verifying from the browser.\n- **Local Runtime Troubleshooting** for busy ports, stale supervisor state, remote-service circuit errors, and timeout diagnostics.\n- **Application Setup and Accelerators** for Nexus, Agora Apparel, Agora Electronics, Agora Telco, and future accelerator setup.\n\n## Customization and extension guidance\n\nWhen a project changes the local setup, document the project-specific module list, ports, environment files, content packs, accelerator packs, and any extra startup or approval step. Keep customer setup data in project-owned configuration or generated content packs, not in reusable framework source. If the project adds a new application, the quick start should link to that setup journey and explain the fresh-schema verification path.\n\n## Common mistakes\n\n- Treating a successful start command as complete setup.\n- Importing accelerator data before the required backend capability is registered.\n- Expecting documentation, Nexus, or Agora to render Online content before the relevant content pack has been approved and published.\n- Hiding setup instructions in logs instead of exposing them in Axis.\n\n## Verification\n\nVerify the quick start with a fresh schema, a clean build, local server start, Axis setup screens, documentation publication, accelerator publication, and browser checks for `localhost:3100`, `localhost:3200`, and the Agora storefront ports used by the topology.\n",
      "previous": {
        "title": "Agora Apparel Product Data Authoring",
        "route": "/docs/framework/accelerators-agora-apparel-product-data-authoring"
      },
      "next": {
        "title": "Fresh Schema Setup Journey",
        "route": "/docs/framework/framework-fresh-schema-setup-journey"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 621,
        "checksum": "d3708903262c60716f948aa22991f4a58a0319e959a510b75496102612ee9958"
      },
      "slug": "framework-local-quick-start",
      "locale": "en",
      "navigationGroup": "Local Workspace Setup",
      "navigationGroupCode": "local-workspace-setup",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.fresh-schema-setup-journey",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-runtime-troubleshooting",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.what-is-nodics",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentframeworkFreshSchemaSetupJourney",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.fresh-schema-setup-journey",
      "title": "Fresh Schema Setup Journey",
      "route": "/docs/framework/framework-fresh-schema-setup-journey",
      "section": "nodics-installer-and-workspace-setup",
      "sectionTitle": "Nodics Installer and Workspace Setup",
      "group": "nodics-installer-and-workspace-setup",
      "groupTitle": "Nodics Installer and Workspace Setup",
      "parentId": "nodics-installer-and-workspace-setup",
      "hierarchyPath": [
        "Nodics Installer and Workspace Setup",
        "Fresh Schema Setup Journey"
      ],
      "hierarchyDepth": 2,
      "documentType": "quickstart",
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
      "summary": "Required order for initializing Axis, registering capabilities, importing app packs, publishing Online, and verifying browsers.",
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
        "framework.what-is-nodics",
        "framework.local-verification-checklist",
        "platform.module-registry"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "fresh-schema",
        "setup-journey",
        "axis-nexus-agora-initialization"
      ],
      "topicKeywords": [
        "Nodics Installer and Workspace Setup",
        "Local Workspace Setup",
        "Fresh Schema Setup Journey"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The fresh schema setup journey explains the order required to bring a new local database from empty state to a usable Axis, Nexus, Agora, and documentation experience. It exists because a fresh schema is where hidden dependencies become visible. If the setup order is unclear, users see buttons that do nothing, public pages that render partial data, or imported packs that look successful while required capabilities are still missing."
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, this page is the safe path. For an operator, it is the acceptance sequence. For developers, it is the minimum journey that proves setup documentation matches the implementation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Required order",
          "anchor": "frameworkFreshSchemaSetupJourney-1-required-order"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Empty[\"Empty database\"] --> Axis[\"Initialize Axis baseline\"]\n  Axis --> Modules[\"Register required capabilities\"]\n  Modules --> AppData[\"Import Nexus and Agora data packs\"]\n  Axis --> Docs[\"Import documentation packs\"]\n  AppData --> Publish[\"Approve and publish Online content\"]\n  Docs --> Publish\n  Publish --> Browser[\"Verify Axis, Nexus, Agora, and docs in browser\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Setup table",
          "anchor": "frameworkFreshSchemaSetupJourney-2-setup-table"
        },
        {
          "kind": "table",
          "headers": [
            "Step",
            "Action",
            "Why it comes here"
          ],
          "rows": [
            [
              "1",
              "Start local backend and Axis.",
              "The user needs the recovery shell and APIs."
            ],
            [
              "2",
              "Initialize Axis baseline.",
              "Axis needs managed CMS and administration data."
            ],
            [
              "3",
              "Register required modules.",
              "Commerce and other domain data must not import as if owners are absent."
            ],
            [
              "4",
              "Import application data packs.",
              "Nexus and Agora need content, media, routes, catalogs, and records."
            ],
            [
              "5",
              "Import documentation packs.",
              "Documentation can happen in parallel with app preparation."
            ],
            [
              "6",
              "Approve and publish.",
              "Public apps consume Online content, not Staged content."
            ],
            [
              "7",
              "Verify in browser.",
              "The user journey proves the setup is complete."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business and user experience",
          "anchor": "frameworkFreshSchemaSetupJourney-3-business-and-user-experience"
        },
        {
          "kind": "paragraph",
          "text": "The setup screens should make the next action obvious. If an application pack needs commerce capabilities, Axis should show that dependency before import. If content is not Online, Nexus or Agora should show a customer-friendly maintenance page. If approval is required, the user should see the approval task and perform approve or reject from the same business journey when permissions allow it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "frameworkFreshSchemaSetupJourney-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects can add their own setup packs, required capabilities, and publication steps. The installer should copy project-owned setup metadata where needed, but it should not force every customer into Nodics sample server names. A generated customer corporate site or storefront should declare its own content pack, media assets, channel, catalog, and dependency requirements."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkFreshSchemaSetupJourney-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should be able to follow this page without knowing internal module names first. The screen should say what is missing, what is ready, and what action comes next. A business user should understand when the site is safe to show publicly. A developer should understand which backend pack or capability provides each record. An operator should understand which logs, publication states, and browser checks prove the environment."
        },
        {
          "kind": "paragraph",
          "text": "Each setup step should have a visible state: not imported, Staged ready, approval needed, approval in progress, Online ready, failed, or blocked by a missing capability. If an implementation cannot express one of those states, the UI journey will become confusing again because users will have to infer what the framework already knows."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkFreshSchemaSetupJourney-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Importing Agora data before commerce capabilities are registered.",
            "Assuming documentation publishing should block Swagger/OpenAPI visibility.",
            "Forgetting media files and media records during a site data import.",
            "Showing public application content from fallback frontend constants.",
            "Asking users to find approval tasks on a separate confusing page."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkFreshSchemaSetupJourney-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification must use a fresh schema. Run the setup sequence, confirm Axis baseline state, confirm required modules are registered, import application and documentation packs, approve publication, refresh navigation, and open Nexus and Agora. Public apps must either show Online content or the approved maintenance state."
        }
      ],
      "searchText": "Fresh Schema Setup Journey Required order for initializing Axis, registering capabilities, importing app packs, publishing Online, and verifying browsers. # Fresh Schema Setup Journey\n\nThe fresh schema setup journey explains the order required to bring a new local database from empty state to a usable Axis, Nexus, Agora, and documentation experience. It exists because a fresh schema is where hidden dependencies become visible. If the setup order is unclear, users see buttons that do nothing, public pages that render partial data, or imported packs that look successful while required capabilities are still missing.\n\nFor a beginner, this page is the safe path. For an operator, it is the acceptance sequence. For developers, it is the minimum journey that proves setup documentation matches the implementation.\n\n## Required order\n\n```mermaid\nflowchart TD\n  Empty[\"Empty database\"] --> Axis[\"Initialize Axis baseline\"]\n  Axis --> Modules[\"Register required capabilities\"]\n  Modules --> AppData[\"Import Nexus and Agora data packs\"]\n  Axis --> Docs[\"Import documentation packs\"]\n  AppData --> Publish[\"Approve and publish Online content\"]\n  Docs --> Publish\n  Publish --> Browser[\"Verify Axis, Nexus, Agora, and docs in browser\"]\n```\n\n## Setup table\n\n| Step | Action | Why it comes here |\n| --- | --- | --- |\n| 1 | Start local backend and Axis. | The user needs the recovery shell and APIs. |\n| 2 | Initialize Axis baseline. | Axis needs managed CMS and administration data. |\n| 3 | Register required modules. | Commerce and other domain data must not import as if owners are absent. |\n| 4 | Import application data packs. | Nexus and Agora need content, media, routes, catalogs, and records. |\n| 5 | Import documentation packs. | Documentation can happen in parallel with app preparation. |\n| 6 | Approve and publish. | Public apps consume Online content, not Staged content. |\n| 7 | Verify in browser. | The user journey proves the setup is complete. |\n\n## Business and user experience\n\nThe setup screens should make the next action obvious. If an application pack needs commerce capabilities, Axis should show that dependency before import. If content is not Online, Nexus or Agora should show a customer-friendly maintenance page. If approval is required, the user should see the approval task and perform approve or reject from the same business journey when permissions allow it.\n\n## Customization and extension\n\nProjects can add their own setup packs, required capabilities, and publication steps. The installer should copy project-owned setup metadata where needed, but it should not force every customer into Nodics sample server names. A generated customer corporate site or storefront should declare its own content pack, media assets, channel, catalog, and dependency requirements.\n\n## Reader and implementation contract\n\nA beginner should be able to follow this page without knowing internal module names first. The screen should say what is missing, what is ready, and what action comes next. A business user should understand when the site is safe to show publicly. A developer should understand which backend pack or capability provides each record. An operator should understand which logs, publication states, and browser checks prove the environment.\n\nEach setup step should have a visible state: not imported, Staged ready, approval needed, approval in progress, Online ready, failed, or blocked by a missing capability. If an implementation cannot express one of those states, the UI journey will become confusing again because users will have to infer what the framework already knows.\n\n## Common mistakes\n\n- Importing Agora data before commerce capabilities are registered.\n- Assuming documentation publishing should block Swagger/OpenAPI visibility.\n- Forgetting media files and media records during a site data import.\n- Showing public application content from fallback frontend constants.\n- Asking users to find approval tasks on a separate confusing page.\n\n## Verification\n\nVerification must use a fresh schema. Run the setup sequence, confirm Axis baseline state, confirm required modules are registered, import application and documentation packs, approve publication, refresh navigation, and open Nexus and Agora. Public apps must either show Online content or the approved maintenance state.\n",
      "previous": {
        "title": "Local quick start with Kickoff and Axis",
        "route": "/docs/framework/framework-local-quick-start"
      },
      "next": {
        "title": "Local Runtime Troubleshooting",
        "route": "/docs/framework/framework-local-runtime-troubleshooting"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 596,
        "checksum": "7acf6e632ee72eb902eb16d18230190b69fd14de78fa9f350694cb2bd75622a4"
      },
      "slug": "framework-fresh-schema-setup-journey",
      "locale": "en",
      "navigationGroup": "Local Workspace Setup",
      "navigationGroupCode": "local-workspace-setup",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "framework.what-is-nodics",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentframeworkLocalRuntimeTroubleshooting",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.local-runtime-troubleshooting",
      "title": "Local Runtime Troubleshooting",
      "route": "/docs/framework/framework-local-runtime-troubleshooting",
      "section": "nodics-installer-and-workspace-setup",
      "sectionTitle": "Nodics Installer and Workspace Setup",
      "group": "nodics-installer-and-workspace-setup",
      "groupTitle": "Nodics Installer and Workspace Setup",
      "parentId": "nodics-installer-and-workspace-setup",
      "hierarchyPath": [
        "Nodics Installer and Workspace Setup",
        "Local Runtime Troubleshooting"
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
      "summary": "Practical troubleshooting for ports, stale topology state, schema import failures, publication state, and missing navigation.",
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
        "framework.what-is-nodics",
        "framework.local-verification-checklist",
        "platform.module-registry"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "local-runtime-troubleshooting",
        "ports",
        "fresh-schema-errors"
      ],
      "topicKeywords": [
        "Nodics Installer and Workspace Setup",
        "Local Workspace Setup",
        "Local Runtime Troubleshooting"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Local runtime troubleshooting gives developers and operators a practical path when the reference workspace does not start cleanly. It belongs beside the quick start because setup problems are part of the first user journey. If a port is busy, a supervisor state file is stale, a schema import fails, or a content pack times out, the user should not have to guess whether the failure is a server issue, data issue, publication issue, or browser issue."
        },
        {
          "kind": "paragraph",
          "text": "The goal is not to hide failures. The goal is to make them actionable."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting flow",
          "anchor": "frameworkLocalRuntimeTroubleshooting-1-troubleshooting-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Failure[\"Local failure\"] --> Ports[\"Check ports and topology status\"]\n  Failure --> Logs[\"Read generated server logs\"]\n  Failure --> Data[\"Check fresh schema and import state\"]\n  Data --> Capabilities[\"Confirm required module registration\"]\n  Data --> Publish[\"Confirm Staged, approval, and Online status\"]\n  Logs --> Fix[\"Fix root cause and restart only the needed topology\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common local signals",
          "anchor": "frameworkLocalRuntimeTroubleshooting-2-common-local-signals"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Likely cause",
            "Action"
          ],
          "rows": [
            [
              "Required ports are busy",
              "A previous Axis, Nexus, Agora, or backend process is still running.",
              "Run topology status, identify the owner, and stop it explicitly."
            ],
            [
              "Stop refuses to signal PID",
              "Generated state is stale or belongs to another checkout.",
              "Resolve listening ports manually before restarting."
            ],
            [
              "Import validation fails",
              "Fresh schema contract or content-pack field mismatch.",
              "Fix source pack/schema, regenerate, and retry import."
            ],
            [
              "Public app shows maintenance",
              "Online CMS content is not published for that site.",
              "Import, approve, publish, then refresh."
            ],
            [
              "Axis navigation is missing docs",
              "Documentation source is not Online or navigation did not refresh.",
              "Publish the docs pack and refresh backend-driven navigation."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business impact",
          "anchor": "frameworkLocalRuntimeTroubleshooting-3-business-impact"
        },
        {
          "kind": "paragraph",
          "text": "Local troubleshooting is a business concern because adoption depends on the first hour. A user who cannot understand what failed will not trust the framework. Error messages should name the missing dependency, owner, and next action wherever possible. Maintenance pages should be professional and customer-friendly, not accidental blank screens."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "frameworkLocalRuntimeTroubleshooting-4-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Customer projects may use different ports, servers, application packs, or content catalogs. Troubleshooting documentation must refer to project-owned configuration and generated workspace metadata rather than assuming only the reference Kickoff topology. Installer-created projects should include enough metadata for Axis to show setup dependencies and recovery steps."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkLocalRuntimeTroubleshooting-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should never have to decide between random terminal commands and guesswork. The troubleshooting path should name the owner of the failure and the safest next action. A business administrator should see whether the issue blocks authoring, approval, Online publication, or public delivery. A developer should know whether the fix belongs in schema, import data, configuration, service code, or frontend rendering. An operator should know which process can be restarted and which process must be left alone."
        },
        {
          "kind": "paragraph",
          "text": "Troubleshooting guidance should be updated whenever startup, import, publication, or browser setup behavior changes. If the UI introduces a new button such as initialize, update Staged, approve, reject, or refresh, the failure states for that action must be documented with the same care as the happy path."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkLocalRuntimeTroubleshooting-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating every startup failure as a build failure.",
            "Deleting schema before reading the failing import or server log.",
            "Killing processes without confirming which checkout owns the port.",
            "Fixing a UI symptom while the missing record is in Staged/Online publication state.",
            "Keeping troubleshooting knowledge outside the docs."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkLocalRuntimeTroubleshooting-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Troubleshooting is verified by reproducing a fresh schema setup, checking the failure messages, confirming logs point to the correct owner, and proving that the documented recovery restores Axis, Nexus, Agora, documentation, and API reference behavior without manual hidden steps."
        }
      ],
      "searchText": "Local Runtime Troubleshooting Practical troubleshooting for ports, stale topology state, schema import failures, publication state, and missing navigation. # Local Runtime Troubleshooting\n\nLocal runtime troubleshooting gives developers and operators a practical path when the reference workspace does not start cleanly. It belongs beside the quick start because setup problems are part of the first user journey. If a port is busy, a supervisor state file is stale, a schema import fails, or a content pack times out, the user should not have to guess whether the failure is a server issue, data issue, publication issue, or browser issue.\n\nThe goal is not to hide failures. The goal is to make them actionable.\n\n## Troubleshooting flow\n\n```mermaid\nflowchart TD\n  Failure[\"Local failure\"] --> Ports[\"Check ports and topology status\"]\n  Failure --> Logs[\"Read generated server logs\"]\n  Failure --> Data[\"Check fresh schema and import state\"]\n  Data --> Capabilities[\"Confirm required module registration\"]\n  Data --> Publish[\"Confirm Staged, approval, and Online status\"]\n  Logs --> Fix[\"Fix root cause and restart only the needed topology\"]\n```\n\n## Common local signals\n\n| Symptom | Likely cause | Action |\n| --- | --- | --- |\n| Required ports are busy | A previous Axis, Nexus, Agora, or backend process is still running. | Run topology status, identify the owner, and stop it explicitly. |\n| Stop refuses to signal PID | Generated state is stale or belongs to another checkout. | Resolve listening ports manually before restarting. |\n| Import validation fails | Fresh schema contract or content-pack field mismatch. | Fix source pack/schema, regenerate, and retry import. |\n| Public app shows maintenance | Online CMS content is not published for that site. | Import, approve, publish, then refresh. |\n| Axis navigation is missing docs | Documentation source is not Online or navigation did not refresh. | Publish the docs pack and refresh backend-driven navigation. |\n\n## Business impact\n\nLocal troubleshooting is a business concern because adoption depends on the first hour. A user who cannot understand what failed will not trust the framework. Error messages should name the missing dependency, owner, and next action wherever possible. Maintenance pages should be professional and customer-friendly, not accidental blank screens.\n\n## Customization and extension\n\nCustomer projects may use different ports, servers, application packs, or content catalogs. Troubleshooting documentation must refer to project-owned configuration and generated workspace metadata rather than assuming only the reference Kickoff topology. Installer-created projects should include enough metadata for Axis to show setup dependencies and recovery steps.\n\n## Reader and implementation contract\n\nA beginner should never have to decide between random terminal commands and guesswork. The troubleshooting path should name the owner of the failure and the safest next action. A business administrator should see whether the issue blocks authoring, approval, Online publication, or public delivery. A developer should know whether the fix belongs in schema, import data, configuration, service code, or frontend rendering. An operator should know which process can be restarted and which process must be left alone.\n\nTroubleshooting guidance should be updated whenever startup, import, publication, or browser setup behavior changes. If the UI introduces a new button such as initialize, update Staged, approve, reject, or refresh, the failure states for that action must be documented with the same care as the happy path.\n\n## Common mistakes\n\n- Treating every startup failure as a build failure.\n- Deleting schema before reading the failing import or server log.\n- Killing processes without confirming which checkout owns the port.\n- Fixing a UI symptom while the missing record is in Staged/Online publication state.\n- Keeping troubleshooting knowledge outside the docs.\n\n## Verification\n\nTroubleshooting is verified by reproducing a fresh schema setup, checking the failure messages, confirming logs point to the correct owner, and proving that the documented recovery restores Axis, Nexus, Agora, documentation, and API reference behavior without manual hidden steps.\n",
      "previous": {
        "title": "Fresh Schema Setup Journey",
        "route": "/docs/framework/framework-fresh-schema-setup-journey"
      },
      "next": {
        "title": "Installed Runtime Installer and Application Builder APIs",
        "route": "/docs/framework/installer-installed-runtime-application-builder"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 575,
        "checksum": "4c5e536cbd2191cfac1a1218f34b4411a4627942464f9faa4fd94c7d09585430"
      },
      "slug": "framework-local-runtime-troubleshooting",
      "locale": "en",
      "navigationGroup": "Local Workspace Setup",
      "navigationGroupCode": "local-workspace-setup",
      "navigationGroupOrder": 10,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "framework.what-is-nodics",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "platform.module-registry",
          "owner": "backoffice"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentframeworkDevopsRuntime",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.devops-runtime",
      "title": "Runtime and DevOps operations",
      "route": "/docs/framework/framework-devops-runtime",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Runtime and DevOps operations"
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
      "summary": "Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance.",
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
        "framework.local-verification-checklist",
        "foundation.overview",
        "commerce.enterprise-operations",
        "framework.runtime-release-rollback",
        "framework.local-runtime-troubleshooting",
        "framework.local-browser-acceptance-journey"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "data-flow",
        "troubleshooting-matrix",
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "runtime-and-devops",
        "runtime-and-devops-operations"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Runtime and DevOps",
        "Runtime and DevOps operations"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Runtime and DevOps Operations is the overview for running Nodics safely across local, staged, online, and future production environments. It points operators and developers to focused pages for topology, configuration, release, rollback, monitoring, and browser acceptance."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Runtime map",
          "anchor": "frameworkDevopsRuntime-1-runtime-map"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Config[\"Configuration\"] --> Server[\"Runtime server\"]\n  Server --> Modules[\"Active modules\"]\n  Modules --> Health[\"Health and logs\"]\n  Health --> Release[\"Release and rollback\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Owner question"
          ],
          "rows": [
            [
              "Topology",
              "Which servers run locally and which capabilities do they host?"
            ],
            [
              "Configuration",
              "Which values come from project env, module defaults, or governed runtime changes?"
            ],
            [
              "Dependencies",
              "Which external stores or services must be reachable?"
            ],
            [
              "Recovery",
              "Which logs, health checks, and operations prove the system recovered?"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "frameworkDevopsRuntime-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Business stakeholders care about availability, controlled change, and safe recovery. If documentation, Nexus, Agora, checkout, or publishing is not available, the operator should have a clear path to identify whether the issue is startup, configuration, missing data, publication state, media delivery, or external dependency health."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "frameworkDevopsRuntime-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers use this page to understand where runtime behavior is configured and where deeper runbooks live. A code change that affects topology, configuration, generated schema, import, publication, cache, events, or provider selection must update the related documentation and tests."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue with",
          "anchor": "frameworkDevopsRuntime-4-continue-with"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**Process Runtime Topology** for process and service layout.",
            "**Local Runtime Troubleshooting** for busy ports, stale state, timeouts, and circuit errors.",
            "**Runtime Release and Rollback** for changing environments safely.",
            "**Local Browser Acceptance Journey** for proving a fresh setup from the UI."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "frameworkDevopsRuntime-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Runtime documentation should connect commands to visible system state. Include topology status, active modules, generated schema status, environment source, dependency health, circuit state, logs, import history, publication state, and browser route evidence. If a local setup differs from staged or online environments, state the difference directly. This helps beginners avoid guessing and gives experienced operators a reliable path from symptom to owner without reading unrelated source files."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkDevopsRuntime-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that runtime readiness is more than a process listening on a port. A business user should understand which application journey is affected when a service, dependency, import, or publication state fails. A developer should document configuration layers, active modules, generated contracts, provider choices, and tests. An operator should know where to inspect health, logs, circuits, import history, publication state, and rollback evidence."
        },
        {
          "kind": "paragraph",
          "text": "Every DevOps topic must connect local proof to enterprise readiness. That means clean build, fresh schema, startup, setup journey, browser acceptance, monitoring, recovery, and a clear statement of what is implemented now versus what belongs to future production rollout."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "frameworkDevopsRuntime-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkDevopsRuntime-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating local success as production readiness.",
            "Hiding required environment values outside project configuration.",
            "Changing provider behavior without rollback and monitoring notes.",
            "Running browser acceptance without a fresh schema or clean content state."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkDevopsRuntime-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify runtime work with startup logs, health endpoints, generated schema, Axis status, import/publish evidence, browser checks, and rollback evidence. Operators should be able to diagnose the system without reading source code."
        }
      ],
      "searchText": "Runtime and DevOps operations Runtime topology, dependencies, public and private properties, deployment, monitoring, and recovery guidance. # Runtime and DevOps operations\n\nRuntime and DevOps Operations is the overview for running Nodics safely across local, staged, online, and future production environments. It points operators and developers to focused pages for topology, configuration, release, rollback, monitoring, and browser acceptance.\n\n## Runtime map\n\n```mermaid\nflowchart LR\n  Config[\"Configuration\"] --> Server[\"Runtime server\"]\n  Server --> Modules[\"Active modules\"]\n  Modules --> Health[\"Health and logs\"]\n  Health --> Release[\"Release and rollback\"]\n```\n\n| Area | Owner question |\n| --- | --- |\n| Topology | Which servers run locally and which capabilities do they host? |\n| Configuration | Which values come from project env, module defaults, or governed runtime changes? |\n| Dependencies | Which external stores or services must be reachable? |\n| Recovery | Which logs, health checks, and operations prove the system recovered? |\n\n## Business perspective\n\nBusiness stakeholders care about availability, controlled change, and safe recovery. If documentation, Nexus, Agora, checkout, or publishing is not available, the operator should have a clear path to identify whether the issue is startup, configuration, missing data, publication state, media delivery, or external dependency health.\n\n## Developer perspective\n\nDevelopers use this page to understand where runtime behavior is configured and where deeper runbooks live. A code change that affects topology, configuration, generated schema, import, publication, cache, events, or provider selection must update the related documentation and tests.\n\n## Continue with\n\n- **Process Runtime Topology** for process and service layout.\n- **Local Runtime Troubleshooting** for busy ports, stale state, timeouts, and circuit errors.\n- **Runtime Release and Rollback** for changing environments safely.\n- **Local Browser Acceptance Journey** for proving a fresh setup from the UI.\n\n## Operational evidence\n\nRuntime documentation should connect commands to visible system state. Include topology status, active modules, generated schema status, environment source, dependency health, circuit state, logs, import history, publication state, and browser route evidence. If a local setup differs from staged or online environments, state the difference directly. This helps beginners avoid guessing and gives experienced operators a reliable path from symptom to owner without reading unrelated source files.\n\n## Reader and implementation contract\n\nA beginner should understand that runtime readiness is more than a process listening on a port. A business user should understand which application journey is affected when a service, dependency, import, or publication state fails. A developer should document configuration layers, active modules, generated contracts, provider choices, and tests. An operator should know where to inspect health, logs, circuits, import history, publication state, and rollback evidence.\n\nEvery DevOps topic must connect local proof to enterprise readiness. That means clean build, fresh schema, startup, setup journey, browser acceptance, monitoring, recovery, and a clear statement of what is implemented now versus what belongs to future production rollout.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Treating local success as production readiness.\n- Hiding required environment values outside project configuration.\n- Changing provider behavior without rollback and monitoring notes.\n- Running browser acceptance without a fresh schema or clean content state.\n\n## Verification\n\nVerify runtime work with startup logs, health endpoints, generated schema, Axis status, import/publish evidence, browser checks, and rollback evidence. Operators should be able to diagnose the system without reading source code.\n",
      "previous": {
        "title": "Action Adapter Contract",
        "route": "/docs/framework/process/action-adapters"
      },
      "next": {
        "title": "Runtime Release and Rollback",
        "route": "/docs/framework/framework-runtime-release-rollback"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 584,
        "checksum": "34c2f9340a6dc632669b12796ddf04b02bfb308d69b55e63517f8679c8452bf7"
      },
      "slug": "framework-devops-runtime",
      "locale": "en",
      "navigationGroup": "Runtime and DevOps",
      "navigationGroupCode": "runtime-and-devops",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        },
        {
          "documentId": "foundation.overview",
          "owner": "nodics.docs"
        },
        {
          "documentId": "commerce.enterprise-operations",
          "owner": "checkoutCore"
        },
        {
          "documentId": "framework.runtime-release-rollback",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-runtime-troubleshooting",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-browser-acceptance-journey",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record4": {
    "code": "nodicsDocsComponentframeworkRuntimeReleaseRollback",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.runtime-release-rollback",
      "title": "Runtime Release and Rollback",
      "route": "/docs/framework/framework-runtime-release-rollback",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Runtime Release and Rollback"
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
      "summary": "Release and rollback guidance for code, configuration, content, data import, generated contracts, and browser evidence.",
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
        "framework.devops-runtime"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "runtime-and-devops",
        "runtime-and-devops-operations"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Runtime and DevOps",
        "Runtime and DevOps operations"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Runtime Release and Rollback explains how Nodics changes should move through local, staged, online, and future production environments without surprising business users. It covers configuration, generated data, publication state, and rollback evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Release flow",
          "anchor": "frameworkRuntimeReleaseRollback-1-release-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Change[\"Code, config, data, or content change\"] --> Validate[\"Build and tests\"]\n  Validate --> Staged[\"Staged runtime\"]\n  Staged --> Approval[\"Governed approval\"]\n  Approval --> Online[\"Online runtime or content\"]\n  Online --> Observe[\"Monitor and verify\"]\n  Observe --> Rollback[\"Rollback candidate\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Release item",
            "Rollback question"
          ],
          "rows": [
            [
              "Code",
              "Which commit, package, or module version restores behavior?"
            ],
            [
              "Configuration",
              "Which previous value is valid and who can activate it?"
            ],
            [
              "Content",
              "Which Online version remains active if approval is rejected?"
            ],
            [
              "Data import",
              "Which run, checksum, and target environment can be audited?"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "frameworkRuntimeReleaseRollback-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Business users should know whether a release changes customer-visible content, checkout behavior, operational queues, automation, or internal Axis pages. A release is not complete until there is browser evidence for the affected journey and a clear rollback story if the change damages revenue or operations."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "frameworkRuntimeReleaseRollback-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should connect implementation change to generated contracts, module metadata, tests, and deployment artifacts. If a change introduces a new schema, service, route, event, pipeline, or content pack, it must document how it is validated and what happens to existing data during rollback."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator perspective",
          "anchor": "frameworkRuntimeReleaseRollback-4-operator-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Operators need release identity, health status, logs, import runs, publication receipts, task approvals, and monitoring signals. If a rollback is not yet automated, the documentation must still describe the manual decision and the evidence required before executing it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "frameworkRuntimeReleaseRollback-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Release documentation should capture the evidence that proves a change can be trusted. Include commit or package version, generated contract result, schema migration status, data import status, approval task, Online activation, affected routes, browser result, monitoring result, and rollback candidate. For content releases, include the previous Online version that remains active until approval. For runtime releases, include the configuration or deployment value that restores the previous behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkRuntimeReleaseRollback-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that release and rollback apply to content, data, configuration, generated contracts, and code. A business user should know what customer or operator journey changes and when the change becomes visible. A developer should document version, checksum, migration, import run, schema impact, and validation evidence. An operator should know how to confirm the active version and what action restores the previous state."
        },
        {
          "kind": "paragraph",
          "text": "This page must be updated when a new release mechanism or rollback boundary is introduced. If the rollback is manual, the documentation should say so honestly and list the exact evidence needed before an administrator acts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "frameworkRuntimeReleaseRollback-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkRuntimeReleaseRollback-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Publishing content without a rollback candidate.",
            "Changing runtime configuration without audit and approval.",
            "Treating generated schema differences as harmless.",
            "Missing browser verification for the journey that business users care about."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkRuntimeReleaseRollback-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify release and rollback by recording build result, generated contract status, import or migration evidence, approval outcome, browser result, health signals, and rollback instructions. A beginner should know what changed; an operator should know how to recover."
        }
      ],
      "searchText": "Runtime Release and Rollback Release and rollback guidance for code, configuration, content, data import, generated contracts, and browser evidence. # Runtime Release and Rollback\n\nRuntime Release and Rollback explains how Nodics changes should move through local, staged, online, and future production environments without surprising business users. It covers configuration, generated data, publication state, and rollback evidence.\n\n## Release flow\n\n```mermaid\nflowchart TD\n  Change[\"Code, config, data, or content change\"] --> Validate[\"Build and tests\"]\n  Validate --> Staged[\"Staged runtime\"]\n  Staged --> Approval[\"Governed approval\"]\n  Approval --> Online[\"Online runtime or content\"]\n  Online --> Observe[\"Monitor and verify\"]\n  Observe --> Rollback[\"Rollback candidate\"]\n```\n\n| Release item | Rollback question |\n| --- | --- |\n| Code | Which commit, package, or module version restores behavior? |\n| Configuration | Which previous value is valid and who can activate it? |\n| Content | Which Online version remains active if approval is rejected? |\n| Data import | Which run, checksum, and target environment can be audited? |\n\n## Business perspective\n\nBusiness users should know whether a release changes customer-visible content, checkout behavior, operational queues, automation, or internal Axis pages. A release is not complete until there is browser evidence for the affected journey and a clear rollback story if the change damages revenue or operations.\n\n## Developer perspective\n\nDevelopers should connect implementation change to generated contracts, module metadata, tests, and deployment artifacts. If a change introduces a new schema, service, route, event, pipeline, or content pack, it must document how it is validated and what happens to existing data during rollback.\n\n## Operator perspective\n\nOperators need release identity, health status, logs, import runs, publication receipts, task approvals, and monitoring signals. If a rollback is not yet automated, the documentation must still describe the manual decision and the evidence required before executing it.\n\n## Operational evidence\n\nRelease documentation should capture the evidence that proves a change can be trusted. Include commit or package version, generated contract result, schema migration status, data import status, approval task, Online activation, affected routes, browser result, monitoring result, and rollback candidate. For content releases, include the previous Online version that remains active until approval. For runtime releases, include the configuration or deployment value that restores the previous behavior.\n\n## Reader and implementation contract\n\nA beginner should understand that release and rollback apply to content, data, configuration, generated contracts, and code. A business user should know what customer or operator journey changes and when the change becomes visible. A developer should document version, checksum, migration, import run, schema impact, and validation evidence. An operator should know how to confirm the active version and what action restores the previous state.\n\nThis page must be updated when a new release mechanism or rollback boundary is introduced. If the rollback is manual, the documentation should say so honestly and list the exact evidence needed before an administrator acts.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Publishing content without a rollback candidate.\n- Changing runtime configuration without audit and approval.\n- Treating generated schema differences as harmless.\n- Missing browser verification for the journey that business users care about.\n\n## Verification\n\nVerify release and rollback by recording build result, generated contract status, import or migration evidence, approval outcome, browser result, health signals, and rollback instructions. A beginner should know what changed; an operator should know how to recover.\n",
      "previous": {
        "title": "Runtime and DevOps operations",
        "route": "/docs/framework/framework-devops-runtime"
      },
      "next": {
        "title": "Local Browser Acceptance Journey",
        "route": "/docs/framework/framework-local-browser-acceptance-journey"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 594,
        "checksum": "9e3c4c930c6586ae1cef3efdea4905dbfee8a16988bf8d3b19000299da659911"
      },
      "slug": "framework-runtime-release-rollback",
      "locale": "en",
      "navigationGroup": "Runtime and DevOps",
      "navigationGroupCode": "runtime-and-devops",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "framework.devops-runtime",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record5": {
    "code": "nodicsDocsComponentframeworkLocalBrowserAcceptanceJourney",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.local-browser-acceptance-journey",
      "title": "Local Browser Acceptance Journey",
      "route": "/docs/framework/framework-local-browser-acceptance-journey",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Local Browser Acceptance Journey"
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
      "summary": "Fresh-schema browser acceptance path for Axis, documentation, Nexus, Agora, setup actions, and unpublished states.",
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
        "framework.local-verification-checklist"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "local-verification-and-acceptance",
        "local-verification-and-acceptance-checklist"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Local Verification and Acceptance",
        "Local verification and acceptance checklist"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Local Browser Acceptance Journey explains the required manual browser pass after a fresh schema setup. It exists because many defects only appear when a real user moves through Axis, Nexus, Agora, documentation, and approval flows."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Browser path",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-1-browser-path"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Axis[\"Open Axis\"] --> Setup[\"Complete setup dashboard\"]\n  Setup --> Docs[\"Publish documentation\"]\n  Setup --> Apps[\"Initialize applications\"]\n  Docs --> Nav[\"Open documentation navigation\"]\n  Apps --> Nexus[\"Open Nexus\"]\n  Apps --> Agora[\"Open Agora\"]\n  Nav --> Evidence[\"Record visible evidence\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Route",
            "What to verify"
          ],
          "rows": [
            [
              "`localhost:3100`",
              "Axis login, setup status, left navigation, and workspace clarity."
            ],
            [
              "`/docs`",
              "Documentation publication center, available links, and compact lists."
            ],
            [
              "`/docs/framework`",
              "Documentation navigation, page content, diagrams, tags, and search."
            ],
            [
              "`localhost:3200`",
              "Nexus Online content or customer-friendly unpublished message."
            ],
            [
              "Agora ports",
              "Storefront Online content or customer-friendly unpublished message."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "The browser journey should feel like a guided onboarding process. A user should know what is ready, what needs approval, what can be opened, and why a link is locked. Empty pages should explain the business state instead of showing broken layouts or hardcoded sample content."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should verify the same route after every UI, content, publication, or import change. The browser pass should catch stale navigation, missing media, unpublished content, alignment issues, broken labels, hidden approval tasks, and actions that do nothing."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator perspective",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-4-operator-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Operators need evidence that setup actions triggered the expected backend state. Browser checks should be paired with import history, publication state, approval tasks, logs, and API status when a failure appears."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "Browser acceptance should produce evidence a teammate can repeat. Record the schema state, build result, server status, logged-in role, route opened, expected state, actual state, screenshots or notes, and any backend log or API used to explain a failure. The route list should include setup pages, documentation pages, application pages, approval queues, and customer-facing unpublished states. This prevents false confidence from testing only one happy path."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand the visible journey before learning internal APIs. A business user should see whether the system is usable, waiting for data, waiting for approval, or intentionally unpublished. A developer should know which route, component, content pack, media relation, and action caused the visible state. An operator should know what backend evidence to inspect when the browser result is wrong."
        },
        {
          "kind": "paragraph",
          "text": "Every browser acceptance page must include routes, expected states, setup actions, approval or publication gates, frontend fallback behavior, and evidence. It should be updated whenever Axis, Nexus, Agora, documentation navigation, setup accelerators, media import, or publication UI changes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Checking only the route that was changed.",
            "Not using a fresh schema before claiming setup works.",
            "Publishing docs but forgetting Nexus or Agora content.",
            "Allowing a button to trigger work without visible progress or error detail."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkLocalBrowserAcceptanceJourney-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verification is complete when every route either renders approved Online content or an intentional unpublished/maintenance state, all setup actions show clear progress or failure, and the user can find the next action without leaving the current workflow."
        }
      ],
      "searchText": "Local Browser Acceptance Journey Fresh-schema browser acceptance path for Axis, documentation, Nexus, Agora, setup actions, and unpublished states. # Local Browser Acceptance Journey\n\nLocal Browser Acceptance Journey explains the required manual browser pass after a fresh schema setup. It exists because many defects only appear when a real user moves through Axis, Nexus, Agora, documentation, and approval flows.\n\n## Browser path\n\n```mermaid\nflowchart TD\n  Axis[\"Open Axis\"] --> Setup[\"Complete setup dashboard\"]\n  Setup --> Docs[\"Publish documentation\"]\n  Setup --> Apps[\"Initialize applications\"]\n  Docs --> Nav[\"Open documentation navigation\"]\n  Apps --> Nexus[\"Open Nexus\"]\n  Apps --> Agora[\"Open Agora\"]\n  Nav --> Evidence[\"Record visible evidence\"]\n```\n\n| Route | What to verify |\n| --- | --- |\n| `localhost:3100` | Axis login, setup status, left navigation, and workspace clarity. |\n| `/docs` | Documentation publication center, available links, and compact lists. |\n| `/docs/framework` | Documentation navigation, page content, diagrams, tags, and search. |\n| `localhost:3200` | Nexus Online content or customer-friendly unpublished message. |\n| Agora ports | Storefront Online content or customer-friendly unpublished message. |\n\n## Business perspective\n\nThe browser journey should feel like a guided onboarding process. A user should know what is ready, what needs approval, what can be opened, and why a link is locked. Empty pages should explain the business state instead of showing broken layouts or hardcoded sample content.\n\n## Developer perspective\n\nDevelopers should verify the same route after every UI, content, publication, or import change. The browser pass should catch stale navigation, missing media, unpublished content, alignment issues, broken labels, hidden approval tasks, and actions that do nothing.\n\n## Operator perspective\n\nOperators need evidence that setup actions triggered the expected backend state. Browser checks should be paired with import history, publication state, approval tasks, logs, and API status when a failure appears.\n\n## Operational evidence\n\nBrowser acceptance should produce evidence a teammate can repeat. Record the schema state, build result, server status, logged-in role, route opened, expected state, actual state, screenshots or notes, and any backend log or API used to explain a failure. The route list should include setup pages, documentation pages, application pages, approval queues, and customer-facing unpublished states. This prevents false confidence from testing only one happy path.\n\n## Reader and implementation contract\n\nA beginner should understand the visible journey before learning internal APIs. A business user should see whether the system is usable, waiting for data, waiting for approval, or intentionally unpublished. A developer should know which route, component, content pack, media relation, and action caused the visible state. An operator should know what backend evidence to inspect when the browser result is wrong.\n\nEvery browser acceptance page must include routes, expected states, setup actions, approval or publication gates, frontend fallback behavior, and evidence. It should be updated whenever Axis, Nexus, Agora, documentation navigation, setup accelerators, media import, or publication UI changes.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Checking only the route that was changed.\n- Not using a fresh schema before claiming setup works.\n- Publishing docs but forgetting Nexus or Agora content.\n- Allowing a button to trigger work without visible progress or error detail.\n\n## Verification\n\nVerification is complete when every route either renders approved Online content or an intentional unpublished/maintenance state, all setup actions show clear progress or failure, and the user can find the next action without leaving the current workflow.\n",
      "previous": {
        "title": "Runtime Release and Rollback",
        "route": "/docs/framework/framework-runtime-release-rollback"
      },
      "next": {
        "title": "Local verification and acceptance checklist",
        "route": "/docs/framework/framework-local-verification-checklist"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 596,
        "checksum": "43bb78897c55978eebb89ab696cfbd853f46a78612f39f539c760fd2005ada84"
      },
      "slug": "framework-local-browser-acceptance-journey",
      "locale": "en",
      "navigationGroup": "Local Verification and Acceptance",
      "navigationGroupCode": "local-verification-and-acceptance",
      "navigationGroupOrder": 20,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "framework.local-verification-checklist",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record6": {
    "code": "nodicsDocsComponentframeworkLocalVerificationChecklist",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.local-verification-checklist",
      "title": "Local verification and acceptance checklist",
      "route": "/docs/framework/framework-local-verification-checklist",
      "section": "operations-monitoring-and-recovery",
      "sectionTitle": "Operations, Monitoring, and Recovery",
      "group": "operations-monitoring-and-recovery",
      "groupTitle": "Operations, Monitoring, and Recovery",
      "parentId": "operations-monitoring-and-recovery",
      "hierarchyPath": [
        "Operations, Monitoring, and Recovery",
        "Local verification and acceptance checklist"
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
      "summary": "How to prove the local framework, customer-project servers, Axis, documentation, registry, imports, WCMS, and Cron are healthy.",
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
        "framework.local-quick-start",
        "framework.devops-runtime",
        "process.qa-regression-guide",
        "framework.fresh-schema-setup-journey",
        "framework.local-browser-acceptance-journey",
        "framework.local-runtime-troubleshooting"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "operations-monitoring-and-recovery",
        "local-verification-and-acceptance",
        "local-verification-and-acceptance-checklist"
      ],
      "topicKeywords": [
        "Operations, Monitoring, and Recovery",
        "Local Verification and Acceptance",
        "Local verification and acceptance checklist"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Local Verification and Acceptance Checklist is the overview for proving a local Nodics environment after code, content, or setup changes. It keeps the high-level acceptance rules here and links the detailed browser journey to a focused page."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Acceptance flow",
          "anchor": "frameworkLocalVerificationChecklist-1-acceptance-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Clean[\"Fresh schema\"] --> Build[\"Clean build\"]\n  Build --> Start[\"Start servers\"]\n  Start --> Setup[\"Axis setup\"]\n  Setup --> Browser[\"Browser verification\"]\n  Browser --> Evidence[\"Evidence and fixes\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Check",
            "Why it matters"
          ],
          "rows": [
            [
              "Fresh schema",
              "Proves the system does not depend on old local data."
            ],
            [
              "Clean build",
              "Proves generated contracts and compiled frontend agree."
            ],
            [
              "Startup",
              "Proves topology, ports, and runtime dependencies work."
            ],
            [
              "Browser journey",
              "Proves a real user can complete setup and open applications."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "frameworkLocalVerificationChecklist-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Acceptance should answer one simple question: can a new customer or developer start from nothing and reach a working governed workspace without being lost? That means Axis must explain setup status, required imports, approval tasks, publication, Online readiness, and application links clearly."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Developer perspective",
          "anchor": "frameworkLocalVerificationChecklist-3-developer-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should run focused tests for changed modules and complete browser verification when the change affects navigation, setup, publication, content, media, roles, or storefront rendering. A passing API test is not enough when the user journey is the thing being changed."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue with",
          "anchor": "frameworkLocalVerificationChecklist-4-continue-with"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**Fresh Schema Setup Journey** for schema cleanup and first-run setup.",
            "**Local Browser Acceptance Journey** for end-to-end browser verification.",
            "**Local Runtime Troubleshooting** for common local failures."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operational evidence",
          "anchor": "frameworkLocalVerificationChecklist-5-operational-evidence"
        },
        {
          "kind": "paragraph",
          "text": "The checklist should produce a small acceptance record for every run. Include command output summary, failed and passed test suites, started ports, setup actions completed, content packs imported, approval tasks completed, applications opened, media rendered, and unresolved blockers. If the run uses a fresh schema, say so explicitly. If it reuses existing data, mark the result as limited because stale data can hide import, publication, role, and navigation defects."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "frameworkLocalVerificationChecklist-6-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand the difference between command success and journey success. A business user should know whether the setup can be completed without reading logs. A developer should know which automated checks cover the code path and which browser checks cover user experience. An operator should know how to repeat the run from a fresh schema and compare evidence between attempts."
        },
        {
          "kind": "paragraph",
          "text": "This checklist must be updated after any change to setup, import, publishing, content, media, approval tasks, left navigation, runtime configuration, or storefront rendering. The acceptance result should state what passed, what was not run, and what remains blocked by missing data or environment state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Documentation maintenance rule",
          "anchor": "frameworkLocalVerificationChecklist-7-documentation-maintenance-rule"
        },
        {
          "kind": "paragraph",
          "text": "Keep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkLocalVerificationChecklist-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Testing on a reused schema and missing initialization defects.",
            "Verifying backend endpoints but not the Axis or storefront UI.",
            "Ignoring customer-friendly empty or unpublished states.",
            "Leaving setup commands undocumented after implementation changes."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkLocalVerificationChecklist-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify local acceptance by recording commands, test results, server status, browser routes, screenshots or observations, and any remaining gaps. A business user should see a guided path; a developer should see reproducible steps; an operator should see evidence."
        }
      ],
      "searchText": "Local verification and acceptance checklist How to prove the local framework, customer-project servers, Axis, documentation, registry, imports, WCMS, and Cron are healthy. # Local verification and acceptance checklist\n\nLocal Verification and Acceptance Checklist is the overview for proving a local Nodics environment after code, content, or setup changes. It keeps the high-level acceptance rules here and links the detailed browser journey to a focused page.\n\n## Acceptance flow\n\n```mermaid\nflowchart LR\n  Clean[\"Fresh schema\"] --> Build[\"Clean build\"]\n  Build --> Start[\"Start servers\"]\n  Start --> Setup[\"Axis setup\"]\n  Setup --> Browser[\"Browser verification\"]\n  Browser --> Evidence[\"Evidence and fixes\"]\n```\n\n| Check | Why it matters |\n| --- | --- |\n| Fresh schema | Proves the system does not depend on old local data. |\n| Clean build | Proves generated contracts and compiled frontend agree. |\n| Startup | Proves topology, ports, and runtime dependencies work. |\n| Browser journey | Proves a real user can complete setup and open applications. |\n\n## Business perspective\n\nAcceptance should answer one simple question: can a new customer or developer start from nothing and reach a working governed workspace without being lost? That means Axis must explain setup status, required imports, approval tasks, publication, Online readiness, and application links clearly.\n\n## Developer perspective\n\nDevelopers should run focused tests for changed modules and complete browser verification when the change affects navigation, setup, publication, content, media, roles, or storefront rendering. A passing API test is not enough when the user journey is the thing being changed.\n\n## Continue with\n\n- **Fresh Schema Setup Journey** for schema cleanup and first-run setup.\n- **Local Browser Acceptance Journey** for end-to-end browser verification.\n- **Local Runtime Troubleshooting** for common local failures.\n\n## Operational evidence\n\nThe checklist should produce a small acceptance record for every run. Include command output summary, failed and passed test suites, started ports, setup actions completed, content packs imported, approval tasks completed, applications opened, media rendered, and unresolved blockers. If the run uses a fresh schema, say so explicitly. If it reuses existing data, mark the result as limited because stale data can hide import, publication, role, and navigation defects.\n\n## Reader and implementation contract\n\nA beginner should understand the difference between command success and journey success. A business user should know whether the setup can be completed without reading logs. A developer should know which automated checks cover the code path and which browser checks cover user experience. An operator should know how to repeat the run from a fresh schema and compare evidence between attempts.\n\nThis checklist must be updated after any change to setup, import, publishing, content, media, approval tasks, left navigation, runtime configuration, or storefront rendering. The acceptance result should state what passed, what was not run, and what remains blocked by missing data or environment state.\n\n## Documentation maintenance rule\n\nKeep this topic current whenever implementation, configuration, Axis workflow, publication behavior, or customer-facing rendering changes. The page should remain small enough to scan, but it must still carry enough business context, technical ownership, customization guidance, visual structure, operational evidence, and verification detail for a reader to act without guessing. When the detail becomes too large, create a sibling topic and link it from this page instead of turning the overview back into a long mixed article.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Testing on a reused schema and missing initialization defects.\n- Verifying backend endpoints but not the Axis or storefront UI.\n- Ignoring customer-friendly empty or unpublished states.\n- Leaving setup commands undocumented after implementation changes.\n\n## Verification\n\nVerify local acceptance by recording commands, test results, server status, browser routes, screenshots or observations, and any remaining gaps. A business user should see a guided path; a developer should see reproducible steps; an operator should see evidence.\n",
      "previous": {
        "title": "Local Browser Acceptance Journey",
        "route": "/docs/framework/framework-local-browser-acceptance-journey"
      },
      "next": {
        "title": "Commerce enterprise operations and migration",
        "route": "/docs/framework/commerce-enterprise-operations"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 581,
        "checksum": "595821b35b24e1894280b5b143cc5edd17555e4116c0c9937d66b1d45babe972"
      },
      "slug": "framework-local-verification-checklist",
      "locale": "en",
      "navigationGroup": "Local Verification and Acceptance",
      "navigationGroupCode": "local-verification-and-acceptance",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.local-quick-start",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.devops-runtime",
          "owner": "nTooling"
        },
        {
          "documentId": "process.qa-regression-guide",
          "owner": "workflow"
        },
        {
          "documentId": "framework.fresh-schema-setup-journey",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-browser-acceptance-journey",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.local-runtime-troubleshooting",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record7": {
    "code": "nodicsDocsComponentframeworkReleaseUpgradeCompatibility",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "framework.release-upgrade-compatibility",
      "title": "Release and Upgrade Compatibility",
      "route": "/docs/framework/framework-release-upgrade-compatibility",
      "section": "release-staging-and-publication",
      "sectionTitle": "Release, Staging, and Publication",
      "group": "release-staging-and-publication",
      "groupTitle": "Release, Staging, and Publication",
      "parentId": "release-staging-and-publication",
      "hierarchyPath": [
        "Release, Staging, and Publication",
        "Release and Upgrade Compatibility"
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
      "summary": "How data release folders, generated manifests, immutable baselines, upgrades, rollback, checksum drift, and customer extensions are governed.",
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
        "data.import-export-migration",
        "docs.documentation-publishing-runbook",
        "framework.runtime-release-rollback"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "../nSetup/package.json",
        "../nData/nImport/import/src/service/release/defaultDataReleaseService.js",
        "../nData/nImport/import/test/importUtilityReleaseOrder.test.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "release",
        "upgrade",
        "manifest",
        "compatibility",
        "data-folder"
      ],
      "topicKeywords": [
        "Release, Staging, and Publication",
        "Release Compatibility",
        "Release and Upgrade Compatibility"
      ],
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
        },
        {
          "text": "Code and contract compatibility",
          "anchor": "frameworkReleaseUpgradeCompatibility-10-code-and-contract-compatibility",
          "level": 2
        },
        {
          "text": "Security boundaries under customization",
          "anchor": "frameworkReleaseUpgradeCompatibility-11-security-boundaries-under-customization",
          "level": 2
        },
        {
          "text": "Explaining an effective runtime",
          "anchor": "frameworkReleaseUpgradeCompatibility-12-explaining-an-effective-runtime",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Release compatibility covers immutable source bytes, installed data, effective code/configuration and customer extension contracts. The explicit mutable development baseline is version0.0.0; a v001 folder name alone is not permission to rewrite an installed non-development release. Forward releases retain historical source roots and exact identities rather than legalize drift by regenerating old checksums. For beginners, inspect the installed release identity and checksum before editing data. Work through the separate development-baseline and installed-to-forward upgrade examples, recording the exact selection and outcome. Decide which recovery surface is involved before taking action: restoring an Online pointer is not undoing imported transactions, code changes or external effects."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "frameworkReleaseUpgradeCompatibility-1-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Setup governance module",
              "`../nSetup/package.json`"
            ],
            [
              "Documentation composition manifest",
              "`../../../nodics.docs/data/manifest.json`"
            ],
            [
              "Data import release service",
              "`../nData/nImport/import/src/service/release/defaultDataReleaseService.js`"
            ],
            [
              "Import release ordering tests",
              "`../nData/nImport/import/test/importUtilityReleaseOrder.test.js`"
            ],
            [
              "Data authoring guide",
              "Canonical guide `data.import-export-migration`"
            ],
            [
              "Documentation publishing runbook",
              "Canonical guide `docs.documentation-publishing-runbook`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Folder contract",
          "anchor": "frameworkReleaseUpgradeCompatibility-2-folder-contract"
        },
        {
          "kind": "code",
          "language": "text",
          "text": "data/\n  init-v001/\n    headers/\n    records/\n  core-v001/\n    headers/\n    records/\n  sample-v001/\n    commerce/\n      headers/\n      records/\n    content/\n      headers/\n      records/\n      assets/\n  manifest.json"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is upgrade confidence. Business users need stable setup and sample data. Developers need a predictable place to add defaults and customer extensions. Operators need checksum and import evidence. Production support needs to know whether a customer installed `core-v001` or `core-v002` before diagnosing a problem."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Compatibility rules",
          "anchor": "frameworkReleaseUpgradeCompatibility-3-compatibility-rules"
        },
        {
          "kind": "table",
          "headers": [
            "Rule",
            "Actual owner behavior"
          ],
          "rows": [
            [
              "Development baseline",
              "isDevelopmentRelease matches only version0.0.0; project manifest tooling may refresh explicitly declared development file checksums."
            ],
            [
              "Installed non-development release",
              "Same version with changed checksum rejects ERR_IMP_00003; catalogue marks drift INVALID_RELEASE. Restore original bytes; do not regenerate frozen hashes."
            ],
            [
              "Forward release",
              "Newer semantic version and dataType-vNNN source sequence; preserve existing section identity and immutable prior root."
            ],
            [
              "Downgrade",
              "Catalogue may show DOWNGRADE_AVAILABLE; execution rejects unless data.dataReleases.allowDowngrade is explicitly true. This policy is not a data rollback guarantee."
            ],
            [
              "Manifest ownership",
              "nTooling plans declared module manifests; nImport validates checksums, retained roots, destinations and header target owners before effects."
            ],
            [
              "Records/headers",
              "Declarative records plus owner schema/operation/query headers; generated metadata does not authorize business mutations/publication."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "DefaultProjectDataManifestService.planForwardRelease requires a contractVersion2 DATA_RELEASE section, newer version and source sequence, no active/retained root conflict, nonempty new payload and unchanged prior declared files. It retains old root files/section definitions and revalidates retainedRoots. A normal manifest refresh rejects immutable drift before any write."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Configuration behavior",
          "anchor": "frameworkReleaseUpgradeCompatibility-4-configuration-behavior"
        },
        {
          "kind": "paragraph",
          "text": "Release configuration should describe active modules, target runtimes, import lanes, and provider settings, but it should not replace the release folder. The folder owns versioned data, the generated manifest owns checksums, and runtime configuration selects where that data is installed and published."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Upgrade flow",
          "anchor": "frameworkReleaseUpgradeCompatibility-5-upgrade-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Installed[\"Read installed exact identity/version/checksum\"] --> Forward[\"Author new owner release, retain old root\"]\n  Forward --> Plan[\"Validate manifest, selection and target owners\"]\n  Plan --> Upgrade[\"Explicit authorized installed upgrade\"]\n  Upgrade --> Reconcile[\"Inspect installation and import-run evidence\"]\n  Reconcile --> Review[\"Separate normal owner publication and client qualification\"]"
        },
        {
          "kind": "paragraph",
          "text": "Worked operator scenario, not a recorded execution: an existing core DATA_RELEASE section is installed at version1.0.0/sourceRoot core-v001 with checksum H1. A legitimate successor keeps its releaseCode/section identity, selects core-v002/version1.1.0 with checksum H2, and retains core-v001 bytes. H1/H2 are symbolic values, not fabricated digest evidence. getCatalogue on the exact environment/tenant/runtime should show installedVersion1.0.0/installedChecksum H1 and available version1.1.0/checksum H2 with UPDATE_AVAILABLE. A fresh install instead starts NOT_INSTALLED and does not prove upgrade compatibility."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "// Illustrative service request; trusted tenant/authData come from the existing owner boundary.\nconst selection = {\n  dataType: 'core',\n  releaseCodes: ['exampleCore'],\n  expectedReleases: { exampleCore: '1.1.0' }\n};\n// Pass as request.releaseRequest to DefaultDataReleaseService.preflight.\n// Only an explicitly authorized operator later calls execute with the same selection."
        },
        {
          "kind": "paragraph",
          "text": "Replace exampleCore with the catalogue's exact releaseCode, not a guessed module/folder alias. expectedReleases checks version, not a caller-provided digest signature: compare current checksum and source identity with the retained reviewed evidence, and re-review any change. The planner resolves active/explicit contributions in owner order, enforces type/destination/environment policy and validates every enabled header target through its capability owner. Multiple owned releases require explicit selection; wrong version, unavailable owner/target, invalid manifest or excluded destination rejects before effects."
        },
        {
          "kind": "table",
          "headers": [
            "Step",
            "Evidence to obtain through normal owner APIs"
          ],
          "rows": [
            [
              "Before execution",
              "Exact releaseCode/sectionCode/module, dataType, version/checksum, sourceRoot, installed version/checksum, tenant/environment/runtime/destination and target-validation outcome."
            ],
            [
              "After authorized upgrade",
              "Installation moves RUNNING to CURRENT; response releases plus importRun/importRuns identify actual owner execution. Re-read catalogue: installedVersion1.1.0 and installedChecksum H2 should match available identity/status CURRENT."
            ],
            [
              "Partial/failed/uncertain run",
              "Retain exact secured run metadata and installation attempt status; reconcile successful writes and unchanged source before an explicit owner retry. Counts or a generic success envelope alone are not immutable installation proof."
            ],
            [
              "Publishable results",
              "Normal domain validation/approval/publication is separate; import CURRENT does not grant approval or public-delivery acceptance."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A FAILED release retry can re-evaluate successful rows and needs existing generated revision/owner idempotency qualification; it is not guaranteed row-level resume. CURRENT releases are skipped and a RUNNING receipt cannot be taken over merely after a timeout. Do not reset successful writes, force-current, invent receipts or rewrite installed state to clear an incident."
        },
        {
          "kind": "paragraph",
          "text": "Separate development scenario: the explicitly declared version0.0.0 baseline changes from Hdev1 to Hdev2. Owner manifest tooling may refresh that declared baseline and catalogue can show UPDATE_AVAILABLE at the same version. This exception is not a blanket pre-production v001 allowance and must not be applied to retained/frozen release bytes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "frameworkReleaseUpgradeCompatibility-6-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Create a legitimate forward owner release or a project-owned extension module retaining canonical ownership/section identity; do not patch frozen framework data, even for a documented repair. Preserve lower-layer immutable sources and delta semantics, headers, target validation and normal domain approval. A method override belongs in later active source, not an executable release record. Qualify the actual customer overlay after selected-server generation/restart against both old/new contracts."
        },
        {
          "kind": "table",
          "headers": [
            "Recovery surface",
            "Decision boundary"
          ],
          "rows": [
            [
              "Published domain version",
              "DefaultPublicationLifecycleService.rollback delegates to its domain version provider using the retained previous version, then owner afterRollback hooks. It does not undo imports, schema migration, external effects or deployed code."
            ],
            [
              "Code/configuration",
              "Use deployment-owned artifact/config rollback plus selected-server rebuild/restart and compatibility qualification; a content pointer cannot restore service behavior."
            ],
            [
              "Imported or migrated data",
              "Owner reconciliation, backup/restore or a forward corrective migration/release is required. Confirm irreversible side effects and preserved successful writes before any compensation."
            ],
            [
              "External/customer effects",
              "Use that business owner's recovery contract and retained evidence; neither version downgrade nor manifest regeneration reverses them."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Implementation handoff",
          "anchor": "frameworkReleaseUpgradeCompatibility-7-implementation-handoff"
        },
        {
          "kind": "paragraph",
          "text": "Every release handoff should name the changed folders, generated manifest, target runtimes, import order, publication dependency, rollback option, and browser evidence. Business users get a clear upgrade journey, developers get source traceability, operators get production recovery instructions, and QA owners get clean-install plus upgrade scenarios. This prevents a data release from becoming tribal knowledge."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "frameworkReleaseUpgradeCompatibility-8-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Editing an already released data folder and losing reproducibility.",
            "Creating `release.js` files for values that can be derived from folder names.",
            "Hand maintaining generated manifest checksums.",
            "Putting provider-specific paths inside shared data records.",
            "Forgetting fresh-schema import tests before upgrade rollout."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "frameworkReleaseUpgradeCompatibility-9-verification"
        },
        {
          "kind": "paragraph",
          "text": "Qualification must cover clean install and an installed vN-to-vN+1 upgrade, retained-root validation, same-version drift refusal, wrong version/target/destination denial, partial failure/retry, checksum-bound installation evidence and actual customer overlays. Independently qualify publication rollback, code/config rollback and data recovery; do not collapse them into one command."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Code and contract compatibility",
          "anchor": "frameworkReleaseUpgradeCompatibility-10-code-and-contract-compatibility"
        },
        {
          "kind": "paragraph",
          "text": "Compatibility also covers partner code and running clients. Before changing an extension point, identify its consumers and write an old/new example. Validate the framework default and the actual partner override after regeneration and restart. A later file replaces matching methods; it does not replace every method of the service or acquire ownership of the capability."
        },
        {
          "kind": "table",
          "headers": [
            "Contract surface",
            "Required compatibility evidence"
          ],
          "rows": [
            [
              "Exported methods",
              "Parameters, results, awaited completion, errors and side effects remain usable by inherited and overriding methods."
            ],
            [
              "Configuration",
              "Owner, default, scope, merge behavior, disabled values, binding resolution and restart/refresh semantics are explicit."
            ],
            [
              "Schemas and APIs",
              "Stable identity, validation, permissions, tenant isolation, response envelopes and supported operations match every migrated client."
            ],
            [
              "Events",
              "Existing consumers understand payloads, delivery/retry behavior, deduplication and ordering limits."
            ],
            [
              "Cache/database providers",
              "Isolation, serialization, expiry, atomic mutation, failure and cleanup match the owner contract."
            ],
            [
              "Persisted records",
              "A governed migration covers existing values, replay, partial failure, audit and irreversible effects."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "Do not infer compatibility from an unchanged method name or a new package version. A new optional field can still break a strict consumer. A changed permission can still remove an employee workflow. Removing a route requires migrating all known clients and rejecting the obsolete path explicitly."
        },
        {
          "kind": "paragraph",
          "text": "The current unreleased MongoDB `schemaProperties` conversion requires replacing arrays with keyed booleans. Arrays reject instead of silently dropping validation. For example, migrate `['enum', 'minimum']` to `{ enum: true, minimum: true }`; a later `{ minimum: false }` disables only that key. This does not change ordinary `properties.js` arrays, which merge by index, or the separately governed data-record array replacement contract."
        },
        {
          "kind": "paragraph",
          "text": "Source data keys remain stable within their owning dataset. A partner can change a field under an existing exported record key without restating its code. Changing the business code is a data migration decision, not a rename instruction inferred from source merging. Released manifests/checksums remain immutable; execute any upgrade through the existing import receipts and replay rules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Security boundaries under customization",
          "anchor": "frameworkReleaseUpgradeCompatibility-11-security-boundaries-under-customization"
        },
        {
          "kind": "paragraph",
          "text": "A custom implementation must preserve authorization, tenant and enterprise isolation, domain validation, API contracts, required confirmation, idempotency and audit. Project JavaScript is trusted deployment code: Nodics extension seams do not make malicious overrides impossible. Qualification must exercise the effective override with forbidden identities, wrong tenant/module/instance, invalid data, duplicate requests, interrupted work and unavailable providers."
        },
        {
          "kind": "paragraph",
          "text": "For a cache change, retain atomic version allocation and fail-closed authentication state. For a Workflow change, refuse new work after deactivation while following the owning recovery contract for admitted work. For an Axis form change, retain backend permissions and validation even when the browser hides a control."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Explaining an effective runtime",
          "anchor": "frameworkReleaseUpgradeCompatibility-12-explaining-an-effective-runtime"
        },
        {
          "kind": "paragraph",
          "text": "Use the selected server's existing governance report and its runtime coordinates. The report now reads `xNodics.overrideTrace` from the actual loaded artifacts. Generated baseline contributions precede authored layers; `memberOrigins` shows which contributor supplied each inherited or replaced method. The first source path is not necessarily the capability owner; retain the schema/module metadata as ownership authority. Nested property origins are not inferred from a whole-file winner."
        },
        {
          "kind": "paragraph",
          "text": "For configuration, follow indexed property contributions, external files and tenant overlays and inspect only the affected effective key in a trusted context. Never publish a raw configuration dump. A source/configuration edit follows its own build/restart path. A governed runtime schema/router/class change uses nDynamo preview, approval/activation, revision checks and audit. Provider selection and remote routing remain with the existing cache/database/router owners."
        },
        {
          "kind": "paragraph",
          "text": "A useful incident record names the runtime, capability owner, effective method or key, contributing layers, selected provider/remote authority, change mechanism and stable failure code. It contains no token, API key, password or function body."
        }
      ],
      "searchText": "Release and Upgrade Compatibility How data release folders, generated manifests, immutable baselines, upgrades, rollback, checksum drift, and customer extensions are governed. # Release and Upgrade Compatibility\n\nRelease compatibility covers immutable source bytes, installed data, effective code/configuration and customer extension contracts. The explicit mutable development baseline is version0.0.0; a v001 folder name alone is not permission to rewrite an installed non-development release. Forward releases retain historical source roots and exact identities rather than legalize drift by regenerating old checksums. For beginners, inspect the installed release identity and checksum before editing data. Work through the separate development-baseline and installed-to-forward upgrade examples, recording the exact selection and outcome. Decide which recovery surface is involved before taking action: restoring an Online pointer is not undoing imported transactions, code changes or external effects.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Setup governance module | `../nSetup/package.json` |\n| Documentation composition manifest | `../../../nodics.docs/data/manifest.json` |\n| Data import release service | `../nData/nImport/import/src/service/release/defaultDataReleaseService.js` |\n| Import release ordering tests | `../nData/nImport/import/test/importUtilityReleaseOrder.test.js` |\n| Data authoring guide | Canonical guide `data.import-export-migration` |\n| Documentation publishing runbook | Canonical guide `docs.documentation-publishing-runbook` |\n\n## Folder contract\n\n```text\ndata/\n  init-v001/\n    headers/\n    records/\n  core-v001/\n    headers/\n    records/\n  sample-v001/\n    commerce/\n      headers/\n      records/\n    content/\n      headers/\n      records/\n      assets/\n  manifest.json\n```\n\nThe business problem is upgrade confidence. Business users need stable setup and sample data. Developers need a predictable place to add defaults and customer extensions. Operators need checksum and import evidence. Production support needs to know whether a customer installed `core-v001` or `core-v002` before diagnosing a problem.\n\n## Compatibility rules\n\n| Rule | Actual owner behavior |\n| --- | --- |\n| Development baseline | isDevelopmentRelease matches only version0.0.0; project manifest tooling may refresh explicitly declared development file checksums. |\n| Installed non-development release | Same version with changed checksum rejects ERR_IMP_00003; catalogue marks drift INVALID_RELEASE. Restore original bytes; do not regenerate frozen hashes. |\n| Forward release | Newer semantic version and dataType-vNNN source sequence; preserve existing section identity and immutable prior root. |\n| Downgrade | Catalogue may show DOWNGRADE_AVAILABLE; execution rejects unless data.dataReleases.allowDowngrade is explicitly true. This policy is not a data rollback guarantee. |\n| Manifest ownership | nTooling plans declared module manifests; nImport validates checksums, retained roots, destinations and header target owners before effects. |\n| Records/headers | Declarative records plus owner schema/operation/query headers; generated metadata does not authorize business mutations/publication. |\n\nDefaultProjectDataManifestService.planForwardRelease requires a contractVersion2 DATA_RELEASE section, newer version and source sequence, no active/retained root conflict, nonempty new payload and unchanged prior declared files. It retains old root files/section definitions and revalidates retainedRoots. A normal manifest refresh rejects immutable drift before any write.\n\n## Configuration behavior\n\nRelease configuration should describe active modules, target runtimes, import lanes, and provider settings, but it should not replace the release folder. The folder owns versioned data, the generated manifest owns checksums, and runtime configuration selects where that data is installed and published.\n\n## Upgrade flow\n\n```mermaid\nflowchart LR\n  Installed[\"Read installed exact identity/version/checksum\"] --> Forward[\"Author new owner release, retain old root\"]\n  Forward --> Plan[\"Validate manifest, selection and target owners\"]\n  Plan --> Upgrade[\"Explicit authorized installed upgrade\"]\n  Upgrade --> Reconcile[\"Inspect installation and import-run evidence\"]\n  Reconcile --> Review[\"Separate normal owner publication and client qualification\"]\n```\n\nWorked operator scenario, not a recorded execution: an existing core DATA_RELEASE section is installed at version1.0.0/sourceRoot core-v001 with checksum H1. A legitimate successor keeps its releaseCode/section identity, selects core-v002/version1.1.0 with checksum H2, and retains core-v001 bytes. H1/H2 are symbolic values, not fabricated digest evidence. getCatalogue on the exact environment/tenant/runtime should show installedVersion1.0.0/installedChecksum H1 and available version1.1.0/checksum H2 with UPDATE_AVAILABLE. A fresh install instead starts NOT_INSTALLED and does not prove upgrade compatibility.\n\n```js\n// Illustrative service request; trusted tenant/authData come from the existing owner boundary.\nconst selection = {\n  dataType: 'core',\n  releaseCodes: ['exampleCore'],\n  expectedReleases: { exampleCore: '1.1.0' }\n};\n// Pass as request.releaseRequest to DefaultDataReleaseService.preflight.\n// Only an explicitly authorized operator later calls execute with the same selection.\n```\n\nReplace exampleCore with the catalogue's exact releaseCode, not a guessed module/folder alias. expectedReleases checks version, not a caller-provided digest signature: compare current checksum and source identity with the retained reviewed evidence, and re-review any change. The planner resolves active/explicit contributions in owner order, enforces type/destination/environment policy and validates every enabled header target through its capability owner. Multiple owned releases require explicit selection; wrong version, unavailable owner/target, invalid manifest or excluded destination rejects before effects.\n\n| Step | Evidence to obtain through normal owner APIs |\n| --- | --- |\n| Before execution | Exact releaseCode/sectionCode/module, dataType, version/checksum, sourceRoot, installed version/checksum, tenant/environment/runtime/destination and target-validation outcome. |\n| After authorized upgrade | Installation moves RUNNING to CURRENT; response releases plus importRun/importRuns identify actual owner execution. Re-read catalogue: installedVersion1.1.0 and installedChecksum H2 should match available identity/status CURRENT. |\n| Partial/failed/uncertain run | Retain exact secured run metadata and installation attempt status; reconcile successful writes and unchanged source before an explicit owner retry. Counts or a generic success envelope alone are not immutable installation proof. |\n| Publishable results | Normal domain validation/approval/publication is separate; import CURRENT does not grant approval or public-delivery acceptance. |\n\nA FAILED release retry can re-evaluate successful rows and needs existing generated revision/owner idempotency qualification; it is not guaranteed row-level resume. CURRENT releases are skipped and a RUNNING receipt cannot be taken over merely after a timeout. Do not reset successful writes, force-current, invent receipts or rewrite installed state to clear an incident.\n\nSeparate development scenario: the explicitly declared version0.0.0 baseline changes from Hdev1 to Hdev2. Owner manifest tooling may refresh that declared baseline and catalogue can show UPDATE_AVAILABLE at the same version. This exception is not a blanket pre-production v001 allowance and must not be applied to retained/frozen release bytes.\n\n## Customization and extension guidance\n\nCreate a legitimate forward owner release or a project-owned extension module retaining canonical ownership/section identity; do not patch frozen framework data, even for a documented repair. Preserve lower-layer immutable sources and delta semantics, headers, target validation and normal domain approval. A method override belongs in later active source, not an executable release record. Qualify the actual customer overlay after selected-server generation/restart against both old/new contracts.\n\n| Recovery surface | Decision boundary |\n| --- | --- |\n| Published domain version | DefaultPublicationLifecycleService.rollback delegates to its domain version provider using the retained previous version, then owner afterRollback hooks. It does not undo imports, schema migration, external effects or deployed code. |\n| Code/configuration | Use deployment-owned artifact/config rollback plus selected-server rebuild/restart and compatibility qualification; a content pointer cannot restore service behavior. |\n| Imported or migrated data | Owner reconciliation, backup/restore or a forward corrective migration/release is required. Confirm irreversible side effects and preserved successful writes before any compensation. |\n| External/customer effects | Use that business owner's recovery contract and retained evidence; neither version downgrade nor manifest regeneration reverses them. |\n\n## Implementation handoff\n\nEvery release handoff should name the changed folders, generated manifest, target runtimes, import order, publication dependency, rollback option, and browser evidence. Business users get a clear upgrade journey, developers get source traceability, operators get production recovery instructions, and QA owners get clean-install plus upgrade scenarios. This prevents a data release from becoming tribal knowledge.\n\n## Common mistakes\n\n- Editing an already released data folder and losing reproducibility.\n- Creating `release.js` files for values that can be derived from folder names.\n- Hand maintaining generated manifest checksums.\n- Putting provider-specific paths inside shared data records.\n- Forgetting fresh-schema import tests before upgrade rollout.\n\n## Verification\n\nQualification must cover clean install and an installed vN-to-vN+1 upgrade, retained-root validation, same-version drift refusal, wrong version/target/destination denial, partial failure/retry, checksum-bound installation evidence and actual customer overlays. Independently qualify publication rollback, code/config rollback and data recovery; do not collapse them into one command.\n\n## Code and contract compatibility\n\nCompatibility also covers partner code and running clients. Before changing an extension point, identify its consumers and write an old/new example. Validate the framework default and the actual partner override after regeneration and restart. A later file replaces matching methods; it does not replace every method of the service or acquire ownership of the capability.\n\n| Contract surface | Required compatibility evidence |\n| --- | --- |\n| Exported methods | Parameters, results, awaited completion, errors and side effects remain usable by inherited and overriding methods. |\n| Configuration | Owner, default, scope, merge behavior, disabled values, binding resolution and restart/refresh semantics are explicit. |\n| Schemas and APIs | Stable identity, validation, permissions, tenant isolation, response envelopes and supported operations match every migrated client. |\n| Events | Existing consumers understand payloads, delivery/retry behavior, deduplication and ordering limits. |\n| Cache/database providers | Isolation, serialization, expiry, atomic mutation, failure and cleanup match the owner contract. |\n| Persisted records | A governed migration covers existing values, replay, partial failure, audit and irreversible effects. |\n\nDo not infer compatibility from an unchanged method name or a new package version. A new optional field can still break a strict consumer. A changed permission can still remove an employee workflow. Removing a route requires migrating all known clients and rejecting the obsolete path explicitly.\n\nThe current unreleased MongoDB `schemaProperties` conversion requires replacing arrays with keyed booleans. Arrays reject instead of silently dropping validation. For example, migrate `['enum', 'minimum']` to `{ enum: true, minimum: true }`; a later `{ minimum: false }` disables only that key. This does not change ordinary `properties.js` arrays, which merge by index, or the separately governed data-record array replacement contract.\n\nSource data keys remain stable within their owning dataset. A partner can change a field under an existing exported record key without restating its code. Changing the business code is a data migration decision, not a rename instruction inferred from source merging. Released manifests/checksums remain immutable; execute any upgrade through the existing import receipts and replay rules.\n\n## Security boundaries under customization\n\nA custom implementation must preserve authorization, tenant and enterprise isolation, domain validation, API contracts, required confirmation, idempotency and audit. Project JavaScript is trusted deployment code: Nodics extension seams do not make malicious overrides impossible. Qualification must exercise the effective override with forbidden identities, wrong tenant/module/instance, invalid data, duplicate requests, interrupted work and unavailable providers.\n\nFor a cache change, retain atomic version allocation and fail-closed authentication state. For a Workflow change, refuse new work after deactivation while following the owning recovery contract for admitted work. For an Axis form change, retain backend permissions and validation even when the browser hides a control.\n\n## Explaining an effective runtime\n\nUse the selected server's existing governance report and its runtime coordinates. The report now reads `xNodics.overrideTrace` from the actual loaded artifacts. Generated baseline contributions precede authored layers; `memberOrigins` shows which contributor supplied each inherited or replaced method. The first source path is not necessarily the capability owner; retain the schema/module metadata as ownership authority. Nested property origins are not inferred from a whole-file winner.\n\nFor configuration, follow indexed property contributions, external files and tenant overlays and inspect only the affected effective key in a trusted context. Never publish a raw configuration dump. A source/configuration edit follows its own build/restart path. A governed runtime schema/router/class change uses nDynamo preview, approval/activation, revision checks and audit. Provider selection and remote routing remain with the existing cache/database/router owners.\n\nA useful incident record names the runtime, capability owner, effective method or key, contributing layers, selected provider/remote authority, change mechanism and stable failure code. It contains no token, API key, password or function body.\n",
      "previous": {
        "title": "CronJob Data Authoring",
        "route": "/docs/framework/process-cronjob-data-authoring"
      },
      "next": {
        "title": "Fulfillment Core Source Map",
        "route": "/docs/framework/commerce-fulfillment-core-source-map"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 1807,
        "checksum": "0f48fb26774900c53a5350ec9a00b72df89ccf7662db450dbec26abeff53f9bb"
      },
      "slug": "framework-release-upgrade-compatibility",
      "locale": "en",
      "navigationGroup": "Release Compatibility",
      "navigationGroupCode": "release-compatibility",
      "navigationGroupOrder": 20,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "data.import-export-migration",
          "owner": "import"
        },
        {
          "documentId": "docs.documentation-publishing-runbook",
          "owner": "nodics.docs"
        },
        {
          "documentId": "framework.runtime-release-rollback",
          "owner": "nTooling"
        }
      ]
    },
    "active": true
  },
  "record8": {
    "code": "nodicsDocsComponenttoolingAiDeveloperEnablement",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "tooling.ai-developer-enablement",
      "title": "AI and Developer Tooling",
      "route": "/docs/framework/tooling-ai-developer-enablement",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "AI and Developer Tooling"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "How AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely.",
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
        "framework.capability-documentation-maturity-pattern",
        "docs.documentation-roadmap",
        "pipeline.business-logic-orchestration"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "configuration-table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "ai-and-developer-tooling",
        "ai-and-developer-enablement",
        "ai-and-developer-tooling"
      ],
      "topicKeywords": [
        "AI and Developer Tooling",
        "AI and Developer Enablement",
        "AI and Developer Tooling"
      ],
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
        },
        {
          "text": "Final review before completion",
          "anchor": "toolingAiDeveloperEnablement-8-final-review-before-completion",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "How AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs."
        },
        {
          "kind": "paragraph",
          "text": "AI and developer automation can accelerate delivery, but it can also invent owners, bypass contracts, overwrite user changes, or generate shallow documentation if rules are not executable. Nodics keeps AI enablement as contracts, templates, quality checks, source maps, and validation scripts. Generated documentation must follow the same business, technical, visual, and audit principles every time."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business context",
          "anchor": "toolingAiDeveloperEnablement-1-business-context"
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
              "AI and developer automation can accelerate delivery, but it can also invent owners, bypass contracts, overwrite user changes, or generate shallow documentation if rules are not executable."
            ],
            [
              "Who uses it?",
              "Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools."
            ],
            [
              "What changes can it support?",
              "Nodics keeps AI enablement as contracts, templates, quality checks, source maps, and validation scripts. Generated documentation must follow the same business, technical, visual, and audit principles every time."
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
          "anchor": "toolingAiDeveloperEnablement-2-journey-and-ownership"
        },
        {
          "kind": "paragraph",
          "text": "nSetup and nTooling own AI contracts, generation templates, quality validators, and release checks. Functional modules own the implementation facts being documented. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state."
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
              "AI and Developer Tooling",
              "Used in navigation and dashboards so readers are not exposed to raw module names first."
            ],
            [
              "Source owner",
              "nodics.foundation",
              "Carries exact implementation, documentation, and validation evidence."
            ],
            [
              "Technical module",
              "nSetup",
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
          "anchor": "toolingAiDeveloperEnablement-3-data-and-configuration-detail"
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
          "text": "documentationImpact: { requiresBusinessView: true, requiresVisuals: true, requiresSourceMap: true, validation: \"blocking\" }"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "toolingAiDeveloperEnablement-4-customization-and-extension"
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
          "anchor": "toolingAiDeveloperEnablement-5-operations-and-governance"
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
          "anchor": "toolingAiDeveloperEnablement-6-common-mistakes"
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
          "anchor": "toolingAiDeveloperEnablement-7-verification"
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
          "text": "Final review before completion",
          "anchor": "toolingAiDeveloperEnablement-8-final-review-before-completion"
        },
        {
          "kind": "paragraph",
          "text": "A developer must verify where each change belongs and what behavior it adds before closing the work or moving to live acceptance and release. Keep the review decision in the existing canonical checklist. Passing tests alone does not establish that configuration ownership, file placement or scope is correct."
        },
        {
          "kind": "paragraph",
          "text": "Record the starting revision and existing work, account for every changed file, inspect the semantic diff with formatting noise removed, and map each artifact to its existing capability or customer/deployment owner. Configuration review also checks active module order, real consumers, collection semantics and later overrides. List incidental repairs, pre-existing defects and excluded external or persisted settings separately. Matching identifiers in a callback do not prove the owning workflow approved its mutation."
        },
        {
          "kind": "paragraph",
          "text": "For a repository-wide placement claim, account for every tracked and relevant untracked path. Label automated inventory and manual semantic review separately. Record PASS or FAIL with concrete evidence; unresolved required findings keep the gate open. The principle audit protects discovery of the rule but cannot certify that this review has been performed."
        },
        {
          "kind": "paragraph",
          "text": "The canonical procedure is `nodics.foundation/modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review`."
        }
      ],
      "searchText": "AI and Developer Tooling How AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely. # AI and Developer Tooling\n\nHow AI tools, developers, and reviewers use contracts, source maps, generated context, quality gates, and documentation principles safely. This page is intentionally written for beginners, business users, developers, operators, architects, QA owners, and AI tools. It explains the business problem first, then the technical ownership model, then the exact customization and verification responsibilities so nobody has to guess where a change belongs.\n\nAI and developer automation can accelerate delivery, but it can also invent owners, bypass contracts, overwrite user changes, or generate shallow documentation if rules are not executable. Nodics keeps AI enablement as contracts, templates, quality checks, source maps, and validation scripts. Generated documentation must follow the same business, technical, visual, and audit principles every time.\n\n## Business context\n\nFor a business user, this topic answers what decision can be made, which operational journey is supported, and what risk is reduced. The practical value is faster delivery without losing governance: teams can understand the current capability, decide whether it applies to their project, and know when Axis, Nexus, content catalog, workflow, or runtime services are involved.\n\nFor beginners, the mental model is simple: the page title is the business capability, the table identifies who owns each part, and the diagram shows how a request or change flows. A reader should not need source-code knowledge to understand the journey, but the developer path is still available when customization is needed.\n\n| Business question | Answer for this topic |\n| --- | --- |\n| What problem does it solve? | AI and developer automation can accelerate delivery, but it can also invent owners, bypass contracts, overwrite user changes, or generate shallow documentation if rules are not executable. |\n| Who uses it? | Business users, administrators, developers, operators, QA owners, implementation partners, and AI-assisted delivery tools. |\n| What changes can it support? | Nodics keeps AI enablement as contracts, templates, quality checks, source maps, and validation scripts. Generated documentation must follow the same business, technical, visual, and audit principles every time. |\n| What must be governed? | Permissions, validation, source ownership, publication state, runtime impact, audit evidence, and rollback boundaries. |\n\n## Journey and ownership\n\nnSetup and nTooling own AI contracts, generation templates, quality validators, and release checks. Functional modules own the implementation facts being documented. This keeps the reader-facing name friendly while preserving exact source ownership for developers and AI tools. Axis may render management screens or authenticated documentation, Nexus may render public Online content, and the backend content catalog remains authoritative for navigation, pages, access policies, and publication state.\n\n```mermaid\nflowchart LR\n  Reader[\"Business or developer request\"] --> Axis[\"Axis or Nexus view\"]\n  Axis --> Backend[\"Owning backend capability\"]\n  Backend --> Catalog[\"Content/catalog/schema/config records\"]\n  Catalog --> Runtime[\"Runtime behavior or published page\"]\n  Runtime --> Evidence[\"Audit, validation, and support evidence\"]\n```\n\n| Responsibility | Owner | Notes |\n| --- | --- | --- |\n| Business capability name | AI and Developer Tooling | Used in navigation and dashboards so readers are not exposed to raw module names first. |\n| Source owner | nodics.foundation | Carries exact implementation, documentation, and validation evidence. |\n| Technical module | nSetup | Holds the relevant schema, service, router, data, or contract detail where applicable. |\n| Axis experience | Backend-declared workspace | Axis renders metadata and actions but does not become the authority. |\n| Public experience | Online content delivery | Nexus renders only records approved for public access. |\n\n## Data and configuration detail\n\nEvery topic must explain the data that changes behavior. Some topics are schema-driven, some are configuration-driven, some are publishable content, and some are operational records. The documentation must say which category applies before showing code. That keeps production operators and developers aligned on whether a change needs publication, restart, event propagation, approval, or only a project-layer override.\n\n| Detail area | What to document | Verification signal |\n| --- | --- | --- |\n| Model or record | Type code, catalog, tenant, enterprise, state, owner, and lifecycle. | Schema contract or generated model test. |\n| Configuration key | Default value, override location, environment scope, and runtime impact. | Config validation and runtime refresh evidence. |\n| API or event | Route/event name, payload boundary, permission, idempotency, and failure mode. | Route, service, event, and authorization tests. |\n| Publication and access | Staged/Online state, access mode, roles, groups, and permissions. | Content-pack validation and access-policy test. |\n\n```js\ndocumentationImpact: { requiresBusinessView: true, requiresVisuals: true, requiresSourceMap: true, validation: \"blocking\" }\n```\n\n## Customization and extension\n\nDevelopers should customize from the project layer first. A customer project may add properties, services, validators, pipelines, renderers, data packs, or provider configuration when the extension respects the owning capability. Business users may update governed records in Axis when the record is designed for administration. Framework source changes are reserved for improving the reusable product capability itself.\n\n| Customization type | Recommended path | Avoid |\n| --- | --- | --- |\n| Business label, navigation, or content area | Axis-managed content catalog item with publication workflow. | Hardcoding labels or page trees in the frontend. |\n| Runtime setting | Module configuration with validation and governed runtime propagation. | Editing node-local files on each server by hand. |\n| Domain behavior | Extension service, validator, pipeline step, or provider adapter. | Forking the standard module for customer-only logic. |\n| Public visibility | Access policy with public/authenticated/role-based state. | Exposing internal or draft pages through Nexus. |\n\n## Operations and governance\n\nOperators need production-safe evidence, not only implementation notes. Each page must call out logging, tracing, permission checks, event propagation, data import/export, publication status, rollback behavior, and troubleshooting. If a capability affects multiple nodes, the documentation must explain how changes reach every node and how a partial failure is detected.\n\n| Operational concern | Required documentation detail |\n| --- | --- |\n| Security | Authentication mode, permission code, role/group, tenant and enterprise isolation. |\n| Audit | Actor, timestamp, source record, checksum, approval, route/event, and result. |\n| Resilience | Retry, idempotency, compensation, fallback, cache invalidation, and rollback. |\n| Observability | Logs, metrics, dashboard cards, health checks, and support evidence. |\n\n## Common mistakes\n\n- Treating a friendly navigation label as the technical source owner.\n- Writing only developer details and skipping the business decision that the page supports.\n- Updating Axis or Nexus code when the content catalog, schema, or backend capability should own the change.\n- Forgetting access rules for public, authenticated, role-based, group-based, or permission-based pages.\n- Skipping diagrams, comparison tables, source maps, or troubleshooting matrices because the topic feels obvious.\n- Changing runtime behavior without explaining production impact, cluster propagation, and rollback.\n- Leaving CMS documentation without source evidence, validation commands, and maturity state.\n\n## Verification\n\nVerification starts with the document itself: it must include business context, technical ownership, a visual flow, data or configuration tables, customization guidance, common mistakes, and validation evidence. Developers and AI tools maintain the page directly as backend-owned CMS data and validate its declared checksums, lifecycle, navigation, access policy, publication state, and search metadata. No separate Markdown authoring source or prose generator is required.\n\nFor implementation verification, run the owning module tests and any Axis or Nexus renderer tests that consume the page. Operators should confirm that production-like runtime behavior matches the documentation: permissions reject unauthorized access, Online pages do not expose Staged data, runtime changes propagate through governed events, and troubleshooting evidence is available without exposing secrets.\n\n## Final review before completion\n\nA developer must verify where each change belongs and what behavior it adds before closing the work or moving to live acceptance and release. Keep the review decision in the existing canonical checklist. Passing tests alone does not establish that configuration ownership, file placement or scope is correct.\n\nRecord the starting revision and existing work, account for every changed file, inspect the semantic diff with formatting noise removed, and map each artifact to its existing capability or customer/deployment owner. Configuration review also checks active module order, real consumers, collection semantics and later overrides. List incidental repairs, pre-existing defects and excluded external or persisted settings separately. Matching identifiers in a callback do not prove the owning workflow approved its mutation.\n\nFor a repository-wide placement claim, account for every tracked and relevant untracked path. Label automated inventory and manual semantic review separately. Record PASS or FAIL with concrete evidence; unresolved required findings keep the gate open. The principle audit protects discovery of the rule but cannot certify that this review has been performed.\n\nThe canonical procedure is `nodics.foundation/modules/nSetup/llm/contracts/ai-coding-and-customization-contract.md#mandatory-ownership-placement-and-scope-review`.\n",
      "previous": {
        "title": "Internal Source Boundary Register",
        "route": "/docs/framework/reference-internal-source-boundary-register"
      },
      "next": {
        "title": "Reference Source Map and Glossary",
        "route": "/docs/framework/reference-source-map-glossary"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 1302,
        "checksum": "7d64213114914822e49c67075a09b4cef53dc3ded85970dbe2fe086eba82b52a"
      },
      "slug": "tooling-ai-developer-enablement",
      "locale": "en",
      "navigationGroup": "AI and Developer Enablement",
      "navigationGroupCode": "ai-and-developer-enablement",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "framework.capability-documentation-maturity-pattern",
          "owner": "nodics.docs"
        },
        {
          "documentId": "docs.documentation-roadmap",
          "owner": "nodics.docs"
        },
        {
          "documentId": "pipeline.business-logic-orchestration",
          "owner": "pipeline"
        }
      ]
    },
    "active": true
  },
  "record9": {
    "code": "nodicsDocsComponentfoundationToolingRuntimeContracts",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "foundation.tooling-runtime-contracts",
      "title": "Tooling Runtime Contracts",
      "route": "/docs/framework/foundation-tooling-runtime-contracts",
      "section": "ai-and-developer-tooling",
      "sectionTitle": "AI and Developer Tooling",
      "group": "ai-and-developer-tooling",
      "groupTitle": "AI and Developer Tooling",
      "parentId": "ai-and-developer-tooling",
      "hierarchyPath": [
        "AI and Developer Tooling",
        "Tooling Runtime Contracts"
      ],
      "hierarchyDepth": 2,
      "documentType": "contract",
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
      "summary": "How Nodics tooling commands, generated manifests, documentation validation, AI context, application builder contracts, and qualification gates are governed.",
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
        "tooling.ai-developer-enablement",
        "framework.release-upgrade-compatibility",
        "reference.source-backed-documentation-coverage-audit"
      ],
      "sourceEvidence": [
        "../../../nodics.docs/data/manifest.json",
        "../../../nodics.docs/data/docs-v001/records/documentation/nodicsDocumentationComponentData.js",
        ".",
        "bin",
        "contracts/applicationBuilder",
        "test",
        "src/service/project/defaultProjectTopologyService.mjs",
        "test/projectTopologyIsolationContract.test.js",
        "package.json",
        "src/service"
      ],
      "visualRequirements": [
        "diagram",
        "table",
        "code-example",
        "troubleshooting-matrix"
      ],
      "searchKeywords": [
        "tooling",
        "application-builder",
        "manifest",
        "validation",
        "ai-context"
      ],
      "topicKeywords": [
        "AI and Developer Tooling",
        "AI and Developer Enablement",
        "Tooling Runtime Contracts"
      ],
      "headings": [
        {
          "text": "Independent local processes",
          "anchor": "foundationToolingRuntimeContracts-1-independent-local-processes",
          "level": 2
        },
        {
          "text": "Business problem",
          "anchor": "foundationToolingRuntimeContracts-2-business-problem",
          "level": 2
        },
        {
          "text": "Source map",
          "anchor": "foundationToolingRuntimeContracts-3-source-map",
          "level": 2
        },
        {
          "text": "Tooling flow",
          "anchor": "foundationToolingRuntimeContracts-4-tooling-flow",
          "level": 2
        },
        {
          "text": "Contract",
          "anchor": "foundationToolingRuntimeContracts-5-contract",
          "level": 2
        },
        {
          "text": "Customization and extension guidance",
          "anchor": "foundationToolingRuntimeContracts-6-customization-and-extension-guidance",
          "level": 2
        },
        {
          "text": "Local runtime lifecycle",
          "anchor": "foundationToolingRuntimeContracts-7-local-runtime-lifecycle",
          "level": 2
        },
        {
          "text": "Customize and extend safely",
          "anchor": "foundationToolingRuntimeContracts-8-customize-and-extend-safely",
          "level": 2
        },
        {
          "text": "Select a project-owned process layout",
          "anchor": "foundationToolingRuntimeContracts-9-select-a-project-owned-process-layout",
          "level": 3
        },
        {
          "text": "Apply, verify and roll back a layout change",
          "anchor": "foundationToolingRuntimeContracts-10-apply-verify-and-roll-back-a-layout-change",
          "level": 3
        },
        {
          "text": "Failure and independent recovery example",
          "anchor": "foundationToolingRuntimeContracts-11-failure-and-independent-recovery-example",
          "level": 3
        },
        {
          "text": "Boundaries projects cannot replace",
          "anchor": "foundationToolingRuntimeContracts-12-boundaries-projects-cannot-replace",
          "level": 3
        },
        {
          "text": "Troubleshooting matrix",
          "anchor": "foundationToolingRuntimeContracts-13-troubleshooting-matrix",
          "level": 2
        },
        {
          "text": "Project regression examples",
          "anchor": "foundationToolingRuntimeContracts-14-project-regression-examples",
          "level": 2
        },
        {
          "text": "Operating rules",
          "anchor": "foundationToolingRuntimeContracts-15-operating-rules",
          "level": 2
        },
        {
          "text": "Common mistakes",
          "anchor": "foundationToolingRuntimeContracts-16-common-mistakes",
          "level": 2
        },
        {
          "text": "Verification",
          "anchor": "foundationToolingRuntimeContracts-17-verification",
          "level": 2
        },
        {
          "text": "Application Builder source and customer ownership",
          "anchor": "foundationToolingRuntimeContracts-18-application-builder-source-and-customer-ownership",
          "level": 2
        }
      ],
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Nodics Tooling provides developer commands, generated manifests, documentation validation, application builder contracts, AI context, and quality gates. Tooling is not a runtime business authority; it prepares, validates, and proves work that other modules own. Think of a local topology as a set of process launch instructions: starting a process does not register or activate every business capability it contains."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Independent local processes",
          "anchor": "foundationToolingRuntimeContracts-1-independent-local-processes"
        },
        {
          "kind": "paragraph",
          "text": "Local topology is declared in the existing environment-owned `nodics.environment.json`. `dependsOn` controls startup ordering, not continuous coupling between processes. A failure during the requested launch still stops that incomplete launch and reports failure. After successful startup, a runtime exit leaves its peers running and records the exit in supervisor diagnostics."
        },
        {
          "kind": "paragraph",
          "text": "Use `npm run topology:status` and the affected runtime's generated log to diagnose the failure. Required API operations remain unavailable until their owner recovers; optional enrichment follows the owning service contract. Use the runtime's existing start command for independent operator-owned recovery, or explicitly stop and restart the full topology. An independently restarted process must be stopped by its operator before a later supervised full launch. There is no new restart-policy configuration, polling service or registry."
        },
        {
          "kind": "paragraph",
          "text": "Verify with `projectTopologyIsolationContract.test.js` and `projectTopologyStopContract.test.js` under nTooling. The tests use disposable local processes and must not terminate a customer's running topology."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business problem",
          "anchor": "foundationToolingRuntimeContracts-2-business-problem"
        },
        {
          "kind": "paragraph",
          "text": "The business problem is safe acceleration. Teams want AI tools, generators, and scripts to move quickly, but a generated file should not silently become the authority for products, pages, payments, or permissions. Tooling solves this by enforcing contracts, source evidence, data release manifests, documentation gates, and application builder qualification before production use."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Source map",
          "anchor": "foundationToolingRuntimeContracts-3-source-map"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Source location"
          ],
          "rows": [
            [
              "Tooling module",
              "`.`"
            ],
            [
              "CLI commands",
              "`bin`"
            ],
            [
              "Application builder contracts",
              "`contracts/applicationBuilder`"
            ],
            [
              "Documentation validation service",
              "`src/service/defaultApplicationDocumentationContractService.js`"
            ],
            [
              "Documentation record validation",
              "`src/service/defaultApplicationDocumentationRecordValidationService.js`"
            ],
            [
              "Tooling tests",
              "`test`"
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Tooling flow",
          "anchor": "foundationToolingRuntimeContracts-4-tooling-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  Developer[\"Developer or AI tool\"] --> Command[\"Tooling command\"]\n  Command --> Contract[\"Schema and contract validation\"]\n  Contract --> Artifact[\"Generated artifact\"]\n  Artifact --> Test[\"Qualification tests\"]\n  Test --> Runtime[\"Owning runtime module\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Contract",
          "anchor": "foundationToolingRuntimeContracts-5-contract"
        },
        {
          "kind": "paragraph",
          "text": "Tooling commands should be deterministic, bounded, auditable, and safe to run in local development. Generated manifests should be rebuilt from source files, not hand maintained. Documentation validation should fail when pages lack source evidence, audience balance, verification, visual evidence, or unsafe wording. Application builder contracts should preserve module ownership and avoid writing hidden business logic."
        },
        {
          "kind": "code",
          "language": "js",
          "text": "const toolingResult = {\n  contract: 'nodics.tooling.command/v1',\n  artifact: 'data/manifest.json',\n  status: 'VALIDATED',\n  owner: 'nTooling'\n};"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension guidance",
          "anchor": "foundationToolingRuntimeContracts-6-customization-and-extension-guidance"
        },
        {
          "kind": "paragraph",
          "text": "Developers can add commands, contract schemas, validators, qualification reports, builder adapters, and source-map checks. Business users should see tooling output only as governed setup readiness, validation reports, or generated application options. Operators should know which artifacts were generated, which checks passed, and which command version produced them in production preparation."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Local runtime lifecycle",
          "anchor": "foundationToolingRuntimeContracts-7-local-runtime-lifecycle"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  profile[\"Environment profile\"] --> validate[\"Order and ports\"]\n  validate --> spawn[\"Launch runtime\"]\n  spawn --> ready[\"Ready?\"]\n  ready -->|\"No or early exit\"| rollback[\"Fail startup\"]\n  ready -->|\"Yes\"| remaining[\"More runtimes?\"]\n  remaining -->|\"Yes\"| spawn\n  remaining -->|\"No\"| running[\"Startup complete\"]\n  running --> failure[\"Child exits\"]\n  failure --> isolated[\"Keep healthy peers\"]\n  running --> stop[\"Explicit stop\"]\n  stop --> owned[\"Stop owned processes\"]"
        },
        {
          "kind": "paragraph",
          "text": "The distinction is the end of startup. An optional process that is explicitly included in the requested launch must still start successfully for that launch to succeed. Optionality means a project may omit the capability; it does not mean tooling should report a successful launch when a selected process failed. After startup completes, unrelated processes are not stopped when a child exits."
        },
        {
          "kind": "paragraph",
          "text": "Local supervision is not a production orchestrator. It does not add automatic restart, leader election, failover, continuous deep health remediation or a new per-process restart-policy setting. Several modules in one Node process share that process's failure boundary. Separate processes are required when process isolation is part of the deployment requirement."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customize and extend safely",
          "anchor": "foundationToolingRuntimeContracts-8-customize-and-extend-safely"
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Select a project-owned process layout",
          "anchor": "foundationToolingRuntimeContracts-9-select-a-project-owned-process-layout"
        },
        {
          "kind": "paragraph",
          "text": "Owner: nTooling supplies the supervisor. The customer backend project owns `envs/<environment>/nodics.environment.json`, its server package composition, and the existing project launch commands. Do not copy `defaultProjectTopologyService.mjs` into a customer script to change the layout."
        },
        {
          "kind": "paragraph",
          "text": "The following is a **topology fragment**, to merge into an existing valid environment profile. It assumes that `start:platform` and `start:waste` already exist in the project's command contract and launch servers on the shown ports. The names and ports are illustrative and must agree with the actual runtime configuration. It is not a complete environment or a ready-to-run new project."
        },
        {
          "kind": "code",
          "language": "json",
          "text": "{\n  \"topology\": {\n    \"groups\": {\n      \"backends\": [\n        {\n          \"code\": \"platform\",\n          \"label\": \"Platform\",\n          \"script\": \"start:platform\",\n          \"port\": 4300\n        },\n        {\n          \"code\": \"waste\",\n          \"label\": \"Waste\",\n          \"script\": \"start:waste\",\n          \"port\": 4370,\n          \"dependsOn\": [\"platform\"]\n        }\n      ]\n    }\n  }\n}"
        },
        {
          "kind": "paragraph",
          "text": "This example explains startup ordering only. It does not remove the protected WCMS requirement from an Axis-enabled deployment; keep the other required entries in the real profile. Location is not added merely because some Waste operations use it remotely. If the project selects a Location-dependent journey, separately supply that runtime and its governed availability."
        },
        {
          "kind": "table",
          "headers": [
            "Existing field",
            "Behavior",
            "Customization check"
          ],
          "rows": [
            [
              "`topology.groups.backends`",
              "Ordered backend processes for a launch.",
              "Include only intended processes; preserve actual boot prerequisites."
            ],
            [
              "`topology.groups.frontends`",
              "Processes included when frontend launch is selected.",
              "A running UI is not proof of backend readiness."
            ],
            [
              "`code`",
              "Process identity within the profile.",
              "Keep identities stable and dependencies resolvable."
            ],
            [
              "`script`",
              "Existing project npm command to execute.",
              "Verify command selection and configured server/environment."
            ],
            [
              "`command`, `args`, `cwd`",
              "Existing explicit command alternative and working directory.",
              "Use a trusted project-controlled executable and directory."
            ],
            [
              "`port`",
              "Local listening/readiness probe target.",
              "Match the process configuration; changing only this field does not move the server."
            ],
            [
              "`dependsOn`",
              "Required earlier entries in the declared launch order.",
              "Unknown or later dependencies fail; the supervisor does not sort them for you."
            ],
            [
              "`readyPath`",
              "Health path; backend default is `/nodics/system/v0/health/ready`.",
              "Use the owner's readiness endpoint, not an arbitrary page that always returns success."
            ],
            [
              "`readinessChecks`",
              "Additional startup HTTP checks.",
              "Keep requests read-only and do not embed credentials in source."
            ],
            [
              "`env`",
              "Per-process environment entries merged over inherited environment.",
              "Use the existing configuration/secret authority; do not log secrets."
            ],
            [
              "`topology.stateDirectory`",
              "Generated process state and log location.",
              "Do not hand-edit generated PIDs or treat this as desired-state configuration."
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "The readiness loop has a 90-second default per-runtime wait and bounded five-second HTTP requests. These are current implementation defaults, not new environment knobs. Status probes the primary readiness endpoint; passing status is not a replay of every additional startup check or every business journey."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Apply, verify and roll back a layout change",
          "anchor": "foundationToolingRuntimeContracts-10-apply-verify-and-roll-back-a-layout-change"
        },
        {
          "kind": "ordered-list",
          "items": [
            "Review the selected environment and actual command definitions before editing. Keep the project identity in its package metadata and topology in the existing environment profile.",
            "Change only the selected entries and legitimate startup prerequisites. Ensure every dependency appears earlier in the list.",
            "Run the project's existing `topology:preflight` in the intended environment. A busy port is a stop condition, not permission to kill its occupant.",
            "In an approved disposable environment, run `topology:start` or `topology:start:all`. The latter includes the declared frontends. Observe each READY message and the final startup-complete message.",
            "Inspect `topology:status`, then test the actual authorized business operation. Starting processes does not prove activation data has been imported.",
            "Roll back the project profile change through source control, then perform an approved stop/restart. Reverting topology source does not alter already running processes, imported data or persisted registrations."
          ]
        },
        {
          "kind": "paragraph",
          "text": "Example commands for projects exposing the standard npm wrappers, run from that project's root. Status and preflight inspect; start and stop operate processes and require an appropriate environment and operator authorization:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "npm run topology:status\nnpm run topology:preflight\nnpm run topology:start:all"
        },
        {
          "kind": "paragraph",
          "text": "Do not run the start command over an existing installation just to follow this guide. Keep the active supervisor terminal available; it owns the launched process groups. Individual environments may select their profile through their existing launcher rather than a universal command-line flag."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Failure and independent recovery example",
          "anchor": "foundationToolingRuntimeContracts-11-failure-and-independent-recovery-example"
        },
        {
          "kind": "paragraph",
          "text": "Starting state: the requested topology has completed startup, then one runtime exits. First inspect status and `envs/<environment>/generated/local-topology/<runtime-code>.log`, unless the profile specifies a different state directory. An exited child is recorded; healthy peers remain running. A supervisor still running does not mean every child is healthy."
        },
        {
          "kind": "paragraph",
          "text": "After correcting the runtime fault, either use that runtime's existing start command in a separate operator-owned terminal, or schedule an explicit full stop/restart. Independent restart is not automatically adopted by the old supervisor. Status can show a ready listening port as `EXTERNAL_OR_UNKNOWN`; the operator must stop that process before a later full supervised launch."
        },
        {
          "kind": "paragraph",
          "text": "If a request failed during the outage, inspect its authoritative status before retrying a mutation. Do not infer rollback from a connection failure. Existing approval, publication and idempotency contracts remain in force. Process recovery does not auto-register a module, import optional data or erase records."
        },
        {
          "kind": "heading",
          "level": 3,
          "text": "Boundaries projects cannot replace",
          "anchor": "foundationToolingRuntimeContracts-12-boundaries-projects-cannot-replace"
        },
        {
          "kind": "paragraph",
          "text": "Startup ordering is not a substitute for local module inheritance or backend authorization. Projects must not add a permissive readiness endpoint, copy the supervisor, edit recorded PIDs, or reset storage to conceal startup failures. There is no supported topology setting that turns a failed required business operation into success. Additional production availability requirements belong to the selected deployment infrastructure and owning service contracts."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Troubleshooting matrix",
          "anchor": "foundationToolingRuntimeContracts-13-troubleshooting-matrix"
        },
        {
          "kind": "table",
          "headers": [
            "Symptom",
            "Cause to investigate",
            "Expected recovery"
          ],
          "rows": [
            [
              "Unknown dependency",
              "`dependsOn` points outside the selected runtime list.",
              "Correct the project profile; do not invent a dummy process."
            ],
            [
              "Must be declared after dependency",
              "Dependent entry precedes its prerequisite.",
              "Reorder the existing entries and rerun preflight."
            ],
            [
              "Refusing to start: ports busy",
              "Another supervised or operator-owned process is listening.",
              "Identify its owner; explicitly stop it only when authorized."
            ],
            [
              "Runtime exits before READY",
              "Selected startup command failed.",
              "Inspect that runtime log, fix the cause and retry the incomplete launch."
            ],
            [
              "Runtime exits after startup",
              "Process fault isolated from healthy peers.",
              "Restore only the failed runtime or schedule a full restart."
            ],
            [
              "HTTP readiness timeout",
              "Wrong endpoint, incomplete boot, or unavailable required infrastructure.",
              "Fix the owner's readiness cause; do not bypass the check."
            ],
            [
              "Status ready, feature unavailable",
              "Registration, activation, permissions or secondary owner unavailable.",
              "Diagnose in Module Registry and the owning API."
            ],
            [
              "Stop refuses stale state or reports listening ports",
              "State does not prove ownership, or an independently restarted process remains.",
              "Resolve ownership explicitly; do not signal guessed PIDs."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Project regression examples",
          "anchor": "foundationToolingRuntimeContracts-14-project-regression-examples"
        },
        {
          "kind": "paragraph",
          "text": "Run from the framework repository root. These tests create disposable fixtures and processes rather than terminating the operator's running topology:"
        },
        {
          "kind": "code",
          "language": "bash",
          "text": "node --test nodics.foundation/modules/nTooling/test/projectTopologyIsolationContract.test.js\nnode --test nodics.foundation/modules/nTooling/test/projectTopologyStopContract.test.js\nnode --test nodics.foundation/modules/nTooling/test/projectTopologyRuntimeEnvContract.test.js"
        },
        {
          "kind": "paragraph",
          "text": "In the project repository, add a profile test asserting that selected scripts exist, ports match configuration, dependencies precede their consumers, and optional remote integrations have not become whole-topology prerequisites. Exercise both an early startup failure and a post-start exit in disposable processes. Assert the first fails the requested launch and the second preserves an unrelated healthy peer. Keep permission and mutation-retry tests at the owning API, not in the supervisor."
        },
        {
          "kind": "paragraph",
          "text": "These gates prove local supervisor behavior. They do not qualify container orchestration, distributed failover, backup restoration or production capacity. CMS documentation validation is similarly distinct from publication: maintain canonical article blocks and metadata, validate declared integrity, review rendering, then use the governed documentation release lifecycle to make the content available to users."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operating rules",
          "anchor": "foundationToolingRuntimeContracts-15-operating-rules"
        },
        {
          "kind": "paragraph",
          "text": "Tooling output should be reproducible from committed source, configuration, and declared inputs. A command that edits data, documentation, or application contracts should publish clear evidence: changed files, generated hashes, validation result, and owner module. AI-assisted commands follow the same rules as developer commands. They can propose or generate artifacts, but they cannot bypass source evidence, tests, release checks, or module ownership."
        },
        {
          "kind": "paragraph",
          "text": "For beginners, a tooling failure is usually a helpful stop sign. Fix the authored source, catalogue metadata, command input, or generated checksum before retrying. Do not edit generated runtime output to make the failure disappear, because the next generator run will recreate the same mismatch. Operators should keep failed command logs with the release evidence."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "foundationToolingRuntimeContracts-16-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Treating generated files as hand-authored source.",
            "Letting AI tools bypass validators.",
            "Adding a command without deterministic output and tests.",
            "Hiding contract failures behind generic success messages.",
            "Using tooling to override business ownership instead of supporting it."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "foundationToolingRuntimeContracts-17-verification"
        },
        {
          "kind": "paragraph",
          "text": "Run tooling tests, documentation validation, source coverage audit, application builder qualification tests, and manifest read-only CMS data checks. Production readiness requires business-readable reports, developer source evidence, operator command traceability, and QA proof that generated artifacts match the authored source and runtime contract."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Application Builder source and customer ownership",
          "anchor": "foundationToolingRuntimeContracts-18-application-builder-source-and-customer-ownership"
        },
        {
          "kind": "paragraph",
          "text": "Application Builder uses explicit frontend and customer source roots. A project administrator declares business presets, market choices, stores, catalogs, frontend selections and data-pack ownership under `nodics.applicationBuilder` in the existing customer package metadata. Each participating data module opts in with `applicationBuilder.dataPack: true`. Developers can choose unrelated frontend, renderer, composition and pack identifiers without changing nTooling. Framework package metadata continues to own backend dependencies."
        },
        {
          "kind": "table",
          "headers": [
            "Input or evidence",
            "Meaning",
            "Failure and recovery"
          ],
          "rows": [
            [
              "Customer composition declaration",
              "Intended frontend/domain/renderer/data wiring",
              "Correct the customer declaration, rediscover and review a new plan"
            ],
            [
              "Explicit source roots",
              "Repositories available to planning",
              "Supply missing roots; CI cannot invent replacements"
            ],
            [
              "Approved plan and source digest",
              "Exact reviewed generation inputs",
              "Regenerate and approve after any source metadata change"
            ],
            [
              "Generated starter tests and HTTP probes",
              "Standalone generated output works locally",
              "Inspect the qualification report and repair the customer output or generator"
            ],
            [
              "External deployment acceptance",
              "Actual selected frontends, authentication, providers and imported data work together",
              "Run the deployment's separate acceptance scenarios"
            ]
          ]
        },
        {
          "kind": "paragraph",
          "text": "A beginner chooses a declared preset and reviews the result before generation. A maintainer can use `--frontend`, `--customer`, or an explicit `--experience` workspace plus `--frontend-code`. Multiple available storefronts require a selection. A disabled sample-data choice produces empty product, price and inventory samples. Supporting frontend wiring is generated from the selected codes; source repositories retain their ownership."
        },
        {
          "kind": "paragraph",
          "text": "An existing approved plan cannot silently adopt changed customer metadata or renamed output files. Builder rejects stale bindings and existing protected output roots. The independent-customer contract test exercises another market, store, renderer and data module, rejects unsupported selections, and boots the generated starter on disposable local ports. These are source and starter checks; they do not establish deployment readiness for external applications."
        }
      ],
      "searchText": "Tooling Runtime Contracts How Nodics tooling commands, generated manifests, documentation validation, AI context, application builder contracts, and qualification gates are governed. # Tooling Runtime Contracts\n\nNodics Tooling provides developer commands, generated manifests, documentation validation, application builder contracts, AI context, and quality gates. Tooling is not a runtime business authority; it prepares, validates, and proves work that other modules own. Think of a local topology as a set of process launch instructions: starting a process does not register or activate every business capability it contains.\n\n## Independent local processes\n\nLocal topology is declared in the existing environment-owned `nodics.environment.json`. `dependsOn` controls startup ordering, not continuous coupling between processes. A failure during the requested launch still stops that incomplete launch and reports failure. After successful startup, a runtime exit leaves its peers running and records the exit in supervisor diagnostics.\n\nUse `npm run topology:status` and the affected runtime's generated log to diagnose the failure. Required API operations remain unavailable until their owner recovers; optional enrichment follows the owning service contract. Use the runtime's existing start command for independent operator-owned recovery, or explicitly stop and restart the full topology. An independently restarted process must be stopped by its operator before a later supervised full launch. There is no new restart-policy configuration, polling service or registry.\n\nVerify with `projectTopologyIsolationContract.test.js` and `projectTopologyStopContract.test.js` under nTooling. The tests use disposable local processes and must not terminate a customer's running topology.\n\n## Business problem\n\nThe business problem is safe acceleration. Teams want AI tools, generators, and scripts to move quickly, but a generated file should not silently become the authority for products, pages, payments, or permissions. Tooling solves this by enforcing contracts, source evidence, data release manifests, documentation gates, and application builder qualification before production use.\n\n## Source map\n\n| Area | Source location |\n| --- | --- |\n| Tooling module | `.` |\n| CLI commands | `bin` |\n| Application builder contracts | `contracts/applicationBuilder` |\n| Documentation validation service | `src/service/defaultApplicationDocumentationContractService.js` |\n| Documentation record validation | `src/service/defaultApplicationDocumentationRecordValidationService.js` |\n| Tooling tests | `test` |\n\n## Tooling flow\n\n```mermaid\nflowchart TD\n  Developer[\"Developer or AI tool\"] --> Command[\"Tooling command\"]\n  Command --> Contract[\"Schema and contract validation\"]\n  Contract --> Artifact[\"Generated artifact\"]\n  Artifact --> Test[\"Qualification tests\"]\n  Test --> Runtime[\"Owning runtime module\"]\n```\n\n## Contract\n\nTooling commands should be deterministic, bounded, auditable, and safe to run in local development. Generated manifests should be rebuilt from source files, not hand maintained. Documentation validation should fail when pages lack source evidence, audience balance, verification, visual evidence, or unsafe wording. Application builder contracts should preserve module ownership and avoid writing hidden business logic.\n\n```js\nconst toolingResult = {\n  contract: 'nodics.tooling.command/v1',\n  artifact: 'data/manifest.json',\n  status: 'VALIDATED',\n  owner: 'nTooling'\n};\n```\n\n## Customization and extension guidance\n\nDevelopers can add commands, contract schemas, validators, qualification reports, builder adapters, and source-map checks. Business users should see tooling output only as governed setup readiness, validation reports, or generated application options. Operators should know which artifacts were generated, which checks passed, and which command version produced them in production preparation.\n\n## Local runtime lifecycle\n\n```mermaid\nflowchart TD\n  profile[\"Environment profile\"] --> validate[\"Order and ports\"]\n  validate --> spawn[\"Launch runtime\"]\n  spawn --> ready[\"Ready?\"]\n  ready -->|\"No or early exit\"| rollback[\"Fail startup\"]\n  ready -->|\"Yes\"| remaining[\"More runtimes?\"]\n  remaining -->|\"Yes\"| spawn\n  remaining -->|\"No\"| running[\"Startup complete\"]\n  running --> failure[\"Child exits\"]\n  failure --> isolated[\"Keep healthy peers\"]\n  running --> stop[\"Explicit stop\"]\n  stop --> owned[\"Stop owned processes\"]\n```\n\nThe distinction is the end of startup. An optional process that is explicitly included in the requested launch must still start successfully for that launch to succeed. Optionality means a project may omit the capability; it does not mean tooling should report a successful launch when a selected process failed. After startup completes, unrelated processes are not stopped when a child exits.\n\nLocal supervision is not a production orchestrator. It does not add automatic restart, leader election, failover, continuous deep health remediation or a new per-process restart-policy setting. Several modules in one Node process share that process's failure boundary. Separate processes are required when process isolation is part of the deployment requirement.\n\n## Customize and extend safely\n\n### Select a project-owned process layout\n\nOwner: nTooling supplies the supervisor. The customer backend project owns `envs/<environment>/nodics.environment.json`, its server package composition, and the existing project launch commands. Do not copy `defaultProjectTopologyService.mjs` into a customer script to change the layout.\n\nThe following is a **topology fragment**, to merge into an existing valid environment profile. It assumes that `start:platform` and `start:waste` already exist in the project's command contract and launch servers on the shown ports. The names and ports are illustrative and must agree with the actual runtime configuration. It is not a complete environment or a ready-to-run new project.\n\n```json\n{\n  \"topology\": {\n    \"groups\": {\n      \"backends\": [\n        {\n          \"code\": \"platform\",\n          \"label\": \"Platform\",\n          \"script\": \"start:platform\",\n          \"port\": 4300\n        },\n        {\n          \"code\": \"waste\",\n          \"label\": \"Waste\",\n          \"script\": \"start:waste\",\n          \"port\": 4370,\n          \"dependsOn\": [\"platform\"]\n        }\n      ]\n    }\n  }\n}\n```\n\nThis example explains startup ordering only. It does not remove the protected WCMS requirement from an Axis-enabled deployment; keep the other required entries in the real profile. Location is not added merely because some Waste operations use it remotely. If the project selects a Location-dependent journey, separately supply that runtime and its governed availability.\n\n| Existing field | Behavior | Customization check |\n| --- | --- | --- |\n| `topology.groups.backends` | Ordered backend processes for a launch. | Include only intended processes; preserve actual boot prerequisites. |\n| `topology.groups.frontends` | Processes included when frontend launch is selected. | A running UI is not proof of backend readiness. |\n| `code` | Process identity within the profile. | Keep identities stable and dependencies resolvable. |\n| `script` | Existing project npm command to execute. | Verify command selection and configured server/environment. |\n| `command`, `args`, `cwd` | Existing explicit command alternative and working directory. | Use a trusted project-controlled executable and directory. |\n| `port` | Local listening/readiness probe target. | Match the process configuration; changing only this field does not move the server. |\n| `dependsOn` | Required earlier entries in the declared launch order. | Unknown or later dependencies fail; the supervisor does not sort them for you. |\n| `readyPath` | Health path; backend default is `/nodics/system/v0/health/ready`. | Use the owner's readiness endpoint, not an arbitrary page that always returns success. |\n| `readinessChecks` | Additional startup HTTP checks. | Keep requests read-only and do not embed credentials in source. |\n| `env` | Per-process environment entries merged over inherited environment. | Use the existing configuration/secret authority; do not log secrets. |\n| `topology.stateDirectory` | Generated process state and log location. | Do not hand-edit generated PIDs or treat this as desired-state configuration. |\n\nThe readiness loop has a 90-second default per-runtime wait and bounded five-second HTTP requests. These are current implementation defaults, not new environment knobs. Status probes the primary readiness endpoint; passing status is not a replay of every additional startup check or every business journey.\n\n### Apply, verify and roll back a layout change\n\n1. Review the selected environment and actual command definitions before editing. Keep the project identity in its package metadata and topology in the existing environment profile.\n2. Change only the selected entries and legitimate startup prerequisites. Ensure every dependency appears earlier in the list.\n3. Run the project's existing `topology:preflight` in the intended environment. A busy port is a stop condition, not permission to kill its occupant.\n4. In an approved disposable environment, run `topology:start` or `topology:start:all`. The latter includes the declared frontends. Observe each READY message and the final startup-complete message.\n5. Inspect `topology:status`, then test the actual authorized business operation. Starting processes does not prove activation data has been imported.\n6. Roll back the project profile change through source control, then perform an approved stop/restart. Reverting topology source does not alter already running processes, imported data or persisted registrations.\n\nExample commands for projects exposing the standard npm wrappers, run from that project's root. Status and preflight inspect; start and stop operate processes and require an appropriate environment and operator authorization:\n\n```bash\nnpm run topology:status\nnpm run topology:preflight\nnpm run topology:start:all\n```\n\nDo not run the start command over an existing installation just to follow this guide. Keep the active supervisor terminal available; it owns the launched process groups. Individual environments may select their profile through their existing launcher rather than a universal command-line flag.\n\n### Failure and independent recovery example\n\nStarting state: the requested topology has completed startup, then one runtime exits. First inspect status and `envs/<environment>/generated/local-topology/<runtime-code>.log`, unless the profile specifies a different state directory. An exited child is recorded; healthy peers remain running. A supervisor still running does not mean every child is healthy.\n\nAfter correcting the runtime fault, either use that runtime's existing start command in a separate operator-owned terminal, or schedule an explicit full stop/restart. Independent restart is not automatically adopted by the old supervisor. Status can show a ready listening port as `EXTERNAL_OR_UNKNOWN`; the operator must stop that process before a later full supervised launch.\n\nIf a request failed during the outage, inspect its authoritative status before retrying a mutation. Do not infer rollback from a connection failure. Existing approval, publication and idempotency contracts remain in force. Process recovery does not auto-register a module, import optional data or erase records.\n\n### Boundaries projects cannot replace\n\nStartup ordering is not a substitute for local module inheritance or backend authorization. Projects must not add a permissive readiness endpoint, copy the supervisor, edit recorded PIDs, or reset storage to conceal startup failures. There is no supported topology setting that turns a failed required business operation into success. Additional production availability requirements belong to the selected deployment infrastructure and owning service contracts.\n\n## Troubleshooting matrix\n\n| Symptom | Cause to investigate | Expected recovery |\n| --- | --- | --- |\n| Unknown dependency | `dependsOn` points outside the selected runtime list. | Correct the project profile; do not invent a dummy process. |\n| Must be declared after dependency | Dependent entry precedes its prerequisite. | Reorder the existing entries and rerun preflight. |\n| Refusing to start: ports busy | Another supervised or operator-owned process is listening. | Identify its owner; explicitly stop it only when authorized. |\n| Runtime exits before READY | Selected startup command failed. | Inspect that runtime log, fix the cause and retry the incomplete launch. |\n| Runtime exits after startup | Process fault isolated from healthy peers. | Restore only the failed runtime or schedule a full restart. |\n| HTTP readiness timeout | Wrong endpoint, incomplete boot, or unavailable required infrastructure. | Fix the owner's readiness cause; do not bypass the check. |\n| Status ready, feature unavailable | Registration, activation, permissions or secondary owner unavailable. | Diagnose in Module Registry and the owning API. |\n| Stop refuses stale state or reports listening ports | State does not prove ownership, or an independently restarted process remains. | Resolve ownership explicitly; do not signal guessed PIDs. |\n\n## Project regression examples\n\nRun from the framework repository root. These tests create disposable fixtures and processes rather than terminating the operator's running topology:\n\n```bash\nnode --test nodics.foundation/modules/nTooling/test/projectTopologyIsolationContract.test.js\nnode --test nodics.foundation/modules/nTooling/test/projectTopologyStopContract.test.js\nnode --test nodics.foundation/modules/nTooling/test/projectTopologyRuntimeEnvContract.test.js\n```\n\nIn the project repository, add a profile test asserting that selected scripts exist, ports match configuration, dependencies precede their consumers, and optional remote integrations have not become whole-topology prerequisites. Exercise both an early startup failure and a post-start exit in disposable processes. Assert the first fails the requested launch and the second preserves an unrelated healthy peer. Keep permission and mutation-retry tests at the owning API, not in the supervisor.\n\nThese gates prove local supervisor behavior. They do not qualify container orchestration, distributed failover, backup restoration or production capacity. CMS documentation validation is similarly distinct from publication: maintain canonical article blocks and metadata, validate declared integrity, review rendering, then use the governed documentation release lifecycle to make the content available to users.\n\n## Operating rules\n\nTooling output should be reproducible from committed source, configuration, and declared inputs. A command that edits data, documentation, or application contracts should publish clear evidence: changed files, generated hashes, validation result, and owner module. AI-assisted commands follow the same rules as developer commands. They can propose or generate artifacts, but they cannot bypass source evidence, tests, release checks, or module ownership.\n\nFor beginners, a tooling failure is usually a helpful stop sign. Fix the authored source, catalogue metadata, command input, or generated checksum before retrying. Do not edit generated runtime output to make the failure disappear, because the next generator run will recreate the same mismatch. Operators should keep failed command logs with the release evidence.\n\n## Common mistakes\n\n- Treating generated files as hand-authored source.\n- Letting AI tools bypass validators.\n- Adding a command without deterministic output and tests.\n- Hiding contract failures behind generic success messages.\n- Using tooling to override business ownership instead of supporting it.\n\n## Verification\n\nRun tooling tests, documentation validation, source coverage audit, application builder qualification tests, and manifest read-only CMS data checks. Production readiness requires business-readable reports, developer source evidence, operator command traceability, and QA proof that generated artifacts match the authored source and runtime contract.\n\n## Application Builder source and customer ownership\n\nApplication Builder uses explicit frontend and customer source roots. A project administrator declares business presets, market choices, stores, catalogs, frontend selections and data-pack ownership under `nodics.applicationBuilder` in the existing customer package metadata. Each participating data module opts in with `applicationBuilder.dataPack: true`. Developers can choose unrelated frontend, renderer, composition and pack identifiers without changing nTooling. Framework package metadata continues to own backend dependencies.\n\n| Input or evidence | Meaning | Failure and recovery |\n| --- | --- | --- |\n| Customer composition declaration | Intended frontend/domain/renderer/data wiring | Correct the customer declaration, rediscover and review a new plan |\n| Explicit source roots | Repositories available to planning | Supply missing roots; CI cannot invent replacements |\n| Approved plan and source digest | Exact reviewed generation inputs | Regenerate and approve after any source metadata change |\n| Generated starter tests and HTTP probes | Standalone generated output works locally | Inspect the qualification report and repair the customer output or generator |\n| External deployment acceptance | Actual selected frontends, authentication, providers and imported data work together | Run the deployment's separate acceptance scenarios |\n\nA beginner chooses a declared preset and reviews the result before generation. A maintainer can use `--frontend`, `--customer`, or an explicit `--experience` workspace plus `--frontend-code`. Multiple available storefronts require a selection. A disabled sample-data choice produces empty product, price and inventory samples. Supporting frontend wiring is generated from the selected codes; source repositories retain their ownership.\n\nAn existing approved plan cannot silently adopt changed customer metadata or renamed output files. Builder rejects stale bindings and existing protected output roots. The independent-customer contract test exercises another market, store, renderer and data module, rejects unsupported selections, and boots the generated starter on disposable local ports. These are source and starter checks; they do not establish deployment readiness for external applications.\n",
      "previous": {
        "title": "Domain Commerce Accelerator Source Map",
        "route": "/docs/framework/accelerators-domain-commerce-source-map"
      },
      "next": {
        "title": "EMS Runtime and Client Runbook",
        "route": "/docs/framework/foundation-ems-runtime-client-runbook"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.foundation",
        "technicalModule": "nTooling",
        "owner": "nTooling",
        "sourcePath": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/nToolingDocumentationComponentData.js",
        "wordCount": 2330,
        "checksum": "82f1aeb21309da639648cc0082eab30d3584fc3baddbbcdcbe80821e53b93827"
      },
      "slug": "foundation-tooling-runtime-contracts",
      "locale": "en",
      "navigationGroup": "AI and Developer Enablement",
      "navigationGroupCode": "ai-and-developer-enablement",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "tooling.ai-developer-enablement",
          "owner": "nTooling"
        },
        {
          "documentId": "framework.release-upgrade-compatibility",
          "owner": "nTooling"
        },
        {
          "documentId": "reference.source-backed-documentation-coverage-audit",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  }
};
