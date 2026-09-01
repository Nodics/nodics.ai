/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/service/defaultWcmsExperienceBackofficeCapabilityService
 * @description Publishes the WCMS Experience Studio BackOffice capability projection.
 * @layer service
 * @owner wcmsExperience
 * @override Project modules may refine navigation labels or feature state without changing the capability authority.
 */
module.exports = {
    /** Registers WCMS Experience Studio as a BackOffice capability provider. @returns {Promise<boolean>} Registration result. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('wcmsExperience', this);
        return Promise.resolve(true);
    },

    /** Completes provider lifecycle initialization. @returns {Promise<boolean>} Post-init result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns the BackOffice capability definition for Axis. @returns {Object} Capability projection. */
    getCapability: function () {
        let config = typeof CONFIG !== 'undefined' && CONFIG.get ? (CONFIG.get('wcmsExperience') || {}) : {};
        let backoffice = config.backoffice || {};
        return {
            enabled: true,
            capabilityId: backoffice.capabilityCode || 'wcms-experience-studio',
            displayName: backoffice.displayName || 'Experience Studio',
            category: 'content',
            icon: 'experience',
            contractVersion: 0,
            minimumClientContractVersion: 0,
            roles: [
                'FUNCTIONAL_CAPABILITY_PROVIDER',
                'UI_COMPOSITION_PROVIDER'
            ],
            requiredPermissions: [
                'WCMS_EXPERIENCE_VIEW'
            ],
            navigation: this.navigation(backoffice)
        };
    },

    /** Returns Experience Studio navigation entries. @param {Object} backoffice BackOffice config. @returns {Array<Object>} Navigation entries. */
    navigation: function (backoffice) {
        let documentationRoute = backoffice.documentationRoute || '/docs/capabilities/content-publishing/experience-targeting';
        let group = { id: 'content-experience', label: 'Content and Experience', order: 500 };
        return [
            this.navigationEntry('wcms-experience-studio', 'Experience Studio', '/content/experience-studio', 'experience', 560, group, documentationRoute, undefined, ['WCMS_EXPERIENCE_VIEW']),
            this.navigationEntry('wcms-experience-placements', 'Placements', '/content/experience-studio/placements', 'target', 561, group, documentationRoute, 'wcms-experience-studio', ['WCMS_EXPERIENCE_VIEW', 'WCMS_EXPERIENCE_EDIT']),
            this.navigationEntry('wcms-experience-preview', 'Preview', '/content/experience-studio/preview', 'preview', 562, group, documentationRoute, 'wcms-experience-studio', ['WCMS_EXPERIENCE_PREVIEW']),
            this.navigationEntry('wcms-experience-index-status', 'Index Status', '/content/experience-studio/index-status', 'search', 563, group, documentationRoute, 'wcms-experience-studio', ['WCMS_EXPERIENCE_PUBLISH_STATUS'])
        ];
    },

    /** Creates one navigation entry. @returns {Object} Navigation entry. */
    navigationEntry: function (id, label, route, icon, order, group, documentationRoute, parentId, requiredPermissions) {
        return {
            id: id,
            parentId: parentId,
            label: label,
            route: route,
            icon: icon,
            order: order,
            group: group,
            perspectives: ['operations'],
            contexts: ['environment', 'tenant', 'enterprise'],
            help: {
                summary: 'Configure and inspect targeted CMS page experiences for published storefront journeys.',
                documentationRoute: documentationRoute
            },
            featureState: 'PREVIEW',
            requiredPermissions: requiredPermissions || ['WCMS_EXPERIENCE_VIEW']
        };
    }
};
