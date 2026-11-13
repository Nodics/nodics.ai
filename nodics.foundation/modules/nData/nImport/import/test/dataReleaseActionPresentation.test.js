/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module import/test/dataReleaseActionPresentation @description Verifies catalogue action presentation against actual command routes and profile requirements without installation. @owner import @layer test */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const source=require('../src/service/release/defaultDataReleaseService');
const secured=require('../../../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
function request(permissions){return {tenant:'default',authData:{principalType:'human',tokenType:'access',authenticationMethod:'PASSWORD',tenant:'default',entCode:'own',permissions,userGroups:['employeeUserGroup']}};}
function fixture(){global.CONFIG={get:key=>({routeActionAuthorization:{enabled:true,strict:true},defaultTenant:'default',defaultEnterprise:'default',identityGovernance:{principalPolicy:{serviceGroup:'serviceAccountUserGroup'}}})[key]};global.SERVICE={DefaultSecuredRequestPipelineService:{...secured}};return {...source,error:code=>Error(code)};}
test('catalogue visibility alone is read-only and source actor is not mutated',()=>{const s=fixture(),r=request(['import.release.view']),before=structuredClone(r);assert.deepEqual(s.clientActions(r,'core'),[]);assert.deepEqual(s.clientActions(r,'profile',['import.core.run']),[]);assert.deepEqual(r,before);});
test('release actions use actual type-specific routes and the native permission evaluator',()=>{const s=fixture();assert.deepEqual(s.clientActions(request(['import.release.validate']),'sample'),['validate']);assert.deepEqual(s.clientActions(request(['import.sample.run']),'sample'),['install']);assert.deepEqual(s.clientActions(request(['import.init.run']),'core'),[]);assert.deepEqual(s.clientActions(request(['import.core.run']),'core'),['validate','install']);});
test('profile installation retains all existing type requirements; validation is independent',()=>{const s=fixture();assert.deepEqual(s.clientActions(request(['import.core.run']),'profile',['import.core.run','import.init.run']),['validate']);assert.deepEqual(s.clientActions(request(['import.core.run','import.init.run']),'profile',['import.core.run','import.init.run']),['validate','install']);});
test('missing actor/evaluator and service claims are read-only',()=>{const s=fixture();assert.deepEqual(s.clientActions({body:{authData:request(['import.core.run']).authData}},'core'),[]);assert.deepEqual(s.clientActions({authData:{principalType:'service',tokenType:'service',permissions:['*']}},'core'),[]);SERVICE={};assert.deepEqual(s.clientActions(request(['import.core.run']),'core'),[]);});
