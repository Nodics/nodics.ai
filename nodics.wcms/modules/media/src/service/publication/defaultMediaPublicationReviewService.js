/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module media/publication/DefaultMediaPublicationReviewService
 * @description Projects exact retained business evidence and bounded raster bytes without current-asset substitution or publication writes.
 * @layer service
 * @owner media
 * @override Layer Media library.review copy/bounds; preserve original tenant, enterprise, read intersections and retained identity.
 */
const copyKeys = ['title', 'captured', 'version', 'fileType', 'size', 'preview', 'hide', 'loading',
    'unavailable', 'unsupported', 'historical', 'refresh', 'publication', 'openAsset'];
const rasterTypes = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const states = new Set(['CREATED', 'VALIDATING', 'VALIDATED', 'PENDING_APPROVAL', 'APPROVED',
    'ACTIVATING', 'ONLINE', 'FAILED', 'REJECTED', 'ROLLING_BACK', 'ROLLED_BACK', 'WITHDRAWING', 'WITHDRAWN']);
module.exports = {
    /** Reads one original publication and exact immutable metadata; no provider bytes or generated Media/current reads. */
    source: async function (input, request) {
        const library = SERVICE.DefaultMediaLibraryService;
        library.assertOperator(request, 'media.storage.policy.view');
        library.assertInput(input, ['publicationCode', 'localeCode']);
        const auth = request.authData;
        if (auth.principalType !== 'human' || auth.isSystem || auth.runtimeScope ||
            !library.permitted(request, 'publish.lifecycle.view') ||
            typeof input.publicationCode !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(input.publicationCode) ||
            input.localeCode !== undefined && !['en', 'ar'].includes(input.localeCode)) library.fail();
        const retained = SERVICE.DefaultMediaRetainedPublicationService;
        retained.assertScope(request, 'STAGED');
        const publication = await SERVICE.DefaultPublicationLifecycleService.get({ tenant: request.tenant,
            authData: auth, publicationCode: input.publicationCode });
        if (!publication || publication.code !== input.publicationCode || publication.domain !== 'media' ||
            publication.rootType !== 'media' || !library.identifier(publication.rootCode) ||
            !/^[a-f0-9]{64}$/.test(publication.sourceVersion || '') || !states.has(publication.state) ||
            !Number.isSafeInteger(publication.revision) || publication.revision < 1) library.fail();
        const manifest = await retained.inspectMetadata(publication.sourceVersion, publication.rootCode, request);
        const asset = manifest.artifacts.asset;
        // Scope is checked before provider IO, even for a publication readable elsewhere in the tenant.
        if (!library.inScope(asset, request)) library.fail();
        return { publication, manifest, asset };
    },
    /** Resolves a bounded subset of raster preview policy; invalid configuration never widens access. */
    previewAvailable: function (asset, request) {
        const settings = CONFIG.get('media')?.library?.review || {};
        return SERVICE.DefaultMediaLibraryService.permitted(request, 'media.content.read') &&
            Number.isSafeInteger(settings.maximumPreviewBytes) && settings.maximumPreviewBytes > 0 &&
            settings.maximumPreviewBytes <= Number(CONFIG.get('media')?.publication?.maximumAssetBytes || 52428800) &&
            asset.sizeBytes <= settings.maximumPreviewBytes && rasterTypes.has(asset.mimeType) &&
            Array.isArray(settings.previewMimeTypes) && settings.previewMimeTypes.includes(asset.mimeType);
    },
    /** Reuses the existing inert Media inspection handoff; client catalogue admission remains mandatory. */
    handoff: function (mediaCode) {
        let capability;
        try { capability = SERVICE.DefaultMediaBackofficeCapabilityService?.getCapability(); } catch (_) { return undefined; }
        const navigation = Array.isArray(capability?.navigation) ? capability.navigation.filter(item => item.id === 'media-publication-requests') : [];
        if (!Array.isArray(navigation) || navigation.length !== 1 ||
            typeof navigation[0].route !== 'string' || !/^\/[A-Za-z0-9/_-]+$/.test(navigation[0].route) ||
            !navigation[0].backendWorkspace) return undefined;
        const item = navigation[0];
        return { owner: 'media', mediaCode, status: 'NOT_INSPECTED', qualified: false,
            handoff: { owner: 'media', route: item.route, label: item.label, query: { mediaCode },
                available: item.featureState === 'ACTIVE', backendWorkspace: JSON.parse(JSON.stringify(item.backendWorkspace)),
                automaticExecution: false, requiresOwnerInspection: true } };
    },
    /** Returns path-free captured metadata and inert owner copy; byte integrity is checked separately when opened. */
    review: async function (input, request) {
        const { publication, asset } = await this.source(input, request);
        const text = CONFIG.get('media')?.library?.review?.presentation || {};
        const locale = input.localeCode || 'en';
        const workingAsset = this.handoff(asset.code);
        const presentation = Object.fromEntries(copyKeys.map(key => [key, text[locale]?.[key] || text.en?.[key]])
            .filter(([, value]) => typeof value === 'string' && value.trim() && value.length <= 2000));
        return { contractVersion: 1, publicationCode: publication.code, publicationState: publication.state,
            mediaCode: asset.code, sourceVersion: publication.sourceVersion,
            asset: { code: asset.code, name: typeof asset.name === 'string' && asset.name.trim() ? asset.name.slice(0, 192) : asset.code,
                mimeType: typeof asset.mimeType === 'string' ? asset.mimeType.slice(0, 128) : '',
                sizeBytes: asset.sizeBytes, versionId: asset.versionId, checksumAlgorithm: 'sha256', checksum: asset.checksum },
            previewAvailable: Boolean(this.previewAvailable(asset, request)), presentation,
            ...(workingAsset ? { workingAsset } : {}) };
    },
    /** Returns only authorized retained raster bytes with strict size/hash checks and non-cacheable headers. */
    image: async function (input, request) {
        const { manifest, asset } = await this.source(input, request);
        if (!this.previewAvailable(asset, request)) SERVICE.DefaultMediaLibraryService.fail();
        const buffer = await SERVICE.DefaultMediaRetainedPublicationService.readBytes(manifest, request, asset.sizeBytes);
        return { code: 'SUC_MED_00005', buffer, mimeType: asset.mimeType, fileName: 'reviewed-image',
            cacheControl: 'no-store', contentDisposition: 'inline', responseHeaders: {
                'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "sandbox; default-src 'none'",
                'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY' } };
    }
};
