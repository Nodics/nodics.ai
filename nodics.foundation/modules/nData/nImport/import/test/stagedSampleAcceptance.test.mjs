/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stagedSampleReleaseCodes, runStagedSampleAcceptance } from '../src/service/acceptance/defaultStagedSampleAcceptanceService.mjs';

const targetRole = 'RETAIL_STAGED';
const code = 'partner.shop:catalogue';
const release = { releaseCode: code, version: '2.3.0', dataType: 'sample', destinationRole: targetRole, status: 'NOT_INSTALLED' };
const profiles = { shop: { dataPackages: [{ code, dataType: 'sample', targetRuntimeRole: targetRole }] } };
const configuration = { environment: 'partnerLocal', topology: { groups: { backends: [
  { role: 'PLATFORM', server: 'identityRuntime', host: 'localhost', port: 1234 },
  { role: targetRole, server: 'authorRuntime', host: 'localhost', port: 1235 },
] } } };
const options = { profiles, configuration, targetRole, selectedModules: ['partner.shop', 'inactive.shop'],
  environment: { AXIS_ORIGIN: 'http://ui.invalid', NODICS_AUTH_TOKEN: 'employee', NODICS_ENTERPRISE_CODE: 'partner' }, log() {} };
const route = '/nodics/import/v0/sample';

function transport({ current = false, override = () => undefined } = {}) {
  const calls = [];
  let installed = current;
  return { calls, fetch: async (url, request) => {
    const pathname = new URL(url).pathname;
    calls.push({ pathname, ...request });
    const value = override(pathname, request, calls);
    if (value) return value;
    assert.equal(request.headers.Authorization, 'Bearer employee');
    assert.equal(request.headers['x-enterprise-code'], 'partner');
    assert.ok(request.signal instanceof AbortSignal);
    if (pathname.endsWith('/openapi')) return Response.json({ paths: {
      [route]: { get: {} }, [route + '/validate']: { post: {} }, [route + '/install']: { post: {} },
    } });
    if (pathname === route) return Response.json({ data: { releases: [{ ...release, status: installed ? 'CURRENT' : 'NOT_INSTALLED' }] } });
    const plan = JSON.parse(request.body);
    assert.deepEqual(plan, { dataType: 'sample', releaseCodes: [code], expectedReleases: { [code]: '2.3.0' } });
    if (pathname.endsWith('/validate')) return Response.json({ data: { releases: [release], validation: { validationOnly: true, importExecuted: false } } });
    assert.equal(pathname, route + '/install');
    installed = true;
    return Response.json({ data: { releases: [{ ...release, status: 'CURRENT' }] } });
  } };
}

test('independent project selection ignores inactive modules but rejects empty and Online selections', () => {
  assert.deepEqual(stagedSampleReleaseCodes(profiles, options.selectedModules, targetRole), [code]);
  assert.throws(() => stagedSampleReleaseCodes(profiles, [], targetRole), /explicitly/);
  assert.throws(() => stagedSampleReleaseCodes(profiles, ['missing'], targetRole), /No sample releases/);
  assert.throws(() => stagedSampleReleaseCodes(profiles, options.selectedModules, 'RETAIL_ONLINE'), /Staged runtime role/);
});

test('default mode proves preflight-only without installation and ignores historical mutation environment flags', async () => {
  const mock = transport();
  const evidence = await runStagedSampleAcceptance({ ...options, environment: { ...options.environment,
    NODICS_STOREFRONT_COMMERCE_DATA_EXECUTE: 'true' }, fetch: mock.fetch });
  assert.equal(evidence.mode, 'VALIDATION_ONLY');
  assert.equal(mock.calls.length, 3);
  assert.equal(mock.calls.some(call => call.pathname.endsWith('/install')), false);
});

test('explicit install proves final CURRENT version; current releases are not replayed', async () => {
  for (const current of [false, true]) {
    const mock = transport({ current });
    const evidence = await runStagedSampleAcceptance({ ...options, executeInstall: true, fetch: mock.fetch });
    assert.equal(evidence.mode, 'INSTALL_VERIFIED');
    assert.equal(mock.calls.filter(call => call.pathname.endsWith('/install')).length, current ? 0 : 1);
    assert.equal(mock.calls.at(-1).pathname, route);
  }
});

test('missing, ambiguous, versionless and wrong-destination releases fail before installation', async () => {
  for (const list of [[], [release, release], [{ ...release, version: undefined }],
    [{ ...release, dataType: 'core' }], [{ ...release, destinationRole: 'RETAIL_ONLINE' }]]) {
    const mock = transport({ override: pathname => pathname === route ? Response.json({ data: list }) : undefined });
    await assert.rejects(runStagedSampleAcceptance({ ...options, executeInstall: true, fetch: mock.fetch }));
    assert.equal(mock.calls.some(call => call.pathname.endsWith('/install')), false);
  }
});

test('preflight mutation claims, missing routes and version changes fail closed', async () => {
  for (const override of [
    pathname => pathname.endsWith('/openapi') ? Response.json({ paths: {} }) : undefined,
    pathname => pathname.endsWith('/validate') ? Response.json({ data: { releases: [release], validation: { validationOnly: true, importExecuted: true } } }) : undefined,
    pathname => pathname.endsWith('/validate') ? Response.json({ data: { releases: [{ ...release, version: '9.0.0' }], validation: { validationOnly: true, importExecuted: false } } }) : undefined,
  ]) {
    const mock = transport({ override });
    await assert.rejects(runStagedSampleAcceptance({ ...options, executeInstall: true, fetch: mock.fetch }));
    assert.equal(mock.calls.some(call => call.pathname.endsWith('/install')), false);
  }
});

test('install denial or immutable-release error is never swallowed; false success fails final catalogue evidence', async () => {
  for (const response of [Response.json({ message: 'ERR_IMP_00003' }, { status: 409 }),
    Response.json({ message: 'denied' }, { status: 403 }), Response.json({ success: true })]) {
    const mock = transport({ override: pathname => pathname.endsWith('/install') ? response : undefined });
    await assert.rejects(runStagedSampleAcceptance({ ...options, executeInstall: true, fetch: mock.fetch }));
  }
});

test('help is inert and invalid selection fails before network access', async () => {
  let calls = 0;
  await assert.rejects(runStagedSampleAcceptance({ ...options, selectedModules: [], fetch: async () => { calls++; } }));
  assert.equal(calls, 0);
  const source = fileURLToPath(new URL('../src/service/acceptance/defaultStagedSampleAcceptanceService.mjs', import.meta.url));
  assert.match(execFileSync(process.execPath, [source, '--help'], { encoding: 'utf8' }), /Preflight by default/);
});
