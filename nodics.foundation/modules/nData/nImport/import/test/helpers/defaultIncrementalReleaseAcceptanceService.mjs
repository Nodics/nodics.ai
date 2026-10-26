/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module import/acceptance/defaultIncrementalReleaseAcceptanceService @description Explicit owner-port acceptance for immutable upgrade, conflict and partial retry. @layer tooling @owner import */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';

export const incrementalAcceptance = Object.freeze({
  moduleName: 'importAcceptanceFixture',
  releaseCode: 'importAcceptanceFixture:incrementalAcceptance', sectionCode: 'incrementalAcceptance',
  predecessor: '1.0.0', successor: '1.0.1', dataType: 'sample', destinationRole: 'PLATFORM',
  codes: ['nodicsImportAcceptanceFirst', 'nodicsImportAcceptanceEdited'],
  initial: 'Governed acceptance predecessor', changed: 'Governed acceptance successor',
  businessEdit: 'Operator edit retained until explicit conflict resolution',
});
const spec = incrementalAcceptance;
const digest = value => createHash('sha256').update(value).digest('hex');

/** Binds existing HTTP owners; request supplies the caller's authenticated transport and rejects HTTP errors. */
export function incrementalAcceptanceApiClient(request) {
  assert.equal(typeof request, 'function');
  const root = '/nodics/import/v0';
  return {
    catalogue: async () => (await request(root + '/sample')).data,
    readRecords: async codes => {
      assert.deepEqual(codes, spec.codes);
      const rows = [];
      for (const code of codes) {
        const response = await request(root + '/importdefinition/code/' + encodeURIComponent(code));
        assert(Array.isArray(response.result), 'Owner record response required');
        rows.push(...response.result);
      }
      return rows;
    },
    updateDescription: async (row, description) => {
      assert(spec.codes.includes(row.code) && row.enabled === false, 'Only disabled acceptance definitions may be edited');
      const response = await request(root + '/importdefinition', { method: 'PATCH', body: {
        query: { code: row.code, enabled: false, description: row.description },
        model: { description }, options: { recursive: false, returnModified: true },
      } });
      assert.equal(response.result?.matchedCount, 1, 'Conditional owner update must match exactly one record');
      assert.equal(response.result?.models?.length, 1, 'Owner update must return the changed record');
      assert.equal(response.result.models[0]._id, row._id, 'Owner update changed identity');
      return response;
    },
    validate: async plan => (await request(root + '/sample/validate', { method: 'POST', body: plan })).data,
    install: async plan => (await request(root + '/sample/install', { method: 'POST', body: plan })).data,
    history: async releaseCode => {
      assert.equal(releaseCode, spec.releaseCode);
      const rows = [];
      for (let skip = 0; skip < 2000; skip += 100) {
        const response = await request(root + '/run/history?dataType=sample&moduleName=' + spec.moduleName + '&limit=100&skip=' + skip);
        assert(Array.isArray(response.data), 'Owner run history required');
        rows.push(...response.data.filter(run => run.dataReleases?.some(item => item.releaseCode === releaseCode)));
        if (response.data.length < 100) return rows;
      }
      throw new Error('Bounded owner history exhausted; narrow the owner query before continuing');
    },
  };
}

/** Reads test-owned release bytes for an isolated module discovered by the canonical release owner. */
export function incrementalAcceptanceSource(stage) {
  assert(['predecessor', 'successor'].includes(stage), 'Unknown acceptance source stage');
  const root = new URL('../fixtures/incrementalAcceptance/data/', import.meta.url);
  const manifest = JSON.parse(fs.readFileSync(new URL('manifest.json', root), 'utf8'));
  const predecessor = manifest.retainedRoots['sample-v901'].sections[spec.sectionCode];
  const section = stage === 'predecessor' ? predecessor : manifest.sections[spec.sectionCode];
  const hashes = stage === 'predecessor' ? predecessor.files : { ...predecessor.files, ...section.files };
  const files = Object.fromEntries(Object.entries(hashes).map(([name, checksum]) => {
    const bytes = fs.readFileSync(new URL(name, root), 'utf8');
    assert.equal(digest(bytes), checksum, 'Test fixture checksum drift: ' + name);
    return [name, bytes];
  }));
  return { files, section, retainedRoots: stage === 'predecessor' ? {} : manifest.retainedRoots };
}

function records(rows) {
  assert(Array.isArray(rows), 'Owner record evidence must be an array');
  assert.equal(rows.length, 2, 'Require exactly two fixture records');
  return spec.codes.map(code => {
    const matches = rows.filter(row => row.code === code);
    assert.equal(matches.length, 1, 'Missing or duplicate fixture record');
    const row = matches[0];
    assert(row._id, 'Owner record identity is required');
    assert.equal(row.enabled, false, 'Acceptance definition must stay disabled');
    assert.equal(row.moduleName, 'import');
    assert.equal(row.schemaName, 'importDefinition');
    return row;
  });
}

/** Clients bind these ports to authenticated Nodics APIs or loader-visible owner services, never database drivers.
 * No authentication, deployment, grants, reset, automatic retry or source promotion is performed here.
 * Each invocation performs at most one explicit mutation; inspection is the default.
 */
