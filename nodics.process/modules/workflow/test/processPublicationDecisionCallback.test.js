/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates bounded internally authenticated Process-to-domain publication decision transport. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
global.CONFIG = { get: key => key === 'process' ? { publicationDecisionCallback: { target: {
    targetAuthority: { publication: 'STAGED' }, moduleName: 'cms', connectionName: 'cmsStaged', connectionType: 'abstract', timeoutMs: 1000, maxAttempts: 2
} } } : undefined };
global.NODICS = { getInternalAuthToken: tenant => tenant === 'default' ? 'service-token' : undefined };
let descriptor;
global.SERVICE = { DefaultProcessActionAdapterRegistryService: require('../src/service/operation/defaultProcessActionAdapterRegistryService'), DefaultModuleService: {
    invokeModule: async input => {
        descriptor = input;
        return input.responseSelector({ code: 'SUC_CMS_00000', result: { publicationCode: 'home-v2', state: 'ONLINE', revision: 7, targetVersion: 'exact-manifest' } });
    }
} };
const service = require('../src/service/operation/defaultProcessPublicationDecisionCallbackService');

(async () => {
    let result = await service.applyPublicationDecision({ tenant: 'default' }, { context: {
        publicationCode: 'home-v2', publicationRevision: 4, correlationId: 'correlation-1'
    }, decision: { approved: true, reason: 'Ready' }, instance: {
        code: 'instance-1', definitionCode: 'cmsPublicationApproval', version: 1
    } });
    assert.strictEqual(result.status, 'COMPLETED');
    assert.deepStrictEqual(descriptor.targetAuthority, { publication: 'STAGED' });
    assert.strictEqual(descriptor.connectionName, 'cmsStaged');
    assert.strictEqual(descriptor.apiName, '/publication/process/decision');
    assert.strictEqual(descriptor.header.Authorization, 'Bearer service-token');
    assert.deepStrictEqual(Object.keys(descriptor.requestBody).sort(), ['approved', 'correlationId', 'expectedRevision',
        'processDefinitionCode', 'processInstanceCode', 'processVersion', 'publicationCode', 'reason'].sort());
    assert.throws(() => service.applyPublicationDecision({ tenant: 'default' }, { context: {}, decision: { approved: true } }),
        /context is invalid/);
    const valid = CONFIG.get('process').publicationDecisionCallback.target;
    const execution = { context: { publicationCode: 'home-v2', publicationRevision: 4 },
        decision: { approved: true }, instance: { code: 'instance-1', definitionCode: 'cmsPublicationApproval', version: 1 } };
    for (const response of [undefined, { code: 'SUC_CMS_00000' }, { code: 'ERR_CMS_00100' },
        ...[{ publicationCode: 'other' }, { state: 'APPROVED' }, { revision: 8 }, { targetVersion: undefined }]
            .map(change => ({ code: 'SUC_CMS_00000', result: { publicationCode: 'home-v2', state: 'ONLINE',
                revision: 7, targetVersion: 'exact-manifest', ...change } }))]) {
        SERVICE.DefaultModuleService.invokeModule = async input => input.responseSelector(response);
        await assert.rejects(service.applyPublicationDecision({ tenant: 'default' }, execution), /receipt is unavailable/);
    }
    SERVICE.DefaultModuleService.invokeModule = async input => input.responseSelector({ code: 'SUC_CMS_00000',
        result: { publicationCode: 'home-v2', state: 'REJECTED', revision: 5 } });
    assert.strictEqual((await service.applyPublicationDecision({ tenant: 'default' }, {
        ...execution, decision: { approved: false } })).output.state, 'REJECTED');
    assert.strictEqual(descriptor.local, false);
    assert.strictEqual(descriptor.tenant, 'default');
    SERVICE.DefaultModuleService.invokeModule = async () => { throw new Error('Unavailable target'); };
    await assert.rejects(service.applyPublicationDecision({ tenant: 'default' }, execution), { code: 'ERR_PROCESS_00030' });
    SERVICE.DefaultModuleService.invokeModule = async () => { throw new NodicsError('ERR_AUTH_00003', 'Denied'); };
    await assert.rejects(service.applyPublicationDecision({ tenant: 'default' }, execution), { code: 'ERR_AUTH_00003' });
    const review = { instanceCode: 'instance-1', taskCode: 'task-1' };
    const request = { tenant: 'default', authData: {
        tenant: 'default', entCode: 'enterprise', tokenType: 'access', principalType: 'human'
    }, httpRequest: { params: review, headers: { authorization: 'Bearer employee-token' } } };
    SERVICE.DefaultModuleService.invokeModule = async input => {
        descriptor = input;
        return input.responseSelector({ code: 'SUC_CMS_00000', result: review });
    };
    assert.deepStrictEqual(await service.readReview(request), review);
    assert.strictEqual(descriptor.methodName, 'GET');
    assert.strictEqual(descriptor.apiName, '/publication/reviews/instance-1/tasks/task-1');
    assert.deepStrictEqual(descriptor.header, {
        Authorization: 'Bearer employee-token', tenant: 'default', 'x-enterprise-code': 'enterprise'
    });
    assert.strictEqual(descriptor.requestBody, undefined);
    assert.strictEqual(descriptor.maxAttempts, 1);
    await assert.rejects(service.readReview({ ...request, authData: { ...request.authData, isSystem: true } }),
        { code: 'ERR_AUTH_00003' });
    for (const target of [
        { ...valid, targetAuthority: undefined },
        { ...valid, targetAuthority: { publication: 'ONLINE' } },
        { ...valid, runtimeRole: 'WCMS_STAGED' },
        { ...valid, moduleName: 'otherOwner' },
        { ...valid, targetAuthority: { publication: 'STAGED', server: '' } },
    ]) {
        global.CONFIG = { get: () => ({ publicationDecisionCallback: { target } }) };
        assert.throws(() => service.applyPublicationDecision({ tenant: 'default' }, {
            context: { publicationCode: 'home-v2' }, decision: { approved: true }
        }), /target is unavailable/);
    }
    console.log('Process publication decision callback validated');
})().catch(error => { console.error(error); process.exit(1); });
