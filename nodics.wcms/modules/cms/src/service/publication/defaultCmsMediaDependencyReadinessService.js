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
            return SERVICE.DefaultMediaDependencyReadinessService.inspectAssets(publication, [...assets.values()], request);
        } catch (cause) {
            return unavailable(cause);
        }
    }
};
