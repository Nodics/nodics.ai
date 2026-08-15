/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const assert = require('assert');
const service = require('../src/service/storage/defaultMediaLifecycleCoordinationService');
describe('media lifecycle coordination contract', function () {
    let media; let reference; let removed; let updates; let referenceUpdates;
    beforeEach(function () { removed = 0; updates = []; referenceUpdates = []; media = { code: 'media-1', providerCode: 'local', storageKey: 'safe/key', businessPurpose: 'kycDocuments', ownerReference: 'subject-1', reusable: false, retentionUntil: new Date(Date.now() - 1000), legalHold: false, checksum: 'sha256-media-1', checksumAlgorithm: 'sha256', status: 'READY', version: 2 }; reference = { code: 'ref-1', ownerModule: 'cms', ownerSchema: 'cmsComponent', ownerCode: 'homeHero', mediaCode: 'media-1', relationType: 'CMS_ASSET', position: 0, status: 'INACTIVE', evidence: { rightsStatus: 'REPLACEMENT_REQUIRED', approvalStatus: 'PENDING_ASSET_INTAKE' }, version: 1 }; global.SERVICE = { DefaultMediaService: { get: async () => ({ result: [media] }), update: async input => { updates.push(input); return { modifiedCount: 1 }; } }, DefaultMediaReferenceService: { get: async () => ({ result: [reference] }), update: async input => { referenceUpdates.push(input); reference = input.model; return { modifiedCount: 1 }; } }, DefaultMediaStorageProviderRegistryService: { remove: async () => { removed += 1; return { removed: true }; } } }; });
    it('binds immutable purpose and scoped retention metadata', async function () { const result = await service.bind({ tenant: 't1', mediaCode: 'media-1', businessPurpose: 'kycDocuments', ownerType: 'KYC_SUBJECT', ownerReference: 'subject-1', retentionUntil: new Date(), legalHold: false }); assert.strictEqual(result.mediaCode, 'media-1'); assert.strictEqual(updates[0].query.version, 2); });
    it('blocks held deletion and deletes elapsed storage through media', async function () { media.legalHold = true; await assert.rejects(() => service.deleteExpired({ tenant: 't1', mediaCode: 'media-1' }), error => error.code === 'ERR_MED_00019'); media.legalHold = false; const result = await service.deleteExpired({ tenant: 't1', mediaCode: 'media-1' }); assert.strictEqual(result.deleted, true); assert.strictEqual(removed, 1); assert.strictEqual(updates[0].model.$set.status, 'DELETED'); });
    it('approves activates and deactivates media references with rights and rollback evidence', async function () {
        const approved = await service.approveReference({ tenant: 't1', referenceCode: 'ref-1', reviewer: 'reviewer-1', sourceSystem: 'asset-intake', licenseType: 'NODICS_OWNED', assetOwner: 'Nodics', usageScope: 'CONTENT_BANNER', now: '2026-08-15T00:00:00.000Z' });
        assert.strictEqual(approved.approved, true);
        assert.strictEqual(approved.activated, false);
        assert.strictEqual(referenceUpdates[0].model.status, 'INACTIVE');
        assert.strictEqual(referenceUpdates[0].model.evidence.approvalStatus, 'APPROVED');
        assert.strictEqual(referenceUpdates[0].model.evidence.checksum, 'sha256-media-1');
        const activated = await service.activateReference({ tenant: 't1', referenceCode: 'ref-1', activatedBy: 'operator-1', activationRevision: '2', now: '2026-08-15T00:01:00.000Z' });
        assert.strictEqual(activated.activated, true);
        assert.strictEqual(referenceUpdates[1].model.status, 'ACTIVE');
        assert.strictEqual(referenceUpdates[1].model.evidence.productionUseAllowed, true);
        assert.strictEqual(referenceUpdates[1].model.evidence.activationRevision, '2');
        const deactivated = await service.deactivateReference({ tenant: 't1', referenceCode: 'ref-1', reasonCode: 'INCORRECT_ASSET', recoveryNote: 'Restore previous banner', now: '2026-08-15T00:02:00.000Z' });
        assert.strictEqual(deactivated.deactivated, true);
        assert.strictEqual(referenceUpdates[2].model.status, 'INACTIVE');
        assert.strictEqual(referenceUpdates[2].model.evidence.productionUseAllowed, false);
        assert.strictEqual(referenceUpdates[2].model.evidence.deactivationReason, 'INCORRECT_ASSET');
        assert.strictEqual(referenceUpdates[2].model.evidence.recoveryNote, 'Restore previous banner');
    });
    it('blocks media reference activation until approval has checksum evidence', async function () {
        reference.evidence = { approvalStatus: 'PENDING_ASSET_INTAKE' };
        await assert.rejects(() => service.activateReference({ tenant: 't1', referenceCode: 'ref-1' }), error => error.code === 'ERR_MED_00020');
        media.checksum = undefined;
        await assert.rejects(() => service.approveReference({ tenant: 't1', referenceCode: 'ref-1', reviewer: 'reviewer-1' }), error => error.code === 'ERR_MED_00020');
    });
});
