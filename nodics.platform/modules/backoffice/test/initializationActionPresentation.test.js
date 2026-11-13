/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const test = require('node:test');
const assert = require('node:assert/strict');
const security = require('../src/service/security/defaultBackofficeAdministrativeSecurityService');
const secured = require('../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService');
const facade = require('../src/facade/defaultBackofficeAxisInitializationFacade');
const app = require('../src/service/defaultBackofficeApplicationInitializationService');
const routes = require('../src/router/routers').backoffice;
function request(permissions,groups=['runtimeConfigAdminUserGroup']) {return {tenant:'default',authData:{principalId:'sample',principalType:'human',tokenType:'access',tenant:'default',entCode:'default',permissions,userGroups:groups}};}
function setup(){global.CONFIG={get:key=>({routeActionAuthorization:{enabled:true,strict:true}})[key]};global.SERVICE={DefaultSecuredRequestPipelineService:secured,DefaultBackofficeAdministrativeSecurityService:security};global.CLASSES={NodicsError:class extends Error{}};}
test('baseline visibility follows exact permission, group and human admission without modifying owner status',()=>{setup();const status={readiness:'NOT_IMPORTED',allowedActions:['INITIALIZE']};const r=routes.axisInitialization.initiateInitialization;assert.deepEqual(facade.project(status,request([r.permission])).allowedActions,['INITIALIZE']);for(const req of [request([]),request([r.permission],['userGroup']),{...request([r.permission]),tenant:'foreign'},{authData:{principalType:'service',tokenType:'service',permissions:[r.permission]}}])assert.deepEqual(facade.project(status,req).allowedActions,[]);assert.deepEqual(status.allowedActions,['INITIALIZE']);delete SERVICE.DefaultSecuredRequestPipelineService;assert.deepEqual(facade.project(status,request([r.permission])).allowedActions,[]);});
test('application lifecycle remains state-limited and exact-action scoped',()=>{setup();const status={allowedActions:['INITIALIZE','ROLLBACK','RETIRE'],preparation:{steps:[]}};for(const [action,key]of Object.entries({INITIALIZE:'initiateApplicationInitialization',ROLLBACK:'rollbackApplicationInitialization',RETIRE:'retireApplicationInitialization'})){assert.deepEqual(app.projectActorActions(status,request([routes.applicationInitialization[key].permission])).allowedActions,[action]);}assert.deepEqual(app.projectActorActions({allowedActions:[]},request(['backoffice.application.initialization.initiate'])).allowedActions,[]);assert.deepEqual(app.projectActorActions(status,request(['backoffice.application.initialization.initiate'],['commerceSetupPublisherUserGroup'])).allowedActions,[]);});
test('signed operator gets only its explicit available AFTER stage; forged role or unavailable stage stays read-only',()=>{setup();const original=app.isPreparationOperator;try{app.isPreparationOperator=(step,req)=>step?.code==='real'&&req.authData.entCode==='default';const req=request(['backoffice.application.initialization.initiate'],['commerceSetupPublisherUserGroup']);const status={allowedActions:['INITIALIZE'],preparation:{selectionRequired:true,selectableStepCodes:['real'],steps:[{code:'real'}]}};assert.deepEqual(app.projectActorActions(status,req).allowedActions,['INITIALIZE']);assert.deepEqual(app.projectActorActions({...status,preparation:{...status.preparation,selectableStepCodes:[]}},req).allowedActions,[]);}finally{app.isPreparationOperator=original;}});

test('repair presentation uses its own exact route and preserves read-only diagnostics',()=>{setup();const make=(operation)=>({code:'NEEDS_SETUP',repair:{operation,available:true,label:'Prepare'}});const status={allowedActions:[],capability:{blockers:[make('applicationInitialization.prepareCapability'),make('applicationInitialization.reconcileApproval'),make('applicationInitialization.status')]}};const denied=app.projectActorActions(status,request([],['userGroup']));assert.deepEqual(denied.capability.blockers.map(b=>b.repair.available),[false,false,true]);assert.match(denied.capability.blockers[0].repair.unavailableReason,/authorized operator/);assert.equal(status.capability.blockers[0].repair.available,true);const initiator=app.projectActorActions(status,request(['backoffice.application.initialization.initiate']));assert.deepEqual(initiator.capability.blockers.map(b=>b.repair.available),[true,false,true]);const reconciler=app.projectActorActions(status,request(['backoffice.application.initialization.reconcileApproval']));assert.deepEqual(reconciler.capability.blockers.map(b=>b.repair.available),[false,true,true]);});
