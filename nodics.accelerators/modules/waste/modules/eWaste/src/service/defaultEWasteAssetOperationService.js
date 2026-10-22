/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/service/defaultEWasteAssetOperationService
 * @description Delegates a selected certificate to the common Digital manifest/gift lifecycle. No wallet or carbon reward mutation.
 * @owner eWaste @layer service
 */
module.exports = {
  /** Returns a pending recipient-acceptance gift, never immediate ownership transfer. */
  gift: async function (request) {
    const experience = SERVICE.DefaultEWasteExperienceService, customer = experience.store().customer(request);
    const recipient = request.payload?.recipientRef;
    if (request.confirmed !== true || !request.idempotencyKey || !Number.isSafeInteger(request.expectedRevision) ||
        request.expectedRevision < 0 || recipient?.module !== "profile" || !["customer", "enterprise"].includes(recipient.schema) ||
        typeof recipient.code !== "string" || !recipient.code)
      throw new Error("Confirm the original certificate revision and canonical gift recipient");
    const remote = SERVICE.DefaultEWasteMarketplaceService;
    const manifest = await remote.customerRemote(request, "digitalCore", "/bundles", "POST", {
      ownerRef: { module: "profile", schema: "customer", code: customer.code },
      components: [{ kind: "CERTIFICATE", reference: { module: "wasteCore", schema: "wasteAsset", code: request.code },
        quantity: "1", expectedRevision: request.expectedRevision }], idempotencyKey: request.idempotencyKey + ":manifest" });
    return remote.customerRemote(request, "digitalCore", "/gifts", "POST", { manifestCode: manifest.code,
      manifestRevision: manifest.revision, recipientRef: recipient, confirmed: true, idempotencyKey: request.idempotencyKey });
  },
};
