/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/**
 * @module digitalCore/utils/configuration
 * @description Pure integer/deadline validation for effective owner properties. Exports integer and deadline; performs no configuration reads, mutation, I/O or clock reads.
 * @owner digitalCore
 * @layer utils
 * @override Change policy through Digital properties. Extensions must preserve safe-integer and Date representability checks; absent ranges never acquire fallback defaults.
 */
module.exports = {
  /**
   * Tests a value against the complete positive integer range supplied by its owner.
   * @param {*} value Effective numeric property value.
   * @param {{minimum:number,maximum:number}} range Effective owner validation contract.
   * @returns {boolean} False for missing, malformed, fractional or out-of-range values; no side effects.
   */
  integer: function (value, range) {
    return Boolean(range && Number.isSafeInteger(range.minimum) && range.minimum > 0 &&
      Number.isSafeInteger(range.maximum) && range.maximum >= range.minimum &&
      Number.isSafeInteger(value) && value >= range.minimum && value <= range.maximum);
  },
  /**
   * Computes an ISO deadline without admitting arithmetic or Date overflow, even under expanded policy ranges.
   * @param {number} now Owner-clock epoch milliseconds, supplied by the caller.
   * @param {number} seconds Effective configured duration in seconds.
   * @param {{minimum:number,maximum:number}} range Owner duration validation contract.
   * @returns {string} ISO deadline; no persistence, clock read or mutation.
   * @throws {Error} When policy, arithmetic or Date representation is invalid.
   */
  deadline: function (now, seconds, range) {
    const timestamp = now + seconds * 1000;
    if (!this.integer(seconds, range) || !Number.isSafeInteger(now) || !Number.isSafeInteger(timestamp) ||
        !Number.isFinite(new Date(timestamp).getTime())) throw new Error("Invalid Digital expiry configuration");
    return new Date(timestamp).toISOString();
  },
};
