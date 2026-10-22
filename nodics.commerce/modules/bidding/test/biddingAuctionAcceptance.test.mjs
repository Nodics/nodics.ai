/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  biddingAuctionAcceptanceArguments,
  biddingAuctionData,
  runBiddingAuctionAcceptance,
} from '../src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs';
import properties from '../config/properties.js';

const listings = Object.fromEntries(['lifecycle', 'manual', 'tie', 'cancel', 'no-bid', 'failed']
  .map(code => [code, { productCode: `product-${code}`, variantCode: `variant-${code}`, publicationCode: `publication-${code}` }]));
const selection = {
  contractVersion: 1,
  approvalReference: 'approval-auction-live',
  tenant: 'test',
  runCode: 'auction-live-1',
  storeCode: 'market',
  maximumWaitMs: 1000,
  cases: {
    lifecycle: { listing: listings.lifecycle, initialAmount: '10', updatedAmount: '12' },
    manualSelection: { listing: listings.manual, higherAmount: '30', selectedAmount: '20' },
    automaticTie: { listing: listings.tie, amount: '25' },
    cancellationRepublish: { listing: listings.cancel, replacementPublicationCode: 'publication-cancel-2', amount: '15' },
    noBid: { listing: listings['no-bid'] },
    failedAward: { listing: listings.failed, higherAmount: '40', lowerAmount: '35' },
  },
};
const sessions = Object.fromEntries(['seller', 'bidderA', 'bidderB', 'scheduler']
  .map(code => [code, { authorization: `Bearer ${code}`, enterpriseCode: `${code}-enterprise` }]));

