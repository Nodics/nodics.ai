/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Generated Nodics framework documentation search metadata. */
module.exports = {
  "record0": {
    "code": "nodicsDocsSearchnodenodicsdocsnodepageapplicationsnexusdatacontentguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "NODE",
    "targetCode": "nodicsDocsNodePageapplicationsNexusDataContentGuide",
    "title": "Nexus Data and Content Guide",
    "summary": "How Nexus corporate content, media, editorial, engagement, Staged publication, Online delivery, and browser validation are authored from accelerator-owned reference releases and customer overlays.",
    "searchText": "Nexus Data and Content Guide How Nexus corporate content, media, editorial, engagement, Staged publication, Online delivery, and browser validation are authored from accelerator-owned reference releases and customer overlays. nexus corporate-site content-pack media-assets online-delivery",
    "keywords": [
      "nexus",
      "corporate-site",
      "content-pack",
      "media-assets",
      "online-delivery"
    ],
    "facets": {
      "nodeLevel": "PAGE_LINK",
      "nodeType": "PAGE",
      "audience": [
        "business",
        "architect",
        "administrator",
        "developer",
        "operator",
        "qa",
        "ai-tool"
      ]
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  },
  "record1": {
    "code": "nodicsDocsSearchpagenodicsdocsmetadataapplicationsnexusdatacontentguide",
    "product": "nodicsDocumentationProduct",
    "targetType": "PAGE",
    "targetCode": "nodicsDocsMetadataapplicationsNexusDataContentGuide",
    "title": "Nexus Data and Content Guide",
    "summary": "How Nexus corporate content, media, editorial, engagement, Staged publication, Online delivery, and browser validation are authored from accelerator-owned reference releases and customer overlays.",
    "searchText": "Nexus Data and Content Guide How Nexus corporate content, media, editorial, engagement, Staged publication, Online delivery, and browser validation are authored from accelerator-owned reference releases and customer overlays. # Nexus Data and Content Guide\n\nNexus is a reusable corporate website accelerator under `nodics.accelerators/modules/nexus`. It is a business application that renders published content, but it is not the data authority for sites, pages, media, articles, forms, or navigation. Those objects are authored as governed data releases, imported into the owning backend modules, reviewed in Staged, and made visible through Online delivery. For beginners, the easiest model is this: Nexus is the window, WCMS and Media own the content contract, Engagement owns contact and testimonial records, and the accelerator content pack provides the reference release package.\n\n## Source map\n\n| Area | Current source |\n| --- | --- |\n| Module package and lifecycle | `../nodics.accelerators/modules/nexus/modules/nexus.web/package.json`, `../nodics.accelerators/modules/nexus/modules/nexus.web/LIFECYCLE.md` |\n| Release manifest | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/manifest.json` |\n| WCMS headers | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/headers/wcms/` |\n| WCMS update headers | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/headers/wcmsUpdate/` |\n| Media headers and records | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/headers/media/`, `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/records/media/` |\n| Physical media assets | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/assets/nexus-cms-media/` |\n| Editorial records | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/records/editorial/` |\n| Engagement records | `../nodics.accelerators/modules/nexus/modules/nexus.web/data/sample-v001/content/records/engagement/` |\n| Browser application | `../../nodics.exp/nodics.nexus/package.json` |\n| Acceptance tests | `../nodics.accelerators/modules/nexus/modules/nexus.web/test/nexusCorporateContentContract.test.mjs` |\n\n## Release layout\n\nNexus retains the governed content-pack structure under its accelerator owner:\n\n```text\nnodics.accelerators/modules/nexus/modules/nexus.web/data/\n  sample-v001/\n    content/\n      headers/\n      records/\n      assets/\n  manifest.json\n```\n\nThe release folder tells the importer which lifecycle lane is being installed. `sample-v001` is accelerator-owned reference content governed by immutable manifest sections. Customer extensions use their own release boundaries. Inside it, `content` separates CMS, Media, Editorial, and Engagement records from commerce data. The `manifest.json` is generated by the system from the folder structure and file checksums; developers should not hand maintain it except during a deliberate tooling repair.\n\n## Header contract\n\nHeaders route each record file to its owning module and schema. The top-level key is the target module, the child key is a logical import item, `schemaName` is the backend schema, `operation` is the persistence behavior, and `query` defines idempotency.\n\n```js\nmodule.exports = {\n  cms: {\n    nexusCorporatePages: {\n      options: {\n        enabled: true,\n        schemaName: 'cmsPage',\n        operation: 'saveAll',\n        dataFilePrefix: 'nexusCorporatePageData'\n      },\n      query: { code: '$code', tenant: '$tenant' }\n    }\n  }\n};\n```\n\nBusiness users do not need to understand this file. Developers and AI tools do, because it is the safe routing contract between release data and backend authority. Record files must remain declarative. They can contain business keys, labels, relation codes, locale values, publication state, and asset references, but they must not call services, read environment variables, or generate runtime paths.\n\n## Import and publication flow\n\n```mermaid\nsequenceDiagram\n  participant Project as Nexus data release\n  participant Import as nImport\n  participant Media as Media module\n  participant Wcms as WCMS Staged\n  participant Governance as Review workflow\n  participant Online as WCMS Online\n  participant App as Nexus browser\n\n  Project->>Import: Select sample-v001 content\n  Import->>Media: Hydrate physical media assets\n  Import->>Wcms: Persist pages, routes, components, articles\n  Wcms->>Governance: Request publication approval\n  Governance->>Online: Activate approved manifest\n  Online->>App: Serve public route and media payload\n```\n\nNexus content should never be hardcoded into the frontend as the long-term truth. A component can show a clear unavailable state, but the published site must ultimately render from Online WCMS and Online Media. Operators should be able to trace an image or page from browser route to Online delivery pointer, publication manifest, Staged source record, and accelerator or customer release file.\n\n## Customization and extension guidance\n\nA project can customize Nexus in its own later-index content module, extending `nexus` and declaring its own immutable releases, adding new headers for additional schemas, adding new record maps, and placing physical assets under the release-owned assets folder. Developers should extend the owning backend module when a new schema or operation is required. Business users should use Axis for normal page, media, article, and form journeys once the backoffice capability is available.\n\nWhen a customer needs a new corporate page, the developer should add a page record, page route, layout or component relation, localized copy, media object, and media asset manifest entry. A QA owner should then import into a fresh schema, publish through Staged approval, open Nexus in the browser, and verify the route, title, navigation, media URL, and friendly empty states.\n\n## Troubleshooting\n\n| Symptom | Likely owner | User-safe message | Technical evidence |\n| --- | --- | --- | --- |\n| Page route is missing | WCMS data release | Content is not ready for this site. | Missing `cmsPageRoute` record or failed import run. |\n| Image is broken | Media import | Media is still being prepared. | Missing asset manifest entry, checksum failure, or Staged storage failure. |\n| Form is hidden | Engagement data | Contact form is not available. | Missing form definition or inactive version record. |\n| Nexus shows fallback copy | Publication | Latest approved content is not online yet. | No active Online manifest for the route. |\n\n## Common mistakes\n\n- Treating Nexus as the owner of corporate content instead of a consumer.\n- Adding a page record without its route, slot, component, or media relation.\n- Copying physical media into a frontend public folder instead of the release assets folder.\n- Hand editing generated manifest checksums after a file changes.\n- Showing technical import errors directly to a business user.\n\n## Verification\n\nRun the Nexus contract tests, regenerate data manifests, import into a fresh schema, publish to Online, and open Nexus from the browser. A successful check proves that developers can trace the release files, business users can see a clear setup journey, operators can inspect import and publication evidence, and production delivery reads Online records rather than frontend defaults.\n\n## Source migration and independent consumers\n\n`nexus` is composition-only. `nexusCore` owns reusable administration and tooling descriptors; `nexus.web` owns reference configuration, content, physical assets and release tests. The independent `nodics.nexus` frontend remains the renderer. The source move preserves the `nexus.web` identity and every data manifest/checksum.\n\nBackOffice media steps declare `manifestModule: \"nexus.web\"` and a module-relative manifest path. The registry supplies the actual root, and real-path containment rejects traversal and symlink escapes. Application Builder discovers the opted-in framework pack with source provenance and rejects duplicate customer copies. Configuration and catalogue discovery do not import or publish any content.\n\nRun `nodics nexus:check` for content and checksum validation. Qualify actual import, media transfer and Staged-to-Online publication separately after deployment.\n",
    "keywords": [
      "nexus",
      "corporate-site",
      "content-pack",
      "media-assets",
      "online-delivery",
      "Nodics Application Suite",
      "Application Overview",
      "Nexus Data and Content Guide"
    ],
    "facets": {
      "section": "nodics-application-suite",
      "group": "nodics-application-suite",
      "navigationDepth": 2,
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
      "maturityState": "operational"
    },
    "managedInAxis": true,
    "axisAuthoringPermissions": [
      "documentation.search.preview"
    ],
    "workflowRequired": true,
    "workflowTriggers": [
      "SEARCH_METADATA_CHANGE"
    ],
    "locale": "en",
    "channel": "web",
    "accessPolicy": "nodicsDocsAccessPublic",
    "accessMode": "PUBLIC",
    "lifecycleState": "ONLINE",
    "indexState": "INDEX_READY",
    "active": true
  }
};
