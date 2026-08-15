/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/storage/DefaultMediaLifecycleCoordinationService
 * @description Lets an owning capability bind retention and legal-hold policy while media alone mutates storage lifecycle.
 * @layer service
 * @owner media
 * @override Storage providers may replace deletion mechanics while retaining purpose, hold, optimistic version, and safe result contracts.
 */
module.exports = {
    init: () => Promise.resolve(true),
    postInit: () => Promise.resolve(true),
    records: value => value && Array.isArray(value.result) ? value.result : [],

    /**

     * Loads the module artifact within the media-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    load: async function (request) {
        const rows = this.records(await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData, query: { code: request.mediaCode }, searchOptions: { limit: 2 } }));
        if (rows.length !== 1) throw this.error('ERR_MED_00001', 'The scoped media item was not found.');
        return rows[0];
    },

    /** Loads one governed media reference by code. */
    loadReference: async function (request) {
        const rows = this.records(await SERVICE.DefaultMediaReferenceService.get({ tenant: request.tenant, authData: request.authData, query: { code: request.referenceCode }, searchOptions: { limit: 2 } }));
        if (rows.length !== 1) throw this.error('ERR_MED_00001', 'The scoped media reference was not found.');
        return rows[0];
    },

    /** Ensures replacement media has backend-calculated checksum evidence before approval. */
    assertChecksumEvidence: function (media, request) {
        const checksum = request.checksum || media.checksum;
        if (!checksum) throw this.error('ERR_MED_00020', 'Media checksum evidence is required before approval.');
        return checksum;
    },

    /** Approves rights and target usage without activating the reference. */
    approveReference: async function (request) {
        const reference = await this.loadReference(request);
        const media = await this.load(Object.assign({}, request, { mediaCode: request.mediaCode || reference.mediaCode }));
        const checksum = this.assertChecksumEvidence(media, request);
        const evidence = Object.assign({}, reference.evidence || {}, {
            rightsStatus: 'APPROVED',
            approvalStatus: 'APPROVED',
            approvedReferenceSiteAsset: false,
            productionUseAllowed: false,
            checksum: checksum,
            checksumAlgorithm: request.checksumAlgorithm || media.checksumAlgorithm || 'sha256',
            sourceSystem: request.sourceSystem,
            licenseType: request.licenseType,
            assetOwner: request.assetOwner,
            reviewer: request.reviewer,
            approvalTimestamp: request.approvalTimestamp || request.now || new Date().toISOString(),
            targetType: request.targetType || reference.relationType,
            targetCode: request.targetCode || reference.ownerCode,
            usageScope: request.usageScope || 'TARGET_ONLY'
        });
        const model = Object.assign({}, reference, { mediaCode: media.code, status: 'INACTIVE', evidence });
        await SERVICE.DefaultMediaReferenceService.update({ tenant: request.tenant, authData: request.authData, query: { code: reference.code }, model });
        return { referenceCode: reference.code, mediaCode: media.code, approved: true, activated: false, evidence };
    },

    /** Activates an already approved media reference for the target usage. */
    activateReference: async function (request) {
        const reference = await this.loadReference(request);
        const evidence = Object.assign({}, reference.evidence || {});
        if (evidence.approvalStatus !== 'APPROVED' || !evidence.checksum) throw this.error('ERR_MED_00020', 'Approved checksum evidence is required before activation.');
        const nextEvidence = Object.assign({}, evidence, {
            productionUseAllowed: true,
            activationRevision: request.activationRevision || String(Number(reference.revision || reference.version || 0) + 1),
            activatedBy: request.activatedBy || request.reviewer,
            activatedAt: request.activatedAt || request.now || new Date().toISOString()
        });
        const model = Object.assign({}, reference, { status: 'ACTIVE', evidence: nextEvidence });
        await SERVICE.DefaultMediaReferenceService.update({ tenant: request.tenant, authData: request.authData, query: { code: reference.code }, model });
        return { referenceCode: reference.code, mediaCode: reference.mediaCode, approved: true, activated: true, evidence: nextEvidence };
    },

    /** Deactivates a reference while retaining previous approval and rollback evidence. */
    deactivateReference: async function (request) {
        const reference = await this.loadReference(request);
        const evidence = Object.assign({}, reference.evidence || {}, {
            productionUseAllowed: false,
            deactivationReason: request.reasonCode || 'DEACTIVATION_REQUESTED',
            deactivatedBy: request.deactivatedBy || request.reviewer,
            deactivatedAt: request.deactivatedAt || request.now || new Date().toISOString(),
            recoveryNote: request.recoveryNote
        });
        const model = Object.assign({}, reference, { status: 'INACTIVE', evidence });
        await SERVICE.DefaultMediaReferenceService.update({ tenant: request.tenant, authData: request.authData, query: { code: reference.code }, model });
        return { referenceCode: reference.code, mediaCode: reference.mediaCode, deactivated: true, evidence };
    },

    /**

     * Executes the bind operation within the media-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    bind: async function (request) {
        const media = await this.load(request);
        if (media.businessPurpose && media.businessPurpose !== request.businessPurpose) throw this.error('ERR_MED_00001', 'Media purpose cannot be rebound.');
        if (media.ownerReference && media.ownerReference !== request.ownerReference && media.reusable !== true) throw this.error('ERR_MED_00001', 'Media owner cannot be rebound.');
        await SERVICE.DefaultMediaService.update({ tenant: request.tenant, authData: request.authData, query: { code: media.code, version: media.version }, model: { $set: { businessPurpose: request.businessPurpose, ownerType: request.ownerType, ownerReference: request.ownerReference, reusable: request.reusable === true, retentionUntil: request.retentionUntil, legalHold: request.legalHold === true, version: Number(media.version || 0) + 1 } } });
        return { mediaCode: media.code, businessPurpose: request.businessPurpose, retentionUntil: request.retentionUntil, legalHold: request.legalHold === true };
    },

    /**

     * Executes the set legal hold operation within the media-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    setLegalHold: async function (request) {
        const media = await this.load(request);
        await SERVICE.DefaultMediaService.update({ tenant: request.tenant, authData: request.authData, query: { code: media.code, version: media.version }, model: { $set: { legalHold: request.legalHold === true, version: Number(media.version || 0) + 1 } } });
        return { mediaCode: media.code, legalHold: request.legalHold === true };
    },

    /**

     * Deletes expired within the media-owned layered contract.

     *

     * @param {*} request Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    deleteExpired: async function (request) {
        const media = await this.load(request);
        if (media.legalHold === true || request.legalHold === true) throw this.error('ERR_MED_00019', 'Media deletion is blocked by legal hold.');
        if (!media.retentionUntil || new Date(media.retentionUntil).getTime() > new Date(request.now || Date.now()).getTime()) throw this.error('ERR_MED_00019', 'Media retention has not elapsed.');
        if (media.status === 'DELETED') return { mediaCode: media.code, deleted: true, idempotent: true };
        await SERVICE.DefaultMediaStorageProviderRegistryService.remove({ tenant: request.tenant, authData: request.authData, providerCode: media.providerCode, storageKey: media.storageKey });
        await SERVICE.DefaultMediaService.update({ tenant: request.tenant, authData: request.authData, query: { code: media.code, version: media.version }, model: { $set: { status: 'DELETED', storageKey: 'deleted', relativePath: undefined, fullPath: undefined, url: undefined, accessUrl: undefined, version: Number(media.version || 0) + 1 } } });
        return { mediaCode: media.code, deleted: true, idempotent: false };
    },

    /**

     * Executes the error operation within the media-owned layered contract.

     *

     * @param {*} code Value defined by the surrounding Nodics operation contract.

     * @param {*} message Value defined by the surrounding Nodics operation contract.

     * @returns {*} The synchronous value or Promise produced by the implementation.

     * @throws Propagates validation, authorization, persistence, or delegated service failures.

     * @override Later project or customer modules may override this exported extension point.

     */

    error: function (code, message) { const error = new Error(message); error.code = code; return error; }
};
