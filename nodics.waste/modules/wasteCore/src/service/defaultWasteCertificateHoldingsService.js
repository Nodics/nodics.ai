/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require("node:util");
/** @module wasteCore/service/defaultWasteCertificateHoldingsService @description Projects bounded canonical certificate holdings for an admitted Commerce participant without exposing operational evidence. @owner wasteCore @layer service */
module.exports = {
  /**
   * Keeps certificate reads behind fresh domain service admission and fixed owner selectors.
   * @param {Object} r Admitted tenant-scoped request; private admission must remain attached.
   * @param {Object} input Operation-specific command or evidence input described above; not authorization.
   * @returns {Promise<*>} Keeps certificate reads behind fresh domain service admission and fixed owner selectors.
   * @throws {Error} Owner validation or dependency failures propagate; callers must retain the original intent for recovery.
   * @override Dispatch through the effective owner; preserve the stated scope, evidence and side-effect contract.
   */
  list: async function (r, input) {
    const authority = SERVICE.DefaultWasteCertificateBundleComponentService;
    authority.authorize(r);
    const ownerRef = authority.owner(input.ownerRef), maximum = CONFIG.get("waste")?.certificateHoldings?.maximumPageSize;
    if (!Number.isSafeInteger(maximum) || maximum < 1 || !Number.isSafeInteger(input.page) || input.page < 1 ||
        !Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > maximum || !Number.isSafeInteger(input.page * input.limit))
      throw new Error("Bounded certificate selection is required");
    const result = await SERVICE.DefaultWastePersistenceService.page("wasteAsset", r,
      { active: true, "ownerRef.module": ownerRef.module, "ownerRef.schema": ownerRef.schema, "ownerRef.code": ownerRef.code },
      input.page, input.limit);
    authority.authorize(r);
    if (!Array.isArray(result.items) || result.items.length > input.limit || !Number.isSafeInteger(result.total) ||
        result.total < result.items.length || result.page !== input.page || result.limit !== input.limit ||
        new Set(result.items.map(row => row.code)).size !== result.items.length)
      throw new Error("Certificate holdings are unconfirmed");
    const items = [];
    for (const asset of result.items) {
      if (asset.active !== true || !same(asset.ownerRef, ownerRef) || !Number.isSafeInteger(asset.revision) || asset.revision < 0 ||
          typeof asset.code !== "string" || !asset.code || asset.digitalOwnerRef && !same(asset.digitalOwnerRef, ownerRef))
        throw new Error("Certificate holdings escaped owner scope");
      const facts = await SERVICE.DefaultWasteCertificateCouponService.facts(r, asset);
      items.push({ code: asset.code, revision: asset.revision, ...facts, assetStatus: asset.assetStatus, custodyStatus: asset.custodyStatus,
        available: facts.valid && [ENUMS.WasteAssetStatus.OWNED.key, ENUMS.WasteAssetStatus.SOLD.key, ENUMS.WasteAssetStatus.GIFTED.key].includes(asset.assetStatus) && !asset.lockRef && !asset.metadata?.pendingTransferCode });
    }
    authority.authorize(r);
    return { contractVersion: 1, ownerRef, items, page: input.page, limit: input.limit, total: result.total };
  },
};
