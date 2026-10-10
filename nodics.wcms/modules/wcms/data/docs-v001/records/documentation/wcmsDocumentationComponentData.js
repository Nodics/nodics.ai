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
    "code": "nodicsDocsComponentwcmsOverview",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.overview",
      "title": "WCMS content management",
      "route": "/docs/framework/wcms-overview",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "WCMS content management"
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
      "summary": "How Nodics manages sites, catalogs, pages, components, routes, and delivery through the WCMS runtime.",
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
        "wcms.content-catalog-model",
        "wcms.page-designer-components",
        "wcms.site-publication-visibility",
        "wcms.media-management",
        "wcms.publishing-lifecycle",
        "docs.overview"
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
        "source-map-table"
      ],
      "searchKeywords": [
        "wcms-and-content-management",
        "content-model-and-delivery",
        "wcms-content-management"
      ],
      "topicKeywords": [
        "WCMS and Content Management",
        "Content Model and Delivery",
        "WCMS content management"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "WCMS Content Management explains how Nodics manages business-owned pages, content areas, components, navigation, visibility, and publication. It is the entry page for content teams, Axis administrators, developers, operators, and AI tools that need to understand the content model before changing it."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "WCMS model",
          "anchor": "wcmsOverview-1-wcms-model"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Axis[\"Axis editing workspace\"] --> Catalog[\"Content catalog\"]\n  Catalog --> Page[\"Page\"]\n  Page --> Area[\"Content area\"]\n  Area --> Component[\"Component\"]\n  Component --> Publish[\"Staged to Online publication\"]\n  Publish --> Nexus[\"Nexus, Agora, or Axis documentation view\"]"
        },
        {
          "kind": "table",
          "headers": [
            "Concept",
            "Meaning",
            "Who cares"
          ],
          "rows": [
            [
              "Content catalog",
              "Backend-owned hierarchy for pages and components.",
              "Architects, developers, AI tools."
            ],
            [
              "Page",
              "Route-level business experience.",
              "Business users and content authors."
            ],
            [
              "Content area",
              "A controlled placement region inside a page.",
              "Page designers and frontend developers."
            ],
            [
              "Component",
              "Editable business content or functional renderer.",
              "Authors, administrators, and operators."
            ],
            [
              "Publication",
              "Governed movement from Staged to Online.",
              "Reviewers, publishers, and QA."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business perspective",
          "anchor": "wcmsOverview-2-business-perspective"
        },
        {
          "kind": "paragraph",
          "text": "WCMS exists so customer-facing and internal content is managed through a governed backend model, not through frontend hardcoding. A business user can prepare pages, update navigation, manage components, request approval, and publish Online content through Axis. Public Nexus pages, Agora storefronts, Axis documentation, and internal pages can share the same content principles while using different access and visibility rules."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Technical perspective",
          "anchor": "wcmsOverview-3-technical-perspective"
        },
        {
          "kind": "paragraph",
          "text": "Developers should treat WCMS as the authority for content structure. Frontends render pages, areas, and components from backend data. If a page, navigation item, header, footer, hero, article, banner, or documentation link is visible without Online content, it should be either a governed fallback state or a deliberate recovery shell."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Continue with",
          "anchor": "wcmsOverview-4-continue-with"
        },
        {
          "kind": "unordered-list",
          "items": [
            "**Content Catalog Model** for page, area, component, catalog, and hierarchy records.",
            "**Page Designer and Components** for creating editable areas and component renderers.",
            "**Site Publication and Visibility** for Staged, Online, public, authenticated, and role-based delivery.",
            "**Media Management** for image, file, and asset ownership used by content."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "wcmsOverview-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that WCMS is the backend-owned content authority for page structure, not a frontend convenience layer. A business user should know how a content change moves from Axis editing to Staged preparation, approval, Online visibility, and public or authenticated rendering. A developer should know which model owns catalog, page, area, component, route, visibility, and media references. An operator should know where to verify publication state and missing-content fallback behavior."
        },
        {
          "kind": "paragraph",
          "text": "Every WCMS page must explain the business journey and the implementation contract together. That includes content catalog ownership, editable component rules, route mapping, role visibility, publishing workflow, media dependencies, Axis customization surface, and browser evidence for Nexus, Agora, Axis, or documentation views."
        },
        {
          "kind": "paragraph",
          "text": "This extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsOverview-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Hardcoding business pages, header, footer, or storefront content in Nexus or Agora.",
            "Creating content without publication state and visibility metadata.",
            "Importing page data but forgetting media objects and physical assets.",
            "Treating Axis as the content owner instead of the editing and operations surface."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsOverview-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify WCMS by importing content to Staged, approving publication, opening the Online route, checking role visibility, confirming media renders, and inspecting audit evidence. A beginner should see the page journey, a business user should see how to change it, a developer should see the schema and renderer contract, and an operator should see publication status."
        }
      ],
      "searchText": "WCMS content management How Nodics manages sites, catalogs, pages, components, routes, and delivery through the WCMS runtime. # WCMS content management\n\nWCMS Content Management explains how Nodics manages business-owned pages, content areas, components, navigation, visibility, and publication. It is the entry page for content teams, Axis administrators, developers, operators, and AI tools that need to understand the content model before changing it.\n\n## WCMS model\n\n```mermaid\nflowchart LR\n  Axis[\"Axis editing workspace\"] --> Catalog[\"Content catalog\"]\n  Catalog --> Page[\"Page\"]\n  Page --> Area[\"Content area\"]\n  Area --> Component[\"Component\"]\n  Component --> Publish[\"Staged to Online publication\"]\n  Publish --> Nexus[\"Nexus, Agora, or Axis documentation view\"]\n```\n\n| Concept | Meaning | Who cares |\n| --- | --- | --- |\n| Content catalog | Backend-owned hierarchy for pages and components. | Architects, developers, AI tools. |\n| Page | Route-level business experience. | Business users and content authors. |\n| Content area | A controlled placement region inside a page. | Page designers and frontend developers. |\n| Component | Editable business content or functional renderer. | Authors, administrators, and operators. |\n| Publication | Governed movement from Staged to Online. | Reviewers, publishers, and QA. |\n\n## Business perspective\n\nWCMS exists so customer-facing and internal content is managed through a governed backend model, not through frontend hardcoding. A business user can prepare pages, update navigation, manage components, request approval, and publish Online content through Axis. Public Nexus pages, Agora storefronts, Axis documentation, and internal pages can share the same content principles while using different access and visibility rules.\n\n## Technical perspective\n\nDevelopers should treat WCMS as the authority for content structure. Frontends render pages, areas, and components from backend data. If a page, navigation item, header, footer, hero, article, banner, or documentation link is visible without Online content, it should be either a governed fallback state or a deliberate recovery shell.\n\n## Continue with\n\n- **Content Catalog Model** for page, area, component, catalog, and hierarchy records.\n- **Page Designer and Components** for creating editable areas and component renderers.\n- **Site Publication and Visibility** for Staged, Online, public, authenticated, and role-based delivery.\n- **Media Management** for image, file, and asset ownership used by content.\n\n## Reader and implementation contract\n\nA beginner should understand that WCMS is the backend-owned content authority for page structure, not a frontend convenience layer. A business user should know how a content change moves from Axis editing to Staged preparation, approval, Online visibility, and public or authenticated rendering. A developer should know which model owns catalog, page, area, component, route, visibility, and media references. An operator should know where to verify publication state and missing-content fallback behavior.\n\nEvery WCMS page must explain the business journey and the implementation contract together. That includes content catalog ownership, editable component rules, route mapping, role visibility, publishing workflow, media dependencies, Axis customization surface, and browser evidence for Nexus, Agora, Axis, or documentation views.\n\nThis extension guidance must stay linked to the owning project or capability page whenever a customer customizes the behavior.\n\n## Common mistakes\n\n- Hardcoding business pages, header, footer, or storefront content in Nexus or Agora.\n- Creating content without publication state and visibility metadata.\n- Importing page data but forgetting media objects and physical assets.\n- Treating Axis as the content owner instead of the editing and operations surface.\n\n## Verification\n\nVerify WCMS by importing content to Staged, approving publication, opening the Online route, checking role visibility, confirming media renders, and inspecting audit evidence. A beginner should see the page journey, a business user should see how to change it, a developer should see the schema and renderer contract, and an operator should see publication status.\n",
      "previous": {
        "title": "Base Commerce foundations",
        "route": "/docs/framework/commerce-base-foundations"
      },
      "next": {
        "title": "Content Catalog Model",
        "route": "/docs/framework/wcms-content-catalog-model"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "wcms",
        "owner": "wcms",
        "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "wordCount": 539,
        "checksum": "df23a284d38c7c78829ec911937bd1cbea3a6d8b97c314d673e1815ce0da9af9"
      },
      "slug": "wcms-overview",
      "locale": "en",
      "navigationGroup": "Content Model and Delivery",
      "navigationGroupCode": "content-model-and-delivery",
      "navigationGroupOrder": 10,
      "navigationOrder": 10,
      "references": [
        {
          "documentId": "wcms.content-catalog-model",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.page-designer-components",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.site-publication-visibility",
          "owner": "wcms"
        },
        {
          "documentId": "wcms.media-management",
          "owner": "media"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record1": {
    "code": "nodicsDocsComponentwcmsContentCatalogModel",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.content-catalog-model",
      "title": "Content Catalog Model",
      "route": "/docs/framework/wcms-content-catalog-model",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "Content Catalog Model"
      ],
      "hierarchyDepth": 2,
      "documentType": "concept",
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
      "summary": "How sites, catalogs, pages, components, media, routes, access policy, and publication state drive public content.",
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
        "wcms.media-management",
        "wcms.publishing-lifecycle",
        "docs.overview"
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
        "table"
      ],
      "searchKeywords": [
        "content-catalog-model",
        "cms-page-component-route",
        "online-content"
      ],
      "topicKeywords": [
        "WCMS and Content Management",
        "Content Model and Delivery",
        "Content Catalog Model"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "The content catalog model explains how Nodics stores and delivers CMS-backed content such as pages, components, documentation, navigation, media references, headers, footers, Nexus content, and Agora storefront content. It exists because public applications must not hardcode business content when the content is expected to be managed, approved, published, localized, searched, and governed from Axis."
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, the safe model is: content is prepared in Staged, reviewed and approved, then published Online. Nexus and Agora consume Online content only. Axis is the management surface, but WCMS and backend content packs own the records."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Catalog objects",
          "anchor": "wcmsContentCatalogModel-1-catalog-objects"
        },
        {
          "kind": "table",
          "headers": [
            "Object",
            "Purpose",
            "Business impact"
          ],
          "rows": [
            [
              "Site",
              "Defines the public or authenticated experience being delivered.",
              "Separates Nexus, Agora, documentation, and partner sites."
            ],
            [
              "Catalog",
              "Holds versioned content for a site or product area.",
              "Lets teams manage Staged and Online content separately."
            ],
            [
              "Page",
              "Represents a route-level content experience.",
              "Controls what users see for a URL."
            ],
            [
              "Component",
              "Provides renderable content blocks.",
              "Lets business users assemble page areas."
            ],
            [
              "Media",
              "Connects files and metadata to content.",
              "Enables images, documents, and assets without frontend bundling."
            ],
            [
              "Access policy",
              "Controls public or authenticated visibility.",
              "Prevents draft or restricted content from leaking."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Data flow",
          "anchor": "wcmsContentCatalogModel-2-data-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Pack[\"Content pack\"] --> Staged[\"Staged catalog\"]\n  Axis[\"Axis authoring\"] --> Staged\n  Staged --> Approval[\"Review and approval\"]\n  Approval --> Online[\"Online catalog\"]\n  Online --> Nexus[\"Nexus\"]\n  Online --> Agora[\"Agora\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "wcmsContentCatalogModel-3-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects can add content catalogs for their own corporate sites, storefronts, documentation sets, and partner experiences. The project pack should include pages, components, routes, media records, media assets, publication metadata, and access policy. The installer may prepare this structure, but the project must own its content rather than depending on reference Kickoff sample data."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator view",
          "anchor": "wcmsContentCatalogModel-4-operator-view"
        },
        {
          "kind": "paragraph",
          "text": "Operators should be able to inspect which content pack imported a record, which catalog version is Staged, which release is Online, which route is active, and whether the media artifact exists. If a public site does not render, the investigation should start with site, catalog, route, page, component, media, and publication state."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "wcmsContentCatalogModel-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should come away knowing that the content catalog is the data model behind what Axis manages and what Nexus or Agora can render. A business user should understand that changing content, navigation, header, footer, or page visibility is a governed business operation. A developer should understand that content records, media records, routes, and renderer metadata must be created together. An operator should understand that Online delivery is proven by catalog version, route, page, component, media artifact, and access policy."
        },
        {
          "kind": "paragraph",
          "text": "When a project introduces a new corporate site or storefront, the content pack must be complete. Import should prepare media files, media objects, pages, components, navigation, routes, publication metadata, and access rules. A partial pack creates a user journey that looks initialized but still cannot render the real public experience."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsContentCatalogModel-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Rendering Nexus or Agora content from frontend constants after a fresh schema.",
            "Importing page records without the required media records and files.",
            "Treating Staged content as visible public content.",
            "Using one catalog for unrelated sites without access and lifecycle clarity.",
            "Forgetting that navigation and headers are also content."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsContentCatalogModel-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify the content catalog model by importing a complete site pack, approving and publishing it Online, then opening the public route. The browser should render backend-owned content. A fresh schema should show a professional maintenance page until Online content exists."
        }
      ],
      "searchText": "Content Catalog Model How sites, catalogs, pages, components, media, routes, access policy, and publication state drive public content. # Content Catalog Model\n\nThe content catalog model explains how Nodics stores and delivers CMS-backed content such as pages, components, documentation, navigation, media references, headers, footers, Nexus content, and Agora storefront content. It exists because public applications must not hardcode business content when the content is expected to be managed, approved, published, localized, searched, and governed from Axis.\n\nFor a beginner, the safe model is: content is prepared in Staged, reviewed and approved, then published Online. Nexus and Agora consume Online content only. Axis is the management surface, but WCMS and backend content packs own the records.\n\n## Catalog objects\n\n| Object | Purpose | Business impact |\n| --- | --- | --- |\n| Site | Defines the public or authenticated experience being delivered. | Separates Nexus, Agora, documentation, and partner sites. |\n| Catalog | Holds versioned content for a site or product area. | Lets teams manage Staged and Online content separately. |\n| Page | Represents a route-level content experience. | Controls what users see for a URL. |\n| Component | Provides renderable content blocks. | Lets business users assemble page areas. |\n| Media | Connects files and metadata to content. | Enables images, documents, and assets without frontend bundling. |\n| Access policy | Controls public or authenticated visibility. | Prevents draft or restricted content from leaking. |\n\n## Data flow\n\n```mermaid\nflowchart LR\n  Pack[\"Content pack\"] --> Staged[\"Staged catalog\"]\n  Axis[\"Axis authoring\"] --> Staged\n  Staged --> Approval[\"Review and approval\"]\n  Approval --> Online[\"Online catalog\"]\n  Online --> Nexus[\"Nexus\"]\n  Online --> Agora[\"Agora\"]\n```\n\n## Customization and extension\n\nProjects can add content catalogs for their own corporate sites, storefronts, documentation sets, and partner experiences. The project pack should include pages, components, routes, media records, media assets, publication metadata, and access policy. The installer may prepare this structure, but the project must own its content rather than depending on reference Kickoff sample data.\n\n## Operator view\n\nOperators should be able to inspect which content pack imported a record, which catalog version is Staged, which release is Online, which route is active, and whether the media artifact exists. If a public site does not render, the investigation should start with site, catalog, route, page, component, media, and publication state.\n\n## Reader and implementation contract\n\nA beginner should come away knowing that the content catalog is the data model behind what Axis manages and what Nexus or Agora can render. A business user should understand that changing content, navigation, header, footer, or page visibility is a governed business operation. A developer should understand that content records, media records, routes, and renderer metadata must be created together. An operator should understand that Online delivery is proven by catalog version, route, page, component, media artifact, and access policy.\n\nWhen a project introduces a new corporate site or storefront, the content pack must be complete. Import should prepare media files, media objects, pages, components, navigation, routes, publication metadata, and access rules. A partial pack creates a user journey that looks initialized but still cannot render the real public experience.\n\n## Common mistakes\n\n- Rendering Nexus or Agora content from frontend constants after a fresh schema.\n- Importing page records without the required media records and files.\n- Treating Staged content as visible public content.\n- Using one catalog for unrelated sites without access and lifecycle clarity.\n- Forgetting that navigation and headers are also content.\n\n## Verification\n\nVerify the content catalog model by importing a complete site pack, approving and publishing it Online, then opening the public route. The browser should render backend-owned content. A fresh schema should show a professional maintenance page until Online content exists.\n",
      "previous": {
        "title": "WCMS content management",
        "route": "/docs/framework/wcms-overview"
      },
      "next": {
        "title": "Page Designer and Components",
        "route": "/docs/framework/wcms-page-designer-components"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "wcms",
        "owner": "wcms",
        "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "wordCount": 556,
        "checksum": "4fb490565fd81b51ec808850517d91986338bb730fcb42cdb07c2aa79d729fab"
      },
      "slug": "wcms-content-catalog-model",
      "locale": "en",
      "navigationGroup": "Content Model and Delivery",
      "navigationGroupCode": "content-model-and-delivery",
      "navigationGroupOrder": 10,
      "navigationOrder": 20,
      "references": [
        {
          "documentId": "wcms.media-management",
          "owner": "media"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record2": {
    "code": "nodicsDocsComponentwcmsPageDesignerComponents",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.page-designer-components",
      "title": "Page Designer and Components",
      "route": "/docs/framework/wcms-page-designer-components",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "Page Designer and Components"
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
      "summary": "How Axis-managed content areas, components, renderer metadata, sequence, validation, and publishing work together.",
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
        "wcms.media-management",
        "wcms.publishing-lifecycle",
        "docs.overview"
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
        "table"
      ],
      "searchKeywords": [
        "page-designer",
        "component-renderer",
        "content-area"
      ],
      "topicKeywords": [
        "WCMS and Content Management",
        "Content Model and Delivery",
        "Page Designer and Components"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Page Designer and Components explain how Axis can let business users manage page structure without making the frontend the owner of content. This topic is separate from the general WCMS overview because it is the user-facing authoring journey. A business user thinks in terms of content areas, navigation, headers, footers, banners, cards, and links. A developer thinks in terms of component types, renderers, slots, properties, validation, and publication."
        },
        {
          "kind": "paragraph",
          "text": "Both views must meet in the content catalog."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Authoring journey",
          "anchor": "wcmsPageDesignerComponents-1-authoring-journey"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart TD\n  User[\"Business user in Axis\"] --> Page[\"Open page or navigation component\"]\n  Page --> Edit[\"Edit content area, sequence, label, or component properties\"]\n  Edit --> Validate[\"Backend validation\"]\n  Validate --> Staged[\"Save to Staged\"]\n  Staged --> Approval[\"Submit for approval\"]\n  Approval --> Online[\"Publish Online\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Component contract",
          "anchor": "wcmsPageDesignerComponents-2-component-contract"
        },
        {
          "kind": "table",
          "headers": [
            "Area",
            "Business meaning",
            "Technical meaning"
          ],
          "rows": [
            [
              "Content area",
              "A region of a page that can hold components.",
              "Slot or composition metadata."
            ],
            [
              "Component",
              "A visible piece of content or interaction.",
              "Typed record with renderer, properties, and validation."
            ],
            [
              "Renderer",
              "How the component appears in Axis, Nexus, or Agora.",
              "Frontend implementation selected by backend metadata."
            ],
            [
              "Sequence",
              "Ordering of visible items.",
              "Backend-managed position or relation."
            ],
            [
              "Access",
              "Who can view or edit the content.",
              "Access policy and permission checks."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "wcmsPageDesignerComponents-3-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects can introduce new component types and renderers when the business experience needs them. The backend record must declare the component type, properties, renderer key, channels, validation rules, publication behavior, and access policy. Axis can render the editing journey, but the component definition and data remain backend-owned."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Business and operator impact",
          "anchor": "wcmsPageDesignerComponents-4-business-and-operator-impact"
        },
        {
          "kind": "paragraph",
          "text": "This model lets business users change content safely without asking developers to redeploy for every label, image, navigation order, or campaign message. Operators still have governance because edits go through Staged and Online publication, and each change can be audited by actor, timestamp, target site, component, and route."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "wcmsPageDesignerComponents-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand that Page Designer is not a separate CMS hidden inside Axis. It is a user-friendly view over backend-owned content catalog records. A business user should see familiar concepts such as page, slot, component, sequence, visibility, and publish status. A developer should see component type, renderer key, property schema, validation, and project extension path. An operator should see audit, publication state, Online route, and rollback evidence."
        },
        {
          "kind": "paragraph",
          "text": "Every component type needs a stable contract. The documentation should show which properties are configurable, which renderer consumes them, what happens when a property is missing, which channels can render the component, and how the component behaves across Axis, Nexus, Agora, and authenticated views."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsPageDesignerComponents-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Hardcoding headers, footers, navigation, or hero sections in public apps.",
            "Creating an Axis editor that saves records without publication workflow.",
            "Allowing a renderer property that the backend contract does not validate.",
            "Showing draft Staged components on Nexus or Agora.",
            "Forgetting responsive and accessibility checks for new renderers."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsPageDesignerComponents-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify a component journey by creating or updating a component from Axis, saving it to Staged, approving publication, refreshing public delivery, and checking the browser. Tests should cover renderer fallback, invalid properties, permission failures, and Online-only visibility."
        }
      ],
      "searchText": "Page Designer and Components How Axis-managed content areas, components, renderer metadata, sequence, validation, and publishing work together. # Page Designer and Components\n\nPage Designer and Components explain how Axis can let business users manage page structure without making the frontend the owner of content. This topic is separate from the general WCMS overview because it is the user-facing authoring journey. A business user thinks in terms of content areas, navigation, headers, footers, banners, cards, and links. A developer thinks in terms of component types, renderers, slots, properties, validation, and publication.\n\nBoth views must meet in the content catalog.\n\n## Authoring journey\n\n```mermaid\nflowchart TD\n  User[\"Business user in Axis\"] --> Page[\"Open page or navigation component\"]\n  Page --> Edit[\"Edit content area, sequence, label, or component properties\"]\n  Edit --> Validate[\"Backend validation\"]\n  Validate --> Staged[\"Save to Staged\"]\n  Staged --> Approval[\"Submit for approval\"]\n  Approval --> Online[\"Publish Online\"]\n```\n\n## Component contract\n\n| Area | Business meaning | Technical meaning |\n| --- | --- | --- |\n| Content area | A region of a page that can hold components. | Slot or composition metadata. |\n| Component | A visible piece of content or interaction. | Typed record with renderer, properties, and validation. |\n| Renderer | How the component appears in Axis, Nexus, or Agora. | Frontend implementation selected by backend metadata. |\n| Sequence | Ordering of visible items. | Backend-managed position or relation. |\n| Access | Who can view or edit the content. | Access policy and permission checks. |\n\n## Customization and extension\n\nProjects can introduce new component types and renderers when the business experience needs them. The backend record must declare the component type, properties, renderer key, channels, validation rules, publication behavior, and access policy. Axis can render the editing journey, but the component definition and data remain backend-owned.\n\n## Business and operator impact\n\nThis model lets business users change content safely without asking developers to redeploy for every label, image, navigation order, or campaign message. Operators still have governance because edits go through Staged and Online publication, and each change can be audited by actor, timestamp, target site, component, and route.\n\n## Reader and implementation contract\n\nA beginner should understand that Page Designer is not a separate CMS hidden inside Axis. It is a user-friendly view over backend-owned content catalog records. A business user should see familiar concepts such as page, slot, component, sequence, visibility, and publish status. A developer should see component type, renderer key, property schema, validation, and project extension path. An operator should see audit, publication state, Online route, and rollback evidence.\n\nEvery component type needs a stable contract. The documentation should show which properties are configurable, which renderer consumes them, what happens when a property is missing, which channels can render the component, and how the component behaves across Axis, Nexus, Agora, and authenticated views.\n\n## Common mistakes\n\n- Hardcoding headers, footers, navigation, or hero sections in public apps.\n- Creating an Axis editor that saves records without publication workflow.\n- Allowing a renderer property that the backend contract does not validate.\n- Showing draft Staged components on Nexus or Agora.\n- Forgetting responsive and accessibility checks for new renderers.\n\n## Verification\n\nVerify a component journey by creating or updating a component from Axis, saving it to Staged, approving publication, refreshing public delivery, and checking the browser. Tests should cover renderer fallback, invalid properties, permission failures, and Online-only visibility.\n",
      "previous": {
        "title": "Content Catalog Model",
        "route": "/docs/framework/wcms-content-catalog-model"
      },
      "next": {
        "title": "Site Publication and Visibility",
        "route": "/docs/framework/wcms-site-publication-visibility"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "wcms",
        "owner": "wcms",
        "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "wordCount": 505,
        "checksum": "7efdfb35a6befd11b60237ce792e64e4c4bb29bca90d81eb9f74a9de3f6ebe53"
      },
      "slug": "wcms-page-designer-components",
      "locale": "en",
      "navigationGroup": "Content Model and Delivery",
      "navigationGroupCode": "content-model-and-delivery",
      "navigationGroupOrder": 10,
      "navigationOrder": 30,
      "references": [
        {
          "documentId": "wcms.media-management",
          "owner": "media"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  },
  "record3": {
    "code": "nodicsDocsComponentwcmsSitePublicationVisibility",
    "typeCode": "nodicsDocumentationArticleComponentType",
    "renderer": "documentation.component.article",
    "accessMode": "PUBLIC",
    "properties": {
      "code": "wcms.site-publication-visibility",
      "title": "Site Publication and Visibility",
      "route": "/docs/framework/wcms-site-publication-visibility",
      "section": "wcms-and-content-management",
      "sectionTitle": "WCMS and Content Management",
      "group": "wcms-and-content-management",
      "groupTitle": "WCMS and Content Management",
      "parentId": "wcms-and-content-management",
      "hierarchyPath": [
        "WCMS and Content Management",
        "Site Publication and Visibility"
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
      "summary": "How Staged, approval, Online, access policy, maintenance pages, and public delivery determine what users see.",
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
        "wcms.media-management",
        "wcms.publishing-lifecycle",
        "docs.overview"
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
        "table"
      ],
      "searchKeywords": [
        "site-publication",
        "visibility",
        "maintenance-page",
        "online-only"
      ],
      "topicKeywords": [
        "WCMS and Content Management",
        "Content Model and Delivery",
        "Site Publication and Visibility"
      ],
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
      "blocks": [
        {
          "kind": "paragraph",
          "text": "Site Publication and Visibility explain when content becomes visible to Axis, Nexus, Agora, and public users. This page belongs under WCMS because visibility is not only a frontend route decision. It depends on site, catalog, page, component, media, access policy, Staged state, approval, Online state, and runtime delivery."
        },
        {
          "kind": "paragraph",
          "text": "For a beginner, the rule is simple: if content is not Online for the target site and access policy, the public application should not display it. It may show a customer-friendly maintenance page, but it must not leak Staged or fallback sample content."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Visibility flow",
          "anchor": "wcmsSitePublicationVisibility-1-visibility-flow"
        },
        {
          "kind": "diagram",
          "language": "mermaid",
          "text": "flowchart LR\n  Draft[\"Author or import\"] --> Staged[\"Staged content\"]\n  Staged --> Review[\"Review task\"]\n  Review --> Approved[\"Approved publication\"]\n  Approved --> Online[\"Online catalog\"]\n  Online --> Public[\"Nexus, Agora, docs, or partner site\"]"
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Visibility matrix",
          "anchor": "wcmsSitePublicationVisibility-2-visibility-matrix"
        },
        {
          "kind": "table",
          "headers": [
            "State",
            "Axis authoring",
            "Axis reading",
            "Nexus/Agora public",
            "Notes"
          ],
          "rows": [
            [
              "Not imported",
              "Recovery or setup journey.",
              "Not available except setup guidance.",
              "Maintenance page.",
              "User needs initialization."
            ],
            [
              "Staged",
              "Editable by permitted users.",
              "Preview only where supported.",
              "Not visible.",
              "Approval required."
            ],
            [
              "Approval in progress",
              "Review decision needed.",
              "Review evidence visible to permitted users.",
              "Previous Online remains active.",
              "Same screen should guide the user."
            ],
            [
              "Online",
              "Managed with audit and history.",
              "Available by access policy.",
              "Visible by access policy.",
              "Navigation should refresh after mutation."
            ]
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Customization and extension",
          "anchor": "wcmsSitePublicationVisibility-3-customization-and-extension"
        },
        {
          "kind": "paragraph",
          "text": "Projects can define public, authenticated, role-based, group-based, permission-based, or restricted visibility. The content pack and Axis editing surface must expose this clearly. A customer corporate site may choose public marketing pages, authenticated partner pages, and internal Axis-only documentation within the same governance model."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Operator view",
          "anchor": "wcmsSitePublicationVisibility-4-operator-view"
        },
        {
          "kind": "paragraph",
          "text": "When a public page is missing, operators should inspect the site code, route, catalog, Online version, page record, component records, media artifacts, access policy, and publication audit. A green import does not always mean the public route is Online; import only prepares the Staged copy unless the workflow explicitly publishes."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Reader and implementation contract",
          "anchor": "wcmsSitePublicationVisibility-5-reader-and-implementation-contract"
        },
        {
          "kind": "paragraph",
          "text": "A beginner should understand the difference between imported, Staged, approval, Online, and retired content before diagnosing a public page. A business user should know whether a missing page means content is not ready, approval is pending, or visibility is restricted. A developer should know which records must be created for a route to render. An operator should know which Online evidence proves the page is live."
        },
        {
          "kind": "paragraph",
          "text": "Visibility documentation must cover both positive and negative outcomes. It is not enough to say how a page appears. The page must also explain what a public application shows when content is missing, when access is restricted, when a publication is rejected, and when a previous Online version remains active while a new Staged release is waiting for review."
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Common mistakes",
          "anchor": "wcmsSitePublicationVisibility-6-common-mistakes"
        },
        {
          "kind": "unordered-list",
          "items": [
            "Expecting an imported Staged page to appear on Nexus immediately.",
            "Showing stale navigation until the user manually refreshes after approval.",
            "Hiding approval tasks in a separate workflow page without context.",
            "Treating Swagger/OpenAPI as a CMS publication item.",
            "Forgetting that media visibility must follow the page and access policy."
          ]
        },
        {
          "kind": "heading",
          "level": 2,
          "text": "Verification",
          "anchor": "wcmsSitePublicationVisibility-7-verification"
        },
        {
          "kind": "paragraph",
          "text": "Verify visibility with a fresh schema and a browser. Before publication, Nexus and Agora should show the maintenance state. After import, approval, and Online publication, the public pages, headers, footers, images, and links should come from backend records. Unauthorized users must not see restricted pages."
        }
      ],
      "searchText": "Site Publication and Visibility How Staged, approval, Online, access policy, maintenance pages, and public delivery determine what users see. # Site Publication and Visibility\n\nSite Publication and Visibility explain when content becomes visible to Axis, Nexus, Agora, and public users. This page belongs under WCMS because visibility is not only a frontend route decision. It depends on site, catalog, page, component, media, access policy, Staged state, approval, Online state, and runtime delivery.\n\nFor a beginner, the rule is simple: if content is not Online for the target site and access policy, the public application should not display it. It may show a customer-friendly maintenance page, but it must not leak Staged or fallback sample content.\n\n## Visibility flow\n\n```mermaid\nflowchart LR\n  Draft[\"Author or import\"] --> Staged[\"Staged content\"]\n  Staged --> Review[\"Review task\"]\n  Review --> Approved[\"Approved publication\"]\n  Approved --> Online[\"Online catalog\"]\n  Online --> Public[\"Nexus, Agora, docs, or partner site\"]\n```\n\n## Visibility matrix\n\n| State | Axis authoring | Axis reading | Nexus/Agora public | Notes |\n| --- | --- | --- | --- | --- |\n| Not imported | Recovery or setup journey. | Not available except setup guidance. | Maintenance page. | User needs initialization. |\n| Staged | Editable by permitted users. | Preview only where supported. | Not visible. | Approval required. |\n| Approval in progress | Review decision needed. | Review evidence visible to permitted users. | Previous Online remains active. | Same screen should guide the user. |\n| Online | Managed with audit and history. | Available by access policy. | Visible by access policy. | Navigation should refresh after mutation. |\n\n## Customization and extension\n\nProjects can define public, authenticated, role-based, group-based, permission-based, or restricted visibility. The content pack and Axis editing surface must expose this clearly. A customer corporate site may choose public marketing pages, authenticated partner pages, and internal Axis-only documentation within the same governance model.\n\n## Operator view\n\nWhen a public page is missing, operators should inspect the site code, route, catalog, Online version, page record, component records, media artifacts, access policy, and publication audit. A green import does not always mean the public route is Online; import only prepares the Staged copy unless the workflow explicitly publishes.\n\n## Reader and implementation contract\n\nA beginner should understand the difference between imported, Staged, approval, Online, and retired content before diagnosing a public page. A business user should know whether a missing page means content is not ready, approval is pending, or visibility is restricted. A developer should know which records must be created for a route to render. An operator should know which Online evidence proves the page is live.\n\nVisibility documentation must cover both positive and negative outcomes. It is not enough to say how a page appears. The page must also explain what a public application shows when content is missing, when access is restricted, when a publication is rejected, and when a previous Online version remains active while a new Staged release is waiting for review.\n\n## Common mistakes\n\n- Expecting an imported Staged page to appear on Nexus immediately.\n- Showing stale navigation until the user manually refreshes after approval.\n- Hiding approval tasks in a separate workflow page without context.\n- Treating Swagger/OpenAPI as a CMS publication item.\n- Forgetting that media visibility must follow the page and access policy.\n\n## Verification\n\nVerify visibility with a fresh schema and a browser. Before publication, Nexus and Agora should show the maintenance state. After import, approval, and Online publication, the public pages, headers, footers, images, and links should come from backend records. Unauthorized users must not see restricted pages.\n",
      "previous": {
        "title": "Page Designer and Components",
        "route": "/docs/framework/wcms-page-designer-components"
      },
      "next": {
        "title": "Product Catalog and Discovery Management",
        "route": "/docs/framework/catalog-product-discovery-management"
      },
      "source": {
        "repository": "nodics.ai",
        "functionalModule": "nodics.wcms",
        "technicalModule": "wcms",
        "owner": "wcms",
        "sourcePath": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "path": "data/docs-v001/records/documentation/wcmsDocumentationComponentData.js",
        "wordCount": 532,
        "checksum": "6594f8fb04c7f24b5ab68d440de27c0af104b7192ffbec5dc0b2f7b8cb9ddf06"
      },
      "slug": "wcms-site-publication-visibility",
      "locale": "en",
      "navigationGroup": "Content Model and Delivery",
      "navigationGroupCode": "content-model-and-delivery",
      "navigationGroupOrder": 10,
      "navigationOrder": 40,
      "references": [
        {
          "documentId": "wcms.media-management",
          "owner": "media"
        },
        {
          "documentId": "wcms.publishing-lifecycle",
          "owner": "cms"
        },
        {
          "documentId": "docs.overview",
          "owner": "nodics.docs"
        }
      ]
    },
    "active": true
  }
};
