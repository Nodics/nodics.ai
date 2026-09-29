/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mediaSeedAssets, runMediaSeedAcceptance } from '../src/service/acceptance/defaultMediaSeedAcceptanceService.mjs';

function fixture(t, entries = [{ mediaCode: 'partner-banner', fileName: 'banner.svg', ownerReference: 'partner-page' }]) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'media-seed-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'assets/files'), { recursive: true });
  fs.writeFileSync(path.join(root, 'assets/files/banner.svg'), '<svg/>');
  fs.writeFileSync(path.join(root, 'assets/manifest.cjs'), 'module.exports = ' + JSON.stringify(entries));
  const step = { type: 'MEDIA_ASSET_MANIFEST', manifestModule: 'partner.web', manifestPath: 'assets/manifest.cjs',
    targetRuntimeRole: 'WCMS_STAGED', businessPurpose: 'PARTNER_CONTENT' };
  return { root, step, profiles: { partner: { dataPackages: [step] } },
    modules: [{ name: 'partner.web', path: root }], selectedModules: ['partner.web', 'inactive.web'] };
}

const configuration = { environment: 'partnerLocal', topology: { groups: { backends: [
  { role: 'PLATFORM', server: 'identityRuntime', host: 'localhost', port: 1234 },
  { role: 'WCMS_STAGED', server: 'authorRuntime', host: 'localhost', port: 1235 },
] } } };
const environment = { NODICS_AUTH_TOKEN: 'employee-fixture', AXIS_ORIGIN: 'http://ui.invalid', NODICS_ENTERPRISE_CODE: 'partner' };
const checksum = crypto.createHash('sha256').update('<svg/>').digest('hex');

test('independent partner manifests resolve without project-specific names and deduplicate identical assets', t => {
  const input = fixture(t);
  input.profiles.another = { dataPackages: [input.step] };
  const assets = mediaSeedAssets(input);
  assert.equal(assets.length, 1);
  assert.equal(assets[0].businessPurpose, 'PARTNER_CONTENT');
  assert.equal(assets[0].checksum, checksum);
});

test('empty selection, unavailable owner, Online target and conflicting codes fail preflight', t => {
  const input = fixture(t);
  assert.throws(() => mediaSeedAssets({ ...input, selectedModules: [] }), /explicitly/);
  assert.throws(() => mediaSeedAssets({ ...input, selectedModules: ['absent.web'] }), /No media manifests/);
  assert.throws(() => mediaSeedAssets({ ...input, modules: [] }), /one manifest owner/);
  assert.throws(() => mediaSeedAssets({ ...input, modules: [...input.modules, ...input.modules] }), /one manifest owner/);
  input.step.targetRuntimeRole = 'WCMS_ONLINE';
  assert.throws(() => mediaSeedAssets(input), /WCMS_STAGED/);
  const conflict = fixture(t, [{ mediaCode: 'same', fileName: 'banner.svg', name: 'first' },
    { mediaCode: 'same', fileName: 'banner.svg', name: 'second' }]);
  assert.throws(() => mediaSeedAssets(conflict), /Conflicting media code/);
});

test('traversal and symlink escapes are rejected for manifests, files roots and assets', t => {
  const input = fixture(t);
  input.step.manifestPath = '../outside.cjs';
  assert.throws(() => mediaSeedAssets(input), /module-relative/);
  input.step.manifestPath = '/outside.cjs';
  assert.throws(() => mediaSeedAssets(input), /module-relative/);
  const outside = fixture(t);
  const escape = fixture(t, [{ mediaCode: 'escape', fileName: 'external.svg' }]);
  fs.symlinkSync(path.join(outside.root, 'assets/files/banner.svg'), path.join(escape.root, 'assets/files/external.svg'));
  assert.throws(() => mediaSeedAssets(escape), /escapes its owner/);
  const files = fixture(t);
  fs.rmSync(path.join(files.root, 'assets/files'), { recursive: true });
  fs.symlinkSync(path.join(outside.root, 'assets/files'), path.join(files.root, 'assets/files'));
  assert.throws(() => mediaSeedAssets(files), /escapes its owner/);
  const manifest = fixture(t);
  fs.symlinkSync(path.join(outside.root, 'assets/manifest.cjs'), path.join(manifest.root, 'external.cjs'));
  manifest.step.manifestPath = 'external.cjs';
  assert.throws(() => mediaSeedAssets(manifest), /escapes its owner/);
});

