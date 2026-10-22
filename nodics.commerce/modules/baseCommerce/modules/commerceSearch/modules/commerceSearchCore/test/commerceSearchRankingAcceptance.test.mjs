/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import properties from '../config/properties.js';
import { commerceSearchData, runCommerceSearchRankingAcceptance,
  selectCommerceSearchRankingAcceptance } from '../src/service/acceptance/defaultCommerceSearchRankingAcceptanceService.mjs';

const selection = { contractVersion: 1, approvalReference: 'ranking-review', tenant: 'default', enterpriseCode: 'partner',
  storeCode: 'shop', locale: 'en', query: { categoryCode: 'coupons' },
  expectedDefaultOrder: ['boosted', 'ordinary'], explicitSort: { code: 'name-asc', expectedOrder: ['ordinary', 'boosted'] } };
const session = { authorization: 'Bearer customer', enterpriseCode: 'partner' };

function harness(fault = {}) {
  const calls = [];
  const fetch = async (url, input) => {
    const parsed = new URL(url), explicit = parsed.searchParams.has('sort'); calls.push({ parsed, input });
    let codes = explicit ? ['ordinary', 'boosted'] : ['boosted', 'ordinary'];
    if (fault.unstable && calls.length === 2) codes.reverse();
    if (fault.duplicate) codes = ['boosted', 'boosted'];
    return new Response(JSON.stringify({ data: { products: codes.map(productCode => ({ productCode })),
      discovery: { source: fault.database ? 'DATABASE' : 'SEARCH_INDEX' } } }), { status: 200 });
  };
  return { calls, options: { execute: true, baseUrl: 'http://localhost:4350', selection, session, fetch } };
}

test('read-only owner runner proves stable boost order, deduplication and explicit sort bypass', async () => {
  const h = harness(), result = await runCommerceSearchRankingAcceptance(h.options);
  assert.equal(result.state, 'PASSED'); assert.deepEqual(result.defaultOrder, ['boosted', 'ordinary']);
  assert.deepEqual(result.explicitOrder, ['ordinary', 'boosted']); assert.equal(h.calls.length, 3);
  assert(h.calls.every(value => value.input.method === 'GET'));
  assert.equal(h.calls[2].parsed.searchParams.get('sort'), 'name-asc');
});

test('unstable, duplicate and non-index evidence refuse without publication writes', async () => {
  await assert.rejects(runCommerceSearchRankingAcceptance(harness({ unstable: true }).options), /UNSTABLE/);
  await assert.rejects(runCommerceSearchRankingAcceptance(harness({ duplicate: true }).options), /DEDUPLICATION/);
  const database = harness({ database: true });
  await assert.rejects(runCommerceSearchRankingAcceptance(database.options), /SEARCH_INDEX/);
  assert(database.calls.every(value => value.input.method === 'GET'));
});

test('execution, local target, exact selection and original session are mandatory', async () => {
  await assert.rejects(runCommerceSearchRankingAcceptance({}), /EXPLICIT_EXECUTION_REQUIRED/);
  await assert.rejects(runCommerceSearchRankingAcceptance({ ...harness().options, baseUrl: 'https://example.com' }), /LOCAL_HTTP_TARGET_REQUIRED/);
  await assert.rejects(runCommerceSearchRankingAcceptance({ ...harness().options,
    session: { ...session, enterpriseCode: 'foreign' } }), /ORIGINAL_SEARCH_SESSION_REQUIRED/);
  assert.throws(() => selectCommerceSearchRankingAcceptance(Object.create({ commerceSearchRanking: selection })), /UNAVAILABLE/);
  assert.throws(() => commerceSearchData({ data: {}, result: {} }), /AMBIGUOUS/);
});

test('framework owner registers the command and complete reusable defaults', () => {
  assert.deepEqual(properties.tooling.commands['acceptance:commerce-search-ranking'], { acceptanceContract: true,
    projectHome: true, handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultCommerceSearchRankingAcceptanceService.mjs' });
  assert.deepEqual(properties.commerceSearch.ranking.acceptance,
    { requestTimeoutMs: 30000, maximumExpectedProducts: 1000 });
  const script = new URL('../src/service/acceptance/defaultCommerceSearchRankingAcceptanceService.mjs', import.meta.url).pathname;
  const result = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr); assert.match(result.stdout, /read-only installed Product discovery/);
});
