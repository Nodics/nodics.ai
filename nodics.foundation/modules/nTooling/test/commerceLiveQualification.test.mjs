/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nTooling/test/commerceLiveQualification @description Independent deployment and failure-stop evidence for canonical Commerce composition. @owner nTooling @layer test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { commerceQualificationPlan, runCommerceLiveQualification } from '../src/service/project/defaultCommerceLiveQualificationService.mjs';
import { createAcceptanceContext } from '../src/service/project/defaultProjectAcceptanceService.mjs';

const roles = ['PLATFORM', 'WCMS_STAGED', 'WCMS_ONLINE', 'PROCESS', 'ENGAGEMENT', 'COMMERCE_STAGED', 'COMMERCE'];
const configuration = { topology: { groups: { backends: roles.map((role, index) => ({ role, server: 'partner-' + index, port: 12000 + index, host: 'localhost' })) } } };
const selection = { releaseModules: ['partner.catalogue'] };
test('no mutation without explicit execution and approval', async () => {
  for (const flags of [{}, { execute: true }, { approvePublications: true }])
    await assert.rejects(runCommerceLiveQualification({ ...flags, configuration, selection }), /Explicit/);
});
test('release fixtures cannot replace canonical gates or inject command arguments', () => {
  assert.throws(() => commerceQualificationPlan({ releaseModules: ['--skip'] }), /releaseModules/);
  assert.throws(() => commerceQualificationPlan(), /releaseModules/);
  assert.deepEqual(commerceQualificationPlan(selection).map(step => step[0]), [
    'acceptance:staged-sample-data', 'acceptance:commerce-publication', 'acceptance:commerce-journey',
  ]);
});
test('independent topology includes Staged Commerce and propagates exact failure', async () => {
  const calls = [], urls = [];
  const options = { configuration, selection, execute: true, approvePublications: true, projectRoot: '/partner', environment: {},
    fetch: async (url, options) => { urls.push(String(url)); assert(options.signal); return new Response('{}'); },
    run: async (command, args, options) => { calls.push(args); assert.equal(options.cwd, '/partner'); assert(options.timeout > 0); return {}; },
  };
  assert.equal((await runCommerceLiveQualification(options)).status, 'PASSED');
  assert.equal(urls.length, 7);
  assert(urls.some(url => url.includes(':12005/')));
  assert.equal(calls.length, 3);
  assert(calls[0][0].endsWith('/nTooling/bin/nodics-tool.js'));
  let invoked = 0;
  const denied = new Error('publication denied');
  await assert.rejects(runCommerceLiveQualification({ ...options, run: async () => { if (++invoked === 2) throw denied; } }), error => error === denied);
  assert.equal(invoked, 2);
});
test('unready owner prevents every command and does not start a runtime', async () => {
  let commands = 0;
  await assert.rejects(runCommerceLiveQualification({ configuration, selection, execute: true, approvePublications: true,
    fetch: async () => new Response('{}', { status: 503 }), run: async () => { commands++; },
  }), /not ready/);
  assert.equal(commands, 0);
});
test('shared API context is inert, role-based, bounded and preserves false/zero responses', async () => {
  const calls = [];
  const context = await createAcceptanceContext({ configuration, environment: { NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid', NODICS_AUTH_TOKEN: 'test-token' },
    fetch: async (url, options) => { calls.push({ url, options }); return new Response('{"data":false}'); },
  });
  assert.equal(calls.length, 0);
  assert.deepEqual(await context.authenticate(), { Authorization: 'Bearer test-token' });
  assert.equal(await context.request('COMMERCE', '/probe', { headers: { 'x-enterprise-code': 'partner' } }), false);
  assert.equal(calls[0].url.port, '12006');
  assert.equal(calls[0].options.headers['x-enterprise-code'], 'partner');
  assert.equal(calls[0].options.headers.Origin, 'https://partner.invalid');
  assert(calls[0].options.signal);
  const denied = await createAcceptanceContext({ configuration, environment: { NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid' },
    fetch: async () => new Response('{"error":"denied"}', { status: 403 }),
  });
  await assert.rejects(denied.request('PLATFORM', '/denied'), /403/);
});
