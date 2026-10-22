/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Proves CMS Online target operations verify the CMS runtime before receiving target-local authority. */
const assert = require('assert');
let received;
let principalChecks = 0;
global.SERVICE = {
    DefaultServiceTokenService: { requireRuntimePrincipal: (request, owner) => {
        principalChecks++;
        assert.strictEqual(owner, 'cms');
        if (request.authData.principalId !== 'cms-staged') throw new Error('CMS runtime principal required');
        return request.authData;
    } },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true, userGroups: ['systemGroup'] }) },
    DefaultCmsPublicationTargetService: { getStatus: async request => { received = request; return { version: 'manifest-1' }; } }
};
const controller = require('../src/controller/defaultCmsPublicationTargetController');

(async () => {
    const source = { authData: { tokenType: 'service', principalId: 'cms-staged' }, requestId: 'request-1',
        httpRequest: { body: { manifestCode: 'manifest-1', correlationId: 'correlation-1' } } };
    const result = await controller.getStatus(source);
    assert.deepStrictEqual(result, { version: 'manifest-1' });
    assert.strictEqual(received.authData.isSystem, true);
    assert.deepStrictEqual(received.authData.userGroups, ['systemGroup']);
    assert.strictEqual(received.correlationId, 'correlation-1');
    assert.strictEqual(source.authData.isSystem, undefined);
    assert.throws(() => controller.getStatus({ authData: { tokenType: 'service', principalId: 'foreign' } }),
        /CMS runtime principal required/);
    assert.strictEqual(principalChecks, 2);
    console.log('CMS publication target controller authority validated');
})().catch(error => { console.error(error); process.exit(1); });
