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
        const unavailable = () => ({
            contractVersion: 1,
            owner: 'media',
            status: 'UNAVAILABLE',
            qualified: false,
            dependencies: [],
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
            for (const asset of assets.values()) {
                const dependency = {
                    mediaCode: asset.code,
                    versionId: asset.versionId,
                    checksum: asset.checksum,
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
                    const owner =
                        SERVICE.DefaultMediaPublicationVersionProviderService;
                    if (!owner) return unavailable();
                    const active = await owner.getOnlineVersion(
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
                            const physical = await owner.transport().reconcile(
                                {
                                    mediaCode: asset.code,
                                    manifestCode: active.version
                                },
                                request
                            );
                            const fresh = await owner.getOnlineVersion(
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
                        dependency.qualified = dependency.status === 'ACTIVE';
                        dependency.activeVersion = active.version;
                    }
                }
                dependencies.push(dependency);
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
        } catch (_) {
            return unavailable();
        }
    }
};
