/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module store/src/service/defaultStoreContextService @description Resolves an active tenant-scoped selling context. @layer service @owner store */
module.exports = {
  /** Resolves one explicit active outlet through generated Store reads using caller authority. @param {Object} request Authorized operation context. @param {string} enterpriseCode Canonical merchant. @returns {Promise<Object>} Current bounded store identity/revision. */
  resolveMerchantStore: async function (request, enterpriseCode) {
    const code = this.resolveStoreCode(request);
    if (
      !/^[A-Za-z0-9_.:-]{1,128}$/.test(code) ||
      typeof enterpriseCode !== "string" ||
      !enterpriseCode
    )
      throw this.contextError("Store context is invalid");
    const response = await SERVICE.DefaultStoreService.get({
      tenant: request.tenant,
      authData: request.authData,
      query: { code },
      options: { recursive: false, skipItemCache: true },
      searchOptions: { pageSize: 2, pageNumber: 1 },
    });
    if (
      !response ||
      !/^SUC_/.test(response.code || "") ||
      response.success === false ||
      response.error ||
      (response.errors &&
        (!Array.isArray(response.errors) || response.errors.length)) ||
      response.count !== 1 ||
      !Array.isArray(response.result) ||
      response.result.length !== 1
    )
      throw this.contextError("Store is unavailable");
    const store = response.result[0],
      ref = store.enterpriseRef;
    const owner = typeof ref === "string" ? ref : ref?.code;
    if (
      store.code !== code ||
      store.tenant !== request.tenant ||
      store.status !== "ACTIVE" ||
      store.active === false ||
      !Number.isSafeInteger(store.revision) ||
      store.revision < 1 ||
      owner !== enterpriseCode ||
      (typeof ref === "object" &&
        ((ref.moduleName || ref.module || "profile") !== "profile" ||
          (ref.schemaName || ref.schema || "enterprise") !== "enterprise"))
    )
      throw this.contextError("Store does not belong to the merchant");
    return {
      code: store.code,
      name: store.name,
      revision: store.revision,
      enterpriseCode: owner,
    };
  },
  /**
   * Resolves one explicit store reference shared by identity and operation input.
   * This validates identifier shape and agreement, not Store master-data access.
   * @param {Object} request Caller context with optional payload/query storeCode.
   * @param {string} [persistedStoreCode] Store reference from an already-owned record.
   * @returns {string} Unchanged explicit store code; no configuration fallback.
   * @override Later layers may tighten validation while preserving explicit context.
   */
  resolveStoreCode: function (request, persistedStoreCode) {
    const input = request || {};
    const values = [
      persistedStoreCode,
      input.storeCode,
      input.payload && input.payload.storeCode,
      input.query && input.query.storeCode,
    ].filter((value) => value !== undefined);
    if (values.length === 0) throw this.contextError("Store code is required");
    if (
      values.some(
        (value) =>
          typeof value !== "string" || !value.trim() || value !== value.trim(),
      )
    ) {
      throw this.contextError(
        "Store code must be a non-empty string without surrounding whitespace",
      );
    }
    if (values.some((value) => value !== values[0]))
      throw this.contextError("Store context does not match");
    return values[0];
  },
  /** Returns the existing framework validation error without defining another status namespace. @param {string} message Safe validation detail. @returns {Error} Error. */
  contextError: function (message) {
    return typeof CLASSES !== "undefined" && CLASSES.NodicsError
      ? new CLASSES.NodicsError("ERR_SYS_00001", message)
      : new Error(message);
  },
  /** Validates active tenant-scoped Store and Channel master records. @param {Object} request Caller context. @param {Object} store Store record. @param {Object} channel Channel record. @returns {Object} Selling context. */
  resolve: function (request, store, channel) {
    if (
      !request ||
      !store ||
      !channel ||
      request.tenant !== store.tenant ||
      request.tenant !== channel.tenant
    )
      throw new Error("Tenant-scoped store and channel are required");
    if (
      store.status !== "ACTIVE" ||
      channel.status !== "ACTIVE" ||
      channel.storeCode !== store.code
    )
      throw new Error("Selling context is unavailable");
    return Object.freeze({
      tenant: request.tenant,
      storeCode: store.code,
      channelCode: channel.code,
      currency: store.defaultCurrency,
      locale: request.locale || store.defaultLocale,
      timezone: store.timezone,
    });
  },
};
