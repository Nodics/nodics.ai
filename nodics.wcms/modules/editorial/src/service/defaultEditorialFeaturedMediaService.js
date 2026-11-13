/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
/** @module editorial/service/DefaultEditorialFeaturedMediaService
 * @description Pins the saved article's featured image and consumes Media-owned publication readiness and exact inspection handoff.
 * @layer service @owner editorial
 * @override Editorial owns the requirement; Media owns activation, bytes, access, retention and approval. Never publish Media automatically.
 */
module.exports = {
    /** Projects only bounded owner copy; no links or commands are sourced from an article. */
    presentation: function (request) {
        const texts = CONFIG.get('editorial')?.authoring?.featuredMedia?.presentation || {};
        const locale = request.editorial?.locale || 'en';
        return Object.fromEntries(['ready', 'pending', 'unavailable', 'open', 'saveFirst']
            .map(key => [key, texts[locale]?.[key] || texts.en?.[key]])
            .filter(([, value]) => typeof value === 'string' && value.trim() && value.length <= 2000));
    },
    /** Reads exactly one current scoped source under the original actor without provider locations in the result. */
    current: async function (request, code) {
        const response = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
            query: { code }, options: { recursive: false, skipItemCache: true }, searchOptions: { limit: 2 } });
        if (!response || !/^SUC_/.test(response.code || '') || response.error || response.acknowledged === false ||
            !Array.isArray(response.result) || response.result.length !== 1 ||
            response.result[0].code !== code || !SERVICE.DefaultMediaLibraryService.inScope(response.result[0], request))
            throw new Error('FEATURED_MEDIA_SOURCE_UNCONFIRMED');
        return response.result[0];
    },
    /** Checks a saved reference through Media's existing shared exact-version algorithm; performs no mutations. */
    evaluate: async function (request, article) {
        const code = article.featuredMediaCode, presentation = this.presentation(request);
        const base = { contractVersion: 1, mediaCode: code || null, presentation };
        if (!code) return { ...base, ready: true, status: 'NOT_REQUIRED' };
        if (typeof code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(code))
            return { ...base, ready: false, status: 'INVALID' };
        const fallback = () => ({ owner: 'media', mediaCode: code, status: 'UNAVAILABLE', qualified: false,
            handoff: SERVICE.DefaultMediaPublicationReviewService?.handoff(code)?.handoff });
        try {
            const asset = await this.current(request, code);
            if (asset.active !== true || asset.status !== 'READY' || asset.access !== 'PUBLIC')
                return { ...base, ready: false, status: 'SOURCE_UNAVAILABLE', dependency: fallback() };
            const result = await SERVICE.DefaultMediaDependencyReadinessService.inspectAssets(
                { code: 'editorial-' + article.code, targetVersion: String(article.revision) }, [asset], request);
            const current = await this.current(request, code);
            const unchanged = ['code', 'versionId', 'checksum', 'status', 'access', 'active', 'legalHold']
                .every(key => current[key] === asset[key]);
            const ready = unchanged && result.qualified === true && result.dependencies?.length === 1 &&
                result.dependencies[0].mediaCode === code && result.dependencies[0].storedBytesVerified === true;
            return { ...base, ready, status: !unchanged ? 'SOURCE_CHANGED' : result.status,
                dependency: unchanged && result.dependencies?.[0] || fallback() };
        } catch (_) {
            return { ...base, ready: false, status: 'UNAVAILABLE', dependency: fallback() };
        }
    }
};
