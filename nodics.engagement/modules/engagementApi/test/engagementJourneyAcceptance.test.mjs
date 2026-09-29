/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runEngagementJourneyAcceptance as run } from '../src/service/acceptance/defaultEngagementJourneyAcceptanceService.mjs';

function fixture(change = () => {}, deny = '') {
  const calls = [];
  const states = { TRIAGE: 'TRIAGED', ASSIGN: 'ASSIGNED', START: 'IN_PROGRESS', RESOLVE: 'RESOLVED', CONFIRM: 'CLOSED' };
  let revision = 0;
  const options = {
    execute: true,
    environment: { NODICS_AUTH_TOKEN: 'isolated-token', NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid' },
    configuration: { topology: { groups: { backends: [{ role: 'ENGAGEMENT', server: 'engage', host: 'engage.invalid', port: 1234 }] } } },
    fetch: async (url, request) => {
      const route = new URL(url).pathname;
      calls.push({ route, request });
      assert.ok(request.signal instanceof AbortSignal);
      if (route.includes('/operator/')) assert.equal(request.headers.Authorization, 'Bearer isolated-token');
      else assert.equal(request.headers.Authorization, undefined);
      if (route === deny) return Response.json({ message: 'denied' }, { status: 403 });
      let body;
      if (route.endsWith('/public/feedback')) body = { code: 'partner-feedback', status: 'RECEIVED', revision };
      else if (route.endsWith('/operator/feedback')) body = [{ code: 'partner-feedback' }];
      else if (route.includes('/actions/')) {
        assert.equal(JSON.parse(request.body).expectedRevision, revision);
        body = { code: 'partner-feedback', status: states[route.split('/').at(-1)], revision: ++revision };
      } else if (route.endsWith('/testimonials')) body = [];
      else if (route.endsWith('/reviews')) body = { items: [] };
      else assert.fail('Unexpected route ' + route);
      body = change(route, body) ?? body;
      return Response.json({ result: body });
    },
  };
  return { options, calls };
}

test('execution requires literal true before configuration or network access', async () => {
  for (const execute of [undefined, false, 'true', 1]) {
    await assert.rejects(run({ execute, fetch: () => assert.fail('network') }), /--execute/);
  }
});

test('all five correlated transitions and both public projections are required', async () => {
  const f = fixture();
  assert.deepEqual(await run(f.options), { feedbackCode: 'partner-feedback', revision: 5, state: 'PASSED' });
  assert.deepEqual(f.calls.filter(c => c.route.includes('/actions/')).map(c => c.route.split('/').at(-1)),
    ['TRIAGE', 'ASSIGN', 'START', 'RESOLVE', 'CONFIRM']);
  const correlations = f.calls.filter(c => c.request.method === 'POST' || c.route.includes('/operator/'))
    .map(c => c.request.headers['x-correlation-id']);
  assert.equal(new Set(correlations).size, 1);
  assert.match(correlations[0], /^engagement-acceptance-/);
  assert.equal(f.calls.length, 9);
});

test('intake, queue, every lifecycle outcome and public shapes fail closed', async () => {
  const cases = [
    ['/public/feedback', body => ({ ...body, status: 'REJECTED' })],
    ['/public/feedback', body => ({ ...body, code: '' })],
    ['/public/feedback', body => ({ ...body, revision: null })],
    ['/public/feedback', body => ({ ...body, revision: '0' })],
    ['/operator/feedback', () => []],
    ...['TRIAGE', 'ASSIGN', 'START', 'RESOLVE', 'CONFIRM'].flatMap(action => [
      ['/actions/' + action, body => ({ ...body, status: 'RECEIVED' })],
      ['/actions/' + action, body => ({ ...body, code: 'unrelated' })],
      ['/actions/' + action, body => ({ ...body, revision: body.revision - 1 })],
    ]),
    ['/public/testimonials', () => ({ items: [] })],
    ['/public/reviews', () => []],
  ];
  for (const [suffix, mutate] of cases) {
    const f = fixture((route, body) => route.endsWith(suffix) ? mutate(body) : body);
    await assert.rejects(run(f.options), undefined, suffix);
    assert.equal(f.calls.at(-1).route.endsWith(suffix), true);
  }
});

test('operator denial stops immediately without retries or public evidence', async () => {
  const route = '/nodics/engagement/v0/operator/feedback/partner-feedback/actions/ASSIGN';
  const f = fixture(undefined, route);
  await assert.rejects(run(f.options), /HTTP 403/);
  assert.equal(f.calls.at(-1).route, route);
  assert.equal(f.calls.filter(c => c.route === route).length, 1);
});
