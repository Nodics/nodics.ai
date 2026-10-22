/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require("node:util");
const capability = Symbol("Pricing original bundle amendment"), contexts = new WeakMap();
/**
 * @module pricing/service/defaultPricingBundleListingService
 * @description Publishes one source-proven bundle price by immutable amendment of the complete
 * activated book using existing Pricing retention, managed pointer CAS and receipts.
 * @layer service
 * @owner pricing
 * @remarks Pricing's automatic bundle path extends existing retained policy publication. Private
 * continuation binds exact Digital proof, original Store/book/row and committed receipt; registration
 * never enables publishing.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: settings, checkContext, source, row, book, inspectPersisted, execute, publish,
 * inspect.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Validates the explicit automatic policy; registration never enables publication.
   * @returns {Object} Detached validated automatic-listing policy.
   * @remarks Effects: Reads only effective Pricing defaults/overrides.
   * Failure behavior: Rejects disabled or malformed required policy.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  settings: function () {
    const p = CONFIG.get("pricing")?.bundleListings;
    if (p?.enabled !== true || p.qualified !== true || !Number.isSafeInteger(p.maximumConfiguredBound) ||
        p.maximumConfiguredBound < 2 || !Number.isSafeInteger(p.maximumRecords) ||
        p.maximumRecords < 2 || p.maximumRecords > p.maximumConfiguredBound) throw new Error("Bundle Pricing is not qualified");
    return structuredClone(p);
  },
  /**
   * Rechecks private continuation at every existing Pricing persistence boundary, including after
   * awaits.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @returns {void} Completes when an existing private continuation remains valid.
   * @remarks Effects: Reads private continuation pins; no grant is created or exported.
   * Failure behavior: Rejects drift or unavailable automatic context on a protected continuation.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  checkContext: function (r) {
    if (!r?.[capability]) return;
    const state = contexts.get(r[capability]);
    if (!state || !same(state.local, { tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData: r.authData }))
      throw new Error("Bundle Pricing context retired or changed");
    state.check();
  },
  /**
   * Resolves exact retained Digital terms and held components under fresh Profile-backed actor
   * authority.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {string} phase Fixed owner lifecycle phase; never arbitrary executable input.
   * @returns {Promise<Object>} Exact retained Digital listing proof, manifest owner and immutable terms.
   * @remarks Effects: Reads original Digital owner evidence with fresh participant authority.
   * Failure behavior: Rejects mismatched phase, unavailable held components or changed source terms.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  source: async function (r, input, phase) {
    const digital = SERVICE.DefaultDigitalCommerceAuctionService, bundles = SERVICE.DefaultDigitalBundleService;
    if (!digital?.read || !digital.held || !bundles?.authorize || !input ||
        Object.keys(input).sort().join(",") !== "idempotencyKey,operationCode,product,terms" ||
        !/^bundle-operation:[a-f0-9]{64}$/.test(input.operationCode || "") ||
        input.idempotencyKey !== input.operationCode + ":price") throw new Error("Exact Digital listing command required");
    const row = await digital.read(r, input.operationCode), listing = row.evidence.listing;
    if (row.tenant !== r.tenant || row.enterpriseCode !== r.enterpriseCode || listing.release || row.evidence.purchaseClaim ||
        !same(listing.terms, input.terms) || !same(listing.product, input.product) ||
        !same(digital.terms(input.terms), input.terms) || input.product?.confirmed !== true ||
        input.product.publicationCode !== row.code || !input.product.productCode || !input.product.variantCode ||
        !Number.isSafeInteger(input.product.versionId) || input.product.versionId < 0)
      throw new Error("Original listing terms or Product changed");
    const manifest = await digital.held(r, row);
    const originalOwner = row.evidence.actorRef?.code === r.authData?.loginId ||
      manifest.ownerRef.schema === "enterprise" && manifest.ownerRef.code === (r.authData?.enterpriseCode || r.authData?.entCode);
    if (phase === "inspect" && listing.phase === "PUBLISHED" && !originalOwner) {
      const bidding = SERVICE.DefaultBiddingAuctionService;
      const admitted = r.authData?.principalType === "service" ? bidding.scheduler(r) : await bidding.participant({ ...r,
        enterpriseCode: r.participantEnterpriseCode || r.authData?.enterpriseCode || r.authData?.entCode,
        payload: { ...r.payload, storeCode: listing.terms.storeCode } });
      if (admitted.tenant !== row.tenant || admitted.enterpriseCode !== row.enterpriseCode)
        throw new Error("Listing price reader scope mismatch");
    } else await bundles.authorize(r, manifest.ownerRef, "BUNDLE_LIST");
    return { tenant: row.tenant, enterpriseCode: row.enterpriseCode, operationCode: row.code,
      terms: listing.terms, product: listing.product, termsDigest: listing.termsDigest,
      ownerRef: manifest.ownerRef, actorRef: row.evidence.actorRef, manifestDigest: manifest.digest };
  },
  /**
   * Derives an immutable quantity-one row; existing book and unrelated policy remain byte-for-byte
   * equivalent.
   * @param {Object} proof Owner-issued retained source proof, checked against exact selectors.
   * @returns {Object} Deterministic quantity-one Pricing row for the original operation.
   * @remarks Effects: Pure immutable row derivation; no book write.
   * Failure behavior: Rejects invalid proof through the required effective owner helpers.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  row: function (proof) {
    const terms = proof.terms;
    return { code: "BUNDLE_PRICE_" + SERVICE.DefaultPricingPublicationService.fingerprint(proof.operationCode),
      tenant: proof.tenant, enterpriseCode: proof.enterpriseCode, versionId: 0, active: true,
      priceBookCode: terms.priceBookCode, productCode: proof.product.productCode,
      currency: terms.currency, unitAmount: terms.amount, minQuantity: "1",
      ...(terms.startsAt ? { validFrom: terms.startsAt } : {}), ...(terms.endsAt ? { validTo: terms.endsAt } : {}) };
  },
  /**
   * Reads complete currently activated policy and verifies the selected Store/book before any new
   * publication.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} proof Owner-issued retained source proof, checked against exact selectors.
   * @returns {Promise<Object>} Complete activated publication/book records and original status.
   * @remarks Effects: Reads existing Store/book/activation evidence; no unrelated policy replacement.
   * Failure behavior: Rejects incomplete, foreign or changed current book/publication.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  book: async function (r, proof) {
    const owner = SERVICE.DefaultPricingPublicationService, terms = proof.terms;
    const selected = { ...r, storeCode: terms.storeCode };
    if (!owner.deliveryEnabled(selected) || !owner.deliveryRoots(selected).includes(terms.priceBookCode))
      throw new Error("Listing price book is not selected for this Store");
    const publication = { rootType: "priceBook", rootCode: terms.priceBookCode };
    const before = await owner.observeSetupTarget(publication, r);
    const records = await owner.readActivated(publication, r);
    const after = await owner.observeSetupTarget(publication, r);
    if (!same(before, after) || !before.receipt || records.length > this.settings().maximumRecords)
      throw new Error("Complete stable bounded price book required");
    const books = records.filter(item => item.schema === "priceBook");
    const ids = records.map(item => item.schema + ":" + item.policy?.code);
    if (books.length !== 1 || new Set(ids).size !== ids.length || books[0].policy.code !== terms.priceBookCode ||
        books[0].policy.currency !== terms.currency || books[0].policy.active !== true || books[0].policy.status !== "ACTIVE" ||
        records.some(item => !["priceBook", "priceRow"].includes(item.schema) ||
          item.schema === "priceRow" && item.policy.priceBookCode !== terms.priceBookCode))
      throw new Error("Listing book policy is incompatible");
    const book = books[0].policy;
    if (book.validFrom && (!terms.startsAt || Date.parse(terms.startsAt) < Date.parse(book.validFrom)) ||
        book.validTo && (!terms.endsAt || Date.parse(terms.endsAt) > Date.parse(book.validTo)))
      throw new Error("Listing window exceeds selected book");
    return { publication, records, status: before };
  },
  /**
   * Confirms original committed receipt AND current retained row, rejecting replacement, partial writes
   * or supersession drift.
   * @param {Object} r Original admitted tenant/Enterprise request, preserving authData and private owner
   * context.
   * @param {Object} proof Owner-issued retained source proof, checked against exact selectors.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {string} receiptCode Exact original committed owner receipt identity.
   * @returns {Promise<Object>} Confirmed original publication receipt and exact retained row identity.
   * @remarks Effects: Read-only exact receipt/current-row validation.
   * Failure behavior: Rejects partial writes, supersession drift, foreign receipts or changed source
   * row.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  inspectPersisted: async function (r, proof, input, receiptCode) {
    const owner = SERVICE.DefaultPricingPublicationService, services = owner.targetServices();
    const receipt = await owner.readRecord(services.receipt, receiptCode, r);
    if (!receipt?.applied || receipt.publicationCode !== proof.operationCode || receipt.operationKey !== input.idempotencyKey ||
        receipt.sourceVersion !== receipt.targetVersion || receipt.fingerprint !== receipt.targetVersion)
      throw new Error("Original bundle price receipt is unconfirmed");
    const release = await owner.retainedVersion(receipt.targetVersion, r), expected = this.row(proof);
    if (!same(release.payload.bundleListing, proof) || release.rootType !== "priceBook" ||
        release.rootCode !== proof.terms.priceBookCode || receipt.pointerCode !== owner.pointerCode(release, r) ||
        !same(release.payload.records.find(item => item.schema === "priceRow" && item.policy.code === expected.code)?.policy, expected))
      throw new Error("Bundle price receipt identity conflict");
    const current = await this.book(r, proof);
    const rows = current.records.filter(item => item.schema === "priceRow" && item.policy.productCode === expected.productCode);
    if (rows.length !== 1 || !same(rows[0].policy, expected) ||
        !same(await owner.readRecord(services.receipt, receiptCode, r), receipt))
      throw new Error("Original listing price is no longer effective");
    return { confirmed: true, operationCode: proof.operationCode, productCode: proof.product.productCode,
      variantCode: proof.product.variantCode, storeCode: proof.terms.storeCode, currency: proof.terms.currency,
      amount: proof.terms.amount, receiptCode };
  },
  /**
   * Performs fixed original publication or readback only; caller payload never grants authoring
   * authority.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @param {string} phase Fixed owner lifecycle phase; never arbitrary executable input.
   * @returns {Promise<Object>} Verified original publication or readback result.
   * @remarks Effects: Publish may extend the existing retained policy target; inspect performs no repair
   * or settlement.
   * Failure behavior: Rejects unqualified actor, changed source, incomplete commit or target failure.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  execute: async function (request, input, phase) {
    if (!["publish", "inspect"].includes(phase)) throw new Error("Unsupported bundle Pricing phase");
    const settings = this.settings(), owner = SERVICE.DefaultPricingPublicationService;
    owner.requireTarget();
    const state = () => ({ tenant: request.tenant, tenantCode: request.tenantCode, enterpriseCode: request.enterpriseCode,
      entCode: request.entCode, participantEnterpriseCode: request.participantEnterpriseCode,
      authData: request.authData, auth: request.auth, authorization: request.authorization, body: request.body, payload: request.payload,
      query: request.query, headers: request.httpRequest?.headers, httpBody: request.httpRequest?.body,
      httpQuery: request.httpRequest?.query, input, publication: owner.publicationSettings() });
    const pinned = structuredClone(state());
    const check = () => {
      if (!same(settings, this.settings()) || !same(pinned, state()))
        throw new Error("Bundle Pricing authority or command changed");
    };
    check(); const proof = await this.source(request, input, phase); check();
    const authData = SERVICE.DefaultIdentityGovernanceService.getSystemAuthData();
    check();
    if (authData?.isSystem !== true) throw new Error("Canonical Pricing persistence unavailable");
    const token = {}, r = { tenant: proof.tenant, enterpriseCode: proof.enterpriseCode, authData, [capability]: token };
    contexts.set(token, { local: structuredClone({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, authData }), check });
    const fresh = async () => { check(); if (!same(proof, await this.source(request, input, phase))) throw new Error("Listing source changed"); check(); };
    try {
      const publication = { code: proof.operationCode, rootType: "priceBook", rootCode: proof.terms.priceBookCode };
      const services = owner.targetServices(), pointerCode = owner.pointerCode(publication, r);
      const receiptCode = owner.fingerprint({ tenant: r.tenant, enterpriseCode: r.enterpriseCode, pointerCode, operationKey: input.idempotencyKey });
      let receipt = await owner.readRecord(services.receipt, receiptCode, r);
      if (phase === "publish" && !receipt?.applied) {
        let release, expectedVersion, expectedRevision;
        if (receipt) {
          release = await owner.retainedVersion(receipt.targetVersion, r);
          if (!same(release.payload.bundleListing, proof)) throw new Error("Original bundle amendment conflict");
          expectedVersion = receipt.previousOnlineVersion ?? null; expectedRevision = receipt.expectedRevision;
        } else {
          const current = await this.book(r, proof), row = this.row(proof);
          if (current.records.length >= settings.maximumRecords) throw new Error("Price book amendment exceeds bound");
          if (current.records.some(item => item.schema === "priceRow" && (item.policy.code === row.code || item.policy.productCode === row.productCode)))
            throw new Error("Listing Product already has price policy");
          const payload = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, rootType: "priceBook", rootCode: publication.rootCode,
            records: [...current.records, { schema: "priceRow", policy: owner.capturePolicy("priceRow", row, r) }], bundleListing: proof };
          const code = owner.fingerprint(payload);
          release = { tenant: r.tenant, enterpriseCode: r.enterpriseCode, rootType: payload.rootType, rootCode: payload.rootCode,
            code, fingerprint: code, payload };
          expectedVersion = current.status.version; expectedRevision = current.status.revision;
          await fresh(); await owner.prepareTarget(release, r);
        }
        await fresh();
        await owner.switchTarget({ publication: { ...publication, sourceVersion: release.code }, operationKey: input.idempotencyKey,
          targetVersion: release.code, expectedVersion, expectedRevision }, r);
      }
      const result = await this.inspectPersisted(r, proof, input, receiptCode);
      await fresh();
      return result;
    } finally { contexts.delete(token); }
  },
  /**
   * Publishes through the existing retained policy target under the qualified automatic listing policy.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Original qualified Pricing publication receipt.
   * @remarks Effects: Delegates execute in fixed publish mode; no caller-selected target.
   * Failure behavior: Propagates publication/admission/receipt failures.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  publish: function (request, input) { return this.execute(request, input, "publish"); },
  /**
   * Read-only receipt inspection never settles partial writes or manufactures publication success.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {Object} input Operation input/selectors validated by this owner; supplied identities do not
   * grant authority.
   * @returns {Promise<Object>} Exact already committed Pricing receipt.
   * @remarks Effects: Delegates read-only inspect mode; does not settle partial writes.
   * Failure behavior: Rejects absent, partial or conflicting original evidence.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  inspect: function (request, input) { return this.execute(request, input, "inspect"); },
};
