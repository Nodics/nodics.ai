/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/service/publication/DefaultCmsPublicationVersionProviderService
 * @description Implements the nPublish version-provider contract with CMS immutable manifests and atomic Online pointers.
 * @layer service
 * @owner cms
 * @override Projects may replace storage orchestration while preserving exact-version activation, idempotency, and rollback contracts.
 */
module.exports = {
    /** Initializes the CMS publication version provider. */
    init: function () { return Promise.resolve(true); },
    /** Completes CMS publication version provider initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves the CMS-owned publication adapter. */
    adapter: function () { return SERVICE.DefaultCmsPublicationAdapterService; },
    /** Resolves the configured CMS manifest orchestration service. */
    manifests: function () {
        let name = ((CONFIG.get('cms') || {}).publication || {}).manifestService;
        if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('CMS_PUBLICATION_SERVICE_UNAVAILABLE', 'CMS manifest orchestration is unavailable');
        return SERVICE[name];
    },
    /** Rejects source lifecycle operations outside the explicitly configured Staged runtime. */
    assertStagedRuntime: function () {
        if (((CONFIG.get('cms') || {}).publication || {}).runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('CMS_PUBLICATION_SOURCE_ROLE_INVALID', 'CMS source publication requires a versioned Staged runtime');
        }
    },
    /** Resolves the configured transport to the independently deployed Online CMS target. */
    transport: function () {
        let name = ((CONFIG.get('cms') || {}).publication || {}).targetTransportProvider;
        if (!name || !SERVICE[name]) throw new CLASSES.NodicsError('CMS_PUBLICATION_TARGET_UNAVAILABLE', 'CMS Online target transport is unavailable');
        return SERVICE[name];
    },
    /** Loads the immutable root version selected by the publication request. */
    getVersion: function (publication, request) {
        this.assertStagedRuntime();
        return this.adapter().getVersion(publication, request);
    },
    /** Returns the currently active immutable manifest for the publication route scope. */
    getOnlineVersion: async function (publication, request) {
        this.assertStagedRuntime();
        let route = await this.getVersion(publication, request);
        let scope = publication.rootType === 'site' ? { site: route.code, bundle: true } :
            { site: route.site, path: route.path, locale: route.locale, channel: route.channel, accessMode: route.accessMode };
        return this.transport().getStatus({ scope: scope }, request);
    },
    /** Returns sanitized target evidence for one exact deployed manifest. */
    getLineage: function (publication, request) {
        this.assertStagedRuntime();
        if (!publication.targetVersion) return Promise.resolve(undefined);
        return this.transport().getStatus({ manifestCode: publication.targetVersion }, request);
    },
    /** Reconciles Online evidence for the exact target manifest without permitting pointer repair. */
    reconcile: function (publication, request) {
        this.assertStagedRuntime();
        if (!publication.targetVersion) return Promise.resolve({ status: 'NOT_DEPLOYED', repaired: false });
        return this.transport().reconcile({ manifestCode: publication.targetVersion,
            repairEvidence: request.repairEvidence === true,
            operationKey: publication.code + ':reconcile:' + String(publication.revision) }, request);
    },
    /** Builds an immutable manifest and atomically activates its Online pointer. */
    activate: async function (publication, request) {
        this.assertStagedRuntime();
        if (publication.targetVersion && ['ROLLED_BACK', 'WITHDRAWN'].includes(publication.recoveryFromState)) {
            return this.transport().rollback({ manifestCode: publication.targetVersion,
                operationKey: publication.code + ':recover:' + String(publication.revision) }, request);
        }
        let manifest = await this.manifests().persist(publication, request);
        if (publication.rootType === 'site') {
            let publicationPolicy = ((CONFIG.get('cms') || {}).publication || {});
            let targetPolicy = (publicationPolicy.target || {});
            let chunkThreshold = Number(publicationPolicy.siteBundleChunkThresholdBytes || targetPolicy.maxManifestBytes || 5242880);
            if (manifest.snapshot && manifest.snapshot.bundleType === 'SITE' && this.manifests().manifestBytes(manifest) > chunkThreshold) {
                manifest = await this.manifests().persistChunkedSite(publication, manifest, request);
            }
            for (let child of [].concat(manifest.preparedRouteManifests || [])) {
                await this.transport().deploy({ manifest: child, prepareOnly: true,
                    operationKey: publication.code + ':prepare:' + child.code + ':' + String(publication.revision) }, request);
            }
        }
        return this.transport().deploy({ manifest: manifest,
            operationKey: publication.code + ':activate:' + String(publication.revision) }, request);
    },
    /** Atomically restores a previously active immutable manifest. */
    rollback: async function (publication, targetVersion, request) {
        this.assertStagedRuntime();
        if (!targetVersion) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROLLBACK_UNAVAILABLE', 'Previous CMS Online manifest is unavailable');
        return this.transport().rollback({ manifestCode: targetVersion,
            operationKey: publication.code + ':rollback:' + String(publication.revision) }, request);
    },
    /** Removes the publication's currently active route pointers from Online delivery. */
    withdraw: async function (publication, request) {
        this.assertStagedRuntime();
        if (!publication.targetVersion) throw new CLASSES.NodicsError('CMS_PUBLICATION_WITHDRAWAL_UNAVAILABLE', 'CMS Online manifest is unavailable');
        return this.transport().withdraw({ manifestCode: publication.targetVersion,
            operationKey: publication.code + ':withdraw:' + String(publication.revision) }, request);
    }
};
