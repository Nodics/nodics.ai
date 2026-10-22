/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module wasteImpact/test/carbonEvidence @description Checks the persisted provenance handoff preserves calculation/issuance separation and trusted service scope. @owner wasteImpact @layer test */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/defaultWasteImpactAssessmentService');
test('confirmed persisted impact cannot become issuance through its handoff', async () => {
    const result = { code: 'impact', calculationStatus: 'CONFIRMED', sourceRef: { module: 'wasteSubmission', schema: 'wasteSubmission', code: 'source' },
        metrics: [{ metricCode: 'CARBON_EQUIVALENT_TCO2E', value: '15', unitOfMeasure: 'tCO2e' }],
        metadata: { provider: { code: 'method', version: '1' }, privateCredentials: 'must-not-leak' } };
    const reads = [];
    global.SERVICE = {
        DefaultSecuredRequestPipelineService: { getGrantedPermissions: req => req.authData.permissions,
            isPermissionGranted: (permission, permissions) => (permissions || []).includes(permission) },
        DefaultWastePersistenceService: { fail: (code, message) => { throw Object.assign(new Error(message), { code }); },
            one: async (schema, request, code) => { reads.push({ schema, tenant: request.tenant, code }); return code === 'impact' ? structuredClone(result) : undefined; } }
    };
    const request = { tenant: 'T', authData: { tenant: 'T', principalType: 'service', loginId: 'qualified-provider', permissions: ['waste.impact.evidence.read'] },
        payload: { impactCode: 'impact', issuedQuantity: '900', confirmed: true } };
    const handoff = await service.evidenceForCarbon(request);
    assert.equal(handoff.creditIssuanceAuthorized, false); assert.equal(handoff.issuedQuantity, null); assert.equal(handoff.publicClaimAllowed, false);
    assert.equal(handoff.metrics[0].value, '15'); assert.equal(handoff.privateCredentials, undefined);
    assert.deepEqual(reads, [{ schema: 'wasteImpactResult', tenant: 'T', code: 'impact' }]);
    await assert.rejects(service.evidenceForCarbon({ ...request, tenant: 'OTHER' }), { code: 'ERR_WASTE_REVIEW_FORBIDDEN' });
    await assert.rejects(service.evidenceForCarbon({ ...request, authData: { ...request.authData, principalType: 'customer' } }), { code: 'ERR_WASTE_REVIEW_FORBIDDEN' });
    await assert.rejects(service.evidenceForCarbon({ ...request, authData: { ...request.authData, permissions: [] } }), { code: 'ERR_WASTE_REVIEW_FORBIDDEN' });
    await assert.rejects(service.evidenceForCarbon({ ...request, payload: { impactCode: 'missing' } }), { code: 'ERR_WASTE_RECORD_NOT_FOUND' });
});
