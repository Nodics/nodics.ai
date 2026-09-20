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
