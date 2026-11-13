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

test('deployment configuration preserves owner defaults independently of runtime names', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-search-role-profile-'));
  t.after(() => fs.rmSync(root,{recursive:true,force:true}));
  const json = (file, value) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
  const properties = (directory, value) => {const file=path.join(directory,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports = '+JSON.stringify(value));delete require.cache[require.resolve(file)];};
  json(path.join(root,'package.json'),{name:'search.project',version:'1.0.0'});
  const env=path.join(root,'envs','local'), searchServer=path.join(env,'searchServer'), plainServer=path.join(env,'plainServer');
  json(path.join(env,'package.json'),{name:'local',nodics:{kind:'group',runtimeModule:true}});
  json(path.join(searchServer,'package.json'),{name:'searchServer',nodics:{kind:'server',runtimeModule:true}});
  json(path.join(plainServer,'package.json'),{name:'plainServer',nodics:{kind:'server',runtimeModule:true}});
  const inheritedProperties={search:{default:{options:{enabled:false}},product:{options:{enabled:true}},discoveryProjection:{options:{enabled:true}}}};
  properties(searchServer,{runtimeRole:{code:'SEARCH'},servers:{default:{endpoint:{httpPort:5300}}}});
  properties(plainServer,{runtimeRole:{code:'PLAIN'},servers:{default:{endpoint:{httpPort:5301}}}});
  const selected=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'searchServer',inheritedProperties});
  assert.equal(selected.search.default.options.enabled,false);
  assert.equal(selected.search.product.options.enabled,true);
  assert.equal(selected.search.discoveryProjection.options.enabled,true);
  assert.equal(selected.search.runtimeRoleProfiles,undefined);
  const plain=initializer.readDeploymentConfiguration({projectRoot:root,environmentCode:'local',serverCode:'plainServer',inheritedProperties});
  assert.equal(plain.search.default.options.enabled,false);
  assert.equal(plain.search.product.options.enabled,true);
  assert.equal(plain.search.runtimeRoleProfiles,undefined);
});

test('retired nested owner profiles reject without mutating input', () => {
  const input = { ordinaryArray: [{ runtimeRoleProfiles: { AUTHOR: { enabled: true } } }] };
  const original = structuredClone(input);
  assert.throws(() => initializer.validateCapabilityConfiguration(input), /Retired runtimeRoleProfiles/);
  assert.deepEqual(input, original);
});

test('deployment projection rejects retired owner profiles through the real reader', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-capability-role-'));
  t.after(() => fs.rmSync(root, {recursive: true, force: true}));
  const server = path.join(root, 'envs', 'qa', 'author');
  fs.mkdirSync(path.join(server, 'config'), {recursive: true});
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({name: 'independent.customer', version: '1.0.0'}));
  fs.writeFileSync(path.join(root, 'envs', 'qa', 'package.json'), JSON.stringify({name: 'qa', nodics: {kind: 'group', runtimeModule: true}}));
  fs.writeFileSync(path.join(server, 'package.json'), JSON.stringify({name: 'author', nodics: {kind: 'server', runtimeModule: true}}));
  fs.writeFileSync(path.join(server, 'config', 'properties.js'), 'module.exports = ' + JSON.stringify({
    runtimeRole: {code: 'AUTHOR'},
    independentSolution: {enabled: false, runtimeRoleProfiles: {AUTHOR: {enabled: true}}},
    servers: {default: {endpoint: {httpPort: 5500}}},
  }));
  assert.throws(() => initializer.readDeploymentConfiguration({projectRoot: root, environmentCode: 'qa', serverCode: 'author'}), /Retired runtimeRoleProfiles/);
});

test('ordinary initialization selections remain explicit and are not generated by runtime code', () => {
  const properties = {
    runtimeRole: {code: 'CUSTOM', publication: 'OPERATIONAL'},
    data: {dataReleases: {initializationProfiles: {selected: {steps: [{dataType: 'core'}]}}}},
  };
  const before = structuredClone(properties);
  initializer.validateCapabilityConfiguration(properties);
  assert.deepEqual(properties, before);
  assert.equal(initializer.deriveRuntimeRoleInitializationProfiles, undefined);
});


