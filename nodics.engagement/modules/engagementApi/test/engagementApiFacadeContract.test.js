/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const configuration = require('../config/properties').engagementApi;
global.CONFIG = { get: key => key === 'engagementApi' ? configuration : undefined };
global.SERVICE = {
    DefaultEngagementApiPolicyService: require('../src/service/defaultEngagementApiPolicyService'),
    DefaultEngagementApiProjectionService: require('../src/service/defaultEngagementApiProjectionService'),
    DefaultEngagementDomainGatewayService: {
        getOwnSubmission: async request => ({ code: request.submissionCode, tenant: request.tenant, ownerId: 'p1', status: 'OPEN', payload: { password: 'secret' }, requestHash: 'private', correlationId: request.correlationId }),
        listSubmissions: async request => [{ code: 'S1', tenant: request.tenant, ownerId: 'p1', status: 'IN_PROGRESS', payload: { secret: true }, correlationId: request.correlationId }],
        receiveCallback: async request => ({ referenceCode: 'R1', status: 'RECEIVED', receivedAt: '2026-08-09T00:00:00.000Z', correlationId: request.correlationId, providerPayload: request.payload })
    }
};
const facade = require('../src/facade/defaultEngagementApiFacade');

async function run() {
    let customer = await facade.getOwnSubmission({ tenant: 't1', correlationId: 'c1', submissionCode: 'S1', authData: { tenant: 't1', principalId: 'p1' } });
    assert.deepStrictEqual(customer, { code: 'S1', status: 'OPEN', correlationId: 'c1' });
    assert.strictEqual(customer.payload, undefined); assert.strictEqual(customer.requestHash, undefined); assert.strictEqual(customer.ownerId, undefined);
    let operator = await facade.listSubmissions({ tenant: 't1', correlationId: 'c2', authData: { tenant: 't1' } });
    assert.strictEqual(operator[0].ownerId, 'p1'); assert.strictEqual(operator[0].payload, undefined);
    let receipt = await facade.receiveCallback({ tenant: 't1', correlationId: 'c3', payload: { providerSecret: 'x' }, authData: { tenant: 't1', tokenType: 'service', userGroups: ['serviceAccountUserGroup'] } });
    assert.strictEqual(receipt.referenceCode, 'R1'); assert.strictEqual(receipt.providerPayload, undefined);
    console.log('EngagementApi Phase 3 facade contract validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
