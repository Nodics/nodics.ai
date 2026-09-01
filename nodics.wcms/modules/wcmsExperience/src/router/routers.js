/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module wcmsExperience/router/routers
 * @description WCMS Experience delivery and authoring route declarations.
 * @layer router
 * @owner wcmsExperience
 * @override Later modules may add routes or replace operations through governed router hierarchy contributions.
 */
module.exports = {
    wcmsExperience: {
        experienceDelivery: {
            resolve: {
                secured: false,
                publicAccess: true,
                accessGroups: ['userGroup'],
                apiExposure: 'cmsDelivery',
                key: '/delivery/resolve',
                method: 'POST',
                controller: 'DefaultWcmsExperienceDeliveryController',
                operation: 'resolve',
                cache: { enabled: true, ttl: 30000 },
                help: {
                    requestType: 'public',
                    message: 'Resolve Online WCMS Experience slots for a storefront journey.',
                    method: 'POST',
                    url: 'http://host:port/nodics/wcmsExperience/delivery/resolve'
                }
            }
        },
        experienceAuthoring: {
            preview: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'WCMS_EXPERIENCE_PREVIEW',
                apiExposure: 'cmsAuthoring',
                key: '/authoring/preview',
                method: 'POST',
                controller: 'DefaultWcmsExperienceAuthoringController',
                operation: 'preview'
            },
            indexStatus: {
                secured: true,
                accessGroups: ['userGroup'],
                permission: 'WCMS_EXPERIENCE_PUBLISH_STATUS',
                apiExposure: 'cmsAuthoring',
                key: '/authoring/index-status',
                method: 'GET',
                controller: 'DefaultWcmsExperienceAuthoringController',
                operation: 'indexStatus'
            }
        }
    }
};
