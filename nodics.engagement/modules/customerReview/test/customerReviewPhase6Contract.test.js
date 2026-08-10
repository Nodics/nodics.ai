/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const schemas = require('../src/schemas/schemas').customerReview;
const configuration = require('../config/properties').customerReview;
const governance = require('../src/service/defaultCustomerReviewGovernanceService');
global.SERVICE = { DefaultCustomerReviewGovernanceService: governance };
const lifecycle = require('../src/service/defaultCustomerReviewLifecycleService');
const migration = require('../src/service/defaultCresMigrationService');

['customerReview', 'customerReviewVersion', 'customerReviewAuthenticityEvidence', 'customerReviewModeration', 'customerReviewResponse', 'customerReviewAbuseReport', 'customerReviewAppeal', 'customerReviewMigration'].forEach(name => assert(schemas[name], name + ' Phase 6 schema must remain available'));
Object.values(schemas).forEach(schema => assert.strictEqual(schema.router.enabled, false));
const review = governance.validate({ code: 'r1', tenant: 't1', ownerId: 'c1', targetType: 'PRODUCT', targetCode: 'p1', overallRating: 1, body: 'Disappointing but genuine.', site: 's1', locale: 'en', channel: 'WEB', correlationId: 'corr1' }, configuration);
assert.strictEqual(review.overallRating, 1);
assert.throws(() => governance.validate(Object.assign({}, review, { targetType: 'UNKNOWN' }), configuration), error => error.code === 'ERR_REVIEW_00002');
assert.throws(() => governance.validateAuthenticity({ provenance: {}, policyVersion: '1', incentiveType: 'DISCOUNT', sentimentConditioned: true }), error => error.code === 'ERR_REVIEW_00004');
assert.throws(() => governance.assertModerationGrounds({ action: 'REJECT', reasonCode: 'NEGATIVE_SENTIMENT', policyViolation: false }), error => error.code === 'ERR_REVIEW_00005');
const version = lifecycle.version(review, [], 'INITIAL_SUBMISSION', new Date('2026-08-10T00:00:00Z')); assert.strictEqual(version.version, 1); assert(version.contentHash);
const submitted = lifecycle.moderate(review, { action: 'SUBMIT', expectedRevision: 0, actorId: 'c1', reviewVersion: 1 }, configuration); assert.strictEqual(submitted.review.status, 'PENDING_MODERATION');
const approved = lifecycle.moderate(submitted.review, { action: 'APPROVE', expectedRevision: 1, actorId: 'm1', reviewVersion: 1 }, configuration); assert.strictEqual(approved.review.status, 'APPROVED');
assert.throws(() => lifecycle.moderate(submitted.review, { action: 'REJECT', expectedRevision: 1, actorId: 'm1', reasonCode: 'NEGATIVE_SENTIMENT' }, configuration), error => error.code === 'ERR_REVIEW_00005');
assert.throws(() => lifecycle.moderate(submitted.review, { action: 'APPROVE', expectedRevision: 0, actorId: 'm1' }, configuration), error => error.code === 'ERR_REVIEW_00006');
const response = lifecycle.response(approved.review, [], { body: 'We are sorry.', actorId: 'support1', requireApproval: true }); assert.strictEqual(response.status, 'PENDING_APPROVAL');
const report = lifecycle.abuseReport(approved.review, [], { reporterId: 'c2', reasonCode: 'OFFENSIVE' }); assert.strictEqual(report.status, 'OPEN');
assert.throws(() => lifecycle.abuseReport(approved.review, [report], { reporterId: 'c2', reasonCode: 'OFFENSIVE' }), error => error.code === 'ERR_REVIEW_00009');
const mapped = migration.mapReview({ code: 'legacy1', customerCode: 'c1', targetType: 'PRODUCT', targetCode: 'p1', rating: 1, comment: 'Legacy negative review', status: 'APPROVED' }, { tenant: 't1', dryRun: true, targetCode: 'new1', correlationId: 'corr2', configuration: configuration });
assert.strictEqual(mapped.review.status, 'APPROVED'); assert.strictEqual(mapped.migration.legacyModule, 'gMrkty/cres'); assert.strictEqual(mapped.migration.strategy, 'DRY_RUN');
assert.strictEqual(migration.replay(mapped, { sourceHash: mapped.migration.sourceHash, mappingVersion: '1' }).action, 'SKIP');
assert.throws(() => migration.replay(mapped, { sourceHash: 'different', mappingVersion: '1' }), error => error.code === 'ERR_REVIEW_00010');
const rolledBack = migration.rollback(Object.assign({}, mapped.migration, { status: 'MIGRATED' })); assert.strictEqual(rolledBack.status, 'ROLLED_BACK');
const manifest = migration.plan([
    { code: 'legacy1', customerCode: 'c1', targetType: 'PRODUCT', targetCode: 'p1', rating: 5, comment: 'Good', status: 'APPROVED' },
    { code: 'legacy2', customerCode: 'c2', targetType: 'UNKNOWN', targetCode: 'p2', rating: 4, comment: 'Invalid target', status: 'PENDING' }
], { tenant: 't1', runCode: 'cres-run-1', mappingVersion: '1', maximumRecords: 1, configuration: configuration });
assert.strictEqual(manifest.validCount, 1); assert.strictEqual(manifest.invalidCount, 0); assert.strictEqual(manifest.nextCursor, 1); assert.strictEqual(manifest.checksum.length, 64);
const importRequest = migration.nImportRequest(manifest, { approved: true, actorId: 'migration-admin', reason: 'Approved cutover' });
assert.strictEqual(importRequest.owner, 'nImport'); assert.strictEqual(importRequest.models.length, 2); assert.strictEqual(importRequest.idempotencyKey, manifest.checksum); assert.strictEqual(importRequest.rollback.deleteAuditEvidence, false);
const invalidManifest = migration.plan([{ code: 'legacy2', customerCode: 'c2', targetType: 'UNKNOWN', targetCode: 'p2', rating: 4, comment: 'Invalid target', status: 'PENDING' }], { tenant: 't1', runCode: 'cres-run-2', mappingVersion: '1', configuration: configuration });
assert.strictEqual(invalidManifest.invalidCount, 1);
assert.throws(() => migration.nImportRequest(invalidManifest, { approved: true, actorId: 'migration-admin', reason: 'Approved cutover' }), error => error.code === 'ERR_REVIEW_00010');
console.log('customerReview Phase 6 contract validated');
