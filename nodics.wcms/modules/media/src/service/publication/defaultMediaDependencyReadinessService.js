/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/service/DefaultMediaDependencyReadinessService
 * @description Qualifies exact caller-owned Media dependency snapshots through retained activation, byte integrity and a fresh pointer reread.
 * @layer service @owner media
 * @override Consumers own source snapshots; Media alone owns activation evidence and inert approval handoffs. Never approve or repair here.
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
    /** Reuses the canonical Media review handoff without granting or executing its commands. */
    handoff: function (mediaCode) {
        return SERVICE.DefaultMediaPublicationReviewService?.handoff(mediaCode)?.handoff;
    },
    /** Checks bounded immutable source assets without CMS, Editorial or publication-source authority. */
    inspectAssets: async function (publication, selection, request) {
        let inspectionStage = 'MEDIA_POINTERS';
        const unavailable = cause => ({ contractVersion: 1, owner: 'media', status: 'UNAVAILABLE',
            qualified: false, dependencies: [], inspectionStage,
            ownerErrorCode: cause && /^ERR_[A-Z0-9]+_[0-9]{5}$/.test(cause.code) ? cause.code : undefined,
            message: 'Exact Media dependency evidence is unavailable. Inspect Media publication before continuing.' });
        try {
            const policy = CONFIG.get('media')?.publication;
            if (policy?.versionProviderEnabled !== true || !publication || typeof publication.code !== 'string' ||
                typeof publication.targetVersion !== 'string' || !Array.isArray(selection) ||
                !Number.isSafeInteger(policy.maximumAssets) || policy.maximumAssets < 1 ||
                selection.length > policy.maximumAssets || selection.some(asset => !asset ||
                    typeof asset.code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]{0,159}$/.test(asset.code))) return unavailable();
            const assets = new Map(selection.map(asset => [asset.code, asset]));
            if (assets.size !== selection.length) return unavailable();
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
                    : 'Referenced Media requires separate exact-version publication and normal Process approval.'
            };
        } catch (cause) { return unavailable(cause); }
    }
};
