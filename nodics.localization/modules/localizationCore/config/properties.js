/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module localizationCore/config/properties
 * @description Reserves layered defaults for the persisted Localization authority.
 * @layer config
 * @owner localizationCore
 * @override Project, environment, server, node, tenant, or customer layers may override these defaults through Nodics configuration layering.
 */
module.exports = {
    publish: {
        providers: {
            domainAdapters: { localization: 'DefaultLocalizationPublicationAdapterService' },
            versionProviders: { localization: 'DefaultLocalizationPublicationVersionProviderService' }
        }
    },
    localization: {
        authority: {
            enabled: true,
            contractVersion: 1,
            phase: 'REGISTRY_AND_BUNDLES',
            domain: 'localization',
            repositoryService: 'DefaultLocalizationRepositoryService',
            eventService: 'DefaultEventService',
            maximumKeysPerRelease: 10000,
            maximumMessageLength: 10000,
            maximumParametersPerMessage: 50,
            allowedExposures: ['PUBLIC', 'AUTHENTICATED', 'OPERATOR', 'INTERNAL'],
            publicExposures: ['PUBLIC'],
            protectedOverrideGroups: ['localizationProtectedAdminUserGroup'],
            allowedOverrideScopes: ['STANDARD', 'PROJECT', 'TENANT'],
            defaultFallbackLocales: ['en'],
            maximumQueueItems: 1000,
            maximumAnalyticsAuditEntries: 10000,
            machineTranslationProviderService: undefined,
            machineTranslationEnabled: false,
            translationMemoryEnabled: true,
            requireCompleteDefaultLocale: true,
            contributionFormatVersion: 1
        }
    }
};
