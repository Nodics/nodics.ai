/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/controller/DefaultEditorialDeliveryController @description Maps public delivery requests to trusted Editorial projection operations. @layer controller @owner editorial */
module.exports = {
    /** Invokes a delivery facade operation with trusted Storefront scope taking precedence over caller query. */ invoke: function (operation, request, callback) { request.delivery = Object.assign({}, request.httpRequest && request.httpRequest.query || {}, request.delivery || {}, request.storefrontContext || {}); let promise = FACADE.DefaultEditorialDeliveryFacade[operation](request); return callback ? promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result })).catch(callback) : promise; },
    /** Lists visible articles. */ list: function (request, callback) { return this.invoke('list', request, callback); },
    /** Reads one visible article. */ detail: function (request, callback) { request.delivery = Object.assign({}, request.delivery || {}, { slug: request.httpRequest && request.httpRequest.params && request.httpRequest.params.slug }); return this.invoke('detail', request, callback); },
    /** Lists visible records by content type. */ byType: function (request, callback) { request.delivery = { contentTypeCode: request.httpRequest && request.httpRequest.params && request.httpRequest.params.contentTypeCode }; return this.invoke('byType', request, callback); },
    /** Lists visible records by taxonomy. */ byTaxonomy: function (request, callback) { request.delivery = { taxonomyCode: request.httpRequest && request.httpRequest.params && request.httpRequest.params.taxonomyCode }; return this.invoke('byTaxonomy', request, callback); },
    /** Lists visible records by author. */ byAuthor: function (request, callback) { request.delivery = { authorCode: request.httpRequest && request.httpRequest.params && request.httpRequest.params.authorCode }; return this.invoke('byAuthor', request, callback); },
    /** Lists visible records by series. */ bySeries: function (request, callback) { request.delivery = { seriesCode: request.httpRequest && request.httpRequest.params && request.httpRequest.params.seriesCode }; return this.invoke('bySeries', request, callback); },
    /** Lists visible featured records. */ featured: function (request, callback) { return this.invoke('featured', request, callback); },
    /** Lists visible articles with JSON-LD projections. */ structured: function (request, callback) { return this.invoke('listStructured', request, callback); },
    /** Returns bounded RSS projection data. */ rss: function (request, callback) { return this.invoke('rss', request, callback); },
    /** Returns bounded sitemap projection data. */ sitemap: function (request, callback) { return this.invoke('sitemap', request, callback); }
};
