/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/test/moduleDomainRefusalCircuitContract
 * @description Exercises actual fetch normalization and capability-owned circuit policy without network or runtime operations.
 * @layer test
 * @owner nService
 */
const assert = require('node:assert/strict');
const { test, after } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const _ = require('lodash');
const NodicsError = require('../../nCommon/src/lib/nodicsError');
const utilities = require('../../nDatabase/database/src/utils/utils');
const importDefinitions = require('../../nData/nImport/import/src/utils/statusDefinitions');
const defaults = require('../config/properties').serviceCommunication;
const importContribution = require('../../nData/nImport/import/config/properties').serviceCommunication;
const saved = Object.fromEntries(['CONFIG', 'UTILS', 'SERVICE', 'CLASSES'].map(key => [key, global[key]]));
global.CONFIG = { get: key => key === 'defaultErrorCodes' ? { NodicsError: 'ERR_SYS_00000' } : {} };
global.UTILS = utilities;
global.SERVICE = { DefaultStatusService: { get: code => importDefinitions[code] || { code: '500', message: 'Internal error' } } };
global.CLASSES = { NodicsError };
after(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete global[key]; else global[key] = value;
  }
});

function harness(overrides = {}) {
  const policy = _.merge({}, defaults, importContribution, overrides);
  let outcome, calls = 0;
  const sandbox = {
    module: { exports: {} },
    require: name => name === 'node-fetch' ? async () => {
      calls++;
      if (outcome instanceof Error) throw outcome;
      return outcome;
    } : require(name),
    CLASSES: global.CLASSES, CONFIG: global.CONFIG, SERVICE: global.SERVICE,
    URL, AbortController, setTimeout, clearTimeout, process, Buffer,
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../src/service/module/defaultModuleService'), 'utf8'), sandbox);
  const owner = Object.assign(Object.create(sandbox.module.exports), {
    LOG: { debug() {} },
    getTransportConfiguration: () => _.cloneDeep(policy),
    buildFetchErrorContext: () => ({ layer: 'isolated-circuit-contract' }),
  });
  owner.initializeTransport();
  after(() => owner.closeTransport());
  return {
    owner, policy,
    calls: () => calls,
    response(status, code, metadata) {
      outcome = { ok: false, status, json: async () => ({ code, metadata }) };
    },
    fault(error) { outcome = error; },
    request(moduleName = 'import') {
      return owner.fetch({ uri: 'http://127.0.0.1:1/not-used', method: 'POST', json: true,
        nodicsContext: { moduleName } });
    },
  };
}

test('actual layered import refusals reject repeatedly without shared circuit penalty or retry', async () => {
  const h = harness();
  assert.deepEqual(defaults.circuitBreaker.domainRefusals, {});
  assert.equal(h.policy.circuitBreaker.failureThreshold, defaults.circuitBreaker.failureThreshold);
  for (let index = 0; index < 12; index++) {
    const status = index % 2 ? 404 : 400;
    const code = status === 400 ? 'ERR_IMP_00003' : 'ERR_IMP_00004';
    h.response(status, code);
    await assert.rejects(h.request(), error => {
      assert.equal(error.metadata.remoteHttpFailure.code, code);
      assert.equal(error.metadata.remoteHttpFailure.httpStatus, status);
      return true;
    });
  }
  assert.equal(h.calls(), 12);
  assert.equal(h.owner._circuits.get('import'), undefined);
  assert.equal(h.owner._diagnostics.failures, 12);
  assert.equal(h.owner._diagnostics.successes, 0);
  assert.equal(h.owner._diagnostics.retries, 0);
  assert.equal(h.owner._diagnostics.circuitRejected, 0);
});

test('security, rate limit, server, unknown, mismatched and transport faults retain circuit penalties', async () => {
  for (const [status, code, moduleName] of [
    [400, 'ERR_AUTH_00001', 'import'], [401, 'ERR_IMP_00003', 'import'],
    [403, 'ERR_IMP_00003', 'import'], [404, 'ERR_SYS_00000', 'import'],
    [400, 'ERR_IMP_00004', 'import'], [429, 'ERR_IMP_00003', 'import'],
    [500, 'ERR_IMP_00003', 'import'], [503, 'ERR_IMP_00004', 'import'],
    [400, 'ERR_IMP_00003', 'unrelated'],
  ]) {
    const h = harness();
    h.response(status, code, { remoteHttpFailure: { code: 'ERR_IMP_00003', httpStatus: 400 } });
    for (let count = 0; count < h.policy.circuitBreaker.failureThreshold; count++)
      await assert.rejects(h.request(moduleName));
    const circuit = h.owner._circuits.get(moduleName);
    assert.equal(circuit.state, 'open');
    const openedAt = circuit.openedAt;
    await assert.rejects(h.request(moduleName));
    assert.equal(circuit.openedAt, openedAt);
    assert.equal(h.calls(), h.policy.circuitBreaker.failureThreshold);
    assert.equal(h.owner._diagnostics.circuitRejected, 1);
    assert.equal(h.owner._diagnostics.retries, 0);
  }
  for (const error of [Object.assign(new Error('connection failed'), { code: 'ECONNRESET' }),
    Object.assign(new Error('aborted'), { name: 'AbortError' })]) {
    const h = harness();
    h.fault(error);
    await assert.rejects(h.request());
    assert.equal(h.owner._circuits.get('import').failures, 1);
    assert.equal(h.calls(), 1);
  }
});

test('missing or malformed owner declarations do not exempt refusals', async () => {
  for (const declarations of [null, {}, { import: null }, { import: [] },
    { import: { ERR_IMP_00003: '400' } }, { unrelated: { ERR_IMP_00003: 400 } }]) {
    const h = harness();
    h.policy.circuitBreaker.domainRefusals = declarations;
    h.response(400, 'ERR_IMP_00003');
    await assert.rejects(h.request());
    assert.equal(h.owner._circuits.get('import').failures, 1);
  }
});

test('closed genuine faults survive domain refusals; half-open domain response proves reachability only', async () => {
  const h = harness();
  h.response(503, 'ERR_SYS_00000');
  await assert.rejects(h.request());
  h.response(400, 'ERR_IMP_00003');
  await assert.rejects(h.request());
  assert.equal(h.owner._circuits.get('import').failures, 1);
  const openedAt = Date.now() - h.policy.circuitBreaker.recoveryTimeoutMs - 1;
  h.owner._circuits.set('import', { state: 'open', failures: 5, openedAt });
  await assert.rejects(h.request());
  assert.equal(h.owner._circuits.get('import').state, 'closed');
  assert.equal(h.owner._circuits.get('import').failures, 0);
  assert.equal(h.owner._diagnostics.failures, 3);
  assert.equal(h.owner._diagnostics.successes, 0);
  assert.equal(h.calls(), 3);
});
