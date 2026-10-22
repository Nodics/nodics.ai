/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module bidding/acceptance/defaultBiddingAuctionAcceptanceService
 * @description Executes reviewed live auction cases through canonical Bidding HTTP owner APIs.
 * @layer tooling
 * @owner bidding
 * @remarks The caller owns actor sessions, Product publication fixtures, deadline scheduling and the
 * Product-owned republish operation. The runner never provisions identities, funds wallets, edits
 * publications, activates Cron or substitutes direct persistence for owner APIs.
 */
import { setTimeout as delay } from 'node:timers/promises';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import exact from '../../../../baseCommerce/modules/pricing/src/service/defaultExactAmountService.js';
import properties from '../../../config/properties.js';

const identifier = value => typeof value === 'string' && /^[A-Za-z0-9_.:@-]{1,180}$/.test(value);
const amount = value => typeof value === 'string' && value.length <= 32 && /^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(value);
const exactKeys = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) &&
  Object.keys(value).length === keys.length && Object.keys(value).every(key => keys.includes(key));
const requireEvidence = (condition, code) => {
  if (!condition) throw Object.assign(new Error(code), { code });
};
const sameAmount = (left, right) => amount(left) && amount(right) && exact.compare(left, right) === 0;

/** Unwraps bounded owner envelopes without accepting contradictory or unsuccessful responses. */
export function biddingAuctionData(value) {
  for (let depth = 0; depth < 8; depth += 1) {
    requireEvidence(value && typeof value === 'object' && !Array.isArray(value) && value.success !== false && !value.error &&
      !(typeof value.code === 'string' && value.code.startsWith('ERR_')), 'OWNER_RESPONSE_REFUSED');
    const hasData = Object.hasOwn(value, 'data'), hasResult = Object.hasOwn(value, 'result');
    requireEvidence(!(hasData && hasResult), 'OWNER_RESPONSE_AMBIGUOUS');
    if (!hasData && !hasResult) return value;
    value = hasData ? value.data : value.result;
  }
  requireEvidence(false, 'OWNER_RESPONSE_DEPTH');
}

function listing(value, label) {
  const keys = ['productCode', 'variantCode', 'publicationCode'];
  requireEvidence(exactKeys(value, keys) && keys.every(key => identifier(value[key])), label + '_LISTING_REQUIRED');
  return value;
}