function harness(changes = {}) {
  let clock = Date.parse('2026-10-20T00:00:00Z'), sequence = 0;
  const rounds = new Map(), calls = [], publications = new Map(Object.values(listings)
    .map(row => [row.productCode, row.publicationCode]));
  const actorOf = request => request.headers.Authorization.slice('Bearer '.length);
  const project = (round, actor) => {
    const seller = actor === 'seller';
    const visible = seller ? round.bids : round.bids.filter(bid => bid.actor === actor);
    return {
      code: round.code, publicationCode: round.publicationCode, productCode: round.productCode,
      storeCode: 'market', variantCode: round.variantCode, revision: round.revision, status: round.status,
      floor: '10', currency: 'POINTS', startsAt: null, endsAt: round.endsAt, graceEndsAt: round.graceEndsAt,
      holdTiming: 'RESERVE_ON_BID', highestAmount: round.bids.filter(bid => ['OPEN', 'SELECTED'].includes(bid.status))
        .reduce((value, bid) => value === null || Number(bid.amount) > Number(value) ? bid.amount : value, null),
      bidCount: round.bids.filter(bid => ['OPEN', 'SELECTED'].includes(bid.status)).length,
      bids: visible.map(bid => ({ code: bid.code, amount: bid.amount, revision: bid.revision, status: bid.status,
        successfulOrder: bid.successfulOrder, history: [], fundsStatus: bid.fundsStatus,
        allowedActions: round.status === 'OPEN' && bid.status === 'OPEN' ? ['UPDATE', 'WITHDRAW'] : [] })),
      processing: round.failed === true, participantRole: seller ? 'SELLER' : visible.length ? 'BUYER' : 'VIEWER',
      cleanupComplete: round.cleanupComplete,
      allowedActions: round.status === 'OPEN' ? ['PLACE', ...(seller ? ['SELECT', 'CANCEL'] : [])] : [],
      ...(round.selection ? { selection: { ...round.selection, status: round.failed ? 'PROCESSING' : 'CHECKOUT_READY' } } : {}),
    };
  };
  const json = (value, status = 200) => Response.json({ data: value }, { status });
  async function fetchRequest(url, request) {
    const parsed = new URL(url), path = parsed.pathname.replace('/nodics/bidding/v0', '');
    const body = request.body ? JSON.parse(request.body) : undefined, actor = actorOf(request);
    calls.push({ path, method: request.method, actor, body, headers: request.headers });
    if (changes.httpError && path.includes(changes.httpError)) return json({ code: 'ERR_TEST' }, 503);
    const publicationMatch = path.match(/^\/auction-publications\/([^/]+)$/);
    if (publicationMatch) {
      const productCode = decodeURIComponent(publicationMatch[1]), original = Object.values(listings).find(row => row.productCode === productCode);
      return json({ productCode, publicationCode: publications.get(productCode), storeCode: 'market',
        variantCodes: [original.variantCode], floor: '10', currency: 'POINTS', startsAt: null,
        endsAt: new Date(clock + 100).toISOString(), participantRole: 'SELLER', allowedActions: ['OPEN'] });
    }
    if (path === '/auctions' && request.method === 'POST') {
      const code = `${body.productCode}:${body.publicationCode}`;
      const row = { code, productCode: body.productCode, variantCode: body.variantCode,
        publicationCode: body.publicationCode, revision: 0, status: 'OPEN', bids: [],
        endsAt: new Date(clock + 100).toISOString(), graceEndsAt: new Date(clock + 200).toISOString(),
        cleanupComplete: false, failed: body.productCode === listings.failed.productCode };
      rounds.set(code, row);
      return json(project(row, actor));
    }
    const commandMatch = path.match(/^\/auctions\/([^/]+)\/commands$/);
    if (commandMatch) {
      const round = rounds.get(decodeURIComponent(commandMatch[1]));
      assert.equal(body.expectedRevision, round.revision);
      if (body.action === 'PLACE') round.bids.push({ code: `bid-${++sequence}`, actor, amount: body.amount,
        revision: 0, status: 'OPEN', successfulOrder: sequence, fundsStatus: 'RESERVED' });
      if (body.action === 'UPDATE') {
        const bid = round.bids.find(row => row.code === body.bidCode);
        bid.amount = body.amount; bid.revision += 1; bid.successfulOrder = ++sequence;
      }
      if (body.action === 'WITHDRAW') {
        const bid = round.bids.find(row => row.code === body.bidCode);
        bid.status = 'WITHDRAWN'; bid.revision += 1; bid.fundsStatus = 'RELEASED';
      }
      if (body.action === 'SELECT') {
        round.status = 'SELECTED'; round.selection = { bidCode: body.bidCode,
          amount: round.bids.find(row => row.code === body.bidCode).amount };
        for (const bid of round.bids) {
          if (bid.code === body.bidCode) bid.status = 'SELECTED';
          else { bid.status = 'UNSUCCESSFUL'; bid.fundsStatus = 'RELEASED'; }
        }
      }
      if (body.action === 'CANCEL') {
        round.status = 'CANCELLED'; round.cleanupComplete = true;
        for (const bid of round.bids) { bid.status = 'CANCELLED'; bid.fundsStatus = 'RELEASED'; }
      }
      round.revision += 1;
      return json(project(round, actor));
    }
    const readMatch = path.match(/^\/auctions\/([^/]+)$/);
    if (readMatch) return json(project(rounds.get(decodeURIComponent(readMatch[1])), actor));
    if (path === '/internal/auctions/close-due') {
      const results = [];
      for (const round of rounds.values()) {
        if (round.status === 'OPEN' && clock >= Date.parse(round.endsAt)) {
          if (!round.bids.some(bid => bid.status === 'OPEN')) {
            round.status = 'UNSOLD'; round.cleanupComplete = true; round.revision += 1;
          } else { round.status = 'GRACE'; round.revision += 1; }
          results.push({ code: round.code, status: round.status, revision: round.revision });
        } else if (round.status === 'GRACE' && clock >= Date.parse(round.graceEndsAt)) {
          const ranked = round.bids.filter(bid => bid.status === 'OPEN')
            .sort((a, b) => Number(b.amount) - Number(a.amount) || a.successfulOrder - b.successfulOrder);
          const winner = ranked[0];
          round.status = 'SELECTED'; round.selection ||= { bidCode: winner.code, amount: winner.amount };
          for (const bid of round.bids) {
            if (bid.code === round.selection.bidCode) bid.status = 'SELECTED';
            else { bid.status = 'UNSUCCESSFUL'; bid.fundsStatus = 'RELEASED'; }
          }
          round.revision += 1;
          results.push({ code: round.code, status: round.failed ? 'RECOVERY_REQUIRED' : 'SELECTED', revision: round.revision });
        } else if (round.failed && round.status === 'SELECTED') {
          results.push({ code: round.code, status: 'RECOVERY_REQUIRED', revision: round.revision });
        }
      }
      return json({ results, afterCode: null });
    }
    return json({ code: 'ERR_NOT_FOUND' }, 404);
  }
  return {
    calls, rounds, publications,
    options: {
      execute: true, baseUrl: 'http://127.0.0.1:4350', selection, sessions, fetch: fetchRequest,
      now: () => clock, sleep: async milliseconds => { clock += milliseconds; },
      advanceRepublish: async evidence => { publications.set(evidence.productCode, evidence.replacementPublicationCode); },
    },
  };
}

