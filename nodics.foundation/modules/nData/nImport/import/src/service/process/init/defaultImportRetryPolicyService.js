/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/service/process/init/defaultImportRetryPolicyService
 * @description Classifies phased import failures without replaying denied or uncertain writes.
 * @layer service
 * @owner import
 * @override Later layers may extend classification while preserving terminal denials and write-outcome proof.
 */
module.exports = {
  /** Resolves header/config fail-fast policy. @param {Object} request File request. @returns {boolean} Stop on first failure. */
  shouldStop: function (request) {
    const selected = request?.fileData?.header?.options?.stopImportOnFailure;
    if (typeof selected === "boolean") return selected;
    return (
      typeof CONFIG !== "undefined" &&
      CONFIG.get("data")?.stopImportOnFailure === true
    );
  },

  /**
   * Requires every causal leaf to declare a safe dependency/transient failure before any write.
   * Unknown outcomes, mixed aggregates, cycles and excessive error graphs fail closed.
   * Error declarations come from capability owners, never source/header retry flags.
   * @param {*} error Original owner error, including Nodics causes/errors and native cause.
   * @returns {boolean} Whether the same pending rows may be retried in a later phase.
   */
  canRetry: function (error) {
    const pending = [{ error, depth: 0 }];
    const visited = new Set();
    let leaves = 0;
    while (pending.length) {
      const item = pending.pop();
      const current = item.error;
      if (
        !current ||
        typeof current !== "object" ||
        item.depth > 16 ||
        visited.size >= 128
      )
        return false;
      if (visited.has(current)) return false;
      visited.add(current);
      const code = String(current.code || "");
      const status = Number(current.responseCode || current.statusCode || 0);
      const children = [].concat(
        current.causes || [],
        current.errors || [],
        current.cause || [],
      );
      const declaration = current.metadata?.importRetry;
      const declaredDependency =
        children.length === 0 &&
        declaration?.kind === "DEPENDENCY" &&
        declaration.writeOutcome === "NOT_APPLIED";
      if (
        /FORBIDDEN|UNAUTHORIZED|AUTHORIZATION|CREDENTIAL_OWNERSHIP|VALIDATION|CONCURRENCY|UNCERTAIN|ACKNOWLEDG/iu.test(
          code,
        ) ||
        /^ERR_(?:AUTH|VAL|IMP_00003|IMP_00011)/u.test(code) ||
        [401, 403, 409, 422, 428].includes(status) ||
        (status === 400 &&
          !(code === "ERR_IMP_00010" && children.length) &&
          !declaredDependency)
      )
        return false;
      if (declaration && declaration.writeOutcome !== "NOT_APPLIED")
        return false;
      if (children.length) {
        if (children.length + pending.length + visited.size > 128) return false;
        children.forEach((child) =>
          pending.push({ error: child, depth: item.depth + 1 }),
        );
      } else {
        leaves += 1;
        if (
          !declaration ||
          declaration.writeOutcome !== "NOT_APPLIED" ||
          !["DEPENDENCY", "TRANSIENT"].includes(declaration.kind)
        )
          return false;
      }
    }
    return leaves > 0;
  },
};
