/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module bidding/service/defaultBiddingOfferService.js @description Resolves generic published Product negotiation eligibility and seller references without assuming a product category or asset source. @layer service @owner bidding @override Later modules may override exported methods; retain authenticated scope and typed reference checks. */
module.exports = {
  /** Reads the authoritative published offer and requires deployment and product eligibility. */
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
      locale: store.locale || "en",
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
};
