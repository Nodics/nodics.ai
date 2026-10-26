/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module import/test/incrementalReleaseAcceptance @description Source qualification and isolated acceptance-coordinator sequencing; not live evidence. @layer test @owner import */
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { incrementalAcceptance as spec, incrementalAcceptanceSource, incrementalAcceptanceApiClient, runIncrementalReleaseAcceptance as run }
  from './helpers/defaultIncrementalReleaseAcceptanceService.mjs';
const require = createRequire(import.meta.url);

test('shipping Import catalogue does not discover isolated acceptance releases', () => {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const owner = require('../src/service/release/defaultDataReleaseService');
  require('./helpers/releaseExecution')({ modules: { import: { name: 'import', path: root, index: '1' } }, runtimeRole: 'PLATFORM' });
  assert(!owner.discoverReleases('sample').some(release => release.releaseCode === spec.releaseCode));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/manifest.json')));
  assert.equal(manifest.sections[spec.sectionCode], undefined);
  assert.equal(manifest.retainedRoots, undefined);
  for (const name of ['sample-v901', 'sample-v902']) assert.equal(fs.existsSync(path.join(root, 'data', name)), false);
});

test('API adapter reads only exact fixture codes and uses conditional owner updates', async () => {
  const calls = [];
  const client = incrementalAcceptanceApiClient(async (url, options) => {
    calls.push({ url, options });
    if (options?.method === 'PATCH') return { result: { matchedCount: 1, models: [{ _id: 'fixture' }] } };
    return { result: [], data: [] };
  });
  assert.deepEqual(await client.readRecords(spec.codes), []);
  assert(calls.every(call => call.url.startsWith('/nodics/import/v0/importdefinition/code/nodicsImportAcceptance')));
  await client.updateDescription({ _id: 'fixture', code: spec.codes[1], enabled: false, description: spec.initial }, spec.businessEdit);
  assert.equal(calls[2].options.method, 'PATCH');
  assert.deepEqual(calls[2].options.body.query, { code: spec.codes[1], enabled: false, description: spec.initial });
  await assert.rejects(client.updateDescription({ code: 'unrelated', enabled: false }, spec.changed));
  assert.deepEqual(await client.history(spec.releaseCode), []);
  assert(calls.at(-1).url.includes('/run/history?dataType=sample&moduleName=' + spec.moduleName));
});

test('fixture successor retains predecessor bytes, release identity and explicit Local scope', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-incremental-contract-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const owner = require('../src/service/release/defaultDataReleaseService');
  require('./helpers/releaseExecution')({ modules: { [spec.moduleName]: { name: spec.moduleName, path: root, index: '1' } }, runtimeRole: 'PLATFORM' });
  const before = incrementalAcceptanceSource('predecessor');
  const after = incrementalAcceptanceSource('successor');
  for (const [name, bytes] of Object.entries(before.files)) assert.equal(after.files[name], bytes);
  let predecessor;
  for (const fixture of [before, after]) {
    for (const [name, bytes] of Object.entries(fixture.files)) {
      const target = path.join(root, 'data', name);
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, bytes);
    }
    fs.writeFileSync(path.join(root, 'data/manifest.json'), JSON.stringify({ contractVersion: 2, module: spec.moduleName,
      sections: { [spec.sectionCode]: fixture.section }, retainedRoots: fixture.retainedRoots }));
    const releases = owner.discoverReleases('sample');
    assert.equal(releases.length, 1);
    const release = releases[0];
    assert.equal(release.invalidManifest, undefined);
    assert.equal(release.releaseCode, spec.releaseCode);
    assert.equal(release.selectionPolicy, 'EXPLICIT');
    assert.deepEqual(release.environmentScope, ['LOCAL']);
    assert.equal(release.destinationRole, 'PLATFORM');
    if (!predecessor) predecessor = release;
    else {
      assert.equal(release.version, spec.successor);
      assert.equal(owner.installationCode('default', predecessor), owner.installationCode('default', release));
      assert.equal(owner.toCatalogueItem(release, { version: predecessor.version, checksum: predecessor.checksum, status: 'CURRENT' }, false).status, 'UPDATE_AVAILABLE');
    }
  }
});

function fixture() {
  let release = { releaseCode: spec.releaseCode, dataType: spec.dataType, destinationRole: spec.destinationRole,
    status: 'NOT_INSTALLED', version: spec.predecessor, checksum: 'a'.repeat(64) };
  let rows = [], runs = [], writes = 0;
  const client = {
    catalogue: async () => [structuredClone(release)],
    readRecords: async codes => { assert.deepEqual(codes, spec.codes); return structuredClone(rows); },
    updateDescription: async (original, description) => {
      writes++; const row = rows.find(item => item._id === original._id);
      assert.equal(row.description, original.description); row.description = description; return structuredClone(row);
    },
    validate: async plan => { assert.deepEqual(plan.releaseCodes, [spec.releaseCode]); return { validation: { ready: true, importExecuted: false, skipped: release.status === 'CURRENT' } }; },
    install: async () => {
      if (release.status === 'CURRENT') throw Object.assign(new Error('Duplicate request'), { code: 'ERR_IMP_00003' });
      writes++;
      if (release.version === spec.predecessor) {
        rows = spec.codes.map((code, index) => ({ _id: 'fixture-' + index, code, enabled: false,
          moduleName: 'import', schemaName: 'importDefinition', description: spec.initial }));
        release.status = 'CURRENT'; release.installedVersion = spec.predecessor;
      } else {
        for (const row of rows) if ([spec.initial, spec.changed].includes(row.description)) row.description = spec.changed;
        release.status = rows.every(row => row.description === spec.changed) ? 'CURRENT' : 'FAILED';
        if (release.status === 'CURRENT') release.installedVersion = spec.successor;
      }
      runs.push({ runId: 'run-' + writes, status: release.status, dataReleases: [structuredClone(release)] });
      if (release.status === 'FAILED') throw Object.assign(new Error('Conditional update did not match'), { code: 'ERR_IMP_00001' });
      return { runId: runs.at(-1).runId };
    },
    history: async () => structuredClone(runs),
  };
  return { client, writes: () => writes, rows: () => rows, promote: () => {
    release = { ...release, status: 'UPDATE_AVAILABLE', version: spec.successor, checksum: 'b'.repeat(64) };
  } };
}

