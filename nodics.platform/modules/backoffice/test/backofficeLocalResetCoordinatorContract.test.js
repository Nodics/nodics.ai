/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/BackofficeLocalResetCoordinatorContract */
const assert = require('assert');
const service = require('../src/service/operations/defaultBackofficeLocalResetCoordinatorService');
class NodicsError extends Error { constructor(code, message) { super(message || code); this.code = code; } }

(async function () {
    let policy = { enabled: false, environmentAllowlist: ['kickoffLocal'], confirmation: 'RESET_LOCAL_NODICS_DATA', maximumTargets: 2, providers: [] };
    global.CLASSES = { NodicsError };
    global.CONFIG = { get: key => key === 'backofficeLocalReset' ? policy : undefined };
    let refreshes = 0;
    global.NODICS = { getSelectedEnvironmentName: () => 'kickoffLocal', getInternalAuthToken: () => 'service-token' };
    global.SERVICE = {
      DefaultInternalAuthenticationProviderService: {
        refreshInternalAuthTokens: async () => { refreshes++; return ['default']; }
      },
      DefaultModuleService: {
        invokeModule: async descriptor => {
            assert.strictEqual(refreshes, 1);
            assert.strictEqual(descriptor.local, false);
            assert.strictEqual(descriptor.apiName, '/operations/local-reset');
            assert.deepStrictEqual(descriptor.targetAuthority, { server: 'ownerServer', publication: 'OPERATIONAL' });
            assert.strictEqual(descriptor.requestBody.resetScope, 'LOCAL_ACCEPTANCE');
            assert.strictEqual(descriptor.requestBody.reason, 'fresh acceptance verification');
            assert.strictEqual(descriptor.header.Authorization, 'Bearer service-token');
            return descriptor.responseSelector({ result: { acknowledged: true } });
        }
    } };
    assert.deepStrictEqual(await service.status({}), { enabled: false, destructive: true, apiOnly: true, environmentAllowed: true,
        providerCount: 0, ready: false, reason: 'LOCAL_RESET_DISABLED' });
    await assert.rejects(service.execute({ localReset: {} }), error => error.code === 'ERR_BOF_00092');
    policy.enabled = true;
    assert.strictEqual((await service.status({})).reason, 'RESET_PROVIDERS_MISSING');
    policy.providers = [{ code: 'owner', moduleName: 'system', connectionName: 'ownerRuntime', targetAuthority: { server: 'ownerServer', publication: 'OPERATIONAL' } }];
    const qualified = structuredClone(policy.providers[0]);
    for (const targetAuthority of [undefined, {}, { runtimeRole: 'OWNER' },
        { publication: 'OPERATIONAL' }, { server: 'ownerServer' },
        { server: 'ownerServer', publication: 'UNKNOWN' },
        { server: 'ownerServer', publication: 'ONLINE', runtimeRole: 'OWNER' },
        { server: '*', publication: 'ONLINE' },
        { server: 'ownerServer', publication: 'ONLINE', environment: '' },
        { server: 'ownerServer', publication: 'ONLINE', node: '*' }]) {
        policy.providers = [{ ...qualified, targetAuthority }];
        assert.throws(() => service.providers(), error => error.code === 'ERR_BOF_00091');
    }
    for (const publication of ['STAGED', 'ONLINE', 'OPERATIONAL']) {
        const targetAuthority = { server: 'renamedOwner', publication, environment: 'isolatedLocal', node: 'nodeOne' };
        policy.providers = [{ ...qualified, targetAuthority }];
        const selected = service.providers()[0];
        assert.deepStrictEqual(selected.targetAuthority, targetAuthority);
        assert.notStrictEqual(selected.targetAuthority, targetAuthority);
    }
    assert.strictEqual(refreshes, 0, 'Descriptor validation must not acquire credentials or dispatch');
    policy.providers = [qualified];
    await assert.rejects(service.execute({ authData: { tokenType: 'service', principalId: 'internal' },
        localReset: { confirmation: policy.confirmation, reason: 'fresh acceptance verification' } }),
    error => error.code === 'ERR_BOF_00093');
    await assert.rejects(service.execute({ authData: { tokenType: 'access', principalId: 'admin' },
        localReset: { confirmation: 'wrong', reason: 'fresh acceptance verification' } }),
    error => error.code === 'ERR_BOF_00094');
    let result = await service.execute({ tenant: 'default', authData: { tokenType: 'access', principalId: 'admin' },
        correlationId: 'reset-1', localReset: { confirmation: policy.confirmation, reason: 'fresh acceptance verification' } });
    assert.strictEqual(result.acknowledged, true);
    assert.strictEqual(result.providerCount, 1);
    assert.strictEqual(result.requestedBy, 'admin');
    assert.strictEqual(refreshes, 1);
    console.log('BackOffice Local reset coordinator contract validated');
})().catch(error => { console.error(error); process.exit(1); });
