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
import { runEditorialLiveJourneyAcceptance as run } from '../src/service/acceptance/defaultEditorialLiveJourneyAcceptanceService.mjs';

function fixture(t, change = (_route, body) => body, deny = '') {
  t.mock.method(console, 'log', () => {});
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'editorial-acceptance-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const runtime = path.join(root, 'envs/partnerLocal/workflow');
  fs.mkdirSync(runtime, { recursive: true });
  const graph = { nodes: [{ code: 'review', type: 'HUMAN_TASK' }] };
  fs.writeFileSync(path.join(runtime, 'contribution.cjs'), 'module.exports = ' + JSON.stringify({ definitions: [{ code: 'partner-review', graph }] }));
  fs.writeFileSync(path.join(runtime, 'manifest.cjs'), 'module.exports = ' + JSON.stringify({ sections: { process: { version: '1.0' } } }));
  const calls = [];
  let article, localization, withdrawn = false;
  const options = {
    projectRoot: root, execute: true, approvePublications: true,
    environment: { NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid', AXIS_PASSWORD: 'fixture-only' },
    configuration: { environment: 'partnerLocal', topology: { groups: { backends:
      ['PLATFORM', 'WCMS_STAGED', 'WCMS_ONLINE', 'PROCESS'].map((role, index) => ({
        role, server: role === 'PROCESS' ? 'workflow' : role.toLowerCase(), host: 'runtime.invalid', port: 1200 + index,
      })) } } },
    acceptance: { siteCode: 'partner.site', contributionCode: 'partner-process',
      contributionPath: 'contribution.cjs', manifestPath: 'manifest.cjs', contributionSection: 'process' },
    fetch: async (url, request = {}) => {
      const parsed = new URL(url);
      const route = parsed.pathname;
      calls.push({ route, request, port: parsed.port });
      if (route === deny) return Response.json({ message: 'denied' }, { status: 403 });
      let body = {};
      if (route.endsWith('/health/ready')) return Response.json({});
      if (route.endsWith('/authenticate')) body = { authToken: 'editorial-fixture' };
      else {
        assert.equal(request.headers.Authorization, 'Bearer editorial-fixture');
        if (route.endsWith('/definitions/partner-review')) body = { status: 'PUBLISHED', contributionCode: 'partner-process',
          contributionVersion: '1.0', currentVersion: 1, contributionChecksum: 'fixture-checksum', graph };
        else if (route.endsWith('/versions')) body = [{ version: 1, contributionChecksum: 'fixture-checksum', graph }];
        else if (request.method === 'PUT') {
          body = JSON.parse(request.body);
          if (route.endsWith('/editorialarticle')) article = body;
          if (route.endsWith('/editorialarticlelocalization')) localization = body;
        } else if (route.endsWith('/validate')) body = { valid: true, article: { ...article, status: 'READY' } };
        else if (route.endsWith('/submit')) {
          assert.equal(JSON.parse(request.body).article.status, 'READY');
          body = { workflowInstanceCode: 'partner-instance' };
        } else if (route.endsWith('/tasks')) {
          assert.equal(parsed.searchParams.get('instanceCode'), 'partner-instance');
          body = { items: [{ code: 'unrelated', instanceCode: 'other', status: 'OPEN' },
            { code: 'partner-task', instanceCode: 'partner-instance', status: 'OPEN' }] };
        } else if (route.endsWith('/partner-task/claim')) body = {};
        else if (route.endsWith('/partner-task/complete')) {
          assert.deepEqual(JSON.parse(request.body), { decision: { approved: true, action: 'APPROVE' } });
          body = { instance: { status: 'COMPLETED' } };
        } else if (route.includes('/editorialarticle/code/')) body = { ...article, status: 'APPROVED' };
        else if (route.endsWith('/publish')) {
          assert.equal(JSON.parse(request.body).article.workflowInstanceCode, 'partner-instance');
          body = { state: 'ONLINE', code: `editorial-${article.code}-r1`, revision: 1 };
        } else if (route.endsWith('/withdraw')) {
          assert.deepEqual(JSON.parse(request.body), { publicationCode: `editorial-${article.code}-r1`, expectedRevision: 1 });
          withdrawn = true;
          body = { state: 'WITHDRAWN' };
        } else if (route.includes('/delivery/')) {
          assert.equal(parsed.port, '1202');
          assert.equal(parsed.searchParams.get('siteCode'), 'partner.site');
          if (route.endsWith('/articles')) body = { items: [{ articleCode: article.code, slug: article.slug }] };
          else if (route.endsWith('/structured')) body = { items: [{ article: { articleCode: article.code }, structuredData: { '@type': 'BlogPosting' } }] };
          else if (route.endsWith('/rss')) body = [{ title: localization.title }];
          else if (route.endsWith('/sitemap')) body = [{ loc: article.slug }];
          else if (withdrawn) return new Response('', { status: change('withdrawn-status', 404) });
          else body = { articleCode: article.code, title: localization.title };
        } else assert.fail('Unexpected request ' + route);
      }
      return Response.json({ result: change(route, body) });
    },
  };
  return { root, runtime, options, calls };
}

test('both mutation flags require literal true before any I/O', async () => {
  for (const execute of [false, undefined, 'true', 1, true]) {
    for (const approvePublications of [false, undefined, 'true', 1, true]) {
      if (execute === true && approvePublications === true) continue;
      await assert.rejects(run({ execute, approvePublications, fetch: () => assert.fail('network') }), /--execute --approve-publications/);
    }
  }
});

test('independent fixture exercises all authoring, Process, publishing and Online projections', async t => {
  const f = fixture(t);
  await run(f.options);
  assert.equal(f.calls.filter(c => c.request.method === 'PUT').length, 4);
  assert.equal(f.calls.filter(c => c.route.endsWith('/claim')).length, 1);
  assert.equal(f.calls.filter(c => c.route.endsWith('/complete')).length, 1);
  assert.equal(f.calls.filter(c => c.route.endsWith('/withdraw')).length, 1);
  assert.equal(f.calls.length, 25);
  assert.ok(f.calls.every(c => !c.route.includes('permissions')));
});

test('each provenance and journey assertion rejects incorrect success evidence', async t => {
  const cases = [
    ['/definitions/partner-review', body => ({ ...body, status: 'DRAFT' })],
    ['/definitions/partner-review', body => ({ ...body, contributionCode: 'foreign' })],
    ['/definitions/partner-review', body => ({ ...body, contributionVersion: 'stale' })],
    ['/definitions/partner-review', body => ({ ...body, graph: {} })],
    ['/definitions/partner-review', body => ({ ...body, currentVersion: undefined, contributionChecksum: undefined })],
    ['/definitions/partner-review', body => ({ ...body, currentVersion: undefined })],
    ['/definitions/partner-review', body => ({ ...body, contributionChecksum: undefined })],
    ['/versions', () => []],
    ['/versions', body => [{ ...body[0], contributionChecksum: 'wrong' }]],
    ['/versions', body => [{ ...body[0], graph: {} }]],
    ['/versions', body => [{ ...body[0], version: 2 }]],
    ['/authenticate', () => ({})],
    ['/validate', () => ({ valid: false })],
    ['/validate', () => ({ valid: true, article: { status: 'DRAFT' } })],
    ['/submit', () => ({})],
    ['/tasks', () => [{ code: 'foreign', instanceCode: 'other', status: 'OPEN' }]],
    ['/complete', () => ({ instance: { status: 'WAITING' } })],
    ['/editorialarticle/code/', body => ({ ...body, status: 'READY' }), true],
    ['/editorialarticle/code/', body => ({ ...body, code: 'foreign' }), true],
    ['/publish', () => ({ state: 'PENDING' })],
    ['/publish', body => ({ ...body, code: 'foreign' })],
    ['/publish', body => ({ ...body, revision: undefined })],
    ['/publish', body => ({ ...body, revision: '1' })],
    ['/delivery/articles', () => ({ items: [] })],
    ['/delivery/articles/editorial-live-', () => ({ articleCode: 'wrong' }), true],
    ['/structured', () => ({ items: [] })],
    ['/rss', () => []],
    ['/sitemap', () => []],
    ['/withdraw', () => ({ state: 'ONLINE' })],
    ['withdrawn-status', () => 403],
    ['withdrawn-status', () => 500],
    ['withdrawn-status', () => 200],
  ];
  for (const [suffix, mutate, contains] of cases) {
    const f = fixture(t, (route, body) => (contains ? route.includes(suffix) : route.endsWith(suffix)) ? mutate(body) : body);
    await assert.rejects(run(f.options), undefined, suffix);
  }
});

test('denial at every API stage stops the journey with no repair writes or retries', async t => {
  const success = fixture(t);
  await run(success.options);
  // Dynamic article routes are matched from a successful fixture by their stable suffix.
  for (let index = 0; index < success.calls.length - 1; index++) {
    const f = fixture(t);
    const fetch = f.options.fetch;
    let calls = 0;
    f.options.fetch = async (...args) => {
      calls++;
      if (calls === index + 1) return Response.json({ message: 'denied' }, { status: 403 });
      return fetch(...args);
    };
    await assert.rejects(run(f.options), /HTTP 403/);
    assert.equal(calls, index + 1);
  }
});

test('runtime-relative fixtures reject traversal, symlink escapes and absent provenance before authoring', async t => {
  for (const relative of ['../escape.cjs', '/absolute.cjs']) {
    const f = fixture(t);
    f.options.acceptance.contributionPath = relative;
    await assert.rejects(run(f.options), /runtime-relative/);
    assert.ok(!f.calls.some(c => c.request.method === 'PUT'));
  }
  const f = fixture(t);
  const outside = path.join(f.root, 'outside.cjs');
  fs.writeFileSync(outside, 'module.exports = {}');
  fs.symlinkSync(outside, path.join(f.runtime, 'escape.cjs'));
  f.options.acceptance.contributionPath = 'escape.cjs';
  await assert.rejects(run(f.options), /escapes its runtime/);
  const missing = fixture(t);
  missing.options.acceptance.contributionSection = 'absent';
  await assert.rejects(run(missing.options), /provenance/);
  assert.ok(!missing.calls.some(c => c.request.method === 'PUT'));
});
