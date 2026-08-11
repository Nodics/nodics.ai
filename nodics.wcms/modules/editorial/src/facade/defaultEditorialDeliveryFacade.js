/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/facade/DefaultEditorialDeliveryFacade @description Delegates public delivery to the sanitized Editorial Online service. @layer facade @owner editorial */
module.exports = {
    /** Lists visible articles. */ list: function (request) { return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Reads one visible article. */ detail: function (request) { return SERVICE.DefaultEditorialDeliveryService.detail(request); },
    /** Lists visible articles for one content type. */ byType: function (request) { request.delivery.filters = { contentTypeCode: request.delivery.contentTypeCode }; return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Lists visible articles for one taxonomy term. */ byTaxonomy: function (request) { request.delivery.filters = { 'payload.taxonomyTermCodes': request.delivery.taxonomyCode }; return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Lists visible articles for one author. */ byAuthor: function (request) { request.delivery.filters = { 'payload.authorCodes': request.delivery.authorCode }; return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Lists visible articles for one series. */ bySeries: function (request) { request.delivery.filters = { 'payload.seriesCode': request.delivery.seriesCode }; return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Lists visible featured articles. */ featured: function (request) { request.delivery.filters = { 'payload.featuredMediaCode': { $ne: null } }; return SERVICE.DefaultEditorialDeliveryService.list(request); },
    /** Lists visible articles with structured data. */ async listStructured(request) { let result = await SERVICE.DefaultEditorialDeliveryService.list(request); return { items: result.items.map(item => ({ article: item, structuredData: SERVICE.DefaultEditorialStructuredDataService.project(item) })), limit: result.limit }; },
    /** Builds a bounded RSS projection. */ async rss(request) { return SERVICE.DefaultEditorialSyndicationService.rss((await SERVICE.DefaultEditorialDeliveryService.list(request)).items); },
    /** Builds a bounded sitemap projection. */ async sitemap(request) { return SERVICE.DefaultEditorialSyndicationService.sitemap((await SERVICE.DefaultEditorialDeliveryService.list(request)).items); }
};