function selectionOf(options) {
  requireEvidence(options.execute === true, 'EXPLICIT_EXECUTION_REQUIRED');
  let url;
  try { url = new URL(options.baseUrl); } catch { requireEvidence(false, 'LOCAL_HTTP_TARGET_REQUIRED'); }
  requireEvidence(['http:', 'https:'].includes(url.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) &&
    !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash, 'LOCAL_HTTP_TARGET_REQUIRED');
  const selected = structuredClone(options.selection);
  const rootKeys = ['contractVersion', 'approvalReference', 'tenant', 'runCode', 'storeCode', 'maximumWaitMs', 'cases'];
  requireEvidence(exactKeys(selected, rootKeys) && selected.contractVersion === 1 &&
    ['approvalReference', 'tenant', 'runCode', 'storeCode'].every(key => identifier(selected[key])) &&
    selected.runCode.length <= 64 && Number.isSafeInteger(selected.maximumWaitMs) && selected.maximumWaitMs >= 1 &&
    selected.maximumWaitMs <= 3600000, 'REVIEWED_AUCTION_SELECTION_REQUIRED');
  const caseKeys = ['lifecycle', 'manualSelection', 'automaticTie', 'cancellationRepublish', 'noBid', 'failedAward'];
  requireEvidence(exactKeys(selected.cases, caseKeys), 'COMPLETE_AUCTION_CASE_SELECTION_REQUIRED');
  const lifecycle = selected.cases.lifecycle;
  requireEvidence(exactKeys(lifecycle, ['listing', 'initialAmount', 'updatedAmount']) &&
    [lifecycle.initialAmount, lifecycle.updatedAmount].every(amount) && !sameAmount(lifecycle.initialAmount, lifecycle.updatedAmount),
  'LIFECYCLE_CASE_REQUIRED');
  listing(lifecycle.listing, 'LIFECYCLE');
  const manual = selected.cases.manualSelection;
  requireEvidence(exactKeys(manual, ['listing', 'higherAmount', 'selectedAmount']) &&
    [manual.higherAmount, manual.selectedAmount].every(amount) && exact.compare(manual.higherAmount, manual.selectedAmount) > 0,
  'MANUAL_SELECTION_CASE_REQUIRED');
  listing(manual.listing, 'MANUAL_SELECTION');
  const tie = selected.cases.automaticTie;
  requireEvidence(exactKeys(tie, ['listing', 'amount']) && amount(tie.amount), 'AUTOMATIC_TIE_CASE_REQUIRED');
  listing(tie.listing, 'AUTOMATIC_TIE');
  const cancellation = selected.cases.cancellationRepublish;
  requireEvidence(exactKeys(cancellation, ['listing', 'replacementPublicationCode', 'amount']) &&
    identifier(cancellation.replacementPublicationCode) && cancellation.replacementPublicationCode !== cancellation.listing?.publicationCode &&
    amount(cancellation.amount), 'CANCELLATION_REPUBLISH_CASE_REQUIRED');
  listing(cancellation.listing, 'CANCELLATION_REPUBLISH');
  listing(selected.cases.noBid?.listing, 'NO_BID');
  requireEvidence(exactKeys(selected.cases.noBid, ['listing']), 'NO_BID_CASE_REQUIRED');
  const failed = selected.cases.failedAward;
  requireEvidence(exactKeys(failed, ['listing', 'higherAmount', 'lowerAmount']) &&
    [failed.higherAmount, failed.lowerAmount].every(amount) && exact.compare(failed.higherAmount, failed.lowerAmount) > 0,
  'FAILED_AWARD_CASE_REQUIRED');
  listing(failed.listing, 'FAILED_AWARD');
  const products = caseKeys.map(key => selected.cases[key].listing.productCode);
  requireEvidence(new Set(products).size === products.length, 'AUCTION_CASE_PRODUCTS_MUST_BE_DISTINCT');

  const sessions = options.sessions;
  const sessionKeys = ['seller', 'bidderA', 'bidderB', 'scheduler'];
  requireEvidence(exactKeys(sessions, sessionKeys), 'EXACT_AUCTION_SESSIONS_REQUIRED');
  for (const key of sessionKeys) {
    const session = sessions[key];
    requireEvidence(exactKeys(session, ['authorization', 'enterpriseCode']) &&
      /^Bearer [^\s]{1,16384}$/i.test(session.authorization || '') && identifier(session.enterpriseCode),
    'ORIGINAL_' + key.toUpperCase() + '_SESSION_REQUIRED');
  }
  requireEvidence(new Set([sessions.seller.authorization, sessions.bidderA.authorization, sessions.bidderB.authorization]).size === 3,
    'DISTINCT_PARTICIPANT_SESSIONS_REQUIRED');
  requireEvidence(typeof options.advanceRepublish === 'function', 'PRODUCT_REPUBLISH_OWNER_CALLBACK_REQUIRED');
  const policy = { ...properties.bidding.acceptance, ...(options.policy || {}) };
  requireEvidence(exactKeys(policy, ['requestTimeoutMs', 'maximumDuePages', 'deadlineSafetyMs']) &&
    Number.isSafeInteger(policy.requestTimeoutMs) && policy.requestTimeoutMs >= 1 && policy.requestTimeoutMs <= 300000 &&
    Number.isSafeInteger(policy.maximumDuePages) && policy.maximumDuePages >= 1 && policy.maximumDuePages <= 1000 &&
    Number.isSafeInteger(policy.deadlineSafetyMs) && policy.deadlineSafetyMs >= 0 && policy.deadlineSafetyMs <= 5000,
  'AUCTION_ACCEPTANCE_POLICY_REQUIRED');
  requireEvidence((options.fetch === undefined || typeof options.fetch === 'function') &&
    (options.now === undefined || typeof options.now === 'function') &&
    (options.sleep === undefined || typeof options.sleep === 'function'), 'AUCTION_ACCEPTANCE_OPERATIONS_REQUIRED');
  return { selected, sessions, baseUrl: url.origin, policy };
}

/**
 * Executes reserve/update/withdraw, manual and automatic selection, cancellation/republish, no-bid and
 * failed-award cases. The selected Product deadlines must be reachable within the reviewed wait bound.
 */