test('Staged upload proves content integrity and preserves employee and application context', async t => {
  const input = fixture(t);
  let requests = 0;
  const evidence = await runMediaSeedAcceptance({ ...input, configuration, environment, execute: true, log() {},
    fetch: async (url, options) => {
      requests++;
      assert.equal(String(url), 'http://localhost:1235/nodics/media/v0/storage/upload');
      assert.equal(options.headers.Authorization, 'Bearer employee-fixture');
      assert.equal(options.headers['x-enterprise-code'], 'partner');
      assert.equal(options.body.get('businessPurpose'), 'PARTNER_CONTENT');
      assert.equal(options.body.get('ownerReference'), 'partner-page');
      assert.equal(await options.body.get('file').text(), '<svg/>');
      assert.ok(options.signal instanceof AbortSignal);
      return Response.json({ data: { code: 'partner-banner', checksum, checksumAlgorithm: 'sha256' } });
    },
  });
  assert.equal(requests, 1);
  assert.deepEqual(evidence, { uploaded: 1, destination: 'WCMS_STAGED', publication: 'NOT_REQUESTED' });
});

test('denials, duplicate messages, malformed responses and wrong integrity never pass', async t => {
  for (const response of [new Response('duplicate already exists E11000', { status: 409 }),
    new Response('denied', { status: 403 }), new Response('not-json'),
    Response.json({ data: { code: 'partner-banner', checksum: 'wrong', checksumAlgorithm: 'sha256' } }),
    Response.json({ data: { code: 'wrong', checksum, checksumAlgorithm: 'sha256' } })]) {
    await assert.rejects(runMediaSeedAcceptance({ ...fixture(t), configuration, environment,
      execute: true, log() {}, fetch: async () => response }));
  }
});

test('missing employee tokens stop before upload and successful login retains scoped headers', async t => {
  const input = { ...fixture(t), configuration, execute: true, log() {},
    environment: { AXIS_ORIGIN: 'http://ui.invalid', AXIS_LOGIN_ID: 'partner', AXIS_PASSWORD: 'fixture-only' } };
  const routes = [];
  await assert.rejects(runMediaSeedAcceptance({ ...input, fetch: async url => {
    routes.push(String(url));
    return Response.json({ data: {} });
  } }), /returned no employee auth token/);
  assert.equal(routes.length, 2);
  assert.ok(routes.every(url => url.startsWith('http://localhost:1234/nodics/profile/')));
  let calls = 0;
  await runMediaSeedAcceptance({ ...input, fetch: async (url, options) => {
    calls++;
    if (calls === 1) {
      assert.deepEqual(JSON.parse(options.body), { loginId: 'partner', password: 'fixture-only' });
      return Response.json({ data: { authToken: 'issued-employee' } });
    }
    assert.equal(options.headers.Authorization, 'Bearer issued-employee');
    return Response.json({ data: { code: 'partner-banner', checksum, checksumAlgorithm: 'sha256' } });
  } });
  assert.equal(calls, 2);
});

test('execution opt-in and complete local preflight precede network access; help is inert', async t => {
  let calls = 0;
  const input = { ...fixture(t), configuration, environment, fetch: async () => { calls++; } };
  await assert.rejects(runMediaSeedAcceptance(input), /--execute/);
  await assert.rejects(runMediaSeedAcceptance({ ...input, execute: true, selectedModules: ['absent'] }), /No media manifests/);
  assert.equal(calls, 0);
  const source = fileURLToPath(new URL('../src/service/acceptance/defaultMediaSeedAcceptanceService.mjs', import.meta.url));
  assert.match(execFileSync(process.execPath, [source, '--help'], { encoding: 'utf8' }), /Staged uploads only/);
});
