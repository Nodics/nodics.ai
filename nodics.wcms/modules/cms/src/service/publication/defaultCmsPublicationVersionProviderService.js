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
        if (publication.rootType !== 'site') {
            const locales = this.manifests().routePublicationLocales(route);
            if (locales.length > 1 || locales[0] !== route.locale) {
                const versions = [];
                for (const locale of locales) versions.push(await this.transport().getStatus({ scope: {
                    site: route.site, path: route.path, locale, channel: route.channel, accessMode: route.accessMode
                } }, request));
                if (versions.every(version => !version)) return undefined;
                if (versions.some(version => !version || typeof version.version !== 'string' || !version.version) ||
                    new Set(versions.map(version => version.version)).size !== 1)
                    throw new CLASSES.NodicsError('CMS_PUBLICATION_POINTER_CONFLICT', 'Shared-route Online locale pointers do not agree');
                return { version: versions[0].version, routeCount: locales.length };
            }
        }
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
    /** Retains the original activation identity across callback and transport recovery. */
    activationIdentity: function (publication) {
        const fallback = publication.code + ':activate:' + Number(publication.revision || 0);
        const key = publication.activationOperation?.key || fallback;
        const prefix = publication.code + ':activate:';
        const suffix = key.startsWith(prefix) ? key.slice(prefix.length) : '';
        const revision = Number(suffix);
        if (!/^(0|[1-9][0-9]*)$/.test(suffix) || !Number.isSafeInteger(revision) || revision > Number(publication.revision || 0))
            throw new CLASSES.NodicsError('ERR_CMS_00117');
        return { key, revision };
    },
    /** Reconciles Online evidence for the exact target manifest without permitting pointer repair. */
    reconcile: function (publication, request) {
        this.assertStagedRuntime();
        if (!publication.targetVersion) return Promise.resolve({ status: 'NOT_DEPLOYED', repaired: false });
        return this.transport().reconcile({ manifestCode: publication.targetVersion,
            repairEvidence: request.repairEvidence === true,
            operationKey: this.activationIdentity(publication).key }, request);
    },
    /** Recovers a target deploy whose Online commit succeeded but whose transport response failed. */
    recoverCommittedDeploy: async function (publication, manifest, request, error) {
        let operationKey = this.activationIdentity(publication).key;
        let reconciliation = await this.transport().reconcile({ manifestCode: manifest.code,
            repairEvidence: true, operationKey: operationKey }, request).catch(() => undefined);
        if (!reconciliation || !['CONSISTENT', 'REPAIRED'].includes(reconciliation.status)) throw error;
        let status = await this.transport().getStatus({ manifestCode: manifest.code }, request).catch(() => undefined);
        let deployReceipt = [].concat(status && status.receipts || [])
            .find(item => item.operation === 'DEPLOY' && item.status === 'ONLINE' && item.operationKey === operationKey &&
                item.manifestCode === manifest.code && item.targetVersion === manifest.code &&
                item.publicationCode === publication.code && item.sourceVersion === publication.sourceVersion);
        if (!deployReceipt || status?.manifest?.code !== manifest.code || reconciliation.manifestCode !== manifest.code) throw error;
        return { version: manifest.code,
            previousOnlineVersion: deployReceipt && deployReceipt.previousOnlineVersion,
            recovered: true, recoveryStatus: reconciliation.status };
    },
    /** Builds an immutable manifest and atomically activates its Online pointer. */
    activate: async function (publication, request) {
        this.assertStagedRuntime();
        if (publication.targetVersion && ['ROLLED_BACK', 'WITHDRAWN'].includes(publication.recoveryFromState)) {
            return this.transport().rollback({ manifestCode: publication.targetVersion,
                operationKey: publication.code + ':recover:' + String(publication.revision) }, request);
        }
        const activation = this.activationIdentity(publication);
        const retained = { ...publication, revision: activation.revision };
        let manifest = await this.manifests().persist(retained, request);
        if (publication.rootType === 'site') {
            let publicationPolicy = ((CONFIG.get('cms') || {}).publication || {});
            let targetPolicy = (publicationPolicy.target || {});
            let chunkThreshold = Number(publicationPolicy.siteBundleChunkThresholdBytes || targetPolicy.maxManifestBytes || 5242880);
            if (manifest.snapshot && manifest.snapshot.bundleType === 'SITE' && this.manifests().manifestBytes(manifest) > chunkThreshold) {
                manifest = await this.manifests().persistChunkedSite(retained, manifest, request);
            }
            for (let child of [].concat(manifest.preparedRouteManifests || [])) {
                await this.transport().deploy({ manifest: child, prepareOnly: true,
                    operationKey: publication.code + ':prepare:' + child.code + ':' + String(activation.revision) }, request);
            }
        }
        try {
            return await this.transport().deploy({ manifest: manifest,
                operationKey: activation.key }, request);
        } catch (error) {
            return this.recoverCommittedDeploy(publication, manifest, request, error);
        }
    },
    /** Qualifies the original current release before offering or starting rollback. */
    assertRollbackTarget: async function (publication, request) {
        const current = await this.getOnlineVersion(publication, request);
        if (!publication.targetVersion || current?.version !== publication.targetVersion)
            throw new CLASSES.NodicsError('ERR_CMS_00116');
    },
    /** Allows a fresh retry only for a journaled scope rejection that occurred before the target transaction wrote anything. */
    canRetryRejectedRollback: async function (publication, request) {
        const trail = publication.auditTrail || [], failed = trail.at(-1), started = trail.at(-2), online = trail.at(-3);
        if (publication.state !== 'FAILED' || !Number.isSafeInteger(publication.revision) ||
            failed?.publicationCode !== publication.code || failed.revision !== publication.revision || failed.toState !== 'FAILED' ||
            failed.fromState !== 'ROLLING_BACK' || failed.details?.failureCode !== 'ERR_CMS_00116' ||
            started?.publicationCode !== publication.code || started.revision !== publication.revision - 1 ||
            started.fromState !== 'ONLINE' || started.toState !== 'ROLLING_BACK' ||
            online?.publicationCode !== publication.code || online.revision !== publication.revision - 2 || online.toState !== 'ONLINE' ||
            online.details?.version !== publication.targetVersion || online.details?.previousOnlineVersion !== publication.previousOnlineVersion ||
            !publication.previousOnlineVersion || publication.previousOnlineVersion === publication.targetVersion) return false;
        const current = await this.getOnlineVersion(publication, request);
        return current?.version === publication.targetVersion;
    },

    /** Atomically restores a previously active immutable manifest. */
    rollback: async function (publication, targetVersion, request) {
        this.assertStagedRuntime();
        if (!targetVersion) throw new CLASSES.NodicsError('CMS_PUBLICATION_ROLLBACK_UNAVAILABLE', 'Previous CMS Online manifest is unavailable');
        return this.transport().rollback({ manifestCode: targetVersion, expectedCurrentManifestCode: publication.targetVersion,
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
