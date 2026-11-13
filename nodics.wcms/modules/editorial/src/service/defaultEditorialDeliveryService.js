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
        if ([request.tenant, input.siteCode, input.localeCode, input.channel].some(value => typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value))) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Trusted Editorial delivery context is required');
        if (!(settings.supportedLocales || []).includes(input.localeCode) || !(settings.supportedChannels || []).includes(input.channel)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial delivery context is unsupported');
        return input;
    },
    /** Admits inert supported filters only; public callers cannot replace trusted scope or visibility predicates. */
    filters: function (input) {
        if (input === undefined) return {};
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial delivery filters are invalid');
        const result = {}, fields = ['contentTypeCode', 'slug', 'payload.taxonomyTermCodes', 'payload.authorCodes', 'payload.seriesCode'];
        for (const [field, value] of Object.entries(input)) {
            if (field === 'payload.featuredMediaCode' && value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 1 && value.$ne === null) {
                result[field] = { $ne: null }; continue;
            }
            if (!fields.includes(field) || typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Unsupported Editorial delivery filter');
            result[field] = value;
        }
        return result;
    },
    /** Produces the invariant public visibility query. */
    visibilityQuery: function (request, additions) {
        let context = this.context(request), now = new Date();
        return Object.assign({}, this.filters(additions), { siteCode: context.siteCode, localeCode: context.localeCode, active: true, status: 'CURRENT', $and: [
            { $or: [{ 'payload.embargoAt': null }, { 'payload.embargoAt': { $lte: now } }] },
            { $or: [{ 'payload.publishFrom': null }, { 'payload.publishFrom': { $lte: now } }] },
            { $or: [{ 'payload.publishUntil': null }, { 'payload.publishUntil': { $gt: now } }] }
        ] });
    },
    /** Requires an acknowledged bounded owner read; failed reads never become an empty public catalogue. */
    records: function (response, limit) {
        if (!response || typeof response.code !== 'string' || !response.code.startsWith('SUC_') || response.success === false ||
            response.acknowledged === false || response.error || response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
            !Array.isArray(response.result) || response.result.length > limit || response.result.some(row => !row || !row.payload || typeof row.payload !== 'object' || Array.isArray(row.payload))) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial delivery could not be confirmed');
        }
        return response.result;
    },
    /** Lists visible articles with a bounded result window. */
    list: async function (request) {
        let context = this.context(request), settings = (CONFIG.get('editorial') || {}).delivery || {};
        const requested = context.limit === undefined ? settings.defaultLimit : Number(context.limit), maximum = settings.maximumLimit;
        if (!Number.isSafeInteger(requested) || requested < 1 || !Number.isSafeInteger(maximum) || maximum < 1) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial delivery limit must be a positive whole number');
        let limit = Math.min(requested, maximum);
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get(this.serviceRequest(request, { query: this.visibilityQuery(request, context.filters), searchOptions: { limit: limit, sort: { publishedAt: -1 } } }));
        return { items: this.records(response, limit).map(item => item.payload), limit: limit };
    },
    /** Resolves one visible article by slug. */
    detail: async function (request) {
        let context = this.context(request);
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get(this.serviceRequest(request, { query: this.visibilityQuery(request, { slug: context.slug }), searchOptions: { limit: 2 } }));
        const rows = this.records(response, 2);
        if (rows.length > 1) throw new CLASSES.NodicsError('ERR_EDT_00008', 'Editorial article delivery is unverified or ambiguous');
        let item = rows[0];
        if (!item) throw new CLASSES.NodicsError('ERR_EDT_00003', 'Editorial article was not found');
        return item.payload;
    }
};
