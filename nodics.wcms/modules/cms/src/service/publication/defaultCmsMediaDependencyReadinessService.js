/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */

/**
 * @module cms/service/publication/DefaultCmsMediaDependencyReadinessService
 * @description Qualifies retained Media dependencies of the exact CMS Online release through owner APIs.
 * @layer service
 * @owner cms
 * @override Later layers may decorate diagnostics, preserving immutable release bindings and Media approval authority.
 */
module.exports = {
    /** Rejects omitted, duplicated, reordered or malformed batch evidence from an owner overlay. */
    readOnlineVersions: async function (owner, codes, request) {
        const response = await owner.getOnlineVersions(codes, request);
        if (!response || !Array.isArray(response.statuses) || response.statuses.length !== codes.length ||
            response.statuses.some((item, index) => !item || item.mediaCode !== codes[index] ||
                (item.status !== null && (!item.status || !/^[a-f0-9]{64}$/.test(item.status.version || '') ||
                    !Number.isSafeInteger(item.status.revision) || item.status.revision < 1)))) {
            throw new Error('Media pointer batch was not acknowledged');
        }
        return new Map(response.statuses.map(item => [item.mediaCode, item.status]));
    },
    /** Names an exact asset approval cycle without exposing commands or duplicating Media state. */
    publicationCode: function (publication, asset) {
        return 'cmsMedia_' + require('node:crypto').createHash('sha256')
            .update(JSON.stringify([publication.code, publication.targetVersion, asset.code, asset.versionId, asset.checksum]))
            .digest('hex');
    },
    /** Reuses Media's inert navigation contribution; this never grants permission or submits a command. */
    handoff: function (mediaCode) {
        try {
            const owner = SERVICE.DefaultMediaBackofficeCapabilityService;
            const capability = owner && owner.getCapability();
            const navigation =
                capability &&
                []
                    .concat(capability.navigation || [])
                    .find((item) => item.id === 'media-publication-requests');
            if (
                !navigation ||
                typeof navigation.route !== 'string' ||
                !/^\/[A-Za-z0-9/_-]+$/.test(navigation.route)
            )
                return undefined;
            return {
                owner: 'media',
                route: navigation.route,
                label: navigation.label,
                query: { mediaCode },
                available: navigation.featureState === 'ACTIVE',
                requiredPermissions: navigation.requiredPermissions,
                backendWorkspace: navigation.backendWorkspace,
                automaticExecution: false,
                requiresOwnerInspection: true
            };
        } catch (_) {
            return undefined;
        }
    },
    /** Reads only persisted CMS manifests and Media-owned activation evidence; never publishes assets. */
    inspect: async function (publication, request) {
        const policy = (CONFIG.get('media') || {}).publication || {};
        if (policy.versionProviderEnabled !== true) {
            return {
                contractVersion: 1,
                owner: 'media',
                status: 'NOT_REQUIRED',
                qualified: true,
                dependencies: []
            };
        }
        let inspectionStage = 'CMS_MANIFEST';
        const unavailable = (cause) => ({
            contractVersion: 1,
            owner: 'media',
            status: 'UNAVAILABLE',
            qualified: false,
            dependencies: [],
            inspectionStage,
            ownerErrorCode: cause && /^ERR_[A-Z0-9]+_[0-9]{5}$/.test(cause.code) ? cause.code : undefined,
            message:
                'Exact Media dependency evidence is unavailable. Review Media publication before declaring the application ready.'
        });
        try {
            if (!publication || !publication.targetVersion)
                return unavailable();
            const manifests =
                SERVICE.DefaultCmsPublicationVersionProviderService.manifests();
            const root = await manifests.getManifest(
                publication.targetVersion,
                request
            );
            if (
                !root ||
                root.code !== publication.targetVersion ||
                root.publicationCode !== publication.code
            )
                return unavailable();
            const releases = [root];
            if (root.snapshot && root.snapshot.bundleType === 'SITE_INDEX') {
                const routes = root.snapshot.routes;
                const maximum = Number(
                    ((CONFIG.get('cms') || {}).publication || {})
                        .maxBundleRoutes || 200
                );
                if (!Array.isArray(routes) || routes.length > maximum)
                    return unavailable();
                for (const route of routes) {
                    const child = await manifests.getManifest(
                        route.manifestCode,
                        request
                    );
                    if (
                        !child ||
                        child.code !== route.manifestCode ||
                        child.publicationCode !== publication.code ||
                        child.contentHash !== route.contentHash
                    )
                        return unavailable();
                    releases.push(child);
                }
            }
            const assets = new Map();
            for (const release of releases) {
                for (const asset of release.mediaAssets || []) {
                    if (
                        !asset ||
                        typeof asset.code !== 'string' ||
                        !/^[A-Za-z0-9][A-Za-z0-9._-]{0,191}$/.test(asset.code)
                    )
                        return unavailable();
                    const previous = assets.get(asset.code);
                    if (
                        previous &&
                        (previous.versionId !== asset.versionId ||
                            previous.checksum !== asset.checksum)
                    )
                        return unavailable();
                    assets.set(asset.code, asset);
                }
            }
            const maximum = Number(
                ((CONFIG.get('media') || {}).publication || {}).maximumAssets ||
                    100
            );
            if (
                assets.size > maximum ||
                (publication.mediaCodes || []).some((code) => !assets.has(code))
            )
                return unavailable();
            if (assets.size === 0) {
                return {
                    contractVersion: 1,
                    owner: 'media',
                    status: 'NOT_REQUIRED',
                    qualified: true,
                    dependencies: []
                };
            }
            const dependencies = [];
            const owner = SERVICE.DefaultMediaPublicationVersionProviderService;
            const pinnedCodes = [...assets.values()].filter(asset =>
                Number.isSafeInteger(asset.versionId) && asset.versionId >= 0).map(asset => asset.code);
            const batching = owner && typeof owner.getOnlineVersions === 'function' && pinnedCodes.length > 0;
            const integrityBatch = batching && typeof owner.reconcileVersions === 'function';
            const integritySelection = [];
            inspectionStage = 'MEDIA_POINTERS';
            const initial = batching ? await this.readOnlineVersions(owner, pinnedCodes, request) : undefined;
            for (const asset of assets.values()) {
                const dependency = {
                    mediaCode: asset.code,
                    versionId: asset.versionId,
                    checksum: asset.checksum,
                    publicationCode: this.publicationCode(publication, asset),
                    owner: 'media',
                    status: 'VERSION_UNPINNED',
                    qualified: false,
                    handoff: this.handoff(asset.code),
                    nextAction:
                        'Review exact-version Media publication and its Process approval.',
                    publicationRequest:
                        Number.isSafeInteger(asset.versionId) &&
                        asset.versionId >= 0
                            ? {
                                  moduleName: 'media',
                                  method: 'POST',
                                  apiName: '/publication/requests',
                                  input: {
                                      mediaCode: asset.code,
                                      versionId: asset.versionId
                                  },
                                  requiredInput: ['publicationCode'],
                                  automaticExecution: false,
                                  approvalRequired: true
                              }
                            : undefined
                };
                if (
                    Number.isSafeInteger(asset.versionId) &&
                    asset.versionId >= 0
                ) {
                    dependency.status = 'NOT_ACTIVATED';
                    if (!owner) return unavailable();
                    inspectionStage = 'MEDIA_POINTERS';
                    const active = batching ? initial.get(asset.code) : await owner.getOnlineVersion(
                        { rootCode: asset.code },
                        request
                    );
                    if (active) {
                        if (
                            !/^[a-f0-9]{64}$/.test(active.version || '') ||
                            !Number.isSafeInteger(active.revision) ||
                            active.revision < 1
                        )
                            return unavailable();
                        inspectionStage = 'MEDIA_MANIFEST';
                        const retained = await owner.getVersion(
                            {
                                domain: 'media',
                                rootType: 'media',
                                rootCode: asset.code,
                                sourceVersion: active.version
                            },
                            request
                        );
                        const actual =
                            retained &&
                            retained.artifacts &&
                            retained.artifacts.asset;
                        const fields = [
                            'code',
                            'versionId',
                            'name',
                            'description',
                            'folderCode',
                            'formatCode',
                            'originalFileName',
                            'mimeType',
                            'sizeBytes',
                            'checksum',
                            'checksumAlgorithm',
                            'access',
                            'businessPurpose',
                            'ownerType',
                            'ownerReference',
                            'enterpriseCode',
                            'reusable'
                        ];
                        dependency.status =
                            retained.code === active.version &&
                            actual &&
                            fields.every((key) => actual[key] === asset[key])
                                ? 'ACTIVE'
                                : 'VERSION_MISMATCH';
                        if (dependency.status === 'ACTIVE') {
                            if (integrityBatch) {
                                integritySelection.push({ mediaCode: asset.code, manifestCode: active.version });
                            } else {
                                inspectionStage = 'MEDIA_BYTES';
                                const physical = await owner.transport().reconcile(
                                    {
                                        mediaCode: asset.code,
                                        manifestCode: active.version
                                    },
                                    request
                                );
                                inspectionStage = 'MEDIA_POINTER_RECHECK';
                                const fresh = batching ? active : await owner.getOnlineVersion(
                                    { rootCode: asset.code },
                                    request
                                );
                                if (
                                    !physical ||
                                    physical.mediaCode !== asset.code ||
                                    physical.manifestCode !== active.version ||
                                    physical.intact !== true ||
                                    physical.active !== true ||
                                    physical.repaired !== false ||
                                    physical.deleted !== false
                                ) {
                                    dependency.status = 'BYTES_UNAVAILABLE';
                                } else if (
                                    !fresh ||
                                    fresh.version !== active.version ||
                                    fresh.revision !== active.revision
                                ) {
                                    dependency.status = 'ACTIVATION_CHANGED';
                                } else {
                                    dependency.storedBytesVerified = true;
                                }
                            }
                        }
                        dependency.qualified = dependency.status === 'ACTIVE';
                        dependency.activeVersion = active.version;
                    }
                }
                dependencies.push(dependency);
            }
            if (integritySelection.length) {
                inspectionStage = 'MEDIA_BYTES';
                const physical = await owner.reconcileVersions(integritySelection, request);
                if (!physical || !Array.isArray(physical.results) || physical.results.length !== integritySelection.length ||
                    physical.results.some((item, index) => !item || item.mediaCode !== integritySelection[index].mediaCode ||
                        item.manifestCode !== integritySelection[index].manifestCode || typeof item.intact !== 'boolean' ||
                        typeof item.active !== 'boolean' || item.protected !== true || item.repaired !== false || item.deleted !== false)) return unavailable();
                for (const item of physical.results) {
                    const dependency = dependencies.find(value => value.mediaCode === item.mediaCode);
                    if (!item.intact || !item.active) {
                        dependency.status = 'BYTES_UNAVAILABLE';
                        dependency.qualified = false;
                    } else dependency.storedBytesVerified = true;
                }
            }
            if (batching && dependencies.some(item => item.qualified)) {
                inspectionStage = 'MEDIA_POINTER_RECHECK';
                const fresh = await this.readOnlineVersions(owner, pinnedCodes, request);
                for (const dependency of dependencies.filter(item => item.qualified)) {
                    const before = initial.get(dependency.mediaCode);
                    const after = fresh.get(dependency.mediaCode);
                    if (!after || after.version !== before.version || after.revision !== before.revision) {
                        dependency.status = 'ACTIVATION_CHANGED';
                        dependency.qualified = false;
                        delete dependency.storedBytesVerified;
                    }
                }
            }
            const qualified = dependencies.every((item) => item.qualified);
            return {
                contractVersion: 1,
                owner: 'media',
                status: qualified ? 'READY' : 'ACTION_REQUIRED',
                qualified,
                dependencies,
                message: qualified
                    ? 'Exact Media dependencies have owner activation evidence.'
                    : 'CMS is Online, but referenced Media requires separate exact-version publication and normal Process approval.'
            };
        } catch (cause) {
            return unavailable(cause);
        }
    }
};
