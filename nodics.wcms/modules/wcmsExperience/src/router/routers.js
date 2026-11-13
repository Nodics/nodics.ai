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
        onlineIndexOwner: {execute:{secured:true,authTokenTypes:['service'],accessGroups:['userGroup'],permissionConfig:'authSecurity.internalToken.routePermission',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/online-index',method:'POST',controller:'DefaultWcmsExperienceOnlineIndexController',operation:'execute'}},
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
                cache: { enabled: false },
                help: {
                    requestType: 'public',
                    message: 'Resolve Online WCMS Experience slots for a storefront journey.',
                    method: 'POST',
                    url: 'http://host:port/nodics/wcmsExperience/delivery/resolve'
                }
            }
        },
        experienceAuthoring: {
            inspectPlacements: {secured:true,accessGroups:['userGroup'],permission:'WCMS_EXPERIENCE_VIEW',apiExposure:'cmsAuthoring',key:'/authoring/placements',method:'GET',controller:'DefaultWcmsExperienceAuthoringController',operation:'inspectPlacements'},
            savePlacement: {secured:true,accessGroups:['userGroup'],permission:'WCMS_EXPERIENCE_EDIT',apiExposure:'cmsAuthoring',key:'/authoring/placements',method:'PUT',controller:'DefaultWcmsExperienceAuthoringController',operation:'savePlacement'},
            onlineIndex: {secured:true,accessGroups:['userGroup'],permission:'WCMS_EXPERIENCE_PUBLISH_STATUS',apiExposure:'cmsAuthoring',key:'/authoring/online-index',method:'GET',controller:'DefaultWcmsExperienceAuthoringController',operation:'onlineIndex'},
            retireOnlineIndex: {secured:true,accessGroups:['userGroup'],permission:'WCMS_EXPERIENCE_OVERRIDE',apiExposure:'cmsAuthoring',key:'/authoring/online-index/retire',method:'POST',controller:'DefaultWcmsExperienceAuthoringController',operation:'retireOnlineIndex'},
            rebuildOnlineIndex: {secured:true,accessGroups:['userGroup'],permission:'WCMS_EXPERIENCE_OVERRIDE',apiExposure:'cmsAuthoring',key:'/authoring/online-index/rebuild',method:'POST',controller:'DefaultWcmsExperienceAuthoringController',operation:'rebuildOnlineIndex'},
            inspectPreparation: {
                secured: true, accessGroups: ['userGroup'], permission: 'WCMS_EXPERIENCE_PREVIEW',
                apiExposure: 'cmsAuthoring', key: '/authoring/preparation', method: 'GET',
                controller: 'DefaultWcmsExperienceAuthoringController', operation: 'inspectPreparation'
            },
            preparePreview: {
                secured: true, accessGroups: ['userGroup'], permission: 'WCMS_EXPERIENCE_PREVIEW',
                apiExposure: 'cmsAuthoring', key: '/authoring/preparation', method: 'POST',
                controller: 'DefaultWcmsExperienceAuthoringController', operation: 'preparePreview'
            },
            abandonPreparation: {
                secured: true, accessGroups: ['userGroup'], permission: 'WCMS_EXPERIENCE_PREVIEW',
                apiExposure: 'cmsAuthoring', key: '/authoring/preparation/abandon', method: 'POST',
                controller: 'DefaultWcmsExperienceAuthoringController', operation: 'abandonPreparation'
            },
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
