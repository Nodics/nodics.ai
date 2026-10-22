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
 * @module digitalCore/service/defaultDigitalCertificateHoldingsService
 * @description Projects safe canonical certificate holdings under current Profile participant authority.
 * Inputs: Original Customer/Enterprise request plus optional ownerRef and page.
 * Outputs: Bounded allowlisted holdings page without private provider fields.
 * Effects: Reads Profile and certificate owner, with admission before/after transport; no holds or identity
 * provisioning.
 * Failure behavior: Invalid selectors, revoked authority or malformed page evidence rejects.
 * Exported members: list.
 * @owner digitalCore
 * @layer service
 * @override Override list through the module loader while retaining typed owner admission and safe
 * projection.
 * @see ../../llm/contracts/bundle-holdings-and-gifts.md
 */
module.exports = {
  /**
   * Derives identity from current Profile evidence and refuses caller-selected foreign owners.
   * @param {Object} r Original Customer or represented-Enterprise request with tenant/authData and bearer.
   * @param {Object} [input={}] Only optional canonical ownerRef and positive page; page size comes from
   * owner config.
   * @returns {Promise<Object>} Version1 safe items/ownerRef/page/limit/total; private remote fields are
   * omitted.
   * @remarks Effects: Derives current Profile identity, authorizes before and after bounded holdings
   * transport; no reservation.
   * Failure behavior: Rejects extra selectors, foreign owner, unsafe paging, revocation or
   * malformed/duplicate remote rows.
   * @override Keep original participant authority and allowlisted projection; no customer provisioning or
   * inferred ownership.
   */
  list: async function (r, input = {}) {
    const bundle = SERVICE.DefaultDigitalBundleService, authority = SERVICE.DefaultDigitalBundleAuthorityService;
    if (Object.keys(input).some(k => !["ownerRef", "page"].includes(k))) throw new Error("Unsupported holdings selection");
    let ownerRef = input.ownerRef;
    if (!ownerRef) {
      if (r.authData?.principalType === "human") ownerRef = { module: "profile", schema: "enterprise", code: r.authData.enterpriseCode || r.authData.entCode };
      else {
        const identity = await authority.profile(r, "/customer/identity");
        if (identity?.contractVersion !== 1 || identity.tenant !== r.tenant || identity.customer?.loginId !== r.authData?.loginId)
          throw new Error("Current certificate owner is unconfirmed");
        ownerRef = { module: "profile", schema: "customer", code: identity.customer.code };
      }
    }
    ownerRef = bundle.owner(ownerRef);
    await bundle.authorize(r, ownerRef, "HOLDINGS_READ");
    const page = input.page === undefined ? 1 : input.page, limit = CONFIG.get("digitalCore")?.bundles?.certificatePageSize;
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(page * limit))
      throw new Error("Invalid certificate page");
    const result = await SERVICE.DefaultDigitalCommerceOwnershipService.remote(r, "bundle-holdings", { ownerRef, page, limit });
    await bundle.authorize(r, ownerRef, "HOLDINGS_READ");
    if (result?.contractVersion !== 1 || !same(result.ownerRef, ownerRef) || result.page !== page || result.limit !== limit ||
        !Number.isSafeInteger(result.total) || result.total < 0 || !Array.isArray(result.items) || result.items.length > limit || result.items.length > result.total ||
        result.items.some(row => typeof row.code !== "string" || !row.code || !Number.isSafeInteger(row.revision) || row.revision < 0 ||
          typeof row.available !== "boolean" || typeof row.valid !== "boolean" ||
          ["categoryCode", "brandCode", "modelCode", "assetStatus", "custodyStatus"].some(key => row[key] !== undefined && row[key] !== null && typeof row[key] !== "string")) ||
        new Set(result.items.map(row => row.code)).size !== result.items.length)
      throw new Error("Certificate holdings response is unconfirmed");
    return { contractVersion: 1, ownerRef, items: result.items.map(row => ({ code: row.code, revision: row.revision,
      available: row.available, valid: row.valid, categoryCode: row.categoryCode, brandCode: row.brandCode, modelCode: row.modelCode,
      assetStatus: row.assetStatus, custodyStatus: row.custodyStatus })), page, limit, total: result.total };
  },
};
