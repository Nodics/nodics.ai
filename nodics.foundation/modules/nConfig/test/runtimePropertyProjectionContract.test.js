/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nConfig/test/runtimePropertyProjectionContract @description Exercises peer and node projections through real configuration files, including snapshot timing and invalid boundaries. @layer test @owner config */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const initializer = require('../src/service/DefaultFrameworkInitializerService');

test('runtime projections preserve layered binding timing, node overrides and bidirectional peers without a descriptor', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-runtime-property-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const json = (file, value) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
  const properties = (directory, value) => {const file=path.join(directory,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports = '+JSON.stringify(value));delete require.cache[require.resolve(file)];};
  json(path.join(root,'package.json'),{name:'independent.project',version:'2.3.4'});
  const env=path.join(root,'envs','qa'), authority=path.join(env,'authority'), worker=path.join(env,'worker'), node=path.join(authority,'blue');
  for (const [directory,kind] of [[env,'group'],[authority,'server'],[worker,'server'],[node,'node']]) json(path.join(directory,'package.json'),{name:path.basename(directory),nodics:{kind,runtimeModule:true}});
  properties(env,{deployment:{host:'host-before.example'}});
  properties(authority,{servers:{default:{endpoint:{$config:'ref',path:'deploymentEndpoint'}},worker:{endpoint:{$config:'runtime',name:'worker',path:'servers.default.endpoint'}}},deploymentEndpoint:{httpHost:{$config:'ref',path:'deployment.host'},httpPort:5400}});
  properties(node,{deployment:{host:'later-host.example'},servers:{default:{endpoint:{httpPort:5401}}}});
  properties(worker,{servers:{default:{endpoint:{httpHost:'worker.example',httpPort:5402}},authority:{endpoint:{$config:'runtime',name:'authority',node:'blue',path:'servers.default.endpoint'}}}});
  const options={projectRoot:root,environmentCode:'qa',serverCode:'worker'};
  const loaded=initializer.readDeploymentConfiguration(options);
  assert.deepEqual(loaded.servers.authority.endpoint,{httpHost:'host-before.example',httpPort:5401});
  loaded.servers.authority.endpoint.httpPort=1;
  assert.equal(initializer.readDeploymentConfiguration(options).servers.authority.endpoint.httpPort,5401);
  const context=initializer.deploymentPropertyContext(options);
  assert.equal(context.readPackageVersion('project'),'2.3.4');
  assert.throws(()=>context.readRuntimeProperty('../escape','servers.default.endpoint'),/valid selected deployment/);
  assert.throws(()=>context.readRuntimeProperty('authority','constructor.prototype'),/reference path/);
  properties(authority,{servers:{default:{endpoint:{$config:'runtime',name:'worker',path:'servers.authority.endpoint'}}}});
  assert.throws(()=>initializer.readDeploymentConfiguration(options),/cycle/);
  assert.equal(fs.existsSync(path.join(env,'nodics.environment.json')),false);
});

test('deployment configuration derives sibling server endpoints from runtime package metadata', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-derived-server-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const json = (file, value) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
  const properties = (directory, value) => {const file=path.join(directory,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports = '+JSON.stringify(value));delete require.cache[require.resolve(file)];};
  json(path.join(root,'package.json'),{name:'derived.project',version:'1.0.0'});
  const env=path.join(root,'envs','local'), platform=path.join(env,'platformServer'), worker=path.join(env,'workerServer');
  json(path.join(env,'package.json'),{name:'local',nodics:{kind:'group',runtimeModule:true,deploymentClass:'LOCAL'}});
  json(path.join(platform,'package.json'),{name:'platformServer',nodics:{kind:'server',runtimeModule:true,runtimeAliases:['profile','backoffice']}});
  json(path.join(worker,'package.json'),{name:'workerServer',nodics:{kind:'server',runtimeModule:true}});
  properties(env,{});
  properties(platform,{servers:{default:{endpoint:{httpHost:'0.0.0.0',httpPort:5100},abstractEndpoint:{httpHost:'platform.local',httpPort:5100},browserEndpoint:{httpHost:'localhost',httpPort:6100}}}});
  properties(worker,{servers:{default:{endpoint:{httpHost:'worker.local',httpPort:5200}},profile:{remoteOnly:true}}});
  const loaded=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'workerServer'});
  assert.equal(loaded.environment.code,'local');
  assert.equal(loaded.environment.class,'LOCAL');
  assert.equal(loaded.servers.platform.endpoint.httpHost,'platform.local');
  assert.equal(loaded.servers.platform.endpoint.httpPort,5100);
  assert.equal(loaded.servers.platform.browserEndpoint.httpHost,'localhost');
  assert.equal(loaded.servers.platform.browserEndpoint.httpPort,6100);
  assert.equal(loaded.servers.platformServer.endpoint.httpPort,5100);
  assert.equal(loaded.servers.profile.endpoint.httpPort,5100);
  assert.equal(loaded.servers.profile.remoteOnly,true);
  assert.equal(loaded.servers.worker.endpoint.httpPort,5200);
  assert.equal(loaded.servers.workerServer.endpoint.httpPort,5200);
});

