/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module eWaste/test/eWasteEvidenceContract
 * @description Verifies sample and original evidence use the same authorized Media reference boundary.
 * @layer test
 * @owner eWaste
 * @override Projects may contribute media records but must not replace Media reference resolution with frontend file paths.
 */
const assert = require('node:assert/strict');
const service = require('../src/service/defaultEWasteExperienceService');
let allowed = true, reads = 0;
global.SERVICE = { DefaultWasteOperationalAccessService: { assertRecord: async () => {} }, DefaultWasteVerificationOperationService: { authorize: () => { if (!allowed) throw new Error('Denied'); } } };
const context = { ...service, store: () => ({ one: async () => ({ metadata: { sample: true, photo: { code: 'shared-artwork', url: '/frontend-only/artwork.svg' } } }) }),
    remote: async (request, moduleName, connection, route) => { reads++; assert.equal(moduleName, 'media'); assert.equal(route, '/internal/evidence/photos/shared-artwork'); return { previewType: 'PUBLIC_MEDIA', contentBase64: 'sample' }; }
};
(async () => {
    assert.equal((await context.evidencePhoto({ resourceType: 'review', code: 'submission' })).previewType, 'PUBLIC_MEDIA');
    allowed = false; await assert.rejects(() => context.evidencePhoto({ resourceType: 'review', code: 'submission' }), /Denied/);
    assert.equal(reads, 1); console.log('eWaste evidence reference contract validated');
    SERVICE.DefaultWasteSubmissionOperationService = { read: async () => ({ metadata: { photo: { code: 'private-photo' } } }) };
    const customer = { ...service, store: () => ({}), remote: async (...args) => {
        assert.equal(args[3], '/internal/evidence/photos/private-photo');
        assert.equal(args[6], undefined);
        return { contentBase64: 'owned' };
    } };
    assert.equal((await customer.evidencePhoto({ resourceType: 'submission', authorization: 'Bearer customer-test' })).contentBase64, 'owned');
    SERVICE.DefaultWasteSubmissionOperationService.read = async () => { throw Error('Not owner'); };
    await assert.rejects(customer.evidencePhoto({ resourceType: 'submission' }), /Not owner/);
})().catch(error => { console.error(error); process.exitCode = 1; });
