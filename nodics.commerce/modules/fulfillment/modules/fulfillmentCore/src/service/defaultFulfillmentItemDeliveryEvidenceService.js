/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module fulfillmentCore/service/defaultFulfillmentItemDeliveryEvidenceService
 * @description Non-mutating ITEM evidence admission boundary; authenticated Shipment allocation receipts are not implemented.
 * @layer service
 * @owner fulfillmentCore
 * @override A qualified owner extension must implement authenticated admission and protected receipt reads, not override a proof flag.
 */
module.exports = {
  /** Reports source availability, not provider certification or installed qualification. @returns {Object} Inert owner contract. */
  contract: function () {
    return Object.freeze({ ownerModule: "fulfillmentCore", receiptOwner: "shipment", available: false,
      reason: "AUTHENTICATED_ALLOCATION_RECEIPT_NOT_IMPLEMENTED" });
  },
  /** Builds a stable refusal without echoing caller identifiers or proof content. @param {string} reason Owner refusal reason. @returns {Error} Fulfillment error. */
  error: function (reason) {
    return new CLASSES.NodicsError("ERR_FULFILLMENT_ITEM_DELIVERY_UNCONFIRMED", reason);
  },
  /** Copies exact own data fields; aliases, accessors, inherited evidence and envelopes are not a context. @param {Object} input Candidate record. @param {Array} keys Exact field names. @returns {Object} Detached field projection. */
  record: function (input, keys) {
    if (!input || typeof input !== "object" || Array.isArray(input) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(input)))
      throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
    const descriptors = Object.getOwnPropertyDescriptors(input), actual = Reflect.ownKeys(descriptors);
    if (actual.length !== keys.length || actual.some(key => !keys.includes(key)))
      throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
    const result = {};
    for (const key of keys) {
      const descriptor = descriptors[key];
      if (!descriptor || !Object.hasOwn(descriptor, "value") || !descriptor.enumerable)
        throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
      result[key] = descriptor.value;
    }
    return result;
  },
  /** Snapshots bounded original allocation selectors without claiming that they match a purchased coupon or delivery. @param {Object} input Promotion owner context only. @returns {Object} Frozen canonical request, never proof. */
  context: function (input) {
    const identities = ["tenant", "enterpriseCode", "issuerEnterpriseCode", "ownerId", "couponCode",
      "productCode", "promotionCode", "storeCode", "targetCode"];
    const result = this.record(input, [...identities, "promotionRevision", "merchantReceiptReference", "items"]);
    if (identities.some(key => typeof result[key] !== "string" || !/^[^\s\x00-\x1f\x7f]{1,192}$/.test(result[key])) ||
        !Number.isSafeInteger(result.promotionRevision) || result.promotionRevision < 0 ||
        typeof result.merchantReceiptReference !== "string" || !/^[A-Za-z0-9_.:@-]{1,119}$/.test(result.merchantReceiptReference))
      throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
    const items = result.items;
    if (!Array.isArray(items) || !items.length || items.length > 20 ||
        Reflect.ownKeys(items).length !== items.length + 1)
      throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
    const seen = new Set(), snapshot = [];
    for (let index = 0; index < items.length; index++) {
      const descriptor = Object.getOwnPropertyDescriptor(items, String(index));
      if (!descriptor || !Object.hasOwn(descriptor, "value")) throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
      const item = this.record(descriptor.value, ["sku", "quantity", "unit"]);
      if (typeof item.sku !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(item.sku) ||
          !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 100 ||
          item.unit !== "EACH" || seen.has(item.sku)) throw this.error("INVALID_ITEM_DELIVERY_CONTEXT");
      seen.add(item.sku);
      snapshot.push(Object.freeze(item));
    }
    result.items = Object.freeze(snapshot.sort((a, b) => a.sku < b.sku ? -1 : a.sku > b.sku ? 1 : 0));
    return Object.freeze(result);
  },
  /** Refuses all delivery claims until an authenticated owner-issued allocation receipt exists. No reads, writes, transport, cache or caller proof are consulted. @param {Object} input Exact Promotion owner context. @returns {Promise<never>} No successful native proof is currently available. */
  evaluate: async function (input) {
    this.context(input);
    // Generic DELIVERED tracking and manual warehouse receipts cannot establish ITEM authority.
    throw this.error("AUTHENTICATED_ALLOCATION_RECEIPT_NOT_IMPLEMENTED");
  },
};
