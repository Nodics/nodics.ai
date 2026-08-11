/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialDeliveryService @description Serves bounded public Editorial Online projections under trusted context. @layer service @owner editorial */
module.exports = {
    /** Builds a generated-service request context for public delivery reads. */
    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: request.tenant,
            authData: request.authData || { userGroups: ['serviceAccountUserGroup'], permissions: [] }
        }, additions || {});
    },

    /** Resolves and validates trusted delivery scope. */
    context: function (request) {
        let input = request.delivery || {};
        let settings = (CONFIG.get('editorial') || {}).delivery || {};
        if (!request.tenant || !input.siteCode || !input.localeCode || !input.channel) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Trusted Editorial delivery context is required');
        if (!(settings.supportedLocales || []).includes(input.localeCode) || !(settings.supportedChannels || []).includes(input.channel)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial delivery context is unsupported');
        return input;
    },
    /** Produces the invariant public visibility query. */
    visibilityQuery: function (request, additions) {
        let context = this.context(request), now = new Date();
        return Object.assign({ siteCode: context.siteCode, localeCode: context.localeCode, status: 'CURRENT', $and: [
            { $or: [{ 'payload.publishFrom': null }, { 'payload.publishFrom': { $lte: now } }] },
            { $or: [{ 'payload.publishUntil': null }, { 'payload.publishUntil': { $gt: now } }] }
        ] }, additions || {});
    },
    /** Lists visible articles with a bounded result window. */
    list: async function (request) {
        let context = this.context(request), settings = (CONFIG.get('editorial') || {}).delivery || {};
        let limit = Math.max(1, Math.min(Number(context.limit || settings.defaultLimit || 20), Number(settings.maximumLimit || 100)));
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get(this.serviceRequest(request, { query: this.visibilityQuery(request, context.filters), searchOptions: { limit: limit, sort: { publishedAt: -1 } } }));
        return { items: (response && response.result || []).map(item => item.payload), limit: limit };
    },
    /** Resolves one visible article by slug. */
    detail: async function (request) {
        let context = this.context(request);
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get(this.serviceRequest(request, { query: this.visibilityQuery(request, { slug: context.slug }), searchOptions: { limit: 1 } }));
        let item = response && response.result && response.result[0];
        if (!item) throw new CLASSES.NodicsError('ERR_EDT_00003', 'Editorial article was not found');
        return item.payload;
    }
};
