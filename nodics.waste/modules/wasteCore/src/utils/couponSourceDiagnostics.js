/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module wasteCore/utils/couponSourceDiagnostics
 * @description Exact Digital source-failure wire allowlist. Values are static diagnostics, never authority.
 * @owner wasteCore @layer utility
 */
const messages = Object.freeze(Object.fromEntries([
  'GATES', 'AUTH', 'ALLOCATION', 'GRANT', 'COUPON', 'ALLOCATION_BINDING',
  'COMMAND', 'PHASE', 'CONSIDERATION', 'FAILURE_PROOF', 'READBACK',
].map(stage => ['ERR_DIGITAL_COUPON_SOURCE_' + stage, 'Certificate coupon source proof failed: ' + stage])));
module.exports = Object.freeze({
  messages,
  /** Selects only an exact registered code; never consumes remote text or recursively inspects causes.
   * @param {string} code Exact source-owned diagnostic code.
   * @returns {string|undefined} Static safe message, without effects.
   * @override Uses the effective receiver's allowlist; detached pure-helper calls use the exported default.
   */
  message: function (code) {
    const source = this && this.messages || module.exports.messages;
    return typeof code === 'string' && Object.hasOwn(source, code) ? source[code] : undefined;
  },
});
