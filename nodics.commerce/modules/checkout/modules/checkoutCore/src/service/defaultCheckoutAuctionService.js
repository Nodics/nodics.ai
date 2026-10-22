/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
const crypto = require("node:crypto");
const { isDeepStrictEqual: same } = require("node:util");

/**
 * @module checkoutCore/service/defaultCheckoutAuctionService
 * @description Owns selected-auction purchase commitments, Cart binding, original-phase recovery and terminal funds fences over Bidding's retained hold.
 * @layer service
 * @owner checkoutCore
 * Inputs are admitted participant/scheduler contexts and original selection/command coordinates. Outputs include private records, prepared/bound purchase DTOs and bounded status/evidence.
 * Read members revalidate owner evidence. Mutating members use generated persistence; placement and cancellation dispatch existing Commerce/Payment ports and may leave durable partial progress on failure.
 * Validation, changed identity, unqualified concurrency and uncertain owner acknowledgements throw/reject. No callback API or inferred financial success is provided.
 * @override Override effective members through layered services while retaining original owner/actor, command, merchant/participant partition and hold. Never introduce another reserve, conflicting terminal decision or automatic re-award.
 */
module.exports = {
  /**
   * Hashes a JSON-serializable command or identity tuple.
   * @param {*} value Value serialized in its existing property/array order.
   * @returns {string} SHA256 hexadecimal digest.
   * @throws {Error} Propagates JSON serialization or hash input failures.
   * @sideEffects None.
   * @override Keep deterministic serialization for retained command identities; this hash is not authorization.
   */
  hash: function (value) { return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex"); },
  /**
   * Refuses an incomplete or conflicting purchase operation.
   * @param {string} message Failure description.
   * @returns {never} Always throws.
   * @throws {Error} Error with the supplied message.
   * @sideEffects None.
   * @override Preserve fail-closed behavior.
   */
  fail: function (message) { throw new Error(message); },
  /**
   * Computes a representable deadline from owner-configured validity.
   * @param {number} now Safe-integer epoch milliseconds.
   * @returns {string} ISO timestamp using the validated purchaseValiditySeconds.
   * @throws {Error} Rejects missing/invalid bounds, duration, arithmetic or Date range.
   * @sideEffects Reads configuration only; does not expire a hold or update existing commitments.
   * @override Keep configured bounds and representability checks; existing deadlines remain retained.
   */
  purchaseDeadline: function (now) {
    const policy = CONFIG.get("checkoutCore")?.auction, duration = policy?.purchaseValiditySeconds;
    const range = policy?.validation?.purchaseValiditySeconds, timestamp = now + duration * 1000;
    if (!range || !Number.isSafeInteger(range.minimum) || range.minimum < 1 ||
        !Number.isSafeInteger(range.maximum) || range.maximum < range.minimum ||
        !Number.isSafeInteger(duration) || duration < range.minimum || duration > range.maximum ||
        !Number.isSafeInteger(now) || !Number.isSafeInteger(timestamp) || !Number.isFinite(new Date(timestamp).getTime()))
      this.fail("Auction purchase duration must be configured within valid bounds");
    return new Date(timestamp).toISOString();
  },
  /**
   * Builds private generated-persistence context after admission.
   * @param {Object} request Admitted tenant, Enterprise and original auth context.
   * @returns {Object} Tenant, Checkout service authData and uncached/nonrecursive options.
   * @throws {Error} Rejects absent partition or propagates private-auth construction failure.
   * @sideEffects No storage operation is dispatched.
   * @override Preserve admission by callers and the existing serviceAuthData boundary.
   */
  context: function (request) {
    if (!request.tenant || !request.enterpriseCode) this.fail("Auction purchase partition is unavailable");
    return { tenant: request.tenant, authData: SERVICE.DefaultCheckoutPlacementPortsService.serviceAuthData(request),
      options: { recursive: false, skipItemCache: true } };
  },
  /**
   * Unwraps up to eight persistence result/data envelopes.
   * @param {*} value Owner acknowledgement or record envelope.
   * @returns {*} Value reached without fabricating records.
   * @throws {Error} Rejects explicit error, false success/acknowledgement, ERR code or invalid/nonempty errors.
   * @sideEffects None; does not change the envelope.
   * @override Preserve error refusal and bounded unwrapping; callers validate exact records.
   */
  unwrap: function (value) {
    for (let n = 0; n < 8 && value; n++) {
      if (value.error || value.success === false || value.acknowledged === false || /^ERR_/.test(value.code || "") ||
          value.errors && (!Array.isArray(value.errors) || value.errors.length)) this.fail("Auction purchase persistence failed");
      if (value.result !== undefined) value = value.result;
      else if (value.data !== undefined) value = value.data;
      else return value;
    }
    return value;
  },
  /**
   * Reads one original record in a fixed tenant/Enterprise partition.
   * @param {Object} request Admitted persistence context.
   * @param {Object} service Generated owner service exposing get.
   * @param {string} code Exact retained record code.
   * @returns {Promise<Object|undefined>} Matching single row or undefined for no returned row.
   * @throws {Error} Propagates owner failures and rejects duplicates or mismatched code/tenant/Enterprise.
   * @sideEffects Bounded uncached read only.
   * @override Keep the exact partition/query and this.unwrap checks; do not turn ambiguous results into absence.
   */
  read: async function (request, service, code) {
    const value = this.unwrap(await service.get({ ...this.context(request),
      query: { tenant: request.tenant, enterpriseCode: request.enterpriseCode, code },
      searchOptions: { pageSize: 2, pageNumber: 1 } }));
    const rows = value == null ? [] : Array.isArray(value) ? value : [value];
    if (rows.length > 1 || rows.some(row => row.code !== code || row.tenant !== request.tenant || row.enterpriseCode !== request.enterpriseCode))
      this.fail("Auction purchase identity is not unique");
    return rows[0];
  },
  /**
   * Qualifies installed commitment revision CAS and unique identity.
   * @param {Object} request Admitted tenant context used to select the model.
   * @returns {Promise<void>} Resolves only when nonversioned code identity and revision/index requirements hold.
   * @throws {Error} Rejects unavailable CAS, wrong primary key/revision field or nonqualifying index; inspection failures propagate.
   * @sideEffects Reads model metadata and installed indexes; creates neither models nor indexes.
   * @override Preserve unconditional unique code and generated concurrency requirements.
   */
  persistence: async function (request) {
    const model = NODICS.getModels("checkoutCore", request.tenant)?.[UTILS.createModelName("checkoutAuctionCommitment")];
    if (!model || model.versioned === true || model.primaryKey !== "code" || typeof model.compareAndSetItem !== "function" ||
        SERVICE.DefaultModelConcurrencyService.getField(model.rawSchema) !== "revision") this.fail("Auction purchase CAS is not qualified");
    const indexes = await SERVICE.DefaultDatabaseModelHandlerService.inspectIndexes(model);
    if (indexes?.versioned !== false || !indexes.indexes?.some(index => index.unique === true && !index.sparse &&
        !index.partialFilterExpression && (!index.collation || index.collation.locale === "simple") && index.key?.code === 1 &&
        Object.keys(index.key).every(key => ["code", "tenant"].includes(key)))) this.fail("Auction purchase unique identity is unavailable");
  },
  /**
   * Compares retained fields while allowing unrelated generated metadata.
   * @param {Object} row Existing owner record.
   * @param {Object} fields Required fields; expiresAt compares parsed instants, others use deep equality.
   * @returns {Object} The original row on a match.
   * @throws {Error} Rejects a missing row or mismatched required field.
   * @sideEffects None; no mutation or backfill.
   * @override Preserve exact retained evidence and timestamp comparison semantics.
   */
  assertFields: function (row, fields) {
    if (!row || Object.keys(fields).some(key => key === "expiresAt"
      ? Date.parse(row[key]) !== Date.parse(fields[key]) : !same(row[key], fields[key]))) this.fail("Auction purchase terms changed");
    return row;
  },
  /**
   * Creates an immutable deterministic record or confirms its prior insertion.
   * @param {Object} request Admitted persistence context.
   * @param {Object} service Generated owner with get/save.
   * @param {Object} model Deterministic code and expected persisted fields.
   * @returns {Promise<Object>} Exact matching retained row after readback.
   * @throws {Error} Rejects differing existing/readback fields; propagates save failure when no row can be recovered.
   * @sideEffects May insert once, then reads; never overwrites an existing record. A thrown failure can follow a committed insert.
   * @override Preserve insertOnly and this.assertFields; retry must recover the same identity.
   */
  insert: async function (request, service, model) {
    let row = await this.read(request, service, model.code);
    if (!row) {
      try { this.unwrap(await service.save({ ...this.context(request), model,
        options: { insertOnly: true, recursive: false } })); }
      catch (error) { row = await this.read(request, service, model.code); if (!row) throw error; }
      row = row || await this.read(request, service, model.code);
    }
    return this.assertFields(row, model);
  },
  /**
   * CAS-fences a commitment decision and confirms exact readback.
   * @param {Object} request Admitted commitment partition.
   * @param {Object} row Original code, status and safe revision.
   * @param {Object} patch Fields for the next commitment revision.
   * @returns {Promise<Object>} Confirmed next-revision row, including exact recovery after an uncertain acknowledgement.
   * @throws {Error} Rejects unqualified persistence, invalid revision, lost CAS or unmatched recovery readback.
   * @sideEffects Inspects indexes, performs one generated revision update and reads it back; failure need not imply rollback.
   * @override Preserve status/revision fencing and original-error propagation when recovery cannot prove the write.
   */
  update: async function (request, row, patch) {
    await this.persistence(request);
    if (!Number.isSafeInteger(row.revision) || !Number.isSafeInteger(row.revision + 1)) this.fail("Auction purchase revision is invalid");
    const service = SERVICE.DefaultCheckoutAuctionCommitmentService;
    const expected = { ...patch, code: row.code, revision: row.revision + 1 };
    try {
      const result = this.unwrap(await service.update({ ...this.context(request),
        query: { tenant: request.tenant, enterpriseCode: request.enterpriseCode, code: row.code, revision: row.revision, status: row.status },
        model: { ...patch, code: row.code, revision: row.revision } }));
      if (result?.matchedCount !== 1) this.fail("Auction purchase decision lost its revision");
    } catch (error) {
      try { return this.assertFields(await this.read(request, service, row.code), expected); } catch (_) { throw error; }
    }
    return this.assertFields(await this.read(request, service, row.code), expected);
  },
  /**
   * Re-reads the authoritative selected round and original non-expiring hold.
   * @param {Object} input Original participant or scheduler request.
   * @param {Object} coordinates Store and roundCode used only to locate owner evidence.
   * @returns {Promise<Object>} Admitted request plus selected round, bid and selection.
   * @throws {Error} Rejects admission, Store partition drift, incomplete loser cleanup or mismatched/nonreserved selected funds.
   * @sideEffects Reads Bidding/participant evidence; no selection or funds mutation.
   * @override Preserve scheduler/participant admission, exact selection and purchaser-or-seller checks; caller round objects are not authority.
   */
  selected: async function (input, coordinates) {
    const auctions = SERVICE.DefaultBiddingAuctionService;
    const base = { ...input, storeCode: coordinates.storeCode, payload: { storeCode: coordinates.storeCode } };
    const request = input.authData?.principalType === "service" ? auctions.scheduler(base) : await auctions.participant(base);
    const round = await auctions.load(request, coordinates.roundCode), selection = round.selection;
    if (round.storeCode !== coordinates.storeCode || CONFIG.get("bidding")?.stores?.[round.storeCode]?.enterpriseCode !== request.enterpriseCode)
      this.fail("Auction Store partition changed");
    const bid = selection && round.bids?.[selection.bidCode];
    if (round.status !== "SELECTED" || !round.cleanupComplete || !bid || bid.status !== "SELECTED" ||
        !same(selection.buyerRef, bid.buyerRef) || !same(selection.reservation, bid.reservation) ||
        selection.amount !== bid.amount || bid.reservation?.status !== "RESERVED" ||
        bid.reservation.expiresAt !== null || bid.reservation.holdUntilRelease !== true ||
        !bid.reservation.code || !selection.commandKey ||
        input.authData?.principalType !== "service" && !auctions.same(request.buyerRef, bid.buyerRef) && !auctions.isSeller(request, round))
      this.fail("Original selected auction hold is unavailable");
    return { request, round, bid, selection };
  },
  /**
   * Resolves an owned auction purchase into its retained merchant partition.
   * @param {Object} request Already Profile-admitted owner context and optional Cart/Order/command selectors.
   * @returns {Promise<Object>} Original request for no auction match, or copy with retained Enterprise, Store and commitment binding.
   * @throws {Error} Rejects missing AUCTION_CHECKOUT registry evidence, ambiguity, foreign ownership or changed Store mapping.
   * @sideEffects Reads commitment storage only; never changes signed auth or participantEnterpriseCode.
   * @override Preserve typed owner/ownerId equality and exact selector checks; headers do not select merchant ownership.
   */
  partition: async function (request) {
    const cartCode = request.cartCode || request.payload?.cartCode;
    const orderCode = request.orderCode || request.payload?.orderCode;
    const commandCode = request.commandCode;
    if (!cartCode && !orderCode && !commandCode) return request;
    const query = { tenant: request.tenant, ...(orderCode ? { orderCode } : cartCode ? { cartCode } : { "placement.key": commandCode }) };
    const service = SERVICE.DefaultCheckoutAuctionCommitmentService;
    if (!service?.get) {
      if ([cartCode, orderCode].some(code => typeof code === "string" && code.startsWith("AUCTION_CHECKOUT_")))
        this.fail("Auction purchase registry is unavailable");
      return request;
    }
    const value = this.unwrap(await service.get({ ...this.context(request), query, searchOptions: { pageSize: 2, pageNumber: 1 } }));
    const rows = value == null ? [] : Array.isArray(value) ? value : [value];
    if (rows.length > 1) this.fail("Auction purchase identity is not unique");
    if (!rows.length) {
      if ([cartCode, orderCode].some(code => typeof code === "string" && code.startsWith("AUCTION_CHECKOUT_")))
        this.fail("Auction purchase registry is unavailable");
      return request;
    }
    const row = rows[0];
    if (row.tenant !== request.tenant || !same(row.terms?.ownerRef, request.ownerRef) || row.terms.ownerId !== request.ownerId ||
        cartCode && row.cartCode !== cartCode || orderCode && row.orderCode !== orderCode ||
        commandCode && row.placement?.key !== commandCode ||
        CONFIG.get("bidding")?.stores?.[row.terms.storeCode]?.enterpriseCode !== row.enterpriseCode)
      this.fail("Auction purchase is unavailable to this owner");
    return { ...request, enterpriseCode: row.enterpriseCode, storeCode: row.terms.storeCode,
      auctionFunds: { commitmentCode: row.code } };
  },
  /**
   * Revalidates purchaser and selected hold before Payment work.
   * @param {Object} input Original signed request with Cart/Order binding, optional amount/currency, operation and idempotencyKey.
   * @returns {Promise<Object>} Admitted merchant request, commitment row, original Bidding funds command and sanitized binding.
   * @throws {Error} Rejects unbound/changed selection, owner or amount mismatch, and expired unstarted intake except VOID.
   * @sideEffects Performs Profile, commitment and Bidding reads; no Payment dispatch.
   * @override Preserve signed participant admission, partition separation and original-hold checks before every Payment action.
   */
  paymentTerms: async function (input) {
    const signed = { ...input, enterpriseCode: input.authData?.enterpriseCode || input.authData?.entCode,
      entCode: input.authData?.enterpriseCode || input.authData?.entCode };
    const participant = await FACADE.DefaultCartCustomerFacade.resolveContext(signed, "commerce.checkout.place");
    const request = await this.partition(participant);
    if (!request.auctionFunds || input.auctionFunds && input.auctionFunds.commitmentCode !== request.auctionFunds.commitmentCode)
      this.fail("Original auction purchase binding is required");
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, request.auctionFunds.commitmentCode);
    if (!row.priceQuoteCode || !["BOUND", "CAPTURE_DECIDED", "RELEASE_DECIDED"].includes(row.status))
      this.fail("Auction purchase has not been bound");
    const selected = await this.selected(request, row.terms);
    this.assertFields(row, { terms: this.terms(selected.round, selected.bid, selected.selection) });
    if (!same(request.ownerRef, row.terms.ownerRef) || input.orderCode && input.orderCode !== row.orderCode ||
        input.cartCode && input.cartCode !== row.cartCode || input.currency && input.currency !== row.terms.currency ||
        input.amount !== undefined && SERVICE.DefaultExactAmountService.compare(input.amount, row.terms.amount) !== 0)
      this.fail("Auction payment does not match selected terms");
    if (input.operation !== "VOID" && !row.placement && Date.parse(row.expiresAt) <= Date.now()) this.fail("Auction purchase intake expired");
    return { request, row, command: SERVICE.DefaultBiddingAuctionService.fundsPayload(selected.round, selected.bid, input.idempotencyKey),
      binding: { commitmentCode: row.code } };
  },
  /**
   * Runs placement ports with a persisted original-command phase journal.
   * @param {Object} request Admitted purchase request with original idempotencyKey and Cart/Order/payment/calculation payload.
   * @param {Object} ports Existing placement operation functions to wrap with journal fencing.
   * @returns {Promise<Object>} Result of DefaultOrderPlacementService.place using journaled ports.
   * @throws {Error} Rejects cancellation/release, command or actor drift, incompatible pending phases and changed Cart; port/persistence errors propagate.
   * @sideEffects Saves intent and pending/completed phases; dispatches real acquisition, payment, order and delivery ports. Completed results replay; uncertainty retains acquisitions and suppresses competing generic compensation.
   * @override Preserve original-key replay and before-effect journal fences; never introduce a second hold or competing release.
   */
  place: async function (request, ports) {
    const { row: initial, request: admitted } = await this.paymentTerms({ ...request,
      cartCode: request.payload.cartCode, orderCode: request.payload.orderCode });
    let row = initial;
    if (row.cancellation || row.terminal?.decision === "RELEASE") this.fail("Auction purchase was released or cancellation requires recovery");
    const command = { cartCode: request.payload.cartCode, orderCode: request.payload.orderCode,
      paymentMethod: request.payload.paymentMethod, walletCode: request.payload.walletCode,
      programCode: request.payload.programCode, rewardTypeCode: request.payload.rewardTypeCode,
      couponCode: request.payload.couponCode, customerGroup: request.payload.customerGroup,
      expectedCartRevision: request.payload.expectedCartRevision, calculationCode: request.payload.calculationCode };
    const digest = this.hash(command);
    if (!row.placement) row = await this.update(admitted, row, { placement: { key: request.idempotencyKey, digest,
      command, actorRef: admitted.actorRef, results: {}, completed: [] } });
    if (row.placement.key !== request.idempotencyKey || row.placement.digest !== digest || !same(row.placement.actorRef, admitted.actorRef))
      this.fail("Resume the original auction purchase command");
    const phaseNames = { validateCart: "VALIDATED", calculateCart: "CALCULATED", enforceParticipantSpend: "SPENDING_ADMITTED",
      reserveInventory: "RESERVED", reserveDigitalUnits: "DIGITAL_RESERVED", authorizePayment: "AUTHORIZED", createOrder: "ORDERED",
      capturePayment: "PAYMENT_CAPTURED", commitPromotions: "PROMOTION_COMMITTED", confirmDigitalSale: "DIGITAL_SOLD",
      releaseFulfillment: "RELEASED", deliverDigitalUnits: "DIGITAL_DELIVERED", complete: "COMPLETED" };
    const wrapped = { ...ports };
    for (const [name, phase] of Object.entries(phaseNames)) {
      if (typeof ports[name] !== "function") continue;
      wrapped[name] = async (...args) => {
        row = await this.read(admitted, SERVICE.DefaultCheckoutAuctionCommitmentService, row.code);
        if (row.cancellation || row.terminal?.decision === "RELEASE") this.fail("Auction purchase was released or cancellation requires recovery");
        if (Object.hasOwn(row.placement.results, name)) return structuredClone(row.placement.results[name]);
        if (row.placement.pending && row.placement.pending !== name) this.fail("Original auction phase requires recovery");
        row = await this.update(admitted, row, { placement: { ...row.placement, pending: name,
          acquisitionStarted: row.placement.acquisitionStarted === true ||
            !["validateCart", "calculateCart", "enforceParticipantSpend"].includes(name) } });
        if (name === "validateCart") {
          const cart = await SERVICE.DefaultCartOperationService.cartSnapshot({ ...request, cartCode: row.cartCode });
          const entry = cart.entries?.[0];
          if (cart.code !== row.cartCode || cart.entries?.length !== 1 || entry.productCode !== row.terms.productCode ||
              entry.variantCode !== row.terms.variantCode || entry.priceQuoteCode !== row.priceQuoteCode ||
              SERVICE.DefaultExactAmountService.compare(String(entry.quantity), "1") !== 0)
            this.fail("Selected auction Cart contents changed");
        }
        const result = await ports[name](...args);
        row = await this.read(admitted, SERVICE.DefaultCheckoutAuctionCommitmentService, row.code);
        row = await this.update(admitted, row, { placement: { ...row.placement, pending: null,
          completed: [...row.placement.completed, phase], results: { ...row.placement.results, [name]: result ?? null } } });
        return result;
      };
    }
    wrapped.compensate = async () => { /* An uncertain auction owner phase resumes its original key, never a competing release. */ };
    return SERVICE.DefaultOrderPlacementService.place({ ...request, ...admitted, payload: request.payload,
      idempotencyKey: request.idempotencyKey, auctionFunds: { commitmentCode: row.code } }, wrapped);
  },
  /**
   * Resumes only the persisted original placement after explicit confirmation.
   * @param {Object} request Bound owner/actor and commandCode with payload exactly {confirmed:true}.
   * @param {Object} ports Existing placement ports passed to this.place.
   * @returns {Promise<Object>} Original command/Cart/Order codes plus resulting status and revision.
   * @throws {Error} Rejects replacement payload, missing journal, actor/owner/key/digest mismatch or released purchase; placement failures propagate.
   * @sideEffects Re-enters original placement and may complete remaining owner effects; never accepts replacement payment selectors.
   * @override Preserve retained command reconstruction and this.place journal semantics.
   */
  resume: async function (request, ports) {
    if (!same(request.payload, { confirmed: true })) this.fail('Confirm the original auction purchase');
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, request.auctionFunds?.commitmentCode);
    if (!row?.placement?.command || row.placement.key !== request.commandCode ||
        !same(row.terms.ownerRef, request.ownerRef) || !same(row.placement.actorRef, request.actorRef) ||
        row.placement.digest !== this.hash(row.placement.command) || row.terminal?.decision === 'RELEASE')
      this.fail('Original auction recovery binding is unavailable');
    const result = await this.place({ ...request, idempotencyKey: row.placement.key,
      payload: structuredClone(row.placement.command) }, ports);
    return { commandCode: row.placement.key, cartCode: row.cartCode, orderCode: row.orderCode,
      status: result.status, revision: result.revision };
  },
  /**
   * Cancels an unacquired selected purchase through its original Payment VOID.
   * @param {Object} input Original signed request, nonempty idempotencyKey and confirmed Cart/Order payload.
   * @returns {Promise<Object>} CANCELLED receipt with original codes/key after confirmed VOID, or exact completed replay.
   * @throws {Error} Rejects acquisition/capture, actor/command drift or unconfirmed VOID; owner errors leave recovery pending.
   * @sideEffects Persists cancellation intent, dispatches Payment VOID against the retained hold and records completion. No automatic rollback or replacement key.
   * @override Preserve the no-acquisition fence, participant Payment partition and durable original cancellation identity.
   */
  cancel: async function (input) {
    if (input.payload?.confirmed !== true || typeof input.idempotencyKey !== "string" || !input.idempotencyKey)
      this.fail("Confirm the original auction cancellation");
    const admitted = await this.paymentTerms({ ...input, operation: "VOID", orderCode: input.payload.orderCode, cartCode: input.payload.cartCode });
    const request = admitted.request; let row = admitted.row;
    if (row.placement?.acquisitionStarted || row.terminal?.decision === "CAPTURE") this.fail("Started auction purchase requires original phase recovery");
    if (row.placement && !same(row.placement.actorRef, request.actorRef)) this.fail('Original auction cancellation actor is required');
    const command = { cartCode: row.cartCode, orderCode: row.orderCode, confirmed: true };
    if (!row.cancellation) row = await this.update(request, row, { cancellation: {
      key: input.idempotencyKey, command, digest: this.hash(command), actorRef: request.actorRef, completed: false } });
    if (row.cancellation.key !== input.idempotencyKey || !same(row.cancellation.actorRef, request.actorRef) ||
        row.cancellation.digest !== this.hash(command) || !same(row.cancellation.command, command))
      this.fail('Original auction cancellation terms changed');
    if (row.cancellation.completed) return { code: row.orderCode, orderCode: row.orderCode, cartCode: row.cartCode,
      cancellationKey: row.cancellation.key, status: 'CANCELLED' };
    const terms = row.terms, ports = SERVICE.DefaultCheckoutPlacementPortsService;
    const result = await SERVICE.DefaultPaymentExecutionService.execute({ ...request, operation: "VOID",
      enterpriseCode: request.participantEnterpriseCode,
      orderCode: row.orderCode, cartCode: row.cartCode, methodCode: "LOYALTY_REWARD", providerCode: CONFIG.get("loyaltyRewardPayment").providerCode,
      walletCode: terms.reservation.walletCode, programCode: terms.reservation.programCode, rewardTypeCode: terms.reservation.rewardTypeCode,
      amount: terms.amount, currency: terms.currency, providerReference: terms.reservation.code,
      auctionFunds: { commitmentCode: row.code }, idempotencyKey: input.idempotencyKey + ":payment:void" },
    SERVICE.DefaultLoyaltyRewardPaymentProviderService, ports.paymentRepository(request, row.orderCode + ":void", "LOYALTY_REWARD"));
    if (result.status !== "VOIDED") this.fail("Original auction release remains unconfirmed");
    row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, row.code);
    await this.update(request, row, { cancellation: { ...row.cancellation, completed: true } });
    return { code: row.orderCode, orderCode: row.orderCode, cartCode: row.cartCode,
      cancellationKey: row.cancellation.key, status: "CANCELLED" };
  },
  /**
   * Projects bounded retained cancellation or placement status.
   * @param {Object} request Admitted typed owner/actor, orderCode and auctionFunds.commitmentCode.
   * @returns {Promise<Object>} Qualified original Cart/Order status: READY, cancellation progress or placement command status.
   * @throws {Error} Rejects missing owner/checkpoint binding, invalid cancellation evidence or unhandled terminal intent.
   * @sideEffects Reads commitment/checkpoint and recovery status only; does not dispatch financial work.
   * @override Preserve owner/checkpoint joins and exclude private funding selectors from the DTO.
   */
  purchaseStatus: async function (request) {
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, request.auctionFunds?.commitmentCode);
    if (!row || row.orderCode !== request.orderCode || !same(row.terms.ownerRef, request.ownerRef) || row.terms.ownerId !== request.ownerId)
      this.fail('Original auction purchase is unavailable');
    const checkpoint = await this.read(request, SERVICE.DefaultCheckoutCheckpointService, row.orderCode);
    SERVICE.DefaultCheckoutCompensationRecoveryService.assertOwner(request, checkpoint);
    if (checkpoint && (!row.placement || checkpoint.cartCode !== row.cartCode || checkpoint.orderCode !== row.orderCode ||
        checkpoint.evidence?.orderCode !== row.orderCode)) this.fail('Original auction checkpoint binding is unavailable');
    const binding = { code: row.orderCode, orderCode: row.orderCode, cartCode: row.cartCode, scopeQualified: true };
    if (row.cancellation) {
      const c = row.cancellation;
      if (!same(c.actorRef, request.actorRef) || !same(c.command, { cartCode: row.cartCode, orderCode: row.orderCode, confirmed: true }) ||
          c.digest !== this.hash(c.command) || typeof c.key !== 'string' || !c.key)
        this.fail('Original auction cancellation is unavailable');
      return { ...binding, status: c.completed ? 'CANCELLED' : 'CANCELLATION_PENDING', cancellationKey: c.key };
    }
    if (row.placement) return { ...binding, ...await this.commandStatus({ ...request, commandCode: row.placement.key }),
      placementKey: row.placement.key };
    if (row.terminal) this.fail('Original auction terminal command requires recovery');
    return { ...binding, status: 'READY' };
  },
  /**
   * Snapshots immutable original selection and funding terms.
   * @param {Object} round Bidding round with publication/Store/Product/currency/seller coordinates.
   * @param {Object} bid Selected buyer/actor, amount and original funding/reservation evidence.
   * @param {Object} selection Original selected commandKey.
   * @returns {Object} JSON-detached terms excluding mutable recovery progress.
   * @throws {Error} Propagates invalid input or JSON serialization failures.
   * @sideEffects None; undefined fields follow JSON serialization semantics.
   * @override Keep the retained tuple stable and exclude credentials/progress; do not infer missing authority.
   */
  terms: function (round, bid, selection) {
    return JSON.parse(JSON.stringify({ roundCode: round.code, bidCode: bid.code, publicationCode: round.publicationCode,
      storeCode: round.storeCode, productCode: round.productCode, variantCode: round.variantCode, currency: round.currency,
      ownerId: bid.buyerId, ownerRef: bid.buyerRef, actorRef: bid.actorRef, sellerRef: round.sellerRef,
      amount: bid.amount, funding: bid.funding, reservation: bid.reservation, commandKey: selection.commandKey }));
  },
  /**
   * Persists deterministic selected purchase identity and a real Cart.
   * @param {Object} input Original participant/scheduler request.
   * @param {Object} payload Round code/Store coordinates and original selection.commandKey + ':checkout' key.
   * @returns {Promise<Object>} Confirmed Cart/Order identifiers and retained expiresAt; does not mean an Order was placed.
   * @throws {Error} Rejects unqualified selection, changed handoff key/terms, persistence or Cart mismatch.
   * @sideEffects May insert a commitment and Cart after CAS/index qualification; does not acquire funds or create the Order.
   * @override Preserve deterministic identities, original deadline and insert-only exact replay.
   */
  prepare: async function (input, payload) {
    const { request, round, bid, selection } = await this.selected(input, { roundCode: payload.round?.code, storeCode: payload.round?.storeCode });
    if (payload.idempotencyKey !== selection.commandKey + ":checkout") this.fail("Original auction handoff key is required");
    const code = "AUCTION_CHECKOUT_" + this.hash([request.tenant, request.enterpriseCode, round.code, bid.code]);
    const terms = this.terms(round, bid, selection), service = SERVICE.DefaultCheckoutAuctionCommitmentService;
    await this.persistence(request);
    let row = await this.read(request, service, code);
    if (!row) {
      const expiresAt = this.purchaseDeadline(Date.now());
      row = await this.insert(request, service, { code, tenant: request.tenant, enterpriseCode: request.enterpriseCode,
        status: "PREPARED", active: true, revision: 0, terms, orderCode: code, cartCode: code + "_CART",
        expiresAt, correlationId: round.code });
    }
    this.assertFields(row, { terms });
    const cartOwner = SERVICE.DefaultCartOperationService;
    const cart = cartOwner.cartModel({ ...request, ownerId: bid.buyerId, ownerRef: bid.buyerRef, actorRef: bid.actorRef,
      cartCode: row.cartCode, payload: { cartCode: row.cartCode, storeCode: round.storeCode, currency: round.currency } });
    const existingCart = await this.read(request, SERVICE.DefaultCartService, row.cartCode);
    if (existingCart) this.assertFields(existingCart, { code: cart.code, ownerId: bid.buyerId, ownerRef: bid.buyerRef,
      storeCode: round.storeCode, currency: round.currency });
    else await this.insert(request, SERVICE.DefaultCartService, cart);
    return { confirmed: true, cartCode: row.cartCode, orderCode: row.orderCode, expiresAt: row.expiresAt };
  },
  /**
   * Binds the selected Pricing quote and immutable single Cart entry.
   * @param {Object} input Original participant/scheduler request.
   * @param {Object} payload Round coordinates, selected priceQuoteCode and original selection.commandKey + ':bind' key.
   * @returns {Promise<Object>} Confirmed orderCode and original reservationCode.
   * @throws {Error} Rejects changed terms/key, terminal commitment, quote owner/amount/deadline mismatch or persistence failure.
   * @sideEffects Reads Pricing, inserts the exact quantity-one entry and CAS-transitions PREPARED to BOUND; never reserves funds again.
   * @override Preserve selected quote proof, original hold and idempotent entry identity.
   */
  bind: async function (input, payload) {
    const { request, round, bid, selection } = await this.selected(input, { roundCode: payload.round?.code, storeCode: payload.round?.storeCode });
    if (payload.idempotencyKey !== selection.commandKey + ":bind" || payload.priceQuoteCode !== selection.priceQuoteCode ||
        !selection.checkout?.orderCode) this.fail("Original selected Pricing handoff is required");
    let row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, selection.checkout.orderCode);
    this.assertFields(row, { terms: this.terms(round, bid, selection), cartCode: selection.checkout.cartCode });
    if (!["PREPARED", "BOUND"].includes(row.status)) this.fail("Auction purchase has a terminal decision");
    const quote = await SERVICE.DefaultNegotiatedPriceService.resolve({ ...request, ownerId: bid.buyerId,
      priceQuoteCode: payload.priceQuoteCode, productCode: round.productCode, variantCode: round.variantCode,
      storeCode: round.storeCode, cartCode: row.cartCode, currency: round.currency, quantity: "1" });
    this.assertFields(quote, { orderCode: row.orderCode, buyerRef: bid.buyerRef,
      sourceRef: { module: "bidding", schema: "biddingAuctionRound", code: round.code } });
    if (SERVICE.DefaultExactAmountService.compare(quote.unitAmount, bid.amount) !== 0 ||
        Date.parse(quote.expiresAt) !== Date.parse(row.expiresAt)) this.fail("Selected quote amount or deadline changed");
    const entry = await SERVICE.DefaultCartOperationService.entryModel({ ...request, ownerId: bid.buyerId,
      ownerRef: bid.buyerRef, actorRef: bid.actorRef, cartCode: row.cartCode,
      payload: { entryCode: row.cartCode + "_ENTRY", productCode: round.productCode, variantCode: round.variantCode,
        priceQuoteCode: quote.code, quantity: "1" } });
    await this.insert(request, SERVICE.DefaultCartEntryService, entry);
    if (row.status === "PREPARED") row = await this.update(request, row, { status: "BOUND", priceQuoteCode: quote.code });
    else this.assertFields(row, { priceQuoteCode: quote.code });
    return { confirmed: true, orderCode: row.orderCode, reservationCode: row.terms.reservation.code };
  },
  /**
   * Authorizes an exact original selected-auction terminal command.
   * @param {Object} input Original participant/scheduler context.
   * @param {string} operation Either capture or release.
   * @param {Object} command Original Bidding funds command including Store/round/Order and hold coordinates.
   * @returns {Promise<Object>} Admitted request and exact matching commitment row.
   * @throws {Error} Rejects unsupported operation, missing Bidding proof or mismatched selection/quote/Cart binding.
   * @sideEffects Reads Bidding funds evidence, selection and commitment only.
   * @override Preserve exact command proof and this.selected; callers cannot nominate a replacement hold.
   */
  command: async function (input, operation, command) {
    if (!["capture", "release"].includes(operation)) this.fail("Unsupported auction terminal operation");
    const proof = await SERVICE.DefaultBiddingAuctionFundsEvidenceService.authorize({ ...input, payload: { operation, command } });
    if (proof?.confirmed !== true || proof.checkoutRequired !== true || !same(proof.command, command))
      this.fail("Selected auction funds evidence is unavailable");
    const { request, round, bid, selection } = await this.selected(input, command);
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, command.orderCode);
    this.assertFields(row, { terms: this.terms(round, bid, selection), orderCode: command.orderCode });
    if (row.cartCode !== selection.checkout?.cartCode || row.priceQuoteCode !== selection.priceQuoteCode)
      this.fail("Selected auction purchase is not bound");
    return { request, row };
  },
  /**
   * Persists or replays one immutable terminal funds decision.
   * @param {Object} input Original admitted participant/scheduler request.
   * @param {string} operation capture or release.
   * @param {Object} command Original authorized funds command and idempotency key.
   * @returns {Promise<Object>} Commitment containing the exact CAPTURE/RELEASE decision and deterministic receipt.
   * @throws {Error} Rejects conflicting terminal/cancellation intent, foreign purchaser, started release or missing matching placed Order for capture.
   * @sideEffects Reads owner/Order evidence and may CAS-write the terminal fence; does not itself move Loyalty funds.
   * @override Keep purchaser/scheduler admission and immutable same-command replay; never switch a prior decision.
   */
  fence: async function (input, operation, command) {
    const { request, row } = await this.command(input, operation, command);
    const decision = operation === "capture" ? "CAPTURE" : "RELEASE";
    if (row.cancellation && (operation !== 'release' || command.idempotencyKey !== row.cancellation.key + ':payment:void'))
      this.fail('Original auction cancellation requires recovery');
    if (request.authData?.principalType !== "service" && !same(request.buyerRef, row.terms.ownerRef))
      this.fail("Only the selected purchaser can decide purchase funds");
    const terminal = { operation, decision, command: structuredClone(command),
      receiptCode: "AUCTION_FUNDS_" + this.hash([request.tenant, row.code, operation, command.idempotencyKey]) };
    if (row.terminal) { this.assertFields(row, { terminal }); return row; }
    if (row.status !== "BOUND") this.fail("Auction purchase is not ready for a terminal decision");
    if (operation === "release" && row.placement?.acquisitionStarted)
      this.fail("Started auction purchase requires original phase recovery");
    if (operation === "capture") {
      const order = await this.read(request, SERVICE.DefaultCommerceOrderService, row.orderCode);
      this.assertFields(order, { cartCode: row.cartCode, ownerId: row.terms.ownerId, status: "PLACED", currency: row.terms.currency });
      if (!same(order.evidence?.ownerRef, row.terms.ownerRef) ||
          SERVICE.DefaultExactAmountService.compare(order.totalAmount, row.terms.amount) !== 0 ||
          order.evidence?.paymentReference !== row.terms.reservation.code) this.fail("Original auction order evidence is unavailable");
    }
    return this.update(request, row, { status: decision + "_DECIDED", terminal });
  },
  /**
   * Returns only a previously persisted exact terminal fence.
   * @param {Object} input Admitted callback with payload.operation and original payload.command.
   * @returns {Promise<Object>} Bounded confirmed terminalFence receipt with original order/round/bid/hold/amount/key.
   * @throws {Error} Rejects failed command admission, absent/mismatched terminal evidence or inconsistent status.
   * @sideEffects Read-only owner revalidation; cannot create or change a terminal decision.
   * @override Preserve this.command checks and exact retained proof; route admission alone is not funds authority.
   */
  evidence: async function (input) {
    const { operation, command } = input.payload || {};
    const { request, row } = await this.command(input, operation, command || {});
    if (!row.terminal || row.terminal.operation !== operation || !same(row.terminal.command, command) ||
        row.status !== row.terminal.decision + "_DECIDED") this.fail("Auction purchase terminal decision is unavailable");
    return { confirmed: true, tenant: request.tenant, operation, orderCode: row.orderCode,
      roundCode: command.roundCode, bidCode: command.sourceCode, reservationCode: command.reservationCode,
      amount: command.amount, idempotencyKey: command.idempotencyKey, decision: row.terminal.decision,
      receiptCode: row.terminal.receiptCode, terminalFence: true };
  },
  /**
   * Inspects original Checkout outcomes without changing financial or auction state.
   * @param {Object} input Original participant or admitted scheduler request.
   * @param {Object} payload Selected round coordinates re-read through Bidding.
   * @returns {Promise<Object>} FAILED_RECONCILED only with exact VOID/holding proof; otherwise bounded unconfirmed recovery/completion flags.
   * @throws {Error} Rejects selection/terms mismatch, missing retained purchaser Payment partition or unconfirmed listing holdings; owner reads may reject.
   * @sideEffects Reads commitment, original Payment receipt, listing holdings and/or checkpoint; no release, redispatch or re-award.
   * @override Preserve the retained actor's participant Payment partition, original receipt joins and distinction between completion and re-award permission.
   */
  reconcile: async function (input, payload) {
    const { request, round, bid, selection } = await this.selected(input, { roundCode: payload.round?.code, storeCode: payload.round?.storeCode });
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, selection.checkout?.orderCode);
    this.assertFields(row, { terms: this.terms(round, bid, selection) });
    if (!row.placement?.acquisitionStarted && row.terminal?.decision === "RELEASE") {
      const enterpriseCode = row.terms.actorRef?.enterpriseCode;
      if (typeof enterpriseCode !== "string" || !enterpriseCode.trim())
        this.fail("Original auction Payment partition is unavailable");
      const payment = this.unwrap(await SERVICE.DefaultPaymentTransactionEntryService.get({ ...this.context({ ...request, enterpriseCode }),
        query: { tenant: request.tenant, enterpriseCode, ownerId: row.terms.ownerId,
          orderCode: row.orderCode, idempotencyKey: row.terminal.command.idempotencyKey },
        searchOptions: { pageSize: 2, pageNumber: 1 } }));
      if (Array.isArray(payment) && payment.length === 1 && payment[0].status === "VOIDED" &&
          payment[0].tenant === request.tenant && payment[0].enterpriseCode === enterpriseCode &&
          payment[0].orderCode === row.orderCode && payment[0].idempotencyKey === row.terminal.command.idempotencyKey &&
          payment[0].providerReference === row.terms.reservation.code && payment[0].ownerId === row.terms.ownerId &&
          payment[0].cartCode === row.cartCode && payment[0].currency === row.terms.currency &&
          payment[0].evidence?.operation === "VOID" &&
          same(payment[0].evidence?.auctionFunds, { commitmentCode: row.code }) &&
          same(payment[0].evidence?.participant?.ownerRef, row.terms.ownerRef) &&
          SERVICE.DefaultExactAmountService.compare(payment[0].amount, row.terms.amount) === 0) {
        const holdings = await SERVICE.DefaultBiddingAuctionPortsService.publication(request, { round });
        if (holdings?.confirmed !== true || holdings.publicationCode !== round.publicationCode || holdings.termsMatch !== true)
          this.fail("Original listing holdings are unconfirmed");
        return { confirmed: true, outcome: "FAILED_RECONCILED", bidCode: bid.code, fundsReconciled: true,
          holdingsAvailable: true, noPendingPurchase: true, receiptCode: row.terminal.receiptCode };
      }
    }
    const checkpoint = await this.read(request, SERVICE.DefaultCheckoutCheckpointService, row.orderCode);
    if (!checkpoint || checkpoint.ownerId !== row.terms.ownerId || checkpoint.cartCode !== row.cartCode)
      return { confirmed: false, recoveryRequired: true };
    // Captured or partly acquired purchases must resume; generic compensation is not auction holdings proof.
    return { confirmed: false, orderCode: row.orderCode, recoveryRequired: checkpoint.status !== "COMPLETED",
      purchaseCompleted: checkpoint.status === "COMPLETED" && row.terminal?.decision === "CAPTURE" };
  },
  /**
   * Projects original phase recovery without exposing private financial receipts.
   * @param {Object} request Admitted owner/actor, commandCode and commitment binding.
   * @returns {Promise<Object>} Completion, cancellation or bounded RECOVERY_REQUIRED DTO; resumable commands may advertise RESUME_ORIGINAL_PLACEMENT.
   * @throws {Error} Rejects missing/different original owner, actor or command; fresh payment-term admission may fail.
   * @sideEffects Reads owner recovery status and may revalidate Profile/selection; no placement or cancellation dispatch.
   * @override Preserve original journal identity and qualified action advertisement; status is not permission to change commands.
   */
  commandStatus: async function (request) {
    const row = await this.read(request, SERVICE.DefaultCheckoutAuctionCommitmentService, request.auctionFunds?.commitmentCode);
    if (!row || !same(row.terms.ownerRef, request.ownerRef) || !same(row.placement?.actorRef, request.actorRef) ||
        row.placement?.key !== request.commandCode)
      this.fail("Original auction purchase command is unavailable");
    if (row.cancellation) return this.purchaseStatus({ ...request, orderCode: row.orderCode });
    const result = await SERVICE.DefaultCheckoutCompensationRecoveryService.commandStatus(request);
    if (result.status === "COMPLETED") return result;
    let resumable = false;
    if (row.terminal?.decision !== 'RELEASE' && row.placement.command && row.placement.digest === this.hash(row.placement.command)) {
      await this.paymentTerms({ ...request, idempotencyKey: request.commandCode, payload: row.placement.command });
      resumable = true;
    }
    return { ...result, status: row.terminal?.decision === "RELEASE" ? "CANCELLED" : "RECOVERY_REQUIRED",
      cartCode: row.cartCode, orderCode: row.orderCode,
      revision: row.revision, completedPhases: [...row.placement.completed], pendingPhase: row.placement.pending || null,
      scopeQualified: true, recoveryRequired: row.terminal?.decision !== "RELEASE",
      ...(resumable ? { recoveryAction: 'RESUME_ORIGINAL_PLACEMENT' } : {}) };
  },
};
