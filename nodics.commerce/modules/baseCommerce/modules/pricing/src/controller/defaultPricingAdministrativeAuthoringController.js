/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module pricing/controller/defaultPricingAdministrativeAuthoringController
 * @description Maps fixed native administrator commands without changing signed identity.
 * @layer controller @owner pricing */
module.exports = {
  /** Preserves original request aliases for owner validation and disables response caching. */
  execute: function (request, operation, callback) {
    request.httpResponse?.setHeader?.("Cache-Control", "no-store");
    const promise = Promise.resolve().then(() => {
      SERVICE.DefaultLoggerService.assertSensitiveRequest(request);
      return SERVICE.DefaultPricingAdministrativeAuthoringService.execute({
        ...request, authorization: request.httpRequest?.headers?.authorization,
      }, operation);
    }).then(data => ({ data })).catch(error => {
      if (["ERR_PRICING_AUTHORING_INPUT", "ERR_PRICING_AUTHORING_SCOPE", "ERR_PRICING_AUTHORING_STORAGE",
        "ERR_PRICING_AUTHORING_CONFLICT"].includes(error?.code)) throw error;
      throw new CLASSES.NodicsError("ERR_PRICING_AUTHORING_CONFLICT");
    });
    return callback ? promise.then(result => callback(null, result), callback) : promise;
  },
  /** Creates one new price row, never an upsert or publication. */
  create: function (request, callback) { return this.execute(request, "create", callback); },
  /** Runs bounded owner lifecycle commands; approval decisions remain exclusively Process-owned. */
  publication: function (request, callback) { return this.execute(request, "publication", callback); },
  /** Reads one current row for reconciliation. */
  read: function (request, callback) { return this.execute(request, "read", callback); },
};
