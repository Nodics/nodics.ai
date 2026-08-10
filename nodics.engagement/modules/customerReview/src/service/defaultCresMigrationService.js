/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module customerReview/src/service/defaultCresMigrationService @description Maps archived CRES records into current review contracts with dry-run, idempotency, rollback, and reconciliation evidence. @layer service @owner customerReview @override Customer migration adapters may extend mappings without making the archive runtime authority. */
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
    reconcile: function (migration, review, expectedHash) { let matched = Boolean(review && migration.targetCode === review.code && migration.sourceHash === expectedHash); return Object.assign({}, migration, { status: matched ? 'RECONCILED' : 'FAILED', errors: matched ? [] : ['MIGRATION_DRIFT'] }); }
};
