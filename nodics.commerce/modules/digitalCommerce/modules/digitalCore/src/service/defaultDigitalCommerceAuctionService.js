/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require("node:util");
/**
 * @module digitalCore/service/defaultDigitalCommerceAuctionService
 * @description Coordinates retained whole-bundle publication and reconciled auction withdrawal.
 * Inputs: Original manifest/context/terms, participant or runtime authority and persisted owner receipts.
 * Outputs: Exact quantity-one publication, runtime source proof or released listing evidence.
 * Effects: Persists Digital checkpoints and calls Product/Pricing/Bidding/component owners, never their
 * source repositories.
 * Failure behavior: Unconfirmed activation/withdrawal, funds or component state retains original recoverable
 * holds.
 * Exported members: settings, bundles, placement, manifest, read, checkpoint, product, price, binding,
 * publish, terms, published, held, proof, publication, release.
 * @owner digitalCore
 * @layer service
 * @override Override effective members while preserving immutable terms, seller/merchant separation and
 * receipt-gated release.
 * @see ../../llm/contracts/bundle-publication.md
 */
module.exports = {
  /**
   * Validates framework dependencies without claiming deployment qualification.
   * @returns {Object} Cloned enabled listing policy with fixed Product owner/role and bounded single-attempt
   * transport.
   * @remarks Effects: Reads effective Digital config only; no activation.
   * Failure behavior: Throws when listings disabled, Pricing missing or Product target/timeout invalid.
   * @override Keep COMMERCE_STAGED Product placement and explicit qualification separate from source wiring.
   */
  settings: function () {
    const p = CONFIG.get("digitalCore")?.bundleListings;
    if (p?.enabled !== true || typeof p.pricingService !== "string" || !p.productTarget?.connectionName ||
        p.productTarget.moduleName !== "product" || p.productTarget.targetAuthority?.runtimeRole !== "COMMERCE_STAGED" ||
        !Number.isSafeInteger(p.productTarget.timeoutMs) || p.productTarget.timeoutMs < 1 || p.productTarget.maxAttempts !== 1)
      throw new Error("Bundle listing owners are not configured");
    return structuredClone(p);
  },
  /**
   * Uses the existing bundle repository and its installed unique identity/CAS qualification.
   * @returns {Object|undefined} Effective DefaultDigitalBundleService registry member.
   * @remarks Effects: Registry lookup only.
   * Failure behavior: Missing registry entry is returned as undefined; callers enforce capability
   * availability.
   * @override Dispatch through effective loader members so owner overrides remain honored.
   */
  bundles: function () { return SERVICE.DefaultDigitalBundleService; },
  /**
   * Uses Product's existing Store-owner placement handoff, not the participant's Enterprise as marketplace
   * namespace.
   * @param {Object} r Tenant context for canonical Product Store placement.
   * @param {string} storeCode Explicit governed Store reference.
   * @returns {Promise<Object>} Active canonical Store with owning Enterprise and positive revision.
   * @remarks Effects: Reads Product via this runtime's token; no publication/hold effects.
   * Failure behavior: Rejects missing credential or foreign/inactive/malformed Store evidence.
   * @override Never substitute participant Enterprise for Store merchant placement.
   */
  placement: async function (r, storeCode) {
    const token = NODICS.getInternalAuthToken?.(r.tenant);
    if (!token) throw new Error('Listing runtime credential is unavailable');
    const result = SERVICE.DefaultDigitalBundleAuthorityService.unwrap(await SERVICE.DefaultModuleService.invokeModule({
      ...this.settings().productTarget, local: false, tenant: r.tenant, methodName: 'POST',
      apiName: '/internal/products/listings/store-context', requestBody: { contractVersion: 1, storeCode },
      header: { Authorization: 'Bearer ' + token, tenant: r.tenant }, followRedirects: false, rejectUnauthorized: true }));
    if (result?.contractVersion !== 1 || result.tenant !== r.tenant || result.store?.code !== storeCode ||
        result.store.active !== true || result.store.status !== 'ACTIVE' || !result.store.enterpriseCode ||
        !Number.isSafeInteger(result.store.revision) || result.store.revision < 1)
      throw new Error('Canonical listing Store placement is unavailable');
    return result.store;
  },
  /**
   * Original manifest partition is retained independently of the marketplace publication partition.
   * @param {Object} r Tenant context for the retained listing operation.
   * @param {Object} row Persisted listing with manifestEnterpriseCode, manifest code/revision/digest and
   * ownerRef.
   * @returns {Promise<Object>} Original manifest from its retained seller namespace.
   * @remarks Effects: Reads/validates manifest only.
   * Failure behavior: Rejects missing partition or changed revision/digest/owner.
   * @override Preserve seller manifest partition independently of merchant publication.
   */
  manifest: async function (r, row) {
    if (!row.evidence?.manifestEnterpriseCode) throw new Error('Original manifest namespace is unavailable');
    const b = this.bundles(), manifest = b.manifest(await b.read({ ...r, enterpriseCode: row.evidence.manifestEnterpriseCode },
      'DefaultDigitalBundleManifestService', row.manifestCode));
    if (manifest.revision !== row.manifestRevision || manifest.digest !== row.evidence.manifestDigest || !same(manifest.ownerRef, row.ownerRef))
      throw new Error('Original manifest identity changed');
    return manifest;
  },
  /**
   * Accepts only retained publication identities, never arbitrary generated record selectors.
   * @param {Object} r Admitted tenant/Enterprise listing namespace.
   * @param {string} code Exact bundle-operation SHA256 identity.
   * @returns {Promise<Object>} Retained LISTING operation whose publication code and terms digest match.
   * @remarks Effects: Reads existing operation; no creation.
   * Failure behavior: Rejects malformed key, non-listing row or changed retained terms.
   * @override Do not expose generic generated-record selectors or infer replacement authority.
   */
  read: async function (r, code) {
    if (typeof code !== "string" || !/^bundle-operation:[a-f0-9]{64}$/.test(code)) throw new Error("Original bundle publication is required");
    const row = await this.bundles().read(r, "DefaultDigitalBundleOperationService", code);
    const listing = row?.evidence?.listing;
    if (!row || row.purpose !== "LISTING" || !listing || listing.publicationCode !== code ||
        this.bundles().digest(listing.terms) !== listing.termsDigest) throw new Error("Retained listing terms are unavailable");
    return row;
  },
  /**
   * Persists each publication checkpoint in the same managed-revision holdings operation.
   * @param {Object} r Admitted listing partition.
   * @param {Object} row Current persisted operation and CAS revision.
   * @param {Object} patch Owner-verified listing checkpoint fields to merge.
   * @returns {Promise<Object>} CAS-updated original operation.
   * @remarks Effects: Merges patch only into evidence.listing through bundle update.
   * Failure behavior: Concurrency/storage failure rejects; caller must reconcile original operation.
   * @override Preserve unrelated evidence and use generated revision handling.
   */
  checkpoint: function (r, row, patch) {
    return this.bundles().update(r, row, { evidence: { ...row.evidence, listing: { ...row.evidence.listing, ...patch } } });
  },
  /**
   * Fixed Product owner transport uses this runtime's credential, never a customer's publisher
   * impersonation.
   * @param {Object} r Tenant/correlation context for original listing.
   * @param {string} phase Fixed prepare/publish/inspect/withdraw phase.
   * @param {Object} row Retained listing operationCode and governed storeCode.
   * @returns {Promise<*>} Unwrapped Product owner response; phase caller validates exact proof.
   * @remarks Effects: Calls Product with runtime token and fixed endpoint; prepare/publish/withdraw may
   * mutate Product.
   * Failure behavior: Rejects unsupported phase, missing credential, transport or policy drift.
   * @override Never forward customer publisher credentials or retry with replacement terms.
   */
  product: async function (r, phase, row) {
    if (!["prepare", "publish", "inspect", "withdraw"].includes(phase)) throw new Error("Unknown Product listing phase");
    const policy = this.settings(), token = NODICS.getInternalAuthToken?.(r.tenant);
    if (typeof token !== "string" || !token) throw new Error("Product runtime authentication unavailable");
    const result = await SERVICE.DefaultModuleService.invokeModule({ ...policy.productTarget, local: false,
      tenant: r.tenant, methodName: "POST", apiName: "/internal/products/bundle-listings/" + phase,
      header: { Authorization: "Bearer " + token, tenant: r.tenant },
      requestBody: { operationCode: row.code, storeCode: row.evidence.listing.terms.storeCode },
      followRedirects: false, rejectUnauthorized: true });
    if (!same(policy, this.settings())) throw new Error("Bundle publication configuration changed");
    return SERVICE.DefaultDigitalBundleAuthorityService.unwrap(result);
  },
  /**
   * Keeps price publishing with Pricing and requires exact persisted tuple evidence.
   * @param {Object} r Retained listing context.
   * @param {Object} row Persisted terms and Product binding.
   * @param {string} phase Internal publish or inspect Pricing method.
   * @returns {Promise<Object>} Confirmed exact Pricing receipt for
   * operation/product/variant/store/amount/currency.
   * @remarks Effects: Delegates price publish/inspect to configured Pricing owner with stable :price key.
   * Failure behavior: Rejects absent owner method or mismatched/unconfirmed tuple/receipt.
   * @override Keep monetary row ownership in Pricing and require persisted exact evidence.
   */
  price: async function (r, row, phase) {
    const owner = SERVICE[this.settings().pricingService], listing = row.evidence.listing;
    if (typeof owner?.[phase] !== "function") throw new Error("Pricing bundle listing owner unavailable");
    const proof = await owner[phase](r, { operationCode: row.code, terms: structuredClone(listing.terms),
      product: structuredClone(listing.product), idempotencyKey: row.code + ":price" });
    if (proof?.confirmed !== true || proof.operationCode !== row.code || proof.productCode !== listing.product.productCode ||
        proof.variantCode !== listing.product.variantCode || proof.storeCode !== listing.terms.storeCode ||
        proof.currency !== listing.terms.currency || proof.amount !== listing.terms.amount || !proof.receiptCode)
      throw new Error("Published listing price is unconfirmed");
    return proof;
  },
  /**
   * Creates the original quantity-one Digital binding, never a replacement pool or replenished inventory.
   * @param {Object} r Tenant and merchant namespace.
   * @param {Object} row Original manifest/listing with retained Product tuple and immutable terms.
   * @returns {Promise<Object>} Exactly read-back original quantity-one DigitalProductBinding.
   * @remarks Effects: Saves original deterministic binding, rereads and asserts exact retained model.
   * Failure behavior: Rejects save failure, missing/duplicate readback or conflicting binding.
   * @override No replacement inventory pool; binding must reference original operation/manifest.
   */
  binding: async function (r, row) {
    const owner = SERVICE.DefaultDigitalCommerceEntitlementService, listing = row.evidence.listing;
    const model = { tenant: r.tenant, enterpriseCode: row.enterpriseCode,
      code: 'bundle-binding:' + this.bundles().digest(row.code), revision: 0, active: true, status: 'ACTIVE',
      productCode: listing.product.productCode, variantCode: listing.product.variantCode, sku: listing.product.sku,
      digitalDeliveryType: 'DIGITAL_OWNERSHIP', inventoryStrategy: 'DIGITAL_COMMERCE', providerOwner: 'digitalCore',
      providerReference: { operationCode: row.code, manifestCode: row.manifestCode, manifestRevision: row.manifestRevision,
        manifestDigest: row.evidence.manifestDigest, quantity: '1', storeCode: listing.terms.storeCode },
      idempotencyKey: row.code + ':binding', correlationId: row.correlationId };
    await owner.save(SERVICE.DefaultDigitalProductBindingService, r, model);
    const rows = await owner.readRecords(SERVICE.DefaultDigitalProductBindingService, r,
      { tenant: r.tenant, enterpriseCode: row.enterpriseCode, code: model.code });
    if (rows.length !== 1) throw new Error('Original bundle binding is unavailable');
    owner.assertSaved(rows[0], model);
    return rows[0];
  },
  /**
   * Holds original components before preparing any Product, including future-start listings.
   * @param {Object} r Fresh participant request with tenant/Enterprise authData and bearer.
   * @param {Object} input Confirmed manifest/revision, original idempotencyKey, listingContextRef and
   * explicit reviewed terms.
   * @returns {Promise<Object>} Confirmed original PUBLISHED quantity-one binding and optional auction
   * reference.
   * @remarks Effects: Authorizes, validates governed context, persists original terms, reserves components
   * and coordinates Product/Pricing/Bidding checkpoints.
   * Failure behavior: Rejects changed identity/context or uncertain owner proof; existing holds/checkpoints
   * remain for original recovery.
   * @override Use shared commandKey and original manifest namespace; no activation from dates or
   * acknowledgements alone.
   */
  publish: async function (r, input) {
    r = { ...r, authData: structuredClone(r.authData || {}) };
    input = structuredClone(input);
    this.settings();
    const b = this.bundles(), manifest = b.manifest(await b.read(r, "DefaultDigitalBundleManifestService", input.manifestCode));
    if (input.confirmed !== true || manifest.revision !== input.manifestRevision ||
        typeof input.idempotencyKey !== "string" || !input.idempotencyKey)
      throw new Error("Review the original bundle publication command");
    const authority = await b.authorize(r, manifest.ownerRef, "BUNDLE_LIST");
    const command = structuredClone(input), terms = this.terms(command);
    if (manifest.composition && (manifest.compositionDigest !== b.digest(manifest.composition) ||
        manifest.composition.mode !== terms.saleMode || manifest.composition.operationKey !== input.idempotencyKey ||
        !same(manifest.composition.terms, { ...terms, listingContextRef: command.listingContextRef })))
      throw new Error('Original reviewed listing changed');
    const context = await SERVICE.DefaultDigitalBundleCompositionService.admit(r, command, terms, manifest.ownerRef);
    const manifestEnterpriseCode = r.enterpriseCode, store = context.store;
    r = { ...r, enterpriseCode: store.enterpriseCode };
    b.commandKey(input.idempotencyKey);
    const code = "bundle-operation:" + b.digest([r.tenant, r.enterpriseCode, manifest.ownerRef, input.idempotencyKey]);
    const digest = b.digest(terms);
    let row = await b.read(r, "DefaultDigitalBundleOperationService", code);
    if (row && (row.evidence?.listing?.termsDigest !== digest || !same(row.evidence.listing.contextRef, context.contextRef) || row.manifestCode !== manifest.code ||
        row.manifestRevision !== manifest.revision)) throw new Error("Listing command conflicts with original publication");
    if (!row) row = await b.insert(r, "DefaultDigitalBundleOperationService", {
      ...b.scope(r), code, manifestCode: manifest.code, manifestRevision: manifest.revision, ownerRef: manifest.ownerRef,
      purpose: "LISTING", status: "RESERVING", revision: 0, checkpoints: {},
      commandDigest: b.digest({ manifestCode: manifest.code, manifestRevision: manifest.revision, purpose: "LISTING", recipientRef: null }),
      idempotencyKey: input.idempotencyKey, correlationId: r.correlationId || input.idempotencyKey,
      evidence: { actorRef: authority.actorRef, manifestDigest: manifest.digest, manifestEnterpriseCode, finalSale: true,
        listing: { publicationCode: code, terms, termsDigest: digest, contextRef: context.contextRef,
          rewardEvidence: context.rewardEvidence, phase: "HOLDING" } } });
    if (row.status === "RESERVING") {
      row = await b.componentsPhase(r, row, manifest, 'reserve', 'RESERVED');
      row = await b.update(r, row, { status: 'HELD' });
    }
    if (row.status !== "HELD" || row.evidence.listing.release) throw new Error("Original listing is no longer publishable");
    if (!row.evidence.listing.product) {
      const product = await this.product(r, "prepare", row);
      if (product?.confirmed !== true || product.publicationCode !== row.code || !product.productCode ||
          !product.variantCode || !product.sku || !Number.isSafeInteger(product.versionId) || product.versionId < 0)
        throw new Error("Product authoring remains unconfirmed");
      row = await this.checkpoint(r, row, { product, phase: "PRICING" });
    }
    const binding = await this.binding(r, row);
    if (!row.evidence.listing.bindingCode) row = await this.checkpoint(r, row, { bindingCode: binding.code });
    else if (row.evidence.listing.bindingCode !== binding.code) throw new Error('Original binding changed');
    if (!row.evidence.listing.price) row = await this.checkpoint(r, row, { price: await this.price(r, row, "publish"), phase: "PUBLISHING" });
    await this.price(r, row, "inspect");
    const publication = await this.product(r, "publish", row);
    this.published(row, publication);
    row = await this.checkpoint(r, row, { publication, phase: "PUBLISHED" });
    if (terms.saleMode === 'AUCTION' && !row.evidence.listing.auction) {
      const auctions = SERVICE.DefaultBiddingAuctionService;
      if (!auctions?.open) throw new Error('Bidding round owner is unavailable');
      const round = await auctions.open({ ...r, idempotencyKey: row.code + ':round',
        payload: { confirmed: true, storeCode: terms.storeCode, productCode: row.evidence.listing.product.productCode,
          variantCode: row.evidence.listing.product.variantCode } });
      if (!round?.code || round.publicationCode !== row.code || round.productCode !== row.evidence.listing.product.productCode)
        throw new Error('Original Bidding round is unconfirmed');
      row = await this.checkpoint(r, row, { auction: { roundCode: round.code, storeCode: terms.storeCode } });
    }
    // Revalidate actor admission before returning success, but never release an uncertain publication.
    await b.authorize(r, manifest.ownerRef, "BUNDLE_LIST");
    return { confirmed: true, operationCode: row.code, publicationCode: row.code,
      listingContextRef: row.evidence.listing.contextRef,
      ...row.evidence.listing.product, bindingCode: binding.code, status: "PUBLISHED", quantity: "1", startsAt: terms.startsAt, endsAt: terms.endsAt,
      biddingMode: terms.saleMode, ...(row.evidence.listing.auction ? { auction: row.evidence.listing.auction } : {}) };
  },
  /**
   * Validates explicit business selections; there are no hidden date, mode, currency or price defaults.
   * @param {Object} input Explicit Store/currency/pricebook/reward, FIXED/AUCTION, name, amount, UTC dates
   * and categoryCodes; optional description.
   * @returns {Object} Normalized immutable listing terms with exact amount and sorted unique categories.
   * @remarks Effects: Pure validation/normalization via exact amount and settlement reward owners.
   * Failure behavior: Throws for malformed identifiers/text/dates/quantities or invalid reward precision.
   * @override Keep business selections explicit and owner-validated; do not supply hidden price/date/mode
   * defaults.
   */
  terms: function (input) {
    const identifier = v => typeof v === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:@-]{0,191}$/.test(v);
    if (!identifier(input.storeCode) || !identifier(input.currency) || !identifier(input.priceBookCode) ||
        !["FIXED", "AUCTION"].includes(input.saleMode) || typeof input.name !== "string" || !input.name.trim() ||
        input.name.length > 180 || typeof input.amount !== "string" || input.amount.length > 32 ||
        SERVICE.DefaultExactAmountService.compare(input.amount, "0") <= 0) throw new Error("Exact listing selections are required");
    const date = value => {
      if (value === null || value === "") return null;
      if (typeof value !== "string" || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value)
        throw new Error("Explicit UTC listing dates are required");
      return value;
    };
    const startsAt = date(input.startsAt), endsAt = date(input.endsAt);
    if (startsAt !== null && endsAt !== null && endsAt <= startsAt) throw new Error("Listing end must follow start");
    if (!Array.isArray(input.categoryCodes) || input.categoryCodes.some(code => !identifier(code)) ||
        new Set(input.categoryCodes).size !== input.categoryCodes.length) throw new Error("Product categories are required");
    if (input.description !== undefined && (typeof input.description !== "string" || input.description.length > 2000))
      throw new Error("Listing description is invalid");
    const reward = SERVICE.DefaultDigitalBundleSettlementService.rewardTerms({ reward: input.reward, amount: input.amount });
    return { storeCode: input.storeCode, currency: input.currency, priceBookCode: input.priceBookCode, reward,
      saleMode: input.saleMode, name: input.name.trim(), ...(input.description !== undefined ? { description: input.description } : {}),
      amount: SERVICE.DefaultExactAmountService.normalize(input.amount), startsAt, endsAt, categoryCodes: [...input.categoryCodes].sort() };
  },
  /**
   * Confirms actual Product activation rather than accepting a prepared graph or elapsed time.
   * @param {Object} row Original operation with retained Product tuple and Store terms.
   * @param {Object} proof Actual Product publication receipt.
   * @returns {undefined} Returns only when exact ONLINE activation is proven.
   * @remarks Effects: Read-only receipt validation.
   * Failure behavior: Throws for wrong publication/Product/Store, missing targetVersion/receipt or
   * non-ONLINE state.
   * @override Preparation and elapsed time must never substitute for activation evidence.
   */
  published: function (row, proof) {
    const listing = row.evidence.listing;
    if (proof?.confirmed !== true || proof.status !== "ONLINE" || proof.publicationCode !== row.code ||
        proof.productCode !== listing.product.productCode || proof.variantCode !== listing.product.variantCode ||
        proof.storeCode !== listing.terms.storeCode || !proof.targetVersion || !proof.receiptCode)
      throw new Error("Exact Product activation is unconfirmed");
  },
  /**
   * Independently reads manifest and every retained original component hold.
   * @param {Object} r Listing scope used to resolve original manifest.
   * @param {Object} row Original HELD operation and per-component checkpoints.
   * @returns {Promise<Object>} Original manifest after complete held-receipt verification.
   * @remarks Effects: Reads manifest and checks every reserve checkpoint; no remote release or transfer.
   * Failure behavior: Rejects wrong state/digest/revision, missing receipt or any release/transfer
   * checkpoint.
   * @override Whole-package holds are required; no partial listing availability.
   */
  held: async function (r, row) {
    const manifest = await this.manifest(r, row);
    if (row.status !== "HELD" || manifest.revision !== row.manifestRevision || manifest.digest !== row.evidence.manifestDigest)
      throw new Error("Original bundle holdings are unavailable");
    for (const [index, component] of manifest.components.entries()) {
      const receipt = row.checkpoints[index]?.reserve;
      if (receipt?.status !== "RESERVED" || receipt.operationKey !== row.code + ":" + index ||
          !same(receipt.reference, component.reference) || receipt.quantity !== component.quantity || !receipt.receiptCode ||
          row.checkpoints[index].release || row.checkpoints[index].transfer)
        throw new Error("Original component hold is unconfirmed");
    }
    return manifest;
  },
  /**
   * Runtime-only Product proof reads retained terms, never accepts a caller-supplied Product model.
   * @param {Object} r Signed service runtime with commerce.digital.bundle.publish and consistent
   * tenant/Enterprise aliases.
   * @param {Object} input Exact operationCode and matching storeCode.
   * @returns {Promise<Object>} Retained owner/terms/manifest/Product/price/release proof in original
   * namespace.
   * @remarks Effects: Reads listing and original manifest/holds; does not publish or mutate components.
   * Failure behavior: Rejects non-runtime authority, conflicting aliases or inconsistent retained Store/hold
   * evidence.
   * @override Body selectors cannot grant publication authority; retain independent runtime admission.
   */
  proof: async function (r, input) {
    const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(r, "digitalCore");
    if (r.authData?.tokenType !== "service" || r.authData.tenant !== r.tenant ||
        !r.authData.permissions?.includes("commerce.digital.bundle.publish") || !auth.entCode ||
        [auth.enterpriseCode, r.enterpriseCode, r.entCode].some(value => value !== undefined && value !== auth.entCode))
      throw new Error("Bundle publication runtime is required");
    r = { ...r, enterpriseCode: auth.entCode };
    const row = await this.read(r, input.operationCode), listing = row.evidence.listing;
    if (listing.terms.storeCode !== input.storeCode) throw new Error("Listing Store changed");
    const manifest = await this.manifest(r, row);
    if (manifest.digest !== row.evidence.manifestDigest) throw new Error("Listing manifest changed");
    if (!listing.release) await this.held(r, row);
    return { confirmed: true, tenant: r.tenant, enterpriseCode: row.enterpriseCode, operationCode: row.code,
      ownerRef: row.ownerRef, termsDigest: listing.termsDigest, terms: listing.terms,
      manifest: { code: manifest.code, revision: manifest.revision, digest: manifest.digest },
      product: listing.product || null, price: listing.price || null, release: listing.release || null };
  },
  /**
   * Proves original published terms throughout grace without requiring intake to remain open.
   * @param {Object} r Original Bidding/publication context.
   * @param {Object} input round or offer plus optional previousRound for original terms/reconciliation
   * comparison.
   * @returns {Promise<Object>} Confirmed publicationCode/termsMatch and, when required,
   * previousPurchaseReconciled.
   * @remarks Effects: Reads held listing, current Product activation, Pricing and prior Bidding
   * reconciliation.
   * Failure behavior: Rejects unresolved purchase claim, changed terms or unreconciled previous failed
   * selection.
   * @override Intake closure does not invalidate retained publication; actual owner receipts still govern
   * grace.
   */
  publication: async function (r, input) {
    const publicationCode = input.round?.publicationCode || input.offer?.publicationCode;
    const row = await this.read(r, publicationCode), listing = row.evidence.listing;
    await this.held(r, row);
    if (listing.phase !== "PUBLISHED" || listing.release || row.evidence.purchaseClaim) throw new Error("Listing is not published or has a pending purchase");
    this.published(row, await this.product(r, "inspect", row));
    await this.price(r, row, "inspect");
    const terms = input.round || { productCode: input.offer?.product.productCode,
      variantCode: r.payload?.variantCode, storeCode: r.payload?.storeCode, floor: input.offer?.floor,
      currency: input.offer?.store.currency, startsAt: input.offer?.startsAt, endsAt: input.offer?.endsAt, sellerRef: input.offer?.sellerRef };
    if (terms.productCode !== listing.product.productCode || terms.variantCode !== listing.product.variantCode ||
        terms.storeCode !== listing.terms.storeCode || terms.floor !== listing.terms.amount || terms.currency !== listing.terms.currency ||
        terms.startsAt !== listing.terms.startsAt || terms.endsAt !== listing.terms.endsAt || !same(terms.sellerRef, row.ownerRef))
      throw new Error("Auction publication terms changed");
    if (input.previousRound && ["SELECTED", "FAILED"].includes(input.previousRound.status)) {
      const previous = await SERVICE.DefaultBiddingAuctionService.load(r, input.previousRound.code);
      if (previous.status !== "FAILED" || previous.selection?.reconciliation?.noPendingPurchase !== true ||
          previous.selection.reconciliation.holdingsAvailable !== true || !previous.cleanupComplete)
        throw new Error("Previous purchase is not reconciled");
    }
    return { confirmed: true, publicationCode: row.code, termsMatch: true,
      ...(["SELECTED", "FAILED"].includes(input.previousRound?.status) ? { previousPurchaseReconciled: true } : {}) };
  },
  /**
   * Rechecks persisted Bidding terminal state, withdraws Product, then releases original holds with durable
   * fencing.
   * @param {Object} r Original signed scheduler or participant request.
   * @param {Object} input Original round reference and round.code + :listing-release idempotencyKey.
   * @returns {Promise<Object>} Confirmed RELEASED publication receipt.
   * @remarks Effects: Rechecks terminal Bidding/loser funds, persists withdrawal fence, withdraws Product
   * then releases original components.
   * Failure behavior: Rejects non-seller/unauthorized caller, pending purchase/funds or uncertain
   * withdrawal/hold release.
   * @override Never release from elapsed intake dates, unresolved capture or unconfirmed Product withdrawal.
   */
  release: async function (r, input) {
    const auctions = SERVICE.DefaultBiddingAuctionService;
    r = r.authData?.principalType === 'service' ? auctions.scheduler(r) : await auctions.participant(r);
    const round = await SERVICE.DefaultBiddingAuctionService.load(r, input.round?.code);
    if (!["CANCELLED", "UNSOLD", "FAILED"].includes(round.status) || input.idempotencyKey !== round.code + ":listing-release" ||
        round.tenant !== r.tenant || round.enterpriseCode !== r.enterpriseCode ||
        round.status === "FAILED" && (round.selection?.reconciliation?.noPendingPurchase !== true ||
          round.selection.reconciliation.fundsReconciled !== true || round.selection.reconciliation.holdingsAvailable !== true))
      throw new Error("Persisted auction release fence is required");
    if (r.authData?.principalType !== 'service' && !auctions.isSeller(r, round)) throw new Error('Only the listing seller may release it');
    for (const bid of Object.values(round.bids)) if (bid.reservation && bid.code !== round.selection?.bidCode &&
        (bid.release?.status !== 'RELEASED' || bid.release.reservationCode !== bid.reservation.code))
      throw new Error("Auction loser funds are unresolved");
    let row = await this.read(r, round.publicationCode);
    const listing = row.evidence.listing;
    if (row.evidence.purchaseClaim) throw new Error('Listing purchase must be reconciled before release');
    if (listing.product.productCode !== round.productCode || !same(row.ownerRef, round.sellerRef)) throw new Error("Listing release identity changed");
    const release = { roundCode: round.code, idempotencyKey: input.idempotencyKey };
    if (listing.release && !same(listing.release, release)) throw new Error("Original listing release must be recovered");
    if (!listing.release) row = await this.checkpoint(r, row, { release, phase: "WITHDRAWING" });
    if (!row.evidence.listing.withdrawal) {
      const proof = await this.product(r, "withdraw", row);
      if (proof?.confirmed !== true || proof.status !== "WITHDRAWN" || proof.publicationCode !== row.code ||
          proof.activeVersion !== null || !proof.receiptCode) throw new Error("Product withdrawal is unconfirmed");
      row = await this.checkpoint(r, row, { withdrawal: proof, phase: "RELEASING" });
    }
    if (row.status === "HELD") row = await this.bundles().update(r, row, { status: "RELEASING" });
    if (row.status === 'RELEASING') {
      const manifest = await this.manifest(r, row);
      row = await this.bundles().componentsPhase(r, row, manifest, 'release', 'RELEASED');
      row = await this.bundles().update(r, row, { status: 'RELEASED' });
    }
    if (row.status !== "RELEASED") throw new Error("Bundle release is unconfirmed");
    return { confirmed: true, publicationCode: row.code, status: "RELEASED" };
  },
};
