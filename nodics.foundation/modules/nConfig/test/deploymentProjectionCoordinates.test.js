/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module nConfig/test/deploymentProjectionCoordinates @description Protects explicit deployment selection from inherited process selectors without activating any runtime or provider. @owner nConfig @layer test */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const projection = require('../src/service/defaultDeploymentConfigurationProjectionService');
const projectRoot = path.resolve(__dirname, 'fixtures/coordinate-project');

test('explicit environment and server replace conflicting ambient coordinate bindings', () => {
  const variables = { S: 'otherServer', SERVER: 'otherServer', E: 'otherEnvironment', ENV: 'otherEnvironment',
    N: 'otherNode', NODE: 'otherNode', NODICS_NODE: 'otherNode', PARTNER_OPTION: 'retained' };
  const before = { ...variables };
  for (const [environment, server] of [['selectedLocal', 'operationsServer'], ['selectedLocal', 'contentServer']]) {
    const selected = projection.coordinates({ projectRoot, environment, server, variables });
    assert.equal(selected.variables.S, server);
    assert.equal(selected.variables.SERVER, server);
    assert.equal(selected.variables.E, environment);
    assert.equal(selected.variables.ENV, environment);
    for (const key of ['N', 'NODE', 'NODICS_NODE']) assert.equal(selected.variables[key], '');
    assert.equal(selected.variables.PARTNER_OPTION, 'retained');
  }
  assert.deepEqual(variables, before, 'caller-owned private input map remains untouched');
});

test('omitted variable maps still bind exact coordinates and invalid selectors remain refused', () => {
  const selected = projection.coordinates({ projectRoot, environment: 'selectedLocal', server: 'operationsServer' });
  assert.equal(selected.variables.S, 'operationsServer');
  assert.equal(selected.variables.ENV, 'selectedLocal');
  assert.throws(() => projection.coordinates({ projectRoot, environment: '../foreign', server: 'operationsServer' }));
  assert.throws(() => projection.coordinates({ projectRoot, environment: 'selectedLocal', server: '../foreign' }));
});
