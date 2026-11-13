/*
    Nodics - Enterprice Micro-Services Management Framework
    Copyright (c) 2026 Nodics All rights reserved.
    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.
 */
'use strict';
const crypto = require('node:crypto');
/**
 * @module wcmsExperience/service/DefaultWcmsExperiencePreviewPreparationService
 * @description Explicit private Staged preparation through CMS access and Discovery's guarded immutable-generation protocol.
 * @layer service @owner wcmsExperience
 * @override Preserve original human scope, source revalidation, exact acknowledgements and independent Online publication.
 */
module.exports = {
    /** Resolves Framework-owned preparation defaults through ordinary layering. */
    policy: function () { return (CONFIG.get('wcmsExperience') || {}).stagedPreview || {}; },
    /** Produces a safe stable error; dependency details remain private. */
    fail: function (message) {
        throw new CLASSES.NodicsError('ERR_WCMS_EXPERIENCE_PREPARATION_UNCONFIRMED', message ||
            'Private preview preparation could not be confirmed. Inspect its current status before another preparation.');
    },
    /** Accepts journey fields only, never projections, identities, clock or storage instructions. */
    context: function (request) {
        const body = request.httpRequest?.body || request.body;
        const input = body && Object.keys(body).length ? body : request.httpRequest?.query || request.query || {};
        const allowed = ['site', 'pageType', 'targetType', 'targetCode', 'locale', 'channel', 'device', 'region'];
        if (!input || Array.isArray(input) || Object.keys(input).some(key => !allowed.includes(key) ||
            typeof input[key] !== 'string' || input[key].length > 256)) this.fail('Select a valid preview journey.');
        const resolver = SERVICE.DefaultWcmsExperienceResolverService;
        const context = resolver.normalizeContext({ ...request, experience: { ...input, previewMode: true } });
        if (!resolver.validateContext(context).valid) this.fail('Select a valid preview journey.');
        return context;
    },
    /** Reuses current CMS employee permission and persisted Site/Catalog ownership, including direct calls. */
    admit: async function (request, context) {
        const policy = this.policy(), access = SERVICE.DefaultCmsDesignerAccessService;
        if (policy.enabled !== true || CONFIG.get('runtimeRole')?.publication !== 'STAGED' || !access ||
            !Number.isSafeInteger(policy.maximumPlacements) || policy.maximumPlacements < 1 || policy.maximumPlacements > 100 ||
            !Number.isSafeInteger(policy.maximumProjectionBytes) || policy.maximumProjectionBytes < 1) this.fail();
        const lookup = { ...request };
        access.authorize(lookup, 'WCMS_EXPERIENCE_PREVIEW');
        const sites = await access.records('DefaultCmsSiteService', lookup, { code: context.site, active: true });
        const catalogs = [...new Set(sites.map(site => site.catalog))];
        if (!sites.length || catalogs.length !== 1 || typeof catalogs[0] !== 'string') access.deny();
        const scoped = { ...request, body: { site: context.site, catalogCode: catalogs[0] } };
        const scope = await access.scope(scoped, 'WCMS_EXPERIENCE_PREVIEW');
        return { request: scoped, scope };
    },
    /** Uses the existing Discovery manifest identity; no parallel preview receipt or pointer is introduced. */
    generationScope: function (request, context, scope) {
        const projection = (CONFIG.get('wcmsExperience') || {}).projection || {};
        const key = [scope.enterpriseCode, context.site, context.pageType, context.targetType, context.targetCode,
            context.locale, context.channel, context.device, context.region];
        return { tenant: request.tenant, authData: request.authData, guardedWrites: true,
            indexName: projection.indexName, indexConfigurationCode: projection.indexConfigurationCode,
            ownerType: projection.ownerType,
            ownerCode: 'experience-preview-' + crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex').slice(0, 40) };
    },
    /** Selects one latest owned component; ambiguous same-version content never becomes preview evidence. */
    latest: function (rows) {
        if (!Array.isArray(rows) || !rows.length) this.fail('A selected CMS component is unavailable.');
        const ordered = rows.slice().sort((a, b) => Number(b.versionId || 0) - Number(a.versionId || 0));
        if (ordered[0].active !== true || ordered.length > 1 && Number(ordered[0].versionId || 0) === Number(ordered[1].versionId || 0)) this.fail();
        return ordered[0];
    },
    /** Builds the current scoped CMS component graph without resurrecting retired or moved placements. */
    componentSnapshot: async function (request, scope, code, locale, state = { count: 0 }, ancestors = new Set()) {
        const limits = (CONFIG.get('wcmsExperience') || {}).resolver || {}, access = SERVICE.DefaultCmsDesignerAccessService;
        if (ancestors.has(code) || ancestors.size >= limits.maxDepth || ++state.count > limits.maxComponents) this.fail('Review the nested component depth and size before preparing.');
        const component = this.latest(await access.assertIdentity('DefaultCmsComponentService', request, code, scope, true));
        const related = (service, query) => SERVICE.DefaultCmsDesignerReadService.currentHeads(service, request, { ...query, active: true }, scope);
        const variants = await related('DefaultCmsComponentLocalizationService', { componentCode: code });
        const references = await related('DefaultCmsComponentMediaService', { componentCode: code });
        const media = references.filter(row => !row.localeCode || row.localeCode === locale)
            .sort((a,b) => (a.position || 0) - (b.position || 0) || a.code.localeCompare(b.code))
            .map(row => SERVICE.DefaultCmsDeliveryService.projectComponentMedia(row));
        const projected = SERVICE.DefaultCmsDeliveryService.projectComponent(component, {}, media, variants, locale);
        const placements = await related('DefaultCmsComponentDetailService', { source: code });
        const next = new Set(ancestors); next.add(code);
        projected.components = [];
        for (const row of placements.sort((a,b) => (a.index || 0) - (b.index || 0) || a.code.localeCompare(b.code))) {
            const child = await this.componentSnapshot(request, scope, row.target, locale, state, next);
            projected.components.push({ ...child, slot: row.slot, index: row.index });
        }
        return projected;
    },
    /** Loads a bounded exact journey from CMS under original authority and derives renderer-safe immutable payloads. */
    source: async function (request, context) {
        const admitted = await this.admit(request, context), access = SERVICE.DefaultCmsDesignerAccessService;
        const placements = await access.records('DefaultCmsExperiencePlacementService', admitted.request,
            { site: context.site, pageType: context.pageType, active: true });
        if (placements.length > this.policy().maximumPlacements) this.fail('This journey exceeds the configured preview preparation limit.');
        const source = [];
        for (const placement of placements.sort((a, b) => String(a.code).localeCompare(String(b.code)))) {
            if (placement.authoringScope && !access.matches(placement, admitted.scope, 'DefaultCmsExperiencePlacementService')) access.deny();
            const component = await this.componentSnapshot(admitted.request, admitted.scope, placement.component, context.locale);
            if (typeof placement.rendererKey !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(placement.rendererKey) ||
                !Number.isSafeInteger(placement.contractVersion) || placement.contractVersion < 0) this.fail('Review the placement renderer contract before preparing a preview.');
            for (const properties of [component.properties, placement.properties]) {
                if (properties !== undefined && (!properties || typeof properties !== 'object' || Array.isArray(properties))) this.fail('Review the selected component properties before preparing a preview.');
            }
            const payload = SERVICE.DefaultWcmsExperiencePublicationIndexingService.toProjectionPayload({ ...placement,
                properties: { ...(component.properties || {}), ...(placement.properties || {}) },
                components: component.components, media: component.media || [] },
                { publicationStatus: 'STAGED', deliveryStatus: placement.deliveryStatus || 'ACTIVE' });
            source.push({ payload: SERVICE.DefaultDiscoveryProjectionTransportService.data(payload),
                sourceRevision: placement.revision, componentVersion: component.versionId,
                componentCode: component.code });
        }
        const encoded = JSON.stringify([admitted.scope, source]);
        if (Buffer.byteLength(encoded) > this.policy().maximumProjectionBytes) this.fail('This journey exceeds the configured preview size limit.');
        return { ...admitted, source, digest: crypto.createHash('sha256').update(encoded).digest('hex') };
    },
    /** Returns bounded inspection proof without replay, repair, cleanup or Online mutation. */
    inspect: async function (request, suppliedContext) {
        const context = suppliedContext || this.context(request), admitted = await this.admit(request, context);
        const scope = this.generationScope(request, context, admitted.scope);
        const manifest = await SERVICE.DefaultDiscoveryGenerationPublicationService.read(scope);
        return { contractVersion: 1, publication: 'STAGED', site: context.site, pageType: context.pageType,
            scope: Object.fromEntries(['site', 'pageType', 'targetType', 'targetCode', 'locale', 'channel', 'device', 'region'].map(key => [key, context[key]])),
            state: manifest?.pendingGeneration ? 'INSPECTION_REQUIRED' : manifest?.currentGeneration ? 'READY' : 'NOT_PREPARED',
            generation: manifest?.currentGeneration?.token, documentCount: manifest?.currentGeneration?.count,
            revision: manifest?.revision, pendingGeneration: manifest?.pendingGeneration?.token,
            presentation: this.policy().presentation };
    },
    /** Retires only an explicitly inspected pending writer; it neither deletes bytes nor changes the last complete generation. */
    abandon: async function (request) {
        const input = request.httpRequest?.body || request.body || {};
        const { revision, pendingGeneration, ...journey } = input;
        if (!Number.isSafeInteger(revision) || revision < 0 || !/^[a-f0-9-]{36}$/.test(pendingGeneration || '')) this.fail();
        const scopedRequest = { ...request, body: journey,
            httpRequest: request.httpRequest ? { body: journey, query: request.httpRequest.query } : undefined };
        const context = this.context(scopedRequest), admitted = await this.admit(scopedRequest, context);
        const scope = this.generationScope(scopedRequest, context, admitted.scope);
        await SERVICE.DefaultDiscoveryGenerationPublicationService.abandon(scope, revision, pendingGeneration,
            { assertCurrent: () => this.admit(scopedRequest, context) });
        return { ...(await this.inspect(scopedRequest, context)), retiredPendingGeneration: pendingGeneration, onlineChanged: false };
    },
    /** Claims and publishes a complete Staged generation only after current source and physical evidence agree. */
    prepare: async function (request) {
        const context = this.context(request), source = await this.source(request, context);
        const scope = this.generationScope(request, context, source.scope), owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
        const descriptor = { digest: source.digest, contentDigest: source.digest, count: source.source.length };
        const assertCurrent = async () => {
            if ((await this.source(request, context)).digest !== source.digest) this.fail('CMS content changed during preparation. Inspect the pending preparation before continuing.');
        };
        const same = await owner.unchanged(scope, descriptor, { assertCurrent });
        if (same) return { ...(await this.inspect(request, context)), unchanged: true, onlineChanged: false };
        let claimed = await owner.begin(scope, descriptor);
        const token = claimed.pendingGeneration.token;
        for (const entry of source.source) {
            await this.admit(request, context);
            const started = await owner.startWrite(scope, claimed);
            const payload = { ...entry.payload, indexVersion: token, release: token,
                publicationOwner: scope.ownerCode, publicationGeneration: token };
            const code = 'experience-preview-' + crypto.createHash('sha256').update(JSON.stringify([token, payload.code])).digest('hex');
            const result = await SERVICE.DefaultDiscoveryDocumentProjectionService.doSave({ tenant: request.tenant,
                authData: request.authData, targetAuthority: { publication: 'STAGED' }, indexName: scope.indexName,
                model: { code, tenant: request.tenant, active: true, ownerType: scope.ownerType,
                    ownerCode: payload.code, indexConfigurationCode: scope.indexConfigurationCode,
                    status: 'CURRENT', payload, sourceHash: source.digest } });
            if (!owner.acknowledged(result)) this.fail();
            claimed = await owner.completeWrite(scope, started);
        }
        claimed = await owner.sealWriter(scope, claimed);
        const visible = await SERVICE.DefaultDiscoveryDocumentProjectionService.doRefresh({ tenant: request.tenant,
            authData: request.authData, targetAuthority: { publication: 'STAGED' }, indexName: scope.indexName });
        const shards = (visible?.result?.body || visible?.result)?._shards;
        if (!owner.acknowledged(visible) || !shards || shards.failed !== 0 || !Number.isSafeInteger(shards.successful) ||
            shards.successful < 1 || await owner.count(scope, token) !== source.source.length) this.fail();
        await assertCurrent();
        await owner.publish(scope, claimed);
        return { ...(await this.inspect(request, context)), unchanged: false, onlineChanged: false };
    },
    /** Reads only the last complete private generation; pending writes are held for explicit inspection. */
    readPrepared: async function (request, context) {
        const admitted = await this.admit(request, context), owner = SERVICE.DefaultDiscoveryGenerationPublicationService;
        const scope = this.generationScope(request, context, admitted.scope), manifest = await owner.read(scope);
        if (manifest?.pendingGeneration) this.fail('A private preparation needs inspection. The incomplete generation is not visible.');
        if (!manifest?.currentGeneration) return [];
        const current = manifest.currentGeneration;
        const response = await SERVICE.DefaultDiscoveryDocumentProjectionService.doSearch({ tenant: request.tenant,
            authData: request.authData, targetAuthority: { publication: 'STAGED' }, indexName: scope.indexName,
            query: owner.query(scope, current.token), options: { size: this.policy().maximumPlacements, track_total_hits: true } });
        const hits = SERVICE.DefaultDiscoveryRuntimeService.findHits(response, 0), result = response?.result?.body || response?.result;
        if (!owner.acknowledged(response) || result?.timed_out !== false || result?._shards?.failed !== 0 ||
            !hits || hits.total?.relation !== 'eq' || hits.total.value !== current.count || hits.hits.length !== current.count) this.fail();
        const documents = SERVICE.DefaultDiscoveryRuntimeService.records(response);
        if (documents.some(row => row.tenant !== request.tenant || row.payload?.publicationOwner !== scope.ownerCode ||
            row.payload.publicationGeneration !== current.token || row.payload.publicationStatus !== 'STAGED' ||
            row.payload.site !== context.site || row.payload.pageType !== context.pageType)) this.fail();
        return documents.map(row => row.payload);
    }
};