test('deployment configuration resolves module-owned compositions before runtime registry exists', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-bootstrap-composition-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const json = (file, value) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
  const properties = (directory, value) => {const file=path.join(directory,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports = '+JSON.stringify(value));delete require.cache[require.resolve(file)];};
  json(path.join(root,'package.json'),{name:'composition.project',version:'1.0.0'});
  const owner=path.join(root,'modules','compositionOwner'), env=path.join(root,'envs','local'), server=path.join(env,'commerceServer');
  json(path.join(owner,'package.json'),{name:'compositionOwner'});
  json(path.join(env,'package.json'),{name:'local',nodics:{kind:'group',runtimeModule:true}});
  json(path.join(server,'package.json'),{name:'commerceServer',nodics:{kind:'server',runtimeModule:true}});
  properties(owner,{activeModules:{compositions:{domains:{selection:'one',domains:[{code:'one',projectPack:'selectedModule'},{code:'two',projectPack:'otherModule'}]}}}});
  properties(server,{activeModules:{modules:[{$config:'selected',name:'domains',field:'projectPacks',includes:'selectedModule',value:'selectedModule',otherwise:'fallbackModule'}]},servers:{default:{endpoint:{httpPort:5400}}}});
  const previous = global.NODICS;
  try {
    delete global.NODICS;
    const loaded=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'commerceServer'});
    assert.deepEqual(loaded.activeModules.modules,['selectedModule']);
  } finally {
    global.NODICS = previous;
  }
});

test('deployment configuration applies search runtime role profiles without server-local search blocks', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-search-role-profile-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const json = (file, value) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
  const properties = (directory, value) => {const file=path.join(directory,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports = '+JSON.stringify(value));delete require.cache[require.resolve(file)];};
  json(path.join(root,'package.json'),{name:'search.project',version:'1.0.0'});
  const env=path.join(root,'envs','local'), searchServer=path.join(env,'searchServer'), plainServer=path.join(env,'plainServer');
  json(path.join(env,'package.json'),{name:'local',nodics:{kind:'group',runtimeModule:true}});
  json(path.join(searchServer,'package.json'),{name:'searchServer',nodics:{kind:'server',runtimeModule:true}});
  json(path.join(plainServer,'package.json'),{name:'plainServer',nodics:{kind:'server',runtimeModule:true}});
  properties(env,{search:{default:{options:{enabled:false}},runtimeRoleProfiles:{SEARCH:{product:{options:{enabled:true}},discoveryProjection:{options:{enabled:true}}}}}});
  properties(searchServer,{runtimeRole:{code:'SEARCH'},servers:{default:{endpoint:{httpPort:5300}}}});
  properties(plainServer,{runtimeRole:{code:'PLAIN'},servers:{default:{endpoint:{httpPort:5301}}}});
  const selected=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'searchServer'});
  assert.equal(selected.search.default.options.enabled,false);
  assert.equal(selected.search.product.options.enabled,true);
  assert.equal(selected.search.discoveryProjection.options.enabled,true);
  assert.equal(selected.search.runtimeRoleProfiles,undefined);
  const plain=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'plainServer'});
  assert.equal(plain.search.default.options.enabled,false);
  assert.equal(plain.search.product,undefined);
  assert.equal(plain.search.runtimeRoleProfiles,undefined);
});

test('runtime initialization profiles derive from active module data manifests', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-derived-data-profile-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const moduleRoot = path.join(root, 'commerceOwner');
  fs.mkdirSync(path.join(moduleRoot, 'data'), {recursive:true});
  fs.writeFileSync(path.join(moduleRoot, 'data', 'manifest.json'), JSON.stringify({
    sections: {
      commerceCore: { kind: 'DATA_RELEASE', dataType: 'core', destinationRole: 'COMMERCE', environmentScope: ['LOCAL'] },
      commerceSample: { kind: 'DATA_RELEASE', dataType: 'sample', destinationRole: 'COMMERCE_STAGED', environmentScope: ['LOCAL'] },
    },
  }));
  const previous = global.NODICS;
  try {
    global.NODICS = {
      getActiveModules: () => ['commerceOwner'],
      getRawModule: name => name === 'commerceOwner' ? {path: moduleRoot} : undefined,
    };
    const resolved = initializer.deriveRuntimeRoleInitializationProfiles({
      environment: {class: 'LOCAL'},
      runtimeRole: {code: 'COMMERCE'},
      data: {dataReleases: {initializationProfiles: {}}},
    });
    assert.deepEqual(resolved.data.dataReleases.initializationProfiles.localCommerceFoundation.steps, [{dataType: 'core'}]);
  } finally {
    global.NODICS = previous;
  }
});