test('explicit sequence proves predecessor upgrade, edited-row conflict, partial effect and unchanged-source retry', async () => {
  const f = fixture();
  await run({ client: f.client }); assert.equal(f.writes(), 0);
  await assert.rejects(run({ client: f.client, phase: 'install-predecessor' }), /Explicit/);
  const execute = phase => run({ client: f.client, phase, execute: true });
  const first = await execute('install-predecessor');
  await execute('edit'); f.promote();
  const failed = await execute('attempt-successor');
  assert.equal(failed.conflictPreserved, true);
  assert.equal(failed.after[1].description, spec.businessEdit);
  assert.equal(failed.after[0]._id, first.after[0]._id);
  const resolved = await run({ client: f.client, phase: 'resolve-conflict', execute: true, prior: failed });
  const retried = await run({ client: f.client, phase: 'retry-successor', execute: true, prior: resolved });
  const writes = f.writes();
  const current = await execute('verify-current');
  assert.equal(current.replayRejected, true);
  assert.equal(current.failureCode, 'ERR_IMP_00003');
  assert.equal(f.writes(), writes);
  assert.deepEqual(current.after, retried.after);
  assert.equal(f.rows().length, 2);
  assert.equal(current.history.length, 3);
});

test('existing records, unadopted source and absent prior failure cannot authorize an overwrite', async () => {
  const f = fixture();
  await run({ client: f.client, phase: 'install-predecessor', execute: true });
  const writes = f.writes();
  await assert.rejects(run({ client: f.client, phase: 'install-predecessor', execute: true }));
  await assert.rejects(run({ client: f.client, phase: 'attempt-successor', execute: true }));
  assert.equal(f.writes(), writes);
});

test('blocked, missing or mutating preflight cannot invoke installation', async () => {
  for (const validation of [undefined, { ready: false, importExecuted: false }, { ready: true, importExecuted: true }]) {
    const f = fixture();
    f.client.validate = async () => ({ validation });
    await assert.rejects(run({ client: f.client, phase: 'install-predecessor', execute: true }));
    assert.equal(f.writes(), 0);
  }
});

async function currentFixture() {
  const f = fixture();
  await run({ client: f.client, phase: 'install-predecessor', execute: true });
  await run({ client: f.client, phase: 'edit', execute: true });
  f.promote();
  const failed = await run({ client: f.client, phase: 'attempt-successor', execute: true });
  const resolved = await run({ client: f.client, phase: 'resolve-conflict', execute: true, prior: failed });
  await run({ client: f.client, phase: 'retry-successor', execute: true, prior: resolved });
  return f;
}

test('current replay rejects changed owner records even with the expected rejection', async () => {
  const f = await currentFixture();
  f.client.install = async () => { f.rows()[0].active = false; throw Object.assign(new Error('Rejected'), { code: 'ERR_IMP_00003' }); };
  await assert.rejects(run({ client: f.client, phase: 'verify-current', execute: true }), /Current replay changed/);
});

test('current replay propagates unrelated errors and rejects successful installation responses', async () => {
  for (const code of ['ERR_AUTH_00001', 'ERR_IMP_00010', undefined]) {
    const f = await currentFixture();
    const error = Object.assign(new Error('Selected data releases are already current'), { code });
    f.client.install = async () => { throw error; };
    await assert.rejects(run({ client: f.client, phase: 'verify-current', execute: true }), actual => actual === error);
  }
  const f = await currentFixture();
  f.client.install = async () => ({ skipped: true });
  await assert.rejects(run({ client: f.client, phase: 'verify-current', execute: true }), /must reject duplicate/);
});

test('current replay requires skipped preflight before dispatch', async () => {
  const f = await currentFixture();
  f.client.validate = async () => ({ validation: { ready: true, importExecuted: false } });
  let dispatched = false;
  f.client.install = async () => { dispatched = true; };
  await assert.rejects(run({ client: f.client, phase: 'verify-current', execute: true }), /preflight must skip/);
  assert.equal(dispatched, false);
});

test('current replay rejects history or source drift after expected rejection', async () => {
  for (const drift of ['history', 'version', 'checksum', 'status']) {
    const f = await currentFixture();
    const install = f.client.install;
    const history = f.client.history;
    const catalogue = f.client.catalogue;
    let attempted = false;
    f.client.install = async plan => { attempted = true; return install(plan); };
    f.client.history = async () => {
      const rows = await history();
      if (attempted && drift === 'history') rows[0].status = 'CHANGED';
      return rows;
    };
    f.client.catalogue = async () => {
      const rows = await catalogue();
      if (attempted && drift !== 'history') rows[0][drift] = 'CHANGED';
      return rows;
    };
    await assert.rejects(run({ client: f.client, phase: 'verify-current', execute: true }), { code: 'ERR_ASSERTION' });
  }
});
