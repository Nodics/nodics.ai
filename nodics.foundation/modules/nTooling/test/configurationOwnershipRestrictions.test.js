/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/configurationOwnershipRestrictions @description Guards static configuration ownership without evaluating customer code. @layer test @owner nTooling */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const audit = require('../src/service/quality/defaultDesignPrincipleAuditService');

test('configuration audit rejects retired authorities and secrets without printing their values', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-config-restrictions-'));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  fs.mkdirSync(path.join(root, 'config'));
  const secret = 'isolated-test-secret-must-not-appear-in-diagnostics';
  const file = path.join(root, 'config/properties.js');
  fs.writeFileSync(file, 'throw new Error("must not execute"); module.exports = ' + JSON.stringify({
    authSecurity:{jwt:{secret}}, configurationValues:{remoteEndpoints:{}},
    origins:{$config:'profile',path:'frontends'},
  }));
  fs.writeFileSync(path.join(root, 'nodics.environment.json'), '{}');
  const failures = [];
  audit.auditConfigurationSources(failures, root);
  assert.equal(failures.length, 4);
  assert(!failures.join(' ').includes(secret));
  assert(failures.some(value => value.includes('authSecurity.jwt.secret')));
  fs.unlinkSync(path.join(root, 'nodics.environment.json'));
  fs.writeFileSync(file, 'module.exports = ' + JSON.stringify({
    authSecurity:{jwt:{secret:{$config:'env',name:'CUSTOMER_JWT',fallback:null}}},
    servers:{default:{endpoint:{httpPort:4400}}},
    search:{default:{elastic:{connection:{hosts:['https://search.customer.example']}}}},
  }));
  const valid = [];
  audit.auditConfigurationSources(valid, root);
  assert.deepEqual(valid, []);
});


test('backend properties reject frontend launch catalogues while accepting explicit CORS policy', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-frontend-boundary-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'config'));
  const file = path.join(root, 'config/properties.js');
  fs.writeFileSync(file, 'module.exports = { frontends: { shop: { command: "npm", port: 3000 } } };');
  const failures = [];
  audit.auditConfigurationSources(failures, root);
  assert(failures.some(value => value.includes('frontend lifecycle')));
  fs.writeFileSync(file, 'module.exports = { httpHardening: { cors: { enabled: true, originEndpoints: { public: { port: 3000 } } } } };');
  const allowed = [];
  audit.auditConfigurationSources(allowed, root);
  assert.deepEqual(allowed, []);
});


test('only explicit customer validation permits a direct administrator bootstrap value', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-customer-bootstrap-'));
  t.after(() => fs.rmSync(root, {recursive:true,force:true}));
  fs.mkdirSync(path.join(root, 'config'));
  const file = path.join(root, 'config/properties.js');
  const secret = 'customer-fixture-value-not-for-deployment';
  const write = value => fs.writeFileSync(file, 'module.exports = ' + JSON.stringify(value));
  write({bootstrapIdentity:{adminPassword:secret}});
  const framework = [], customer = [];
  audit.auditConfigurationSources(framework, root);
  audit.auditConfigurationSources(customer, root, {customerProject:true});
  assert.equal(framework.length, 1);
  assert.deepEqual(customer, []);
  write({bootstrapIdentity:{adminPassword:{$config:'env',name:'ADMIN_PASSWORD',fallback:secret},servicePassword:secret,serviceApiKey:secret},authSecurity:{jwt:{secret},apiKey:{pepper:secret}},defaultAuthDetail:{apiKey:secret}});
  const rejected = [];
  audit.auditConfigurationSources(rejected, root, {customerProject:true});
  assert.equal(rejected.length, 6);
  assert(!rejected.join(' ').includes(secret));
});
