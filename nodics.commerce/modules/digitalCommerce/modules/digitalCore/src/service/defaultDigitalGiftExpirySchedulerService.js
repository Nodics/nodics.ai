/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
const { isDeepStrictEqual: same } = require("node:util");
const configuration = require("../utils/configuration");
/** @module digitalCore/service/defaultDigitalGiftExpirySchedulerService
 * @description Existing Cron start-node binding for bounded original gift expiry; no timer, activation or business authority synthesis.
 * @owner digitalCore @layer service
 * @override Configure bounds/transport in Digital properties. Preserve original Cron authority, owner scope, explicit activation and retained-operation recovery.
 */
module.exports = {
  /**
   * Re-admits original Cron identity and forwards its credential to the secured Digital owner for each bounded batch.
   * @param {{definition:Object,authData:Object}} input Existing Cron start-node context and verified operational principal.
   * @returns {Promise<Object>} Results, nextCursor, scan completeness and recoveryRequired count; completeness is not proof that every release succeeded.
   * @throws {Error} On missing policy, changed authority/credential, transport uncertainty or invalid owner results.
   * @description Invokes original persisted expiry commands through existing transport; never starts a timer, activates a job or manufactures authority. Repeat calls recover original receipts.
   */
  sweep: async function (input) {
    const settings = () => CONFIG.get("digitalCore")?.bundles;
    const p = structuredClone(settings()?.giftExpiryScheduler), bounds = structuredClone(settings()?.giftExpirySweep), validation = structuredClone(settings()?.validation);
    const tenant = input.definition?.tenant, definition = structuredClone(input.definition);
    if (p?.enabled !== true || p.startNode !== "DefaultDigitalGiftExpirySchedulerService.sweep" ||
        ![p.maximumBatches, bounds?.maximumOperations, bounds?.pageSize].every(value => configuration.integer(value, validation?.capacity)) ||
        bounds.pageSize > bounds.maximumOperations ||
        typeof tenant !== "string" || !tenant || definition?.jobDetail?.startNode !== p.startNode ||
        p.target?.moduleName !== "digitalCore" || p.target.apiName !== "/internal/bundles/gifts/expire" ||
        typeof p.target.connectionName !== "string" || !p.target.connectionName || p.target.targetAuthority?.runtimeRole !== "COMMERCE" ||
        p.target.apiVersion !== "v0" || !configuration.integer(p.target.timeoutMs, validation?.timeoutMs) || p.target.maxAttempts !== 1)
      throw new Error("Gift expiry scheduler binding is not admitted");
    const auth = structuredClone(await SERVICE.DefaultCronJobService.assertOperational(tenant));
    const token = NODICS.getInternalAuthToken?.(tenant);
    const bound = async () => {
      if (auth.tenant !== tenant || !same(input.authData, auth) || !same(input.definition, definition) ||
          !same(settings()?.giftExpiryScheduler, p) || !same(settings()?.giftExpirySweep, bounds) || !same(settings()?.validation, validation) ||
          !same(auth, await SERVICE.DefaultCronJobService.assertOperational(tenant)) ||
          typeof token !== "string" || !token || token !== NODICS.getInternalAuthToken(tenant))
        throw new Error("Original gift expiry scheduler authority changed");
    };
    const results = [], validCode = code => typeof code === "string" && /^bundle-operation:[a-f0-9]{64}$/.test(code);
    let afterCode;
    for (let batch = 0; batch < p.maximumBatches; batch++) {
      await bound();
      const result = SERVICE.DefaultDigitalBundleAuthorityService.unwrap(await SERVICE.DefaultModuleService.invokeModule({
        ...p.target, local: false, tenant, request: { tenant }, methodName: "POST",
        header: { Authorization: "Bearer " + token, tenant }, requestBody: afterCode ? { afterCode } : {},
        followRedirects: false, rejectUnauthorized: true,
      }));
      await bound();
      if (result?.contractVersion !== 1 || !Array.isArray(result.results) || result.scanned !== result.results.length ||
          result.results.length > bounds.maximumOperations || result.results.some((row, index) => !validCode(row.operationCode) ||
            !["RELEASED", "RECOVERY_REQUIRED"].includes(row.status) || row.operationCode <= (index ? result.results[index - 1].operationCode : afterCode || "")) ||
          result.nextCursor !== null && (!validCode(result.nextCursor) || !result.results.length ||
            result.nextCursor !== result.results[result.results.length - 1].operationCode))
        throw new Error("Gift expiry scheduler outcome is unconfirmed");
      results.push(...result.results); afterCode = result.nextCursor;
      if (afterCode === null) break;
    }
    return { results, nextCursor: afterCode, complete: afterCode === null,
      recoveryRequired: results.filter(row => row.status === "RECOVERY_REQUIRED").length };
  },
};
