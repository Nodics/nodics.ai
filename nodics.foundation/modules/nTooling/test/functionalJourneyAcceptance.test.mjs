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
import { runFunctionalJourneyAcceptance as run } from '../src/service/project/defaultFunctionalJourneyAcceptanceService.mjs';

const owners = [
  ['../../../../../../nodics.wcms/modules/editorial/src/service/acceptance/defaultEditorialLiveJourneyAcceptanceService.mjs', /Editorial/],
  ['../../../../../../nodics.platform/modules/profile/src/service/acceptance/defaultRuntimeDeploymentGrantAcceptanceService.mjs', /Read-only/],
  ['../../../../../../nodics.engagement/modules/engagementApi/src/service/acceptance/defaultEngagementJourneyAcceptanceService.mjs', /Engagement/],
  ['../../../../../../nodics.commerce/modules/checkout/modules/checkoutCore/src/service/acceptance/defaultCheckoutContractAcceptanceService.mjs', /Read-only/],
  ['./defaultFunctionalJourneyAcceptanceService.mjs', /Composes/],
].map(([relative, help]) => [new URL(relative, new URL('../src/service/project/', import.meta.url)), help]);

test('all five imports and help paths are inert in a fresh process without project configuration', () => {
  for (const [url, help] of owners) {
    const source = fileURLToPath(url);
    const guard = "globalThis.fetch = () => { throw new Error('Unexpected network'); };";
    assert.equal(execFileSync(process.execPath, ['--input-type=module', '-e', guard + 'await import(' + JSON.stringify(url.href) + ');'],
      { cwd: '/', encoding: 'utf8', timeout: 10000 }), '');
    const output = execFileSync(process.execPath, ['--input-type=module', '-e',
      guard + 'process.argv = ["node", ' + JSON.stringify(source) + ', "--help"]; await import(' + JSON.stringify(url.href) + ');'],
      { cwd: '/', encoding: 'utf8', timeout: 10000 });
    assert.match(output, help);
  }
});

function fixture(fail = '') {
  const calls = [];
  let revision = 0;
  const routes = ['/nodics/cart/v0/carts/{cartCode}/calculations', '/nodics/checkoutCore/v0/checkouts/place',
    '/nodics/order/v0/orders/{orderCode}/lifecycle/preview', '/nodics/process/v0/incidents',
    '/nodics/process/v0/instances/{instanceCode}/retry', '/nodics/process/v0/instances/{instanceCode}/compensate'];
  return {
    calls,
    options: {
      execute: true, environment: { NODICS_AUTH_TOKEN: 'fixture', NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid' },
      configuration: { topology: { groups: { backends: ['COMMERCE', 'ENGAGEMENT'].map((role, i) =>
        ({ role, server: role.toLowerCase(), host: 'fixture.invalid', port: 1200 + i })) } } },
      fetch: async (url, request) => {
        const route = new URL(url).pathname;
        calls.push({ route, request });
        if (fail === 'checkout' && route.endsWith('/openapi')) return Response.json({ paths: {} });
        if (fail === 'denied' && route.endsWith('/openapi')) return Response.json({}, { status: 403 });
        if (route.endsWith('/openapi')) return Response.json({ paths: Object.fromEntries(routes.map(route =>
          [route, { [route.endsWith('/incidents') ? 'get' : 'post']: {} }])) });
        if (route.endsWith('/public/feedback')) return Response.json({ code: 'feedback', revision, status: 'RECEIVED' });
        if (route.endsWith('/operator/feedback')) return Response.json([{ code: 'feedback' }]);
        if (route.includes('/actions/')) {
          const status = { TRIAGE: 'TRIAGED', ASSIGN: 'ASSIGNED', START: 'IN_PROGRESS', RESOLVE: 'RESOLVED', CONFIRM: 'CLOSED' }[route.split('/').at(-1)];
          return Response.json({ code: 'feedback', revision: ++revision, status: fail === 'engagement' ? 'RECEIVED' : status });
        }
        if (route.endsWith('/testimonials')) return Response.json([]);
        if (route.endsWith('/reviews')) return Response.json({ items: [] });
        assert.fail('Unexpected route');
      },
    },
  };
}
test('composition requires explicit execution before even its read-only suite', async () => {
  for (const execute of [undefined, false, 'true', 1]) await assert.rejects(run({ execute, fetch: () => assert.fail('network') }), /--execute/);
});
test('composition runs both canonical owners and retains their evidence', async () => {
  const f = fixture();
  assert.deepEqual(await run(f.options), { checkout: { state: 'PASSED' }, engagement: { state: 'PASSED', feedbackCode: 'feedback', revision: 5 } });
  assert.ok(f.calls[0].route.endsWith('/openapi'));
  assert.equal(f.calls.length, 10);
});
test('Checkout contract failure or denial prevents Engagement mutations; Engagement failure propagates', async () => {
  for (const failure of ['checkout', 'denied', 'engagement']) {
    const f = fixture(failure);
    await assert.rejects(run(f.options));
    if (failure !== 'engagement') assert.equal(f.calls.length, 1);
    else assert.ok(f.calls.at(-1).route.endsWith('/TRIAGE'));
  }
});
