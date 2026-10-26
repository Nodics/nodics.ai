/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module backoffice/utils/applicationReadinessWork @description Resolves owner scheduling policy and prevents nested profile fanout; retains no authority evidence. @layer utils @owner backoffice */
const defaults = require("../../config/properties").backofficeApplicationInitialization;
const compositions = new WeakSet();

module.exports = {
  /** Projects only validated, inert browser scheduling policy, never authority. */
  browserPolicy: function () {
    const policy = typeof CONFIG === "undefined" ? undefined : CONFIG.get("backofficeApplicationInitialization");
    const source = { ...defaults.browserReadiness, ...policy?.browserReadiness };
    for (const name of ["concurrency", "priorityBurst"]) {
      if (!Number.isSafeInteger(source[name]) || source[name] < 1 || source[name] > 16)
        throw new Error("BackOffice browserReadiness." + name + " must be an integer between 1 and 16");
    }
    return { contractVersion: 1, concurrency: source.concurrency, priorityBurst: source.priorityBurst };
  },
  /** Reads trusted layered policy only, rejecting invalid bounds before dispatch. */
  workers: function () {
    const policy = typeof CONFIG === "undefined" ? undefined : CONFIG.get("backofficeApplicationInitialization");
    const count = policy?.readinessWorkers === undefined ? defaults.readinessWorkers : policy.readinessWorkers;
    if (!Number.isSafeInteger(count) || count < 1 || count > 16)
      throw new Error("BackOffice readinessWorkers must be an integer between 1 and 16");
    return count;
  },
  /** Marks only a request's scheduling scope; no caller field can provide this tag. */
  composition: function (request) { if (request && typeof request === "object") compositions.add(request); },
  /** Preserves the scheduling bound when the owner clones a request for stage selection. */
  inherit: function (source, target) { if (compositions.has(source)) compositions.add(target); },
  /** Outer composition workers already consume the budget; nested observations stay serial. */
  stageWorkers: function (request) { return compositions.has(request) ? 1 : this.workers(); },
  /** Creates a composition-local queue that also bounds documentation reads before the report. */
  queue: function () {
    const limit = this.workers(), pending = [];
    let active = 0;
    const drain = () => {
      while (active < limit && pending.length) {
        const item = pending.shift(); active++;
        Promise.resolve().then(item.run).then(item.resolve, item.reject).finally(() => { active--; drain(); });
      }
    };
    return run => new Promise((resolve, reject) => { pending.push({ run, resolve, reject }); drain(); });
  },
};
