/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module nbpm/test/workflowOwnerRouting @description Isolated exact legacy bridge API and DMS owner/publication routing. @owner nbpm @layer test */
const {test}=require('node:test'),assert=require('node:assert/strict');
const bridge=require('../src/service/workflow/defaultWorkflowService');
const resolver=require('../../nService/src/service/module/defaultRuntimeRegistryResolverService');
function fixture(t){
    const saved={CONFIG:global.CONFIG,NODICS:global.NODICS,SERVICE:global.SERVICE};t.after(()=>Object.assign(global,saved));
    const config=structuredClone(require('../config/properties'));let token='scoped-runtime-token';
    global.CONFIG={get:key=>config[key]};global.NODICS={getInternalAuthToken:tenant=>tenant==='tenant'?token:undefined};
    const calls=[];let local=true;
    const owner={moduleName:'workflow',endpoint:'http://not-contacted.invalid/workflow',server:'combined',environment:'selected',runtimeRole:{code:'RENAMED',publication:'OPERATIONAL'}};
    global.SERVICE={DefaultModuleService:{isLocalModuleActive:()=>local,isCurrentRuntimeAuthority:authority=>resolver.ownerMatches({moduleName:'workflow',targetAuthority:authority},owner),invokeModule:async input=>{calls.push(input);return 'remote';}}};
    return {config,calls,owner,subject:{...bridge,initializeWorkflows:async input=>{calls.push(input);return 'local';}},remote:()=>{local=false;},noToken:()=>{token=undefined;}};
}
test('nbpm preserves exact PUT bridge, tenant token and explicit node targeting after host rename',async t=>{
    const f=fixture(t);f.config.workflowTargetAuthority={publication:'OPERATIONAL',server:'combined',environment:'selected'};
    const body=[{code:'item'}],call=f.subject.prepareInvocation({tenant:'tenant',requestBody:body,targetNodeId:'node-2'});
    assert.equal(call.moduleName,'workflow');assert.equal(call.methodName,'PUT');assert.equal(call.apiName,'/item/init');assert.equal(call.nodeId,'node-2');assert.equal(call.connectionType,'node');assert.equal(call.requestBody,body);assert.equal(call.header.Authorization,'Bearer scoped-runtime-token');assert.equal(call.tenant,'tenant');assert.deepEqual(call.targetAuthority,f.config.workflowTargetAuthority);
    assert.equal(await f.subject.publishToWorkflow(body,'tenant'),'local');
    f.owner.runtimeRole.publication='STAGED';assert.equal(await f.subject.publishToWorkflow(body,'tenant'),'remote');
    f.owner.runtimeRole.publication='OPERATIONAL';f.remote();assert.equal(await f.subject.publishToWorkflow(body,'tenant'),'remote');
});
test('nbpm refuses missing credentials and retired or malformed authority even with local Workflow present',t=>{
    const f=fixture(t);
    for(const authority of [undefined,{runtimeRole:'PROCESS'},{publication:'STAGED'},{publication:'OPERATIONAL',server:''},{publication:'OPERATIONAL',other:'value'}]){
        f.config.workflowTargetAuthority=authority;assert.throws(()=>f.subject.publishToWorkflow([],'tenant'),/authority/);
    }
    f.config.workflowTargetAuthority={publication:'OPERATIONAL'};f.noToken();assert.throws(()=>f.subject.publishToWorkflow([],'tenant'),/authentication/);assert.equal(f.calls.length,0);
});