test('publication leaf bindings use explicit deployment context before owner loading and preserve later overrides', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-publication-leaf-'));
  t.after(() => fs.rmSync(root, {recursive:true, force:true}));
  const write = (file, content) => {fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, content);};
  write(path.join(root,'package.json'), JSON.stringify({name:'custom.project'}));
  const env = path.join(root,'envs','qa');
  write(path.join(env,'package.json'), JSON.stringify({name:'qa',nodics:{kind:'group',runtimeModule:true}}));
  const ownerFile = path.join(root,'owner','config','properties.js');
  write(ownerFile, 'module.exports = '+JSON.stringify({feature:{
    publication: {$config:'context',name:'publication'},
    versioned: {$config:'context',name:'publication',cases:{STAGED:true,ONLINE:false,OPERATIONAL:false}},
  }}));
  for (const publication of ['STAGED','ONLINE','OPERATIONAL']) {
    const server = path.join(env,publication.toLowerCase());
    write(path.join(server,'package.json'),JSON.stringify({name:path.basename(server),nodics:{kind:'server',runtimeModule:true}}));
    write(path.join(server,'config','properties.js'),'module.exports = '+JSON.stringify({runtimeRole:{code:'ARBITRARY',publication},feature:{versioned:false}}));
    const options={projectRoot:root,environmentCode:'qa',serverCode:path.basename(server)};
    const context=initializer.deploymentPropertyContext(options);
    const defaults=initializer.readPropertyContribution(ownerFile,{},context);
    assert.equal(defaults.feature.publication,publication);
    assert.equal(defaults.feature.versioned,publication==='STAGED');
    const effective=initializer.readDeploymentConfiguration({...options,inheritedProperties:defaults});
    assert.equal(effective.feature.versioned,false);
  }
  const bindings=require('../src/service/defaultConfigurationBindingService');
  for (const publication of [undefined,'UNKNOWN','COMMERCE']) {
    assert.throws(()=>bindings.resolve({v:{$config:'context',name:'publication'}},{},{readRuntimeProperty:()=>publication}),/publication context/);
  }
  const context={readRuntimeProperty:()=> 'ONLINE'};
  assert.throws(()=>bindings.resolve({v:{$config:'context',name:'publication',cases:{STAGED:true}}},{},context),/explicit bounded case/);
  assert.throws(()=>bindings.resolve({v:{$config:'context',name:'publication',cases:{ONLINE:false,OTHER:true}}},{},context),/explicit bounded case/);
  assert.throws(()=>bindings.resolve({v:{$config:'context',name:'serverCode',cases:{ONLINE:false}}},{},context),/require publication/);
});

/** Creates an independent project whose peer alias is declared by existing package metadata. */
function aliasProjectionFixture(t, prefix) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const json = (relative, value) => {
    const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(value));
  };
  const props = (relative, value) => {
    const file = path.join(root, relative, 'config/properties.js');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(value));
    delete require.cache[require.resolve(file)];
  };
  json('package.json', { name: prefix.replace(/-$/, '') + '.project', version: '1.0.0' });
  json('envs/qa/package.json', { name: 'qa', nodics: { kind: 'group', runtimeModule: true } });
  for (const code of ['admin', 'warehouse']) {
    json('envs/qa/' + code + '/package.json', { name: code, nodics: {
      kind: 'server', runtimeModule: true, runtimeAliases: code === 'warehouse' ? ['inventoryPeer'] : [],
      runtimeIdentity: { instanceCode: code + '-fixture' }
    } });
  }
  props('envs/qa/warehouse', { runtimeRole: { code: 'FULFILLMENT', publication: 'OPERATIONAL' }, servers: { default: { endpoint: { httpHost: 'localhost', httpPort: 5801 } } } });
  props('envs/qa/admin', { target: {
    server: { $config: 'runtime', name: 'inventoryPeer', path: 'runtimeIdentity.serverCode' },
    role: { $config: 'runtime', name: 'inventoryPeer', path: 'runtimeRole.code' }
  } });
  return { root, json, props, options: { projectRoot: root, environmentCode: 'qa', serverCode: 'admin' } };
}

test('runtime aliases project canonical metadata in unrelated applications without copied target properties', t => {
  for (const prefix of ['independent-one-', 'independent-two-']) {
    const f = aliasProjectionFixture(t, prefix);
    const loaded = initializer.readDeploymentConfiguration(f.options);
    assert.deepEqual(loaded.target, { server: 'warehouse', role: 'FULFILLMENT' });
    assert.equal(loaded.runtimeIdentity.serverCode, 'admin', 'peer projection does not replace caller identity');
    assert.equal(global.NODICS, undefined, 'projection never starts a runtime registry');
  }
});

test('runtime alias projection rejects ambiguous, absent, retired and escaping peers', t => {
  const f = aliasProjectionFixture(t, 'independent-denial-');
  f.json('envs/qa/other/package.json', { name: 'other', nodics: { kind: 'server', runtimeModule: true, runtimeAliases: ['inventoryPeer'] } });
  f.props('envs/qa/other', {});
  assert.throws(() => initializer.readDeploymentConfiguration(f.options), /one declared deployment server/);
  f.json('envs/qa/other/package.json', { name: 'other', nodics: { kind: 'server', runtimeModule: true, retired: true, runtimeAliases: ['inventoryPeer'] } });
  assert.equal(initializer.readDeploymentConfiguration(f.options).target.server, 'warehouse');
  for (const name of ['missingPeer', '../warehouse', 'other']) {
    f.props('envs/qa/admin', { target: { $config: 'runtime', name, path: 'runtimeRole.code' } });
    assert.throws(() => initializer.readDeploymentConfiguration(f.options));
  }
});

