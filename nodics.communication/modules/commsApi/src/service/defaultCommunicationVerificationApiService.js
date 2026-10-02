/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module commsApi/service/defaultCommunicationVerificationApiService
 * @description Adapts a bounded service-only RPC to the existing persisted challenge owner.
 * No proof mechanics, identity provisioning, delivery transport or storage is implemented here.
 * @layer service
 * @owner commsApi
 * @sideEffects Invokes one persisted verifier operation after service authorization;
 * the verifier owns challenge mutation. This adapter never sends mail or retries.
 * @throws {CLASSES.NodicsError} Existing ERR_COMMS_VERIFY_* vocabulary for malformed
 * input, unauthorized context or invalid storage results; private owner failures are normalized.
 * @override Later layers may tighten the command or projection. Keep service, tenant,
 * explicit permission, signed module scope, rollout and single-use controls intact.
 */
module.exports = {
  /**
   * Raises existing verification vocabulary without reflecting credentials or request data.
   * @param {string} code Existing Communication verification error code.
   * @returns {never} Throws the stable redacted owner error.
   */
  fail: function (code) {
    throw new CLASSES.NodicsError(code);
  },

  /**
   * Resolves fixed capability operations, never a caller-selected SERVICE member.
   * @param {string} name Fixed owner-defined operation or rate-policy key.
   * @returns {Object} Fixed verifier method and fields; unsupported names throw.
   */
  operation: function (name) {
    const operations = {
      ISSUE: { method: "issueStored", fields: [] },
      VERIFY: {
        method: "verifyStored",
        fields: ["challengeCode", "generation", "secret"],
      },
      CONSUME: {
        method: "consumeStored",
        fields: ["challengeCode", "generation", "proof", "operationReference"],
      },
      RECEIPT: {
        method: "readConsumptionReceiptStored",
        fields: ["challengeCode", "generation", "proof", "operationReference"],
      },
      REPLACE: {
        method: "replaceStored",
        fields: ["challengeCode", "expectedRevision"],
      },
      CANCEL: {
        method: "cancelStored",
        fields: ["challengeCode", "expectedRevision"],
      },
    };
    if (typeof name !== "string" || !Object.hasOwn(operations, name))
      this.fail("ERR_COMMS_VERIFY_INPUT");
    return operations[name];
  },

  /**
   * Requires a runtime credential with explicit verification delegation and both signed module scopes.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @param {string} sourceModule Capability owner required in signed runtime scope.
   * @returns {Object} Communication-owned storage context after authorization; caller claims remain unchanged.
   */
  authorize: function (request, sourceModule) {
    if (
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !==
      true
    )
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    const auth = request && request.authData;
    if (
      !auth ||
      auth.tokenType !== "service" ||
      auth.principalType !== "service" ||
      !(auth.principalId || auth.serviceId || auth.loginId) ||
      typeof auth.tenant !== "string" ||
      !auth.tenant ||
      request.tenant !== auth.tenant ||
      !Array.isArray(auth.permissions) ||
      !auth.permissions.includes("communication.verification.execute") ||
      !Array.isArray(auth.modules) ||
      auth.modules.length > 512 ||
      auth.modules.some((value) => typeof value !== "string") ||
      !auth.modules.includes("commsApi") ||
      !auth.modules.includes(sourceModule)
    ) {
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    }
    // Only the authorized RPC boundary may project owner storage privileges.
    const runtime = SERVICE.DefaultCommunicationRuntimeService;
    if (typeof runtime?.context !== "function")
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    const context = {
      ...runtime.context(request),
      correlationId: request.correlationId,
    };
    if (context.tenant !== auth.tenant || context.authData?.tenant !== auth.tenant)
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    SERVICE.DefaultLoggerService.inheritRequestPrivacy(context, request);
    if (
      SERVICE.DefaultLoggerService.hasPrivateCaptureProtection(context) !== true
    )
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    return context;
  },

  /**
   * Allows only the fields belonging to this operation; source/tenant/role overrides cannot hide in a DTO.
   * @param {Object} payload Untrusted verification RPC payload.
   * @param {Object} operation Fixed verifier method descriptor and field allowlist.
   * @returns {Object} Bound verification DTO with owner-selected authority.
   */
  command: function (payload, operation) {
    const common = [
      "sourceModule",
      "purpose",
      "subjectReference",
      "channel",
      "destination",
      "bindingReference",
    ];
    const allowed = ["operation", ...common, ...operation.fields];
    if (
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      Object.keys(payload).some((key) => !allowed.includes(key))
    )
      this.fail("ERR_COMMS_VERIFY_INPUT");
    for (const key of [...common, ...operation.fields]) {
      const value = payload[key];
      if (["generation", "expectedRevision"].includes(key)) {
        if (!Number.isSafeInteger(value) || value < 1)
          this.fail("ERR_COMMS_VERIFY_INPUT");
      } else if (
        typeof value !== "string" ||
        !value.trim() ||
        value.length > 512
      ) {
        this.fail("ERR_COMMS_VERIFY_INPUT");
      }
    }
    if (
      !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(payload.sourceModule) ||
      !["EMAIL", "SMS"].includes(payload.channel) ||
      !/^[a-f0-9]{64}$/.test(payload.bindingReference) ||
      (payload.challengeCode !== undefined &&
        !/^CV_[a-f0-9]{64}$/.test(payload.challengeCode)) ||
      (payload.proof !== undefined && !/^[a-f0-9]{64}$/.test(payload.proof))
    )
      this.fail("ERR_COMMS_VERIFY_INPUT");
    return Object.fromEntries(
      [...common, ...operation.fields].map((key) => [key, payload[key]]),
    );
  },

  /**
   * Verifies and projects only the owner result appropriate to the requested operation. Secrets never leak through another operation.
   * @param {string} name Fixed owner-defined operation or rate-policy key.
   * @param {Object} value Persisted verification result.
   * @param {Object} command Validated DTO binding the owner response.
   * @returns {Object} Operation-specific result; secrets/proofs appear only in permitted operations.
   */
  project: function (name, value, command) {
    const statuses = [
      "PENDING",
      "DELIVERED",
      "VERIFIED",
      "CONSUMED",
      "EXPIRED",
      "LOCKED",
      "CANCELLED",
    ];
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      !/^CV_[a-f0-9]{64}$/.test(value.challengeCode || "") ||
      (command.challengeCode &&
        value.challengeCode !== command.challengeCode) ||
      !statuses.includes(value.status) ||
      !Number.isSafeInteger(value.revision) ||
      value.revision < 1 ||
      !Number.isSafeInteger(value.generation) ||
      value.generation < 1 ||
      (command.generation !== undefined &&
        value.generation !== command.generation)
    )
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    const result = {
      contractVersion: 1,
      challengeCode: value.challengeCode,
      status: value.status,
      revision: value.revision,
      generation: value.generation,
      expiresAt: this.date(value.expiresAt),
      nextIssueAt: this.date(value.nextIssueAt),
    };
    if (name === "ISSUE" && typeof value.replayed !== "boolean")
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    if (name === "ISSUE" || name === "REPLACE") {
      if (name === "ISSUE" && value.replayed === true) {
        result.replayed = true;
      } else {
        if (
          value.status !== "PENDING" ||
          typeof value.secret !== "string" ||
          !/^[a-f0-9]{12,128}$/.test(value.secret)
        )
          this.fail("ERR_COMMS_VERIFY_STORAGE");
        result.secret = value.secret;
        if (name === "ISSUE") result.replayed = false;
      }
    } else if (name === "VERIFY") {
      if (
        !["PENDING", "DELIVERED", "VERIFIED", "EXPIRED", "LOCKED"].includes(
          value.status,
        )
      )
        this.fail("ERR_COMMS_VERIFY_STORAGE");
      if (value.status === "VERIFIED") {
        if (
          typeof value.proof !== "string" ||
          !/^[a-f0-9]{64}$/.test(value.proof)
        )
          this.fail("ERR_COMMS_VERIFY_STORAGE");
        result.proof = value.proof;
        result.proofExpiresAt = this.date(value.proofExpiresAt);
      }
    } else if (name === "CONSUME" || name === "RECEIPT") {
      if (
        value.status !== "CONSUMED" ||
        (name === "RECEIPT" && value.executionGranted !== false)
      )
        this.fail("ERR_COMMS_VERIFY_STORAGE");
      if (
        name === "CONSUME" &&
        ((value.executionGranted !== undefined &&
          value.executionGranted !== true) ||
          (value.replayed !== undefined && value.replayed !== false))
      )
        this.fail("ERR_COMMS_VERIFY_STORAGE");
      result.consumedAt = this.date(value.consumedAt);
      result.executionGranted = name === "CONSUME";
    } else if (value.status !== "CANCELLED")
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    return result;
  },

  /**
   * Requires a real owner date and serializes it consistently across local and remote calls.
   * @param {Date|string} value Owner timestamp.
   * @returns {string} ISO timestamp; invalid owner dates throw.
   */
  date: function (value) {
    if (!(value instanceof Date) && typeof value !== "string")
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    const parsed = new Date(value);
    if (!Number.isFinite(parsed.getTime()))
      this.fail("ERR_COMMS_VERIFY_STORAGE");
    return parsed.toISOString();
  },

  /**
   * Invokes exactly one existing owner operation. There is no retry, local fallback, email send or identity side effect.
   * @param {Object} request Nodics request validated by the owning entry point.
   * @returns {Promise<Object>} Projected result from exactly one authorized owner operation.
   */
  execute: async function (request) {
    if (
      SERVICE.DefaultLoggerService?.hasPrivateCaptureProtection?.(request) !==
      true
    )
      this.fail("ERR_COMMS_VERIFY_CONTEXT");
    try {
      const payload = request && request.payload;
      const operation = this.operation(payload && payload.operation);
      const command = this.command(payload, operation);
      const context = this.authorize(request, command.sourceModule);
      const owner = SERVICE.DefaultCommunicationVerificationService;
      if (!owner || typeof owner[operation.method] !== "function")
        this.fail("ERR_COMMS_VERIFY_STORAGE");
      const result = await owner[operation.method](context, command);
      return this.project(payload.operation, result, command);
    } catch (error) {
      const allowed = [
        "ERR_COMMS_VERIFY_INPUT",
        "ERR_COMMS_VERIFY_POLICY",
        "ERR_COMMS_VERIFY_CONTEXT",
        "ERR_COMMS_VERIFY_STATE",
        "ERR_COMMS_VERIFY_STORAGE",
        "ERR_COMMS_VERIFY_CONFLICT",
        "ERR_COMMS_VERIFY_RATE",
      ];
      this.fail(
        allowed.includes(error?.code) ? error.code : "ERR_COMMS_VERIFY_STORAGE",
      );
    }
  },
};
