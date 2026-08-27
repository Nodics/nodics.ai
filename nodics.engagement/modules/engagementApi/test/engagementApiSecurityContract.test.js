/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const assert = require('assert');
const configuration = require('../config/properties').engagementApi;
const policy = require('../src/service/defaultEngagementApiPolicyService');
const projection = require('../src/service/defaultEngagementApiProjectionService');
const gatewayPort = require('../src/service/defaultEngagementDomainGatewayService');
const errorService = require('../src/service/defaultEngagementApiErrorService');

async function run() {
    assert.strictEqual(policy.isAnonymousAllowed('getActiveForm', configuration), true);
    assert.strictEqual(policy.isAnonymousAllowed('unknownRoute', configuration), false);
    assert.throws(() => policy.assertAnonymousAllowed('unknownRoute', {}, configuration), error => error.code === 'ERR_ENG_API_00001');
    assert.strictEqual(policy.assertAnonymousAllowed('getActiveForm', {}, configuration).authData, undefined);
    assert.strictEqual(policy.isAnonymousAllowed('getActiveForm', Object.assign({}, configuration, { anonymousRouteAllowList: ['getActiveForm'] })), true);
    assert.throws(() => policy.prepare({ tenant: 'a', correlationId: 'c', authData: { tenant: 'b' } }, configuration), error => error.code === 'ERR_ENG_API_00002');
    let request = policy.prepare({ tenant: 'a', correlationId: 'c', query: { limit: 1000 }, authData: { tenant: 'a', principalId: 'p1' } }, configuration);
    assert.strictEqual(request.query.limit, 100);
    assert.throws(() => policy.assertOwner({ tenant: 'a', ownerId: 'p2' }, request), error => error.code === 'ERR_ENG_API_00003');
    assert.throws(() => policy.assertTenant({ tenant: 'b' }, request), error => error.code === 'ERR_ENG_API_00002');
    assert.throws(() => policy.assertService({ authData: { tokenType: 'access', userGroups: ['serviceAccountUserGroup'] } }), error => error.code === 'ERR_ENG_API_00004');
    let serviceRequest = { authData: { tokenType: 'service', userGroups: ['serviceAccountUserGroup'] } };
    assert.strictEqual(policy.assertService(serviceRequest), serviceRequest);
    let dto = projection.project({ code: 'S1', status: 'OPEN', payload: { secret: true }, requestHash: 'hash', tenant: 'a' }, configuration.projections.customerSubmission);
    assert.deepStrictEqual(dto, { code: 'S1', status: 'OPEN' });
    await assert.rejects(() => gatewayPort.getSubmission({}), error => error.code === 'ERR_ENG_API_00005');
    assert.deepStrictEqual(errorService.project({ code: 'ERR_ENG_API_00003', stack: 'secret' }, 'c'), { status: 403, code: 'ERR_ENG_API_00003', message: 'Engagement resource ownership denied', correlationId: 'c' });
    console.log('EngagementApi security contract validated');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
