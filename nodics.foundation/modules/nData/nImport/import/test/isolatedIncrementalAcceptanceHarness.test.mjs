/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module import/test/isolatedIncrementalAcceptanceHarness @description Canonical package discovery, isolation and exact retained-source adoption without live providers. @layer test @owner import */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createIsolatedDeployment, inspectDeployment, adoptSource, removeTestSource, runIsolatedIncrementalAcceptance } from './helpers/isolatedIncrementalAcceptanceHarness.mjs';
import { incrementalAcceptance as spec, incrementalAcceptanceSource } from './helpers/defaultIncrementalReleaseAcceptanceService.mjs';
const require = createRequire(import.meta.url);
function fixture(t) {
  const c = createIsolatedDeployment({ ports: { mongo: 59021, redis: 59022, http: 59023 } });
  t.after(() => { c.runtimeRunning = false; removeTestSource(c); });
  return c;
}
function evidence(c) {
  const owner = Object.assign(Object.create(require('../src/service/release/defaultDataReleaseService')), { configuration: () => require('../config/properties').data.dataReleases });
  const release = owner.inspectSourceManifest({ name: spec.moduleName }, path.join(c.moduleRoot, 'data/manifest.json'), incrementalAcceptanceSource('predecessor').section, spec.sectionCode);
  return { phase: 'edit', executed: true, release: { ...release, status: 'CURRENT' }, after: spec.codes.map((code, i) => ({ code, _id: 'test-' + i, description: i ? spec.businessEdit : spec.initial })) };
}
test('real nConfig discovers fixture alongside Import without a registry shadow or security bypass', t => {
  const c = fixture(t), result = inspectDeployment(c);
  assert.equal(result.discovered, true); assert.equal(result.implementingOwner, 'import');
  assert.equal(result.moduleName, 'importAcceptanceFixture');
  assert.equal(result.authenticationBypass, false);
  const source = fs.readFileSync(path.join(c.root, 'envs', c.environmentName, 'config/properties.js'), 'utf8');
  assert(!source.includes('mandatoryBootstrapServices')); assert(!source.includes('servicePrincipalScopes'));
  assert(!source.includes('principalScopeAssignment')); assert(!source.includes('kickoffLocal'));
  for (const inherited of ['securityStamp', 'requireDistributedCache', 'cacheModuleName', 'fallback']) assert(!source.includes(inherited));
});
test('adoption preserves predecessor bytes and canonical owner receipt identity', t => {
  const c = fixture(t), before = incrementalAcceptanceSource('predecessor');
  const result = adoptSource(c, 'successor', evidence(c));
  assert.equal(result.stage, 'successor');
  for (const [file, bytes] of Object.entries(before.files)) assert.equal(fs.readFileSync(path.join(c.moduleRoot, 'data', file), 'utf8'), bytes);
  assert.equal(inspectDeployment(c).stage, 'successor');
});
test('missing, stale or different receipt cannot adopt and running runtime cannot be changed', t => {
  const c = fixture(t), valid = evidence(c);
  for (const invalid of [undefined, { ...valid, executed: false }, { ...valid, release: { ...valid.release, checksum: '0'.repeat(64) } }, { ...valid, release: { ...valid.release, status: 'NOT_INSTALLED' } }])
    assert.throws(() => adoptSource(c, 'successor', invalid));
  c.runtimeRunning = true; assert.throws(() => adoptSource(c, 'successor', valid), /Stop only/); c.runtimeRunning = false;
  assert.throws(() => adoptSource({ ...c }, 'successor', valid), /Only this harness/);
});
test('changed predecessor bytes refuse promotion without repairing hashes', t => {
  const c = fixture(t), valid = evidence(c), file = Object.keys(incrementalAcceptanceSource('predecessor').files)[0];
  fs.appendFileSync(path.join(c.moduleRoot, 'data', file), '\n// drift');
  assert.throws(() => adoptSource(c, 'successor', valid)); assert.equal(c.stage, 'predecessor');
});
test('explicit execution is required before providers or project creation', async () => {
  await assert.rejects(runIsolatedIncrementalAcceptance({ execute: false }), /Explicit isolated/);
});
test('offline cleanup refuses provider state and retains source on failed attempts', t => {
  const c = fixture(t), provider = path.join(c.root, 'mongo');
  fs.mkdirSync(provider);
  fs.writeFileSync(path.join(provider, 'retained-test-marker'), 'offline test');
  try {
    assert.throws(() => removeTestSource(c), /Retain provider state/);
    assert.equal(fs.readFileSync(path.join(provider, 'retained-test-marker'), 'utf8'), 'offline test');
    assert(fs.existsSync(path.join(c.root, 'selection.json')));
  } finally { fs.rmSync(provider, { recursive: true }); }
});