test('live runner exercises canonical auction owners and returns bounded lifecycle evidence', async () => {
  const h = harness();
  const result = await runBiddingAuctionAcceptance(h.options);
  assert.equal(result.state, 'PASSED');
  assert.deepEqual(Object.keys(result.evidence), [
    'lifecycle', 'manualSelection', 'automaticTie', 'cancellationRepublish', 'noBid', 'failedAward',
  ]);
  assert.equal(result.evidence.lifecycle.fundsStatus, 'RELEASED');
  assert.equal(result.evidence.manualSelection.amount, '20');
  assert(result.evidence.automaticTie.firstOrder < result.evidence.automaticTie.secondOrder);
  assert.notEqual(result.evidence.cancellationRepublish.cancelledRoundCode,
    result.evidence.cancellationRepublish.freshRoundCode);
  assert.equal(result.evidence.noBid.status, 'UNSOLD');
  assert.equal(result.evidence.failedAward.status, 'SELECTED');
  assert(h.calls.every(call => call.path.startsWith('/auctions') ||
    call.path.startsWith('/auction-publications/') || call.path === '/internal/auctions/close-due'));
  assert(h.calls.filter(call => call.path === '/internal/auctions/close-due').every(call => call.actor === 'scheduler'));
  assert(h.calls.filter(call => call.method === 'POST' && call.path.includes('/commands')).every(call =>
    call.headers['Idempotency-Key'] && call.body.confirmed === true));
});

test('failed award retains one winner across scheduler recovery and never promotes the lower bid', async () => {
  const h = harness();
  const result = await runBiddingAuctionAcceptance(h.options);
  const round = h.rounds.get(result.evidence.failedAward.roundCode);
  assert.equal(round.selection.bidCode, result.evidence.failedAward.selectedBidCode);
  assert.equal(round.bids.filter(bid => bid.status === 'SELECTED').length, 1);
  assert.equal(round.bids.find(bid => bid.amount === '35').status, 'UNSUCCESSFUL');
});

test('execution, local target, exact fixtures, sessions and republish owner are required before network', async () => {
  const h = harness();
  const cases = [
    [{ ...h.options, execute: false }, /EXPLICIT_EXECUTION_REQUIRED/],
    [{ ...h.options, baseUrl: 'https://commerce.example.test' }, /LOCAL_HTTP_TARGET_REQUIRED/],
    [{ ...h.options, selection: { ...selection, cases: { ...selection.cases, noBid: undefined } } }, /NO_BID_LISTING_REQUIRED|NO_BID_CASE_REQUIRED/],
    [{ ...h.options, sessions: { ...sessions, bidderA: sessions.bidderB } }, /DISTINCT_PARTICIPANT_SESSIONS_REQUIRED/],
    [{ ...h.options, advanceRepublish: undefined }, /PRODUCT_REPUBLISH_OWNER_CALLBACK_REQUIRED/],
    [{ ...h.options, policy: { maximumDuePages: 0 } }, /AUCTION_ACCEPTANCE_POLICY_REQUIRED/],
  ];
  for (const [options, expected] of cases) await assert.rejects(runBiddingAuctionAcceptance(options), expected);
  assert.equal(h.calls.length, 0);
});

test('owner HTTP failures stop the journey without manufacturing progress', async () => {
  const h = harness({ httpError: '/auction-publications/' });
  await assert.rejects(runBiddingAuctionAcceptance(h.options), /HTTP_503/);
  assert.equal(h.calls.length, 1);
  assert.equal(h.rounds.size, 0);
});

test('owner envelopes reject ambiguity, refusal and excessive nesting', () => {
  assert.deepEqual(biddingAuctionData({ data: { code: 'round' } }), { code: 'round' });
  assert.throws(() => biddingAuctionData({ data: {}, result: {} }), /OWNER_RESPONSE_AMBIGUOUS/);
  assert.throws(() => biddingAuctionData({ success: false }), /OWNER_RESPONSE_REFUSED/);
  let value = { code: 'round' };
  for (let index = 0; index < 9; index += 1) value = { data: value };
  assert.throws(() => biddingAuctionData(value), /OWNER_RESPONSE_DEPTH/);
});

test('Bidding owns one registered command with explicit project selections', () => {
  assert.deepEqual(properties.tooling.commands['acceptance:bidding-auction'], {
    acceptanceContract: true,
    projectHome: true,
    handler: '@nTooling/node-script',
    script: 'src/service/acceptance/defaultBiddingAuctionAcceptanceService.mjs',
  });
  assert.deepEqual(biddingAuctionAcceptanceArguments(['--execute', '--selection=fixtures/auction.json',
    '--republish-adapter=adapters/product.mjs', '--base-url=http://127.0.0.1:4350']), {
    execute: true, selection: 'fixtures/auction.json', republishAdapter: 'adapters/product.mjs',
    baseUrl: 'http://127.0.0.1:4350',
  });
  assert.throws(() => biddingAuctionAcceptanceArguments(['--seed']), /UNSUPPORTED/);
  assert.throws(() => biddingAuctionAcceptanceArguments(['--selection=a', '--selection=b']), /DUPLICATE_SELECTION/);
});
