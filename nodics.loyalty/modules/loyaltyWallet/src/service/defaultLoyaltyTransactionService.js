/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/**
 * @module loyaltyWallet/src/service/defaultLoyaltyTransactionService
 * @description Implements the optional reward-operation transaction hook. Disabled
 * execution preserves legacy behavior; enabled execution delegates to the canonical
 * database owner and temporarily attaches its opaque token to the original request.
 * @layer service
 * @owner loyaltyWallet
 * @override Later layers may narrow admission through exported members. Preserve
 * fail-closed execution, caller identity, token opacity and request cleanup. Schema
 * qualification and generated-service token forwarding remain with their owners.
 */
module.exports = {
  /**
   * Reads effective optional Loyalty transaction selection without enabling it.
   * @returns {Object} The layered loyalty.transactions policy, or an empty policy.
   */
  policy: function () {
    return ((typeof CONFIG !== "undefined" && CONFIG.get("loyalty")) || {}).transactions || {};
  },

  /**
   * Throws an owner-defined refusal without exposing provider or request data.
   * @param {string} code Stable ERR_LOYALTY_TRANSACTION code.
   * @returns {never} Always throws a NodicsError, or Error outside the runtime.
   */
  fail: function (code) {
    const error = typeof CLASSES !== "undefined" && CLASSES.NodicsError
      ? new CLASSES.NodicsError(code)
      : new Error(code);
    error.code = code;
    throw error;
  },

  /**
   * Selects the configured owner module and incoming runtime tenant.
   * @param {Object} request Authorized owner request; tenant may come from authData.
   * @param {Object} policy Effective policy with optional moduleName selection.
   * @returns {Object} Exact moduleName/tenant database scope, without changing identity.
   * @throws {Error} Refuses missing selectors or conflicting runtime tenants.
   * @override Narrow scope here; never select it from an HTTP payload or widen tenants.
   */
  scope: function (request, policy) {
    const tenant = request.tenant === undefined ? request.authData?.tenant : request.tenant;
    const moduleName = policy.moduleName === undefined ? "loyaltyWallet" : policy.moduleName;
    if (typeof tenant !== "string" || !tenant || tenant !== tenant.trim() ||
        typeof moduleName !== "string" || !moduleName || moduleName !== moduleName.trim() ||
        (request.authData?.tenant !== undefined && request.authData.tenant !== tenant)) {
      this.fail("ERR_LOYALTY_TRANSACTION_SCOPE");
    }
    return { moduleName, tenant };
  },

  /**
   * Requires canonical fail-closed execution and both effective provider capabilities.
   * @param {Object} scope Exact owner module/tenant scope.
   * @returns {Object} The loader-composed DefaultDatabaseTransactionService.
   * @throws {Error} Refuses disabled/malformed policy, missing owner or capability.
   * @override Additional qualification may narrow this gate; no fallback is permitted.
   */
  admission: function (scope) {
    const configuration = typeof CONFIG !== "undefined" && CONFIG.get("databaseTransactions");
    const owner = typeof SERVICE !== "undefined" && SERVICE.DefaultDatabaseTransactionService;
    if (configuration?.enabled !== true || configuration.failClosed !== true ||
        !Number.isSafeInteger(configuration.maximumCommitTimeMs) || configuration.maximumCommitTimeMs < 1 ||
        typeof owner?.capabilities !== "function" || typeof owner.execute !== "function") {
      this.fail("ERR_LOYALTY_TRANSACTION_UNAVAILABLE");
    }
    let capabilities;
    try {
      capabilities = owner.capabilities(scope);
    } catch (_) {
      this.fail("ERR_LOYALTY_TRANSACTION_UNAVAILABLE");
    }
    if (capabilities?.multiRecordAtomic !== true || capabilities.contextPropagation !== true) {
      this.fail("ERR_LOYALTY_TRANSACTION_UNAVAILABLE");
    }
    return owner;
  },

  /**
   * Qualifies enabled execution synchronously without starting a transaction or work.
   * @param {Object} request Original authorized request with runtime tenant context.
   * @returns {Object} Qualified scope and canonical owner; never a transaction token.
   * @throws {Error} Refuses disabled selection, invalid scope, pre-existing tokens,
   * immutable context slots or unqualified canonical capabilities before work.
   * @override Narrow admission here while preserving canonical token authority.
   */
  qualify: function (request) {
    const policy = this.policy();
    if (policy.enabled !== true) this.fail("ERR_LOYALTY_TRANSACTION_UNAVAILABLE");
    if (!request || typeof request !== "object" || Array.isArray(request)) {
      this.fail("ERR_LOYALTY_TRANSACTION_SCOPE");
    }
    const previous = Object.getOwnPropertyDescriptor(request, "transactionContext");
    if ((previous && (!Object.prototype.hasOwnProperty.call(previous, "value") || previous.value !== undefined)) ||
        (!previous && request.transactionContext !== undefined) ||
        (previous && !previous.configurable && !previous.writable) ||
        (!previous && !Object.isExtensible(request))) {
      this.fail("ERR_LOYALTY_TRANSACTION_CONTEXT");
    }
    const scope = this.scope(request, policy);
    return { scope, owner: this.admission(scope) };
  },

  /**
   * Executes one owner operation through the existing rewardOperation.transaction hook.
   * @param {Object} request Original authorized request closed over by operation.
   * @param {Function} operation Awaited zero-argument work callback. All generated
   * persistence must forward request.transactionContext and finish before it returns.
   * @returns {Promise<*>} The original operation result after provider completion.
   * @throws {Error} Enabled execution rejects nested or unvalidated contexts before
   * work. Work/provider failures propagate unchanged, without bridge retries/fallback.
   * @sideEffects Temporarily defines transactionContext and restores its original
   * property descriptor or absence in finally. Other request fields are untouched.
   */
  run: async function (request, operation) {
    if (typeof operation !== "function") this.fail("ERR_LOYALTY_TRANSACTION_OPERATION");
    if (this.policy().enabled !== true) return operation();
    const { scope, owner } = this.qualify(request);
    const previous = Object.getOwnPropertyDescriptor(request, "transactionContext");
    return owner.execute(scope, async (transactionContext) => {
      if (!transactionContext || typeof transactionContext !== "object") {
        this.fail("ERR_LOYALTY_TRANSACTION_CONTEXT");
      }
      try {
        Object.defineProperty(request, "transactionContext", {
          value: transactionContext,
          enumerable: previous ? previous.enumerable : true,
          configurable: previous ? previous.configurable : true,
          writable: true,
        });
        return await operation();
      } finally {
        if (previous) Object.defineProperty(request, "transactionContext", previous);
        else delete request.transactionContext;
      }
    });
  },
};
