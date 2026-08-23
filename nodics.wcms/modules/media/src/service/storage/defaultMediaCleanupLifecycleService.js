/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');

/**
 * @module media/service/storage/DefaultMediaCleanupLifecycleService
 * @description Governs generic media cleanup discovery, passive marking, and approved retention cleanup.
 * @layer service
 * @owner media
 * @override Customers may decorate candidate policy and approval checks while preserving Media-owned physical lifecycle authority.
 */
module.exports = {
    /** Initializes the service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns generated-service records from a Nodics response. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Returns effective media publication or cleanup policy. */
    policy: function () {
        let media = CONFIG && typeof CONFIG.get === 'function' ? CONFIG.get('media') || {} : {};
        let cleanup = media.cleanup || {};
        return { scanBatchSize: Number(cleanup.scanBatchSize || 100), passiveRetentionDays: Number(cleanup.passiveRetentionDays || 30),
            cleanupApprovalRequired: cleanup.cleanupApprovalRequired !== false, removableStatuses: cleanup.removableStatuses || ['RETIRED', 'EXPIRED'] };
    },
    /** Builds a stable cleanup candidate code. */
    recordCode: function (parts) { return crypto.createHash('sha256').update([].concat(parts || []).map(part => String(part || '')).join('|')).digest('hex'); },
    /** Returns a redacted cleanup error code. */
    errorCode: function (error) { return error && (error.code || error.name) || 'MEDIA_CLEANUP_FAILED'; },
    /** Returns a redacted cleanup error message. */
    errorMessage: function (error) { return String(error && error.message || error || 'Media cleanup failed').slice(0, 500); },
    /** Classifies a cleanup candidate from media ownership metadata. */
    artifactClass: function (media) {
        let text = [media && media.folderCode, media && media.ownerType, media && media.businessPurpose].map(value => String(value || '')).join(' ').toLowerCase();
        if (text.includes('product')) return 'PRODUCT_ASSET';
        if (text.includes('cms') || text.includes('content')) return 'CMS_ASSET';
        if (text.includes('documentation') || text.includes('docs')) return 'DOCUMENTATION_ASSET';
        if (text.includes('import')) return 'IMPORT_FILE';
        if (text.includes('export')) return 'EXPORT_FILE';
        if (text.includes('generated')) return 'GENERATED_FILE';
        if (text.includes('customer')) return 'CUSTOMER_UPLOAD';
        if (text.includes('log') || text.includes('operational')) return 'OPERATIONAL_FILE';
        return 'CUSTOM';
    },
    /** Returns the cleanup reason for one media record. */
    reasonFor: function (media, now) {
        let status = String(media && media.status || '');
        if (media && media.retentionUntil && new Date(media.retentionUntil) <= now) return { code: 'RETENTION_EXPIRED', message: 'Media retention boundary has passed and no active reference was found.' };
        if (status === 'RETIRED') return { code: 'RETIRED_MEDIA', message: 'Media is retired and no active reference was found.' };
        if (status === 'EXPIRED') return { code: 'EXPIRED_MEDIA', message: 'Media is expired and no active reference was found.' };
        return { code: 'UNUSED_MEDIA', message: 'No active reference was found for this media item.' };
    },
    /** Returns whether active media references still protect this media record from cleanup. */
    hasActiveReferences: async function (media, request) {
        if (!SERVICE.DefaultMediaReferenceService || typeof SERVICE.DefaultMediaReferenceService.get !== 'function') return false;
        let response = await SERVICE.DefaultMediaReferenceService.get({ tenant: request.tenant, authData: request.authData,
            query: { active: true, mediaCode: media.code, status: 'ACTIVE' }, searchOptions: { limit: 1 } });
        return this.items(response).length > 0;
    },
    /** Projects one safe cleanup candidate record. */
    candidateFor: function (media, request, now) {
        let reason = this.reasonFor(media, now);
        let policy = this.policy();
        let detectedAt = now.toISOString();
        let purgeEligibleAt = new Date(now.getTime() + Math.max(1, policy.passiveRetentionDays) * 86400000).toISOString();
        return { code: this.recordCode([media.code, media.checksum, reason.code]), active: true, mediaCode: media.code, mediaChecksum: media.checksum,
            folderCode: media.folderCode, providerCode: media.providerCode, ownerModule: media.ownerModule, ownerType: media.ownerType,
            ownerReference: media.ownerReference, artifactClass: this.artifactClass(media), reasonCode: reason.code, reasonMessage: reason.message,
            detectedAt: detectedAt, purgeEligibleAt: purgeEligibleAt, legalHold: media.legalHold === true,
            status: media.legalHold === true ? 'LEGAL_HOLD_BLOCKED' : (request.previewOnly ? 'CLEANUP_PREVIEWED' : 'CLEANUP_CANDIDATE'),
            evidence: { source: request.source || 'media-cleanup-scan', mediaStatus: media.status, retentionUntil: media.retentionUntil, scannedAt: detectedAt } };
    },
    /** Scans and optionally persists cleanup candidates after reference and legal-hold checks. */
    scanCandidates: async function (request) {
        if (!SERVICE.DefaultMediaService || typeof SERVICE.DefaultMediaService.get !== 'function') throw new CLASSES.NodicsError('ERR_MED_00025', 'Media service is unavailable for cleanup scanning');
        let policy = this.policy();
        let now = request.now ? new Date(request.now) : new Date();
        let batchSize = Math.min(Number(request.batchSize || policy.scanBatchSize), 500);
        let mediaResponse = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
            query: { active: true, legalHold: { $ne: true }, $or: [{ status: { $in: policy.removableStatuses } }, { retentionUntil: { $lte: now } }] }, searchOptions: { limit: batchSize } });
        let mediaItems = this.items(mediaResponse);
        let result = { scanned: mediaItems.length, candidates: 0, skippedReferenced: 0, blockedByHold: 0, saved: 0,
            previewOnly: request.previewOnly === true, records: [], status: request.previewOnly === true ? 'MEDIA_CLEANUP_PREVIEW_COMPLETE' : 'MEDIA_CLEANUP_SCAN_COMPLETE' };
        for (let media of mediaItems) {
            if (media.legalHold === true) { result.blockedByHold += 1; continue; }
            if (await this.hasActiveReferences(media, request)) { result.skippedReferenced += 1; continue; }
            let candidate = this.candidateFor(media, request, now);
            result.candidates += 1;
            if (request.previewOnly !== true && SERVICE.DefaultMediaCleanupCandidateService && typeof SERVICE.DefaultMediaCleanupCandidateService.save === 'function') {
                let response = await SERVICE.DefaultMediaCleanupCandidateService.save({ tenant: request.tenant, authData: request.authData,
                    transactionContext: request.transactionContext, query: { code: candidate.code }, model: candidate });
                candidate = this.items(response)[0] || candidate;
                result.saved += 1;
            }
            result.records.push(candidate);
        }
        return result;
    },
    /** Returns cleanup candidates in dry-run mode without persistence. */
    previewCandidates: function (request) { return this.scanCandidates(Object.assign({}, request, { previewOnly: true })); },
    /** Marks one cleanup candidate passive while preserving physical media until approval-gated cleanup. */
    markPassive: async function (request) {
        if (!SERVICE.DefaultMediaCleanupCandidateService || typeof SERVICE.DefaultMediaCleanupCandidateService.get !== 'function') throw new CLASSES.NodicsError('ERR_MED_00026', 'Media cleanup candidate service is unavailable');
        let code = request.candidateCode || request.code;
        let candidates = this.items(await SERVICE.DefaultMediaCleanupCandidateService.get({ tenant: request.tenant, authData: request.authData,
            query: { code: code, active: true }, searchOptions: { limit: 2 } }));
        if (candidates.length !== 1) throw new CLASSES.NodicsError('ERR_MED_00027', 'Media cleanup candidate is unavailable or ambiguous');
        let candidate = candidates[0];
        if (candidate.legalHold === true || candidate.status === 'LEGAL_HOLD_BLOCKED') throw new CLASSES.NodicsError('ERR_MED_00028', 'Media cleanup candidate is blocked by legal hold');
        let now = request.now ? new Date(request.now) : new Date();
        let model = Object.assign({}, candidate, { passiveMarkedAt: now, status: 'PASSIVE', evidence: Object.assign({}, candidate.evidence || {}, {
            passiveMarkedAt: now.toISOString(), passiveMarkedBy: request.authData && (request.authData.email || request.authData.uid || request.authData.userName) || request.source || 'system', passiveReason: request.reason || candidate.reasonCode }) });
        let response = await SERVICE.DefaultMediaCleanupCandidateService.save({ tenant: request.tenant, authData: request.authData,
            transactionContext: request.transactionContext, query: { code: code }, model: model });
        if (SERVICE.DefaultMediaService && typeof SERVICE.DefaultMediaService.save === 'function' && candidate.mediaCode) {
            await SERVICE.DefaultMediaService.save({ tenant: request.tenant, authData: request.authData,
                transactionContext: request.transactionContext, query: { code: candidate.mediaCode }, model: { code: candidate.mediaCode, status: 'RETIRED' } });
        }
        return this.items(response)[0] || model;
    },
    /** Runs approval-gated passive retention cleanup through provider APIs. */
    runRetentionCleanup: async function (request) {
        if (!SERVICE.DefaultMediaCleanupCandidateService || typeof SERVICE.DefaultMediaCleanupCandidateService.get !== 'function') throw new CLASSES.NodicsError('ERR_MED_00026', 'Media cleanup candidate service is unavailable');
        let policy = this.policy();
        let now = request.now ? new Date(request.now) : new Date();
        let statuses = request.statuses || ['PASSIVE', 'CLEANUP_APPROVED'];
        let response = await SERVICE.DefaultMediaCleanupCandidateService.get({ tenant: request.tenant, authData: request.authData,
            query: { active: true, status: { $in: statuses }, legalHold: { $ne: true }, purgeEligibleAt: { $lte: now } }, searchOptions: { limit: Math.min(Number(request.batchSize || 100), 500) } });
        let candidates = this.items(response);
        let result = { scanned: candidates.length, cleaned: 0, skippedApproval: 0, failed: 0, status: 'MEDIA_RETENTION_CLEANUP_COMPLETE', records: [] };
        for (let candidate of candidates) {
            if (policy.cleanupApprovalRequired && !candidate.approvedAt && candidate.status !== 'CLEANUP_APPROVED') { result.skippedApproval += 1; continue; }
            try {
                await SERVICE.DefaultMediaCleanupCandidateService.save({ tenant: request.tenant, authData: request.authData,
                    transactionContext: request.transactionContext, query: { code: candidate.code }, model: Object.assign({}, candidate, { status: 'CLEANUP_IN_PROGRESS' }) });
                let removedPlacements = 0;
                if (SERVICE.DefaultMediaPlacementService && typeof SERVICE.DefaultMediaPlacementService.get === 'function') {
                    let placements = this.items(await SERVICE.DefaultMediaPlacementService.get({ tenant: request.tenant, authData: request.authData,
                        query: { active: true, mediaCode: candidate.mediaCode }, searchOptions: { limit: 100 } }));
                    for (let placement of placements) {
                        if (placement.providerCode && placement.storageKey) {
                            await SERVICE.DefaultMediaStorageProviderRegistryService.remove({ providerCode: placement.providerCode, storageKey: placement.storageKey });
                            removedPlacements += 1;
                        }
                    }
                }
                let cleaned = Object.assign({}, candidate, { status: 'CLEANED', evidence: Object.assign({}, candidate.evidence || {}, {
                    cleanedAt: now.toISOString(), removedPlacements: removedPlacements, cleanupSource: request.source || 'media-retention-cleanup' }) });
                let saved = await SERVICE.DefaultMediaCleanupCandidateService.save({ tenant: request.tenant, authData: request.authData,
                    transactionContext: request.transactionContext, query: { code: candidate.code }, model: cleaned });
                if (SERVICE.DefaultMediaService && typeof SERVICE.DefaultMediaService.save === 'function') {
                    await SERVICE.DefaultMediaService.save({ tenant: request.tenant, authData: request.authData,
                        transactionContext: request.transactionContext, query: { code: candidate.mediaCode }, model: { code: candidate.mediaCode, status: 'DELETED' } });
                }
                result.cleaned += 1;
                result.records.push(this.items(saved)[0] || cleaned);
            } catch (error) {
                result.failed += 1;
                let failed = Object.assign({}, candidate, { status: 'CLEANUP_FAILED', evidence: Object.assign({}, candidate.evidence || {}, {
                    failureCode: this.errorCode(error), failureMessage: this.errorMessage(error), failedAt: now.toISOString() }) });
                if (SERVICE.DefaultMediaCleanupCandidateService && typeof SERVICE.DefaultMediaCleanupCandidateService.save === 'function') {
                    await SERVICE.DefaultMediaCleanupCandidateService.save({ tenant: request.tenant, authData: request.authData,
                        transactionContext: request.transactionContext, query: { code: candidate.code }, model: failed });
                }
            }
        }
        if (result.failed) result.status = 'MEDIA_RETENTION_CLEANUP_FAILED';
        return result;
    }
};
