/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/config/properties
 * @description Configurable WCMS Experience defaults for resolver, projection, indexing, and delivery safety.
 * @layer configuration
 * @owner wcmsExperience
 * @override Project, environment, server, node, or tenant layers may tune limits and provider choices.
 */
module.exports = {
    wcmsExperience: {
        enabled: true,
        resolver: {
            enabled: true,
            defaultLocale: 'en-US',
            defaultChannel: 'web',
            defaultDevice: 'desktop',
            maxSlots: 20,
            maxComponents: 200,
            maxDepth: 10,
            fallbackTargetType: 'DEFAULT',
            fallbackTargetCode: '*'
        },
        indexing: {
            mode: 'OUTBOX_EVENTUAL',
            stagedAliasTemplate: 'cms_experience_${site}_staged_current',
            onlineAliasTemplate: 'cms_experience_${site}_online_current',
            preservePreviousOnlineAliasOnFailure: true
        },
        projection: {
            provider: 'DISCOVERY',
            ownerType: 'WCMS_EXPERIENCE',
            indexConfigurationCode: 'cmsExperiencePlacement',
            indexName: 'discoveryDocumentProjection',
            status: 'CURRENT',
            fixtureFallbackEnabled: true,
            publicationPolicy: { batchSize: 100, aliasSwitch: true, rollbackEnabled: true }
        },
        cache: {
            enabled: true,
            ttl: 30000
        },
        backoffice: {
            capabilityCode: 'wcms-experience-studio',
            displayName: 'Experience Studio',
            documentationRoute: '/docs/capabilities/content-publishing/experience-targeting'
        }
    }
};
