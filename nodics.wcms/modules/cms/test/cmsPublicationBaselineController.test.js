/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Proves BackOffice baseline operations receive CMS-local authority only after runtime verification. */
const assert = require('assert');
let received;
let principalChecks = 0;
global.SERVICE = {
    DefaultServiceTokenService: { requireRuntimePrincipal: (request, owner) => {
        principalChecks++;
        assert.strictEqual(owner, 'backoffice');
        if (request.authData.principalId !== 'platform-runtime') throw new Error('BackOffice runtime principal required');
        return request.authData;
    } },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true, userGroups: ['systemGroup'] }) },
    DefaultCmsPublicationBaselineService: { status: async (baselineCode, request) => {
        received = { baselineCode, request };
        return { baselineCode, readiness: 'READY' };
    } }
};
const controller = require('../src/controller/defaultCmsPublicationBaselineController');

(async () => {
    const source = { authData: { tokenType: 'service', principalId: 'platform-runtime' }, requestId: 'request-1',
        httpRequest: { params: { baselineCode: 'nexus' } } };
    const result = await controller.status(source);
    assert.deepStrictEqual(result, { code: 'SUC_CMS_00000', data: { baselineCode: 'nexus', readiness: 'READY' } });
    assert.strictEqual(received.baselineCode, 'nexus');
    assert.strictEqual(received.request.authData.isSystem, true);
    assert.deepStrictEqual(received.request.authData.userGroups, ['systemGroup']);
    assert.strictEqual(source.authData.isSystem, undefined);
    assert.strictEqual(source.baselineCode, undefined);
    assert.throws(() => controller.status({ authData: { tokenType: 'service', principalId: 'foreign' } }),
        /BackOffice runtime principal required/);
    assert.strictEqual(principalChecks, 2);
    console.log('CMS publication baseline controller authority validated');
})().catch(error => { console.error(error); process.exit(1); });
