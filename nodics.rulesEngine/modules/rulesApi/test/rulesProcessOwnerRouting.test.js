/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module rulesApi/test/rulesProcessOwnerRouting @description Offline Rules approval and claim routing with original signed scope. @owner rulesApi @layer test */
const {test}=require('node:test'), assert=require('node:assert/strict');
const service=require('../src/service/defaultRuleApprovalService');
const controller=require('../src/controller/defaultRuleProcessActionController');
function fixture(t) {
    const saved={CONFIG:global.CONFIG,SERVICE:global.SERVICE};t.after(()=>Object.assign(global,saved));
    const settings=structuredClone(require('../config/properties').rulesEngine);
    for(const name of ['processTarget','actionAuthority']) settings.approval[name].connectionName='relocatedWorkflow';
    global.CONFIG={get:()=>settings};const calls=[];
    const auth={runtimeInstanceId:'workflow-instance',entCode:'signed-enterprise'};
    global.SERVICE={DefaultRuleApprovalService:service,
        DefaultServiceTokenService:{requireRuntimePrincipal:(request,module)=>{assert.equal(module,'workflow');assert.equal(request.authData,auth);return auth;}},
        DefaultProcessRuntimeLifecycleService:{startInstance:()=>{throw Error('unguarded service-presence shortcut');}},
        DefaultModuleService:{invokeModule:async input=>{calls.push(input);return {instance:{code:'approved-instance'}};}}};
    const request={tenant:'tenant',authorization:'Bearer original',authData:auth,httpRequest:{body:{instanceCode:'rules-instance',executionCode:'00000000-0000-4000-8000-000000000001'}}};
    return {settings,calls,request};
}
test('Rules start and claim use exact Workflow APIs and publication pins with distinct credentials',async t=>{
    const f=fixture(t), original=structuredClone(f.request.authData);
    const pins={publication:'OPERATIONAL',server:'combined',environment:'selected'};
    f.settings.approval.processTarget.targetAuthority=pins;
    f.settings.approval.actionAuthority.targetAuthority=pins;
    const operation={definitionCode:'rulesPolicyApproval',instanceCode:'rules-instance',context:{requestedBy:'maker'}};
    await service.startProcess(f.request,operation);
    await controller.claimExecution(f.request);
    for(const call of f.calls){assert.equal(call.moduleName,'workflow');assert.equal(call.local,false);assert.equal(call.maxAttempts,1);assert.deepEqual(call.targetAuthority,pins);assert.equal(call.tenant,'tenant');}
    assert.equal(f.calls[0].apiName,'/instances');assert.equal(f.calls[0].header.Authorization,'Bearer original');assert.equal(f.calls[0].requestBody,operation);
    assert.equal(f.calls[1].apiName,'/instances/rules-instance/actions/claim');assert.equal(f.calls[1].header,undefined,'claim uses existing internal auth, never human bearer');
    assert.deepEqual(f.calls[1].requestBody,{executionCode:f.request.httpRequest.body.executionCode,actionKey:'rulesApi.applyDecision',sourceRuntimeInstanceId:'workflow-instance'});
    assert.deepEqual(f.request.authData,original);
});
test('Rules rejects retired/malformed selectors and missing original start bearer before dispatch',async t=>{
    const f=fixture(t);
    for(const authority of [{runtimeRole:'PROCESS'},{publication:'STAGED'},{publication:'OPERATIONAL',server:''},{publication:'OPERATIONAL',runtimeRole:'PROCESS'}]) {
        f.settings.approval.processTarget.targetAuthority=authority;f.settings.approval.actionAuthority.targetAuthority=authority;
        assert.throws(()=>service.startProcess(f.request,{}),/authority/);
        await assert.rejects(controller.claimExecution(f.request),/authority/);
    }
    f.settings.approval.processTarget.targetAuthority={publication:'OPERATIONAL'};
    delete f.request.authorization;assert.throws(()=>service.startProcess(f.request,{}),/authenticated requester/);
    assert.equal(f.calls.length,0);
});
test('Rules claims reject injected decision bodies and preserve signed principal denial',async t=>{
    const f=fixture(t);f.request.httpRequest.body.decision={approved:true};
    await assert.rejects(controller.claimExecution(f.request),/handle is invalid/);
    SERVICE.DefaultServiceTokenService.requireRuntimePrincipal=()=>{throw Error('signed scope denied');};
    await assert.rejects(controller.claimExecution(f.request),/signed scope denied/);assert.equal(f.calls.length,0);
});
