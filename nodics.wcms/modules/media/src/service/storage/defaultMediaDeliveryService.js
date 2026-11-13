/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.wcms/media/src/service/storage/defaultMediaDeliveryService
 * @description Resolves media-code based content delivery through media-owned
 * access policy and provider storage descriptors.
 * @layer service
 * @owner media
 * @override Projects may extend signed/private delivery policy while preserving
 * media-code based lookup and provider-owned storage paths.
 */
module.exports = {

    /** Initializes the media delivery service. */
    init: function () {
        return Promise.resolve(true);
    },

    /** Finalizes the media delivery service. */
    postInit: function () {
        return Promise.resolve(true);
    },

    /**
     * Resolves a media item into a file delivery descriptor.
     *
     * @param {Object} request Delivery request.
     * @returns {Promise<Object>} File delivery descriptor.
     */
    deliver: async function (request) {
        request = request || {};
        request.tenant = this.resolveTenant(request);
        let mediaCode = this.resolveMediaCode(request);
        let policy = this.policy();
        if (policy.enabled !== true) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media delivery is disabled by media policy');
        }
        let publication = (CONFIG.get('media') || {}).publication || {};
        if (publication.runtimeRole === 'STAGED' && !request.download &&
            request.authData?.tokenType !== 'access' && request.authData?.tokenType !== 'service') {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Staged Media requires authenticated preview');
        }
        if (publication.versionProviderEnabled === true && publication.runtimeRole === 'ONLINE') {
            let retained = await SERVICE.DefaultMediaPublicationTargetService.resolveDelivery(mediaCode, request);
            this.validateAccess(request, retained.media);
            return { code: 'SUC_MED_00005', mediaCode, buffer: retained.buffer,
                fileName: retained.media.originalFileName, mimeType: retained.media.mimeType,
                cacheControl: 'no-store', responseHeaders: policy.responseHeaders,
                contentDisposition: this.resolveContentDisposition(request, policy) };
        }
        let media = await this.loadMedia(request, mediaCode);
        this.validateAccess(request, media);
        return this.describeFile(request, media, policy);
    },

    /** Admits original employee authority only on the Staged Media runtime. */
    requireDraftAccess: function (request) {
        const library = SERVICE.DefaultMediaLibraryService;
        library.assertOperator(request, 'media.content.read');
        if (request.authData.principalType !== 'human' || request.authData.isSystem ||
            request.authData.runtimeScope || CONFIG.get('runtimeRole')?.publication !== 'STAGED' ||
            this.policy().enabled !== true) library.fail();
        library.currentModel(request);
        return library;
    },

    /** Returns a bounded page of ready, scoped raster choices without delivery URLs or provider details. */
    listDraftImages: async function (request) {
        const library = this.requireDraftAccess(request);
        const input = request.query || {};
        library.assertInput(input, ['pageNumber']);
        const pageNumber = library.integer(input.pageNumber, 1, 1, 10000);
        const pageSize = 25;
        const review = CONFIG.get('media')?.library?.review || {};
        const query = { ...library.scope(request), mimeType: { $in: review.previewMimeTypes || [] },
            status: { $in: this.policy().allowedStatuses }, sizeBytes: { $gt: 0, $lte: review.maximumPreviewBytes } };
        const response = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
            query, skipcache: true, searchOptions: { pageNumber, pageSize, limit: pageSize, sort: { code: 1 } } });
        if (!Array.isArray(response?.result) || response.result.length > pageSize) library.fail();
        const items = response.result.filter(asset => library.inScope(asset, request) && library.identifier(asset.code) &&
            ['PUBLIC', 'PRIVATE'].includes(asset.access) && this.isDraftRaster(asset, request))
            .map(asset => ({ code: asset.code, fileName: asset.originalFileName || asset.code }));
        return { items, pageNumber, hasMore: response.result.length === pageSize };
    },

    /** Reuses the Media review raster and size contract. */
    isDraftRaster: function (media, request) {
        return Number.isSafeInteger(media.sizeBytes) && media.sizeBytes > 0 &&
            SERVICE.DefaultMediaPublicationReviewService.previewAvailable(media, request);
    },

    /** Resolves one bounded raster from the original employee's Staged enterprise. */
    previewDraftImage: async function (request) {
        const library = this.requireDraftAccess(request);
        const media = await this.loadMedia(request, this.resolveMediaCode(request));
        if (!library.inScope(media, request) || !this.isDraftRaster(media, request)) library.fail();
        this.validateAccess(request, media);
        const result = this.describeFile(request, media, this.policy());
        return { ...result, cacheControl: 'no-store', contentDisposition: 'inline', responseHeaders: {
            ...result.responseHeaders, 'X-Content-Type-Options': 'nosniff',
            'Content-Security-Policy': "sandbox; default-src 'none'"
        } };
    },

    /** Resolves bytes through the existing Media storage provider. */
    describeFile: function (request, media, policy) {
        let source = SERVICE.DefaultMediaStorageProviderRegistryService.resolveImportSource({
            tenant: request.tenant,
            authData: request.authData,
            providerCode: media.providerCode,
            storageKey: media.storageKey,
            originalFileName: media.originalFileName,
            storedFileName: media.storedFileName,
            mimeType: media.mimeType,
            extension: media.extension,
            sizeBytes: media.sizeBytes,
            checksum: media.checksum,
            checksumAlgorithm: media.checksumAlgorithm
        });
        return {
            code: 'SUC_MED_00005',
            mediaCode: media.code,
            filePath: source.absolutePath,
            fileName: source.fileName || media.originalFileName || media.storedFileName || media.code,
            mimeType: media.mimeType || source.mimeType,
            cacheControl: SERVICE.DefaultMediaLifecycleCoordinationService && SERVICE.DefaultMediaLifecycleCoordinationService.isVersioned(request) ? 'no-store' : policy.cacheControl,
            responseHeaders: policy.responseHeaders,
            contentDisposition: this.resolveContentDisposition(request, policy)
        };
    },

    /**
     * Resolves the tenant used for media metadata lookup.
     *
     * Public inline media requests can be served without an authenticated
     * principal, so they may reach delivery without a request tenant. The
     * effective tenant is still resolved before metadata lookup while access
     * policy remains enforced by validateAccess.
     *
     * @param {Object} request Delivery request.
     * @returns {string} Tenant code.
     */
    resolveTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /**
     * Resolves the requested media code from direct or HTTP request shapes.
     *
     * @param {Object} request Delivery request.
     * @returns {string} Media code.
     */
    resolveMediaCode: function (request) {
        let params = request.params || request.httpRequest && request.httpRequest.params || {};
        let query = request.query || request.httpRequest && request.httpRequest.query || {};
        let mediaCode = request.mediaCode || params.mediaCode || query.mediaCode;
        if (typeof mediaCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,191}$/.test(mediaCode)) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Invalid media delivery request: media code is required');
        }
        return mediaCode;
    },

    /**
     * Loads one deliverable media model through the generated media service.
     *
     * @param {Object} request Delivery request.
     * @param {string} mediaCode Media code.
     * @returns {Promise<Object>} Media model.
     */
    loadMedia: async function (request, mediaCode) {
        let service = SERVICE.DefaultMediaService;
        if (!service || typeof service.get !== 'function') {
            throw new CLASSES.NodicsError('ERR_MED_00009', 'Media metadata service is unavailable');
        }
        let policy = this.policy();
        let response = await service.get({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                code: mediaCode,
                status: { $in: policy.allowedStatuses }
            },
            searchOptions: { limit: policy.maximumResults }
        });
        let items = this.items(response).filter(item => item.code === mediaCode);
        if (items.length !== 1) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Media content is missing or ambiguous');
        }
        return items[0];
    },

    /**
     * Enforces media delivery access policy.
     *
     * @param {Object} request Delivery request.
     * @param {Object} media Media model.
     * @returns {boolean} True when allowed.
     */
    validateAccess: function (request, media) {
        let policy = this.policy();
        let access = media.access || 'PRIVATE';
        if (access === 'PUBLIC' && policy.publicAccessEnabled === true) return true;
        if (access === 'SIGNED' && policy.signedAccessEnabled === true) {
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Signed media delivery token validation is not configured');
        }
        if (access === 'PRIVATE' && policy.privateAccessEnabled === true) {
            if (this.hasAuthenticatedPrincipal(request)) return true;
            throw new CLASSES.NodicsError('ERR_MED_00012', 'Private media delivery requires an authenticated principal');
        }
        throw new CLASSES.NodicsError('ERR_MED_00012', 'Media access policy does not allow direct delivery');
    },

    /**
     * Checks whether the current delivery request has an authenticated principal.
     *
     * @param {Object} request Delivery request.
     * @returns {boolean} True when auth data was resolved by the secured route.
     */
    hasAuthenticatedPrincipal: function (request) {
        let authData = request && request.authData || {};
        return !!(authData.loginId || authData.principalId || authData.userId || authData.uid ||
            authData.code || authData.serviceId || authData.tokenType);
    },

    /**
     * Resolves inline versus attachment response disposition.
     *
     * @param {Object} request Delivery request.
     * @param {Object} policy Delivery policy.
     * @returns {string} Content disposition.
     */
    resolveContentDisposition: function (request, policy) {
        let query = request && request.query || {};
        if (request && request.download === true) return 'attachment';
        if (query.download === true || query.download === 'true' || query.download === '1') return 'attachment';
        return policy.contentDisposition || 'inline';
    },

    /**
     * Returns effective delivery policy.
     *
     * @returns {Object} Delivery policy.
     */
    policy: function () {
        let media = CONFIG && CONFIG.get ? (CONFIG.get('media') || {}) : {};
        let delivery = media.delivery || {};
        return {
            enabled: delivery.enabled !== false,
            allowedStatuses: delivery.allowedStatuses || ['READY', 'CONSUMED'],
            publicAccessEnabled: delivery.publicAccessEnabled === true,
            signedAccessEnabled: delivery.signedAccessEnabled === true,
            privateAccessEnabled: delivery.privateAccessEnabled !== false,
            maximumResults: delivery.maximumResults || 2,
            cacheControl: delivery.cacheControl || 'public, max-age=3600',
            responseHeaders: delivery.responseHeaders || {
                'Cross-Origin-Resource-Policy': 'cross-origin',
                'Access-Control-Allow-Origin': '*'
            },
            contentDisposition: delivery.contentDisposition || 'inline'
        };
    },

    /**
     * Extracts generated-service result items.
     *
     * @param {Object} response Generated service response.
     * @returns {Object[]} Result items.
     */
    items: function (response) {
        if (!response) return [];
        if (Array.isArray(response.result)) return response.result;
        if (response.result) return [response.result];
        if (Array.isArray(response.data)) return response.data;
        if (response.data) return [response.data];
        return [];
    }
};