export async function runIncrementalReleaseAcceptance({ client, phase = 'inspect', execute = false, prior } = {}) {
  assert(client && typeof client.catalogue === 'function' && typeof client.readRecords === 'function', 'Owner client required');
  const catalogue = await client.catalogue(spec.dataType);
  const matches = catalogue.filter(row => row.releaseCode === spec.releaseCode);
  assert.equal(matches.length, 1, 'Exact adopted acceptance release required');
  const release = matches[0];
  assert.equal(release.destinationRole, spec.destinationRole);
  assert.equal(release.dataType, spec.dataType);
  assert(/^[a-f0-9]{64}$/.test(release.checksum), 'Immutable checksum required');
  const before = await client.readRecords(spec.codes);
  const evidence = { phase, release, before, executed: false };
  if (phase === 'inspect') return evidence;
  assert.equal(execute, true, 'Explicit acceptance execution required');
  assert(['install-predecessor', 'edit', 'attempt-successor', 'resolve-conflict', 'retry-successor', 'verify-current'].includes(phase));
  const expectedVersion = ['install-predecessor', 'edit'].includes(phase) ? spec.predecessor : spec.successor;
  assert.equal(release.version, expectedVersion, 'Adopt the reviewed source version first');
  if (phase === 'install-predecessor') {
    assert.equal(release.status, 'NOT_INSTALLED'); assert.equal(before.length, 0, 'Never overwrite existing fixture rows');
  } else records(before);
  if (phase === 'edit' || phase === 'resolve-conflict') {
    const row = records(before)[1];
    assert.equal(row.description, phase === 'edit' ? spec.initial : spec.businessEdit);
    if (phase === 'edit') assert.equal(release.status, 'CURRENT');
    else {
      assert.equal(release.status, 'FAILED');
      assert(prior?.phase === 'attempt-successor' && prior.conflictPreserved === true, 'Retain failed-attempt proof before resolution');
      assert.equal(prior.release.checksum, release.checksum, 'Resolution must address the proven failed source');
      assert.deepEqual(records(before), prior.after, 'Owner records changed after the failed-attempt evidence');
    }
    evidence.result = await client.updateDescription(row, phase === 'edit' ? spec.businessEdit : spec.initial);
    evidence.after = records(await client.readRecords(spec.codes));
    assert.equal(evidence.after[1].description, phase === 'edit' ? spec.businessEdit : spec.initial);
  } else {
    if (phase === 'attempt-successor') {
      assert.equal(release.status, 'UPDATE_AVAILABLE'); assert.equal(release.installedVersion, spec.predecessor);
      assert.equal(records(before)[1].description, spec.businessEdit);
    }
    if (phase === 'retry-successor') {
      assert.equal(release.status, 'FAILED');
      assert.equal(prior?.phase, 'resolve-conflict');
      assert.equal(prior.release.checksum, release.checksum, 'Retry must use unchanged source');
      assert.deepEqual(records(before), prior.after, 'Owner records changed after explicit resolution');
    }
    if (phase === 'verify-current') {
      assert.equal(release.status, 'CURRENT');
      evidence.beforeHistory = await client.history(spec.releaseCode);
    }
    const plan = { dataType: spec.dataType, releaseCodes: [spec.releaseCode], expectedReleases: { [spec.releaseCode]: release.version } };
    evidence.plan = plan;
    evidence.preflight = await client.validate(plan);
    assert.equal(evidence.preflight?.validation?.ready, true, 'Owner preflight must authorize the selected plan');
    assert.equal(evidence.preflight.validation.importExecuted, false, 'Preflight must remain read-only');
    if (phase === 'verify-current') assert.equal(evidence.preflight.validation.skipped, true, 'CURRENT preflight must skip execution');
    try { evidence.result = await client.install(plan); }
    catch (error) {
      if (phase === 'verify-current') {
        if (error.code !== 'ERR_IMP_00003') throw error;
        evidence.replayRejected = true;
      } else if (phase !== 'attempt-successor') throw error;
      evidence.failureCode = typeof error.code === 'string' ? error.code : 'UNCLASSIFIED';
    }
    if (phase === 'verify-current') assert.equal(evidence.replayRejected, true, 'CURRENT installation must reject duplicate execution');
    evidence.after = records(await client.readRecords(spec.codes));
    const fresh = (await client.catalogue(spec.dataType)).filter(row => row.releaseCode === spec.releaseCode);
    assert.equal(fresh.length, 1); evidence.afterRelease = fresh[0];
    assert.equal(fresh[0].version, release.version, 'Source version changed during acceptance');
    assert.equal(fresh[0].checksum, release.checksum, 'Source changed during acceptance');
    if (phase === 'attempt-successor') {
      assert.equal(fresh[0].status, 'FAILED');
      assert.equal(evidence.after[0].description, spec.changed, 'Require actual partial success');
      assert.equal(evidence.after[1].description, spec.businessEdit, 'Conflict must preserve the operator edit');
      evidence.conflictPreserved = true;
    } else {
      assert.equal(fresh[0].status, 'CURRENT');
      assert(evidence.after.every(row => row.description === (phase === 'install-predecessor' ? spec.initial : spec.changed)));
    }
    assert.equal(typeof client.history, 'function', 'Owner history evidence required');
    evidence.history = await client.history(spec.releaseCode);
    assert(Array.isArray(evidence.history) && evidence.history.some(run => run.dataReleases?.some(item =>
      item.releaseCode === spec.releaseCode && item.version === release.version && item.checksum === release.checksum)), 'Exact owner run evidence required');
    if (phase === 'verify-current') {
      assert.deepEqual(evidence.after, records(before), 'Current replay changed fixture records');
      assert.deepEqual(evidence.history, evidence.beforeHistory, 'Current replay changed owner run history');
    }
  }
  evidence.executed = true;
  if (before.length) assert.deepEqual(evidence.after.map(row => row._id), records(before).map(row => row._id), 'Fixture identities changed');
  return evidence;
}
