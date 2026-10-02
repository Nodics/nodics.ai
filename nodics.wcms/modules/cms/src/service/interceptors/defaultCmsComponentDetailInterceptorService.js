/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/interceptors/DefaultCmsComponentDetailInterceptorService
 * @description Prepares CMS association identity before nested query construction and normalizes page/component relationship sources before save.
 * @layer interceptor
 * @owner cms
 * @override Project modules may replace this interceptor to customize component-detail identity or source assignment rules.
 */
module.exports = {
    /**
     * Initializes CMS component-detail interceptor handlers during service registration.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when handler initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Finalizes CMS component-detail interceptor startup after module artifacts are registered.
     *
     * @param {Object} options Module loader options supplied during startup.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Generates a component-detail code from source and target when no code is supplied.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS component-detail model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after detail code normalization.
     * @sideEffects Mutates `request.model.code`.
     * @override Keep explicit codes unchanged; parent preparation and retirement use this selected exported identity helper.
     */
    generateCmsComponentDetailCode: function (request, response) {
        return new Promise((resolve, reject) => {
            if (!request.model.code) request.model.code = request.model.source + '2' + request.model.target.toUpperCaseFirstChar();
            resolve(true);
        });
    },

    /**
     * Prepares missing source and canonical code before nested page associations enter generated save query construction.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS page model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after page component details are normalized.
     * @sideEffects Mutates entries in `request.model.cmsComponents`.
     */
    setCompDetailSourceForPage: async function (request, response) {
        let model = request.model;
        if (model.cmsComponents && model.cmsComponents.length > 0) {
            for (const detail of model.cmsComponents) {
                if (!detail.source) detail.source = model.code;
                if (!Array.isArray(detail.accessGroups)) {
                    detail.accessGroups = Array.isArray(model.accessGroups) ? model.accessGroups.slice() : ['userGroup'];
                }
                if (request.options && request.options.allowCmsAssociationReplacement === true) {
                    detail.allowCmsAssociationReplacement = true;
                }
                if (!detail.code) {
                    await SERVICE.DefaultCmsComponentDetailInterceptorService.generateCmsComponentDetailCode(
                        Object.assign({}, request, { model: detail }), response
                    );
                }
            }
        }
        return true;
    },

    /**
     * Retires active page component placements that are no longer present in an incoming page definition.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS page model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after obsolete component details are marked inactive.
     * @sideEffects Updates existing `cmsComponentDetail` records for the same page source.
     */
    retireObsoletePageComponentDetails: async function (request, response) {
        let model = request.model || {};
        if (!model.code || !Array.isArray(model.cmsComponents) || model.cmsComponents.length === 0 ||
            !SERVICE.DefaultCmsComponentDetailService || typeof SERVICE.DefaultCmsComponentDetailService.get !== 'function' ||
            (typeof SERVICE.DefaultCmsComponentDetailService.remove !== 'function' &&
                typeof SERVICE.DefaultCmsComponentDetailService.update !== 'function')) {
            return true;
        }
        await SERVICE.DefaultCmsComponentDetailInterceptorService.setCompDetailSourceForPage(request, response);
        let incomingCodes = model.cmsComponents.reduce((codes, detail) => {
            let code = detail.code;
            if (code) codes[code] = true;
            return codes;
        }, {});
        let responseData = await SERVICE.DefaultCmsComponentDetailService.get({
            tenant: request.tenant,
            authData: request.authData,
            options: Object.assign({}, request.options || {}, { recursive: false }),
            query: { source: model.code, active: true }
        });
        let existing = responseData && Array.isArray(responseData.result) ? responseData.result : [];
        let obsolete = existing.filter(detail => detail && detail.code && !incomingCodes[detail.code]);
        await Promise.all(obsolete.map(detail => this.retireComponentDetail(request, detail.code)));
        return true;
    },

    /** Removes obsolete component placement records through the generated service boundary. */
    retireComponentDetail: function (request, code) {
        let service = SERVICE.DefaultCmsComponentDetailService;
        let base = { tenant: request.tenant, authData: request.authData, query: { code: code } };
        if (service && typeof service.remove === 'function') {
            return service.remove(base);
        }
        return service.update(Object.assign({}, base, { model: { $set: { active: false } } }));
    },

    /**
     * Prepares missing source and canonical code before nested component associations enter generated save query construction.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} request.model CMS component model being saved.
     * @param {Object} response Interceptor response context.
     * @returns {Promise<boolean>} Resolves after sub-component details are normalized.
     * @sideEffects Mutates entries in `request.model.subComponents`.
     */
    setCompDetailSourceForComp: async function (request, response) {
        let model = request.model;
        if (model.subComponents && model.subComponents.length > 0) {
            for (const detail of model.subComponents) {
                if (!detail.source) detail.source = model.code;
                if (!detail.code) {
                    await SERVICE.DefaultCmsComponentDetailInterceptorService.generateCmsComponentDetailCode(
                        Object.assign({}, request, { model: detail }), response
                    );
                }
            }
        }
        return true;
    }
};
