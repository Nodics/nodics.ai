/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module bidding/service/defaultBiddingAuctionService
 * @description Persists listing-wide auction commands, exact offers, funds checkpoints and one
 * immutable winner.
 * @layer service
 * @owner bidding
 * @remarks Bidding owns one persisted round with complete bounded offers, exact amount order, durable
 * command intent and revision CAS. All selection/cleanup/recovery routes use this aggregate. Loyalty
 * owns money; Checkout adopts the selected original hold; notifications cannot reverse a committed
 * command.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: fail, now, policy, graceDeadline, ports, same, hash, records, load, save,
 * participant, scheduler, isSeller, intake, publication, publicPublication, publicationContext, open,
 * project, read, list, amount, equalAmount, fundsPayload, qualified, reservation, intent, command,
 * finish, notify, place, withdraw, releaseBid, eligible, select, cleanup, settleHandoff, closeUnsold,
 * resume.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Uses the existing Bidding error contract.
   * @param {Object} message Owner input message; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {never} Never returns under the canonical Bidding error implementation.
   * @remarks Effects: No persistence.
   * Failure behavior: Throws the standard Bidding error for the supplied diagnostic.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fail: function (message) { return SERVICE.DefaultBiddingService.fail(message); },
  /**
   * Uses one overridable server clock; HTTP payload timestamps are never consulted.
   * @returns {number} Server timestamp in milliseconds.
   * @remarks Effects: Pure clock read; ignores HTTP timestamps.
   * Failure behavior: No deliberate exception.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  now: function () { return Date.now(); },
  /**
   * Reads and validates complete owner defaults before any auction operation.
   * @returns {Object} Complete validated auction policy.
   * @remarks Effects: Reads implementing config; never supplies duplicate defaults.
   * Failure behavior: Rejects invalid bounds, durations, owner ports or hold policy.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  policy: function () {
    const p = CONFIG.get("bidding").auction;
    if (!p || !["RESERVE_ON_BID", "RESERVE_ON_SELECTION"].includes(p.holdTiming) ||
        !Number.isFinite(p.graceHours) || p.graceHours < 0 || !Number.isSafeInteger(p.graceHours * 3600000) ||
        !Number.isFinite(new Date(p.graceHours * 3600000).getTime()) ||
        !Number.isSafeInteger(p.maximumBids) || p.maximumBids < 1 ||
        !Number.isSafeInteger(p.maximumCommands) || p.maximumCommands < p.maximumBids ||
        !Number.isSafeInteger(p.duePageSize) || p.duePageSize < 1)
      this.fail("Auction configuration is invalid");
    return p;
  },
  /**
   * Rejects unrepresentable end-plus-grace instants before publication effects or prior-round mutation.
   * @param {Object} endsAt Owner input endsAt; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} policy Validated effective framework policy.
   * @returns {string|null} Representable end-plus-grace ISO instant, or null for no end.
   * @remarks Effects: Pure date arithmetic before any mutation.
   * Failure behavior: Rejects invalid end, overflow or unrepresentable deadline.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  graceDeadline: function (endsAt, policy) {
    if (endsAt === null) return null;
    const deadline = Date.parse(endsAt) + policy.graceHours * 3600000;
    if (!Number.isSafeInteger(deadline) || !Number.isFinite(new Date(deadline).getTime()))
      this.fail('Auction grace deadline is invalid');
    return new Date(deadline).toISOString();
  },
  /**
   * Resolves only the configured framework owner adapter.
   * @returns {Object} Effective configured auction owner adapter.
   * @remarks Effects: Registry lookup only.
   * Failure behavior: Rejects missing or incompatible adapter.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  ports: function () {
    const ports = SERVICE[this.policy().portsService];
    if (!ports) this.fail("Auction ports are unavailable");
    return ports;
  },
  /**
   * Canonical typed equality never equates an employee or related Enterprise with the owner.
   * @param {Object} a Owner input a; exact shape is constrained by this operation's retained source
   * contract.
   * @param {Object} b Owner input b; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {boolean} Exact canonical typed-owner equality.
   * @remarks Effects: Pure comparison; employee/related Enterprise is not an owner alias.
   * Failure behavior: Invalid references do not gain equality.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  same: function (a, b) { return SERVICE.DefaultBiddingService.sameRef(a, b); },
  /**
   * Creates stable opaque identities without private values in public codes.
   * @param {Object} value Owner input value; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {string} Stable opaque command identity.
   * @remarks Effects: Pure deterministic hashing through Bidding owner.
   * Failure behavior: Serialization or owner hash errors propagate.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  hash: function (value) { return SERVICE.DefaultBiddingService.hash(value); },
  /**
   * Reads only generated owner services in the trusted enterprise partition.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} query Owner-scoped lookup selectors; never permission authority.
   * @param {Object} options Owner input options; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Promise<Object[]>} Scoped generated round records.
   * @remarks Effects: Protected generated read in admitted merchant partition.
   * Failure behavior: Rejects failed/invalid owner response.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  records: async function (request, query, options) {
    const result = await SERVICE.DefaultBiddingAuctionRoundService.get({
      ...SERVICE.DefaultBiddingService.context(request),
      query: { ...query, enterpriseCode: request.enterpriseCode },
      searchOptions: options || { pageSize: 1, pageNumber: 1 },
    });
    const value = SERVICE.DefaultBiddingAuctionPortsService.unwrap(result);
    return Array.isArray(value) ? value : value ? [value] : [];
  },
  /**
   * Missing and foreign records share the same failure.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {string} code Exact original owner record code.
   * @returns {Promise<Object>} Single retained round in the original tenant/Enterprise.
   * @remarks Effects: Exact protected read; no mutation.
   * Failure behavior: Missing and foreign/ambiguous records fail without disclosure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  load: async function (request, code) {
    const round = (await this.records(request, { code }))[0];
    if (!round || (request.storeCode && round.storeCode !== request.storeCode)) this.fail("Auction round was not found");
    return round;
  },
  /**
   * Every mutation uses the generated revision CAS, including progress after remote acknowledgements.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {Object} patch Owner input patch; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Promise<Object>} Read-back next round revision after CAS.
   * @remarks Effects: Persists one revision-fenced patch and atomic notification events.
   * Failure behavior: Rejects stale revision, failed CAS or contradictory readback.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  save: async function (request, round, patch) {
    patch = SERVICE.DefaultBiddingAuctionNotificationService.capture(round, patch);
    await SERVICE.DefaultBiddingAuctionRoundService.update({
      ...SERVICE.DefaultBiddingService.context(request),
      query: { code: round.code, enterpriseCode: request.enterpriseCode, revision: round.revision },
      model: { ...patch, code: round.code, revision: round.revision },
    });
    const next = await this.load(request, round.code);
    if (next.revision !== round.revision + 1) this.fail("Auction changed; retry the original command");
    return next;
  },
  /**
   * Establishes participant authority through existing signed Profile contracts.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Fresh typed participant plus canonical Store merchant partition.
   * @remarks Effects: Reads Profile and governed Store; retains signed purchaser Enterprise separately.
   * Failure behavior: Rejects denied/foreign participant or invalid Store placement.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  participant: async function (input) {
    const request = await SERVICE.DefaultBiddingService.participantContext(input);
    const storeCode = input.payload?.storeCode || input.storeCode;
    const store = CONFIG.get("bidding").stores[storeCode];
    if (!store?.enterpriseCode) this.fail("A governed auction store is required");
    return { ...request, storeCode, participantEnterpriseCode: request.enterpriseCode, enterpriseCode: store.enterpriseCode };
  },
  /**
   * Scheduled recovery is restricted to the configured runtime and an explicitly granted service
   * principal.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Object} Original admitted runtime scope.
   * @remarks Effects: Validates explicit service grant/runtime selection; does not mint a service
   * identity.
   * Failure behavior: Rejects unauthorized scheduler, tenant or runtime binding.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  scheduler: function (input) {
    const auth = input.authData || {}, policy = CONFIG.get("bidding"), runtime = CONFIG.get("runtimeRole");
    const groups = (auth.userGroups || auth.groups || []).map((g) => typeof g === "string" ? g : g.code);
    const router = SERVICE.DefaultSecuredRequestPipelineService;
    if (!policy.enabled || policy.runtimeRoles?.[typeof runtime === "string" ? runtime : runtime?.code] !== true ||
        auth.principalType !== "service" || auth.tokenType !== "service" || auth.tenant !== input.tenant ||
        !groups.includes("serviceAccountUserGroup") || !input.tenant ||
        !auth.loginId || !(auth.enterpriseCode || auth.entCode) ||
        (auth.enterpriseCode && auth.entCode && auth.enterpriseCode !== auth.entCode) ||
        !router?.isPermissionGranted("commerce.bid.manage", router.getGrantedPermissions(input), {}))
      this.fail("Authorized auction scheduler context is required");
    return { ...input, enterpriseCode: auth.enterpriseCode || auth.entCode };
  },
  /**
   * Determines seller authority from current signed owner entitlements.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {boolean} Whether a current signed seller reference matches this round.
   * @remarks Effects: Pure typed reference comparison.
   * Failure behavior: No seller authority is inferred from missing or unrelated references.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  isSeller: function (request, round) { return request.sellerRefs?.some((ref) => this.same(ref, round.sellerRef)) === true; },
  /**
   * Product intake excludes its end instant; grace is never an intake extension.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {boolean} Whether OPEN round admits intake at the owner clock instant.
   * @remarks Effects: Read-only retained window check; grace does not extend intake.
   * Failure behavior: Malformed retained dates cannot become open intake.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  intake: function (round) {
    return round.status === "OPEN" && (round.startsAt === null || Date.parse(round.startsAt) <= this.now()) &&
      (round.endsAt === null || this.now() < Date.parse(round.endsAt));
  },
  /**
   * Revalidates immutable publication terms and retained holdings without reapplying Product intake
   * expiry to grace selection.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<void>} Completes after current publication/hold terms match retained round.
   * @remarks Effects: Reads canonical owner evidence without changing intake/grace dates.
   * Failure behavior: Rejects changed publication, terms or uncertain holdings.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publication: async function (request, round) {
    const evidence = await this.ports().publication(request, { round });
    if (evidence?.confirmed !== true || evidence.publicationCode !== round.publicationCode || evidence.termsMatch !== true)
      this.fail("Auction publication terms or holdings changed");
  },
  /**
   * Reads bounded public publication/round coordinates without creating a round.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @returns {Promise<Object>} Public Product/publication/Store coordinates and matching round status.
   * @remarks Effects: Read-only fixed-owner adapter; does not open a round.
   * Failure behavior: Rejects unqualified owner/source input or foreign existing round.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publicPublication: async function (request) {
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'bidding');
    const p = request.httpRequest?.body ?? request.payload;
    if (auth.principalType !== 'service' || auth.tenant !== request.tenant || !auth.permissions?.includes('commerce.bid.participate') ||
        !p || Object.keys(p).sort().join(',') !== 'productCode,publicationCode,storeCode' ||
        Object.values(p).some(value => typeof value !== 'string' || !/^[A-Za-z0-9._:-]{1,180}$/.test(value))) this.fail('Public auction source is unavailable');
    const store = CONFIG.get('bidding').stores[p.storeCode];
    if (!store?.enterpriseCode) this.fail('Governed auction store is unavailable');
    const r = { tenant: request.tenant, authData: auth, enterpriseCode: store.enterpriseCode, storeCode: p.storeCode };
    const offer = await SERVICE[CONFIG.get('bidding').offerService].auction(r, p.productCode, p.storeCode);
    if (offer.publicationCode !== p.publicationCode) this.fail('Published auction revision changed');
    const listingKey = 'AUCTION_LISTING_' + this.hash([r.tenant, r.enterpriseCode, p.storeCode, p.productCode]);
    const code = 'AUCTION_' + this.hash([listingKey, p.publicationCode]);
    const row = (await this.records(r, { code }))[0];
    if (row && (row.tenant !== r.tenant || row.publicationCode !== p.publicationCode || row.productCode !== p.productCode ||
        row.storeCode !== p.storeCode)) this.fail('Public auction binding changed');
    return { productCode: p.productCode, publicationCode: p.publicationCode, storeCode: p.storeCode,
      roundCode: row?.code || null, status: row?.status || 'NOT_OPEN' };
  },
  /**
   * Reads current canonical terms for opening an auction without executing the open command.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Fresh opening terms/allowed actions, or current existing round
   * projection.
   * @remarks Effects: Read-only participant/publication admission; no holds or round creation.
   * Failure behavior: Rejects unauthorized participant or invalid canonical offer.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publicationContext: async function (input) {
    const request = await this.participant(input);
    const offer = await SERVICE[CONFIG.get('bidding').offerService].auction(request, input.code, request.storeCode);
    const listingKey = 'AUCTION_LISTING_' + this.hash([request.tenant, request.enterpriseCode, request.storeCode, input.code]);
    const code = 'AUCTION_' + this.hash([listingKey, offer.publicationCode]);
    const existing = (await this.records(request, { code }))[0];
    if (existing) return { round: this.project(request, existing), allowedActions: [] };
    const prior = (await this.records(request, { listingKey }))[0];
    const seller = request.sellerRefs.some(ref => this.same(ref, offer.sellerRef));
    const possible = seller && (offer.endsAt === null || Date.parse(offer.endsAt) > this.now()) &&
      (!prior || !prior.pending && prior.cleanupComplete && ['CANCELLED', 'UNSOLD', 'FAILED'].includes(prior.status));
    return { publicationCode: offer.publicationCode, productCode: input.code, storeCode: request.storeCode,
      variantCodes: offer.product.variantCodes, floor: offer.floor, currency: offer.store.currency,
      startsAt: offer.startsAt, endsAt: offer.endsAt, participantRole: seller ? 'SELLER' : 'VIEWER',
      allowedActions: possible ? ['OPEN'] : [] };
  },
  /**
   * Opens one immutable publication round after Product/Digital confirms listing ownership and holds.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original new or replayed round projection.
   * @remarks Effects: Persists one round after held-publication proof; no caller-supplied monetary
   * terms.
   * Failure behavior: Rejects duplicate-conflicting intake, owner denial or uncertain insert.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  open: async function (input) {
    const request = await this.participant(input), p = request.payload || {}, policy = this.policy();
    SERVICE.DefaultBiddingService.command(request);
    const offerOwner = SERVICE[CONFIG.get("bidding").offerService];
    const offer = await offerOwner.auction(request, p.productCode, p.storeCode);
    const graceEndsAt = this.graceDeadline(offer.endsAt, policy);
    if (p.publicationCode !== undefined && p.publicationCode !== offer.publicationCode) this.fail('Published auction terms changed; review the new publication');
    if (!request.sellerRefs.some((ref) => this.same(ref, offer.sellerRef))) this.fail("Only the published seller may open this round");
    if (!(offer.product.variantCodes || []).includes(p.variantCode)) this.fail("Choose a published offer variant");
    const listingKey = "AUCTION_LISTING_" + this.hash([request.tenant, request.enterpriseCode, p.storeCode, p.productCode]);
    const code = "AUCTION_" + this.hash([listingKey, offer.publicationCode]);
    const existing = (await this.records(request, { code }))[0];
    if (existing) {
      if (existing.variantCode !== p.variantCode) this.fail("Round belongs to another published variant");
      return this.project(request, existing);
    }
    if (offer.endsAt !== null && Date.parse(offer.endsAt) <= this.now()) this.fail("Auction publication already ended");
    const prior = (await this.records(request, { listingKey }))[0];
    if (prior?.pending) this.fail("Previous round has unresolved commands");
    if (prior && !["CANCELLED", "UNSOLD", "SELECTED", "FAILED"].includes(prior.status)) this.fail("Cancel the existing round before editing or republishing");
    if (prior && !prior.cleanupComplete) this.fail("Previous round releases remain unresolved");
    const proof = await this.ports().publication(request, { offer, previousRound: prior || null });
    if (proof?.confirmed !== true || proof.publicationCode !== offer.publicationCode ||
        (["SELECTED", "FAILED"].includes(prior?.status) && proof.previousPurchaseReconciled !== true))
      this.fail("Listing publication or previous purchase is not reconciled");
    if (prior) await this.save(request, prior, { listingKey: prior.code });
    const model = {
      code, listingKey, tenant: request.tenant, enterpriseCode: request.enterpriseCode, publicationCode: offer.publicationCode,
      productCode: p.productCode, storeCode: p.storeCode, variantCode: p.variantCode,
      sellerRef: offer.sellerRef, sourceRef: offer.sourceRef, floor: offer.floor, currency: offer.store.currency,
      startsAt: offer.startsAt, endsAt: offer.endsAt,
      graceEndsAt,
      policy: { holdTiming: policy.holdTiming, graceHours: policy.graceHours,
        maximumBids: policy.maximumBids, maximumCommands: policy.maximumCommands },
      status: "OPEN", revision: 0, sequence: 0, bids: {}, commands: {}, pending: null,
      selection: null, cleanupComplete: false, active: true, createdAt: new Date(this.now()),
    };
    try {
      await SERVICE.DefaultBiddingAuctionRoundService.save({ ...SERVICE.DefaultBiddingService.context(request), model });
    } catch (error) {
      const raced = (await this.records(request, { code }))[0];
      if (!raced) throw error;
    }
    return this.project(request, await this.load(request, code));
  },
  /**
   * Returns complete seller/own offers but only aggregate values to other participants.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Object} Role-scoped round DTO with authorized own/seller offers and aggregate public
   * values.
   * @remarks Effects: Pure redacted projection; no wallet/contact authority.
   * Failure behavior: Does not broaden absent participant/seller admission.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  project: function (request, round) {
    const all = Object.values(round.bids), current = all.filter((bid) => (bid.status === "OPEN" || bid.status === "SELECTED") &&
      !(round.pending?.action === "UPDATE" && round.pending.bidCode === bid.code));
    const highest = current.reduce((value, bid) => value === null || SERVICE.DefaultExactAmountService.compare(bid.amount, value) > 0 ? bid.amount : value, null);
    const seller = this.isSeller(request, round);
    const bids = all.filter((bid) => seller || this.same(request.buyerRef, bid.buyerRef)).map((bid) => ({
      code: bid.code, amount: bid.amount, revision: bid.revision, status: bid.status,
      successfulOrder: bid.successfulOrder, history: bid.history.map(({ amount, revision, successfulOrder, at }) => ({ amount, revision, successfulOrder, at })),
      ...(seller ? { buyerRef: bid.buyerRef } : {}),
      fundsStatus: round.pending?.action === "UPDATE" && round.pending.bidCode === bid.code ? "PROCESSING"
        : round.status === "FAILED" && round.selection?.bidCode === bid.code ? "RECONCILED"
        : bid.release ? "RELEASED" : bid.reservation ? "RESERVED" : "NOT_RESERVED",
      allowedActions: !round.pending && this.intake(round) && bid.status === "OPEN" && this.same(request.buyerRef, bid.buyerRef)
        ? ["UPDATE", "WITHDRAW"] : [],
    }));
    const selected = round.selection && (seller || this.same(request.buyerRef, round.selection.buyerRef));
    return {
      code: round.code, publicationCode: round.publicationCode, productCode: round.productCode,
      storeCode: round.storeCode, variantCode: round.variantCode, revision: round.revision, status: round.status,
      floor: round.floor, currency: round.currency, startsAt: round.startsAt, endsAt: round.endsAt,
      graceEndsAt: round.graceEndsAt, holdTiming: round.policy.holdTiming,
      highestAmount: highest, bidCount: current.length, bids, processing: !!round.pending,
      participantRole: seller ? "SELLER" : all.some(bid => this.same(request.buyerRef, bid.buyerRef)) ? "BUYER" : "VIEWER",
      cleanupComplete: round.cleanupComplete,
      allowedActions: round.pending ? [] : this.intake(round)
        ? [...(request.buyerRef && !this.same(request.buyerRef, round.sellerRef) ? ["PLACE"] : []), ...(seller ? ["SELECT", "CANCEL"] : [])]
        : seller && round.status === "GRACE" && this.now() < Date.parse(round.graceEndsAt) ? ["SELECT"] : [],
      ...(selected ? { selection: { bidCode: round.selection.bidCode, amount: round.selection.amount,
        status: round.status === "FAILED" ? "FAILED_RECONCILED" : round.selection.handoff ? "CHECKOUT_READY" : "PROCESSING", priceQuoteCode: round.selection.priceQuoteCode,
        cartCode: round.selection.checkout?.cartCode, orderCode: round.selection.checkout?.orderCode,
        expiresAt: round.selection.checkout?.expiresAt,
        ...(!seller && this.same(request.buyerRef, round.selection.buyerRef) && round.selection.handoff && round.status === 'SELECTED'
          ? { purchase: { kind: 'AUCTION', roundCode: round.code, bidCode: round.selection.bidCode,
            storeCode: round.storeCode, productCode: round.productCode, variantCode: round.variantCode,
            cartCode: round.selection.checkout.cartCode, orderCode: round.selection.checkout.orderCode,
            priceQuoteCode: round.selection.priceQuoteCode, amount: round.selection.amount, currency: round.currency,
            expiresAt: round.selection.checkout.expiresAt } } : {}) } } : {}),
    };
  },
  /**
   * Reads one authorized partition without exposing another bidder's private offers or wallet.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Authorized projection of one original round.
   * @remarks Effects: Fresh participant read and exact scoped round lookup.
   * Failure behavior: Rejects foreign/missing round or current participant denial.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  read: async function (input) {
    const request = await this.participant(input);
    return this.project(request, await this.load(request, request.code));
  },
  /**
   * Pages participant histories without truncating round offers or exposing another buyer's rows.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Bounded owned/managed rounds page with continuation.
   * @remarks Effects: Reads scoped history; filters typed participant/seller membership.
   * Failure behavior: Rejects invalid pagination or failed/incomplete owner reads.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  list: async function (input) {
    const request = await this.participant(input), size = this.policy().duePageSize;
    if (input.afterCode !== undefined && (typeof input.afterCode !== "string" || input.afterCode.length > 200))
      this.fail("Auction continuation is invalid");
    const rows = await this.records(request, { storeCode: request.storeCode,
      ...(input.afterCode ? { code: { $gt: input.afterCode } } : {}) },
    { pageSize: size + 1, pageNumber: 1, sort: { code: 1 } });
    const page = rows.slice(0, size);
    return { rounds: page.filter(round => this.isSeller(request, round) ||
      Object.values(round.bids).some(bid => this.same(request.buyerRef, bid.buyerRef))).map(round => this.project(request, round)),
    afterCode: rows.length > size ? page[page.length - 1].code : null };
  },
  /**
   * Normalizes reviewed amount using shared exact arithmetic; reward precision comes from Loyalty
   * qualification.
   * @param {Object} value Owner input value; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} floor Owner input floor; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {string} Canonical exact decimal amount satisfying the floor.
   * @remarks Effects: Pure exact arithmetic; reward precision remains Loyalty-owned.
   * Failure behavior: Rejects malformed, negative or below-floor amount.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  amount: function (value, floor) {
    if (typeof value !== "string" || value.length > 32) this.fail("An exact bid amount is required");
    const amount = SERVICE.DefaultExactAmountService.normalize(value);
    if (SERVICE.DefaultExactAmountService.compare(amount, floor) < 0) this.fail("Bid is below the published listing price");
    return amount;
  },
  /**
   * Compares canonical decimal values without rejecting the funds owner's fixed-scale representation.
   * @param {Object} left Owner input left; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} right Owner input right; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {boolean} Exact decimal equality even when representations use different scales.
   * @remarks Effects: Pure exact comparison.
   * Failure behavior: Malformed values return false.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  equalAmount: function (left, right) {
    try { return typeof left === "string" && typeof right === "string" && SERVICE.DefaultExactAmountService.compare(left, right) === 0; }
    catch { return false; }
  },
  /**
   * Builds an owner request tied to retained funding identity, amount and round provenance.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {Object} bid Owner input bid; exact shape is constrained by this operation's retained source
   * contract.
   * @param {Object} key Owner input key; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {Object} Retained typed buyer/actor, amount, hold and original round/key command.
   * @remarks Effects: Pure command derivation; not execution authority by itself.
   * Failure behavior: Required retained terms are validated by the receiving owner.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  fundsPayload: function (round, bid, key) {
    return {
      ownerRef: bid.buyerRef, actorRef: bid.actorRef, ownerId: bid.buyerId,
      ...bid.funding, amount: bid.amount, reservationCode: bid.reservation?.code,
      sourceType: "BIDDING", sourceCode: bid.code, targetType: "AUCTION_ROUND", targetCode: round.code,
      idempotencyKey: key, correlationId: round.code, expiresAt: null,
      holdUntilRelease: true, roundCode: round.code, publicationCode: round.publicationCode,
      storeCode: round.storeCode, currency: round.currency,
    };
  },
  /**
   * Validates funds qualification without accepting a caller's claimed wallet ownership or limit.
   * @param {Object} result Owner input result; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} amount Owner input amount; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Object} Validated canonical wallet/program/reward/precision qualification tuple.
   * @remarks Effects: Checks current owner-issued funds admission; no hold mutation.
   * Failure behavior: Rejects foreign owner/actor, wrong amount/currency, failed spending or malformed
   * qualification.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  qualified: function (result, request, amount) {
    if (result?.eligible !== true || result.affordable !== true || result.actorAuthorized !== true ||
        result.withinLimit !== true || !this.same(result.ownerRef, request.buyerRef) || !this.equalAmount(result.amount, amount) ||
        !Number.isSafeInteger(result.scale) || SERVICE.DefaultExactAmountService.parse(amount).scale > result.scale ||
        !["walletCode", "programCode", "rewardTypeCode"].every((key) => typeof result[key] === "string" && result[key]))
      this.fail("Bid funds, precision or actor spending authority are unavailable");
    return { walletCode: result.walletCode, programCode: result.programCode, rewardTypeCode: result.rewardTypeCode,
      scale: result.scale, qualificationCode: result.qualificationCode };
  },
  /**
   * Validates a full durable reservation; a reference alone is not a funding acknowledgement.
   * @param {Object} result Owner input result; exact shape is constrained by this operation's retained
   * source contract.
   * @param {Object} bid Owner input bid; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {Object} Complete durable reservation receipt for the original bid.
   * @remarks Effects: Read-only owner proof validation.
   * Failure behavior: Rejects reference-only, partial, wrong-amount or foreign holds.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  reservation: function (result, bid) {
    const r = result?.reservation;
    if (!r?.code || r.status !== "RESERVED" || !this.equalAmount(r.amount, bid.amount) ||
        r.walletCode !== bid.funding.walletCode || r.programCode !== bid.funding.programCode ||
        r.rewardTypeCode !== bid.funding.rewardTypeCode || r.expiresAt !== null || r.holdUntilRelease !== true)
      this.fail("Durable full auction reservation is not confirmed");
    return r;
  },
  /**
   * Prepares authorized immutable command terms before acquiring the round fence.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {Object} key Owner input key; exact shape is constrained by this operation's retained source
   * contract.
   * @param {Object} hash Owner input hash; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Promise<Object>} Authorized immutable pending command terms.
   * @remarks Effects: May read owner eligibility before persisting the round fence; no replacement
   * intent.
   * Failure behavior: Rejects unsupported action, stale terms or unauthorized actor.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  intent: async function (request, round, key, hash) {
    const p = request.payload, action = p.action;
    if (!["PLACE", "UPDATE", "WITHDRAW", "SELECT", "CANCEL"].includes(action)) this.fail("Unsupported auction action");
    if (p.expectedRevision !== round.revision) this.fail("Auction changed; reload before confirming");
    const seller = this.isSeller(request, round), old = round.bids[p.bidCode];
    if (["SELECT", "CANCEL"].includes(action) && !seller) this.fail("Only the seller may perform this auction action");
    if (["PLACE", "UPDATE", "WITHDRAW"].includes(action) && !request.buyerRef) this.fail("Authorized buyer ownership is required");
    if (["UPDATE", "WITHDRAW"].includes(action) && (!old || !this.same(request.buyerRef, old.buyerRef) || old.status !== "OPEN" || old.revision !== p.bidRevision))
      this.fail("Bid changed or is not owned by this participant");
    if (action === "SELECT") {
      if (!old || old.status !== "OPEN" || old.revision !== p.bidRevision) this.fail("Selected bid changed");
      if (!(this.intake(round) || (round.endsAt !== null && ["OPEN", "GRACE"].includes(round.status) &&
          this.now() >= Date.parse(round.endsAt) && this.now() < Date.parse(round.graceEndsAt))))
        this.fail("Seller selection window is closed");
    } else if (!this.intake(round)) this.fail("Auction intake is closed");
    const pending = { key, hash, action, bidCode: p.bidCode, actorRef: request.actorRef,
      buyerRef: request.buyerRef, buyerId: request.buyerRef?.schema === "enterprise" ? request.buyerRef.code : request.ownerId,
      startedAt: new Date(this.now()).toISOString() };
    if (["PLACE", "UPDATE", "SELECT"].includes(action)) await this.publication(request, round);
    if (["PLACE", "UPDATE"].includes(action)) {
      if (this.same(request.buyerRef, round.sellerRef)) this.fail("You cannot bid on your own listing");
      if (action === "PLACE" && Object.keys(round.bids).length >= round.policy.maximumBids) this.fail("Auction bid capacity reached");
      const amount = this.amount(p.amount, round.floor);
      pending.bidCode = action === "PLACE" ? "OFFER_" + key : old.code;
      pending.amount = amount;
      if (old?.amount === amount) pending.unchanged = true;
      else {
        const qualification = await this.ports().qualify(request, {
          ownerRef: request.buyerRef, actorRef: request.actorRef, amount, currency: round.currency,
          roundCode: round.code, storeCode: round.storeCode, productCode: round.productCode,
          reservationCode: old?.reservation?.code, funding: p.funding,
          idempotencyKey: key + ":qualify",
        });
        pending.funding = this.qualified(qualification, request, amount);
        if (old && ["walletCode", "programCode", "rewardTypeCode"].some((field) => pending.funding[field] !== old.funding[field]))
          this.fail("An update cannot replace the original funding account");
      }
    }
    // The remote qualification can cross the Product deadline. Fence only after rechecking the server clock.
    if (action !== "SELECT" && !this.intake(round)) this.fail("Auction intake is closed");
    if (action === "SELECT" && round.graceEndsAt !== null && this.now() >= Date.parse(round.graceEndsAt))
      this.fail("Seller selection window is closed");
    return pending;
  },
  /**
   * Acquires a durable command fence, or resumes exactly the same command after an uncertain response.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Current projection after original command execution/replay.
   * @remarks Effects: Acquires retained round fence and resumes the same key after uncertainty.
   * Failure behavior: Rejects key reuse with different terms or competing pending command.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  command: async function (input) {
    const request = await this.participant(input), userKey = SERVICE.DefaultBiddingService.command(request);
    let round = await this.load(request, request.code);
    const key = this.hash([round.code, request.actorRef, userKey]);
    const p = request.payload;
    const hash = this.hash([p.action, p.bidCode, p.amount, p.expectedRevision, p.bidRevision, p.funding]);
    if (round.commands[key]) {
      if (round.commands[key] !== hash) this.fail("Command reference belongs to different auction terms");
      return this.project(request, round);
    }
    if (round.pending) {
      if (round.pending.key !== key || round.pending.hash !== hash) this.fail("Auction has a pending command; reconcile it first");
    } else {
      if (["PLACE", "UPDATE"].includes(p.action) && Object.keys(round.commands).length >= round.policy.maximumCommands)
        this.fail("Auction command capacity reached");
      const pending = await this.intent(request, round, key, hash);
      round = await this.save(request, round, { pending });
    }
    round = await this.resume(request, round);
    return this.project(request, round);
  },
  /**
   * Completes the original command without resetting placement priority on response replay.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {Object} patch Owner input patch; exact shape is constrained by this operation's retained
   * source contract.
   * @returns {Promise<Object>} Final retained round after original intent completion and notification
   * attempt.
   * @remarks Effects: CAS-completes original command without resetting bid priority; notification is
   * post-commit.
   * Failure behavior: CAS failures remain recoverable; notification failure cannot undo commit.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  finish: async function (request, round, patch) {
    round = await this.save(request, round, { ...patch, commands: { ...round.commands, [round.pending.key]: round.pending.hash }, pending: null });
    return this.notify(request, round);
  },
  /**
   * Notification failure cannot roll back a committed auction command or claim delivery.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Original or refreshed committed round with notification state.
   * @remarks Effects: Attempts existing notification owner only after business commit.
   * Failure behavior: Delivery failure is retained and never reverts auction effects.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  notify: async function (request, round) {
    if (CONFIG.get('bidding').auction.notifications?.enabled !== true || !round.notificationPending) return round;
    try { await SERVICE.DefaultBiddingAuctionNotificationService.flush(request, round.code); } catch (_) { /* Retained evidence remains due. */ }
    return this.load(request, round.code);
  },
  /**
   * Completes a funds-backed placement/update only after the full new amount is confirmed.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Round after original placement/update or retained recovery outcome.
   * @remarks Effects: Qualifies/reserves/adjusts exact full offer then persists confirmed bid under
   * existing fence.
   * Failure behavior: Unknown funding remains recoverable; never treats partial hold as success.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  place: async function (request, round) {
    const p = round.pending, old = round.bids[p.bidCode];
    if (p.unchanged) return this.finish(request, round, {});
    let bid = p.fundedBid || { ...old, code: p.bidCode, buyerRef: p.buyerRef, actorRef: p.actorRef, buyerId: p.buyerId,
      amount: p.amount, funding: p.funding, status: "OPEN", revision: old ? old.revision + 1 : 0 };
    if (!p.fundedBid && round.policy.holdTiming === "RESERVE_ON_BID") {
      const payload = this.fundsPayload(round, bid, p.key + ":funds");
      const result = old ? await this.ports().adjust(request, payload) : await this.ports().reserve(request, payload);
      bid.reservation = this.reservation(result, bid);
      round = await this.save(request, round, { pending: { ...p, fundedBid: bid } });
    }
    bid.successfulOrder = round.sequence + 1;
    bid.history = [...(old?.history || []), { amount: bid.amount, revision: bid.revision,
      successfulOrder: bid.successfulOrder, actorRef: p.actorRef, at: new Date(this.now()).toISOString() }];
    // Intake may close during funding. Complete the fenced obligation, but never acknowledge a late active offer.
    if (!this.intake(round)) {
      if (old) {
        if (round.policy.holdTiming === "RESERVE_ON_BID") {
          const restored = this.reservation(await this.ports().adjust(request,
            this.fundsPayload(round, old, p.key + ":restore-original")), old);
          round = await this.save(request, round, { bids: { ...round.bids, [old.code]: { ...old, reservation: restored } } });
        }
        return this.finish(request, round, {});
      }
      bid.status = "EXPIRED";
      round = await this.save(request, round, { bids: { ...round.bids, [bid.code]: bid } });
      round = await this.releaseBid(request, round, bid.code, p.key);
      return this.finish(request, round, {});
    }
    return this.finish(request, round, { bids: { ...round.bids, [bid.code]: bid }, sequence: bid.successfulOrder });
  },
  /**
   * Confirms withdrawal before requesting release; no hold means no monetary movement.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Round after original withdrawal and release reconciliation.
   * @remarks Effects: Persists withdrawal before idempotent original-hold release.
   * Failure behavior: Uncertain release retains original pending intent.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  withdraw: async function (request, round) {
    const p = round.pending, bid = round.bids[p.bidCode];
    if (bid.status === "OPEN") {
      if (!this.intake(round)) return this.finish(request, round, {});
      round = await this.save(request, round, { bids: { ...round.bids, [bid.code]: { ...bid, status: "WITHDRAWN", revision: bid.revision + 1 } } });
    }
    round = await this.releaseBid(request, round, bid.code, p.key);
    return this.finish(request, round, {});
  },
  /**
   * Reconciles one original remaining hold with an idempotent owner release.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {string} code Exact original owner record code.
   * @param {Object} key Owner input key; exact shape is constrained by this operation's retained source
   * contract.
   * @returns {Promise<Object>} Round with verified original hold release, or unchanged when no hold
   * exists.
   * @remarks Effects: Calls protected Loyalty release and CAS-retains its acknowledgement.
   * Failure behavior: Rejects foreign/mismatched release receipt or unresolved owner effect.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  releaseBid: async function (request, round, code, key) {
    const bid = round.bids[code];
    if (!bid.reservation || bid.release) return round;
    const result = await this.ports().release(request, this.fundsPayload(round, bid, key + ":release:" + code));
    const reservation = result?.reservation;
    if (reservation?.code !== bid.reservation.code || reservation.status !== "RELEASED") this.fail("Auction hold release is not confirmed");
    return this.save(request, round, { bids: { ...round.bids, [code]: { ...bid, release: { reservationCode: reservation.code, status: "RELEASED" } } } });
  },
  /**
   * Reads every active offer; unknown funding evidence stops selection rather than silently skipping it.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object[]>} Complete eligible offers ordered by exact amount then retained
   * successful order.
   * @remarks Effects: Reads every active offer's authoritative funding; no winner mutation.
   * Failure behavior: Unknown funds abort selection rather than silently skipping a bidder.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  eligible: async function (request, round) {
    await this.publication(request, round);
    const result = [];
    for (const bid of Object.values(round.bids).filter((item) => item.status === "OPEN")) {
      const evidence = await this.ports().inspect(request, this.fundsPayload(round, bid, round.pending.key + ":inspect:" + bid.code));
      if (!evidence || typeof evidence.eligible !== "boolean" || evidence.confirmed !== true ||
          !this.same(evidence.ownerRef, bid.buyerRef) || !this.equalAmount(evidence.amount, bid.amount))
        this.fail("Auction eligibility is uncertain; recover the original command");
      if (evidence.eligible) {
        if (round.policy.holdTiming === "RESERVE_ON_BID") this.reservation(evidence, bid);
        result.push(bid);
      }
    }
    return result.sort((a, b) => SERVICE.DefaultExactAmountService.compare(b.amount, a.amount) || a.successfulOrder - b.successfulOrder);
  },
  /**
   * Selects exactly once; both seller choice and due-work use this same persisted winner transition.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @param {Object} automatic Owner input automatic; exact shape is constrained by this operation's
   * retained source contract.
   * @returns {Promise<Object>} Round after persisted single winner selection and original handoff.
   * @remarks Effects: Uses one shared seller/automatic winner transition; may acquire winner hold per
   * retained policy.
   * Failure behavior: Rejects unavailable eligibility/hold proof or conflicting existing selection.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  select: async function (request, round, automatic) {
    if (round.status === "SELECTED") return this.settleHandoff(request, round);
    const eligible = round.pending.chosenBidCode ? [] : await this.eligible(request, round);
    if (!round.pending.chosenBidCode && round.graceEndsAt !== null && this.now() >= Date.parse(round.graceEndsAt)) automatic = true;
    let winner = round.pending.chosenBidCode ? round.bids[round.pending.chosenBidCode]
      : automatic ? eligible[0] : eligible.find((bid) => bid.code === round.pending.bidCode);
    if (!winner) {
      if (!automatic) return this.finish(request, round, {});
      return this.closeUnsold(request, round);
    }
    if (!round.pending.chosenBidCode) {
      round = await this.save(request, round, { pending: { ...round.pending, chosenBidCode: winner.code } });
    }
    if (round.policy.holdTiming === "RESERVE_ON_SELECTION") {
      winner = { ...winner, reservation: this.reservation(await this.ports().reserve(request,
        this.fundsPayload(round, winner, round.pending.key + ":winner-funds")), winner) };
    }
    const selection = { bidCode: winner.code, bidRevision: winner.revision, amount: winner.amount,
      buyerRef: winner.buyerRef, buyerId: winner.buyerId, sellerRef: round.sellerRef,
      reservation: winner.reservation, selectedAt: new Date(this.now()).toISOString(),
      commandKey: round.pending.key, automatic };
    const bids = Object.fromEntries(Object.values(round.bids).map((bid) => [bid.code,
      bid.code === winner.code ? { ...winner, status: "SELECTED" } : bid.status === "OPEN" ? { ...bid, status: "UNSUCCESSFUL" } : bid]));
    round = await this.save(request, round, { status: "SELECTED", selection, bids });
    return this.settleHandoff(request, round);
  },
  /**
   * Releases all losers before any Checkout preparation, without waiting for the winning purchase.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Round with all original loser releases durably reconciled.
   * @remarks Effects: Releases losers before any Checkout handoff and retains cleanup completion.
   * Failure behavior: Any uncertain loser release blocks handoff.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  cleanup: async function (request, round) {
    if (round.cleanupComplete) return round;
    for (const bid of Object.values(round.bids)) {
      if (bid.code !== round.selection?.bidCode) round = await this.releaseBid(request, round, bid.code, round.pending.key);
    }
    if (["CANCELLED", "UNSOLD", "FAILED"].includes(round.status)) {
      const result = await this.ports().releaseListing(request, { round, idempotencyKey: round.code + ":listing-release" });
      if (result?.confirmed !== true || result.publicationCode !== round.publicationCode || result.status !== "RELEASED")
        this.fail("Listing holdings release is not confirmed");
    }
    return this.save(request, round, { cleanupComplete: true });
  },
  /**
   * Hands one selected original reservation to shared Pricing/Checkout; never captures funds here.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Selected round with original Checkout/quote/hold handoff retained.
   * @remarks Effects: Delegates prepare/bind to existing Pricing/Checkout; never captures here.
   * Failure behavior: Uncertain owner receipts retain original selected recovery; no replacement winner.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settleHandoff: async function (request, round) {
    round = await this.cleanup(request, round);
    let selection = round.selection;
    const bid = round.bids[selection.bidCode];
    if (!selection.checkout) {
      const checkout = await this.ports().prepareCheckout(request, { round, bid, selection, idempotencyKey: selection.commandKey + ":checkout" });
      if (checkout?.confirmed !== true || !checkout.orderCode || !checkout.cartCode ||
          !Number.isFinite(Date.parse(checkout.expiresAt)) || Date.parse(checkout.expiresAt) <= this.now())
        this.fail("Checkout has not confirmed selected purchase validity");
      round = await this.save(request, round, { selection: { ...selection, checkout } });
      selection = round.selection;
    }
    const priceQuoteCode = round.code + "_QUOTE";
    if (!selection.priceQuoteCode) {
      await SERVICE.DefaultNegotiatedPriceService.issue({ ...request, authData: SERVICE.DefaultBiddingService.context(request).authData }, {
        code: priceQuoteCode, ownerId: selection.buyerId, buyerRef: selection.buyerRef,
        productCode: round.productCode, variantCode: round.variantCode, storeCode: round.storeCode,
        currency: round.currency, quantity: "1", unitAmount: selection.amount,
        cartCode: selection.checkout.cartCode, orderCode: selection.checkout.orderCode,
        expiresAt: selection.checkout.expiresAt, correlationId: round.code,
        sourceRef: { module: "bidding", schema: "biddingAuctionRound", code: round.code },
      });
      round = await this.save(request, round, { selection: { ...selection, priceQuoteCode } });
      selection = round.selection;
    }
    if (!selection.handoff) {
      const result = await this.ports().bindCheckout(request, { round, bid, selection, priceQuoteCode,
        idempotencyKey: selection.commandKey + ":bind" });
      if (result?.confirmed !== true || result.reservationCode !== selection.reservation.code ||
          result.orderCode !== selection.checkout.orderCode) this.fail("Original winner hold handoff is not confirmed");
      round = await this.save(request, round, { selection: { ...selection, handoff: { confirmed: true, orderCode: result.orderCode } } });
    }
    return this.finish(request, round, {});
  },
  /**
   * Closes without a winner only after complete eligibility reads and while holding the round fence.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Terminal unsold round after complete cleanup.
   * @remarks Effects: Persists terminal state and reconciles all original holds while holding fence.
   * Failure behavior: Incomplete eligibility or release proof prevents terminal success.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  closeUnsold: async function (request, round) {
    const bids = Object.fromEntries(Object.values(round.bids).map((bid) => [bid.code, bid.status === "OPEN" ? { ...bid, status: "UNSUCCESSFUL" } : bid]));
    round = await this.save(request, round, { status: "UNSOLD", bids });
    return this.finish(request, await this.cleanup(request, round), {});
  },
  /**
   * Dispatches only a persisted authorized command. Failures leave the same intent recoverable.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} round Persisted original Bidding round and retained terms.
   * @returns {Promise<Object>} Current round after dispatching only its persisted original intent.
   * @remarks Effects: Resumes original placement/withdrawal/selection/cleanup with identical keys.
   * Failure behavior: Unknown/unauthorized intent or unresolved owner effect remains recoverable.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resume: async function (request, round) {
    if (!round.pending) return round;
    if (round.status === "SELECTED") return this.settleHandoff(request, round);
    if (["CANCELLED", "UNSOLD", "FAILED"].includes(round.status)) return this.finish(request, await this.cleanup(request, round), {});
    switch (round.pending.action) {
      case "PLACE": case "UPDATE": return this.place(request, round);
      case "WITHDRAW": return this.withdraw(request, round);
      case "SELECT": return this.select(request, round, false);
      case "CANCEL": {
        if (!this.intake(round)) return this.finish(request, round, {});
        const bids = Object.fromEntries(Object.values(round.bids).map((bid) => [bid.code, bid.status === "OPEN" ? { ...bid, status: "CANCELLED" } : bid]));
        round = await this.save(request, round, { status: "CANCELLED", bids });
        return this.finish(request, await this.cleanup(request, round), {});
      }
      case "CLOSE": {
        if (round.endsAt === null || this.now() < Date.parse(round.endsAt)) return this.finish(request, round, {});
        if (this.now() >= Date.parse(round.graceEndsAt)) return this.select(request, round, true);
        const eligible = await this.eligible(request, round);
        if (!eligible.length) return this.closeUnsold(request, round);
        return this.finish(request, round, { status: "GRACE" });
      }
      default: this.fail("Unknown persisted auction command");
    }
  },
};
