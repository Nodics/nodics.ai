/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @file Composes Profile's existing directory presentation with the real BackOffice metadata validator. */
const test = require('node:test'), assert = require('node:assert/strict');
const defaults = require('../config/properties').profileParticipantDirectory;
const directory = require('../src/service/customer/defaultProfileParticipantDirectoryService');
const capability = require('../src/service/defaultProfileBackofficeCapabilityService');
const contract = require('../../backoffice/src/service/contract/defaultBackofficeContractService');
function setup(t) {
  const original = ['CONFIG','SERVICE','CLASSES'].map(key=>[key,global[key]]);
  t.after(()=>original.forEach(([key,value])=>value===undefined ? delete global[key] : global[key]=value));
  const policy=structuredClone(defaults);
  global.CONFIG={get:key=>key==='profileParticipantDirectory' ? policy : key==='enterpriseManagement' ? {} : undefined};
  global.SERVICE={DefaultProfileParticipantDirectoryService:directory};
  global.CLASSES={NodicsError:class extends Error {}};
  return policy;
}
test('all admitted customer aliases render the existing bounded name/reference directory',t=>{
  const p=setup(t);const projection=capability.getCapability();
  const entries=projection.navigation.filter(item=>['customer-workspace','customers-profiles','customers'].includes(item.id));
  assert.equal(entries.length,3);
  for(const entry of entries) {
    assert.equal(entry.featureState,'ACTIVE');
    assert.equal(contract.validateBackendWorkspace(entry.backendWorkspace),true);
    const workspace=entry.backendWorkspace,section=workspace.tabs[0].sections[0];
    assert.deepEqual(workspace.ownerSelector,{publicationRole:'OPERATIONAL'});
    assert.deepEqual(section.endpoint,{method:'POST',path:'/nodics/profile/v0/participants/search',resultPath:'items'});
    assert.equal(section.filters[0].defaultValue,'CUSTOMER');
    assert.equal(section.filters[1].minimumLength,p.minimumSearchLength);
    assert.equal(section.filters[1].maximumLength,p.maximumSearchLength);
    assert.deepEqual(section.columns.map(item=>item.field),['displayName','ownerCode']);
    assert.match(workspace.description,/Up to 20 matches/);
    assert.equal(workspace.tabs.flatMap(tab=>tab.sections).some(item=>item.type==='form'),false);
  }
  assert.equal(projection.navigation.find(item=>item.id==='create-customer').featureState,'DISABLED');
});
test('later owner bounds and copy flow to the same safe workspace without copying policy into Axis',t=>{
  const p=setup(t);p.minimumSearchLength=5;p.maximumResults=7;p.customerWorkspacePresentation.title='Customer finder';
  const workspace=directory.buildCustomerWorkspace();
  assert.equal(workspace.title,'Customer finder');assert.match(workspace.description,/at least 5/);assert.match(workspace.description,/Up to 7/);
  assert.equal(contract.validateBackendWorkspace(workspace),true);
});
test('disabled directory and absent owner never leave executable customer placeholders',t=>{
  const p=setup(t);p.enabled=false;
  for(const item of capability.getCapability().navigation.filter(item=>['customer-workspace','customers-profiles','customers'].includes(item.id))) {
    assert.equal(item.featureState,'DISABLED');assert.equal(item.backendWorkspace,undefined);
  }
  p.enabled=true;delete SERVICE.DefaultProfileParticipantDirectoryService;
  assert.equal(capability.getCapability().navigation.find(item=>item.id==='customer-workspace').featureState,'DISABLED');
});
test('invalid search bounds and missing presentation cannot publish a misleading workspace',t=>{
  const p=setup(t);p.minimumSearchLength=0;assert.throws(()=>directory.buildCustomerWorkspace());
  p.minimumSearchLength=3;delete p.customerWorkspacePresentation;
  assert.equal(directory.buildCustomerWorkspace(),undefined);
});
test('BackOffice bounds string-field minimum lengths without permitting arbitrary new metadata',()=>{
  const field={name:'search',label:'Name',type:'TEXT',required:true,minimumLength:3,maximumLength:100};
  assert.equal(contract.validateBackendWorkspaceField(field),true);
  for(const minimumLength of [0,-1,101,4001,1.5,'3']) assert.equal(contract.validateBackendWorkspaceField({...field,minimumLength}),false);
  assert.equal(contract.validateBackendWorkspaceField({...field,type:'CHECKBOX'}),false);
  assert.equal(contract.validateBackendWorkspaceField({...field,execute:'script'}),false);
});
