/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { createHash } = require('node:crypto');
const { isDeepStrictEqual: same } = require('node:util');
/**
 * @module bidding/service/defaultBiddingAuctionNotificationService
 * @description Retains private committed auction events and freezes Profile-approved recipients for
 * existing Communication intents.
 * @layer service
 * @owner bidding
 * @remarks Auction notifications consume immutable events captured atomically with round CAS. Profile
 * chooses current opaque inbox recipients; Communication owns immutable delivery intents. Failure
 * never rolls back selection, releases holdings or invents recipient consent.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: hash, fail, addEvent, capture, policy, facts, source, proof, rpc, recipients,
 * flush, isDispatchEligible, eligibility.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Derives stable identities from ordered immutable non-contact facts.
   * @param {Object} value Owner input value; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {string} Stable SHA-256 identity of ordered non-contact facts.
   * @remarks Effects: Pure hashing; no credentials or recipient contacts are persisted.
   * Failure behavior: Serialization errors propagate for unsupported values.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  hash: function (value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); },
  /**
   * Refuses without leaking owner, recipient or provider diagnostics.
   * @returns {never} Never returns.
   * @remarks Effects: No mutation or diagnostic disclosure.
   * Failure behavior: Always throws the bounded owner evidence error.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fail: function () { throw new Error('Auction notification evidence is unavailable'); },
  /**
   * Adds an immutable business event to the detached set being committed with an auction transition.
   * @param {Object} events Detached event map; mutated only when the stable identity is absent.
   * @param {Object} round Proposed auction successor containing original identity and business coordinates.
   * @param {string} kind Owner-selected lifecycle event kind.
   * @param {Object} ownerRef Canonical participant retained by the auction.
   * @param {Object} [bid] Retained bid supplying exact amount and identity.
   * @returns {boolean} True when added; existing events and frozen delivery facts remain unchanged.
   * @override Preserve stable identity and immutable facts. This helper performs no persistence or dispatch.
   */
  addEvent: function (events, round, kind, ownerRef, bid) {
    const code = 'AUCTION_EVENT_' + this.hash([round.code, kind, ownerRef, bid?.code || null]);
    if (events[code]) return false;
    events[code] = { code, kind, ownerRef: structuredClone(ownerRef), roundCode: round.code,
      storeCode: round.storeCode, ...(bid ? { bidCode: bid.code, amount: bid.amount } : {}), currency: round.currency };
    return true;
  },
  /**
   * Captures business facts in the same CAS as their transition, independently of notification activation.
   * @param {Object} round Original persisted auction aggregate.
   * @param {Object} patch Proposed lifecycle changes.
   * @returns {Object} Patch with detached events and pending state; inputs are not mutated.
   * @throws {Error} Propagates capture failures before the caller writes the auction.
   * @override Auction save resolves this effective service; addEvent and hash resolve through this.
   */
  capture: function (round, patch) {
    const next = { ...round, ...patch, code: round.code }, events = structuredClone(next.notificationEvents || {});
    let added = false;
    if (next.selection) {
      const winner = next.bids[next.selection.bidCode];
      if (winner && next.status === 'SELECTED') {
        added = this.addEvent(events, next, 'SELECTED', next.sellerRef, winner) || added;
        added = this.addEvent(events, next, 'WINNER_PENDING', winner.buyerRef, winner) || added;
      }
    }
    if (next.status === 'CANCELLED') {
      added = this.addEvent(events, next, 'CANCELLED', next.sellerRef) || added;
      for (const bid of Object.values(next.bids)) if (bid.status === 'CANCELLED')
        added = this.addEvent(events, next, 'CANCELLED', bid.buyerRef, bid) || added;
    }
    if (next.status === 'UNSOLD' && next.cleanupComplete)
      added = this.addEvent(events, next, 'UNSOLD', next.sellerRef) || added;
    for (const bid of Object.values(next.bids)) {
      if (['UNSUCCESSFUL', 'CANCELLED'].includes(bid.status) && bid.code !== next.selection?.bidCode &&
          (!bid.reservation || bid.release?.status === 'RELEASED' && bid.release.reservationCode === bid.reservation.code))
        added = this.addEvent(events, next, 'UNSELECTED_RELEASED', bid.buyerRef, bid) || added;
    }
    return { ...patch, notificationEvents: events,
      notificationPending: added || Object.values(events).some(event => event.recorded !== true) };
  },
  /**
   * Validates complete framework defaults and explicit qualification without enabling delivery.
   * @returns {Object} Detached validated notification transport/presentation policy.
   * @remarks Effects: Reads implementing properties; does not activate delivery.
   * Failure behavior: Rejects incomplete, disabled or unqualified policy.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  policy: function () {
    const p = CONFIG.get('bidding')?.auction?.notifications;
    if (p?.enabled !== true || p.qualified !== true || !Number.isSafeInteger(p.maximumRecipients) || p.maximumRecipients < 1 ||
        !Number.isSafeInteger(p.maximumEventsPerRun) || p.maximumEventsPerRun < 1 ||
        !Number.isSafeInteger(p.timeoutMs) || p.timeoutMs < 1 || typeof p.allowInsecureLoopback !== 'boolean' ||
        [p.locale, p.profileConnectionName, p.communicationConnectionName, p.biddingConnectionName, ...Object.values(p.templates || {})].some(v => typeof v !== 'string' || !v) ||
        ['SELECTED', 'CANCELLED', 'UNSELECTED_RELEASED', 'WINNER_PENDING', 'UNSOLD'].some(kind => !p.templates?.[kind])) this.fail();
    return structuredClone(p);
  },
  /**
   * Hash only immutable event facts, never mutable delivery observations.
   * @param {Object} event Owner input event; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Object} Allowlisted immutable event facts used in source identity.
   * @remarks Effects: Projects persisted event only; excludes delivery observations.
   * Failure behavior: Malformed source facts fail in subsequent proof validation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  facts: function (event) {
    return Object.fromEntries(['code', 'kind', 'ownerRef', 'roundCode', 'storeCode', 'bidCode', 'amount', 'currency']
      .filter(key => event[key] !== undefined).map(key => [key, event[key]]));
  },
  /**
   * Service-only Profile callback accepts source coordinates, never an owner selector.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Committed source proof for the exact retained event.
   * @remarks Effects: Private service-only callback reads retained round/event after runtime admission.
   * Failure behavior: Rejects caller owner selectors, foreign source or absent commit evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  source: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const policy = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'bidding');
    const body = request.httpRequest?.body ?? request.payload;
    if (auth.principalType !== 'service' || !auth.modules?.includes('profile') ||
        !auth.permissions?.includes('commerce.bid.manage') || auth.tenant !== request.tenant ||
        !body || Object.keys(body).sort().join(',') !== 'channel,eventCode,roundCode,storeCode' || body.channel !== 'IN_APP' ||
        !/^AUCTION_[a-f0-9]{64}$/.test(body.roundCode) || !/^AUCTION_EVENT_[a-f0-9]{64}$/.test(body.eventCode) ||
        typeof body.storeCode !== 'string' || !Object.hasOwn(CONFIG.get('bidding').stores, body.storeCode) ||
        auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode ||
        Object.keys(request.httpRequest?.query || request.query || {}).length) this.fail();
    const snapshot = structuredClone({ auth, body, tenant: request.tenant });
    const store = CONFIG.get('bidding').stores[body.storeCode];
    if (!store?.enterpriseCode) this.fail();
    const round = await SERVICE.DefaultBiddingAuctionService.load({ tenant: request.tenant, authData: auth,
      enterpriseCode: store.enterpriseCode, storeCode: body.storeCode }, body.roundCode);
    const event = round.notificationEvents?.[body.eventCode];
    if (!event || round.tenant !== request.tenant || !same(snapshot, { auth: request.authData, body, tenant: request.tenant }) ||
        !same(policy, this.policy())) this.fail();
    return this.proof(request, event);
  },
  /**
   * Projects only the persisted event's typed owner and immutable digest for Profile.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} event Owner input event; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Object} Typed event source identity, digest and ownership proof.
   * @remarks Effects: Pure projection; no contact, delivery or financial effect.
   * Failure behavior: Rejects invalid source/owner through required canonical proof helpers.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  proof: function (request, event) {
    if (event.ownerRef?.module !== 'profile' || !['customer', 'enterprise'].includes(event.ownerRef.schema)) this.fail();
    return { contractVersion: 1, committed: true, tenant: request.tenant, sourceModule: 'bidding',
      sourceType: 'AUCTION_' + event.kind, sourceCode: event.code, sourceDigest: this.hash(this.facts(event)),
      roundCode: event.roundCode, eventCode: event.code, storeCode: event.storeCode, channel: 'IN_APP',
      owner: { ownerType: event.ownerRef.schema.toUpperCase(), ownerCode: event.ownerRef.code } };
  },
  /**
   * Uses fixed owner transports and original runtime authentication inside private capture.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} moduleName Owner input moduleName; exact shape is constrained by this operation's
   * retained source contract.
   * @param {Object} path Owner input path; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} body Owner input body; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} p Owner input p; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {Promise<Object>} Validated canonical owner response.
   * @remarks Effects: One sensitive fixed-target RPC using original runtime authentication.
   * Failure behavior: Rejects failed envelopes and propagates transport uncertainty.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  rpc: async function (request, moduleName, path, body, p) {
    const invocation = { local: false, moduleName, tenant: request.tenant, request: { tenant: request.tenant },
      connectionName: moduleName === 'profile' ? p.profileConnectionName : moduleName === 'bidding' ? p.biddingConnectionName : p.communicationConnectionName,
      targetAuthority: { runtimeRole: moduleName === 'profile' ? 'PLATFORM' : moduleName === 'bidding' ? 'COMMERCE' : 'ENGAGEMENT' },
      apiName: path, methodName: 'POST', requestBody: body, requireInternalAuth: true,
      timeoutMs: p.timeoutMs, maxAttempts: 1, maxResponseBytes: 65536, followRedirects: false,
      secureTransport: { required: true, allowInsecureLoopback: p.allowInsecureLoopback } };
    return SERVICE.DefaultBiddingAuctionPortsService.unwrap(await SERVICE.DefaultLoggerService.runSensitiveOperation(invocation,
      () => SERVICE.DefaultModuleService.invokeModule(invocation)));
  },
  /**
   * Accepts only bounded unique opaque inbox references bound to the exact source proof.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} event Owner input event; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} p Owner input p; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {Promise<Object[]>} Bounded unique opaque inbox recipients for the exact source.
   * @remarks Effects: Reads current Profile opt-in/permission decisions; never infers the acting
   * employee as recipient.
   * Failure behavior: Rejects malformed, duplicate, foreign or incomplete recipient proof.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  recipients: async function (request, event, p) {
    const proof = await this.rpc(request, 'profile', '/internal/auctions/notification-recipients',
      { source: { roundCode: event.roundCode, eventCode: event.code, storeCode: event.storeCode }, channel: 'IN_APP' }, p);
    const expected = this.proof(request, event);
    if (Object.keys(expected).some(key => !same(proof?.[key], expected[key])) || !Array.isArray(proof.recipients) ||
        proof.recipients.length > p.maximumRecipients || new Set(proof.recipients.map(r => r.recipientId)).size !== proof.recipients.length ||
        proof.recipients.some(r => Object.keys(r).sort().join(',') !== 'recipientAddressReference,recipientId' ||
          typeof r.recipientId !== 'string' || !r.recipientId || !/^profile-inbox:[a-f0-9]{64}$/.test(r.recipientAddressReference))) this.fail();
    return proof.recipients;
  },
  /**
   * Retains immutable per-recipient messages before requesting Communication; ambiguous acknowledgements
   * replay exactly.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object>} Retained round notification-pending indicator.
   * @remarks Effects: Freezes per-recipient messages before Communication handoff; exact replay resolves
   * uncertain acknowledgements.
   * Failure behavior: Unavailable recipients/transport retain pending work; cannot claim delivery or
   * reverse business commit.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  flush: async function (input, code) {
    const p = this.policy(), auctions = SERVICE.DefaultBiddingAuctionService;
    const request = input.authData?.principalType === 'service' ? auctions.scheduler(input) : await auctions.participant(input);
    let round = await auctions.load(request, code);
    if (input.authData?.principalType !== 'service' && !auctions.isSeller(request, round) &&
        !Object.values(round.bids).some(b => auctions.same(b.buyerRef, request.buyerRef))) this.fail();
    for (const initial of Object.values(round.notificationEvents || {}).filter(event => !event.recorded).slice(0, p.maximumEventsPerRun)) {
      let event = round.notificationEvents[initial.code];
      if (event.recorded) continue;
      try {
        if (!event.messages) {
          const recipients = await this.recipients(request, event, p);
          round = await auctions.load(request, code);
          event = round.notificationEvents[initial.code];
          if (!event.messages) {
            const variables = { roundCode: round.code, kind: event.kind,
              ...(event.bidCode ? { bidCode: event.bidCode, amount: event.amount, currency: event.currency } : {}) };
            const messages = recipients.map(recipient => ({ ...recipient, channel: 'IN_APP', locale: p.locale,
              templateCode: p.templates[event.kind], purpose: 'AUCTION_' + event.kind, variables,
              idempotencyKey: 'auction:' + this.hash([request.tenant, event.code, recipient.recipientId]) }));
            round = await auctions.save(request, round, { notificationEvents: { ...round.notificationEvents,
              [event.code]: { ...event, messages } } });
            event = round.notificationEvents[event.code];
          }
        }
        for (const message of event.messages) {
          if (message.intentCode) continue;
          if (!same(p, this.policy())) this.fail();
          const response = await this.rpc(request, 'commsApi', '/internal/communications', {
            ...message, sourceModule: 'bidding', sourceType: 'AUCTION_' + event.kind, sourceCode: event.code,
            requiresSourceEligibility: true }, p);
          if (!/^COMM_[a-f0-9]{64}$/.test(response?.intentCode || '') || !['ACCEPTED', 'QUEUED', 'DELIVERING', 'DELIVERED',
            'RETRY_PENDING', 'UNCERTAIN', 'SUPPRESSED', 'FAILED', 'CANCELLED', 'DEAD_LETTER', 'UNCONFIGURED'].includes(response.status)) this.fail();
          round = await auctions.load(request, code);
          event = round.notificationEvents[event.code];
          const messages = event.messages.map(m => m.idempotencyKey === message.idempotencyKey ? { ...m, intentCode: response.intentCode } : m);
          round = await auctions.save(request, round, { notificationEvents: { ...round.notificationEvents, [event.code]: { ...event, messages } } });
          event = round.notificationEvents[event.code];
        }
        round = await auctions.save(request, round, { notificationEvents: { ...round.notificationEvents, [event.code]: { ...event, recorded: true } } });
      } catch (_) { round = await auctions.load(request, code); }
    }
    return { pending: round.notificationPending };
  },
  /**
   * Existing Communication hook uses only its frozen source and recipient coordinates.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Fresh source/recipient eligibility from the fixed Bidding callback.
   * @remarks Effects: Read-only eligibility RPC using Communication's frozen coordinates.
   * Failure behavior: Rejects malformed callback input or failed owner transport.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  isDispatchEligible: async function (input) {
    const p = this.policy();
    const body = Object.fromEntries(['sourceModule', 'sourceType', 'sourceCode', 'recipientId', 'recipientAddressReference',
      'purpose', 'channel', 'idempotencyKey'].map(key => [key, input[key]]));
    return this.rpc(input, 'bidding', '/internal/auctions/notification-eligibility', body, p);
  },
  /**
   * Exact event lookup stays in the original signed runtime partition; fresh Profile preferences may
   * only suppress.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Exact frozen recipient eligibility; changed preferences can suppress.
   * @remarks Effects: Reads original runtime-partition event and fresh Profile recipients.
   * Failure behavior: Rejects source/recipient/digest mismatch; never substitutes a new recipient.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  eligibility: async function (request) {
    SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
    const p = this.policy(), auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'bidding');
    const body = request.httpRequest?.body ?? request.payload;
    if (auth.principalType !== 'service' || !auth.modules?.includes('commsApi') || !auth.permissions?.includes('commerce.bid.manage') ||
        auth.tenant !== request.tenant || !auth.entCode || auth.enterpriseCode && auth.enterpriseCode !== auth.entCode ||
        !body || Object.keys(body).sort().join(',') !== 'channel,idempotencyKey,purpose,recipientAddressReference,recipientId,sourceCode,sourceModule,sourceType' ||
        body.sourceModule !== 'bidding' || body.channel !== 'IN_APP' || body.sourceType !== body.purpose ||
        !/^AUCTION_EVENT_[a-f0-9]{64}$/.test(body.sourceCode) || Object.keys(request.httpRequest?.query || request.query || {}).length) this.fail();
    const snapshot = structuredClone({ body, auth, tenant: request.tenant });
    const r = { tenant: request.tenant, authData: auth, enterpriseCode: auth.entCode };
    const rows = await SERVICE.DefaultBiddingAuctionService.records(r, { ['notificationEvents.' + body.sourceCode + '.code']: body.sourceCode }, { pageSize: 2, pageNumber: 1 });
    if (rows.length !== 1 || rows[0].tenant !== r.tenant) this.fail();
    const event = rows[0].notificationEvents[body.sourceCode];
    const frozen = event.messages?.find(m => m.idempotencyKey === body.idempotencyKey && m.recipientId === body.recipientId &&
      m.recipientAddressReference === body.recipientAddressReference && m.purpose === body.purpose && m.channel === body.channel);
    if (!frozen || body.sourceType !== 'AUCTION_' + event.kind) this.fail();
    const recipients = await this.recipients(r, event, p);
    if (!same(snapshot, { body, auth: request.authData, tenant: request.tenant }) || !same(p, this.policy())) this.fail();
    return { eligible: recipients.some(recipient => recipient.recipientId === frozen.recipientId &&
      recipient.recipientAddressReference === frozen.recipientAddressReference), tenant: r.tenant,
      sourceCode: event.code, recipientId: frozen.recipientId, recipientAddressReference: frozen.recipientAddressReference };
  },
};
