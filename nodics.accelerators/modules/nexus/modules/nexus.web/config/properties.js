/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nexus.web/config/properties
 * @description Declares reusable Nexus authoring, media and reference publication defaults.
 * @layer configuration
 * @owner nexus.web
 * @override A deployment may replace the local provider coordinates without changing CMS content records.
 */
module.exports = {
    tooling: {
        commands: {
            "nexus:check": { handler: "@nTooling/node-script", script: "test/nexusCorporateContentContract.test.mjs", description: "Validate Nexus accelerator content and immutable release integrity" }
        }
    },
    cms: {
        publication: { baselines: {
          "nexus": {
            "releaseCode": "nexus.web:nexusCorporateSite",
            "releaseVersion": "0.0.4",
            "dataType": "sample",
            "rootType": "site",
            "rootCode": "nexusCorporateSite",
            "sourceVersion": "0"
          }
        } },
        designerAuthoring: {
            draftDefaults: {
                accessMode: 'PUBLIC',
                catalogCode: 'nexusContentCatalog',
                siteCode: 'nexusCorporateSite',
                templateCode: 'nexusCorporatePageTemplate',
                pageTypeCode: 'nexusCorporateStandardPageType',
                pageRenderer: 'nexus.page.standard',
                slots: ['main']
            },
            componentKinds: [
                { label: 'Nexus hero', typeCode: 'nexusPageHeroType', renderer: 'nexus.hero', fields: [
                    { property: 'title', label: 'Heading', labelKey: 'cms.field.heading', control: 'text', required: true, maxLength: 240 },
                    { property: 'body', label: 'Body text', labelKey: 'cms.field.body', control: 'multiline', maxLength: 10000 }
                ] },
                { label: 'Nexus content section', typeCode: 'nexusContentSectionType', renderer: 'nexus.contentSection', fields: [
                    { property: 'heading', label: 'Heading', labelKey: 'cms.field.heading', control: 'text', required: true, maxLength: 240 },
                    { property: 'body', label: 'Body text', labelKey: 'cms.field.body', control: 'multiline', maxLength: 10000 }
                ] },
                { label: 'Nexus card grid', typeCode: 'nexusCardGridType', renderer: 'nexus.cardGrid', fields: [
                    { property: 'heading', label: 'Heading', labelKey: 'cms.field.heading', control: 'text', required: true, maxLength: 240 },
                    { property: 'body', label: 'Introductory text', labelKey: 'cms.field.introduction', control: 'multiline', maxLength: 10000 },
                    { property: 'items', label: 'Cards', labelKey: 'cms.field.cards', itemLabel: 'Card', itemLabelKey: 'cms.field.card', control: 'items', required: true, maximumItems: 12, itemFields: [
                        { property: 'title', label: 'Card heading', labelKey: 'cms.field.card-heading', control: 'text', required: true, maxLength: 160 },
                        { property: 'text', label: 'Card text', labelKey: 'cms.field.card-text', control: 'multiline', maxLength: 2000 }
                    ] }
                ] }
            ]
        }
    },
    media: {
        folders: {
            nexusContentAssets: {
                code: 'nexusContentAssets',
                name: 'Nexus Content Assets',
                description: 'Public corporate assets referenced by Nexus CMS components.',
                storagePrefix: 'media/content/nexus',
                access: 'PUBLIC',
                allowedExtensions: ['avif', 'webp', 'png', 'jpg', 'jpeg', 'svg'],
                allowedMimeTypes: ['image/avif', 'image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'],
                maximumFileSizeBytes: 10485760,
                retentionDays: 0,
                status: 'ACTIVE'
            }
        }
    }
};
