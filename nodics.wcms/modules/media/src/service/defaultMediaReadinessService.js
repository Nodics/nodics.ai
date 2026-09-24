/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module media/service/DefaultMediaReadinessService
 * @description Reports Media-owned readiness for physical artifacts, metadata, references, and cleanup review.
 * @layer service
 * @owner media
 * @override Domains may add collector evidence, but Media owns object/reference/physical lifecycle readiness.
 */
module.exports = {
    /** Initializes the service. */
    init: function () { return Promise.resolve(true); },
    /** Completes service initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns generated-service records from a Nodics response. */
    items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Builds stable governed repair metadata for Axis/BackOffice. */
    repair: function (operation, action, label, available) {
        return { operation: operation, action: action, label: label, available: available === true, eligibility: available === true ? 'MANUAL' : 'NOT_AVAILABLE' };
    },
    /** Returns whether a media object has any physical location or inline content evidence. */
    hasPhysicalArtifact: function (media) {
        return !!(media && (media.storageKey || media.contentBase64 || media.url || media.accessUrl ||
            media.publicUrl || media.originalUrl || media.sourceStorageKey));
    },
    /** Returns whether media object metadata is complete enough for owner consumption/publication. */
    hasRequiredMetadata: function (media) {
        return !!(media && media.code && media.providerCode && media.status &&
            (media.mimeType || media.extension || media.formatCode) &&
            (media.ownerReference || media.ownerType || media.folderCode || media.businessPurpose));
    },
    /** Loads a bounded set of media objects for readiness diagnostics. */
    mediaObjects: async function (request) {
        if (!SERVICE.DefaultMediaService || typeof SERVICE.DefaultMediaService.get !== 'function') {
            return { providerAvailable: false, records: [] };
        }
        let response = await SERVICE.DefaultMediaService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({ active: true }, request.mediaQuery || {}), searchOptions: { limit: Math.min(Number(request.limit || 100), 500) } });
        return { providerAvailable: true, records: this.items(response) };
    },
    /** Loads a bounded set of media references for readiness diagnostics. */
    mediaReferences: async function (request) {
        if (!SERVICE.DefaultMediaReferenceService || typeof SERVICE.DefaultMediaReferenceService.get !== 'function') {
            return { providerAvailable: false, records: [] };
        }
        let response = await SERVICE.DefaultMediaReferenceService.get({ tenant: request.tenant, authData: request.authData,
            query: Object.assign({ active: true }, request.referenceQuery || {}), searchOptions: { limit: Math.min(Number(request.limit || 100), 500) } });
        return { providerAvailable: true, records: this.items(response) };
    },
    /** Builds read-only cleanup candidate evidence through the existing Media cleanup lifecycle contract. */
    cleanupPreview: async function (request) {
        if (!SERVICE.DefaultMediaCleanupLifecycleService || typeof SERVICE.DefaultMediaCleanupLifecycleService.previewCandidates !== 'function') {
            return { providerAvailable: false, candidates: 0, records: [] };
        }
        let preview = await SERVICE.DefaultMediaCleanupLifecycleService.previewCandidates(Object.assign({}, request, { source: 'media-readiness' }));
        return Object.assign({ providerAvailable: true }, preview || {});
    },
    /** Returns true when a media reference points to a loaded media object. */
    referenceResolved: function (reference, mediaByCode) {
        if (!reference) return false;
        if (reference.status && !['ACTIVE', 'APPROVED', 'READY', 'PUBLISHED'].includes(String(reference.status))) return false;
        if (!reference.mediaCode && !reference.mediaSetCode) return false;
        if (reference.mediaSetCode) return true;
        return mediaByCode[String(reference.mediaCode)] !== undefined;
    },
    /** Produces owner-owned readiness evidence for BackOffice and Axis. */
    readiness: async function (request) {
        request = request || {};
        let media = await this.mediaObjects(request);
        let references = await this.mediaReferences(request);
        let cleanup = await this.cleanupPreview(request);
        let mediaRecords = media.records || [];
        let referenceRecords = references.records || [];
        let mediaByCode = mediaRecords.reduce((result, item) => {
            if (item && item.code) result[String(item.code)] = item;
            return result;
        }, {});
        let incompleteMetadata = mediaRecords.filter(item => !this.hasRequiredMetadata(item));
        let missingPhysical = mediaRecords.filter(item => !this.hasPhysicalArtifact(item));
        let brokenReferences = referenceRecords.filter(item => !this.referenceResolved(item, mediaByCode));
        let blockers = [];
        if (media.providerAvailable === false) blockers.push({
            code: 'MEDIA_OBJECT_PROVIDER_UNAVAILABLE',
            severity: 'NEEDS_ATTENTION',
            source: 'MEDIA_READINESS',
            action: 'Start Media runtime',
            message: 'Media object records cannot be scanned because the Media service is unavailable.',
            repair: this.repair('media.readiness', 'START_MEDIA_RUNTIME', 'Start Media runtime', false),
        });
        if (incompleteMetadata.length) blockers.push({
            code: 'MEDIA_OBJECT_METADATA_INCOMPLETE',
            severity: 'NEEDS_ATTENTION',
            source: 'MEDIA_READINESS',
            action: 'Repair media metadata',
            message: 'One or more media objects are missing required metadata for governed use.',
            repair: this.repair('media.repairObjects', 'REPAIR_MEDIA_OBJECT_METADATA', 'Repair media metadata', true),
            targetIdentifiers: { mediaCodes: incompleteMetadata.map(item => item.code).filter(Boolean).slice(0, 25) },
        });
        if (missingPhysical.length) blockers.push({
            code: 'MEDIA_PHYSICAL_ARTIFACT_MISSING',
            severity: 'NEEDS_ATTENTION',
            source: 'MEDIA_READINESS',
            action: 'Reconcile physical media artifacts',
            message: 'One or more media objects have no physical storage, URL, or inline content evidence.',
            repair: this.repair('media.reconcilePhysicalArtifacts', 'RECONCILE_MEDIA_PHYSICAL_ARTIFACTS', 'Reconcile physical artifacts', true),
            targetIdentifiers: { mediaCodes: missingPhysical.map(item => item.code).filter(Boolean).slice(0, 25) },
        });
        if (references.providerAvailable === false) blockers.push({
            code: 'MEDIA_REFERENCE_PROVIDER_UNAVAILABLE',
            severity: 'NEEDS_ATTENTION',
            source: 'MEDIA_READINESS',
            action: 'Start Media reference runtime',
            message: 'Media reference records cannot be scanned because the Media reference service is unavailable.',
            repair: this.repair('media.reconcileReferences', 'START_MEDIA_REFERENCE_RUNTIME', 'Start Media reference runtime', false),
        });
        if (brokenReferences.length) blockers.push({
            code: 'MEDIA_REFERENCE_BROKEN',
            severity: 'NEEDS_ATTENTION',
            source: 'MEDIA_READINESS',
            action: 'Reconcile media references',
            message: 'One or more consuming records point to missing or inactive media evidence.',
            repair: this.repair('media.reconcileReferences', 'RECONCILE_MEDIA_REFERENCES', 'Reconcile media references', true),
            targetIdentifiers: { referenceCodes: brokenReferences.map(item => item.code).filter(Boolean).slice(0, 25) },
        });
        if ((cleanup.candidates || 0) > 0) blockers.push({
            code: 'MEDIA_CLEANUP_REVIEW_REQUIRED',
            severity: 'INFO',
            source: 'MEDIA_CLEANUP',
            action: 'Review cleanup candidates',
            message: 'Media cleanup candidates exist and should be reviewed under retention policy.',
            repair: this.repair('media.cleanup.reviewCandidates', 'REVIEW_MEDIA_CLEANUP_CANDIDATES', 'Review cleanup candidates', true),
        });
        return {
            contractVersion: 1,
            businessStatus: blockers.filter(item => item.severity !== 'INFO').length ? 'NEEDS_ATTENTION' : 'READY',
            source: 'MEDIA_READINESS',
            summary: {
                providerAvailable: media.providerAvailable === true,
                referenceProviderAvailable: references.providerAvailable === true,
                cleanupProviderAvailable: cleanup.providerAvailable === true,
                mediaCount: mediaRecords.length,
                incompleteMetadataCount: incompleteMetadata.length,
                missingPhysicalCount: missingPhysical.length,
                referenceCount: referenceRecords.length,
                brokenReferenceCount: brokenReferences.length,
                cleanupCandidateCount: cleanup.candidates || 0,
                draftCleanupStatus: 'OWNER_POLICY_REVIEW_REQUIRED',
                rejectedDraftCleanupStatus: 'OWNER_POLICY_REVIEW_REQUIRED',
                acceptedEvidenceRetentionStatus: 'RETAIN_WITH_APPROVED_ASSET_EVIDENCE',
            },
            blockers: blockers,
            nextAction: blockers.length ? 'Open Media Management and follow the owner repair guidance for object, physical artifact, reference, or cleanup readiness.' :
                'Media objects, references, and cleanup readiness are clear.',
        };
    }
};