test('peer metadata projection retains node overrides, immutable source identity and cycle rejection', t => {
  const f = aliasProjectionFixture(t, 'independent-node-');
  f.json('envs/qa/warehouse/blue/package.json', { name: 'blue', nodics: { kind: 'node', runtimeModule: true } });
  f.props('envs/qa/warehouse/blue', { runtimeRole: { code: 'CUSTOM_FULFILLMENT' } });
  f.props('envs/qa/admin', { target: {
    server: { $config: 'runtime', name: 'inventoryPeer', node: 'blue', path: 'runtimeIdentity.serverCode' },
    role: { $config: 'runtime', name: 'inventoryPeer', node: 'blue', path: 'runtimeRole.code' }
  } });
  assert.deepEqual(initializer.readDeploymentConfiguration(f.options).target, { server: 'warehouse', role: 'CUSTOM_FULFILLMENT' });
  f.props('envs/qa/warehouse', { loop: { $config: 'runtime', name: 'inventoryPeer', path: 'loop' } });
  f.props('envs/qa/admin', { target: { $config: 'runtime', name: 'inventoryPeer', path: 'loop' } });
  assert.throws(() => initializer.readDeploymentConfiguration(f.options), /cycle|depth limit/);
});


test('projected topology does not fabricate instance authority and refuses contradictory metadata', t => {
  const f = aliasProjectionFixture(t, 'independent-identity-');
  f.json('envs/qa/warehouse/package.json', { name: 'warehouse', nodics: { kind: 'server', runtimeModule: true, runtimeAliases: ['inventoryPeer'] } });
  const loaded = initializer.readDeploymentConfiguration(f.options);
  assert.equal(loaded.target.server, 'warehouse');
  const parent = initializer.deploymentPropertyContext(f.options);
  assert.throws(() => initializer.readRuntimeProperty(parent, 'inventoryPeer', 'runtimeIdentity.instanceCode'), /unavailable/);
  f.json('envs/qa/warehouse/package.json', { name: 'warehouse', nodics: { kind: 'server', runtimeModule: true, runtimeAliases: ['inventoryPeer'], runtimeIdentity: { serverCode: 'anotherServer' } } });
  assert.throws(() => initializer.readDeploymentConfiguration(f.options), /contradicts? selected topology/);
  f.json('envs/qa/warehouse/package.json', { name: 'warehouse', nodics: { kind: 'server', runtimeModule: true, runtimeAliases: ['inventoryPeer'] } });
  f.props('envs/qa/admin', { runtimeIdentity: { serverCode: 'anotherServer' } });
  assert.throws(() => initializer.readDeploymentConfiguration(f.options), /contradicts? selected topology/);
  for (const runtimeIdentity of ['invalid', [], false]) {
    f.props('envs/qa/admin', { runtimeIdentity });
    assert.throws(() => initializer.readDeploymentConfiguration(f.options), /Runtime identity properties are invalid/);
  }
});


test('runtime identity projections preserve node overrides and reject contradictory topology coordinates', t => {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'nodics-node-identity-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const put=(file,value)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value));};
 const env=path.join(root,'envs','qa'), server=path.join(env,'authority'), node=path.join(server,'blue');
 put(path.join(root,'package.json'),{name:'identity.project'});
 for(const [dir,kind] of [[env,'group'],[server,'server'],[node,'node']]) put(path.join(dir,'package.json'),{name:path.basename(dir),nodics:{kind,runtimeModule:true,...(kind==='server'?{runtimeIdentity:{instanceCode:'base',remoteModules:['profile']}}:{})}});
 const write=(dir,value)=>{const file=path.join(dir,'config/properties.js');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'module.exports='+JSON.stringify(value));delete require.cache[require.resolve(file)];};
 write(env,{});write(server,{runtimeIdentity:{remoteModules:{$config:'replace',value:['cms']}}});write(node,{runtimeIdentity:{instanceCode:'replica'}});
 const context=initializer.deploymentPropertyContext({projectRoot:root,environmentCode:'qa',serverCode:'authority'});
 const identity=initializer.readRuntimeProperty(context,'authority',['runtimeIdentity'],'blue');
 assert.equal(identity.instanceCode,'replica');assert.deepEqual(identity.remoteModules,['cms']);
 assert.equal(identity.projectCode,'identity.project');assert.equal(identity.environmentCode,'qa');assert.equal(identity.serverCode,'authority');assert.equal(identity.nodeCode,'blue');
 assert.equal(initializer.readRuntimeProperty(context,'authority',['runtimeIdentity','instanceCode']),'base');
 identity.remoteModules.push('foreign');assert.deepEqual(initializer.readRuntimeProperty(context,'authority',['runtimeIdentity','remoteModules'],'blue'),['cms']);
 write(node,{runtimeIdentity:{instanceCode:'replica',serverCode:'foreign'}});
 assert.throws(()=>initializer.readRuntimeProperty(context,'authority',['runtimeIdentity'],'blue'),/contradict/);
});
