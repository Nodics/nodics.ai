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
    SERVICE.DefaultCmsPublicationBaselineService.reconcileApproval = SERVICE.DefaultCmsPublicationBaselineService.status;
    await controller.reconcileApproval(source);
    assert.strictEqual(received.request.authData.isSystem, true);
    assert.throws(() => controller.reconcileApproval({ authData: { tokenType: 'service', principalId: 'foreign' } }),
        /BackOffice runtime principal required/);
    SERVICE.DefaultCmsPublicationBaselineService.installContentPack = SERVICE.DefaultCmsPublicationBaselineService.status;
    await controller.installContentPack(source);
    assert.strictEqual(received.request.authData.isSystem, true);
    assert.throws(() => controller.installContentPack({ authData: { tokenType: 'service', principalId: 'foreign' } }),
        /BackOffice runtime principal required/);
    const route = require('../src/router/routers').cms.cmsPublicationBaseline.installContentPack;
    assert.strictEqual(route.secured, true);
    assert.deepStrictEqual(route.authTokenTypes, ['service']);
    assert.strictEqual(route.apiExposure, 'moduleInternal');
    assert.strictEqual(route.permissionConfig, 'authSecurity.internalToken.routePermission');
    const body = route.requestBody.content['application/json'].schema;
    assert.strictEqual(body.additionalProperties, false);
    assert.deepStrictEqual(body.required, ['requestedBy']);
    assert.strictEqual(body.properties.packCode, undefined);
    assert.strictEqual(principalChecks, 6);
    console.log('CMS publication baseline controller authority validated');
})().catch(error => { console.error(error); process.exit(1); });
