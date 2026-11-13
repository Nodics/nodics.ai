/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryProjection/router/routers @description Four fixed service-token projection operations; generated schema CRUD remains disabled. @layer router @owner discoveryProjection */
module.exports = {discoveryProjection: {projection: {
    binding: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.projection.read', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/projection/binding', method: 'POST', controller: 'DefaultDiscoveryProjectionController', operation: 'binding'},
    save: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.projection.write', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/projection/save', method: 'POST', controller: 'DefaultDiscoveryProjectionController', operation: 'save'},
    search: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.projection.read', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/projection/search', method: 'POST', controller: 'DefaultDiscoveryProjectionController', operation: 'search'},
    refresh: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.projection.write', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/projection/refresh', method: 'POST', controller: 'DefaultDiscoveryProjectionController', operation: 'refresh'},
    removeGeneration: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.projection.cleanup', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/projection/remove-generation', method: 'POST', controller: 'DefaultDiscoveryProjectionController', operation: 'removeGeneration'}
}}};

module.exports.discoveryProjection.physicalRetirement = {
    preview:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.execute',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/preview',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'preview'},
    execute:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.execute',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/execute',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'execute'},
    inspect:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.read',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/inspect',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'inspect'},
    previewErasure:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.erase',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/previewErasure',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'previewErasure'},
    erase:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.erase',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/erase',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'erase'},
    inspectErasure:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement.read',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement/inspectErasure',method:'POST',controller:'DefaultDiscoveryPhysicalRetirementController',operation:'inspectErasure'},
};