export async function runBiddingAuctionAcceptance(options = {}) {
  const { selected: s, sessions, baseUrl, policy } = selectionOf(options);
  const fetchRequest = options.fetch || globalThis.fetch;
  const now = options.now || Date.now;
  const sleep = options.sleep || delay;
  const republish = options.advanceRepublish;
  let commandSequence = 0;

  async function http(actor, route, method = 'GET', body, key) {
    if (options.beforeRequest !== undefined) {
      requireEvidence(typeof options.beforeRequest === 'function', 'REQUEST_PACING_UNCONFIRMED');
      try { await options.beforeRequest(Object.freeze({ route: route.split('?')[0], method })); }
      catch { requireEvidence(false, 'REQUEST_PACING_UNCONFIRMED'); }
    }
    let response;
    try {
      response = await fetchRequest(new URL('/nodics/bidding/v0' + route, baseUrl), {
        method, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(policy.requestTimeoutMs),
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', tenant: s.tenant,
          'x-enterprise-code': actor.enterpriseCode, Authorization: actor.authorization,
          'x-correlation-id': s.runCode, ...(key ? { 'Idempotency-Key': key } : {}) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      requireEvidence(false, 'HTTP_OUTCOME_UNCONFIRMED');
    }
    let value;
    try { value = await response.json(); } catch { requireEvidence(false, 'OWNER_RESPONSE_INVALID'); }
    requireEvidence(response.ok, 'HTTP_' + response.status);
    return biddingAuctionData(value);
  }
  const encoded = encodeURIComponent;
  const read = (actor, roundCode) => http(actor, '/auctions/' + encoded(roundCode) + '?storeCode=' + encoded(s.storeCode));
  const key = (caseCode, action) => `${s.runCode}:${caseCode}:${action}:${++commandSequence}`;
  async function publication(actor, expected) {
    const value = await http(actor, '/auction-publications/' + encoded(expected.productCode) + '?storeCode=' + encoded(s.storeCode));
    requireEvidence(value.productCode === expected.productCode && value.publicationCode === expected.publicationCode &&
      value.storeCode === s.storeCode && value.participantRole === 'SELLER' && value.allowedActions?.includes('OPEN'),
    'PUBLISHED_AUCTION_CONTEXT_REQUIRED');
    return value;
  }
  async function open(caseCode, expected) {
    await publication(sessions.seller, expected);
    const round = await http(sessions.seller, '/auctions', 'POST', { confirmed: true, storeCode: s.storeCode,
      productCode: expected.productCode, variantCode: expected.variantCode, publicationCode: expected.publicationCode }, key(caseCode, 'open'));
    requireEvidence(round.code && round.productCode === expected.productCode && round.variantCode === expected.variantCode &&
      round.publicationCode === expected.publicationCode && round.storeCode === s.storeCode && round.status === 'OPEN' &&
      round.participantRole === 'SELLER' && round.holdTiming === 'RESERVE_ON_BID' && round.bidCount === 0,
    'OPEN_AUCTION_ROUND_REQUIRED');
    return round;
  }
  async function command(caseCode, actor, round, action, fields = {}) {
    return http(actor, '/auctions/' + encoded(round.code) + '/commands', 'POST', {
      confirmed: true, storeCode: s.storeCode, action, expectedRevision: round.revision, ...fields,
    }, key(caseCode, action.toLowerCase()));
  }
  async function place(caseCode, actor, round, offeredAmount) {
    const result = await command(caseCode, actor, round, 'PLACE', { amount: offeredAmount });
    const own = result.bids?.find(bid => sameAmount(bid.amount, offeredAmount));
    requireEvidence(result.bidCount >= 1 && own?.status === 'OPEN' && own.fundsStatus === 'RESERVED' &&
      own.allowedActions?.includes('UPDATE') && own.allowedActions?.includes('WITHDRAW'), 'RESERVE_ON_BID_UNCONFIRMED');
    return { round: result, bid: own };
  }
  async function waitFor(instant, phase) {
    const deadline = Date.parse(instant || '');
    requireEvidence(Number.isFinite(deadline), phase + '_DEADLINE_REQUIRED');
    const remaining = deadline - now();
    requireEvidence(remaining <= s.maximumWaitMs, phase + '_DEADLINE_EXCEEDS_REVIEWED_WAIT');
    if (remaining >= 0) await sleep(remaining + policy.deadlineSafetyMs);
  }
  async function closeDue(caseCode, roundCode) {
    let afterCode = null;
    for (let page = 0; page < policy.maximumDuePages; page += 1) {
      const result = await http(sessions.scheduler, '/internal/auctions/close-due', 'POST', { afterCode }, key(caseCode, 'close-due'));
      requireEvidence(Array.isArray(result.results) && (result.afterCode === null || identifier(result.afterCode)), 'CLOSE_DUE_RESPONSE_INVALID');
      const row = result.results.find(item => item.code === roundCode);
      if (row) return row;
      if (result.afterCode === null) break;
      requireEvidence(result.afterCode !== afterCode, 'CLOSE_DUE_PAGINATION_STALLED');
      afterCode = result.afterCode;
    }
    requireEvidence(false, 'TARGET_AUCTION_NOT_PROCESSED');
  }

  const evidence = {};
  {
    const c = s.cases.lifecycle;
    let round = await open('lifecycle', c.listing);
    let placed = await place('lifecycle', sessions.bidderA, round, c.initialAmount);
    round = placed.round;
    const originalOrder = placed.bid.successfulOrder;
    round = await command('lifecycle', sessions.bidderA, round, 'UPDATE', {
      bidCode: placed.bid.code, bidRevision: placed.bid.revision, amount: c.updatedAmount,
    });
    let own = round.bids.find(bid => bid.code === placed.bid.code);
    requireEvidence(own && sameAmount(own.amount, c.updatedAmount) && own.revision === placed.bid.revision + 1 &&
      own.successfulOrder > originalOrder && own.fundsStatus === 'RESERVED', 'BID_UPDATE_UNCONFIRMED');
    round = await command('lifecycle', sessions.bidderA, round, 'WITHDRAW', { bidCode: own.code, bidRevision: own.revision });
    own = round.bids.find(bid => bid.code === own.code);
    requireEvidence(own?.status === 'WITHDRAWN' && own.fundsStatus === 'RELEASED' && round.bidCount === 0,
      'BID_WITHDRAWAL_UNCONFIRMED');
    evidence.lifecycle = { roundCode: round.code, status: round.status, bidStatus: own.status, fundsStatus: own.fundsStatus };
  }
  {
    const c = s.cases.manualSelection;
    let round = await open('manual', c.listing);
    round = (await place('manual', sessions.bidderA, round, c.higherAmount)).round;
    round = (await place('manual', sessions.bidderB, round, c.selectedAmount)).round;
    const selectedBid = (await read(sessions.bidderB, round.code)).bids[0];
    await waitFor(round.endsAt, 'MANUAL_SELECTION_END');
    const closed = await closeDue('manual', round.code);
    requireEvidence(closed.status === 'GRACE', 'SELLER_SELECTION_GRACE_REQUIRED');
    round = await read(sessions.seller, round.code);
    round = await command('manual', sessions.seller, round, 'SELECT', {
      bidCode: selectedBid.code, bidRevision: selectedBid.revision,
    });
    requireEvidence(round.status === 'SELECTED' && round.selection?.bidCode === selectedBid.code &&
      sameAmount(round.selection.amount, c.selectedAmount) && round.selection.status === 'CHECKOUT_READY',
    'MANUAL_LOWER_BID_SELECTION_UNCONFIRMED');
    const loser = round.bids.find(bid => sameAmount(bid.amount, c.higherAmount));
    requireEvidence(loser?.status === 'UNSUCCESSFUL' && loser.fundsStatus === 'RELEASED', 'MANUAL_SELECTION_LOSER_RELEASE_UNCONFIRMED');
    evidence.manualSelection = { roundCode: round.code, selectedBidCode: selectedBid.code, amount: round.selection.amount };
  }
  {
    const c = s.cases.automaticTie;
    let round = await open('automatic-tie', c.listing);
    const first = await place('automatic-tie', sessions.bidderA, round, c.amount);
    round = first.round;
    const second = await place('automatic-tie', sessions.bidderB, round, c.amount);
    round = second.round;
    requireEvidence(first.bid.successfulOrder < second.bid.successfulOrder, 'SERVER_TIE_ORDER_REQUIRED');
    await waitFor(round.endsAt, 'AUTOMATIC_TIE_END');
    requireEvidence((await closeDue('automatic-tie-end', round.code)).status === 'GRACE', 'AUTOMATIC_TIE_GRACE_REQUIRED');
    round = await read(sessions.seller, round.code);
    await waitFor(round.graceEndsAt, 'AUTOMATIC_TIE_GRACE');
    requireEvidence((await closeDue('automatic-tie-grace', round.code)).status === 'SELECTED', 'AUTOMATIC_FALLBACK_REQUIRED');
    round = await read(sessions.seller, round.code);
    requireEvidence(round.selection?.bidCode === first.bid.code && sameAmount(round.selection.amount, c.amount),
      'EARLIEST_EQUAL_HIGHEST_BID_REQUIRED');
    evidence.automaticTie = { roundCode: round.code, selectedBidCode: round.selection.bidCode,
      firstOrder: first.bid.successfulOrder, secondOrder: second.bid.successfulOrder };
  }
  {
    const c = s.cases.cancellationRepublish;
    let round = await open('cancel-republish', c.listing);
    round = (await place('cancel-republish', sessions.bidderA, round, c.amount)).round;
    const oldBidCode = round.bids[0].code;
    round = await command('cancel-republish', sessions.seller, round, 'CANCEL');
    requireEvidence(round.status === 'CANCELLED' && round.cleanupComplete === true && round.bids[0]?.status === 'CANCELLED' &&
      round.bids[0]?.fundsStatus === 'RELEASED', 'AUCTION_CANCELLATION_UNCONFIRMED');
    await republish(Object.freeze({ caseCode: 'cancellationRepublish', productCode: c.listing.productCode,
      previousPublicationCode: c.listing.publicationCode, replacementPublicationCode: c.replacementPublicationCode,
      cancelledRoundCode: round.code }));
    const replacement = { ...c.listing, publicationCode: c.replacementPublicationCode };
    const fresh = await open('cancel-republish-fresh', replacement);
    requireEvidence(fresh.code !== round.code && fresh.bidCount === 0 && !fresh.bids.some(bid => bid.code === oldBidCode),
      'FRESH_REPUBLISHED_AUCTION_REQUIRED');
    evidence.cancellationRepublish = { cancelledRoundCode: round.code, freshRoundCode: fresh.code, oldBidCode };
  }
  {
    const c = s.cases.noBid;
    let round = await open('no-bid', c.listing);
    await waitFor(round.endsAt, 'NO_BID_END');
    requireEvidence((await closeDue('no-bid', round.code)).status === 'UNSOLD', 'NO_BID_UNSOLD_REQUIRED');
    round = await read(sessions.seller, round.code);
    requireEvidence(round.status === 'UNSOLD' && round.bidCount === 0 && round.cleanupComplete === true,
      'NO_BID_CLEANUP_UNCONFIRMED');
    evidence.noBid = { roundCode: round.code, status: round.status };
  }
  {
    const c = s.cases.failedAward;
    let round = await open('failed-award', c.listing);
    const winner = await place('failed-award', sessions.bidderA, round, c.higherAmount);
    round = winner.round;
    const loser = await place('failed-award', sessions.bidderB, round, c.lowerAmount);
    round = loser.round;
    await waitFor(round.endsAt, 'FAILED_AWARD_END');
    requireEvidence((await closeDue('failed-award-end', round.code)).status === 'GRACE', 'FAILED_AWARD_GRACE_REQUIRED');
    round = await read(sessions.seller, round.code);
    await waitFor(round.graceEndsAt, 'FAILED_AWARD_GRACE');
    requireEvidence((await closeDue('failed-award-first', round.code)).status === 'RECOVERY_REQUIRED',
      'FAILED_AWARD_RECOVERY_REQUIRED');
    let failed = await read(sessions.seller, round.code);
    requireEvidence(failed.status === 'SELECTED' && failed.selection?.bidCode === winner.bid.code &&
      failed.bids.find(bid => bid.code === loser.bid.code)?.status === 'UNSUCCESSFUL', 'FAILED_AWARD_WINNER_FENCE_REQUIRED');
    requireEvidence((await closeDue('failed-award-retry', round.code)).status === 'RECOVERY_REQUIRED',
      'FAILED_AWARD_RETRY_MUST_REMAIN_RECOVERABLE');
    const retried = await read(sessions.seller, round.code);
    requireEvidence(retried.selection?.bidCode === failed.selection.bidCode &&
      retried.bids.filter(bid => bid.status === 'SELECTED').length === 1,
    'FAILED_AWARD_MUST_NOT_REAWARD');
    evidence.failedAward = { roundCode: retried.code, selectedBidCode: retried.selection.bidCode,
      status: retried.status, processing: retried.processing };
  }
  return { contractVersion: 1, state: 'PASSED', approvalReference: s.approvalReference, runCode: s.runCode, evidence };
}

/** Parses explicit project-owned fixture and Product-republish adapter selections. */
export function biddingAuctionAcceptanceArguments(argv = []) {
  requireEvidence(argv.every(argument => argument === '--execute' || argument.startsWith('--selection=') ||
    argument.startsWith('--republish-adapter=') || argument.startsWith('--base-url=')), 'UNSUPPORTED_ACCEPTANCE_ARGUMENT');
  const one = name => {
    const prefix = '--' + name + '=';
    const values = argv.filter(argument => argument.startsWith(prefix));
    requireEvidence(values.length <= 1, 'DUPLICATE_' + name.replaceAll('-', '_').toUpperCase());
    return values.length ? values[0].slice(prefix.length) : undefined;
  };
  requireEvidence(argv.filter(argument => argument === '--execute').length <= 1, 'DUPLICATE_EXECUTE_ARGUMENT');
  return { execute: argv.includes('--execute'), selection: one('selection'),
    republishAdapter: one('republish-adapter'), baseUrl: one('base-url') };
}

async function projectFile(projectRoot, selected, label) {
  requireEvidence(typeof selected === 'string' && selected.length > 0 && selected.length <= 1024, label + '_REQUIRED');
  const root = await realpath(projectRoot), file = await realpath(path.resolve(root, selected));
  requireEvidence(file.startsWith(root + path.sep), label + '_MUST_BE_PROJECT_OWNED');
  return file;
}

/** Import-inert command entrypoint; fixtures, sessions and Product callback remain project-owned. */
export async function main(argv = process.argv.slice(2), environment = process.env) {
  if (argv.includes('--help')) {
    console.log('acceptance:bidding-auction --execute [--selection=<project-json>] [--republish-adapter=<project-mjs>] [--base-url=<local-origin>]\nSelection, adapter and origin may instead use NODICS_BIDDING_ACCEPTANCE_SELECTION, NODICS_BIDDING_ACCEPTANCE_REPUBLISH_ADAPTER and NODICS_BIDDING_ACCEPTANCE_ORIGIN. Four existing participant sessions are required. The adapter must export advanceRepublish and invoke the canonical Product owner; this runner creates no identities, funds, publications or permissions.');
    return 0;
  }
  const args = biddingAuctionAcceptanceArguments(argv);
  const projectRoot = environment.NODICS_PROJECT_ROOT || process.cwd();
  const selectionFile = await projectFile(projectRoot, args.selection || environment.NODICS_BIDDING_ACCEPTANCE_SELECTION,
    'REVIEWED_AUCTION_SELECTION');
  const adapterFile = await projectFile(projectRoot, args.republishAdapter ||
    environment.NODICS_BIDDING_ACCEPTANCE_REPUBLISH_ADAPTER, 'PRODUCT_REPUBLISH_ADAPTER');
  const adapter = await import(pathToFileURL(adapterFile).href);
  requireEvidence(typeof adapter.advanceRepublish === 'function', 'PRODUCT_REPUBLISH_OWNER_CALLBACK_REQUIRED');
  const selection = JSON.parse(await readFile(selectionFile, 'utf8'));
  const session = prefix => ({ authorization: 'Bearer ' + environment[prefix + '_TOKEN'],
    enterpriseCode: environment[prefix + '_ENTERPRISE_CODE'] });
  const report = await runBiddingAuctionAcceptance({ execute: args.execute, selection,
    baseUrl: args.baseUrl || environment.NODICS_BIDDING_ACCEPTANCE_ORIGIN,
    sessions: { seller: session('NODICS_BIDDING_SELLER'), bidderA: session('NODICS_BIDDING_BIDDER_A'),
      bidderB: session('NODICS_BIDDING_BIDDER_B'), scheduler: session('NODICS_BIDDING_SCHEDULER') },
    advanceRepublish: adapter.advanceRepublish });
  console.log(JSON.stringify(report, null, 2));
  return report.state === 'PASSED' ? 0 : 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().then(code => { process.exitCode = code; }).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
