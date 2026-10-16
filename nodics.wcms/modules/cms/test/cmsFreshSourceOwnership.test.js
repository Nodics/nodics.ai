/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - governed by the repository LICENSE. */
/**
 * @module cms/test/cmsFreshSourceOwnership
 * @description Tests only explicitly known fresh CMS website sources, not live adoption.
 * @owner cms
 * @layer test
 */
const path = require('node:path');
const { registerSourceOwnershipTests } = require('./helpers/freshSourceOwnership');
const repoRoot = path.resolve(__dirname, '../../../..');
require('node:test').test('fresh framework CMS ownership uses explicit successor metadata within v001', () => {
    const assert = require('node:assert/strict');
    for (const [owner, code] of [['nodics.wcms/modules/cms', 'init-v001'], ['nodics.platform/modules/axis', 'axisBaseline']]) {
        const section = require(path.join(repoRoot, owner, 'data/manifest.json')).sections[code];
        assert.equal(section.version, '0.0.2', owner);
        assert(Object.keys(section.files).every(file => file.startsWith('init-v001/')), owner);
    }
});
registerSourceOwnershipTests(repoRoot, [
    {
        "header": "nodics.wcms/modules/cms/data/init-v001/headers/content/defaultCmsSiteDataHeader.js",
        "dir": "nodics.wcms/modules/cms/data/init-v001/records/content",
        "site": "defaultCmsSite",
        "catalog": "defaultContentCatalog",
        "prefixes": [
            "defaultCmsSiteData"
        ]
    },
    {
        "header": "nodics.platform/modules/axis/data/init-v001/headers/axis/axisContentCatalogHeader.js",
        "dir": "nodics.platform/modules/axis/data/init-v001/records/axis",
        "site": "axisCmsSite",
        "catalog": "axisContentCatalog",
        "prefixes": [
            "axisCmsSiteData",
            "axisCmsTypeCodeData",
            "axisCmsRendererData",
            "axisCmsSlotData",
            "axisCmsTemplateData",
            "axisCmsComponentData",
            "axisCmsPageData",
            "axisCmsRouteData"
        ]
    },
    {
        "header": "nodics.docs/data/docs-v001/headers/000_nodicsDocumentationContentPackHeader.js",
        // Historical immutable source, not the current editable documentation selection.
        "sealedHistoricalSource": true,
        "dir": "nodics.docs/data/docs-v001/records/documentation",
        "site": "nodicsDocumentationSite",
        "catalog": "documentationContentCatalog",
        "prefixes": [
            "nodicsDocumentationComponentData",
            "nodicsDocumentationPageData",
            "nodicsDocumentationRouteData",
            "nodicsDocumentationSiteData",
            "nodicsDocumentationTypeCodeData",
            "nodicsDocumentationRendererData",
            "nodicsDocumentationSlotData",
            "nodicsDocumentationTemplateBootstrapData",
            "nodicsDocumentationTemplateData"
        ]
    },
    {
        "header": "nodics.platform/modules/axis/data/docs-v001/headers/axisDocumentationContentPackHeader.js",
        "sealedHistoricalSource": true,
        "dir": "nodics.platform/modules/axis/data/docs-v001/records/documentation",
        "site": "axisDocumentationSite",
        "catalog": "documentationContentCatalog",
        "prefixes": [
            "axisDocumentationSiteData",
            "axisDocumentationTypeCodeData",
            "axisDocumentationRendererData",
            "axisDocumentationTemplateData",
            "axisDocumentationSlotData",
            "axisDocumentationComponentData",
            "axisDocumentationPageData",
            "axisDocumentationRouteData"
        ]
    },
    {
        "header": "nodics.accelerators/modules/waste/modules/eWaste/data/docs-v001/headers/circaDocumentationContentPackHeader.js",
        "sealedHistoricalSource": true,
        "dir": "nodics.accelerators/modules/waste/modules/eWaste/data/docs-v001/records/documentation",
        "site": "circaDocumentationSite",
        "catalog": "documentationContentCatalog",
        "prefixes": [
            "circaDocumentationSiteData"
        ]
    }
]);
