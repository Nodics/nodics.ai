/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module nService/service/authorization/DefaultModuleSessionContextValidationService
 * @description Routes already verified person contexts to fresh local or authenticated remote Profile admission using the existing module transport.
 * @layer service
 * @owner nService
 * @override Later module layers may narrow transport bounds and owner selection; preserve signed-token, runtime-scope and exact live-proof admission.
 */
module.exports = {
  /** Refuses private, mismatched or ambiguous proofs even when invoked outside the generic auth mechanic. @param {Object} proof Owner result. @param {Object} payload Verified claims. @returns {Object} Exact public proof. */
  matchedProof: function (proof, payload) {
    const context = payload.sessionContext;
    if (
      !context ||
      !proof ||
      typeof proof !== "object" ||
      Array.isArray(proof) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(proof)) ||
      Reflect.ownKeys(proof).length !== 4 ||
      Object.keys(proof).sort().join(",") !== "code,owner,valid,version" ||
      proof.valid !== true ||
      proof.owner !== context.owner ||
      proof.code !== context.code ||
      proof.version !== context.version
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    return {
      valid: true,
      owner: proof.owner,
      code: proof.code,
      version: proof.version,
    };
  },
  /** Resolves bounded layered transport policy without activating an owner. @returns {Object} Effective context validation policy. */
  policy: function () {
    const policy = CONFIG.get("authSecurity.sessionContextValidation"),
      moduleName = CONFIG.get("profileModuleName"),
      connectionName = policy?.connectionName || moduleName;
    if (
      !policy ||
      policy.qualified !== true ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(moduleName || "") ||
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(connectionName || "") ||
      !Number.isSafeInteger(policy.timeoutMs) ||
      policy.timeoutMs < 1 ||
      policy.timeoutMs > 60000
    )
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    return { ...policy, moduleName, connectionName };
  },
  /** Obtains live admission without accepting unsigned remote claims or returning records. @param {Object} payload Immutable already verified access claims. @param {string} [authToken] Original signed access credential, transient and separate from runtime authentication. @returns {Promise<Object>} Exact current owner proof. */
  validate: async function (payload, authToken) {
    try {
      const p = this.policy(),
        transport = SERVICE.DefaultModuleService;
      if (!transport || typeof transport.isLocalModuleActive !== "function")
        throw new Error();
      if (transport.isLocalModuleActive(p.moduleName, p.connectionName)) {
        if (
          !/^[A-Za-z][A-Za-z0-9_]{0,127}$/.test(p.localValidatorService || "")
        )
          throw new Error();
        const owner = SERVICE[p.localValidatorService];
        if (!owner || owner === this || typeof owner.validate !== "function")
          throw new Error();
        return this.matchedProof(await owner.validate(payload), payload);
      }
      if (
        p.remoteQualified !== true ||
        p.captureProtectionQualified !== true ||
        typeof authToken !== "string" ||
        authToken.length > 65536 ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(authToken) ||
        !/^[A-Za-z0-9_.:-]{1,192}$/.test(payload.tenant || "") ||
        !/^[A-Za-z0-9_.:-]{1,192}$/.test(payload.entCode || "")
      )
        throw new Error();
      const logger = SERVICE.DefaultLoggerService;
      if (typeof logger?.runSensitiveOperation !== "function")
        throw new Error();
      const invocation = {
        local: false,
        moduleName: p.moduleName,
        connectionName: p.connectionName,
        apiName: "/internal/session-context/validate",
        methodName: "POST",
        tenant: payload.tenant,
        request: { tenant: payload.tenant },
        header: { "X-Enterprise-Code": payload.entCode },
        requestBody: { authToken },
        requireInternalAuth: true,
        maxAttempts: 1,
        timeoutMs: p.timeoutMs,
        maxResponseBytes: 4096,
        followRedirects: false,
        secureTransport: {
          required: true,
          allowInsecureLoopback: p.allowInsecureLoopback === true,
        },
      };
      const response = await logger.runSensitiveOperation(invocation, () =>
        transport.invokeModule(invocation),
      );
      if (
        !response ||
        response.code !== "SUC_SYS_00000" ||
        Object.keys(response).sort().join(",") !== "code,result"
      )
        throw new Error();
      return this.matchedProof(response.result, payload);
    } catch {
      throw new CLASSES.NodicsError("ERR_AUTH_00001");
    }
  },
};
