/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/interceptors/interceptors
 * @description Schema interceptor registrations for CMS component details, renderer enrichment, and content relationship normalization.
 * @layer interceptor
 * @owner cms
 * @override Project modules may add, reorder, disable, or replace CMS interceptor registrations through later module contributions.
 */
module.exports = {
    validateCmsTypeCode: {
        type: 'schema', item: 'cmsTypeCode', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateTypeCode'
    },
    validateCmsComponentLocalization: {
        type: 'schema', item: 'cmsComponentLocalization', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateComponentLocalization'
    },
    validateCmsRendererMapping: {
        type: 'schema', item: 'cmsTypeCode2Renderer', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRenderer'
    },
    validateCmsPageTemplate: {
        type: 'schema', item: 'cmsPageTemplate', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRenderer'
    },
    validateCmsPageRoute: {
        type: 'schema', item: 'cmsPageRoute', trigger: 'preSave', active: 'true', index: 0,
        handler: 'DefaultCmsContractValidationService.validateRoute'
    },
    validateCmsComponentAssociation: {
        type: 'schema', item: 'cmsComponentDetail', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateAssociation'
    },
    validateCmsSlotDefinition: {
        type: 'schema', item: 'cmsSlotDefinition', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateSlotDefinition'
    },
    validateCmsNavigationNode: {
        type: 'schema', item: 'cmsNavigationNode', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateNavigationNode'
    },
    validateCmsRestrictionType: {
        type: 'schema', item: 'cmsRestrictionType', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateRestrictionType'
    },
    validateCmsRestriction: {
        type: 'schema', item: 'cmsRestriction', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateRestriction'
    },
    validateCmsComponentMedia: {
        type: 'schema', item: 'cmsComponentMedia', trigger: 'preSave', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateComponentMedia'
    },
    validateCmsComponentMediaUpdate: {
        type: 'schema', item: 'cmsComponentMedia', trigger: 'preUpdate', active: 'true', index: 10,
        handler: 'DefaultCmsContractValidationService.validateComponentMediaUpdate'
    },
    invalidateCmsPageDeliveryAfterSave: { type: 'schema', item: 'cmsPage', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsPageDeliveryAfterUpdate: { type: 'schema', item: 'cmsPage', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsPageDeliveryAfterRemove: { type: 'schema', item: 'cmsPage', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterSave: { type: 'schema', item: 'cmsPageRoute', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterUpdate: { type: 'schema', item: 'cmsPageRoute', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRouteDeliveryAfterRemove: { type: 'schema', item: 'cmsPageRoute', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterSave: { type: 'schema', item: 'cmsComponent', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponent', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsComponentDeliveryAfterRemove: { type: 'schema', item: 'cmsComponent', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsLocalizationDeliveryAfterSave: { type: 'schema', item: 'cmsComponentLocalization', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsLocalizationDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponentLocalization', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsLocalizationDeliveryAfterRemove: { type: 'schema', item: 'cmsComponentLocalization', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsMediaDeliveryAfterSave: { type: 'schema', item: 'cmsComponentMedia', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsMediaDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponentMedia', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsMediaDeliveryAfterRemove: { type: 'schema', item: 'cmsComponentMedia', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterSave: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterUpdate: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsAssociationDeliveryAfterRemove: { type: 'schema', item: 'cmsComponentDetail', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsNavigationDeliveryAfterSave: { type: 'schema', item: 'cmsNavigationNode', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsNavigationDeliveryAfterUpdate: { type: 'schema', item: 'cmsNavigationNode', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsNavigationDeliveryAfterRemove: { type: 'schema', item: 'cmsNavigationNode', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRestrictionDeliveryAfterSave: { type: 'schema', item: 'cmsRestriction', trigger: 'postSave', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRestrictionDeliveryAfterUpdate: { type: 'schema', item: 'cmsRestriction', trigger: 'postUpdate', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    invalidateCmsRestrictionDeliveryAfterRemove: { type: 'schema', item: 'cmsRestriction', trigger: 'postRemove', active: 'true', index: 100, handler: 'DefaultCmsDeliveryCacheInvalidationService.invalidate' },
    generateCmsComponentDetailCode: {
        type: 'schema',
        item: 'cmsComponentDetail',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.generateCmsComponentDetailCode'
    },
    generateCmsComponentDetailSourceForPage: {
        type: 'schema',
        item: 'cmsPage',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.setCompDetailSourceForPage'
    },
    retireObsoleteCmsPageComponentDetails: {
        type: 'schema',
        item: 'cmsPage',
        trigger: 'preSave',
        active: 'true',
        index: 5,
        handler: 'DefaultCmsComponentDetailInterceptorService.retireObsoletePageComponentDetails'
    },
    generateCmsComponentDetailSourceForComponent: {
        type: 'schema',
        item: 'cmsComponent',
        trigger: 'preSave',
        active: 'true',
        index: 0,
        handler: 'DefaultCmsComponentDetailInterceptorService.setCompDetailSourceForComp'
    },
    loadPageItemRenderer: {
        type: 'schema',
        item: 'cmsPage',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultItemRendererInterceptorService.loadItemRenderer'
    },
    loadComponentItemRenderer: {
        type: 'schema',
        item: 'cmsComponent',
        trigger: 'postGet',
        active: 'true',
        index: 0,
        handler: 'DefaultItemRendererInterceptorService.loadItemRenderer'
    },
};
