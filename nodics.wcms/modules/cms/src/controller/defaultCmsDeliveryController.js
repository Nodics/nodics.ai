/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/controller/defaultCmsDeliveryController
 * @description HTTP boundary for client-safe CMS page delivery.
 * @layer controller
 * @owner cms
 * @override Later modules may override this controller while preserving the versioned delivery contract.
 */
module.exports = {
    /** Initializes the controller lifecycle. */
    init: function () { return Promise.resolve(true); },
    /** Completes the controller lifecycle. */
    postInit: function () { return Promise.resolve(true); },

    /** Resolves query input through the CMS delivery facade. */
    success: function (value) {
        return { code: 'SUC_CMS_00000', result: value && value.result !== undefined ? value.result : value };
    },

    /** Resolves query input through the CMS delivery facade. */
    resolvePage: function (request, callback) {
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : {};
        request.delivery = Object.assign({}, request.delivery || {}, query);
        let operation = FACADE.DefaultCmsDeliveryFacade.resolvePage(request);
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    },

    /** Reads only public Online publication evidence; no employee or customer private composition is admitted. */
    publishedKnowledge: function (request, callback) {
        const query = request.httpRequest?.query || {};
        request.delivery = { site: query.site, path: query.path, locale: query.locale, channel: query.channel };
        const operation = SERVICE.DefaultCmsDeliveryService.publishedKnowledge(request);
        if (!callback) return operation;
        operation.then(value => callback(null, this.success(value))).catch(error => callback(error));
    },

    /** Reads the published guide menu using only server-selected delivery scope. */
    documentationGuides: function (request, callback) {
        const operation = SERVICE.DefaultCmsDocumentationReaderService.guides(request);
        if (!callback) return operation;
        operation.then(value => callback(null, this.success(value))).catch(error => callback(error));
    },

    /** Resolves a page path only after deriving Site, locale, channel, and authority from Storefront introspection. */
    resolveStorefrontPage: function (request, callback) {
        let query = request.httpRequest && request.httpRequest.query ? request.httpRequest.query : request.query || {};
        request.delivery = { path: query.path };
        let operation = SERVICE.DefaultCmsStorefrontContextProviderService.apply(request)
            .then(() => FACADE.DefaultCmsDeliveryFacade.resolvePage(request));
        if (!callback) return operation;
        operation.then(success => callback(null, this.success(success))).catch(error => callback(error));
    }
};
