/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module eWaste/controller/defaultEWasteCatalogueController @description Maps public EWaste catalogue reads through the trusted eWaste context mapper. @layer controller @owner eWaste */
module.exports = {
  /** Lists EWaste storefront cards; the target service cannot be supplied by callers. */
  catalogue: function (request, callback) {
    return SERVICE.DefaultEWasteRequestService.invoke(
      "catalogue",
      request,
      callback,
      "DefaultEWasteCatalogueService",
    );
  },
  /** Retrieves one published product independently of catalogue pagination. */
  product: function (request, callback) {
    return SERVICE.DefaultEWasteRequestService.invoke(
      "product",
      request,
      callback,
      "DefaultEWasteCatalogueService",
    );
  },
};
