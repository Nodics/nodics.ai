/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/data/init/data/content/defaultCmsTypeCodeData
 * @description Default CMS type-code records used to classify pages and components.
 * @layer data
 * @owner cms
 * @override Project modules may provide later type-code data contributions for project-specific content types.
 */
module.exports = {
    record0: {
        code: 'headerComponentType',
        active: true,
    },
    record1: {
        code: 'mainComponentType',
        active: true,
    },
    record2: {
        code: 'footerComponentType',
        active: true,
    },
    record3: {
        code: 'paragraphComponentType',
        active: true,
    },
    record4: {
        code: 'htmlComponentType',
        active: true,
    },
    record5: {
        code: 'textComponentType',
        active: true
    },
    record6: {
        code: 'imageTextComponentType',
        active: true,
        mediaSchema: {
            allowedReferenceTypes: ['MEDIA', 'MEDIA_SET'],
            allowedRoles: ['primary'],
            maximumReferences: 1
        },
        propertySchema: {
            title: { type: 'string', localized: true, required: false, description: 'Text title rendered with the image' },
            summary: { type: 'string', localized: true, required: false, description: 'Short text rendered with the image' },
            ctaLabel: { type: 'string', localized: true, required: false, description: 'Optional call-to-action label' },
            ctaUrl: { type: 'string', localized: false, required: false, description: 'Optional safe application URL or route key' }
        }
    },
    record7: {
        code: 'imageComponentType',
        active: true,
        mediaSchema: {
            allowedReferenceTypes: ['MEDIA', 'MEDIA_SET'],
            allowedRoles: ['primary'],
            maximumReferences: 1
        },
        propertySchema: {
            caption: { type: 'string', localized: true, required: false, description: 'Optional display caption owned by CMS content' }
        }
    },
    record8: {
        code: 'imagesComponentType',
        active: true,
        mediaSchema: {
            allowedReferenceTypes: ['MEDIA', 'MEDIA_SET'],
            allowedRoles: ['gallery', 'thumbnail', 'primary'],
            maximumReferences: 100
        }
    },
    record9: {
        code: 'menuComponentType',
        active: true
    },
    record10: {
        code: 'menuLinkComponentType',
        active: true
    },
    record11: {
        code: 'navigationalComponentType',
        active: true
    },
    record12: {
        code: 'logoComponentType',
        active: true
    },
    record13: {
        code: 'loginHomePageType',
        kind: 'PAGE',
        active: true,
    },
    record14: {
        code: 'signUpHomePageType',
        kind: 'PAGE',
        active: true,
    },
    record15: {
        code: 'oneHomePageType',
        kind: 'PAGE',
        active: true,
    },
    record16: {
        code: 'titleComponentType',
        active: true,
    },
    record17: {
        code: 'buttonComponentType',
        active: true,
    },
    record18: {
        code: 'headerStickyComponentType',
        active: true,
    },
    record19: {
        code: 'homePageBannerComponentType',
        active: true,
        mediaSchema: {
            allowedReferenceTypes: ['MEDIA', 'MEDIA_SET'],
            allowedRoles: ['background', 'primary', 'mobile', 'desktop'],
            maximumReferences: 10
        },
        propertySchema: {
            heading: { type: 'string', localized: true, required: true, requiredLocales: ['en', 'ar'], description: 'Banner heading text' },
            subheading: { type: 'string', localized: true, required: false, description: 'Banner supporting text' },
            ctaLabel: { type: 'string', localized: true, required: false, description: 'Banner call-to-action label' },
            ctaUrl: { type: 'string', localized: false, required: false, description: 'Safe application URL or route key' },
            analyticsId: { type: 'string', localized: false, required: false, description: 'Stable analytics identity shared by every locale' }
        }
    },
    record20: {
        code: 'homePageSectionComponentType',
        active: true,
    },
};
