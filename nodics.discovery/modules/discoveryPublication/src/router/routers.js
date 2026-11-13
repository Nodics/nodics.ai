/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryPublication/router/routers @description Fixed internal generation operations; no public manifest CRUD. @layer router @owner discoveryPublication */
module.exports = {discoveryPublication: {generation: {
    read: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.generation.read', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/generation/read', method: 'POST', controller: 'DefaultDiscoveryGenerationController', operation: 'read'},
    initialize: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.generation.write', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/generation/initialize', method: 'POST', controller: 'DefaultDiscoveryGenerationController', operation: 'initialize'},
    advance: {secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'], permission: 'discovery.generation.write', apiExposure: 'moduleInternal', cache: {enabled: false}, key: '/internal/generation/advance', method: 'POST', controller: 'DefaultDiscoveryGenerationController', operation: 'advance'},
}}};

module.exports.discoveryPublication.retirementReceipt = {
    read:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement-receipt.read',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement-receipt/read',method:'POST',controller:'DefaultDiscoveryRetirementReceiptController',operation:'read'},
    claim:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement-receipt.execute',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement-receipt/claim',method:'POST',controller:'DefaultDiscoveryRetirementReceiptController',operation:'claim'},
    complete:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement-receipt.execute',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement-receipt/complete',method:'POST',controller:'DefaultDiscoveryRetirementReceiptController',operation:'complete'},
    claimErasure:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement-receipt.erase',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement-receipt/claimErasure',method:'POST',controller:'DefaultDiscoveryRetirementReceiptController',operation:'claimErasure'},
    completeErasure:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'discovery.retirement-receipt.erase',apiExposure:'moduleInternal',cache:{enabled:false},key:'/internal/retirement-receipt/completeErasure',method:'POST',controller:'DefaultDiscoveryRetirementReceiptController',operation:'completeErasure'},
};
