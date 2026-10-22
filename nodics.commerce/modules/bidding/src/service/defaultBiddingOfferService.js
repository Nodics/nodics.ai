/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module bidding/service/defaultBiddingOfferService.js
 * @description Resolves generic published Product negotiation eligibility and seller references
 * without assuming a product category or asset source.
 * @layer service
 * @owner bidding
 * @override Later modules may override exported methods; retain authenticated scope and typed
 * reference checks.
 * @remarks Bidding derives offer and auction terms from Product/Store owners, not browser pricing.
 * Extension preserves canonical seller reference and currently eligible publication.
 * Inputs and outputs are specified on each exported member below.
 * Effects and failures remain in the existing owner flow; missing evidence is never synthetic success.
 * Exported members: resolve, auction.
 * @override Customize through the existing loader-visible module members, preserving private
 * authority.
 */
module.exports = {
  /**
   * Reads the authoritative published offer and requires deployment and product eligibility.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {string} productCode Canonical published Product code.
   * @param {string} storeCode Canonical governed Store code.
   * @returns {Promise<Object>} Canonical Product/Store offer with typed seller, source and price terms.
   * @remarks Effects: Reads authoritative owner projections; no reservation or negotiation mutation.
   * Failure behavior: Rejects disabled, unavailable, malformed or incompatible offers.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  resolve: async function (request, productCode, storeCode) {
    const policy = CONFIG.get("bidding") || {},
      store = policy.stores?.[storeCode],
      fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    if (!store || store.enterpriseCode !== request.enterpriseCode)
      fail("This store does not accept bids");
    const result = await SERVICE.DefaultProductDiscoveryService.detail({
      ...request,
      productCode,
      storeCode,
      locale: store.locale || policy.locale,
      query: {},
    });
    const product = result.product,
      attributes = product?.localizedAttributes || {},
      terms = attributes.commerceBidding;
    const sellerRef =
      terms?.sellerRef ||
      (store.allowOwnerReference === true ? attributes.ownerRef : undefined);
    if (
      !product ||
      product.productCode !== productCode ||
      product.price?.currency !== store.currency ||
      (terms?.enabled !== true &&
        !(terms === undefined && store.allowOwnerReference === true))
    )
      fail("This published offer is not eligible for bidding");
    if (
      !sellerRef ||
      !["module", "schema", "code"].every(
        (key) =>
          typeof sellerRef[key] === "string" &&
          sellerRef[key].trim() === sellerRef[key] &&
          sellerRef[key].length > 0 &&
          sellerRef[key].length <= 180,
      )
    )
      fail("The published seller reference is invalid");
    return {
      product,
      store,
      sellerRef: {
        module: sellerRef.module,
        schema: sellerRef.schema,
        code: sellerRef.code,
      },
      sourceRef: attributes.sourceRef,
    };
  },
  /**
   * Snapshots Product-owned auction publication, dates and price; callers cannot supply these terms.
   * @param {Object} request Original owner request with tenant, authData and operation selectors;
   * payload is not authority.
   * @param {string} productCode Canonical published Product code.
   * @param {string} storeCode Canonical governed Store code.
   * @returns {Promise<Object>} Offer plus immutable auction publication, floor, dates and policy.
   * @remarks Effects: Reads/validates published auction terms; no round or hold is created.
   * Failure behavior: Rejects non-auction publication, invalid exact amount or listing window.
   * @override Override through the effective module member; retain the original owner, scope and
   * evidence checks described above.
   */
  auction: async function (request, productCode, storeCode) {
    const offer = await this.resolve(request, productCode, storeCode);
    const product = offer.product, terms = product.localizedAttributes.commerceBidding;
    const fail = (message) => SERVICE.DefaultBiddingService.fail(message);
    if (terms.mode !== "AUCTION" || typeof terms.publicationCode !== "string" ||
        !/^[A-Za-z0-9._:-]{1,180}$/.test(terms.publicationCode))
      fail("An authoritative auction publication is required");
    if (!Object.hasOwn(product, "startDate") || !Object.hasOwn(product, "endDate"))
      fail("Published auction window evidence is unavailable");
    const start = product.startDate == null || product.startDate === "" ? null : Date.parse(product.startDate);
    const end = product.endDate == null || product.endDate === "" ? null : Date.parse(product.endDate);
    if ((start !== null && !Number.isFinite(start)) || (end !== null && !Number.isFinite(end)) ||
        (start !== null && end !== null && end <= start)) fail("Published auction dates are invalid");
    const floor = SERVICE.DefaultExactAmountService.normalize(product.price.unitAmount);
    if (SERVICE.DefaultExactAmountService.compare(floor, "0") <= 0) fail("Published auction price must be positive");
    return { ...offer, publicationCode: terms.publicationCode, floor,
      startsAt: start === null ? null : new Date(start).toISOString(),
      endsAt: end === null ? null : new Date(end).toISOString() };
  },
};
