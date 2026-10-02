/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/projectConfigurationHarness @description Independent project binding and consumer isolation for the shared test harness. @owner nTooling @layer test */
'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const { createProjectConfigurationTestHarness } = require('./helpers/projectConfiguration');
const probe = require('../src/service/project/defaultProjectConfigurationProbeService');

test('tooling delegates to the single runtime-owned nConfig projection without a parallel loader', () => {
  const owner = require('../../nConfig/src/service/defaultDeploymentConfigurationProjectionService');
  assert.equal(probe, owner);
  assert.equal(probe.coordinates({ projectRoot: '/selected-project', environment: 'quality', server: 'author' }).frameworkRoot,
    path.resolve(__dirname, '../../../..'));
  assert.throws(() => owner.coordinates({ projectRoot: '/selected-project', environment: '../other', server: 'author' }));
});

test('harness creation is inert and requires explicit absolute project coordinates', () => {
  assert.throws(() => createProjectConfigurationTestHarness(), /absolute projectRoot/);
  assert.throws(() => createProjectConfigurationTestHarness({ projectRoot: 'relative' }), /absolute projectRoot/);
  const before = global.CONFIG;
  const helper = createProjectConfigurationTestHarness({ projectRoot: path.resolve('/independent-project') });
  assert.equal(global.CONFIG, before);
  assert.equal(typeof helper.loadRuntime, 'function');
  assert.throws(() => helper.loadRuntime('api', '../unsafe'), /environment/);
});

test('loader delegation preserves selected coordinates and keeps per-project graph evidence separate', () => {
  const original = probe.read;
  const calls = [];
  const first = createProjectConfigurationTestHarness({ projectRoot: path.resolve('/partner-a') });
  const second = createProjectConfigurationTestHarness({ projectRoot: path.resolve('/partner-b') });
  try {
    probe.read = options => {
      calls.push(options);
      return { properties: { fixture: options.projectRoot }, modules: [options.server, 'owner'] };
    };
    const variables = { EXPLICIT_INPUT: 'fixture-only' };
    const a = first.loadRuntime('customApi', 'customPreview', variables);
    const b = second.loadRuntime('otherApi', 'otherPreview');
    assert.deepEqual(first.activeModuleNames(a), ['customApi', 'owner']);
    assert.deepEqual(second.activeModuleNames(b), ['otherApi', 'owner']);
    assert.deepEqual(second.activeModuleNames(a), []);
    assert.equal(calls[0].environment, 'customPreview');
    assert.equal(calls[0].variables, variables);
    assert.equal(calls[1].projectRoot, path.resolve('/partner-b'));
    const failure = new Error('owner rejected configuration');
    probe.read = () => { throw failure; };
    assert.throws(() => first.loadRuntime('customApi', 'customPreview'), error => error === failure);
  } finally { probe.read = original; }
});

test('capability consumers restore test globals after success and synchronous failure', () => {
  const helper = createProjectConfigurationTestHarness({ projectRoot: path.resolve('/independent-project') });
  const router = require('../../nRouter/src/service/defaultHttpHardeningService');
  const original = router.resolveCorsOrigins;
  const beforeConfig = global.CONFIG, beforeLodash = global._;
  const properties = { httpHardening: { cors: { selected: 'fixture' } } };
  try {
    router.resolveCorsOrigins = options => {
      assert.equal(options, properties.httpHardening.cors);
      assert.equal(global.CONFIG.get('httpHardening'), properties.httpHardening);
      return { allowedOrigins: ['https://partner.invalid'] };
    };
    assert.deepEqual(helper.corsOrigins(properties), { allowedOrigins: ['https://partner.invalid'] });
    assert.equal(global.CONFIG, beforeConfig);
    assert.equal(global._, beforeLodash);
    router.resolveCorsOrigins = () => { throw new Error('owner failure'); };
    assert.throws(() => helper.corsOrigins(properties), /owner failure/);
    assert.equal(global.CONFIG, beforeConfig);
    assert.equal(global._, beforeLodash);
  } finally { router.resolveCorsOrigins = original; }
});
