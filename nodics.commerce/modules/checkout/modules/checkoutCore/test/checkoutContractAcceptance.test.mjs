/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { runCheckoutContractAcceptance as run } from '../src/service/acceptance/defaultCheckoutContractAcceptanceService.mjs';

const routes = [
  ['/nodics/cart/v0/carts/{cartCode}/calculations', 'post'],
  ['/nodics/checkoutCore/v0/checkouts/place', 'post'],
  ['/nodics/order/v0/orders/{orderCode}/lifecycle/preview', 'post'],
  ['/nodics/process/v0/incidents', 'get'],
  ['/nodics/process/v0/instances/{instanceCode}/retry', 'post'],
  ['/nodics/process/v0/instances/{instanceCode}/compensate', 'post'],
];
function fixture(transform = paths => ({ paths }), status = 200) {
  const calls = [];
  const paths = Object.fromEntries(routes.map(([route, method]) => [route, { [method]: { responses: { 200: { description: 'OK' } } } }]));
  return {
    calls, paths,
    options: {
      environment: { NODICS_AUTH_TOKEN: 'isolated', NODICS_ACCEPTANCE_ORIGIN: 'https://partner.invalid' },
      configuration: { topology: { groups: { backends: [{ role: 'COMMERCE', server: 'shop', host: 'shop.invalid', port: 443, protocol: 'https' }] } } },
      fetch: async (url, request) => {
        calls.push({ url, request });
        assert.equal(new URL(url).pathname, '/nodics/system/v0/contract/openapi');
        assert.equal(request.headers.Authorization, 'Bearer isolated');
        assert.equal(request.method || 'GET', 'GET');
        return Response.json(transform(paths), { status });
      },
    },
  };
}
test('all transaction and recovery methods are required in direct and nested contracts', async () => {
  for (const transform of [paths => ({ paths }), paths => ({ openapi: { paths } })]) {
    const f = fixture(transform);
    assert.deepEqual(await run(f.options), { state: 'PASSED' });
    assert.equal(f.calls.length, 1);
  }
});
test('each missing route, empty path, wrong method and invalid operation rejects', async () => {
  for (const [route, method] of routes) {
    for (const value of [undefined, {}, { [method === 'get' ? 'post' : 'get']: {} }, { [method]: true }, { [method]: [] }]) {
      const f = fixture(paths => ({ paths: { ...paths, [route]: value } }));
      await assert.rejects(run(f.options), /effective contract is missing/);
    }
  }
});
test('denied contract reads never mutate or retry', async () => {
  const f = fixture(() => ({ message: 'denied' }), 403);
  await assert.rejects(run(f.options), /HTTP 403/);
  assert.equal(f.calls.length, 1);
});
