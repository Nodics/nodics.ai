/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const crypto = require('node:crypto');
/** @module customerReview/src/service/defaultCresMigrationService @description Maps archived CRES records into current review contracts with dry-run, idempotency, resumable manifests, rollback, and reconciliation evidence for nImport execution. @layer service @owner customerReview @override Customer migration adapters may extend mappings without making the archive runtime or import authority. */
module.exports = {
    /** Maps one legacy CRES review into the current customerReview contract. */
    mapReview: function (legacy, context) { let governance = SERVICE.DefaultCustomerReviewGovernanceService; let review = governance.validate({ tenant: context.tenant, ownerId: legacy.customerCode, targetType: legacy.targetType, targetCode: legacy.targetCode, orderCode: legacy.orderCode, orderEntryCode: legacy.orderEntryCode, overallRating: legacy.rating, title: legacy.title, body: legacy.comment, mediaCodes: legacy.mediaCodes || [], site: context.site || 'default', locale: legacy.localeCode || context.locale || 'en', channel: legacy.channelCode || 'LEGACY_CRES', status: this.mapStatus(legacy.status), moderationMode: context.moderationMode || 'PRE', revision: 0, correlationId: context.correlationId }, context.configuration); return { review: review, migration: { tenant: context.tenant, legacyModule: 'gMrkty/cres', legacySchema: 'customerReview', legacyCode: legacy.code, targetSchema: 'customerReview', targetCode: context.targetCode, sourceHash: governance.hash(legacy), strategy: context.dryRun ? 'DRY_RUN' : 'CUTOVER', status: context.dryRun ? 'PLANNED' : 'MIGRATED', mappingVersion: context.mappingVersion || '1', migratedAt: context.dryRun ? undefined : context.now || new Date(), correlationId: context.correlationId } }; },
    /** Maps legacy statuses without treating legacy approval as public publication. */
    mapStatus: function (status) { return ({ DRAFT: 'DRAFT', PENDING: 'PENDING_MODERATION', APPROVED: 'APPROVED', REJECTED: 'REJECTED', SPAM: 'QUARANTINED', ARCHIVED: 'ARCHIVED' })[status] || 'PENDING_MODERATION'; },
    /** Returns an idempotent replay result or rejects conflicting legacy content. */
    replay: function (mapped, existing) { if (!existing) return { action: 'CREATE', value: mapped }; if (existing.sourceHash === mapped.migration.sourceHash && existing.mappingVersion === mapped.migration.mappingVersion) return { action: 'SKIP', value: mapped }; throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'conflicting CRES migration replay'); },
    /** Produces rollback evidence without deleting migrated audit history. */
    rollback: function (migration, now) { if (migration.status !== 'MIGRATED') throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'only migrated records can roll back'); return Object.assign({}, migration, { status: 'ROLLED_BACK', rolledBackAt: now || new Date() }); },
    /** Reconciles migrated review identity and content hashes. */
    reconcile: function (migration, review, expectedHash) { let matched = Boolean(review && migration.targetCode === review.code && migration.sourceHash === expectedHash); return Object.assign({}, migration, { status: matched ? 'RECONCILED' : 'FAILED', errors: matched ? [] : ['MIGRATION_DRIFT'] }); },
    /** Builds a bounded, restart-safe domain mapping manifest for nImport. */
    plan: function (legacyRecords, context) {
        context = context || {};
        if (!context.tenant || !context.runCode || !context.mappingVersion) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'tenant, runCode, and mappingVersion are required');
        let maximum = Math.max(1, Math.min(Number(context.maximumRecords || 1000), 10000));
        let cursor = Math.max(0, Number(context.cursor || 0));
        let source = (legacyRecords || []).slice(cursor, cursor + maximum);
        let items = source.map((legacy, index) => {
            try {
                let targetCode = context.targetCodeFor ? context.targetCodeFor(legacy, cursor + index) : 'cres-' + String(legacy.code);
                let mapped = this.mapReview(legacy, Object.assign({}, context, { dryRun: true, targetCode: targetCode }));
                return { index: cursor + index, legacyCode: legacy.code, targetCode: targetCode, status: 'VALID', sourceHash: mapped.migration.sourceHash, models: mapped };
            } catch (error) {
                return { index: cursor + index, legacyCode: legacy && legacy.code, status: 'INVALID', errorCode: error.code || 'ERR_REVIEW_00010' };
            }
        });
        let manifest = {
            contract: 'customerReview.cres.nImport.v1',
            tenant: context.tenant,
            runCode: context.runCode,
            mappingVersion: context.mappingVersion,
            mode: 'VALIDATE_ONLY',
            startCursor: cursor,
            nextCursor: cursor + source.length < (legacyRecords || []).length ? cursor + source.length : undefined,
            sourceCount: (legacyRecords || []).length,
            validCount: items.filter(item => item.status === 'VALID').length,
            invalidCount: items.filter(item => item.status === 'INVALID').length,
            items: items,
            rollback: { strategy: 'MARK_ROLLED_BACK_AND_HIDE_PROJECTION', deleteAuditEvidence: false }
        };
        manifest.checksum = crypto.createHash('sha256').update(JSON.stringify(manifest)).digest('hex');
        return manifest;
    },
    /** Converts a validated manifest into an nImport-owned execution request. */
    nImportRequest: function (manifest, approval) {
        if (!manifest || manifest.contract !== 'customerReview.cres.nImport.v1' || !manifest.checksum) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'validated CRES manifest is required');
        if (!approval || approval.approved !== true || !approval.actorId || !approval.reason) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'explicit migration approval is required');
        if (manifest.invalidCount > 0 && approval.allowPartial !== true) throw SERVICE.DefaultCustomerReviewGovernanceService.error('ERR_REVIEW_00010', 'invalid migration rows require explicit partial approval');
        return {
            owner: 'nImport',
            tenant: manifest.tenant,
            runCode: manifest.runCode,
            definitionCode: 'customerReview.cres.v1',
            idempotencyKey: manifest.checksum,
            sourceManifestChecksum: manifest.checksum,
            models: manifest.items.filter(item => item.status === 'VALID').flatMap(item => [item.models.review, item.models.migration]),
            approval: { actorId: approval.actorId, reason: approval.reason },
            resumeCursor: manifest.nextCursor,
            rollback: manifest.rollback
        };
    }
};
